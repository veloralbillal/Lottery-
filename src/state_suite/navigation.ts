import { bundledTabs } from "./templates/index.js";
import { LazyTabManager } from "../js/performanceOptimizer.js";
import { HomeTab } from "../dashboard_tabs/home.js";
import { TicketsTab } from "../dashboard_tabs/tickets.js";
import { WalletTab } from "../dashboard_tabs/wallet.js";
import { HistoryTab } from "../dashboard_tabs/history.js";
import { ProfileTab } from "../dashboard_tabs/profile.js";
import { StoreTab } from "../store/StoreManager.js";
import { SettingsTab } from "../dashboard_tabs/settings.js";
import { VideoBountyTab } from "../dashboard_tabs/video_bounty.js";
import { GameHubModule } from "../js/gameHub.js";
import { OtpTab } from "../dashboard_tabs/otp.js";
import { ReferTab } from "../dashboard_tabs/share_earn.js";
import { BadgeRequestTab } from "../dashboard_tabs/badge_request.js";
import { RecoveryTab } from "../dashboard_tabs/recovery.js";
import { EditProfileTab } from "../dashboard_tabs/edit_profile.js";
import { DailyCheckinTab } from "../dashboard_tabs/daily_checkin.js";

export interface NavigationModule {
  currentTab: string;
  render: () => void;
  refreshIcons: () => void;
  refreshAllIcons: () => void;
}

export function navigateTo(state: NavigationModule, tabId: string) {
  if (tabId === "lucky-wheel") {
    window.location.href = "lucky-wheel.html";
    return;
  }
  const validTabs = [
    "home", "events", "tickets", "wallet", "deposit", "withdraw", "agent", 
    "history", "profile", "edit-profile", "settings", "customizer", "badge-request", 
    "refer", "jackpot", "tasks", "daily-checkin", "otp", "recovery", "video-bounty", "games", 
    "blog", "payment-success", "payment-cancel", "store", "store-cart", "store-details", 
    "store-checkout", "store-profile"
  ];
  const target = tabId && validTabs.includes(tabId) ? tabId : "home";
  state.currentTab = target;
  if (window.location.hash !== "#" + target) {
    try {
      history.pushState({ tab: target }, "", "#" + target);
    } catch (e) {}
  }
  state.render();
  // state.refreshAllIcons(); // Removed redundant global refresh
}

export function ensureTabLoaded(state: any, tabId: string) {
  if (!tabId) return;
  const cleanId = tabId.startsWith("tab-") || tabId.startsWith("admin-tab-") ? tabId : `tab-${tabId}`;
  LazyTabManager.loadTabTemplate(cleanId, bundledTabs);

  // Lazily initialize module event listeners
  const initializers: Record<string, { module: any, key: string }> = {
    "tab-home": { module: HomeTab, key: "HomeTab" },
    "tab-wallet": { module: WalletTab, key: "WalletTab" },
    "tab-tickets": { module: TicketsTab, key: "TicketsTab" },
    "tab-history": { module: HistoryTab, key: "HistoryTab" },
    "tab-profile": { module: ProfileTab, key: "ProfileTab" },
    "tab-settings": { module: SettingsTab, key: "SettingsTab" },
    "tab-games": { module: GameHubModule, key: "GameHubModule" },
    "tab-video-bounty": { module: VideoBountyTab, key: "VideoBountyTab" },
    "tab-otp": { module: OtpTab, key: "OtpTab" },
    "tab-refer": { module: ReferTab, key: "ReferTab" },
    "tab-badge-request": { module: BadgeRequestTab, key: "BadgeRequestTab" },
    "tab-recovery": { module: RecoveryTab, key: "RecoveryTab" },
    "tab-edit-profile": { module: EditProfileTab, key: "EditProfileTab" },
    "tab-daily-checkin": { module: DailyCheckinTab, key: "DailyCheckinTab" }
  };

  if (initializers[cleanId]) {
    const { module, key } = initializers[cleanId];
    if (!LazyTabManager.isModuleInitialized(key)) {
      LazyTabManager.markModuleInitialized(key);
      module.init(state);
    }
  } else if ((cleanId === "tab-store" || cleanId.startsWith("tab-store-")) && !LazyTabManager.isModuleInitialized("StoreTab")) {
    LazyTabManager.markModuleInitialized("StoreTab");
    StoreTab.init(state);
  }

  if (typeof (state as any).refreshIconsForContainer === "function") {
    const el = document.getElementById(cleanId);
    if (el) (state as any).refreshIconsForContainer(el);
  } else {
    state.refreshIcons();
  }
}
