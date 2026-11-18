import { 
  appIcons, removeCircularReferences, safeStringify, 
  initDatabase, loadSession, completeLogin, logout,
  navigateTo, ensureTabLoaded, 
  updateMetaTags, updateAllWalletBalanceUI,
  refreshIcons, refreshAllIcons, refreshIconsForContainer,
  renderDashboard,
  checkRateLimit, recordRateLimitAttempt, is2FAActive, verify2FACode
} from "./index";

import { OfflineQueueManager } from "../js/syncQueue.js";
import { 
  checkAndExecuteAutoDraws as executeAutoDrawsLogic,
  openLotteryDetailsPop as openLotteryDetailsPopLogic,
  purchaseTicket as purchaseTicketLogic,
  openTicketLiveInfoPop as openTicketLiveInfoPopLogic,
  openThreeLotteryDraw as openThreeLotteryDrawLogic,
  createSyndicate as createSyndicateLogic,
  joinSyndicateById as joinSyndicateByIdLogic,
  joinSyndicateByCode as joinSyndicateByCodeLogic
} from "./lottery_logic.js";
import { MirofishAgentSimulation } from "../js/mirofishAgentSimulation.js";
import { VisibilityLifecycle } from "../js/performanceOptimizer.js";
import { AdminModule } from "../js/admin.js";
import { AgentModule } from "../js/agent.js";
import { SubAgentModule } from "../js/subagents.js";
import { AgentSuiteUpgrade } from "../js/agent_suite_upgrade.js";
import { VipLoungeModule } from "../js/vipLounge.js";
import { OfflineGameModule } from "../js/offlineGame.js";
import { SyncVaultModule } from "../js/syncVault.js";
import { LuckyWheelModule } from "../js/luckyWheel.js";
import { SyncCloudModule } from "../js/syncCloud.js";
import { UIEffectsModule } from "../js/uiEffects.js";
import { GoogleDriveModule } from "../js/googleDrive.js";
import { GroupChatTab } from "../dashboard_tabs/group_chat.js";

export class StateManager {
  dbKey: string;
  sessionKey: string;
  adminSessionKey: string;
  currentTab: string;
  currentAdminTab: string;
  currentUser: any;
  isAdminMode: boolean;
  db: any;
  offlineQueue: any;
  syncState: string;
  lastSyncedTime: Date;
  
  // UI states
  drawAnimationTimeout: any;
  googleAuthToken: any;
  selectedReceiptFile: any;
  countdownInterval: any;
  currentHomeCategory: string;
  historySubTab: string;
  currentAdminReportsTab: string;
  communitySearchQuery: string;
  adminPlayersSearchQuery: string;
  communityFilter: string;
  genTier: string;
  currentStoreSubTab: string;
  liveTickerStarted: boolean = false;
  lastLocalWriteTime: number = 0;
  offlineGameCards: any[] = [];
  firstFlippedCard: any = null;
  secondFlippedCard: any = null;
  isFlippedTimeoutActive: boolean = false;
  offlineScore: number = 0;
  declare syncToCloud: () => Promise<any>;
  cloudSyncTimeout: any;
  detailsModalInterval: any = null;
  activeThreeScene: any = null;
  homePoolsCountdownInterval: any = null;
  quickDrawInterval: any = null;
  _autoLaunched3D: any = {};
  _autoLaunchedQuick3D: any = {};

  constructor() {
    try {
      console.log("StateManager: Initializing...");
      (window as any).refreshIcons = () => this.refreshIcons();
      this.dbKey = "lottery_winner_db";
      this.sessionKey = "lw_user_session";
      this.adminSessionKey = "lw_admin_session";
      this.currentTab = "home";
      this.currentAdminTab = "stats";
      this.currentUser = null;
      this.isAdminMode = false;
      this.currentHomeCategory = "all";
      this.historySubTab = "ledger";
      this.currentAdminReportsTab = "post";
      this.communitySearchQuery = "";
      this.adminPlayersSearchQuery = "";
      this.communityFilter = "recent";
      this.genTier = "free";
      this.currentStoreSubTab = "dashboard";

      this.initDatabase();
      this.loadSession();
      this.startAutoDrawChecker();

      this.syncState = 'synced';
      this.lastSyncedTime = new Date();

      this.offlineQueue = new OfflineQueueManager(this);

      const initialTab = window.location.hash ? window.location.hash.replace(/^#/, "").trim().toLowerCase() : "home";
      this.currentTab = initialTab || "home";

      VisibilityLifecycle.init();
      this.ensureTabLoaded("tab-home");

      this.updateMetaTags();
      this.render();
      this.refreshAllIcons();

      // Explicitly bind navigation methods to ensure they are available on window.app instance immediately
      this.openBlogPage = this.openBlogPage.bind(this);
      this.closeBlogPage = this.closeBlogPage.bind(this);
      this.openGroupChat = this.openGroupChat.bind(this);
      this.closeGroupChat = this.closeGroupChat.bind(this);
      this.renderGroupChat = this.renderGroupChat.bind(this);
      this.openCommunityPage = this.openCommunityPage.bind(this);
      this.closeCommunityPage = this.closeCommunityPage.bind(this);
      this.openAgentChat = this.openAgentChat.bind(this);
      this.openMemberProfile = this.openMemberProfile.bind(this);
      this.openLuckyWheelPage = this.openLuckyWheelPage.bind(this);

      // Bind lottery action & popup methods
      this.openLotteryDetailsPop = this.openLotteryDetailsPop.bind(this);
      this.purchaseTicket = this.purchaseTicket.bind(this);
      this.openTicketLiveInfoPop = this.openTicketLiveInfoPop.bind(this);
      this.openThreeLotteryDraw = this.openThreeLotteryDraw.bind(this);
      this.createSyndicate = this.createSyndicate.bind(this);
      this.joinSyndicateById = this.joinSyndicateById.bind(this);
      this.joinSyndicateByCode = this.joinSyndicateByCode.bind(this);
      this.logout = this.logout.bind(this);

    } catch (criticalError: any) {
      console.error("FATAL CONSTRUCTION ERROR:", criticalError);
    }
  }

  // Logic Methods
  initDatabase() { initDatabase(this); }
  loadSession() { loadSession(this); }
  completeLogin(user: any) { completeLogin(this, user); }
  logout() { logout(this); }
  navigateTo(tabId: string) { navigateTo(this, tabId); }
  ensureTabLoaded(tabId: string) { ensureTabLoaded(this, tabId); }
  updateMetaTags() { updateMetaTags(this.db); }
  updateAllWalletBalanceUI() { updateAllWalletBalanceUI(this.currentUser); }
  updateNotificationBanner() { UIEffectsModule.updateNotificationBanner.call(this); }
  renderHomeBannerSliders() { UIEffectsModule.renderHomeBannerSliders.call(this); }
  startLiveActivityTicker() { UIEffectsModule.startLiveActivityTicker.call(this); }
  
  rebuildDepositGatewaySelect() {
    try {
      const sel = document.getElementById("dep-gateway");
      if (!sel) return;
      sel.innerHTML = `
        <option value="UddoktaPay">UddoktaPay Automated PGW</option>
        <option value="ZiniPay">ZiniPay Automated Gateway</option>
        <option value="Cryptomus">Cryptomus Crypto USDT/BTC</option>
        <option value="bKash">bKash Manual Agent Send Money</option>
        <option value="Nagad">Nagad Manual Agent Send Money</option>
        <option value="Rocket">Rocket Manual Agent Send Money</option>
      `;
    } catch (e) {}
  }

  rebuildWithdrawGatewaySelect() {
    try {
      const sel = document.getElementById("with-gateway");
      if (!sel) return;
      sel.innerHTML = `
        <option value="bKash">bKash Personal</option>
        <option value="Nagad">Nagad Personal</option>
        <option value="Rocket">Rocket Personal</option>
        <option value="USDT">Crypto USDT (TRC20)</option>
      `;
    } catch (e) {}
  }

  updateSelectedDepositGatewayInstructions() {
    try {
      const inst = document.getElementById("dep-gateway-instructions");
      if (inst) {
        inst.innerText = "Select your preferred payment gateway above to deposit securely.";
      }
    } catch (e) {}
  }

  renderSupportAgentsList() {
    try {
      const container = document.getElementById("support-agents-list-container");
      if (!container) return;
      const agents = (this.db?.users || []).filter((u: any) => u.role === "agent" || u.role === "subagent" || u.isAgent);
      if (agents.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 font-mono text-center py-4">No active agents online right now.</p>`;
        return;
      }
      container.innerHTML = agents.map((ag: any) => `
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
              ${ag.username ? ag.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">@${ag.username} (${ag.fullName || 'Agent'})</h4>
              <p class="text-[10px] text-emerald-400 font-mono">Mobile: ${ag.phone || 'N/A'} · Region: ${ag.region || 'Dhaka'}</p>
            </div>
          </div>
          <button type="button" onclick="if(window.app && window.app.openAgentChat){window.app.openAgentChat('${ag.id}')}" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-[10px] font-mono font-bold transition cursor-pointer">
            Chat 💬
          </button>
        </div>
      `).join("");
    } catch (e) {}
  }

  refreshIcons() { refreshIcons(); }
  refreshAllIcons() { refreshAllIcons(); }
  refreshIconsForContainer(container: Element | null) {
    if (container) refreshIconsForContainer(container);
  }
  render() { renderDashboard(this); }

  saveDB(forceImmediate = false) {
    this.lastLocalWriteTime = Date.now();
    try {
      if (this.db) {
        if (this.currentUser && this.db.users) {
          const dbUser = this.db.users.find(u => u.id === this.currentUser.id);
          if (dbUser) {
            dbUser.balance = this.currentUser.balance;
            dbUser.loss = this.currentUser.loss;
            dbUser.profit = this.currentUser.profit;
            dbUser.wins = this.currentUser.wins || 0;
          }
          localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
        }
        const cleanedDB = removeCircularReferences(this.db);
        const serializedDB = safeStringify(cleanedDB);
        localStorage.setItem(this.dbKey, serializedDB);
        localStorage.setItem("lottery_winner_db_backup", serializedDB);

        // Auto-sync changes to MySQL
        const triggerSync = () => {
          if (typeof (this as any).syncToCloud === "function") {
            return Promise.resolve((this as any).syncToCloud());
          }
          if (SyncCloudModule && typeof SyncCloudModule.syncToCloud === "function") {
            return Promise.resolve(SyncCloudModule.syncToCloud.call(this));
          }
          return Promise.resolve(false);
        };

        if (forceImmediate) {
          if (this.cloudSyncTimeout) {
            clearTimeout(this.cloudSyncTimeout);
            this.cloudSyncTimeout = null;
          }
          return triggerSync();
        } else {
          if (this.cloudSyncTimeout) clearTimeout(this.cloudSyncTimeout);
          this.cloudSyncTimeout = setTimeout(() => {
            this.cloudSyncTimeout = null;
            triggerSync();
          }, 600);
        }
      }
    } catch (e) {
      console.error("Failed to safely serialize database:", e);
    }
    return Promise.resolve();
  }

  showToast(message: string, type: string = "info") {
    FloatingToastNotification.show(message, type);
  }

  addInboxNotice(userId: string, subject: string, content: string) {
    if (!this.db.inbox) this.db.inbox = [];
    this.db.inbox.push({
      id: "notice_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      userId: userId,
      subject: subject,
      content: content,
      read: false,
      timestamp: new Date().toISOString()
    });
    this.saveDB();
  }

  checkAndExecuteAutoDraws() {
    executeAutoDrawsLogic(this as any);
  }

  startAutoDrawChecker() {
    setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      this.checkAndExecuteAutoDraws();
    }, 4000);
  }

  // Lottery Pools & Ticket Actions
  openLotteryDetailsPop(lotteryId: string) {
    openLotteryDetailsPopLogic(this, lotteryId);
  }

  purchaseTicket(lotteryId: string) {
    purchaseTicketLogic(this, lotteryId);
  }

  openTicketLiveInfoPop(ticketId: string) {
    openTicketLiveInfoPopLogic(this, ticketId);
  }

  openThreeLotteryDraw(lotName?: string) {
    openThreeLotteryDrawLogic(this, lotName);
  }

  createSyndicate(lotId: string, size: number, name: string) {
    createSyndicateLogic(this, lotId, size, name);
  }

  joinSyndicateById(synId: string) {
    joinSyndicateByIdLogic(this, synId);
  }

  joinSyndicateByCode(code: string) {
    joinSyndicateByCodeLogic(this, code);
  }

  // Standalone Screen & Navigation Helpers
  openLuckyWheelPage() {
    window.location.href = "lucky-wheel.html";
  }

  openBlogPage() {
    this.navigateTo('blog');
  }

  closeBlogPage() {
    this.navigateTo('home');
  }

  renderGroupChat() {
    GroupChatTab.render(this);
    const screen = document.getElementById("screen-group-chat");
    if (screen) {
      refreshIconsForContainer(screen);
    }
  }

  openGroupChat() {
    const screen = document.getElementById("screen-group-chat");
    if (screen) {
      this.currentTab = "group-chat";
      screen.classList.remove("hidden");
      ["screen-dashboard", "screen-auth", "screen-admin", "screen-agent", "screen-store", "screen-blog"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
      });
      this.renderGroupChat();
    } else {
      this.showToast("Group Chat is coming soon!", "info");
    }
  }

  openAgentChat(agentId: string) {
    const screen = document.getElementById("screen-agent-chat");
    if (screen) {
      screen.classList.remove("hidden");
      ["screen-dashboard", "screen-auth", "screen-admin", "screen-agent"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
      });
      // Try to initialize agent chat module if it exists
      if ((window as any).AgentChatModule) (window as any).AgentChatModule.init(this, agentId);
    } else {
      this.showToast(`Opening chat with agent ${agentId}...`, "info");
    }
  }

  openMemberProfile(username: string) {
    const screen = document.getElementById("screen-member-profile");
    if (screen) {
      screen.classList.remove("hidden");
      ["screen-dashboard", "screen-auth", "screen-admin", "screen-agent"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
      });
      // Try to initialize member profile module if it exists
      if ((window as any).MemberProfileModule) (window as any).MemberProfileModule.init(this, username);
    } else {
      this.showToast(`Viewing profile of @${username}...`, "info");
    }
  }

  closeGroupChat() {
    const screen = document.getElementById("screen-group-chat");
    if (screen) {
      screen.classList.add("hidden");
      document.getElementById("screen-dashboard")?.classList.remove("hidden");
    }
    this.navigateTo('home');
  }

  closeAgentChat() {
    const screen = document.getElementById("screen-agent-chat");
    if (screen) {
      screen.classList.add("hidden");
      document.getElementById("screen-dashboard")?.classList.remove("hidden");
    }
    this.navigateTo('home');
  }

  closeMemberProfile() {
    const screen = document.getElementById("screen-member-profile");
    if (screen) {
      screen.classList.add("hidden");
      document.getElementById("screen-dashboard")?.classList.remove("hidden");
    }
    this.navigateTo('home');
  }

  // Stubs for missing group chat methods to prevent TypeErrors
  openGroupInfoModal() { this.showToast("Group Info coming soon", "info"); }
  toggleGroupMenu(event: any) { 
    if (event) event.stopPropagation();
    const menu = document.getElementById("group-chat-dropdown-menu");
    if (menu) menu.classList.toggle("hidden");
  }
  refreshGroupChat() {
    this.renderGroupChat();
    this.showToast("Group chat synced!", "info");
  }
  openGroupSettings() { this.showToast("Group Settings coming soon", "info"); }
  openGroupProfile() { this.showToast("Group Profile coming soon", "info"); }
  cancelGroupReply() { 
    const preview = document.getElementById("group-chat-reply-preview");
    if (preview) preview.classList.add("hidden");
  }
  triggerGroupAttachment(type: string) { this.showToast(`${type} attachments coming soon`, "info"); }
  openGroupPollCreator() { this.showToast("Polls coming soon", "info"); }
  insertGroupEmoji(emoji: string) { 
    const input = document.getElementById("group-chat-input") as HTMLTextAreaElement;
    if (input) {
      input.value += emoji;
      input.focus();
    }
  }
  toggleGroupPlusMenu(event: any) { 
    if (event) event.stopPropagation();
    const menu = document.getElementById("group-chat-plus-menu");
    if (menu) menu.classList.toggle("hidden");
  }

  openCommunityPage() {
    const screen = document.getElementById("screen-community");
    if (screen) {
      screen.classList.remove("hidden");
      ["screen-dashboard", "screen-auth", "screen-admin", "screen-agent"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
      });
    } else {
      this.showToast("Community Hub coming soon!", "info");
    }
  }

  closeCommunityPage() {
    const screen = document.getElementById("screen-community");
    if (screen) {
      screen.classList.add("hidden");
      document.getElementById("screen-dashboard")?.classList.remove("hidden");
    }
    this.navigateTo('home');
  }

  // Mirofish Simulation Aliases (Required by Admin Templates)
  addMirofishMember(data?: any) {
    if (data && typeof data.preventDefault === "function") {
      data.preventDefault();
      data.stopPropagation();
    }

    const nameEl = document.getElementById("add-mf-name") as HTMLInputElement;
    const usernameEl = document.getElementById("add-mf-username") as HTMLInputElement;
    const roleEl = document.getElementById("add-mf-role") as HTMLSelectElement;
    const profitEl = document.getElementById("add-mf-profit") as HTMLInputElement;
    const bioEl = document.getElementById("add-mf-bio") as HTMLInputElement;

    const personaData: any = {};
    if (nameEl && nameEl.value.trim()) personaData.name = nameEl.value.trim();
    if (usernameEl && usernameEl.value.trim()) personaData.username = usernameEl.value.trim();
    if (roleEl && roleEl.value) personaData.role = roleEl.value;
    if (profitEl && profitEl.value) {
      const p = parseFloat(profitEl.value);
      if (!isNaN(p)) {
        personaData.totalProfit = p;
        personaData.balance = p + 5000;
      }
    }
    if (bioEl && bioEl.value.trim()) personaData.bio = bioEl.value.trim();

    if ((this as any).mirofishSimulation) {
      if (typeof (this as any).mirofishSimulation.addMember === "function") {
        (this as any).mirofishSimulation.addMember(personaData);
      } else if (typeof (this as any).mirofishSimulation.addPersona === "function") {
        (this as any).mirofishSimulation.addPersona(personaData);
      }
      this.showToast("সফলভাবে নতুন AI মেম্বার যোগ করা হয়েছে! 🤖✨", "success");
      if (nameEl) nameEl.value = "";
      if (usernameEl) usernameEl.value = "";
      if (bioEl) bioEl.value = "";
      if (profitEl) profitEl.value = "15000";
    } else {
      this.showToast("MiroFish simulation not initialized", "error");
    }
  }

  saveMirofishSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    if ((this as any).mirofishSimulation && typeof (this as any).mirofishSimulation.saveSettings === "function") {
      (this as any).mirofishSimulation.saveSettings();
    } else {
      this.saveDB(true);
    }
  }

  saveWebsiteSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveWebsiteSettings ? (AdminModule as any).saveWebsiteSettings.call(this, e) : null;
  }

  saveMaintenanceSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveMaintenanceSettings ? (AdminModule as any).saveMaintenanceSettings.call(this, e) : null;
  }

  saveDepositBoosterSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveDepositBoosterSettings ? (AdminModule as any).saveDepositBoosterSettings.call(this, e) : null;
  }

  saveSignupBonusSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveSignupBonusSettings ? (AdminModule as any).saveSignupBonusSettings.call(this, e) : null;
  }

  saveQuickDrawSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveQuickDrawSettings ? (AdminModule as any).saveQuickDrawSettings.call(this, e) : null;
  }

  saveSeoSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveSeoSettings ? (AdminModule as any).saveSeoSettings.call(this, e) : null;
  }

  saveCheckinSponsorSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveCheckinSponsorSettings ? (AdminModule as any).saveCheckinSponsorSettings.call(this, e) : null;
  }

  broadcastWebPushAd(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).broadcastWebPushAd ? (AdminModule as any).broadcastWebPushAd.call(this, e) : null;
  }

  saveGatewaysSettings(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveGatewaysSettings ? (AdminModule as any).saveGatewaysSettings.call(this, e) : null;
  }

  saveSplashConfig(e?: any) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
    return (AdminModule as any).saveSplashConfig ? (AdminModule as any).saveSplashConfig.call(this, e) : null;
  }

  shareOnWhatsAppViral() {
    const username = this.currentUser ? this.currentUser.username : "player";
    const inviteUrl = window.location.origin + "/index.html?ref=" + encodeURIComponent(username);
    const text = `৳১,৫০০ প্রথম পুরস্কার! সম্পূর্ণ ফ্রিতে যোগ দিন এবং লটারি খেলে জিতুন। আমার ইনভাইট লিংক থেকে রেজিস্টার করলেই পাবেন বিশেষ বোনাস!\n\nরেজিস্ট্রেশন লিংক: ${inviteUrl}`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  }

  escapeHTML(str: string): string {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m] || m);
  }
}

Object.assign(StateManager.prototype, AdminModule);
Object.assign(StateManager.prototype, AgentModule);
Object.assign(StateManager.prototype, SubAgentModule);
Object.assign(StateManager.prototype, AgentSuiteUpgrade);
Object.assign(StateManager.prototype, VipLoungeModule);
Object.assign(StateManager.prototype, OfflineGameModule);
Object.assign(StateManager.prototype, SyncVaultModule);
Object.assign(StateManager.prototype, LuckyWheelModule);
Object.assign(StateManager.prototype, SyncCloudModule);
Object.assign(StateManager.prototype, UIEffectsModule);
Object.assign(StateManager.prototype, GoogleDriveModule);
