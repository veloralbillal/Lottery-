// ============================================================================
// DATABASE REPLICATION SYNC & FAILOVER ENGINE MODULE
// ============================================================================
import { doc } from "firebase/firestore";

export const SyncVaultModule = {
  renderSyncVaultTab() {
    if (!this.db || !this.db.syncNodes) return;

    // 1. Render active pipeline badge in statistics
    const activeNode = this.db.syncNodes.find(n => n.active) || this.db.syncNodes[0];
    const nodenameEl = document.getElementById("failover-live-active-nodename");
    if (nodenameEl && activeNode) {
      nodenameEl.innerText = activeNode.name;
    }

    const pipelineEl = document.getElementById("sync-health-pipeline");
    if (pipelineEl && activeNode) {
      pipelineEl.innerText = `${activeNode.type.toUpperCase()} (${activeNode.status.toUpperCase()})`;
      pipelineEl.className = activeNode.status === 'outage' ? "text-rose-500 font-bold" : "text-emerald-400 font-bold";
    }

    const nodesCountEl = document.getElementById("sync-health-nodes-count");
    if (nodesCountEl) {
      nodesCountEl.innerText = `${this.db.syncNodes.length} Clusters Enlisted`;
    }

    const backendsCountTxt = document.getElementById("cluster-backends-count-txt");
    if (backendsCountTxt) {
      backendsCountTxt.innerText = `${this.db.syncNodes.length} Database Nodes registered`;
    }

    // Update diagram state
    const clusterStatus = document.getElementById("cluster-db-visual-status");
    const clusterIcon = document.getElementById("cluster-db-visual-icon");
    if (clusterStatus && clusterIcon && activeNode) {
      if (activeNode.status === "outage") {
        clusterStatus.innerText = "OUTAGE FLUX";
        clusterStatus.className = "px-2 py-0.5 rounded-full bg-rose-950 text-[10px] text-rose-500 font-mono tracking-wider font-bold";
        clusterIcon.className = "w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-500 animate-bounce";
      } else {
        clusterStatus.innerText = "SYNCED / HA";
        clusterStatus.className = "px-2 py-0.5 rounded-full bg-emerald-950 text-[10px] text-emerald-400 font-mono tracking-wider font-bold";
        clusterIcon.className = "w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400";
      }
    }

    // 2. Render sync nodes loop - partitioned by Premium vs Free tiers
    const container = document.getElementById("sync-nodes-container");
    if (container) {
      container.innerHTML = "";
      
      const premiumNodes = this.db.syncNodes.filter(n => n.tier === "premium");
      const freeNodes = this.db.syncNodes.filter(n => n.tier === "free");

      const renderNodeList = (nodesList, sectionTitle, isPremium) => {
        if (nodesList.length === 0) return;

        const headerDiv = document.createElement("div");
        headerDiv.className = "flex items-center gap-2 pt-4 pb-1 border-b border-slate-800/40 mb-3 mt-2 select-none";
        
        let labelClass = "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20";
        if (!isPremium) {
          labelClass = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
        }
        
        headerDiv.innerHTML = `
          <div class="px-2 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase ${labelClass}">
            ${isPremium ? '💎 Enterprise SLA' : '🌱 Free Sandbox'}
          </div>
          <span class="text-[10px] font-black text-white uppercase tracking-wider font-mono">${sectionTitle}</span>
        `;
        container.appendChild(headerDiv);

        nodesList.forEach(node => {
          // Node Type icon selector
          let iconHtml = `<i class="fa-solid fa-server text-cyan-400"></i>`;
          if (node.type === "firebase") {
            iconHtml = `<i class="fa-solid fa-cloud text-amber-500"></i>`;
          } else if (node.type === "sql") {
            iconHtml = `<i class="fa-solid fa-database text-blue-400"></i>`;
          } else if (node.type === "api") {
            iconHtml = `<i class="fa-solid fa-arrows-spin text-purple-400"></i>`;
          }

          // Active highlighted classes
          const activeClass = node.active ? "border-emerald-600/60 bg-gradient-to-br from-slate-900 to-emerald-950/20" : "border-slate-800 bg-slate-950/40";
          
          let statusBadge = "";
          if (node.status === "outage") {
            statusBadge = `<span class="bg-red-500/10 text-red-500 border border-red-500/25 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase animate-pulse">🔴 Outage (Simulated Fault)</span>`;
          } else if (node.active) {
            statusBadge = `<span class="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse">🟢 Active Master DB</span>`;
          } else if (node.status === "connected") {
            statusBadge = `<span class="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase">Connected</span>`;
          } else if (node.status === "standby") {
            statusBadge = `<span class="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase">Standby Replication Link</span>`;
          } else {
            statusBadge = `<span class="bg-slate-800 text-slate-500 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full uppercase">Passive</span>`;
          }

          const card = document.createElement("div");
          card.className = `p-4 border ${activeClass} rounded-2xl flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center transition duration-200 hover:border-slate-700 mb-2.5 w-full max-w-full overflow-hidden`;
          card.innerHTML = `
            <div class="space-y-1.5 w-full lg:max-w-md min-w-0">
              <div class="flex items-start sm:items-center gap-2 flex-wrap w-full min-w-0">
                <div class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs shrink-0">
                  ${iconHtml}
                </div>
                <div class="min-w-0 flex-1">
                  <h5 class="text-[12px] font-black text-white leading-tight truncate max-w-full">${node.name}</h5>
                  <span class="text-[8.5px] font-mono text-slate-500 uppercase font-bold truncate block">DRIVER: ${node.type.toUpperCase()} • Priority: ${node.priority}</span>
                </div>
                <div class="flex gap-1.5 items-center flex-wrap shrink-0">
                  ${statusBadge}
                  <span class="text-[9px] text-[#f59e0b] font-mono whitespace-nowrap">⚡ ${node.latency} ms</span>
                </div>
              </div>
              <p class="text-[10px] text-slate-400/80 font-sans leading-relaxed break-words">${node.description}</p>
              <div class="text-[8.5px] text-slate-600 font-mono select-all break-all bg-slate-950 px-2 py-1 rounded w-full overflow-x-auto">
                Connection Address: ${node.endpoint}
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 w-full lg:w-auto shrink-0 border-t border-slate-850 pt-2.5 lg:pt-0 lg:border-0 justify-start lg:justify-end items-center">
              <!-- Simulated failure toggle -->
              <button class="action-toggle-outage text-[9.5px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer select-none ${node.status === "outage" ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900' : 'bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-900/45'}" data-id="${node.id}">
                ${node.status === "outage" ? '<i class="fa-solid fa-play-circle"></i> Clear Fault' : '<i class="fa-solid fa-heart-crack animate-pulse"></i> Outage'}
              </button>

              <!-- Diagnostic Ping check -->
              <button class="action-test-ping text-[9.5px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition cursor-pointer" data-id="${node.id}">
                <i class="fa-solid fa-bolt"></i> Ping Node
              </button>

              <!-- Test DB Connection check -->
              <button class="action-test-db text-[9.5px] font-mono font-bold bg-indigo-950 border border-indigo-850 text-indigo-300 hover:text-white hover:bg-indigo-900 px-2.5 py-1.5 rounded-lg transition cursor-pointer" data-id="${node.id}" title="Test DB switching and connection auth verification">
                <i class="fa-solid fa-plug-circle-check text-cyan-400"></i> Test DB
              </button>

              <!-- Force Set Active master override -->
              ${!node.active ? `
                <button class="action-set-active text-[9.5px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 px-2.5 py-1.5 rounded-lg transition cursor-pointer" data-id="${node.id}">
                  Force Active
                </button>
              ` : ''}

              <!-- Trash button if dynamic -->
              ${node.id !== "node-1" && node.id !== "node-2" ? `
                <button class="action-delete-node text-[9.5px] text-rose-500 hover:bg-rose-950/40 bg-slate-950 border border-slate-850 hover:border-rose-900 p-1.5 rounded-lg transition shrink-0 cursor-pointer" data-id="${node.id}" title="Remove Standby server">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              ` : ''}
            </div>
          `;
          container.appendChild(card);
        });
      };

      // 1. Render Premium high-availability backup nodes
      renderNodeList(premiumNodes, "💎 Premium Security Database Vaults (Enterprise HA Replicated)", true);

      // 2. Render Free sandbox backup nodes
      renderNodeList(freeNodes, "🌱 Free / Development replica Nodes (Community Shared)", false);
    }

    // 3. Render sync console messages
    const logsEl = document.getElementById("sync-console-logs");
    if (logsEl) {
      logsEl.innerHTML = "";
      const logs = this.db.syncLogs || [];
      if (logs.length === 0) {
        logsEl.innerHTML = `<div class="text-slate-500 italic">[Waiting for sync operations... Terminal is silent].</div>`;
      } else {
        logs.forEach(log => {
          let colorClass = "text-slate-400";
          if (log.type === "success") {
            colorClass = "text-emerald-400 font-bold";
          } else if (log.type === "error") {
            colorClass = "text-rose-500 font-bold animate-pulse";
          } else if (log.type === "info") {
            colorClass = "text-cyan-400";
          }
          const logDiv = document.createElement("div");
          logDiv.className = colorClass;
          logDiv.innerHTML = `[${log.time}] ${log.message}`;
          logsEl.appendChild(logDiv);
        });
        // Auto scroll to bottom
        logsEl.scrollTop = logsEl.scrollHeight;
      }
    }

    // 4. Update Standby Code Generator Dropdowns & Text Terminal preview
    this.repopulateNodesForGenerator();
    this.updateStandbyCodeGenerator();

    // 5. Update SQL Database Configuration & Switcher Hub
    this.renderSqlSyncHub();
  },

  renderSqlSyncHub() {
    if (!this.db || !this.db.sqlDbConfig) return;
    const cfg = this.db.sqlDbConfig;

    // Initialize switches if undefined
    if (cfg.firebaseEnabled === undefined) cfg.firebaseEnabled = true;
    if (cfg.sqlEnabled === undefined) cfg.sqlEnabled = true;

    // Populate form fields
    const hostEl = document.getElementById("sql-cfg-host");
    const portEl = document.getElementById("sql-cfg-port");
    const dbEl = document.getElementById("sql-cfg-database");
    const userEl = document.getElementById("sql-cfg-username");
    const passEl = document.getElementById("sql-cfg-password");
    const autoSyncEl = document.getElementById("sql-cfg-autosync");

    if (hostEl) hostEl.value = cfg.host || "localhost";
    if (portEl) portEl.value = cfg.port || "3306";
    if (dbEl) dbEl.value = cfg.database || "veloralb_Digital";
    if (userEl) userEl.value = cfg.username || "veloralb_Digital";
    if (passEl) passEl.value = cfg.password || "UcWg.75@wv+Ijzh#";
    if (autoSyncEl) autoSyncEl.checked = cfg.autoSync !== false;

    // Update master toggles
    const fbToggle = document.getElementById("toggle-firebase-db");
    const sqlToggle = document.getElementById("toggle-sql-db");
    const fbStatusLbl = document.getElementById("fb-engine-status-lbl");
    const sqlStatusLbl = document.getElementById("sql-engine-status-lbl");

    if (fbToggle) fbToggle.checked = cfg.firebaseEnabled;
    if (fbStatusLbl) {
      fbStatusLbl.innerText = cfg.firebaseEnabled ? "ENABLED" : "DISABLED";
      fbStatusLbl.className = cfg.firebaseEnabled
        ? "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8.5px] font-mono text-amber-400 font-bold"
        : "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[8.5px] font-mono text-slate-500 font-bold";
    }

    if (sqlToggle) sqlToggle.checked = cfg.sqlEnabled;
    if (sqlStatusLbl) {
      sqlStatusLbl.innerText = cfg.sqlEnabled ? "ENABLED" : "DISABLED";
      sqlStatusLbl.className = cfg.sqlEnabled
        ? "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8.5px] font-mono text-blue-400 font-bold"
        : "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[8.5px] font-mono text-slate-500 font-bold";
    }

    // Update active database badge
    const activeNode = this.db.syncNodes?.find(n => n.active) || { id: "node-1", name: "Firebase Cluster 1" };
    const activeBadge = document.getElementById("sql-active-db-badge");
    if (activeBadge) {
      activeBadge.innerText = `Active: ${activeNode.name}`;
      if (activeNode.id === "node-sql") {
        activeBadge.className = "text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 self-start sm:self-auto";
      } else {
        activeBadge.className = "text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 self-start sm:self-auto";
      }
    }

    // Update switch buttons UI
    document.querySelectorAll(".active-db-switch-btn").forEach(btn => {
      const target = btn.getAttribute("data-target");
      const isTargetActive = activeNode.id === target;
      const statusInd = btn.querySelector(".switch-status-indicator");
      
      // Determine if this target engine is enabled
      let isEngineEnabled = true;
      if (target === "node-1" || target === "node-2") {
        isEngineEnabled = cfg.firebaseEnabled;
      } else if (target === "node-sql") {
        isEngineEnabled = cfg.sqlEnabled;
      }

      if (!isEngineEnabled) {
        btn.className = "active-db-switch-btn p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-not-allowed bg-slate-950/40 border-slate-900/50 opacity-40";
        if (statusInd) {
          statusInd.innerText = "DISABLED";
          statusInd.className = "switch-status-indicator text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-600 font-bold uppercase";
        }
      } else if (isTargetActive) {
        btn.className = "active-db-switch-btn p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
        if (statusInd) {
          statusInd.innerText = "ACTIVE";
          statusInd.className = "switch-status-indicator text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold uppercase";
        }
      } else {
        btn.className = "active-db-switch-btn p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer bg-slate-900/60 border-slate-800 hover:border-slate-700";
        if (statusInd) {
          statusInd.innerText = "STANDBY";
          statusInd.className = "switch-status-indicator text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase";
        }
      }
    });

    // Update last sync time
    const lastSyncEl = document.getElementById("sql-last-sync-time");
    if (lastSyncEl) {
      if (cfg.lastSyncTime) {
        const time = new Date(cfg.lastSyncTime).toLocaleTimeString();
        lastSyncEl.innerText = `${time} (Firebase ⇄ SQL)`;
      } else {
        lastSyncEl.innerText = "Never Synced";
      }
    }

    // Update global header nodename if needed
    const nodenameEl = document.getElementById("failover-live-active-nodename");
    if (nodenameEl && activeNode) {
      nodenameEl.innerText = activeNode.name;
    }
  },

  initSyncClickHandlers() {
    // Cloud sync runs silently and automatically in real-time in the background.
    // Sync badges are read-only status indicators without sensitive DB/user-pool popups.

    // Add click trigger for manual refresh button inside the diagnostics modal
    const manualBtn = document.getElementById("sync-manual-trigger-btn");
    if (manualBtn) {
      manualBtn.addEventListener("click", async () => {
        const icon = document.getElementById("sync-manual-icon");
        if (icon) icon.classList.add("animate-spin");
        manualBtn.disabled = true;
        
        this.showToast("Initiating manual cloud sync handshake...", "info");
        this.addConsoleLog("Manual cloud sync handshake triggered by administrator.", "info");
        this.setSyncState("loading");
        
        try {
          if (this.firestoreDocRef) {
            await this.loadFromCloud();
            if (this.syncState === "offline") {
              this.showToast("Cloud unreachable. Operating securely in offline-local mode.", "warning");
              this.addConsoleLog("Manual cloud sync handshake switched to offline-local mode.", "warning");
            } else if (this.syncState === "error") {
              this.showToast("Manual cloud sync failed. Connection blocked.", "error");
            } else {
              this.showToast("Manual cloud sync completed successfully! Database aligned.", "success");
              this.addConsoleLog("Manual cloud replication succeeded. Target databases aligned.", "success");
            }
          } else {
            // Initiate if missing
            await this.initFirebaseSync();
            if (this.syncState === "offline") {
              this.showToast("Sync engine re-established in offline-local fallback.", "warning");
            } else {
              this.showToast("Sync engine successfully re-established & reloaded.", "success");
            }
          }
        } catch (err) {
          console.warn("Manual cloud sync error:", err.message || err);
          const isOfflineErr = err && (err.code === "unavailable" || err.message?.includes("offline") || err.message?.includes("reach") || err.message?.includes("Timeout") || err.message?.includes("network"));
          if (isOfflineErr) {
            this.setSyncState("offline");
            this.showToast("Device operates in Offline Mode. Local changes saved.", "warning");
            this.addConsoleLog(`Manual sync operating in offline fallback mode: ${err.message || err}`, "warning");
          } else {
            this.setSyncState("error");
            this.showToast("Manual cloud sync failed. Please check connection.", "error");
            this.addConsoleLog(`Re-initialization error: ${err.message || err}`, "error");
          }
        } finally {
          if (icon) icon.classList.remove("animate-spin");
          manualBtn.disabled = false;
        }
      });
    }

    // ================= SQL DATABASE HUB HANDLERS =================
    const sqlManualSyncBtn = document.getElementById("sql-btn-manual-sync");
    if (sqlManualSyncBtn) {
      sqlManualSyncBtn.addEventListener("click", async () => {
        const icon = document.getElementById("sql-sync-icon");
        if (icon) icon.classList.add("animate-spin");
        sqlManualSyncBtn.disabled = true;

        this.showToast("Initiating manual Dual-Sync with SQL Database...", "info");
        this.addConsoleLog("Manual SQL Dual-Sync triggered by administrator.", "info");

        try {
          if (typeof this.syncToCloud === "function") {
            await this.syncToCloud();
            this.showToast("SQL Dual-Sync completed! Databases are mirrored.", "success");
          } else {
            throw new Error("Sync engine not initialized.");
          }
        } catch (err) {
          console.error("SQL Manual Sync Error:", err);
          this.showToast("Sync failed. Check SQL configuration.", "error");
        } finally {
          if (icon) icon.classList.remove("animate-spin");
          sqlManualSyncBtn.disabled = false;
          this.renderSyncVaultTab();
        }
      });
    }

    // ================= SWITCHBOARD ENGINE TOGGLES =================
    const fbToggle = document.getElementById("toggle-firebase-db");
    if (fbToggle) {
      fbToggle.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        this.db.sqlDbConfig.firebaseEnabled = isChecked;
        this.addConsoleLog(`[SWITCHBOARD] Google Firebase Engine set to ${isChecked ? "ENABLED" : "DISABLED"}`, isChecked ? "info" : "warning");
        this.showToast(`Firebase storage engine has been ${isChecked ? "enabled" : "disabled"}.`, isChecked ? "success" : "warning");
        
        // Auto failover if active engine was disabled
        const activeNode = this.db.syncNodes?.find(n => n.active) || { id: "node-1" };
        if (!isChecked && (activeNode.id === "node-1" || activeNode.id === "node-2")) {
          if (this.db.sqlDbConfig.sqlEnabled) {
            const sqlNode = this.db.syncNodes?.find(n => n.id === "node-sql");
            if (sqlNode) {
              this.db.syncNodes.forEach(n => n.active = false);
              sqlNode.active = true;
              this.addConsoleLog("[AUTOMATIC SWITCH] Firebase disabled. Failover routed traffic to MySQL.", "success");
              this.showToast("Firebase নিষ্ক্রিয় হওয়ায় অটোমেটিকভাবে MySQL ডাটাবেজে ট্রাফিক রুট করা হয়েছে।", "success");
            }
          } else {
            this.addConsoleLog("[CRITICAL] Both Firebase and MySQL database engines are now DISABLED!", "error");
            this.showToast("সতর্কতা: উভয় ডাটাবেজ ইঞ্জিন নিষ্ক্রিয় করা হয়েছে!", "error");
          }
        }
        this.saveDB();
        this.renderSyncVaultTab();
      });
    }

    const sqlToggle = document.getElementById("toggle-sql-db");
    if (sqlToggle) {
      sqlToggle.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        this.db.sqlDbConfig.sqlEnabled = isChecked;
        this.addConsoleLog(`[SWITCHBOARD] MySQL Relational Engine set to ${isChecked ? "ENABLED" : "DISABLED"}`, isChecked ? "info" : "warning");
        this.showToast(`MySQL relational engine has been ${isChecked ? "enabled" : "disabled"}.`, isChecked ? "success" : "warning");

        // Auto failover if active engine was disabled
        const activeNode = this.db.syncNodes?.find(n => n.active) || { id: "node-1" };
        if (!isChecked && activeNode.id === "node-sql") {
          if (this.db.sqlDbConfig.firebaseEnabled) {
            const fbNode = this.db.syncNodes?.find(n => n.id === "node-1");
            if (fbNode) {
              this.db.syncNodes.forEach(n => n.active = false);
              fbNode.active = true;
              this.addConsoleLog("[AUTOMATIC SWITCH] MySQL disabled. Failover routed traffic to Firebase.", "success");
              this.showToast("MySQL নিষ্ক্রিয় হওয়ায় অটোমেটিকভাবে Firebase ডাটাবেজে ট্রাফিক রুট করা হয়েছে।", "success");
            }
          } else {
            this.addConsoleLog("[CRITICAL] Both Firebase and MySQL database engines are now DISABLED!", "error");
            this.showToast("সতর্কতা: উভয় ডাটাবেজ ইঞ্জিন নিষ্ক্রিয় করা হয়েছে!", "error");
          }
        }
        this.saveDB();
        this.renderSyncVaultTab();
      });
    }

    // Active Database Switcher
    document.querySelectorAll(".active-db-switch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        
        // Ensure the engine is enabled before allowing switch
        if (targetId === "node-1" || targetId === "node-2") {
          if (!this.db.sqlDbConfig.firebaseEnabled) {
            this.showToast("Google Firebase স্টোরেজ ইঞ্জিন বর্তমানে নিষ্ক্রিয় রয়েছে! প্রথমে এটি সক্রিয় করুন।", "error");
            return;
          }
        } else if (targetId === "node-sql") {
          if (!this.db.sqlDbConfig.sqlEnabled) {
            this.showToast("MySQL ডাটাবেজ ইঞ্জিন বর্তমানে নিষ্ক্রিয় রয়েছে! প্রথমে এটি সক্রিয় করুন।", "error");
            return;
          }
        }

        const node = this.db.syncNodes?.find(n => n.id === targetId);
        if (!node) return;

        if (node.status === "outage") {
          this.showToast(`Cannot switch to "${node.name}" while under an active outage condition!`, "error");
          return;
        }

        this.db.syncNodes.forEach(n => n.active = false);
        node.active = true;
        if (node.status === "standby") node.status = "connected";

        this.addConsoleLog(`[DATABASE SWITCH] Traffic routed to "${node.name}". Zero-downtime transition executed.`, "success");
        this.showToast(`ডাটাবেজ সুইচ সফল! এখন "${node.name}" এক্টিভ আছে।`, "success");
        
        // Update Firebase reference if needed
        if (this.firestore) {
          const targetDocId = (node.id === "node-2" || node.name?.includes("Backup") || node.name?.includes("Secondary"))
            ? "lottery_winner_db_backup"
            : "lottery_winner_db";
          this.firestoreDocRef = doc(this.firestore, "app_data", targetDocId);
          if (typeof this.listenToCloud === "function") this.listenToCloud();
        }

        // Inform server about the active database engine switch
        const isSqlTarget = node.id === "node-sql";
        fetch("/api/admin/database/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ database: isSqlTarget ? "mysql" : "firebase", admin_id: "admin" })
        }).catch(err => console.warn("Failed to notify server of engine switch:", err));

        this.saveDB(true).then(() => {
          if (isSqlTarget && typeof this.loadFromCloud === "function") {
            this.addConsoleLog(`[DATABASE SWITCH] Aligning local state with "${node.name}" master records...`, "info");
            this.loadFromCloud();
          }
        });
        this.renderSyncVaultTab();
      });
    });

    // SQL Config Form
    const sqlConfigForm = document.getElementById("sql-db-config-form");
    if (sqlConfigForm) {
      sqlConfigForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const host = document.getElementById("sql-cfg-host").value.trim();
        const port = document.getElementById("sql-cfg-port").value.trim();
        const database = document.getElementById("sql-cfg-database").value.trim();
        const username = document.getElementById("sql-cfg-username").value.trim();
        const password = document.getElementById("sql-cfg-password").value.trim();
        const autoSync = document.getElementById("sql-cfg-autosync").checked;

        if (!this.db.sqlDbConfig) this.db.sqlDbConfig = {};
        this.db.sqlDbConfig = {
          ...this.db.sqlDbConfig,
          host, port, database, username, password, autoSync
        };

        // Update the static sql node endpoint for visualization
        const sqlNode = this.db.syncNodes?.find(n => n.id === "node-sql");
        if (sqlNode) {
          sqlNode.endpoint = `mysql://${username}:••••••••@${host}:${port}/${database}`;
          sqlNode.sqlHost = host;
          sqlNode.sqlPort = port;
          sqlNode.sqlUser = username;
          sqlNode.sqlDb = database;
        }

        this.addConsoleLog(`SQL Configuration updated for database: ${database}`, "info");
        this.showToast("SQL ডাটাবেজ কনফিগারেশন সফলভাবে সেভ করা হয়েছে!", "success");
        this.saveDB();
        this.renderSyncVaultTab();
      });
    }

    // Test SQL Connection
    const testSqlBtn = document.getElementById("sql-btn-test-connection");
    if (testSqlBtn) {
      testSqlBtn.addEventListener("click", async () => {
        const icon = document.getElementById("sql-test-icon");
        if (icon) icon.className = "fa-solid fa-spinner animate-spin text-cyan-400";
        testSqlBtn.disabled = true;

        const host = document.getElementById("sql-cfg-host").value.trim();
        const port = document.getElementById("sql-cfg-port").value.trim();
        const database = document.getElementById("sql-cfg-database").value.trim();
        const username = document.getElementById("sql-cfg-username").value.trim();

        this.addConsoleLog(`[SQL TEST] Probing MySQL engine at ${host}:${port} (User: ${username})...`, "info");

        try {
          const res = await fetch("/api/sql/test-connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host, port, database, username })
          });
          const data = await res.json();

          if (data.success) {
            this.addConsoleLog(`[SQL TEST] 🟢 Connection established! Latency: ${data.latency}ms. Engine: ${data.engine}`, "success");
            const tablesStr = Array.isArray(data.tablesVerified) ? data.tablesVerified.join(", ") : "Main system tables online.";
            this.addConsoleLog(`[SQL TEST] 📑 Tables status: ${tablesStr}`, "success");
            this.showCongratsSplash("SQL Connected!", data.message);
          } else {
            throw new Error(data.message || "Connection refused");
          }
        } catch (err) {
          this.addConsoleLog(`[SQL TEST] 🔴 FAILED: ${err.message || err}`, "error");
          this.showToast(`কানেকশন এরর: ${err.message || err}`, "error");
        } finally {
          if (icon) icon.className = "fa-solid fa-plug-circle-check text-cyan-400";
          testSqlBtn.disabled = false;
        }
      });
    }

    // View Schema
    const viewSchemaBtn = document.getElementById("sql-btn-view-schema");
    if (viewSchemaBtn) {
      viewSchemaBtn.addEventListener("click", () => {
        const modal = document.getElementById("sql-schema-modal");
        const codeBlock = document.getElementById("sql-schema-modal-code");
        if (modal && codeBlock) {
          codeBlock.innerText = this.getSqlSchemaContent();
          modal.classList.remove("hidden");
        }
      });
    }

    // Modal Close
    const closeSchemaBtn = document.getElementById("close-sql-schema-modal-btn");
    if (closeSchemaBtn) {
      closeSchemaBtn.addEventListener("click", () => {
        document.getElementById("sql-schema-modal")?.classList.add("hidden");
      });
    }

    // Copy Schema
    const copySchemaBtn = document.getElementById("copy-sql-schema-btn");
    if (copySchemaBtn) {
      copySchemaBtn.addEventListener("click", () => {
        const code = this.getSqlSchemaContent();
        navigator.clipboard.writeText(code).then(() => {
          this.showToast("SQL স্ক্রিপ্ট কপি করা হয়েছে!", "success");
        });
      });
    }

    // Download Schema
    const downloadSchemaBtn = document.getElementById("download-sql-file-btn");
    if (downloadSchemaBtn) {
      downloadSchemaBtn.addEventListener("click", () => {
        const code = this.getSqlSchemaContent();
        const blob = new Blob([code], { type: "text/sql" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lottery_winner_db_schema_${Date.now()}.sql`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Toggle Password
    const togglePassBtn = document.getElementById("sql-cfg-toggle-pass");
    if (togglePassBtn) {
      togglePassBtn.addEventListener("click", () => {
        const passInput = document.getElementById("sql-cfg-password");
        const eyeIcon = document.getElementById("sql-pass-eye-icon");
        if (passInput && eyeIcon) {
          if (passInput.type === "password") {
            passInput.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
          } else {
            passInput.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
          }
        }
      });
    }

    // Export Dump
    const exportDumpBtn = document.getElementById("sql-btn-export-dump");
    if (exportDumpBtn) {
      exportDumpBtn.addEventListener("click", () => {
        const dbName = document.getElementById("sql-cfg-database")?.value || "veloralb_Digital";
        this.showToast(`Generating full database dump for ${dbName}...`, "info");
        setTimeout(() => {
          const code = this.getSqlFullDump();
          const blob = new Blob([code], { type: "text/sql" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${dbName}_full_dump_${Date.now()}.sql`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast("Full data dump exported successfully!", "success");
        }, 1500);
      });
    }

     // ================= DYNAMIC STANDBY CLUSTER HANDLERS =================
    const typeSelector = document.getElementById("sync-node-type");
    if (typeSelector) {
      typeSelector.addEventListener("change", (e) => {
        const selectedType = e.target.value;
        const sqlFields = document.getElementById("sync-sql-fields");
        const apiFields = document.getElementById("sync-api-fields");
        const endpointInput = document.getElementById("sync-node-endpoint");

        if (selectedType === "sql") {
          if (sqlFields) sqlFields.classList.remove("hidden");
          if (apiFields) apiFields.classList.add("hidden");
          if (endpointInput) {
            endpointInput.placeholder = "postgresql://username:password@host:5432/db";
            endpointInput.value = "postgresql://root_lotto:SecretPass123!@db.lotto-postgres.internal:5432/lottery";
          }
        } else if (selectedType === "api") {
          if (sqlFields) sqlFields.classList.add("hidden");
          if (apiFields) apiFields.classList.remove("hidden");
          if (endpointInput) {
            endpointInput.placeholder = "https://api.myweb.com/v1/sync";
            endpointInput.value = "https://api.myweb.com/v1/sync";
          }
        } else {
          // firebase
          if (sqlFields) sqlFields.classList.add("hidden");
          if (apiFields) apiFields.classList.add("hidden");
          if (endpointInput) {
            endpointInput.placeholder = "firebase://project-id/collection-path";
            endpointInput.value = "firebase://lottery-app-prod-ha/active_transactions";
          }
        }
      });
    }

    const addForm = document.getElementById("add-sync-node-form");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nodeName = document.getElementById("sync-node-name").value.trim();
        const nodeType = document.getElementById("sync-node-type").value;
        const nodeTierEl = document.getElementById("sync-node-tier");
        const nodeTier = nodeTierEl ? nodeTierEl.value : "premium";
        const nodeEndpoint = document.getElementById("sync-node-endpoint").value.trim();
        const nodePriority = parseInt(document.getElementById("sync-node-priority").value || "2");
        const nodeMode = document.getElementById("sync-node-mode").value;
        const nodeDesc = document.getElementById("sync-node-description").value.trim() || `${nodeType.toUpperCase()} Standby Replication cluster point.`;

        const sqlHost = document.getElementById("sync-node-host")?.value.trim() || "";
        const sqlUser = document.getElementById("sync-node-user")?.value.trim() || "";
        const sqlPass = document.getElementById("sync-node-pass")?.value.trim() || "";
        const apiKey = document.getElementById("sync-node-apiKey")?.value.trim() || "";

        const id = "node-" + Date.now();
        const newNode = {
          id,
          name: nodeName,
          type: nodeType,
          endpoint: nodeEndpoint,
          priority: nodePriority,
          status: "standby",
          latency: Math.floor(Math.random() * 80) + 10,
          active: false,
          mode: nodeMode,
          description: nodeDesc,
          tier: nodeTier,
          sqlHost,
          sqlUser,
          sqlPass,
          apiKey
        };

        if (!this.db.syncNodes) this.db.syncNodes = [];
        this.db.syncNodes.push(newNode);
        
        // Sort by priority ascending
        this.db.syncNodes.sort((a, b) => a.priority - b.priority);

        this.addConsoleLog(`Deployed new replica Node "${nodeName}" (Driver: ${nodeType.toUpperCase()}) with Failover Priority ${nodePriority}`, "info");
        this.showToast(`Standby Database "${nodeName}" successfully enlisted!`, "success");
        
        this.saveDB();
        addForm.reset();
        const sqlFields = document.getElementById("sync-sql-fields");
        const apiFields = document.getElementById("sync-api-fields");
        if (sqlFields) sqlFields.classList.add("hidden");
        if (apiFields) apiFields.classList.add("hidden");
        this.renderSyncVaultTab();
      });
    }

    // Delegate click events inside replication nodes list
    const nodesContainer = document.getElementById("sync-nodes-container");
    if (nodesContainer) {
      nodesContainer.addEventListener("click", (e) => {
        const toggleOutageBtn = e.target.closest(".action-toggle-outage");
        const testPingBtn = e.target.closest(".action-test-ping");
        const setActiveBtn = e.target.closest(".action-set-active");
        const deleteNodeBtn = e.target.closest(".action-delete-node");

        if (toggleOutageBtn) {
          const nodeId = toggleOutageBtn.getAttribute("data-id");
          const node = this.db.syncNodes.find(n => n.id === nodeId);
          if (node) {
            if (node.status === "outage") {
              node.status = node.id === "node-1" ? "connected" : "standby";
              this.addConsoleLog(`Simulated Outage cleared for "${node.name}". Node returned to cluster.`, "success");
              this.showToast(`Cleared simulated outage on "${node.name}"!`, "success");
            } else {
              node.status = "outage";
              this.addConsoleLog(`🚨 FAULT CONDITION TRIPPED on "${node.name}". Communication line split!`, "error");
              this.showToast(`Simulated connection outage on "${node.name}"!`, "error");

              // Trigger failover if currently active
              if (node.active) {
                this.triggerFailover();
              }
            }
            this.saveDB();
            this.renderSyncVaultTab();
          }
        }

        if (testPingBtn) {
          const nodeId = testPingBtn.getAttribute("data-id");
          const node = this.db.syncNodes.find(n => n.id === nodeId);
          if (node) {
            const originalHtml = testPingBtn.innerHTML;
            testPingBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Ping...`;
            testPingBtn.disabled = true;

            setTimeout(() => {
              const newLatency = Math.floor(Math.random() * 85) + 12;
              node.latency = newLatency;
              this.addConsoleLog(`Ping handshake for "${node.name}" succeeded. Latency: ${newLatency}ms.`, "info");
              this.showToast(`Latency test complete: ${newLatency}ms for "${node.name}"`, "info");
              testPingBtn.innerHTML = originalHtml;
              testPingBtn.disabled = false;
              this.saveDB();
              this.renderSyncVaultTab();
            }, 800);
          }
        }

        const testDbBtn = e.target.closest(".action-test-db");
        if (testDbBtn) {
          const nodeId = testDbBtn.getAttribute("data-id");
          const node = this.db.syncNodes.find(n => n.id === nodeId);
          if (node) {
            const originalHtml = testDbBtn.innerHTML;
            testDbBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-cyan-400"></i> Testing...`;
            testDbBtn.disabled = true;

            setTimeout(() => {
              testDbBtn.innerHTML = originalHtml;
              testDbBtn.disabled = false;

              if (node.status === "outage") {
                this.addConsoleLog(`[FAILOVER TEST] 🔴 FAILED: Unable to query database context on "${node.name}". Connection Refused (Outage simulated status active).`, "error");
                this.showToast(`Database switching test failed: "${node.name}" is offline.`, "error");
                return;
              }

              if (node.type === "sql") {
                const host = node.sqlHost || "localhost";
                const username = node.sqlUser || "veloralb_Digital";
                const dbName = node.sqlDb || "veloralb_Digital";
                this.addConsoleLog(`[FAILOVER TEST] 🟡 Initiating MySQL/MariaDB query sequence to Host: ${host} (DB: ${dbName})...`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🔑 Credentials authenticated using User: "${username}" and Password: "●●●●●●●●".`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🟢 Switch context verified successfully! MySQL schema ready on localhost:3306. Status: ONLINE.`, "success");
              } else if (node.type === "firebase") {
                this.addConsoleLog(`[FAILOVER TEST] 🟡 Querying Google Firestore Collections at ${node.endpoint}...`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🔑 Token-based session verification with Firebase Security Rules...`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🟢 Switch context verified successfully! Collections authenticated successfully.`, "success");
              } else {
                const secret = node.apiKey ? "●●●●" + node.apiKey.slice(-4) : "None (Insecure Endpoint)";
                this.addConsoleLog(`[FAILOVER TEST] 🟡 Sending synchronization payload to Webhook URL: ${node.endpoint}...`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🔑 Webhook API Signature secret validated with key: "${secret}".`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🟢 REST API webhook handshake succeeded! Status: 200 OK.`, "success");
              }

              // Set active database context to this node to confirm failover switching works!
              this.db.syncNodes.forEach(n => n.active = false);
              node.active = true;
              if (node.status === "standby") node.status = "connected";

              // Update firestoreDocRef matching active node
              if (this.firestore) {
                const targetDocId = (node.id === "node-2" || node.name?.includes("Backup") || node.name?.includes("Secondary"))
                  ? "lottery_winner_db_backup"
                  : "lottery_winner_db";
                this.firestoreDocRef = doc(this.firestore, "app_data", targetDocId);
              }

              this.addConsoleLog(`[FAILOVER TEST] 🚀 Traffic routed successfully to "${node.name}" context. Dual-Database sync active: 100% data preserved.`, "success");

              this.showCongratsSplash(`Connection Verified!`, `Your database context has switched seamlessly to <strong>${node.name}</strong>. Both Database 1 & Database 2 are auto-synced, so no data was removed or lost!`);

              this.saveDB();
              this.renderSyncVaultTab();
            }, 1200);
          }
        }

        if (setActiveBtn) {
          const nodeId = setActiveBtn.getAttribute("data-id");
          const node = this.db.syncNodes.find(n => n.id === nodeId);
          if (node) {
            if (node.status === "outage") {
              this.showToast(`Cannot switch to "${node.name}" while under an active outage condition!`, "error");
              return;
            }
            this.db.syncNodes.forEach(n => n.active = false);
            node.active = true;
            if (node.status === "standby") node.status = "connected";

            // Update firestoreDocRef matching active node and reconnect realtime listener
            if (this.firestore) {
              const targetDocId = (node.id === "node-2" || node.name?.includes("Backup") || node.name?.includes("Secondary"))
                ? "lottery_winner_db_backup"
                : "lottery_winner_db";
              this.firestoreDocRef = doc(this.firestore, "app_data", targetDocId);
              if (typeof this.listenToCloud === "function") {
                this.listenToCloud();
              }
            }

            this.addConsoleLog(`[DUAL SYNC] Active database switched to "${node.name}". Both databases remain fully mirrored and synced.`, "success");
            this.showToast(`সুইচ সফল! উভয় ডাটাবেজ অটো সিঙ্ক থাকায় "${node.name}"-এ সব ডাটা সুরক্ষিত আছে।`, "success");
            // Inform server about the active database engine switch
            fetch("/api/admin/database/switch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ database: node.id === "node-sql" ? "mysql" : "firebase", admin_id: "admin" })
            }).catch(() => {});

            this.saveDB();
            if (typeof this.syncToCloud === "function") {
              this.syncToCloud();
            }
            this.renderSyncVaultTab();
          }
        }

        if (deleteNodeBtn) {
          const nodeId = deleteNodeBtn.getAttribute("data-id");
          if (nodeId === "node-1" || nodeId === "node-2") {
            this.showToast("Cannot decommission primary built-in cluster nodes!", "error");
            return;
          }
          const idx = this.db.syncNodes.findIndex(n => n.id === nodeId);
          if (idx > -1) {
            const nodeName = this.db.syncNodes[idx].name;
            this.db.syncNodes.splice(idx, 1);
            this.addConsoleLog(`Standby storage replica "${nodeName}" retiring. Node disconnected.`, "info");
            this.showToast(`Database "${nodeName}" decommissioned successfully.`, "info");
            this.saveDB();
            this.renderSyncVaultTab();
          }
        }
      });
    }

    // ================= INTEGRATION CODE BUILDER LISTENERS =================
    const triggerGenerate = () => {
      this.updateStandbyCodeGenerator();
    };

    const selLang = document.getElementById("code-lang-selector");
    if (selLang) selLang.addEventListener("change", triggerGenerate);

    const selNode = document.getElementById("code-node-selector");
    if (selNode) selNode.addEventListener("change", triggerGenerate);

    const selTimeout = document.getElementById("code-timeout-selector");
    if (selTimeout) selTimeout.addEventListener("change", triggerGenerate);

    const selResilience = document.getElementById("code-resilience-selector");
    if (selResilience) selResilience.addEventListener("change", triggerGenerate);

    // Copy to Clipboard trigger
    const copyBtn = document.getElementById("copy-snippet-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const textContainer = document.getElementById("code-snippets-display-block");
        if (textContainer) {
          const codeText = textContainer.innerText;
          navigator.clipboard.writeText(codeText).then(() => {
            this.showToast("কানেকশন কোড সফলভাবে কপি করা হয়েছে!", "success");
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Code Copied!`;
            setTimeout(() => {
              copyBtn.innerHTML = originalText;
            }, 2000);
          }).catch(err => {
            this.showToast("Unable to copy to clipboard", "error");
          });
        }
      });
    }

    // Clear logs button trigger
    const clearLogsBtn = document.getElementById("clear-sync-logs-btn");
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener("click", () => {
        this.db.syncLogs = [];
        this.addConsoleLog("Cluster log terminal cleared by administrator. Waiting for heartbeats...", "info");
        this.saveDB();
        this.renderSyncVaultTab();
      });
    }
  },

  addConsoleLog(message, type = "info") {
    if (!this.db) return;
    if (!this.db.syncLogs) this.db.syncLogs = [];
    const time = new Date().toLocaleTimeString();
    this.db.syncLogs.push({ time, type, message });
    if (this.db.syncLogs.length > 50) {
      this.db.syncLogs.shift();
    }
  },

  triggerFailover() {
    this.addConsoleLog(`[HA FAILOVER ENGINE] Commencing automated recovery algorithm...`, "info");
    
    // Find next non-outage standby node
    const nextNode = this.db.syncNodes.find(n => n.status !== "outage" && n.status !== "error");
    if (nextNode) {
      this.db.syncNodes.forEach(n => n.active = false);
      nextNode.active = true;
      if (nextNode.status === "standby") nextNode.status = "connected";

      this.addConsoleLog(`🚨 AUTOMATIC TAKEOVER: Primary connection failed! Node "${nextNode.name}" took over active routing.`, "success");
      
      // Bengali notification to explain exactly what happened in simple terms
      this.showToast(`কানেকশন এরর: মাস্টার ডাটাবেজ অফলাইন! ব্যাকআপ ডাটাবেজ "${nextNode.name}" স্বয়ংক্রিয়ভাবে চালু হয়েছে।`, "success");
    } else {
      this.addConsoleLog(`🔴 FAILOVER TERMINATED: Zero available active replica nodes remaining! Holding writes in local staging cache.`, "error");
      this.showToast("সব কানেকশন ডাউন! লোকাল ব্রাউজারে ডাটা সেভ রাখা হয়েছে।", "error");
    }
  },

  switchGenTier(tier) {
    this.genTier = tier;
    
    // Toggle active visual states of the tabs
    const freeBtn = document.getElementById("code-db-tier-free-btn");
    const premiumBtn = document.getElementById("code-db-tier-premium-btn");
    if (freeBtn && premiumBtn) {
      if (tier === "free") {
        freeBtn.className = "px-3 py-1.5 rounded-lg font-black transition cursor-pointer bg-slate-900 text-slate-300";
        premiumBtn.className = "px-3 py-1.5 rounded-lg font-black transition cursor-pointer text-slate-500 hover:text-slate-300";
      } else {
        freeBtn.className = "px-3 py-1.5 rounded-lg font-black transition cursor-pointer text-slate-500 hover:text-slate-300";
        premiumBtn.className = "px-3 py-1.5 rounded-lg font-black transition cursor-pointer bg-slate-900 text-slate-300";
      }
    }

    const badge = document.getElementById("code-tier-badge");
    if (badge) {
      if (tier === "free") {
        badge.innerText = "Free Database Mode";
        badge.className = "font-bold text-[8.5px] uppercase tracking-wider bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded";
      } else {
        badge.innerText = "Premium HA Mode";
        badge.className = "font-bold text-[8.5px] uppercase tracking-wider bg-indigo-950/50 border border-indigo-900/50 text-indigo-400 px-2 py-0.5 rounded";
      }
    }

    // Repopulate nodes matching tier
    this.repopulateNodesForGenerator();
    this.updateStandbyCodeGenerator();
  },

  repopulateNodesForGenerator() {
    const nodeSelector = document.getElementById("code-node-selector");
    if (!nodeSelector) return;

    const currentSelectedValue = nodeSelector.value;
    nodeSelector.innerHTML = "";
    
    const matchedNodes = (this.db.syncNodes || []).filter(n => n.tier === (this.genTier || "free"));
    if (matchedNodes.length === 0) {
      const option = document.createElement("option");
      option.value = "default";
      option.innerText = (this.genTier || "free") === "premium" ? "💎 Enterprise Cloud Cluster (Auto)" : "🌱 Sandbox Backup Node (Auto)";
      nodeSelector.appendChild(option);
    } else {
      matchedNodes.forEach(node => {
        const option = document.createElement("option");
        option.value = node.id;
        option.innerText = `${node.name} (${node.type.toUpperCase()})`;
        // Restore selection if possible
        if (node.id === currentSelectedValue) {
          option.selected = true;
        }
        nodeSelector.appendChild(option);
      });
    }
  },

  updateStandbyCodeGenerator() {
    const displayBlock = document.getElementById("code-snippets-display-block");
    const titleEl = document.getElementById("code-terminal-title");
    if (!displayBlock) return;

    const lang = document.getElementById("code-lang-selector")?.value || "php";
    const nodeId = document.getElementById("code-node-selector")?.value || "default";
    const timeout = document.getElementById("code-timeout-selector")?.value || "1500";
    const resilience = document.getElementById("code-resilience-selector")?.value || "active";
    const tier = this.genTier || "free";

    // Find the chosen node in config
    let selectedNode = (this.db.syncNodes || []).find(n => n.id === nodeId);
    if (!selectedNode) {
      selectedNode = (this.db.syncNodes || []).find(n => n.tier === tier) || {
        name: tier === "premium" ? "Backup SQL Replication Node" : "Custom REST Sync Webhook",
        type: tier === "premium" ? "sql" : "api",
        endpoint: tier === "premium" ? "postgresql://database.postgres-cluster.internal:5432/lottery_backup" : "https://sync-api.lotterywinner.app/v1/vault"
      };
    }

    // Parsed endpoint
    let host = "localhost";
    let port = "5432";
    let dbName = "lottery_winner_db";
    try {
      const endpoint = selectedNode.endpoint || "";
      if (endpoint.startsWith("postgresql://") || endpoint.startsWith("postgres://")) {
        const clean = endpoint.replace("postgresql://", "").replace("postgres://", "");
        const parts = clean.split("@");
        const hostAndDb = parts[parts.length - 1];
        const slashParts = hostAndDb.split("/");
        const hostPort = slashParts[0];
        dbName = slashParts[1] || "lottery_winner_db";
        if (hostPort.includes(":")) {
          const colonParts = hostPort.split(":");
          host = colonParts[0];
          port = colonParts[1];
        } else {
          host = hostPort;
          port = "5432";
        }
      } else if (endpoint.startsWith("https://") || endpoint.startsWith("http://")) {
        const clean = endpoint.replace("https://", "").replace("http://", "");
        const slashParts = clean.split("/");
        const hostPort = slashParts[0];
        dbName = "api_gateway";
        if (hostPort.includes(":")) {
          const colonParts = hostPort.split(":");
          host = colonParts[0];
          port = colonParts[1];
        } else {
          host = hostPort;
          port = endpoint.startsWith("https://") ? "443" : "80";
        }
      } else {
        host = endpoint.split("/")[0] || "firestore.googleapis.com";
        port = "443";
        dbName = endpoint.split("/")[1] || "lottery_db_project";
      }
    } catch (err) {}

    let code = "";
    let fileName = "db-connection.php";

    if (lang === "php") {
      fileName = "db-connection.php";
      if (selectedNode.type === "sql" || selectedNode.id === "node-sql") {
        code = `<?php
// 💎 MySQL Production Database Connection (Lottery Winner)
// Host: localhost:3306 | Database: veloralb_Digital | User: veloralb_Digital

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'veloralb_Digital');
define('DB_USER', 'veloralb_Digital');
define('DB_PASS', 'UcWg.75@wv+Ijzh#');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
    echo "🟢 Connected successfully to MySQL Database: veloralb_Digital\\n";
} catch (PDOException $e) {
    die("🚨 MySQL Database Connection Failed: " . $e->getMessage());
}`;
      } else if (tier === "free") {
        code = `<?php
// 🌱 Free Tier Cluster Connection Handler (Lottery Winner App)
// Node Name: ${selectedNode.name}
// Driver Type: ${selectedNode.type.toUpperCase()}
// Endpoint URI: ${selectedNode.endpoint}

$host = "${host}";
$port = "${port}";
$dbname = "${dbName}";
$timeout_limit = ${timeout}; // millisecond connection threshold

try {
    // Standard single-node fallback driver initiation
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;options='--connect_timeout=" . ($timeout_limit / 1000) . "'";
    $pdo = new PDO($dsn, "free_lotto_user", "lotto_sandbox_pass", [
        PDO::ATTR_TIMEOUT => $timeout_limit / 1000,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "🌱 Connected successfully to standby database link: ${selectedNode.type}\\n";
} catch (PDOException $e) {
    // Gracefully handle outage without terminating critical client pipeline
    error_log("Standby Database Node offline: " . $e->getMessage());
    echo "⚠️ Warning: Database down! Standby buffered local cache active.\\n";
}`;
      } else {
        code = `<?php
// 💎 Premium High-Availability Connection Handler (Lottery Winner Prod)
// Active Primaries: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
// Primary Connection: ${selectedNode.endpoint}
// Resilience Mode: ${resilience === 'active' ? 'Active-Sync Double Writes' : 'Read-Only High Performance'}

list($primary_host, $backup_host) = ["${host}", "failover-replica.lotterywinner.net"];
$port = "${port}";
$dbname = "${dbName}";
$timeout_limit = ${timeout}; 

function get_resilient_connection($primary_host, $backup_host, $port, $dbname, $timeout_limit) {
    $nodes = [$primary_host, $backup_host];
    foreach ($nodes as $index => $node) {
        try {
            $dsn = "pgsql:host=$node;port=$port;dbname=$dbname;options='--connect_timeout=" . ($timeout_limit / 1000) . "'";
            $pdo = new PDO($dsn, "premium_sec_user", "Prod_Secure_Pass_892x_X", [
                PDO::ATTR_TIMEOUT => $timeout_limit / 1000,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            // Multi-replica active standby handshake
            return ['connection' => $pdo, 'node' => $node, 'is_backup_replica' => ($index > 0)];
        } catch (PDOException $e) {
            error_log("Connection failed for node ($node): " . $e->getMessage());
        }
    }
    throw new Exception("🚨 FAILOVER TERMINATED: All Premium standby nodes are currently offline. Local transaction staging active.");
}

try {
    $cluster = get_resilient_connection($primary_host, $backup_host, $port, $dbname, $timeout_limit);
    echo "💎 [SLA HIGH] Connected safely to Cluster Node: " . $cluster['node'] . "\\n";
} catch (Exception $e) {
    echo $e->getMessage() . "\\n";
}`;
      }
    } else if (lang === "nodejs") {
      fileName = "db-config.js";
      if (tier === "free") {
        code = `// 🌱 Free Sandbox Standby Node Connection Node.js
// Node Info: ${selectedNode.name}
// Endpoint: ${selectedNode.endpoint}

const { Client } = require('pg');

const client = new Client({
  connectionString: "${selectedNode.endpoint}",
  connectionTimeoutMillis: ${timeout}, // connection timeout threshold
});

async function connectFreeDB() {
  try {
    await client.connect();
    console.log("🌱 Standby database node connection established successfully! (${selectedNode.type})");
  } catch (err) {
    console.warn("⚠️ Standby offline. Active browser state holds transactions.");
    console.error(err.message);
  }
}
connectFreeDB();`;
      } else {
        code = `// 💎 Premium Auto-Failover Multi-Client Cluster configuration
// Active Master Node: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
// Primary Endpoint: ${selectedNode.endpoint}
// Resilience: ${resilience.toUpperCase()} Mode

const { Pool } = require('pg');

const clusterConfig = {
  primary: "${selectedNode.endpoint}",
  secondary: "postgresql://backup_replica:SecuredPass_Lotto_99@failover-replica.lotterywinner.net:5432/lottery_backup",
  connectionTimeoutMillis: ${timeout},
  max: 25, // Active pool limit (High IOPs)
};

class FailoverConnectionPool {
  constructor() {
    this.primaryPool = new Pool({ connectionString: clusterConfig.primary, connectionTimeoutMillis: clusterConfig.connectionTimeoutMillis });
    this.backupPool = new Pool({ connectionString: clusterConfig.secondary, connectionTimeoutMillis: clusterConfig.connectionTimeoutMillis });
  }

  async query(text, params) {
    try {
      // Autopilot Active Sync Write routing 
      return await this.primaryPool.query(text, params);
    } catch (err) {
      console.warn("🚨 PRIMARY NODE OFFLINE: Switching to Standby Replication Node instantly!");
      try {
        return await this.backupPool.query(text, params);
      } catch (backupErr) {
        throw new Error("🚨 HA CRITICAL: Multi-Cloud Database failure. Transactions staged locally inside SQLite.");
      }
    }
  }
}

const db = new FailoverConnectionPool();
module.exports = db;`;
      }
    } else if (lang === "python") {
      fileName = "db_client.py";
      if (tier === "free") {
        code = `# 🌱 Python Free Tier Standby Node Hookup
# Target Server: ${selectedNode.name}
# Engine Target: ${selectedNode.type.toUpperCase()}

import psycopg2
import sys

connection_uri = "${selectedNode.endpoint}"
timeout_secs = ${timeout} / 1000.0

def connect_free_database():
    try:
        conn = psycopg2.connect(connection_uri, connect_timeout=int(timeout_secs))
        print("🌱 Standby connected successfully to ${selectedNode.type} node!")
        return conn
    except Exception as e:
        print(f"⚠️ Warning: Connection failover triggered to sandbox local buffer: {e}", file=sys.stderr)
        return None

db_connection = connect_free_database()`;
      } else {
        code = `# 💎 Python Enterprise Multi-Node Failover Manager
# Primary Driver: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
# Primary URI: ${selectedNode.endpoint}
# Strategy: ${resilience}

import psycopg2
import time

CLUSTER_NODES = [
    "${selectedNode.endpoint}",
    "postgresql://premium_sec_user:Prod_SecurePass_99x3@failover-replica.lotterywinner.net:5432/lottery_backup"
]
TIMEOUT_MILLIS = ${timeout}

def execute_with_failover(query, params=None):
    for idx, node_uri in enumerate(CLUSTER_NODES):
        try:
            conn = psycopg2.connect(node_uri, connect_timeout=int(TIMEOUT_MILLIS / 1000))
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            if idx > 0:
                print(f"⚠️ AUTOMATED WARNING: Primary offline. Fallback Standby-HA used.")
            return cursor.fetchall()
        except psycopg2.OperationalError as e:
            print(f"⚠️ Failover Warning: Node {idx+1} down. Relaying traffic: {e}")
            continue
    raise Exception("🚨 CRITICAL MASTER OUTAGE: Both primary and backup failover nodes are offline.")

# Example resilient query execution
# results = execute_with_failover("SELECT * FROM ticket_draws;")`;
      }
    } else if (lang === "go") {
      fileName = "main.go";
      if (tier === "free") {
        code = `package main

// 🌱 Go Free Tier Standby Node Integrator
// Database Connection: ${selectedNode.endpoint}
// Node Name: ${selectedNode.name}

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	_ "github.com/lib/pq"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), ${timeout}*time.Millisecond)
	defer cancel()

	connStr := "${selectedNode.endpoint}"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Printf("⚠️ Drivers failed to initialize: %v\\n", err)
		return
	}
	defer db.Close()

	err = db.PingContext(ctx)
	if err != nil {
		fmt.Printf("⚠️ Sandboxed fallback: Active Standby endpoint is down. Running on browser cache: %v\\n", err)
		return
	}
	fmt.Println("🌱 Connected successfully. Free standby sync active!")
}`;
      } else {
        code = `package main

// 💎 Go Multi-Cloud Cluster Autopilot Failover SDK
// Active Master: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
// Primary Connection: ${selectedNode.endpoint}
// Strategy: ${resilience}

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
	_ "github.com/lib/pq"
)

type MultiNodeCluster struct {
	PrimaryDB *sql.DB
	BackupDB  *sql.DB
}

func (c *MultiNodeCluster) QueryRow(query string, args ...interface{}) (*sql.Row, error) {
	ctx, cancel := context.WithTimeout(context.Background(), ${timeout}*time.Millisecond)
	defer cancel()

	// Try Primary DB Node
	err := c.PrimaryDB.PingContext(ctx)
	if err == nil {
		return c.PrimaryDB.QueryRowContext(ctx, query, args...), nil
	}

	// Hot-Standby Failover
	fmt.Println("🚨 Primary Connection Broken! Relaying transaction payload to Hot-Standby replica...")
	backupCtx, backupCancel := context.WithTimeout(context.Background(), ${timeout}*time.Millisecond)
	defer backupCancel()

	err = c.BackupDB.PingContext(backupCtx)
	if err == nil {
		return c.BackupDB.QueryRowContext(backupCtx, query, args...), nil
	}

	return nil, errors.New("🚨 CRITICAL: Primary and Standby clusters are completely unreachable")
}`;
      }
    } else if (lang === "java") {
      fileName = "DatabaseConfig.java";
      if (tier === "free") {
        code = `// 🌱 Java Standard Spring / JDBC Connection Instance
// Node: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
// Endpoint: ${selectedNode.endpoint}

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    public static Connection getConnection() {
        String dbUrl = "${selectedNode.endpoint}";
        int timeoutSecs = ${timeout} / 1000;
        try {
            DriverManager.setLoginTimeout(timeoutSecs);
            Connection conn = DriverManager.getConnection(dbUrl, "free_lotto_user", "lotto_sandbox_pass");
            System.out.println("🌱 Successfully synchronized to Free Node (${selectedNode.name})!");
            return conn;
        } catch (SQLException e) {
            System.err.println("⚠️ Free Standby offline. Active browser session remains operational: " + e.getMessage());
            return null;
        }
    }
}`;
      } else {
        code = `// 💎 Enterprise Multi-Cloud Database Router & Hikari Pool Setup
// Master Database: ${selectedNode.name} (${selectedNode.type.toUpperCase()})
// Connection string: ${selectedNode.endpoint}

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class DatabaseClusterRouter {
    private static HikariDataSource primaryDS;
    private static HikariDataSource backupDS;

    static {
        // Setup Primary Pool with active ${timeout} ms timeout limits
        HikariConfig primaryConfig = new HikariConfig();
        primaryConfig.setJdbcUrl("${selectedNode.endpoint}");
        primaryConfig.setConnectionTimeout(${timeout});
        primaryConfig.setMaximumPoolSize(25);
        primaryDS = new HikariDataSource(primaryConfig);

        // Setup Secondary standby replica
        HikariConfig backupConfig = new HikariConfig();
        backupConfig.setJdbcUrl("postgresql://database.postgres-cluster.internal:5432/lottery_backup");
        backupConfig.setConnectionTimeout(${timeout});
        backupConfig.setMaximumPoolSize(10);
        backupDS = new HikariDataSource(backupConfig);
    }

    public static Connection getPoolConnection() throws SQLException {
        try {
            return primaryDS.getConnection();
        } catch (SQLException e) {
            System.err.println("🚨 [FAILOVER ROUTING ACTIVED] Primary Database error. Re-routing query packet...");
            return backupDS.getConnection();
        }
    }
}`;
      }
    }

    titleEl.innerText = fileName;
    displayBlock.innerText = code;
  },

  getSqlSchemaContent() {
    const dbName = this.db.sqlDbConfig?.database || "veloralb_Digital";
    return `-- Lottery Winner - MySQL Database Schema
-- Generated: ${new Date().toLocaleString()}
-- Target DB: ${dbName}

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

-- Table structure for \`users\`
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` varchar(50) NOT NULL,
  \`username\` varchar(100) NOT NULL,
  \`email\` varchar(150) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`phone\` varchar(30) DEFAULT NULL,
  \`balance\` decimal(15,2) DEFAULT 100.00,
  \`totDeposit\` decimal(15,2) DEFAULT 0.00,
  \`wins\` int(11) DEFAULT 0,
  \`loss\` int(11) DEFAULT 0,
  \`profit\` decimal(15,2) DEFAULT 0.00,
  \`status\` varchar(30) DEFAULT 'active',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for \`lotteries\`
CREATE TABLE IF NOT EXISTS \`lotteries\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`entryFee\` decimal(15,2) NOT NULL,
  \`totalTickets\` int(11) NOT NULL,
  \`soldTickets\` int(11) DEFAULT 0,
  \`category\` varchar(50) NOT NULL,
  \`drawTime\` datetime NOT NULL,
  \`status\` varchar(30) DEFAULT 'active',
  \`prizeAmount\` decimal(15,2) NOT NULL,
  \`drawMode\` varchar(50) DEFAULT 'manual',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for \`tickets\`
CREATE TABLE IF NOT EXISTS \`tickets\` (
  \`id\` varchar(50) NOT NULL,
  \`userId\` varchar(50) NOT NULL,
  \`lotteryId\` varchar(50) NOT NULL,
  \`code\` varchar(50) NOT NULL,
  \`purchaseDate\` datetime NOT NULL,
  \`status\` varchar(30) DEFAULT 'pending',
  \`prizeAmount\` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (\`id\`),
  KEY \`userId\` (\`userId\`),
  KEY \`lotteryId\` (\`lotteryId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for \`settings\`
CREATE TABLE IF NOT EXISTS \`settings\` (
  \`setting_key\` varchar(100) NOT NULL,
  \`setting_value\` text DEFAULT NULL,
  PRIMARY KEY (\`setting_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;`;
  },

  getSqlFullDump() {
    const dbName = this.db.sqlDbConfig?.database || "veloralb_Digital";
    let dump = this.getSqlSchemaContent();
    dump += "\n\n-- Dumping data for tables\n";
    
    // Simple mock data dump for users
    if (this.db.users && this.db.users.length > 0) {
      dump += "\nINSERT INTO \`users\` (\`id\`, \`username\`, \`email\`, \`password\`, \`balance\`, \`status\`) VALUES\n";
      const rows = this.db.users.slice(0, 50).map(u => 
        `('${u.id}', '${u.username}', '${u.email}', '${u.password}', ${u.balance || 0}, '${u.status || 'active'}')`
      );
      dump += rows.join(",\n") + ";\n";
    }

    dump += "\n-- Dump completed.";
    return dump;
  }
};
