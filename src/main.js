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
import { ReferTab } from "./dashboard_tabs/share_earn.js";
import { BadgeRequestTab } from "./dashboard_tabs/badge_request.js";
import { VideoBountyTab } from "./dashboard_tabs/video_bounty.js";
import { JackpotTab } from "./dashboard_tabs/jackpot.js";
import { MissionsTab } from "./dashboard_tabs/missions.js";
import { FloatingToastNotification } from "./floating_toast.js";
import { getDefaultDB } from "./js/defaultDB.js";
import { bundledTabs } from "./js/bundledTabs.js";

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

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (typeof obj[i] === "object" && obj[i] !== null) {
            if (seen.has(obj[i])) {
              obj[i] = null;
            } else {
              obj[i] = StateManager.removeCircularReferences(obj[i], seen);
            }
          }
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === "firestore" || key === "firestoreDocRef" || key === "appInstance" || key === "chatProfileHelper") {
              obj[key] = null;
              continue;
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
              if (seen.has(obj[key])) {
                obj[key] = null;
              } else {
                obj[key] = StateManager.removeCircularReferences(obj[key], seen);
              }
            }
          }
        }
      }
      seen.delete(obj);
      return obj;
    } catch (e) {
      return null;
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
    this.initFirebaseSync();
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
    this.loadDashboardTabs().then(() => {
      console.log("All dashboard tabs loaded successfully.");
      VideoBountyTab.init(this);
      ProfileTab.init(this);
      HistoryTab.init(this);
      WalletTab.init(this);
      TicketsTab.init(this);
      this.render();
    });

    // Trigger spectacular 3D loading splash screen sequence
    this.initSplashScreen();
    this.init3DAuthCard();
  }

  initDatabase() {
    let raw = localStorage.getItem(this.dbKey);
    if (!raw) {
      const defaultDB = getDefaultDB();
      localStorage.setItem(this.dbKey, StateManager.safeStringify(defaultDB));
      this.db = defaultDB;
    } else {
      try {
        this.db = JSON.parse(raw);
        if (this.db) {
          this.db = StateManager.removeCircularReferences(this.db);
        }
      } catch (e) {
        console.error("Failed to parse local DB raw. Resetting to default database state.", e);
        localStorage.removeItem(this.dbKey);
        this.initDatabase();
        return;
      }
    }

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
      if (!this.db.settings.bannerSlides) {
        this.db.settings.bannerSlides = [
          {
            id: "b1",
            title: "Super Fast Payouts In 5 Minutes! ⚡",
            subtitle: "bKash, Nagad, Rocket & Crypto USDT",
            imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
            link: "wallet"
          },
          {
            id: "b2",
            title: "Earn 10% Referral Lifetime Bonus! 👥",
            subtitle: "Invite your friends using your affiliate link",
            imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop",
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
        { id: "c5", name: "15 Winner Category", label: "🚀 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" }
      ];
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
        this.db = StateManager.removeCircularReferences(this.db);
      }
      localStorage.setItem(this.dbKey, StateManager.safeStringify(this.db));
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

  async 

  async 

  async 

  

  


  

  

  

  

  

  async loadDashboardTabs() {
    const tabs = [
      { id: "tab-home", file: "src/dashboard_tabs/home.php" },
      { id: "tab-events", file: "src/dashboard_tabs/events_tab.php" },
      { id: "tab-tickets", file: "src/dashboard_tabs/tickets.php" },
      { id: "tab-wallet", file: "src/dashboard_tabs/user_balance.php" },
      { id: "tab-history", file: "src/dashboard_tabs/history.php" },
      { id: "tab-profile", file: "src/dashboard_tabs/profile.php" },
      { id: "tab-badge-request", file: "src/dashboard_tabs/badge_request.php" },
      { id: "tab-refer", file: "src/dashboard_tabs/share_earn.php" },
      { id: "tab-jackpot", file: "src/dashboard_tabs/jackpot.php" },
      { id: "tab-tasks", file: "src/dashboard_tabs/missions.php" },
      { id: "tab-otp", file: "src/dashboard_tabs/otp.php" },
      { id: "tab-video-bounty", file: "src/dashboard_tabs/video_bounty.php" },
      { id: "admin-tab-video-bounty", file: "src/admin_tabs/video_bounty_admin.php" },
      { id: "admin-tab-agent-leaders", file: "src/admin_tabs/agent_leaders.php" },
      { id: "admin-tab-subagents-list", file: "src/admin_tabs/subagents_admin.php" }
    ];
    
    for (const tab of tabs) {
      const el = document.getElementById(tab.id);
      if (el) {
        // Try to load from cache first for instant loading and offline support
        const cacheKey = `tab_cache_${tab.id}`;
        const cachedHTML = localStorage.getItem(cacheKey);
        // Only trust cache if it has reasonable size to avoid corrupt/blank state
        if (cachedHTML && cachedHTML.trim().length > 100 && !el.innerHTML.trim()) {
          el.innerHTML = cachedHTML;
        }
        
        const isLocalFileProtocol = window.location.protocol === "file:";
        
        let success = false;
        let attempts = 0;
        const maxAttempts = isLocalFileProtocol ? 1 : 3;
        
        while (!success && attempts < maxAttempts) {
          try {
            let text = "";
            if (isLocalFileProtocol) {
              text = bundledTabs[tab.id];
              if (!text) throw new Error(`No bundled template found for ${tab.id}`);
            } else {
              // Use cache-busting query param to ensure fresh fetch from server
              const response = await fetch(`${tab.file}?v=${Date.now()}`);
              if (response.ok) {
                text = await response.text();
              } else {
                throw new Error(`HTTP status ${response.status}`);
              }
            }
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.getElementById(tab.id);
            const finalHTML = content ? content.innerHTML : text;
            
            if (finalHTML.trim() && finalHTML.trim().length > 100 && finalHTML !== el.innerHTML) {
              el.innerHTML = finalHTML;
              localStorage.setItem(cacheKey, finalHTML);
            }
            success = true;
          } catch (e) {
            attempts++;
            if (attempts >= maxAttempts) {
              // Try secondary safety fallback with bundled tab
              if (bundledTabs[tab.id]) {
                console.log(`[Offline-Bundler] Loading secondary safety fallback for: ${tab.id}`);
                try {
                  const text = bundledTabs[tab.id];
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(text, 'text/html');
                  const content = doc.getElementById(tab.id);
                  const finalHTML = content ? content.innerHTML : text;
                  if (finalHTML.trim() && finalHTML.trim().length > 100) {
                    el.innerHTML = finalHTML;
                    localStorage.setItem(cacheKey, finalHTML);
                    success = true;
                    break;
                  }
                } catch (fallbackErr) {
                  console.error("Secondary safety fallback failed:", fallbackErr);
                }
              }

              console.error("Failed to load tab template after multiple attempts:", tab.id, e);
              if (!el.innerHTML.trim()) {
                el.innerHTML = `
                  <div class="p-6 bg-slate-900 border border-red-500/20 rounded-2xl text-center space-y-3">
                    <i class="fa-solid fa-triangle-exclamation text-rose-500 text-xl animate-bounce"></i>
                    <p class="text-[11px] font-mono text-slate-400">Offline: Could not load dynamic module "${tab.id}".</p>
                    <button onclick="window.appInstance.loadDashboardTabs()" class="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer">Retry Connection</button>
                  </div>
                `;
              }
            } else {
              // Wait briefly before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            }
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
            if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
              const shuffle = [...ticketsOfPool];
              shuffle.sort(() => Math.random() - 0.5);

              const winnersCount = Math.min(lot.multiWinnerPrizes.length, shuffle.length);
              for (let i = 0; i < winnersCount; i++) {
                const currentPrize = lot.multiWinnerPrizes[i];
                const winningTicket = shuffle[i];
                winningTicket.status = "won";
                winningTicket.prizeAmount = currentPrize;

                const winnerUser = this.db.users.find(u => u.id === winningTicket.userId);
                if (winnerUser) {
                  winnerUser.balance += currentPrize;
                  winnerUser.wins += 1;
                  winnerUser.profit += currentPrize;
                  
                  if (this.currentUser && winnerUser.id === this.currentUser.id) {
                    this.currentUser.balance = winnerUser.balance;
                    this.currentUser.wins = winnerUser.wins;
                    this.currentUser.profit = winnerUser.profit;
                    this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                    localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                  }
                }
              }

              const winnerTicketIds = shuffle.slice(0, winnersCount).map(t => t.id);
              ticketsOfPool.forEach(t => {
                if (!winnerTicketIds.includes(t.id)) {
                  t.status = "lost";
                }
              });

              lot.status = "drawn";
              dbUpdated = true;
            } else {
              const winningTicket = ticketsOfPool[Math.floor(Math.random() * ticketsOfPool.length)];

              const winnerUser = this.db.users.find(u => u.id === winningTicket.userId);
              if (winnerUser) {
                winnerUser.balance += lot.prizeAmount;
                winnerUser.wins += 1;
                winnerUser.profit += lot.prizeAmount;
                
                if (this.currentUser && winnerUser.id === this.currentUser.id) {
                  this.currentUser.balance = winnerUser.balance;
                  this.currentUser.wins = winnerUser.wins;
                  this.currentUser.profit = winnerUser.profit;
                  this.currentUser = StateManager.removeCircularReferences(this.currentUser);
                  localStorage.setItem(this.sessionKey, StateManager.safeStringify(this.currentUser));
                }
              }

              winningTicket.status = "won";
              winningTicket.prizeAmount = lot.prizeAmount;

              ticketsOfPool.forEach(t => {
                if (t.id !== winningTicket.id) {
                  t.status = "lost";
                }
              });

              lot.status = "drawn";
              dbUpdated = true;
            }
          } else {
            lot.status = "drawn";
            dbUpdated = true;
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
        } else {
          this.showToast(`🔔 Draw Completed: Your ticket ${t.code} inside "${lotName}" was drawn. Better luck next time!`, "normal");
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
        } else {
          this.showToast(`❌ Deposit Declined: Your request for ৳${d.amount} was declined by admin.`, "error");
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
      el.innerText = siteName;
    });

    document.querySelectorAll(".brand-site-info").forEach(el => {
      el.innerText = siteInfo;
    });

    const supLink = document.getElementById("profile-support-link");
    if (supLink) {
      supLink.href = `tel:${supportNum}`;
    }

    const supSubtitle = document.getElementById("profile-support-subtitle");
    if (supSubtitle) {
      supSubtitle.innerText = `Call BD Support: ${supportNum}`;
    }

    const view = this.getAppView();
    // Hide all view screens
    document.getElementById("screen-maintenance").classList.add("hidden");
    document.getElementById("screen-auth").classList.add("hidden");
    document.getElementById("screen-dashboard").classList.add("hidden");
    document.getElementById("screen-admin").classList.add("hidden");
    const agentScreen = document.getElementById("screen-agent");
    if (agentScreen) agentScreen.classList.add("hidden");

    if (view === "maintenance") {
      document.getElementById("screen-maintenance").classList.remove("hidden");
      this.renderMaintenance();
    } else if (view === "auth") {
      document.getElementById("screen-auth").classList.remove("hidden");
      this.renderAuth();
    } else if (view === "dashboard") {
      document.getElementById("screen-dashboard").classList.remove("hidden");
      this.renderDashboard();
      if (!this.liveTickerStarted) {
        this.startLiveActivityTicker();
        this.liveTickerStarted = true;
      }
    } else if (view === "admin") {
      document.getElementById("screen-admin").classList.remove("hidden");
      this.renderAdmin();
    } else if (view === "agent") {
      if (agentScreen) {
        agentScreen.classList.remove("hidden");
        this.renderAgentWorkspace();
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
    // Managed purely by simple toggles inside HTML
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
    document.getElementById("tab-home").classList.add("hidden");
    const tabEvents = document.getElementById("tab-events");
    if (tabEvents) tabEvents.classList.add("hidden");
    document.getElementById("tab-tickets").classList.add("hidden");
    document.getElementById("tab-wallet").classList.add("hidden");
    document.getElementById("tab-history").classList.add("hidden");
    document.getElementById("tab-profile").classList.add("hidden");
    const jpTab = document.getElementById("tab-jackpot");
    if (jpTab) jpTab.classList.add("hidden");
    const tasksTab = document.getElementById("tab-tasks");
    if (tasksTab) tasksTab.classList.add("hidden");
    const badgeReqTab = document.getElementById("tab-badge-request");
    if (badgeReqTab) badgeReqTab.classList.add("hidden");
    const referTab = document.getElementById("tab-refer");
    if (referTab) referTab.classList.add("hidden");
    const otpTab = document.getElementById("tab-otp");
    if (otpTab) otpTab.classList.add("hidden");
    const videoBountyTab = document.getElementById("tab-video-bounty");
    if (videoBountyTab) videoBountyTab.classList.add("hidden");

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
      if (badgeReqTab) badgeReqTab.classList.remove("hidden");
      this.renderBadgeRequestTab();
    } else if (this.currentTab === "video-bounty") {
      if (videoBountyTab) videoBountyTab.classList.remove("hidden");
      this.renderVideoBountyTab();
    } else if (this.currentTab === "refer") {
      if (referTab) referTab.classList.remove("hidden");
      this.renderReferTab();
    } else if (this.currentTab === "otp") {
      if (otpTab) otpTab.classList.remove("hidden");
      this.renderOtpTab();
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
    } else if (this.currentTab === "history") {
      this.renderHistoryTab();
    } else if (this.currentTab === "profile") {
      this.renderProfileTab();
    } else if (this.currentTab === "refer") {
      this.renderReferTab();
    } else if (this.currentTab === "jackpot") {
      this.renderJackpotTab();
    } else if (this.currentTab === "tasks") {
      this.renderTasksTab();
    }
  }

  renderVideoBountyTab() {
    VideoBountyTab.render(this);
  }

  

  

  

  renderHomeTab() {
    HomeTab.render(this);
    this.renderHomeBannerSliders();
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

    this.showToast(`Bought ticket ${code} successfully for ৳${lot.entryFee}!`, "success");
    FloatingToastNotification.broadcastCustom("TICKET PURCHASED! 🎫", `@<span class="text-white font-bold">${this.currentUser.username}</span> purchased ticket <strong class="text-emerald-400">${code}</strong> for the ${lot.name} draw!`, "success");
    this.currentTab = "tickets";
    this.render();
  }

  renderTicketsTab() {
    TicketsTab.render(this);
  }

  rebuildDepositGatewaySelect() {
    const s = this.db.settings;
    const selectEl = document.getElementById("dep-gateway");
    if (!selectEl) return;

    const currentVal = selectEl.value;

    const options = [
      { value: "bKash", text: "bKash", enabled: s.payBkashEnabled !== false },
      { value: "Nagad", text: "Nagad", enabled: s.payNagadEnabled !== false },
      { value: "Rocket", text: "Rocket", enabled: s.payRocketEnabled !== false },
      { value: "Upay", text: "Upay", enabled: s.payUpayEnabled !== false },
      { value: "DBBL", text: "Dutch Bangla", enabled: s.payDbblEnabled !== false },
      { value: "Crypto USDT", text: "TRC20 USDT", enabled: s.payUsdtEnabled !== false },
      { value: "Crypto BTC", text: "Bitcoin BTC", enabled: s.payBtcEnabled !== false },
      { value: "Crypto ETH", text: "Ethereum ETH", enabled: s.payEthEnabled !== false },
      { value: "Agent Deposit", text: "Agent Deposit (Verified Local Desk)", enabled: s.payAgentDepositEnabled !== false },
    ];

    selectEl.innerHTML = "";
    
    const activeOptions = options.filter(opt => opt.enabled);
    if (activeOptions.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.text = "No gateways active (Contact support)";
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
  }

  rebuildWithdrawGatewaySelect() {
    const s = this.db.settings;
    const selectEl = document.getElementById("wd-gateway");
    if (!selectEl) return;

    const currentVal = selectEl.value;

    const options = [
      { value: "bKash", text: "bKash (SendMoney)", enabled: true },
      { value: "Nagad", text: "Nagad (SendMoney)", enabled: true },
      { value: "Rocket", text: "Rocket (Personal)", enabled: true },
      { value: "Upay", text: "Upay (Personal)", enabled: true },
      { value: "DBBL", text: "Dutch Bangla DBBL", enabled: true },
      { value: "Crypto USDT", text: "TRC20 USDT", enabled: true },
      { value: "Agent Withdraw", text: "Agent Withdraw (Verified Local Desk)", enabled: s.payAgentWithdrawEnabled !== false },
    ];

    selectEl.innerHTML = "";
    
    const activeOptions = options.filter(opt => opt.enabled);
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
    const s = this.db.settings;
    const gatewaySelect = document.getElementById("dep-gateway");
    const gateway = gatewaySelect ? gatewaySelect.value : "";

    const titleEl = document.getElementById("user-dep-title");
    const instructionEl = document.getElementById("user-dep-instruction");
    const badgeEl = document.getElementById("user-dep-type-badge");
    const qrBlock = document.getElementById("user-dep-qr-block");
    const qrImg = document.getElementById("user-dep-qr-img");

    const rowPersonal = document.getElementById("user-dep-row-personal");
    const rowAgent = document.getElementById("user-dep-row-agent");
    const rowSingle = document.getElementById("user-dep-row-single");
    const rowDistrictAgents = document.getElementById("user-dep-row-district-agents");

    const personalAccEl = document.getElementById("user-dep-account-personal");
    const agentAccEl = document.getElementById("user-dep-account-agent");
    const singleAccEl = document.getElementById("user-dep-account-single");
    const singleLabelEl = document.getElementById("user-dep-single-label");

    if (!titleEl || !instructionEl || !badgeEl || !qrBlock || !qrImg || !rowPersonal || !rowAgent || !rowSingle || !personalAccEl || !agentAccEl || !singleAccEl) return;

    if (rowDistrictAgents) rowDistrictAgents.classList.add("hidden");

    if (!gateway) {
      titleEl.innerText = "No payment gateways active";
      instructionEl.innerText = "All automatic deposit streams are currently undergoing system updates. Please contact customer management.";
      badgeEl.innerText = "Disabled";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/20 px-2.5 py-0.5 rounded-full";
      badgeEl.parentElement.classList.remove("hidden");
      
      rowPersonal.classList.add("hidden");
      rowAgent.classList.add("hidden");
      rowSingle.classList.remove("hidden");
      singleAccEl.innerText = "N/A";
      qrBlock.classList.add("hidden");
      return;
    }

    let titleText = "";
    let instructionText = "";
    let isCrypto = false;
    let fallbackQRData = "";
    let customQRUrl = "";

    const isMobileWallet = ["bKash", "Nagad", "Rocket", "Upay"].includes(gateway);

    if (isMobileWallet) {
      rowPersonal.classList.remove("hidden");
      rowAgent.classList.remove("hidden");
      rowSingle.classList.add("hidden");
      if (rowDistrictAgents) rowDistrictAgents.classList.add("hidden");

      if (gateway === "bKash") {
        titleText = "bKash Mobile Banking";
        instructionText = s.mobileInstructionBkash || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        personalAccEl.innerText = s.mobilePersonalBkash || s.mobileAgentBkash || "None";
        agentAccEl.innerText = s.mobileAgentBkash || "None";
      } else if (gateway === "Nagad") {
        titleText = "Nagad Mobile Banking";
        instructionText = s.mobileInstructionNagad || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        personalAccEl.innerText = s.mobilePersonalNagad || s.mobileAgentNagad || "None";
        agentAccEl.innerText = s.mobileAgentNagad || "None";
      } else if (gateway === "Rocket") {
        titleText = "Rocket Mobile Banking";
        instructionText = s.mobileInstructionRocket || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        personalAccEl.innerText = s.mobilePersonalRocket || s.mobileAgentRocket || "None";
        agentAccEl.innerText = s.mobileAgentRocket || "None";
      } else if (gateway === "Upay") {
        titleText = "Upay Mobile Banking";
        instructionText = s.mobileInstructionUpay || "Send Money (Personal) or Cash Out (Agent) to the numbers below and submit transaction ID.";
        personalAccEl.innerText = s.mobilePersonalUpay || s.mobileAgentUpay || "None";
        agentAccEl.innerText = s.mobileAgentUpay || "None";
      }

      badgeEl.innerText = "Personal & Agent Active";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/20 px-2.5 py-0.5 rounded-full animate-pulse";
      badgeEl.parentElement.classList.remove("hidden");
    } else if (gateway === "Agent Deposit") {
      rowPersonal.classList.add("hidden");
      rowAgent.classList.add("hidden");
      rowSingle.classList.add("hidden");
      if (rowDistrictAgents) rowDistrictAgents.classList.remove("hidden");

      titleText = "Partner Agent Network Desk";
      instructionText = s.mobileInstructionAgentDeposit || "Hand over physical cash or transfer funds directly to any verified agent found below.";
      
      badgeEl.innerText = "Verified Agent Partner";
      badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-2.5 py-0.5 rounded-full";
      badgeEl.parentElement.classList.remove("hidden");
    } else {
      // Non-mobile (DBBL / Crypto)
      rowPersonal.classList.add("hidden");
      rowAgent.classList.add("hidden");
      rowSingle.classList.remove("hidden");
      if (rowDistrictAgents) rowDistrictAgents.classList.add("hidden");

      if (gateway === "DBBL") {
        titleText = "Dutch Bangla DBBL Bank";
        instructionText = s.dbblInstruction || "Transfer to bank directly using the following account information.";
        singleAccEl.innerText = s.dbblDetails || "None";
        if (singleLabelEl) singleLabelEl.innerText = "DBBL TARGET BANK DETAILS";
        
        badgeEl.innerText = "Direct Bank";
        badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/20 px-2.5 py-0.5 rounded-full";
        badgeEl.parentElement.classList.remove("hidden");
      } else {
        isCrypto = true;
        if (gateway === "Crypto USDT") {
          titleText = "Cryptocurrency USDT (TRC-20)";
          instructionText = s.cryptoInstruction || "Deposit USDT to the secure address below.";
          singleAccEl.innerText = s.cryptoAddressUSDT || "None";
          fallbackQRData = s.cryptoAddressUSDT || "None";
          customQRUrl = s.cryptoQRUrlUSDT;
        } else if (gateway === "Crypto BTC") {
          titleText = "Cryptocurrency Bitcoin (BTC)";
          instructionText = s.cryptoInstruction || "Deposit BTC to the secure address below.";
          singleAccEl.innerText = s.cryptoAddressBTC || "None";
          fallbackQRData = s.cryptoAddressBTC || "None";
          customQRUrl = s.cryptoQRUrlBTC;
        } else if (gateway === "Crypto ETH") {
          titleText = "Cryptocurrency Ethereum (ETH)";
          instructionText = s.cryptoInstruction || "Deposit ETH to the secure address below.";
          singleAccEl.innerText = s.cryptoAddressETH || "None";
          fallbackQRData = s.cryptoAddressETH || "None";
          customQRUrl = s.cryptoQRUrlETH;
        }
        if (singleLabelEl) singleLabelEl.innerText = `${gateway.toUpperCase()} TARGET COIN ADDRESS`;

        badgeEl.innerText = "USDT / BTC / ETH Coin";
        badgeEl.className = "text-[8px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/20 px-2.5 py-0.5 rounded-full";
        badgeEl.parentElement.classList.remove("hidden");
      }
    }

    titleEl.innerText = titleText;
    instructionEl.innerText = instructionText;

    if (isCrypto && singleAccEl.innerText !== "None") {
      qrBlock.classList.remove("hidden");
      if (s.cryptoQRType === "custom" && customQRUrl) {
        qrImg.src = customQRUrl;
      } else {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fallbackQRData)}`;
      }
    } else {
      qrBlock.classList.add("hidden");
      qrImg.src = "";
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

  // Open Lottery Details Popup Modal
  openLotteryDetailsPop(lotteryId) {
    const lot = this.db.lotteries.find(l => l.id === lotteryId);
    if (!lot) return;

    document.getElementById("detail-lot-category").innerText = lot.category;
    document.getElementById("detail-lot-name").innerText = lot.name;
    document.getElementById("detail-lot-desc").innerText = lot.details || "Experience live high-payout draws.";
    document.getElementById("detail-lot-fee").innerText = `৳${lot.entryFee}`;
    document.getElementById("detail-lot-prize").innerText = `৳${lot.prizeAmount}`;
    document.getElementById("detail-lot-sales").innerText = `${lot.soldTickets} / ${lot.totalTickets}`;
    
    const lotDrawTime = new Date(lot.drawTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    document.getElementById("detail-lot-target-time").innerText = lotDrawTime;
    
    const progress = Math.min(100, Math.round((lot.soldTickets / lot.totalTickets) * 100));
    document.getElementById("detail-lot-progress-bar").style.width = `${progress}%`;

    // Manage purchase button callback inside details modal
    const buyBtn = document.getElementById("detail-lot-buy-btn");
    // Remove old listeners by cloning
    const newBuyBtn = buyBtn.cloneNode(true);
    buyBtn.parentNode.replaceChild(newBuyBtn, buyBtn);
    
    newBuyBtn.addEventListener("click", () => {
      this.purchaseTicket(lot.id);
      document.getElementById("lottery-details-modal").classList.add("hidden");
    });

    // Handle Countdown Timer
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const draw = new Date(lot.drawTime).getTime();
      const diff = draw - now;

      if (diff <= 0) {
        document.getElementById("detail-lot-countdown").innerText = "DRAWING NOW";
        clearInterval(this.countdownInterval);
        return;
      }

      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById("detail-lot-countdown").innerText = 
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);

    // Show Modal element
    document.getElementById("lottery-details-modal").classList.remove("hidden");
  }

  // Open Ticket Info Live modal
  openTicketLiveInfoPop(ticketId) {
    const ticket = this.db.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const lot = this.db.lotteries.find(l => l.id === ticket.lotteryId) || { name: "Archived Event", prizeAmount: 0 };

    document.getElementById("popup-ticket-code").innerText = ticket.code;
    document.getElementById("popup-ticket-lottery").innerText = lot.name;
    document.getElementById("popup-ticket-date").innerText = new Date(ticket.purchaseDate).toLocaleDateString();
    document.getElementById("popup-ticket-prize").innerText = `৳${lot.prizeAmount}`;

    const statusEl = document.getElementById("popup-ticket-status");
    const winDetails = document.getElementById("popup-ticket-live-win");
    const lostDetails = document.getElementById("popup-ticket-live-lost");

    winDetails.classList.add("hidden");
    lostDetails.classList.add("hidden");

    if (ticket.status === "won") {
      statusEl.className = "font-bold text-emerald-400";
      statusEl.innerText = "🏆 WINNER";
      document.getElementById("popup-ticket-reward-amount").innerText = ticket.prizeAmount;
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
  window.chatProfileHelper = new ChatProfileSystem(app);

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
  if (refCode && !app.currentUser && !app.isAdminMode) {
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
    if (e.target.closest("#badge-request-back-btn") || e.target.closest("#refer-back-btn") || e.target.closest("#otp-back-btn") || e.target.closest("#video-bounty-back-btn")) {
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



  // Auth toggle
  const showRegisterBtn = document.getElementById("show-register-btn");
  const showLoginBtn = document.getElementById("show-login-btn");
  const signupBox = document.getElementById("auth-signup-box");
  const loginBox = document.getElementById("auth-login-box");

  if (showRegisterBtn && signupBox && loginBox) {
    showRegisterBtn.addEventListener("click", () => {
      loginBox.classList.add("hidden");
      signupBox.classList.remove("hidden");
    });
  }

  if (showLoginBtn && signupBox && loginBox) {
    showLoginBtn.addEventListener("click", () => {
      signupBox.classList.add("hidden");
      loginBox.classList.remove("hidden");
    });
  }

  // Login Trigger Action
  const loginForm = document.getElementById("auth-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const userEl = document.getElementById("auth-user");
        const passEl = document.getElementById("auth-pass");
        if (!userEl || !passEl) {
          app.showToast("Login fields missing from DOM.", "error");
          return;
        }
        const userVal = userEl.value.trim();
        const passVal = passEl.value;

        // Check for direct admin login credentials
        if (userVal.toLowerCase() === "admin" && (passVal === "Admin123" || (app.db.settings && passVal === app.db.settings.adminPass))) {
          app.isAdminMode = true;
          localStorage.setItem(app.adminSessionKey, "true");
          app.showToast("Admin access granted. Control room unlocked.", "success");
          app.render();
          return;
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

        if (matched.status === "permanently_banned") {
          app.showToast("This account has been permanently barred by operations manager.", "error");
          return;
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
  const registerForm = document.getElementById("auth-signup-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const userEl = document.getElementById("reg-user");
        const emailEl = document.getElementById("reg-email");
        const phoneEl = document.getElementById("reg-phone");
        const dobEl = document.getElementById("reg-dob");
        const passEl = document.getElementById("reg-pass");
        const regionEl = document.getElementById("reg-region");
        const referByEl = document.getElementById("reg-refer-by");

        if (!userEl || !emailEl || !phoneEl || !dobEl || !passEl || !regionEl) {
          app.showToast("Registration form elements are missing.", "error");
          return;
        }

        const userVal = userEl.value.trim();
        const emailVal = emailEl.value.trim();
        const phoneVal = phoneEl.value.trim();
        const dobVal = dobEl.value;
        const passVal = passEl.value;
        const regionVal = regionEl.value;
        const referByVal = referByEl ? referByEl.value.trim() : "";

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
                content: `Congratulations! Player @${userVal} has successfully registered using your referral code. A referral bonus of ৳${referBonus} has been added to your wallet.`,
                date: new Date().toISOString(),
                readBy: []
              };
              if (!app.db.messages) app.db.messages = [];
              app.db.messages.push(autoNotice);
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
  });

  // Wallet Deposit Form submission routing
  const depositForm = document.getElementById("wallet-deposit-form");
  if (depositForm) {
    depositForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const amountVal = parseFloat(document.getElementById("dep-amount").value);
      const gateway = document.getElementById("dep-gateway").value;
      const trxIdVal = document.getElementById("dep-trxid").value.trim();

      if (amountVal < 20) {
        app.showToast("Minimum deposit is ৳20.", "error");
        return;
      }

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

  // Switch Admin Sub Tabs
  document.querySelectorAll(".admin-tab-selector-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      app.currentAdminTab = btn.getAttribute("data-tab");
      app.render();
    });
  });

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
    const qtyBtn = e.target.closest(".jp-qty-btn");
    if (qtyBtn) {
      const qty = qtyBtn.getAttribute("data-qty");
      const selectedInput = document.getElementById("jackpot-selected-qty");
      if (selectedInput) selectedInput.value = qty;
      
      // Reset color of other state elements
      document.querySelectorAll(".jp-qty-btn").forEach(b => {
        b.className = "jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer";
      });
      qtyBtn.className = "jp-qty-btn bg-purple-950/30 border border-purple-500/30 text-white rounded-lg py-1.5 font-bold hover:bg-slate-800 text-xs active:scale-95 transition cursor-pointer";
      
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

    // Capture Enable / Disable Checked Toggles
    s.payBkashEnabled = document.getElementById("sys-pay-bkash-enabled").checked;
    s.payNagadEnabled = document.getElementById("sys-pay-nagad-enabled").checked;
    s.payRocketEnabled = document.getElementById("sys-pay-rocket-enabled").checked;
    s.payUpayEnabled = document.getElementById("sys-pay-upay-enabled").checked;
    s.payDbblEnabled = document.getElementById("sys-pay-dbbl-enabled").checked;
    s.payUsdtEnabled = document.getElementById("sys-pay-usdt-enabled").checked;
    s.payBtcEnabled = document.getElementById("sys-pay-btc-enabled").checked;
    s.payEthEnabled = document.getElementById("sys-pay-eth-enabled").checked;

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

    s.payAgentDepositEnabled = document.getElementById("sys-pay-agent-deposit-enabled").checked;
    s.payAgentWithdrawEnabled = document.getElementById("sys-pay-agent-withdraw-enabled").checked;
    s.mobileInstructionAgentDeposit = document.getElementById("sys-pay-agent-deposit-instruction").value.trim();
    s.mobileInstructionAgentWithdraw = document.getElementById("sys-pay-agent-withdraw-instruction").value.trim();

    // Legacy fallback string support
    s.cryptoAddress = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";

    app.saveDB();
    app.showToast("Live payment gateways and dynamic routes synchronized.", "success");
    app.render();
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
    app.db.settings.agentReferralBonus = parseFloat(document.getElementById("sys-agent-referral-bonus").value || "100");
    app.db.settings.whatsappUrl = document.getElementById("sys-whatsapp-url").value.trim();

    app.saveDB();
    app.showToast("Core system parameters and maintenance configs committed.", "success");
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
    const closeLotteryBtn = e.target.closest("#close-lottery-details-btn");
    if (closeLotteryBtn) {
      document.getElementById("lottery-details-modal").classList.add("hidden");
      return;
    }

    const closeTicketBtn = e.target.closest("#close-ticket-info-btn");
    if (closeTicketBtn) {
      document.getElementById("ticket-info-modal").classList.add("hidden");
      return;
    }

    const profileGoogleBtn = e.target.closest("#profile-google-photo-btn");
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
    const profileUploadInput = e.target.closest("#profile-local-upload-input");
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
    app.setupStaffAndAgentListeners();
    app.setupDistrictAgentsLookup();
    FloatingToastNotification.start(app);
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initApplicationLoader);
} else {
  initApplicationLoader();
}
