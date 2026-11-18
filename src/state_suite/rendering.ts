import { HomeTab } from "../dashboard_tabs/home.js";
import { WalletTab } from "../dashboard_tabs/wallet.js";
import { TicketsTab } from "../dashboard_tabs/tickets.js";
import { HistoryTab } from "../dashboard_tabs/history.js";
import { ProfileTab } from "../dashboard_tabs/profile.js";
import { StoreTab } from "../store/StoreManager.js";
import { SettingsTab } from "../dashboard_tabs/settings.js";
import { VideoBountyTab } from "../dashboard_tabs/video_bounty.js";
import { GameHubModule } from "../js/gameHub.js";
import { OtpTab } from "../dashboard_tabs/otp.js";
import { AffiliateAgentSystem } from "../dashboard_tabs/affiliate_agent_system.js";
import { JackpotTab } from "../dashboard_tabs/jackpot.js";
import { MissionsTab } from "../dashboard_tabs/missions.js";
import { membersListManager } from "../dashboard_tabs/members_list.js";
import { BlogModule } from "../dashboard_tabs/blog.js";
import { LuckyWheelModule } from "../js/luckyWheel.js";
import { ReferTab } from "../dashboard_tabs/share_earn.js";
import { BadgeRequestTab } from "../dashboard_tabs/badge_request.js";
import { RecoveryTab } from "../dashboard_tabs/recovery.js";
import { EditProfileTab } from "../dashboard_tabs/edit_profile.js";
import { DailyCheckinTab } from "../dashboard_tabs/daily_checkin.js";
import { updateAllWalletBalanceUI, updateSiteBranding } from "./ui_updates.js";

export function renderDashboard(state: any) {
  try {
    updateSiteBranding(state?.db);
    if (!state.currentUser) {
      const screenAuth = document.getElementById("screen-auth");
      if (screenAuth) screenAuth.classList.remove("hidden");
      ["screen-dashboard", "screen-admin", "screen-agent", "screen-maintenance"].forEach(id => {
        const s = document.getElementById(id);
        if (s) s.classList.add("hidden");
      });
      return;
    }

    if (state.isAdminMode || state.currentUser?.role === "admin" || state.currentUser?.username?.toLowerCase() === "admin") {
      state.isAdminMode = true;
      localStorage.setItem("lw_admin_mode", "true");
      localStorage.setItem("lw_admin_session", "true");
      const screenAdmin = document.getElementById("screen-admin");
      const screenDashboard = document.getElementById("screen-dashboard");
      const screenAgent = document.getElementById("screen-agent");
      const screenAuth = document.getElementById("screen-auth");
      const screenSplash = document.getElementById("splash-screen");
      if (screenAdmin) {
        screenAdmin.classList.remove("hidden");
        screenAdmin.style.display = "flex";
      }
      if (screenDashboard) {
        screenDashboard.classList.add("hidden");
        screenDashboard.style.display = "none";
      }
      if (screenAgent) {
        screenAgent.classList.add("hidden");
        screenAgent.style.display = "none";
      }
      if (screenAuth) screenAuth.classList.add("hidden");
      if (screenSplash) screenSplash.classList.add("hidden");
      if (typeof state.renderAdmin === "function") {
        state.renderAdmin();
      }
      return;
    }

    const userRole = String(state.currentUser?.role || "").toLowerCase();
    if (userRole === "agent" || userRole === "subagent") {
      state.isAdminMode = false;
      const screenAgent = document.getElementById("screen-agent");
      const screenDashboard = document.getElementById("screen-dashboard");
      const screenAdmin = document.getElementById("screen-admin");
      const screenAuth = document.getElementById("screen-auth");
      const screenSplash = document.getElementById("splash-screen");
      const screenBlog = document.getElementById("screen-blog");
      const screenStore = document.getElementById("screen-store");
      const screenGroupChat = document.getElementById("screen-group-chat");
      const screenMaintenance = document.getElementById("screen-maintenance");

      if (screenAgent) {
        screenAgent.classList.remove("hidden");
        screenAgent.style.display = "flex";
        screenAgent.style.opacity = "1";
        screenAgent.style.visibility = "visible";
      }
      [screenDashboard, screenAdmin, screenAuth, screenBlog, screenStore, screenGroupChat, screenMaintenance].forEach(el => {
        if (el) {
          el.classList.add("hidden");
          el.style.display = "none";
        }
      });
      if (screenSplash) {
        screenSplash.classList.add("hidden");
        screenSplash.style.display = "none";
      }

      if (typeof state.setupStaffAndAgentListeners === "function") {
        state.setupStaffAndAgentListeners();
      }
      if (typeof state.renderAgentWorkspace === "function") {
        state.renderAgentWorkspace();
      }
      if (screenAgent) {
        if (typeof state.refreshIconsForContainer === "function") {
          state.refreshIconsForContainer(screenAgent);
        } else if (typeof state.refreshIcons === "function") {
          state.refreshIcons();
        }
      }
      return;
    }

    if (state.currentTab === "lucky-wheel") {
      window.location.href = "lucky-wheel.html";
      return;
    }

    updateAllWalletBalanceUI(state.currentUser);

    const validTabs = [
      "home", "events", "tickets", "wallet", "deposit", "withdraw", "agent", 
      "history", "profile", "edit-profile", "settings", "customizer", "badge-request", 
      "refer", "jackpot", "tasks", "daily-checkin", "otp", "recovery", "video-bounty", "games", 
      "blog", "payment-success", "payment-cancel", "store", "store-cart", "store-details", 
      "store-checkout", "store-profile", "lucky-wheel"
    ];

    const checkIsStoreTab = (t: string) => t === "store" || t.startsWith("store-");

    // Sanitize currentTab: Fallback to "home" if missing, invalid, or element doesn't exist
    const hasContainer = checkIsStoreTab(state.currentTab)
      ? Boolean(document.getElementById("screen-store"))
      : Boolean(document.getElementById(`tab-${state.currentTab}`) || document.getElementById(`screen-${state.currentTab}`));

    if (!state.currentTab || !validTabs.includes(state.currentTab) || !hasContainer) {
      state.currentTab = "home";
      if (window.location.hash !== "#home") {
        try { history.replaceState({ tab: "home" }, "", "#home"); } catch (e) {}
      }
    }

    const isStoreTab = checkIsStoreTab(state.currentTab);
    
    // Update Tab Selectors
    document.querySelectorAll(".tab-selector-btn").forEach(btn => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId === state.currentTab) {
        btn.className = "tab-selector-btn text-xs font-bold flex flex-col items-center gap-1 text-emerald-400 active-tab";
      } else {
        btn.className = "tab-selector-btn text-xs font-semibold flex flex-col items-center gap-1 text-slate-400 hover:text-white";
      }
    });

    // Ensure appropriate top-level screen is visible and other main screens are hidden
    const screenDashboard = document.getElementById("screen-dashboard");
    const screenAuth = document.getElementById("screen-auth");
    const screenSplash = document.getElementById("splash-screen");
    const screenBlog = document.getElementById("screen-blog");
    const screenStore = document.getElementById("screen-store");
    const screenGroupChat = document.getElementById("screen-group-chat");

    if (screenGroupChat) screenGroupChat.classList.add("hidden");

    if (state.currentTab === "blog" && screenBlog) {
      screenBlog.classList.remove("hidden");
      if (screenDashboard) screenDashboard.classList.add("hidden");
      if (screenStore) screenStore.classList.add("hidden");
    } else if (isStoreTab && screenStore) {
      screenStore.classList.remove("hidden");
      if (screenDashboard) screenDashboard.classList.add("hidden");
      if (screenBlog) screenBlog.classList.add("hidden");
    } else {
      if (screenDashboard) screenDashboard.classList.remove("hidden");
      if (screenBlog) screenBlog.classList.add("hidden");
      if (screenStore) screenStore.classList.add("hidden");
    }

    if (screenAuth) screenAuth.classList.add("hidden");
    if (screenSplash) {
      screenSplash.classList.add("hidden");
      screenSplash.style.display = "none";
    }
    
    ["screen-admin", "screen-agent", "screen-maintenance"].forEach(id => {
      const s = document.getElementById(id);
      if (s) s.classList.add("hidden");
    });

    state.ensureTabLoaded(`tab-${state.currentTab}`);

    // Hide all dashboard tab containers specifically
    const tabsInMain = document.querySelectorAll('main > [id^="tab-"]');
    tabsInMain.forEach(el => el.classList.add("hidden"));

    // Show current tab
    let targetTab = document.getElementById(`tab-${state.currentTab}`);
    if (!targetTab && state.currentTab !== "blog" && !isStoreTab) {
      state.currentTab = "home";
      state.ensureTabLoaded("tab-home");
      targetTab = document.getElementById("tab-home");
    }
    if (targetTab) targetTab.classList.remove("hidden");

    // Call specific renderers
    if (state.currentTab === "home") renderHomeTab(state);
    else if (state.currentTab === "events") {
      import("../js/uiEffects.js").then((mod) => {
        if (mod?.UIEffectsModule?.renderEventsTab) {
          mod.UIEffectsModule.renderEventsTab.call(state);
        }
      }).catch(() => {});
    }
    else if (state.currentTab === "wallet") WalletTab.render(state);
    else if (state.currentTab === "tickets") TicketsTab.render(state);
    else if (state.currentTab === "history") HistoryTab.render(state);
    else if (state.currentTab === "profile") ProfileTab.render(state);
    else if (state.currentTab === "jackpot") JackpotTab.render(state);
    else if (state.currentTab === "tasks") MissionsTab.render(state);
    else if (state.currentTab === "daily-checkin") DailyCheckinTab.render(state);
    else if (state.currentTab === "games") GameHubModule.render(state);
    else if (state.currentTab === "video-bounty") VideoBountyTab.render(state);
    else if (isStoreTab) StoreTab.render(state);
    else if (state.currentTab === "settings") SettingsTab.render(state);
    else if (state.currentTab === "agent") AffiliateAgentSystem.renderAgents(state);
    else if (state.currentTab === "blog") BlogModule.render(state);
    else if (state.currentTab === "otp") OtpTab.render(state);
    else if (state.currentTab === "refer") ReferTab.render(state);
    else if (state.currentTab === "badge-request") BadgeRequestTab.render(state);
    else if (state.currentTab === "recovery") RecoveryTab.render(state);
    else if (state.currentTab === "edit-profile") EditProfileTab.render(state);
    else if (state.currentTab === "lucky-wheel") LuckyWheelModule.renderTab(state);

    const iconContainer = targetTab || (isStoreTab ? screenStore : null);
    if (iconContainer) {
      if (typeof state.refreshIconsForContainer === "function") {
        state.refreshIconsForContainer(iconContainer);
      } else {
        state.refreshIcons();
      }
    }
  } catch (err) {
    console.error("FATAL RENDER ERROR:", err);
    const screenAuth = document.getElementById("screen-auth");
    if (screenAuth) screenAuth.classList.remove("hidden");
    const screenDashboard = document.getElementById("screen-dashboard");
    if (screenDashboard) screenDashboard.classList.add("hidden");
  }
}

export function renderHomeTab(state: any) {
  HomeTab.render(state);
}
