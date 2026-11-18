import { AdminStats } from "./tabs/AdminStats.js";
import { AdminUsers } from "./tabs/AdminUsers.js";
import { AdminLotteries } from "./tabs/AdminLotteries.js";
import { AdminDeposits } from "./tabs/AdminDeposits.js";
import { AdminWithdrawals } from "./tabs/AdminWithdrawals.js";
import { AdminCategories } from "./tabs/AdminCategories.js";
import { AdminMessages } from "./tabs/AdminMessages.js";
import { AdminReports } from "./tabs/AdminReports.js";
import { AdminAgents } from "./tabs/AdminAgents.js";
import { AdminGeneral } from "./tabs/AdminGeneral.js";
import { AdminRewards } from "./tabs/AdminRewards.js";
import { AdminModeration } from "./tabs/AdminModeration.js";
import { AdminWebsite } from "./tabs/AdminWebsite.js";
import { AdminBlog } from "./tabs/AdminBlog.js";
import { AdminSecurity } from "./tabs/AdminSecurity.js";
import { AdminEvents } from "./tabs/AdminEvents.js";
import { AdminSplash } from "./tabs/AdminSplash.js";
import { AdminCommission } from "./tabs/AdminCommission.js";
import { AdminSecurityHelpers } from "./tabs/AdminSecurityHelpers.js";
import { AdminSettings } from "./tabs/AdminSettings.js";
import { UserInbox } from "./tabs/UserInbox.js";

import { refreshIcons as refreshGlobalIcons } from "../state_suite/icons_refresh.js";

export const AdminCore = {
  ...AdminStats,
  ...AdminUsers,
  ...AdminLotteries,
  ...AdminDeposits,
  ...AdminWithdrawals,
  ...AdminCategories,
  ...AdminMessages,
  ...AdminReports,
  ...AdminAgents,
  ...AdminGeneral,
  ...AdminRewards,
  ...AdminModeration,
  ...AdminWebsite,
  ...AdminBlog,
  ...AdminSecurity,
  ...AdminEvents,
  ...AdminSplash,
  ...AdminCommission,
  ...AdminSecurityHelpers,
  ...AdminSettings,
  ...UserInbox,

  renderAdmin(this: any) {
    const screenAdmin = document.getElementById("screen-admin");
    if (screenAdmin && !(screenAdmin as any)._delegatedBound) {
      (screenAdmin as any)._delegatedBound = true;
      screenAdmin.addEventListener("click", (e: any) => {
        if (e.target.closest("#admin-nav-toggle-btn")) {
          const drawer = document.getElementById("admin-sidebar-drawer");
          if (drawer) drawer.classList.remove("hidden");
          return;
        }
        if (e.target.closest("#close-admin-sidebar-btn")) {
          const drawer = document.getElementById("admin-sidebar-drawer");
          if (drawer) drawer.classList.add("hidden");
          return;
        }
        if (e.target.closest("#exit-admin-btn")) {
          if (typeof this.logout === "function") {
            this.logout();
          } else {
            localStorage.removeItem("lw_admin_mode");
            localStorage.removeItem("lw_admin_session");
            localStorage.removeItem("lw_user_session");
            window.location.reload();
          }
          return;
        }
        const drawer = document.getElementById("admin-sidebar-drawer");
        if (drawer && e.target === drawer) {
          drawer.classList.add("hidden");
          return;
        }
        const btn = e.target.closest(".admin-tab-selector-btn") || e.target.closest("[data-tab]");
        if (btn) {
          const tabId = btn.getAttribute("data-tab");
          if (tabId) {
            this.currentAdminTab = tabId;
            if (drawer) drawer.classList.add("hidden");
            this.renderAdmin();
          }
        }
      });
    }

    const winnerModal = document.getElementById("lottery-draw-winner-modal");
    if (winnerModal) {
      winnerModal.classList.add("hidden");
      winnerModal.style.display = "none";
    }

    const isModerator = this.currentUser && this.currentUser.role === "moderator";
    const isShopStaff = this.currentUser && (this.currentUser.role === "shop_admin" || this.currentUser.role === "shop_manager" || this.currentUser.role === "shop_owner");

    const adminTabBtns = document.querySelectorAll(".admin-tab-selector-btn");
    adminTabBtns.forEach(btn => {
      const tabId = btn.getAttribute("data-tab");

      if (tabId && !(btn as any)._boundClick) {
        (btn as any)._boundClick = true;
        btn.addEventListener("click", () => {
          this.currentAdminTab = tabId;
          this.renderAdmin();
        });
      }

      if (isShopStaff) {
        if (tabId !== "store") {
          btn.classList.add("hidden");
          if (this.currentAdminTab === tabId) {
            this.currentAdminTab = "store";
          }
        } else {
          btn.classList.remove("hidden");
        }
      } else if (isModerator) {
        const permittedTabs = ["stats", "users", "lotteries", "deposits", "withdraws", "messages", "store"];
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
        btn.classList.add("bg-gradient-to-r", "from-red-600", "to-rose-600", "text-white", "shadow-lg");
        btn.classList.remove("bg-slate-900", "text-slate-400");
      } else {
        btn.classList.remove("bg-gradient-to-r", "from-red-600", "to-rose-600", "text-white", "shadow-lg");
        btn.classList.add("bg-slate-900", "text-slate-400");
      }
    });

    const hideViewport = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    };
    [
      "admin-tab-stats", "admin-tab-users", "admin-tab-lotteries", "admin-tab-deposits", 
      "admin-tab-withdraws", "admin-tab-settings", "admin-tab-gateways", "admin-tab-sync-vault", 
      "admin-tab-messages", "admin-tab-categories", "admin-tab-website", "admin-tab-reports", 
      "admin-tab-badge-requests", "admin-tab-video-bounty", "admin-tab-refer", "admin-tab-vip", 
      "admin-tab-jackpot", "admin-tab-tasks", "admin-tab-checkin", "admin-tab-agents", 
      "admin-tab-agent-leaders", "admin-tab-subagents-list", "admin-tab-events", "admin-tab-splash", 
      "admin-tab-commission", "admin-tab-legal", "admin-tab-store", "admin-tab-blog", "admin-tab-security"
    ].forEach(hideViewport);

    const pendingRepsCount = (this.db.reports || []).filter((r: any) => r.status === "pending").length;
    const badgeEl = document.getElementById("admin-reports-count-badge");
    if (badgeEl) badgeEl.innerText = String(pendingRepsCount);

    const pendingBadgeReqsCount = (this.db.badgeRequests || []).filter((br: any) => br.status === "pending").length;
    const badgeReqsCountEl = document.getElementById("admin-badge-requests-count-badge");
    if (badgeReqsCountEl) {
      badgeReqsCountEl.innerText = String(pendingBadgeReqsCount);
      badgeReqsCountEl.classList.toggle("hidden", pendingBadgeReqsCount === 0);
    }

    const pendingBountiesCount = (this.db.videoBounties || []).filter((vb: any) => vb.status === "pending").length;
    const bountyCountEl = document.getElementById("admin-bounty-count-badge");
    if (bountyCountEl) {
      bountyCountEl.innerText = String(pendingBountiesCount);
      bountyCountEl.classList.toggle("hidden", pendingBountiesCount === 0);
    }

    const currentViewport = document.getElementById(`admin-tab-${this.currentAdminTab}`);
    if (currentViewport) currentViewport.classList.remove("hidden");

    this.renderCurrentAdminTab();
    this.flushAdminToasts();
    
    if (this.currentAdminTab === "og-config") {
      this.renderAdminOgConfig();
    }

    this.refreshIcons();
  },

  renderCurrentAdminTab(this: any) {
    try {
      const tab = this.currentAdminTab;
      if (tab === "stats") this.renderAdminStats();
      else if (tab === "users") this.renderAdminUsers();
      else if (tab === "lotteries") this.renderAdminLotteries();
      else if (tab === "deposits") this.renderAdminDeposits();
      else if (tab === "withdraws") this.renderAdminWithdraws();
      else if (tab === "categories") this.renderAdminCategories();
      else if (tab === "messages") this.renderAdminMessages();
      else if (tab === "website") this.renderAdminWebsite();
      else if (tab === "reports") this.renderAdminReports();
      else if (tab === "badge-requests") this.renderAdminBadgeRequests();
      else if (tab === "video-bounty") this.renderAdminVideoBounty();
      else if (tab === "refer") this.renderAdminRefer();
      else if (tab === "vip") this.renderAdminVipClub();
      else if (tab === "jackpot") this.renderAdminJackpot();
      else if (tab === "tasks") this.renderAdminTasks();
      else if (tab === "checkin") this.renderAdminCheckin();
      else if (tab === "settings" || tab === "gateways" || tab === "seo") this.renderAdminSettings();
      else if (tab === "sync-vault") this.renderSyncVaultTab();
      else if (tab === "events") this.renderAdminEvents();
      else if (tab === "splash") this.renderAdminSplashConfig();
      else if (tab === "agents") this.renderAdminAgents();
      else if (tab === "agent-leaders") this.renderAgentLeadersTab();
      else if (tab === "subagents-list") this.renderSubAgentsListTab();
      else if (tab === "commission") this.renderAdminCommission();
      else if (tab === "store") this.renderAdminStore();
      else if (tab === "blog") this.renderAdminBlog();
      else if (tab === "security") this.renderAdminSecurity();
      else if (tab === "legal") {
        if (window.LegalPoliciesManager) {
          window.LegalPoliciesManager.renderAdminSection(this);
        }
      }
    } catch (err) {
      console.error("Exception handling admin sub-tab render process for tab:", this.currentAdminTab, err);
    }
  },

  refreshIcons() {
    refreshGlobalIcons();
  },

  escapeHTML(str: string) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  async fetchWithTimeout(url: string, options: any = {}, timeoutMs = 2000) {
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
  }
};
