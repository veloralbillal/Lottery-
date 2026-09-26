/**
 * Lottery Winner - Offline Sync Queue Manager (syncQueue.js)
 * 
 * Uses browser IndexedDB to persist local actions (purchases, deposits, withdrawals, etc.)
 * while offline, and automatically replays and synchronizes them to Firestore upon recovery.
 */

export class OfflineQueueManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.dbName = "OfflineSyncDB";
    this.storeName = "actionsQueue";
    this.db = null;
    this.initDB();

    // Attach online/offline listeners
    window.addEventListener("online", () => {
      console.log("[OfflineQueue] Device came back online! Initiating automatic sync...");
      this.syncQueueToCloud();
    });
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = (e) => {
        console.error("[OfflineQueue] IndexedDB open error:", e);
        reject(e);
      };
      
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
        // Try processing immediately if online
        this.processQueueIfOnline();
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }

  enqueueAction(type, payload) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.warn("[OfflineQueue] IndexedDB not initialized, queueing failed.");
        reject("Not initialized");
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const action = {
        type,
        payload,
        timestamp: Date.now()
      };
      
      const request = store.add(action);
      
      request.onsuccess = () => {
        console.log(`[OfflineQueue] Enqueued action: ${type}`, action);
        resolve();
      };
      
      request.onerror = (e) => {
        console.error("[OfflineQueue] Failed to enqueue action:", e);
        reject(e);
      };
    });
  }

  getPendingActions() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (e) => {
        reject(e);
      };
    });
  }

  clearActions(actionIds) {
    return new Promise((resolve, reject) => {
      if (!this.db || actionIds.length === 0) {
        resolve();
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      
      actionIds.forEach(id => {
        store.delete(id);
      });
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (e) => {
        reject(e);
      };
    });
  }

  async processQueueIfOnline() {
    if (navigator.onLine) {
      await this.syncQueueToCloud();
    }
  }

  async syncQueueToCloud() {
    try {
      const actions = await this.getPendingActions();
      if (actions.length === 0) return;

      console.log(`[OfflineQueue] Found ${actions.length} pending offline actions. Processing...`);
      this.app.showToast(`Syncing ${actions.length} pending offline actions...`, "info");

      // 1. Fetch latest database from cloud to avoid conflicts
      await this.app.loadFromCloud();

      const actionIdsToDelete = [];
      
      // 2. Playback actions on top of the latest database state
      for (const action of actions) {
        try {
          this.applyActionToDB(action);
          actionIdsToDelete.push(action.id);
        } catch (err) {
          console.error("[OfflineQueue] Error applying offline action:", action, err);
        }
      }

      // 3. Clear processed actions from IndexedDB
      if (actionIdsToDelete.length > 0) {
        await this.clearActions(actionIdsToDelete);
      }

      // 4. Save and sync the reconciled database to cloud
      this.app.saveDB();
      this.app.showToast("Offline actions successfully re-synced!", "success");
    } catch (err) {
      console.error("[OfflineQueue] Failed to sync offline queue to cloud:", err);
    }
  }

  applyActionToDB(action) {
    const { type, payload } = action;
    const db = this.app.db;

    switch (type) {
      case "PURCHASE_TICKET": {
        const { lotteryId, userId, ticketId, code, purchaseDate, entryFee } = payload;
        
        // Find user
        const user = db.users.find(u => u.id === userId);
        if (!user) return;

        // Deduct balance and check
        if (user.balance < entryFee) {
          console.warn(`[OfflineQueue] User balance insufficient for ticket ${code}`);
          return;
        }
        
        user.balance -= entryFee;
        if (!user.loss) user.loss = 0;
        user.loss += entryFee;
        user.profit -= entryFee;

        // Add ticket
        if (!db.tickets) db.tickets = [];
        // Check if ticket already exists (to prevent duplicate replay)
        if (db.tickets.some(t => t.id === ticketId || t.code === code)) {
          return;
        }

        db.tickets.unshift({
          id: ticketId,
          lotteryId,
          userId,
          code,
          purchaseDate,
          status: "pending",
          username: user.username
        });

        // Increment sold tickets
        const lot = db.lotteries.find(l => l.id === lotteryId);
        if (lot) {
          lot.soldTickets += 1;
        }
        break;
      }

      case "SUBMIT_DEPOSIT": {
        const { deposit } = payload;
        if (!db.deposits) db.deposits = [];
        if (db.deposits.some(d => d.id === deposit.id)) return;
        db.deposits.unshift(deposit);
        break;
      }

      case "SUBMIT_WITHDRAWAL": {
        const { withdrawal } = payload;
        if (!db.withdrawals) db.withdrawals = [];
        if (db.withdrawals.some(w => w.id === withdrawal.id)) return;

        // Deduct user balance
        const user = db.users.find(u => u.username === withdrawal.username);
        if (user) {
          if (user.balance >= withdrawal.amount) {
            user.balance -= withdrawal.amount;
            user.profit -= withdrawal.amount;
          }
        }
        db.withdrawals.unshift(withdrawal);
        break;
      }

      case "SUBMIT_REPORT": {
        const { report } = payload;
        if (!db.reports) db.reports = [];
        if (db.reports.some(r => r.id === report.id)) return;
        db.reports.push(report);
        break;
      }

      default:
        console.warn(`[OfflineQueue] Unknown action type: ${type}`);
    }
  }
}
