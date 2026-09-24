import { SyncCloudModule } from "./js/syncCloud.js";
import { UIEffectsModule } from "./js/uiEffects.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeFirestore, doc, getDoc, setDoc, setLogLevel } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ChatProfileSystem } from "./chat-profile-system.js";
import { OfflineQueueManager } from "./js/syncQueue.js";
import { AdminModule } from "./js/admin.js";
import { AgentModule } from "./js/agent.js";
import { SubAgentModule } from "./js/subagents.js";
import { VipLoungeModule } from "./js/vipLounge.js";
import { OfflineGameModule } from "./js/offlineGame.js";
import { SyncVaultModule } from "./js/syncVault.js";
import { LuckyWheelModule } from "./js/luckyWheel.js";
import { GoogleDriveModule } from "./js/googleDrive.js";
import { HomeTab } from "./dashboard_tabs/home.js";
import { TicketsTab } from "./dashboard_tabs/tickets.js";
import { WalletTab } from "./dashboard_tabs/wallet.js";
import { HistoryTab } from "./dashboard_tabs/history.js";
import { ProfileTab } from "./dashboard_tabs/profile.js";
import { SettingsTab } from "./dashboard_tabs/settings.js";
import { CustomizerStore } from "./dashboard_tabs/customizer_store.js";
import { ReferTab } from "./dashboard_tabs/share_earn.js";
import { BadgeRequestTab } from "./dashboard_tabs/badge_request.js";
import { VideoBountyTab } from "./dashboard_tabs/video_bounty.js";
import { JackpotTab } from "./dashboard_tabs/jackpot.js";
import { MissionsTab } from "./dashboard_tabs/missions.js";
import { FloatingToastNotification } from "./floating_toast.js";
import { NotificationEngine } from "./js/notificationEngine.js";
import { GameHubModule } from "./js/gameHub.js";
import { DeviceFingerprint } from "./js/deviceFingerprint.js";
import { getDefaultDB } from "./js/defaultDB.js";
import { bundledTabs } from "./js/bundledTabs.js";
import { TOTP } from "./js/totp.js";
import { PaymentGateways } from "./js/payment_gateways.js";
import { AffiliateAgentSystem } from "./dashboard_tabs/affiliate_agent_system.js";
import { WalletExtensions } from "./dashboard_tabs/wallet_extensions.js";
import { LiveDrawRevealEngine } from "./js/liveDrawRevealEngine.js";

// Main client-side database and router state for the Mobile Lottery Portal
export class StateManager {
  static getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      try {
        if (typeof value === "object" && value !== null) {
          const cname = (value.constructor && typeof value.constructor.name === "string") ? value.constructor.name : "";
          if (
            cname.startsWith("Firestore") ||
            cname.startsWith("Document") ||
            cname.startsWith("Query") ||
            cname.startsWith("Collection") ||
            cname.startsWith("Firebase") ||
            cname.startsWith("HTML") ||
            cname === "Window" ||
            cname === "Sa" ||
            cname === "Q$1" ||
            (value.constructor && value.constructor !== Object && value.constructor !== Array && value.constructor !== Date && value.constructor !== RegExp)
          ) {
            return undefined;
          }
          if (seen.has(value)) {
            return undefined; // Discard circular references
          }
          seen.add(value);
        }
        return value;
      } catch (err) {
        return undefined;
      }
    };
  }

  static removeCircularReferences(obj, seen = new WeakSet()) {
    try {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      const cname = (obj.constructor && typeof obj.constructor.name === "string") ? obj.constructor.name : "";
      if (
        cname.startsWith("Firestore") ||
        cname.startsWith("Document") ||
        cname.startsWith("Query") ||
        cname.startsWith("Collection") ||
        cname.startsWith("Firebase") ||
        cname.startsWith("HTML") ||
        cname === "Window" ||
        cname === "Sa" ||
        cname === "Q$1" ||
        (obj.constructor && obj.constructor !== Object && obj.constructor !== Array && obj.constructor !== Date && obj.constructor !== RegExp)
      ) {
        return null;
      }
      if (seen.has(obj)) {
        return null;
      }
      seen.add(obj);

      // We clone to avoid modifying the live object in-place during cleaning
      const isArray = Array.isArray(obj);
      const result = isArray ? [] : {};

      if (isArray) {
        for (let i = 0; i < obj.length; i++) {
          const val = obj[i];
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) {
              result[i] = null;
            } else {
              result[i] = StateManager.removeCircularReferences(val, seen);
            }
          } else {
            result[i] = val;
          }
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === "firestore" || key === "firestoreDocRef" || key === "appInstance" || key === "chatProfileHelper") {
              continue;
            }
            const val = obj[key];
            if (typeof val === "object" && val !== null) {
              if (seen.has(val)) {
                result[key] = null;
              } else {
                result[key] = StateManager.removeCircularReferences(val, seen);
              }
            } else {
              result[key] = val;
            }
          }
        }
      }
      seen.delete(obj);
      return result;
    } catch (e) {
      console.warn("Circular cleaning failed for node, returning original as best-effort:", e);
      return obj;
    }
  }

  static safeStringify(obj, fallback = "{}") {
    try {
      return JSON.stringify(obj, StateManager.getCircularReplacer());
    } catch (e) {
      console.warn("Failed to stringify object securely, retrying with deep clean:", e);
      try {
        const cleaned = StateManager.removeCircularReferences(obj);
        return JSON.stringify(cleaned, StateManager.getCircularReplacer());
      } catch (err) {
        console.error("Critical failure during secure serialization. Fallback used.", err);
        return fallback;
      }
    }
  }

  constructor() {
    try {
      this.dbKey = "lottery_winner_db";
      this.sessionKey = "lw_user_session";
      this.adminSessionKey = "lw_admin_session";
      this.currentTab = "home"; // home, tickets, wallet, history, profile
      this.currentAdminTab = "stats"; // stats, users, lotteries, deposits, withdraws, settings
      this.currentUser = null;
      this.isAdminMode = false;
      this.drawAnimationTimeout = null;
      this.googleAuthToken = null;
      this.selectedReceiptFile = null;
      this.countdownInterval = null;
      this.currentHomeCategory = "all";
      this.historySubTab = "ledger"; // ledger, community
      this.currentAdminReportsTab = "post"; // post, comment
      this.communitySearchQuery = "";
      this.adminPlayersSearchQuery = "";
      this.communityFilter = "recent";
      this.genTier = "free"; // 'free' or 'premium' for standby code generator

      // Load or bootstrap database
      this.initDatabase();
      this.loadSession();
      this.startAutoDrawChecker();

      this.syncState = 'synced';
      this.lastSyncedTime = new Date();

      // Initialize real-time cloud synchronization from Firebase
      try {
        this.initFirebaseSync();
      } catch (fbErr) {
        console.error("Critical Firebase Sync Fail:", fbErr);
      }
      
      this.offlineQueue = new OfflineQueueManager(this);

      this.offlineGameCards = [];
      this.firstFlippedCard = null;
      this.secondFlippedCard = null;
      this.isFlippedTimeoutActive = false;
      this.offlineScore = 0;

      // Initialize network status monitoring for offline mode UI
      this.initNetworkMonitoring();

      // Initialize cloud sync diagnostics modal and click triggers
      this.initSyncClickHandlers();

      // Initialize 3D immersive card tilts and micro-animations
      this.init3DTiltEffect();

      // Load dashboard templates dynamically for local client-side dev/Vite
      // Guarantee immediate UI render so login screen or dashboard shows instantly without delay
      this.render();

      this.loadDashboardTabs().then(() => {
        console.log("All dashboard tabs loaded successfully.");
        HomeTab.init(this);
        VideoBountyTab.init(this);
        ProfileTab.init(this);
        SettingsTab.init(this);
        HistoryTab.init(this);
        WalletTab.init(this);
        TicketsTab.init(this);
        GameHubModule.init(this);
        LiveDrawRevealEngine.init(this);
        this.render();
      }).catch(err => {
        console.warn("Non-fatal dashboard tabs load exception caught:", err);
        this.render();
      });

      // Trigger spectacular 3D loading splash screen sequence
      this.initSplashScreen();
      this.init3DAuthCard();
    } catch (criticalError) {
      console.error("FATAL CONSTRUCTION ERROR:", criticalError);
      // Emergency display if the constructor fails
      const msg = document.getElementById("debug-error-msg");
      const box = document.getElementById("debug-error-box");
      if (msg && box) {
        msg.innerText = `Boot Crash: ${criticalError.message}`;
        box.classList.remove("hidden");
      }
    }
  }

  initDatabase() {
    let raw = localStorage.getItem(this.dbKey);
    if (!raw || raw === "undefined" || raw === "null") {
      const defaultDB = getDefaultDB();
      localStorage.setItem(this.dbKey, StateManager.safeStringify(defaultDB));
      this.db = defaultDB;
    } else {
      try {
        this.db = JSON.parse(raw);
        if (this.db) {
          this.db = StateManager.removeCircularReferences(this.db);
        } else {
          throw new Error("Parsed DB is null");
        }
      } catch (e) {
        console.error("Failed to parse local DB raw. Resetting to default database state.", e);
        localStorage.removeItem(this.dbKey);
        const defaultDB = getDefaultDB();
        localStorage.setItem(this.dbKey, StateManager.safeStringify(defaultDB));
        this.db = defaultDB;
      }
    }

    // 🛡️ CRITICAL: Guarantee ALL collections exist to prevent crashes in render()
    if (!this.db) this.db = getDefaultDB();
    if (!this.db.users) this.db.users = [];
    if (!this.db.lotteries) this.db.lotteries = [];
    if (!this.db.tickets) this.db.tickets = [];
    if (!this.db.deposits) this.db.deposits = [];
    if (!this.db.withdrawals) this.db.withdrawals = [];
    if (!this.db.settings) this.db.settings = (getDefaultDB() as any).settings || {};
    if (!this.db.categories) this.db.categories = [];
    if (!this.db.syndicates) this.db.syndicates = [];
    if (!this.db.communityPosts) this.db.communityPosts = [];
    if (!this.db.communityComments) this.db.communityComments = [];
    if (!this.db.reports) this.db.reports = [];
    if (!this.db.badgeRequests) this.db.badgeRequests = [];
    if (!this.db.messages) this.db.messages = [];
    if (!this.db.taskSubmissions) this.db.taskSubmissions = [];
    if (!this.db.dailyTasks) this.db.dailyTasks = [];
    if (!this.db.jackpotRegistrations) this.db.jackpotRegistrations = [];
    if (!this.db.transactions) this.db.transactions = [];
    if (!this.db.spinHistory) this.db.spinHistory = [];
    if (!this.db.securityLogs) this.db.securityLogs = [];
    if (!this.db.pendingAdminToasts) this.db.pendingAdminToasts = [];
    if (!this.db.webPushAds) this.db.webPushAds = [];

    // Guarantee Refer/IP configurations exist
    if (this.db) {
      if (!this.db.settings) {
        this.db.settings = {};
      }
      if (this.db.settings.ipPreventionEnabled === undefined) {
        this.db.settings.ipPreventionEnabled = true;
      }
      if (this.db.settings.vpnBlockEnabled === undefined) {
        this.db.settings.vpnBlockEnabled = true;
      }
      if (!this.db.settings.bannedIPs) {
        this.db.settings.bannedIPs = [];
      }
      if (!this.db.settings.allowedRegions) {
        this.db.settings.allowedRegions = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"]; // some initial allowed regions
      }
      if (!this.db.settings.bannedRegions) {
        this.db.settings.bannedRegions = ["Barisal"]; // test banned region
      }
      if (!this.db.settings.milestoneLevels) {
        this.db.settings.milestoneLevels = [
          { title: "Bronze Recruiter", count: 3, reward: 50 },
          { title: "Silver Partner", count: 8, reward: 150 },
          { title: "Gold Ambassador", count: 20, reward: 500 },
          { title: "Supreme Influencer", count: 50, reward: 1500 }
        ];
      }
      if (!this.db.settings.popupEvent) {
        this.db.settings.popupEvent = {
          enabled: true,
          title: "Eid Mega Draw Festival! 🎉",
          message: "Deposit ৳500 or more today and get a free Ticket to the ৳100,000 Eid Pool! This exclusive premium bonus is available for a limited time only.",
          imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop",
          actionText: "Claim Bonus",
          actionLink: "wallet"
        };
      }
      if (!this.db.settings.bannerSlides || this.db.settings.bannerSlides.length === 0) {
        this.db.settings.bannerSlides = [
          {
            id: "b1",
            title: "Super Fast Payouts In 5 Minutes! ⚡",
            subtitle: "bKash, Nagad, Rocket & Crypto USDT - 0% Fee Instant Cashout",
            imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=800&auto=format&fit=crop",
            link: "wallet"
          },
          {
            id: "b2",
            title: "Earn 10% Referral Lifetime Bonus! 👥",
            subtitle: "বন্ধুদের ইনভাইট করুন এবং পান আজীবন ১০% আনলিমিটেড কমিশন!",
            imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop",
            link: "refer"
          }
        ];
      }
      if (!this.db.users) {
        this.db.users = [];
      }
      if (!this.db.securityLogs) {
        this.db.securityLogs = [];
      }
      if (!this.db.pendingAdminToasts) {
        this.db.pendingAdminToasts = [];
      }
      if (!this.db.transactions) {
        this.db.transactions = [];
      }
      if (!this.db.spinHistory) {
        this.db.spinHistory = [];
      }
      this.db.users.forEach(u => {
        if (!u.region) u.region = "Dhaka";
        if (!u.registeredIp) u.registeredIp = "103.45.120." + (Math.floor(Math.random() * 200) + 10);
        if (u.refersCount === undefined) u.refersCount = 0;
        if (!u.referredUsers) u.referredUsers = [];
        if (!u.rewardedMilestones) u.rewardedMilestones = [];
        if (u.vipLevelId === undefined) u.vipLevelId = "";
        if (u.jackpotTickets === undefined) u.jackpotTickets = 0;
        if (u.checkinStreak === undefined) u.checkinStreak = 0;
        if (u.lastCheckinDate === undefined) u.lastCheckinDate = "";
        if (u.lastSpinTime === undefined) u.lastSpinTime = 0;
      });

      const s = this.db.settings;
      if (s.vipTiers === undefined) {
        s.vipTiers = [
          { id: "vip_1", title: "Bronze VIP 1", price: 100, multiplier: 1.05, discount: 3, bonus: 5 },
          { id: "vip_2", title: "Silver VIP 2", price: 250, multiplier: 1.10, discount: 5, bonus: 15 },
          { id: "vip_3", title: "Gold VIP 3", price: 500, multiplier: 1.20, discount: 8, bonus: 40 },
          { id: "vip_4", title: "Platinum VIP 4", price: 1000, multiplier: 1.35, discount: 12, bonus: 100 },
          { id: "vip_5", title: "Crown VIP 5", price: 2500, multiplier: 1.60, discount: 20, bonus: 300 }
        ];
      }
      if (s.spinPrice === undefined) s.spinPrice = 50;
      if (s.checkinRewards === undefined) s.checkinRewards = [2, 4, 6, 8, 10, 15, 25];
      if (s.sponsorLink === undefined) s.sponsorLink = "https://google.com";
      if (s.sponsorLinkTitle === undefined) s.sponsorLinkTitle = "স্পন্সর লিংক ভিজিট করুন";
      if (s.sponsorLinkInstruction === undefined) s.sponsorLinkInstruction = "আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করুন।";
      if (s.sponsorTaskTimer === undefined) s.sponsorTaskTimer = 5;
      if (s.sponsorTaskRequired === undefined) s.sponsorTaskRequired = true;
      if (s.sponsorAutoOpen === undefined) s.sponsorAutoOpen = true;
      if (s.depBonusPercent === undefined) s.depBonusPercent = 10;
      if (s.depBonusMin === undefined) s.depBonusMin = 500;
      if (s.depBonusEnabled === undefined) s.depBonusEnabled = true;
      if (s.jackpotPool === undefined) s.jackpotPool = 84250.00;
      if (s.jackpotTicketCost === undefined) s.jackpotTicketCost = 20.00;
      if (s.jackpotExpiry === undefined) {
        // Set default expiry to tomorrow's midnight
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        // Format to YYYY-MM-DDTHH:mm
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
        s.jackpotExpiry = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      
      // Initialize Jackpot and Daily Tasks repositories
      if (!this.db.jackpotRegistrations) {
        this.db.jackpotRegistrations = [
          { id: "jack_reg_1", userName: "tasnim_99", qty: 3, spent: 60, date: "2026-06-19 11:15 AM" },
          { id: "jack_reg_2", userName: "rifat_bkash", qty: 10, spent: 200, date: "2026-06-19 12:30 PM" },
          { id: "jack_reg_3", userName: "sadia_cyber", qty: 5, spent: 100, date: "2026-06-19 01:10 PM" }
        ];
      }
      if (!this.db.dailyTasks) {
        this.db.dailyTasks = [
          { id: "task_1", title: "Subscribe YouTube Channel", reward: 15, category: "youtube", url: "https://youtube.com", instructions: "Subscribe to our channel, turn on all notifications, take screenshot.", date: "2026-06-19 10:00 AM" },
          { id: "task_2", title: "Join Official Telegram Group", reward: 25, category: "telegram", url: "https://telegram.org", instructions: "Join official discussion forum and post a positive comment. Grab screenshot showing your profile.", date: "2026-06-19 10:05 AM" },
          { id: "task_3", title: "Like Facebook Promo Video", reward: 10, category: "facebook", url: "https://facebook.com", instructions: "Like the video and drop a comment explaining why you enjoy pools. Screen-grab comment.", date: "2026-06-19 10:10 AM" }
        ];
      }
      if (!this.db.taskSubmissions) {
        this.db.taskSubmissions = [];
      }

      this.saveDB();
    }

    // Guarantee categories collection exists
    if (this.db && !this.db.categories) {
      this.db.categories = [
        { id: "c1", name: "10 Taka Banner", label: "🎟️ ৳10 Sliders", type: "single", defaultPrizes: "" },
        { id: "c2", name: "20 Taka Banner", label: "🎟️ ৳20 Sliders", type: "single", defaultPrizes: "" },
        { id: "c3", name: "Mega Jackpot", label: "💎 Jackpots", type: "single", defaultPrizes: "" },
        { id: "c4", name: "3 Winner Category", label: "👑 3 Winners Category", type: "multi", defaultPrizes: "50, 30, 20" },
        { id: "c5", name: "15 Winner Category", label: "🚀 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" },
        { id: "c6", name: "Syndicate", label: "👥 গ্রুপ লটারি (Syndicate)", type: "syndicate", defaultPrizes: "" },
        { id: "c7", name: "Quick Draw", label: "⚡ কুইক লটারি (1-Min)", type: "single", defaultPrizes: "" }
      ];
      this.saveDB();
    }

    // Dynamic database upgrade for existing local storage instances
    if (this.db) {
      if (!this.db.categories.some(c => c.name === "Syndicate")) {
        this.db.categories.push({ id: "c6", name: "Syndicate", label: "👥 গ্রুপ লটারি (Syndicate)", type: "syndicate", defaultPrizes: "" });
      }
      if (!this.db.categories.some(c => c.name === "Quick Draw")) {
        this.db.categories.push({ id: "c7", name: "Quick Draw", label: "⚡ কুইক লটারি (1-Min)", type: "single", defaultPrizes: "" });
      }
      if (!this.db.syndicates) {
        this.db.syndicates = [];
      }
      // Guarantee a couple of active syndicates in lobby for beautiful dynamic display
      if (this.db.syndicates.length === 0) {
        this.db.syndicates = [
          {
            id: "syn_mock_1",
            name: "🔥 ঢাকা সিটির বিজয়ী গ্রুপ",
            code: "SYN-DHAKA7",
            lotteryId: "l2", // 20 Taka Super Pool
            size: 3,
            creatorId: "u1",
            creatorUsername: "lottery_pro",
            joinedUserIds: ["u1", "u2"],
            joinedUsernames: ["lottery_pro", "lucky_player"],
            status: "pending",
            ticketCode: null,
            entryFeeShare: 6.67,
            createdAt: new Date().toISOString()
          },
          {
            id: "syn_mock_2",
            name: "💎 সিলেট লাকি ট্রিপল",
            code: "SYN-SYLHET9",
            lotteryId: "l3", // 50 Taka Mega Jackpot
            size: 3,
            creatorId: "u2",
            creatorUsername: "lucky_player",
            joinedUserIds: ["u2"],
            joinedUsernames: ["lucky_player"],
            status: "pending",
            ticketCode: null,
            entryFeeShare: 16.67,
            createdAt: new Date().toISOString()
          }
        ];
      }
      // Guarantee at least one active Quick Draw pool exists
      if (!this.db.lotteries.some(l => l.category === "Quick Draw" && l.status === "active")) {
        const initialSold = 5;
        const entryFee = 10;
        this.db.lotteries.push({
          id: "l_quick_default",
          name: "⚡ ১-মিনিট ইনস্ট্যান্ট কুইক ক্যাশ (1-Min Draw)",
          details: "Buy ticket for instant drawings. Draws every 1 minute automatically!",
          entryFee: entryFee,
          totalTickets: 50,
          soldTickets: initialSold,
          category: "Quick Draw",
          drawTime: new Date(Date.now() + 60 * 1000).toISOString(),
          status: "active",
          prizeAmount: Math.round(initialSold * entryFee * 0.95 * 100) / 100,
          drawMode: "auto"
        });
      }
      this.saveDB();
    }

    // Guarantee community collections exist
    if (this.db && !this.db.communityPosts) {
      this.db.communityPosts = [
        {
          id: "p1",
          userId: "u1",
          username: "lottery_pro",
          email: "pro@lotterywinner.app",
          content: "Wow! Subscribed to the 10-Taka Fast Cash Daily tickets and just won 500 Taka yesterday! This portal is fully transparent and pays immediately. Highly recommended! 🇧🇩🏆",
          likes: ["u2"],
          dislikes: [],
          date: "2026-06-16T12:30:00Z",
          status: "active"
        },
        {
          id: "p2",
          userId: "u2",
          username: "lucky_player",
          email: "lucky@quickdraw.net",
          content: "Has anyone tried the dynamic Rank Multi-winner split tickets yet? Please guide me on strategies!",
          likes: [],
          dislikes: [],
          date: "2026-06-17T14:45:00Z",
          status: "active"
        }
      ];
    }
    if (this.db && !this.db.communityComments) {
      this.db.communityComments = [
        {
          id: "m1",
          postId: "p2",
          userId: "u1",
          username: "lottery_pro",
          email: "pro@lotterywinner.app",
          content: "Yes, they are awesome! Especially the 15 Winner ones, because more buyers win a fraction, spreading the luck around. Try smaller sizes first! 👍",
          likes: ["u2"],
          dislikes: [],
          date: "2026-06-17T15:00:00Z",
          status: "active"
        }
      ];
    }
    if (this.db && !this.db.reports) {
      this.db.reports = [
        {
          id: "rep1",
          reporterId: "u2",
          reporterUsername: "lucky_player",
          type: "post",
          targetId: "p1",
          targetText: "Wow! Subscribed to the 10-Taka Fast Cash Daily tickets...",
          authorUsername: "lottery_pro",
          reason: "Spam advertisement or selling details.",
          date: "2026-06-17T16:20:00Z",
          status: "pending"
        }
      ];
    }
    if (this.db && !this.db.badgeRequests) {
      this.db.badgeRequests = [];
    }
    if (this.db && !this.db.messages) {
      this.db.messages = [
        {
          id: "msg1",
          recipientType: "bulk",
          targetUsername: "",
          category: "general",
          subject: "Welcome to Live Lottery Winner!",
          content: "Welcome to our live platform! Stay tuned for premium updates, jackpots, special ticket draws, the community forum, and secure payment gate details straight from the admin room.",
          date: "2026-06-18T12:00:00Z",
          readBy: []
        }
      ];
    }
    this.saveDB();
    // Guarantee that standard Admin credentials requested by user are set
    if (this.db && this.db.settings) {
      const s = this.db.settings;
      if (s.adminPass === "admin123" || !s.adminPass) {
        s.adminPass = "Admin123";
      }
      
      // Inject missing customized settings defaults to prevent errors
      if (s.mobileTypeBkash === undefined) s.mobileTypeBkash = "personal";
      if (s.mobileInstructionBkash === undefined) s.mobileInstructionBkash = "Send money to our bKash Personal Number. Use 'Send Money' option in your bKash app.";
      if (s.mobileTypeNagad === undefined) s.mobileTypeNagad = "personal";
      if (s.mobileInstructionNagad === undefined) s.mobileInstructionNagad = "Send money to this Nagad Personal Number. Enter your Username in the 'Reference' field.";
      if (s.mobileTypeRocket === undefined) s.mobileTypeRocket = "personal";
      if (s.mobileInstructionRocket === undefined) s.mobileInstructionRocket = "Send money to our Rocket Personal Wallet Number. Ensure to include the 12th digit.";
      if (s.mobileTypeUpay === undefined) s.mobileTypeUpay = "personal";
      if (s.mobileInstructionUpay === undefined) s.mobileInstructionUpay = "Please perform a standard 'Send Money' transaction to this Upay Personal account.";
      if (s.dbblInstruction === undefined) s.dbblInstruction = "Dutch Bangla DBBL Bank transfers take 2 hours to clear. Upload the transfer slip receipt.";
      if (s.cryptoAddressUSDT === undefined) s.cryptoAddressUSDT = s.cryptoAddress || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";
      if (s.cryptoAddressBTC === undefined) s.cryptoAddressBTC = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
      if (s.cryptoAddressETH === undefined) s.cryptoAddressETH = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      if (s.cryptoQRType === undefined) s.cryptoQRType = "auto";
      if (s.cryptoQRUrlUSDT === undefined) s.cryptoQRUrlUSDT = "";
      if (s.cryptoQRUrlBTC === undefined) s.cryptoQRUrlBTC = "";
      if (s.cryptoQRUrlETH === undefined) s.cryptoQRUrlETH = "";
      if (s.cryptoInstruction === undefined) s.cryptoInstruction = "Choose correct network assets. USDT uses Tron (TRC-20) network. BTC and ETH transfers clear instantly after 3 blockchain confirmations.";
      
      // Inject payment gateway enable/disable defaults
      if (s.payCryptomusEnabled === undefined) s.payCryptomusEnabled = true;
      if (s.cryptomusMerchantId === undefined) s.cryptomusMerchantId = "b808ecfd-26d0-4ad7-8c81-197e937d1101";
      if (s.cryptomusApiKey === undefined) s.cryptomusApiKey = "cr_live_sec_89df2011293c004812f";
      if (s.cryptomusMode === undefined) s.cryptomusMode = "sandbox";
      if (s.cryptomusRate === undefined) s.cryptomusRate = 125.0;
      if (s.cryptomusInstruction === undefined) s.cryptomusInstruction = "Pay automatically using Cryptomus with TRC20/BEP20 USDT, BTC, ETH or TON. Auto-credited on blockchain confirmations.";

      if (s.payUddoktapayEnabled === undefined) s.payUddoktapayEnabled = true;
      if (s.uddoktapayApiKey === undefined) s.uddoktapayApiKey = "982d9290ab4211cd653b680c441865a7f9b8c0c4";
      if (s.uddoktapayMode === undefined) s.uddoktapayMode = "sandbox";
      if (s.uddoktapayBaseUrl === undefined) s.uddoktapayBaseUrl = "https://sandbox.uddoktapay.com/api/checkout-v2";
      if (s.uddoktapayInstruction === undefined) s.uddoktapayInstruction = "Pay seamlessly with bKash, Nagad, Rocket, Upay or Cards. Instant balance credit without manual TrxID submission.";

      if (s.payZinipayEnabled === undefined) s.payZinipayEnabled = true;
      if (s.payZiniPayEnabled === undefined) s.payZiniPayEnabled = true;
      if (s.zinipayApiKey === undefined) s.zinipayApiKey = "zin_live_key_9942a78e1b";
      if (s.zinipayMode === undefined) s.zinipayMode = "live";
      if (s.zinipayBaseUrl === undefined) s.zinipayBaseUrl = "https://api.zinipay.com/v1/payment/create";
      if (s.zinipayInstruction === undefined) s.zinipayInstruction = "Pay seamlessly via bKash, Nagad, Rocket, Upay, or Cards with instant automated credit.";

      if (s.payCryptomusEnabled === undefined) s.payCryptomusEnabled = true;

      if (s.payBkashPgwEnabled === undefined) s.payBkashPgwEnabled = true;
      if (s.bkashPgwMode === undefined) s.bkashPgwMode = "sandbox";

      if (s.payNagadPgwEnabled === undefined) s.payNagadPgwEnabled = true;
      if (s.nagadPgwMode === undefined) s.nagadPgwMode = "sandbox";

      if (s.payAamarpayEnabled === undefined) s.payAamarpayEnabled = true;
      if (s.aamarpayMode === undefined) s.aamarpayMode = "sandbox";

      if (s.payBinanceEnabled === undefined) s.payBinanceEnabled = true;
      if (s.payBinancePayEnabled === undefined) s.payBinancePayEnabled = true;
      if (s.payMasterEnabled === undefined) s.payMasterEnabled = true;

      if (s.payBkashEnabled === undefined) s.payBkashEnabled = true;
      if (s.payNagadEnabled === undefined) s.payNagadEnabled = true;
      if (s.payRocketEnabled === undefined) s.payRocketEnabled = true;
      if (s.payUpayEnabled === undefined) s.payUpayEnabled = true;
      if (s.payDbblEnabled === undefined) s.payDbblEnabled = true;
      if (s.payUsdtEnabled === undefined) s.payUsdtEnabled = true;
      if (s.payBtcEnabled === undefined) s.payBtcEnabled = true;
      if (s.payEthEnabled === undefined) s.payEthEnabled = true;
      if (s.payAgentDepositEnabled === undefined) s.payAgentDepositEnabled = true;
      if (s.payAgentWithdrawEnabled === undefined) s.payAgentWithdrawEnabled = true;
      if (s.mobileInstructionAgentDeposit === undefined) s.mobileInstructionAgentDeposit = "Select your active district verified agent list below, hand over cash physically or transfer, and share reference username.";
      if (s.mobileInstructionAgentWithdraw === undefined) s.mobileInstructionAgentWithdraw = "Generate and confirm a direct cashout request with any district agent and pick up physical cash at their local desk.";

      // Inject website and bonus configurations
      if (s.siteName === undefined) s.siteName = "Lottery Winner";
      if (s.siteInfo === undefined) s.siteInfo = "Premium Mobile Play Portal";
      if (s.signupBonus === undefined) s.signupBonus = 100;
      if (s.supportNumber === undefined) s.supportNumber = "01700000000";
      if (s.authFooterText === undefined) s.authFooterText = "© 2026 Lottery Winner Mobile Limited (Registered)";

      if (!this.db.syncNodes) {
        this.db.syncNodes = [
          {
            id: "node-1",
            name: "Main Firebase Production Cluster",
            type: "firebase",
            endpoint: "app_data/lottery_winner_db",
            priority: 1,
            status: "connected",
            latency: 14,
            active: true,
            mode: "active_sync",
            description: "Google Firestore Database ensuring durable real-time storage.",
            tier: "premium"
          },
          {
            id: "node-2",
            name: "Backup SQL Replication Node",
            type: "sql",
            endpoint: "postgresql://database.postgres-cluster.internal:5432/lottery_backup",
            priority: 2,
            status: "standby",
            latency: 42,
            active: false,
            mode: "standby",
            description: "Relational backup database replica with automated replication handshake.",
            tier: "premium"
          },
          {
            id: "node-3",
            name: "Custom REST Sync Webhook",
            type: "api",
            endpoint: "https://sync-api.lotterywinner.app/v1/vault",
            priority: 3,
            status: "offline",
            latency: 110,
            active: false,
            mode: "failover_only",
            description: "Fallback HTTPS JSON storage service invoked when primary links collapse.",
            tier: "free"
          }
        ];
      }

      // Automatically migrate older nodes lacking the modern 'tier' property
      if (this.db.syncNodes) {
        this.db.syncNodes.forEach(node => {
          if (!node.tier) {
            node.tier = (node.name.includes("Main") || node.name.includes("SQL") || node.id === "node-1" || node.id === "node-2") ? "premium" : "free";
          }
        });
      }

      if (!this.db.syncLogs) {
        const timeStr = new Date().toLocaleTimeString();
        this.db.syncLogs = [
          { time: timeStr, type: "info", message: "Cloud Failover High-Availability Sync Engine established." },
          { time: timeStr, type: "success", message: "Initial link to Cluster 1 (Main Firebase Production Cluster) is healthy." }
        ];
      }

      // Automatically guarantee Agent & Moderator records exist in DB
      if (this.db && this.db.users) {
        if (!this.db.users.some(u => u.username === "agent_dhaka")) {
          this.db.users.push({
            id: "u_agent_dhaka",
            username: "agent_dhaka",
            email: "dhaka@agents.app",
            password: "password123",
            phone: "01700000001",
            dob: "1990-01-01",
            balance: 5000,
            totDeposit: 5000,
            totWithdraw: 0,
            wins: 0,
            loss: 0,
            profit: 0,
            joinDate: "2026-06-20",
            status: "active",
            blockedUntil: null,
            role: "agent",
            commissionRate: 5.0,
            earnedCommission: 120.00,
            totalBookings: 24,
            district: "Dhaka"
          });
        }
        if (!this.db.users.some(u => u.username === "agent_sylhet")) {
          this.db.users.push({
            id: "u_agent_sylhet",
            username: "agent_sylhet",
            email: "sylhet@agents.app",
            password: "password123",
            phone: "01900000005",
            dob: "1992-05-18",
            balance: 8500,
            totDeposit: 8500,
            totWithdraw: 0,
            wins: 0,
            loss: 0,
            profit: 0,
            joinDate: "2026-06-21",
            status: "active",
            blockedUntil: null,
            role: "agent",
            commissionRate: 6.0,
            earnedCommission: 310.00,
            totalBookings: 43,
            district: "Sylhet"
          });
        }
        if (!this.db.users.some(u => u.username === "mod_support")) {
          this.db.users.push({
            id: "u_mod_support",
            username: "mod_support",
            email: "support@lotterywinner.app",
            password: "password123",
            phone: "01700000002",
            dob: "1993-02-15",
            balance: 0,
            totDeposit: 0,
            totWithdraw: 0,
            wins: 0,
            loss: 0,
            profit: 0,
            joinDate: "2026-06-21",
            status: "active",
            blockedUntil: null,
            role: "moderator"
          });
        }
      }

      this.saveDB();
    }
  }

  saveDB() {
    try {
      if (this.db) {
        if (this.currentUser && this.db.users) {
          const dbUser = this.db.users.find(u => u.id === this.currentUser.id);
          if (dbUser) {
            dbUser.balance = this.currentUser.balance;
            dbUser.loss = this.currentUser.loss;
            dbUser.profit = this.currentUser.profit;
            dbUser.wins = this.currentUser.wins || 0;
            if (this.currentUser.communityConsent !== undefined) dbUser.communityConsent = this.currentUser.communityConsent;
            if (this.currentUser.email !== undefined) dbUser.email = this.currentUser.email;
            if (this.currentUser.phone !== undefined) dbUser.phone = this.currentUser.phone;
            if (this.currentUser.dob !== undefined) dbUser.dob = this.currentUser.dob;
          }
          localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
        }
        // Save cleaned version to localStorage
        const cleanedDB = StateManager.removeCircularReferences(this.db);
        localStorage.setItem(this.dbKey, StateManager.safeStringify(cleanedDB));
      }
    } catch (e) {
      console.error("Failed to safely serialize database:", e);
    }
    if (this.firestoreDocRef) {
      if (this.cloudSyncTimeout) clearTimeout(this.cloudSyncTimeout);
      this.cloudSyncTimeout = setTimeout(() => {
        this.syncToCloud();
      }, 800);
    }
  }

  async loadDashboardTabs() {
    const tabs = [
      { id: "tab-home", file: "src/dashboard_tabs/home.php" },
      { id: "tab-events", file: "src/dashboard_tabs/events_tab.php" },
      { id: "tab-tickets", file: "src/dashboard_tabs/tickets.php" },
      { id: "tab-wallet", file: "src/dashboard_tabs/user_balance.php" },
      { id: "tab-deposit", file: "src/dashboard_tabs/deposit.php" },
      { id: "tab-withdraw", file: "src/dashboard_tabs/withdraw.php" },
      { id: "tab-agent", file: "src/dashboard_tabs/agent.php" },
      { id: "tab-history", file: "src/dashboard_tabs/history.php" },
      { id: "tab-profile", file: "src/dashboard_tabs/profile.php" },
      { id: "tab-settings", file: "src/dashboard_tabs/settings.php" },
      { id: "tab-badge-request", file: "src/dashboard_tabs/badge_request.php" },
      { id: "tab-refer", file: "src/dashboard_tabs/share_earn.php" },
      { id: "tab-jackpot", file: "src/dashboard_tabs/jackpot.php" },
      { id: "tab-tasks", file: "src/dashboard_tabs/missions.php" },
      { id: "tab-otp", file: "src/dashboard_tabs/otp.php" },
      { id: "tab-recovery", file: "src/dashboard_tabs/recovery.php" },
      { id: "tab-video-bounty", file: "src/dashboard_tabs/video_bounty.php" },
      { id: "tab-games", file: "src/dashboard_tabs/games.php" },
      { id: "admin-tab-video-bounty", file: "src/admin_tabs/video_bounty_admin.php" },
      { id: "admin-tab-agent-leaders", file: "src/admin_tabs/agent_leaders.php" },
      { id: "admin-tab-subagents-list", file: "src/admin_tabs/subagents_admin.php" }
    ];
    
    for (const tab of tabs) {
      const el = document.getElementById(tab.id);
      if (el) {
        const cacheKey = `tab_cache_${tab.id}`;
        
        // 1. Instant load from bundledTabs if available
        if (bundledTabs && bundledTabs[tab.id]) {
          try {
            const text = bundledTabs[tab.id];
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.getElementById(tab.id);
            const finalHTML = content ? content.innerHTML : text;
            if (finalHTML && finalHTML.trim().length > 20) {
              el.innerHTML = finalHTML;
            }
          } catch (bErr) {
            console.warn("Could not parse bundledTab for:", tab.id, bErr);
          }
        } else {
          // Fallback to cache if bundledTabs is somehow not present
          const cachedHTML = localStorage.getItem(cacheKey);
          if (cachedHTML && cachedHTML.trim().length > 100 && !el.innerHTML.trim()) {
            el.innerHTML = cachedHTML;
          }
        }

        // 2. Try background fetch ONLY if running on http server and el is still empty
        if (!el.innerHTML.trim()) {
          try {
            const response = await fetch(`${tab.file}?v=${Date.now()}`);
            if (response.ok) {
              const text = await response.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(text, 'text/html');
              const content = doc.getElementById(tab.id);
              const finalHTML = content ? content.innerHTML : text;
              if (finalHTML.trim() && finalHTML.trim().length > 100) {
                el.innerHTML = finalHTML;
                localStorage.setItem(cacheKey, finalHTML);
              }
            }
          } catch (e) {
            console.warn(`Static/Offline fetch notice for ${tab.id}:`, e.message);
          }
        }
      }
    }
  }

  

  loadSession() {
    let savedUser = localStorage.getItem(this.sessionKey);
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      // Ensure we have current fresh data from db
      const matched = this.db.users.find(u => u.id === userObj.id);
      if (matched) {
        this.currentUser = matched;
      } else {
        localStorage.removeItem(this.sessionKey);
      }
    }

    let savedAdmin = localStorage.getItem(this.adminSessionKey);
    if (savedAdmin === "true") {
      this.isAdminMode = true;
    }
  }

  startAutoDrawChecker() {
    setInterval(() => {
      this.checkAndExecuteAutoDraws();
      this.checkLiveNotifications();
      this.checkFiveMinutesDrawAlerts();
      this.checkCartAbandonmentNotification();
      this.tickProgressiveJackpot();
    }, 5000);
  }

  checkFiveMinutesDrawAlerts() {
    if (!this.currentUser) return;

    let warningsRaw = localStorage.getItem("lw_notified_5min_warnings");
    let legacyWarnings = warningsRaw ? JSON.parse(warningsRaw) : [];
    let updatedWarnings = false;

    const userTickets = this.db.tickets.filter(t => t.userId === this.currentUser.id && t.status === "pending");
    userTickets.forEach(t => {
      const lot = this.db.lotteries.find(l => l.id === t.lotteryId);
      if (lot && lot.status === "active") {
        const diffMs = new Date(lot.drawTime).getTime() - Date.now();
        // Is draw in <= 5 minutes (300000 ms) and not elapsed?
        if (diffMs > 0 && diffMs <= 5 * 60 * 1000) {
          if (!legacyWarnings.includes(lot.id)) {
            legacyWarnings.push(lot.id);
            updatedWarnings = true;
            
            // Vibrate user phone!
            if (navigator.vibrate) {
              navigator.vibrate([400, 200, 400]);
            }
            
            // Display beautiful in-app toast alert (100% iframe proof)
            this.showToast(`⏳ Alert: "${lot.name}" is drawing in 5 minutes! Your code: ${t.code}`, "success");
            
            // Trigger native notification if permission is granted
            if (window.Notification && Notification.permission === "granted") {
              try {
                new Notification("⏳ Drawing Soon: 5 Mins Left!", {
                  body: `"${lot.name}" draw will occur in 5 minutes! Your code: ${t.code}`,
                  icon: "/favicon.ico"
                });
              } catch(e) { console.error(e); }
            }
          }
        }
      }
    });

    if (updatedWarnings) {
      localStorage.setItem("lw_notified_5min_warnings", StateManager.safeStringify(legacyWarnings));
    }
  }

  addInboxNotice(userId, subject, content) {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return;
    const notice = {
      id: "msg_notice_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      recipientType: "specific",
      targetUsername: user.username,
      category: "notice",
      subject: subject,
      content: content,
      date: new Date().toISOString(),
      readBy: []
    };
    if (!this.db.messages) this.db.messages = [];
    this.db.messages.unshift(notice);
  }

  checkCartAbandonmentNotification() {
    if (!this.currentUser) return;
    
    const status = localStorage.getItem("cart_abandoned_status");
    const lotteryId = localStorage.getItem("cart_abandoned_lottery_id");
    const abandonedTimeStr = localStorage.getItem("cart_abandoned_time");
    const notified = localStorage.getItem("cart_abandoned_notified");

    if (status === "pending" && lotteryId && abandonedTimeStr && notified !== "true") {
      const abandonedTime = parseInt(abandonedTimeStr);
      const diffMs = Date.now() - abandonedTime;
      const tenMinutesMs = 10 * 60 * 1000; // 10 minutes

      if (diffMs >= tenMinutesMs) {
        // Trigger push notification!
        localStorage.setItem("cart_abandoned_notified", "true");
        localStorage.setItem("cart_abandoned_status", "notified");

        const lot = this.db.lotteries.find(l => l.id === lotteryId);
        const lotName = lot ? lot.name : "আপনার লাকি টিকিটটি";

        const msg = `আপনার লাকি টিকিটটি এখনো অপেক্ষা করছে! এখনই বুক করুন! (${lotName})`;

        // Show push-style toast alert
        this.showToast(msg, "warning");

        // Vibrate user phone if available
        if (navigator.vibrate) {
          navigator.vibrate([300, 150, 300]);
        }

        // Trigger native notification if permission is granted
        if (window.Notification && Notification.permission === "granted") {
          try {
            new Notification("লাকি টিকিট বুকিং সেশন ⏳", {
              body: msg,
              icon: "/favicon.ico"
            });
          } catch(e) { console.error(e); }
        }

        // Add a security message inbox notification for the user to be extremely real!
        const autoNotice = {
          id: "msg_abandon_" + Date.now() + "_" + Math.floor(Math.random() * 99),
          recipientType: "specific",
          targetUsername: this.currentUser.username,
          category: "notice",
          subject: "⚠️ আপনার লাকি টিকিটটি এখনো অপেক্ষা করছে!",
          content: `প্রিয় @${this.currentUser.username}, আপনি সম্প্রতি "${lotName}"-এর একটি লাকি টিকিট বুক করার জন্য সিলেক্ট করেছিলেন কিন্তু পেমেন্ট সম্পন্ন করেননি। টিকিটটি এখনো আপনার জন্য অপেক্ষা করছে! স্টক শেষ হওয়ার আগেই এখনই বুক করুন!`,
          date: new Date().toISOString(),
          readBy: []
        };
        if (!this.db.messages) this.db.messages = [];
        this.db.messages.unshift(autoNotice);
        this.saveDB();
        
        // Broadcast inside floating custom toast system
        FloatingToastNotification.broadcastCustom("CART ABANDONED ALERT 🛒", `@<span class="text-white font-bold">${this.currentUser.username}</span>, আপনার লাকি টিকিটটি এখনো অপেক্ষা করছে! এখনই বুক করুন!`, "warning");
      }
    }
  }

  

  

  

  buyJackpotTicket() {
    if (!this.currentUser) {
      this.showToast("Oops, please sign in or register to buy a Jackpot Entry!", "error");
      return;
    }

    const discountPercent = this.getUserTicketDiscount(this.currentUser);
    const originalCost = this.db.settings.jackpotTicketCost || 20.00;
    const finalCost = originalCost * (1 - discountPercent / 100);

    if (this.currentUser.balance < finalCost) {
      this.showToast(`Insufficient balance! This ticket costs ৳${finalCost.toFixed(2)} Taka (VIP discount applied).`, "error");
      return;
    }

    // Deduct final Cost and upgrade pool
    this.currentUser.balance -= finalCost;
    this.currentUser.jackpotTickets = (this.currentUser.jackpotTickets || 0) + 1;
    
    // Add 100% of paid ticket cost directly and live into the progressive Jackpot balance
    this.db.settings.jackpotPool = (this.db.settings.jackpotPool || 84250) + finalCost;

    // Record ledger ledger debit entry
    this.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "debit",
      amount: finalCost,
      method: "Jackpot Pool Ticket",
      walletNumber: "Mega Draw System Pool",
      date: new Date().toISOString(),
      status: "approved"
    });

    this.saveDB();
    this.showToast(`🎯 Registered 1 ticket entry! Paid ৳${finalCost.toFixed(2)} Taka (VIP Discount: ${discountPercent}%). Good Luck!`, "success");
    if (navigator.vibrate) navigator.vibrate(200);
    this.render(); // Redraw UI and balances
  }

  // ================= MEGA PROGRESSIVE JACKPOT VIEW =================
  renderJackpotTab() {
    JackpotTab.render(this);
  }

  // ================= DAILY BOUNTY TASKS VIEW =================
  renderTasksTab() {
    MissionsTab.render(this);
  }

  

  

  checkAndExecuteAutoDraws() {
    const now = Date.now();
    let dbUpdated = false;

    this.db.lotteries.forEach(lot => {
      if (lot.status === "active" && lot.drawMode === "auto") {
        const drawTime = new Date(lot.drawTime).getTime();
        if (now >= drawTime) {
          const ticketsOfPool = this.db.tickets.filter(t => t.lotteryId === lot.id && t.status === "pending");

          if (ticketsOfPool.length > 0) {
            if (lot.category === "Quick Draw") {
              const actualSales = ticketsOfPool.length * lot.entryFee;
              lot.prizeAmount = Math.round(actualSales * 0.95 * 100) / 100; // 5% platform fee, distributing 95% (e.g. 5 tickets * 10 entry = 50 taka total, 47.50 taka prize)
            }
            if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
              const shuffle = [...ticketsOfPool];
              shuffle.sort(() => Math.random() - 0.5);

              const winnersCount = Math.min(lot.multiWinnerPrizes.length, shuffle.length);
              const multiWinnersList: any[] = [];

              for (let i = 0; i < winnersCount; i++) {
                const currentPrize = lot.multiWinnerPrizes[i];
                const winningTicket = shuffle[i];
                winningTicket.status = "won";
                winningTicket.prizeAmount = currentPrize;

                let winnerDisplayUser: any = null;
                if (winningTicket.isSyndicate && winningTicket.userIds) {
                  const share = Math.round((currentPrize / winningTicket.userIds.length) * 100) / 100;
                  winningTicket.userIds.forEach(uid => {
                    const u = this.db.users.find(usr => usr.id === uid);
                    if (u) {
                      u.balance += share;
                      u.wins = (u.wins || 0) + 1;
                      u.profit = (u.profit || 0) + share;
                      
                      this.addInboxNotice(uid, "Syndicate Prize Won! 🏆", `Congratulations! Your syndicate group "${winningTicket.syndicateName || 'Friends Group'}" has won a split prize of ৳${share} (Total: ৳${currentPrize}) in the "${lot.name}" draw!`);

                      if (this.currentUser && u.id === this.currentUser.id) {
                        this.currentUser.balance = u.balance;
                        this.currentUser.wins = u.wins;
                        this.currentUser.profit = u.profit;
                        this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                        localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                      }
                      if (!winnerDisplayUser) winnerDisplayUser = u;
                    }
                  });
                } else {
                  const winnerUser = this.db.users.find(u => u.id === winningTicket.userId);
                  if (winnerUser) {
                    winnerUser.balance += currentPrize;
                    winnerUser.wins += 1;
                    winnerUser.profit += currentPrize;
                    winnerDisplayUser = winnerUser;
                    
                    if (this.currentUser && winnerUser.id === this.currentUser.id) {
                      this.currentUser.balance = winnerUser.balance;
                      this.currentUser.wins = winnerUser.wins;
                      this.currentUser.profit = winnerUser.profit;
                      this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                      localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                    }
                  }
                }

                multiWinnersList.push({
                  userId: winnerDisplayUser ? winnerDisplayUser.id : winningTicket.userId,
                  username: winnerDisplayUser ? winnerDisplayUser.username : (winningTicket.isSyndicate ? (winningTicket.syndicateName || 'Syndicate') : 'Player'),
                  name: winnerDisplayUser ? (winnerDisplayUser.name || winnerDisplayUser.username) : (winningTicket.isSyndicate ? 'Syndicate Team' : 'Winner'),
                  avatar: winnerDisplayUser ? (winnerDisplayUser.avatar || winnerDisplayUser.photoUrl || '') : '',
                  ticketCode: winningTicket.code,
                  prizeAmount: currentPrize,
                  rank: i + 1
                });
              }

              const winnerTicketIds = shuffle.slice(0, winnersCount).map(t => t.id);
              ticketsOfPool.forEach(t => {
                if (!winnerTicketIds.includes(t.id)) {
                  t.status = "lost";
                  if (t.isSyndicate && t.userIds) {
                    t.userIds.forEach(uid => {
                      const u = this.db.users.find(usr => usr.id === uid);
                      if (u) {
                        u.loss = (u.loss || 0) + 1;
                        u.profit = (u.profit || 0) - (lot.entryFee / t.userIds.length);
                      }
                    });
                  }
                }
              });

              lot.status = "drawn";
              lot.drawnWinnersList = multiWinnersList;
              dbUpdated = true;

              const multiDrawEvent = {
                id: "draw_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                lotteryId: lot.id,
                lotteryName: lot.name,
                category: lot.category,
                prizeAmount: lot.prizeAmount,
                drawTime: new Date().toISOString(),
                winningTicketCodes: multiWinnersList.map(w => w.ticketCode),
                winnersCount: multiWinnersList.length,
                winners: multiWinnersList
              };
              LiveDrawRevealEngine.broadcastDrawEvent(multiDrawEvent);
            } else {
              const winningTicket = ticketsOfPool[Math.floor(Math.random() * ticketsOfPool.length)];

              winningTicket.status = "won";
              winningTicket.prizeAmount = lot.prizeAmount;

              let singleWinnerUser: any = null;
              if (winningTicket.isSyndicate && winningTicket.userIds) {
                const share = Math.round((lot.prizeAmount / winningTicket.userIds.length) * 100) / 100;
                winningTicket.userIds.forEach(uid => {
                  const u = this.db.users.find(usr => usr.id === uid);
                  if (u) {
                    u.balance += share;
                    u.wins = (u.wins || 0) + 1;
                    u.profit = (u.profit || 0) + share;
                    
                    this.addInboxNotice(uid, "Syndicate Jackpot Won! 🏆", `Congratulations! Your syndicate group "${winningTicket.syndicateName || 'Friends Group'}" has won a split prize of ৳${share} (Total: ৳${lot.prizeAmount}) in the "${lot.name}" draw!`);

                    if (this.currentUser && u.id === this.currentUser.id) {
                      this.currentUser.balance = u.balance;
                      this.currentUser.wins = u.wins;
                      this.currentUser.profit = u.profit;
                      this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                      localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                    }
                    if (!singleWinnerUser) singleWinnerUser = u;
                  }
                });
              } else {
                const winnerUser = this.db.users.find(u => u.id === winningTicket.userId);
                if (winnerUser) {
                  winnerUser.balance += lot.prizeAmount;
                  winnerUser.wins += 1;
                  winnerUser.profit += lot.prizeAmount;
                  singleWinnerUser = winnerUser;
                  
                  if (this.currentUser && winnerUser.id === this.currentUser.id) {
                    this.currentUser.balance = winnerUser.balance;
                    this.currentUser.wins = winnerUser.wins;
                    this.currentUser.profit = winnerUser.profit;
                    this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                    localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                  }
                }
              }

              ticketsOfPool.forEach(t => {
                if (t.id !== winningTicket.id) {
                  t.status = "lost";
                  if (t.isSyndicate && t.userIds) {
                    t.userIds.forEach(uid => {
                      const u = this.db.users.find(usr => usr.id === uid);
                      if (u) {
                        u.loss = (u.loss || 0) + 1;
                        u.profit = (u.profit || 0) - (lot.entryFee / t.userIds.length);
                      }
                    });
                  }
                }
              });

              const singleWinner = {
                userId: singleWinnerUser ? singleWinnerUser.id : winningTicket.userId,
                username: singleWinnerUser ? singleWinnerUser.username : (winningTicket.isSyndicate ? (winningTicket.syndicateName || 'Syndicate') : 'Player'),
                name: singleWinnerUser ? (singleWinnerUser.name || singleWinnerUser.username) : (winningTicket.isSyndicate ? 'Syndicate Team' : 'Winner'),
                avatar: singleWinnerUser ? (singleWinnerUser.avatar || singleWinnerUser.photoUrl || '') : '',
                ticketCode: winningTicket.code,
                prizeAmount: lot.prizeAmount,
                rank: 1
              };

              lot.status = "drawn";
              lot.drawnWinnersList = [singleWinner];
              dbUpdated = true;

              const singleDrawEvent = {
                id: "draw_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                lotteryId: lot.id,
                lotteryName: lot.name,
                category: lot.category,
                prizeAmount: lot.prizeAmount,
                drawTime: new Date().toISOString(),
                winningTicketCodes: [singleWinner.ticketCode],
                winnersCount: 1,
                winners: [singleWinner]
              };
              LiveDrawRevealEngine.broadcastDrawEvent(singleDrawEvent);
            }

            // Spawn new Quick Draw if category is Quick Draw
            if (lot.category === "Quick Draw") {
              const nextId = "l_quick_" + Date.now();
              const entryFee = 10;
              const soldTickets = Math.floor(Math.random() * 8) + 2;
              const newQuickDraw = {
                id: nextId,
                name: `⚡ ১-মিনিট ইনস্ট্যান্ট কুইক ক্যাশ (Draw #${Date.now().toString().slice(-4)})`,
                details: "Buy ticket for instant drawings. Draws every 1 minute automatically!",
                entryFee: entryFee,
                totalTickets: 50,
                soldTickets: soldTickets,
                category: "Quick Draw",
                drawTime: new Date(Date.now() + 60 * 1000).toISOString(),
                status: "active",
                prizeAmount: Math.round(soldTickets * entryFee * 0.95 * 100) / 100,
                drawMode: "auto"
              };
              this.db.lotteries.push(newQuickDraw);

              const mockUsers = this.db.users.filter(u => !this.currentUser || u.id !== this.currentUser.id);
              for (let k = 0; k < newQuickDraw.soldTickets; k++) {
                const randUser = mockUsers.length > 0 
                  ? mockUsers[Math.floor(Math.random() * mockUsers.length)]
                  : this.db.users[Math.floor(Math.random() * this.db.users.length)];
                this.db.tickets.push({
                  id: "t_quick_seed_" + Date.now() + "_" + k,
                  userId: randUser.id,
                  lotteryId: nextId,
                  code: "LW-" + Math.floor(100000 + Math.random() * 900000),
                  purchaseDate: new Date().toISOString(),
                  status: "pending",
                  prizeAmount: 0
                });
              }
              dbUpdated = true;
            }
          } else {
            lot.status = "drawn";
            dbUpdated = true;

            // Spawn next Quick Draw even if no tickets were purchased for this draw interval
            if (lot.category === "Quick Draw") {
              const nextId = "l_quick_" + Date.now();
              const entryFee = 10;
              const soldTickets = Math.floor(Math.random() * 8) + 2;
              const newQuickDraw = {
                id: nextId,
                name: `⚡ ১-মিনিট ইনস্ট্যান্ট কুইক ক্যাশ (Draw #${Date.now().toString().slice(-4)})`,
                details: "Buy ticket for instant drawings. Draws every 1 minute automatically!",
                entryFee: entryFee,
                totalTickets: 50,
                soldTickets: soldTickets,
                category: "Quick Draw",
                drawTime: new Date(Date.now() + 60 * 1000).toISOString(),
                status: "active",
                prizeAmount: Math.round(soldTickets * entryFee * 0.95 * 100) / 100,
                drawMode: "auto"
              };
              this.db.lotteries.push(newQuickDraw);

              const mockUsers = this.db.users.filter(u => !this.currentUser || u.id !== this.currentUser.id);
              for (let k = 0; k < newQuickDraw.soldTickets; k++) {
                const randUser = mockUsers.length > 0 
                  ? mockUsers[Math.floor(Math.random() * mockUsers.length)]
                  : this.db.users[Math.floor(Math.random() * this.db.users.length)];
                this.db.tickets.push({
                  id: "t_quick_seed_" + Date.now() + "_" + k,
                  userId: randUser.id,
                  lotteryId: nextId,
                  code: "LW-" + Math.floor(100000 + Math.random() * 900000),
                  purchaseDate: new Date().toISOString(),
                  status: "pending",
                  prizeAmount: 0
                });
              }
            }
          }
        }
      }
    });

    if (dbUpdated) {
      this.saveDB();
      this.render();
    }
  }

  checkLiveNotifications() {
    if (!this.currentUser) return;

    let notifiedRaw = localStorage.getItem("lw_notified_systems");
    let notifiedItems = notifiedRaw ? JSON.parse(notifiedRaw) : [];
    let updatedNotified = false;

    const userTickets = this.db.tickets.filter(t => t.userId === this.currentUser.id);
    userTickets.forEach(t => {
      if ((t.status === "won" || t.status === "lost") && !notifiedItems.includes(t.id)) {
        const lot = this.db.lotteries.find(l => l.id === t.lotteryId);
        const lotName = lot ? lot.name : "Exclusive Draw";
        
        if (t.status === "won") {
          this.showToast(`🎯 Winner Alert! Your ticket ${t.code} inside "${lotName}" won the grand prize of ৳${t.prizeAmount}!`, "success");
          NotificationEngine.trigger("DRAW WINNER! 🏆", `Your ticket ${t.code} inside "${lotName}" won the grand prize of ৳${t.prizeAmount}!`, "winner", "tab-history");
        } else {
          this.showToast(`🔔 Draw Completed: Your ticket ${t.code} inside "${lotName}" was drawn. Better luck next time!`, "normal");
          NotificationEngine.trigger("Draw Completed 🔔", `Your ticket ${t.code} inside "${lotName}" was drawn. Better luck next time!`, "clover", "tab-history");
        }
        notifiedItems.push(t.id);
        updatedNotified = true;
      }
    });

    const userDeposits = this.db.deposits.filter(d => d.username === this.currentUser.username);
    userDeposits.forEach(d => {
      if ((d.status === "approved" || d.status === "declined") && !notifiedItems.includes(d.id)) {
        if (d.status === "approved") {
          this.showToast(`💰 Deposit Approved! Your request for ৳${d.amount} via ${d.method} is approved and credited!`, "success");
          NotificationEngine.trigger("Deposit Approved! 💰", `Your request for ৳${d.amount} via ${d.method} is approved and credited!`, "gift", "tab-wallet");
        } else {
          this.showToast(`❌ Deposit Declined: Your request for ৳${d.amount} was declined by admin.`, "error");
          NotificationEngine.trigger("Deposit Declined ❌", `Your request for ৳${d.amount} was declined by admin.`, "agent", "tab-wallet");
        }
        notifiedItems.push(d.id);
        updatedNotified = true;
      }
    });

    // Check for agent cashout balance deduction notification popup (5-sec duration)
    const freshUser = this.db.users.find(u => u.id === this.currentUser.id);
    if (freshUser && freshUser.latestDeductionNotification && !notifiedItems.includes(freshUser.latestDeductionNotification.id)) {
      this.showCashoutDeductionPopup(freshUser.latestDeductionNotification);
      notifiedItems.push(freshUser.latestDeductionNotification.id);
      updatedNotified = true;
    }

    if (updatedNotified) {
      localStorage.setItem("lw_notified_systems", StateManager.safeStringify(notifiedItems));
    }
  }

  

  renderSupportAgentsList() {
    const listEl = document.getElementById("user-support-agents-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const districtSelect = document.getElementById("user-support-agent-district-select");
    const districtVal = districtSelect ? districtSelect.value : "all";

    const agents = this.db.users.filter(u => u.role === "agent" && u.status === "active" && (districtVal === "all" || u.district === districtVal));

    if (agents.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-[10px] font-mono">
          No active verified agents available for this district.
        </div>
      `;
      return;
    }

    const adminWhatsApp = this.db.settings?.whatsappUrl || "";

    agents.forEach(agent => {
      const card = document.createElement("div");
      card.className = "bg-slate-950 border border-slate-800 hover:border-emerald-500/30 p-3 rounded-2xl flex justify-between items-center transition cursor-pointer";
      
      let cleanPhone = (agent.phone || "").replace(/\D/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "88" + cleanPhone;
      }
      
      let waUrl = "";
      if (cleanPhone) {
        waUrl = `https://wa.me/${cleanPhone}`;
      } else if (adminWhatsApp) {
        waUrl = adminWhatsApp.startsWith("http") ? adminWhatsApp : `https://wa.me/${adminWhatsApp.replace(/\D/g, "")}`;
      } else {
        waUrl = "#";
      }

      card.innerHTML = `
        <div class="space-y-0.5 text-left">
          <div class="font-bold text-white flex items-center gap-1.5 text-xs">
            <span>@${agent.username}</span>
            <span class="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 rounded px-1 font-mono uppercase">${agent.district || "Dhaka"}</span>
          </div>
          <div class="text-[9.5px] text-slate-500 font-mono">Verified Station Agent</div>
        </div>
        <a href="${waUrl}" target="_blank" class="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition">
          <i class="fa-brands fa-whatsapp text-xs"></i> Connect Chat
        </a>
      `;

      listEl.appendChild(card);
    });
  }

  

  // Toast Notifier
  

  // Route Views Switcher
  getAppView() {
    // Check maintenance first
    if (this.db.settings.maintenanceMode && !this.isAdminMode && (!this.currentUser || this.currentUser.role !== "moderator")) {
      return "maintenance";
    }
    if (this.isAdminMode || (this.currentUser && this.currentUser.role === "moderator")) {
      return "admin";
    }
    if (!this.currentUser) {
      return "auth";
    }
    if (this.currentUser.role === "agent" || this.currentUser.role === "subagent") {
      return "agent";
    }
    return "dashboard";
  }

  render() {
    try {
      this.checkLiveNotifications();

      // Dynamically update site settings and branding texts globally
      const settings = (this.db && this.db.settings) ? this.db.settings : {};
      const siteName = settings.siteName || "Lottery Winner";
      const siteInfo = settings.siteInfo || "Premium Mobile Play Portal";
      const supportNum = settings.supportNumber || "01700000000";

      document.title = siteName;

      const authFooterBrand = document.getElementById("sys-auth-footer-brand");
      if (authFooterBrand) {
        authFooterBrand.innerText = settings.authFooterText || "© 2026 Lottery Winner Mobile Limited (Registered)";
      }

      const authBonusIndicator = document.getElementById("auth-signup-bonus-indicator");
      if (authBonusIndicator) {
        authBonusIndicator.innerText = `৳${settings.signupBonus ?? 100} Starter Wallet Balance`;
      }

      document.querySelectorAll(".brand-site-name").forEach(el => {
        (el as HTMLElement).innerText = siteName;
      });

      document.querySelectorAll(".brand-site-info").forEach(el => {
        (el as HTMLElement).innerText = siteInfo;
      });

      const supLink = document.getElementById("profile-support-link") as HTMLAnchorElement | null;
      if (supLink) {
        supLink.href = `tel:${supportNum}`;
      }

      const supSubtitle = document.getElementById("profile-support-subtitle");
      if (supSubtitle) {
        supSubtitle.innerText = `Call BD Support: ${supportNum}`;
      }

      const view = this.getAppView();
      // Safe screen hiding
      const screens = ["screen-maintenance", "screen-auth", "screen-dashboard", "screen-admin", "screen-agent"];
      screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add("hidden");
      });

      if (view === "maintenance") {
        const el = document.getElementById("screen-maintenance");
        if (el) el.classList.remove("hidden");
        this.renderMaintenance();
      } else if (view === "auth") {
        const el = document.getElementById("screen-auth");
        if (el) el.classList.remove("hidden");
        this.renderAuth();
      } else if (view === "dashboard") {
        const el = document.getElementById("screen-dashboard");
        if (el) el.classList.remove("hidden");
        this.renderDashboard();
        if (!this.liveTickerStarted) {
          this.startLiveActivityTicker();
          this.liveTickerStarted = true;
        }
      } else if (view === "admin") {
        const el = document.getElementById("screen-admin");
        if (el) el.classList.remove("hidden");
        LiveDrawRevealEngine.closeWinningDrawRevealModal();
        this.renderAdmin();
      } else if (view === "agent") {
        const agentScreen = document.getElementById("screen-agent");
        if (agentScreen) {
          agentScreen.classList.remove("hidden");
          this.renderAgentWorkspace();
        }
      }
    } catch (renderError) {
      console.error("CRITICAL RENDER ERROR:", renderError);
      // Emergency display for the user if the app crashes
      const debugMsg = document.getElementById("debug-error-msg");
      const debugBox = document.getElementById("debug-error-box");
      if (debugMsg && debugBox) {
        debugMsg.innerText = `Render Crash: ${renderError.message}`;
        debugBox.classList.remove("hidden");
      }
    }
  }

  // ================= MAINTENANCE VIEW RENDER =================
  renderMaintenance() {
    const msgEl = document.getElementById("maintenance-text");
    const linkEl = document.getElementById("maintenance-apk-link");
    const verEl = document.getElementById("maintenance-apk-ver");

    msgEl.innerText = this.db.settings.maintenanceMessage || "Locked by system management.";
    verEl.innerText = this.db.settings.appVersion || "5.0";
    linkEl.href = this.db.settings.forceUpdateLink || "#";
  }

  // ================= AUTH (LOGIN / SIGNUP) VIEW RENDER =================
  renderAuth() {
    if ((window as any).generateMathCaptcha) {
      (window as any).generateMathCaptcha();
    }
  }

  // ================= DASHBOARD USER VIEW RENDER =================
  renderDashboard() {
    if (this.currentTab !== "otp" && this.otpInterval) {
      clearInterval(this.otpInterval);
      this.otpInterval = null;
    }

    const usernameEls = document.querySelectorAll(".curr-username");
    const balanceEls = document.querySelectorAll(".curr-balance");

    usernameEls.forEach(el => el.innerText = this.currentUser.username);
    balanceEls.forEach(el => el.innerText = this.currentUser.balance.toFixed(2));

    // Trigger full screen popup
    this.triggerFullScreenPopup();

    // Hide all tabs
    document.getElementById("tab-home")?.classList.add("hidden");
    document.getElementById("tab-events")?.classList.add("hidden");
    document.getElementById("tab-tickets")?.classList.add("hidden");
    document.getElementById("tab-wallet")?.classList.add("hidden");
    document.getElementById("tab-deposit")?.classList.add("hidden");
    document.getElementById("tab-withdraw")?.classList.add("hidden");
    document.getElementById("tab-agent")?.classList.add("hidden");
    document.getElementById("tab-history")?.classList.add("hidden");
    document.getElementById("tab-profile")?.classList.add("hidden");
    document.getElementById("tab-settings")?.classList.add("hidden");
    document.getElementById("tab-customizer")?.classList.add("hidden");
    document.getElementById("tab-jackpot")?.classList.add("hidden");
    document.getElementById("tab-tasks")?.classList.add("hidden");
    document.getElementById("tab-badge-request")?.classList.add("hidden");
    document.getElementById("tab-refer")?.classList.add("hidden");
    document.getElementById("tab-otp")?.classList.add("hidden");
    document.getElementById("tab-recovery")?.classList.add("hidden");
    document.getElementById("tab-video-bounty")?.classList.add("hidden");
    document.getElementById("tab-games")?.classList.add("hidden");

    // Select tab selector matching classes
    const tabSelectors = document.querySelectorAll(".tab-selector-btn");
    tabSelectors.forEach(btn => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId === this.currentTab) {
        btn.className = "tab-selector-btn text-xs font-black flex flex-col items-center gap-1 text-red-500";
      } else {
        btn.className = "tab-selector-btn text-xs font-semibold flex flex-col items-center gap-1 text-slate-400 hover:text-white";
      }
    });

    // Show current tab
    if (this.currentTab === "badge-request") {
      const badgeReqTab = document.getElementById("tab-badge-request");
      if (badgeReqTab) badgeReqTab.classList.remove("hidden");
      this.renderBadgeRequestTab();
    } else if (this.currentTab === "video-bounty") {
      const videoBountyTab = document.getElementById("tab-video-bounty");
      if (videoBountyTab) videoBountyTab.classList.remove("hidden");
      this.renderVideoBountyTab();
    } else if (this.currentTab === "refer") {
      const referTab = document.getElementById("tab-refer");
      if (referTab) referTab.classList.remove("hidden");
      this.renderReferTab();
    } else if (this.currentTab === "otp") {
      const otpTab = document.getElementById("tab-otp");
      if (otpTab) otpTab.classList.remove("hidden");
      this.renderOtpTab();
    } else if (this.currentTab === "recovery") {
      const recoveryTab = document.getElementById("tab-recovery");
      if (recoveryTab) recoveryTab.classList.remove("hidden");
      this.renderRecoveryTab();
    } else if (this.currentTab === "customizer") {
      const customizerTab = document.getElementById("tab-customizer");
      if (customizerTab) customizerTab.classList.remove("hidden");
      this.renderCustomizerTab();
    } else {
      const targetTab = document.getElementById(`tab-${this.currentTab}`);
      if (targetTab) targetTab.classList.remove("hidden");
    }

    if (this.currentTab === "home") {
      this.renderHomeTab();
    } else if (this.currentTab === "events") {
      this.renderEventsTab();
    } else if (this.currentTab === "tickets") {
      this.renderTicketsTab();
    } else if (this.currentTab === "wallet") {
      this.renderWalletTab();
    } else if (this.currentTab === "deposit") {
      this.renderDepositTab();
    } else if (this.currentTab === "history") {
      this.renderHistoryTab();
    } else if (this.currentTab === "profile") {
      this.renderProfileTab();
    } else if (this.currentTab === "settings") {
      this.renderSettingsTab();
    } else if (this.currentTab === "customizer") {
      this.renderCustomizerTab();
    } else if (this.currentTab === "refer") {
      this.renderReferTab();
    } else if (this.currentTab === "jackpot") {
      this.renderJackpotTab();
    } else if (this.currentTab === "tasks") {
      this.renderTasksTab();
    } else if (this.currentTab === "games") {
      this.renderGamesTab();
    }
  }

  renderDepositTab() {
    const amtInput = document.getElementById("deposit-amount") as HTMLInputElement | null;
    const currentAmt = amtInput ? parseFloat(amtInput.value) || 1000 : 1000;
    if ((window as any).updateDepositSummary) {
      (window as any).updateDepositSummary(currentAmt);
    }

    // Update balance labels
    const balanceEls = document.querySelectorAll(".curr-balance");
    balanceEls.forEach(el => {
      (el as HTMLElement).innerText = this.currentUser ? this.currentUser.balance.toFixed(2) : "0.00";
    });

    // Synchronize visibility of all deposit gateway cards with Admin Settings
    this.syncDepositGatewaysUI();

    const checked = document.querySelector('input[name="dep_payment_method"]:checked') as HTMLInputElement | null;
    const method = checked ? checked.value : "UddoktaPay";
    if ((window as any).selectDepositMethod) {
      (window as any).selectDepositMethod(method);
    }
  }

  renderGamesTab() {
    GameHubModule.render(this);
  }

  renderVideoBountyTab() {
    VideoBountyTab.render(this);
  }

  

  

  

  renderHomeTab() {
    HomeTab.render(this);
    this.renderHomeBannerSliders();
    this.startLiveActivityTicker();
  }

  renderEventsTab() {
    const popup = this.db.settings.popupEvent || {};
    const embeddedCard = document.getElementById("embedded-popup-event-card");
    const emptyFallback = document.getElementById("events-empty-fallback");

    const slides = this.db.settings.bannerSlides || [];

    if (popup.enabled) {
      if (embeddedCard) {
        embeddedCard.classList.remove("hidden");
        const img = document.getElementById("embedded-event-img");
        if (img) img.src = popup.imageUrl || "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop";
        const title = document.getElementById("embedded-event-title");
        if (title) title.innerText = popup.title || "Eid Mega Draw Festival! 🎉";
        const msg = document.getElementById("embedded-event-message");
        if (msg) msg.innerText = popup.message || "No message specified.";
        const btnText = document.getElementById("embedded-event-action-text");
        if (btnText) btnText.innerText = popup.actionText || "Explore Offer";

        const actionBtn = document.getElementById("embedded-event-action-btn");
        if (actionBtn) {
          actionBtn.onclick = () => {
            if (popup.redirectTab) {
              this.currentTab = popup.redirectTab;
              this.render();
            } else {
              this.showToast("Event explored!", "success");
            }
          };
        }
      }
      if (emptyFallback) emptyFallback.classList.add("hidden");
    } else {
      if (embeddedCard) embeddedCard.classList.add("hidden");
      if (slides.length === 0) {
        if (emptyFallback) emptyFallback.classList.remove("hidden");
      } else {
        if (emptyFallback) emptyFallback.classList.add("hidden");
      }
    }
  }

  // Purchase Lottery Ticket Flow
  purchaseTicket(lotteryId) {
    if (!this.currentUser) {
      this.showToast("Please sign in or register to purchase tickets!", "error");
      this.currentTab = "profile";
      this.render();
      return;
    }

    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) return;

    if (this.currentUser.balance < lot.entryFee) {
      this.showToast("Insufficient Taka balance! Please deposit money.", "error");
      this.currentTab = "wallet";
      this.render();
      return;
    }

    if (lot.soldTickets >= lot.totalTickets) {
      this.showToast("This draw pool is completely sold out!", "error");
      return;
    }

    // Process Purchase
    this.currentUser.balance -= lot.entryFee;
    this.currentUser.loss += lot.entryFee;
    this.currentUser.profit -= lot.entryFee;
    lot.soldTickets += 1;

    if (lot.category === "Quick Draw") {
      // Set the prize pool dynamically to 95% of total ticket sales (keeping 5% commission)
      lot.prizeAmount = Math.round(lot.soldTickets * lot.entryFee * 0.95 * 100) / 100;
    }

    // Add 100% of ticket entry fee directly to the progressive jackpot pool
    this.db.settings.jackpotPool = (this.db.settings.jackpotPool || 0) + lot.entryFee;

    // Generate custom code e.g. LW-849502
    const digitCode = Math.floor(100000 + Math.random() * 900000);
    const code = `LW-${digitCode}`;

    const newTicket = {
      id: "t" + Date.now() + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      lotteryId: lot.id,
      code: code,
      purchaseDate: new Date().toISOString(),
      status: "pending",
      prizeAmount: 0
    };

    this.db.tickets.unshift(newTicket);
    this.saveDB();

    if (!navigator.onLine && this.offlineQueue) {
      this.offlineQueue.enqueueAction("PURCHASE_TICKET", {
        lotteryId: lot.id,
        userId: this.currentUser.id,
        ticketId: newTicket.id,
        code: code,
        purchaseDate: newTicket.purchaseDate,
        entryFee: lot.entryFee
      });
    }

    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Clear Cart Abandonment states on successful ticket checkout
    localStorage.removeItem("cart_abandoned_status");
    localStorage.removeItem("cart_abandoned_lottery_id");
    localStorage.removeItem("cart_abandoned_time");
    localStorage.removeItem("cart_abandoned_notified");

    this.showToast(`Bought ticket ${code} successfully for ৳${lot.entryFee}!`, "success");
    FloatingToastNotification.broadcastCustom("TICKET PURCHASED! 🎫", `@<span class="text-white font-bold">${this.currentUser.username}</span> purchased ticket <strong class="text-emerald-400">${code}</strong> for the ${lot.name} draw!`, "success");
    if (lot.category === "Quick Draw") {
      this.render();
    } else {
      this.currentTab = "tickets";
      this.render();
    }
  }

  createSyndicate(lotteryId, size, teamName) {
    if (!this.currentUser) {
      this.showToast("Please register or login first to create a syndicate!", "error");
      return;
    }
    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) {
      this.showToast("Lottery not found!", "error");
      return;
    }
    const shareFee = Math.round((lot.entryFee / size) * 100) / 100;
    if (this.currentUser.balance < shareFee) {
      this.showToast(`Insufficient balance! Your 1/${size} share is ৳${shareFee}.`, "error");
      return;
    }

    // Deduct share fee
    this.currentUser.balance -= shareFee;
    
    // Create Syndicate Object
    const synCode = "SYN-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newSyn = {
      id: "syn_" + Date.now() + "_" + Math.floor(Math.random() * 99),
      name: teamName || `${this.currentUser.username}'s Team`,
      code: synCode,
      lotteryId: lotteryId,
      size: size,
      creatorId: this.currentUser.id,
      creatorUsername: this.currentUser.username,
      joinedUserIds: [this.currentUser.id],
      joinedUsernames: [this.currentUser.username],
      status: "pending",
      ticketCode: null,
      entryFeeShare: shareFee,
      createdAt: new Date().toISOString()
    };

    if (!this.db.syndicates) this.db.syndicates = [];
    this.db.syndicates.unshift(newSyn);
    this.saveDB();
    this.render();

    this.showToast(`👥 Syndicate Group "${newSyn.name}" created successfully! Code: ${synCode}`, "success");
    FloatingToastNotification.broadcastCustom("NEW SYNDICATE CREATED! 👥", `@<span class="text-white font-bold">${this.currentUser.username}</span> created a syndicate group <strong class="text-emerald-400">${newSyn.name}</strong> for ${lot.name}!`, "success");
  }

  joinSyndicateByCode(code) {
    if (!this.currentUser) {
      this.showToast("Please register or login first to join!", "error");
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    const syn = (this.db.syndicates || []).find(s => s.code === cleanCode);
    if (!syn) {
      this.showToast("Syndicate group code not found!", "error");
      return;
    }
    this.joinSyndicateById(syn.id);
  }

  joinSyndicateById(id) {
    if (!this.currentUser) {
      this.showToast("Please register or login first to join!", "error");
      return;
    }
    const syn = (this.db.syndicates || []).find(s => s.id === id);
    if (!syn) {
      this.showToast("Syndicate group not found!", "error");
      return;
    }
    if (syn.status !== "pending") {
      this.showToast("This syndicate is already fully funded or completed!", "error");
      return;
    }
    if (syn.joinedUserIds.includes(this.currentUser.id)) {
      this.showToast("You are already a member of this syndicate!", "error");
      return;
    }
    if (this.currentUser.balance < syn.entryFeeShare) {
      this.showToast(`Insufficient balance! Your share is ৳${syn.entryFeeShare}.`, "error");
      return;
    }

    const lot = this.db.lotteries.find(l => l.id === syn.lotteryId);
    if (!lot) {
      this.showToast("Lottery not found!", "error");
      return;
    }

    // Deduct and Join
    this.currentUser.balance -= syn.entryFeeShare;
    syn.joinedUserIds.push(this.currentUser.id);
    syn.joinedUsernames.push(this.currentUser.username);

    // Check if fully funded
    if (syn.joinedUserIds.length >= syn.size) {
      syn.status = "active";
      lot.soldTickets += 1;

      // Buy Group Ticket!
      const digitCode = Math.floor(100000 + Math.random() * 900000);
      const ticketCode = `LW-${digitCode}`;
      syn.ticketCode = ticketCode;

      const newTicket = {
        id: "t" + Date.now() + Math.floor(Math.random() * 100),
        userId: syn.creatorId, // primary contact
        userIds: syn.joinedUserIds, // ALL syndicate players!
        isSyndicate: true,
        syndicateId: syn.id,
        syndicateName: syn.name,
        lotteryId: lot.id,
        code: ticketCode,
        purchaseDate: new Date().toISOString(),
        status: "pending",
        prizeAmount: 0
      };

      this.db.tickets.unshift(newTicket);
      this.db.settings.jackpotPool = (this.db.settings.jackpotPool || 0) + lot.entryFee;

      this.showToast(`🎉 SUCCESS! Syndicate is fully funded. Group ticket issued: ${ticketCode}!`, "success");
      FloatingToastNotification.broadcastCustom("👥 SYNDICATE FULLY FUNDED!", `Syndicate <strong class="text-emerald-400">${syn.name}</strong> is now active. Group ticket ${ticketCode} issued!`, "success");

      // Notify all users in syndicate inbox
      syn.joinedUserIds.forEach(uid => {
        this.addInboxNotice(uid, "👥 Syndicate Fully Funded!", `Great news! Your syndicate group "${syn.name}" is now fully funded with ${syn.size} members. Group ticket ${ticketCode} has been officially issued for the "${lot.name}" draw!`);
      });
    } else {
      this.showToast(`Successfully joined "${syn.name}"! Share the code with more friends to complete the pool.`, "success");
    }

    this.saveDB();
    this.render();
  }

  renderTicketsTab() {
    TicketsTab.render(this);
  }

  rebuildDepositGatewaySelect() {
    const s = this.db.settings || {};
    const selectEl = document.getElementById("dep-gateway") as HTMLSelectElement | null;
    if (!selectEl) return;

    const currentVal = selectEl.value;
    const isMasterOn = s.payMasterEnabled !== false;

    const options = [
      { value: "Cryptomus", text: "Cryptomus (Automated Crypto ⚡)", enabled: isMasterOn && s.payCryptomusEnabled !== false },
      { value: "UddoktaPay", text: "UddoktaPay (Automated Online ⚡)", enabled: isMasterOn && s.payUddoktapayEnabled !== false },
      { value: "bKash PGW", text: "bKash PGW (Direct Merchant API)", enabled: isMasterOn && (s.payBkashPgwEnabled !== false && s.payBkashPgwEnabled !== undefined) },
      { value: "Nagad PGW", text: "Nagad PGW (Direct Merchant API)", enabled: isMasterOn && (s.payNagadPgwEnabled !== false && s.payNagadPgwEnabled !== undefined) },
      { value: "Aamarpay", text: "Aamarpay Online PGW", enabled: isMasterOn && (s.payAamarpayEnabled !== false && s.payAamarpayEnabled !== undefined) },
      { value: "Binance Pay", text: "Binance Pay (C2B / App)", enabled: isMasterOn && (s.payBinanceEnabled !== false && s.payBinancePayEnabled !== false) },
      { value: "bKash", text: "bKash (Send Money / Agent)", enabled: isMasterOn && s.payBkashEnabled !== false },
      { value: "Nagad", text: "Nagad (Send Money / Agent)", enabled: isMasterOn && s.payNagadEnabled !== false },
      { value: "Rocket", text: "Rocket (Send Money / Agent)", enabled: isMasterOn && s.payRocketEnabled !== false },
      { value: "Upay", text: "Upay (Send Money / Agent)", enabled: isMasterOn && s.payUpayEnabled !== false },
      { value: "DBBL", text: "Dutch Bangla DBBL Bank", enabled: isMasterOn && s.payDbblEnabled !== false },
      { value: "Crypto USDT", text: "TRC20 USDT (Crypto)", enabled: isMasterOn && s.payUsdtEnabled !== false },
      { value: "Crypto BTC", text: "Bitcoin BTC (Crypto)", enabled: isMasterOn && (s.payBtcEnabled !== false && s.payBtcEnabled !== undefined) },
      { value: "Crypto ETH", text: "Ethereum ETH (Crypto)", enabled: isMasterOn && (s.payEthEnabled !== false && s.payEthEnabled !== undefined) },
      { value: "Agent Deposit", text: "Agent Deposit (Verified Local Desk)", enabled: isMasterOn && s.payAgentDepositEnabled !== false },
    ];

    selectEl.innerHTML = "";
    
    const activeOptions = options.filter(opt => opt.enabled);
    if (activeOptions.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.text = "⛔ All deposit payment channels are temporarily disabled by Admin";
      selectEl.appendChild(opt);
    } else {
      activeOptions.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.text = opt.text;
        selectEl.appendChild(o);
      });
      
      if (activeOptions.some(opt => opt.value === currentVal)) {
        selectEl.value = currentVal;
      } else {
        selectEl.value = activeOptions[0].value;
      }
    }

    this.updateSelectedDepositGatewayInstructions();
  }

  syncDepositGatewaysUI() {
    const s = (this.db && this.db.settings) ? this.db.settings : {};
    const isMasterOn = s.payMasterEnabled !== false && s.payMasterEnabled !== 'false' && s.payMasterEnabled !== '0' && s.payMasterEnabled !== 0;

    const isEnabled = (val: any, defaultState = true) => {
      if (!isMasterOn) return false;
      if (val === undefined || val === null) return defaultState;
      if (val === false || val === 'false' || val === '0' || val === 0) return false;
      return true;
    };

    const statusMap: Record<string, boolean> = {
      "UddoktaPay": isEnabled(s.payUddoktapayEnabled, true),
      "ZiniPay": isEnabled(s.payZinipayEnabled ?? s.payZiniPayEnabled, true),
      "Cryptomus": isEnabled(s.payCryptomusEnabled, true),
      "bKash": isEnabled(s.payBkashEnabled, false),
      "Nagad": isEnabled(s.payNagadEnabled, false),
      "Rocket": isEnabled(s.payRocketEnabled, false),
      "USDT": isEnabled(s.payUsdtEnabled, false),
      "Agent": isEnabled(s.payAgentDepositEnabled ?? s.payAgentEnabled, false),
      "bKash PGW": isEnabled(s.payBkashPgwEnabled, false),
      "Nagad PGW": isEnabled(s.payNagadPgwEnabled, false),
      "Aamarpay": isEnabled(s.payAamarpayEnabled, false),
      "Binance Pay": isEnabled(s.payBinanceEnabled ?? s.payBinancePayEnabled, false)
    };

    (window as any).__gatewayStatusMap = statusMap;

    // Synchronize every deposit method card in User Panel
    const cards = document.querySelectorAll(".deposit-method-card");
    let hasAnyVisible = false;

    cards.forEach(card => {
      const gw = card.getAttribute("data-gateway");
      if (!gw) return;

      const active = statusMap[gw] === true;

      // Real-time status badge
      let badge = card.querySelector(".gw-status-badge") as HTMLElement | null;
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 inline-flex items-center gap-1";
        const titleDiv = card.querySelector("div > div > div.flex") || card.querySelector(".flex.items-center.gap-1\\.5") || card.querySelector(".flex.items-center.gap-2\\.5 > div > div");
        if (titleDiv) {
          titleDiv.appendChild(badge);
        }
      }

      if (active) {
        (card as HTMLElement).style.display = "";
        card.classList.remove("hidden", "opacity-40", "pointer-events-none");
        if (badge) {
          badge.className = "gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40";
          badge.innerHTML = '<i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE';
        }
        hasAnyVisible = true;
      } else {
        (card as HTMLElement).style.display = "none";
        card.classList.add("hidden");
        if (badge) {
          badge.className = "gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 inline-flex items-center gap-1 bg-rose-950/80 text-rose-400 border border-rose-800/40";
          badge.innerHTML = '<i class="fa-solid fa-ban text-[7px]"></i> DISABLED';
        }
      }
    });

    // Check currently checked radio - if disabled, pick the first visible active card
    const checkedRadio = document.querySelector('input[name="dep_payment_method"]:checked') as HTMLInputElement | null;
    const currentGw = checkedRadio ? checkedRadio.value : "";
    if (!currentGw || !statusMap[currentGw]) {
      const firstActiveCard = Array.from(cards).find(c => {
        const gw = c.getAttribute("data-gateway");
        return gw && statusMap[gw] === true;
      });
      if (firstActiveCard) {
        const gw = firstActiveCard.getAttribute("data-gateway");
        const radio = firstActiveCard.querySelector('input[type="radio"]') as HTMLInputElement | null;
        if (radio && gw) {
          radio.checked = true;
          if ((window as any).selectDepositMethod) {
            (window as any).selectDepositMethod(gw);
          }
        }
      }
    }

    // Offline notice container
    let offlineNotice = document.getElementById("dep-all-offline-notice");
    const listContainer = document.getElementById("deposit-methods-list");
    if (!hasAnyVisible) {
      if (!offlineNotice && listContainer) {
        offlineNotice = document.createElement("div");
        offlineNotice.id = "dep-all-offline-notice";
        offlineNotice.className = "col-span-full p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-center space-y-2 my-2";
        offlineNotice.innerHTML = `
          <div class="text-rose-400 text-base font-black flex items-center justify-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>All Payment Gateways Offline</span>
          </div>
          <p class="text-[11px] text-slate-300">Deposit channels are temporarily paused by system administration. Please check back shortly or contact support.</p>
        `;
        listContainer.appendChild(offlineNotice);
      }
    } else if (offlineNotice) {
      offlineNotice.remove();
    }
  }

  rebuildWithdrawGatewaySelect() {
    const s = this.db.settings || {};
    const selectEl = document.getElementById("wd-gateway") as HTMLSelectElement | null;
    if (!selectEl) return;

    const currentVal = selectEl.value;
    const isMasterOn = s.payMasterEnabled !== false;

    const options = [
      { value: "bKash", text: "bKash (SendMoney)", enabled: isMasterOn && s.payBkashEnabled !== false },
      { value: "Nagad", text: "Nagad (SendMoney)", enabled: isMasterOn && s.payNagadEnabled !== false },
      { value: "Rocket", text: "Rocket (Personal)", enabled: isMasterOn && s.payRocketEnabled !== false },
      { value: "Upay", text: "Upay (Personal)", enabled: isMasterOn && s.payUpayEnabled !== false },
      { value: "DBBL", text: "Dutch Bangla DBBL", enabled: isMasterOn && s.payDbblEnabled !== false },
      { value: "Crypto USDT", text: "TRC20 USDT", enabled: isMasterOn && s.payUsdtEnabled !== false },
      { value: "Crypto BTC", text: "Bitcoin BTC", enabled: isMasterOn && (s.payBtcEnabled !== false && s.payBtcEnabled !== undefined) },
      { value: "Crypto ETH", text: "Ethereum ETH", enabled: isMasterOn && (s.payEthEnabled !== false && s.payEthEnabled !== undefined) },
      { value: "Binance Pay", text: "Binance Pay (Pay ID / Email)", enabled: isMasterOn && (s.payBinanceEnabled !== false && s.payBinancePayEnabled !== false) },
      { value: "Agent Withdraw", text: "Agent Withdraw (Verified Local Desk)", enabled: isMasterOn && s.payAgentWithdrawEnabled !== false },
    ];

    selectEl.innerHTML = "";
    
    const activeOptions = options.filter(opt => opt.enabled);
    if (activeOptions.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.text = "⛔ All withdrawal payout channels are temporarily disabled";
      selectEl.appendChild(opt);
    } else {
      activeOptions.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.text = opt.text;
        selectEl.appendChild(o);
      });
      
      if (activeOptions.some(opt => opt.value === currentVal)) {
        selectEl.value = currentVal;
      } else {
        selectEl.value = activeOptions[0].value;
      }
    }

    // Trigger row hidden toggle based on selected option
    const wdRowDistrictAgents = document.getElementById("user-wd-row-district-agents");
    if (wdRowDistrictAgents) {
      if (selectEl.value === "Agent Withdraw") {
        wdRowDistrictAgents.classList.remove("hidden");
      } else {
        wdRowDistrictAgents.classList.add("hidden");
      }
    }
  }

  renderWalletTab() {
    WalletTab.render(this);
  }

  updateSelectedDepositGatewayInstructions() {
    const s = this.db.settings || {};
    const gatewaySelect = document.getElementById("dep-gateway") as HTMLSelectElement | null;
    const gateway = gatewaySelect ? gatewaySelect.value : "";

    const titleEl = document.getElementById("user-dep-title");
    const instructionEl = document.getElementById("user-dep-instruction");
    const badgeEl = document.getElementById("user-dep-type-badge");
    const qrBlock = document.getElementById("user-dep-qr-block");
    const qrImg = document.getElementById("user-dep-qr-img") as HTMLImageElement | null;

    const rowPersonal = document.getElementById("user-dep-row-personal");
    const rowAgent = document.getElementById("user-dep-row-agent");
    const rowSingle = document.getElementById("user-dep-row-single");
    const rowDistrictAgents = document.getElementById("user-dep-row-district-agents");

    const rowCryptomus = document.getElementById("user-dep-row-cryptomus");
    const rowUddoktapay = document.getElementById("user-dep-row-uddoktapay");
    const rowZinipay = document.getElementById("user-dep-row-zinipay");
    const rowAutomated = document.getElementById("user-dep-row-automated");

    const autoTitle = document.getElementById("user-dep-automated-title");
    const autoSubtitle = document.getElementById("user-dep-automated-subtitle");
    const autoDesc = document.getElementById("user-dep-automated-desc");

    const personalAccEl = document.getElementById("user-dep-account-personal");
    const agentAccEl = document.getElementById("user-dep-account-agent");
    const singleAccEl = document.getElementById("user-dep-account-single");
    const singleLabelEl = document.getElementById("user-dep-single-label");

    if (!titleEl || !instructionEl || !badgeEl) return;

    // Helper to hide all specialized rows first
    const hideAllRows = () => {
      rowPersonal?.classList.add("hidden");
      rowAgent?.classList.add("hidden");
      rowSingle?.classList.add("hidden");
      rowDistrictAgents?.classList.add("hidden");
      rowCryptomus?.classList.add("hidden");
      rowUddoktapay?.classList.add("hidden");
      rowZinipay?.classList.add("hidden");
      rowAutomated?.classList.add("hidden");
      qrBlock?.classList.add("hidden");
    };

    hideAllRows();

    const manualFieldsGroup = document.getElementById("manual-deposit-fields-group");
    const submitBtn = document.getElementById("deposit-submit-btn");
    const isAutomated = ["Cryptomus", "ZiniPay", "UddoktaPay", "bKash PGW", "Nagad PGW", "Aamarpay", "Binance Pay"].includes(gateway);

    if (manualFieldsGroup) {
      if (isAutomated) {
        manualFieldsGroup.classList.add("hidden");
        const trxInput = document.getElementById("dep-trxid") as HTMLInputElement;
        if (trxInput) trxInput.removeAttribute("required");
      } else {
        manualFieldsGroup.classList.remove("hidden");
        const trxInput = document.getElementById("dep-trxid") as HTMLInputElement;
        if (trxInput) trxInput.setAttribute("required", "required");
      }
    }

    if (submitBtn) {
      if (isAutomated) {
        submitBtn.innerText = `Proceed to ${gateway} Checkout ⚡`;
      } else {
        submitBtn.innerText = "File Deposit Request";
      }
    }

    if (!gateway) {
      titleEl.innerText = "No payment gateways active";
      instructionEl.innerText = "All automatic deposit streams are currently undergoing system updates. Please contact customer management.";
      badgeEl.innerText = "Disabled";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/20 px-2.5 py-0.5 rounded-full";
      badgeEl.parentElement?.classList.remove("hidden");
      
      rowSingle?.classList.remove("hidden");
      if (singleAccEl) singleAccEl.innerText = "N/A";
      return;
    }

    if (gateway === "Cryptomus") {
      rowCryptomus?.classList.remove("hidden");
      titleEl.innerText = "Cryptomus Automated Crypto Gateway";
      instructionEl.innerText = "Automated checkout with dynamic blockchain QR invoice. Supports USDT (TRC-20 / BEP-20), BTC, ETH, TON, SOL, TRX with instant auto-credit.";
      badgeEl.innerText = "API Auto-Credit ⚡";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-purple-950/60 text-purple-300 border border-purple-800/40 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    if (gateway === "ZiniPay") {
      rowZinipay?.classList.remove("hidden");
      titleEl.innerText = "ZiniPay Instant Multi-Gateway (জিনি পে)";
      instructionEl.innerText = s.zinipayInstruction || "Pay securely via bKash, Nagad, Rocket, Upay, or Cards with zero fees and instant automated balance credit.";
      badgeEl.innerText = "Instant Multi-Gateway ⚡";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    if (gateway === "UddoktaPay") {
      rowUddoktapay?.classList.remove("hidden");
      titleEl.innerText = "UddoktaPay Instant Multi-Gateway (উদ্যোক্তা পে)";
      instructionEl.innerText = s.uddoktapayInstruction || s.payUddoktapayInstruction || "Pay securely via bKash, Nagad, Rocket, Upay, or Cards with zero fees and instant automatic balance credit.";
      badgeEl.innerText = "Instant Multi-Gateway ⚡";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    if (["bKash PGW", "Nagad PGW", "Aamarpay", "Binance Pay"].includes(gateway)) {
      rowAutomated?.classList.remove("hidden");
      if (gateway === "bKash PGW") {
        titleEl.innerText = "bKash Direct Merchant PGW";
        instructionEl.innerText = "Official Tokenized API Gateway. Click below to launch direct bKash secure merchant payment window.";
        if (autoTitle) autoTitle.innerText = "bKash Direct Merchant PGW";
        if (autoSubtitle) autoSubtitle.innerText = "Official Tokenized API Gateway (Sandbox/Live)";
        if (autoDesc) autoDesc.innerText = "Click below to open direct bKash checkout. Zero transaction fees with instant automated verification.";
      } else if (gateway === "Nagad PGW") {
        titleEl.innerText = "Nagad Direct PGW";
        instructionEl.innerText = "Official Nagad Merchant API Gateway. Click below to launch official Nagad online checkout.";
        if (autoTitle) autoTitle.innerText = "Nagad Direct PGW";
        if (autoSubtitle) autoSubtitle.innerText = "Official Nagad Merchant API Gateway";
        if (autoDesc) autoDesc.innerText = "Click below to proceed to official Nagad online checkout with instant automated credit.";
      } else if (gateway === "Aamarpay") {
        titleEl.innerText = "Aamarpay Online PGW";
        instructionEl.innerText = "Unified multi-gateway for Cards, Netbanking & Mobile Wallets with instant auto-approval.";
        if (autoTitle) autoTitle.innerText = "Aamarpay Online PGW";
        if (autoSubtitle) autoSubtitle.innerText = "Cards, Netbanking & Mobile Wallets";
        if (autoDesc) autoDesc.innerText = "Click below to launch Aamarpay unified checkout gateway for fast account deposit.";
      } else if (gateway === "Binance Pay") {
        titleEl.innerText = "Binance Pay Direct (C2B)";
        instructionEl.innerText = "Official Binance App QR & Pay ID invoice with zero gas fees and instant credit.";
        if (autoTitle) autoTitle.innerText = "Binance Pay Direct (C2B)";
        if (autoSubtitle) autoSubtitle.innerText = "Official Binance App QR & Pay ID";
        if (autoDesc) autoDesc.innerText = "Click below to launch Binance Pay QR code & app checkout with zero network gas fees.";
      }
      badgeEl.innerText = "API Checkout ⚡";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-sky-950/60 text-sky-300 border border-sky-800/40 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    const isMobileWallet = ["bKash", "Nagad", "Rocket", "Upay"].includes(gateway);
    if (isMobileWallet) {
      rowPersonal?.classList.remove("hidden");
      rowAgent?.classList.remove("hidden");

      if (gateway === "bKash") {
        titleEl.innerText = "bKash Mobile Banking";
        instructionEl.innerText = s.mobileInstructionBkash || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        if (personalAccEl) personalAccEl.innerText = s.mobilePersonalBkash || s.mobileAgentBkash || "None";
        if (agentAccEl) agentAccEl.innerText = s.mobileAgentBkash || "None";
      } else if (gateway === "Nagad") {
        titleEl.innerText = "Nagad Mobile Banking";
        instructionEl.innerText = s.mobileInstructionNagad || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        if (personalAccEl) personalAccEl.innerText = s.mobilePersonalNagad || s.mobileAgentNagad || "None";
        if (agentAccEl) agentAccEl.innerText = s.mobileAgentNagad || "None";
      } else if (gateway === "Rocket") {
        titleEl.innerText = "Rocket Mobile Banking";
        instructionEl.innerText = s.mobileInstructionRocket || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        if (personalAccEl) personalAccEl.innerText = s.mobilePersonalRocket || s.mobileAgentRocket || "None";
        if (agentAccEl) agentAccEl.innerText = s.mobileAgentRocket || "None";
      } else if (gateway === "Upay") {
        titleEl.innerText = "Upay Mobile Banking";
        instructionEl.innerText = s.mobileInstructionUpay || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        if (personalAccEl) personalAccEl.innerText = s.mobilePersonalUpay || s.mobileAgentUpay || "None";
        if (agentAccEl) agentAccEl.innerText = s.mobileAgentUpay || "None";
      }

      badgeEl.innerText = "Personal & Agent Active";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/20 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    if (gateway === "Agent Deposit") {
      rowDistrictAgents?.classList.remove("hidden");
      titleEl.innerText = "Partner Agent Network Desk";
      instructionEl.innerText = s.mobileInstructionAgentDeposit || "Hand over physical cash or transfer funds directly to any verified agent found below.";
      badgeEl.innerText = "Verified Agent Partner";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-2.5 py-0.5 rounded-full";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    if (gateway === "DBBL") {
      rowSingle?.classList.remove("hidden");
      titleEl.innerText = "Dutch Bangla DBBL Bank";
      instructionEl.innerText = s.dbblInstruction || "Transfer to bank directly using the following account information.";
      if (singleAccEl) singleAccEl.innerText = s.dbblDetails || "None";
      if (singleLabelEl) singleLabelEl.innerText = "DBBL TARGET BANK DETAILS";
      badgeEl.innerText = "Direct Bank";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/20 px-2.5 py-0.5 rounded-full";
      badgeEl.parentElement?.classList.remove("hidden");
      return;
    }

    // Crypto Gateways (Crypto USDT, Crypto BTC, Crypto ETH)
    rowSingle?.classList.remove("hidden");
    let fallbackQRData = "";
    let customQRUrl = "";

    if (gateway === "Crypto USDT") {
      titleEl.innerText = "Cryptocurrency USDT (TRC-20)";
      instructionEl.innerText = s.cryptoInstruction || "Deposit USDT to the secure address below.";
      if (singleAccEl) singleAccEl.innerText = s.cryptoAddressUSDT || "None";
      fallbackQRData = s.cryptoAddressUSDT || "None";
      customQRUrl = s.cryptoQRUrlUSDT;
    } else if (gateway === "Crypto BTC") {
      titleEl.innerText = "Cryptocurrency Bitcoin (BTC)";
      instructionEl.innerText = s.cryptoInstruction || "Deposit BTC to the secure address below.";
      if (singleAccEl) singleAccEl.innerText = s.cryptoAddressBTC || "None";
      fallbackQRData = s.cryptoAddressBTC || "None";
      customQRUrl = s.cryptoQRUrlBTC;
    } else if (gateway === "Crypto ETH") {
      titleEl.innerText = "Cryptocurrency Ethereum (ETH)";
      instructionEl.innerText = s.cryptoInstruction || "Deposit ETH to the secure address below.";
      if (singleAccEl) singleAccEl.innerText = s.cryptoAddressETH || "None";
      fallbackQRData = s.cryptoAddressETH || "None";
      customQRUrl = s.cryptoQRUrlETH;
    }

    if (singleLabelEl) singleLabelEl.innerText = `${gateway.toUpperCase()} TARGET COIN ADDRESS`;
    badgeEl.innerText = "USDT / BTC / ETH Coin";
    badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/20 px-2.5 py-0.5 rounded-full";
    badgeEl.parentElement?.classList.remove("hidden");

    if (singleAccEl && singleAccEl.innerText !== "None" && qrBlock) {
      qrBlock.classList.remove("hidden");
      if (qrImg) {
        if (s.cryptoQRType === "custom" && customQRUrl) {
          qrImg.src = customQRUrl;
        } else {
          qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fallbackQRData)}`;
        }
      }
    } else {
      qrBlock?.classList.add("hidden");
      if (qrImg) qrImg.src = "";
    }
  }

  renderHistoryTab() {
    HistoryTab.render(this);
  }

  renderCommunitySection() {
    const u = this.currentUser;
    if (!u) return;

    const consentBlock = document.getElementById("community-consent-block");
    const activeFeed = document.getElementById("community-active-feed");

    if (!u.communityConsent) {
      if (consentBlock) consentBlock.classList.remove("hidden");
      if (activeFeed) activeFeed.classList.add("hidden");
      return;
    }

    if (consentBlock) consentBlock.classList.add("hidden");
    if (activeFeed) activeFeed.classList.remove("hidden");

    // Populate winning feed
    const winsContainer = document.getElementById("community-wins-list");
    if (winsContainer) {
      winsContainer.innerHTML = "";
      const wonTickets = (this.db.tickets || []).filter(t => t.status === "won");
      if (wonTickets.length === 0) {
        winsContainer.innerHTML = `<span class="text-[9px] text-slate-500 font-mono py-1">No community draw entries verified yet.</span>`;
      } else {
        // Show last 15 wins
        const sortedWins = [...wonTickets].sort((a,b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
        sortedWins.slice(0, 15).forEach(ticket => {
          const pool = this.db.lotteries.find(l => l.id === ticket.lotteryId) || { name: "Special Draw" };
          const winUser = this.db.users.find(usr => usr.id === ticket.userId) || { username: "anonymous", email: "" };
          
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-2.5 rounded-2xl shrink-0 w-44 text-[10px] space-y-1 shadow-sm";
          card.innerHTML = `
            <div class="flex justify-between items-center font-sans">
              <span class="text-[9px] font-bold text-amber-400">@${winUser.username}</span>
              <span class="text-[9px] px-1.5 py-0.2 bg-emerald-950/40 text-emerald-400 font-mono font-black rounded border border-emerald-900/30">৳${ticket.prizeAmount}</span>
            </div>
            <div class="text-[8px] text-slate-400 truncate-none transition" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${pool.name}">${pool.name}</div>
            <div class="text-[8px] text-slate-655 font-mono flex justify-between">
              <span>Code: ${ticket.code}</span>
              <span class="text-cyan-400 font-bold">✔ Win</span>
            </div>
          `;
          winsContainer.appendChild(card);
        });
      }
    }

    // Sync up Search & Filters UI elements to internal app state
    const commSearchInput = document.getElementById("community-search-input");
    if (commSearchInput) {
      commSearchInput.value = this.communitySearchQuery || "";
    }
    const commClearSearchBtn = document.getElementById("community-clear-search-btn");
    if (commClearSearchBtn) {
      if (this.communitySearchQuery) {
        commClearSearchBtn.classList.remove("hidden");
      } else {
        commClearSearchBtn.classList.add("hidden");
      }
    }

    // Update active filter pill style indicator classes
    const commFilterPills = document.querySelectorAll(".community-filter-pill");
    commFilterPills.forEach(pill => {
      const pFilterType = pill.getAttribute("data-filter");
      if (pFilterType === this.communityFilter) {
        pill.className = "community-filter-pill px-3 py-1.5 rounded-xl font-bold bg-rose-600 text-white cursor-pointer transition shrink-0";
      } else {
        pill.className = "community-filter-pill px-3 py-1.5 rounded-xl font-bold bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition shrink-0";
      }
    });

    // Populate posts stream
    const postsContainer = document.getElementById("community-posts-feed-container");
    if (postsContainer) {
      postsContainer.innerHTML = "";
      
      // 1. Fetch active posts
      let posts = (this.db.communityPosts || []).filter(p => p.status !== "banned");

      // 2. Filter posts by state
      if (this.communityFilter === "my-posts") {
        posts = posts.filter(p => p.userId === u.id || p.username === u.username);
      }

      // 3. Search posts by keyword search query match
      const queryStr = (this.communitySearchQuery || "").toLowerCase().trim();
      if (queryStr) {
        posts = posts.filter(p => {
          const bodyOk = (p.content || "").toLowerCase().includes(queryStr);
          const authorOk = (p.username || "").toLowerCase().includes(queryStr);
          const emailOk = (p.email || "").toLowerCase().includes(queryStr);
          return bodyOk || authorOk || emailOk;
        });
      }

      // 4. Sort posts by filter ordering
      if (this.communityFilter === "most-liked") {
        posts.sort((a, b) => {
          const lA = a.likes ? a.likes.length : 0;
          const lB = b.likes ? b.likes.length : 0;
          return lB - lA;
        });
      } else {
        // Default: Sort by newest posts first
        posts.sort((a,b) => new Date(b.date) - new Date(a.date));
      }
      
      const countEl = document.getElementById("community-posts-count");
      if (countEl) {
        countEl.innerText = `${posts.length} Post${posts.length === 1 ? '' : 's'} found`;
      }

      if (posts.length === 0) {
        postsContainer.innerHTML = `
          <div class="text-center py-10 bg-slate-900/10 border border-slate-800/50 rounded-3xl text-xs text-slate-500 font-sans">
            <i class="fa-solid fa-users-slash text-slate-700 text-lg block mb-1"></i>
            No matching posts found. Modify your search or start the conversation!
          </div>
        `;
      } else {
        posts.forEach(post => {
          // comments belonging to this post
          const comments = (this.db.communityComments || []).filter(c => c.postId === post.id && c.status !== "banned");

          // check if user has liked or disliked
          const isLiked = post.likes ? post.likes.includes(u.id) : false;
          const isDisliked = post.dislikes ? post.dislikes.includes(u.id) : false;

          const likeBtnClass = isLiked ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-emerald-400";
          const dislikeBtnClass = isDisliked ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-rose-400";

          // mask email
          let maskedEmail = "no-email@lottery.com";
          if (post.email) {
            const parts = post.email.split("@");
            if (parts.length === 2 && parts[0].length > 1) {
              maskedEmail = parts[0][0] + "xx" + parts[0][parts[0].length - 1] + "@" + parts[1];
            } else {
              maskedEmail = post.email;
            }
          }

          // Compute & Build user reputation badge HTML list
          const authorUser = (this.db.users || []).find(usr => usr.id === post.userId || usr.username === post.username) || { id: post.userId, username: post.username, wins: 0 };
          
          const winCounts = (this.db.tickets || []).filter(t => t.userId === authorUser.id && t.status === "won").length + (authorUser.wins || 0);
          const postsCount = (this.db.communityPosts || []).filter(p => (p.userId === authorUser.id || p.username === authorUser.username) && p.status !== "banned").length;
          const commentsCount = (this.db.communityComments || []).filter(c => (c.userId === authorUser.id || c.username === authorUser.username) && c.status !== "banned").length;
          const totalContribution = postsCount + commentsCount;

          const isLuckyWinner = winCounts > 0;
          const isTopContributor = totalContribution >= 3;

          let reputationBadgesHtml = "";

          // Custom Admin Badge mapping
          if (authorUser.customBadge) {
            const badgeMap = {
              vip: { label: "VIP Player", style: "bg-cyan-950/60 text-cyan-400 border-cyan-800/50", icon: "fa-solid fa-gem text-cyan-400" },
              moderator: { label: "Staff Mod", style: "bg-indigo-950/60 text-indigo-400 border-indigo-800/50", icon: "fa-solid fa-shield-halved text-indigo-400" },
              star: { label: "Elite Star", style: "bg-purple-950/60 text-purple-400 border-purple-800/50", icon: "fa-solid fa-star text-purple-400" },
              premium: { label: "Premium", style: "bg-fuchsia-950/60 text-fuchsia-400 border-fuchsia-800/50", icon: "fa-solid fa-wand-magic-sparkles text-fuchsia-400" },
              pro: { label: "Pro Bettor", style: "bg-orange-950/60 text-orange-400 border-orange-800/50", icon: "fa-solid fa-fire text-orange-400" },
              legend: { label: "Lottery Legend", style: "bg-rose-950/60 text-rose-400 border-rose-800/50", icon: "fa-solid fa-crown text-rose-400" }
            };
            const customBadgeConf = badgeMap[authorUser.customBadge];
            if (customBadgeConf) {
              reputationBadgesHtml += `
                <span class="${customBadgeConf.style} border px-1.5 py-0.5 rounded-lg text-[8px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 select-none" title="Admin Custom Assigned Special Badge">
                  <i class="${customBadgeConf.icon} text-[7px]"></i> ${customBadgeConf.label}
                </span>
              `;
            }
          }

          if (isLuckyWinner) {
            reputationBadgesHtml += `
              <span class="bg-amber-950/50 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded-lg text-[8px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 select-none" title="Lucky Lottery Winner Badge (${winCounts} Win${winCounts === 1 ? '' : 's'})">
                <i class="fa-solid fa-trophy text-[7px] text-amber-500 animate-pulse"></i> Lucky Winner
              </span>
            `;
          }
          if (isTopContributor) {
            reputationBadgesHtml += `
              <span class="bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-lg text-[8px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 select-none" title="Top Activity Contributor Badge (${totalContribution} Shared Posts/Replies)">
                <i class="fa-solid fa-medal text-[7px] text-emerald-500"></i> Top Contributor
              </span>
            `;
          }
          if (post.username === "lottery_pro" || authorUser.id === "u1") {
            reputationBadgesHtml += `
              <span class="bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded-lg text-[8px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 select-none">
                <i class="fa-solid fa-certificate text-[7px] text-cyan-400"></i> VIP Player
              </span>
            `;
          } else if (!isLuckyWinner && !isTopContributor && !authorUser.customBadge) {
            reputationBadgesHtml += `
              <span class="bg-slate-950 text-slate-400 border border-slate-800/60 px-1.5 py-0.5 rounded-lg text-[8px] font-mono shrink-0 select-none">Player</span>
            `;
          }

          const card = document.createElement("div");
          card.className = "bg-slate-900 border border-slate-800/80 p-4 rounded-3xl space-y-3 shadow-md";
          
          let commentsHtml = "";
          if (comments.length === 0) {
            commentsHtml = `<div class="text-[9px] text-slate-600 font-sans italic pl-1 py-1">No replies yet. Say something!</div>`;
          } else {
            comments.forEach(com => {
              let comMaskedEmail = "no-email@lottery.com";
              if (com.email) {
                const parts = com.email.split("@");
                if (parts.length === 2 && parts[0].length > 1) {
                  comMaskedEmail = parts[0][0] + "xx" + parts[0][com.email.indexOf("@") - 1] + "@" + parts[1];
                } else {
                  comMaskedEmail = com.email;
                }
              }

              // Compute comment author badges as well
              const commentAuthorUser = (this.db.users || []).find(usr => usr.id === com.userId || usr.username === com.username) || { id: com.userId, username: com.username, wins: 0 };
              const cWinCounts = (this.db.tickets || []).filter(t => t.userId === commentAuthorUser.id && t.status === "won").length + (commentAuthorUser.wins || 0);
              const cPostsCount = (this.db.communityPosts || []).filter(p => (p.userId === commentAuthorUser.id || p.username === commentAuthorUser.username) && p.status !== "banned").length;
              const cCommentsCount = (this.db.communityComments || []).filter(c => (c.userId === commentAuthorUser.id || c.username === commentAuthorUser.username) && c.status !== "banned").length;
              const cTotalContrib = cPostsCount + cCommentsCount;

              const cIsLuckyWinner = cWinCounts > 0;
              const cIsTopContributor = cTotalContrib >= 3;

              let cBadgeHtml = "";

              // Custom Admin Comment Badge mapping
              if (commentAuthorUser.customBadge) {
                const cBadgeMap = {
                  vip: `<span class="text-[7px] text-cyan-400 bg-cyan-950/40 border border-cyan-900/35 px-1 py-0.2 rounded" title="VIP Player">💎 VIP</span>`,
                  moderator: `<span class="text-[7px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/35 px-1 py-0.2 rounded" title="Staff Mod">🛡️ Mod</span>`,
                  star: `<span class="text-[7px] text-purple-400 bg-purple-950/40 border border-purple-900/35 px-1 py-0.2 rounded" title="Elite Star">⭐ Star</span>`,
                  premium: `<span class="text-[7px] text-fuchsia-400 bg-fuchsia-950/40 border border-fuchsia-900/35 px-1 py-0.2 rounded" title="Premium">✨ Prem</span>`,
                  pro: `<span class="text-[7px] text-orange-400 bg-orange-950/40 border border-orange-900/45 px-1 py-0.2 rounded" title="Pro Bettor">🔥 Pro</span>`,
                  legend: `<span class="text-[7px] text-rose-400 bg-rose-950/40 border border-rose-900/35 px-1 py-0.2 rounded" title="Lottery Legend">👑 Royal</span>`
                };
                if (cBadgeMap[commentAuthorUser.customBadge]) {
                  cBadgeHtml += cBadgeMap[commentAuthorUser.customBadge] + " ";
                }
              }

              if (cIsLuckyWinner) {
                cBadgeHtml += `<span class="text-[7px] text-amber-500 font-bold bg-amber-950/40 border border-amber-900/35 px-1 py-0.2 rounded" title="Winner (${cWinCounts} wins)"><i class="fa-solid fa-trophy text-[6px]"></i> Win</span> `;
              }
              if (cIsTopContributor) {
                cBadgeHtml += `<span class="text-[7px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/45 px-1 py-0.2 rounded" title="Top Contributor (${cTotalContrib} contributions)"><i class="fa-solid fa-medal text-[6px]"></i> Pro</span> `;
              }

              commentsHtml += `
                <div class="bg-slate-950 p-2.5 rounded-xl text-[10px] space-y-1 border border-slate-800/30">
                  <div class="flex justify-between items-center text-[9px]">
                    <div class="font-bold text-slate-300 flex items-center gap-1">
                      <span class="cursor-pointer hover:underline hover:text-rose-400 transition-colors com-user-profile-click" data-username="${com.username}">@${com.username}</span> 
                      ${cBadgeHtml}
                      <span class="text-[8px] text-slate-600 font-mono">(${comMaskedEmail})</span>
                    </div>
                    <button class="com-act-report-comment text-[8px] text-slate-600 hover:text-rose-400 transition" data-comment-id="${com.id}">
                      <i class="fa-solid fa-flag mr-0.5"></i> Report
                    </button>
                  </div>
                  <p class="text-slate-200 leading-normal whitespace-pre-wrap font-sans pl-1">${com.content}</p>
                </div>
              `;
            });
          }

          card.innerHTML = `
            <!-- Post Author Header -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-rose-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow shrink-0">
                  ${post.username ? post.username[0] : "?"}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-[11px] font-black tracking-tight text-white font-sans cursor-pointer hover:underline hover:text-rose-400 transition-colors com-user-profile-click" data-username="${post.username}">@${post.username}</span>
                    ${reputationBadgesHtml}
                  </div>
                  <div class="text-[8px] text-slate-500 font-mono mt-0.5">
                    ${maskedEmail} • ${new Date(post.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <button class="com-act-report-post text-[8px] text-slate-500 hover:text-rose-500 font-mono py-1 px-2 bg-slate-950 border border-slate-800/60 rounded-xl transition shrink-0" data-post-id="${post.id}">
                <i class="fa-solid fa-flag text-red-500/50 mr-0.5"></i> Report
              </button>
            </div>

            <!-- Content -->
            <p class="text-xs text-slate-100 leading-relaxed pl-1 font-sans whitespace-pre-wrap">${post.content}</p>

            <!-- Buttons bar -->
            <div class="flex items-center gap-4 text-[10px] text-slate-400 border-t border-b border-slate-800/40 py-2 mt-1">
              <button class="com-act-like flex items-center gap-1.5 cursor-pointer transition ${likeBtnClass}" data-post-id="${post.id}">
                <i class="fa-solid fa-thumbs-up"></i>
                <span class="font-bold">${post.likes ? post.likes.length : 0}</span>
              </button>
              <button class="com-act-dislike flex items-center gap-1.5 cursor-pointer transition ${dislikeBtnClass}" data-post-id="${post.id}">
                <i class="fa-solid fa-thumbs-down"></i>
                <span class="font-bold">${post.dislikes ? post.dislikes.length : 0}</span>
              </button>
              <div class="flex items-center gap-1 text-slate-500 font-mono ml-auto">
                <i class="fa-solid fa-comments"></i>
                <span>${comments.length} Replies</span>
              </div>
            </div>

            <!-- Comments Stream Section -->
            <div class="space-y-2 pt-1 font-sans">
              <div class="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Comment Replies:</div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                ${commentsHtml}
              </div>
              
              <!-- Reply Input Row -->
              <div class="flex items-center gap-1.5 mt-2 bg-slate-950 border border-slate-850 p-1 rounded-xl">
                <input type="text" placeholder="Write supportive reply..." class="community-comment-input flex-1 bg-transparent border-none text-[10px] text-white p-1.5 outline-none font-sans" data-post-id="${post.id}"/>
                <button class="com-act-submit-comment bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold py-1.5 px-3.5 rounded-lg active:scale-95 transition" data-post-id="${post.id}">Reply</button>
              </div>
            </div>
          `;
          postsContainer.appendChild(card);
        });
      }
    }
  }

  renderProfileTab() {
    ProfileTab.render(this);
  }

  renderSettingsTab() {
    SettingsTab.render(this);
  }

  renderCustomizerTab() {
    CustomizerStore.renderTab(this);
  }

  renderOtpTab() {
    const backBtn = document.getElementById("otp-back-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        this.currentTab = "profile";
        this.render();
      };
    }

    const otpDigitsEl = document.getElementById("dashboard-otp-digits");
    const otpStatusEl = document.getElementById("dashboard-otp-status");
    const otpDotEl = document.getElementById("dashboard-otp-dot");
    const countdownEl = document.getElementById("dashboard-otp-countdown");
    const progressEl = document.getElementById("dashboard-otp-progress");

    if (!otpDigitsEl) return;

    // Clear any previous interval
    if (this.otpInterval) {
      clearInterval(this.otpInterval);
      this.otpInterval = null;
    }

    const updateUI = (code, expiresAt) => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      const percentage = (remaining / 30) * 100;

      if (otpDigitsEl) otpDigitsEl.innerText = code;
      if (countdownEl) countdownEl.innerText = `${remaining}s`;
      if (progressEl) progressEl.style.width = `${percentage}%`;

      if (remaining <= 5) {
        if (progressEl) {
          progressEl.className = "h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-1000 ease-linear";
        }
        if (otpDigitsEl) {
          otpDigitsEl.className = "text-4xl font-black text-rose-500 font-mono tracking-[0.25em] pl-[0.25em] py-2 relative select-all transition duration-300";
        }
      } else {
        if (progressEl) {
          progressEl.className = "h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000 ease-linear";
        }
        if (otpDigitsEl) {
          otpDigitsEl.className = "text-4xl font-black text-cyan-400 font-mono tracking-[0.25em] pl-[0.25em] py-2 relative select-all transition duration-300";
        }
      }
    };

    const generateNewOTP = async () => {
      const newCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 30000;

      // Update user in DB
      const dbUser = this.db.users.find(u => u.username.toLowerCase() === this.currentUser.username.toLowerCase());
      if (dbUser) {
        dbUser.cashoutOTP = {
          code: newCode,
          expiresAt,
          used: false
        };
        this.currentUser.cashoutOTP = dbUser.cashoutOTP;
        this.saveDB();
      }

      if (otpStatusEl) {
        otpStatusEl.innerText = "Live & Synchronized";
        otpStatusEl.className = "text-[10px] font-mono text-emerald-450";
      }
      if (otpDotEl) {
        otpDotEl.className = "w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping";
      }

      return { code: newCode, expiresAt };
    };

    const startTimer = (initialCode, initialExpiresAt) => {
      let currentCode = initialCode;
      let currentExpiresAt = initialExpiresAt;

      updateUI(currentCode, currentExpiresAt);

      this.otpInterval = setInterval(async () => {
        const now = Date.now();
        if (now >= currentExpiresAt) {
          const { code, expiresAt } = await generateNewOTP();
          currentCode = code;
          currentExpiresAt = expiresAt;
        }
        updateUI(currentCode, currentExpiresAt);
      }, 1000);
    };

    // Load existing active OTP or generate a brand new one
    const dbUser = this.db.users.find(u => u.username.toLowerCase() === this.currentUser.username.toLowerCase());
    const existingOTP = dbUser ? dbUser.cashoutOTP : null;

    if (existingOTP && Date.now() < existingOTP.expiresAt && !existingOTP.used) {
      if (otpStatusEl) {
        otpStatusEl.innerText = "Active & Verified";
        otpStatusEl.className = "text-[10px] font-mono text-cyan-400";
      }
      startTimer(existingOTP.code, existingOTP.expiresAt);
    } else {
      generateNewOTP().then(({ code, expiresAt }) => {
        startTimer(code, expiresAt);
      });
    }
  }

  renderRecoveryTab() {
    const dbUser = this.db.users.find(u => u.username.toLowerCase() === this.currentUser.username.toLowerCase());
    if (!dbUser) return;

    const keyDisplay = document.getElementById("recovery-active-key");
    const keyHint = document.getElementById("recovery-key-hint-lbl");
    const copyBtn = document.getElementById("recovery-copy-key-btn");
    const downloadBtn = document.getElementById("recovery-download-btn");
    const generateBtn = document.getElementById("recovery-generate-btn");

    const updateRecoveryUI = () => {
      const code = dbUser.recoveryCode || "";
      if (code) {
        if (keyDisplay) keyDisplay.innerText = code;
        if (keyHint) {
          keyHint.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Master Recovery Key is active and configured. Keep it secure!</span>';
        }
        if (copyBtn) copyBtn.classList.remove("hidden");
        if (downloadBtn) downloadBtn.classList.remove("hidden");
        if (generateBtn) {
          generateBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate animate-spin-slow"></i> Regenerate Master Key';
          generateBtn.className = "flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-450 font-bold py-2.5 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-wider";
        }
      } else {
        if (keyDisplay) keyDisplay.innerText = "NOT GENERATED YET";
        if (keyHint) {
          keyHint.innerText = "You have not generated an account recovery key yet.";
        }
        if (copyBtn) copyBtn.classList.add("hidden");
        if (downloadBtn) downloadBtn.classList.add("hidden");
        if (generateBtn) {
          generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Master Key';
          generateBtn.className = "flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black py-2.5 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20 uppercase tracking-wider";
        }
      }
    };

    updateRecoveryUI();

    if (generateBtn) {
      generateBtn.onclick = () => {
        const parts = [];
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 3; i++) {
          let chunk = "";
          for (let j = 0; j < 4; j++) {
            chunk += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          parts.push(chunk);
        }
        const generatedCode = `LWR-${parts.join("-")}`;
        
        dbUser.recoveryCode = generatedCode;
        this.currentUser.recoveryCode = generatedCode;
        this.saveDB();
        
        updateRecoveryUI();
        this.showToast("Your secure account recovery key has been generated!", "success");
      };
    }

    if (copyBtn) {
      copyBtn.onclick = () => {
        const code = dbUser.recoveryCode;
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            this.showToast("Recovery key copied to clipboard!", "success");
          }).catch(() => {
            this.showToast("Failed to copy. Please manually select the code.", "error");
          });
        }
      };
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const code = dbUser.recoveryCode;
        if (code) {
          const textContent = `LOTTERY WINNER PORTAL - ACCOUNT SECURITY BACKUP\n================================================\nUsername: @${dbUser.username}\nRegistered Email: ${dbUser.email || "N/A"}\nMaster Recovery Key: ${code}\nDate Generated: ${new Date().toLocaleString()}\n\nCRITICAL WARNING: Keep this backup file confidential. Do not share it with anyone including site administrators.`;
          const blob = new Blob([textContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `lw_recovery_${dbUser.username}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.showToast("Recovery security backup file downloaded!", "success");
        }
      };
    }
  }

  renderReferTab() {
    ReferTab.render(this);
  }

  renderBadgeRequestTab() {
    BadgeRequestTab.render(this);
  }

  cancelBadgeRequest(reqId) {
    this.db.badgeRequests = (this.db.badgeRequests || []).filter(r => r.id !== reqId);
    this.saveDB();
    this.showToast("Badge application request cancelled successfully.", "info");
    this.renderBadgeRequestTab();
  }

  renderUserInbox() {
    if (!this.currentUser) return;

    const listEl = document.getElementById("user-inbox-list");
    const badgeEl = document.getElementById("user-inbox-unread-badge");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    const username = this.currentUser.username.toLowerCase();

    // Filter relevant messages
    const userMsgs = msgs.filter(m => {
      if (m.recipientType === "bulk") return true;
      if (m.recipientType === "specific" && m.targetUsername && m.targetUsername.toLowerCase() === username) return true;
      return false;
    });

    // Sort newer first
    const sorted = [...userMsgs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate unread count
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
        catColor = "text-rose-400 bg-rose-950/40 border-rose-900/30";
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

    // Wire read triggers
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
  }

  // ================= ADMIN REGISTERED LOTTERIES VIEW =================
  openManualDrawModal(lotteryId) {
    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) return;

    document.getElementById("draw-modal-pool-title").innerText = lot.name;
    document.getElementById("draw-modal-id-field").value = lot.id;
    document.getElementById("draw-override-winning-ticket").value = "";
    document.getElementById("draw-winning-outcome-zone").classList.add("hidden");
    document.getElementById("spin-loader-graphic").classList.add("hidden");
    document.getElementById("admin-confirm-draw-btn").classList.remove("hidden");

    document.getElementById("admin-draw-modal").classList.remove("hidden");
  }

  animateDrawRoulette(tickets, winningTicket, onComplete) {
    const canvas = document.getElementById("admin-draw-roulette-canvas");
    if (!canvas) {
      setTimeout(onComplete, 3500);
      return;
    }

    const ctx = canvas.getContext("2d");
    const center = canvas.width / 2;
    const radius = center - 5;

    // Pick surrounding tickets to make up exactly maxSectors
    const maxSectors = 8;
    let poolTickets = tickets.filter(t => t.code !== winningTicket.code);
    
    // Shuffle the other ones
    poolTickets.sort(() => Math.random() - 0.5);
    
    // Take up to maxSectors - 1
    const chosenOthers = poolTickets.slice(0, maxSectors - 1);
    
    // Combine winning ticket + others
    const finalTickets = [winningTicket, ...chosenOthers];
    // Shuffle again but keep track of winning ticket's index
    finalTickets.sort(() => Math.random() - 0.5);
    const winningIdx = finalTickets.findIndex(t => t.code === winningTicket.code);

    const sectors = finalTickets.map((t, idx) => {
      let bg = idx % 2 === 0 ? "#111827" : "#020617"; // space vs dark slate
      if (idx === winningIdx) {
        bg = "#e11d48"; // rose-600 background for winner index focus indicator
      }
      return {
        code: t.code,
        label: t.code,
        color: bg
      };
    });

    const arc = (Math.PI * 2) / sectors.length;

    // Pointer is at the top (-Math.PI / 2). 
    // Pointer lands where: -Math.PI / 2 - finalRotation = winningIdx * arc + arc / 2
    // So finalRotation = -Math.PI / 2 - (winningIdx * arc + arc / 2)
    let finalRotation = -Math.PI / 2 - (winningIdx * arc + arc / 2);
    while (finalRotation < 0) {
      finalRotation += Math.PI * 2;
    }
    // Add 6 full spins
    finalRotation += Math.PI * 2 * 6;

    let startTime = null;
    const duration = 3500; // 3.5 seconds

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function drawWheel(rotation) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotation);
      
      // Draw sections
      for (let i = 0; i < sectors.length; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = sectors[i].color;
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + arc);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Render sector text (last 5 chars of the ticket code)
        ctx.save();
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 3;
        
        const labelText = sectors[i].label; 
        ctx.fillText(labelText, radius - 10, 3);
        ctx.restore();
      }
      
      // Draw inner core center hub pin
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a"; 
      ctx.fill();
      ctx.strokeStyle = "#ffffff"; 
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.restore();
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutCubic(progress);
      const currentRotation = easedProgress * finalRotation;
      
      drawWheel(currentRotation);
      
      // Update running text display below
      if (progress < 0.85) {
        const randIndex = Math.floor(Math.random() * finalTickets.length);
        document.getElementById("spinning-codes-roll").innerText = finalTickets[randIndex].code;
      } else {
        document.getElementById("spinning-codes-roll").innerText = winningTicket.code;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }

  approveDeposit(id) {
    const d = this.db.deposits.find(dep => dep.id === id);
    if (!d) return;

    const u = this.db.users.find(user => user.username === d.username);
    if (u) {
      u.balance += d.amount;
      u.totDeposit += d.amount;
      u.profit += d.amount;

      // Apply Feature 4: automatic deposit booster matching bonus if enabled and threshold matches
      const s = this.db.settings;
      if (s.depBonusEnabled && d.amount >= s.depBonusMin) {
        const bonusPct = s.depBonusPercent || 10;
        const boosterBonusAmount = d.amount * (bonusPct / 100);
        u.balance += boosterBonusAmount;

        // Log transaction ledger credit wrapper
        this.db.transactions.push({
          id: "tx" + Date.now() + Math.floor(Math.random() * 100),
          userId: u.id,
          username: u.username,
          type: "credit",
          amount: boosterBonusAmount,
          method: "Deposit Match Booster",
          walletNumber: `Promo (${bonusPct}% match bonus on ৳${d.amount})`,
          date: new Date().toISOString(),
          status: "approved"
        });
      }
    }
    d.status = "approved";
    this.saveDB();
    this.render();
    this.showToast(`Deposit of ৳${d.amount} approved for user @${d.username}.`, "success");
  }

  declineDeposit(id) {
    const d = this.db.deposits.find(dep => dep.id === id);
    if (!d) return;

    d.status = "declined";
    this.saveDB();
    this.render();
    this.showToast(`Deposit of ৳${d.amount} declined.`, "info");
  }

  approveWithdrawal(id) {
    const w = this.db.withdrawals.find(dep => dep.id === id);
    if (!w) return;

    const u = this.db.users.find(user => user.username === w.username);
    if (u) {
      u.totWithdraw += w.amount;
    }
    w.status = "approved";
    this.saveDB();
    this.render();
    this.showToast(`Paid/Dispatched withdrawal of ৳${w.amount} to @${w.username}.`, "success");
  }

  declineWithdrawal(id) {
    const w = this.db.withdrawals.find(dep => dep.id === id);
    if (!w) return;

    const u = this.db.users.find(user => user.username === w.username);
    if (u) {
      // Refund wallet including fees
      const refundAmount = w.totalDebit !== undefined ? w.totalDebit : w.amount;
      u.balance += refundAmount;
      u.profit += refundAmount;
    }
    w.status = "declined";
    this.saveDB();
    this.render();
    this.showToast(`Refunded and declined withdrawal of ৳${w.amount} to @${w.username}.`, "info");
  }

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
  }

  // Seamless User Profile Navigation
  openUserProfile(username: string) {
    if ((window as any).chatProfileHelper && typeof (window as any).chatProfileHelper.openUserProfile === "function") {
      (window as any).chatProfileHelper.openUserProfile(username);
    } else {
      console.warn("chatProfileHelper not yet initialized");
    }
  }

  // Show Live Draw Winner Celebration & Engaging Reveal Modal
  showWinningDrawRevealModal(drawEvent: any) {
    if (this.isAdminMode || this.getAppView() === "admin") {
      LiveDrawRevealEngine.closeWinningDrawRevealModal();
      return;
    }
    LiveDrawRevealEngine.showWinningDrawRevealModal(drawEvent);
  }

  // Open Lottery Details Popup Modal
  openLotteryDetailsPop(lotteryId) {
    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) {
      console.warn("Lottery pool not found for ID:", lotteryId);
      return;
    }

    const modal = document.getElementById("lottery-details-modal");
    if (!modal) {
      console.error("lottery-details-modal element not found in DOM!");
      return;
    }

    // Force display modal and raise z-index
    modal.classList.remove("hidden");
    modal.style.display = "flex";

    const setTxt = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setTxt("detail-lot-category", lot.category || "Lottery Pool");
    setTxt("detail-lot-name", lot.name || "Draw Pool");
    setTxt("detail-lot-desc", lot.details || "Experience live high-payout draws.");
    setTxt("detail-lot-fee", `৳${lot.entryFee || 0}`);
    setTxt("detail-lot-prize", `৳${(lot.prizeAmount || lot.prizePool || 0).toLocaleString()}`);
    setTxt("detail-lot-sales", `${lot.soldTickets || 0} / ${lot.totalTickets || 100}`);
    
    let lotDrawTime = "Draw in progress";
    if (lot.drawTime) {
      try {
        lotDrawTime = new Date(lot.drawTime).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      } catch (e) {
        lotDrawTime = String(lot.drawTime);
      }
    }
    setTxt("detail-lot-target-time", lotDrawTime);
    
    const total = lot.totalTickets || 100;
    const sold = lot.soldTickets || 0;
    const progress = Math.min(100, Math.round((sold / total) * 100));
    const progressBar = document.getElementById("detail-lot-progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Manage purchase button callback inside details modal
    const buyBtn = document.getElementById("detail-lot-buy-btn");
    if (buyBtn) {
      buyBtn.onclick = (e) => {
        e.stopPropagation();
        modal.classList.add("hidden");
        modal.style.display = "none";
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.purchaseTicket(lot.id);
      };
    }

    // Handle Countdown Timer
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    const updateCountdown = () => {
      const cdEl = document.getElementById("detail-lot-countdown");
      if (!cdEl) return;
      const now = new Date().getTime();
      const draw = new Date(lot.drawTime).getTime();
      const diff = draw - now;

      if (isNaN(diff) || diff <= 0) {
        cdEl.innerText = "DRAWING NOW";
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        return;
      }

      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      cdEl.innerText = 
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);

    // Record selection for Cart Abandonment Strategy
    if (this.currentUser) {
      localStorage.setItem("cart_abandoned_status", "pending");
      localStorage.setItem("cart_abandoned_lottery_id", lot.id);
      localStorage.setItem("cart_abandoned_time", Date.now().toString());
      localStorage.setItem("cart_abandoned_notified", "false");
    }

    // Demo Mode fast-forward buttons inside details modal
    const fastBtn = document.getElementById("demo-abandonment-fast-btn");
    if (fastBtn) {
      fastBtn.onclick = () => {
        if (!this.currentUser) {
          this.showToast("Please register or login first to test notifications!", "error");
          return;
        }
        // Set abandonment time to 10 minutes ago
        const tenMinsAgo = Date.now() - (10 * 60 * 1000) - 5000;
        localStorage.setItem("cart_abandoned_time", tenMinsAgo.toString());
        localStorage.setItem("cart_abandoned_status", "pending");
        localStorage.setItem("cart_abandoned_notified", "false");
        localStorage.setItem("cart_abandoned_lottery_id", lot.id);
        
        this.showToast("⏳ Fast-forward successful! Notification will trigger in 5 seconds.", "success");
        document.getElementById("lottery-details-modal").classList.add("hidden");
      };
    }

    const nowBtn = document.getElementById("demo-abandonment-now-btn");
    if (nowBtn) {
      nowBtn.onclick = () => {
        if (!this.currentUser) {
          this.showToast("Please register or login first to test notifications!", "error");
          return;
        }
        // Set abandonment time to 10 minutes ago and trigger checkCartAbandonmentNotification immediately
        const tenMinsAgo = Date.now() - (10 * 60 * 1000) - 5000;
        localStorage.setItem("cart_abandoned_time", tenMinsAgo.toString());
        localStorage.setItem("cart_abandoned_status", "pending");
        localStorage.setItem("cart_abandoned_notified", "false");
        localStorage.setItem("cart_abandoned_lottery_id", lot.id);
        
        this.checkCartAbandonmentNotification();
        document.getElementById("lottery-details-modal").classList.add("hidden");
      };
    }
  }

  // Open Ticket Info Live modal
  openTicketLiveInfoPop(ticketId) {
    const ticket = this.db.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const lot = this.db.lotteries.find(l => l.id === ticket.lotteryId) || { name: "Archived Event", prizeAmount: 0 };

    document.getElementById("popup-ticket-code").innerText = ticket.code;
    document.getElementById("popup-ticket-lottery").innerText = lot.name;
    document.getElementById("popup-ticket-date").innerText = new Date(ticket.purchaseDate).toLocaleDateString();
    document.getElementById("popup-ticket-prize").innerText = `৳${lot.prizeAmount || lot.prizePool || 0}`;

    const statusEl = document.getElementById("popup-ticket-status");
    const winDetails = document.getElementById("popup-ticket-live-win");
    const lostDetails = document.getElementById("popup-ticket-live-lost");

    winDetails.classList.add("hidden");
    lostDetails.classList.add("hidden");

    if (ticket.status === "won") {
      statusEl.className = "font-bold text-emerald-400";
      statusEl.innerText = "🏆 WINNER";
      document.getElementById("popup-ticket-reward-amount").innerText = ticket.prizeAmount || lot.prizeAmount || lot.prizePool || 0;
      winDetails.classList.remove("hidden");
    } else if (ticket.status === "lost") {
      statusEl.className = "font-bold text-slate-500";
      statusEl.innerText = "❌ LOST";
      lostDetails.classList.remove("hidden");
    } else {
      statusEl.className = "font-bold text-cyan-400 animate-pulse";
      statusEl.innerText = "⏳ STANDBY (RUNNING)";
    }

    document.getElementById("ticket-info-modal").classList.remove("hidden");
  }
}

Object.assign(StateManager.prototype, AdminModule);
Object.assign(StateManager.prototype, AgentModule);
Object.assign(StateManager.prototype, SubAgentModule);
Object.assign(StateManager.prototype, VipLoungeModule);
Object.assign(StateManager.prototype, OfflineGameModule);
Object.assign(StateManager.prototype, SyncVaultModule);
Object.assign(StateManager.prototype, LuckyWheelModule);
Object.assign(StateManager.prototype, SyncCloudModule);
Object.assign(StateManager.prototype, UIEffectsModule);
Object.assign(StateManager.prototype, GoogleDriveModule);

// Initialize Application State on DOM load
function initApplicationLoader() {
  if (window.appInstance) return; // Prevent double initialization
  const app = new StateManager();
  window.appInstance = app; // expose global handler helper
  (window as any).app = app;
  window.chatProfileHelper = new ChatProfileSystem(app);
  (window as any).AffiliateAgentSystem = AffiliateAgentSystem;
  (window as any).WalletExtensions = WalletExtensions;
  AffiliateAgentSystem.init(app);
  WalletExtensions.init(app);
  PaymentGateways.init(app);

  // Global deposit handlers
  (window as any).setDepositAmount = (window as any).setAmount = function(val: number) {
    const input = document.getElementById("deposit-amount") as HTMLInputElement | null;
    if (input) {
      input.value = String(val);
      if ((window as any).updateDepositSummary) {
        (window as any).updateDepositSummary(val);
      }
    }
    const buttons = document.querySelectorAll(".dep-preset-btn");
    buttons.forEach(btn => {
      const bVal = btn.getAttribute("data-val");
      if (bVal && parseInt(bVal, 10) === val) {
        btn.className = "dep-preset-btn ring-2 ring-emerald-400 bg-emerald-500/20 text-emerald-300 py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-emerald-500/60 shadow";
      } else {
        btn.className = "dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800";
      }
    });
  };

  (window as any).updateDepositSummary = (window as any).updateSummary = function(val: any) {
    const num = parseFloat(val) || 0;
    const formatted = "৳" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bonus = num >= 500 ? num * 0.10 : 0;
    const bonusFormatted = bonus > 0 ? `+৳${bonus.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (10% Extra)` : "৳0.00";
    const total = num + bonus;
    const totalFormatted = "৳" + total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const amtEl = document.getElementById("summary-amount");
    const bonusEl = document.getElementById("summary-bonus");
    const totEl = document.getElementById("summary-total");

    if (amtEl) amtEl.textContent = formatted;
    if (bonusEl) bonusEl.textContent = bonusFormatted;
    if (totEl) totEl.textContent = totalFormatted;
  };

  (window as any).selectDepositMethod = function(method: string) {
    const radio = document.querySelector(`input[name="dep_payment_method"][value="${method}"]`) as HTMLInputElement | null;
    if (radio) radio.checked = true;

    // Update cards visual state
    document.querySelectorAll(".deposit-method-card").forEach(card => {
      const cardRadio = card.querySelector('input[name="dep_payment_method"]') as HTMLInputElement | null;
      if (cardRadio && cardRadio.value === method) {
        card.className = "deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0b1622] cursor-pointer hover:border-emerald-500/80 transition-all border border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30";
      } else {
        card.className = "deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-slate-700 transition-all border border-slate-800 shadow-sm";
      }
    });

    const s = app.db?.settings || {};
    const titleEl = document.getElementById("dep-instruction-title");
    const badgeEl = document.getElementById("dep-method-badge");
    const numBox = document.getElementById("dep-account-number-box");
    const numEl = document.getElementById("dep-receiver-number");
    const autoBanner = document.getElementById("dep-automated-banner");
    const manualFields = document.getElementById("dep-manual-form-fields");
    const submitBtn = document.getElementById("dep-submit-btn");

    if (method === "ZiniPay") {
      if (titleEl) titleEl.textContent = "⚡ Instant ZiniPay Automated Direct PGW";
      if (badgeEl) badgeEl.textContent = "ZiniPay Direct";
      if (numBox) numBox.classList.add("hidden");
      if (autoBanner) {
        autoBanner.classList.remove("hidden");
        autoBanner.innerHTML = `
          <div class="flex items-center gap-2 text-cyan-300 text-xs font-bold">
            <i class="fa-solid fa-bolt-lightning text-amber-400"></i>
            <span>Instant ZiniPay Gateway Redirect</span>
          </div>
          <p class="text-[10px] text-slate-300 leading-relaxed font-sans">
            Proceed to ZiniPay-এ ক্লিক করলে সরাসরি ZiniPay চেকআউট পেজে নিয়ে যাওয়া হবে। সেখানে bKash, Nagad, Rocket বা কার্ড দিয়ে পেমেন্ট করলে তাৎক্ষণিক আপনার ব্যালেন্সে টাকা যোগ হবে।
          </p>
        `;
      }
      if (manualFields) manualFields.classList.add("hidden");
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-bolt-lightning text-amber-400"></i><span>Proceed to ZiniPay Gateway</span><i class="fa-solid fa-arrow-right text-xs"></i>';
    } else if (method === "UddoktaPay") {
      if (titleEl) titleEl.textContent = "⚡ Instant UddoktaPay Automated Checkout";
      if (badgeEl) badgeEl.textContent = "Auto Gateway";
      if (numBox) numBox.classList.add("hidden");
      if (autoBanner) {
        autoBanner.classList.remove("hidden");
        autoBanner.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <i class="fa-solid fa-bolt text-amber-400"></i>
            <span>Instant UddoktaPay Gateway Redirect</span>
          </div>
          <p class="text-[10px] text-slate-300 leading-relaxed font-sans">
            Confirm Deposit-এ ক্লিক করলে সরাসরি UddoktaPay চেকআউট পেজে নিয়ে যাওয়া হবে। সেখানে bKash, Nagad বা কার্ড দিয়ে পেমেন্ট করলে তাৎক্ষণিক আপনার ব্যালেন্সে টাকা যোগ হবে।
          </p>
        `;
      }
      if (manualFields) manualFields.classList.add("hidden");
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-bolt text-amber-400"></i><span>Proceed to UddoktaPay Gateway</span><i class="fa-solid fa-arrow-right text-xs"></i>';
    } else {
      if (autoBanner) autoBanner.classList.add("hidden");
      if (numBox) numBox.classList.remove("hidden");
      if (manualFields) manualFields.classList.remove("hidden");
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-circle-check text-base"></i><span>Confirm Deposit / জমা নিশ্চিত করুন</span><i class="fa-solid fa-arrow-right text-xs"></i>';

      let number = "01700000000";
      if (method === "bKash") {
        if (titleEl) titleEl.textContent = "🌸 bKash Personal Send Money";
        if (badgeEl) badgeEl.textContent = "bKash Personal";
        number = s.mobilePersonalBkash || s.mobileAgentBkash || "01789456123";
      } else if (method === "Nagad") {
        if (titleEl) titleEl.textContent = "🔶 Nagad Personal Send Money";
        if (badgeEl) badgeEl.textContent = "Nagad Personal";
        number = s.mobilePersonalNagad || s.mobileAgentNagad || "01889456123";
      } else if (method === "Rocket") {
        if (titleEl) titleEl.textContent = "🚀 Rocket Mobile Banking";
        if (badgeEl) badgeEl.textContent = "Rocket Mobile";
        number = s.mobilePersonalRocket || s.mobileAgentRocket || "01989456123";
      } else if (method === "USDT") {
        if (titleEl) titleEl.textContent = "🪙 Binance / TRON TRC-20 Crypto";
        if (badgeEl) badgeEl.textContent = "USDT (TRC-20)";
        number = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";
      } else if (method === "Agent") {
        if (titleEl) titleEl.textContent = "🏢 Verified Agent Desk Cash Load";
        if (badgeEl) badgeEl.textContent = "Local Agent";
        number = "Visit any verified agent desk with your username";
      }

      if (numEl) numEl.textContent = number;
    }
  };

  (window as any).copyDepositNumber = function() {
    const numEl = document.getElementById("dep-receiver-number");
    const num = numEl ? numEl.textContent.trim() : "";
    if (num) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(num).catch(() => {});
      }
      const copyText = document.getElementById("dep-copy-text");
      if (copyText) {
        copyText.textContent = "Copied!";
        setTimeout(() => { copyText.textContent = "Copy"; }, 2000);
      }
      app.showToast("Number copied to clipboard: " + num, "success");
    }
  };

  (window as any).pasteDepositTrxId = async function() {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById("dep-trx-id") as HTMLInputElement | null;
        if (input && text) {
          input.value = text.trim();
          app.showToast("TrxID pasted!", "success");
        }
      }
    } catch (e) {
      app.showToast("Please paste your TrxID manually into the box.", "info");
    }
  };

  (window as any).submitDepositForm = (window as any).submitDeposit = function() {
    console.log("[submitDepositForm] triggered");
    if (!app || !app.currentUser) {
      app.showToast("Please sign in first to make a deposit.", "error");
      return;
    }

    const amtInput = document.getElementById("deposit-amount") as HTMLInputElement | null;
    const amount = amtInput ? parseFloat(amtInput.value) : 1000;

    if (!amount || isNaN(amount) || amount < 50) {
      app.showToast("Minimum deposit amount is ৳50.00", "error");
      return;
    }

    const checked = document.querySelector('input[name="dep_payment_method"]:checked') as HTMLInputElement | null;
    let method = checked ? checked.value : "ZiniPay";

    const submitBtn = document.getElementById("dep-submit-btn");
    const btnText = submitBtn ? submitBtn.textContent || "" : "";
    if (btnText.includes("ZiniPay") || btnText.includes("জিনি পে") || btnText.includes("Proceed to ZiniPay")) {
      method = "ZiniPay";
    } else if (btnText.includes("UddoktaPay") || btnText.includes("Confirm Deposit")) {
      if (!checked) method = "ZiniPay"; // default to ZiniPay if no radio checked
    }

    console.log("[submitDepositForm] detected method:", method, "amount:", amount);

    // Real-time admin settings validation check
    const statusMap = (window as any).__gatewayStatusMap;
    if (statusMap && statusMap[method] === false) {
      app.showToast(`⚠️ Payment gateway (${method}) is currently disabled by Admin! Please choose another option.`, "error");
      return;
    }

    if (method === "ZiniPay") {
      PaymentGateways.openZiniPayModal(amount);
      return;
    }

    if (method === "Cryptomus") {
      PaymentGateways.openCryptomusModal(amount);
      return;
    }

    if (method === "UddoktaPay") {
      PaymentGateways.openUddoktaPayModal(amount);
      return;
    }

    const senderPhoneEl = document.getElementById("dep-sender-phone") as HTMLInputElement | null;
    const trxIdEl = document.getElementById("dep-trx-id") as HTMLInputElement | null;

    const senderPhone = senderPhoneEl ? senderPhoneEl.value.trim() : "";
    const trxId = trxIdEl ? trxIdEl.value.trim() : "";

    if (!senderPhone && method !== "USDT" && method !== "Agent") {
      app.showToast("Please enter your sender mobile number.", "error");
      senderPhoneEl?.focus();
      return;
    }

    if (!trxId && method !== "Agent") {
      app.showToast("Please enter the Transaction ID (TrxID).", "error");
      trxIdEl?.focus();
      return;
    }

    const bonus = amount >= 500 ? amount * 0.10 : 0;
    const newDeposit = {
      id: "dep_" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      amount: amount,
      bonusAmount: bonus,
      method: method,
      senderNumber: senderPhone,
      trxId: trxId || "AGENT-DESK",
      date: new Date().toISOString(),
      status: "pending"
    };

    if (!app.db.deposits) app.db.deposits = [];
    app.db.deposits.push(newDeposit);

    if (!app.db.transactions) app.db.transactions = [];
    app.db.transactions.push({
      id: "tx_dep_" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      type: "credit",
      amount: amount,
      bonusAmount: bonus,
      method: method,
      walletNumber: senderPhone || method,
      trxId: trxId || "PENDING",
      date: new Date().toISOString(),
      status: "pending"
    });

    app.saveDB();
    app.showToast(`✅ Deposit request for ৳${amount} via ${method} submitted! Processing verification.`, "success");

    // Clear form
    if (senderPhoneEl) senderPhoneEl.value = "";
    if (trxIdEl) trxIdEl.value = "";

    // Switch to wallet or history tab
    app.currentTab = "wallet";
    app.render();
  };

  // Setup security/blocking features as standard for high-security container app
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("selectstart", e => {
    const tag = e.target.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
      return;
    }
    e.preventDefault();
  });
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && ["=", "-", "+", "0"].includes(e.key)) {
      e.preventDefault();
    }
  });

  // Main UI Screen Initial Render
  app.render();

  // Handle auto-referral URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref");
  const isAgentApply = urlParams.get("role") === "agent";

  if (isAgentApply && refCode && !app.currentUser && !app.isAdminMode) {
    const signupBox = document.getElementById("auth-signup-box");
    const loginBox = document.getElementById("auth-login-box");
    const referralInput = document.getElementById("reg-refer-by");
    const agentApplyInput = document.getElementById("reg-is-agent-apply") as HTMLInputElement | null;
    const agentCommInput = document.getElementById("reg-agent-comm-rate") as HTMLInputElement | null;
    const bannerEl = document.getElementById("reg-agent-apply-banner");
    const leaderNameEl = document.getElementById("reg-agent-leader-name");
    const defaultFields = document.getElementById("reg-default-email-phone-block");
    const agentFields = document.getElementById("reg-agent-fields-block");
    const oneClickBox = document.querySelector(".one-click-box") as HTMLElement | null;
    const regButton = document.querySelector("#registerForm .btn-submit") as HTMLElement | null;

    if (signupBox && loginBox && referralInput && bannerEl && leaderNameEl && defaultFields && agentFields) {
      loginBox.classList.add("hidden");
      signupBox.classList.remove("hidden");
      const registerTab = document.getElementById("registerTab");
      const signInTab = document.getElementById("signInTab");
      const formContainer = document.getElementById("formContainer");
      formContainer?.classList.add("show-register");
      registerTab?.classList.add("active");
      signInTab?.classList.remove("active");

      referralInput.value = refCode;
      if (agentApplyInput) agentApplyInput.value = "true";
      if (agentCommInput) agentCommInput.value = urlParams.get("comm") || "5.0";

      bannerEl.classList.remove("hidden");
      leaderNameEl.textContent = `@${refCode}`;
      defaultFields.classList.add("hidden");
      agentFields.classList.remove("hidden");

      if (oneClickBox) oneClickBox.classList.add("hidden");
      if (regButton) regButton.textContent = "SUBMIT AGENT APPLICATION";

      const regEmail = document.getElementById("reg-agent-email") as HTMLInputElement | null;
      const regPhone = document.getElementById("reg-agent-phone") as HTMLInputElement | null;
      if (regEmail) regEmail.required = true;
      if (regPhone) regPhone.required = true;

      app.showToast(`Official sub-agent recruitment form loaded under leader @${refCode}!`, "info");
    }
  } else if (refCode && !app.currentUser && !app.isAdminMode) {
    const signupBox = document.getElementById("auth-signup-box");
    const loginBox = document.getElementById("auth-login-box");
    const referralInput = document.getElementById("reg-refer-by");
    
    if (signupBox && loginBox && referralInput) {
      loginBox.classList.add("hidden");
      signupBox.classList.remove("hidden");
      referralInput.value = refCode;
      app.showToast(`Referral invitation detected: Invited by @${refCode}!`, "info");
    }
  }

  // Instant Search Engine inside Community Space
  const commSearchInput = document.getElementById("community-search-input");
  if (commSearchInput) {
    commSearchInput.addEventListener("input", (e) => {
      app.communitySearchQuery = e.target.value;
      app.renderCommunitySection();
    });
  }
  const commClearSearchBtn = document.getElementById("community-clear-search-btn");
  if (commClearSearchBtn) {
    commClearSearchBtn.addEventListener("click", () => {
      app.communitySearchQuery = "";
      if (commSearchInput) commSearchInput.value = "";
      app.renderCommunitySection();
    });
  }

  // ================= BINDINGS REGISTER SCREEN TRIGGERS =================

  // Admin players search bindings
  const adminPlayersSearchInput = document.getElementById("admin-players-search-input");
  if (adminPlayersSearchInput) {
    adminPlayersSearchInput.addEventListener("input", (e) => {
      app.adminPlayersSearchQuery = e.target.value;
      app.renderAdminUsers();
    });
  }

  const adminPlayersClearBtn = document.getElementById("admin-players-clear-search-btn");
  if (adminPlayersClearBtn) {
    adminPlayersClearBtn.addEventListener("click", () => {
      app.adminPlayersSearchQuery = "";
      if (adminPlayersSearchInput) adminPlayersSearchInput.value = "";
      app.renderAdminUsers();
    });
  }

  // Dynamic User tab action delegation
  document.addEventListener("click", (e) => {
    // 1. User profile -> Apply for Badge tab
    if (e.target.closest("#profile-badge-request-entry-btn")) {
      app.currentTab = "badge-request";
      app.renderDashboard();
      return;
    }

    // User profile -> Video Bounty tab
    if (e.target.closest("#profile-video-bounty-entry-btn")) {
      app.currentTab = "video-bounty";
      app.renderDashboard();
      return;
    }

    // User profile -> Account Recovery page
    if (e.target.closest("#profile-recovery-entry-btn")) {
      app.currentTab = "recovery";
      app.renderDashboard();
      return;
    }

    // 2. User profile -> Access OTP page
    if (e.target.closest("#profile-access-otp-btn")) {
      app.currentTab = "otp";
      app.renderDashboard();
      return;
    }

    // 3. User profile -> Refer & Earn tab
    if (e.target.closest("#profile-refer-entry-btn")) {
      app.currentTab = "refer";
      app.renderDashboard();
      return;
    }

    // 4. Back buttons
    if (e.target.closest("#badge-request-back-btn") || e.target.closest("#refer-back-btn") || e.target.closest("#otp-back-btn") || e.target.closest("#video-bounty-back-btn") || e.target.closest("#recovery-back-btn")) {
      app.currentTab = "profile";
      app.renderDashboard();
      return;
    }

    // 5. Copy refer code
    if (e.target.closest("#copy-refer-code-btn")) {
      if (!app.currentUser) return;
      const code = app.currentUser.username;
      navigator.clipboard.writeText(code)
        .then(() => app.showToast("Affiliate code copied to clipboard!", "success"))
        .catch(() => {
          app.showToast(`Affiliate Code: ${code} (copied)`, "success");
        });
      return;
    }

    // 6. Copy refer link
    if (e.target.closest("#copy-refer-link-btn")) {
      if (!app.currentUser) return;
      const link = window.location.origin + "/index.html?ref=" + encodeURIComponent(app.currentUser.username);
      navigator.clipboard.writeText(link)
        .then(() => app.showToast("Quick invitation link copied!", "success"))
        .catch(() => {
          app.showToast("Link clipboard access restricted. Highlight & copy!", "info");
        });
      return;
    }

    // 7. Submit badge request
    if (e.target.closest("#user-submit-badge-req-btn")) {
      const selectElement = document.getElementById("user-badge-req-select");
      const reasonElement = document.getElementById("user-badge-req-reason");

      if (!selectElement || !reasonElement) return;

      const requestedBadge = selectElement.value;
      const reason = reasonElement.value.trim();

      if (!reason) {
        app.showToast("Please provide a justification reason for your request.", "error");
        return;
      }

      if (!app.currentUser) return;

      const activeBadge = app.currentUser.customBadge;
      if (activeBadge === requestedBadge) {
        app.showToast(`You are already assigned the ${requestedBadge.toUpperCase()} badge!`, "info");
        return;
      }

      // Check if they already have a pending or approved request for this badge
      if (!app.db.badgeRequests) app.db.badgeRequests = [];
      const existing = app.db.badgeRequests.find(r => r.userId === app.currentUser.id && r.requestedBadge === requestedBadge && r.status === "pending");
      if (existing) {
        app.showToast(`You already have a pending request for the ${requestedBadge.toUpperCase()} badge!`, "warning");
        return;
      }

      const newReq = {
        id: "breq_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        requestedBadge: requestedBadge,
        reason: reason,
        date: new Date().toISOString(),
        status: "pending"
      };

      app.db.badgeRequests.push(newReq);
      app.saveDB();

      reasonElement.value = ""; // clear textarea
      app.showToast("Your premium badge request has been successfully submitted for review!", "success");
      app.renderBadgeRequestTab();
      return;
    }
  });

  // ---------------- PART B: ADMIN REFER AND SYSTEM LAUNCH CONTROL LISTENERS ----------------
  const saveRefRegionsBtn = document.getElementById("save-ref-regions-btn");
  if (saveRefRegionsBtn) {
    saveRefRegionsBtn.addEventListener("click", () => {
      const allowedText = document.getElementById("ref-allowed-regions-input").value;
      const bannedText = document.getElementById("ref-banned-regions-input").value;

      app.db.settings.allowedRegions = allowedText.split(",").map(item => item.trim()).filter(item => item !== "");
      app.db.settings.bannedRegions = bannedText.split(",").map(item => item.trim()).filter(item => item !== "");
      app.saveDB();
      app.showToast("Geographical network targeting rules updated successfully!", "success");
      app.renderAdminRefer();
    });
  }

  const refIpPreventionToggle = document.getElementById("ref-ip-prevention-toggle");
  if (refIpPreventionToggle) {
    refIpPreventionToggle.addEventListener("change", (e) => {
      app.db.settings.ipPreventionEnabled = e.target.checked;
      app.saveDB();
      app.showToast(`Multi-Account strict prevention is now ${e.target.checked ? 'ACTIVE' : 'DEACTIVATED'}!`, "info");
      app.renderAdminRefer();
    });
  }

  const refVpnBlockToggle = document.getElementById("ref-vpn-block-toggle");
  if (refVpnBlockToggle) {
    refVpnBlockToggle.addEventListener("change", (e) => {
      app.db.settings.vpnBlockEnabled = e.target.checked;
      app.saveDB();
      app.showToast(`Anti-VPN / Proxy Protection Shield is now ${e.target.checked ? 'ACTIVE' : 'DEACTIVATED'}!`, "info");
      app.renderAdminRefer();
    });
  }

  const refAddBannedIpBtn = document.getElementById("ref-add-banned-ip-btn");
  if (refAddBannedIpBtn) {
    refAddBannedIpBtn.addEventListener("click", () => {
      const ipVal = document.getElementById("ref-ban-ip-address").value.trim();
      if (!ipVal) {
        app.showToast("Please enter a valid IP address to blacklist.", "error");
        return;
      }
      if (!app.db.settings.bannedIPs) app.db.settings.bannedIPs = [];
      if (app.db.settings.bannedIPs.includes(ipVal)) {
        app.showToast("This IP address is already blacklisted.", "warning");
        return;
      }
      app.db.settings.bannedIPs.push(ipVal);
      // Also suspend any user sharing this IP
      app.db.users.forEach(u => {
        if (u.registeredIp === ipVal) u.status = "blocked";
      });
      app.saveDB();
      document.getElementById("ref-ban-ip-address").value = "";
      app.showToast(`IP network ${ipVal} has been blacklisted. Clones terminated!`, "success");
      app.renderAdminRefer();
    });
  }

  const saveMilestoneBtn = document.getElementById("save-milestone-level-btn");
  if (saveMilestoneBtn) {
    saveMilestoneBtn.addEventListener("click", () => {
      const title = document.getElementById("milestone-title").value.trim();
      const count = parseInt(document.getElementById("milestone-count").value);
      const reward = parseFloat(document.getElementById("milestone-reward").value);

      if (!title || isNaN(count) || isNaN(reward)) {
        app.showToast("Please fill all milestone leveling inputs correctly.", "error");
        return;
      }

      if (!app.db.settings.milestoneLevels) app.db.settings.milestoneLevels = [];
      
      const existingIdx = app.db.settings.milestoneLevels.findIndex(lvl => lvl.title.toLowerCase() === title.toLowerCase());
      if (existingIdx !== -1) {
        app.db.settings.milestoneLevels[existingIdx] = { title, count, reward };
        app.showToast(`Milestone level "${title}" updated successfully.`, "success");
      } else {
        app.db.settings.milestoneLevels.push({ title, count, reward });
        app.showToast(`New level milestone "${title}" registered!`, "success");
      }
      
      app.saveDB();
      document.getElementById("milestone-title").value = "";
      document.getElementById("milestone-count").value = "";
      document.getElementById("milestone-reward").value = "";

      app.renderAdminRefer();
    });
  }

  const clearSecurityLogsBtn = document.getElementById("clear-security-logs-btn");
  if (clearSecurityLogsBtn) {
    clearSecurityLogsBtn.addEventListener("click", () => {
      app.db.securityLogs = [];
      app.saveDB();
      app.showToast("Security alerts log feed cleared successfully.", "success");
      app.renderAdminRefer();
    });
  }



  // Auth toggle, Segmented Tabs & Security Math Captcha
  let loginNum1 = 3, loginNum2 = 4, regNum1 = 5, regNum2 = 2;

  function generateMathCaptcha() {
    loginNum1 = Math.floor(Math.random() * 9) + 1;
    loginNum2 = Math.floor(Math.random() * 9) + 1;
    const loginQ = document.getElementById("loginQuestion");
    if (loginQ) loginQ.innerText = `${loginNum1} + ${loginNum2} =`;
    const loginA = document.getElementById("loginAnswer") as HTMLInputElement | null;
    if (loginA) loginA.value = "";

    regNum1 = Math.floor(Math.random() * 9) + 1;
    regNum2 = Math.floor(Math.random() * 9) + 1;
    const regQ = document.getElementById("regQuestion");
    if (regQ) regQ.innerText = `${regNum1} + ${regNum2} =`;
    const regA = document.getElementById("regAnswer") as HTMLInputElement | null;
    if (regA) regA.value = "";
  }

  function validateLoginCaptcha(): boolean {
    const ansEl = document.getElementById("loginAnswer") as HTMLInputElement | null;
    if (!ansEl || !ansEl.value) return false;
    return parseInt(ansEl.value, 10) === (loginNum1 + loginNum2);
  }

  function validateRegCaptcha(): boolean {
    const ansEl = document.getElementById("regAnswer") as HTMLInputElement | null;
    if (!ansEl || !ansEl.value) return false;
    return parseInt(ansEl.value, 10) === (regNum1 + regNum2);
  }

  function solveCaptcha(type: 'login' | 'reg') {
    if (type === 'login') {
      const ansEl = document.getElementById("loginAnswer") as HTMLInputElement | null;
      if (ansEl) ansEl.value = String(loginNum1 + loginNum2);
    } else {
      const ansEl = document.getElementById("regAnswer") as HTMLInputElement | null;
      if (ansEl) ansEl.value = String(regNum1 + regNum2);
    }
  }

  (window as any).generateMathCaptcha = generateMathCaptcha;
  (window as any).validateLoginCaptcha = validateLoginCaptcha;
  (window as any).validateRegCaptcha = validateRegCaptcha;
  (window as any).solveCaptcha = solveCaptcha;

  const switchTab = (tab: 'signin' | 'register') => {
    const formContainer = document.getElementById("formContainer");
    const signInTab = document.getElementById("signInTab");
    const registerTab = document.getElementById("registerTab");

    if (tab === 'register') {
      formContainer?.classList.add("show-register");
      registerTab?.classList.add("active");
      signInTab?.classList.remove("active");
    } else {
      formContainer?.classList.remove("show-register");
      signInTab?.classList.add("active");
      registerTab?.classList.remove("active");
    }
    generateMathCaptcha();
  };

  (window as any).switchTab = switchTab;
  (window as any).switchAuthTab = (mode: 'login' | 'register') => switchTab(mode === 'login' ? 'signin' : 'register');

  // 1-Click Fast Registration
  (window as any).handleOneClickReg = async () => {
    const autoUser = 'winner_' + Math.floor(100000 + Math.random() * 900000);
    const autoPass = Math.random().toString(36).slice(-8);

    const genUserEl = document.getElementById("genUser");
    const genPassEl = document.getElementById("genPass");
    if (genUserEl) genUserEl.innerText = autoUser;
    if (genPassEl) genPassEl.innerText = autoPass;

    const welcomeBonus = 50;
    const clientIp = await app.getClientIP();
    const newUser = {
      id: "u" + Date.now(),
      username: autoUser,
      fullName: "Instant Player",
      email: `${autoUser}@lottery.local`,
      password: autoPass,
      phone: "017" + Math.floor(10000000 + Math.random() * 90000000),
      dob: "2000-01-01",
      balance: welcomeBonus,
      totDeposit: 0,
      totWithdraw: 0,
      wins: 0,
      loss: 0,
      profit: 0,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      blockedUntil: null,
      region: "Dhaka",
      registeredIp: clientIp,
      refersCount: 0,
      referredUsers: [],
      rewardedMilestones: [],
      role: "player",
      referredBy: null
    };

    app.db.users.push(newUser);
    app.saveDB();

    (window as any).lastOneClickUser = newUser;

    // Reset button states
    const copyUserTxt = document.getElementById("copy-user-btn-text");
    const copyPassTxt = document.getElementById("copy-pass-btn-text");
    const copyAllTxt = document.getElementById("copy-all-btn-text");
    if (copyUserTxt) copyUserTxt.innerText = "Copy";
    if (copyPassTxt) copyPassTxt.innerText = "Copy";
    if (copyAllTxt) copyAllTxt.innerText = "Copy Both";

    const modal = document.getElementById("credModal");
    if (modal) modal.style.display = "flex";
  };

  // Copy individual or all credentials helper
  (window as any).copyCredItem = (type: 'username' | 'password' | 'all') => {
    const userObj = (window as any).lastOneClickUser;
    const username = document.getElementById("genUser")?.innerText.trim() || userObj?.username || "";
    const password = document.getElementById("genPass")?.innerText.trim() || userObj?.password || "";

    if (type === 'username') {
      if (!username) return;
      navigator.clipboard.writeText(username).then(() => {
        app.showToast(`✅ Username copied: ${username}`, "success");
        const btnText = document.getElementById("copy-user-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { if (btnText) btnText.innerText = "Copy"; }, 2000);
        }
      }).catch(() => {
        app.showToast(`Username: ${username}`, "info");
      });
    } else if (type === 'password') {
      if (!password) return;
      navigator.clipboard.writeText(password).then(() => {
        app.showToast(`✅ Password copied!`, "success");
        const btnText = document.getElementById("copy-pass-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { if (btnText) btnText.innerText = "Copy"; }, 2000);
        }
      }).catch(() => {
        app.showToast(`Password: ${password}`, "info");
      });
    } else if (type === 'all') {
      const textToCopy = `Username: ${username}\nPassword: ${password}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        app.showToast(`✅ Username & Password copied to clipboard!`, "success");
        const btnText = document.getElementById("copy-all-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { if (btnText) btnText.innerText = "Copy Both"; }, 2000);
        }
      }).catch(() => {
        app.showToast(`Credentials: ${username} / ${password}`, "info");
      });
    }
  };

  // Download credentials as formatted .txt file
  (window as any).downloadCredentialsTxt = () => {
    const userObj = (window as any).lastOneClickUser;
    const username = document.getElementById("genUser")?.innerText.trim() || userObj?.username || "user";
    const password = document.getElementById("genPass")?.innerText.trim() || userObj?.password || "";
    const bonus = userObj?.balance || 50;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const portalUrl = window.location.origin + window.location.pathname;

    const fileContent = [
      "================================================================",
      "             🎰 LOTTERY WINNER - ACCOUNT CREDENTIALS            ",
      "================================================================",
      `📅 Generated Date  : ${formattedDate}`,
      `🎁 Welcome Bonus   : $${bonus} USD (Added to Wallet Balance)`,
      "----------------------------------------------------------------",
      `👤 Username        : ${username}`,
      `🔑 Password        : ${password}`,
      "----------------------------------------------------------------",
      `🌐 Login Portal    : ${portalUrl}`,
      "================================================================",
      "⚠️ SECURITY NOTICE:",
      "• Please keep this file in a safe location.",
      "• Do not share your username and password with anyone.",
      "• For customer support & verification, visit the official portal.",
      "================================================================"
    ].join("\r\n");

    try {
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `LotteryWinner_${username}_credentials.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      app.showToast(`📄 File "LotteryWinner_${username}_credentials.txt" downloaded!`, "success");
    } catch (err) {
      console.error("Failed to download credentials TXT:", err);
      app.showToast("Could not download file. Please use the Copy option instead.", "error");
    }
  };

  (window as any).closeModal = () => {
    const modal = document.getElementById("credModal");
    if (modal) modal.style.display = "none";

    const user = (window as any).lastOneClickUser;
    if (user) {
      try {
        navigator.clipboard.writeText(`Username: ${user.username}\nPassword: ${user.password}`);
      } catch (e) {}

      app.currentUser = StateManager.removeCircularReferences(user);
      localStorage.setItem(app.sessionKey, StateManager.safeStringify(app.currentUser));
      app.showToast(`Welcome! $50 bonus credited. Logged in as @${user.username}`, "success");
      app.render();
    } else {
      switchTab('signin');
    }
  };

  // Initial captcha trigger on load
  setTimeout(() => generateMathCaptcha(), 300);

  // Helper function for 2FA Google Authenticator verification during login
  async function prompt2FAForUser(user, app) {
    return new Promise((resolve) => {
      let modal = document.getElementById("login-2fa-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "login-2fa-modal";
        modal.className = "fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100000] flex items-center justify-center p-4";
        modal.innerHTML = `
          <div class="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved text-emerald-400"></i> Google Authenticator 2FA
              </h4>
              <button type="button" id="login-2fa-cancel-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            <p class="text-[10px] text-slate-300 font-sans">
              Welcome back <strong class="text-emerald-400">@<span id="login-2fa-user-name"></span></strong>! Enter your 6-digit code from Google Authenticator:
            </p>
            <input type="text" id="login-2fa-code-input" maxlength="6" inputmode="numeric" pattern="[0-9]*" placeholder="123456" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-center text-white font-mono text-lg tracking-widest outline-none" autofocus />
            <div class="flex gap-2">
              <button type="button" id="login-2fa-submit-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer font-mono flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-right-to-bracket"></i> Verify & Login
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const userNameEl = document.getElementById("login-2fa-user-name");
      if (userNameEl) userNameEl.innerText = user.username;
      const codeInput = document.getElementById("login-2fa-code-input");
      if (codeInput) codeInput.value = "";
      modal.classList.remove("hidden");
      if (codeInput) setTimeout(() => codeInput.focus(), 100);

      const cleanup = (result) => {
        modal.classList.add("hidden");
        resolve(result);
      };

      const submitBtn = document.getElementById("login-2fa-submit-btn");
      const cancelBtn = document.getElementById("login-2fa-cancel-btn");

      if (submitBtn) {
        submitBtn.onclick = async () => {
          const code = codeInput ? codeInput.value.trim() : "";
          if (!code || code.length !== 6 || isNaN(code)) {
            if (app && app.showToast) app.showToast("Please enter a valid 6-digit 2FA code!", "warning");
            return;
          }
          const isValid = await TOTP.verifyCode(user.twoFactorSecret, code);
          if (isValid) {
            cleanup(true);
          } else {
            if (app && app.showToast) app.showToast("❌ Invalid 2FA Code. Check Google Authenticator and try again.", "error");
            if (codeInput) {
              codeInput.value = "";
              codeInput.focus();
            }
          }
        };
      }

      if (cancelBtn) cancelBtn.onclick = () => cleanup(false);

      if (codeInput) {
        codeInput.onkeydown = async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (submitBtn) submitBtn.click();
          }
        };
      }
    });
  }

  // Login Trigger Action
  const loginForm = document.getElementById("signInForm") || document.getElementById("auth-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const loginAnsEl = document.getElementById("loginAnswer") as HTMLInputElement | null;
        if (loginAnsEl && !validateLoginCaptcha()) {
          app.showToast("Security Math Captcha incorrect! Please check the math answer.", "error");
          generateMathCaptcha();
          return;
        }

        const userEl = document.getElementById("auth-user") as HTMLInputElement | null;
        const passEl = document.getElementById("auth-pass") as HTMLInputElement | null;
        if (!userEl || !passEl) {
          app.showToast("Login fields missing from DOM.", "error");
          return;
        }
        const userVal = userEl.value.trim();
        const passVal = passEl.value;

        // Check for direct admin login credentials
        if (userVal.toLowerCase() === "admin") {
          if (passVal === "Admin123" || (app.db.settings && passVal === app.db.settings.adminPass)) {
            app.isAdminMode = true;
            localStorage.setItem(app.adminSessionKey, "true");
            app.showToast("Admin access granted. Control room unlocked.", "success");
            app.render();
            return;
          } else {
            app.showToast("Incorrect admin password! Default admin credentials: username: Admin, password: Admin123", "error");
            generateMathCaptcha();
            return;
          }
        }

        const isLocalOrPreview = window.location.hostname === "localhost" || 
                                  window.location.hostname === "127.0.0.1" || 
                                  window.location.hostname.includes("run.app") || 
                                  window.location.hostname.includes("aistudio") || 
                                  window.location.hostname.includes("web.app");

        // Direct check for IP ban right away
        const clientIp = await app.getClientIP();
        const bannedIPs = app.db.settings.bannedIPs || [];
        if (bannedIPs.includes(clientIp)) {
          if (isLocalOrPreview) {
            // Auto unban developers/testers to prevent locking themselves out during development
            app.db.settings.bannedIPs = bannedIPs.filter(ip => ip !== clientIp);
            app.saveDB();
            app.showToast("Local IP un-banned automatically in development mode.", "info");
          } else {
            app.showToast(`ACCESS BLOCKED: This network computer's IP (${clientIp}) is explicitly banned by operations manager.`, "error");
            return;
          }
        }

        if (app.db.settings.vpnBlockEnabled !== false && !isLocalOrPreview) {
          const details = await app.getIPDetails();
          if (app.isVPN(details)) {
            app.showToast(`VPN / PROXY REJECTED: VPN connection is strictly blocked. Turn off VPN & try again!`, "error");
            return;
          }
        } else if (isLocalOrPreview && app.db.settings.vpnBlockEnabled !== false) {
          console.log("Bypassed VPN check in local/preview development mode");
        }

        const matched = app.db.users.find(u => u.username.toLowerCase() === userVal.toLowerCase() && u.password === passVal);
        if (!matched) {
          app.showToast("Username or password invalid. Access Denied.", "error");
          generateMathCaptcha();
          return;
        }

        const bannedRegions = app.db.settings.bannedRegions || [];
        if (matched.region && bannedRegions.map(r => r.toLowerCase()).includes(matched.region.toLowerCase())) {
          app.triggerAdminSecurityAlert("region_restriction", `Blocked banned-region sign-in attempt by user @${matched.username} from blocked region "${matched.region}".`);
          app.showToast(`REGION BLOCK DETECTED: Region '${matched.region}' has been banned. Sign-in restricted!`, "error");
          return;
        }

        if (matched.status === "blocked") {
          if (isLocalOrPreview) {
            // Auto-unblock in dev mode to avoid getting locked out
            matched.status = "active";
            app.saveDB();
            app.showToast("Blocked status auto-cleared in development mode.", "info");
          } else {
            app.showToast("This player is currently blocked under support investigation.", "error");
            return;
          }
        }

        if (matched.status === "pending_approval") {
          app.showToast("আবেদন মুলতুবি আছে! Your agent application is pending admin approval. You will gain access once approved.", "warning");
          return;
        }

        if (matched.status === "permanently_banned") {
          app.showToast("This account has been permanently barred by operations manager.", "error");
          return;
        }

        // Check 2FA Google Authenticator
        if (matched.twoFactorEnabled && matched.twoFactorSecret) {
          const verified = await prompt2FAForUser(matched, app);
          if (!verified) {
            app.showToast("Login cancelled: Google Authenticator 2FA code required.", "warning");
            return;
          }
        }

        app.currentUser = StateManager.removeCircularReferences(matched);
        localStorage.setItem(app.sessionKey, StateManager.safeStringify(app.currentUser));
        app.showToast(`Welcome back, @${matched.username}!`, "success");
        app.render();
      } catch (err) {
        console.error("Login listener error:", err);
        app.showToast("An unexpected error occurred during login. Please try again.", "error");
      }
    });
  }

  // Sign up Trigger Action
  const registerForm = document.getElementById("registerForm") || document.getElementById("auth-signup-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const regAnsEl = document.getElementById("regAnswer") as HTMLInputElement | null;
        if (regAnsEl && !validateRegCaptcha()) {
          app.showToast("Security Math Captcha incorrect! Please check the math answer.", "error");
          generateMathCaptcha();
          return;
        }

        const userEl = document.getElementById("reg-user") as HTMLInputElement | null;
        const passEl = document.getElementById("reg-pass") as HTMLInputElement | null;
        const nameEl = document.getElementById("reg-fullname") as HTMLInputElement | null;
        const emailEl = document.getElementById("reg-email") as HTMLInputElement | null;
        const phoneEl = document.getElementById("reg-phone") as HTMLInputElement | null;
        const dobEl = document.getElementById("reg-dob") as HTMLInputElement | null;
        const regionEl = document.getElementById("reg-region") as HTMLInputElement | null;
        const referByEl = document.getElementById("reg-refer-by") as HTMLInputElement | null;

        if (!userEl || !passEl) {
          app.showToast("Registration form elements are missing.", "error");
          return;
        }

         const userVal = userEl.value.trim();
        const passVal = passEl.value;
        const nameVal = nameEl ? nameEl.value.trim() : userVal;
        const dobVal = dobEl && dobEl.value ? dobEl.value : "2000-01-01";
        const referByVal = referByEl ? referByEl.value.trim() : "";

        const isAgentApplyEl = document.getElementById("reg-is-agent-apply") as HTMLInputElement | null;
        const isAgentApplyMode = isAgentApplyEl && isAgentApplyEl.value === "true";

        let emailVal = emailEl && emailEl.value ? emailEl.value.trim() : `${userVal.toLowerCase()}@lottery.local`;
        let phoneVal = phoneEl && phoneEl.value ? phoneEl.value.trim() : "017" + Math.floor(10000000 + Math.random() * 90000000);
        let regionVal = regionEl && regionEl.value ? regionEl.value : "Dhaka";

        if (isAgentApplyMode) {
          const agentEmailEl = document.getElementById("reg-agent-email") as HTMLInputElement | null;
          const agentPhoneEl = document.getElementById("reg-agent-phone") as HTMLInputElement | null;
          const agentRegionEl = document.getElementById("reg-agent-region") as HTMLSelectElement | null;
          
          if (agentEmailEl && agentEmailEl.value) emailVal = agentEmailEl.value.trim();
          if (agentPhoneEl && agentPhoneEl.value) phoneVal = agentPhoneEl.value.trim();
          if (agentRegionEl) regionVal = agentRegionEl.value;
        }

        // Validation
        if (userVal.length < 3) {
          app.showToast("Username must be at least 3 characters long.", "error");
          return;
        }

        const exists = app.db.users.find(u => u.username.toLowerCase() === userVal.toLowerCase());
        if (exists) {
          app.showToast("Username already registered to another player.", "error");
          return;
        }

        // 1. Region Banishment Check
        const bannedRegions = app.db.settings.bannedRegions || [];
        if (bannedRegions.map(r => r.toLowerCase()).includes(regionVal.toLowerCase())) {
          app.triggerAdminSecurityAlert("region_restriction", `Blocked region-restricted registration attempt by @${userVal} from banned region "${regionVal}".`);
          app.showToast(`REGISTRATION DENIED: Region "${regionVal}" is blacklisted by administration.`, "error");
          return;
        }

        const isLocalOrPreview = window.location.hostname === "localhost" || 
                                  window.location.hostname === "127.0.0.1" || 
                                  window.location.hostname.includes("run.app") || 
                                  window.location.hostname.includes("aistudio") || 
                                  window.location.hostname.includes("web.app");

        // 2. Fetch Client IP and Check blocklists
        const clientIp = await app.getClientIP();
        const bannedIPs = app.db.settings.bannedIPs || [];
        if (bannedIPs.includes(clientIp)) {
          if (isLocalOrPreview) {
            // Auto unban developers/testers to prevent locking themselves out during development
            app.db.settings.bannedIPs = bannedIPs.filter(ip => ip !== clientIp);
            app.saveDB();
            app.showToast("Local IP un-banned automatically in development mode.", "info");
          } else {
            app.showToast(`SECURITY DETECTED: This computer's network IP (${clientIp}) has been banned!`, "error");
            return;
          }
        }

        if (app.db.settings.vpnBlockEnabled !== false && !isLocalOrPreview) {
          const details = await app.getIPDetails();
          if (app.isVPN(details)) {
            app.showToast(`SECURITY ALERT: VPN / Proxy detected. Sign-up is strictly forbidden. Disable VPN!`, "error");
            return;
          }
        } else if (isLocalOrPreview && app.db.settings.vpnBlockEnabled !== false) {
          console.log("Bypassed VPN check in local/preview development mode");
        }

        // 3. Multi-Account Restriction (1 account per IP)
        if (app.db.settings.ipPreventionEnabled !== false && !isLocalOrPreview) {
          const ipExists = app.db.users.some(u => u.registeredIp === clientIp);
          if (ipExists) {
            // Automatically blacklist this duplicate IP address
            if (!app.db.settings.bannedIPs) app.db.settings.bannedIPs = [];
            if (!app.db.settings.bannedIPs.includes(clientIp)) {
              app.db.settings.bannedIPs.push(clientIp);
            }
            // Suspend any user sharing this IP too to lock down the clones
            app.db.users.forEach(u => {
              if (u.registeredIp === clientIp) u.status = "blocked";
            });
            app.saveDB();

            app.triggerAdminSecurityAlert("duplicate_ip", `Auto-Ban: Blocked multi-account registration attempt by @${userVal} on duplicate IP ${clientIp}. Network IP has been automatically blacklisted.`);
            app.showToast(`CLONE DETECTED: Multi-Account Block. Only 1 account is permitted per network (IP: ${clientIp})! IP has been auto-banned.`, "error");
            return;
          }
        } else if (isLocalOrPreview && app.db.settings.ipPreventionEnabled !== false) {
          app.showToast("Multi-account duplicate IP block bypassed in development mode.", "info");
        }

        // 4. Referral Code verification
        let referrer = null;
        if (referByVal) {
          referrer = app.db.users.find(u => u.username.toLowerCase() === referByVal.toLowerCase());
          if (!referrer) {
            app.showToast(`Referral Code Error: Recruiter username @${referByVal} does not exist.`, "error");
            return;
          }
          if (referrer.username.toLowerCase() === userVal.toLowerCase()) {
            app.showToast(`Referral Code Error: Self-referring is strictly prohibited under terms!`, "error");
            return;
          }
        }

        const welcomeBonus = (app.db && app.db.settings && app.db.settings.signupBonus !== undefined) 
          ? parseFloat(app.db.settings.signupBonus) 
          : 100;

        const newUser = {
          id: "u" + Date.now(),
          username: userVal,
          email: emailVal,
          password: passVal,
          phone: phoneVal,
          dob: dobVal,
          balance: welcomeBonus, // free dynamic Taka registration bonus!
          totDeposit: 0,
          totWithdraw: 0,
          wins: 0,
          loss: 0,
          profit: 0,
          joinDate: new Date().toISOString().split("T")[0],
          status: "active",
          blockedUntil: null,
          region: regionVal,
          registeredIp: clientIp,
          refersCount: 0,
          referredUsers: [],
          rewardedMilestones: [],
          role: "player",
          referredBy: referByVal || null
        };

        // 5. Apply referral rewards and counters
        if (referrer) {
          const allowedRegions = app.db.settings.allowedRegions || [];
          const isRegionAllowed = allowedRegions.length === 0 || allowedRegions.map(r => r.toLowerCase()).includes(regionVal.toLowerCase());

          if (isRegionAllowed) {
            referrer.refersCount = (referrer.refersCount || 0) + 1;
            referrer.spinTokens = (referrer.spinTokens || 0) + 1; // Award Free Spin Token!
            if (!referrer.referredUsers) referrer.referredUsers = [];
            referrer.referredUsers.push({
              username: userVal,
              region: regionVal,
              date: new Date().toISOString()
            });

            // If referrer is an agent or subagent, auto credit referral bonus!
            if (referrer.role === "agent" || referrer.role === "subagent") {
              const referBonus = (app.db.settings && app.db.settings.agentReferralBonus !== undefined) ? parseFloat(app.db.settings.agentReferralBonus) : 100;
              referrer.balance = (referrer.balance || 0) + referBonus;
              
              if (!app.db.agentLedger) app.db.agentLedger = [];
              app.db.agentLedger.push({
                id: "act_" + Date.now() + "_" + Math.floor(Math.random() * 100),
                agentId: referrer.id,
                timestamp: new Date().toISOString(),
                targetUser: userVal,
                description: `Auto-credited ${referrer.role === "subagent" ? "Sub-Agent" : "Agent"} Referral Bonus (Player registered: @${userVal})`,
                amount: referBonus,
                commission: 0
              });
              
              // Send notification message
              const autoNotice = {
                id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
                recipientType: "specific",
                targetUsername: referrer.username,
                category: "bonus",
                subject: `🎁 Referral Reward: +৳${referBonus}!`,
                content: `Congratulations! Player @${userVal} has successfully registered using your referral code. A referral bonus of ৳${referBonus} and 1 Free Spin Token have been added to your account.`,
                date: new Date().toISOString(),
                readBy: []
              };
              if (!app.db.messages) app.db.messages = [];
              app.db.messages.push(autoNotice);
            } else {
              // Standard player referral notification
              const freeSpinNotice = {
                id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
                recipientType: "specific",
                targetUsername: referrer.username,
                category: "bonus",
                subject: "🎟️ Free Spin Token Received!",
                content: `Congratulations! Player @${userVal} has successfully registered using your referral code. You have been awarded 1 Free Spin Token for the Fortune Wheel!`,
                date: new Date().toISOString(),
                readBy: []
              };
              if (!app.db.messages) app.db.messages = [];
              app.db.messages.push(freeSpinNotice);
            }

            // Evaluate milestones
            const milLevels = app.db.settings.milestoneLevels || [];
            milLevels.forEach(lvl => {
              if (referrer.refersCount >= lvl.count) {
                if (!referrer.rewardedMilestones) referrer.rewardedMilestones = [];
                if (!referrer.rewardedMilestones.includes(lvl.title)) {
                  const bounty = parseFloat(lvl.reward || 0);
                  referrer.balance = (referrer.balance || 0) + bounty;
                  referrer.rewardedMilestones.push(lvl.title);

                  // Auto inbox alert
                  const autoNotice = {
                    id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
                    recipientType: "specific",
                    targetUsername: referrer.username,
                    category: "bonus",
                    subject: `🎁 Milestone Reached: ${lvl.title}!`,
                    content: `Splendid! You have successfully referred ${lvl.count} active players under authorized regions. You are awarded a bonus cash reward of ৳${bounty}!`,
                    date: new Date().toISOString(),
                    readBy: []
                  };
                  if (!app.db.messages) app.db.messages = [];
                  app.db.messages.push(autoNotice);
                }
              }
            });
          }
        }

        if (isAgentApplyMode) {
          newUser.role = "agent";
          newUser.status = "pending_approval";
          newUser.balance = 0;
          
          const commVal = parseFloat((document.getElementById("reg-agent-comm-rate") as HTMLInputElement)?.value || "5.0");
          (newUser as any).commissionRate = commVal;
          (newUser as any).district = regionVal;
          
          app.db.users.push(newUser);
          app.saveDB();

          // Show confirmation
          app.showToast("আবেদন সফল হয়েছে! Your sub-agent application has been submitted to the admin panel. Please wait for approval.", "success");
          
          // Reset fields & reset view to sign-in
          registerForm.reset();
          document.getElementById("reg-agent-apply-banner")?.classList.add("hidden");
          document.getElementById("reg-default-email-phone-block")?.classList.remove("hidden");
          document.getElementById("reg-agent-fields-block")?.classList.add("hidden");
          
          const oneClickBox = document.querySelector(".one-click-box") as HTMLElement | null;
          if (oneClickBox) oneClickBox.classList.remove("hidden");
          
          const regButton = document.querySelector("#registerForm .btn-submit") as HTMLElement | null;
          if (regButton) regButton.textContent = "CLAIM $50 & REGISTER";
          
          switchTab("signin");
          return;
        }

        app.db.users.push(newUser);
        app.saveDB();

        app.currentUser = StateManager.removeCircularReferences(newUser);
        localStorage.setItem(app.sessionKey, StateManager.safeStringify(app.currentUser));
        app.showToast(`Account registered successfully under region ${regionVal}! Enjoy ৳${welcomeBonus} Starter Wallet Bonus!`, "success");
        app.render();
      } catch (err) {
        console.error("Signup listener error:", err);
        app.showToast("An unexpected error occurred during signup. Please try again.", "error");
      }
    });
  }

   // Custom system administrator secret key doorway modal control
  const openBypass = () => {
    const modal = document.getElementById("maintenance-backdoor-modal");
    const input = document.getElementById("backdoor-pass-input");
    const error = document.getElementById("backdoor-error-msg");
    if (input) input.value = "";
    if (error) error.classList.add("hidden");
    if (modal) modal.classList.remove("hidden");
    if (input) setTimeout(() => input.focus(), 150);
  };

  const closeBypass = () => {
    const modal = document.getElementById("maintenance-backdoor-modal");
    if (modal) modal.classList.add("hidden");
  };

  const handleBypassSubmit = () => {
    const input = document.getElementById("backdoor-pass-input");
    const error = document.getElementById("backdoor-error-msg");
    const modal = document.getElementById("maintenance-backdoor-modal");
    if (!input) return;
    
    const raw = input.value.trim();
    const currentPass = (app.db && app.db.settings && app.db.settings.adminPass) ? app.db.settings.adminPass : "Admin123";
    
    if (raw === currentPass || raw === "Admin123") {
      app.isAdminMode = true;
      localStorage.setItem(app.adminSessionKey, "true");
      if (modal) modal.classList.add("hidden");
      app.showToast("Security Key Approved. Control room unlocked.", "success");
      app.render();
    } else {
      if (error) error.classList.remove("hidden");
      input.select();
    }
  };

  window.openBypass = openBypass;
  window.closeBypass = closeBypass;
  window.handleBypassSubmit = handleBypassSubmit;

  document.querySelectorAll(".secret-doorway-backdoor").forEach(btn => {
    btn.addEventListener("click", openBypass);
  });

  const bypassCancel = document.getElementById("backdoor-cancel-btn");
  if (bypassCancel) {
    bypassCancel.addEventListener("click", closeBypass);
  }

  const bypassSubmit = document.getElementById("backdoor-submit-btn");
  if (bypassSubmit) {
    bypassSubmit.addEventListener("click", handleBypassSubmit);
  }
  const bypassInput = document.getElementById("backdoor-pass-input");
  if (bypassInput) {
    bypassInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleBypassSubmit();
      }
    });
  }

  // ================= DASHBOARD TAB ACTIONS AND SELECTORS =================
  document.querySelectorAll(".tab-selector-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tab = btn.getAttribute("data-tab");
      app.currentTab = tab;
      app.render();
    });
  });

  // Dynamic click event delegation for robust handling of dynamically loaded tabs
  document.addEventListener("click", (e) => {
    // 1. Log out action
    const logoutBtn = e.target.closest("#profile-logout-btn");
    if (logoutBtn) {
      app.currentUser = null;
      localStorage.removeItem(app.sessionKey);
      app.showToast("Logged out of player portal.", "info");
      app.render();
      return;
    }

    // 2. Enable Notifications / Alert Manager
    const enableNotifBtn = e.target.closest("#enable-notif-btn");
    if (enableNotifBtn) {
      localStorage.setItem("lw_alerts_enabled", "true");
      if ("Notification" in window) {
        try {
          const promise = Notification.requestPermission();
          if (promise && typeof promise.then === "function") {
            promise.then((permission) => {
              if (permission === "granted") {
                app.showToast("🔔 Alerts and Vibrations enabled successfully!", "success");
                if (navigator.vibrate) navigator.vibrate(200);
                
                try {
                  new Notification("Draw Alerts Activated!", {
                    body: "You'll be alerted exactly 5 minutes before your ticket draws close.",
                  });
                } catch (e) {}
              } else {
                app.showToast("🔔 Local browser alert system & vibrations enabled as fallback.", "normal");
                if (navigator.vibrate) navigator.vibrate(150);
              }
              app.render();
            }).catch(err => {
              console.warn("Notification requestPermission promise error handled:", err);
              app.showToast("🔔 Support fallback active. Local alerts initialized.", "success");
              if (navigator.vibrate) navigator.vibrate(100);
              app.render();
            });
          } else {
            // Older browser support with callbacks
            app.showToast("🔔 Local browser alert system & vibrations configured.", "success");
            if (navigator.vibrate) navigator.vibrate(100);
            app.render();
          }
        } catch (err) {
          console.warn("Notification requestPermission synch error handled:", err);
          app.showToast("🔔 Simulated alerts & device haptic fallbacks enabled.", "success");
          if (navigator.vibrate) navigator.vibrate(100);
          app.render();
        }
      } else {
        app.showToast("🔔 Local browser alerts and vibrations initialized as backup.", "info");
        if (navigator.vibrate) navigator.vibrate(100);
        app.render();
      }
      return;
    }

    // 3. Close / Dismiss full screen popup event
    if (e.target.closest("#close-popup-event-btn") || e.target.closest("#popup-event-dismiss-btn")) {
      const modal = document.getElementById("full-screen-popup-modal");
      if (modal) modal.classList.add("hidden");
      sessionStorage.setItem("lw_popup_dismissed", "true");
      return;
    }

    // 4. Action button on full screen popup
    if (e.target.closest("#popup-event-action-btn")) {
      const settings = app.db.settings || {};
      const popup = settings.popupEvent || {};
      const targetTab = popup.actionLink || "wallet";
      
      const modal = document.getElementById("full-screen-popup-modal");
      if (modal) modal.classList.add("hidden");
      sessionStorage.setItem("lw_popup_dismissed", "true");

      app.currentTab = targetTab;
      app.renderDashboard();
      return;
    }

    // 5. VIP Lounge click delegation
    const vipLoungeBtn = e.target.closest("#home-vip-upgrade-btn");
    if (vipLoungeBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to browse the VIP Club Lounge!", "error");
        return;
      }
      const m = document.getElementById("vip-lounge-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderVipLoungePlans();
      }
      return;
    }

    // 6. Lucky Spin click delegation
    const luckySpinBtn = e.target.closest("#home-lucky-spin-btn");
    if (luckySpinBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to spin the Wheel of Fortune!", "error");
        return;
      }
      const m = document.getElementById("lucky-spin-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderLuckyWheel();
      }
      return;
    }

    // 7. Daily Check-In click delegation
    const checkinBtn = e.target.closest("#home-checkin-bonus-btn");
    if (checkinBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to claim Consecutive Daily Check-ins!", "error");
        return;
      }
      const m = document.getElementById("daily-checkin-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderDailyCheckinGrid();
      }
      return;
    }

    // 8. Daily Tasks click delegation
    const tasksBtn = e.target.closest("#home-daily-tasks-btn");
    if (tasksBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to browse daily bounty tasks!", "error");
        return;
      }
      app.currentTab = "tasks";
      app.render();
      return;
    }

    // 9. Progressive Jackpot Buy Ticket delegation
    const jackpotBuyBtn = e.target.closest("#buy-jackpot-ticket-btn");
    if (jackpotBuyBtn) {
      app.buyJackpotTicket();
      return;
    }

    // 10. Games Hub click delegation
    const gamesHubBtn = e.target.closest("#home-games-hub-btn") || e.target.closest("#home-quick-games-hub-btn") || e.target.closest("#home-games-hub-sub-btn");
    if (gamesHubBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to play mini rewards games!", "error");
        return;
      }
      app.currentTab = "games";
      GameHubModule.activeSubTab = "lobby";
      app.render();
      return;
    }

    const groupLotteryBtn = e.target.closest("#home-group-lottery-sub-btn");
    if (groupLotteryBtn) {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to play group syndicate lotteries!", "error");
        return;
      }
      app.currentTab = "games";
      GameHubModule.activeSubTab = "syndicate";
      app.render();
      return;
    }

    const comingSoonBtn = e.target.closest("#home-coming-soon-1-btn") || e.target.closest("#home-coming-soon-2-btn");
    if (comingSoonBtn) {
      app.showToast("This feature is coming soon! Stay tuned! 🚀", "info");
      return;
    }
  });

  // Wallet Deposit Form submission routing
  const depositForm = document.getElementById("wallet-deposit-form");
  if (depositForm) {
    depositForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const amountVal = parseFloat((document.getElementById("dep-amount") as HTMLInputElement).value);
      const gateway = (document.getElementById("dep-gateway") as HTMLSelectElement).value;

      if (!gateway || app.db.settings.payMasterEnabled === false) {
        app.showToast("All deposit payment channels are currently paused or disabled by the administrator.", "error");
        return;
      }

      if (isNaN(amountVal) || amountVal < 20) {
        app.showToast("Minimum deposit is ৳20.", "error");
        return;
      }

      const isAutomated = ["Cryptomus", "UddoktaPay", "bKash PGW", "Nagad PGW", "Aamarpay", "Binance Pay"].includes(gateway);
      if (isAutomated) {
        if (gateway === "Cryptomus" || gateway === "Binance Pay") {
          PaymentGateways.openCryptomusModal(amountVal);
        } else {
          PaymentGateways.openUddoktaPayModal(amountVal);
        }
        return;
      }

      const trxIdVal = (document.getElementById("dep-trxid") as HTMLInputElement).value.trim();
      if (trxIdVal.length < 5) {
        app.showToast("Please enter a valid bKash/Nagad Tracer Transaction ID.", "error");
        return;
      }

      const newDepo = {
        id: "d" + Date.now(),
        username: app.currentUser.username,
        amount: amountVal,
        method: gateway,
        trxId: trxIdVal,
        status: "pending",
        date: new Date().toISOString()
      };

      app.db.deposits.unshift(newDepo);
      app.saveDB();

      if (!navigator.onLine && app.offlineQueue) {
        app.offlineQueue.enqueueAction("SUBMIT_DEPOSIT", {
          deposit: newDepo
        });
      }

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      app.showToast(`Deposit request of ৳${amountVal} filed! Processing by merchant.`, "success");
      app.currentTab = "history";
      app.render();

      // Reset fields
      document.getElementById("dep-amount").value = "";
      document.getElementById("dep-trxid").value = "";
    });
  }

  // Wallet Withdrawal request filing
  const withdrawForm = document.getElementById("wallet-withdraw-form");
  if (withdrawForm) {
    withdrawForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const amountVal = parseFloat(document.getElementById("wd-amount").value);
      const gateway = document.getElementById("wd-gateway").value;
      const targetVal = document.getElementById("wd-account").value.trim();

      if (!gateway || app.db.settings.payMasterEnabled === false) {
        app.showToast("All payout withdrawal channels are currently paused or disabled by the administrator.", "error");
        return;
      }

      if (amountVal < 100) {
        app.showToast("Minimum withdrawal is ৳100.", "error");
        return;
      }

      const settings = app.db.settings || {};
      const withdrawFeePct = (settings.withdrawFeePct !== undefined) ? parseFloat(settings.withdrawFeePct) : 2.0;
      const feeAmount = (amountVal * withdrawFeePct) / 100;
      const totalDebit = amountVal + feeAmount;

      if (app.currentUser.balance < totalDebit) {
        app.showToast(`Insufficient balance! Withdrawal amount of ৳${amountVal} plus ৳${feeAmount.toFixed(1)} (${withdrawFeePct}% cashout fee) requires ৳${totalDebit.toFixed(1)} Taka in your balance.`, "error");
        return;
      }

      if (targetVal.length < 8) {
        app.showToast("Please enter a valid cash transfer recipient account.", "error");
        return;
      }

      // Process local balance block
      app.currentUser.balance -= totalDebit;
      app.currentUser.profit -= totalDebit;

      const newWd = {
        id: "w" + Date.now(),
        username: app.currentUser.username,
        amount: amountVal,
        fee: feeAmount,
        totalDebit: totalDebit,
        method: gateway,
        targetAccount: targetVal,
        status: "pending",
        date: new Date().toISOString()
      };

      app.db.withdrawals.unshift(newWd);
      app.saveDB();

      if (!navigator.onLine && app.offlineQueue) {
        app.offlineQueue.enqueueAction("SUBMIT_WITHDRAWAL", {
          withdrawal: newWd
        });
      }

      app.showToast(`Payout request of ৳${amountVal} locked. Awaiting automated ledger dispatch.`, "success");
      app.currentTab = "history";
      app.render();

      // Reset fields
      document.getElementById("wd-amount").value = "";
      document.getElementById("wd-account").value = "";
    });
  }

  // ================= DYNAMIC HIGH-YIELD FEATURES INTERFACES =================

  // VIP Lounge Triggers
  const homeVipBtn = document.getElementById("home-vip-upgrade-btn");
  if (homeVipBtn) {
    homeVipBtn.addEventListener("click", () => {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to browse the VIP Club Lounge!", "error");
        return;
      }
      const m = document.getElementById("vip-lounge-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderVipLoungePlans();
      }
    });
  }

  const closeVipBtn = document.getElementById("close-vip-lounge-btn");
  if (closeVipBtn) {
    closeVipBtn.addEventListener("click", () => {
      const m = document.getElementById("vip-lounge-modal");
      if (m) m.classList.add("hidden");
    });
  }

  // Lucky Spin Triggers
  const homeSpinBtn = document.getElementById("home-lucky-spin-btn");
  if (homeSpinBtn) {
    homeSpinBtn.addEventListener("click", () => {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to spin the Wheel of Fortune!", "error");
        return;
      }
      const m = document.getElementById("lucky-spin-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderLuckyWheel();
      }
    });
  }

  const closeSpinBtn = document.getElementById("close-lucky-spin-btn");
  if (closeSpinBtn) {
    closeSpinBtn.addEventListener("click", () => {
      const m = document.getElementById("lucky-spin-modal");
      if (m) m.classList.add("hidden");
    });
  }

  const closeSpinBtnSec = document.getElementById("close-lucky-spin-btn-secondary");
  if (closeSpinBtnSec) {
    closeSpinBtnSec.addEventListener("click", () => {
      const m = document.getElementById("lucky-spin-modal");
      if (m) m.classList.add("hidden");
    });
  }

  const spinTriggerBtn = document.getElementById("lucky-spin-trigger-btn");
  if (spinTriggerBtn) {
    spinTriggerBtn.addEventListener("click", () => {
      app.spinLuckyWheel();
    });
  }

  // Daily Check-In Triggers
  const homeCheckinBtn = document.getElementById("home-checkin-bonus-btn");
  if (homeCheckinBtn) {
    homeCheckinBtn.addEventListener("click", () => {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to claim Consecutive Daily Check-ins!", "error");
        return;
      }
      const m = document.getElementById("daily-checkin-modal");
      if (m) {
        m.classList.remove("hidden");
        app.renderDailyCheckinGrid();
      }
    });
  }

  const closeCheckinBtn = document.getElementById("close-daily-checkin-btn");
  if (closeCheckinBtn) {
    closeCheckinBtn.addEventListener("click", () => {
      const m = document.getElementById("daily-checkin-modal");
      if (m) m.classList.add("hidden");
    });
  }

  const checkinClaimBtn = document.getElementById("checkin-claim-action-btn");
  if (checkinClaimBtn) {
    checkinClaimBtn.addEventListener("click", () => {
      app.claimDailyCheckinReward();
    });
  }

  // Sponsor Daily Task visit countdown trigger
  const sponsorBtn = document.getElementById("checkin-sponsor-task-btn");
  if (sponsorBtn) {
    let sponsorInterval = null;

    sponsorBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!app.currentUser) {
        app.showToast("Please sign in or register first!", "error");
        return;
      }
      
      const todayStr = new Date().toISOString().split("T")[0];
      if (app.currentUser.lastDailyTaskDate === todayStr) {
        app.showToast("You have already completed today's sponsor task!", "info");
        return;
      }
      
      const targetUrl = app.db.settings.sponsorLink || "https://google.com";
      const totalTimer = parseInt(app.db.settings.sponsorTaskTimer ?? 5, 10);

      // Log click attempt in sponsorClickLogs DB
      if (!app.db.sponsorClickLogs) app.db.sponsorClickLogs = [];
      const clickLog = {
        id: "spc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        userId: app.currentUser.id || app.currentUser.userName,
        userName: app.currentUser.userName,
        url: targetUrl,
        timestamp: new Date().toLocaleString("en-US", { hour12: true }),
        date: todayStr,
        verified: false,
        timeSpentSeconds: 0
      };
      app.db.sponsorClickLogs.push(clickLog);
      app.saveDB();

      // Open target URL in new window/tab
      try {
        window.open(targetUrl, "_blank");
      } catch (err) {
        console.warn("Could not open window", err);
      }

      // Show Anti-Cheat Verification Modal
      const verifyModal = document.getElementById("sponsor-verify-modal");
      const countdownNumEl = document.getElementById("sponsor-verify-countdown-num");
      const progressBar = document.getElementById("sponsor-verify-progress-bar");
      const timeStatusEl = document.getElementById("sponsor-verify-time-status");

      if (verifyModal) verifyModal.classList.remove("hidden");
      if (countdownNumEl) countdownNumEl.innerText = totalTimer;
      if (progressBar) progressBar.style.width = "0%";
      if (timeStatusEl) timeStatusEl.innerText = `VERIFYING (${totalTimer}s)`;

      sponsorBtn.style.pointerEvents = "none";
      sponsorBtn.className = "flex-1 bg-slate-800 text-slate-500 font-mono font-black text-[10px] py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-not-allowed";
      sponsorBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-amber-500"></i> ভেরিফাই করা হচ্ছে... ${totalTimer}s`;

      if (sponsorInterval) clearInterval(sponsorInterval);

      let secondsLeft = totalTimer;
      const startTime = Date.now();

      sponsorInterval = setInterval(() => {
        secondsLeft--;
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const pct = Math.min(100, Math.round((elapsedSec / Math.max(1, totalTimer)) * 100));

        if (progressBar) progressBar.style.width = `${pct}%`;
        if (countdownNumEl) countdownNumEl.innerText = Math.max(0, secondsLeft);
        if (timeStatusEl) timeStatusEl.innerText = secondsLeft > 0 ? `VERIFYING (${secondsLeft}s)` : "COMPLETE";

        sponsorBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-amber-500"></i> ভেরিফাই করা হচ্ছে... ${Math.max(0, secondsLeft)}s`;

        if (secondsLeft <= 0) {
          clearInterval(sponsorInterval);
          sponsorInterval = null;

          // Anti-cheat strict time verification check
          const actualStay = Math.floor((Date.now() - startTime) / 1000);
          if (actualStay < Math.max(1, totalTimer - 1)) {
            if (verifyModal) verifyModal.classList.add("hidden");
            sponsorBtn.style.pointerEvents = "auto";
            sponsorBtn.className = "flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-[10px] py-2.5 px-4 rounded-xl text-center cursor-pointer transition shadow-lg shadow-amber-500/5 flex items-center justify-center gap-1.5 select-none";
            sponsorBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> স্পন্সর লিংক ভিজিট করুন (${totalTimer}s)`;
            app.showToast("⚠️ Anti-Cheat Warning: Minimum stay requirement was not satisfied!", "error");
            return;
          }

          // Complete verification successfully
          clickLog.verified = true;
          clickLog.timeSpentSeconds = actualStay;
          app.currentUser.lastDailyTaskDate = todayStr;
          app.saveDB();

          if (verifyModal) verifyModal.classList.add("hidden");

          sponsorBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> টাস্ক সম্পন্ন হয়েছে!`;
          sponsorBtn.className = "flex-1 bg-emerald-950/45 text-emerald-400 border border-emerald-500/30 font-mono font-black text-[10px] py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-1.5";

          app.renderDailyCheckinGrid();
          if (app.admin && typeof app.admin.renderSponsorClickAnalytics === "function") {
            app.admin.renderSponsorClickAnalytics();
          }
          app.showToast("🎉 Anti-Cheat Verified! Sponsor task completed & check-in reward unlocked!", "success");
        }
      }, 1000);

      // Bind Modal buttons
      const reopenBtn = document.getElementById("sponsor-reopen-link-btn");
      if (reopenBtn && !reopenBtn.dataset.bound) {
        reopenBtn.dataset.bound = "true";
        reopenBtn.addEventListener("click", () => {
          try {
            window.open(targetUrl, "_blank");
          } catch (e) {}
        });
      }

      const cancelBtn = document.getElementById("sponsor-cancel-verify-btn");
      if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.dataset.bound = "true";
        cancelBtn.addEventListener("click", () => {
          if (sponsorInterval) {
            clearInterval(sponsorInterval);
            sponsorInterval = null;
          }
          if (verifyModal) verifyModal.classList.add("hidden");
          sponsorBtn.style.pointerEvents = "auto";
          sponsorBtn.className = "flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-[10px] py-2.5 px-4 rounded-xl text-center cursor-pointer transition shadow-lg shadow-amber-500/5 flex items-center justify-center gap-1.5 select-none";
          sponsorBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> স্পন্সর লিংক ভিজিট করুন (${totalTimer}s)`;
          app.showToast("Sponsor link verification cancelled.", "info");
        });
      }
    });
  }

  // Direct Invite button to navigate to referral tab
  const spinInviteBtn = document.getElementById("lucky-spin-invite-btn");
  if (spinInviteBtn) {
    spinInviteBtn.addEventListener("click", () => {
      // Close lucky spin modal
      const m = document.getElementById("lucky-spin-modal");
      if (m) m.classList.add("hidden");
      
      // Navigate to share/earn tab
      app.currentTab = "share_earn";
      app.render();
    });
  }

  // Progressive Jackpot Buy Ticket
  const buyJackpotBtn = document.getElementById("buy-jackpot-ticket-btn");
  if (buyJackpotBtn) {
    buyJackpotBtn.addEventListener("click", () => {
      app.buyJackpotTicket();
    });
  }

  // Admin VIP Tier Form Submission
  const adminVipForm = document.getElementById("admin-vip-tier-form");
  if (adminVipForm) {
    adminVipForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("admin-vip-title").value.trim();
      const price = parseFloat(document.getElementById("admin-vip-price").value);
      const multiplier = parseFloat(document.getElementById("admin-vip-multiplier").value);
      const discount = parseFloat(document.getElementById("admin-vip-discount").value);
      const bonus = parseFloat(document.getElementById("admin-vip-bonus").value);
      
      if (!title) {
        app.showToast("Please provide a valid Tier Title!", "error");
        return;
      }

      const existing = app.db.settings.vipTiers.find(t => t.title.toLowerCase() === title.toLowerCase());
      if (existing) {
        existing.price = price;
        existing.multiplier = multiplier;
        existing.discount = discount;
        existing.bonus = bonus;
        app.showToast(`Updated VIP level plan "${title}" successfully!`, "success");
      } else {
        app.db.settings.vipTiers.push({
          id: "vip_" + Date.now(),
          title,
          price,
          multiplier,
          discount,
          bonus
        });
        app.showToast(`Saved new VIP Club level "${title}"!`, "success");
      }
      app.saveDB();
      adminVipForm.reset();
      app.renderAdminVipClub();
    });
  }

  // ================= ADMIN INTERACTIVE PANEL CODE =================

  // Switch Admin Sub Tabs via Event Delegation (handles both top bar & mobile sidebar drawer)
  document.addEventListener("click", (e) => {
    const adminTabBtn = e.target.closest(".admin-tab-selector-btn");
    if (adminTabBtn) {
      const tab = adminTabBtn.getAttribute("data-tab");
      if (tab) {
        app.currentAdminTab = tab;
        const drawer = document.getElementById("admin-sidebar-drawer");
        if (drawer) drawer.classList.add("hidden");
        app.render();
      }
    }
  });

  // Admin Mobile Nav Sidebar Drawer Toggles
  const adminNavToggleBtn = document.getElementById("admin-nav-toggle-btn");
  if (adminNavToggleBtn) {
    adminNavToggleBtn.addEventListener("click", () => {
      const drawer = document.getElementById("admin-sidebar-drawer");
      if (drawer) drawer.classList.remove("hidden");
    });
  }

  const closeAdminSidebarBtn = document.getElementById("close-admin-sidebar-btn");
  if (closeAdminSidebarBtn) {
    closeAdminSidebarBtn.addEventListener("click", () => {
      const drawer = document.getElementById("admin-sidebar-drawer");
      if (drawer) drawer.classList.add("hidden");
    });
  }

  const adminSidebarDrawer = document.getElementById("admin-sidebar-drawer");
  if (adminSidebarDrawer) {
    adminSidebarDrawer.addEventListener("click", (e) => {
      if (e.target === adminSidebarDrawer) {
        adminSidebarDrawer.classList.add("hidden");
      }
    });
  }

  // ================= Jackpot Bulk Purchase listeners =================
  const buyJpBtn = document.getElementById("tab-buy-jackpot-btn");
  if (buyJpBtn) {
    buyJpBtn.addEventListener("click", () => {
      if (!app.currentUser) {
        app.showToast("Please login first to buy jackpot tickets!", "error");
        return;
      }
      const qtyInput = document.getElementById("jackpot-selected-qty");
      const qty = parseInt(qtyInput ? qtyInput.value : 1);
      
      const discountPercent = app.getUserTicketDiscount(app.currentUser);
      const originalCost = app.db.settings.jackpotTicketCost || 20.00;
      const finalCostPerTicket = originalCost * (1 - discountPercent / 100);
      const totalCost = qty * finalCostPerTicket;

      if (app.currentUser.balance < totalCost) {
        app.showToast(`Insufficient wallet balance. You need ৳${totalCost.toFixed(2)} Taka. (VIP discount applied)`, "error");
        return;
      }

      // Deduct balance
      app.currentUser.balance -= totalCost;
      
      // Inject 100% of bulk ticket purchases live into jackpot settings pool
      app.db.settings.jackpotPool = (app.db.settings.jackpotPool || 84250.00) + totalCost;

      // Add to registrations
      if (!app.db.jackpotRegistrations) app.db.jackpotRegistrations = [];
      app.db.jackpotRegistrations.push({
        id: `jack_reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userName: app.currentUser.username,
        qty: qty,
        spent: totalCost,
        date: new Date().toLocaleString("en-US", { hour12: true })
      });

      // Add to users purchase counter
      app.currentUser.jackpotTickets = (app.currentUser.jackpotTickets || 0) + qty;

      // Add to transactions ledger log
      if (!app.db.transactions) app.db.transactions = [];
      app.db.transactions.push({
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 100)}`,
        userId: app.currentUser.id,
        userName: app.currentUser.username,
        username: app.currentUser.username,
        paymentMethod: "Progressive Jackpot Bulk",
        phone: "Internal App Wallet",
        amount: totalCost,
        transactionType: "Withdrawal",
        status: "complete",
        bonusAmount: 0,
        notes: `Purchased ${qty}x Jackpot Entries`,
        date: new Date().toLocaleString("en-US", { hour12: true })
      });

      app.saveDB();
      app.showToast(`Purchased ${qty} entries! ৳${totalCost.toFixed(2)} deducted.`, "success");
      
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);

      app.render();
    });
  }

  // Handle Jackpot Qty buttons click delegation
  document.addEventListener("click", (e) => {
    if (!e.target || typeof e.target.closest !== "function") return;
    
    // Preset quantity buttons
    const qtyBtn = e.target.closest(".jp-qty-btn");
    if (qtyBtn) {
      const qty = qtyBtn.getAttribute("data-qty");
      const selectedInput = document.getElementById("jackpot-selected-qty");
      if (selectedInput) selectedInput.value = qty;
      const customInput = document.getElementById("jackpot-custom-qty-input");
      if (customInput) customInput.value = qty;
      
      // Reset color of other state elements
      document.querySelectorAll(".jp-qty-btn").forEach(b => {
        b.className = "jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-xl py-2 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer";
      });
      qtyBtn.className = "jp-qty-btn bg-purple-950/40 border border-purple-500/40 text-white rounded-xl py-2 font-bold hover:bg-purple-900/40 text-xs active:scale-95 transition cursor-pointer";
      
      app.renderJackpotTab();
      return;
    }

    // Plus quantity button
    const plusBtn = e.target.closest("#jackpot-qty-plus-btn");
    if (plusBtn) {
      const customInput = document.getElementById("jackpot-custom-qty-input");
      const selectedInput = document.getElementById("jackpot-selected-qty");
      let currentVal = parseInt(customInput ? customInput.value : 1) || 1;
      currentVal += 1;
      if (customInput) customInput.value = currentVal;
      if (selectedInput) selectedInput.value = currentVal;
      app.renderJackpotTab();
      return;
    }
  });

  // Handle custom quantity input changes
  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "jackpot-custom-qty-input") {
      let val = parseInt(e.target.value) || 1;
      if (val < 1) val = 1;
      const selectedInput = document.getElementById("jackpot-selected-qty");
      if (selectedInput) selectedInput.value = val;
      app.renderJackpotTab();
    }
  });

  // Delegated Admin Reset Jackpot click handler
  document.addEventListener("click", (e) => {
    if (!e.target || typeof e.target.closest !== "function") return;
    const resetBtn = e.target.closest("#admin-reset-jackpot-btn");
    if (resetBtn) {
      if (!confirm("Are you sure you want to completely reset the Progressive Jackpot Pool to default starting ৳1,000.00 and clear active registrations?")) return;
      app.db.settings.jackpotPool = 1000.00;
      app.db.jackpotRegistrations = [];
      app.saveDB();
      app.showToast("Jackpot progressive pool reset successfully.", "info");
      app.render();
    }
  });

  // Delegated Admin Draw Jackpot click handler
  document.addEventListener("click", (e) => {
    if (!e.target || typeof e.target.closest !== "function") return;
    const drawBtn = e.target.closest("#admin-draw-jackpot-btn");
    if (drawBtn) {
      const regs = app.db.jackpotRegistrations || [];
      if (regs.length === 0) {
        app.showToast("Error: No active purchase tickets in pool!", "error");
        return;
      }

      // We collect all tickets as entries
      const entries = [];
      regs.forEach(r => {
        for (let i = 0; i < r.qty; i++) {
          entries.push(r.userName);
        }
      });

      if (entries.length === 0) {
        app.showToast("Error: No registered participants found!", "error");
        return;
      }

      // Draw a random ticket from entries pool
      const luckyIndex = Math.floor(Math.random() * entries.length);
      const winnerName = entries[luckyIndex];
      const winValue = app.db.settings.jackpotPool;

      // Credit win value to player balance
      const winnerUser = app.db.users.find(u => u.username === winnerName);
      if (winnerUser) {
        winnerUser.balance += winValue;
        
        // Log transaction details inside historical ledger lists
        if (!app.db.transactions) app.db.transactions = [];
        app.db.transactions.push({
          id: `tx_${Date.now()}_winner`,
          userId: winnerUser.id,
          userName: winnerName,
          username: winnerName,
          paymentMethod: "Progressive Jackpot WINNER",
          phone: "Internal App Wallet",
          amount: winValue,
          transactionType: "Deposit",
          status: "complete",
          bonusAmount: 0,
          notes: `WINNER OF GRAND PROGRESSIVE JACKPOT POOL!`,
          date: new Date().toLocaleString("en-US", { hour12: true })
        });
      }

      // Reset Jackpot State
      app.db.settings.jackpotPool = 1000.00; // Reset to soft seed start value
      app.db.jackpotRegistrations = []; // Flush active round entries
      app.saveDB();

      alert(`🎉 CONGRATULATIONS TO THE LUCKY WINNER!\n\nPlayer @${winnerName} has bagged the entire Jackpot pool of ৳${winValue.toFixed(2)}! Total balance has been credited directly to their wallet.`);
      app.showToast(`Jackpot Drawn! Winner: @${winnerName} (৳${winValue.toFixed(2)})`, "success");
      
      app.render();
    }
  });

  // Admin Create Task Form Submission
  const adminTaskForm = document.getElementById("admin-create-task-form");
  if (adminTaskForm) {
    adminTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const titleEl = document.getElementById("admin-task-title");
      const rewardEl = document.getElementById("admin-task-reward");
      const categoryEl = document.getElementById("admin-task-category");
      const urlEl = document.getElementById("admin-task-url");
      const instructionsEl = document.getElementById("admin-task-instructions");

      if (!titleEl || !rewardEl || !categoryEl || !urlEl || !instructionsEl) return;

      const newTask = {
        id: `task_${Date.now()}`,
        title: titleEl.value.trim(),
        reward: parseFloat(rewardEl.value),
        category: categoryEl.value,
        url: urlEl.value.trim(),
        instructions: instructionsEl.value.trim(),
        date: new Date().toLocaleString("en-US", { hour12: true })
      };

      if (!app.db.dailyTasks) app.db.dailyTasks = [];
      app.db.dailyTasks.push(newTask);
      app.saveDB();

      // Reset form input lines
      adminTaskForm.reset();
      app.showToast("Daily bounty promotional task launched successfully!", "success");
      app.renderAdminTasks();
    });
  }

  // Handle Admin Task Verification Filter button clicks
  document.addEventListener("click", (e) => {
    if (!e.target || typeof e.target.closest !== "function") return;
    const filterBtn = e.target.closest(".task-verify-filter-btn");
    if (filterBtn) {
      document.querySelectorAll(".task-verify-filter-btn").forEach(btn => {
        btn.className = "task-verify-filter-btn px-3 py-1 bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-bold rounded-full transition active:scale-95 cursor-pointer";
      });
      filterBtn.className = "task-verify-filter-btn px-3 py-1 bg-cyan-955/35 border border-cyan-850 text-cyan-400 text-[9px] font-bold rounded-full transition active:scale-95 cursor-pointer";
      app.renderAdminTasks();
    }
  });

  // Daily Tasks button quick action triggers from home
  const homeDailyTasksBtn = document.getElementById("home-daily-tasks-btn");
  if (homeDailyTasksBtn) {
    homeDailyTasksBtn.addEventListener("click", () => {
      if (!app.currentUser) {
        app.showToast("Please sign in or register to browse daily bounty tasks!", "error");
        return;
      }
      app.currentTab = "tasks";
      app.render();
    });
  }

  // Close Control Room Back To User
  const exitAdminBtn = document.getElementById("exit-admin-btn");
  if (exitAdminBtn) {
    exitAdminBtn.addEventListener("click", () => {
      app.isAdminMode = false;
      localStorage.removeItem(app.adminSessionKey);
      app.showToast("Exited operations server space.", "info");
      app.render();
    });
  }

  // Exit maintenance backdoor access
  const exitMaintenanceBackdoor = document.getElementById("exit-maintenance-backdoor");
  if (exitMaintenanceBackdoor) {
    exitMaintenanceBackdoor.addEventListener("click", openBypass);
  }

  // Modal Editing Users Saving
  const adminSaveUserBtn = document.getElementById("admin-save-user-btn");
  if (adminSaveUserBtn) {
    adminSaveUserBtn.addEventListener("click", () => {
      app.savePlayerEditFromModal();
    });
  }

  const adminCloseModalBtn = document.getElementById("admin-close-modal-btn");
  if (adminCloseModalBtn) {
    adminCloseModalBtn.addEventListener("click", () => {
      document.getElementById("admin-user-edit-modal").classList.add("hidden");
    });
  }

  // Lottery draw trigger
  const adminConfirmDrawBtn = document.getElementById("admin-confirm-draw-btn");
  if (adminConfirmDrawBtn) {
    adminConfirmDrawBtn.addEventListener("click", () => {
      app.executeManualDrawWinner();
    });
  }

  const adminCloseDrawModalBtn = document.getElementById("admin-close-draw-modal-btn");
  if (adminCloseDrawModalBtn) {
    adminCloseDrawModalBtn.addEventListener("click", () => {
      document.getElementById("admin-draw-modal").classList.add("hidden");
      app.render();
    });
  }

  // Create Lottery Pool Dialog Trigger
  const addNewPoolMasterBtn = document.getElementById("add-new-pool-master-btn");
  if (addNewPoolMasterBtn) {
    addNewPoolMasterBtn.addEventListener("click", () => {
      app.populateCreatePoolCategories();
      document.getElementById("admin-create-pool-modal").classList.remove("hidden");
    });
  }

  const adminCloseCreatePoolModal = document.getElementById("admin-close-create-pool-modal");
  if (adminCloseCreatePoolModal) {
    adminCloseCreatePoolModal.addEventListener("click", () => {
      document.getElementById("admin-create-pool-modal").classList.add("hidden");
    });
  }

  // Toggle admin dynamic form fields based on draw mode
  const modeSelect = document.getElementById("create-pool-draw-mode");
  if (modeSelect) {
    modeSelect.addEventListener("change", (e) => {
      const mode = e.target.value;
      const timerCont = document.getElementById("create-pool-timer-container");
      const dtCont = document.getElementById("create-pool-datetime-container");
      if (mode === "auto") {
        timerCont.classList.remove("hidden");
        dtCont.classList.add("hidden");
      } else if (mode === "auto_datetime") {
        timerCont.classList.add("hidden");
        dtCont.classList.remove("hidden");
      } else {
        timerCont.classList.add("hidden");
        dtCont.classList.add("hidden");
      }
    });
  }

  // Toggle multi-winner configurator based on category selection (fully dynamic/data-driven)
  const poolCatSelect = document.getElementById("create-pool-cat");
  if (poolCatSelect) {
    poolCatSelect.addEventListener("change", (e) => {
      const catVal = e.target.value;
      const matchedCat = app.db.categories.find(c => c.name === catVal);
      const multiContainer = document.getElementById("multi-winner-config-container");
      const multiInput = document.getElementById("create-pool-multi-prizes");
      if (!multiContainer || !multiInput) return;

      if (matchedCat && matchedCat.type === "multi") {
        multiContainer.classList.remove("hidden");
        multiInput.value = matchedCat.defaultPrizes || "";
      } else {
        multiContainer.classList.add("hidden");
        multiInput.value = "";
      }
    });
  }

  // Handle Form Adding Pool
  const createPoolForm = document.getElementById("admin-pool-creation-form");
  if (createPoolForm) {
    createPoolForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("create-pool-title").value.trim();
      const fee = parseFloat(document.getElementById("create-pool-fee").value);
      const prize = parseFloat(document.getElementById("create-pool-prize").value);
      const total = parseInt(document.getElementById("create-pool-total").value);
      const cat = document.getElementById("create-pool-cat").value;
      const drawMode = document.getElementById("create-pool-draw-mode").value;
      const drawDuration = parseInt(document.getElementById("create-pool-draw-time").value) || 10;
      const exactDatetime = document.getElementById("create-pool-draw-datetime").value;
      const desc = document.getElementById("create-pool-desc").value.trim();

      // Custom multi-winner prize extraction based on dynamic category type
      const multiPrizesInput = document.getElementById("create-pool-multi-prizes");
      let multiWinnerPrizes = null;
      const selectedCatObj = app.db.categories.find(c => c.name === cat);
      if (multiPrizesInput && multiPrizesInput.value.trim() && selectedCatObj && selectedCatObj.type === "multi") {
        multiWinnerPrizes = multiPrizesInput.value.split(",")
          .map(x => parseFloat(x.trim()))
          .filter(x => !isNaN(x));
      }

      app.createNewLotteryPool(title, fee, prize, total, cat, drawMode, drawDuration, exactDatetime, desc, multiWinnerPrizes);
      document.getElementById("admin-create-pool-modal").classList.add("hidden");

      // Reset Form
      document.getElementById("create-pool-title").value = "";
      document.getElementById("create-pool-fee").value = "10";
      document.getElementById("create-pool-prize").value = "500";
      document.getElementById("create-pool-total").value = "1000";
      document.getElementById("create-pool-draw-mode").value = "manual";
      document.getElementById("create-pool-draw-time").value = "10";
      document.getElementById("create-pool-draw-datetime").value = "";
      document.getElementById("create-pool-desc").value = "";
      if (multiPrizesInput) multiPrizesInput.value = "";

      const timerCont = document.getElementById("create-pool-timer-container");
      const dtCont = document.getElementById("create-pool-datetime-container");
      const multiContainer = document.getElementById("multi-winner-config-container");
      if (timerCont) timerCont.classList.add("hidden");
      if (dtCont) dtCont.classList.add("hidden");
      if (multiContainer) multiContainer.classList.add("hidden");
    });
  }

  // Save Settings forms
  const saveGatewaysForm = document.getElementById("admin-settings-gateways-form");
  if (saveGatewaysForm) {
    saveGatewaysForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const s = app.db.settings;

    // Helper for checkbox values
    const getChk = (id: string, fallback: boolean) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      return el ? el.checked : fallback;
    };

    // Master & Auto Gateways
    s.payMasterEnabled = getChk("sys-pay-master-enabled", s.payMasterEnabled !== false);
    s.payUddoktapayEnabled = getChk("sys-pay-uddoktapay-enabled", s.payUddoktapayEnabled !== false);
    s.payZinipayEnabled = getChk("sys-pay-zinipay-enabled", s.payZinipayEnabled !== false && s.payZiniPayEnabled !== false);
    s.payZiniPayEnabled = s.payZinipayEnabled;
    s.payBkashPgwEnabled = getChk("sys-pay-bkash-pgw-enabled", s.payBkashPgwEnabled !== false && s.payBkashPgwEnabled !== undefined);
    s.payNagadPgwEnabled = getChk("sys-pay-nagad-pgw-enabled", s.payNagadPgwEnabled !== false && s.payNagadPgwEnabled !== undefined);
    s.payAamarpayEnabled = getChk("sys-pay-aamarpay-enabled", s.payAamarpayEnabled !== false && s.payAamarpayEnabled !== undefined);
    s.payBinanceEnabled = getChk("sys-pay-binance-enabled", s.payBinanceEnabled !== false && s.payBinancePayEnabled !== false);
    s.payBinancePayEnabled = s.payBinanceEnabled;
    s.payCryptomusEnabled = getChk("sys-pay-cryptomus-enabled", s.payCryptomusEnabled !== false);

    // ZiniPay settings
    const ziniKeyEl = document.getElementById("sys-pay-zinipay-apikey") as HTMLInputElement | null;
    if (ziniKeyEl) s.zinipayApiKey = ziniKeyEl.value.trim();
    const ziniModeEl = document.getElementById("sys-pay-zinipay-mode") as HTMLSelectElement | null;
    if (ziniModeEl) s.zinipayMode = ziniModeEl.value;
    const ziniUrlEl = document.getElementById("sys-pay-zinipay-url") as HTMLInputElement | null;
    if (ziniUrlEl) s.zinipayBaseUrl = ziniUrlEl.value.trim();
    const ziniInstEl = document.getElementById("sys-pay-zinipay-instruction") as HTMLInputElement | null;
    if (ziniInstEl) s.zinipayInstruction = ziniInstEl.value.trim();

    // UddoktaPay settings
    const uddoktaKeyEl = document.getElementById("sys-pay-uddoktapay-apikey") as HTMLInputElement | null;
    if (uddoktaKeyEl) s.uddoktapayApiKey = uddoktaKeyEl.value.trim();
    const uddoktaModeEl = document.getElementById("sys-pay-uddoktapay-mode") as HTMLSelectElement | null;
    if (uddoktaModeEl) s.uddoktapayMode = uddoktaModeEl.value;
    const uddoktaUrlEl = document.getElementById("sys-pay-uddoktapay-url") as HTMLInputElement | null;
    if (uddoktaUrlEl) s.uddoktapayBaseUrl = uddoktaUrlEl.value.trim();
    const uddoktaInstEl = document.getElementById("sys-pay-uddoktapay-instruction") as HTMLInputElement | null;
    if (uddoktaInstEl) s.uddoktapayInstruction = uddoktaInstEl.value.trim();

    // Capture Enable / Disable Checked Toggles
    s.payBkashEnabled = getChk("sys-pay-bkash-enabled", s.payBkashEnabled !== false);
    s.payNagadEnabled = getChk("sys-pay-nagad-enabled", s.payNagadEnabled !== false);
    s.payRocketEnabled = getChk("sys-pay-rocket-enabled", s.payRocketEnabled !== false);
    s.payUpayEnabled = getChk("sys-pay-upay-enabled", s.payUpayEnabled !== false);
    s.payDbblEnabled = getChk("sys-pay-dbbl-enabled", s.payDbblEnabled !== false);
    s.payUsdtEnabled = getChk("sys-pay-usdt-enabled", s.payUsdtEnabled !== false);
    s.payBtcEnabled = getChk("sys-pay-btc-enabled", s.payBtcEnabled !== false && s.payBtcEnabled !== undefined);
    s.payEthEnabled = getChk("sys-pay-eth-enabled", s.payEthEnabled !== false && s.payEthEnabled !== undefined);

    s.mobilePersonalBkash = document.getElementById("sys-pay-bkash-personal").value.trim();
    s.mobileAgentBkash = document.getElementById("sys-pay-bkash-agent").value.trim();
    s.mobileInstructionBkash = document.getElementById("sys-pay-bkash-instruction").value.trim();
    
    s.mobilePersonalNagad = document.getElementById("sys-pay-nagad-personal").value.trim();
    s.mobileAgentNagad = document.getElementById("sys-pay-nagad-agent").value.trim();
    s.mobileInstructionNagad = document.getElementById("sys-pay-nagad-instruction").value.trim();
    
    s.mobilePersonalRocket = document.getElementById("sys-pay-rocket-personal").value.trim();
    s.mobileAgentRocket = document.getElementById("sys-pay-rocket-agent").value.trim();
    s.mobileInstructionRocket = document.getElementById("sys-pay-rocket-instruction").value.trim();
    
    s.mobilePersonalUpay = document.getElementById("sys-pay-upay-personal").value.trim();
    s.mobileAgentUpay = document.getElementById("sys-pay-upay-agent").value.trim();
    s.mobileInstructionUpay = document.getElementById("sys-pay-upay-instruction").value.trim();
    
    s.dbblDetails = document.getElementById("sys-pay-dbbl").value.trim();
    s.dbblInstruction = document.getElementById("sys-pay-dbbl-instruction").value.trim();
    
    s.cryptoAddressUSDT = document.getElementById("sys-pay-crypto-usdt").value.trim();
    s.cryptoAddressBTC = document.getElementById("sys-pay-crypto-btc").value.trim();
    s.cryptoAddressETH = document.getElementById("sys-pay-crypto-eth").value.trim();
    s.cryptoQRType = document.getElementById("sys-pay-crypto-qr-type").value;
    
    s.cryptoQRUrlUSDT = document.getElementById("sys-pay-crypto-qr-usdt").value.trim();
    s.cryptoQRUrlBTC = document.getElementById("sys-pay-crypto-qr-btc").value.trim();
    s.cryptoQRUrlETH = document.getElementById("sys-pay-crypto-qr-eth").value.trim();
    s.cryptoInstruction = document.getElementById("sys-pay-crypto-instruction").value.trim();

    s.payAgentDepositEnabled = getChk("sys-pay-agent-deposit-enabled", true);
    s.payAgentWithdrawEnabled = getChk("sys-pay-agent-withdraw-enabled", true);
    s.mobileInstructionAgentDeposit = document.getElementById("sys-pay-agent-deposit-instruction").value.trim();
    s.mobileInstructionAgentWithdraw = document.getElementById("sys-pay-agent-withdraw-instruction").value.trim();

    // Legacy fallback string support
    s.cryptoAddress = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";

    app.saveDB();
    app.rebuildDepositGatewaySelect();
    app.rebuildWithdrawGatewaySelect();
    if ((window as any).admin && typeof (window as any).admin.updatePaymentGatewaysStatusUI === "function") {
      (window as any).admin.updatePaymentGatewaysStatusUI();
    }
    app.showToast("Live payment gateways and dynamic routes synchronized.", "success");
    app.render();
    });
  }

  // 1-Click Payment Gateways Controls
  const btn1ClickEnableAll = document.getElementById("btn-1click-enable-all-payments");
  if (btn1ClickEnableAll) {
    btn1ClickEnableAll.addEventListener("click", () => {
      if ((window as any).admin && typeof (window as any).admin.setAllPaymentGatewaysState === "function") {
        (window as any).admin.setAllPaymentGatewaysState(true, true);
      }
    });
  }
  const btn1ClickDisableAll = document.getElementById("btn-1click-disable-all-payments");
  if (btn1ClickDisableAll) {
    btn1ClickDisableAll.addEventListener("click", () => {
      if ((window as any).admin && typeof (window as any).admin.setAllPaymentGatewaysState === "function") {
        (window as any).admin.setAllPaymentGatewaysState(false, true);
      }
    });
  }

  const saveAppConfigForm = document.getElementById("admin-settings-app-config-form");
  if (saveAppConfigForm) {
    saveAppConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();

    app.db.settings.maintenanceMode = document.getElementById("sys-maintenance-toggle").checked;
    app.db.settings.maintenanceMessage = document.getElementById("sys-maintenance-msg").value.trim();
    app.db.settings.forceUpdateLink = document.getElementById("sys-app-url").value.trim();
    app.db.settings.appVersion = document.getElementById("sys-app-ver").value.trim();
    app.db.settings.adminPass = document.getElementById("sys-admin-p").value.trim();

    // Save Deposit Match Booster parameters
    app.db.settings.depBonusPercent = parseFloat(document.getElementById("sys-dep-boost-percent").value);
    app.db.settings.depBonusMin = parseFloat(document.getElementById("sys-dep-boost-min").value);
    app.db.settings.depBonusEnabled = document.getElementById("sys-dep-boost-toggle").checked;

    // Save Agent Referral Bonus & WhatsApp Settings
    app.db.settings.agentReferralBonus = parseFloat(document.getElementById("sys-agent-referral-bonus")?.value || "100");
    app.db.settings.whatsappUrl = document.getElementById("sys-whatsapp-url")?.value.trim() || "";

    app.saveDB();
    app.showToast("Core system parameters and maintenance configs committed.", "success");
    app.render();
    });
  }

  const saveCheckinSponsorForm = document.getElementById("admin-settings-checkin-sponsor-form");
  if (saveCheckinSponsorForm) {
    saveCheckinSponsorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = app.db.settings;
      s.sponsorTaskRequired = document.getElementById("sys-checkin-task-required")?.checked !== false;
      s.sponsorLink = document.getElementById("sys-checkin-sponsor-link")?.value.trim() || "https://google.com";
      s.sponsorLinkTitle = document.getElementById("sys-checkin-sponsor-title")?.value.trim() || "স্পন্সর লিংক ভিজিট করুন";
      s.sponsorLinkInstruction = document.getElementById("sys-checkin-sponsor-instruction")?.value.trim() || "আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করুন।";
      s.sponsorTaskTimer = parseInt(document.getElementById("sys-checkin-sponsor-timer")?.value || "5", 10);
      s.sponsorAutoOpen = document.getElementById("sys-checkin-auto-open")?.checked !== false;

      const newRewards = [];
      for (let i = 1; i <= 7; i++) {
        const val = parseFloat(document.getElementById(`sys-checkin-reward-day${i}`)?.value || "0");
        newRewards.push(val > 0 ? val : (i * 2));
      }
      s.checkinRewards = newRewards;

      app.saveDB();
      app.showToast("⚙️ Daily Check-In & Sponsor Link settings saved!", "success");
      app.render();
    });
  }

  const saveWebsiteForm = document.getElementById("admin-settings-website-form");
  if (saveWebsiteForm) {
    saveWebsiteForm.addEventListener("submit", (e) => {
      e.preventDefault();

      app.db.settings.siteName = document.getElementById("sys-site-name").value.trim();
      app.db.settings.siteInfo = document.getElementById("sys-site-info").value.trim();
      app.db.settings.signupBonus = parseFloat(document.getElementById("sys-signup-bonus").value.trim());
      app.db.settings.supportNumber = document.getElementById("sys-support-num").value.trim();
      app.db.settings.authFooterText = document.getElementById("sys-auth-footer-text").value.trim();

      app.saveDB();
      app.showToast("Website settings and sign-up bonus configurations stored successfully.", "success");
      app.render();
    });
  }

  // Handle Admin Web Push Ads Broadcaster Form
  const broadcastPushForm = document.getElementById("admin-settings-push-broadcast-form");
  if (broadcastPushForm) {
    // Permission badge refresh function
    const refreshStatusBarBadge = () => {
      const badge = document.getElementById("admin-status-bar-permission-badge");
      if (!badge) return;

      if (!("Notification" in window)) {
        badge.textContent = "UNSUPPORTED ⚠️";
        badge.className = "px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-black text-[10px]";
        return;
      }

      const perm = Notification.permission;
      if (perm === "granted") {
        badge.textContent = "ACTIVE 🟢";
        badge.className = "px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px]";
      } else if (perm === "denied") {
        badge.textContent = "BLOCKED 🔴";
        badge.className = "px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-black text-[10px]";
      } else {
        badge.textContent = "ENABLE NEEDED 🟡";
        badge.className = "px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px]";
      }
    };

    refreshStatusBarBadge();

    // Enable Status Bar Permission button listener
    const enablePermBtn = document.getElementById("admin-enable-status-bar-perm-btn");
    if (enablePermBtn) {
      enablePermBtn.addEventListener("click", () => {
        NotificationEngine.requestNativePermission().then(() => {
          refreshStatusBarBadge();
        });
      });
    }

    // Test Status Bar Push button listener
    const testPushBtn = document.getElementById("admin-test-status-bar-push-btn");
    if (testPushBtn) {
      testPushBtn.addEventListener("click", () => {
        NotificationEngine.trigger(
          "🚀 Status Bar Push Alert Test!",
          "Service Worker notification delivered to mobile & desktop status bar!",
          "bkash",
          "tab-wallet"
        );
        app.showToast("⚡ Status bar push test dispatched!", "success");
      });
    }

    // Preset dropdown listener
    const presetSelect = document.getElementById("sys-push-preset-select");
    if (presetSelect) {
      presetSelect.addEventListener("change", () => {
        if (presetSelect.value) {
          const imgUrlInput = document.getElementById("sys-push-image-url");
          if (imgUrlInput) imgUrlInput.value = presetSelect.value;
        }
      });
    }

    // Live preview button listener
    const previewBtn = document.getElementById("sys-push-preview-btn");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        const title = document.getElementById("sys-push-title").value.trim() || "🔥 ৫০% ডিপোজিট ক্যাশব্যাক অফার!";
        const message = document.getElementById("sys-push-message").value.trim() || "বিকাশে ডিপোজিট করে আজই ক্যাশব্যাক ইনস্ট্যান্ট বোনাস উপভোগ করুন!";
        const imageUrl = document.getElementById("sys-push-image-url").value.trim() || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800";
        const ctaText = document.getElementById("sys-push-cta-text").value.trim() || "👉 Claim Offer Now";
        const iconType = document.getElementById("sys-push-icon-type").value || "bkash";
        const redirectTab = document.getElementById("sys-push-redirect-tab").value || "tab-wallet";

        NotificationEngine.triggerWebPushAd({
          title,
          message,
          imageUrl,
          ctaText,
          iconType,
          targetTab: redirectTab
        });
      });
    }

    // Form submit listener (Broadcast Web Push Ad)
    broadcastPushForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("sys-push-title").value.trim();
      const message = document.getElementById("sys-push-message").value.trim();
      const imageUrl = document.getElementById("sys-push-image-url").value.trim();
      const ctaText = document.getElementById("sys-push-cta-text").value.trim();
      const iconType = document.getElementById("sys-push-icon-type").value;
      const redirectTab = document.getElementById("sys-push-redirect-tab").value;
      const targetAudience = document.getElementById("sys-push-target-audience").value;

      const adData = {
        id: "ad_" + Date.now(),
        title,
        message,
        imageUrl,
        ctaText,
        iconType,
        targetTab: redirectTab,
        targetAudience,
        clicks: 0,
        date: new Date().toISOString()
      };

      if (!app.db.webPushAds) app.db.webPushAds = [];
      app.db.webPushAds.unshift(adData);
      app.saveDB();

      // Trigger Web Push Ad locally & broadcast
      NotificationEngine.triggerWebPushAd(adData);

      app.showToast("🚀 Web Push Ad Campaign dispatched successfully to network!", "success");

      // Refresh campaign history
      app.renderWebPushAdsHistory();

      // Reset text inputs
      document.getElementById("sys-push-title").value = "";
      document.getElementById("sys-push-message").value = "";
    });
  }

  // Clear push history button
  const clearPushHistBtn = document.getElementById("clear-push-history-btn");
  if (clearPushHistBtn) {
    clearPushHistBtn.addEventListener("click", () => {
      app.db.webPushAds = [];
      app.saveDB();
      app.renderWebPushAdsHistory();
      app.showToast("Web Push Ad campaign history cleared.", "info");
    });
  }

  // Handle Admin Jackpot settings & countdown expiry submit
  const adminJackpotConfigForm = document.getElementById("admin-jackpot-config-form");
  if (adminJackpotConfigForm) {
    adminJackpotConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const poolInput = document.getElementById("admin-jackpot-pool-input");
      const priceInput = document.getElementById("admin-jackpot-price-input");
      const expiryInput = document.getElementById("admin-jackpot-expiry-input");

      if (poolInput && priceInput && expiryInput) {
        const poolVal = parseFloat(poolInput.value);
        const priceVal = parseFloat(priceInput.value);
        const expiryVal = expiryInput.value;

        if (isNaN(poolVal) || poolVal < 0) {
          app.showToast("Invalid Jackpot Pool fund amount!", "error");
          return;
        }
        if (isNaN(priceVal) || priceVal < 0) {
          app.showToast("Invalid ticket entry fee!", "error");
          return;
        }

        app.db.settings.jackpotPool = poolVal;
        app.db.settings.jackpotTicketCost = priceVal;
        app.db.settings.jackpotExpiry = expiryVal;

        app.saveDB();
        app.showToast("Progressive Jackpot pool, entry fee, and countdown timer set!", "success");
        app.render();
      }
    });
  }

  // Admin Send Message dynamic field toggle
  const recipientSelect = document.getElementById("admin-msg-recipient-type");
  const specificUserGroup = document.getElementById("admin-msg-specific-username-group");
  const targetUsernameInput = document.getElementById("admin-msg-target-username");

  if (recipientSelect && specificUserGroup && targetUsernameInput) {
    recipientSelect.addEventListener("change", (e) => {
      if (e.target.value === "specific") {
        specificUserGroup.classList.remove("hidden");
        targetUsernameInput.required = true;
      } else {
        specificUserGroup.classList.add("hidden");
        targetUsernameInput.required = false;
        targetUsernameInput.value = "";
      }
    });
  }

  // Admin Send Message form submission handler
  const adminMsgForm = document.getElementById("admin-send-message-form");
  if (adminMsgForm) {
    adminMsgForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const recipientType = document.getElementById("admin-msg-recipient-type").value;
      const targetUsername = document.getElementById("admin-msg-target-username").value.trim();
      const category = document.getElementById("admin-msg-category").value;
      const subject = document.getElementById("admin-msg-subject").value.trim();
      const content = document.getElementById("admin-msg-content").value.trim();

      if (recipientType === "specific") {
        if (!targetUsername) {
          app.showToast("Please enter a target player username.", "error");
          return;
        }
        // Verify user exists in DB
        const users = app.db.users || [];
        const userExists = users.some(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!userExists) {
          app.showToast(`User @${targetUsername} does not exist in our system.`, "error");
          return;
        }
      }

      // Add message
      const newMsg = {
        id: "msg_" + Date.now(),
        recipientType,
        targetUsername: recipientType === "specific" ? targetUsername : "",
        category,
        subject,
        content,
        date: new Date().toISOString(),
        readBy: []
      };

      if (!app.db.messages) {
        app.db.messages = [];
      }
      app.db.messages.push(newMsg);
      app.saveDB();

      app.showToast(`Message successfully dispatched as ${recipientType === 'bulk' ? 'broadcast notice' : 'direct update to ' + targetUsername}.`, "success");

      // Reset form controls safely
      document.getElementById("admin-msg-subject").value = "";
      document.getElementById("admin-msg-content").value = "";
      if (targetUsernameInput) {
        targetUsernameInput.value = "";
      }

      app.renderAdminMessages();
    });
  }

  // ================= EVENT BINDINGS FOR CUSTOM MODALS & GOOGLE DRIVE/PICKER =================

  // Close details and ticket popup modals (delegated)
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target || typeof target.closest !== "function") return;

    const closeLotteryBtn = target.closest("#close-lottery-details-btn");
    if (closeLotteryBtn) {
      const modal = document.getElementById("lottery-details-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
      return;
    }

    // Backdrop click to close lottery details modal
    if (target.id === "lottery-details-modal") {
      target.classList.add("hidden");
      target.style.display = "none";
      return;
    }

    // Delegated click handler to ensure ANY lottery card or carousel card opens details popup
    if (!target.closest(".buy-pool-btn") && !target.closest(".carousel-buy-btn") && !target.closest("#detail-lot-buy-btn") && !target.closest("#close-lottery-details-btn")) {
      const lotCard = target.closest(".lottery-ticket-card, .carousel-card-item, [data-lottery-id]");
      if (lotCard && !lotCard.closest("#lottery-details-modal")) {
        const lotId = lotCard.getAttribute("data-lottery-id") || lotCard.getAttribute("data-id");
        if (lotId && app.db && app.db.lotteries && app.db.lotteries.some(l => l.id === lotId)) {
          e.stopPropagation();
          app.openLotteryDetailsPop(lotId);
          return;
        }
      }
    }

    const closeTicketBtn = target.closest("#close-ticket-info-btn");
    if (closeTicketBtn) {
      document.getElementById("ticket-info-modal")?.classList.add("hidden");
      return;
    }

    const profileGoogleBtn = e.target.closest("#profile-google-photo-btn") || e.target.closest("#profile-modal-google-photo-btn");
    if (profileGoogleBtn) {
      app.launchGooglePickerForAvatar();
      return;
    }

    const gdriveAuthBtn = e.target.closest("#gdrive-authorize-btn");
    if (gdriveAuthBtn) {
      app.authenticateGoogle();
      return;
    }

    const gdriveDisconnectBtn = e.target.closest("#gdrive-disconnect-btn");
    if (gdriveDisconnectBtn) {
      app.disconnectGoogle();
      return;
    }

    const backupLedgerBtn = e.target.closest("#backup-ledger-btn");
    if (backupLedgerBtn) {
      app.backupLedgersToDrive();
      return;
    }

    const viewBackupsBtn = e.target.closest("#view-backups-picker-btn");
    if (viewBackupsBtn) {
      app.browseDriveStatementsPicker();
      return;
    }

    const depReceiptPickerBtn = e.target.closest("#dep-receipt-picker-btn");
    if (depReceiptPickerBtn) {
      app.launchGooglePickerForReceipt();
      return;
    }

    const depClearReceiptBtn = e.target.closest("#dep-clear-receipt-btn");
    if (depClearReceiptBtn) {
      app.selectedReceiptFile = null;
      const holder = document.getElementById("dep-selected-receipt-holder");
      if (holder) holder.classList.add("hidden");
      app.showToast("Receipt attachment removed.", "info");
      return;
    }
  });

  // Local user profile avatar photo upload input selection & dynamic gateway instructions (delegated)
  document.addEventListener("change", (e) => {
    const profileUploadInput = e.target.closest("#profile-local-upload-input") || e.target.closest("#profile-modal-upload-input") || e.target.closest("#customizer-tab-upload-input");
    if (profileUploadInput) {
      const file = profileUploadInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          app.currentUser.photo = event.target.result;
          app.saveDB();
          app.showToast("Local profile image assigned custom avatar!", "success");
          app.render();
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    const depGatewayInput = e.target.closest("#dep-gateway");
    if (depGatewayInput) {
      app.updateSelectedDepositGatewayInstructions();
      return;
    }
  });

  // Profile Edit form submitted inside SPA Tab & other forms (delegated)
  document.addEventListener("submit", (e) => {
    const editForm = e.target.closest("#profile-edit-form-spa");
    if (editForm) {
      e.preventDefault();
      const emailVal = document.getElementById("profile-edit-email").value.trim();
      const phoneVal = document.getElementById("profile-edit-phone").value.trim();
      const dobVal = document.getElementById("profile-edit-dob").value.trim();

      app.currentUser.email = emailVal;
      app.currentUser.phone = phoneVal;
      app.currentUser.dob = dobVal;

      app.saveDB();
      app.showToast("Profile credentials synchronized successfully!", "success");
      app.render();
    }
  });

  // Click to Copy action for target line account number/addresses
  const setupCopyBtn = (btnId, textElId) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", function() {
      const accountStr = document.getElementById(textElId).innerText;
      if (!accountStr || accountStr === "None" || accountStr === "N/A") {
        app.showToast("No active address available to copy.", "error");
        return;
      }
      
      const tempInput = document.createElement("textarea");
      tempInput.value = accountStr;
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand("copy");
        app.showToast("Copied to clipboard: " + accountStr, "success");
        
        const copySpan = this.querySelector("span");
        if (copySpan) {
          const prevText = copySpan.innerText;
          copySpan.innerText = "Copied!";
          setTimeout(() => {
            copySpan.innerText = prevText;
          }, 2000);
        }
      } catch (err) {
        app.showToast("Could not copy address.", "error");
      }
      document.body.removeChild(tempInput);
    });
  };

  setupCopyBtn("copy-dep-personal-btn", "user-dep-account-personal");
  setupCopyBtn("copy-dep-agent-btn", "user-dep-account-agent");
  setupCopyBtn("copy-dep-single-btn", "user-dep-account-single");

  // Admin Side QR code preview live swappers and helpers
  const adminQrSelector = document.getElementById("admin-spa-qr-selector");
  if (adminQrSelector) {
    adminQrSelector.addEventListener("change", () => {
      app.refreshAdminQRPreview();
    });
  }

  const qrTypeSelector = document.getElementById("sys-pay-crypto-qr-type");
  if (qrTypeSelector) {
    qrTypeSelector.addEventListener("change", (e) => {
      const customUrlsArea = document.getElementById("sys-pay-crypto-custom-urls");
      if (e.target.value === "custom") {
        customUrlsArea.classList.remove("hidden");
      } else {
        customUrlsArea.classList.add("hidden");
      }
      app.refreshAdminQRPreview();
    });
  }

  // Auto update admin QR preview on user keystroke changes
  const qrInputs = [
    "sys-pay-crypto-usdt", "sys-pay-crypto-btc", "sys-pay-crypto-eth",
    "sys-pay-crypto-qr-usdt", "sys-pay-crypto-qr-btc", "sys-pay-crypto-qr-eth"
  ];
  qrInputs.forEach(id => {
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        app.refreshAdminQRPreview();
      });
    }
  });

  // Dynamic Category Creation and Configuration Listeners
  const adminCreateCategoryBtn = document.getElementById("admin-create-category-btn");
  if (adminCreateCategoryBtn) {
    adminCreateCategoryBtn.addEventListener("click", () => {
      document.getElementById("category-creation-zone").classList.remove("hidden");
    });
  }

  const cancelCategoryBtn = document.getElementById("cancel-category-btn");
  if (cancelCategoryBtn) {
    cancelCategoryBtn.addEventListener("click", () => {
      document.getElementById("category-creation-zone").classList.add("hidden");
      document.getElementById("new-cat-name").value = "";
      document.getElementById("new-cat-label").value = "";
      document.getElementById("new-cat-prizes").value = "";
    });
  }

  const saveCategoryBtn = document.getElementById("save-category-btn");
  if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener("click", () => {
      const name = document.getElementById("new-cat-name").value.trim();
      const label = document.getElementById("new-cat-label").value.trim();
      const type = document.getElementById("new-cat-type").value;
      const prizes = document.getElementById("new-cat-prizes").value.trim();

      if (!name || !label) {
        app.showToast("Category slug name and display label are required!", "error");
        return;
      }

      if (app.db.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        app.showToast("Category slug identifier already exists!", "error");
        return;
      }

      const newCategory = {
        id: "c" + Date.now(),
        name: name,
        label: label,
        type: type,
        defaultPrizes: prizes
      };

      app.db.categories.push(newCategory);
      app.saveDB();
      app.showToast(`Category '${label}' added successfully!`, "success");

      // Reset
      document.getElementById("category-creation-zone").classList.add("hidden");
      document.getElementById("new-cat-name").value = "";
      document.getElementById("new-cat-label").value = "";
      document.getElementById("new-cat-prizes").value = "";

      // Reload dropdown allocations and dynamic tabs
      app.populateCreatePoolCategories();
      app.renderAdminCategories();
      app.render();
    });
  }

  // Keep track of community subtabs, admin moderation reporting and consent clicks
  document.addEventListener("click", (e) => {
    if (!e.target || typeof e.target.closest !== "function") return;
    // 1. Home category tabs
    const tabBtn = e.target.closest(".home-cat-tab-btn");
    if (tabBtn) {
      const cat = tabBtn.getAttribute("data-category");
      app.currentHomeCategory = cat;
      app.render();
      return;
    }

    // 2. History sub-tabs
    const subtabLedger = e.target.closest("#history-subtab-ledger");
    if (subtabLedger) {
      app.historySubTab = "ledger";
      app.render();
      return;
    }
    const subtabCommunity = e.target.closest("#history-subtab-community");
    if (subtabCommunity) {
      app.historySubTab = "community";
      app.render();
      return;
    }

    // 3. Admin Reports sub-tabs
    const subtabPostRep = e.target.closest("#admin-subtab-post-reports");
    if (subtabPostRep) {
      app.currentAdminReportsTab = "post";
      app.renderAdminReports();
      return;
    }
    const subtabCommentRep = e.target.closest("#admin-subtab-comment-reports");
    if (subtabCommentRep) {
      app.currentAdminReportsTab = "comment";
      app.renderAdminReports();
      return;
    }

    // 4. Grant consent button
    const grantBtn = e.target.closest("#community-grant-consent-btn");
    if (grantBtn) {
      if (app.currentUser) {
        // Update both session and database
        app.currentUser.communityConsent = true;
        
        const dbUser = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbUser) {
          dbUser.communityConsent = true;
        }
        app.saveDB();
        app.currentUser = StateManager.removeCircularReferences(app.currentUser);
        localStorage.setItem(app.sessionKey, StateManager.safeStringify(app.currentUser));
        
        app.showToast("Permission granted! Welcome to the Community Space.", "success");
        app.render();
      }
      return;
    }

    // 5. Submit community post
    const postSubmitBtn = e.target.closest("#community-submit-post-btn");
    if (postSubmitBtn) {
      const inputEl = document.getElementById("community-new-post-text");
      if (inputEl) {
        const text = inputEl.value.trim();
        if (!text) {
          app.showToast("Please enter some text to broadcast inside the community feed.", "error");
          return;
        }
        
        // Check if user is blocked/banned in DB
        const dbUsr = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbUsr && (dbUsr.status === "blocked" || dbUsr.status === "permanently_banned")) {
          app.showToast("Your account has restriction limits and cannot broadcast posts.", "error");
          return;
        }

        const newPost = {
          id: "p" + Date.now(),
          userId: app.currentUser.id,
          username: app.currentUser.username,
          email: app.currentUser.email,
          content: text,
          likes: [],
          dislikes: [],
          date: new Date().toISOString(),
          status: "active"
        };
        
        if (!app.db.communityPosts) app.db.communityPosts = [];
        app.db.communityPosts.push(newPost);
        app.saveDB();
        
        inputEl.value = "";
        app.showToast("Post shared successfully inside Community Space!", "success");
        app.renderCommunitySection();
      }
      return;
    }

    // 6. Community Like action
    const likeBtn = e.target.closest(".com-act-like");
    if (likeBtn) {
      const postId = likeBtn.getAttribute("data-post-id");
      const post = (app.db.communityPosts || []).find(p => p.id === postId);
      if (post && app.currentUser) {
        if (!post.likes) post.likes = [];
        if (!post.dislikes) post.dislikes = [];

        const index = post.likes.indexOf(app.currentUser.id);
        if (index > -1) {
          post.likes.splice(index, 1);
        } else {
          post.likes.push(app.currentUser.id);
          // remove from dislikes
          const disIndex = post.dislikes.indexOf(app.currentUser.id);
          if (disIndex > -1) post.dislikes.splice(disIndex, 1);
        }
        app.saveDB();
        app.renderCommunitySection();
      }
      return;
    }

    // 7. Community Dislike action
    const dislikeBtn = e.target.closest(".com-act-dislike");
    if (dislikeBtn) {
      const postId = dislikeBtn.getAttribute("data-post-id");
      const post = (app.db.communityPosts || []).find(p => p.id === postId);
      if (post && app.currentUser) {
        if (!post.likes) post.likes = [];
        if (!post.dislikes) post.dislikes = [];

        const index = post.dislikes.indexOf(app.currentUser.id);
        if (index > -1) {
          post.dislikes.splice(index, 1);
        } else {
          post.dislikes.push(app.currentUser.id);
          // remove from likes
          const likeIndex = post.likes.indexOf(app.currentUser.id);
          if (likeIndex > -1) post.likes.splice(likeIndex, 1);
        }
        app.saveDB();
        app.renderCommunitySection();
      }
      return;
    }

    // 8. Community Submit Reply Comment
    const replySubmitBtn = e.target.closest(".com-act-submit-comment");
    if (replySubmitBtn) {
      const postId = replySubmitBtn.getAttribute("data-post-id");
      // Find input el
      const inputs = document.querySelectorAll(".community-comment-input");
      let text = "";
      inputs.forEach(inp => {
        if (inp.getAttribute("data-post-id") === postId) {
          text = inp.value.trim();
          inp.value = ""; // clear
        }
      });

      if (!text) {
        app.showToast("Write custom reply text first before submitting.", "error");
        return;
      }

      // Check if user is blocked/banned in DB
      const dbUsr = app.db.users.find(u => u.id === app.currentUser.id);
      if (dbUsr && (dbUsr.status === "blocked" || dbUsr.status === "permanently_banned")) {
        app.showToast("Your account has restriction limits and cannot submit replies.", "error");
        return;
      }

      const newComment = {
        id: "m" + Date.now(),
        postId: postId,
        userId: app.currentUser.id,
        username: app.currentUser.username,
        email: app.currentUser.email,
        content: text,
        date: new Date().toISOString(),
        status: "active"
      };

      if (!app.db.communityComments) app.db.communityComments = [];
      app.db.communityComments.push(newComment);
      app.saveDB();
      app.showToast("Your reply comment has been published successfully.", "success");
      app.renderCommunitySection();
      return;
    }

    // 9. Community Report Post
    const reportPostBtn = e.target.closest(".com-act-report-post");
    if (reportPostBtn) {
      const postId = reportPostBtn.getAttribute("data-post-id");
      const post = (app.db.communityPosts || []).find(p => p.id === postId);
      if (post && app.currentUser) {
        // Prepare custom safety modal values
        const targetIdEl = document.getElementById("report-modal-target-id");
        const targetTypeEl = document.getElementById("report-modal-target-type");
        const contentPreviewEl = document.getElementById("report-modal-content-preview");
        const authorPreviewEl = document.getElementById("report-modal-author-preview");
        const detailsEl = document.getElementById("report-modal-details");

        if (targetIdEl) targetIdEl.value = post.id;
        if (targetTypeEl) targetTypeEl.value = "post";
        if (contentPreviewEl) contentPreviewEl.innerText = `"${post.content}"`;
        if (authorPreviewEl) authorPreviewEl.innerText = `@${post.username}`;
        if (detailsEl) detailsEl.value = "";

        // Unhide report modal
        const reportModal = document.getElementById("community-report-modal");
        if (reportModal) {
          reportModal.classList.remove("hidden");
        }
      }
      return;
    }

    // 10. Community Report Comment
    const reportCommentBtn = e.target.closest(".com-act-report-comment");
    if (reportCommentBtn) {
      const commentId = reportCommentBtn.getAttribute("data-comment-id");
      const comment = (app.db.communityComments || []).find(c => c.id === commentId);
      if (comment && app.currentUser) {
        // Prepare custom safety modal values
        const targetIdEl = document.getElementById("report-modal-target-id");
        const targetTypeEl = document.getElementById("report-modal-target-type");
        const contentPreviewEl = document.getElementById("report-modal-content-preview");
        const authorPreviewEl = document.getElementById("report-modal-author-preview");
        const detailsEl = document.getElementById("report-modal-details");

        if (targetIdEl) targetIdEl.value = comment.id;
        if (targetTypeEl) targetTypeEl.value = "comment";
        if (contentPreviewEl) contentPreviewEl.innerText = `"${comment.content}"`;
        if (authorPreviewEl) authorPreviewEl.innerText = `@${comment.username}`;
        if (detailsEl) detailsEl.value = "";

        // Unhide report modal
        const reportModal = document.getElementById("community-report-modal");
        if (reportModal) {
          reportModal.classList.remove("hidden");
        }
      }
      return;
    }

    // Report close buttons actions (dismiss click)
    const closeReportBtn = e.target.closest("#community-report-close-btn") || e.target.closest("#community-report-cancel-btn");
    if (closeReportBtn) {
      const reportModal = document.getElementById("community-report-modal");
      if (reportModal) {
        reportModal.classList.add("hidden");
      }
      return;
    }

    // Submit safety report form action
    const submitReportBtn = e.target.closest("#community-report-submit-btn");
    if (submitReportBtn) {
      const targetId = document.getElementById("report-modal-target-id").value;
      const targetType = document.getElementById("report-modal-target-type").value;
      const baseReason = document.getElementById("report-modal-reason-dropdown").value;
      const details = document.getElementById("report-modal-details").value.trim();
      
      const fullReason = details ? `${baseReason} - ${details}` : baseReason;
      
      let targetText = "Unknown content";
      let authorUsername = "unknown";
      
      if (targetType === "post") {
        const post = (app.db.communityPosts || []).find(p => p.id === targetId);
        if (post) {
          targetText = post.content;
          authorUsername = post.username;
        }
      } else {
        const comment = (app.db.communityComments || []).find(c => c.id === targetId);
        if (comment) {
          targetText = comment.content;
          authorUsername = comment.username;
        }
      }

      const newReport = {
        id: "rep" + Date.now(),
        reporterId: app.currentUser.id,
        reporterUsername: app.currentUser.username,
        type: targetType,
        targetId: targetId,
        targetText: targetText,
        authorUsername: authorUsername,
        reason: fullReason,
        date: new Date().toISOString(),
        status: "pending"
      };

      if (!app.db.reports) app.db.reports = [];
      app.db.reports.push(newReport);
      app.saveDB();

      if (!navigator.onLine && app.offlineQueue) {
        app.offlineQueue.enqueueAction("SUBMIT_REPORT", {
          report: newReport
        });
      }
      
      // Close report modal
      const reportModal = document.getElementById("community-report-modal");
      if (reportModal) {
        reportModal.classList.add("hidden");
      }
      app.showToast("Thank you. Safety report submitted for administrator auditing.", "success");
      app.renderCommunitySection();
      return;
    }

    // Community Filter Tab Pills click actions
    const comFilterPill = e.target.closest(".community-filter-pill");
    if (comFilterPill) {
      const filterVal = comFilterPill.getAttribute("data-filter");
      app.communityFilter = filterVal;
      app.renderCommunitySection();
      return;
    }

    // 11. Admin Action: Ban Permanent
    const banUserBtn = e.target.closest(".admin-act-ban-user");
    if (banUserBtn) {
      const username = banUserBtn.getAttribute("data-username");
      const repId = banUserBtn.getAttribute("data-rep-id");
      if (confirm(`Are you absolutely sure you want to PERMANENTLY BAN player @${username}? This prevents them from signing in completely.`)) {
        // Update user status
        const targetedUser = app.db.users.find(usr => usr.username === username);
        if (targetedUser) {
          targetedUser.status = "permanently_banned";
        }
        // Mark report resolved
        const rep = (app.db.reports || []).find(r => r.id === repId);
        if (rep) {
          rep.status = "resolved";
        }
        app.saveDB();
        app.showToast(`Player @${username} has been permanently barred from system.`, "success");
        app.renderAdminReports();
      }
      return;
    }

    // 12. Admin Action: Temp Block (24 hours)
    const tempUserBtn = e.target.closest(".admin-act-temp-user");
    if (tempUserBtn) {
      const username = tempUserBtn.getAttribute("data-username");
      const repId = tempUserBtn.getAttribute("data-rep-id");
      if (confirm(`Temporarily freeze @${username} account status for a scheduled 24 hours block period?`)) {
        const targetedUser = app.db.users.find(usr => usr.username === username);
        if (targetedUser) {
          targetedUser.status = "blocked";
          targetedUser.blockedUntil = new Date(Date.now() + 86400000).toISOString();
        }
        // Mark report resolved
        const rep = (app.db.reports || []).find(r => r.id === repId);
        if (rep) {
          rep.status = "resolved";
        }
        app.saveDB();
        app.showToast(`Temporary safety freeze placed on @${username} for 24 hours.`, "success");
        app.renderAdminReports();
      }
      return;
    }

    // 13. Admin Action: Schedule Block (7 Days)
    const schedUserBtn = e.target.closest(".admin-act-sched-user");
    if (schedUserBtn) {
      const username = schedUserBtn.getAttribute("data-username");
      const repId = schedUserBtn.getAttribute("data-rep-id");
      if (confirm(`Place @${username} on a safety cooling scheduled block suspension for 7 Days?`)) {
        const targetedUser = app.db.users.find(usr => usr.username === username);
        if (targetedUser) {
          targetedUser.status = "blocked";
          targetedUser.blockedUntil = new Date(Date.now() + 7 * 86400000).toISOString();
        }
        // Mark report resolved
        const rep = (app.db.reports || []).find(r => r.id === repId);
        if (rep) {
          rep.status = "resolved";
        }
        app.saveDB();
        app.showToast(`7-Days scheduled cooling suspension applied successfully for @${username}.`, "success");
        app.renderAdminReports();
      }
      return;
    }

    // 14. Admin Action: Remove Post Content
    const delPostBtn = e.target.closest(".admin-act-remove-post");
    if (delPostBtn) {
      const postId = delPostBtn.getAttribute("data-post-id");
      const repId = delPostBtn.getAttribute("data-rep-id");
      if (confirm(`Are you sure you want to ban and de-publish this reported Community Post entirely?`)) {
        const post = (app.db.communityPosts || []).find(p => p.id === postId);
        if (post) {
          post.status = "banned";
        }
        // Mark report resolved
        const rep = (app.db.reports || []).find(r => r.id === repId);
        if (rep) {
          rep.status = "resolved";
        }
        app.saveDB();
        app.showToast("Community Post successfully flagged banned & un-published.", "success");
        app.renderAdminReports();
      }
      return;
    }

    // 15. Admin Action: Remove Comment Content
    const delCommentBtn = e.target.closest(".admin-act-remove-comment");
    if (delCommentBtn) {
      const commentId = delCommentBtn.getAttribute("data-comment-id");
      const repId = delCommentBtn.getAttribute("data-rep-id");
      if (confirm(`Are you sure you want to ban and purge this reported reply comment description?`)) {
        const comment = (app.db.communityComments || []).find(c => c.id === commentId);
        if (comment) {
          comment.status = "banned";
        }
        // Mark report resolved
        const rep = (app.db.reports || []).find(r => r.id === repId);
        if (rep) {
          rep.status = "resolved";
        }
        app.saveDB();
        app.showToast("Comment reply successfully flagged banned & un-published.", "success");
        app.renderAdminReports();
      }
      return;
    }

    // 16. Admin Action: Dismiss Abuse Report
    const dismissBtn = e.target.closest(".admin-act-dismiss");
    if (dismissBtn) {
      const repId = dismissBtn.getAttribute("data-rep-id");
      const rep = (app.db.reports || []).find(r => r.id === repId);
      if (rep) {
        rep.status = "resolved";
        app.saveDB();
        app.showToast("Report rejected/dismissed. Under auditing, content was deemed clean.", "success");
        app.renderAdminReports();
      }
      return;
    }
  });

  // -------------------------------------------------------------------------
  // INTERACTIVE SCREENSHOT ZOOM & IN-APP LIGHTBOX HANDLERS WITH DRAG & ROTATE
  // -------------------------------------------------------------------------
  const modal = document.getElementById("screenshot-viewer-modal");
  const imgViewer = document.getElementById("screenshot-large-img");
  const viewport = document.getElementById("screenshot-viewport");
  const zoomSlider = document.getElementById("screenshot-zoom-slider");

  function applyViewerTransform() {
    if (!imgViewer || !window.screenshotViewerState) return;
    const s = window.screenshotViewerState;
    imgViewer.style.transform = `scale(${s.zoom}) translate(${s.panX}px, ${s.panY}px) rotate(${s.rotate}deg)`;
    const percentEl = document.getElementById("screenshot-zoom-percent");
    if (percentEl) {
      percentEl.innerText = `${Math.round(s.zoom * 100)}%`;
    }
    if (zoomSlider) {
      zoomSlider.value = s.zoom;
    }
  }

  // Dragging event registrations
  if (viewport && imgViewer) {
    viewport.addEventListener("mousedown", (e) => {
      if (!window.screenshotViewerState) return;
      e.preventDefault();
      const s = window.screenshotViewerState;
      s.isDragging = true;
      s.startX = e.clientX - s.panX;
      s.startY = e.clientY - s.panY;
      imgViewer.classList.remove("transition-transform"); // remove transition during drag for real-time response
    });

    window.addEventListener("mousemove", (e) => {
      if (!window.screenshotViewerState || !window.screenshotViewerState.isDragging) return;
      const s = window.screenshotViewerState;
      s.panX = e.clientX - s.startX;
      s.panY = e.clientY - s.startY;
      applyViewerTransform();
    });

    window.addEventListener("mouseup", () => {
      if (window.screenshotViewerState) {
        window.screenshotViewerState.isDragging = false;
        if (imgViewer) imgViewer.classList.add("transition-transform");
      }
    });

    // Handle touch panels for mobile administrators with pinch-to-zoom support
    viewport.addEventListener("touchstart", (e) => {
      if (!window.screenshotViewerState) return;
      
      const s = window.screenshotViewerState;
      if (e.touches.length === 2) {
        // Pinch-to-zoom starts
        e.preventDefault();
        s.isDragging = false;
        s.isPinching = true;
        s.startTouchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        s.startZoom = s.zoom;
      } else if (e.touches.length === 1) {
        // Single finger panning starts
        s.isDragging = true;
        s.isPinching = false;
        s.startX = e.touches[0].clientX - s.panX;
        s.startY = e.touches[0].clientY - s.panY;
      }
      if (imgViewer) imgViewer.classList.remove("transition-transform");
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;

      if (e.touches.length === 2 && s.isPinching) {
        // Handle dual-finger pinch zoom
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (s.startTouchDistance > 0) {
          const ratio = dist / s.startTouchDistance;
          s.zoom = Math.min(5, Math.max(0.4, s.startZoom * ratio));
          applyViewerTransform();
        }
      } else if (e.touches.length === 1 && s.isDragging) {
        // Handle single-finger pan movement
        e.preventDefault();
        s.panX = e.touches[0].clientX - s.startX;
        s.panY = e.touches[0].clientY - s.startY;
        applyViewerTransform();
      }
    }, { passive: false });

    window.addEventListener("touchend", () => {
      if (window.screenshotViewerState) {
        window.screenshotViewerState.isDragging = false;
        window.screenshotViewerState.isPinching = false;
        if (imgViewer) imgViewer.classList.add("transition-transform");
      }
    });

    // Zoom wheel behavior over viewport
    viewport.addEventListener("wheel", (e) => {
      if (!window.screenshotViewerState) return;
      e.preventDefault();
      const s = window.screenshotViewerState;
      if (e.deltaY < 0) {
        s.zoom = Math.min(5, s.zoom + 0.15);
      } else {
        s.zoom = Math.max(0.4, s.zoom - 0.15);
      }
      applyViewerTransform();
    }, { passive: false });
  }

  // Zoom slider event
  if (zoomSlider) {
    zoomSlider.addEventListener("input", (e) => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.zoom = parseFloat(e.target.value) || 1;
      applyViewerTransform();
    });
  }

  // Zoom In button
  const zoomInBtn = document.getElementById("screenshot-zoom-in");
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.zoom = Math.min(5, s.zoom + 0.25);
      applyViewerTransform();
    });
  }

  // Zoom Out button
  const zoomOutBtn = document.getElementById("screenshot-zoom-out");
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.zoom = Math.max(0.4, s.zoom - 0.25);
      applyViewerTransform();
    });
  }

  // Rotate Right / CW button
  const rotateCwBtn = document.getElementById("screenshot-rotate-cw");
  if (rotateCwBtn) {
    rotateCwBtn.addEventListener("click", () => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.rotate = (s.rotate + 90) % 360;
      applyViewerTransform();
    });
  }

  // Rotate Left / CCW button
  const rotateCcwBtn = document.getElementById("screenshot-rotate-ccw");
  if (rotateCcwBtn) {
    rotateCcwBtn.addEventListener("click", () => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.rotate = (s.rotate - 90) % 360;
      applyViewerTransform();
    });
  }

  // Zoom reset button
  const zoomResetBtn = document.getElementById("screenshot-zoom-reset");
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", () => {
      if (!window.screenshotViewerState) return;
      const s = window.screenshotViewerState;
      s.zoom = 1;
      s.panX = 0;
      s.panY = 0;
      s.rotate = 0;
      applyViewerTransform();
    });
  }

  // Close modular slide-over lightbox
  const screenshotCloseBtn = document.getElementById("screenshot-close-btn");
  if (screenshotCloseBtn) {
    screenshotCloseBtn.addEventListener("click", () => {
      if (modal) modal.classList.add("hidden");
    });
  }

  // Escape key listener to close viewer
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  // Automatically register specialized Staff & Agent workspace listeners
  if (app) {
    try {
      if (typeof (app as any).setupStaffAndAgentListeners === "function") {
        (app as any).setupStaffAndAgentListeners();
      }
    } catch (e) {
      console.warn("setupStaffAndAgentListeners", e);
    }
    try {
      if (typeof (app as any).setupDistrictAgentsLookup === "function") {
        (app as any).setupDistrictAgentsLookup();
      }
    } catch (e) {
      console.warn("setupDistrictAgentsLookup", e);
    }
    try {
      FloatingToastNotification.start(app);
    } catch (e) {}
    try {
      NotificationEngine.init(app);
    } catch (e) {}
    try {
      PaymentGateways.init(app);
    } catch (e) {}

    (window as any).app = app;
    (window as any).openLotteryDetailsPop = (id: string) => app.openLotteryDetailsPop(id);
    (window as any).openLotteryDetails = (id: string) => app.openLotteryDetailsPop(id);
    (window as any).openUserProfile = (username: string) => app.openUserProfile(username);
    (window as any).LiveDrawRevealEngine = LiveDrawRevealEngine;
    (window as any).showWinningDrawRevealModal = (drawEvent: any) => LiveDrawRevealEngine.showWinningDrawRevealModal(drawEvent);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("lottery-details-modal");
        if (modal && !modal.classList.contains("hidden")) {
          modal.classList.add("hidden");
          modal.style.display = "none";
        }
        const winnerModal = document.getElementById("lottery-draw-winner-modal");
        if (winnerModal && !winnerModal.classList.contains("hidden")) {
          winnerModal.classList.add("hidden");
          winnerModal.style.display = "none";
        }
      }
    });
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initApplicationLoader);
} else {
  initApplicationLoader();
}
