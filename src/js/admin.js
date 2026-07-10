// ============================================================================
// ADMIN PANEL MODULAR SYSTEM
// ============================================================================

export const AdminModule = {
  renderAdmin() {
    const isModerator = this.currentUser && this.currentUser.role === "moderator";

    // Select Admin tab classes matching selection
    const adminTabBtns = document.querySelectorAll(".admin-tab-selector-btn");
    adminTabBtns.forEach(btn => {
      const tabId = btn.getAttribute("data-tab");

      if (isModerator) {
        // Permit: stats, users, lotteries, deposits, withdraws, messages
        const permittedTabs = ["stats", "users", "lotteries", "deposits", "withdraws", "messages"];
        if (!permittedTabs.includes(tabId)) {
          btn.classList.add("hidden");
          if (this.currentAdminTab === tabId) {
            this.currentAdminTab = "stats";
          }
        } else {
          btn.classList.remove("hidden");
        }
      } else {
        btn.classList.remove("hidden");
      }

      if (tabId === this.currentAdminTab) {
        btn.className = "admin-tab-selector-btn text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 transition bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15";
      } else {
        btn.className = "admin-tab-selector-btn text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 transition bg-slate-900 border border-slate-800 text-slate-400 hover:text-white";
      }
    });

    // Hide all viewports with safe guards
    const hideViewport = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    };
    hideViewport("admin-tab-stats");
    hideViewport("admin-tab-users");
    hideViewport("admin-tab-lotteries");
    hideViewport("admin-tab-deposits");
    hideViewport("admin-tab-withdraws");
    hideViewport("admin-tab-settings");
    hideViewport("admin-tab-gateways");
    hideViewport("admin-tab-sync-vault");
    hideViewport("admin-tab-messages");
    hideViewport("admin-tab-categories");
    hideViewport("admin-tab-website");
    hideViewport("admin-tab-reports");
    hideViewport("admin-tab-badge-requests");
    hideViewport("admin-tab-refer");
    hideViewport("admin-tab-vip");
    hideViewport("admin-tab-jackpot");
    hideViewport("admin-tab-tasks");
    hideViewport("admin-tab-agents");
    hideViewport("admin-tab-agent-leaders");
    hideViewport("admin-tab-subagents-list");
    hideViewport("admin-tab-events");

    // Dynamic pending reports counter
    const pendingRepsCount = (this.db.reports || []).filter(r => r.status === "pending").length;
    const badgeEl = document.getElementById("admin-reports-count-badge");
    if (badgeEl) badgeEl.innerText = pendingRepsCount;

    // Dynamic pending badge requests counter
    const pendingBadgeReqsCount = (this.db.badgeRequests || []).filter(br => br.status === "pending").length;
    const badgeReqsCountEl = document.getElementById("admin-badge-requests-count-badge");
    if (badgeReqsCountEl) {
      badgeReqsCountEl.innerText = pendingBadgeReqsCount;
      if (pendingBadgeReqsCount > 0) {
        badgeReqsCountEl.classList.remove("hidden");
      } else {
        badgeReqsCountEl.classList.add("hidden");
      }
    }

    // Show current tab viewport
    const currentViewport = document.getElementById(`admin-tab-${this.currentAdminTab}`);
    if (currentViewport) currentViewport.classList.remove("hidden");

    try {
      if (this.currentAdminTab === "stats") {
        this.renderAdminStats();
      } else if (this.currentAdminTab === "users") {
        this.renderAdminUsers();
      } else if (this.currentAdminTab === "lotteries") {
        this.renderAdminLotteries();
      } else if (this.currentAdminTab === "deposits") {
        this.renderAdminDeposits();
      } else if (this.currentAdminTab === "withdraws") {
        this.renderAdminWithdraws();
      } else if (this.currentAdminTab === "categories") {
        this.renderAdminCategories();
      } else if (this.currentAdminTab === "messages") {
        this.renderAdminMessages();
      } else if (this.currentAdminTab === "website") {
        this.renderAdminWebsite();
      } else if (this.currentAdminTab === "reports") {
        this.renderAdminReports();
      } else if (this.currentAdminTab === "badge-requests") {
        this.renderAdminBadgeRequests();
      } else if (this.currentAdminTab === "refer") {
        this.renderAdminRefer();
      } else if (this.currentAdminTab === "vip") {
        this.renderAdminVipClub();
      } else if (this.currentAdminTab === "jackpot") {
        this.renderAdminJackpot();
      } else if (this.currentAdminTab === "tasks") {
        this.renderAdminTasks();
      } else if (this.currentAdminTab === "settings" || this.currentAdminTab === "gateways") {
        this.renderAdminSettings();
      } else if (this.currentAdminTab === "sync-vault") {
        this.renderSyncVaultTab();
      } else if (this.currentAdminTab === "events") {
        this.renderAdminEvents();
      } else if (this.currentAdminTab === "agents") {
        this.renderAdminAgents();
      } else if (this.currentAdminTab === "agent-leaders") {
        this.renderAgentLeadersTab();
      } else if (this.currentAdminTab === "subagents-list") {
        this.renderSubAgentsListTab();
      }
    } catch (err) {
      console.error("Exception handling admin sub-tab render process for tab:", this.currentAdminTab, err);
    }

    // Flush any pending real-time security alerts/toasts
    this.flushAdminToasts();
  },

  renderAdminStats() {
    const totalUsers = this.db.users.length;
    const activeLotteries = this.db.lotteries.filter(l => l.status === "active").length;
    const completedLotteries = this.db.lotteries.filter(l => l.status === "drawn").length;

    const totalDepositedApproved = this.db.deposits.filter(d => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);
    const pendingDeposCount = this.db.deposits.filter(d => d.status === "pending").length;
    const pendingWdsCount = this.db.withdrawals.filter(w => w.status === "pending").length;
    const totalWdsApproved = this.db.withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);

    let actualPaidTicketSpent = 0;
    this.db.tickets.forEach(ticket => {
      const lot = this.db.lotteries.find(l => l.id === ticket.lotteryId);
      if (lot) actualPaidTicketSpent += lot.entryFee;
    });

    document.getElementById("admin-stat-sales").innerText = `৳${actualPaidTicketSpent}`;
    document.getElementById("admin-stat-players").innerText = totalUsers;
    document.getElementById("admin-stat-deposits").innerText = `৳${totalDepositedApproved}`;
    document.getElementById("admin-stat-pending").innerText = `${pendingDeposCount + pendingWdsCount} Ops`;

    document.getElementById("admin-metric-total-pools").innerText = `${this.db.lotteries.length} pools`;
    document.getElementById("admin-metric-active-pools").innerText = `${activeLotteries} active Pools`;
    document.getElementById("admin-metric-total-completes").innerText = `${completedLotteries} completed Pools`;
    document.getElementById("admin-metric-withdrawn-approved").innerText = `৳${totalWdsApproved} paid out`;
  },

  renderAdminUsers() {
    const listEl = document.getElementById("admin-users-list-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const clearBtn = document.getElementById("admin-players-clear-search-btn");
    if (clearBtn) {
      if (this.adminPlayersSearchQuery) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }

    let filteredUsers = this.db.users || [];
    const query = (this.adminPlayersSearchQuery || "").toLowerCase().trim();
    if (query) {
      filteredUsers = filteredUsers.filter(u => {
        const usernameMatch = (u.username || "").toLowerCase().includes(query);
        const emailMatch = (u.email || "").toLowerCase().includes(query);
        const phoneMatch = (u.phone || "").toLowerCase().includes(query);
        return usernameMatch || emailMatch || phoneMatch;
      });
    }

    if (filteredUsers.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="4" class="p-8 text-center text-slate-500 font-mono text-[10px]">
            No matching players found for search term "${query}"
          </td>
        </tr>
      `;
      return;
    }

    filteredUsers.forEach(u => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800 text-xs";

      let statusColor = u.status === "active" ? "bg-green-950 text-green-400 border border-green-800/40" :
                         u.status === "blocked" ? "bg-amber-950 text-amber-400 border border-amber-800/40" :
                         "bg-red-950 text-red-500 border border-red-800/30";

      let customBadgeBadge = "";
      if (u.customBadge) {
        const adminBadgeIcons = {
          vip: "💎 VIP",
          moderator: "🛡️ MOD",
          star: "⭐ STAR",
          premium: "✨ PREM",
          pro: "🔥 PRO",
          legend: "👑 LGND"
        };
        const label = adminBadgeIcons[u.customBadge] || u.customBadge.toUpperCase();
        customBadgeBadge = `<span class="bg-indigo-950/80 text-indigo-300 text-[8px] font-bold px-1.5 py-0.2 rounded ml-1 uppercase border border-indigo-900/50">${label}</span>`;
      }

      row.innerHTML = `
        <td class="p-4">
          <div class="font-bold text-white flex items-center gap-1">@${u.username} ${customBadgeBadge}</div>
          <div class="text-[10px] text-slate-500 font-mono">${u.email} ${u.phone ? `• ${u.phone}` : ""}</div>
        </td>
        <td class="p-4 font-mono font-bold text-cyan-400">৳${u.balance.toFixed(2)}</td>
        <td class="p-4">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono ${statusColor}">
            ${u.status.toUpperCase()}
          </span>
        </td>
        <td class="p-4 text-right">
          <button class="admin-edit-player-btn bg-slate-800 text-slate-300 py-1.5 px-3 rounded-xl hover:bg-slate-700 transition cursor-pointer" data-id="${u.id}">
            Modify
          </button>
        </td>
      `;

      listEl.appendChild(row);
    });

    document.querySelectorAll(".admin-edit-player-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const uId = e.currentTarget.getAttribute("data-id");
        this.openUserEditModal(uId);
      });
    });
  },

  renderAdminCategories() {
    const listEl = document.getElementById("admin-categories-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    this.db.categories.forEach(cat => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/60";

      const showPrizes = cat.type === "multi" ? cat.defaultPrizes : "—";
      const badgeClass = cat.type === "multi" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : "bg-cyan-950 text-cyan-400 border border-cyan-800/40";

      row.innerHTML = `
        <td class="p-3 font-bold text-white">${cat.label}</td>
        <td class="p-3 font-mono text-slate-400">${cat.name}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${badgeClass}">
            ${cat.type === "multi" ? "MULTI WINNER SPLIT" : "SINGLE WINNER"}
          </span>
        </td>
        <td class="p-3 font-mono text-cyan-400">${showPrizes}</td>
        <td class="p-3 text-right">
          <button class="admin-delete-category-btn bg-red-950 hover:bg-red-950/80 text-red-400 border border-red-900/40 text-[9px] font-bold py-1 px-2.5 rounded-lg transition" data-id="${cat.id}">
            Delete
          </button>
        </td>
      `;

      listEl.appendChild(row);
    });

    document.querySelectorAll(".admin-delete-category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-id");
        const matched = this.db.categories.find(c => c.id === catId);
        if (!matched) return;

        if (["c1", "c2", "c3", "c4", "c5"].includes(catId)) {
          this.showToast("Cannot delete core defaults, only user custom ones!", "error");
          return;
        }

        if (confirm(`Remove custom category '${matched.label}' permanently?`)) {
          this.db.categories = this.db.categories.filter(c => c.id !== catId);
          this.saveDB();
          this.renderAdminCategories();
          this.showToast("Custom category wiped successfully.", "success");
        }
      });
    });
  },

  escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  async fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  },

  async getClientIP() {
    try {
      const res = await this.fetchWithTimeout("https://api.ipify.org?format=json", {}, 2000);
      const data = await res.json();
      return data.ip || "127.0.0.1";
    } catch (err) {
      let storedIp = localStorage.getItem("lw_simulated_ip");
      if (!storedIp) {
        const randA = Math.floor(Math.random() * 150) + 100;
        const randB = Math.floor(Math.random() * 200) + 20;
        storedIp = `103.45.${randA}.${randB}`;
        localStorage.setItem("lw_simulated_ip", storedIp);
      }
      return storedIp;
    }
  },

  async getIPDetails() {
    try {
      const response = await this.fetchWithTimeout("https://ipapi.co/json/", {}, 2000);
      if (response.ok) {
        const details = await response.json();
        return {
          ip: details.ip || "127.0.0.1",
          country: details.country_name || "",
          org: details.org || "",
          timezone: details.timezone || "",
          region: details.region || ""
        };
      }
    } catch (e) {
      console.warn("Retrying IP details fetch via fallback due to blocker", e);
    }
    const ip = await this.getClientIP();
    return { ip, country: "", org: "", timezone: "", region: "" };
  },

  isVPN(details) {
    if (!details) return false;
    const orgLower = (details.org || "").toLowerCase();
    const vpnKeywords = [
      "vpn", "proxy", "hosting", "cloud", "server", "datacenter", "mullvad", 
      "nordvpn", "expressvpn", "surfshark", "digitalocean", "linode", "ovh", 
      "colocation", "amazon", "google", "microsoft", "leaseweb", "vultr", "packet", 
      "private internet", "windscribe", "tor", "exit-node", "proton", "cloudflare", 
      "fastly", "dedicated", "contabo", "interserver", "hetzner"
    ];
    const isVpnOrg = vpnKeywords.some(keyword => orgLower.includes(keyword));
    if (isVpnOrg) return true;

    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (details.timezone && clientTimezone && details.timezone !== clientTimezone) {
      return true;
    }
    return false;
  },

  triggerAdminSecurityAlert(type, message) {
    if (!this.db.securityLogs) {
      this.db.securityLogs = [];
    }
    const newLog = {
      id: "sec_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      type: type, 
      message: message,
      timestamp: new Date().toISOString()
    };
    this.db.securityLogs.unshift(newLog);
    
    if (this.db.securityLogs.length > 150) {
      this.db.securityLogs = this.db.securityLogs.slice(0, 150);
    }

    if (!this.db.pendingAdminToasts) {
      this.db.pendingAdminToasts = [];
    }
    this.db.pendingAdminToasts.push({
      id: newLog.id,
      message: message,
      type: type
    });

    this.saveDB();

    if (this.isAdminMode) {
      this.flushAdminToasts();
    }
  },

  flushAdminToasts() {
    if (!this.isAdminMode) return;
    const toasts = this.db.pendingAdminToasts || [];
    if (toasts.length === 0) return;

    toasts.forEach(t => {
      let icon = "fa-solid fa-shield-halved text-rose-500 mr-2";
      if (t.type === "duplicate_ip") {
        icon = "fa-solid fa-fingerprint text-red-500 animate-bounce mr-2";
      } else if (t.type === "region_restriction") {
        icon = "fa-solid fa-earth-asia text-amber-500 animate-spin mr-2";
      }
      
      this.showToast(`<span class="flex items-center gap-1 font-mono text-[10px] text-rose-400">
        <i class="${icon}"></i>
        <strong>[AUTO-SECURITY]</strong> ${this.escapeHTML(t.message)}
      </span>`, "error");
    });

    this.db.pendingAdminToasts = [];
    this.saveDB();

    if (this.currentAdminTab === "refer") {
      this.renderAdminRefer();
    }
  },

  renderAdminMessages() {
    const listEl = document.getElementById("admin-msg-history-list");
    const countEl = document.getElementById("admin-msg-sent-count");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    if (countEl) countEl.innerText = `${msgs.length} Sent`;

    if (msgs.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="5" class="py-6 text-center text-slate-500 font-mono text-[10px]">No sent messages history recorded.</td>
        </tr>
      `;
      return;
    }

    const sorted = [...msgs].sort((a, b) => new Date(b.date) - new Date(a.date));

    listEl.innerHTML = sorted.map(m => {
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const recipientText = m.recipientType === "bulk" 
        ? `<span class="bg-cyan-950/45 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded text-[9px] font-sans font-bold">ALL USERS</span>` 
        : `<span class="bg-purple-950/45 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold">@${m.targetUsername}</span>`;

      let catBadge = "";
      if (m.category === "general") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-slate-950 text-slate-400 py-0.5 px-2 rounded-md border border-slate-800">📢 General</span>`;
      } else if (m.category === "deposit") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-emerald-950/45 text-emerald-400 py-0.5 px-2 rounded-md border border-emerald-900/20">💰 Deposit</span>`;
      } else if (m.category === "withdrawal") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-rose-955/45 text-rose-400 py-0.5 px-2 rounded-md border border-rose-900/20">💸 Payout</span>`;
      } else if (m.category === "bonus") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-amber-950/45 text-amber-400 py-0.5 px-2 rounded-md border border-amber-900/20">🎁 Bonus</span>`;
      } else if (m.category === "alert") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-yellow-950/45 text-yellow-400 py-0.5 px-2 rounded-md border border-yellow-900/20">⚠️ Alert</span>`;
      }

      return `
        <tr class="border-b border-slate-800/40 hover:bg-slate-950/20 transition">
          <td class="py-3 font-mono">${recipientText}</td>
          <td class="py-3">${catBadge}</td>
          <td class="py-3 font-sans text-slate-200">
            <div class="font-bold text-[11px]">${this.escapeHTML(m.subject)}</div>
            <div class="text-[9px] text-slate-500 mt-0.5 max-w-xs break-words">${this.escapeHTML(m.content)}</div>
          </td>
          <td class="py-3 font-mono text-[10px] text-slate-400">${dateStr}</td>
          <td class="py-3 text-right">
            <button class="delete-admin-msg-btn text-rose-500 hover:text-rose-400 p-1 bg-rose-955/25 border border-rose-900/20 hover:border-rose-800/45 rounded-lg active:scale-95 transition cursor-pointer" data-id="${m.id}" title="Delete msg">
              <i class="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    listEl.querySelectorAll(".delete-admin-msg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.db.messages = (this.db.messages || []).filter(m => m.id !== id);
        this.saveDB();
        this.renderAdminMessages();
        this.showToast("Message deleted from records.", "info");
      });
    });
  },

  renderUserInbox() {
    if (!this.currentUser) return;

    const listEl = document.getElementById("user-inbox-list");
    const badgeEl = document.getElementById("user-inbox-unread-badge");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    const username = this.currentUser.username.toLowerCase();

    const userMsgs = msgs.filter(m => {
      if (m.recipientType === "bulk") return true;
      if (m.recipientType === "specific" && m.targetUsername && m.targetUsername.toLowerCase() === username) return true;
      return false;
    });

    const sorted = [...userMsgs].sort((a, b) => new Date(b.date) - new Date(a.date));

    const unreadCount = sorted.filter(m => !(m.readBy || []).includes(this.currentUser.username)).length;
    if (badgeEl) {
      badgeEl.innerText = `${unreadCount} Unread`;
      if (unreadCount > 0) {
        badgeEl.className = "text-[9px] font-bold bg-pink-950 text-pink-400 border border-pink-900 px-2 py-0.5 rounded-lg animate-pulse";
      } else {
        badgeEl.className = "text-[9px] font-bold bg-slate-950 text-slate-500 border border-slate-900 px-2 py-0.5 rounded-lg";
      }
    }

    if (sorted.length === 0) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-slate-500 font-mono text-[10px]">
          <i class="fa-solid fa-envelope text-slate-800 text-2xl block mb-2"></i>
          Your personal inbox is empty. No messages registered.
        </div>
      `;
      return;
    }

    listEl.innerHTML = sorted.map(m => {
      const isUnread = !(m.readBy || []).includes(this.currentUser.username);
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      
      let catIcon = "fa-bell";
      let catColor = "text-cyan-400 bg-cyan-950/40 border-cyan-900/30";
      if (m.category === "deposit") {
        catIcon = "fa-coins";
        catColor = "text-emerald-400 bg-emerald-950/40 border-emerald-900/30";
      } else if (m.category === "withdrawal") {
        catIcon = "fa-money-bill-transfer";
        catColor = "text-rose-400 bg-rose-955/40 border-rose-900/30";
      } else if (m.category === "bonus") {
        catIcon = "fa-gift";
        catColor = "text-amber-400 bg-amber-950/40 border-amber-900/30";
      } else if (m.category === "alert") {
        catIcon = "fa-triangle-exclamation";
        catColor = "text-yellow-400 bg-yellow-950/40 border-yellow-900/30";
      }

      const readActionMark = isUnread 
        ? `<button class="mark-msg-read-btn text-[8px] tracking-tight bg-cyan-600 hover:bg-cyan-550 text-white font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer" data-id="${m.id}">Mark Read</button>`
        : `<span class="text-[8px] font-mono text-slate-600 font-semibold uppercase flex items-center gap-1"><i class="fa-solid fa-check text-emerald-500 text-[8px]"></i> Read</span>`;

      return `
        <div class="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900/80 hover:border-slate-800 transition relative overflow-hidden group space-y-2">
          ${isUnread ? '<div class="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-bl-full animate-pulse"></div>' : ''}
          
          <div class="flex justify-between items-start gap-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg ${catColor} border flex items-center justify-center">
                <i class="fa-solid ${catIcon} text-[9px]"></i>
              </div>
              <div>
                <span class="text-[11px] font-bold text-white block ${isUnread ? 'text-cyan-300' : 'text-slate-300'} break-words">${this.escapeHTML(m.subject)}</span>
                <span class="text-[8px] font-mono text-slate-500">${dateStr}</span>
              </div>
            </div>
            ${readActionMark}
          </div>
          
          <p class="text-[10px] text-slate-400 leading-normal font-sans pt-1 break-words">${this.escapeHTML(m.content)}</p>
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".mark-msg-read-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const found = (this.db.messages || []).find(m => m.id === id);
        if (found) {
          if (!found.readBy) found.readBy = [];
          if (!found.readBy.includes(this.currentUser.username)) {
            found.readBy.push(this.currentUser.username);
            this.saveDB();
            this.renderUserInbox();
            this.showToast("Message marked as read.", "success");
          }
        }
      });
    });
  },

  renderAdminWebsite() {
    const s = this.db.settings;
    if (!s) return;

    const siteNameEl = document.getElementById("sys-site-name");
    const siteInfoEl = document.getElementById("sys-site-info");
    const signupBonusEl = document.getElementById("sys-signup-bonus");
    const supportNumEl = document.getElementById("sys-support-num");
    const authFooterEl = document.getElementById("sys-auth-footer-text");

    if (siteNameEl) siteNameEl.value = s.siteName || "";
    if (siteInfoEl) siteInfoEl.value = s.siteInfo || "";
    if (signupBonusEl) signupBonusEl.value = s.signupBonus ?? 100;
    if (supportNumEl) supportNumEl.value = s.supportNumber || "";
    if (authFooterEl) authFooterEl.value = s.authFooterText || "";
  },

  renderAdminReports() {
    const postTabBtn = document.getElementById("admin-subtab-post-reports");
    const commentTabBtn = document.getElementById("admin-subtab-comment-reports");

    const postContainer = document.getElementById("admin-post-reports-container");
    const commentContainer = document.getElementById("admin-comment-reports-container");

    if (!this.currentAdminReportsTab) {
      this.currentAdminReportsTab = "post";
    }

    if (this.currentAdminReportsTab === "post") {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (postContainer) postContainer.classList.remove("hidden");
      if (commentContainer) commentContainer.classList.add("hidden");
    } else {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (postContainer) postContainer.classList.add("hidden");
      if (commentContainer) commentContainer.classList.remove("hidden");
    }

    const postReports = (this.db.reports || []).filter(r => r.type === "post" && r.status === "pending");
    const commentReports = (this.db.reports || []).filter(r => r.type === "comment" && r.status === "pending");

    const postCountBadge = document.getElementById("admin-post-reports-count");
    if (postCountBadge) postCountBadge.innerText = postReports.length;

    const commentCountBadge = document.getElementById("admin-comment-reports-count");
    if (commentCountBadge) commentCountBadge.innerText = commentReports.length;

    const postList = document.getElementById("admin-post-reports-list");
    if (postList) {
      postList.innerHTML = "";
      if (postReports.length === 0) {
        postList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i class="fa-solid fa-circle-check text-slate-700 text-lg block mb-1"></i>
            No pending post reports. Clear slate!
          </div>
        `;
      } else {
        postReports.forEach(rep => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-rose-500 font-bold">Post Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-red-950/40 text-red-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-red-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Post Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-955/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-user-slash mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-hourglass-half mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-calendar-days mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-post bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-post-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-trash mr-1"></i> Delete Post Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i class="fa-solid fa-check mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          postList.appendChild(card);
        });
      }
    }

    const commentList = document.getElementById("admin-comment-reports-list");
    if (commentList) {
      commentList.innerHTML = "";
      if (commentReports.length === 0) {
        commentList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i class="fa-solid fa-circle-check text-slate-700 text-lg block mb-1"></i>
            No pending comment reports. Clear slate!
          </div>
        `;
      } else {
        commentReports.forEach(rep => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-yellow-500 font-bold">Comment Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-amber-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Comment Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-955/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-user-slash mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-hourglass-half mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-calendar-days mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-comment bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-comment-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-trash mr-1"></i> Delete Reply Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i class="fa-solid fa-check mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          commentList.appendChild(card);
        });
      }
    }
  },

  populateCreatePoolCategories() {
    const selectEl = document.getElementById("create-pool-cat");
    if (!selectEl) return;
    
    const preValue = selectEl.value;
    selectEl.innerHTML = "";
    
    this.db.categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.innerText = `${cat.label} (${cat.type === "multi" ? "Multi Winners" : "Single Winner"})`;
      selectEl.appendChild(opt);
    });
    
    if (preValue && this.db.categories.some(c => c.name === preValue)) {
      selectEl.value = preValue;
    } else if (this.db.categories.length > 0) {
      selectEl.value = this.db.categories[0].name;
    }
  },

  openUserEditModal(id) {
    const u = this.db.users.find(user => user.id === id);
    if (!u) return;

    document.getElementById("edit-player-modal-id").innerText = `@${u.username}`;
    document.getElementById("edit-player-id-field").value = u.id;
    document.getElementById("edit-player-balance").value = u.balance;
    document.getElementById("edit-player-email").value = u.email;
    document.getElementById("edit-player-phone").value = u.phone;
    document.getElementById("edit-player-password").value = ""; 
    document.getElementById("edit-player-status").value = u.status;
    
    const badgeDropdown = document.getElementById("edit-player-badge");
    if (badgeDropdown) {
      badgeDropdown.value = u.customBadge || "";
    }

    const roleSelect = document.getElementById("edit-player-role");
    const commInput = document.getElementById("edit-player-commission");
    const commWrapper = document.getElementById("edit-player-commission-wrapper");
    const districtSelect = document.getElementById("edit-player-district");
    const districtWrapper = document.getElementById("edit-player-district-wrapper");
    const targetWrapper = document.getElementById("edit-player-target-wrapper");
    const targetTicketsInput = document.getElementById("edit-agent-target-tickets");
    const targetRewardInput = document.getElementById("edit-agent-target-reward");

    if (districtSelect) {
      districtSelect.value = u.district || "Dhaka";
    }

    if (targetTicketsInput) {
      targetTicketsInput.value = u.monthlyTargetTickets !== undefined ? u.monthlyTargetTickets : 0;
    }
    if (targetRewardInput) {
      targetRewardInput.value = u.monthlyTargetReward !== undefined ? u.monthlyTargetReward : 0;
    }

    const targetLotterySelect = document.getElementById("edit-agent-target-lottery");
    if (targetLotterySelect) {
      targetLotterySelect.innerHTML = '<option value="any">Any Active Pool</option>';
      const activeLotts = this.db.lotteries.filter(l => l.status === "active");
      activeLotts.forEach(lot => {
        const opt = document.createElement("option");
        opt.value = lot.id;
        opt.innerText = `${lot.name} (৳${lot.entryFee})`;
        targetLotterySelect.appendChild(opt);
      });
      targetLotterySelect.value = u.monthlyTargetLotteryId || "any";
    }

    if (roleSelect && commWrapper) {
      roleSelect.value = u.role || "player";
      if (commInput) {
        commInput.value = u.commissionRate !== undefined ? u.commissionRate : 5.0;
      }
      const toggleComm = () => {
        if (roleSelect.value === "agent") {
          commWrapper.classList.remove("hidden");
          if (districtWrapper) districtWrapper.classList.remove("hidden");
          if (targetWrapper) targetWrapper.classList.remove("hidden");
        } else {
          commWrapper.classList.add("hidden");
          if (districtWrapper) districtWrapper.classList.add("hidden");
          if (targetWrapper) targetWrapper.classList.add("hidden");
        }
      };
      toggleComm();
      roleSelect.onchange = toggleComm;
    }

    document.getElementById("admin-user-edit-modal").classList.remove("hidden");
  },

  savePlayerEditFromModal() {
    const id = document.getElementById("edit-player-id-field").value;
    const u = this.db.users.find(user => user.id === id);
    if (!u) return;

    u.balance = parseFloat(document.getElementById("edit-player-balance").value || "0");
    u.email = document.getElementById("edit-player-email").value;
    u.phone = document.getElementById("edit-player-phone").value;
    u.status = document.getElementById("edit-player-status").value;
    
    const badgeDropdown = document.getElementById("edit-player-badge");
    if (badgeDropdown) {
      u.customBadge = badgeDropdown.value;
    }

    const roleSelect = document.getElementById("edit-player-role");
    if (roleSelect) {
      u.role = roleSelect.value;
    }
    const commInput = document.getElementById("edit-player-commission");
    if (commInput) {
      u.commissionRate = parseFloat(commInput.value || "5.0");
    }
    const districtSelectVal = document.getElementById("edit-player-district");
    if (districtSelectVal) {
      u.district = districtSelectVal.value;
    }

    const targetTicketsInput = document.getElementById("edit-agent-target-tickets");
    const targetRewardInput = document.getElementById("edit-agent-target-reward");
    const targetLotterySelect = document.getElementById("edit-agent-target-lottery");
    if (targetTicketsInput && targetRewardInput) {
      const newTarget = parseInt(targetTicketsInput.value || "0");
      const newReward = parseFloat(targetRewardInput.value || "0");
      const newLotteryId = targetLotterySelect ? targetLotterySelect.value : "any";
      if (u.monthlyTargetTickets !== newTarget || u.monthlyTargetReward !== newReward || u.monthlyTargetLotteryId !== newLotteryId) {
        u.monthlyTargetTickets = newTarget;
        u.monthlyTargetReward = newReward;
        u.monthlyTargetLotteryId = newLotteryId;
        u.monthlyTargetClaimed = false; // reset claimed status for new targets
        u.monthlySalesProgress = 0; // reset progress for the new specific pool/target
      }
    }

    const newPass = document.getElementById("edit-player-password").value.trim();
    if (newPass) {
      u.password = newPass;
      this.showToast(`Password successfully reset for @${u.username}!`, "success");
    }

    this.saveDB();
    this.showToast("Player edited successfully!", "success");
    document.getElementById("admin-user-edit-modal").classList.add("hidden");
    this.render();
  },

  renderAdminAgents() {
    const listEl = document.getElementById("admin-agents-list-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const searchInput = document.getElementById("agents-search-input");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const staffAccounts = this.db.users.filter(u => {
      const isStaff = u.role === "agent" || u.role === "moderator";
      if (!isStaff) return false;
      if (query) {
        return u.username.toLowerCase().includes(query) || (u.email || "").toLowerCase().includes(query) || (u.phone || "").toLowerCase().includes(query);
      }
      return true;
    });

    const agentsCount = this.db.users.filter(u => u.role === "agent").length;
    const modsCount = this.db.users.filter(u => u.role === "moderator").length;
    
    const totalComms = (this.db.agentLedger || []).reduce((sum, log) => sum + (log.commission || 0), 0);
    const initialSeedComms = this.db.users.filter(u => u.role === "agent").reduce((sum, u) => sum + (u.earnedCommission || 0), 0);

    document.getElementById("agents-stat-count").innerText = `${agentsCount} Agents`;
    document.getElementById("moderators-stat-count").innerText = `${modsCount} Mods`;
    document.getElementById("agents-stat-commission").innerText = `৳${(totalComms + initialSeedComms).toFixed(2)}`;

    if (staffAccounts.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-500 font-sans">
            No registered field agents or system moderators found.
          </td>
        </tr>
      `;
      return;
    }

    staffAccounts.forEach(staff => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";

      const badgeColor = staff.role === "agent" ? "bg-emerald-950 text-emerald-400 border-emerald-800/30" : "bg-cyan-950 text-cyan-400 border-cyan-800/30";
      const isBlocked = staff.status === "blocked" || staff.status === "permanently_banned";

      row.innerHTML = `
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${isBlocked ? "bg-red-500" : "bg-emerald-500"}"></span>
            <div>
              <span class="text-white font-bold leading-none block">@${staff.username} ${staff.role === "agent" ? `<span class="ml-1 text-[8.5px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 rounded px-1 py-0.2 font-mono uppercase font-black">${staff.district || "Dhaka"}</span>` : ""}</span>
              <span class="text-[9.5px] text-slate-500 block select-all font-mono">${staff.email}</span>
            </div>
          </div>
        </td>
        <td class="p-3">
          <div>
            <span class="text-slate-300 font-bold font-mono">৳${(staff.balance || 0).toFixed(2)}</span>
            ${staff.role === "agent" ? `
              <span class="text-[9px] text-slate-500 block leading-tight">Rate: <strong class="text-emerald-400">${(staff.commissionRate || 5.0).toFixed(1)}%</strong></span>
            ` : ""}
          </div>
        </td>
        <td class="p-3">
          ${staff.role === "agent" ? `
            <div>
              <span class="text-slate-300 select-none block leading-none">Bookings: <strong class="text-white font-mono">${staff.totalBookings || 0}</strong></span>
              <span class="text-[9px] text-emerald-400 font-mono block leading-none mt-1">Earned: ৳${(staff.earnedCommission || 0).toFixed(2)}</span>
            </div>
          ` : `
            <span class="text-[10px] text-slate-400 italic font-sans">Back-office monitoring role</span>
          `}
        </td>
        <td class="p-3">
          <div class="flex items-center gap-1.5">
            <span class="border rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase font-mono tracking-wider bg-slate-950 ${badgeColor}">${staff.role}</span>
            <span class="text-[9px] py-0.5 px-1.5 uppercase font-mono rounded ${staff.status === "active" ? "text-emerald-400 bg-emerald-950/20" : "text-rose-400 bg-rose-955/20"}">${staff.status}</span>
          </div>
        </td>
        <td class="p-3 text-right">
          <div class="flex justify-end gap-1 font-mono">
            <button class="staff-edit-btn bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 py-1 px-2.5 rounded-lg transition text-[10px] cursor-pointer" data-id="${staff.id}">
              Edit
            </button>
            <button class="staff-del-btn bg-rose-955/30 hover:bg-rose-900/60 text-rose-400 py-1 px-2.5 rounded-lg border border-rose-900/30 transition text-[10px] cursor-pointer" data-id="${staff.id}">
              Delete
            </button>
          </div>
        </td>
      `;

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".staff-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.openUserEditModal(id);
      });
    });

    listEl.querySelectorAll(".staff-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const staff = this.db.users.find(u => u.id === id);
        if (!staff) return;

        if (confirm(`Are you absolutely sure you want to permanently delete the staff account @${staff.username}?`)) {
          this.db.users = this.db.users.filter(u => u.id !== id);
          this.saveDB();
          this.showToast(`Deleted staff account @${staff.username} successfully.`, "success");
          this.renderAdminAgents();
        }
      });
    });
  },

  renderAgentLeadersTab() {
    const listEl = document.getElementById("agent-leaders-list-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const searchInput = document.getElementById("agent-leaders-search-input");
    if (searchInput && !searchInput.dataset.listenerAttached) {
      searchInput.addEventListener("input", () => this.renderAgentLeadersTab());
      searchInput.dataset.listenerAttached = "true";
    }
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const leaders = this.db.users.filter(u => {
      if (u.role !== "agent") return false;
      if (query) {
        return u.username.toLowerCase().includes(query) ||
               (u.email || "").toLowerCase().includes(query) ||
               (u.phone || "").toLowerCase().includes(query) ||
               (u.district || "").toLowerCase().includes(query);
      }
      return true;
    });

    // Stats
    const totalLeadersCount = this.db.users.filter(u => u.role === "agent").length;
    const totalSubAgentsCount = this.db.users.filter(u => u.role === "subagent").length;
    const activeMissionsCount = this.db.users.filter(u => u.role === "agent" && (u.monthlyTargetTickets || 0) > 0).length;

    const leadersCountEl = document.getElementById("agent-leaders-stat-count");
    if (leadersCountEl) leadersCountEl.innerText = `${totalLeadersCount} Leader${totalLeadersCount !== 1 ? 's' : ''}`;
    
    const subsCountEl = document.getElementById("agent-leaders-stat-subs");
    if (subsCountEl) subsCountEl.innerText = `${totalSubAgentsCount} Sub-agent${totalSubAgentsCount !== 1 ? 's' : ''}`;

    const missionsCountEl = document.getElementById("agent-leaders-stat-missions");
    if (missionsCountEl) missionsCountEl.innerText = `${activeMissionsCount} Active Quota${activeMissionsCount !== 1 ? 's' : ''}`;

    if (leaders.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-slate-500 font-sans">
            No agent leaders matching the query found.
          </td>
        </tr>
      `;
      return;
    }

    leaders.forEach(leader => {
      // Count referred sub-agents
      const leaderSubs = this.db.users.filter(u => u.role === "subagent" && u.referredBy && u.referredBy.toLowerCase() === leader.username.toLowerCase());
      const subsCount = leaderSubs.length;

      // Progress bar calculation
      const target = leader.monthlyTargetTickets || 0;
      const progress = leader.monthlySalesProgress || 0;
      const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition cursor-pointer";
      
      row.innerHTML = `
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${leader.status === "active" ? "bg-emerald-500" : "bg-rose-500"}"></span>
            <div>
              <span class="text-white font-bold block">@${leader.username}</span>
              <span class="text-[9.5px] text-slate-500 block font-mono">${leader.email}</span>
            </div>
          </div>
        </td>
        <td class="p-3">
          <span class="text-slate-300 font-bold uppercase font-mono">${leader.district || "Dhaka"}</span>
        </td>
        <td class="p-3">
          <div>
            <span class="text-white font-bold font-mono">৳${(leader.balance || 0).toFixed(2)}</span>
            <span class="text-[9.5px] text-slate-500 block font-sans">Rate: <strong class="text-emerald-400">${(leader.commissionRate || 5.0).toFixed(1)}%</strong></span>
          </div>
        </td>
        <td class="p-3">
          <span class="bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">${subsCount} Subs</span>
        </td>
        <td class="p-3">
          <div class="w-28 space-y-1">
            <div class="flex justify-between text-[9.5px] font-mono leading-none">
              <span class="text-slate-400">${progress}/${target}</span>
              <span class="text-cyan-400 font-bold">${pct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 text-right">
          <button class="leader-view-btn bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 hover:border-rose-800 text-rose-450 py-1 px-2.5 rounded-lg transition text-[10px] cursor-pointer" data-id="${leader.id}">
            View Profile
          </button>
        </td>
      `;

      // Make row clickable
      row.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        this.showAgentLeaderDetail(leader.id);
      });

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".leader-view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.showAgentLeaderDetail(id);
      });
    });
  },

  showAgentLeaderDetail(leaderId) {
    const leader = this.db.users.find(u => u.id === leaderId);
    if (!leader) return;

    // Switch screens
    document.getElementById("agent-leaders-list-view").classList.add("hidden");
    document.getElementById("agent-leaders-detail-view").classList.remove("hidden");

    // Profile settings
    document.getElementById("detail-leader-avatar-initial").innerText = leader.username.charAt(0).toUpperCase();
    document.getElementById("detail-leader-username").innerText = `@${leader.username}`;
    document.getElementById("detail-leader-district-badge").innerText = (leader.district || "DHAKA").toUpperCase();
    document.getElementById("detail-leader-email").innerText = leader.email || "N/A";
    document.getElementById("detail-leader-phone").innerText = leader.phone || "N/A";
    
    const statusLbl = document.getElementById("detail-leader-status-lbl");
    if (statusLbl) {
      statusLbl.innerText = (leader.status || "active").toUpperCase();
      statusLbl.className = leader.status === "active" ? "font-bold uppercase text-emerald-400 font-mono" : "font-bold uppercase text-rose-400 font-mono";
    }

    document.getElementById("detail-leader-balance-lbl").innerText = `৳${(leader.balance || 0).toFixed(2)}`;
    document.getElementById("detail-leader-commission-lbl").innerText = `${(leader.commissionRate || 5.0).toFixed(1)}%`;

    // Targets & Mission
    const target = leader.monthlyTargetTickets || 0;
    const progress = leader.monthlySalesProgress || 0;
    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
    
    document.getElementById("detail-leader-target-tickets").innerText = target;
    document.getElementById("detail-leader-target-reward").innerText = `৳${(leader.monthlyTargetReward || 0).toFixed(2)}`;

    // Target pool
    let targetPoolName = "Any Active Pool";
    const targetLotteryId = leader.monthlyTargetLotteryId || "any";
    if (targetLotteryId !== "any") {
      const foundLot = (this.db.lotteries || []).find(l => l.id === targetLotteryId);
      if (foundLot) {
        targetPoolName = `${foundLot.name} (৳${foundLot.entryFee})`;
      } else {
        targetPoolName = "Archived Pool";
      }
    }
    document.getElementById("detail-leader-target-pool").innerText = targetPoolName;
    document.getElementById("detail-leader-progress-pct").innerText = `${pct}%`;
    document.getElementById("detail-leader-progress-bar").style.width = `${pct}%`;
    document.getElementById("detail-leader-progress-val").innerText = `${progress} / ${target} Tickets`;

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

    // Edit credentials click
    const editBtn = document.getElementById("detail-leader-edit-profile-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        this.openUserEditModal(leader.id);
      };
    }

    // Populate Sub-agents
    const subAgentsTbody = document.getElementById("detail-leader-subagents-tbody");
    if (subAgentsTbody) {
      subAgentsTbody.innerHTML = "";
      const leaderSubs = this.db.users.filter(u => u.role === "subagent" && u.referredBy && u.referredBy.toLowerCase() === leader.username.toLowerCase());

      if (leaderSubs.length === 0) {
        subAgentsTbody.innerHTML = `
          <tr>
            <td colspan="7" class="p-4 text-center text-slate-500 italic font-sans text-xs">
              No sub-agents recruited by this leader yet.
            </td>
          </tr>
        `;
      } else {
        leaderSubs.forEach(sub => {
          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition font-mono";
          
          const sTarget = sub.monthlyTargetTickets || 0;
          const sProgress = sub.monthlySalesProgress || 0;

          row.innerHTML = `
            <td class="p-3 text-left font-sans">
              <div>
                <span class="text-white font-bold">@${sub.username}</span>
                <span class="text-[9.5px] text-slate-500 block select-all font-mono">${sub.email}</span>
              </div>
            </td>
            <td class="p-3 text-slate-300 font-bold">৳${(sub.balance || 0).toFixed(2)}</td>
            <td class="p-3 text-emerald-400 font-bold">${(sub.commissionRate || 3.0).toFixed(1)}%</td>
            <td class="p-3 text-white font-bold">${sub.totalBookings || 0}</td>
            <td class="p-3 text-slate-400">${sProgress} / ${sTarget}</td>
            <td class="p-3 font-sans">
              <span class="text-[9.5px] py-0.5 px-2 uppercase font-bold rounded ${sub.status === "active" ? "text-emerald-400 bg-emerald-950/20" : "text-rose-400 bg-rose-950/20"}">${sub.status || "active"}</span>
            </td>
            <td class="p-3 text-right">
              <button class="leader-sub-view-btn bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] py-1 px-2 border border-slate-800 rounded transition cursor-pointer" data-id="${sub.id}">
                View Details
              </button>
            </td>
          `;

          row.querySelector(".leader-sub-view-btn").addEventListener("click", () => {
            // Switch tabs
            this.currentAdminTab = "subagents-list";
            this.render();
            this.showSubAgentDetail(sub.id);
          });

          subAgentsTbody.appendChild(row);
        });
      }
    }

    // Attach back button
    document.getElementById("agent-leaders-detail-back-btn").onclick = () => {
      document.getElementById("agent-leaders-detail-view").classList.add("hidden");
      document.getElementById("agent-leaders-list-view").classList.remove("hidden");
    };
  },

  renderSubAgentsListTab() {
    const listEl = document.getElementById("subagents-list-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const searchInput = document.getElementById("subagents-list-search-input");
    if (searchInput && !searchInput.dataset.listenerAttached) {
      searchInput.addEventListener("input", () => this.renderSubAgentsListTab());
      searchInput.dataset.listenerAttached = "true";
    }
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const subagents = this.db.users.filter(u => {
      if (u.role !== "subagent") return false;
      if (query) {
        return u.username.toLowerCase().includes(query) ||
               (u.email || "").toLowerCase().includes(query) ||
               (u.phone || "").toLowerCase().includes(query) ||
               (u.referredBy || "").toLowerCase().includes(query);
      }
      return true;
    });

    // Compute metrics
    const lotteries = this.db.lotteries || [];
    const tickets = this.db.tickets || [];
    
    // Total subagents
    const totalSubsCount = this.db.users.filter(u => u.role === "subagent").length;

    // Direct players count
    const subUsernames = new Set(this.db.users.filter(u => u.role === "subagent").map(u => u.username.toLowerCase()));
    const subPlayers = this.db.users.filter(u => u.referredBy && subUsernames.has(u.referredBy.toLowerCase()));
    const totalPlayersReferred = subPlayers.length;

    // Sales volume
    let totalSalesVol = 0;
    const playerIds = new Set(subPlayers.map(p => p.id));
    tickets.forEach(t => {
      if (playerIds.has(t.userId)) {
        const lot = lotteries.find(l => l.id === t.lotteryId);
        if (lot) totalSalesVol += (lot.entryFee || 100);
      }
    });

    const countEl = document.getElementById("subagents-list-stat-count");
    if (countEl) countEl.innerText = `${totalSubsCount} Sub-agent${totalSubsCount !== 1 ? 's' : ''}`;

    const salesEl = document.getElementById("subagents-list-stat-sales");
    if (salesEl) salesEl.innerText = `৳${totalSalesVol.toFixed(2)}`;

    const playersEl = document.getElementById("subagents-list-stat-players");
    if (playersEl) playersEl.innerText = `${totalPlayersReferred} Player${totalPlayersReferred !== 1 ? 's' : ''}`;

    if (subagents.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="7" class="p-6 text-center text-slate-500 font-sans">
            No sub-agent accounts matching the query found.
          </td>
        </tr>
      `;
      return;
    }

    subagents.forEach(sub => {
      const sTarget = sub.monthlyTargetTickets || 0;
      const sProgress = sub.monthlySalesProgress || 0;
      const pct = sTarget > 0 ? Math.min(100, Math.round((sProgress / sTarget) * 100)) : 0;

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition cursor-pointer";

      row.innerHTML = `
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${sub.status === "active" ? "bg-emerald-500" : "bg-rose-500"}"></span>
            <div>
              <span class="text-white font-bold block font-sans">@${sub.username}</span>
              <span class="text-[9.5px] text-slate-500 block font-mono">${sub.email}</span>
            </div>
          </div>
        </td>
        <td class="p-3">
          <span class="text-amber-400 font-bold font-mono">@${sub.referredBy || "System"}</span>
        </td>
        <td class="p-3">
          <div>
            <span class="text-white font-bold font-mono">৳${(sub.balance || 0).toFixed(2)}</span>
            <span class="text-[9.5px] text-slate-500 block font-sans">Rate: <strong class="text-emerald-400">${(sub.commissionRate || 3.0).toFixed(1)}%</strong></span>
          </div>
        </td>
        <td class="p-3">
          <span class="text-slate-300 font-bold font-mono">${sub.totalBookings || 0} Bookings</span>
        </td>
        <td class="p-3 font-mono">
          <div class="w-28 space-y-1">
            <div class="flex justify-between text-[9.5px] leading-none">
              <span class="text-slate-400">${sProgress}/${sTarget}</span>
              <span class="text-cyan-400 font-bold">${pct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 font-sans">
          <span class="text-[9.5px] py-0.5 px-2 uppercase font-bold rounded ${sub.status === "active" ? "text-emerald-400 bg-emerald-950/20" : "text-rose-400 bg-rose-950/20"}">${sub.status || "active"}</span>
        </td>
        <td class="p-3 text-right">
          <button class="subagent-view-btn bg-indigo-950 hover:bg-indigo-900/60 text-indigo-400 py-1 px-2.5 rounded-lg border border-indigo-900/30 transition text-[10px] cursor-pointer font-sans" data-id="${sub.id}">
            View Operator
          </button>
        </td>
      `;

      row.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        this.showSubAgentDetail(sub.id);
      });

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".subagent-view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.showSubAgentDetail(id);
      });
    });
  },

  showSubAgentDetail(subId) {
    const sub = this.db.users.find(u => u.id === subId);
    if (!sub) return;

    // Switch screens
    document.getElementById("subagents-list-view").classList.add("hidden");
    document.getElementById("subagents-detail-view").classList.remove("hidden");

    // Profile settings
    document.getElementById("detail-sub-avatar-initial").innerText = sub.username.charAt(0).toUpperCase();
    document.getElementById("detail-sub-username").innerText = `@${sub.username}`;
    document.getElementById("detail-sub-parent-lbl").innerText = `@${sub.referredBy || "System"}`;
    document.getElementById("detail-sub-email").innerText = sub.email || "N/A";
    document.getElementById("detail-sub-phone").innerText = sub.phone || "N/A";
    
    const statusLbl = document.getElementById("detail-sub-status-lbl");
    if (statusLbl) {
      statusLbl.innerText = (sub.status || "active").toUpperCase();
      statusLbl.className = sub.status === "active" ? "font-bold uppercase text-emerald-400 font-mono" : "font-bold uppercase text-rose-400 font-mono";
    }

    document.getElementById("detail-sub-balance-lbl").innerText = `৳${(sub.balance || 0).toFixed(2)}`;
    document.getElementById("detail-sub-commission-lbl").innerText = `${(sub.commissionRate || 3.0).toFixed(1)}%`;
    document.getElementById("detail-sub-bookings-lbl").innerText = `${sub.totalBookings || 0} Sales`;

    // Targets & Mission
    const target = sub.monthlyTargetTickets || 0;
    const progress = sub.monthlySalesProgress || 0;
    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
    
    document.getElementById("detail-sub-target-tickets").innerText = target;
    document.getElementById("detail-sub-target-reward").innerText = `৳${(sub.monthlyTargetReward || 0).toFixed(2)}`;

    // Target pool
    let targetPoolName = "Any Active Pool";
    const targetLotteryId = sub.monthlyTargetLotteryId || "any";
    if (targetLotteryId !== "any") {
      const foundLot = (this.db.lotteries || []).find(l => l.id === targetLotteryId);
      if (foundLot) {
        targetPoolName = `${foundLot.name} (৳${foundLot.entryFee})`;
      } else {
        targetPoolName = "Archived Pool";
      }
    }
    document.getElementById("detail-sub-target-pool").innerText = targetPoolName;
    document.getElementById("detail-sub-progress-pct").innerText = `${pct}%`;
    document.getElementById("detail-sub-progress-bar").style.width = `${pct}%`;
    document.getElementById("detail-sub-progress-val").innerText = `${progress} / ${target} Tickets`;

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

    // Edit settings click
    const editBtn = document.getElementById("detail-sub-edit-profile-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        this.openUserEditModal(sub.id);
      };
    }

    // Populate players
    const playersTbody = document.getElementById("detail-sub-players-tbody");
    if (playersTbody) {
      playersTbody.innerHTML = "";
      const subPlayers = this.db.users.filter(u => u.referredBy && u.referredBy.toLowerCase() === sub.username.toLowerCase() && u.role !== "subagent" && u.role !== "agent");

      if (subPlayers.length === 0) {
        playersTbody.innerHTML = `
          <tr>
            <td colspan="5" class="p-4 text-center text-slate-500 italic font-sans text-xs">
              No players registered under this operator yet.
            </td>
          </tr>
        `;
      } else {
        subPlayers.forEach(player => {
          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition font-mono";

          row.innerHTML = `
            <td class="p-3 text-left font-sans">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full ${player.status === "active" ? "bg-emerald-500" : "bg-rose-500"}"></span>
                <span class="text-white font-bold">@${player.username}</span>
              </div>
            </td>
            <td class="p-3 text-slate-300 font-bold font-mono">৳${(player.balance || 0).toFixed(2)}</td>
            <td class="p-3 text-slate-400 font-sans">${player.email || "N/A"}</td>
            <td class="p-3 text-slate-400">${player.phone || "N/A"}</td>
            <td class="p-3 text-right">
              <button class="sub-player-view-btn bg-slate-950 hover:bg-slate-850 text-slate-300 text-[10px] py-1 px-2 border border-slate-800 rounded transition cursor-pointer font-sans" data-id="${player.id}">
                Configure User
              </button>
            </td>
          `;

          row.querySelector(".sub-player-view-btn").addEventListener("click", () => {
            this.openUserEditModal(player.id);
          });

          playersTbody.appendChild(row);
        });
      }
    }

    // Attach back button
    document.getElementById("subagents-detail-back-btn").onclick = () => {
      document.getElementById("subagents-detail-view").classList.add("hidden");
      document.getElementById("subagents-list-view").classList.remove("hidden");
    };
  },

  renderAdminLotteries() {
    const listEl = document.getElementById("admin-pools-list-container");
    listEl.innerHTML = "";

    this.db.lotteries.forEach(lot => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative space-y-4 shadow-lg";

      const badge = lot.status === "drawn" ? `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-green-950 text-green-300">🏆 DRAW COMPLETED</span>` :
                                             `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-cyan-950 text-cyan-400">⏳ ACTIVE RUNNING</span>`;

      const drawBtn = lot.status === "active" ? `<button class="admin-manual-draw-trigger bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition" data-id="${lot.id}">Force Draw Winner</button>` : "";

      let multiPrizesDetails = "";
      if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
        multiPrizesDetails = `<div class="bg-slate-950 p-2.5 rounded-2xl border border-slate-850/50 text-[10px] space-y-0.5">
          <span class="text-slate-500 font-sans block text-[9px] uppercase tracking-wider">Multi Rank Prize Distribution Pool:</span>
          ${lot.multiWinnerPrizes.map((p, idx) => `<div class="flex justify-between font-mono text-slate-300"><span>Rank #${idx+1} Winner</span><span class="text-yellow-500 font-bold">৳${p}</span></div>`).join("")}
        </div>`;
      }

      card.innerHTML = `
        <div class="flex justify-between items-start gap-4">
          <div>
            <h4 class="text-white font-bold font-sans text-sm">${this.escapeHTML(lot.name)}</h4>
            <span class="text-[10px] text-slate-500 font-mono">Category: <span class="text-cyan-400 font-bold uppercase">${lot.category}</span></span>
          </div>
          ${badge}
        </div>

        <p class="text-xs text-slate-400 leading-normal">${this.escapeHTML(lot.details || "Experience live payout lottery draws.")}</p>

        ${multiPrizesDetails}

        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-850/30">
          <div><span class="text-slate-500 block text-[9.5px]">Entry Ticket Cost</span><span class="font-bold font-mono text-cyan-400">৳${lot.entryFee}</span></div>
          <div><span class="text-slate-500 block text-[9.5px]">Pool Draw Reward</span><span class="font-bold font-mono text-yellow-500">৳${lot.prizeAmount}</span></div>
          <div><span class="text-slate-500 block text-[9.5px]">Tickets Registered</span><span class="font-bold font-mono text-white">${lot.soldTickets} / ${lot.totalTickets}</span></div>
          <div><span class="text-slate-550 block text-[9.5px]">Draw Target Time</span><span class="font-mono text-slate-300 text-[10.5px]">${new Date(lot.drawTime).toLocaleString()}</span></div>
        </div>

        <div class="flex justify-between items-center gap-2 pt-2">
          <button class="admin-delete-pool-trigger bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 text-[10px] font-bold py-1.5 px-3 rounded-xl transition" data-id="${lot.id}">Delete Pool</button>
          ${drawBtn}
        </div>
      `;

      listEl.appendChild(card);
    });

    document.querySelectorAll(".admin-manual-draw-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const lotId = btn.getAttribute("data-id");
        this.executeManualDrawWinner(lotId);
      });
    });

    document.querySelectorAll(".admin-delete-pool-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const lotId = btn.getAttribute("data-id");
        const pool = this.db.lotteries.find(l => l.id === lotId);
        if (!pool) return;

        if (confirm(`Are you sure you want to permanently delete lottery pool "${pool.name}"?`)) {
          this.db.lotteries = this.db.lotteries.filter(l => l.id !== lotId);
          this.saveDB();
          this.renderAdminLotteries();
          this.showToast(`Lottery pool "${pool.name}" has been deleted.`, "success");
        }
      });
    });
  },

  executeManualDrawWinner(lotteryId) {
    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) return;

    if (lot.status !== "active") {
      this.showToast("Cannot draw an already completed lottery!", "error");
      return;
    }

    const tickets = this.db.tickets.filter(t => t.lotteryId === lotteryId);
    if (tickets.length === 0) {
      this.showToast("No tickets have been sold yet. Cannot draw winner from an empty pool!", "error");
      return;
    }

    if (!confirm(`Force manual winner draw for "${lot.name}" right now?`)) return;

    let winnersArr = [];

    if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
      const prizePool = lot.multiWinnerPrizes;
      const shuffledTickets = [...tickets].sort(() => Math.random() - 0.5);

      prizePool.forEach((prizeAmt, rankIdx) => {
        const matchedTicket = shuffledTickets[rankIdx];
        if (matchedTicket) {
          matchedTicket.status = "won";
          matchedTicket.prizeAmount = prizeAmt;

          const player = this.db.users.find(u => u.id === matchedTicket.userId);
          if (player) {
            player.balance += prizeAmt;
            player.wins = (player.wins || 0) + 1;
            player.profit = (player.profit || 0) + prizeAmt;

            winnersArr.push({
              username: player.username,
              prize: prizeAmt,
              rank: rankIdx + 1,
              ticketCode: matchedTicket.code
            });
          }
        }
      });

      tickets.forEach(t => {
        if (t.status === "active") {
          t.status = "lost";
          const player = this.db.users.find(u => u.id === t.userId);
          if (player) {
            player.loss = (player.loss || 0) + 1;
            player.profit = (player.profit || 0) - lot.entryFee;
          }
        }
      });
    } else {
      const randIdx = Math.floor(Math.random() * tickets.length);
      const winnerTicket = tickets[randIdx];

      winnerTicket.status = "won";
      winnerTicket.prizeAmount = lot.prizeAmount;

      const winnerUser = this.db.users.find(u => u.id === winnerTicket.userId);
      if (winnerUser) {
        winnerUser.balance += lot.prizeAmount;
        winnerUser.wins = (winnerUser.wins || 0) + 1;
        winnerUser.profit = (winnerUser.profit || 0) + lot.prizeAmount;

        winnersArr.push({
          username: winnerUser.username,
          prize: lot.prizeAmount,
          rank: 1,
          ticketCode: winnerTicket.code
        });
      }

      tickets.forEach((t, index) => {
        if (index !== randIdx) {
          t.status = "lost";
          const player = this.db.users.find(u => u.id === t.userId);
          if (player) {
            player.loss = (player.loss || 0) + 1;
            player.profit = (player.profit || 0) - lot.entryFee;
          }
        }
      });
    }

    lot.status = "drawn";
    lot.drawnWinnersList = winnersArr;

    this.saveDB();
    this.render();
    this.showToast(`🏆 DRAW SUCCESS! Winner(s) selected dynamically for "${lot.name}".`, "success");
  },

  renderAdminDeposits() {
    const listEl = document.getElementById("admin-deposits-tbody");
    const listDiv = document.getElementById("admin-deposits-list");

    if (listEl) {
      listEl.innerHTML = "";
      const deps = this.db.deposits || [];
      if (deps.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No registered digital transactions found.</td></tr>`;
        return;
      }

      const sorted = [...deps].sort((a, b) => new Date(b.date) - new Date(a.date));

      sorted.forEach(d => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";

        const badgeColor = d.status === "approved" ? "bg-green-950 text-green-400 border border-green-900/30" :
                           d.status === "pending" ? "bg-amber-950 text-amber-400 border border-amber-900/30" :
                           "bg-red-950 text-red-500 border border-red-900/30";

        let actionBtns = "";
        if (d.status === "pending") {
          actionBtns = `
            <div class="flex justify-end gap-1 font-mono">
              <button class="admin-approve-dep-btn bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${d.id}">Approve</button>
              <button class="admin-reject-dep-btn bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${d.id}">Reject</button>
            </div>
          `;
        } else {
          actionBtns = `<span class="text-[9.5px] font-mono text-slate-600 font-semibold uppercase flex items-center justify-end gap-1"><i class="fa-solid fa-square-check text-emerald-500 text-[9px]"></i> Processed</span>`;
        }

        row.innerHTML = `
          <td class="p-3">
            <div class="font-bold text-white">@${d.username}</div>
            <div class="text-[9.5px] text-slate-500 font-mono">${new Date(d.date).toLocaleDateString()} at ${new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-200 capitalize">${d.gateway || d.method || "bKash"}</div>
            <div class="text-[9.5px] text-slate-500 font-mono select-all">Acc: ${d.targetAccount || d.phone || ""}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-emerald-400 font-mono text-[13px]">৳${d.amount}</div>
            ${(d.txnid || d.trxId) ? `<div class="text-[9px] text-slate-400 select-all font-mono">TxnID: ${d.txnid || d.trxId}</div>` : ""}
          </td>
          <td class="p-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${badgeColor}">${d.status.toUpperCase()}</span>
          </td>
          <td class="p-3 text-right">${actionBtns}</td>
        `;

        listEl.appendChild(row);
      });

      listEl.querySelectorAll(".admin-approve-dep-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const depId = btn.getAttribute("data-id");
          this.processDepositTransaction(depId, "approved");
        });
      });

      listEl.querySelectorAll(".admin-reject-dep-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const depId = btn.getAttribute("data-id");
          this.processDepositTransaction(depId, "rejected");
        });
      });
    } else if (listDiv) {
      listDiv.innerHTML = "";
      const depos = this.db.deposits || [];
      if (depos.length === 0) {
        listDiv.innerHTML = `<div class="p-8 text-center text-slate-500 font-mono text-xs">No payment deposits recorded.</div>`;
        return;
      }

      depos.forEach(d => {
        const card = document.createElement("div");
        card.className = "bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center text-xs shadow-md";

        let actionBlock = "";
        if (d.status === "pending") {
          actionBlock = `
            <div class="flex gap-2">
              <button class="approve-dep-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${d.id}">Approve</button>
              <button class="decline-dep-btn bg-rose-900 hover:bg-rose-800 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${d.id}">Decline</button>
            </div>
          `;
        } else {
          const clr = d.status === "approved" ? "text-emerald-400" : "text-rose-400";
          actionBlock = `<span class="uppercase font-mono font-bold text-[10px] ${clr}">${d.status}</span>`;
        }

        card.innerHTML = `
          <div class="space-y-1">
            <div class="font-bold text-white">@${d.username}</div>
            <div class="text-[10px] text-slate-400 font-mono">Gateway: ${d.gateway || d.method || "bKash"}</div>
            <div class="text-[10px] text-cyan-400 font-mono select-all">Trx tracer: ${d.txnid || d.trxId || ""}</div>
            <div class="text-[9px] text-slate-600 font-mono">${new Date(d.date).toLocaleString()}</div>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0 text-right">
            <span class="text-sm font-black text-white font-mono">৳${d.amount}</span>
            ${actionBlock}
          </div>
        `;

        listDiv.appendChild(card);
      });

      listDiv.querySelectorAll(".approve-dep-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const depId = btn.getAttribute("data-id");
          this.processDepositTransaction(depId, "approved");
        });
      });

      listDiv.querySelectorAll(".decline-dep-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const depId = btn.getAttribute("data-id");
          this.processDepositTransaction(depId, "rejected");
        });
      });
    }
  },

  processDepositTransaction(depositId, outcome) {
    const d = this.db.deposits.find(item => item.id === depositId);
    if (!d) return;

    if (d.status !== "pending") return;

    // Resolve user by ID or Username
    const u = this.db.users.find(user => (d.userId && user.id === d.userId) || (d.username && user.username.toLowerCase() === d.username.toLowerCase()));

    if (outcome === "approved") {
      d.status = "approved";
      if (u) {
        u.balance += d.amount;
        u.totDeposit += d.amount;
        this.showToast(`Deposit approved! Added ৳${d.amount} to @${u.username}'s balance.`, "success");

        if (!this.db.messages) this.db.messages = [];
        this.db.messages.push({
          id: "sys_msg_" + Date.now(),
          recipientType: "specific",
          targetUsername: u.username,
          category: "deposit",
          subject: "Deposit Verified Successfully",
          content: `Great news! Your manual deposit request of ৳${d.amount} via ${d.gateway} has been verified and credited to your main balance! Transaction ID: ${d.txnid || d.trxId || "Agent Cashin"}.`,
          date: new Date().toISOString()
        });
      } else {
        this.showToast(`Deposit status set to approved, but target user could not be found.`, "warning");
      }
    } else {
      d.status = "rejected";
      this.showToast(`Deposit request has been declined.`, "info");
      if (u) {
        if (!this.db.messages) this.db.messages = [];
        this.db.messages.push({
          id: "sys_msg_" + Date.now(),
          recipientType: "specific",
          targetUsername: u.username,
          category: "alert",
          subject: "Deposit Request Declined",
          content: `Your deposit request of ৳${d.amount} via ${d.gateway} was declined during back-office auditing. Please verify the TxnID/receipt and try again or contact live chat support.`,
          date: new Date().toISOString()
        });
      }
    }

    this.saveDB();
    this.render();
  },

  renderAdminWithdraws() {
    const listEl = document.getElementById("admin-withdraws-tbody");
    const listDiv = document.getElementById("admin-withdraws-list");

    if (listEl) {
      listEl.innerHTML = "";
      const withdrawals = this.db.withdrawals || [];
      if (withdrawals.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No payouts registered in records.</td></tr>`;
        return;
      }

      const sorted = [...withdrawals].sort((a, b) => new Date(b.date) - new Date(a.date));

      sorted.forEach(w => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";

        const badgeColor = w.status === "approved" ? "bg-green-950 text-green-400 border border-green-900/30" :
                           w.status === "pending" ? "bg-amber-950 text-amber-400 border border-amber-900/30" :
                           "bg-red-950 text-red-500 border border-red-900/30";

        let actionBtns = "";
        if (w.status === "pending") {
          actionBtns = `
            <div class="flex justify-end gap-1 font-mono">
              <button class="admin-approve-wd-btn bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${w.id}">Approve</button>
              <button class="admin-reject-wd-btn bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${w.id}">Reject</button>
            </div>
          `;
        } else {
          actionBtns = `<span class="text-[9.5px] font-mono text-slate-600 font-semibold uppercase flex items-center justify-end gap-1"><i class="fa-solid fa-square-check text-emerald-500 text-[9px]"></i> Disbursed</span>`;
        }

        row.innerHTML = `
          <td class="p-3">
            <div class="font-bold text-white">@${w.username}</div>
            <div class="text-[9.5px] text-slate-500 font-mono">${new Date(w.date).toLocaleDateString()} at ${new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-200 capitalize">${w.gateway || w.method || "bKash"}</div>
            <div class="text-[9.5px] text-slate-500 font-mono select-all">Acc: ${w.targetAccount || w.phone || ""}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-rose-400 font-mono text-[13px]">৳${w.amount}</div>
          </td>
          <td class="p-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${badgeColor}">${w.status.toUpperCase()}</span>
          </td>
          <td class="p-3 text-right">${actionBtns}</td>
        `;

        listEl.appendChild(row);
      });

      listEl.querySelectorAll(".admin-approve-wd-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const wdId = btn.getAttribute("data-id");
          this.processWithdrawTransaction(wdId, "approved");
        });
      });

      listEl.querySelectorAll(".admin-reject-wd-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const wdId = btn.getAttribute("data-id");
          this.processWithdrawTransaction(wdId, "rejected");
        });
      });
    } else if (listDiv) {
      listDiv.innerHTML = "";
      const withdrawals = this.db.withdrawals || [];
      if (withdrawals.length === 0) {
        listDiv.innerHTML = `<div class="p-8 text-center text-slate-500 font-mono text-xs">No payment withdrawals recorded.</div>`;
        return;
      }

      // Filter in listDiv if we have a filter element in SPA
      let filtered = [...withdrawals];
      const filterSelect = document.getElementById("admin-withdraws-filter");
      if (filterSelect && filterSelect.value !== "all") {
        filtered = filtered.filter(w => w.status === filterSelect.value);
      }

      const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

      sorted.forEach(w => {
        const card = document.createElement("div");
        card.className = "bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center text-xs shadow-md";

        let actionBlock = "";
        if (w.status === "pending") {
          actionBlock = `
            <div class="flex gap-2">
              <button class="approve-wd-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${w.id}">Approve</button>
              <button class="decline-wd-btn bg-rose-900 hover:bg-rose-800 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${w.id}">Decline</button>
            </div>
          `;
        } else {
          const clr = w.status === "approved" ? "text-emerald-400" : "text-rose-400";
          actionBlock = `<span class="uppercase font-mono font-bold text-[10px] ${clr}">${w.status}</span>`;
        }

        card.innerHTML = `
          <div class="space-y-1">
            <div class="font-bold text-white">@${w.username}</div>
            <div class="text-[10px] text-slate-400 font-mono">Gateway: ${w.gateway || w.method || "bKash"}</div>
            <div class="text-[10px] text-cyan-400 font-mono select-all font-bold">Target: ${w.targetAccount || w.phone || ""}</div>
            <div class="text-[9px] text-slate-600 font-mono">${new Date(w.date).toLocaleString()}</div>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0 text-right">
            <span class="text-sm font-black text-rose-400 font-mono">৳${w.amount}</span>
            ${actionBlock}
          </div>
        `;

        listDiv.appendChild(card);
      });

      listDiv.querySelectorAll(".approve-wd-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const wdId = btn.getAttribute("data-id");
          this.processWithdrawTransaction(wdId, "approved");
        });
      });

      listDiv.querySelectorAll(".decline-wd-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const wdId = btn.getAttribute("data-id");
          this.processWithdrawTransaction(wdId, "rejected");
        });
      });
    }
  },

  processWithdrawTransaction(withdrawalId, outcome) {
    const w = this.db.withdrawals.find(item => item.id === withdrawalId);
    if (!w) return;

    if (w.status !== "pending") return;

    // Resolve user by ID or Username
    const u = this.db.users.find(user => (w.userId && user.id === w.userId) || (w.username && user.username.toLowerCase() === w.username.toLowerCase()));

    if (outcome === "approved") {
      w.status = "approved";
      if (u) {
        u.totWithdraw += w.amount;
        this.showToast(`Payout request processed successfully! Disbursed ৳${w.amount} to @${u.username}.`, "success");

        if (!this.db.messages) this.db.messages = [];
        this.db.messages.push({
          id: "sys_msg_" + Date.now(),
          recipientType: "specific",
          targetUsername: u.username,
          category: "withdrawal",
          subject: "Withdrawal Completed Successfully",
          content: `Congratulations! Your payout request of ৳${w.amount} has been approved by the finance department. Funds have been successfully sent to your target account (${w.targetAccount}) via ${w.gateway}!`,
          date: new Date().toISOString()
        });
      }
    } else {
      w.status = "rejected";
      if (u) {
        const refundAmount = w.totalDebit !== undefined ? w.totalDebit : w.amount;
        u.balance += refundAmount; // refund full debited amount
        this.showToast(`Payout request declined. Balance ৳${refundAmount.toFixed(1)} refunded to @${u.username}.`, "info");

        if (!this.db.messages) this.db.messages = [];
        this.db.messages.push({
          id: "sys_msg_" + Date.now(),
          recipientType: "specific",
          targetUsername: u.username,
          category: "alert",
          subject: "Withdrawal Request Refused",
          content: `Your payout request of ৳${w.amount} was rejected. The locked amount of ৳${refundAmount.toFixed(1)} has been credited back to your wallet balance. Please review your payout account details or reach out to live chat support.`,
          date: new Date().toISOString()
        });
      }
    }

    this.saveDB();
    this.render();
  },

  renderAdminRefer() {
    const s = this.db.settings;
    if (!s) return;

    const signupBonusReferrerEl = document.getElementById("sys-referral-referrer-bonus");
    const signupBonusReferreeEl = document.getElementById("sys-referral-referee-bonus");
    const geoBanBlockSelector = document.getElementById("sys-geofencing-country-selector");
    const multicloudBlockCheckbox = document.getElementById("sys-multicloud-blocking");

    if (signupBonusReferrerEl) signupBonusReferrerEl.value = s.referralBonusReferrer ?? 50;
    if (signupBonusReferreeEl) signupBonusReferreeEl.value = s.referralBonusReferee ?? 25;
    if (geoBanBlockSelector) geoBanBlockSelector.value = s.geofencedCountryRestrictions || "none";
    if (multicloudBlockCheckbox) multicloudBlockCheckbox.checked = s.enableMultiCloudAntiFraud ?? false;

    const listEl = document.getElementById("admin-security-logs-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const logs = this.db.securityLogs || [];
    if (logs.length === 0) {
      listEl.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-slate-550 font-mono text-[10px]">No security alerts triggered yet. Anti-Fraud core standing by.</td></tr>`;
      return;
    }

    logs.forEach(log => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-[10.5px] border-b border-slate-900 transition font-mono";

      let colorClass = log.type === "duplicate_ip" ? "text-red-400 font-bold" : "text-amber-400";
      let typeLabel = log.type === "duplicate_ip" ? "IP-SPOOF BAN" : "REGION RESTR";

      row.innerHTML = `
        <td class="p-3 text-slate-500 text-[9.5px]">${new Date(log.timestamp).toLocaleString()}</td>
        <td class="p-3"><span class="${colorClass}">${typeLabel}</span></td>
        <td class="p-3 text-slate-200 text-left select-all">${this.escapeHTML(log.message)}</td>
      `;
      listEl.appendChild(row);
    });
  },

  renderAdminSettings() {
    const s = this.db.settings;
    if (!s) return;

    const limitInput = document.getElementById("admin-consecutive-block-limit");
    if (limitInput) limitInput.value = s.consecutiveDrawsLimit || 5;

    const btcInput = document.getElementById("sys-crypto-address-btc");
    const ethInput = document.getElementById("sys-crypto-address-eth");
    const usdtInput = document.getElementById("sys-crypto-address-usdt");

    const bkashInput = document.getElementById("sys-bkash-num");
    const nagadInput = document.getElementById("sys-nagad-num");
    const rocketInput = document.getElementById("sys-rocket-num");

    if (btcInput) btcInput.value = s.cryptoAddressBTC || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    if (ethInput) ethInput.value = s.cryptoAddressETH || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    if (usdtInput) usdtInput.value = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";

    if (bkashInput) bkashInput.value = s.bkashNumber || "+8801700000001";
    if (nagadInput) nagadInput.value = s.nagadNumber || "+8801900000005";
    if (rocketInput) rocketInput.value = s.rocketNumber || "+8801800000009";

    const qrTypeSelect = document.getElementById("sys-crypto-qr-type");
    const customBtcQREl = document.getElementById("sys-crypto-qr-url-btc");
    const customEthQREl = document.getElementById("sys-crypto-qr-url-eth");
    const customUsdtQREl = document.getElementById("sys-crypto-qr-url-usdt");

    if (qrTypeSelect) qrTypeSelect.value = s.cryptoQRType || "auto";
    if (customBtcQREl) customBtcQREl.value = s.cryptoQRUrlBTC || "";
    if (customEthQREl) customEthQREl.value = s.cryptoQRUrlETH || "";
    if (customUsdtQREl) customUsdtQREl.value = s.cryptoQRUrlUSDT || "";

    const toggleCustomFields = () => {
      const wraps = document.querySelectorAll(".custom-qr-file-wrapper");
      wraps.forEach(w => {
        if (qrTypeSelect && qrTypeSelect.value === "custom") {
          w.classList.remove("hidden");
        } else {
          w.classList.add("hidden");
        }
      });
    };
    toggleCustomFields();
    if (qrTypeSelect) qrTypeSelect.onchange = toggleCustomFields;

    this.refreshAdminQRPreview();
  },

  refreshAdminQRPreview() {
    try {
      const s = this.db.settings;
      const selector = document.getElementById("admin-spa-qr-selector");
      const qrImg = document.getElementById("admin-spa-qr-preview");
      if (!selector || !qrImg) return;

      const selectedCoinType = selector.value; 
      
      let activeAddress = "";
      let customQRUrl = "";

      if (selectedCoinType === "usdt") {
        activeAddress = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";
        customQRUrl = s.cryptoQRUrlUSDT;
      } else if (selectedCoinType === "btc") {
        activeAddress = s.cryptoAddressBTC || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
        customQRUrl = s.cryptoQRUrlBTC;
      } else {
        activeAddress = s.cryptoAddressETH || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
        customQRUrl = s.cryptoQRUrlETH;
      }

      if (s.cryptoQRType === "custom" && customQRUrl) {
        qrImg.src = customQRUrl;
      } else {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeAddress)}`;
      }
    } catch (err) {
      console.warn("Exception in refreshAdminQRPreview:", err);
    }
  },

  createNewLotteryPool(name, entryFee, prizeAmount, totalTickets, category, drawMode = "manual", drawDuration = 10, exactDatetime = "", desc = "", multiWinnerPrizes = null) {
    let drawTimeDate;
    const resolvedDrawMode = (drawMode === "manual") ? "manual" : "auto";
    if (drawMode === "auto") {
      drawTimeDate = new Date(Date.now() + drawDuration * 60 * 1000);
    } else if (drawMode === "auto_datetime" && exactDatetime) {
      drawTimeDate = new Date(exactDatetime);
    } else {
      drawTimeDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    let defaultsDesc = desc;
    if (!defaultsDesc) {
      if (multiWinnerPrizes && multiWinnerPrizes.length > 0) {
        const totalAward = multiWinnerPrizes.reduce((sum, p) => sum + p, 0);
        defaultsDesc = `Multiple Rank Winners Draw event! A total cash pool of ৳${totalAward} is distributed among top ${multiWinnerPrizes.length} lucky ticket holders! Rank prizes: ${multiWinnerPrizes.map((p, i) => `#${i+1} gets ৳${p}`).join(", ")}.`;
      } else {
        defaultsDesc = `Exclusive ${entryFee} Taka lottery draw pool. The luck winner receives ৳${prizeAmount}!`;
      }
    }

    const newLot = {
      id: "l" + Date.now(),
      name: name,
      details: defaultsDesc,
      entryFee: entryFee,
      totalTickets: totalTickets,
      soldTickets: 0,
      category: category,
      drawTime: drawTimeDate.toISOString(),
      status: "active",
      prizeAmount: prizeAmount,
      drawMode: resolvedDrawMode,
      drawDuration: drawDuration,
      originalDrawMode: drawMode,
      exactDatetime: exactDatetime,
      multiWinnerPrizes: multiWinnerPrizes
    };

    this.db.lotteries.unshift(newLot);
    this.saveDB();
    this.render();
    this.showToast(`New ${category} lottery created dynamically!`, "success");
  },

  renderAdminVipClub() {
    const list = document.getElementById("admin-vip-tiers-list");
    if (!list) return;

    list.innerHTML = "";
    const tiers = this.db.settings.vipTiers || [];

    const countEl = document.getElementById("vip-tiers-count");
    if (countEl) countEl.innerText = `${tiers.length} Active VIPs`;

    if (tiers.length === 0) {
      list.innerHTML = `
        <div class="text-slate-500 text-center py-8 font-sans">
          No VIP Tiers created. Use the editor on the left to initialize a premium plan!
        </div>
      `;
      return;
    }

    tiers.forEach(tier => {
      list.innerHTML += `
        <div class="flex items-center justify-between py-3 border-b border-slate-900 last:border-0 font-mono text-[10px]">
          <div class="space-y-1">
            <span class="text-xs font-bold text-white block">${tier.title}</span>
            <div class="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 font-sans">
              <span>Price: <strong class="text-slate-300">৳${tier.price}</strong></span>
              <span>•</span>
              <span>Bonus: <strong class="text-emerald-400">৳${tier.bonus}</strong></span>
              <span>•</span>
              <span>Mult: <strong class="text-amber-400">${tier.multiplier.toFixed(2)}x</strong></span>
              <span>•</span>
              <span>Discount: <strong class="text-purple-400">${tier.discount}%</strong></span>
            </div>
          </div>
          <button onclick="window.appInstance.deleteAdminVipTier('${tier.id}')" class="bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 hover:text-rose-300 px-2 py-1 rounded text-[8px] transition cursor-pointer">
            Delete
          </button>
        </div>
      `;
    });
  },

  deleteAdminVipTier(tierId) {
    if (!this.db || !this.db.settings || !this.db.settings.vipTiers) return;
    
    const title = this.db.settings.vipTiers.find(t => t.id === tierId)?.title || "Tier";
    this.db.settings.vipTiers = this.db.settings.vipTiers.filter(t => t.id !== tierId);
    this.saveDB();
    this.showToast(`Removed VIP Club level tier "${title}" from the registry.`, "info");
    this.renderAdminVipClub();
  },

  renderAdminJackpot() {
    const s = this.db.settings;
    const poolAmountEl = document.getElementById("admin-jackpot-pool-indicator");
    if (poolAmountEl) {
      poolAmountEl.innerText = `৳${(s.jackpotPool || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const fundInput = document.getElementById("admin-jackpot-pool-input");
    const costInput = document.getElementById("admin-jackpot-price-input");
    const exInput = document.getElementById("admin-jackpot-expiry-input");

    if (fundInput && document.activeElement !== fundInput) {
      fundInput.value = (s.jackpotPool || 0).toFixed(2);
    }
    if (costInput && document.activeElement !== costInput) {
      costInput.value = (s.jackpotTicketCost || 20.00).toFixed(2);
    }
    if (exInput && document.activeElement !== exInput) {
      exInput.value = s.jackpotExpiry || "";
    }

    const tbody = document.getElementById("admin-jackpot-purchases-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const regs = this.db.jackpotRegistrations || [];

    const countEl = document.getElementById("admin-jackpot-logs-count");
    if (countEl) countEl.innerText = `${regs.length} entries`;

    const sumEl = document.getElementById("admin-jackpot-tickets-sum");
    if (sumEl) {
      const ticketsSum = regs.reduce((sum, r) => sum + r.qty, 0);
      sumEl.innerText = `${ticketsSum} tickets`;
    }

    if (regs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500 font-sans text-xs">No active Jackpot tickets purchased.</td></tr>`;
      return;
    }

    [...regs].reverse().forEach(reg => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-850/45 hover:bg-slate-900/60 transition";
      tr.innerHTML = `
        <td class="py-2.5 text-slate-400 text-[10.5px]">#${reg.id.split("_").pop() || reg.id}</td>
        <td class="py-2.5 font-bold text-white text-[10.5px]">${this.escapeHTML(reg.userName)}</td>
        <td class="py-2.5 text-center text-purple-300 font-bold text-[10.5px]">${reg.qty}x</td>
        <td class="py-2.5 text-center text-emerald-400 font-bold text-[10.5px]">৳${reg.spent.toFixed(2)}</td>
        <td class="py-2.5 text-right text-slate-500 text-[9.5px]">${reg.date}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderAdminTasks() {
    const activeTasksCountEl = document.getElementById("admin-active-tasks-count");
    const pendingSubsCountEl = document.getElementById("admin-pending-submissions-count");
    const activeTasks = this.db.dailyTasks || [];
    const submissions = this.db.taskSubmissions || [];

    if (activeTasksCountEl) activeTasksCountEl.innerText = `${activeTasks.length} Active`;
    if (pendingSubsCountEl) {
      const pendingCount = submissions.filter(s => s.status === "pending").length;
      pendingSubsCountEl.innerText = `${pendingCount} Pending`;
    }

    const listContainer = document.getElementById("admin-tasks-list-container");
    if (listContainer) {
      listContainer.innerHTML = "";
      if (activeTasks.length === 0) {
        listContainer.innerHTML = `<div class="text-slate-550 py-6 text-center text-[10px] font-sans">No active promo tasks created yet. Use panel above to create one.</div>`;
      } else {
        activeTasks.forEach(task => {
          const div = document.createElement("div");
          div.className = "py-3 border-b border-slate-900 last:border-0 font-mono text-[10.5px] flex items-center justify-between";
          div.innerHTML = `
            <div class="space-y-1 max-w-[70%] text-left">
              <h5 class="text-white font-bold truncate">${this.escapeHTML(task.title)}</h5>
              <div class="flex gap-2 items-center text-[8.5px] text-slate-500">
                <span>Reward: <strong class="text-emerald-400 font-mono">৳${task.reward}</strong></span>
                <span>•</span>
                <span class="capitalize text-cyan-400">${task.category}</span>
              </div>
            </div>
            <button onclick="window.appInstance.deleteAdminTask('${task.id}')" class="bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 hover:text-rose-350 px-2.5 py-1 rounded text-[8.5px] transition cursor-pointer">
              Delete
            </button>
          `;
          listContainer.appendChild(div);
        });
      }
    }

    const gallery = document.getElementById("admin-task-submissions-gallery");
    if (gallery) {
      gallery.innerHTML = "";
      
      const activeFilterBtn = document.querySelector(".task-verify-filter-btn.bg-cyan-955\\/35");
      const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "pending";

      let filteredSubs = submissions;
      if (currentFilter !== "all") {
        filteredSubs = submissions.filter(s => s.status === currentFilter);
      }

      if (filteredSubs.length === 0) {
        gallery.innerHTML = `
          <div class="text-slate-500 text-center py-10">
            <i class="fa-solid fa-folder-open text-slate-700 text-3xl mb-1.5 block"></i>
            <span>No task registration submissions matching (${currentFilter}) status.</span>
          </div>
        `;
        return;
      }

      [...filteredSubs].reverse().forEach(sub => {
        const correspondingTask = activeTasks.find(t => t.id === sub.taskId);
        
        let actions = "";
        let notesLabel = "";
        
        if (sub.status === "pending") {
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3.5 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Specify note/reason..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <div class="flex gap-2 w-full sm:w-auto">
                <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'approved')" class="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-555 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                  Approve & Reward
                </button>
                <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'rejected')" class="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-550 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                  Decline / Reject
                </button>
              </div>
            </div>
          `;
        } else if (sub.status === "approved") {
          const badgeClass = "text-emerald-400 bg-emerald-955/15 border-emerald-900/40";
          notesLabel = `
            <div class="mt-2.5 pt-2.5 border-t border-slate-900/60 flex flex-wrap items-center justify-between text-[9px] text-left">
              <span class="text-slate-550 mr-2">Audit Response notes: <strong class="text-slate-300 font-sans">${this.escapeHTML(sub.adminNotes || "None")}</strong></span>
              <span class="px-2 py-0.5 rounded-lg border uppercase font-mono font-bold text-[7.5px] ${badgeClass}">${sub.status}</span>
            </div>
          `;
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Specify decline reason..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'rejected')" class="w-full sm:w-auto bg-rose-700 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-[9.5px] transition cursor-pointer shrink-0">
                Decline & Revoke Reward
              </button>
            </div>
          `;
        } else if (sub.status === "rejected") {
          const badgeClass = "text-rose-450 bg-rose-955/15 border-rose-900/40";
          notesLabel = `
            <div class="mt-2.5 pt-2.5 border-t border-slate-900/60 flex flex-wrap items-center justify-between text-[9px] text-left">
              <span class="text-slate-550 mr-2">Rejection reason: <strong class="text-slate-300 font-sans">${this.escapeHTML(sub.adminNotes || "None")}</strong></span>
              <span class="px-2 py-0.5 rounded-lg border uppercase font-mono font-bold text-[7.5px] ${badgeClass}">${sub.status}</span>
            </div>
          `;
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Change response note..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'approved')" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-555 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                Re-approve & Reward
              </button>
            </div>
          `;
        }

        const card = document.createElement("div");
        card.className = "bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl text-[10.5px] space-y-3 shadow-md font-mono relative overflow-hidden text-left";
        card.innerHTML = `
          <div class="flex justify-between items-start gap-4">
            <div class="space-y-1 max-w-[65%]">
              <span class="text-[8px] font-bold text-slate-500 uppercase block tracking-wider">PLATFORM DEED AUDIT</span>
              <h5 class="text-cyan-400 font-black truncate">${this.escapeHTML(correspondingTask ? correspondingTask.title : sub.taskTitle)}</h5>
              <div class="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-sans mt-0.5">
                <span>Player: <strong class="text-white">${sub.userName}</strong></span>
                <span>•</span>
                <span>Prize: <strong class="text-yellow-500">৳${sub.reward}</strong></span>
              </div>
            </div>

            <div class="shrink-0 relative group cursor-zoom-in" onclick="window.appInstance.openScreenshotViewer('${sub.id}')">
              <img src="${sub.screenshot}" class="w-14 h-14 aspect-square object-cover rounded-lg border border-slate-800" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-lg">
                <i class="fa-solid fa-expand text-white text-xs animate-pulse"></i>
              </div>
            </div>
          </div>

          <div class="bg-slate-950 p-2 rounded-xl text-[9.5px]">
            <span class="text-slate-500 leading-normal block">Date submitted: <strong class="text-slate-400">${sub.date}</strong></span>
          </div>

          ${notesLabel}
          ${actions}
        `;
        gallery.appendChild(card);
      });
    }
  },

  deleteAdminTask(taskId) {
    if (!this.db || !this.db.dailyTasks) return;
    const task = this.db.dailyTasks.find(t => t.id === taskId);
    const title = task ? task.title : "Task";
    
    this.db.dailyTasks = this.db.dailyTasks.filter(t => t.id !== taskId);
    this.saveDB();
    this.showToast(`Deleted task "${title}" from the active database catalog.`, "info");
    this.renderAdminTasks();
  },

  renderAdminBadgeRequests() {
    const listEl = document.getElementById("admin-badge-requests-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const reqs = this.db.badgeRequests || [];
    
    // Update count labels and bubble counters
    const pendingCount = reqs.filter(r => r.status === "pending").length;
    const subStatEl = document.getElementById("admin-badge-reqs-sub-stats");
    if (subStatEl) {
      subStatEl.innerText = `${pendingCount} pending applications`;
    }
    const headerBadge = document.getElementById("admin-badge-requests-count-badge");
    if (headerBadge) {
      headerBadge.innerText = pendingCount;
      if (pendingCount > 0) {
        headerBadge.classList.remove("hidden");
      } else {
        headerBadge.classList.add("hidden");
      }
    }

    if (reqs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-10 bg-slate-950 border border-slate-850 rounded-2xl text-[11px] text-slate-500 font-mono">
          <i class="fa-solid fa-ribbon text-slate-700 text-base block mb-1"></i>
          No badge requests submitted by any players yet.
        </div>
      `;
      return;
    }

    // Sort pending first, then newest
    const sorted = [...reqs].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.date) - new Date(a.date);
    });

    sorted.forEach(r => {
      const item = document.createElement("div");
      item.className = "bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 font-mono";

      const badgeMap = {
        vip: { icon: "💎", label: "VIP Player", value: "vip" },
        moderator: { icon: "🛡️", label: "Staff Mod", value: "moderator" },
        star: { icon: "⭐", label: "Elite Star", value: "star" },
        premium: { icon: "✨", label: "Premium Member", value: "premium" },
        pro: { icon: "🔥", label: "Pro Active", value: "pro" },
        legend: { icon: "👑", label: "Royal Legend", value: "legend" }
      };

      const bConf = badgeMap[r.requestedBadge] || { icon: "🎖️", label: r.requestedBadge, value: r.requestedBadge };

      let statusColor = "bg-slate-900 text-slate-400";
      if (r.status === "approved") {
        statusColor = "bg-green-950 text-green-400 border border-green-800/40";
      } else if (r.status === "rejected") {
        statusColor = "bg-red-950 text-red-500 border border-red-850/40";
      } else {
        statusColor = "bg-amber-950 text-amber-500 border border-amber-800/40 animate-pulse";
      }

      item.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-extrabold text-white text-sm">@${r.username}</span>
              <span class="text-[9px] text-slate-500">(${new Date(r.date).toLocaleString()})</span>
            </div>
            
            <div class="flex items-center gap-1.5 mt-2">
              <span class="text-slate-400 text-[10px]">Claims Badge:</span>
              <span class="bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-800/30">
                ${bConf.icon} ${bConf.label}
              </span>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold ${statusColor}">
                ${r.status.toUpperCase()}
              </span>
            </div>

            ${r.reason ? `
              <div class="text-[11px] text-slate-300 bg-slate-900 border border-slate-850 p-2.5 rounded-xl mt-2.5 italic font-sans">
                <span class="text-[9px] text-slate-500 block not-italic font-mono uppercase pb-0.5 font-bold">User Justification Message:</span>
                "${r.reason}"
              </div>
            ` : ""}
          </div>

          <div class="flex gap-1.5 self-start md:self-center">
            ${r.status === "pending" ? `
              <button class="admin-badge-act-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-[10px]" data-action="approve" data-req-id="${r.id}">
                Approve
              </button>
              <button class="admin-badge-act-btn bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-[10px]" data-action="reject" data-req-id="${r.id}">
                Reject
              </button>
            ` : ""}
            <button class="admin-badge-act-btn bg-slate-900 border border-slate-850 hover:bg-red-950/20 text-slate-400 hover:text-red-400 font-bold py-1.5 px-2.5 rounded-lg transition cursor-pointer text-[10px]" data-action="delete" data-req-id="${r.id}">
              Delete
            </button>
          </div>
        </div>
      `;

      listEl.appendChild(item);
    });

    // Bind action events
    listEl.querySelectorAll(".admin-badge-act-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const action = btn.getAttribute("data-action");
        const reqId = btn.getAttribute("data-req-id");
        
        const req = (this.db.badgeRequests || []).find(x => x.id === reqId);
        if (!req) return;

        if (action === "approve") {
          req.status = "approved";
          
          // Auto grant user the badge in users table
          const targetUser = (this.db.users || []).find(usr => usr.id === req.userId || usr.username === req.username);
          if (targetUser) {
            targetUser.customBadge = req.requestedBadge;
            this.showToast(`Granted ${req.requestedBadge.toUpperCase()} Badge to user @${targetUser.username}!`, "success");
          } else {
            this.showToast("User record not found, but marked as approved.", "info");
          }
        } else if (action === "reject") {
          req.status = "rejected";
          this.showToast("Badge request rejected.", "warning");
        } else if (action === "delete") {
          this.db.badgeRequests = (this.db.badgeRequests || []).filter(x => x.id !== reqId);
          this.showToast("Badge request deleted from database.", "info");
        }

        this.saveDB();
        this.renderAdminBadgeRequests(); // Redraw requests view
        this.renderAdmin(); // Sync headers count
      });
    });
  },

  renderAdminEvents() {
    const s = this.db.settings || {};
    const popup = s.popupEvent || {
      enabled: true,
      title: "Eid Mega Draw Festival! 🎉",
      message: "Deposit ৳500 or more today and get a free Ticket to the ৳100,000 Eid Pool! This exclusive premium bonus is available for a limited time only.",
      imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop",
      actionText: "Claim Bonus",
      actionLink: "wallet"
    };

    // Populate popup configs
    const enabledInput = document.getElementById("admin-popup-enabled");
    const titleInput = document.getElementById("admin-popup-title");
    const actionTextInput = document.getElementById("admin-popup-action-text");
    const imageUrlInput = document.getElementById("admin-popup-image-url");
    const redirectSelect = document.getElementById("admin-popup-redirect-tab");
    const msgTextarea = document.getElementById("admin-popup-message");

    if (enabledInput) enabledInput.checked = !!popup.enabled;
    if (titleInput) titleInput.value = popup.title || "";
    if (actionTextInput) actionTextInput.value = popup.actionText || "";
    if (imageUrlInput) imageUrlInput.value = popup.imageUrl || "";
    if (redirectSelect) redirectSelect.value = popup.actionLink || "home";
    if (msgTextarea) msgTextarea.value = popup.message || "";

    // Populate advanced financial fees
    const depChargePctInput = document.getElementById("admin-dep-charge-pct");
    const withdrawChargePctInput = document.getElementById("admin-withdraw-charge-pct");

    if (depChargePctInput) depChargePctInput.value = (s.depositFeePct !== undefined) ? s.depositFeePct : 0;
    if (withdrawChargePctInput) withdrawChargePctInput.value = (s.withdrawFeePct !== undefined) ? s.withdrawFeePct : 2.0;

    // Render active sliding banners
    this.renderActiveBanners();

    // Bind save popup button
    const savePopupBtn = document.getElementById("save-popup-event-btn");
    if (savePopupBtn) {
      savePopupBtn.onclick = (e) => {
        e.preventDefault();
        const enabled = enabledInput ? enabledInput.checked : false;
        const title = titleInput ? titleInput.value.trim() : "";
        const actionText = actionTextInput ? actionTextInput.value.trim() : "";
        const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : "";
        const actionLink = redirectSelect ? redirectSelect.value : "home";
        const message = msgTextarea ? msgTextarea.value.trim() : "";

        this.db.settings.popupEvent = {
          enabled,
          title,
          actionText,
          imageUrl,
          actionLink,
          message
        };
        this.saveDB();
        this.showToast("Full-Screen Popup Event settings updated!", "success");
      };
    }

    // Bind add slide button
    const addBannerBtn = document.getElementById("add-new-banner-btn");
    if (addBannerBtn) {
      addBannerBtn.onclick = (e) => {
        e.preventDefault();
        const bannerTitleInput = document.getElementById("admin-banner-title");
        const bannerSubtitleInput = document.getElementById("admin-banner-subtitle");
        const bannerImageInput = document.getElementById("admin-banner-image");
        const bannerLinkSelect = document.getElementById("admin-banner-link-tab");

        const title = bannerTitleInput ? bannerTitleInput.value.trim() : "";
        const subtitle = bannerSubtitleInput ? bannerSubtitleInput.value.trim() : "";
        const imageUrl = bannerImageInput ? bannerImageInput.value.trim() : "";
        const link = bannerLinkSelect ? bannerLinkSelect.value : "home";

        if (!title || !imageUrl) {
          this.showToast("Banner Title and Image URL are required!", "error");
          return;
        }

        if (!this.db.settings.bannerSlides) {
          this.db.settings.bannerSlides = [];
        }

        const newSlide = {
          id: "b_" + Date.now(),
          title,
          subtitle,
          imageUrl,
          link
        };

        this.db.settings.bannerSlides.push(newSlide);
        this.saveDB();
        this.showToast("New sliding banner added!", "success");

        if (bannerTitleInput) bannerTitleInput.value = "";
        if (bannerSubtitleInput) bannerSubtitleInput.value = "";
        if (bannerImageInput) bannerImageInput.value = "";

        this.renderActiveBanners();
      };
    }

    // Bind save financial fees button
    const saveAdvFeesBtn = document.getElementById("save-adv-fees-btn");
    if (saveAdvFeesBtn) {
      saveAdvFeesBtn.onclick = (e) => {
        e.preventDefault();
        const depFee = depChargePctInput ? parseFloat(depChargePctInput.value) : 0;
        const withdrawFee = withdrawChargePctInput ? parseFloat(withdrawChargePctInput.value) : 2.0;

        this.db.settings.depositFeePct = depFee;
        this.db.settings.withdrawFeePct = withdrawFee;
        this.saveDB();
        this.showToast("Advanced financial fee configs updated!", "success");
      };
    }

    // Bind simulation deposit button
    const simDepositBtn = document.getElementById("sim-deposit-pulse-btn");
    if (simDepositBtn) {
      simDepositBtn.onclick = (e) => {
        e.preventDefault();
        const icon = document.getElementById("pulse-icon");
        const spinner = document.getElementById("pulse-spinner");
        if (icon && spinner) {
          icon.classList.add("hidden");
          spinner.classList.remove("hidden");
        }

        setTimeout(() => {
          if (!this.db.deposits) this.db.deposits = [];
          
          // Find any user
          const users = this.db.users || [];
          if (users.length === 0) {
            this.showToast("No players registered in DB to simulate deposit for!", "error");
            if (icon && spinner) {
              icon.classList.remove("hidden");
              spinner.classList.add("hidden");
            }
            return;
          }

          const randUser = users[Math.floor(Math.random() * users.length)];
          const amount = Math.floor(Math.random() * 4500) + 500;
          
          const mockDep = {
            id: "dep_sim_" + Date.now(),
            userId: randUser.id,
            username: randUser.username,
            amount,
            gateway: ["bKash", "Nagad", "Rocket", "USDT"][Math.floor(Math.random() * 4)],
            trxid: "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            status: "pending"
          };

          this.db.deposits.push(mockDep);
          this.saveDB();

          if (icon && spinner) {
            icon.classList.remove("hidden");
            spinner.classList.add("hidden");
          }
          this.showToast(`Simulated deposit of ৳${amount} for @${randUser.username} initialized!`, "success");
        }, 800);
      };
    }

    // Bind factory reset button
    const factoryResetBtn = document.getElementById("factory-reset-db-btn");
    if (factoryResetBtn) {
      factoryResetBtn.onclick = (e) => {
        e.preventDefault();
        if (confirm("🚨 WARNING: Are you absolutely sure you want to completely wipe all database states and factory reset the application? This cannot be undone.")) {
          localStorage.removeItem(this.dbKey);
          this.showToast("Database completely cleared. Reloading page now...", "warning");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      };
    }
  },

  renderActiveBanners() {
    const container = document.getElementById("admin-active-banners-container");
    if (!container) return;

    const slides = this.db.settings.bannerSlides || [];
    if (slides.length === 0) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 text-center py-6 text-slate-500 font-sans text-xs bg-slate-950 rounded-2xl border border-slate-850">
          No active banners. Add a banner below!
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    slides.forEach((slide) => {
      const el = document.createElement("div");
      el.className = "bg-slate-950 border border-slate-800 rounded-2xl p-3 flex gap-3 items-center justify-between";
      el.innerHTML = `
        <div class="flex gap-2.5 items-center overflow-hidden">
          <img src="${slide.imageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=100&auto=format&fit=crop'}" class="w-12 h-12 object-cover rounded-xl shrink-0">
          <div class="overflow-hidden space-y-0.5">
            <span class="text-[8px] bg-red-950 border border-red-900/40 text-red-400 px-1.5 py-0.5 rounded-full font-sans">${slide.subtitle || 'PROMO'}</span>
            <h4 class="text-xs font-bold text-white truncate max-w-[150px] font-sans">${slide.title}</h4>
            <span class="text-[9px] text-slate-500 block">Link: <strong class="text-cyan-400 font-sans">${slide.link}</strong></span>
          </div>
        </div>
        <button class="delete-banner-btn bg-rose-950/40 hover:bg-rose-900 border border-rose-900/30 text-rose-400 w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer" data-id="${slide.id}">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      `;

      // Event listener for delete button
      el.querySelector(".delete-banner-btn").onclick = (e) => {
        e.preventDefault();
        this.db.settings.bannerSlides = this.db.settings.bannerSlides.filter(s => s.id !== slide.id);
        this.saveDB();
        this.showToast("Sliding banner deleted successfully!", "info");
        this.renderActiveBanners();
      };

      container.appendChild(el);
    });
  }
};
