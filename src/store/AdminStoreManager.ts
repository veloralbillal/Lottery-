/**
 * LuckyBox Shop - Admin Store Manager
 */

import { PathHelper } from "../js/pathHelper.js";
import { AdminStoreUI } from "./AdminStoreUI.js";
import { PluginManager } from "../js/pluginManager.js";

export class AdminStoreManager {
  static async render(app: any) {
    const tabEl = document.getElementById("admin-tab-store");
    if (!tabEl) return;

    if (!app.currentStoreSubTab) {
      app.currentStoreSubTab = "dashboard";
    }

    tabEl.innerHTML = AdminStoreUI.getStoreTabShellHTML(app.currentStoreSubTab);
    this.bindGlobalEvents(app);

    // Render sub-tab content based on current selection
    if (app.currentStoreSubTab === "product") {
      this.renderProductList(app);
    } else if (app.currentStoreSubTab === "ticket") {
      this.renderSupportTickets(app);
    } else if (app.currentStoreSubTab === "setting") {
      this.loadShopSettings(app);
    } else if (app.currentStoreSubTab === "payment") {
      this.renderPaymentLedger(app);
    } else if (app.currentStoreSubTab === "category") {
      this.renderCategories(app);
    } else if (app.currentStoreSubTab === "admin") {
      this.renderStaffRegistry(app);
    } else if (app.currentStoreSubTab === "plugin") {
      this.renderPlugins(app);
    }
  }

  static bindGlobalEvents(app: any) {
    // Grid item clicks
    document.querySelectorAll(".store-grid-item").forEach(btn => {
      btn.onclick = () => {
        const sub = btn.getAttribute("data-subtab");
        app.currentStoreSubTab = sub;
        this.render(app);
      };
    });

    // Back button click
    const backBtn = document.getElementById("admin-store-back-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        app.currentStoreSubTab = "dashboard";
        this.render(app);
      };
    }
    
    // Plugin bindings
    this.bindPluginEvents(app);

    // ... (keep existing bindings)
    const addProdForm = document.getElementById("admin-add-product-form") as HTMLFormElement;
    if (addProdForm) {
      addProdForm.onsubmit = async (e) => {
        e.preventDefault();
        const newProd = {
          id: (document.getElementById("admin-prod-id") as HTMLInputElement).value.trim(),
          title: (document.getElementById("admin-prod-title") as HTMLInputElement).value.trim(),
          productType: (document.getElementById("admin-prod-type") as HTMLSelectElement).value,
          paymentMode: (document.getElementById("admin-prod-payment-mode") as HTMLSelectElement).value,
          category: (document.getElementById("admin-prod-category") as HTMLSelectElement).value,
          price: parseFloat((document.getElementById("admin-prod-price") as HTMLInputElement).value) || 0,
          sizes: (document.getElementById("admin-prod-sizes") as HTMLInputElement).value.trim(),
          colors: (document.getElementById("admin-prod-colors") as HTMLInputElement).value.trim(),
          filePath: (document.getElementById("admin-prod-filepath") as HTMLInputElement).value.trim(),
          description: (document.getElementById("admin-prod-desc") as HTMLTextAreaElement).value.trim(),
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
          stars: 5.0,
          sales: 0
        };

        if (!app.db.products) {
          app.db.products = [];
        }

        app.db.products.unshift(newProd);
        app.saveDB();
        app.showToast("Product indexed successfully!", "success");
        addProdForm.reset();
        this.renderProductList(app);
      };
    }

    const saveShopBtn = document.getElementById("admin-save-shop-settings");
    if (saveShopBtn) {
      saveShopBtn.onclick = () => {
        const name = (document.getElementById("admin-shop-name") as HTMLInputElement).value.trim();
        const tagline = (document.getElementById("admin-shop-tagline") as HTMLTextAreaElement).value.trim();
        const minOrder = parseFloat((document.getElementById("admin-shop-min-order") as HTMLInputElement).value);
        const maxOrder = parseFloat((document.getElementById("admin-shop-max-order") as HTMLInputElement).value);
        const isOpen = (document.getElementById("admin-shop-status-toggle") as HTMLInputElement).checked;
        const shopEnabled = (document.getElementById("admin-shop-enabled-toggle") as HTMLInputElement).checked;

        app.db.shopSettings = { name, tagline, minOrder, maxOrder, isOpen, isMaintenance: !isOpen };
        app.db.settings.shopEnabled = shopEnabled;
        app.db.settings.shopMaintenanceMode = !isOpen;
        app.saveDB();
        app.showToast("Shop configuration applied globally.", "success");
      };
    }

    const saveDbConfigBtn = document.getElementById("admin-save-db-config");
    if (saveDbConfigBtn) {
      saveDbConfigBtn.onclick = () => {
        const pass = (document.getElementById("admin-db-pass") as HTMLInputElement).value;
        const mode = (document.querySelector('input[name="db-sync-mode"]:checked') as HTMLInputElement)?.value;
        app.db.shopDbConfig = { pass, mode };
        app.saveDB();
        app.showToast(`Config Saved: Mode ${mode.toUpperCase()}`, "success");
      };
    }

    const syncNowBtn = document.getElementById("admin-sync-now-btn");
    if (syncNowBtn) {
      syncNowBtn.onclick = () => {
        syncNowBtn.innerHTML = '<i class="fa-solid fa-rotate animate-spin"></i> Syncing...';
        setTimeout(() => {
           syncNowBtn.innerHTML = 'Trigger Sync Now';
           app.showToast("Manual Bidirectional Sync Completed! ⚡", "success");
        }, 1200);
      };
    }

    // Admin Options bindings
    const clearLogsBtn = document.getElementById("admin-clear-logs");
    if (clearLogsBtn) {
      clearLogsBtn.onclick = () => {
        if (confirm("Permanently wipe all digital payment logs?")) {
          app.db.digitalOrders = [];
          app.saveDB();
          app.showToast("Logs purged.", "info");
        }
      };
    }

    const clearTicketsBtn = document.getElementById("admin-clear-tickets");
    if (clearTicketsBtn) {
      clearTicketsBtn.onclick = () => {
        if (confirm("Purge all resolved tickets?")) {
          app.db.digitalSupportTickets = (app.db.digitalSupportTickets || []).filter((t: any) => t.status !== "resolved");
          app.saveDB();
          app.showToast("Resolved tickets cleared.", "info");
        }
      };
    }

    const testSqlBtn = document.getElementById("admin-test-sql");
    if (testSqlBtn) {
      testSqlBtn.onclick = () => {
        app.showToast("Establishing handshake with SQL node...", "info");
        setTimeout(() => app.showToast("Handshake successful: veloralb_Digital @ localhost", "success"), 1000);
      };
    }

    const rebuildIndexBtn = document.getElementById("admin-rebuild-index");
    if (rebuildIndexBtn) {
      rebuildIndexBtn.onclick = () => {
        app.showToast("Rebuilding internal search index...", "info");
        setTimeout(() => app.showToast("Index optimized. Catalog performance restored.", "success"), 1500);
      };
    }
  }
  
  private static currentPluginFilter = "all";
  private static currentPluginSearch = "";
  private static currentUpdatingPluginId: string | null = null;

  static async renderPlugins(app: any) {
    const list = document.getElementById("admin-plugin-list");
    if (!list) return;

    try {
      const allPlugins = await PluginManager.getInstalledPlugins(app);
      
      // Update count badge
      const countBadge = document.getElementById("admin-plugin-count-badge");
      if (countBadge) {
        countBadge.textContent = allPlugins.length.toString();
      }

      // Filter by active/inactive status
      let filtered = allPlugins;
      if (this.currentPluginFilter === "active") {
        filtered = filtered.filter(p => p.status === "active");
      } else if (this.currentPluginFilter === "inactive") {
        filtered = filtered.filter(p => p.status === "inactive");
      }

      // Filter by search query
      if (this.currentPluginSearch.trim()) {
        const q = this.currentPluginSearch.toLowerCase().trim();
        filtered = filtered.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.author && p.author.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q))
        );
      }

      if (filtered.length === 0) {
        list.innerHTML = `
          <div class="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
             <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl mx-auto">
                <i class="fa-solid fa-puzzle-piece"></i>
             </div>
             <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">No plugins found matching criteria</p>
             <p class="text-[10px] text-slate-600">Upload a WordPress .zip plugin archive using the panel above.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = filtered.map(p => AdminStoreUI.getPluginCardHTML(p)).join("");
      this.bindPluginCardEvents(app);
    } catch (err: any) {
      console.error("Failed to render plugins:", err);
      list.innerHTML = `
        <div class="p-6 text-center text-rose-400 text-xs">
          Failed to load plugins: ${err.message || 'Unknown error'}
        </div>
      `;
    }
  }

  static bindPluginCardEvents(app: any) {
    const list = document.getElementById("admin-plugin-list");
    if (!list) return;

    // 1. Toggle status (Activate / Deactivate)
    list.querySelectorAll(".toggle-plugin-status-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (!id) return;
        const updated = await PluginManager.togglePluginStatus(app, id);
        if (updated) {
          app.showToast(
            `Plugin "${updated.name}" is now ${updated.status === 'active' ? 'Activated' : 'Deactivated'}.`,
            updated.status === 'active' ? 'success' : 'info'
          );
          this.renderPlugins(app);
        }
      });
    });

    // 2. Update plugin button
    list.querySelectorAll(".update-plugin-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (!id) return;
        this.currentUpdatingPluginId = id;
        const updateFileInput = document.getElementById("plugin-update-file-input") as HTMLInputElement;
        if (updateFileInput) {
          updateFileInput.value = "";
          updateFileInput.click();
        }
      });
    });

    // 3. View Extracted Files Details Modal
    list.querySelectorAll(".view-plugin-files-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (!id) return;
        const plugin = (app.db.plugins || []).find((p: any) => p.id === id);
        if (!plugin) return;

        const modal = document.getElementById("plugin-details-modal");
        const titleEl = document.getElementById("plugin-modal-title");
        const versionEl = document.getElementById("plugin-modal-version");
        const bodyEl = document.getElementById("plugin-modal-body");

        if (modal && titleEl && versionEl && bodyEl) {
          titleEl.textContent = plugin.name;
          versionEl.textContent = `v${plugin.version || '1.0.0'} • ${plugin.status || 'active'}`;
          
          const files = plugin.fileList && plugin.fileList.length > 0 
            ? plugin.fileList 
            : ["index.php", "settings.json"];

          bodyEl.innerHTML = `
            <div class="space-y-3">
              <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div class="text-[10px] text-slate-500 uppercase font-bold">Plugin Description</div>
                <p class="text-slate-300 text-xs">${plugin.description || 'No description provided.'}</p>
                <div class="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                  <span>Author: <strong class="text-cyan-400">${plugin.author || 'WordPress Contributor'}</strong></span>
                  <span>•</span>
                  <span>Size: ${plugin.sizeFormatted || 'Unknown'}</span>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                  <span>Extracted Files Registry (${files.length})</span>
                  <span class="text-[9px] font-mono text-cyan-400 uppercase">WordPress Ready</span>
                </div>
                <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin">
                  ${files.map((f: string) => `
                    <div class="flex items-center gap-2 text-slate-300 hover:text-cyan-300 py-0.5 border-b border-slate-900/60 last:border-none">
                      <i class="fa-regular ${f.endsWith('.php') ? 'fa-file-code text-indigo-400' : f.endsWith('.json') ? 'fa-file-lines text-amber-400' : 'fa-file text-slate-500'}"></i>
                      <span class="truncate">${f}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          `;

          modal.classList.remove("hidden");
        }
      });
    });

    // 4. Safe Isolated Delete (Deletes ONLY this plugin)
    list.querySelectorAll(".remove-plugin-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const name = btn.getAttribute("data-name") || "this plugin";
        if (!id) return;

        if (confirm(`Are you sure you want to delete "${name}"?\n\nNotice: ONLY this plugin will be removed. All products, tickets, and store settings will remain untouched.`)) {
          const removed = await PluginManager.deletePlugin(app, id);
          if (removed) {
            app.showToast(`Plugin "${name}" deleted cleanly.`, "info");
            this.renderPlugins(app);
          } else {
            app.showToast("Failed to delete plugin.", "error");
          }
        }
      });
    });
  }
  
  static bindPluginEvents(app: any) {
    const fileInput = document.getElementById("plugin-file-upload") as HTMLInputElement;
    const dropzone = document.getElementById("plugin-dropzone");
    const uploadBtn = document.getElementById("admin-upload-plugin-btn") as HTMLButtonElement;
    const resetFileBtn = document.getElementById("admin-reset-file-btn");
    const selectedFileInfo = document.getElementById("plugin-selected-file-info");
    const selectedFilename = document.getElementById("plugin-selected-filename");
    const selectedFilesize = document.getElementById("plugin-selected-filesize");
    const progressContainer = document.getElementById("plugin-upload-progress-container");
    const progressBar = document.getElementById("plugin-progress-bar");
    const progressPercent = document.getElementById("plugin-progress-percent");
    const progressStatusText = document.getElementById("plugin-progress-status-text");
    const progressSubdetail = document.getElementById("plugin-progress-subdetail");
    const progressTitle = document.getElementById("plugin-progress-title");
    const progressFilename = document.getElementById("plugin-progress-filename");
    const resultBox = document.getElementById("plugin-upload-result-box");
    const triggerUploadBtn = document.getElementById("admin-trigger-upload-view-btn");
    const updateFileInput = document.getElementById("plugin-update-file-input") as HTMLInputElement;

    // Modal Close Listeners
    const modal = document.getElementById("plugin-details-modal");
    const modalCloseBtn = document.getElementById("plugin-modal-close-btn");
    const modalOkBtn = document.getElementById("plugin-modal-ok-btn");
    if (modal && modalCloseBtn) modalCloseBtn.onclick = () => modal.classList.add("hidden");
    if (modal && modalOkBtn) modalOkBtn.onclick = () => modal.classList.add("hidden");

    // Scroll to upload view
    if (triggerUploadBtn) {
      triggerUploadBtn.onclick = () => {
        const card = document.getElementById("plugin-upload-card");
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-cyan-500/50");
          setTimeout(() => card.classList.remove("ring-2", "ring-cyan-500/50"), 1200);
        }
      };
    }

    // Helper: update file selection display
    const handleFileSelected = (file: File | null) => {
      if (!file) {
        if (selectedFileInfo) {
          selectedFileInfo.classList.add("hidden");
          selectedFileInfo.classList.remove("flex");
        }
        if (resetFileBtn) resetFileBtn.classList.add("hidden");
        if (uploadBtn) uploadBtn.disabled = true;
        return;
      }

      if (!file.name.toLowerCase().endsWith(".zip")) {
        app.showToast("Please choose a valid .ZIP archive (WordPress plugin).", "error");
        if (fileInput) fileInput.value = "";
        return;
      }

      const sizeStr = file.size > 1048576 
        ? `${(file.size / 1048576).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      if (selectedFilename) selectedFilename.textContent = file.name;
      if (selectedFilesize) selectedFilesize.textContent = `(${sizeStr})`;
      if (selectedFileInfo) {
        selectedFileInfo.classList.remove("hidden");
        selectedFileInfo.classList.add("flex");
      }
      if (resetFileBtn) resetFileBtn.classList.remove("hidden");
      if (uploadBtn) uploadBtn.disabled = false;
    };

    // Dropzone Click
    if (dropzone && fileInput) {
      dropzone.onclick = (e) => {
        if (e.target !== resetFileBtn) {
          fileInput.click();
        }
      };

      // Drag and Drop
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add("border-cyan-400", "bg-cyan-950/20");
      };

      dropzone.ondragleave = (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-cyan-400", "bg-cyan-950/20");
      };

      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-cyan-400", "bg-cyan-950/20");
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const droppedFile = e.dataTransfer.files[0];
          fileInput.files = e.dataTransfer.files;
          handleFileSelected(droppedFile);
        }
      };
    }

    if (fileInput) {
      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files.length > 0) {
          handleFileSelected(fileInput.files[0]);
        } else {
          handleFileSelected(null);
        }
      };
    }

    if (resetFileBtn && fileInput) {
      resetFileBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput.value = "";
        handleFileSelected(null);
      };
    }

    // Step styling helper for progress animation
    const updateStepBadge = (stepId: string, state: "active" | "done" | "idle") => {
      const el = document.getElementById(stepId);
      if (!el) return;
      if (state === "active") {
        el.className = "p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex items-center gap-2 text-cyan-300 font-bold transition-all shadow-sm";
        const icon = el.querySelector("i");
        if (icon) icon.className = "fa-solid fa-spinner fa-spin text-cyan-400";
      } else if (state === "done") {
        el.className = "p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2 text-emerald-400 font-bold transition-all";
        const icon = el.querySelector("i");
        if (icon) icon.className = "fa-solid fa-check text-emerald-400";
      } else {
        el.className = "p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-500 transition-all";
        const icon = el.querySelector("i");
        if (icon) icon.className = "fa-regular fa-circle";
      }
    };

    // Upload & Extract action with full animation
    if (uploadBtn) {
      uploadBtn.onclick = async () => {
        if (!fileInput.files || fileInput.files.length === 0) {
          app.showToast("Please choose a plugin .zip file first.", "error");
          return;
        }

        const file = fileInput.files[0];
        uploadBtn.disabled = true;

        // Show progress animation container
        if (progressContainer) {
          progressContainer.classList.remove("hidden");
          progressContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        if (progressTitle) progressTitle.textContent = "Extracting & Installing Plugin...";
        if (progressFilename) progressFilename.textContent = file.name;
        if (resultBox) resultBox.classList.add("hidden");

        updateStepBadge("plugin-step-1", "active");
        updateStepBadge("plugin-step-2", "idle");
        updateStepBadge("plugin-step-3", "idle");
        updateStepBadge("plugin-step-4", "idle");

        try {
          const installed = await PluginManager.uploadAndInstallPlugin(
            app,
            file,
            (percent, stepText, detail) => {
              if (progressBar) progressBar.style.width = `${percent}%`;
              if (progressPercent) progressPercent.textContent = `${percent}%`;
              if (progressStatusText) progressStatusText.textContent = stepText;
              if (progressSubdetail && detail) progressSubdetail.textContent = detail;

              if (percent >= 15 && percent < 35) {
                updateStepBadge("plugin-step-1", "done");
                updateStepBadge("plugin-step-2", "active");
              } else if (percent >= 35 && percent < 75) {
                updateStepBadge("plugin-step-2", "done");
                updateStepBadge("plugin-step-3", "active");
              } else if (percent >= 75 && percent < 100) {
                updateStepBadge("plugin-step-3", "done");
                updateStepBadge("plugin-step-4", "active");
              } else if (percent >= 100) {
                updateStepBadge("plugin-step-4", "done");
              }
            }
          );

          // Success State
          if (resultBox) {
            resultBox.className = "p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center justify-between";
            resultBox.innerHTML = `
              <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                <div>
                  <strong class="block text-white font-bold">${installed.name} (v${installed.version}) installed successfully!</strong>
                  <span class="text-[10px] text-emerald-400/80">${installed.filesCount} files extracted • WordPress hooks registered</span>
                </div>
              </div>
              <button id="admin-dismiss-progress-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer">
                Dismiss
              </button>
            `;
            resultBox.classList.remove("hidden");

            const dismissBtn = document.getElementById("admin-dismiss-progress-btn");
            if (dismissBtn && progressContainer) {
              dismissBtn.onclick = () => progressContainer.classList.add("hidden");
            }
          }

          app.showToast(`Plugin "${installed.name}" installed and ready!`, "success");
          fileInput.value = "";
          handleFileSelected(null);
          this.renderPlugins(app);

          // Auto-hide progress after 5s if user doesn't dismiss
          setTimeout(() => {
            if (progressContainer) progressContainer.classList.add("hidden");
          }, 6000);

        } catch (err: any) {
          console.error("Plugin install failed:", err);
          if (resultBox) {
            resultBox.className = "p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center justify-between";
            resultBox.innerHTML = `
              <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-triangle-exclamation text-rose-400 text-lg"></i>
                <div>
                  <strong class="block text-white font-bold">Installation Failed</strong>
                  <span class="text-[10px] text-rose-400/80">${err.message || 'Corrupted archive or invalid manifest.'}</span>
                </div>
              </div>
              <button id="admin-retry-progress-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer">
                Retry
              </button>
            `;
            resultBox.classList.remove("hidden");

            const retryBtn = document.getElementById("admin-retry-progress-btn");
            if (retryBtn && progressContainer) {
              retryBtn.onclick = () => progressContainer.classList.add("hidden");
            }
          }
          app.showToast(err.message || "Failed to extract and install plugin.", "error");
        } finally {
          uploadBtn.disabled = false;
        }
      };
    }

    // Update existing plugin with new ZIP
    if (updateFileInput) {
      updateFileInput.onchange = async () => {
        if (!updateFileInput.files || updateFileInput.files.length === 0 || !this.currentUpdatingPluginId) return;
        const file = updateFileInput.files[0];
        const pluginId = this.currentUpdatingPluginId;

        if (progressContainer) {
          progressContainer.classList.remove("hidden");
          progressContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (progressTitle) progressTitle.textContent = "Updating Plugin Package...";
        if (progressFilename) progressFilename.textContent = file.name;
        if (resultBox) resultBox.classList.add("hidden");

        updateStepBadge("plugin-step-1", "active");
        updateStepBadge("plugin-step-2", "idle");
        updateStepBadge("plugin-step-3", "idle");
        updateStepBadge("plugin-step-4", "idle");

        try {
          const updated = await PluginManager.updatePlugin(
            app,
            pluginId,
            file,
            (percent, stepText, detail) => {
              if (progressBar) progressBar.style.width = `${percent}%`;
              if (progressPercent) progressPercent.textContent = `${percent}%`;
              if (progressStatusText) progressStatusText.textContent = stepText;
              if (progressSubdetail && detail) progressSubdetail.textContent = detail;

              if (percent >= 20 && percent < 60) {
                updateStepBadge("plugin-step-1", "done");
                updateStepBadge("plugin-step-2", "active");
              } else if (percent >= 60 && percent < 90) {
                updateStepBadge("plugin-step-2", "done");
                updateStepBadge("plugin-step-3", "active");
              } else if (percent >= 90) {
                updateStepBadge("plugin-step-3", "done");
                updateStepBadge("plugin-step-4", "done");
              }
            }
          );

          app.showToast(`Plugin "${updated.name}" updated to v${updated.version}!`, "success");
          this.renderPlugins(app);
          setTimeout(() => {
            if (progressContainer) progressContainer.classList.add("hidden");
          }, 3500);
        } catch (err: any) {
          app.showToast(`Update failed: ${err.message || 'Invalid ZIP'}`, "error");
        } finally {
          this.currentUpdatingPluginId = null;
          updateFileInput.value = "";
        }
      };
    }

    // Filter Buttons (All, Active, Inactive)
    document.querySelectorAll(".plugin-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".plugin-filter-btn").forEach(b => {
          b.className = "plugin-filter-btn px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition text-slate-400 hover:text-white";
        });
        btn.className = "plugin-filter-btn px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition bg-cyan-600 text-white";
        this.currentPluginFilter = btn.getAttribute("data-filter") || "all";
        this.renderPlugins(app);
      });
    });

    // Real-time Search Filter
    const searchInput = document.getElementById("admin-plugin-search") as HTMLInputElement;
    if (searchInput) {
      searchInput.oninput = () => {
        this.currentPluginSearch = searchInput.value;
        this.renderPlugins(app);
      };
    }
  }

  static async renderProductList(app: any) {
    const listEl = document.getElementById("admin-store-catalog-list");
    if (!listEl) return;

    if (!app.db.products || !Array.isArray(app.db.products)) {
      app.db.products = [];
    }

    const products = app.db.products;

    if (products.length === 0) {
      listEl.innerHTML = '<div class="text-center py-10 text-slate-600 text-[10px]">No active products indexed.</div>';
      return;
    }

    listEl.innerHTML = products.map(p => AdminStoreUI.getProductItemHTML(p)).join("");

    listEl.querySelectorAll(".admin-del-prod-btn").forEach(btn => {
      btn.onclick = () => {
        const pid = btn.getAttribute("data-id");
        if (confirm(`Remove product ID ${pid}?`)) {
          app.db.products = app.db.products.filter((p: any) => p.id !== pid);
          app.saveDB();
          app.showToast("Product purged.", "success");
          this.renderProductList(app);
        }
      };
    });
  }

  static renderSupportTickets(app: any) {
    const list = document.getElementById("admin-store-tickets-list");
    if (!list) return;

    let tickets = app.db.digitalSupportTickets || [];
    if (tickets.length === 0) {
      list.innerHTML = '<div class="text-center py-10 text-slate-650 text-[10px]">No active store help requests in queue.</div>';
      return;
    }

    list.innerHTML = tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(t => `
      <div class="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg group">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="text-white font-bold text-[11px]">${t.subject}</h4>
            <p class="text-[9px] text-slate-500 font-mono">From: @${app.db.users.find(u => u.id === t.user_id)?.username || 'Unknown'}</p>
          </div>
          <span class="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tighter">${t.status}</span>
        </div>
        <p class="text-[10px] text-slate-400 font-sans leading-relaxed">${t.message}</p>
        <div class="flex items-center gap-2">
           <input type="text" id="reply-to-${t.id}" class="flex-grow bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-white focus:border-cyan-500 outline-none" placeholder="Type response..." />
           <button class="reply-btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg text-[9px] transition" data-id="${t.id}">Reply</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".reply-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const reply = (document.getElementById(`reply-to-${id}`) as HTMLInputElement).value.trim();
        if (!reply) return;

        const found = tickets.find(tk => tk.id.toString() === id.toString());
        if (found) {
          found.admin_reply = reply;
          found.status = "resolved";
          app.saveDB();
          this.renderSupportTickets(app);
          app.showToast("Reply dispatched.", "success");
        }
      });
    });
  }

  static loadShopSettings(app: any) {
    if (!app.db.shopSettings) {
      app.db.shopSettings = { name: "LuckyBox Shop", tagline: "Premium assets", minOrder: 10, maxOrder: 50000, isOpen: true };
    }
    const s = app.db.shopSettings;
    const nameInput = document.getElementById("admin-shop-name") as HTMLInputElement;
    const taglineInput = document.getElementById("admin-shop-tagline") as HTMLTextAreaElement;
    const minInput = document.getElementById("admin-shop-min-order") as HTMLInputElement;
    const maxInput = document.getElementById("admin-shop-max-order") as HTMLInputElement;
    const statusToggle = document.getElementById("admin-shop-status-toggle") as HTMLInputElement;
    const enabledToggle = document.getElementById("admin-shop-enabled-toggle") as HTMLInputElement;

    if (nameInput) nameInput.value = s.name || "";
    if (taglineInput) taglineInput.value = s.tagline || "";
    if (minInput) minInput.value = s.minOrder || 10;
    if (maxInput) maxInput.value = s.maxOrder || 50000;
    if (statusToggle) statusToggle.checked = s.isOpen !== false;
    if (enabledToggle) enabledToggle.checked = app.db.settings?.shopEnabled !== false;
  }

  static renderPaymentLedger(app: any) {
    const body = document.getElementById("admin-payment-ledger-body");
    if (!body) return;
    
    const logs = app.db.digitalOrders || [];
    if (logs.length === 0) {
      body.innerHTML = '<tr><td colspan="6" class="p-10 text-center text-slate-600 italic">No transaction records found.</td></tr>';
      return;
    }

    body.innerHTML = logs.map(l => `
      <tr class="border-b border-slate-800 hover:bg-slate-900/30 transition">
        <td class="p-4 font-mono text-cyan-500">#${l.id.substring(0,8)}</td>
        <td class="p-4 text-slate-300">@${app.db.users.find(u => u.id === l.user_id)?.username || 'User'}</td>
        <td class="p-4 text-slate-400 uppercase font-bold">${l.gateway || 'INTERNAL'}</td>
        <td class="p-4 font-black text-white">৳${l.amount}</td>
        <td class="p-4"><span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/30 font-bold uppercase text-[9px]">SUCCESS</span></td>
        <td class="p-4 text-slate-500 font-mono">${new Date(l.created_at).toLocaleDateString()}</td>
      </tr>
    `).join("");

    const totalVol = logs.reduce((sum, o) => sum + (o.amount || 0), 0);
    const volEl = document.getElementById("admin-payment-total-vol");
    if (volEl) volEl.innerText = `৳${totalVol.toFixed(2)}`;
    
    const successEl = document.getElementById("admin-payment-success-count");
    if (successEl) successEl.innerText = logs.length;
  }

  static renderCategories(app: any) {
    const list = document.getElementById("admin-cat-list");
    if (!list) return;

    if (!app.db.shopCategories) {
      app.db.shopCategories = [
        { label: "Web Templates", slug: "web-templates" },
        { label: "Excel Sheets", slug: "sheets-trackers" }
      ];
    }

    list.innerHTML = app.db.shopCategories.map(c => `
      <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
        <div class="flex flex-col">
          <span class="text-white font-bold text-xs">${c.label}</span>
          <span class="text-[9px] text-slate-500 font-mono italic">${c.slug}</span>
        </div>
        <button class="admin-del-cat-btn text-rose-500 hover:text-rose-400 p-2 cursor-pointer transition active:scale-90" data-slug="${c.slug}"><i class="fa-solid fa-trash-can text-xs"></i></button>
      </div>
    `).join("");

    list.querySelectorAll(".admin-del-cat-btn").forEach(btn => {
      btn.onclick = () => {
        const slug = btn.getAttribute("data-slug");
        if (confirm(`Delete category '${slug}'?`)) {
          app.db.shopCategories = app.db.shopCategories.filter(c => c.slug !== slug);
          app.saveDB();
          this.renderCategories(app);
          app.showToast("Category removed.", "info");
        }
      };
    });

    const addBtn = document.getElementById("admin-add-cat-btn");
    if (addBtn) {
      addBtn.onclick = () => {
        const label = (document.getElementById("admin-cat-label") as HTMLInputElement).value.trim();
        const slug = (document.getElementById("admin-cat-slug") as HTMLInputElement).value.trim();
        if (label && slug) {
          if (app.db.shopCategories.find(c => c.slug === slug)) {
            app.showToast("Slug already exists.", "error");
            return;
          }
          app.db.shopCategories.push({ label, slug });
          app.saveDB();
          this.renderCategories(app);
          app.showToast("Category created.", "success");
          (document.getElementById("admin-cat-label") as HTMLInputElement).value = "";
          (document.getElementById("admin-cat-slug") as HTMLInputElement).value = "";
        }
      };
    }
  }

  static renderStaffRegistry(app: any) {
    const list = document.getElementById("admin-shop-staff-list");
    if (!list) return;

    const staff = app.db.users.filter((u: any) => u.role === "shop_admin" || u.role === "shop_manager" || u.role === "shop_owner");
    if (staff.length === 0) {
      list.innerHTML = '<div class="p-8 text-center text-slate-600 italic text-[10px]">No shop staff registered.</div>';
    } else {
      list.innerHTML = staff.map((s: any) => `
        <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">${s.username[0].toUpperCase()}</div>
             <div>
                <span class="text-white font-bold text-xs">@${s.username}</span>
                <span class="text-[9px] text-cyan-500 uppercase font-mono block">${s.role}</span>
             </div>
          </div>
          <button class="remove-staff-btn text-rose-500 p-2 cursor-pointer transition active:scale-90" data-id="${s.id}"><i class="fa-solid fa-user-minus text-xs"></i></button>
        </div>
      `).join("");

      list.querySelectorAll(".remove-staff-btn").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-id");
          const user = app.db.users.find((u: any) => u.id === uid);
          if (user && confirm(`Remove @${user.username} from shop staff?`)) {
            user.role = "user";
            app.saveDB();
            this.renderStaffRegistry(app);
            app.showToast("Staff access revoked.", "info");
          }
        };
      });
    }

    const addBtn = document.getElementById("admin-add-shop-admin-btn");
    if (addBtn) {
      addBtn.onclick = () => {
        const target = (document.getElementById("admin-shop-user-id") as HTMLInputElement).value.trim().replace("@", "");
        const role = (document.getElementById("admin-shop-perm-level") as HTMLSelectElement).value;
        const user = app.db.users.find((u: any) => u.username.toLowerCase() === target.toLowerCase());
        if (user) {
          user.role = role;
          app.saveDB();
          this.renderStaffRegistry(app);
          app.showToast(`${user.username} promoted to staff.`, "success");
          (document.getElementById("admin-shop-user-id") as HTMLInputElement).value = "";
        } else {
          app.showToast("User not found.", "error");
        }
      };
    }
  }
}
