export const AgentEvents = {
  setupAllListeners(system: any, app: any) {
    // 1. Sidebar Collapse & Mobile Drawer Toggles
    const collapseBtn = document.getElementById("agent-sidebar-collapse-btn");
    if (collapseBtn && !collapseBtn.dataset.bound) {
      collapseBtn.dataset.bound = "true";
      collapseBtn.addEventListener("click", () => {
        system.sidebarCollapsed = !system.sidebarCollapsed;
        localStorage.setItem("agent_sidebar_collapsed", String(system.sidebarCollapsed));
        system.applySidebarState();
      });
    }

    const mobileMenuBtn = document.getElementById("agent-mobile-menu-btn");
    if (mobileMenuBtn && !mobileMenuBtn.dataset.bound) {
      mobileMenuBtn.dataset.bound = "true";
      mobileMenuBtn.addEventListener("click", () => system.openMobileDrawer());
    }

    const mobileCloseBtn = document.getElementById("agent-sidebar-close-btn");
    if (mobileCloseBtn && !mobileCloseBtn.dataset.bound) {
      mobileCloseBtn.dataset.bound = "true";
      mobileCloseBtn.addEventListener("click", () => system.closeMobileDrawer());
    }

    const backdrop = document.getElementById("agent-sidebar-backdrop");
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = "true";
      backdrop.addEventListener("click", () => system.closeMobileDrawer());
    }

    // Global event delegation for Agent suite interactions
    if (!(window as any)._agentSuiteDelegated) {
      (window as any)._agentSuiteDelegated = true;
      document.addEventListener("click", (e: any) => {
        const agentTabBtn = e.target.closest(".agent-tab-selector-btn");
        if (agentTabBtn) {
          e.preventDefault();
          e.stopPropagation();
          const val = agentTabBtn.getAttribute("val") || agentTabBtn.getAttribute("data-tab");
          if (val) {
            system.switchAgentTab(app, val);
          }
          return;
        }

        const mobileMenu = e.target.closest("#agent-mobile-menu-btn");
        if (mobileMenu) {
          e.preventDefault();
          e.stopPropagation();
          system.openMobileDrawer();
          return;
        }

        const closeBtn = e.target.closest("#agent-sidebar-close-btn") || e.target.closest("#agent-sidebar-backdrop");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          system.closeMobileDrawer();
          return;
        }

        const collapseBtn = e.target.closest("#agent-sidebar-collapse-btn");
        if (collapseBtn) {
          e.preventDefault();
          e.stopPropagation();
          system.sidebarCollapsed = !system.sidebarCollapsed;
          localStorage.setItem("agent_sidebar_collapsed", String(system.sidebarCollapsed));
          system.applySidebarState();
          return;
        }

        const sidebarLogout = e.target.closest("#agent-sidebar-logout-btn");
        if (sidebarLogout) {
          e.preventDefault();
          e.stopPropagation();
          const headerLogout = document.getElementById("agent-logout-btn");
          if (headerLogout) headerLogout.click();
          return;
        }
      });
    }

    const sidebarLogoutBtn = document.getElementById("agent-sidebar-logout-btn");
    if (sidebarLogoutBtn && !sidebarLogoutBtn.dataset.bound) {
      sidebarLogoutBtn.dataset.bound = "true";
      sidebarLogoutBtn.addEventListener("click", () => {
        const headerLogout = document.getElementById("agent-logout-btn");
        if (headerLogout) headerLogout.click();
      });
    }

    // Restore persisted active tab on init
    system.applySidebarState();
    if (system.activeSubTab && system.activeSubTab !== "overview") {
      system.switchAgentTab(app, system.activeSubTab);
    }

    // 3. Dashboard & Analytics Filter Listeners
    const bindChangeOrInput = (id: string, evt: string) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.suiteBound) {
        el.dataset.suiteBound = "true";
        el.addEventListener(evt, () => system.renderAllPanels(app));
      }
    };
    bindChangeOrInput("agent-dash-range-select", "change");
    bindChangeOrInput("agent-players-scope-filter", "change");
    bindChangeOrInput("agent-reghistory-search", "input");
    bindChangeOrInput("agent-comm-filter-status", "change");
    bindChangeOrInput("agent-tx-type-filter", "change");
    bindChangeOrInput("agent-tx-search-input", "input");
    bindChangeOrInput("agent-payreq-status-filter", "change");
    bindChangeOrInput("agent-analytics-range", "change");

    // 4. Referral Link Copy
    const copyRefBtn = document.getElementById("agent-copy-ref-link-btn");
    if (copyRefBtn && !copyRefBtn.dataset.bound) {
      copyRefBtn.dataset.bound = "true";
      copyRefBtn.addEventListener("click", () => {
        const inp = document.getElementById("agent-referral-link-input") as HTMLInputElement | null;
        if (inp && inp.value) {
          navigator.clipboard.writeText(inp.value).then(() => {
            app.showToast("Referral link copied to clipboard!", "success");
          });
        }
      });
    }

    // 5. Analytics CSV Export
    const exportCsvBtn = document.getElementById("agent-analytics-export-btn");
    if (exportCsvBtn && !exportCsvBtn.dataset.bound) {
      exportCsvBtn.dataset.bound = "true";
      exportCsvBtn.addEventListener("click", () => {
        const myLedger = (app.db.agentLedger || []).filter((l: any) => l && l.agentId === app.currentUser?.id);
        const rows = [["ID", "Timestamp", "TargetUser", "Description", "Amount", "Commission", "Status"]];
        myLedger.forEach((l: any) => {
          rows.push([
            l.id || "",
            l.timestamp || "",
            l.targetUser || "",
            (l.description || "").replace(/,/g, ";"),
            String(l.amount || 0),
            String(l.commission || 0),
            l.status || "complete"
          ]);
        });
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `agent_report_${app.currentUser?.username || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        app.showToast("Analytics CSV report downloaded!", "success");
      });
    }

    // 6. Notifications Mark All Read
    const markReadBtn = document.getElementById("agent-notif-mark-read-btn");
    if (markReadBtn && !markReadBtn.dataset.bound) {
      markReadBtn.dataset.bound = "true";
      markReadBtn.addEventListener("click", async () => {
        if (!app.currentUser) return;
        const uName = app.currentUser.username;
        (app.db.messages || []).forEach((m: any) => {
          if (!m) return;
          if (!Array.isArray(m.readBy)) m.readBy = [];
          if (!m.readBy.includes(uName)) m.readBy.push(uName);
        });
        await app.saveDB(true);
        system.renderAllPanels(app);
        app.showToast("All notifications marked as read.", "success");
      });
    }

    // 7. Wallet Forms
    const transferCommForm = document.getElementById("agent-wallet-transfer-comm-form");
    if (transferCommForm && !transferCommForm.dataset.bound) {
      transferCommForm.dataset.bound = "true";
      transferCommForm.addEventListener("submit", (e) => system.handleCommissionTransfer(app, e));
    }

    const refillForm = document.getElementById("agent-wallet-refill-form");
    if (refillForm && !refillForm.dataset.bound) {
      refillForm.dataset.bound = "true";
      refillForm.addEventListener("submit", (e) => system.handleRefillRequest(app, e));
    }

    // 8. Agent Profile Form & Photo Upload
    const profileForm = document.getElementById("agent-profile-update-form") as HTMLFormElement | null;
    if (profileForm && !profileForm.dataset.bound) {
      profileForm.dataset.bound = "true";
      profileForm.addEventListener("submit", (e) => system.handleProfileUpdate(app, e));
      profileForm.addEventListener("input", () => {
        profileForm.dataset.dirty = "true";
      });
    }

    const profPhotoInput = document.getElementById("agent-prof-photo") as HTMLInputElement | null;
    const profPhotoUploadBtn = document.getElementById("agent-prof-photo-upload-btn");
    const profPhotoFile = document.getElementById("agent-prof-photo-file") as HTMLInputElement | null;
    const profPhotoRemoveBtn = document.getElementById("agent-prof-photo-remove-btn");
    const profPhotoStatus = document.getElementById("agent-prof-photo-status");

    const setPhotoStatus = (msg: string, tone: "info" | "success" | "error" | "clear") => {
      if (!profPhotoStatus) return;
      if (tone === "clear") {
        profPhotoStatus.classList.add("hidden");
        profPhotoStatus.textContent = "";
        return;
      }
      profPhotoStatus.classList.remove("hidden", "text-amber-400", "text-emerald-400", "text-rose-400");
      profPhotoStatus.classList.add(
        tone === "success" ? "text-emerald-400" : tone === "error" ? "text-rose-400" : "text-amber-400"
      );
      profPhotoStatus.textContent = msg;
    };

    const compressImageToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 256;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(String(reader.result || ""));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          };
          img.onerror = () => resolve(String(reader.result || ""));
          img.src = String(reader.result || "");
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      });
    };

    if (profPhotoInput && !profPhotoInput.dataset.bound) {
      profPhotoInput.dataset.bound = "true";
      profPhotoInput.addEventListener("input", () => {
        import("./AgentPanels.js").then(({ AgentPanels }) => {
          AgentPanels.updateProfilePhotoPreview(app, profPhotoInput.value, app.currentUser?.displayName || app.currentUser?.username || "A");
        });
      });
    }

    if (profPhotoUploadBtn && profPhotoFile && !profPhotoUploadBtn.dataset.bound) {
      profPhotoUploadBtn.dataset.bound = "true";
      profPhotoUploadBtn.addEventListener("click", () => profPhotoFile.click());
      profPhotoFile.addEventListener("change", async () => {
        const file = profPhotoFile.files && profPhotoFile.files[0];
        if (!file || !app.currentUser) return;
        const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
          app.showToast("Only PNG, JPG, WEBP, or GIF images are allowed!", "error");
          profPhotoFile.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          app.showToast("Image must be 5MB or smaller!", "error");
          profPhotoFile.value = "";
          return;
        }

        setPhotoStatus("Uploading agent photo...", "info");
        let uploadedUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await resp.json().catch(() => null);
          if (resp.ok && json?.success && json?.url) {
            uploadedUrl = json.url;
          }
        } catch {}

        if (!uploadedUrl) {
          try {
            uploadedUrl = await compressImageToDataUrl(file);
          } catch {
            setPhotoStatus("Upload failed.", "error");
            app.showToast("Failed to process selected photo.", "error");
            profPhotoFile.value = "";
            return;
          }
        }

        if (profPhotoInput) profPhotoInput.value = uploadedUrl;
        app.currentUser.photo = uploadedUrl;
        app.currentUser.avatar = uploadedUrl;
        system.syncAgentRecordEverywhere(app, app.currentUser);
        await app.saveDB(true);

        const { AgentPanels } = await import("./AgentPanels.js");
        AgentPanels.updateProfilePhotoPreview(app, uploadedUrl, app.currentUser.displayName || app.currentUser.username || "A");
        system.renderAllPanels(app);
        if ((window as any).AffiliateAgentSystem?.renderAgents) {
          (window as any).AffiliateAgentSystem.renderAgents(app);
        }
        setPhotoStatus("✓ Photo saved and live on User Panel Agent Directory!", "success");
        app.showToast("Agent profile photo saved!", "success");
        profPhotoFile.value = "";
      });
    }

    if (profPhotoRemoveBtn && !profPhotoRemoveBtn.dataset.bound) {
      profPhotoRemoveBtn.dataset.bound = "true";
      profPhotoRemoveBtn.addEventListener("click", async () => {
        if (!app.currentUser) return;
        if (profPhotoInput) profPhotoInput.value = "";
        app.currentUser.photo = "";
        app.currentUser.avatar = "";
        system.syncAgentRecordEverywhere(app, app.currentUser);
        await app.saveDB(true);
        const { AgentPanels } = await import("./AgentPanels.js");
        AgentPanels.updateProfilePhotoPreview(app, "", app.currentUser.displayName || app.currentUser.username || "A");
        system.renderAllPanels(app);
        if ((window as any).AffiliateAgentSystem?.renderAgents) {
          (window as any).AffiliateAgentSystem.renderAgents(app);
        }
        setPhotoStatus("Photo removed.", "info");
        app.showToast("Agent profile photo removed.", "info");
      });
    }

    // 9. Security Form
    const secForm = document.getElementById("agent-security-password-form");
    if (secForm && !secForm.dataset.bound) {
      secForm.dataset.bound = "true";
      secForm.addEventListener("submit", (e) => system.handleSecurityUpdate(app, e));
    }

    // 10. Support Form
    const supportForm = document.getElementById("agent-support-ticket-form");
    if (supportForm && !supportForm.dataset.bound) {
      supportForm.dataset.bound = "true";
      supportForm.addEventListener("submit", (e) => system.handleSupportTicket(app, e));
    }

    // 11. Agent Chat Inbox
    this.setupAgentChatInboxListeners(system, app);
  },

  setupAgentChatInboxListeners(system: any, app: any) {
    document.querySelectorAll(".agent-chat-filter-btn").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        system.chatInboxFilter = btn.getAttribute("data-filter") || "all";
        document.querySelectorAll(".agent-chat-filter-btn").forEach(b => {
          b.className = "agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition";
        });
        btn.className = "agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition";
        system.renderAgentChatInbox(app, system.getAgentChatThreads(app));
      });
    });

    const inboxSearch = document.getElementById("agent-chat-inbox-search");
    if (inboxSearch && !inboxSearch.dataset.bound) {
      inboxSearch.dataset.bound = "true";
      inboxSearch.addEventListener("input", () => {
        system.renderAgentChatInbox(app, system.getAgentChatThreads(app));
      });
    }

    const msgSearch = document.getElementById("agent-chat-msg-search");
    if (msgSearch && !msgSearch.dataset.bound) {
      msgSearch.dataset.bound = "true";
      msgSearch.addEventListener("input", () => {
        system.renderActiveAgentConversation(app, system.getAgentChatThreads(app));
      });
    }

    const newConvBtn = document.getElementById("agent-chat-new-conv-btn");
    if (newConvBtn && !newConvBtn.dataset.bound) {
      newConvBtn.dataset.bound = "true";
      newConvBtn.addEventListener("click", () => {
        const searchBox = document.getElementById("agent-chat-inbox-search") as HTMLInputElement | null;
        const candidate = (searchBox?.value || "").trim().replace(/^@/, "");
        if (candidate) {
          system.activeChatUser = candidate;
          if (searchBox) searchBox.value = "";
          system.renderAgentChatInbox(app, system.getAgentChatThreads(app));
          document.getElementById("agent-inbox-reply-input")?.focus();
        } else {
          app.showToast("Type a username in the search box above and click '+ New Chat', or click 'Chat' on any row in My Users!", "info");
          if (searchBox) searchBox.focus();
        }
      });
    }

    const statusSelect = document.getElementById("agent-inbox-status-select");
    if (statusSelect && !statusSelect.dataset.bound) {
      statusSelect.dataset.bound = "true";
      statusSelect.addEventListener("change", async () => {
        if (!system.activeChatUser) return;
        const newStatus = (statusSelect as HTMLSelectElement).value;
        system.updateThreadMetadata(app, system.activeChatUser, { threadStatus: newStatus });
        await app.saveDB(true);
        system.renderAllPanels(app);
        app.showToast(`Conversation marked as ${newStatus.toUpperCase()}.`, "success");
      });
    }

    const prioSelect = document.getElementById("agent-inbox-priority-select");
    if (prioSelect && !prioSelect.dataset.bound) {
      prioSelect.dataset.bound = "true";
      prioSelect.addEventListener("change", async () => {
        if (!system.activeChatUser) return;
        const newPrio = (prioSelect as HTMLSelectElement).value;
        system.updateThreadMetadata(app, system.activeChatUser, { priority: newPrio });
        await app.saveDB(true);
        system.renderAllPanels(app);
        app.showToast(`Conversation priority set to ${newPrio.toUpperCase()}.`, "info");
      });
    }

    const refreshBtn = document.getElementById("agent-inbox-refresh-btn");
    if (refreshBtn && !refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", async () => {
        await system.pollLatestChats(app);
        system.renderAllPanels(app);
        app.showToast("Live chat inbox synchronized!", "info");
      });
    }

    const fsBtn = document.getElementById("agent-inbox-fullscreen-btn");
    if (fsBtn && !fsBtn.dataset.bound) {
      fsBtn.dataset.bound = "true";
      fsBtn.addEventListener("click", () => system.openWhatsAppFullscreenModal(app));
    }

    const waClose = document.getElementById("wa-modal-close-btn");
    if (waClose && !waClose.dataset.bound) {
      waClose.dataset.bound = "true";
      waClose.addEventListener("click", () => system.closeWhatsAppFullscreenModal());
    }

    const waFeedbackBtn = document.getElementById("wa-modal-feedback-btn");
    if (waFeedbackBtn && !waFeedbackBtn.dataset.bound) {
      waFeedbackBtn.dataset.bound = "true";
      waFeedbackBtn.addEventListener("click", async () => {
        if (!system.activeChatUser || !app.currentUser) return;
        if (!Array.isArray(app.db.agentChats)) app.db.agentChats = [];
        app.db.agentChats.push({
          id: "chat_fb_" + Date.now(),
          conversationId: [app.currentUser.username.toLowerCase(), system.activeChatUser.toLowerCase()].sort().join("__"),
          sender: app.currentUser.username,
          senderRole: app.currentUser.role || "agent",
          recipient: system.activeChatUser,
          message: "⭐ [FEEDBACK REQUEST] দয়া করে আমাদের সেবার মান রেটিং দিন (1 to 5 Stars) এবং আপনার মূল্যবান মতামত জানান।",
          timestamp: new Date().toISOString(),
          status: "sent",
          threadStatus: "open",
          priority: "normal",
          isInternalNote: 0
        });
        await app.saveDB(true);
        system.renderWhatsAppFullscreenModal(app);
        system.renderAllPanels(app);
        app.showToast("Feedback request sent to user successfully!", "success");
      });
    }

    document.querySelectorAll(".wa-quick-reply").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        const reply = btn.getAttribute("data-reply") || "";
        const input = document.getElementById("wa-modal-input") as HTMLInputElement | null;
        if (input) {
          input.value = reply;
          input.focus();
        }
      });
    });

    const waForm = document.getElementById("wa-modal-form");
    const waInput = document.getElementById("wa-modal-input") as HTMLInputElement | null;
    if (waForm && waInput && !waForm.dataset.bound) {
      waForm.dataset.bound = "true";
      waForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = waInput.value.trim();
        if (!text || !system.activeChatUser || !app.currentUser) return;
        waInput.value = "";

        const sender = app.currentUser.username;
        const recipient = system.activeChatUser;
        if (!Array.isArray(app.db.agentChats)) app.db.agentChats = [];
        app.db.agentChats.push({
          id: "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          conversationId: [sender.toLowerCase(), recipient.toLowerCase()].sort().join("__"),
          sender,
          senderRole: app.currentUser.role || "agent",
          recipient,
          message: text,
          timestamp: new Date().toISOString(),
          status: "sent",
          threadStatus: "open",
          priority: "normal",
          isInternalNote: 0
        });

        await app.saveDB(true);
        system.renderWhatsAppFullscreenModal(app);
        system.renderAllPanels(app);
      });
    }

    // Quick Assist Buttons
    const quickLoadBtn = document.getElementById("agent-inbox-quick-load-btn");
    if (quickLoadBtn && !quickLoadBtn.dataset.bound) {
      quickLoadBtn.dataset.bound = "true";
      quickLoadBtn.addEventListener("click", () => {
        if (!system.activeChatUser) return;
        const el = document.getElementById("agent-cash-dep-username") as HTMLInputElement | null;
        if (el) el.value = system.activeChatUser;
        system.switchAgentTab(app, "cash");
      });
    }

    const quickWdrBtn = document.getElementById("agent-inbox-quick-wdr-btn");
    if (quickWdrBtn && !quickWdrBtn.dataset.bound) {
      quickWdrBtn.dataset.bound = "true";
      quickWdrBtn.addEventListener("click", () => {
        if (!system.activeChatUser) return;
        const el = document.getElementById("agent-cash-wdr-username") as HTMLInputElement | null;
        if (el) el.value = system.activeChatUser;
        system.switchAgentTab(app, "cash");
      });
    }

    const quickBookBtn = document.getElementById("agent-inbox-quick-book-btn");
    if (quickBookBtn && !quickBookBtn.dataset.bound) {
      quickBookBtn.dataset.bound = "true";
      quickBookBtn.addEventListener("click", () => {
        if (!system.activeChatUser) return;
        const el = document.getElementById("agent-booking-user") as HTMLInputElement | null;
        if (el) el.value = system.activeChatUser;
        system.switchAgentTab(app, "booker");
      });
    }

    document.querySelectorAll(".agent-quick-reply-btn").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        const reply = btn.getAttribute("data-reply") || "";
        const input = document.getElementById("agent-inbox-reply-input") as HTMLInputElement | null;
        if (input) {
          input.value = reply;
          input.focus();
        }
      });
    });

    const modeReplyBtn = document.getElementById("agent-chat-mode-reply");
    const modeNoteBtn = document.getElementById("agent-chat-mode-note");
    const replyInput = document.getElementById("agent-inbox-reply-input") as HTMLInputElement | null;

    if (modeReplyBtn && modeNoteBtn && !modeReplyBtn.dataset.bound) {
      modeReplyBtn.dataset.bound = "true";
      modeReplyBtn.addEventListener("click", () => {
        system.chatComposerMode = "reply";
        modeReplyBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition";
        modeNoteBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-amber-400 border border-amber-800/40 hover:bg-amber-950/40 cursor-pointer transition";
        if (replyInput) replyInput.placeholder = "Write a public reply to user... (Enter to send, Shift+Enter for new line)";
      });

      modeNoteBtn.addEventListener("click", () => {
        system.chatComposerMode = "note";
        modeNoteBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-600 text-slate-950 cursor-pointer transition";
        modeReplyBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800 hover:text-white cursor-pointer transition";
        if (replyInput) replyInput.placeholder = "Write a private internal staff note (HIDDEN from user)...";
      });
    }

    const attachBtn = document.getElementById("agent-chat-attach-btn");
    const attachInput = document.getElementById("agent-chat-attach-input") as HTMLInputElement | null;
    const previewBox = document.getElementById("agent-inbox-attachment-preview");
    const previewName = document.getElementById("agent-inbox-attachment-name");
    const previewRemove = document.getElementById("agent-inbox-attachment-remove");

    if (attachBtn && attachInput && !attachBtn.dataset.bound) {
      attachBtn.dataset.bound = "true";
      attachBtn.addEventListener("click", () => attachInput.click());
      attachInput.addEventListener("change", async () => {
        const file = attachInput.files && attachInput.files[0];
        if (!file) return;
        const validated = await system.validateAndReadAttachment(file, app);
        if (validated) {
          system.agentPendingAttachment = validated;
          if (previewName) previewName.innerText = `${validated.name} (${Math.round(validated.size / 1024)} KB)`;
          if (previewBox) previewBox.classList.remove("hidden");
        }
        attachInput.value = "";
      });
    }

    if (previewRemove && !previewRemove.dataset.bound) {
      previewRemove.dataset.bound = "true";
      previewRemove.addEventListener("click", () => {
        system.agentPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");
      });
    }

    const typingEl = document.getElementById("agent-chat-typing-indicator");
    const replyForm = document.getElementById("agent-inbox-reply-form");

    if (replyInput && !replyInput.dataset.bound) {
      replyInput.dataset.bound = "true";
      replyInput.addEventListener("input", () => {
        if (typingEl) {
          typingEl.innerText = replyInput.value.trim() ? "Typing..." : "Ready";
        }
      });
      replyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (replyForm) (replyForm as HTMLFormElement).requestSubmit();
        }
      });
    }

    if (replyForm && !replyForm.dataset.bound) {
      replyForm.dataset.bound = "true";
      replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!system.activeChatUser || !app.currentUser) {
          app.showToast("Please select a user conversation first!", "error");
          return;
        }
        const text = (replyInput ? replyInput.value : "").trim();
        const att = system.agentPendingAttachment;
        if (!text && !att) return;

        const sender = app.currentUser.username;
        const recipient = system.activeChatUser;
        const sig = `${sender}->${recipient}:${text}:${att ? att.name : ""}:${system.chatComposerMode}`;
        if (sig === system.lastSentSignature && Date.now() - system.lastSentTimestamp < 1500) {
          return;
        }
        system.lastSentSignature = sig;
        system.lastSentTimestamp = Date.now();

        if (replyInput) replyInput.value = "";
        if (typingEl) typingEl.innerText = "Sent ✓";
        system.agentPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");

        const currentStatus = (document.getElementById("agent-inbox-status-select") as HTMLSelectElement | null)?.value || "open";
        const currentPriority = (document.getElementById("agent-inbox-priority-select") as HTMLSelectElement | null)?.value || "normal";

        if (!Array.isArray(app.db.agentChats)) app.db.agentChats = [];
        app.db.agentChats.push({
          id: "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          conversationId: [sender.toLowerCase(), recipient.toLowerCase()].sort().join("__"),
          sender,
          senderRole: app.currentUser.role || "agent",
          recipient,
          message: text,
          attachmentUrl: att ? att.url : null,
          attachmentName: att ? att.name : null,
          attachmentType: att ? att.type : null,
          timestamp: new Date().toISOString(),
          status: "sent",
          readAt: null,
          threadStatus: currentStatus,
          priority: currentPriority,
          isInternalNote: system.chatComposerMode === "note" ? 1 : 0
        });

        await app.saveDB(true);
        system.renderAllPanels(app);
      });
    }

    system.populateProfileForm(app);
  },

  setupUserLiveChatListeners(system: any, app: any) {
    system.startPollingIfNeeded(app);

    const switcher = document.getElementById("user-chat-agent-switcher");
    if (switcher && !switcher.dataset.bound) {
      switcher.dataset.bound = "true";
      switcher.addEventListener("change", () => {
        app.currentChatAgent = (switcher as HTMLSelectElement).value;
        system.renderUserLiveChat(app);
      });
    }

    const searchInput = document.getElementById("user-chat-search-input");
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener("input", () => {
        system.renderUserLiveChat(app);
      });
    }

    const refreshBtn = document.getElementById("user-chat-refresh-btn");
    if (refreshBtn && !refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", async () => {
        await system.pollLatestChats(app);
        system.renderUserLiveChat(app);
        app.showToast("Conversation refreshed!", "info");
      });
    }

    document.querySelectorAll(".user-chat-quick-chip").forEach(chip => {
      if (chip.dataset.bound) return;
      chip.dataset.bound = "true";
      chip.addEventListener("click", () => {
        const msg = chip.getAttribute("data-msg") || "";
        const input = document.getElementById("agent-chat-input") as HTMLInputElement | null;
        if (input) {
          input.value = msg;
          input.focus();
        }
      });
    });

    const attachBtn = document.getElementById("user-chat-attach-btn");
    const fileInput = document.getElementById("user-chat-file-input") as HTMLInputElement | null;
    const previewBox = document.getElementById("user-chat-attachment-preview");
    const previewName = document.getElementById("user-chat-attachment-name");
    const removeAttachBtn = document.getElementById("user-chat-attachment-remove");

    if (attachBtn && fileInput && !attachBtn.dataset.bound) {
      attachBtn.dataset.bound = "true";
      attachBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const validated = await system.validateAndReadAttachment(file, app);
        if (validated) {
          system.userPendingAttachment = validated;
          if (previewName) previewName.innerText = `${validated.name} (${Math.round(validated.size / 1024)} KB)`;
          if (previewBox) previewBox.classList.remove("hidden");
        }
        fileInput.value = "";
      });
    }

    if (removeAttachBtn && !removeAttachBtn.dataset.bound) {
      removeAttachBtn.dataset.bound = "true";
      removeAttachBtn.addEventListener("click", () => {
        system.userPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");
      });
    }

    const input = document.getElementById("agent-chat-input") as HTMLInputElement | null;
    const form = document.getElementById("agent-chat-form") as HTMLFormElement | null;

    if (input && !input.dataset.enterBound) {
      input.dataset.enterBound = "true";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (form) form.requestSubmit();
        }
      });
    }

    if (form && !form.dataset.listenerAttached) {
      form.dataset.listenerAttached = "true";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = (input ? input.value : "").trim();
        const att = system.userPendingAttachment;
        if (!text && !att) return;

        const sender = app.currentUser ? app.currentUser.username : "guest";
        const recipient = app.currentChatAgent || "agent";
        const sig = `${sender}->${recipient}:${text}:${att ? att.name : ""}`;
        if (sig === system.lastSentSignature && Date.now() - system.lastSentTimestamp < 1500) {
          return;
        }
        system.lastSentSignature = sig;
        system.lastSentTimestamp = Date.now();

        if (input) input.value = "";
        system.userPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");

        if (!Array.isArray(app.db.agentChats)) app.db.agentChats = [];
        app.db.agentChats.push({
          id: "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          conversationId: [sender.toLowerCase(), recipient.toLowerCase()].sort().join("__"),
          sender,
          senderRole: app.currentUser?.role || "user",
          recipient,
          message: text,
          attachmentUrl: att ? att.url : null,
          attachmentName: att ? att.name : null,
          attachmentType: att ? att.type : null,
          timestamp: new Date().toISOString(),
          status: "sent",
          readAt: null,
          threadStatus: "open",
          priority: "normal",
          isInternalNote: 0
        });

        await app.saveDB(true);
        system.renderUserLiveChat(app);
      });
    }
  }
};
