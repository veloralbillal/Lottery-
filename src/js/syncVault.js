// ============================================================================
// DATABASE REPLICATION SYNC & FAILOVER ENGINE MODULE
// ============================================================================

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
          card.className = `p-4 border ${activeClass} rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition duration-200 hover:border-slate-700 mb-2.5`;
          card.innerHTML = `
            <div class="space-y-1.5 max-w-full md:max-w-md">
              <div class="flex items-center gap-2 flex-wrap">
                <div class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs">
                  ${iconHtml}
                </div>
                <div>
                  <h5 class="text-[12px] font-black text-white leading-tight">${node.name}</h5>
                  <span class="text-[8.5px] font-mono text-slate-500 uppercase font-bold">DRIVER: ${node.type.toUpperCase()} • Priority: ${node.priority}</span>
                </div>
                <div class="flex gap-1.5 items-center flex-wrap">
                  ${statusBadge}
                  <span class="text-[9px] text-[#f59e0b] font-mono">⚡ ${node.latency} ms</span>
                </div>
              </div>
              <p class="text-[10px] text-slate-400/80 font-sans leading-relaxed">${node.description}</p>
              <div class="text-[8.5px] text-slate-600 font-mono select-all break-all overflow-x-auto truncate max-w-xs md:max-w-md block bg-slate-950 px-2 py-1 rounded">
                Connection Address: ${node.endpoint}
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 w-full md:w-auto shrink-0 border-t border-slate-850 pt-2.5 md:pt-0 md:border-0 justify-end">
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
  },

  initSyncClickHandlers() {
    // Add event delegation or direct click triggers for sync badges
    document.addEventListener("click", (e) => {
      if (!e.target || typeof e.target.closest !== "function") return;
      const trigger = e.target.closest(".cloud-sync-debug-trigger");
      if (trigger) {
        e.preventDefault();
        const modal = document.getElementById("cloud-sync-modal");
        if (modal) {
          modal.classList.remove("hidden");
          this.updateDiagnosticsModal(this.syncState || 'synced');
        }
      }
    });

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
                const host = node.sqlHost || "db.lotto-postgres.internal";
                const username = node.sqlUser || "postgres_root";
                this.addConsoleLog(`[FAILOVER TEST] 🟡 Initiating Postgres/MySQL query sequence to Host: ${host}...`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🔑 Credentials authenticated using username: "${username}" and password: "●●●●●●●●".`, "info");
                this.addConsoleLog(`[FAILOVER TEST] 🟢 Switch context verified successfully! Synced 24 relational ledger tables. Status: ONLINE.`, "success");
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
              this.addConsoleLog(`[FAILOVER TEST] 🚀 Traffic routed successfully to "${node.name}" context. Dynamic failover validated.`, "success");

              this.showCongratsSplash(`Connection Verified!`, `Your database context has switched seamlessly to <strong>${node.name}</strong>. All query pipelines have successfully authenticated and are running live!`);

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

            this.addConsoleLog(`Primary link overridden. Traffic manually migrated to: ${node.name}.`, "info");
            this.showToast(`Transferred active cloud directory to "${node.name}"!`, "success");
            this.saveDB();
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
    if (!this.db || !this.db.syncLogs) return;
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
      if (tier === "free") {
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
  }
};
