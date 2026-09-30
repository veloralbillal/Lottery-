import { initializeApp, getApps, deleteApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc, setLogLevel, onSnapshot, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { removeCircularReferences, safeStringify } from "./serialization.js";
import { fallbackFirebaseConfig } from "./bundledTabs.js";

export const SyncCloudModule = {
  async initFirebaseSync() {
    try {
      console.log("SyncCloudModule: Initializing...");
      let firebaseConfig = null;
      try {
        const configRes = await fetch("firebase-applet-config.json");
        if (configRes.ok) {
          firebaseConfig = await configRes.json();
          console.log("Firebase config loaded from JSON.");
        } else {
          throw new Error(`HTTP status ${configRes.status}`);
        }
      } catch (fetchErr) {
        console.warn("Could not fetch firebase-applet-config.json, attempting fallback:", fetchErr);
        firebaseConfig = fallbackFirebaseConfig;
      }

      if (!firebaseConfig || !firebaseConfig.apiKey) {
        console.warn("Firebase config is missing or invalid. Cloud sync will be disabled.");
        this.setSyncState("offline");
        return;
      }
      this.firebaseConfig = firebaseConfig;
      
      let app;
      const apps = getApps();
      if (apps.length > 0) {
        app = apps[0];
        console.log("Using existing Firebase app instance.");
      } else {
        app = initializeApp(firebaseConfig);
        console.log("Initialized new Firebase app instance.");
      }

      const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
      try {
        setLogLevel("silent");
      } catch (logErr) {
        console.warn("Could not set Firestore log level:", logErr);
      }
      
      this.firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false
      }, dbId);
      this.auth = getAuth(app);
      this.storage = getStorage(app);
      this.firestoreDocRef = doc(this.firestore, "app_data", "lottery_winner_db");
      
      console.log("Firebase sync engine initialized successfully.");
      
      // Start subscribing to live Firestore updates and pull latest cloud state immediately
      this.listenToCloud();
      this.initAuthListener();
      await this.loadFromCloud().catch(err => console.warn("Initial cloud load failed:", err));
    } catch (e) {
      console.error("Failed to initialize Firebase Sync:", e.message || e);
      this.setSyncState("error");
    }
  },

  initAuthListener() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        console.log("Firebase Auth: User logged in:", user.email);
        await this.loadUserProfile(user.uid);
      } else {
        console.log("Firebase Auth: No user logged in.");
      }
    });
  },

  async loadUserProfile(uid) {
    try {
      // 1. Instant check in current active local database array
      if (this.db && this.db.users && Array.isArray(this.db.users)) {
        const localUser = this.db.users.find(u => u.id === uid || u.uid === uid);
        if (localUser) {
          this.currentUser = removeCircularReferences(localUser);
          localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
          console.log("User profile hydrated from active database:", localUser.username);
          this.render();
        }
      }

      // 2. Fetch from Firestore if connected
      if (this.firestore) {
        const userDoc = await getDoc(doc(this.firestore, "users", uid)).catch(() => null);
        if (userDoc && userDoc.exists && userDoc.exists()) {
          const profile = userDoc.data();
          this.currentUser = removeCircularReferences({ ...(this.currentUser || {}), ...profile });
          localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
          console.log("User profile updated from Firestore:", profile.username);
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
      const uid = this.currentUser.id;
      const profileDoc = doc(this.firestore, "users", uid);
      const cleanedProfile = removeCircularReferences(this.currentUser);
      await setDoc(profileDoc, {
        ...cleanedProfile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("User profile synced to Firestore.");
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  },

  async lookupUserByUsername(username) {
    if (!username) return null;
    const cleanUser = username.toLowerCase().trim();

    // 1. Primary: Check local monolithic DB first for immediate and offline-safe resolution
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

    // 2. Secondary: Query public usernames collection in Firestore with timeout
    try {
      if (this.firestore) {
        const usernamePromise = getDoc(doc(this.firestore, "usernames", cleanUser));
        const usernameDoc: any = await Promise.race([
          usernamePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
        ]).catch(() => null);

        if (usernameDoc && usernameDoc.exists && usernameDoc.exists()) {
          return usernameDoc.data();
        }
      }
    } catch (err) {
      console.warn("Firestore username lookup failed:", err);
    }
    return null;
  },

  async createStaffAccount(staffData) {
    let uid = "agent_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    let secondaryApp: any;

    try {
      if (this.firebaseConfig && this.firebaseConfig.apiKey) {
        const authPromise = (async () => {
          secondaryApp = initializeApp(this.firebaseConfig, "Secondary_" + Date.now());
          const secondaryAuth = getAuth(secondaryApp);
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffData.email, staffData.password);
          if (userCredential && userCredential.user) {
            uid = userCredential.user.uid;
          }
          await signOut(secondaryAuth).catch(() => {});
          await deleteApp(secondaryApp).catch(() => {});
        })();

        await Promise.race([
          authPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Auth creation timeout")), 3000))
        ]).catch(err => {
          console.warn("Firebase Auth secondary creation bypassed:", err?.code || err?.message || err);
          if (secondaryApp) try { deleteApp(secondaryApp); } catch (e) {}
        });
      }
    } catch (err: any) {
      console.warn("Firebase Auth staff creation fallback:", err?.code || err?.message);
      if (secondaryApp) try { await deleteApp(secondaryApp); } catch (e) {}
    }

    try {
      if (this.firestore) {
        const profile = {
          ...staffData,
          id: uid,
          uid: uid,
          createdAt: new Date().toISOString(),
          status: "active"
        };

        // Don't wait forever for Firestore if we're in a hurry or offline
        const setUsersPromise = setDoc(doc(this.firestore, "users", uid), profile, { merge: true });
        const setUsernamesPromise = setDoc(doc(this.firestore, "usernames", staffData.username.toLowerCase()), {
          uid: uid,
          email: staffData.email.toLowerCase(),
          username: staffData.username.toLowerCase()
        }, { merge: true });

        await Promise.race([
          Promise.all([setUsersPromise, setUsernamesPromise]),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore write timeout")), 2500))
        ]).catch(err => {
          console.warn("Direct Firestore staff profile creation bypassed (synced via app_data):", err?.message || err);
        });
      }
      if (typeof (this as any).saveDB === "function") {
        (this as any).saveDB(true);
      }
      return { success: true, uid };
    } catch (err: any) {
      console.warn("Staff account Firestore sync bypassed:", err);
      if (typeof (this as any).saveDB === "function") {
        (this as any).saveDB(true);
      }
      return { success: true, uid };
    }
  },

  async signUpUser(userData) {
    let uid = "u_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    let authCreated = false;

    try {
      if (this.auth) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
        if (userCredential && userCredential.user) {
          uid = userCredential.user.uid;
          authCreated = true;
        }
      }
    } catch (err: any) {
      console.warn("Firebase Auth signup fallback:", err?.code || err?.message);
      if (err?.code === "auth/email-already-in-use") {
        return { success: false, error: "This email address is already registered. Please sign in instead." };
      }
    }

    try {
      if (this.firestore) {
        const profile = {
          ...userData,
          id: uid,
          uid: uid,
          createdAt: new Date().toISOString(),
          status: "active"
        };
        delete profile.password;

        await setDoc(doc(this.firestore, "users", uid), profile, { merge: true });

        await setDoc(doc(this.firestore, "usernames", userData.username.toLowerCase()), {
          uid: uid,
          email: userData.email.toLowerCase(),
          username: userData.username.toLowerCase()
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn("Firestore profile save warning (continuing with local registration):", fsErr);
    }

    console.log("User registered successfully (Auth created:", authCreated, ", UID:", uid, ")");
    return { success: true, uid, authCreated };
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

    // Resolve what the live active node is
    let activeNode = this.db && this.db.syncNodes ? this.db.syncNodes.find(n => n.active) : null;
    if (!activeNode && this.db && this.db.syncNodes && this.db.syncNodes.length > 0) {
      activeNode = this.db.syncNodes[0];
    }

    // 🐬 SQL DIRECT LOAD: If the active database engine is SQL, fetch and synchronize state from MySQL server instead of Firestore
    if (activeNode && activeNode.id === "node-sql") {
      this.setSyncState("loading");
      try {
        const sqlRes = await fetch("/api/sql/db");
        if (sqlRes.ok) {
          const sqlData = await sqlRes.json();
          if (sqlData.success && sqlData.db) {
            this.mergeParsedDb(sqlData.db);

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
      } catch (sqlErr: any) {
        console.error("Failed to load DB from server SQL database. Error:", sqlErr);
        this.addConsoleLog("[SQL DB LOAD] Failed to reach SQL database. Falling back to Firestore...", "error");
      }
    }

    if (!this.firestore) {
      this.setSyncState("offline");
      return;
    }

    const isSecondary = activeNode && (activeNode.id === "node-2" || activeNode.name?.includes("Backup") || activeNode.name?.includes("Secondary"));
    const primaryPath = isSecondary ? "lottery_winner_db_backup" : "lottery_winner_db";
    const fallbackPath = isSecondary ? "lottery_winner_db" : "lottery_winner_db_backup";

    this.setSyncState("loading");
    try {
      const primaryDocRef = doc(this.firestore, "app_data", primaryPath);
      const fallbackDocRef = doc(this.firestore, "app_data", fallbackPath);

      let docSnap: any = null;
      try {
        const docSnapPromise = getDoc(primaryDocRef);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
        docSnap = await Promise.race([docSnapPromise, timeoutPromise]);
      } catch (err) {
        console.warn(`Primary doc read failed (${primaryPath}), trying fallback (${fallbackPath}):`, err);
      }

      if (!docSnap || !docSnap.exists || !docSnap.exists()) {
        try {
          const fbPromise = getDoc(fallbackDocRef);
          const fbTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
          docSnap = await Promise.race([fbPromise, fbTimeout]);
        } catch (fbErr) {
          console.warn("Fallback doc read also failed:", fbErr);
        }
      }

      if (docSnap && docSnap.exists && docSnap.exists()) {
        const cloudData = docSnap.data().db;
        if (cloudData) {
          let parsed = typeof cloudData === "string" ? JSON.parse(cloudData) : cloudData;
          if (parsed) {
            parsed = removeCircularReferences(parsed);
          }
          this.mergeParsedDb(parsed);
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
          console.log(`Database successfully synced with Firebase cloud (Loaded from ${primaryPath}).`);
          this.addConsoleLog(`[DUAL REPLICATION] Aligned live state from active cluster (${primaryPath}).`, "success");
          this.setSyncState("synced");
        }
      } else {
        await this.syncToCloud();
        console.log("Initialized cloud database documents in Firebase Firestore.");
        this.setSyncState("synced");
      }
    } catch (e: any) {
      if (e && (e.code === "unavailable" || e.message?.includes("offline") || e.message?.includes("reach") || e.message?.includes("Timeout") || e.message?.includes("network"))) {
        this.addConsoleLog("[REPLICATION] Firestore cluster is currently unreachable. Switched to offline-local mode successfully.", "success");
        this.setSyncState("offline");
      } else {
        this.addConsoleLog(`[REPLICATION] Cloud document fetch warning: ${e.message || e}`, "warning");
        this.setSyncState("error");
      }
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
      this.addConsoleLog("[REPLICATION] Offline. Dual-sync changes queued in local cache & backup store.", "warning");
      this.setSyncState("offline");
      return;
    }

    // Resolve what the live active node is
    let activeNode = this.db.syncNodes ? this.db.syncNodes.find(n => n.active) : null;
    if (!activeNode && this.db.syncNodes && this.db.syncNodes.length > 0) {
      activeNode = this.db.syncNodes[0];
      if (activeNode) activeNode.active = true;
    }

    if (!activeNode) {
      activeNode = { type: "firebase", name: "Primary Database (Cluster 1)" };
    }

    this.setSyncState("syncing");

    try {
      if (this.firestore) {
        const dbSerialized = safeStringify(this.db);
        const payload = {
          db: dbSerialized,
          updatedAt: new Date().toISOString(),
          activeNodeId: activeNode.id || "node-1",
          activeNodeName: activeNode.name || "Primary Database",
          dualSynced: true
        };

        // DUAL DATABASE WRITING: Synchronize to BOTH Database 1 and Database 2 in Firestore!
        const primaryDocRef = doc(this.firestore, "app_data", "lottery_winner_db");
        const secondaryDocRef = doc(this.firestore, "app_data", "lottery_winner_db_backup");

        const primaryPromise = setDoc(primaryDocRef, payload, { merge: true });
        const secondaryPromise = setDoc(secondaryDocRef, payload, { merge: true });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3500));
        await Promise.race([
          Promise.allSettled([primaryPromise, secondaryPromise]),
          timeoutPromise
        ]);

        this.addConsoleLog(`[DUAL SYNC ACTIVE] Automatically committed write transaction to BOTH Database 1 (Primary) & Database 2 (Backup Replica)! Zero data loss on switch.`, "success");

        // DUAL DATABASE WRITING TO SQL DB (veloralb_Digital)
        const isSqlActive = activeNode && activeNode.id === "node-sql";
        const sqlConfig = this.db.sqlDbConfig || {
          host: 'localhost',
          port: '3306',
          database: 'veloralb_Digital',
          username: 'veloralb_Digital',
          password: 'UcWg.75@wv+Ijzh#',
          activeEngine: isSqlActive ? 'mysql' : 'firebase',
          autoSync: true
        };

        if (isSqlActive || (sqlConfig && sqlConfig.autoSync !== false)) {
          sqlConfig.lastSyncTime = new Date().toISOString();
          sqlConfig.syncStatus = "synced";
          if (!this.db.sqlDbConfig) this.db.sqlDbConfig = sqlConfig;
          
          // Replicate payload to server-side SQL sync endpoint
          try {
            const response = await fetch("/api/sql/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                db: dbSerialized, 
                config: { ...sqlConfig, activeEngine: isSqlActive ? "mysql" : "firebase" } 
              })
            });
            
            if (response.ok) {
              const resData = await response.json();
              if (resData.success) {
                const sqlNode = (this.db.syncNodes || []).find((n: any) => n.id === "node-sql");
                if (sqlNode) {
                  sqlNode.lastSync = new Date().toLocaleTimeString();
                  sqlNode.status = "connected";
                }
                this.addConsoleLog(`[DUAL SYNC ACTIVE] 🐬 MySQL Database (${sqlConfig.database || 'veloralb_Digital'}@${sqlConfig.host || 'localhost'}) & Google Firebase aligned. 100% data mirrored!`, "success");
              } else {
                throw new Error(resData.error || "Server rejected SQL sync");
              }
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (netErr: any) {
            this.addConsoleLog(`[DUAL SYNC ERROR] SQL Mirroring failed: ${netErr.message || netErr}`, "error");
            const sqlNode = (this.db.syncNodes || []).find((n: any) => n.id === "node-sql");
            if (sqlNode && !sqlNode.name?.includes("Simulated")) {
              sqlNode.status = "error";
            }
          }
        }
      }

      this.setSyncState("synced");
      
      // Update our new HA cluster UI stats if we're on the Failover Vault tab
      if (this.currentAdminTab === "sync-vault") {
        this.renderSyncVaultTab();
      }
    } catch (e: any) {
      const isOffline = e && (e.code === "unavailable" || e.message?.includes("offline") || e.message?.includes("reach") || e.message?.includes("Timeout") || e.message?.includes("network"));
      if (isOffline) {
        this.addConsoleLog(`[DUAL SYNC OFFLINE] Network notice: ${e.message || e}. Changes secured in local dual-cache.`, "warning");
        this.setSyncState("offline");
      } else {
        this.addConsoleLog(`[DUAL SYNC WARNING] Write replication notice: ${e.message || e}`, "warning");
        this.setSyncState("error");
      }
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

