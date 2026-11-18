export const AgentNavigation = {
  applySidebarState(system: any) {
    const sidebar = document.getElementById("agent-sidebar");
    const icon = document.getElementById("agent-sidebar-collapse-icon");
    if (!sidebar) return;

    const textEls = sidebar.querySelectorAll(".agent-sidebar-text");
    if (system.sidebarCollapsed && window.innerWidth >= 1024) {
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-20");
      textEls.forEach(el => el.classList.add("hidden"));
      if (icon) icon.setAttribute("class", "fa-solid fa-angles-right text-[10px]");
    } else {
      sidebar.classList.remove("w-20");
      sidebar.classList.add("w-64");
      textEls.forEach(el => el.classList.remove("hidden"));
      if (icon) icon.setAttribute("class", "fa-solid fa-angles-left text-[10px]");
    }
  },

  switchAgentTab(system: any, app: any, tabKey: string) {
    if (!tabKey) return;
    // RBAC check: subagents cannot open subagents management tab
    if (tabKey === "subagents" && app.currentUser?.role === "subagent") {
      app.showToast("Access restricted: Sub-Agents cannot manage downline sub-agents.", "error");
      return;
    }

    system.activeSubTab = tabKey;
    localStorage.setItem("agent_active_tab", tabKey);

    const allPanels = [
      "overview", "live-chat", "players", "add-user", "reg-history",
      "commissions", "transactions", "payment-requests", "wallet",
      "referrals", "notifications", "analytics", "profile", "security",
      "support", "booker", "cash", "subagents", "ledger"
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

    const tabTitles: Record<string, string> = {
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

    this.closeMobileDrawer();
    this.applySidebarState(system);

    if (typeof system.renderAllPanels === "function") {
      system.renderAllPanels(app);
    }

    if (tabKey === "profile" && typeof system.populateProfileForm === "function") {
      system.populateProfileForm(app, true);
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
  }
};
