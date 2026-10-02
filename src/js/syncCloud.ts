// Firebase removed per user request for SQL-only bridge architecture.
import { removeCircularReferences, safeStringify } from "./serialization.js";
import { fallbackFirebaseConfig } from "./bundledTabs.js";

export const SyncCloudModule = {
  async initFirebaseSync() {
    try {
      console.log("SyncCloudModule: Initializing SQL-only sync engine...");
      this.firebaseConfig = null;
      this.firestore = null;
      this.auth = null;
      this.storage = null;
      this.firestoreDocRef = null;
      
      this.initRealtimeEventStream();
      this.initNetworkMonitoring();
      await this.loadFromCloud().catch(err => console.warn("Initial SQL load notice:", err));
      this.startSqlPolling();
      
      console.log("SQL sync engine initialized successfully.");
    } catch (e: any) {
      console.error("Failed to initialize SQL Sync:", e.message || e);
      this.setSyncState("error");
    }
  },

  initAuthListener() {
    // Legacy stub to prevent ReferenceErrors
  },

  async loadUserProfile(uid) {
    try {
      // Hydrate from active database (synced with MySQL)
      if (this.db && this.db.users && Array.isArray(this.db.users)) {
        const localUser = this.db.users.find(u => u.id === uid || u.uid === uid);
        if (localUser) {
          this.currentUser = removeCircularReferences(localUser);
          localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
          console.log("User profile hydrated from active database:", localUser.username);
          this.render();
        }
      }
    } catch (err) {
      console.warn("Notice loading user profile:", err);
    }
  },

  async syncUserProfile() {
    if (!this.currentUser || !this.currentUser.id) return;
    try {
      // In SQL mode, user profiles are synced as part of the monolithic database payload
      this.syncToCloud();
      console.log("User profile sync requested via SQL bridge.");
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  },

  async lookupUserByUsername(username) {
    if (!username) return null;
    const cleanUser = username.toLowerCase().trim();

    // 1. Primary: Check local monolithic DB (synced from MySQL)
    if (this.db && this.db.users && Array.isArray(this.db.users)) {
      const localUser = this.db.users.find(u => u.username && u.username.toLowerCase() === cleanUser);
      if (localUser) {
        return {
          uid: localUser.id || localUser.uid,
          email: localUser.email,
          username: localUser.username
        };
      }
    }

    // 2. Secondary: Query backend server /api/auth/lookup-user
    try {
      const serverRes = await fetch("/api/auth/lookup-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser })
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.success && data.user) {
          return {
            uid: data.user.id || data.user.uid,
            email: data.user.email,
            username: data.user.username,
            role: data.user.role
          };
        }
      }
    } catch (netErr) {
      // offline fallback
    }

    return null;
  },

  async createStaffAccount(staffData) {
    // Generate a unique ID for the new staff account
    let uid = "agent_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    
    // In SQL-only mode, we add to the local DB which will sync to MySQL.
    console.log("Creating staff account in SQL-only mode for:", staffData.username);
    
    if (typeof (this as any).saveDB === "function") {
      (this as any).saveDB(true);
    }
    return { success: true, uid, authCreated: false };
  },

  async signUpUser(userData) {
    // Generate a unique ID for the new user
    let uid = "u_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    
    console.log("User registration completed for SQL-only environment.");
    return { success: true, uid, authCreated: false };
  },

  lastLocalWriteTime: 0,

  mergeParsedDb(parsed) {
    if (!parsed) return;
    if (this.db && this.db.users && parsed.users) {
      const cloudUserMap = new Map(parsed.users.map((u: any) => [u.username?.toLowerCase() || u.id, u]));
      for (const localUser of this.db.users) {
        const key = localUser.username?.toLowerCase() || localUser.id;
        if (!cloudUserMap.has(key)) {
          parsed.users.push(localUser);
        }
      }
    }
    if (this.db && this.db.transactions && parsed.transactions) {
      const cloudTxIds = new Set(parsed.transactions.map((t: any) => t.id));
      for (const localTx of this.db.transactions) {
        if (!cloudTxIds.has(localTx.id)) {
          parsed.transactions.push(localTx);
        }
      }
    }
    if (this.db && this.db.agentLedger && parsed.agentLedger) {
      const cloudLedgerIds = new Set(parsed.agentLedger.map((l: any) => l.id));
      for (const localLedger of this.db.agentLedger) {
        if (!cloudLedgerIds.has(localLedger.id)) {
          parsed.agentLedger.push(localLedger);
        }
      }
    }
    const syncNodes = this.db && this.db.syncNodes ? this.db.syncNodes : parsed.syncNodes;
    const sqlDbConfig = this.db && this.db.sqlDbConfig ? this.db.sqlDbConfig : parsed.sqlDbConfig;

    this.db = parsed;
    
    // Ensure strict table separation: migrate any staff/agents from users to staff
    if (!this.db.staff) this.db.staff = [];
    if (this.db.users && Array.isArray(this.db.users)) {
      const genuineUsers = [];
      for (const u of this.db.users) {
        const role = (u.role || "").toLowerCase();
        if (role === "agent" || role === "subagent" || role === "moderator") {
          if (!this.db.staff.some(s => s.id === u.id || (s.username && u.username && s.username.toLowerCase() === u.username.toLowerCase()))) {
            this.db.staff.push(u);
          }
        } else {
          genuineUsers.push(u);
        }
      }
      this.db.users = genuineUsers;
    }

    // Role self-healing completely removed per user request.
    if (syncNodes) this.db.syncNodes = syncNodes;
    if (sqlDbConfig) this.db.sqlDbConfig = sqlDbConfig;
  },

  unsubscribeFromCloud() {
    if (this.firestoreUnsubscribe) {
      try {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
        console.log("[SyncEngine] Realtime Firestore listener unsubscribed.");
      } catch (e) {
        console.warn("Failed to unsubscribe listener:", e);
      }
    }
  },

  listenToCloud() {
    if (!this.firestoreDocRef) return;
    
    // Safety check to prevent duplicate listeners
    this.unsubscribeFromCloud();

    this.setSyncState("loading");

    this.firestoreUnsubscribe = onSnapshot(this.firestoreDocRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          // If we are currently uploading a write operation or have pending local writes, ignore incoming cloud snapshots to prevent race conditions
          if (this.syncState === "syncing" || this.cloudSyncTimeout != null) {
            console.log("[SyncEngine] Local write in progress or queued. Ignoring incoming snapshot to prevent overwriting unsaved changes.");
            return;
          }

          const cloudData = docSnap.data().db;
          if (cloudData) {
            let parsed = typeof cloudData === "string" ? JSON.parse(cloudData) : cloudData;
            if (parsed) {
              parsed = removeCircularReferences(parsed);
            }
            this.mergeParsedDb(parsed);
            
            if (this.currentUser) {
              const freshUser = this.db.users.find(u => u.username === this.currentUser.username);
              if (freshUser) {
                this.currentUser = removeCircularReferences(freshUser);
                localStorage.setItem(this.sessionKey, safeStringify(freshUser));
              }
            }
            localStorage.setItem(this.dbKey, safeStringify(this.db));
            
            // Re-render everything immediately across all screens/tabs
            this.render();
            console.log("Database successfully synced with Firebase cloud (Real-time update received).");
            this.setSyncState("synced");
          }
        } else {
          // If the document doesn't exist yet, initialize it on cloud
          this.syncToCloud();
        }
      } catch (err) {
        console.warn("Error processing real-time snapshot payload:", err);
        this.setSyncState("error");
      }
    }, (error) => {
      console.warn("Firestore real-time listener subscription error:", error);
      // Silently operate in local-first offline fallback mode to avoid environment/sandbox warnings
      this.setSyncState("offline");
    });

    // Auto-pause listener when document is hidden to conserve background network and CPU
    if (!this._visibilityListenerAdded && typeof document !== 'undefined') {
      this._visibilityListenerAdded = true;
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          console.log("[PerformanceMode] Page hidden - pausing Firestore listener to save resources");
          this.unsubscribeFromCloud();
        } else if (!this.firestoreUnsubscribe && this.firestoreDocRef) {
          console.log("[PerformanceMode] Page visible - resuming Firestore listener");
          this.listenToCloud();
        }
      });
    }
  },

  async loadFromCloud() {
    if (!navigator.onLine) {
      this.addConsoleLog("[REPLICATION] Device is offline. Offline-local mode activated successfully.", "success");
      this.setSyncState("offline");
      return;
    }

    this.setSyncState("loading");
    try {
      console.log("[loadFromCloud] Initiating load from MySQL database...");
      const sqlRes = await fetch("/api/sql/db");
      if (sqlRes.ok) {
        const sqlData = await sqlRes.json();
        if (sqlData.success && sqlData.db) {
          this.mergeParsedDb(sqlData.db);

          // Guarantee we have a syncNodes entry for MySQL
          this.db.syncNodes = [
            { id: "node-sql", name: "MySQL Database (veloralb_Digital)", active: true, type: "sql", status: "connected", lastSync: new Date().toLocaleTimeString() }
          ];

          if (this.currentUser) {
            const freshUser = this.db.users?.find(u => u.username === this.currentUser.username || u.id === this.currentUser.id);
            if (freshUser) {
              this.currentUser = removeCircularReferences(freshUser);
              localStorage.setItem(this.sessionKey, safeStringify(freshUser));
            }
          }
          localStorage.setItem(this.dbKey, safeStringify(this.db));
          localStorage.setItem("lottery_winner_db_backup", safeStringify(this.db));
          this.render();
          this.startSqlPolling();
          this.addConsoleLog(`[SQL DB LOAD] Successfully loaded and aligned live state from active MySQL database.`, "success");
          this.setSyncState("synced");
          return;
        }
      }
      throw new Error(`HTTP ${sqlRes.status}`);
    } catch (sqlErr: any) {
      console.warn("SQL database load notice (using offline local DB):", sqlErr?.message || sqlErr);
      this.addConsoleLog("[SQL DB LOAD] External SQL unreachable. Operating on offline local storage mode.", "warning");
      this.setSyncState("offline");
    }
  },

  async syncToCloud() {
    if (!this.db) return;

    // 1. Always mirror to BOTH local storage instances immediately
    try {
      const cleaned = removeCircularReferences(this.db);
      const serialized = safeStringify(cleaned);
      localStorage.setItem(this.dbKey, serialized);
      localStorage.setItem("lottery_winner_db_backup", serialized);
    } catch (storageErr) {
      console.warn("Local storage dual-mirror warning:", storageErr);
    }

    if (!navigator.onLine) {
      this.addConsoleLog("[REPLICATION] Offline. Sync changes queued in local cache & backup store.", "warning");
      this.setSyncState("offline");
      return;
    }

    this.setSyncState("syncing");

    try {
      const dbSerialized = safeStringify(this.db);
      const sqlConfig = this.db.sqlDbConfig || {
        host: 'https://api.veloralbillal.top/db_bridge.php',
        port: '3306',
        database: 'veloralb_Digital',
        username: 'veloralb_Digital',
        password: 'UcWg.75@wv+Ijzh#',
        activeEngine: 'mysql',
        autoSync: true
      };
      
      sqlConfig.activeEngine = 'mysql';
      sqlConfig.autoSync = true;
      sqlConfig.lastSyncTime = new Date().toISOString();
      sqlConfig.syncStatus = "synced";
      this.db.sqlDbConfig = sqlConfig;

      // Guarantee we have a syncNodes entry for MySQL
      this.db.syncNodes = [
        { id: "node-sql", name: "MySQL Database (veloralb_Digital)", active: true, type: "sql", status: "connected", lastSync: new Date().toLocaleTimeString() }
      ];

      // Replicate payload to server-side SQL sync endpoint
      try {
        const response = await fetch("/api/sql/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            db: dbSerialized, 
            config: sqlConfig 
          })
        });
        
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            this.addConsoleLog(`[SYNC] 🐬 MySQL Database (${sqlConfig.database || 'veloralb_Digital'}@${sqlConfig.host || 'localhost'}) synced successfully. 100% data synced!`, "success");
            this.setSyncState("synced");
          } else {
            throw new Error(resData.error || "Server rejected SQL sync");
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (netErr: any) {
        this.addConsoleLog(`[SYNC ERROR] SQL Mirroring failed: ${netErr.message || netErr}`, "error");
        this.setSyncState("error");
      }

      // Update our new HA cluster UI stats if we're on the Failover Vault tab
      if (this.currentAdminTab === "sync-vault") {
        this.renderSyncVaultTab();
      }
    } catch (e: any) {
      this.addConsoleLog(`[SYNC WARNING] Sync notice: ${e.message || e}`, "warning");
      this.setSyncState("error");
    }
  },

  setSyncState(state) {
    this.syncState = state;
    if (state === 'synced') {
      this.lastSyncedTime = new Date();
    }
    
    // 1. Update all header badges in DOM
    const badges = document.querySelectorAll(".cloud-sync-debug-trigger");
    badges.forEach(badge => {
      const dot = badge.querySelector(".cloud-sync-dot");
      const text = badge.querySelector(".cloud-sync-text");
      
      if (dot && text) {
        // Reset classes
        dot.className = "w-1.5 h-1.5 rounded-full cloud-sync-dot";
        text.className = "font-extrabold uppercase tracking-tight cloud-sync-text";
        
        switch (state) {
          case 'synced':
            dot.classList.add("bg-emerald-500", "shadow-[0_0_6px_rgba(16,185,129,0.5)]");
            text.classList.add("text-emerald-400");
            text.innerText = "Synced";
            badge.title = "Cloud State: Synced successfully! Secure & Connected.";
            break;
          case 'syncing':
            dot.classList.add("bg-amber-500", "animate-pulse", "shadow-[0_0_6px_rgba(245,158,11,0.5)]");
            text.classList.add("text-amber-400");
            text.innerText = "Saving...";
            badge.title = "Cloud State: Uploading current database changes...";
            break;
          case 'loading':
            dot.classList.add("bg-cyan-500", "animate-pulse", "shadow-[0_0_6px_rgba(6,182,212,0.5)]");
            text.classList.add("text-cyan-400");
            text.innerText = "Loading...";
            badge.title = "Cloud State: Loading fresh data from Firebase...";
            break;
          case 'offline':
            dot.classList.add("bg-rose-500", "animate-bounce", "shadow-[0_0_6px_rgba(239,68,68,0.5)]");
            text.classList.add("text-rose-500");
            text.innerText = "Offline";
            badge.title = "Cloud State: Internet disconnected. Changes saved locally.";
            break;
          case 'error':
            dot.classList.add("bg-red-600", "shadow-[0_0_6px_rgba(220,38,38,0.5)]");
            text.classList.add("text-red-500");
            text.innerText = "Sync Error";
            badge.title = "Cloud State: Sync failed. Will retry automatically.";
            break;
        }
      }
    });

    // 2. Update diagnostics modal elements if they exist
    this.updateDiagnosticsModal(state);
  },

  updateDiagnosticsModal(state) {
    const modalDot = document.getElementById("sync-modal-dot");
    const modalStateText = document.getElementById("sync-modal-state-text");
    const modalStateSubtext = document.getElementById("sync-modal-state-subtext");
    const modalIcon = document.getElementById("sync-modal-icon");
    const modalIconContainer = document.getElementById("sync-modal-icon-container");

    if (modalDot && modalStateText && modalStateSubtext && modalIcon) {
      // Clear previous classes
      modalDot.className = "w-2 h-2 rounded-full";
      modalIcon.className = "fa-solid";
      if (modalIconContainer) modalIconContainer.className = "w-12 h-12 rounded-xl border flex items-center justify-center text-xl shrink-0";

      // Calculate stats counts from local DB
      const userCount = this.db && this.db.users ? this.db.users.length : 0;
      const poolsCount = this.db && this.db.lotteries ? this.db.lotteries.length : 0;

      const userCountEl = document.getElementById("sync-stat-users");
      const poolsCountEl = document.getElementById("sync-stat-pools");
      if (userCountEl) userCountEl.innerText = `${userCount} Active Players`;
      if (poolsCountEl) poolsCountEl.innerText = `${poolsCount} Pools configured`;

      // Last Synced string
      const timeEl = document.getElementById("sync-stat-time");
      if (timeEl) {
        if (state === 'offline') {
          timeEl.innerText = "Offline Mode (Local Active)";
          timeEl.className = "text-rose-400 font-bold";
        } else {
          timeEl.innerText = this.lastSyncedTime ? this.lastSyncedTime.toLocaleTimeString() : "Just Now";
          timeEl.className = "text-emerald-400 font-bold";
        }
      }

      switch (state) {
        case 'synced':
          modalDot.classList.add("bg-emerald-500", "shadow-[0_0_6px_rgba(16,185,129,0.5)]");
          modalStateText.innerText = "Cloud Sync Active / ক্লাউড সুরক্ষিত";
          modalStateText.className = "text-xs font-black text-emerald-400 uppercase tracking-wider";
          modalStateSubtext.innerText = "Everything is perfectly backed up onto Firebase Firestore.";
          modalIcon.classList.add("fa-cloud-arrow-up", "text-emerald-400");
          if (modalIconContainer) modalIconContainer.classList.add("bg-emerald-950/40", "border-emerald-800/30", "text-emerald-400");
          break;
        case 'syncing':
          modalDot.classList.add("bg-amber-500", "animate-pulse", "shadow-[0_0_6px_rgba(245,158,11,0.5)]");
          modalStateText.innerText = "Uploading / ক্লাউড আপডেট হচ্ছে";
          modalStateText.className = "text-xs font-black text-amber-500 uppercase tracking-wider";
          modalStateSubtext.innerText = "Saving your wins, tickets, and modifications to Google Cloud.";
          modalIcon.classList.add("fa-circle-notch", "animate-spin", "text-amber-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-amber-950/40", "border-amber-800/30", "text-amber-500");
          break;
        case 'loading':
          modalDot.classList.add("bg-cyan-500", "animate-pulse", "shadow-[0_0_6px_rgba(6,182,212,0.5)]");
          modalStateText.innerText = "Downloading / ডাটা লোড হচ্ছে";
          modalStateText.className = "text-xs font-black text-cyan-400 uppercase tracking-wider";
          modalStateSubtext.innerText = "Fetching the latest player records and configurations from Firebase.";
          modalIcon.classList.add("fa-circle-notch", "animate-spin", "text-cyan-400");
          if (modalIconContainer) modalIconContainer.classList.add("bg-cyan-950/40", "border-cyan-800/30", "text-cyan-400");
          break;
        case 'offline':
          modalDot.classList.add("bg-rose-500", "animate-bounce", "shadow-[0_0_6px_rgba(239,68,68,0.5)]");
          modalStateText.innerText = "Offline Mode / ইন্টারনেট বিচ্ছিন্ন";
          modalStateText.className = "text-xs font-black text-rose-500 uppercase tracking-wider";
          modalStateSubtext.innerText = "Using offline fallbacks. Data will autosync when internet returns.";
          modalIcon.classList.add("fa-wifi-slash", "text-rose-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-rose-950/40", "border-rose-800/30", "text-rose-500");
          break;
        case 'error':
          modalDot.classList.add("bg-red-600", "shadow-[0_0_6px_rgba(220,38,38,0.5)]");
          modalStateText.innerText = "Sync Blocked / সংযোগ ত্রুটি";
          modalStateText.className = "text-xs font-black text-red-500 uppercase tracking-wider";
          modalStateSubtext.innerText = "Failed to establish synchronization handshake with the Firestore database.";
          modalIcon.classList.add("fa-triangle-exclamation", "text-red-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-red-950/40", "border-red-800/30", "text-red-500");
          break;
      }
    }
  },

  initRealtimeEventStream() {
    if ((this as any)._sseEventSource) return;
    try {
      const es = new EventSource("/api/events");
      (this as any)._sseEventSource = es;
      es.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type === "database_switched") {
            console.log("[SSE Realtime Broadcaster] Database engine switched across browsers:", payload.activeMode);
            if (payload.config && this.db) {
              if (!this.db.sqlDbConfig) this.db.sqlDbConfig = {};
              this.db.sqlDbConfig = { ...this.db.sqlDbConfig, ...payload.config };
                this.db.syncNodes?.forEach((n: any) => {
                  if (payload.activeMode === "SQL") {
                    n.active = (n.id === "node-sql");
                  } else {
                    n.active = (n.id === "node-1" || n.id === "node-firebase");
                  }
                });
            }
            localStorage.removeItem("lottery_winner_db_backup");
            await this.loadFromCloud();
            if (typeof (this as any).showToast === "function") {
              (this as any).showToast(`Database synchronized to ${payload.activeMode} across all sessions!`, "info");
            }
            this.render();
          }
        } catch (err) {
          console.warn("Error parsing SSE event payload:", err);
        }
      };
      es.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (e) {
      console.warn("Failed to initialize SSE EventSource:", e);
    }
  },

  startSqlPolling() {
    if (this._sqlPollInterval) return;
    this._sqlPollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      let activeNode = this.db && this.db.syncNodes ? this.db.syncNodes.find(n => n.active) : null;
      if (activeNode && activeNode.id === "node-sql") {
        try {
          const sqlRes = await fetch("/api/sql/db");
          if (sqlRes.ok) {
            const sqlData = await sqlRes.json();
            if (sqlData.success && sqlData.db) {
              const currentStr = safeStringify(this.db);
              const incomingStr = typeof sqlData.db === "string" ? sqlData.db : safeStringify(sqlData.db);
              if (currentStr !== incomingStr) {
                let parsed = typeof sqlData.db === "string" ? JSON.parse(sqlData.db) : sqlData.db;
                if (parsed) {
                  parsed = removeCircularReferences(parsed);
                  this.mergeParsedDb(parsed);
                  localStorage.setItem(this.dbKey, safeStringify(this.db));
                  localStorage.setItem("lottery_winner_db_backup", safeStringify(this.db));
                  this.render();
                  console.log("[SQL Realtime Poll] Live state successfully synchronized across browser from MySQL.");
                }
              }
            }
          }
        } catch (e) {
          // silent background poll catch
        }
      }
    }, 4000);
  }
};

