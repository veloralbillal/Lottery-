function getUnifiedStaffList(db: any): any[] {
  if (!db) return [];
  const merged = new Map<string, any>();
  const addItem = (item: any) => {
    if (!item || typeof item !== "object") return;
    const unameKey = item.username ? String(item.username).toLowerCase().trim() : "";
    const idKey = item.id ? String(item.id) : "";
    let matchKey = "";
    if (unameKey && merged.has(`u:${unameKey}`)) {
      matchKey = `u:${unameKey}`;
    } else if (idKey && merged.has(`id:${idKey}`)) {
      matchKey = `id:${idKey}`;
    } else {
      matchKey = unameKey ? `u:${unameKey}` : (idKey ? `id:${idKey}` : "");
    }
    if (!matchKey) return;
    const prev = merged.get(matchKey) || {};
    const combined: any = { ...prev, ...item, id: String(item.id || prev.id || matchKey) };
    if (!combined.photo && (prev.photo || prev.avatar || item.avatar)) {
      combined.photo = prev.photo || prev.avatar || item.avatar;
    }
    if (!combined.avatar && (combined.photo || prev.avatar)) {
      combined.avatar = combined.photo || prev.avatar;
    }
    if (!combined.displayName && prev.displayName) {
      combined.displayName = prev.displayName;
    }
    merged.set(matchKey, combined);
    if (unameKey) merged.set(`u:${unameKey}`, combined);
    if (idKey) merged.set(`id:${idKey}`, combined);
  };

  (Array.isArray(db.users) ? db.users : [])
    .filter((u: any) => u && ["agent", "subagent", "moderator"].includes(String(u.role || "").toLowerCase()))
    .forEach(addItem);
  (Array.isArray(db.staff) ? db.staff : []).forEach(addItem);
  (Array.isArray(db.agents) ? db.agents : []).forEach(addItem);

  const uniqueById = new Map<string, any>();
  for (const val of merged.values()) {
    const dedupKey = val.username ? String(val.username).toLowerCase().trim() : String(val.id);
    if (dedupKey) uniqueById.set(dedupKey, val);
  }
  return Array.from(uniqueById.values());
}

export const AdminAgents = {
  async renderAdminAgents(this: any) {
    if (typeof this.setupStaffAndAgentListeners === "function") {
      this.setupStaffAndAgentListeners();
    }

    const cardsGrid = document.getElementById("admin-agents-cards-grid");
    const listEl = document.getElementById("admin-agents-tbody");
    const filterBar = document.getElementById("admin-agents-filter-bar");
    const searchInput = (document.getElementById("agents-search-input") || document.getElementById("admin-agents-search")) as HTMLInputElement;
    if (!cardsGrid && !listEl) return;

    const uniqueStaff = getUnifiedStaffList(this.db);

    const agentsCount = uniqueStaff.filter((s: any) => s.role === "agent" || s.role === "subagent").length;
    const modsCount = uniqueStaff.filter((s: any) => s.role === "moderator").length;
    const totalEarnedCommission = uniqueStaff.reduce((sum: number, s: any) => sum + (parseFloat(s.earnedCommission) || 0), 0);

    const setStat = (id: string, val: string | number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setStat("agents-stat-count", agentsCount);
    setStat("moderators-stat-count", modsCount);
    setStat("agents-stat-commission", `৳${totalEarnedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    const activeFilter = this._adminAgentsFilter || "all";
    if (filterBar) {
      const filters = [
        { id: "all", label: `All (${uniqueStaff.length})` },
        { id: "agent", label: `Agents (${uniqueStaff.filter((s: any) => s.role === "agent").length})` },
        { id: "subagent", label: `Sub-Agents (${uniqueStaff.filter((s: any) => s.role === "subagent").length})` },
        { id: "moderator", label: `Moderators (${modsCount})` },
        { id: "active", label: `Active (${uniqueStaff.filter((s: any) => (s.status || "active") === "active").length})` },
        { id: "blocked", label: `Blocked (${uniqueStaff.filter((s: any) => s.status === "blocked" || s.status === "banned").length})` }
      ];
      filterBar.innerHTML = filters.map(f => {
        const isActive = activeFilter === f.id;
        const cls = isActive
          ? "px-3 py-1.5 rounded-xl bg-rose-500 text-white font-black whitespace-nowrap cursor-pointer shadow-sm transition"
          : "px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 font-bold whitespace-nowrap cursor-pointer transition";
        return `<button type="button" class="admin-agents-filter-chip ${cls}" data-filter="${f.id}">${f.label}</button>`;
      }).join("");

      filterBar.querySelectorAll(".admin-agents-filter-chip").forEach(btn => {
        btn.addEventListener("click", () => {
          this._adminAgentsFilter = btn.getAttribute("data-filter") || "all";
          this.renderAdminAgents();
        });
      });
    }

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let filtered = uniqueStaff;

    if (activeFilter === "agent" || activeFilter === "subagent" || activeFilter === "moderator") {
      filtered = filtered.filter((s: any) => s.role === activeFilter);
    } else if (activeFilter === "active") {
      filtered = filtered.filter((s: any) => (s.status || "active") === "active");
    } else if (activeFilter === "blocked") {
      filtered = filtered.filter((s: any) => s.status === "blocked" || s.status === "banned");
    }

    if (query) {
      filtered = filtered.filter((s: any) =>
        (s.username || "").toLowerCase().includes(query) ||
        (s.email || "").toLowerCase().includes(query) ||
        (s.phone || "").toLowerCase().includes(query) ||
        (s.district || "").toLowerCase().includes(query) ||
        (s.region || "").toLowerCase().includes(query)
      );
    }

    if (cardsGrid) {
      cardsGrid.innerHTML = "";
      if (filtered.length === 0) {
        cardsGrid.innerHTML = `<div class="col-span-full p-10 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">No matching staff or agent accounts found.</div>`;
      } else {
        filtered.forEach((staff: any) => {
          const card = document.createElement("div");
          card.className = "bg-slate-950/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-4 transition-all";
          const initial = (staff.username || "A").substring(0, 2).toUpperCase();
          const roleVal = (staff.role || "agent").toLowerCase();
          const roleClass = roleVal === "admin"
            ? "bg-red-950 text-red-400 border-red-800/40"
            : roleVal === "agent"
            ? "bg-amber-950 text-amber-400 border-amber-800/40"
            : roleVal === "subagent"
            ? "bg-indigo-950 text-indigo-400 border-indigo-800/40"
            : "bg-cyan-950 text-cyan-400 border-cyan-800/40";
          const isActive = (staff.status || "active") === "active";
          const statusClass = isActive
            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/40"
            : "bg-rose-950/80 text-rose-400 border-rose-800/40";

          const staffPhoto = staff.photo || staff.avatar || "";
          const staffAvatarHtml = staffPhoto
            ? `<img src="${this.escapeHTML ? this.escapeHTML(staffPhoto) : staffPhoto}" alt="${this.escapeHTML ? this.escapeHTML(staff.username || "Agent") : (staff.username || "Agent")}" class="w-full h-full object-cover" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="hidden w-full h-full items-center justify-center">${initial}</span>`
            : initial;
          card.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow shrink-0 font-mono overflow-hidden">
                  ${staffAvatarHtml}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-sm font-black text-white font-mono truncate">@${this.escapeHTML ? this.escapeHTML(staff.username || "") : (staff.username || "")}</h4>
                    <span class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${roleClass}">${roleVal}</span>
                  </div>
                  <p class="text-[11px] text-slate-400 font-mono truncate mt-0.5">${this.escapeHTML ? this.escapeHTML(staff.email || "N/A") : (staff.email || "N/A")}</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border shrink-0 ${statusClass}">${staff.status || "active"}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80 font-mono text-center">
              <div>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Balance</span>
                <span class="text-xs font-black text-amber-400 tabular-nums">৳${(parseFloat(staff.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Comm. Rate</span>
                <span class="text-xs font-black text-emerald-400">${(parseFloat(staff.commissionRate) || 0).toFixed(1)}%</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Earned</span>
                <span class="text-xs font-black text-slate-200 tabular-nums">৳${(parseFloat(staff.earnedCommission) || 0).toFixed(2)}</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 uppercase font-bold block">Zone</span>
                <span class="text-xs font-black text-cyan-400 truncate block">${this.escapeHTML ? this.escapeHTML(staff.district || staff.region || "Dhaka") : (staff.district || staff.region || "Dhaka")}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
              <span>Phone: <strong class="text-slate-200">${this.escapeHTML ? this.escapeHTML(staff.phone || "N/A") : (staff.phone || "N/A")}</strong></span>
              <span>Joined: <strong class="text-slate-200">${staff.joinDate ? String(staff.joinDate).split("T")[0].split(" ")[0] : "N/A"}</strong></span>
            </div>

            <div class="flex items-center gap-2 pt-1 font-mono">
              <button type="button" class="edit-staff-btn flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black py-2 px-3 rounded-xl border border-slate-800 transition active:scale-95 cursor-pointer" data-id="${staff.id}">Edit</button>
              <button type="button" class="toggle-staff-status-btn bg-slate-900 hover:bg-slate-800 ${isActive ? "text-amber-400" : "text-emerald-400"} text-[10px] font-black py-2 px-3 rounded-xl border border-slate-800 transition active:scale-95 cursor-pointer" data-id="${staff.id}" data-username="${staff.username || ""}">${isActive ? "Block" : "Activate"}</button>
              <button type="button" class="delete-staff-btn bg-slate-900 hover:bg-rose-950/40 text-rose-500 text-[10px] font-black py-2 px-3 rounded-xl border border-slate-800 transition active:scale-95 cursor-pointer" data-id="${staff.id}" data-username="${staff.username || ""}">Wipe</button>
            </div>
          `;
          cardsGrid.appendChild(card);
        });
      }
    }

    if (listEl) {
      listEl.innerHTML = "";
      if (filtered.length === 0) {
        listEl.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-mono text-xs italic">No matching staff or agent accounts found.</td></tr>`;
      } else {
        filtered.forEach((staff: any) => {
          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 border-b border-slate-800/60 transition-colors";
          const roleClass = staff.role === "admin" ? "bg-red-950 text-red-400" : staff.role === "agent" ? "bg-amber-950 text-amber-400" : "bg-cyan-950 text-cyan-400";
          const statusClass = staff.status === "active" ? "text-emerald-400" : "text-rose-400";
          row.innerHTML = `
            <td class="p-3 font-black text-white text-xs">@${staff.username}</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${roleClass}">${staff.role}</span></td>
            <td class="p-3 font-mono text-xs text-slate-300">৳${(parseFloat(staff.balance) || 0).toFixed(2)}</td>
            <td class="p-3 font-mono text-[10px] text-slate-400">${staff.email || "N/A"}</td>
            <td class="p-3 font-mono text-[10px] text-slate-400">${staff.phone || "N/A"}</td>
            <td class="p-3"><span class="text-[10px] font-bold uppercase ${statusClass}">${staff.status || "active"}</span></td>
            <td class="p-3 text-right">
              <button class="edit-staff-btn bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95" data-id="${staff.id}">Edit</button>
              <button class="delete-staff-btn bg-slate-900 hover:bg-rose-955/30 text-rose-500 text-[9px] font-black py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95" data-id="${staff.id}" data-username="${staff.username || ""}">Wipe</button>
            </td>
          `;
          listEl.appendChild(row);
        });
      }
    }

    const rootContainer = cardsGrid || listEl;
    if (rootContainer) {
      rootContainer.querySelectorAll(".edit-staff-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id")!;
          this.openUserEditModal(id);
        });
      });

      rootContainer.querySelectorAll(".toggle-staff-status-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id")!;
          const uname = (btn.getAttribute("data-username") || "").toLowerCase();
          const matchFn = (u: any) => u && (u.id === id || (uname && u.username && String(u.username).toLowerCase() === uname));
          const target = getUnifiedStaffList(this.db).find(matchFn);
          if (!target) return;
          const nextStatus = (target.status || "active") === "active" ? "blocked" : "active";
          [this.db.users, this.db.staff, this.db.agents].forEach(arr => {
            if (Array.isArray(arr)) {
              arr.forEach((item: any) => {
                if (matchFn(item)) item.status = nextStatus;
              });
            }
          });
          await this.saveDB(true);
          this.renderAdminAgents();
          this.showToast(`@${target.username} status updated to ${nextStatus}.`, "info");
        });
      });

      rootContainer.querySelectorAll(".delete-staff-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id")!;
          const uname = (btn.getAttribute("data-username") || "").toLowerCase();
          if (confirm("Permanently wipe this staff/agent record? This action cannot be undone.")) {
            const keepFn = (u: any) => u && u.id !== id && (!uname || !u.username || String(u.username).toLowerCase() !== uname);
            this.db.users = (this.db.users || []).filter(keepFn);
            if (this.db.staff) this.db.staff = this.db.staff.filter(keepFn);
            if (this.db.agents) this.db.agents = this.db.agents.filter(keepFn);
            try {
              const delIds = JSON.parse(localStorage.getItem("lw_deleted_ids") || "[]");
              if (!delIds.includes(id)) delIds.push(id);
              localStorage.setItem("lw_deleted_ids", JSON.stringify(delIds));
            } catch {}
            await this.saveDB(true);
            this.renderAdminAgents();
            this.showToast("Staff record successfully wiped.", "info");
          }
        });
      });
    }

    if (searchInput && !searchInput.dataset.listenerAttached) {
      searchInput.addEventListener("input", () => this.renderAdminAgents());
      searchInput.dataset.listenerAttached = "true";
    }

    this.updateAgentHubStats();
    if (typeof this.refreshIcons === "function") this.refreshIcons();
  },

  updateAgentHubStats(this: any) {
    const uniqueStaff = getUnifiedStaffList(this.db);

    const activeLeaders = uniqueStaff.filter((u: any) => u.role === "agent" && u.status === "active");
    const activeCount = activeLeaders.length;
    const subagentsCount = uniqueStaff.filter((u: any) => u.role === "subagent").length;
    const pendingCount = uniqueStaff.filter((u: any) => u.role === "agent" && u.status === "pending_approval").length;
    const totalLeadersBalance = activeLeaders.reduce((sum: number, u: any) => sum + (parseFloat(u.balance) || 0), 0);

    const setText = (id: string, text: string | number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(text);
    };

    setText("hub-active-count-stat", activeCount);
    setText("hub-subagents-count-stat", subagentsCount);
    setText("hub-leaders-balance-stat", `৳${(totalLeadersBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    setText("hub-pending-count-stat", pendingCount);
    setText("hub-badge-pending", pendingCount);
  },

  renderAgentLeadersTab(this: any) {
    this.updateAgentHubStats();
    this.renderAgentHubSelect();
    this.initAgentRecruitmentPanelNew();
    this.renderAgentLeadersDirectory();
    this.renderAgentHubPendingList();
    this.renderRecentAgentCashLoads();
    this.initAgentLeadersCashLoad();
    this.updateLeaderCashPreview();
  },

  initAgentRecruitmentPanelNew(this: any) {
    const leadersBtn = document.getElementById("hub-tab-btn-leaders") as HTMLElement;
    const shareBtn = document.getElementById("hub-tab-btn-share");
    const approvalsBtn = document.getElementById("hub-tab-btn-approvals");
    
    const leadersTab = document.getElementById("hub-tab-content-leaders");
    const shareTab = document.getElementById("hub-tab-content-share");
    const approvalsTab = document.getElementById("hub-tab-content-approvals");

    if (leadersBtn && !leadersBtn.dataset.hubListenersAttached) {
      leadersBtn.dataset.hubListenersAttached = "true";

      const setTab = (activeTab: string) => {
        if (leadersTab) leadersTab.classList.toggle("hidden", activeTab !== "leaders");
        if (shareTab) shareTab.classList.toggle("hidden", activeTab !== "share");
        if (approvalsTab) approvalsTab.classList.toggle("hidden", activeTab !== "approvals");

        const activeClass = "flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition-all bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95";
        const inactiveClass = "flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer active:scale-95";

        if (leadersBtn) leadersBtn.className = activeTab === "leaders" ? activeClass : inactiveClass;
        if (shareBtn) shareBtn.className = activeTab === "share" ? activeClass : inactiveClass;
        if (approvalsBtn) approvalsBtn.className = activeTab === "approvals" ? activeClass : inactiveClass;

        if (activeTab === "leaders") this.renderAgentLeadersDirectory();
        if (activeTab === "approvals") this.renderAgentHubPendingList();
        if (activeTab === "share") this.renderAgentHubSelect();
      };

      leadersBtn.addEventListener("click", () => setTab("leaders"));
      shareBtn?.addEventListener("click", () => setTab("share"));
      approvalsBtn?.addEventListener("click", () => setTab("approvals"));
    }

    const refreshBtn = document.getElementById("leader-refresh-hub-btn");
    if (refreshBtn && !refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", () => {
        this.renderAgentLeadersTab();
        this.showToastHub("Agent leaders hub refreshed successfully.");
      });
    }

    const copyMasterBtn = document.getElementById("hub-copy-master-btn");
    if (copyMasterBtn && !copyMasterBtn.dataset.bound) {
      copyMasterBtn.dataset.bound = "true";
      copyMasterBtn.addEventListener("click", () => {
        const input = document.getElementById("hub-referral-link-input") as HTMLInputElement;
        if (input) {
          input.select();
          navigator.clipboard.writeText(input.value);
          this.showToastHub("Master Referral Link copied to clipboard!");
        }
      });
    }

    const leaderSelect = document.getElementById("hub-leader-select");
    if (leaderSelect && !leaderSelect.dataset.bound) {
      leaderSelect.dataset.bound = "true";
      leaderSelect.addEventListener("change", () => {
        this.updateMasterLinkValue();
      });
    }

    const campaignBtn = document.getElementById("hub-generate-campaign-btn");
    if (campaignBtn && !campaignBtn.dataset.bound) {
      campaignBtn.dataset.bound = "true";
      campaignBtn.addEventListener("click", () => {
        const campaignInput = document.getElementById("hub-campaign-name") as HTMLInputElement;
        const campaignVal = campaignInput ? campaignInput.value.trim() : "";
        const leaderSelectEl = document.getElementById("hub-leader-select") as HTMLSelectElement;
        const leaderVal = leaderSelectEl ? leaderSelectEl.value : "";
        const resultBlock = document.getElementById("hub-generated-result-block");
        const outputEl = document.getElementById("hub-custom-link-output");

        if (!leaderVal) {
          this.showToastHub("Please register or select an Agent Leader first!");
          return;
        }
        if (!campaignVal) {
          this.showToastHub("Please enter a campaign zone tag first.");
          return;
        }

        const smsTrackInput = document.getElementById("hub-sms-track") as HTMLInputElement;
        const isSms = smsTrackInput ? smsTrackInput.checked : false;
        const origin = window.location.origin;
        const inviteUrl = `${origin}/?role=agent&ref=${encodeURIComponent(leaderVal)}&comm=5.0&campaign=${encodeURIComponent(campaignVal)}&sms_track=${isSms}`;

        if (outputEl) outputEl.textContent = inviteUrl;
        if (resultBlock) resultBlock.classList.remove("hidden");
        this.showToastHub("Custom campaign link generated!");
      });
    }

    const copyCampaignBtn = document.getElementById("hub-copy-campaign-btn");
    if (copyCampaignBtn && !copyCampaignBtn.dataset.bound) {
      copyCampaignBtn.dataset.bound = "true";
      copyCampaignBtn.addEventListener("click", () => {
        const outputEl = document.getElementById("hub-custom-link-output");
        const text = outputEl ? outputEl.textContent : "";
        if (text) {
          navigator.clipboard.writeText(text);
          this.showToastHub("Campaign link copied to clipboard!");
        }
      });
    }

    const openQrBtn = document.getElementById("hub-open-qr-btn");
    const closeQrModalBtnTop = document.getElementById("hub-close-qr-modal-btn-top");
    const closeQrModalBtn = document.getElementById("hub-close-qr-modal-btn");
    const qrModal = document.getElementById("hub-qr-modal");

    if (openQrBtn && !openQrBtn.dataset.bound) {
      openQrBtn.dataset.bound = "true";
      openQrBtn.addEventListener("click", () => {
        const leaderSelectEl = document.getElementById("hub-leader-select") as HTMLSelectElement;
        const leaderVal = leaderSelectEl && leaderSelectEl.value ? leaderSelectEl.value : "agent_dhaka";
        const qrLabel = document.getElementById("hub-qr-leader-label");
        const qrBadge = document.getElementById("hub-qr-badge-code");

        if (qrLabel) qrLabel.textContent = `@${leaderVal}`;
        if (qrBadge) qrBadge.textContent = `${leaderVal.toUpperCase()}-OFFLINE-NODE`;

        qrModal?.classList.remove("hidden");
      });

      const closeQr = () => qrModal?.classList.add("hidden");
      closeQrModalBtnTop?.addEventListener("click", closeQr);
      closeQrModalBtn?.addEventListener("click", closeQr);
    }

    const getShareUrl = () => {
      const input = document.getElementById("hub-referral-link-input") as HTMLInputElement;
      return input ? input.value : `${window.location.origin}/?role=agent`;
    };

    const waBtn = document.getElementById("hub-share-whatsapp-btn");
    if (waBtn && !waBtn.dataset.bound) {
      waBtn.dataset.bound = "true";
      waBtn.addEventListener("click", () => {
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Join our official Agent network here: ")}${url}`, "_blank");
      });
    }

    const tgBtn = document.getElementById("hub-share-telegram-btn");
    if (tgBtn && !tgBtn.dataset.bound) {
      tgBtn.dataset.bound = "true";
      tgBtn.addEventListener("click", () => {
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://t.me/share/url?url=${url}&text=${encodeURIComponent("Official Agent Leader Registration Link")}`, "_blank");
      });
    }

    const msgBtn = document.getElementById("hub-share-messenger-btn");
    if (msgBtn && !msgBtn.dataset.bound) {
      msgBtn.dataset.bound = "true";
      msgBtn.addEventListener("click", () => {
        const url = encodeURIComponent(getShareUrl());
        navigator.clipboard.writeText(decodeURIComponent(url));
        this.showToastHub("Registration URL copied! Open Messenger to paste.");
      });
    }

    const smsBtn = document.getElementById("hub-share-sms-btn");
    if (smsBtn && !smsBtn.dataset.bound) {
      smsBtn.dataset.bound = "true";
      smsBtn.addEventListener("click", () => {
        const url = getShareUrl();
        window.location.href = `sms:?body=${encodeURIComponent("Register as an agent: " + url)}`;
      });
    }
  },

  updateMasterLinkValue(this: any) {
    const leaderSelect = document.getElementById("hub-leader-select") as HTMLSelectElement;
    const linkInput = document.getElementById("hub-referral-link-input") as HTMLInputElement;
    if (leaderSelect && linkInput) {
      const leaderVal = leaderSelect.value;
      if (leaderVal) {
        const origin = window.location.origin;
        linkInput.value = `${origin}/?role=agent&ref=${encodeURIComponent(leaderVal)}&comm=5.0`;
      } else {
        linkInput.value = "No Agent Leaders Registered";
      }
    }
  },

  renderAgentHubSelect(this: any) {
    const leaderSelect = document.getElementById("hub-leader-select") as HTMLSelectElement;
    const quickCashSelect = document.getElementById("leader-cash-select-user") as HTMLSelectElement;
    const uniqueStaff = getUnifiedStaffList(this.db);
    const leaders = uniqueStaff.filter((u: any) => u.role === "agent" && (u.status || "active") === "active");

    const optionsHtml = leaders.length === 0
      ? `<option value="">No Active Agent Leaders Found</option>`
      : leaders.map((l: any) => `<option value="${l.username}">@${l.username} (${l.district || l.region || "Dhaka"} - Bal: ৳${(Number(l.balance) || 0).toFixed(2)})</option>`).join("");

    if (leaderSelect) {
      const currentVal = leaderSelect.value;
      leaderSelect.innerHTML = optionsHtml;
      if (currentVal && leaders.some((l: any) => l.username === currentVal)) leaderSelect.value = currentVal;
      this.updateMasterLinkValue();
    }

    if (quickCashSelect) {
      const currentVal = quickCashSelect.value;
      quickCashSelect.innerHTML = optionsHtml;
      if (currentVal && leaders.some((l: any) => l.username === currentVal)) quickCashSelect.value = currentVal;

      if (!quickCashSelect.dataset.bound) {
        quickCashSelect.dataset.bound = "true";
        quickCashSelect.addEventListener("change", () => {
          this.updateLeaderCashPreview();
        });
      }
    }

    this.updateLeaderCashPreview();
  },

  updateLeaderCashPreview(this: any) {
    const select = document.getElementById("leader-cash-select-user") as HTMLSelectElement;
    const username = select ? select.value : "";
    const leader = getUnifiedStaffList(this.db).find((u: any) => u.username === username);

    const initialEl = document.getElementById("leader-cash-preview-initial");
    const nameEl = document.getElementById("leader-cash-preview-username");
    const distEl = document.getElementById("leader-cash-preview-district");
    const phoneEl = document.getElementById("leader-cash-preview-phone");
    const curBalEl = document.getElementById("leader-cash-current-balance-preview");
    const projBalEl = document.getElementById("leader-cash-projected-balance-preview");
    const amtInput = document.getElementById("leader-cash-amount-input") as HTMLInputElement;
    const enteredAmt = parseFloat(amtInput ? amtInput.value || "0" : "0");

    if (leader) {
      if (initialEl) initialEl.textContent = (leader.username || "A").substring(0, 2).toUpperCase();
      if (nameEl) nameEl.textContent = `@${leader.username}`;
      if (distEl) distEl.textContent = leader.district || leader.region || "Dhaka Zone";
      if (phoneEl) phoneEl.textContent = `Phone: ${leader.phone || "N/A"}`;
      const curBal = leader.balance || 0;
      if (curBalEl) curBalEl.textContent = `৳${(curBal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      const proj = curBal + (isNaN(enteredAmt) ? 0 : Math.max(0, enteredAmt));
      if (projBalEl) projBalEl.textContent = `৳${(proj || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    } else {
      if (nameEl) nameEl.textContent = "No agent selected";
      if (curBalEl) curBalEl.textContent = "৳0.00";
      if (projBalEl) projBalEl.textContent = "৳0.00";
    }
  },

  renderAgentLeadersDirectory(this: any) {
    const container = document.getElementById("hub-leaders-cards-container");
    const emptyState = document.getElementById("hub-leaders-empty-state");
    const searchInput = document.getElementById("hub-leaders-search-input") as HTMLInputElement;
    if (!container) return;

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener("input", () => this.renderAgentLeadersDirectory());
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const allUnified = getUnifiedStaffList(this.db);
    let leaders = allUnified.filter((u: any) => u.role === "agent");

    if (query) {
      leaders = leaders.filter((l: any) => 
        l.username.toLowerCase().includes(query) || 
        (l.district && l.district.toLowerCase().includes(query)) ||
        (l.phone && l.phone.includes(query)) ||
        (l.email && l.email.toLowerCase().includes(query))
      );
    }

    if (leaders.length === 0) {
      container.innerHTML = "";
      if (emptyState) {
        emptyState.classList.remove("hidden");
        emptyState.classList.add("flex");
      }
      return;
    }

    if (emptyState) {
      emptyState.classList.add("hidden");
      emptyState.classList.remove("flex");
    }

    container.innerHTML = leaders.map((l: any) => {
      const initial = (l.username || "A").substring(0, 2).toUpperCase();
      const subCount = allUnified.filter((u: any) => u.role === "subagent" && u.referredBy && u.referredBy.toLowerCase() === l.username.toLowerCase()).length;
      const statusClass = l.status === "active" 
        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40" 
        : "bg-rose-950/80 text-rose-400 border border-rose-800/40";

      return `
        <div class="bg-slate-950/90 p-5 rounded-3xl border border-slate-850 hover:border-emerald-500/40 transition shadow-xl space-y-4 font-sans">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shrink-0 font-mono relative">
                ${initial}
                <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[9px]">
                  <i data-lucide="crown" class=" text-[8px]"></i>
                </span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-black text-white font-mono">@${l.username}</h4>
                  <span class="text-[9.5px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono uppercase font-bold">${l.district || l.region || "Dhaka Zone"}</span>
                </div>
                <p class="text-[11px] text-slate-400 font-mono mt-0.5">Phone: ${l.phone || "N/A"}</p>
              </div>
            </div>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${statusClass}">
              ${l.status || 'active'}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-850 font-mono text-center">
            <div class="space-y-0.5">
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Purse Balance</span>
              <span class="text-sm font-black text-amber-400 block tabular-nums">৳${(l.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="space-y-0.5">
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Sub-Agents</span>
              <span class="text-sm font-black text-indigo-400 block">${subCount}</span>
            </div>
            <div class="space-y-0.5">
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Commission</span>
              <span class="text-sm font-black text-emerald-400 block">${parseFloat(l.commissionRate || 5.0).toFixed(1)}%</span>
            </div>
            <div class="space-y-0.5">
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Total Earned</span>
              <span class="text-sm font-black text-slate-200 block tabular-nums">৳${(l.earnedCommission || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1 font-mono text-xs">
            <button class="leader-card-cash-load-btn flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-2.5 px-3 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10" data-username="${l.username}" data-balance="${l.balance || 0}" data-district="${l.district || 'Dhaka'}">
              <i data-lucide="wallet" class=" text-sm"></i>
              <span>Cash In (টাকা লোড)</span>
            </button>
            <button class="leader-card-copy-ref-btn bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-3 rounded-xl font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1" data-username="${l.username}" title="Copy Referral Registration Link">
              <i data-lucide="link" class=" text-xs"></i>
              <span class="hidden sm:inline">Ref Link</span>
            </button>
            <button class="leader-card-edit-btn bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-3 rounded-xl font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1" data-id="${l.id}" title="Edit Leader Account Settings">
              <i data-lucide="settings" class=" text-xs"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".leader-card-cash-load-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const username = btn.getAttribute("data-username")!;
        const balance = parseFloat(btn.getAttribute("data-balance") || "0");
        const district = btn.getAttribute("data-district") || "Dhaka";
        this.openAgentCashLoadModal(username, balance, district);
      });
    });

    container.querySelectorAll(".leader-card-copy-ref-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const username = btn.getAttribute("data-username")!;
        const origin = window.location.origin;
        const link = `${origin}/?role=agent&ref=${encodeURIComponent(username)}&comm=5.0`;
        navigator.clipboard.writeText(link);
        this.showToastHub(`Copied referral link for @${username}!`);
      });
    });

    container.querySelectorAll(".leader-card-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id")!;
        this.openUserEditModal(id);
      });
    });

    this.refreshIcons();
  },

  openAgentCashLoadModal(this: any, username: string, currentBalance: number, district: string) {
    const modal = document.getElementById("leader-cash-modal");
    if (!modal) return;

    const setVal = (id: string, val: any) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = String(val);
    };

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setVal("modal-cash-target-username", username);
    setText("modal-cash-agent-name", `@${username}`);
    setText("modal-cash-agent-district", district || "Dhaka");
    setText("modal-cash-agent-balance", `৳${(currentBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    setText("modal-leader-subtitle", `Refilling wallet purse for @${username}`);
    setVal("modal-cash-amount", "");

    modal.classList.remove("hidden");
  },

  initAgentLeadersCashLoad(this: any) {
    const topLoadBtn = document.getElementById("leader-quick-cash-load-top-btn");
    if (topLoadBtn && !topLoadBtn.dataset.bound) {
      topLoadBtn.dataset.bound = "true";
      topLoadBtn.addEventListener("click", () => {
        const select = document.getElementById("leader-cash-select-user") as HTMLSelectElement;
        const username = select ? select.value : "";
        if (username) {
          const leader = getUnifiedStaffList(this.db).find((u: any) => u.username === username);
          this.openAgentCashLoadModal(username, leader ? (leader.balance || 0) : 0, leader ? (leader.district || "Dhaka") : "Dhaka");
        } else {
          this.showToastHub("No active agent leaders available to load cash!");
        }
      });
    }

    const topAmtInput = document.getElementById("leader-cash-amount-input");
    if (topAmtInput && !topAmtInput.dataset.bound) {
      topAmtInput.dataset.bound = "true";
      topAmtInput.addEventListener("input", () => {
        this.updateLeaderCashPreview();
      });
    }

    document.querySelectorAll(".leader-preset-pill").forEach(pill => {
      if (!pill.dataset.bound) {
        pill.dataset.bound = "true";
        pill.addEventListener("click", () => {
          const val = pill.getAttribute("data-val")!;
          const input = document.getElementById("leader-cash-amount-input") as HTMLInputElement;
          if (input) {
            input.value = val;
            this.updateLeaderCashPreview();
          }
        });
      }
    });

    document.querySelectorAll(".modal-preset-btn").forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = "true";
        btn.addEventListener("click", () => {
          const val = btn.getAttribute("data-val")!;
          const input = document.getElementById("modal-cash-amount") as HTMLInputElement;
          if (input) input.value = val;
        });
      }
    });

    const closeBtn = document.getElementById("leader-close-cash-modal-btn");
    const cancelBtn = document.getElementById("modal-cash-cancel-btn");
    const modal = document.getElementById("leader-cash-modal");

    const closeModal = () => modal?.classList.add("hidden");
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = "true";
      closeBtn.addEventListener("click", closeModal);
    }
    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = "true";
      cancelBtn.addEventListener("click", closeModal);
    }

    const topCashForm = document.getElementById("leader-quick-cash-form") as HTMLFormElement;
    if (topCashForm && !topCashForm.dataset.bound) {
      topCashForm.dataset.bound = "true";
      topCashForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = (document.getElementById("leader-cash-select-user") as HTMLSelectElement).value;
        const amount = parseFloat((document.getElementById("leader-cash-amount-input") as HTMLInputElement).value || "0");

        if (!username || amount <= 0) {
          this.showToastHub("Please select an agent leader and enter a valid positive amount!");
          return;
        }

        this.executeAgentCashLoad(username, amount, "Admin Quick Cash Load");
        topCashForm.reset();
        this.updateLeaderCashPreview();
      });
    }

    const modalCashForm = document.getElementById("modal-agent-cash-form") as HTMLFormElement;
    if (modalCashForm && !modalCashForm.dataset.bound) {
      modalCashForm.dataset.bound = "true";
      modalCashForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = (document.getElementById("modal-cash-target-username") as HTMLInputElement).value;
        const amount = parseFloat((document.getElementById("modal-cash-amount") as HTMLInputElement).value || "0");
        const note = (document.getElementById("modal-cash-note") as HTMLInputElement).value.trim() || "Admin Direct Fund Refill";

        if (!username || amount <= 0) {
          this.showToastHub("Please enter a valid positive amount!");
          return;
        }

        this.executeAgentCashLoad(username, amount, note);
        closeModal();
      });
    }

    const addNewBtn = document.getElementById("leader-add-new-btn");
    const addModal = document.getElementById("leader-add-modal");
    const closeAddModalBtn = document.getElementById("leader-close-add-modal-btn");
    const cancelAddModalBtn = document.getElementById("modal-add-cancel-btn");
    const addLeaderForm = document.getElementById("modal-add-leader-form") as HTMLFormElement;

    if (addNewBtn && !addNewBtn.dataset.bound) {
      addNewBtn.dataset.bound = "true";
      addNewBtn.addEventListener("click", () => {
        if (addModal) addModal.classList.remove("hidden");
      });
    }

    const closeAddModal = () => addModal?.classList.add("hidden");
    if (closeAddModalBtn && !closeAddModalBtn.dataset.bound) {
      closeAddModalBtn.dataset.bound = "true";
      closeAddModalBtn.addEventListener("click", closeAddModal);
    }
    if (cancelAddModalBtn && !cancelAddModalBtn.dataset.bound) {
      cancelAddModalBtn.dataset.bound = "true";
      cancelAddModalBtn.addEventListener("click", closeAddModal);
    }

    if (addLeaderForm && !addLeaderForm.dataset.bound) {
      addLeaderForm.dataset.bound = "true";
      addLeaderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = (document.getElementById("add-leader-username") as HTMLInputElement).value.trim().toLowerCase().replace(/\s+/g, "");
        const phone = (document.getElementById("add-leader-phone") as HTMLInputElement).value.trim();
        const email = (document.getElementById("add-leader-email") as HTMLInputElement).value.trim();
        const district = (document.getElementById("add-leader-district") as HTMLSelectElement).value;
        const commissionRate = parseFloat((document.getElementById("add-leader-commission") as HTMLInputElement).value || "5.0");
        const initialBalance = parseFloat((document.getElementById("add-leader-balance") as HTMLInputElement).value || "5000");
        const password = (document.getElementById("add-leader-password") as HTMLInputElement).value;

        if (!username || !phone || !email || !password) {
          this.showToastHub("Please fill in all required fields!");
          return;
        }

        const allPeople = [...(this.db.users || []), ...(this.db.staff || []), ...(this.db.agents || [])];
        const exists = allPeople.some((u: any) => u && u.username && u.username.toLowerCase() === username);
        if (exists) {
          this.showToastHub(`Username @${username} is already taken!`);
          return;
        }

        const emailExists = allPeople.some((u: any) => u && u.email && u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          this.showToastHub(`Email ${email} is already in use by another user!`);
          return;
        }

        const phoneExists = allPeople.some((u: any) => u && u.phone && u.phone === phone);
        if (phoneExists) {
          this.showToastHub(`Phone number ${phone} is already registered!`);
          return;
        }

        const confirmBtn = document.getElementById("modal-add-confirm-btn") as HTMLButtonElement;
        const origBtnText = confirmBtn ? confirmBtn.innerHTML : "Register Leader";
        if (confirmBtn) {
          confirmBtn.disabled = true;
          confirmBtn.innerHTML = `<i data-lucide="refresh-cw" class="animate-spin  text-sm"></i> Registering...`;
        }

        try {
          let uid = "agent_" + Date.now();
          if (typeof this.createStaffAccount === "function") {
            try {
              const res = await this.createStaffAccount({
                username,
                email,
                phone,
                district,
                role: "agent",
                commissionRate,
                balance: initialBalance,
                password: (typeof window !== "undefined" && typeof (window as any).hashPasswordWithUniqueSalt === "function" ? (window as any).hashPasswordWithUniqueSalt(password) : password),
                status: "active",
                earnedCommission: 0,
                totalBookings: 0
              });
              if (res && res.uid) {
                uid = res.uid;
              }
            } catch (authErr) {
              console.warn("createStaffAccount leader fallback:", authErr);
            }
          }

          const safeHashedLeaderPass = typeof window !== "undefined" && typeof (window as any).hashPasswordWithUniqueSalt === "function" 
            ? (window as any).hashPasswordWithUniqueSalt(password) 
            : password;

          const newAgentObj = {
            id: uid,
            uid: uid,
            username: username,
            name: username,
            email: email,
            phone: phone,
            district: district,
            region: district,
            role: "agent",
            commissionRate: commissionRate,
            balance: initialBalance,
            earnedCommission: 0,
            totalBookings: 0,
            password: safeHashedLeaderPass,
            dob: "1995-01-01",
            totDeposit: initialBalance,
            totWithdraw: 0,
            wins: 0,
            loss: 0,
            profit: 0,
            joinDate: new Date().toISOString().split("T")[0],
            status: "active",
            createdAt: new Date().toISOString(),
            refersCount: 0,
            referredUsers: [],
            rewardedMilestones: []
          };

          if (!this.db.agents) this.db.agents = [];
          this.db.agents.push(newAgentObj);
          if (!this.db.staff) this.db.staff = [];
          this.db.staff.push(newAgentObj);
          if (!this.db.users) this.db.users = [];
          if (!this.db.users.some((u: any) => u && u.id === newAgentObj.id)) {
            this.db.users.push(newAgentObj);
          }

          if (initialBalance > 0) {
            if (!this.db.transactions) this.db.transactions = [];
            this.db.transactions.push({
              id: "tx_" + Date.now(),
              userId: uid,
              userName: username,
              username: username,
              paymentMethod: "Admin Agent Cash Load",
              phone: phone,
              amount: initialBalance,
              transactionType: "Deposit",
              status: "complete",
              bonusAmount: 0,
              notes: "Initial Onboarding Balance Refill",
              date: new Date().toLocaleString("en-US", {hour12: true})
            });

            if (!this.db.agentLedger) this.db.agentLedger = [];
            this.db.agentLedger.push({
              id: "act_" + Date.now(),
              agentId: uid,
              agentUsername: username,
              timestamp: new Date().toISOString(),
              targetUser: username,
              description: `Initial Onboarding Purse Balance`,
              amount: initialBalance,
              commission: 0,
              status: "complete"
            });
          }

          await this.saveDB(true);
          this.showToastHub(`Successfully onboarded @${username} with ৳${initialBalance} initial balance!`);
          addLeaderForm.reset();
          closeAddModal();

          this.updateAgentHubStats();
          this.renderAgentLeadersDirectory();
          this.renderAgentHubSelect();
          this.renderRecentAgentCashLoads();
          this.updateLeaderCashPreview();
        } catch (err: any) {
          this.showToastHub(`Error onboarding agent: ${err.message || err}`);
        } finally {
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = origBtnText;
          }
        }
      });
    }
  },

  executeAgentCashLoad(this: any, username: string, amount: number, note: string) {
    const leader = getUnifiedStaffList(this.db).find((u: any) => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (!leader) {
      this.showToastHub("Agent account not found!");
      return;
    }

    const newBal = (parseFloat(leader.balance) || 0) + amount;
    leader.balance = newBal;
    const unameLower = username.toLowerCase();
    [this.db.users, this.db.staff, this.db.agents].forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach((item: any) => {
          if (item && (item.id === leader.id || (item.username && String(item.username).toLowerCase() === unameLower))) {
            item.balance = newBal;
          }
        });
      }
    });

    if (!this.db.transactions) this.db.transactions = [];
    this.db.transactions.push({
      id: "tx_" + Date.now(),
      userId: leader.id,
      userName: leader.username,
      username: leader.username,
      paymentMethod: "Admin Agent Cash Load",
      phone: leader.phone || "Internal Desk",
      amount: amount,
      transactionType: "Deposit",
      status: "complete",
      bonusAmount: 0,
      notes: note || "Admin Agent Cash Load",
      date: new Date().toLocaleString("en-US", {hour12: true})
    });

    if (!this.db.agentLedger) this.db.agentLedger = [];
    this.db.agentLedger.push({
      id: "act_" + Date.now(),
      agentId: leader.id,
      agentUsername: leader.username,
      timestamp: new Date().toISOString(),
      targetUser: leader.username,
      description: `Admin Cash Load Refill: ${note}`,
      amount: amount,
      commission: 0,
      status: "complete"
    });

    this.saveDB();
    this.showToastHub(`Successfully loaded ৳${(amount || 0).toLocaleString()} into @${leader.username}'s wallet!`);
    
    this.updateAgentHubStats();
    this.renderAgentLeadersDirectory();
    this.renderAgentHubSelect();
    this.renderRecentAgentCashLoads();
    this.updateLeaderCashPreview();
  },

  renderRecentAgentCashLoads(this: any) {
    const tbody = document.getElementById("hub-recent-cashloads-tbody");
    if (!tbody) return;

    const txs = (this.db.transactions || [])
      .filter((tx: any) => tx.paymentMethod === "Admin Agent Cash Load" || (tx.notes && tx.notes.includes("Admin Cash Load Refill")))
      .slice()
      .reverse()
      .slice(0, 15);

    if (txs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-500 font-sans italic">
            No agent cash refills recorded yet. Use the terminal above to load funds into an agent's wallet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = txs.map((tx: any) => {
      const dateStr = tx.date || (tx.timestamp ? new Date(tx.timestamp).toLocaleString("en-US", {hour12: true}) : "Recent");
      const agentUser = tx.userName || tx.username || "agent";
      const u = getUnifiedStaffList(this.db).find((user: any) => user.username === agentUser);
      const district = u ? (u.district || u.region || "Dhaka Zone") : "Zone";

      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">${dateStr}</td>
          <td class="p-3">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white font-mono">@${agentUser}</span>
              <span class="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-sans">${district}</span>
            </div>
          </td>
          <td class="p-3 font-bold text-emerald-400 font-mono tabular-nums">+৳${(tx.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-3 text-slate-300 font-sans text-xs max-w-xs truncate">${tx.notes || "Admin Direct Fund Refill"}</td>
          <td class="p-3 text-right">
            <span class="text-[9.5px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">COMPLETED</span>
          </td>
        </tr>
      `;
    }).join("");
  },

  renderAgentHubPendingList(this: any) {
    const container = document.getElementById("hub-approvals-list-container");
    const emptyState = document.getElementById("hub-empty-queue-state");
    if (!container || !emptyState) return;

    container.innerHTML = "";
    const pendings = getUnifiedStaffList(this.db).filter((u: any) => u.status === "pending_approval" && u.role === "agent");

    if (pendings.length === 0) {
      container.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.classList.add("flex");
      return;
    }

    container.classList.remove("hidden");
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");

    pendings.forEach((p: any) => {
      const card = document.createElement("div");
      card.className = "bg-slate-950/80 rounded-2xl p-5 shadow-lg border border-slate-850 hover:border-emerald-500/30 transition-all space-y-3.5";
      card.id = `hub-approval-card-${p.id}`;

      const initial = (p.username || "A").substring(0, 2).toUpperCase();

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
              ${initial}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-white font-mono">@${p.username}</h3>
                <span class="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">${p.district || p.region || "Dhaka Zone"}</span>
              </div>
              <p class="text-[11px] text-slate-400 font-mono mt-0.5">Phone: ${p.phone || "N/A"} • ID: #${p.id}</p>
            </div>
          </div>
          <span class="text-[9px] bg-amber-950/80 text-amber-400 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-800/40 font-mono font-bold uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-850 font-mono text-xs">
          <div class="flex items-center gap-2">
            <i data-lucide="credit-card" class=" text-emerald-400 text-sm"></i>
            <div>
              <span class="text-[10px] text-white block font-bold">NID Verified</span>
              <span class="text-[9px] text-slate-400 block">System Verified</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="award" class=" text-sky-400 text-sm"></i>
            <div>
              <span class="text-[10px] text-white block font-bold">Trade License</span>
              <span class="text-[9px] text-slate-400 block">Authorized</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1 font-mono text-xs">
          <button class="hub-decline-btn flex-1 py-2.5 rounded-xl bg-slate-900 text-rose-400 hover:bg-rose-955/50 border border-slate-800 hover:border-rose-800/40 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer" data-id="${p.id}">
            <i class="fa-solid fa-xmark"></i>
            <span>Decline</span>
          </button>
          <button class="hub-approve-btn flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer" data-id="${p.id}">
            <i data-lucide="check" class=""></i>
            <span>Approve Agent</span>
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll(".hub-approve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id")!;
        this.handleAgentHubApproval(id, "approved");
      });
    });

    container.querySelectorAll(".hub-decline-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id")!;
        this.handleAgentHubApproval(id, "declined");
      });
    });

    this.refreshIcons();
  },

  handleAgentHubApproval(this: any, userId: string, action: string) {
    const matched = getUnifiedStaffList(this.db).find((u: any) => u.id === userId);
    if (!matched) return;

    if (action === "approved") {
      matched.status = "active";
      [this.db.users, this.db.staff, this.db.agents].forEach(arr => {
        if (Array.isArray(arr)) {
          arr.forEach((item: any) => {
            if (item && item.id === userId) item.status = "active";
          });
        }
      });
      this.db.agentLedger = this.db.agentLedger || [];
      this.db.agentLedger.push({
        id: "act_" + Date.now(),
        agentId: matched.id,
        timestamp: new Date().toISOString(),
        description: `Approved recruitment of sub-agent @${matched.username} under recruiting leader @${matched.referredBy || "System"}.`,
        amount: 0,
        commission: 0
      });
      this.saveDB(true);
      this.showToastHub(`Agent @${matched.username} approved successfully!`);
    } else {
      this.db.users = (this.db.users || []).filter((u: any) => u.id !== userId);
      if (this.db.staff) this.db.staff = this.db.staff.filter((u: any) => u.id !== userId);
      if (this.db.agents) this.db.agents = this.db.agents.filter((u: any) => u.id !== userId);
      this.saveDB(true);
      this.showToastHub(`Application for @${matched.username} declined.`);
    }

    this.updateAgentHubStats();
    this.renderAgentHubSelect();
    this.renderAgentHubPendingList();
  },

  showToastHub(this: any, msg: string) {
    const isError = typeof msg === "string" && (msg.toLowerCase().includes("error") || msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("fill") || msg.toLowerCase().includes("failed"));
    if (typeof this.showToast === "function") {
      this.showToast(msg, isError ? "error" : "success");
      return;
    }
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-msg");
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
      toast.classList.add("translate-y-0", "opacity-100");
      setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
      }, 3000);
    } else {
      console.log("[Hub Notice]", msg);
    }
  },

  showAgentLeaderDetail(this: any, leaderId: string) {
    const leader = getUnifiedStaffList(this.db).find((u: any) => u.id === leaderId);
    if (!leader) return;

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    document.getElementById("agent-leaders-list-view")?.classList.add("hidden");
    document.getElementById("agent-leaders-detail-view")?.classList.remove("hidden");

    setText("detail-leader-avatar-initial", leader.username.charAt(0).toUpperCase());
    setText("detail-leader-username", `@${leader.username}`);
    setText("detail-leader-district-badge", (leader.district || "DHAKA").toUpperCase());
    setText("detail-leader-email", leader.email || "N/A");
    setText("detail-leader-phone", leader.phone || "N/A");
    
    const statusLbl = document.getElementById("detail-leader-status-lbl");
    if (statusLbl) {
      statusLbl.innerText = (leader.status || "active").toUpperCase();
      statusLbl.className = leader.status === "active" ? "font-bold uppercase text-emerald-400 font-mono" : "font-bold uppercase text-rose-400 font-mono";
    }

    setText("detail-leader-balance-lbl", `৳${(Number(leader.balance) || 0).toFixed(2)}`);
    setText("detail-leader-commission-lbl", `${parseFloat(leader.commissionRate || 5.0).toFixed(1)}%`);

    const target = leader.monthlyTargetTickets || 0;
    const progress = leader.monthlySalesProgress || 0;
    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
    
    setText("detail-leader-target-tickets", String(target));
    setText("detail-leader-target-reward", `৳${(Number(leader.monthlyTargetReward) || 0).toFixed(2)}`);

    let targetPoolName = "Any Active Pool";
    const targetLotteryId = leader.monthlyTargetLotteryId || "any";
    if (targetLotteryId !== "any") {
      const foundLot = (this.db.lotteries || []).find((l: any) => l.id === targetLotteryId);
      if (foundLot) {
        targetPoolName = `${foundLot.name} (৳${foundLot.entryFee})`;
      } else {
        targetPoolName = "Archived Pool";
      }
    }
    setText("detail-leader-target-pool", targetPoolName);
    setText("detail-leader-progress-pct", `${pct}%`);
    const progressBar = document.getElementById("detail-leader-progress-bar");
    if (progressBar) progressBar.style.width = `${pct}%`;
    setText("detail-leader-progress-val", `${progress} / ${target} Tickets`);

    const badgeEl = document.getElementById("detail-leader-mission-badge");
    if (badgeEl) {
      if (target <= 0) {
        badgeEl.innerText = "DISABLED";
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-slate-950 text-slate-500 border border-slate-800";
      } else if (progress >= target) {
        badgeEl.innerText = "COMPLETED 🎉";
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/40";
      } else {
        badgeEl.innerText = `${target - progress} LEFT`;
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/40 animate-pulse";
      }
    }

    const editBtn = document.getElementById("detail-leader-edit-profile-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        this.openUserEditModal(leader.id);
      };
    }

    const subAgentsTbody = document.getElementById("detail-leader-subagents-tbody");
    if (subAgentsTbody) {
      subAgentsTbody.innerHTML = "";
      const leaderSubs = getUnifiedStaffList(this.db).filter((u: any) => u.role === "subagent" && u.referredBy && u.referredBy.toLowerCase() === leader.username.toLowerCase());

      if (leaderSubs.length === 0) {
        subAgentsTbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-500 italic font-sans text-xs">No sub-agents recruited by this leader yet.</td></tr>`;
      } else {
        leaderSubs.forEach((sub: any) => {
          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition font-sans";
          
          const sTarget = sub.monthlyTargetTickets || 0;
          const sProgress = sub.monthlySalesProgress || 0;

          row.innerHTML = `
            <td class="p-3.5 text-left font-sans">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase select-none shrink-0">
                  ${sub.username.charAt(0)}
                </div>
                <div class="min-w-0">
                  <span class="text-white font-bold block truncate">@${sub.username}</span>
                  <span class="text-[9.5px] text-slate-500 block truncate font-mono select-all">${sub.email}</span>
                </div>
              </div>
            </td>
            <td class="p-3.5 text-slate-300 font-bold font-mono tabular-nums">৳${(sub.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td class="p-3.5 text-emerald-400 font-bold font-mono tabular-nums">${parseFloat(sub.commissionRate || 3.0).toFixed(1)}%</td>
            <td class="p-3.5 text-white font-bold font-mono tabular-nums">${sub.totalBookings || 0}</td>
            <td class="p-3.5 text-slate-400 font-mono tabular-nums">${sProgress} / ${sTarget}</td>
            <td class="p-3.5">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full ${sub.status === "active" ? "bg-emerald-400" : "bg-rose-400"}"></span>
                <span class="text-[10px] uppercase font-mono font-bold ${sub.status === "active" ? "text-emerald-400" : "text-rose-400"}">${sub.status || "active"}</span>
              </div>
            </td>
            <td class="p-3.5 text-right font-sans">
              <button class="leader-sub-view-btn border border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950 text-slate-300 text-[10px] py-1.5 px-3 rounded-lg transition cursor-pointer shadow-sm active:scale-95" data-id="${sub.id}">
                View Details
              </button>
            </td>
          `;

          row.querySelector(".leader-sub-view-btn")?.addEventListener("click", () => {
            this.currentAdminTab = "subagents-list";
            this.render();
            this.showSubAgentDetail(sub.id);
          });

          subAgentsTbody.appendChild(row);
        });
      }
    }

    const backBtn = document.getElementById("agent-leaders-detail-back-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        document.getElementById("agent-leaders-detail-view")?.classList.add("hidden");
        document.getElementById("agent-leaders-list-view")?.classList.remove("hidden");
      };
    }

    this.refreshIcons();
  },

  initAgentRecruitmentPanel(this: any) {
    const recruitBtn = document.getElementById("agent-recruitment-control-btn");
    if (!recruitBtn || recruitBtn.dataset.listenerAttached === "true") return;
    recruitBtn.dataset.listenerAttached = "true";

    const listView = document.getElementById("agent-leaders-list-view");
    const detailView = document.getElementById("agent-leaders-detail-view");
    const recruitView = document.getElementById("agent-leaders-recruitment-view");
    const backBtn = document.getElementById("agent-recruitment-back-btn");

    recruitBtn.addEventListener("click", () => {
      listView?.classList.add("hidden");
      detailView?.classList.add("hidden");
      recruitView?.classList.remove("hidden");
      this.renderRecruitmentPanel();
    });

    backBtn?.addEventListener("click", () => {
      recruitView?.classList.add("hidden");
      listView?.classList.remove("hidden");
      this.renderAgentLeadersTab();
    });

    const genBtn = document.getElementById("generate-recruitment-link-btn");
    genBtn?.addEventListener("click", () => {
      const leaderSelect = document.getElementById("recruit-leader-select") as HTMLSelectElement;
      const commRateInput = document.getElementById("recruit-commission-rate") as HTMLInputElement;
      const linkCard = document.getElementById("generated-link-card");
      const linkDisplay = document.getElementById("generated-link-display") as HTMLInputElement;

      if (!leaderSelect || !commRateInput || !linkCard || !linkDisplay) return;

      const leaderVal = leaderSelect.value;
      const commVal = parseFloat(commRateInput.value || "5.0");

      if (!leaderVal) {
        alert("Please select a recruiter agent leader first!");
        return;
      }

      const origin = window.location.origin;
      const inviteUrl = `${origin}/?role=agent&ref=${encodeURIComponent(leaderVal)}&comm=${commVal}`;

      linkDisplay.value = inviteUrl;
      linkCard.classList.remove("hidden");
      
      this.db.agentRecruitsLogs = this.db.agentRecruitsLogs || [];
      this.db.agentRecruitsLogs.push({
        id: "link_" + Date.now(),
        leader: leaderVal,
        commRate: commVal,
        timestamp: new Date().toISOString()
      });
      this.saveDB();

      alert("Success! Link generated. You can now copy and share it with potential sub-agents!");
    });

    const copyBtn = document.getElementById("copy-recruitment-link-btn");
    copyBtn?.addEventListener("click", () => {
      const linkDisplay = document.getElementById("generated-link-display") as HTMLInputElement;
      if (linkDisplay) {
        linkDisplay.select();
        navigator.clipboard.writeText(linkDisplay.value);
        alert("Recruitment invite link copied successfully to clipboard!");
      }
    });
  },

  renderRecruitmentPanel(this: any) {
    const allUnified = getUnifiedStaffList(this.db);
    const leaderSelect = document.getElementById("recruit-leader-select") as HTMLSelectElement;
    if (leaderSelect) {
      const leaders = allUnified.filter((u: any) => u.role === "agent");
      leaderSelect.innerHTML = leaders.map((l: any) => {
        return `<option value="${l.username}">@${l.username} (${l.district || "Dhaka"})</option>`;
      }).join("");

      if (leaders.length === 0) {
        leaderSelect.innerHTML = `<option value="">No Agent Leaders Registered</option>`;
      }
    }

    const container = document.getElementById("pending-agent-recruits-container");
    if (!container) return;
    container.innerHTML = "";

    const pendings = allUnified.filter((u: any) => u.status === "pending_approval" && u.role === "agent");

    if (pendings.length === 0) {
      container.innerHTML = `<div class="p-12 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">No pending sub-agent recruitment applications discovered.</div>`;
      return;
    }

    pendings.forEach((p: any) => {
      const card = document.createElement("div");
      card.className = "p-5 rounded-3xl bg-slate-950 border border-slate-850/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-300 hover:border-slate-800";

      card.innerHTML = `
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm select-none uppercase">
            ${p.username.substring(0, 2)}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-black text-white text-sm">@${p.username}</span>
              <span class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8.5px] font-mono text-amber-400 font-bold uppercase tracking-wider">Candidate</span>
            </div>
            <div class="text-xs text-slate-400 font-sans mt-0.5">
              <span>District: <strong class="text-white">${p.district || p.region || "Dhaka"}</strong></span>
              <span class="text-slate-600 select-none"> • </span>
              <span>Leader: <strong class="text-amber-400 font-mono">@${p.referredBy || "System"}</strong></span>
            </div>
            <span class="text-[10px] text-slate-500 font-mono mt-1 select-all">${p.email || "No Email"} • ${p.phone || "No Mobile"}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 font-sans self-end md:self-center">
          <button class="recruit-approve-btn py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95" data-id="${p.id}">
            <i data-lucide="check-circle" class=""></i>
            <span>Approve (অনুমোদন)</span>
          </button>
          <button class="recruit-decline-btn py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-rose-955/20 border border-slate-800 hover:border-rose-900/40 text-rose-455 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-id="${p.id}">
            <i data-lucide="x-circle" class=" text-rose-500"></i>
            <span>Decline (প্রত্যাখ্যান)</span>
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll(".recruit-approve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const applicant = getUnifiedStaffList(this.db).find((u: any) => u.id === id);
        if (!applicant) return;

        if (confirm(`Are you sure you want to APPROVE candidate @${applicant.username} to access the portal?`)) {
          applicant.status = "active";
          [this.db.users, this.db.staff, this.db.agents].forEach(arr => {
            if (Array.isArray(arr)) {
              arr.forEach((item: any) => {
                if (item && item.id === id) item.status = "active";
              });
            }
          });
          this.db.agentLedger = this.db.agentLedger || [];
          this.db.agentLedger.push({
            id: "act_" + Date.now(),
            agentId: applicant.id,
            timestamp: new Date().toISOString(),
            description: `Admin approved recruitment application of sub-agent @${applicant.username} under leader @${applicant.referredBy || "System"}.`,
            amount: 0,
            commission: 0
          });
          this.saveDB(true);
          this.showToastHub(`Sub-agent @${applicant.username} is now active and can log in successfully.`);
          this.renderRecruitmentPanel();
          this.renderAgentLeadersTab();
        }
      });
    });

    container.querySelectorAll(".recruit-decline-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const applicant = getUnifiedStaffList(this.db).find((u: any) => u.id === id);
        if (!applicant) return;

        if (confirm(`Are you sure you want to DECLINE & remove candidate @${applicant.username}'s application?`)) {
          this.db.users = (this.db.users || []).filter((u: any) => u.id !== id);
          if (this.db.staff) this.db.staff = this.db.staff.filter((u: any) => u.id !== id);
          if (this.db.agents) this.db.agents = this.db.agents.filter((u: any) => u.id !== id);
          this.saveDB(true);
          this.showToastHub(`Application declined and candidate account removed successfully.`);
          this.renderRecruitmentPanel();
        }
      });
    });

    this.refreshIcons();
  },

  renderSubAgentsListTab(this: any) {
    const gridEl = document.getElementById("subagents-list-cards-grid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const searchInput = document.getElementById("subagents-list-search-input") as HTMLInputElement;
    if (searchInput && !searchInput.dataset.listenerAttached) {
      searchInput.addEventListener("input", () => this.renderSubAgentsListTab());
      searchInput.dataset.listenerAttached = "true";
    }
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const allUnified = getUnifiedStaffList(this.db);
    const subagents = allUnified.filter((u: any) => {
      if (u.role !== "subagent") return false;
      if (query) {
        return u.username.toLowerCase().includes(query) ||
               (u.email || "").toLowerCase().includes(query) ||
               (u.phone || "").toLowerCase().includes(query) ||
               (u.referredBy || "").toLowerCase().includes(query);
      }
      return true;
    });

    const lotteries = this.db.lotteries || [];
    const tickets = this.db.tickets || [];
    
    const totalSubsCount = allUnified.filter((u: any) => u.role === "subagent").length;

    const subUsernames = new Set(allUnified.filter((u: any) => u.role === "subagent").map((u: any) => u.username.toLowerCase()));
    const subPlayers = (this.db.users || []).filter((u: any) => u.referredBy && subUsernames.has(u.referredBy.toLowerCase()));
    const totalPlayersReferred = subPlayers.length;

    let totalSalesVol = 0;
    const playerIds = new Set(subPlayers.map((p: any) => p.id));
    tickets.forEach((t: any) => {
      if (playerIds.has(t.userId)) {
        const lot = lotteries.find((l: any) => l.id === t.lotteryId);
        if (lot) totalSalesVol += (lot.entryFee || 100);
      }
    });

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setText("subagents-list-stat-count", `${totalSubsCount} Sub-agent${totalSubsCount !== 1 ? 's' : ''}`);
    setText("subagents-list-stat-sales", "৳" + (totalSalesVol || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    setText("subagents-list-stat-players", `${totalPlayersReferred} Player${totalPlayersReferred !== 1 ? 's' : ''}`);

    if (subagents.length === 0) {
      gridEl.innerHTML = `<div class="col-span-full p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-3xl">No sub-agent accounts matching the query discovered.</div>`;
      this.refreshIcons();
      return;
    }

    subagents.forEach((sub: any) => {
      const sTarget = sub.monthlyTargetTickets || 0;
      const sProgress = sub.monthlySalesProgress || 0;
      const pct = sTarget > 0 ? Math.min(100, Math.round((sProgress / sTarget) * 100)) : 0;

      const card = document.createElement("div");
      card.className = "flex flex-col p-5 rounded-3xl bg-slate-900 border border-slate-800/80 gap-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-750 cursor-pointer active:scale-[0.99]";

      let statusClass = sub.status === "active"
        ? "text-emerald-400 bg-emerald-950/20 border border-emerald-900/40"
        : "text-rose-455 bg-rose-955/20 border border-rose-900/40";

      let statusText = sub.status === "active" ? "● Active" : "● Suspended";

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-base text-white shadow-md shadow-indigo-950/30 select-none uppercase">
                ${sub.username.substring(0, 2).toUpperCase()}
              </div>
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 ${sub.status === "active" ? "bg-emerald-400" : "bg-rose-500"} border-2 border-slate-900 rounded-full"></span>
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-black text-white truncate text-sm">@${sub.username}</span>
                <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-indigo-500/10 text-[8.5px] font-mono font-bold uppercase tracking-wider text-indigo-400">SUB-AGENT</span>
              </div>
              <span class="text-[11px] text-slate-400 font-sans truncate">${sub.email || "No Email"} • ${sub.phone || "No Mobile"}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide ${statusClass}">
              ${statusText}
            </span>
          </div>
        </div>
        <div class="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850/40">
          <div class="flex justify-between items-center text-xs font-mono">
            <span class="text-[8.5px] text-slate-500 font-black uppercase tracking-wider">Mission Target Quota</span>
            <span class="text-xs font-black text-cyan-400 tabular-nums">${pct}% (${sProgress}/${sTarget})</span>
          </div>
          <div class="relative w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden p-0.5">
            <div class="absolute top-0.5 left-0.5 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs font-mono">
          <div class="p-2.5 bg-slate-950/40 border border-slate-850/30 rounded-xl flex flex-col">
            <span class="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Balance</span>
            <span class="text-[11px] font-black text-amber-300 mt-0.5 tabular-nums">৳${(sub.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div class="p-2.5 bg-slate-950/40 border border-slate-850/30 rounded-xl flex flex-col">
            <span class="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Comm. Rate</span>
            <span class="text-[11px] font-black text-white mt-0.5">${parseFloat(sub.commissionRate || 3.0).toFixed(1)}%</span>
          </div>
          <div class="p-2.5 bg-slate-950/40 border border-slate-850/30 rounded-xl flex flex-col">
            <span class="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Bookings</span>
            <span class="text-[11px] font-black text-emerald-400 mt-0.5">${sub.totalBookings || 0} Sales</span>
          </div>
        </div>
        <div class="flex items-center justify-between text-slate-550 font-mono text-[10px] border-t border-slate-800/40 pt-3">
          <span class="flex items-center gap-1.5 text-amber-450 font-bold">
            <i data-lucide="user" class=" text-[11px]"></i>
            Leader: @${sub.referredBy || "System"}
          </span>
          <button class="subagent-view-btn py-2 px-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-750 text-slate-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs active:scale-95" data-id="${sub.id}">
            <span>View Operator</span>
            <i data-lucide="arrow-right" class=" text-[9.5px]"></i>
          </button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        this.showSubAgentDetail(sub.id);
      });

      gridEl.appendChild(card);
    });

    gridEl.querySelectorAll(".subagent-view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id")!;
        this.showSubAgentDetail(id);
      });
    });

    this.refreshIcons();
  },

  showSubAgentDetail(this: any, subId: string) {
    const sub = getUnifiedStaffList(this.db).find((u: any) => u.id === subId);
    if (!sub) return;

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    document.getElementById("subagents-list-view")?.classList.add("hidden");
    document.getElementById("subagents-detail-view")?.classList.remove("hidden");

    setText("detail-sub-avatar-initial", sub.username.charAt(0).toUpperCase());
    setText("detail-sub-username", `@${sub.username}`);
    setText("detail-sub-parent-lbl", `@${sub.referredBy || "System"}`);
    setText("detail-sub-email", sub.email || "N/A");
    setText("detail-sub-phone", sub.phone || "N/A");
    
    const statusLbl = document.getElementById("detail-sub-status-lbl");
    if (statusLbl) {
      statusLbl.innerText = (sub.status || "active").toUpperCase();
      statusLbl.className = sub.status === "active" ? "font-bold uppercase text-emerald-400 font-mono" : "font-bold uppercase text-rose-400 font-mono";
    }

    setText("detail-sub-balance-lbl", `৳${(Number(sub.balance) || 0).toFixed(2)}`);
    setText("detail-sub-commission-lbl", `${parseFloat(sub.commissionRate || 3.0).toFixed(1)}%`);
    setText("detail-sub-bookings-lbl", `${sub.totalBookings || 0} Sales`);

    const target = sub.monthlyTargetTickets || 0;
    const progress = sub.monthlySalesProgress || 0;
    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
    
    setText("detail-sub-target-tickets", String(target));
    setText("detail-sub-target-reward", `৳${(Number(sub.monthlyTargetReward) || 0).toFixed(2)}`);

    let targetPoolName = "Any Active Pool";
    const targetLotteryId = sub.monthlyTargetLotteryId || "any";
    if (targetLotteryId !== "any") {
      const foundLot = (this.db.lotteries || []).find((l: any) => l.id === targetLotteryId);
      if (foundLot) {
        targetPoolName = `${foundLot.name} (৳${foundLot.entryFee})`;
      } else {
        targetPoolName = "Archived Pool";
      }
    }
    setText("detail-sub-target-pool", targetPoolName);
    setText("detail-sub-progress-pct", `${pct}%`);
    const progressBar = document.getElementById("detail-sub-progress-bar");
    if (progressBar) progressBar.style.width = `${pct}%`;
    setText("detail-sub-progress-val", `${progress} / ${target} Tickets`);

    const badgeEl = document.getElementById("detail-sub-mission-badge");
    if (badgeEl) {
      if (target <= 0) {
        badgeEl.innerText = "DISABLED";
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-slate-950 text-slate-500 border border-slate-800";
      } else if (progress >= target) {
        badgeEl.innerText = "COMPLETED 🎉";
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/40";
      } else {
        badgeEl.innerText = `${target - progress} LEFT`;
        badgeEl.className = "font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/40 animate-pulse";
      }
    }

    const editBtn = document.getElementById("detail-sub-edit-profile-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        this.openUserEditModal(sub.id);
      };
    }

    const playersTbody = document.getElementById("detail-sub-players-tbody");
    if (playersTbody) {
      playersTbody.innerHTML = "";
      const subPlayers = this.db.users.filter((u: any) => u.referredBy && u.referredBy.toLowerCase() === sub.username.toLowerCase() && u.role !== "subagent" && u.role !== "agent");

      if (subPlayers.length === 0) {
        playersTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 italic font-sans text-xs">No players registered under this operator yet.</td></tr>`;
      } else {
        subPlayers.forEach((player: any) => {
          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition font-mono";

          row.innerHTML = `
            <td class="p-3 text-left font-sans">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full ${player.status === "active" ? "bg-emerald-500" : "bg-rose-500"}"></span>
                <span class="text-white font-bold">@${player.username}</span>
              </div>
            </td>
            <td class="p-3 text-slate-300 font-bold font-mono">৳${(Number(player.balance) || 0).toFixed(2)}</td>
            <td class="p-3 text-slate-400 font-sans">${player.email || "N/A"}</td>
            <td class="p-3 text-slate-400">${player.phone || "N/A"}</td>
            <td class="p-3 text-right">
              <button class="sub-player-view-btn bg-slate-950 hover:bg-slate-850 text-slate-300 text-[10px] py-1 px-2 border border-slate-800 rounded transition cursor-pointer font-sans" data-id="${player.id}">
                Configure User
              </button>
            </td>
          `;

          row.querySelector(".sub-player-view-btn")?.addEventListener("click", () => {
            this.openUserEditModal(player.id);
          });

          playersTbody.appendChild(row);
        });
      }
    }

    const backBtn = document.getElementById("subagents-detail-back-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        document.getElementById("subagents-detail-view")?.classList.add("hidden");
        document.getElementById("subagents-list-view")?.classList.remove("hidden");
      };
    }

    this.refreshIcons();
  }
};
