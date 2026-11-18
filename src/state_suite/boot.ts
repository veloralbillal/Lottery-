import { StateManager, initGlobalHandlers } from "./index";
import { initEarlyLogic } from "./early_logic";
import { setupRequiredScreens } from "./rendering_setup";
import { MirofishAgentSimulation } from "../js/mirofishAgentSimulation.js";
import { ChatProfileSystem } from "../chat-profile-system.js";
import { JackpotTab } from "../dashboard_tabs/jackpot.js";
import { AffiliateAgentSystem } from "../dashboard_tabs/affiliate_agent_system.js";
import { GameHubModule } from "../js/gameHub.js";
import { MissionsTab } from "../dashboard_tabs/missions.js";
import { WalletExtensions } from "../dashboard_tabs/wallet_extensions.js";
import { PaymentGateways } from "../js/payment_gateways.js";
import { LegalPoliciesManager } from "../js/legalPoliciesManager.js";
import { FloatingToastNotification } from "../floating_toast.js";
import { NotificationEngine } from "../js/notificationEngine.js";
import { UIEffectsModule } from "../js/uiEffects.js";
import { setupAuthPortalEvents } from "./auth_portal_events";

export function initApplicationLoader() {
  if ((window as any).appInstance) return;
  
  // Initialize early UI handlers and console filters extracted from index.html
  initEarlyLogic();
  
  // Inject required HTML screens extracted from index.html
  setupRequiredScreens();

  initGlobalHandlers();


  const app = new StateManager();
  (window as any).appInstance = app;
  (window as any).app = app;
  (window as any).logout = () => app.logout();
  (window as any).handleLogout = (window as any).logout;
  
  (app as any).mirofishSimulation = new MirofishAgentSimulation(app);
  (app as any).mirofishSimulation.init();
  (window as any).chatProfileHelper = new ChatProfileSystem(app);
  
  AffiliateAgentSystem.init(app);
  JackpotTab.init(app);
  MissionsTab.init(app);
  GameHubModule.init(app);
  WalletExtensions.init(app);
  PaymentGateways.init(app);
  LegalPoliciesManager.initLegalState(app);
  setupAuthPortalEvents(app);
  if (typeof (app as any).initFirebaseSync === "function") {
    (app as any).initFirebaseSync();
  }

  const VALID_NAV_TABS = [
    "home", "events", "tickets", "wallet", "deposit", "withdraw", "agent", 
    "history", "profile", "edit-profile", "settings", "customizer", "badge-request", 
    "refer", "jackpot", "tasks", "daily-checkin", "otp", "recovery", "video-bounty", "games", 
    "blog", "payment-success", "payment-cancel", "store", "store-cart", "store-details", 
    "store-checkout", "store-profile", "lucky-wheel"
  ];

  // Event Listeners
  window.addEventListener("hashchange", () => {
    const role = String(app.currentUser?.role || "").toLowerCase();
    if (app.isAdminMode || role === "admin" || role === "agent" || role === "subagent") return;
    const hash = window.location.hash ? window.location.hash.replace(/^#/, "").trim().toLowerCase() : "home";
    if (VALID_NAV_TABS.includes(hash) && app.currentTab !== hash) {
      app.currentTab = hash;
      app.render();
    }
  });

  // Fast direct navigation helper for standalone Lucky Wheel page (no artificial delay)
  (window as any).showLuckyWheelLoadingAnimation = (targetUrl: string) => {
    window.location.href = targetUrl || "lucky-wheel.html";
  };

  document.addEventListener("click", (e) => {
    const logoutBtn = (e.target as HTMLElement)?.closest("#profile-logout-btn, .profile-logout-btn, #agent-logout-btn, #agent-sidebar-logout-btn, [data-action='logout'], .btn-logout");
    if (logoutBtn) {
      e.preventDefault();
      e.stopPropagation();
      app.logout();
      return;
    }

    const luckyWheelLink = (e.target as HTMLElement)?.closest("#home-lucky-spin-btn, a[href*='lucky-wheel.html']");
    if (luckyWheelLink) {
      e.preventDefault();
      e.stopPropagation();
      const href = luckyWheelLink.getAttribute("href");
      window.location.href = href && href.includes("lucky-wheel.html") ? href : "lucky-wheel.html";
      return;
    }

    const tabBtn = (e.target as HTMLElement).closest(".tab-selector-btn");
    if (tabBtn) {
      const tabId = tabBtn.getAttribute("data-tab");
      if (tabId && VALID_NAV_TABS.includes(tabId)) {
        e.preventDefault();
        app.navigateTo(tabId);
      }
      return;
    }

    const anchor = (e.target as HTMLElement).closest("a");
    if (anchor && anchor.getAttribute("href")?.startsWith("#")) {
      const tabId = anchor.getAttribute("href")?.replace(/^#/, "");
      if (tabId && VALID_NAV_TABS.includes(tabId)) {
        e.preventDefault();
        app.navigateTo(tabId);
      }
    }
  });

  FloatingToastNotification.start(app);
  NotificationEngine.init(app);
  app.render();
  UIEffectsModule.initSplashScreen();
}
