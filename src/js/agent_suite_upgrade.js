// ============================================================================
// AGENT SUITE UPGRADE: 20-ITEM SIDEBAR, LIVE DASHBOARD, MANAGEMENT & LIVE CHAT
// ============================================================================

export const AgentSuiteUpgrade = {
  activeSubTab: localStorage.getItem("agent_active_tab") || "overview",
  sidebarCollapsed: localStorage.getItem("agent_sidebar_collapsed") === "true",
  activeChatUser: null,
  chatInboxFilter: "all",
  chatComposerMode: "reply", // 'reply' | 'note'
  agentPendingAttachment: null,
  userPendingAttachment: null,
  lastSentSignature: "",
  lastSentTimestamp: 0,
  chatPollTimer: null,

  // --------------------------------------------------------------------------
  // 1. UNIFIED AGENT & USER RECORDS SYNCHRONIZATION (User <-> Agent <-> Admin)
  // --------------------------------------------------------------------------
  getAllUnifiedAgents(app) {
    const allAgents = Array.isArray(app.db?.agents) ? app.db.agents : [];
    const allStaff = Array.isArray(app.db?.staff) ? app.db.staff : [];
    const userAgents = (Array.isArray(app.db?.users) ? app.db.users : []).filter(
      u => u && (u.role === "agent" || u.role === "subagent")
    );
    const map = new Map();
    [...userAgents, ...allStaff, ...allAgents].forEach(a => {
      if (!a || !a.username) return;
      if (a.role !== "agent" && a.role !== "subagent") return;
      const key = a.username.toLowerCase();
      map.set(key, { ...(map.get(key) || {}), ...a });
    });
    return Array.from(map.values());
  },

  syncAgentRecordEverywhere(app, agentUser) {
    if (!agentUser || !agentUser.username) return;
    const uLower = agentUser.username.toLowerCase();

    const updateInArray = (arr) => {
      if (!Array.isArray(arr)) return false;
      let found = false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] && (arr[i].id === agentUser.id || (arr[i].username && arr[i].username.toLowerCase() === uLower))) {
          arr[i] = { ...arr[i], ...agentUser };
          found = true;
        }
      }
      return found;
    };

    if (!Array.isArray(app.db.users)) app.db.users = [];
    if (!Array.isArray(app.db.staff)) app.db.staff = [];
    if (!Array.isArray(app.db.agents)) app.db.agents = [];

    const inUsers = updateInArray(app.db.users);
    const inStaff = updateInArray(app.db.staff);
    const inAgents = updateInArray(app.db.agents);

    if (!inUsers) app.db.users.push({ ...agentUser });
    if (!inStaff) app.db.staff.push({ ...agentUser });
    if (!inAgents) app.db.agents.push({ ...agentUser });
  },

  getMyReferredUsers(app) {
    if (!app.currentUser) return [];
    const myUsername = (app.currentUser.username || "").toLowerCase();
    const directSet = new Set();
    if (Array.isArray(app.currentUser.referredUsers)) {
      app.currentUser.referredUsers.forEach(r => {
        if (r && r.username) directSet.add(r.username.toLowerCase());
      });
    }
    return (app.db.users || []).filter(u => {
      if (!u || !u.username || u.role !== "user") return false;
      return (u.referredBy && u.referredBy.toLowerCase() === myUsername) || directSet.has(u.username.toLowerCase());
    });
  },

  // --------------------------------------------------------------------------
  // 2. FILE ATTACHMENT VALIDATION HELPER (Max 2MB, Safe Image/PDF only)
  // --------------------------------------------------------------------------
  validateAndReadAttachment(file, app) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        app.showToast("Invalid file type! Only JPG, PNG, WEBP, GIF, and PDF files are allowed.", "error");
        return resolve(null);
      }
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxBytes) {
        app.showToast("File is too large! Maximum allowed attachment size is 2MB.", "error");
        return resolve(null);
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: String(reader.result || ""),
          name: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 80),
          type: file.type,
          size: file.size
        });
      };
      reader.onerror = () => {
        app.showToast("Failed to read attachment file.", "error");
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  },

  // --------------------------------------------------------------------------
  // 3. SIDEBAR NAVIGATION & TAB SWITCHING
  // --------------------------------------------------------------------------
  applySidebarState() {
    const sidebar = document.getElementById("agent-sidebar");
    const icon = document.getElementById("agent-sidebar-collapse-icon");
    if (!sidebar) return;

    const textEls = sidebar.querySelectorAll(".agent-sidebar-text");
    if (this.sidebarCollapsed && window.innerWidth >= 1024) {
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-20");
      textEls.forEach(el => el.classList.add("hidden"));
      if (icon) icon.className = "fa-solid fa-angles-right text-[10px]";
    } else {
      sidebar.classList.remove("w-20");
      sidebar.classList.add("w-64");
      textEls.forEach(el => el.classList.remove("hidden"));
      if (icon) icon.className = "fa-solid fa-angles-left text-[10px]";
    }
  },

  switchAgentTab(app, tabKey) {
    if (!tabKey) return;
    // RBAC check: subagents cannot open subagents management tab
    if (tabKey === "subagents" && app.currentUser?.role === "subagent") {
      app.showToast("Access restricted: Sub-Agents cannot manage downline sub-agents.", "error");
      return;
    }

    this.activeSubTab = tabKey;
    localStorage.setItem("agent_active_tab", tabKey);

    const allPanels = [
      "overview",
      "live-chat",
      "players",
      "add-user",
      "reg-history",
      "commissions",
      "transactions",
      "payment-requests",
      "wallet",
      "referrals",
      "notifications",
      "analytics",
      "profile",
      "security",
      "support",
      "booker",
      "cash",
      "subagents",
      "ledger"
    ];

    allPanels.forEach(k => {
      const panelEl = document.getElementById(`agent-tab-${k}`);
      if (panelEl) {
        if (k === tabKey) {
          panelEl.classList.remove("hidden");
        } else {
          panelEl.classList.add("hidden");
        }
      }
    });

    const tabTitles = {
      "overview": "1. Agent Dashboard Overview",
      "live-chat": "2. Live Chat Support Inbox",
      "players": "3. My Users & Field Player Registry",
      "add-user": "4. Add New User (Agent-Assisted Registration)",
      "reg-history": "5. User Registration History",
      "commissions": "6. Commission & Earnings",
      "transactions": "7. Transaction History",
      "payment-requests": "8. User Payment Requests",
      "wallet": "9. Operational Wallet & Balance",
      "referrals": "10. Referral Performance",
      "notifications": "11. Agent Notifications & Alerts",
      "analytics": "12. Reports & Analytics",
      "profile": "13. Agent Profile & Counter Settings",
      "security": "14. Security & Password Settings",
      "support": "15. Help & Support Desk",
      "booker": "16. Lottery Ticket Booker Console",
      "cash": "17. Cash Terminal (Load & Payout)",
      "subagents": "18. Manage Sub-Agents Network",
      "ledger": "19. Session History Logs"
    };

    const pageTitleEl = document.getElementById("agent-active-page-title");
    if (pageTitleEl) {
      pageTitleEl.innerText = tabTitles[tabKey] || "Agent Workspace";
    }

    const tabBtns = document.querySelectorAll(".agent-tab-selector-btn");
    tabBtns.forEach(b => {
      const bVal = b.getAttribute("val");
      if (bVal === tabKey) {
        b.className = "agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-emerald-600 text-white shadow-lg shadow-emerald-600/15";
      } else {
        b.className = "agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white";
      }
    });

    // Close mobile drawer when selecting a menu item
    this.closeMobileDrawer();

    // Re-apply collapsed text visibility
    this.applySidebarState();

    if (typeof this.renderAllPanels === "function") {
      this.renderAllPanels(app);
    }

    if (tabKey === "profile" && typeof this.populateProfileForm === "function") {
      this.populateProfileForm(app);
    }
  },

  openMobileDrawer() {
    const sidebar = document.getElementById("agent-sidebar");
    const backdrop = document.getElementById("agent-sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("-translate-x-full");
    if (backdrop) backdrop.classList.remove("hidden");
  },

  closeMobileDrawer() {
    const sidebar = document.getElementById("agent-sidebar");
    const backdrop = document.getElementById("agent-sidebar-backdrop");
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
  },

  // --------------------------------------------------------------------------
  // 4. RENDER ALL AGENT PANELS & LIVE METRICS
  // --------------------------------------------------------------------------
  renderAllPanels(app) {
    if (!app.currentUser || (app.currentUser.role !== "agent" && app.currentUser.role !== "subagent")) return;

    this.startPollingIfNeeded(app);

    const agent = app.currentUser;
    const agentUsernameLower = (agent.username || "").toLowerCase();
    const balanceNum = Number(agent.balance) || 0;
    const earnedCommNum = Number(agent.earnedCommission) || 0;

    // Sync latest agent record from db if needed
    this.syncAgentRecordEverywhere(app, agent);

    // 1. Update Sidebar & Header Identity
    const fullNameEl = document.getElementById("agent-sidebar-fullname");
    if (fullNameEl) fullNameEl.innerText = agent.displayName || agent.name || `@${agent.username}`;

    const idEl = document.getElementById("agent-sidebar-id");
    if (idEl) idEl.innerText = String(agent.id || agent.username).toUpperCase().slice(-8);

    const distEl = document.getElementById("agent-sidebar-district");
    if (distEl) distEl.innerText = `${agent.district || "Dhaka"} District Station`;

    const balSidebarEl = document.getElementById("agent-sidebar-balance");
    if (balSidebarEl) balSidebarEl.innerText = `৳${balanceNum.toFixed(2)}`;

    const balHeaderEl = document.getElementById("agent-header-balance-inline");
    if (balHeaderEl) balHeaderEl.innerText = `Balance: ৳${balanceNum.toFixed(2)}`;

    const statusSidebarEl = document.getElementById("agent-sidebar-status");
    if (statusSidebarEl) {
      const avail = (agent.availabilityStatus || "online").toLowerCase();
      if (avail === "busy") {
        statusSidebarEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> BUSY`;
        statusSidebarEl.className = "inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400";
      } else if (avail === "offline") {
        statusSidebarEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> OFFLINE`;
        statusSidebarEl.className = "inline-flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400";
      } else {
        statusSidebarEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE`;
        statusSidebarEl.className = "inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400";
      }
    }

    // 2. Compute Live Dashboard & Badge Metrics from Actual Database
    const myUsers = this.getMyReferredUsers(app);
    const activeMyUsers = myUsers.filter(u => (u.status || "active") === "active");
    const todayIso = new Date().toISOString().split("T")[0];
    const todayRegs = myUsers.filter(u => (u.joinDate || "").startsWith(todayIso));

    const myLedger = (app.db.agentLedger || []).filter(
      l => l && (l.agentId === agent.id || (l.agentUsername && l.agentUsername.toLowerCase() === agentUsernameLower))
    );

    const pendingCommissionSum = myLedger
      .filter(l => l.status === "pending")
      .reduce((sum, l) => sum + (Number(l.commission) || 0), 0);

    // Chat Threads & Unread Messages for this Agent
    const threads = this.getAgentChatThreads(app);
    const openThreadsCount = threads.filter(t => t.threadStatus !== "resolved").length;
    const unreadChatsCount = threads.reduce((sum, t) => sum + t.unreadCount, 0);

    // Payment requests relevant to this agent's users or station
    const myUsernamesSet = new Set(myUsers.map(u => u.username.toLowerCase()));
    const allDeposits = (app.db.deposits || []).filter(
      d => d && (myUsernamesSet.has((d.username || "").toLowerCase()) || (d.gateway || "").toLowerCase().includes("agent"))
    );
    const allWithdrawals = (app.db.withdrawals || []).filter(
      w => w && (myUsernamesSet.has((w.username || "").toLowerCase()) || (w.gateway || "").toLowerCase().includes("agent"))
    );
    const pendingPayReqsCount =
      allDeposits.filter(d => d.status === "pending").length +
      allWithdrawals.filter(w => w.status === "pending").length;

    // Notifications count
    const myNotifications = this.getAgentNotifications(app);
    const unreadNotifCount = myNotifications.filter(n => !n.isRead).length + unreadChatsCount;

    // Update Sidebar & Header Badges
    this.updateBadge("agent-nav-badge-chat", unreadChatsCount);
    this.updateBadge("agent-header-badge-chat", unreadChatsCount);
    this.updateBadge("agent-nav-badge-payments", pendingPayReqsCount);
    this.updateBadge("agent-nav-badge-notifications", unreadNotifCount);
    this.updateBadge("agent-header-badge-notif", unreadNotifCount);

    const usersBadgeEl = document.getElementById("agent-nav-badge-users");
    if (usersBadgeEl) usersBadgeEl.innerText = String(myUsers.length);

    // Update Dashboard Cards
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = String(val);
    };
    setText("agent-dash-total-users", myUsers.length);
    setText("agent-dash-active-users", activeMyUsers.length);
    setText("agent-dash-active-users-card", activeMyUsers.length);
    setText("agent-dash-pending-commission", `৳${pendingCommissionSum.toFixed(2)}`);
    setText("agent-dash-today-regs", todayRegs.length);
    setText("agent-dash-pending-payments", pendingPayReqsCount);
    setText("agent-dash-open-chats", openThreadsCount);
    setText("agent-dash-unread-chats", unreadChatsCount);

    // Render Dashboard Period Trends & Recent Feed
    this.renderDashboardTrendsAndFeed(app, myUsers, myLedger);

    // Render My Users enhanced table (adds Live Chat & Book Ticket buttons)
    this.renderMyUsersTable(app, myUsers);

    // Render Registration History
    this.renderRegistrationHistory(app, myUsers, myLedger);

    // Render Commissions & Earnings
    this.renderCommissionsTab(app, myLedger, earnedCommNum, pendingCommissionSum);

    // Render Transaction History
    this.renderTransactionsTab(app, myLedger, allDeposits, allWithdrawals);

    // Render Payment Requests
    this.renderPaymentRequestsTab(app, allDeposits, allWithdrawals);

    // Render Wallet & Balance
    this.renderAgentWalletTab(app, balanceNum, earnedCommNum, myLedger);

    // Render Referral Performance
    this.renderReferralsTab(app, myUsers);

    // Render Notifications
    this.renderNotificationsTab(app, myNotifications, threads);

    // Render Reports & Analytics
    this.renderAnalyticsTab(app, myUsers, myLedger);

    // Populate Agent Profile Form
    this.populateProfileForm(app);

    // Render Agent Live Chat Inbox
    this.renderAgentChatInbox(app, threads);
  },

  updateBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.innerText = count > 99 ? "99+" : String(count);
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  },

  filterByDateRange(timestampOrDateStr, range) {
    if (!range || range === "all") return true;
    if (!timestampOrDateStr) return false;
    const d = new Date(timestampOrDateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    if (range === "today") {
      return d.toISOString().split("T")[0] === now.toISOString().split("T")[0];
    }
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
    if (range === "7d") return diffDays <= 7;
    if (range === "30d") return diffDays <= 30;
    return true;
  },

  renderDashboardTrendsAndFeed(app, myUsers, myLedger) {
    const rangeSelect = document.getElementById("agent-dash-range-select");
    const range = rangeSelect ? rangeSelect.value : "all";

    const filteredUsers = myUsers.filter(u => this.filterByDateRange(u.joinDate, range));
    const filteredLedger = myLedger.filter(l => this.filterByDateRange(l.timestamp, range));

    const cashLoadVol = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("deposit") || (l.description || "").toLowerCase().includes("load"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const ticketVol = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("booked ticket"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const commEarned = filteredLedger
      .filter(l => l.status !== "pending")
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };
    setEl("agent-dash-trend-regs", String(filteredUsers.length));
    setEl("agent-dash-trend-loads", `৳${cashLoadVol.toFixed(2)}`);
    setEl("agent-dash-trend-tickets", `৳${ticketVol.toFixed(2)}`);
    setEl("agent-dash-trend-comm", `৳${commEarned.toFixed(2)}`);

    const tbody = document.getElementById("agent-dash-recent-tbody");
    if (!tbody) return;

    const recent = [...filteredLedger].reverse().slice(0, 8);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">No activity recorded for this period.</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(act => {
      const d = new Date(act.timestamp);
      const timeStr = isNaN(d.getTime()) ? (act.timestamp || "N/A") : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const isPending = act.status === "pending";
      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-2.5 text-slate-400">${app.escapeHTML(timeStr)}</td>
          <td class="p-2.5 text-white font-bold">@${app.escapeHTML(act.targetUser || "user")}</td>
          <td class="p-2.5 text-slate-300 font-sans">${app.escapeHTML(act.description || "Activity")}</td>
          <td class="p-2.5 text-slate-200">৳${(Number(act.amount) || 0).toFixed(2)}</td>
          <td class="p-2.5 text-right ${isPending ? 'text-amber-400' : 'text-emerald-400'} font-bold">
            ${Number(act.commission) > 0 ? `${isPending ? '(Pending) ' : ''}+৳${(Number(act.commission) || 0).toFixed(2)}` : '-'}
          </td>
        </tr>
      `;
    }).join("");
  },

  renderMyUsersTable(app, myUsers) {
    const playersTbody = document.getElementById("agent-players-tbody");
    if (!playersTbody) return;

    const scopeSelect = document.getElementById("agent-players-scope-filter");
    const scope = scopeSelect ? scopeSelect.value : "all";
    const searchVal = (document.getElementById("agent-players-search-input")?.value || "").toLowerCase().trim();

    const myUsernamesSet = new Set(myUsers.map(u => u.username.toLowerCase()));
    const sourcePlayers = scope === "my"
      ? myUsers
      : (app.db.users || []).filter(u => u && u.role === "user");

    const filtered = sourcePlayers.filter(p => {
      if (!searchVal) return true;
      return (p.username || "").toLowerCase().includes(searchVal) ||
             (p.id || "").toLowerCase().includes(searchVal) ||
             (p.email || "").toLowerCase().includes(searchVal) ||
             (p.phone || "").toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
      playersTbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-6 text-center text-slate-500 font-mono">
            No matching players found.
          </td>
        </tr>
      `;
      return;
    }

    playersTbody.innerHTML = filtered.map(p => {
      const isMyRef = myUsernamesSet.has((p.username || "").toLowerCase());
      const isActive = (p.status || "active") === "active";
      return `
        <tr class="border-b border-slate-800/30 hover:bg-slate-900/40 transition">
          <td class="p-3">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span>@${app.escapeHTML(p.username)}</span>
              ${isMyRef ? `<span class="text-[9px] text-indigo-400 font-mono">· My Referral</span>` : ""}
            </div>
            <div class="text-[9.5px] text-slate-500 font-mono">ID: ${app.escapeHTML(p.id || "N/A")} · ${app.escapeHTML(p.email || "N/A")}</div>
          </td>
          <td class="p-3 font-mono text-slate-300 select-all">${app.escapeHTML(p.phone || "N/A")}</td>
          <td class="p-3 font-mono font-bold text-emerald-400">৳${(Number(p.balance) || 0).toFixed(2)}</td>
          <td class="p-3 font-mono text-[10px]">
            <span class="${isActive ? 'text-emerald-400' : 'text-rose-400'} font-bold uppercase">● ${app.escapeHTML(p.status || "active")}</span>
          </td>
          <td class="p-3 text-right space-x-1 whitespace-nowrap">
            <button type="button" class="agent-open-user-chat bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition cursor-pointer" data-username="${app.escapeHTML(p.username)}">
              <i class="fa-solid fa-comments mr-1"></i>Chat
            </button>
            <button type="button" class="agent-fill-user-load bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition cursor-pointer" data-username="${app.escapeHTML(p.username)}">
              Load Cash
            </button>
            <button type="button" class="agent-fill-user-wdr bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/50 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition cursor-pointer" data-username="${app.escapeHTML(p.username)}">
              Cash Out
            </button>
            <button type="button" class="agent-fill-user-book bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition cursor-pointer" data-username="${app.escapeHTML(p.username)}">
              Book Ticket
            </button>
          </td>
        </tr>
      `;
    }).join("");

    playersTbody.querySelectorAll(".agent-open-user-chat").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        this.activeChatUser = u;
        this.switchAgentTab(app, "live-chat");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-load").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const depUserEl = document.getElementById("agent-cash-dep-username");
        if (depUserEl) depUserEl.value = u;
        this.switchAgentTab(app, "cash");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-wdr").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const wdrUserEl = document.getElementById("agent-cash-wdr-username");
        if (wdrUserEl) wdrUserEl.value = u;
        this.switchAgentTab(app, "cash");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-book").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const bookUserEl = document.getElementById("agent-booking-user");
        if (bookUserEl) bookUserEl.value = u;
        this.switchAgentTab(app, "booker");
      });
    });
  },

  renderRegistrationHistory(app, myUsers, myLedger) {
    const tbody = document.getElementById("agent-reghistory-tbody");
    if (!tbody) return;

    const q = (document.getElementById("agent-reghistory-search")?.value || "").toLowerCase().trim();
    const list = myUsers.filter(u => !q || (u.username || "").toLowerCase().includes(q) || (u.phone || "").toLowerCase().includes(q));

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-5 text-center text-slate-500">No user registrations found under your account yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = [...list].reverse().map(u => {
      const totDep = Number(u.totDeposit) || 0;
      const isQualified = u.agentCommissionPaid || totDep >= 100;
      const regLog = myLedger.find(l => (l.targetUser || "").toLowerCase() === u.username.toLowerCase() && (l.description || "").toLowerCase().includes("registration"));
      const commAmt = regLog ? (Number(regLog.commission) || 0) : (Number(u.pendingAgentCommission) || 100);

      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-3 text-slate-400">${app.escapeHTML(u.joinDate || "N/A")}</td>
          <td class="p-3 text-white font-bold">@${app.escapeHTML(u.username)} <span class="text-[9px] text-slate-500 block">ID: ${app.escapeHTML(u.id)}</span></td>
          <td class="p-3 text-slate-300">${app.escapeHTML(u.phone || "N/A")}<span class="block text-[9.5px] text-slate-500">${app.escapeHTML(u.email || "")}</span></td>
          <td class="p-3 text-emerald-400 font-bold">৳${(Number(u.balance) || 0).toFixed(2)}</td>
          <td class="p-3 text-cyan-400 font-bold">৳${totDep.toFixed(2)}</td>
          <td class="p-3 text-right">
            ${isQualified
              ? `<span class="text-emerald-400 font-bold">+৳${commAmt.toFixed(2)} (Released)</span>`
              : `<span class="text-amber-400 font-bold">৳${commAmt.toFixed(2)} (Pending ৳100 Dep)</span>`
            }
          </td>
        </tr>
      `;
    }).join("");
  },

  renderCommissionsTab(app, myLedger, earnedCommNum, pendingCommissionSum) {
    const bookingComm = myLedger
      .filter(l => l.status !== "pending" && (l.description || "").toLowerCase().includes("booked ticket"))
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const overrideComm = myLedger
      .filter(l => l.status !== "pending" && (l.description || "").toLowerCase().includes("override"))
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const setEl = (id, t) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    setEl("agent-comm-tab-total", `৳${earnedCommNum.toFixed(2)}`);
    setEl("agent-comm-tab-pending", `৳${pendingCommissionSum.toFixed(2)}`);
    setEl("agent-comm-tab-booking", `৳${bookingComm.toFixed(2)}`);
    setEl("agent-comm-tab-override", `৳${overrideComm.toFixed(2)}`);

    const tbody = document.getElementById("agent-commissions-tbody");
    if (!tbody) return;

    const statusFilter = document.getElementById("agent-comm-filter-status")?.value || "all";
    const commEntries = myLedger.filter(l => {
      if ((Number(l.commission) || 0) <= 0) return false;
      const isPend = l.status === "pending";
      if (statusFilter === "complete") return !isPend;
      if (statusFilter === "pending") return isPend;
      return true;
    });

    if (commEntries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-5 text-center text-slate-500">No commission entries match the selected filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = [...commEntries].reverse().map(l => {
      const d = new Date(l.timestamp);
      const timeStr = isNaN(d.getTime()) ? (l.timestamp || "N/A") : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const isPend = l.status === "pending";
      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-3 text-slate-400">${app.escapeHTML(timeStr)}</td>
          <td class="p-3 text-white font-bold">@${app.escapeHTML(l.targetUser || "user")}</td>
          <td class="p-3 text-slate-300 font-sans">${app.escapeHTML(l.description || "Commission")}</td>
          <td class="p-3 text-slate-300">৳${(Number(l.amount) || 0).toFixed(2)}</td>
          <td class="p-3 ${isPend ? 'text-amber-400' : 'text-emerald-400'} font-bold uppercase text-[10px]">${isPend ? 'Pending' : 'Earned'}</td>
          <td class="p-3 text-right ${isPend ? 'text-amber-400' : 'text-emerald-400'} font-black">+৳${(Number(l.commission) || 0).toFixed(2)}</td>
        </tr>
      `;
    }).join("");
  },

  renderTransactionsTab(app, myLedger, allDeposits, allWithdrawals) {
    const tbody = document.getElementById("agent-transactions-tbody");
    if (!tbody) return;

    const typeFilter = document.getElementById("agent-tx-type-filter")?.value || "all";
    const q = (document.getElementById("agent-tx-search-input")?.value || "").toLowerCase().trim();

    const agentUsernameLower = (app.currentUser?.username || "").toLowerCase();
    const myTxs = (app.db.transactions || []).filter(
      tx => tx && (tx.userId === app.currentUser.id || (tx.username || "").toLowerCase() === agentUsernameLower)
    );

    const unified = [];
    myLedger.forEach(l => {
      const descLower = (l.description || "").toLowerCase();
      const tType = descLower.includes("cashout") || descLower.includes("withdraw") ? "withdraw" : "deposit";
      unified.push({
        id: l.id || "ACT",
        date: l.timestamp || "",
        user: l.targetUser || app.currentUser.username,
        details: l.description || "Agent Ledger Operation",
        type: tType,
        status: l.status || "complete",
        amount: Number(l.amount) || Number(l.commission) || 0
      });
    });

    myTxs.forEach(t => {
      unified.push({
        id: t.id || "TX",
        date: t.date || "",
        user: t.username || app.currentUser.username,
        details: `${t.paymentMethod || "System"} ${t.notes ? '· ' + t.notes : ''}`,
        type: (t.transactionType || "deposit").toLowerCase().includes("withdraw") ? "withdraw" : "deposit",
        status: t.status || "complete",
        amount: Number(t.amount) || 0
      });
    });

    const filtered = unified.filter(item => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!q) return true;
      return item.id.toLowerCase().includes(q) ||
             item.user.toLowerCase().includes(q) ||
             item.details.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-5 text-center text-slate-500">No transactions found.</td></tr>`;
      return;
    }

    tbody.innerHTML = [...filtered].reverse().map(item => `
      <tr class="hover:bg-slate-950/60 transition">
        <td class="p-3 text-slate-400">${app.escapeHTML(item.id.slice(0, 14))}</td>
        <td class="p-3 text-slate-400">${app.escapeHTML(String(item.date).slice(0, 19).replace("T", " "))}</td>
        <td class="p-3 text-white font-bold">@${app.escapeHTML(item.user)}</td>
        <td class="p-3 text-slate-300 font-sans">${app.escapeHTML(item.details)}</td>
        <td class="p-3 uppercase text-[10px] font-bold ${item.type === 'withdraw' ? 'text-rose-400' : 'text-emerald-400'}">${item.type}</td>
        <td class="p-3 uppercase text-[10px] font-bold ${item.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'}">${app.escapeHTML(item.status)}</td>
        <td class="p-3 text-right text-white font-black">৳${item.amount.toFixed(2)}</td>
      </tr>
    `).join("");
  },

  renderPaymentRequestsTab(app, allDeposits, allWithdrawals) {
    const tbody = document.getElementById("agent-payreq-tbody");
    if (!tbody) return;

    const statusFilter = document.getElementById("agent-payreq-status-filter")?.value || "all";
    const combined = [
      ...allDeposits.map(d => ({ ...d, reqType: "Deposit / Cash Load" })),
      ...allWithdrawals.map(w => ({ ...w, reqType: "Withdrawal / Cashout" }))
    ].filter(r => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return r.status === "pending";
      return r.status === "approved" || r.status === "complete";
    });

    if (combined.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-5 text-center text-slate-500">No payment requests matching filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = [...combined].reverse().map(r => {
      const isDep = r.reqType.startsWith("Deposit");
      const isPending = r.status === "pending";
      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-3 text-slate-400">${app.escapeHTML(String(r.id || "").slice(0, 14))}</td>
          <td class="p-3 text-white font-bold">@${app.escapeHTML(r.username || "user")}</td>
          <td class="p-3 ${isDep ? 'text-emerald-400' : 'text-rose-400'} font-bold">${r.reqType}</td>
          <td class="p-3 text-slate-300">${app.escapeHTML(r.gateway || r.method || "Agent Counter")} ${r.phone ? '· ' + app.escapeHTML(r.phone) : ''}</td>
          <td class="p-3 text-white font-black">৳${(Number(r.amount) || 0).toFixed(2)}</td>
          <td class="p-3 uppercase text-[10px] font-bold ${isPending ? 'text-amber-400' : 'text-emerald-400'}">${app.escapeHTML(r.status || "pending")}</td>
          <td class="p-3 text-right space-x-1">
            <button type="button" class="payreq-assist-btn bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer" data-user="${app.escapeHTML(r.username || '')}" data-amount="${Number(r.amount) || 0}" data-isdep="${isDep ? '1' : '0'}">
              Open Terminal
            </button>
            <button type="button" class="payreq-chat-btn bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer" data-user="${app.escapeHTML(r.username || '')}">
              Chat
            </button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".payreq-assist-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-user");
        const amt = btn.getAttribute("data-amount");
        const isDep = btn.getAttribute("data-isdep") === "1";
        if (isDep) {
          const uEl = document.getElementById("agent-cash-dep-username");
          const aEl = document.getElementById("agent-cash-dep-amount");
          if (uEl) uEl.value = u;
          if (aEl) aEl.value = amt;
        } else {
          const uEl = document.getElementById("agent-cash-wdr-username");
          const aEl = document.getElementById("agent-cash-wdr-amount");
          if (uEl) uEl.value = u;
          if (aEl) aEl.value = amt;
        }
        this.switchAgentTab(app, "cash");
      });
    });

    tbody.querySelectorAll(".payreq-chat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeChatUser = btn.getAttribute("data-user");
        this.switchAgentTab(app, "live-chat");
      });
    });
  },

  renderAgentWalletTab(app, balanceNum, earnedCommNum, myLedger) {
    const ledgerList = Array.isArray(myLedger) ? myLedger : [];
    const totalLoaded = ledgerList
      .filter(l => (l.description || "").toLowerCase().includes("deposit") || (l.description || "").toLowerCase().includes("load"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const setEl = (id, t) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    const bNum = Number(balanceNum) || 0;
    const cNum = Number(earnedCommNum) || 0;
    setEl("agent-wallet-tab-balance", `৳${bNum.toFixed(2)}`);
    setEl("agent-wallet-tab-commission", `৳${cNum.toFixed(2)}`);
    setEl("agent-wallet-tab-loaded", `৳${totalLoaded.toFixed(2)}`);
  },

  renderWalletTab(app, balanceNum, earnedCommNum, myLedger) {
    if (myLedger !== undefined || (typeof balanceNum === "number" && !isNaN(balanceNum))) {
      return this.renderAgentWalletTab(app, balanceNum, earnedCommNum, myLedger);
    }
    const targetApp = app || this;
    if (typeof (targetApp).renderUserWalletTab === "function") {
      return (targetApp).renderUserWalletTab();
    }
  },

  renderReferralsTab(app, myUsers) {
    const linkInput = document.getElementById("agent-referral-link-input");
    if (linkInput && app.currentUser) {
      linkInput.value = `${window.location.origin}/?ref=${encodeURIComponent(app.currentUser.username)}`;
    }

    const tickets = app.db.tickets || [];
    const lotteries = app.db.lotteries || [];
    const feeMap = {};
    lotteries.forEach(l => { feeMap[l.id] = Number(l.entryFee) || 100; });

    let totalRefTickets = 0;
    let totalRefVolume = 0;
    const perUserStats = {};

    myUsers.forEach(u => {
      perUserStats[u.id] = { tickets: 0, vol: 0 };
    });

    tickets.forEach(t => {
      if (perUserStats[t.userId]) {
        const fee = feeMap[t.lotteryId] || 100;
        perUserStats[t.userId].tickets++;
        perUserStats[t.userId].vol += fee;
        totalRefTickets++;
        totalRefVolume += fee;
      }
    });

    const qualifiedCount = myUsers.filter(u => u.agentCommissionPaid || (Number(u.totDeposit) || 0) >= 100).length;

    const setEl = (id, t) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    setEl("agent-ref-stat-l1", String(myUsers.length));
    setEl("agent-ref-stat-qualified", String(qualifiedCount));
    setEl("agent-ref-stat-tickets", String(totalRefTickets));
    setEl("agent-ref-stat-volume", `৳${totalRefVolume.toFixed(2)}`);

    const tbody = document.getElementById("agent-referrals-tbody");
    if (!tbody) return;

    if (myUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-5 text-center text-slate-500">No referred users yet. Share your referral link above!</td></tr>`;
      return;
    }

    tbody.innerHTML = myUsers.map(u => {
      const st = perUserStats[u.id] || { tickets: 0, vol: 0 };
      const totDep = Number(u.totDeposit) || 0;
      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-3 text-white font-bold">@${app.escapeHTML(u.username)}</td>
          <td class="p-3 text-slate-400">${app.escapeHTML(u.joinDate || "N/A")}</td>
          <td class="p-3 text-emerald-400 font-bold">৳${totDep.toFixed(2)}</td>
          <td class="p-3 text-cyan-400 font-bold">${st.tickets} Pcs</td>
          <td class="p-3 text-amber-400 font-bold">৳${st.vol.toFixed(2)}</td>
          <td class="p-3 text-right uppercase text-[10px] font-bold ${(u.status || 'active') === 'active' ? 'text-emerald-400' : 'text-rose-400'}">${app.escapeHTML(u.status || "active")}</td>
        </tr>
      `;
    }).join("");
  },

  getAgentNotifications(app) {
    if (!app.currentUser) return [];
    const uLower = (app.currentUser.username || "").toLowerCase();
    const msgs = (app.db.messages || []).filter(m => {
      if (!m) return false;
      if (m.recipientType === "all" || m.recipientType === "agents") return true;
      if (m.targetUsername && m.targetUsername.toLowerCase() === uLower) return true;
      return false;
    });

    return msgs.map(m => ({
      id: m.id,
      title: m.subject || "System Notification",
      body: m.content || "",
      date: m.date || "",
      isRead: Array.isArray(m.readBy) && m.readBy.includes(app.currentUser.username),
      raw: m
    }));
  },

  renderNotificationsTab(app, myNotifications, threads) {
    const listEl = document.getElementById("agent-notifications-list");
    if (!listEl) return;

    const unreadThreads = threads.filter(t => t.unreadCount > 0);
    const itemsHtml = [];

    unreadThreads.forEach(t => {
      itemsHtml.push(`
        <div class="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="text-xs font-black text-cyan-400 flex items-center gap-1.5">
              <i class="fa-solid fa-comments"></i> ${t.unreadCount} Unread Chat Message(s) from @${app.escapeHTML(t.username)}
            </div>
            <p class="text-xs text-slate-300">${app.escapeHTML(t.lastMessage || "New attachment/message")}</p>
          </div>
          <button type="button" class="notif-open-chat-btn bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl cursor-pointer shrink-0" data-user="${app.escapeHTML(t.username)}">
            Reply Now
          </button>
        </div>
      `);
    });

    [...myNotifications].reverse().forEach(n => {
      itemsHtml.push(`
        <div class="bg-slate-950 border ${n.isRead ? 'border-slate-800/80' : 'border-amber-500/40'} rounded-2xl p-4 space-y-1">
          <div class="flex items-center justify-between">
            <strong class="text-xs font-black ${n.isRead ? 'text-slate-200' : 'text-amber-400'}">${app.escapeHTML(n.title)}</strong>
            <span class="text-[9.5px] font-mono text-slate-500">${app.escapeHTML(String(n.date).slice(0, 16).replace("T", " "))}</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${app.escapeHTML(n.body)}</p>
        </div>
      `);
    });

    if (itemsHtml.length === 0) {
      listEl.innerHTML = `<div class="p-8 text-center text-slate-500 font-mono text-xs">No notifications or alerts at this time.</div>`;
      return;
    }

    listEl.innerHTML = itemsHtml.join("");
    listEl.querySelectorAll(".notif-open-chat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeChatUser = btn.getAttribute("data-user");
        this.switchAgentTab(app, "live-chat");
      });
    });
  },

  renderAnalyticsTab(app, myUsers, myLedger) {
    const range = document.getElementById("agent-analytics-range")?.value || "all";
    const filteredLedger = myLedger.filter(l => this.filterByDateRange(l.timestamp, range));
    const filteredUsers = myUsers.filter(u => this.filterByDateRange(u.joinDate, range));

    const cashIn = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("deposit") || (l.description || "").toLowerCase().includes("load"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const cashOut = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("cashout") || (l.description || "").toLowerCase().includes("withdraw"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const ticketVol = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("booked ticket"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const netComm = filteredLedger
      .filter(l => l.status !== "pending")
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const setEl = (id, t) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    setEl("agent-an-cash-in", `৳${cashIn.toFixed(2)}`);
    setEl("agent-an-cash-out", `৳${cashOut.toFixed(2)}`);
    setEl("agent-an-ticket-vol", `৳${ticketVol.toFixed(2)}`);
    setEl("agent-an-net-comm", `৳${netComm.toFixed(2)}`);

    const barsEl = document.getElementById("agent-analytics-bars");
    if (!barsEl) return;

    const maxVal = Math.max(100, cashIn, cashOut, ticketVol, netComm * 5);
    const barRow = (label, val, colorClass, prefix = "৳") => {
      const pct = Math.min(100, Math.round((val / maxVal) * 100));
      return `
        <div class="space-y-1 font-mono text-xs">
          <div class="flex justify-between">
            <span class="text-slate-300">${label}</span>
            <strong class="text-white">${prefix}${typeof val === 'number' && prefix === '৳' ? val.toFixed(2) : val}</strong>
          </div>
          <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div class="h-full ${colorClass} rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    };

    barsEl.innerHTML = `
      ${barRow("Cash Load Volume (Inflow)", cashIn, "bg-emerald-500")}
      ${barRow("Assisted Cashout Volume (Outflow)", cashOut, "bg-rose-500")}
      ${barRow("Direct Ticket Sales Volume", ticketVol, "bg-cyan-500")}
      ${barRow("Net Earned Commissions", netComm, "bg-amber-500")}
      <div class="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
        <span>Registered Users in Period: <strong class="text-white">${filteredUsers.length}</strong></span>
        <span>Total Ledger Operations: <strong class="text-white">${filteredLedger.length}</strong></span>
      </div>
    `;
  },

  populateProfileForm(app) {
    const agent = app.currentUser;
    if (!agent) return;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v || "";
    };
    const agentInDb = Array.isArray(app.db?.users)
      ? app.db.users.find(u => u && (u.id === agent.id || (u.username && u.username.toLowerCase() === (agent.username || "").toLowerCase())))
      : null;
    const rawUsername = agent.username || (agentInDb && agentInDb.username) || agent.name || agent.id || "";
    const cleanUsername = rawUsername ? (rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`) : "";
    const currentDistrict = agent.district || (agentInDb && agentInDb.district) || agent.region || (agentInDb && agentInDb.region) || "Dhaka";
    setVal("agent-prof-username", cleanUsername);
    setVal("agent-prof-displayname", agent.displayName || agent.name || rawUsername);
    setVal("agent-prof-phone", agent.phone || (agentInDb && agentInDb.phone) || "");
    setVal("agent-prof-email", agent.email || (agentInDb && agentInDb.email) || "");
    setVal("agent-prof-district", currentDistrict);
    setVal("agent-prof-availability", agent.availabilityStatus || "online");
  },

  // --------------------------------------------------------------------------
  // 5. AGENT LIVE CHAT INBOX ENGINE (Section C)
  // --------------------------------------------------------------------------
  getAgentChatThreads(app) {
    if (!app.currentUser) return [];
    const agentUsername = (app.currentUser.username || "").toLowerCase();
    const allChats = Array.isArray(app.db.agentChats) ? app.db.agentChats : [];

    // Group messages by counterparty user
    const threadMap = new Map();

    allChats.forEach(c => {
      if (!c) return;
      const senderLower = (c.sender || "").toLowerCase();
      const recipientLower = (c.recipient || "").toLowerCase();

      if (senderLower !== agentUsername && recipientLower !== agentUsername && recipientLower !== "agent") {
        return;
      }

      const otherParty = senderLower === agentUsername ? c.recipient : c.sender;
      if (!otherParty || otherParty.toLowerCase() === agentUsername) return;
      const otherKey = otherParty.toLowerCase();

      if (!threadMap.has(otherKey)) {
        const userObj = (app.db.users || []).find(u => u && u.username && u.username.toLowerCase() === otherKey);
        threadMap.set(otherKey, {
          username: userObj ? userObj.username : otherParty,
          userId: userObj ? userObj.id : `USR-${otherKey.slice(0, 6).toUpperCase()}`,
          phone: userObj ? (userObj.phone || "N/A") : "N/A",
          balance: userObj ? (Number(userObj.balance) || 0) : 0,
          isOnline: userObj ? (userObj.status || "active") === "active" : true,
          lastMessage: "",
          lastTimestamp: "",
          unreadCount: 0,
          threadStatus: "open",
          priority: "normal",
          messages: []
        });
      }

      const thread = threadMap.get(otherKey);
      thread.messages.push(c);
      if (c.threadStatus) thread.threadStatus = c.threadStatus;
      if (c.priority) thread.priority = c.priority;

      if (!c.isInternalNote && c.isInternalNote !== 1) {
        thread.lastMessage = c.message || (c.attachmentName ? `📎 ${c.attachmentName}` : "");
        thread.lastTimestamp = c.timestamp || "";
        if (senderLower === otherKey && c.status !== "read") {
          thread.unreadCount++;
        }
      }
    });

    // If activeChatUser is set (e.g. from "Chat" button on a user row) but has no messages yet, include it
    if (this.activeChatUser) {
      const activeKey = this.activeChatUser.toLowerCase();
      if (!threadMap.has(activeKey)) {
        const userObj = (app.db.users || []).find(u => u && u.username && u.username.toLowerCase() === activeKey);
        threadMap.set(activeKey, {
          username: userObj ? userObj.username : this.activeChatUser,
          userId: userObj ? userObj.id : `USR-${activeKey.slice(0, 6).toUpperCase()}`,
          phone: userObj ? (userObj.phone || "N/A") : "N/A",
          balance: userObj ? (Number(userObj.balance) || 0) : 0,
          isOnline: true,
          lastMessage: "Start a new conversation",
          lastTimestamp: new Date().toISOString(),
          unreadCount: 0,
          threadStatus: "open",
          priority: "normal",
          messages: []
        });
      }
    }

    const list = Array.from(threadMap.values());
    list.sort((a, b) => String(b.lastTimestamp || "").localeCompare(String(a.lastTimestamp || "")));
    return list;
  },

  renderAgentChatInbox(app, threads) {
    const listContainer = document.getElementById("agent-chat-threads-list");
    if (!listContainer) return;

    const searchQ = (document.getElementById("agent-chat-inbox-search")?.value || "").toLowerCase().trim();

    // Auto-select first thread if none selected
    if (!this.activeChatUser && threads.length > 0) {
      this.activeChatUser = threads[0].username;
    }

    const filteredThreads = threads.filter(t => {
      if (this.chatInboxFilter === "open" && t.threadStatus !== "open") return false;
      if (this.chatInboxFilter === "pending" && t.threadStatus !== "pending") return false;
      if (this.chatInboxFilter === "resolved" && t.threadStatus !== "resolved") return false;
      if (this.chatInboxFilter === "unread" && t.unreadCount === 0) return false;

      if (!searchQ) return true;
      return t.username.toLowerCase().includes(searchQ) ||
             t.userId.toLowerCase().includes(searchQ) ||
             t.phone.toLowerCase().includes(searchQ) ||
             (t.lastMessage || "").toLowerCase().includes(searchQ);
    });

    if (filteredThreads.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-inbox text-xl block mb-2 text-slate-700"></i>
          No conversations match the current filter.
        </div>
      `;
    } else {
      listContainer.innerHTML = filteredThreads.map(t => {
        const isSelected = this.activeChatUser && t.username.toLowerCase() === this.activeChatUser.toLowerCase();
        const d = new Date(t.lastTimestamp);
        const timeStr = isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const prioColor = t.priority === "urgent" ? "text-rose-400" : (t.priority === "high" ? "text-amber-400" : "text-slate-500");
        const statusColor = t.threadStatus === "resolved" ? "text-emerald-400" : (t.threadStatus === "pending" ? "text-amber-400" : "text-cyan-400");

        return `
          <div class="agent-chat-thread-item p-3 rounded-2xl border cursor-pointer transition ${isSelected ? 'bg-slate-950 border-cyan-500/60 shadow-md' : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'}" data-username="${app.escapeHTML(t.username)}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center font-black text-xs uppercase shrink-0">
                  ${app.escapeHTML(t.username.slice(0, 2))}
                  <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${t.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <strong class="text-xs font-black text-white font-mono truncate">@${app.escapeHTML(t.username)}</strong>
                    <span class="text-[9px] font-mono text-slate-500">${app.escapeHTML(t.userId.slice(-6))}</span>
                  </div>
                  <p class="text-[11px] text-slate-400 truncate max-w-[170px]">${app.escapeHTML(t.lastMessage || "No messages yet")}</p>
                </div>
              </div>
              <div class="text-right shrink-0 space-y-1">
                <span class="text-[9px] font-mono text-slate-500 block">${app.escapeHTML(timeStr)}</span>
                ${t.unreadCount > 0 ? `<span class="inline-block px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-mono font-black">${t.unreadCount}</span>` : ""}
              </div>
            </div>
            <div class="flex items-center justify-between text-[9px] font-mono mt-2 pt-1.5 border-t border-slate-900">
              <span class="uppercase font-bold ${statusColor}">${app.escapeHTML(t.threadStatus)}</span>
              <span class="uppercase ${prioColor}">Priority: ${app.escapeHTML(t.priority)}</span>
            </div>
          </div>
        `;
      }).join("");

      listContainer.querySelectorAll(".agent-chat-thread-item").forEach(item => {
        item.addEventListener("click", () => {
          const u = item.getAttribute("data-username");
          this.activeChatUser = u;
          this.markThreadAsReadByAgent(app, u);
          this.renderAgentChatInbox(app, this.getAgentChatThreads(app));
        });
      });
    }

    // Render Active Conversation Pane
    this.renderActiveAgentConversation(app, threads);
  },

  markThreadAsReadByAgent(app, targetUsername) {
    if (!targetUsername || !app.currentUser || !Array.isArray(app.db.agentChats)) return;
    const uLower = targetUsername.toLowerCase();
    const agentLower = app.currentUser.username.toLowerCase();
    let changed = false;
    const nowIso = new Date().toISOString();

    app.db.agentChats.forEach(c => {
      if (
        c &&
        (c.sender || "").toLowerCase() === uLower &&
        ((c.recipient || "").toLowerCase() === agentLower || (c.recipient || "").toLowerCase() === "agent") &&
        c.status !== "read"
      ) {
        c.status = "read";
        c.readAt = nowIso;
        changed = true;
      }
    });

    if (changed) {
      app.saveDB(true);
    }
  },

  renderActiveAgentConversation(app, threads) {
    const activeAvatar = document.getElementById("agent-inbox-active-avatar");
    const activeUsername = document.getElementById("agent-inbox-active-username");
    const activeUserId = document.getElementById("agent-inbox-active-userid");
    const activeMeta = document.getElementById("agent-inbox-active-meta");
    const statusSelect = document.getElementById("agent-inbox-status-select");
    const prioSelect = document.getElementById("agent-inbox-priority-select");
    const msgContainer = document.getElementById("agent-inbox-messages-container");

    if (!msgContainer) return;

    if (!this.activeChatUser) {
      if (activeUsername) activeUsername.innerText = "Select a conversation";
      if (activeUserId) activeUserId.innerText = "";
      if (activeMeta) activeMeta.innerText = "Choose a user from the inbox list or click 'New Chat'";
      msgContainer.innerHTML = `
        <div class="text-center py-16 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-comments text-2xl text-slate-700 block mb-2"></i>
          Select a user conversation from the left panel to view messages and reply.
        </div>
      `;
      return;
    }

    // If agent is currently viewing the live-chat tab, mark incoming messages from activeChatUser as read
    if (this.activeSubTab === "live-chat") {
      this.markThreadAsReadByAgent(app, this.activeChatUser);
    }

    const thread = threads.find(t => t.username.toLowerCase() === this.activeChatUser.toLowerCase());
    if (!thread) return;

    if (activeAvatar) activeAvatar.innerText = thread.username.slice(0, 2).toUpperCase();
    if (activeUsername) activeUsername.innerText = `@${thread.username}`;
    if (activeUserId) activeUserId.innerText = `· ID: ${thread.userId}`;
    if (activeMeta) {
      activeMeta.innerText = `${thread.isOnline ? '● Online' : '○ Offline'} · Phone: ${thread.phone} · Wallet: ৳${(Number(thread.balance) || 0).toFixed(2)} · Assigned: @${app.currentUser.username}`;
    }
    if (statusSelect) statusSelect.value = thread.threadStatus || "open";
    if (prioSelect) prioSelect.value = thread.priority || "normal";

    const msgSearchQ = (document.getElementById("agent-chat-msg-search")?.value || "").toLowerCase().trim();
    const msgs = thread.messages.filter(m => {
      if (!msgSearchQ) return true;
      return (m.message || "").toLowerCase().includes(msgSearchQ) ||
             (m.attachmentName || "").toLowerCase().includes(msgSearchQ);
    });

    if (msgs.length === 0) {
      msgContainer.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          No messages in this conversation yet. Send a message or internal note below!
        </div>
      `;
      return;
    }

    const agentUsernameLower = (app.currentUser.username || "").toLowerCase();
    msgContainer.innerHTML = msgs.map(m => {
      const isMe = (m.sender || "").toLowerCase() === agentUsernameLower;
      const isNote = Boolean(m.isInternalNote && m.isInternalNote !== 0 && m.isInternalNote !== "0");
      const d = new Date(m.timestamp);
      const timeStr = isNaN(d.getTime()) ? "" : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const receipt = isMe && !isNote
        ? (m.status === "read" ? `<span class="text-cyan-300 font-bold ml-1" title="Read">✓✓ Read</span>` : `<span class="text-slate-300 ml-1" title="Sent">✓ Sent</span>`)
        : "";

      let attachmentHtml = "";
      if (m.attachmentUrl) {
        if ((m.attachmentType || "").startsWith("image/") || m.attachmentUrl.startsWith("data:image/")) {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${m.attachmentUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${m.attachmentUrl}" alt="${app.escapeHTML(m.attachmentName || 'Attachment')}" class="max-h-48 rounded-xl border border-white/10 object-contain" />
              </a>
            </div>
          `;
        } else {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${m.attachmentUrl}" download="${app.escapeHTML(m.attachmentName || 'file.pdf')}" class="inline-flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 underline">
                <i class="fa-solid fa-file-arrow-down"></i> ${app.escapeHTML(m.attachmentName || "Download Attachment")}
              </a>
            </div>
          `;
        }
      }

      if (isNote) {
        return `
          <div class="flex flex-col items-end space-y-1">
            <div class="text-[9.5px] font-mono text-amber-400 px-1 flex items-center gap-1">
              <i class="fa-solid fa-lock"></i> STAFF INTERNAL NOTE (Hidden from User) · @${app.escapeHTML(m.sender)} · ${app.escapeHTML(timeStr)}
            </div>
            <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans bg-amber-950/60 border border-amber-700/50 text-amber-200">
              ${app.escapeHTML(m.message || "")}
              ${attachmentHtml}
            </div>
          </div>
        `;
      }

      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1">
          <div class="text-[9.5px] font-mono text-slate-500 px-1">
            ${isMe ? `You (@${app.escapeHTML(m.sender)})` : `@${app.escapeHTML(m.sender)}`} · ${app.escapeHTML(timeStr)} ${receipt}
          </div>
          <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-sans shadow-md ${isMe ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'}">
            ${m.message ? `<div class="whitespace-pre-wrap break-words">${app.escapeHTML(m.message)}</div>` : ""}
            ${attachmentHtml}
          </div>
        </div>
      `;
    }).join("");

    msgContainer.scrollTop = msgContainer.scrollHeight;
  },

  // --------------------------------------------------------------------------
  // 6. USER PANEL LIVE CHAT RENDERER & LISTENERS (Section D)
  // --------------------------------------------------------------------------
  renderUserLiveChat(app) {
    const allAgents = this.getAllUnifiedAgents(app);
    if (!app.currentChatAgent && allAgents.length > 0) {
      app.currentChatAgent = allAgents[0].username;
    }

    const activeAgentName = app.currentChatAgent || "agent";
    const activeAgentLower = activeAgentName.toLowerCase();
    const agentObj = allAgents.find(a => a.username.toLowerCase() === activeAgentLower);

    // Update header agent info
    const titleEl = document.getElementById("chat-agent-title");
    if (titleEl) {
      titleEl.innerText = agentObj ? `${agentObj.displayName || ('@' + agentObj.username)} (${agentObj.district || 'Dhaka'})` : `@${activeAgentName}`;
    }

    const statusIndEl = document.getElementById("chat-agent-status-indicator");
    if (statusIndEl) {
      const avail = (agentObj?.availabilityStatus || "online").toLowerCase();
      if (avail === "busy") {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span class="text-amber-400">ব্যস্ত আছেন (Busy - Leave a message)</span>`;
      } else if (avail === "offline") {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span><span class="text-slate-400">অফলাইন (Offline - Messages saved)</span>`;
      } else {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-emerald-400">লাইভ চ্যাট সক্রিয় (Online)</span>`;
      }
    }

    // Populate Agent Switcher Dropdown
    const switcher = document.getElementById("user-chat-agent-switcher");
    const myUsername = (app.currentUser?.username || "guest").toLowerCase();
    const allChats = Array.isArray(app.db?.agentChats) ? app.db.agentChats : [];

    if (switcher) {
      switcher.innerHTML = allAgents.map(a => {
        const aLower = a.username.toLowerCase();
        const unread = allChats.filter(
          c => c && !c.isInternalNote && c.isInternalNote !== 1 && (c.sender || "").toLowerCase() === aLower && (c.recipient || "").toLowerCase() === myUsername && c.status !== "read"
        ).length;
        return `<option value="${app.escapeHTML(a.username)}" ${aLower === activeAgentLower ? 'selected' : ''}>@${app.escapeHTML(a.username)} (${app.escapeHTML(a.district || 'Dhaka')})${unread > 0 ? ` [${unread} new]` : ''}</option>`;
      }).join("");
    }

    // Mark messages sent by activeAgent to currentUser as read
    let markedRead = false;
    const nowIso = new Date().toISOString();
    allChats.forEach(c => {
      if (
        c &&
        !c.isInternalNote &&
        c.isInternalNote !== 1 &&
        (c.sender || "").toLowerCase() === activeAgentLower &&
        (c.recipient || "").toLowerCase() === myUsername &&
        c.status !== "read"
      ) {
        c.status = "read";
        c.readAt = nowIso;
        markedRead = true;
      }
    });
    if (markedRead) {
      app.saveDB(true);
    }

    // Filter conversation messages (strictly hide internal staff notes!)
    const searchQ = (document.getElementById("user-chat-search-input")?.value || "").toLowerCase().trim();
    const convChats = allChats.filter(c => {
      if (!c || c.isInternalNote || c.isInternalNote === 1 || c.isInternalNote === "1") return false;
      const s = (c.sender || "").toLowerCase();
      const r = (c.recipient || "").toLowerCase();
      const belongs = (s === myUsername && r === activeAgentLower) || (s === activeAgentLower && r === myUsername);
      if (!belongs) return false;
      if (!searchQ) return true;
      return (c.message || "").toLowerCase().includes(searchQ) || (c.attachmentName || "").toLowerCase().includes(searchQ);
    });

    const threadStatusEl = document.getElementById("user-chat-thread-status");
    if (threadStatusEl) {
      const latestStatus = convChats.length > 0 ? (convChats[convChats.length - 1].threadStatus || "open") : "open";
      threadStatusEl.innerText = latestStatus.toUpperCase();
    }

    const container = document.getElementById("agent-chat-messages-container");
    if (!container) return;

    if (convChats.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 space-y-3">
          <div class="w-14 h-14 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 text-xl">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-xs font-bold text-white font-mono">কথোপকথন শুরু করুন</h3>
          <p class="text-[11px] text-slate-400 max-w-xs mx-auto font-sans">
            @${app.escapeHTML(activeAgentName)} এর সাথে আপনার ক্যাশ-ইন, ক্যাশ-আউট বা টিকেট বুকিং নিয়ে সরাসরি কথা বলুন।
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = convChats.map(c => {
      const isMe = (c.sender || "").toLowerCase() === myUsername;
      const d = new Date(c.timestamp);
      const timeStr = isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const receipt = isMe
        ? (c.status === "read" ? `<span class="text-cyan-300 font-bold ml-1">✓✓ Read</span>` : `<span class="text-slate-400 ml-1">✓ Sent</span>`)
        : "";

      let attachmentHtml = "";
      if (c.attachmentUrl) {
        if ((c.attachmentType || "").startsWith("image/") || c.attachmentUrl.startsWith("data:image/")) {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${c.attachmentUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${c.attachmentUrl}" alt="${app.escapeHTML(c.attachmentName || 'Image')}" class="max-h-48 rounded-xl border border-white/10 object-contain" />
              </a>
            </div>
          `;
        } else {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${c.attachmentUrl}" download="${app.escapeHTML(c.attachmentName || 'attachment.pdf')}" class="inline-flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 underline">
                <i class="fa-solid fa-file-arrow-down"></i> ${app.escapeHTML(c.attachmentName || "Download File")}
              </a>
            </div>
          `;
        }
      }

      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1">
          <div class="text-[9.5px] font-mono text-slate-500 px-1">
            ${isMe ? 'আপনি (You)' : '@' + app.escapeHTML(c.sender)} • ${app.escapeHTML(timeStr)} ${receipt}
          </div>
          <div class="max-w-[80%] rounded-2xl px-4 py-3 text-xs font-sans shadow-lg ${isMe ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}">
            ${c.message ? `<div class="whitespace-pre-wrap break-words">${app.escapeHTML(c.message)}</div>` : ""}
            ${attachmentHtml}
          </div>
        </div>
      `;
    }).join("");

    container.scrollTop = container.scrollHeight;
  },

  setupUserLiveChatListeners(app) {
    this.startPollingIfNeeded(app);

    const switcher = document.getElementById("user-chat-agent-switcher");
    if (switcher && !switcher.dataset.bound) {
      switcher.dataset.bound = "true";
      switcher.addEventListener("change", () => {
        app.currentChatAgent = switcher.value;
        this.renderUserLiveChat(app);
      });
    }

    const searchInput = document.getElementById("user-chat-search-input");
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener("input", () => {
        this.renderUserLiveChat(app);
      });
    }

    const refreshBtn = document.getElementById("user-chat-refresh-btn");
    if (refreshBtn && !refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", async () => {
        await this.pollLatestChats(app);
        this.renderUserLiveChat(app);
        app.showToast("Conversation refreshed!", "info");
      });
    }

    document.querySelectorAll(".user-chat-quick-chip").forEach(chip => {
      if (chip.dataset.bound) return;
      chip.dataset.bound = "true";
      chip.addEventListener("click", () => {
        const msg = chip.getAttribute("data-msg") || "";
        const input = document.getElementById("agent-chat-input");
        if (input) {
          input.value = msg;
          input.focus();
        }
      });
    });

    const attachBtn = document.getElementById("user-chat-attach-btn");
    const fileInput = document.getElementById("user-chat-file-input");
    const previewBox = document.getElementById("user-chat-attachment-preview");
    const previewName = document.getElementById("user-chat-attachment-name");
    const removeAttachBtn = document.getElementById("user-chat-attachment-remove");

    if (attachBtn && fileInput && !attachBtn.dataset.bound) {
      attachBtn.dataset.bound = "true";
      attachBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const validated = await this.validateAndReadAttachment(file, app);
        if (validated) {
          this.userPendingAttachment = validated;
          if (previewName) previewName.innerText = `${validated.name} (${Math.round(validated.size / 1024)} KB)`;
          if (previewBox) previewBox.classList.remove("hidden");
        }
        fileInput.value = "";
      });
    }

    if (removeAttachBtn && !removeAttachBtn.dataset.bound) {
      removeAttachBtn.dataset.bound = "true";
      removeAttachBtn.addEventListener("click", () => {
        this.userPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");
      });
    }

    const input = document.getElementById("agent-chat-input");
    const form = document.getElementById("agent-chat-form");

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
        const att = this.userPendingAttachment;
        if (!text && !att) return;

        const sender = app.currentUser ? app.currentUser.username : "guest";
        const recipient = app.currentChatAgent || "agent";
        const sig = `${sender}->${recipient}:${text}:${att ? att.name : ""}`;
        if (sig === this.lastSentSignature && Date.now() - this.lastSentTimestamp < 1500) {
          return; // Prevent duplicate message submission
        }
        this.lastSentSignature = sig;
        this.lastSentTimestamp = Date.now();

        if (input) input.value = "";
        this.userPendingAttachment = null;
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
        this.renderUserLiveChat(app);
      });
    }
  },

  // --------------------------------------------------------------------------
  // 7. SETUP ALL AGENT WORKSPACE LISTENERS
  // --------------------------------------------------------------------------
  setupAllListeners(app) {
    // 1. Sidebar Collapse & Mobile Drawer Toggles
    const collapseBtn = document.getElementById("agent-sidebar-collapse-btn");
    if (collapseBtn && !collapseBtn.dataset.bound) {
      collapseBtn.dataset.bound = "true";
      collapseBtn.addEventListener("click", () => {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        localStorage.setItem("agent_sidebar_collapsed", String(this.sidebarCollapsed));
        this.applySidebarState();
      });
    }

    const mobileMenuBtn = document.getElementById("agent-mobile-menu-btn");
    if (mobileMenuBtn && !mobileMenuBtn.dataset.bound) {
      mobileMenuBtn.dataset.bound = "true";
      mobileMenuBtn.addEventListener("click", () => this.openMobileDrawer());
    }

    const mobileCloseBtn = document.getElementById("agent-sidebar-close-btn");
    if (mobileCloseBtn && !mobileCloseBtn.dataset.bound) {
      mobileCloseBtn.dataset.bound = "true";
      mobileCloseBtn.addEventListener("click", () => this.closeMobileDrawer());
    }

    const backdrop = document.getElementById("agent-sidebar-backdrop");
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = "true";
      backdrop.addEventListener("click", () => this.closeMobileDrawer());
    }

    // Global event delegation for Agent suite interactions (guarantees clicks never fail on re-render)
    if (!window._agentSuiteDelegated) {
      window._agentSuiteDelegated = true;
      document.addEventListener("click", (e) => {
        const agentTabBtn = e.target.closest(".agent-tab-selector-btn");
        if (agentTabBtn) {
          e.preventDefault();
          e.stopPropagation();
          const val = agentTabBtn.getAttribute("val") || agentTabBtn.getAttribute("data-tab");
          if (val) {
            AgentSuiteUpgrade.switchAgentTab(app, val);
          }
          return;
        }

        const mobileMenu = e.target.closest("#agent-mobile-menu-btn");
        if (mobileMenu) {
          e.preventDefault();
          e.stopPropagation();
          AgentSuiteUpgrade.openMobileDrawer();
          return;
        }

        const closeBtn = e.target.closest("#agent-sidebar-close-btn") || e.target.closest("#agent-sidebar-backdrop");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          AgentSuiteUpgrade.closeMobileDrawer();
          return;
        }

        const collapseBtn = e.target.closest("#agent-sidebar-collapse-btn");
        if (collapseBtn) {
          e.preventDefault();
          e.stopPropagation();
          AgentSuiteUpgrade.sidebarCollapsed = !AgentSuiteUpgrade.sidebarCollapsed;
          localStorage.setItem("agent_sidebar_collapsed", String(AgentSuiteUpgrade.sidebarCollapsed));
          AgentSuiteUpgrade.applySidebarState();
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
    this.applySidebarState();
    if (this.activeSubTab && this.activeSubTab !== "overview") {
      this.switchAgentTab(app, this.activeSubTab);
    }

    // 3. Dashboard & Analytics Filter Listeners
    const bindChangeOrInput = (id, evt) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.suiteBound) {
        el.dataset.suiteBound = "true";
        el.addEventListener(evt, () => this.renderAllPanels(app));
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
        const inp = document.getElementById("agent-referral-link-input");
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
        const myLedger = (app.db.agentLedger || []).filter(l => l && l.agentId === app.currentUser?.id);
        const rows = [["ID", "Timestamp", "TargetUser", "Description", "Amount", "Commission", "Status"]];
        myLedger.forEach(l => {
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
        (app.db.messages || []).forEach(m => {
          if (!m) return;
          if (!Array.isArray(m.readBy)) m.readBy = [];
          if (!m.readBy.includes(uName)) m.readBy.push(uName);
        });
        await app.saveDB(true);
        this.renderAllPanels(app);
        app.showToast("All notifications marked as read.", "success");
      });
    }

    // 7. Wallet Commission Transfer & Refill Request Forms
    const transferCommForm = document.getElementById("agent-wallet-transfer-comm-form");
    if (transferCommForm && !transferCommForm.dataset.bound) {
      transferCommForm.dataset.bound = "true";
      transferCommForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amtInput = document.getElementById("agent-wallet-transfer-amount");
        const amt = parseFloat(amtInput?.value || "0");
        const availComm = Number(app.currentUser?.earnedCommission) || 0;
        if (amt < 10) {
          app.showToast("Minimum transfer amount is ৳10!", "error");
          return;
        }
        if (amt > availComm) {
          app.showToast(`Insufficient commission balance (Available: ৳${availComm.toFixed(2)})!`, "error");
          return;
        }
        app.currentUser.earnedCommission = availComm - amt;
        app.currentUser.balance = (Number(app.currentUser.balance) || 0) + amt;
        this.syncAgentRecordEverywhere(app, app.currentUser);

        if (!Array.isArray(app.db.transactions)) app.db.transactions = [];
        app.db.transactions.push({
          id: "tx_comm_" + Date.now(),
          userId: app.currentUser.id,
          userName: app.currentUser.username,
          username: app.currentUser.username,
          paymentMethod: "Agent Commission Transfer",
          phone: app.currentUser.phone || "",
          amount: amt,
          transactionType: "Deposit",
          status: "complete",
          bonusAmount: 0,
          notes: "Transferred earned commission to operational wallet",
          date: new Date().toISOString()
        });

        await app.saveDB(true);
        transferCommForm.reset();
        this.renderAllPanels(app);
        app.showToast(`Transferred ৳${amt.toFixed(2)} to your operational wallet balance!`, "success");
      });
    }

    const refillForm = document.getElementById("agent-wallet-refill-form");
    if (refillForm && !refillForm.dataset.bound) {
      refillForm.dataset.bound = "true";
      refillForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const amt = parseFloat(document.getElementById("agent-refill-amount")?.value || "0");
        const method = document.getElementById("agent-refill-method")?.value || "bKash Agent";
        const trxid = (document.getElementById("agent-refill-trxid")?.value || "").trim();
        if (amt < 100 || !trxid) {
          app.showToast("Please enter valid amount (min ৳100) and TrxID!", "error");
          return;
        }
        if (!Array.isArray(app.db.deposits)) app.db.deposits = [];
        app.db.deposits.push({
          id: "dep_agn_" + Date.now(),
          userId: app.currentUser.id,
          username: app.currentUser.username,
          gateway: method,
          amount: amt,
          txid: trxid,
          status: "pending",
          date: new Date().toISOString()
        });
        await app.saveDB(true);
        refillForm.reset();
        this.renderAllPanels(app);
        app.showToast(`Refill request of ৳${amt.toFixed(2)} (TrxID: ${trxid}) submitted to Admin!`, "success");
      });
    }

    // 8. Agent Profile Update Form
    const profileForm = document.getElementById("agent-profile-update-form");
    if (profileForm && !profileForm.dataset.bound) {
      profileForm.dataset.bound = "true";
      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!app.currentUser) return;
        app.currentUser.displayName = (document.getElementById("agent-prof-displayname")?.value || "").trim();
        app.currentUser.name = app.currentUser.displayName || app.currentUser.username;
        app.currentUser.phone = (document.getElementById("agent-prof-phone")?.value || "").trim();
        app.currentUser.email = (document.getElementById("agent-prof-email")?.value || "").trim();
        // Assigned district is set by Admin and read-only for agent - preserve admin selection
        app.currentUser.availabilityStatus = document.getElementById("agent-prof-availability")?.value || "online";

        this.syncAgentRecordEverywhere(app, app.currentUser);
        await app.saveDB(true);
        this.renderAllPanels(app);
        app.showToast("Agent profile & station status updated successfully!", "success");
      });
    }

    // 9. Agent Security Password Change Form
    const secForm = document.getElementById("agent-security-password-form");
    if (secForm && !secForm.dataset.bound) {
      secForm.dataset.bound = "true";
      secForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!app.currentUser) return;
        const curPass = (document.getElementById("agent-sec-current-pass")?.value || "").trim();
        const newPass = (document.getElementById("agent-sec-new-pass")?.value || "").trim();
        const confPass = (document.getElementById("agent-sec-confirm-pass")?.value || "").trim();

        if (app.currentUser.password && curPass !== app.currentUser.password) {
          app.showToast("Current password does not match!", "error");
          return;
        }
        if (newPass.length < 4) {
          app.showToast("New password must be at least 4 characters!", "error");
          return;
        }
        if (newPass !== confPass) {
          app.showToast("New password and confirmation do not match!", "error");
          return;
        }

        app.currentUser.password = newPass;
        this.syncAgentRecordEverywhere(app, app.currentUser);
        await app.saveDB(true);
        secForm.reset();
        app.showToast("Agent password updated securely across all tables!", "success");
      });
    }

    // 10. Agent Support Ticket Form
    const supportForm = document.getElementById("agent-support-ticket-form");
    if (supportForm && !supportForm.dataset.bound) {
      supportForm.dataset.bound = "true";
      supportForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const cat = document.getElementById("agent-sup-category")?.value || "Agent Support";
        const msg = (document.getElementById("agent-sup-message")?.value || "").trim();
        if (!msg) return;
        if (!Array.isArray(app.db.reports)) app.db.reports = [];
        app.db.reports.push({
          id: "rep_agn_" + Date.now(),
          username: app.currentUser?.username || "agent",
          category: `[AGENT DESK] ${cat}`,
          message: msg,
          status: "open",
          date: new Date().toISOString()
        });
        await app.saveDB(true);
        supportForm.reset();
        app.showToast("Support ticket submitted to System Admin!", "success");
      });
    }

    // 11. Agent Live Chat Inbox Controls & Composer Listeners
    this.setupAgentChatInboxListeners(app);
  },

  setupAgentChatInboxListeners(app) {
    // Filter buttons (All, Open, Pending, Resolved, Unread)
    document.querySelectorAll(".agent-chat-filter-btn").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        this.chatInboxFilter = btn.getAttribute("data-filter") || "all";
        document.querySelectorAll(".agent-chat-filter-btn").forEach(b => {
          b.className = "agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition";
        });
        btn.className = "agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition";
        this.renderAgentChatInbox(app, this.getAgentChatThreads(app));
      });
    });

    // Search inputs
    const inboxSearch = document.getElementById("agent-chat-inbox-search");
    if (inboxSearch && !inboxSearch.dataset.bound) {
      inboxSearch.dataset.bound = "true";
      inboxSearch.addEventListener("input", () => {
        this.renderAgentChatInbox(app, this.getAgentChatThreads(app));
      });
    }

    const msgSearch = document.getElementById("agent-chat-msg-search");
    if (msgSearch && !msgSearch.dataset.bound) {
      msgSearch.dataset.bound = "true";
      msgSearch.addEventListener("input", () => {
        this.renderActiveAgentConversation(app, this.getAgentChatThreads(app));
      });
    }

    // Start New Chat with User button
    const newConvBtn = document.getElementById("agent-chat-new-conv-btn");
    if (newConvBtn && !newConvBtn.dataset.bound) {
      newConvBtn.dataset.bound = "true";
      newConvBtn.addEventListener("click", () => {
        const searchBox = document.getElementById("agent-chat-inbox-search");
        const candidate = (searchBox?.value || "").trim().replace(/^@/, "");
        if (candidate) {
          this.activeChatUser = candidate;
          if (searchBox) searchBox.value = "";
          this.renderAgentChatInbox(app, this.getAgentChatThreads(app));
          document.getElementById("agent-inbox-reply-input")?.focus();
        } else {
          app.showToast("Type a username in the search box above and click '+ New Chat', or click 'Chat' on any row in My Users!", "info");
          if (searchBox) searchBox.focus();
        }
      });
    }

    // Thread Status & Priority updates
    const statusSelect = document.getElementById("agent-inbox-status-select");
    if (statusSelect && !statusSelect.dataset.bound) {
      statusSelect.dataset.bound = "true";
      statusSelect.addEventListener("change", async () => {
        if (!this.activeChatUser) return;
        const newStatus = statusSelect.value;
        this.updateThreadMetadata(app, this.activeChatUser, { threadStatus: newStatus });
        await app.saveDB(true);
        this.renderAllPanels(app);
        app.showToast(`Conversation marked as ${newStatus.toUpperCase()}.`, "success");
      });
    }

    const prioSelect = document.getElementById("agent-inbox-priority-select");
    if (prioSelect && !prioSelect.dataset.bound) {
      prioSelect.dataset.bound = "true";
      prioSelect.addEventListener("change", async () => {
        if (!this.activeChatUser) return;
        const newPrio = prioSelect.value;
        this.updateThreadMetadata(app, this.activeChatUser, { priority: newPrio });
        await app.saveDB(true);
        this.renderAllPanels(app);
        app.showToast(`Conversation priority set to ${newPrio.toUpperCase()}.`, "info");
      });
    }

    const refreshBtn = document.getElementById("agent-inbox-refresh-btn");
    if (refreshBtn && !refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", async () => {
        await this.pollLatestChats(app);
        this.renderAllPanels(app);
        app.showToast("Live chat inbox synchronized!", "info");
      });
    }

    // Quick Assist Buttons inside Chat Header
    const quickLoadBtn = document.getElementById("agent-inbox-quick-load-btn");
    if (quickLoadBtn && !quickLoadBtn.dataset.bound) {
      quickLoadBtn.dataset.bound = "true";
      quickLoadBtn.addEventListener("click", () => {
        if (!this.activeChatUser) return;
        const el = document.getElementById("agent-cash-dep-username");
        if (el) el.value = this.activeChatUser;
        this.switchAgentTab(app, "cash");
      });
    }

    const quickWdrBtn = document.getElementById("agent-inbox-quick-wdr-btn");
    if (quickWdrBtn && !quickWdrBtn.dataset.bound) {
      quickWdrBtn.dataset.bound = "true";
      quickWdrBtn.addEventListener("click", () => {
        if (!this.activeChatUser) return;
        const el = document.getElementById("agent-cash-wdr-username");
        if (el) el.value = this.activeChatUser;
        this.switchAgentTab(app, "cash");
      });
    }

    const quickBookBtn = document.getElementById("agent-inbox-quick-book-btn");
    if (quickBookBtn && !quickBookBtn.dataset.bound) {
      quickBookBtn.dataset.bound = "true";
      quickBookBtn.addEventListener("click", () => {
        if (!this.activeChatUser) return;
        const el = document.getElementById("agent-booking-user");
        if (el) el.value = this.activeChatUser;
        this.switchAgentTab(app, "booker");
      });
    }

    // Quick Reply Template Buttons
    document.querySelectorAll(".agent-quick-reply-btn").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        const reply = btn.getAttribute("data-reply") || "";
        const input = document.getElementById("agent-inbox-reply-input");
        if (input) {
          input.value = reply;
          input.focus();
        }
      });
    });

    // Mode Toggle: Public Reply vs Staff-Only Internal Note
    const modeReplyBtn = document.getElementById("agent-chat-mode-reply");
    const modeNoteBtn = document.getElementById("agent-chat-mode-note");
    const replyInput = document.getElementById("agent-inbox-reply-input");

    if (modeReplyBtn && modeNoteBtn && !modeReplyBtn.dataset.bound) {
      modeReplyBtn.dataset.bound = "true";
      modeReplyBtn.addEventListener("click", () => {
        this.chatComposerMode = "reply";
        modeReplyBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition";
        modeNoteBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-amber-400 border border-amber-800/40 hover:bg-amber-950/40 cursor-pointer transition";
        if (replyInput) replyInput.placeholder = "Write a public reply to user... (Enter to send, Shift+Enter for new line)";
      });

      modeNoteBtn.addEventListener("click", () => {
        this.chatComposerMode = "note";
        modeNoteBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-600 text-slate-950 cursor-pointer transition";
        modeReplyBtn.className = "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800 hover:text-white cursor-pointer transition";
        if (replyInput) replyInput.placeholder = "Write a private internal staff note (HIDDEN from user)...";
      });
    }

    // Attachment Upload in Agent Inbox
    const attachBtn = document.getElementById("agent-chat-attach-btn");
    const attachInput = document.getElementById("agent-chat-attach-input");
    const previewBox = document.getElementById("agent-inbox-attachment-preview");
    const previewName = document.getElementById("agent-inbox-attachment-name");
    const previewRemove = document.getElementById("agent-inbox-attachment-remove");

    if (attachBtn && attachInput && !attachBtn.dataset.bound) {
      attachBtn.dataset.bound = "true";
      attachBtn.addEventListener("click", () => attachInput.click());
      attachInput.addEventListener("change", async () => {
        const file = attachInput.files && attachInput.files[0];
        if (!file) return;
        const validated = await this.validateAndReadAttachment(file, app);
        if (validated) {
          this.agentPendingAttachment = validated;
          if (previewName) previewName.innerText = `${validated.name} (${Math.round(validated.size / 1024)} KB)`;
          if (previewBox) previewBox.classList.remove("hidden");
        }
        attachInput.value = "";
      });
    }

    if (previewRemove && !previewRemove.dataset.bound) {
      previewRemove.dataset.bound = "true";
      previewRemove.addEventListener("click", () => {
        this.agentPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");
      });
    }

    // Enter-to-send & Typing indicator
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
          if (replyForm) replyForm.requestSubmit();
        }
      });
    }

    if (replyForm && !replyForm.dataset.bound) {
      replyForm.dataset.bound = "true";
      replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!this.activeChatUser || !app.currentUser) {
          app.showToast("Please select a user conversation first!", "error");
          return;
        }
        const text = (replyInput ? replyInput.value : "").trim();
        const att = this.agentPendingAttachment;
        if (!text && !att) return;

        const sender = app.currentUser.username;
        const recipient = this.activeChatUser;
        const sig = `${sender}->${recipient}:${text}:${att ? att.name : ""}:${this.chatComposerMode}`;
        if (sig === this.lastSentSignature && Date.now() - this.lastSentTimestamp < 1500) {
          return;
        }
        this.lastSentSignature = sig;
        this.lastSentTimestamp = Date.now();

        if (replyInput) replyInput.value = "";
        if (typingEl) typingEl.innerText = "Sent ✓";
        this.agentPendingAttachment = null;
        if (previewBox) previewBox.classList.add("hidden");

        const currentStatus = document.getElementById("agent-inbox-status-select")?.value || "open";
        const currentPriority = document.getElementById("agent-inbox-priority-select")?.value || "normal";

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
          isInternalNote: this.chatComposerMode === "note" ? 1 : 0
        });

        await app.saveDB(true);
        this.renderAllPanels(app);
      });
    }

    // Populate profile form with agent credentials and district
    this.populateProfileForm(app);
  },

  updateThreadMetadata(app, targetUsername, updates) {
    if (!targetUsername || !app.currentUser || !Array.isArray(app.db.agentChats)) return;
    const uLower = targetUsername.toLowerCase();
    const agentLower = app.currentUser.username.toLowerCase();
    app.db.agentChats.forEach(c => {
      if (!c) return;
      const s = (c.sender || "").toLowerCase();
      const r = (c.recipient || "").toLowerCase();
      if ((s === uLower && (r === agentLower || r === "agent")) || (s === agentLower && r === uLower)) {
        Object.assign(c, updates);
      }
    });
  },

  // --------------------------------------------------------------------------
  // 8. REAL-TIME POLLING FALLBACK
  // --------------------------------------------------------------------------
  startPollingIfNeeded(app) {
    if (this.chatPollTimer) return;
    this.chatPollTimer = setInterval(async () => {
      const agentScreen = document.getElementById("screen-agent");
      const userChatScreen = document.getElementById("screen-agent-chat");
      const isAgentOpen = agentScreen && !agentScreen.classList.contains("hidden");
      const isUserChatOpen = userChatScreen && !userChatScreen.classList.contains("hidden");
      if (!isAgentOpen && !isUserChatOpen) return;

      const prevCount = Array.isArray(app.db?.agentChats) ? app.db.agentChats.length : 0;
      await this.pollLatestChats(app);
      const nextCount = Array.isArray(app.db?.agentChats) ? app.db.agentChats.length : 0;

      if (nextCount !== prevCount) {
        if (isAgentOpen) this.renderAllPanels(app);
        if (isUserChatOpen) this.renderUserLiveChat(app);
      }
    }, 4000);
  },

  async pollLatestChats(app) {
    try {
      const res = await fetch("/api/sql/db", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.db) {
        const incomingChats = Array.isArray(data.db.agentChats)
          ? data.db.agentChats
          : (Array.isArray(data.db.settings?._agentChats) ? data.db.settings._agentChats : []);
        if (incomingChats.length > 0) {
          const map = new Map();
          (app.db.agentChats || []).forEach(c => { if (c && c.id) map.set(c.id, c); });
          incomingChats.forEach(c => { if (c && c.id) map.set(c.id, { ...(map.get(c.id) || {}), ...c }); });
          app.db.agentChats = Array.from(map.values());
        }
      }
    } catch {}
  }
};
