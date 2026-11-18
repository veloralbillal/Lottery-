export const AgentPanels = {
  renderAllPanels(system: any, app: any) {
    if (!app.currentUser || (app.currentUser.role !== "agent" && app.currentUser.role !== "subagent")) return;

    system.startPollingIfNeeded(app);

    const agent = app.currentUser;
    const agentUsernameLower = (agent.username || "").toLowerCase();
    const balanceNum = Number(agent.balance) || 0;
    const earnedCommNum = Number(agent.earnedCommission) || 0;

    system.syncAgentRecordEverywhere(app, agent);

    // 1. Update Sidebar & Header Identity
    const fullNameEl = document.getElementById("agent-sidebar-fullname");
    if (fullNameEl) fullNameEl.innerText = agent.displayName || agent.name || `@${agent.username}`;

    const sidebarAvatarEl = document.getElementById("agent-sidebar-avatar");
    if (sidebarAvatarEl) {
      const photoUrl = agent.photo || agent.avatar || "";
      const initial = (agent.displayName || agent.username || "A").charAt(0).toUpperCase();
      if (photoUrl) {
        sidebarAvatarEl.innerHTML = `<img src="${app.escapeHTML(photoUrl)}" alt="${app.escapeHTML(agent.username || "Agent")}" class="w-full h-full object-cover" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="hidden w-full h-full items-center justify-center">${app.escapeHTML(initial)}</span>`;
      } else {
        sidebarAvatarEl.textContent = initial;
      }
    }

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
    const myUsers = system.getMyReferredUsers(app);
    const activeMyUsers = myUsers.filter((u: any) => (u.status || "active") === "active");
    const todayIso = new Date().toISOString().split("T")[0];
    const todayRegs = myUsers.filter((u: any) => (u.joinDate || "").startsWith(todayIso));

    const myLedger = (app.db.agentLedger || []).filter(
      (l: any) => l && (l.agentId === agent.id || (l.agentUsername && l.agentUsername.toLowerCase() === agentUsernameLower))
    );

    const pendingCommissionSum = myLedger
      .filter((l: any) => l.status === "pending")
      .reduce((sum: number, l: any) => sum + (Number(l.commission) || 0), 0);

    const threads = system.getAgentChatThreads(app);
    const openThreadsCount = threads.filter((t: any) => t.threadStatus !== "resolved").length;
    const unreadChatsCount = threads.reduce((sum: number, t: any) => sum + t.unreadCount, 0);

    const myUsernamesSet = new Set(myUsers.map((u: any) => u.username.toLowerCase()));
    const allDeposits = (app.db.deposits || []).filter(
      (d: any) => d && (myUsernamesSet.has((d.username || "").toLowerCase()) || (d.gateway || "").toLowerCase().includes("agent"))
    );
    const allWithdrawals = (app.db.withdrawals || []).filter(
      (w: any) => w && (myUsernamesSet.has((w.username || "").toLowerCase()) || (w.gateway || "").toLowerCase().includes("agent"))
    );
    const pendingPayReqsCount =
      allDeposits.filter((d: any) => d.status === "pending").length +
      allWithdrawals.filter((w: any) => w.status === "pending").length;

    const myNotifications = system.getAgentNotifications(app);
    const unreadNotifCount = myNotifications.filter((n: any) => !n.isRead).length + unreadChatsCount;

    system.updateBadge("agent-nav-badge-chat", unreadChatsCount);
    system.updateBadge("agent-header-badge-chat", unreadChatsCount);
    system.updateBadge("agent-nav-badge-payments", pendingPayReqsCount);
    system.updateBadge("agent-nav-badge-notifications", unreadNotifCount);
    system.updateBadge("agent-header-badge-notif", unreadNotifCount);

    const usersBadgeEl = document.getElementById("agent-nav-badge-users");
    if (usersBadgeEl) usersBadgeEl.innerText = String(myUsers.length);

    const setText = (id: string, val: any) => {
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

    this.renderDashboardTrendsAndFeed(system, app, myUsers, myLedger);
    this.renderMyUsersTable(system, app, myUsers);
    this.renderRegistrationHistory(system, app, myUsers, myLedger);
    this.renderCommissionsTab(system, app, myLedger, earnedCommNum, pendingCommissionSum);
    this.renderTransactionsTab(system, app, myLedger, allDeposits, allWithdrawals);
    this.renderPaymentRequestsTab(system, app, allDeposits, allWithdrawals);
    this.renderAgentWalletTab(system, app, balanceNum, earnedCommNum, myLedger);
    this.renderReferralsTab(system, app, myUsers);
    this.renderNotificationsTab(system, app, myNotifications, threads);
    this.renderAnalyticsTab(system, app, myUsers, myLedger);
    system.populateProfileForm(app);
    system.renderAgentChatInbox(app, threads);
  },

  renderDashboardTrendsAndFeed(system: any, app: any, myUsers: any[], myLedger: any[]) {
    const rangeSelect = document.getElementById("agent-dash-range-select") as HTMLSelectElement | null;
    const range = rangeSelect ? rangeSelect.value : "all";

    const filteredUsers = myUsers.filter(u => system.filterByDateRange(u.joinDate, range));
    const filteredLedger = myLedger.filter(l => system.filterByDateRange(l.timestamp, range));

    const cashLoadVol = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("deposit") || (l.description || "").toLowerCase().includes("load"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const ticketVol = filteredLedger
      .filter(l => (l.description || "").toLowerCase().includes("booked ticket"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const commEarned = filteredLedger
      .filter(l => l.status !== "pending")
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const setEl = (id: string, text: string) => {
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
      const commVal = Number(act.commission) || 0;
      const commText = commVal > 0 ? `${isPending ? '(Pending) ' : ''}+৳${commVal.toFixed(2)}` : '-';

      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="p-2.5 text-slate-400">${app.escapeHTML(timeStr)}</td>
          <td class="p-2.5 text-white font-bold">@${app.escapeHTML(act.targetUser || "user")}</td>
          <td class="p-2.5 text-slate-300 font-sans">${app.escapeHTML(act.description || "Activity")}</td>
          <td class="p-2.5 text-slate-200">৳${(Number(act.amount) || 0).toFixed(2)}</td>
          <td class="p-2.5 text-right ${isPending ? 'text-amber-400' : 'text-emerald-400'} font-bold">
            ${commText}
          </td>
        </tr>
      `;
    }).join("");
  },

  renderMyUsersTable(system: any, app: any, myUsers: any[]) {
    const playersTbody = document.getElementById("agent-players-tbody");
    if (!playersTbody) return;

    const scopeSelect = document.getElementById("agent-players-scope-filter") as HTMLSelectElement | null;
    const scope = scopeSelect ? scopeSelect.value : "all";
    const searchVal = ((document.getElementById("agent-players-search-input") as HTMLInputElement | null)?.value || "").toLowerCase().trim();

    const myUsernamesSet = new Set(myUsers.map(u => u.username.toLowerCase()));
    const sourcePlayers = scope === "my"
      ? myUsers
      : (app.db.users || []).filter((u: any) => u && u.role === "user");

    const filtered = sourcePlayers.filter((p: any) => {
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

    playersTbody.innerHTML = filtered.map((p: any) => {
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
        system.activeChatUser = u;
        system.switchAgentTab(app, "live-chat");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-load").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const depUserEl = document.getElementById("agent-cash-dep-username") as HTMLInputElement | null;
        if (depUserEl) depUserEl.value = u || "";
        system.switchAgentTab(app, "cash");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-wdr").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const wdrUserEl = document.getElementById("agent-cash-wdr-username") as HTMLInputElement | null;
        if (wdrUserEl) wdrUserEl.value = u || "";
        system.switchAgentTab(app, "cash");
      });
    });

    playersTbody.querySelectorAll(".agent-fill-user-book").forEach(btn => {
      btn.addEventListener("click", () => {
        const u = btn.getAttribute("data-username");
        const bookUserEl = document.getElementById("agent-booking-user") as HTMLInputElement | null;
        if (bookUserEl) bookUserEl.value = u || "";
        system.switchAgentTab(app, "booker");
      });
    });
  },

  renderRegistrationHistory(system: any, app: any, myUsers: any[], myLedger: any[]) {
    const tbody = document.getElementById("agent-reghistory-tbody");
    if (!tbody) return;

    const q = ((document.getElementById("agent-reghistory-search") as HTMLInputElement | null)?.value || "").toLowerCase().trim();
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

  renderCommissionsTab(system: any, app: any, myLedger: any[], earnedCommNum: number, pendingCommissionSum: number) {
    const bookingComm = myLedger
      .filter(l => l.status !== "pending" && (l.description || "").toLowerCase().includes("booked ticket"))
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const overrideComm = myLedger
      .filter(l => l.status !== "pending" && (l.description || "").toLowerCase().includes("override"))
      .reduce((s, l) => s + (Number(l.commission) || 0), 0);

    const setEl = (id: string, t: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    setEl("agent-comm-tab-total", `৳${earnedCommNum.toFixed(2)}`);
    setEl("agent-comm-tab-pending", `৳${pendingCommissionSum.toFixed(2)}`);
    setEl("agent-comm-tab-booking", `৳${bookingComm.toFixed(2)}`);
    setEl("agent-comm-tab-override", `৳${overrideComm.toFixed(2)}`);

    const tbody = document.getElementById("agent-commissions-tbody");
    if (!tbody) return;

    const statusFilter = (document.getElementById("agent-comm-filter-status") as HTMLSelectElement | null)?.value || "all";
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

  renderTransactionsTab(system: any, app: any, myLedger: any[], allDeposits: any[], allWithdrawals: any[]) {
    const tbody = document.getElementById("agent-transactions-tbody");
    if (!tbody) return;

    const typeFilter = (document.getElementById("agent-tx-type-filter") as HTMLSelectElement | null)?.value || "all";
    const q = ((document.getElementById("agent-tx-search-input") as HTMLInputElement | null)?.value || "").toLowerCase().trim();

    const agentUsernameLower = (app.currentUser?.username || "").toLowerCase();
    const myTxs = (app.db.transactions || []).filter(
      (tx: any) => tx && (tx.userId === app.currentUser.id || (tx.username || "").toLowerCase() === agentUsernameLower)
    );

    const unified: any[] = [];
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

    myTxs.forEach((t: any) => {
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

  renderPaymentRequestsTab(system: any, app: any, allDeposits: any[], allWithdrawals: any[]) {
    const tbody = document.getElementById("agent-payreq-tbody");
    if (!tbody) return;

    const statusFilter = (document.getElementById("agent-payreq-status-filter") as HTMLSelectElement | null)?.value || "all";
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
          const uEl = document.getElementById("agent-cash-dep-username") as HTMLInputElement | null;
          const aEl = document.getElementById("agent-cash-dep-amount") as HTMLInputElement | null;
          if (uEl) uEl.value = u || "";
          if (aEl) aEl.value = amt || "";
        } else {
          const uEl = document.getElementById("agent-cash-wdr-username") as HTMLInputElement | null;
          const aEl = document.getElementById("agent-cash-wdr-amount") as HTMLInputElement | null;
          if (uEl) uEl.value = u || "";
          if (aEl) aEl.value = amt || "";
        }
        system.switchAgentTab(app, "cash");
      });
    });

    tbody.querySelectorAll(".payreq-chat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        system.activeChatUser = btn.getAttribute("data-user");
        system.switchAgentTab(app, "live-chat");
      });
    });
  },

  renderAgentWalletTab(system: any, app: any, balanceNum: number, earnedCommNum: number, myLedger: any[]) {
    const ledgerList = Array.isArray(myLedger) ? myLedger : [];
    const totalLoaded = ledgerList
      .filter(l => (l.description || "").toLowerCase().includes("deposit") || (l.description || "").toLowerCase().includes("load"))
      .reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const setEl = (id: string, t: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    const bNum = Number(balanceNum) || 0;
    const cNum = Number(earnedCommNum) || 0;
    setEl("agent-wallet-tab-balance", `৳${bNum.toFixed(2)}`);
    setEl("agent-wallet-tab-commission", `৳${cNum.toFixed(2)}`);
    setEl("agent-wallet-tab-loaded", `৳${totalLoaded.toFixed(2)}`);
  },

  renderReferralsTab(system: any, app: any, myUsers: any[]) {
    const linkInput = document.getElementById("agent-referral-link-input") as HTMLInputElement | null;
    if (linkInput && app.currentUser) {
      linkInput.value = `${window.location.origin}/?ref=${encodeURIComponent(app.currentUser.username)}`;
    }

    const tickets = app.db.tickets || [];
    const lotteries = app.db.lotteries || [];
    const feeMap: any = {};
    lotteries.forEach((l: any) => { feeMap[l.id] = Number(l.entryFee) || 100; });

    let totalRefTickets = 0;
    let totalRefVolume = 0;
    const perUserStats: any = {};

    myUsers.forEach(u => {
      perUserStats[u.id] = { tickets: 0, vol: 0 };
    });

    tickets.forEach((t: any) => {
      if (perUserStats[t.userId]) {
        const fee = feeMap[t.lotteryId] || 100;
        perUserStats[t.userId].tickets++;
        perUserStats[t.userId].vol += fee;
        totalRefTickets++;
        totalRefVolume += fee;
      }
    });

    const qualifiedCount = myUsers.filter(u => u.agentCommissionPaid || (Number(u.totDeposit) || 0) >= 100).length;

    const setEl = (id: string, t: string) => {
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

  renderNotificationsTab(system: any, app: any, myNotifications: any[], threads: any[]) {
    const listEl = document.getElementById("agent-notifications-list");
    if (!listEl) return;

    const unreadThreads = threads.filter(t => t.unreadCount > 0);
    const itemsHtml: string[] = [];

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
        system.activeChatUser = btn.getAttribute("data-user");
        system.switchAgentTab(app, "live-chat");
      });
    });
  },

  renderAnalyticsTab(system: any, app: any, myUsers: any[], myLedger: any[]) {
    const range = (document.getElementById("agent-analytics-range") as HTMLSelectElement | null)?.value || "all";
    const filteredLedger = myLedger.filter(l => system.filterByDateRange(l.timestamp, range));
    const filteredUsers = myUsers.filter(u => system.filterByDateRange(u.joinDate, range));

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

    const setEl = (id: string, t: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = t;
    };
    setEl("agent-an-cash-in", `৳${cashIn.toFixed(2)}`);
    setEl("agent-an-cash-out", `৳${cashOut.toFixed(2)}`);
    setEl("agent-an-tickets", `৳${ticketVol.toFixed(2)}`);
    setEl("agent-an-comm", `৳${netComm.toFixed(2)}`);
    setEl("agent-an-users", String(filteredUsers.length));
  },

  updateProfilePhotoPreview(app: any, photoUrl: string, fallbackName = "A") {
    const previewEl = document.getElementById("agent-prof-photo-preview");
    const removeBtn = document.getElementById("agent-prof-photo-remove-btn");
    const initial = (fallbackName || "A").charAt(0).toUpperCase();
    const cleanUrl = (photoUrl || "").trim();

    if (previewEl) {
      if (cleanUrl) {
        const esc = app?.escapeHTML ? app.escapeHTML(cleanUrl) : cleanUrl;
        const escInit = app?.escapeHTML ? app.escapeHTML(initial) : initial;
        previewEl.innerHTML = `<img src="${esc}" alt="Agent Photo" class="w-full h-full object-cover" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="hidden w-full h-full items-center justify-center text-amber-400 font-black text-2xl">${escInit}</span>`;
      } else {
        previewEl.textContent = initial;
      }
    }

    if (removeBtn) {
      if (cleanUrl) removeBtn.classList.remove("hidden");
      else removeBtn.classList.add("hidden");
    }
  },

  populateProfileForm(app: any, force = false) {
    const agent = app?.currentUser;
    if (!agent) return;

    const form = document.getElementById("agent-profile-update-form") as HTMLFormElement | null;
    if (!form) return;

    const isActivelyEditing =
      !force &&
      (form.dataset.dirty === "true" ||
        (document.activeElement && form.contains(document.activeElement)));
    if (isActivelyEditing) return;

    if (force) {
      delete form.dataset.dirty;
    }

    const setVal = (id: string, val: string) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = val;
    };

    const photoUrl = agent.photo || agent.avatar || "";
    setVal("agent-prof-username", agent.username || "");
    setVal("agent-prof-displayname", agent.displayName || agent.name || "");
    setVal("agent-prof-phone", agent.phone || "");
    setVal("agent-prof-email", agent.email || "");
    setVal("agent-prof-district", agent.district || "Dhaka");
    setVal("agent-prof-availability", (agent.availabilityStatus || "online").toLowerCase());
    setVal("agent-prof-photo", photoUrl);

    this.updateProfilePhotoPreview(app, photoUrl, agent.displayName || agent.username || "A");
  }
};
