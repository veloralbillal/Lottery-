import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Main client-side database and router state for the Mobile Lottery Portal
class StateManager {
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

    // Load or bootstrap database
    this.initDatabase();
    this.loadSession();
    this.startAutoDrawChecker();

    // Initialize real-time cloud synchronization from Firebase
    this.initFirebaseSync();

    // Initialize network status monitoring for offline mode UI
    this.initNetworkMonitoring();
  }

  initDatabase() {
    let raw = localStorage.getItem(this.dbKey);
    if (!raw) {
      const defaultDB = {
        users: [
          {
            id: "u1",
            username: "lottery_pro",
            email: "pro@lotterywinner.app",
            password: "password123",
            phone: "01712345678",
            dob: "1997-05-12",
            balance: 1540,
            totDeposit: 2500,
            totWithdraw: 800,
            wins: 3,
            loss: 15,
            profit: 640,
            joinDate: "2026-01-01",
            status: "active",
            blockedUntil: null
          },
          {
            id: "u2",
            username: "lucky_player",
            email: "lucky@quickdraw.net",
            password: "password123",
            phone: "01988776655",
            dob: "2000-11-20",
            balance: 75,
            totDeposit: 100,
            totWithdraw: 0,
            wins: 0,
            loss: 5,
            profit: -25,
            joinDate: "2026-05-15",
            status: "active",
            blockedUntil: null
          },
          {
            id: "u3",
            username: "blocked_user",
            email: "suspended@cheater.com",
            password: "password123",
            phone: "01822114433",
            dob: "1994-08-01",
            balance: 500,
            totDeposit: 500,
            totWithdraw: 0,
            wins: 0,
            loss: 0,
            profit: 0,
            joinDate: "2026-06-10",
            status: "blocked",
            blockedUntil: new Date(Date.now() + 86400000).toISOString()
          }
        ],
        lotteries: [
          {
            id: "l1",
            name: "⚡ 10-Taka Fast Cash Daily",
            details: "Buy tickets for only 10 Taka and win massive rewards instantly! Grand Prize is 500 Taka.",
            entryFee: 10,
            totalTickets: 1000,
            soldTickets: 684,
            category: "10 Taka Banner",
            drawTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
            status: "active",
            prizeAmount: 500
          },
          {
            id: "l2",
            name: "💎 20-Taka Premium Super Pool",
            details: "Exclusive 20 Taka lottery with active multipliers. First place gets an incredible 1200 Taka!",
            entryFee: 20,
            totalTickets: 500,
            soldTickets: 412,
            category: "20 Taka Banner",
            drawTime: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
            status: "active",
            prizeAmount: 1200
          },
          {
            id: "l3",
            name: "👑 50-Taka Mega Event Jackpot",
            details: "A legendary pool for highest payouts! Ticket price is 50 Taka. Prize is 5000 Taka.",
            entryFee: 50,
            totalTickets: 200,
            soldTickets: 85,
            category: "Mega Jackpot",
            drawTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            prizeAmount: 5000
          }
        ],
        tickets: [
          {
            id: "t1",
            userId: "u1",
            lotteryId: "l1",
            code: "LW-784013",
            purchaseDate: "2026-06-14T10:00:00Z",
            status: "won",
            prizeAmount: 500
          },
          {
            id: "t2",
            userId: "u1",
            lotteryId: "l2",
            code: "LW-312954",
            purchaseDate: "2026-06-15T08:30:00Z",
            status: "lost",
            prizeAmount: 0
          },
          {
            id: "t3",
            userId: "u2",
            lotteryId: "l1",
            code: "LW-904254",
            purchaseDate: "2026-06-15T19:40:00Z",
            status: "lost",
            prizeAmount: 0
          }
        ],
        deposits: [
          {
            id: "d1",
            username: "lottery_pro",
            amount: 2500,
            method: "bKash",
            trxId: "TRX88394821",
            status: "approved",
            date: "2026-06-10T12:00:00Z"
          },
          {
            id: "d2",
            username: "lucky_player",
            amount: 100,
            method: "Nagad",
            trxId: "TRX49102844",
            status: "approved",
            date: "2026-06-12T14:22:00Z"
          }
        ],
        withdrawals: [
          {
            id: "w1",
            username: "lottery_pro",
            amount: 800,
            method: "Rocket",
            targetAccount: "017294820120",
            status: "approved",
            date: "2026-06-13T16:00:00Z"
          }
        ],
        settings: {
          mobileAgentBkash: "01799228833",
          mobileAgentNagad: "01855221144",
          mobileAgentRocket: "01688554422",
          mobileAgentUpay: "01922334455",
          dbblDetails: "Rocket Wallet Agent route system. Input account numbers directly.",
          cryptoAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X",
          maintenanceMode: false,
          maintenanceMessage: "Internal server hardware upgrade and database syncing in progress. Please try again soon.",
          appVersion: "5.2.0",
          forceUpdateLink: "https://example.com/download/LotteryWinner_v5.2.apk",
          adminPass: "Admin123"
        }
      };
      localStorage.setItem(this.dbKey, JSON.stringify(defaultDB));
      this.db = defaultDB;
    } else {
      this.db = JSON.parse(raw);
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

      // Inject website and bonus configurations
      if (s.siteName === undefined) s.siteName = "Lottery Winner";
      if (s.siteInfo === undefined) s.siteInfo = "Premium Mobile Play Portal";
      if (s.signupBonus === undefined) s.signupBonus = 100;
      if (s.supportNumber === undefined) s.supportNumber = "01700000000";
      if (s.authFooterText === undefined) s.authFooterText = "© 2026 Lottery Winner Mobile Limited (Registered)";
      
      this.saveDB();
    }
  }

  saveDB() {
    localStorage.setItem(this.dbKey, JSON.stringify(this.db));
    if (this.firestoreDocRef) {
      if (this.cloudSyncTimeout) clearTimeout(this.cloudSyncTimeout);
      this.cloudSyncTimeout = setTimeout(() => {
        this.syncToCloud();
      }, 800);
    }
  }

  async initFirebaseSync() {
    try {
      const configRes = await fetch("/firebase-applet-config.json");
      if (!configRes.ok) {
        console.warn("Firebase config not found or accessible.");
        return;
      }
      const firebaseConfig = await configRes.json();
      const app = initializeApp(firebaseConfig);
      const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
      this.firestore = getFirestore(app, dbId);
      this.firestoreDocRef = doc(this.firestore, "app_data", "lottery_winner_db");
      console.log("Firebase sync engine initialized successfully.");
      await this.loadFromCloud();
    } catch (e) {
      console.error("Failed to initialize Firebase Sync:", e);
    }
  }

  async loadFromCloud() {
    if (!this.firestoreDocRef) return;
    try {
      const docSnap = await getDoc(this.firestoreDocRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data().db;
        if (cloudData) {
          let parsed = typeof cloudData === "string" ? JSON.parse(cloudData) : cloudData;
          this.db = parsed;
          if (this.currentUser) {
            const freshUser = this.db.users.find(u => u.username === this.currentUser.username);
            if (freshUser) {
              this.currentUser = freshUser;
              localStorage.setItem(this.sessionKey, JSON.stringify(freshUser));
            }
          }
          localStorage.setItem(this.dbKey, JSON.stringify(this.db));
          this.render();
          console.log("Database successfully synced with Firebase cloud.");
        }
      } else {
        await this.syncToCloud();
        console.log("Initialized cloud database document in Firebase Firestore.");
      }
    } catch (e) {
      console.error("Cloud document fetch error:", e);
    }
  }

  async syncToCloud() {
    if (!this.firestoreDocRef || !this.db) return;
    try {
      await setDoc(this.firestoreDocRef, {
        db: this.db,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Write to Firebase failed:", e);
    }
  }

  initNetworkMonitoring() {
    // Check initial status upon loads
    if (!navigator.onLine) {
      this.showOfflineModal();
    }

    // Register active network event triggers
    window.addEventListener("offline", () => {
      this.showOfflineModal();
      this.showToast("Your internet connection was lost! Switched to safe offline mode.", "error");
    });

    window.addEventListener("online", () => {
      this.hideOfflineModal();
      this.showToast("Internet connection restored! Resuming live cloud sync.", "success");
      if (this.firestoreDocRef) {
        this.loadFromCloud();
      }
    });
  }

  showOfflineModal() {
    const modal = document.getElementById("offline-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  hideOfflineModal() {
    const modal = document.getElementById("offline-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  async checkNetworkStatus() {
    this.showToast("Handshaking with internet network...", "info");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.hideOfflineModal();
        this.showToast("Internet restored! Sync database verified.", "success");
        if (this.firestoreDocRef) {
          this.loadFromCloud();
        }
      } else {
        this.showToast("Handshake failed. Check your data router.", "error");
      }
    } catch (e) {
      this.showToast("Device remains offline. Please try again shortly.", "error");
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
      localStorage.setItem("lw_notified_5min_warnings", JSON.stringify(legacyWarnings));
    }
  }

  getUserTicketDiscount(user) {
    if (!user || !user.vipLevelId) return 0;
    const tier = this.db.settings.vipTiers.find(t => t.id === user.vipLevelId);
    return tier ? (tier.discount || 0) : 0;
  }

  getVIPMultiplier(user) {
    if (!user || !user.vipLevelId) return 1.0;
    const tier = this.db.settings.vipTiers.find(t => t.id === user.vipLevelId);
    return tier ? (tier.multiplier || 1.0) : 1.0;
  }

  tickProgressiveJackpot() {
    if (this.db && this.db.settings) {
      // Simulate real-time ticking increment for mega pools FOMO
      const inc = (Math.random() * 0.16) + 0.04;
      this.db.settings.jackpotPool = (this.db.settings.jackpotPool || 84250) + inc;
      this.saveDB();

      // Update the user interface
      const poolAmountEl = document.getElementById("jackpot-pool-amount");
      if (poolAmountEl) {
        poolAmountEl.innerText = "৳" + this.db.settings.jackpotPool.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      // Update countdown dynamic timer
      const cdEl = document.getElementById("jackpot-countdown");
      if (cdEl) {
        const now = new Date();
        let target = new Date(this.db.settings.jackpotExpiry || "");
        if (isNaN(target.getTime())) {
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }
        const diffMs = target.getTime() - now.getTime();
        if (diffMs > 0) {
          const hrs = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          const secs = Math.floor((diffMs % 60000) / 1000);
          cdEl.innerText = `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
        } else {
          cdEl.innerText = "00h : 00m : 00s (Ended)";
        }
      }

      // Update active user entries summary
      const entriesLabel = document.getElementById("jackpot-tickets-count");
      if (entriesLabel && this.currentUser) {
        entriesLabel.innerText = `Your Entries: ${this.currentUser.jackpotTickets || 0} tickets`;
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
    
    // Add 1.5% of ticket cost directly into the progressive Jackpot balance
    this.db.settings.jackpotPool = (this.db.settings.jackpotPool || 84250) + (finalCost * 0.015);

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

  renderDailyCheckinGrid() {
    const grid = document.getElementById("checkin-grid-days-container");
    if (!grid || !this.currentUser) return;

    grid.innerHTML = "";
    
    // Check if streak is broken (sequential interval passed 36 hours elapsed)
    const todayStr = new Date().toISOString().split("T")[0];
    let isStreakBroken = false;
    if (this.currentUser.lastCheckinDate) {
      const lastCheck = new Date(this.currentUser.lastCheckinDate);
      const today = new Date(todayStr);
      const elapsedDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) {
        isStreakBroken = true;
      }
    }

    if (isStreakBroken) {
      this.currentUser.checkinStreak = 0;
      this.saveDB();
    }

    const currentStreak = this.currentUser.checkinStreak || 0;
    const todayClaimed = (this.currentUser.lastCheckinDate === todayStr);

    const rewardsList = this.db.settings.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const vipMult = this.getVIPMultiplier(this.currentUser);

    for (let i = 0; i < 7; i++) {
      const dayNum = i + 1;
      const baseVal = rewardsList[i];
      const boostedVal = baseVal * vipMult;
      
      let cardClass = "";
      let iconHtml = "";
      let labelStatus = "";

      // Determine day status
      if (dayNum <= currentStreak) {
        // Claimed and complete
        cardClass = "bg-emerald-950/40 border border-emerald-500/35 p-2 rounded-xl text-emerald-400";
        iconHtml = '<i class="fa-solid fa-square-check text-base"></i>';
        labelStatus = "Claimed";
      } else if (dayNum === currentStreak + 1 && !todayClaimed) {
        // Ready to claim today
        cardClass = "bg-slate-950 border border-amber-500/50 p-2 rounded-xl text-amber-400 animate-pulse cursor-pointer";
        iconHtml = '<i class="fa-solid fa-gift text-base animate-bounce"></i>';
        labelStatus = "Unlock";
      } else {
        // Locked / upcoming days
        cardClass = "bg-slate-950/60 border border-slate-900 p-2 rounded-xl text-slate-500";
        iconHtml = '<i class="fa-solid fa-lock text-xs"></i>';
        labelStatus = "Locked";
      }

      grid.innerHTML += `
        <div class="${cardClass}">
          <span class="text-[8px] font-mono block text-slate-400 uppercase">Day ${dayNum}</span>
          <div class="my-1.5">${iconHtml}</div>
          <span class="text-[10px] font-black block">৳${boostedVal.toFixed(1)}</span>
          <span class="text-[7px] text-slate-500 uppercase block font-sans">${labelStatus}</span>
        </div>
      `;
    }

    // Update status labels
    const streakValEl = document.getElementById("checkin-current-streak-val");
    if (streakValEl) streakValEl.innerText = `${currentStreak} of 7 Consecutive Days`;

    const badgeStatus = document.getElementById("checkin-today-status-badge");
    if (badgeStatus) {
      if (todayClaimed) {
        badgeStatus.className = "text-[9px] font-bold bg-emerald-955 text-emerald-400 border border-emerald-900/45 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "CLAIMED TODAY";
      } else if (isStreakBroken) {
        badgeStatus.className = "text-[9px] font-bold bg-rose-955 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "STREAK RESET";
      } else {
        badgeStatus.className = "text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "READY TO CLAIM";
      }
    }
  }

  claimDailyCheckinReward() {
    if (!this.currentUser) {
      this.showToast("Please register or login to claim check-in awards!", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (this.currentUser.lastCheckinDate === todayStr) {
      this.showToast("Oops! You've already checked in today! Streak bonus will unlock again tomorrow.", "error");
      return;
    }

    // Save index
    let currentStreak = this.currentUser.checkinStreak || 0;
    
    // Check if streak was broken previously (elapsed > 36 hours)
    let isStreakBroken = false;
    if (this.currentUser.lastCheckinDate) {
      const lastCheck = new Date(this.currentUser.lastCheckinDate);
      const today = new Date(todayStr);
      const elapsedDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) {
        isStreakBroken = true;
      }
    }

    if (isStreakBroken) {
      currentStreak = 0;
    }

    // Increment streak up to resetting on Day 7 completion
    const newStreak = (currentStreak % 7) + 1;
    this.currentUser.checkinStreak = newStreak;
    this.currentUser.lastCheckinDate = todayStr;

    const rewardsList = this.db.settings.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const baseVal = rewardsList[newStreak - 1];
    const vipMult = this.getVIPMultiplier(this.currentUser);
    const finalBonus = baseVal * vipMult;

    // Credit reward
    this.currentUser.balance += finalBonus;

    // Log checkin ledger history
    this.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 10),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "credit",
      amount: finalBonus,
      method: "Daily Check-In Reward",
      walletNumber: `Day ${newStreak} Active Streak`,
      date: new Date().toISOString(),
      status: "approved"
    });

    this.saveDB();
    this.showToast(`🎁 Day ${newStreak} checked-in! Claimed ৳${finalBonus.toFixed(2)} cash (VIP Boost applied: ${vipMult}x). Come back tomorrow!`, "success");
    if (navigator.vibrate) navigator.vibrate(150);
    
    this.renderDailyCheckinGrid();
    this.render(); // Refreshes primary headers
  }

  renderLuckyWheel() {
    const canvas = document.getElementById("lucky-spin-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const sectors = [
      { value: 10, label: "৳10", color: "#1e1b4b" },      // dark indigo
      { value: 0, label: "Oops!", color: "#020617" },       // dark slate
      { value: 20, label: "৳20", color: "#0f172a" },       // slate
      { value: 50, label: "৳50", color: "#111827" },       // zinc
      { value: 15, label: "৳15", color: "#1e1b4b" },       // dark indigo
      { value: 100, label: "৳100", color: "#13141f" },     // space
      { value: 250, label: "৳250", color: "#065f46" },     // emerald green
      { value: 500, label: "৳500 Jackpot", color: "#701a75" } // purple royal
    ];

    const numSectors = sectors.length;
    const arc = Math.PI * 2 / numSectors;
    const center = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSectors; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = sectors[i].color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, center - 2, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      // Draw Sector Separators list boundaries
      ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Write Sector Texts labels
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 3;
      ctx.fillText(sectors[i].label, center - 15, 3);
      ctx.restore();
    }

    // Render Outer perimeter bulb dot indicators
    for (let j = 0; j < 16; j++) {
      const dotAngle = j * (Math.PI / 8);
      const x = center + Math.cos(dotAngle) * (center - 6);
      const y = center + Math.sin(dotAngle) * (center - 6);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = (j % 2 === 0) ? "#f59e0b" : "#ffffff";
      ctx.fill();
    }

    // Refresh Fortune wheel timer labels
    const timerLabel = document.getElementById("lucky-spin-timer-label");
    if (timerLabel && this.currentUser) {
      if (!this.currentUser.lastSpinTime) {
        timerLabel.innerText = "READY NOW";
        timerLabel.className = "text-emerald-400 font-bold animate-pulse";
      } else {
        const timeDiff = Date.now() - this.currentUser.lastSpinTime;
        const remaining = 24 * 60 * 60 * 1000 - timeDiff;
        if (remaining <= 0) {
          timerLabel.innerText = "READY NOW";
          timerLabel.className = "text-emerald-400 font-bold animate-pulse";
        } else {
          const hrs = Math.floor(remaining / 3600000);
          const mins = Math.floor((remaining % 3600000) / 60000);
          timerLabel.innerText = `READY IN: ${hrs}h ${mins}m`;
          timerLabel.className = "text-slate-500 font-normal";
        }
      }
    }
  }

  spinLuckyWheel() {
    if (!this.currentUser) {
      this.showToast("Please register or login to spin the wheel!", "error");
      return;
    }

    const disk = document.getElementById("lucky-spin-wheel-disk");
    const triggerBtn = document.getElementById("lucky-spin-trigger-btn");
    if (!disk || !triggerBtn) return;

    // Check if free or paid spin is required
    const isFree = !this.currentUser.lastSpinTime || (Date.now() - this.currentUser.lastSpinTime >= 24 * 60 * 60 * 1000);
    const spinCost = 50.00;

    if (!isFree) {
      if (this.currentUser.balance < spinCost) {
        this.showToast(`Oops! An extra spin costs ৳${spinCost} Taka. Deposit or wait for your free daily spin!`, "error");
        return;
      }
      this.currentUser.balance -= spinCost;
      
      // record charge transaction
      this.db.transactions.push({
        id: "tx" + Date.now() + Math.floor(Math.random() * 100),
        userId: this.currentUser.id,
        username: this.currentUser.username,
        type: "debit",
        amount: spinCost,
        method: "Fortune Wheel Spin Fee",
        walletNumber: "Main Spinner Room",
        date: new Date().toISOString(),
        status: "approved"
      });
    }

    // Disable triggers during rotation sweep
    triggerBtn.disabled = true;
    triggerBtn.className = "absolute z-20 w-14 h-14 bg-slate-805 text-slate-600 font-black text-xs font-mono rounded-full flex flex-col items-center justify-center border-4 border-slate-900 pointer-events-none uppercase tracking-tighter";

    const sectors = [
      { value: 10, label: "৳10" },
      { value: 0, label: "Oops!" },
      { value: 20, label: "৳20" },
      { value: 50, label: "৳50" },
      { value: 15, label: "৳15" },
      { value: 100, label: "৳100" },
      { value: 250, label: "৳250" },
      { value: 500, label: "৳500" }
    ];

    const randomSectorIndex = Math.floor(Math.random() * sectors.length);
    const targetSector = sectors[randomSectorIndex];

    const targetSpins = 6;
    const targetAngle = (targetSpins * 360) + (360 - (randomSectorIndex * 45) - 22.5);

    disk.style.transform = `rotate(${targetAngle}deg)`;

    // Sound alert mockup
    if (navigator.vibrate) {
      setTimeout(() => navigator.vibrate(50), 1000);
      setTimeout(() => navigator.vibrate(50), 2000);
      setTimeout(() => navigator.vibrate(50), 3000);
    }

    const appRef = this;
    setTimeout(() => {
      // Resolve reward payload
      const winVal = targetSector.value;
      const vipMult = appRef.getVIPMultiplier(appRef.currentUser);
      const finalWinnings = winVal * vipMult;

      if (winVal > 0) {
        appRef.currentUser.balance += finalWinnings;

        // Log winning ledger history ticket
        appRef.db.transactions.push({
          id: "tx" + Date.now() + Math.floor(Math.random() * 10),
          userId: appRef.currentUser.id,
          username: appRef.currentUser.username,
          type: "credit",
          amount: finalWinnings,
          method: "Lucky Wheel Spin Win",
          walletNumber: `${targetSector.label} Sector (VIP Multiplier: ${vipMult}x)`,
          date: new Date().toISOString(),
          status: "approved"
        });

        appRef.showToast(`🎉 WINNER! The wheel landed on "${targetSector.label}"! You won ৳${finalWinnings.toFixed(2)} (VIP Boosted: ${vipMult}x). Credits added!`, "success");
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      } else {
        appRef.showToast("💨 Landed on Oops! better luck next spin! Try again!", "info");
      }

      appRef.currentUser.lastSpinTime = Date.now();
      appRef.saveDB();

      // Reset css animation states and triggers
      disk.style.transition = "none";
      disk.style.transform = `rotate(${targetAngle % 360}deg)`;
      setTimeout(() => {
        disk.style.transition = "transform 4s ease-out";
      }, 50);

      triggerBtn.disabled = false;
      triggerBtn.className = "absolute z-20 w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs font-mono rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform border-4 border-slate-900 cursor-pointer hover:from-amber-400 hover:to-yellow-400 uppercase tracking-tighter";

      appRef.renderLuckyWheel();
      appRef.render(); // Redraw UI balances
    }, 4000);
  }

  renderVipLoungePlans() {
    const list = document.getElementById("vip-lounge-plans-list");
    if (!list || !this.currentUser) return;

    list.innerHTML = "";
    
    const activeLevelId = this.currentUser.vipLevelId || "";
    const tiers = this.db.settings.vipTiers || [];

    tiers.forEach(tier => {
      const isActive = (activeLevelId === tier.id);
      
      let badgeHtml = "";
      let actionBtnHtml = "";

      if (isActive) {
        badgeHtml = '<span class="bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded text-[8px] font-bold">✓ ACTIVE RANKS STATUS</span>';
        actionBtnHtml = `
          <button class="w-full bg-amber-950 border border-amber-850 text-amber-400 font-extrabold text-[10px] py-1.5 rounded-xl cursor-default flex items-center justify-center gap-1">
            <i class="fa-solid fa-square-check"></i> Already Activated Member
          </button>
        `;
      } else {
        badgeHtml = `<span class="bg-indigo-955 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded text-[8px] font-bold">৳${tier.price} TO BUY</span>`;
        actionBtnHtml = `
          <button onclick="window.appInstance.purchaseVipTier('${tier.id}')" class="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-extrabold text-[10px] py-2 rounded-xl transition shadow-md active:scale-[0.98] cursor-pointer">
            Activate ${tier.title} Upgrade
          </button>
        `;
      }

      list.innerHTML += `
        <div class="bg-slate-950 border ${isActive ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-850'} p-3.5 rounded-2xl space-y-3 font-mono transition">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-gem text-amber-400 text-base"></i>
              <h5 class="text-xs font-black text-white">${tier.title}</h5>
            </div>
            ${badgeHtml}
          </div>
          
          <div class="grid grid-cols-3 gap-1 text-[9px] border-y border-slate-900/80 py-2 text-center">
            <div>
              <span class="text-slate-500 block hidden md:block">Payout mult</span>
              <span class="text-slate-500 block md:hidden">Boost</span>
              <strong class="text-white font-bold">${tier.multiplier.toFixed(2)}x Boost</strong>
            </div>
            <div>
              <span class="text-slate-500 block hidden md:block">Ticket Disc.</span>
              <span class="text-slate-500 block md:hidden">Disc.</span>
              <strong class="text-white font-bold">${tier.discount}% Off</strong>
            </div>
            <div>
              <span class="text-slate-500 block hidden md:block">Up bonus</span>
              <span class="text-slate-500 block md:hidden">Free</span>
              <strong class="text-emerald-400 font-bold">৳${tier.bonus} Free</strong>
            </div>
          </div>
          
          ${actionBtnHtml}
        </div>
      `;
    });

    // Update Banner Status
    const statusLabel = document.getElementById("vip-current-status-tier");
    if (statusLabel) {
      const activeTierObj = tiers.find(t => t.id === activeLevelId);
      statusLabel.innerText = activeTierObj ? activeTierObj.title.toUpperCase() : "BRONZE SYSTEM RECRUIT (NO VIP)";
    }

    const multLabel = document.getElementById("vip-current-status-mult");
    if (multLabel) {
      const activeTierObj = tiers.find(t => t.id === activeLevelId);
      multLabel.innerText = activeTierObj ? `${activeTierObj.multiplier.toFixed(2)}x (Boosted)` : "1.0x (Standard)";
    }
  }

  purchaseVipTier(tierId) {
    if (!this.currentUser) return;

    const tierObj = this.db.settings.vipTiers.find(t => t.id === tierId);
    if (!tierObj) return;

    if (this.currentUser.balance < tierObj.price) {
      this.showToast(`Insufficient balance! This VIP upgrade costs ৳${tierObj.price} Taka. Deposit funds first.`, "error");
      return;
    }

    // Deduct cost and save rank upgrade bonus
    this.currentUser.balance -= tierObj.price;
    this.currentUser.vipLevelId = tierObj.id;
    this.currentUser.balance += tierObj.bonus;

    // Log debit ledger transaction details
    this.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "debit",
      amount: tierObj.price,
      method: "VIP Status Upgrade Purchase",
      walletNumber: `${tierObj.title} Club`,
      date: new Date().toISOString(),
      status: "approved"
    });

    // Log free welcome upgrade bonus cash ledger
    this.db.transactions.push({
      id: "tx" + (Date.now() + 1) + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "credit",
      amount: tierObj.bonus,
      method: "VIP Welcome Bonus Credit",
      walletNumber: `${tierObj.title} System Vault`,
      date: new Date().toISOString(),
      status: "approved"
    });

    this.saveDB();
    this.showToast(`👑 Congratulations! You are now a proud "${tierObj.title}" Member! Premium multi-play system unlocked. ৳${tierObj.bonus} welcome bonus credited!`, "success");
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);

    this.renderVipLoungePlans();
    this.render(); // Refresh dashboards & balances
  }

  renderAdminVipClub() {
    const list = document.getElementById("admin-vip-tiers-list");
    if (!list) return;

    list.innerHTML = "";
    const tiers = this.db.settings.vipTiers || [];

    // update count indicator
    const countEl = document.getElementById("vip-tiers-count");
    if (countEl) countEl.innerText = `${tiers.length} Active VIPs`;

    if (tiers.length === 0) {
      list.innerHTML = `
        <div class="text-slate-500 text-center py-8 font-sans">
          No VIP Tiers created. Use the editor on the left to initialize a premium plan!
        </div>
      `;
      return;
    }

    tiers.forEach(tier => {
      list.innerHTML += `
        <div class="flex items-center justify-between py-3 border-b border-slate-900 last:border-0 font-mono text-[10px]">
          <div class="space-y-1">
            <span class="text-xs font-bold text-white block">${tier.title}</span>
            <div class="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 font-sans">
              <span>Price: <strong class="text-slate-300">৳${tier.price}</strong></span>
              <span>•</span>
              <span>Bonus: <strong class="text-emerald-400">৳${tier.bonus}</strong></span>
              <span>•</span>
              <span>Mult: <strong class="text-amber-400">${tier.multiplier.toFixed(2)}x</strong></span>
              <span>•</span>
              <span>Discount: <strong class="text-purple-400">${tier.discount}%</strong></span>
            </div>
          </div>
          <button onclick="window.appInstance.deleteAdminVipTier('${tier.id}')" class="bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 hover:text-rose-300 px-2 py-1 rounded text-[8px] transition cursor-pointer">
            Delete
          </button>
        </div>
      `;
    });
  }

  deleteAdminVipTier(tierId) {
    if (!this.db || !this.db.settings || !this.db.settings.vipTiers) return;
    
    // Safety check: is it empty or matched?
    const title = this.db.settings.vipTiers.find(t => t.id === tierId)?.title || "Tier";
    this.db.settings.vipTiers = this.db.settings.vipTiers.filter(t => t.id !== tierId);
    this.saveDB();
    this.showToast(`Removed VIP Club level tier "${title}" from the registry.`, "info");
    this.renderAdminVipClub();
  }

  // ================= MEGA PROGRESSIVE JACKPOT VIEW =================
  renderJackpotTab() {
    const s = this.db.settings;
    const poolAmountEl = document.getElementById("tab-jackpot-pool-amount");
    if (poolAmountEl) {
      poolAmountEl.innerText = `৳${(s.jackpotPool || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Dynamic timer countdown
    const countdownEl = document.getElementById("tab-jackpot-countdown");
    if (countdownEl) {
      const now = new Date();
      let target = new Date(s.jackpotExpiry || "");
      if (isNaN(target.getTime())) {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownEl.innerText = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
      } else {
        countdownEl.innerText = "00h : 00m : 00s (Ended)";
      }
    }

    // Render registrations history
    const tbody = document.getElementById("jackpot-registrations-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      const regs = this.db.jackpotRegistrations || [];
      const activeCounter = document.getElementById("jackpot-active-counter");
      if (activeCounter) activeCounter.innerText = `${regs.length} total purchased`;

      if (regs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-550 font-sans">No active ticket entries. Be the first to buy!</td></tr>`;
      } else {
        // Show reverse chronological entries
        [...regs].reverse().forEach(reg => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-850/30 hover:bg-slate-900/40 transition text-slate-300";
          tr.innerHTML = `
            <td class="py-2.5 font-bold text-white flex items-center gap-1.5 font-mono text-left">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> ${this.escapeHTML(reg.userName)}
            </td>
            <td class="py-2.5 text-center text-purple-300 font-bold font-mono">${reg.qty}x</td>
            <td class="py-2.5 text-center text-emerald-400 font-bold font-mono">৳${reg.spent.toFixed(2)}</td>
            <td class="py-2.5 text-right text-slate-500 text-[9px] font-mono">${reg.date}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // Update bulk quantity state count visual indicator
    const selectedQtyInput = document.getElementById("jackpot-selected-qty");
    const qtyVal = parseInt(selectedQtyInput ? selectedQtyInput.value : 1);
    
    // Set cost
    const bulkCostEl = document.getElementById("jackpot-bulk-cost");
    if (bulkCostEl) {
      const ticketCost = s.jackpotTicketCost || 20.00;
      const discountPercent = this.currentUser ? this.getUserTicketDiscount(this.currentUser) : 0;
      const finalCostPerTicket = ticketCost * (1 - discountPercent / 100);
      const totalCost = qtyVal * finalCostPerTicket;
      if (discountPercent > 0) {
        bulkCostEl.innerHTML = `<span class="line-through text-slate-500 mr-2">৳${(qtyVal * ticketCost).toFixed(2)}</span> ৳${totalCost.toFixed(2)}`;
      } else {
        bulkCostEl.innerText = `৳${totalCost.toFixed(2)}`;
      }
    }

    // User total tickets entries
    const userEntriesEl = document.getElementById("tab-jackpot-user-entries");
    if (userEntriesEl && this.currentUser) {
      const userRegsSum = (this.db.jackpotRegistrations || [])
        .filter(r => r.userName === this.currentUser.username)
        .reduce((sum, r) => sum + r.qty, 0);
      userEntriesEl.innerText = `Your Entries: ${userRegsSum} tickets`;
    }
  }

  // ================= DAILY BOUNTY TASKS VIEW =================
  renderTasksTab() {
    const listContainer = document.getElementById("user-daily-tasks-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const tasks = this.db.dailyTasks || [];
    const submissions = this.db.taskSubmissions || [];

    if (tasks.length === 0) {
      listContainer.innerHTML = `
        <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
          <i class="fa-solid fa-list-check text-slate-700 text-3xl"></i>
          <p class="text-slate-400 font-bold text-xs">No tasks currently broadcasted.</p>
          <p class="text-slate-505 text-[10px]">Contact our executive administrator to get promotional jobs assigned.</p>
        </div>
      `;
      return;
    }

    tasks.forEach(task => {
      // Find user submission for this task
      const userSub = submissions.find(s => s.taskId === task.id && s.userName === this.currentUser.username);
      
      let statusBadge = "";
      let actionArea = "";

      if (userSub) {
        if (userSub.status === "pending") {
          statusBadge = `<span class="bg-amber-955/20 border border-amber-900/45 text-amber-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-hourglass-half mr-1 text-[8px]"></i> Pending Review</span>`;
          actionArea = `
            <div class="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex items-center justify-between gap-3 text-[10px]">
              <span class="text-slate-400">Proof submitted. Waiting for dynamic review:</span>
              <img src="${userSub.screenshot}" class="w-10 h-10 aspect-square object-cover rounded border border-slate-805 cursor-zoom-in" onclick="window.open('${userSub.screenshot}', '_blank')" />
            </div>
          `;
        } else if (userSub.status === "approved") {
          statusBadge = `<span class="bg-emerald-955/20 border border-emerald-900/45 text-emerald-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-double mr-1 text-[8px]"></i> Approved</span>`;
          actionArea = `
            <div class="bg-emerald-955/10 p-3 rounded-2xl border border-emerald-900/10 text-emerald-400 text-[10px] flex items-center gap-2">
              <i class="fa-solid fa-gift text-sm animate-bounce"></i>
              <span>Earned <strong>৳${task.reward}</strong> balance credited directly! (Notes: ${this.escapeHTML(userSub.adminNotes || "Good job")})</span>
            </div>
          `;
        } else if (userSub.status === "rejected") {
          statusBadge = `<span class="bg-rose-955/20 border border-rose-900/40 text-rose-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-circle-xmark mr-1 text-[8px]"></i> Rejected</span>`;
          actionArea = `
            <div class="space-y-2">
              <div class="bg-rose-955/10 p-3 rounded-2xl border border-rose-900/15 text-rose-400 text-[10px] flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation text-sm"></i>
                <span>Disapproved: <strong>${this.escapeHTML(userSub.adminNotes || 'Screenshot blurred or irrelevant.')}</strong></span>
              </div>
              <button onclick="window.appInstance.reSubmitTask('${task.id}')" class="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 py-2 rounded-xl text-[10px] text-white font-bold transition">
                Resubmit New Screenshot Proof
              </button>
            </div>
          `;
        }
      } else {
        statusBadge = `<span class="bg-cyan-955/20 border border-cyan-900/40 text-cyan-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-bullseye mr-1 text-[8px]"></i> Open Task</span>`;
        actionArea = `
          <div class="space-y-3">
            <div class="flex items-center gap-2.5">
              <a href="${this.escapeHTML(task.url)}" target="_blank" class="w-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 py-2.5 rounded-xl text-center text-[10px] text-white font-extrabold transition">
                <i class="fa-solid fa-external-link mr-1"></i> Open Task Link
              </a>
              <button onclick="document.getElementById('task-img-upload-${task.id}').click()" class="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-800 py-2.5 rounded-xl text-center text-[10px] text-white font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-cloud-arrow-up text-cyan-400 animate-pulse"></i> Upload Screenshot
              </button>
            </div>
            <input type="file" id="task-img-upload-${task.id}" class="hidden" accept="image/*" onchange="window.appInstance.handleScreenshotUpload(this, '${task.id}')" />
          </div>
        `;
      }

      // Check category details
      let catIcon = "📺";
      if (task.category === "telegram") catIcon = "✈️";
      if (task.category === "facebook") catIcon = "👍";
      if (task.category === "tiktok") catIcon = "🎵";
      if (task.category === "other") catIcon = "⚙️";

      const taskDiv = document.createElement("div");
      taskDiv.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl font-mono text-xs text-left";
      taskDiv.innerHTML = `
        <div class="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
          <div class="space-y-2">
            <h4 class="text-xs font-black text-white flex items-center gap-1.5">
              <span>${catIcon}</span> ${this.escapeHTML(task.title)}
            </h4>
            <div class="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 font-sans">
              <span>Earnings: <strong class="text-amber-400 font-mono">৳${task.reward}.00</strong></span>
              <span>•</span>
              <span>Category: <strong class="capitalize text-cyan-400">${task.category}</strong></span>
            </div>
          </div>
          ${statusBadge}
        </div>

        <div class="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-850/40 text-[10.5px]">
          <span class="text-slate-500 font-bold block text-[8.5px] uppercase tracking-wider">Instructions:</span>
          <p class="text-slate-350 leading-relaxed font-sans">${this.escapeHTML(task.instructions)}</p>
        </div>

        ${actionArea}
      `;
      listContainer.appendChild(taskDiv);
    });
  }

  // ================= ADMIN: PROGRESSIVE JACKPOT CONTROL =================
  renderAdminJackpot() {
    const s = this.db.settings;
    const poolAmountEl = document.getElementById("admin-jackpot-pool-indicator");
    if (poolAmountEl) {
      poolAmountEl.innerText = `৳${(s.jackpotPool || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Pre-populate input configurations
    const fundInput = document.getElementById("admin-jackpot-pool-input");
    const costInput = document.getElementById("admin-jackpot-price-input");
    const exInput = document.getElementById("admin-jackpot-expiry-input");

    if (fundInput && document.activeElement !== fundInput) {
      fundInput.value = (s.jackpotPool || 0).toFixed(2);
    }
    if (costInput && document.activeElement !== costInput) {
      costInput.value = (s.jackpotTicketCost || 20.00).toFixed(2);
    }
    if (exInput && document.activeElement !== exInput) {
      exInput.value = s.jackpotExpiry || "";
    }

    const tbody = document.getElementById("admin-jackpot-purchases-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const regs = this.db.jackpotRegistrations || [];

    // Counters update
    const countEl = document.getElementById("admin-jackpot-logs-count");
    if (countEl) countEl.innerText = `${regs.length} entries`;

    const sumEl = document.getElementById("admin-jackpot-tickets-sum");
    if (sumEl) {
      const ticketsSum = regs.reduce((sum, r) => sum + r.qty, 0);
      sumEl.innerText = `${ticketsSum} tickets`;
    }

    if (regs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500 font-sans text-xs">No active Jackpot tickets purchased.</td></tr>`;
      return;
    }

    [...regs].reverse().forEach(reg => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-850/45 hover:bg-slate-900/60 transition";
      tr.innerHTML = `
        <td class="py-2.5 text-slate-400 text-[10.5px]">#${reg.id.split("_").pop() || reg.id}</td>
        <td class="py-2.5 font-bold text-white text-[10.5px]">${this.escapeHTML(reg.userName)}</td>
        <td class="py-2.5 text-center text-purple-300 font-bold text-[10.5px]">${reg.qty}x</td>
        <td class="py-2.5 text-center text-emerald-400 font-bold text-[10.5px]">৳${reg.spent.toFixed(2)}</td>
        <td class="py-2.5 text-right text-slate-500 text-[9.5px]">${reg.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ================= ADMIN: DAILY BOUNTY TASKS CONTROL PANEL =================
  renderAdminTasks() {
    const activeTasksCountEl = document.getElementById("admin-active-tasks-count");
    const pendingSubsCountEl = document.getElementById("admin-pending-submissions-count");
    const activeTasks = this.db.dailyTasks || [];
    const submissions = this.db.taskSubmissions || [];

    if (activeTasksCountEl) activeTasksCountEl.innerText = `${activeTasks.length} Active`;
    if (pendingSubsCountEl) {
      const pendingCount = submissions.filter(s => s.status === "pending").length;
      pendingSubsCountEl.innerText = `${pendingCount} Pending`;
    }

    // Render active tasks pool list
    const listContainer = document.getElementById("admin-tasks-list-container");
    if (listContainer) {
      listContainer.innerHTML = "";
      if (activeTasks.length === 0) {
        listContainer.innerHTML = `<div class="text-slate-550 py-6 text-center text-[10px] font-sans">No active promo tasks created yet. Use panel above to create one.</div>`;
      } else {
        activeTasks.forEach(task => {
          const div = document.createElement("div");
          div.className = "py-3 border-b border-slate-900 last:border-0 font-mono text-[10.5px] flex items-center justify-between";
          div.innerHTML = `
            <div class="space-y-1 max-w-[70%] text-left">
              <h5 class="text-white font-bold truncate">${this.escapeHTML(task.title)}</h5>
              <div class="flex gap-2 items-center text-[8.5px] text-slate-500">
                <span>Reward: <strong class="text-emerald-400 font-mono">৳${task.reward}</strong></span>
                <span>•</span>
                <span class="capitalize text-cyan-400">${task.category}</span>
              </div>
            </div>
            <button onclick="window.appInstance.deleteAdminTask('${task.id}')" class="bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 hover:text-rose-350 px-2.5 py-1 rounded text-[8.5px] transition cursor-pointer">
              Delete
            </button>
          `;
          listContainer.appendChild(div);
        });
      }
    }

    // Render task proofs verification stream gallery
    const gallery = document.getElementById("admin-task-submissions-gallery");
    if (gallery) {
      gallery.innerHTML = "";
      
      // Get filter value
      const activeFilterBtn = document.querySelector(".task-verify-filter-btn.bg-cyan-955\\/35");
      const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "pending";

      // Filter subs
      let filteredSubs = submissions;
      if (currentFilter !== "all") {
        filteredSubs = submissions.filter(s => s.status === currentFilter);
      }

      if (filteredSubs.length === 0) {
        gallery.innerHTML = `
          <div class="text-slate-500 text-center py-10">
            <i class="fa-solid fa-folder-open text-slate-700 text-3xl mb-1.5 block"></i>
            <span>No task registration submissions matching (${currentFilter}) status.</span>
          </div>
        `;
        return;
      }

      // Show descending order (latest first)
      [...filteredSubs].reverse().forEach(sub => {
        const correspondingTask = activeTasks.find(t => t.id === sub.taskId);
        
        let actions = "";
        let notesLabel = "";
        
        if (sub.status === "pending") {
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3.5 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Specify note/reason..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <div class="flex gap-2 w-full sm:w-auto">
                <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'approved')" class="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-555 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                  Approve & Reward
                </button>
                <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'rejected')" class="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-550 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                  Decline / Reject
                </button>
              </div>
            </div>
          `;
        } else if (sub.status === "approved") {
          const badgeClass = "text-emerald-400 bg-emerald-955/15 border-emerald-900/40";
          notesLabel = `
            <div class="mt-2.5 pt-2.5 border-t border-slate-900/60 flex flex-wrap items-center justify-between text-[9px] text-left">
              <span class="text-slate-550 mr-2">Audit Response notes: <strong class="text-slate-300 font-sans">${this.escapeHTML(sub.adminNotes || "None")}</strong></span>
              <span class="px-2 py-0.5 rounded-lg border uppercase font-mono font-bold text-[7.5px] ${badgeClass}">${sub.status}</span>
            </div>
          `;
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Specify decline reason..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'rejected')" class="w-full sm:w-auto bg-rose-700 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-[9.5px] transition cursor-pointer shrink-0">
                Decline & Revoke Reward
              </button>
            </div>
          `;
        } else if (sub.status === "rejected") {
          const badgeClass = "text-rose-450 bg-rose-955/15 border-rose-900/40";
          notesLabel = `
            <div class="mt-2.5 pt-2.5 border-t border-slate-900/60 flex flex-wrap items-center justify-between text-[9px] text-left">
              <span class="text-slate-550 mr-2">Rejection reason: <strong class="text-slate-300 font-sans">${this.escapeHTML(sub.adminNotes || "None")}</strong></span>
              <span class="px-2 py-0.5 rounded-lg border uppercase font-mono font-bold text-[7.5px] ${badgeClass}">${sub.status}</span>
            </div>
          `;
          actions = `
            <div class="flex flex-col sm:flex-row gap-2 font-mono mt-3 pt-3 border-t border-slate-900 text-left">
              <input type="text" id="admin-sub-notes-${sub.id}" placeholder="Change response note..." class="w-full sm:flex-grow bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-white outline-none focus:border-cyan-500 text-[10.5px]" />
              <button onclick="window.appInstance.verifyTaskSubmission('${sub.id}', 'approved')" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-550 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition cursor-pointer shrink-0">
                Re-approve & Reward
              </button>
            </div>
          `;
        }

        const card = document.createElement("div");
        card.className = "bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl text-[10.5px] space-y-3 shadow-md font-mono relative overflow-hidden text-left";
        card.innerHTML = `
          <div class="flex justify-between items-start gap-4">
            <div class="space-y-1 max-w-[65%]">
              <span class="text-[8px] font-bold text-slate-500 uppercase block tracking-wider">PLATFORM DEED AUDIT</span>
              <h5 class="text-cyan-400 font-black truncate">${this.escapeHTML(correspondingTask ? correspondingTask.title : sub.taskTitle)}</h5>
              <div class="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-sans mt-0.5">
                <span>Player: <strong class="text-white">${sub.userName}</strong></span>
                <span>•</span>
                <span>Prize: <strong class="text-yellow-500">৳${sub.reward}</strong></span>
              </div>
            </div>

            <!-- Proof visual zoomer popup inside list -->
            <div class="shrink-0 relative group cursor-zoom-in" onclick="window.appInstance.openScreenshotViewer('${sub.id}')">
              <img src="${sub.screenshot}" class="w-14 h-14 aspect-square object-cover rounded-lg border border-slate-800" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-lg">
                <i class="fa-solid fa-expand text-white text-xs animate-pulse"></i>
              </div>
            </div>
          </div>

          <div class="bg-slate-950 p-2 rounded-xl text-[9.5px]">
            <span class="text-slate-500 leading-normal block">Date submitted: <strong class="text-slate-400">${sub.date}</strong></span>
          </div>

          ${notesLabel}
          ${actions}
        `;
        gallery.appendChild(card);
      });
    }
  }

  handleScreenshotUpload(input, taskId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const task = this.db.dailyTasks.find(t => t.id === taskId);
      if (!task) return;

      const newSub = {
        id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        taskId: taskId,
        taskTitle: task.title,
        userName: this.currentUser.username,
        reward: task.reward,
        screenshot: base64Data,
        status: "pending",
        date: new Date().toLocaleString("en-US", { hour12: true }),
        adminNotes: ""
      };

      if (!this.db.taskSubmissions) this.db.taskSubmissions = [];
      this.db.taskSubmissions.push(newSub);
      this.saveDB();
      this.showToast("Deed screenshot proof registered. Our administrators will audit post immediately!", "success");
      
      // Haptic vibrate confirmation
      if (navigator.vibrate) navigator.vibrate([100]);

      this.renderTasksTab();
    };

    reader.readAsDataURL(file);
  }

  reSubmitTask(taskId) {
    if (!this.db || !this.db.taskSubmissions) return;
    
    // Remove rejected submissions
    this.db.taskSubmissions = this.db.taskSubmissions.filter(s => !(s.taskId === taskId && s.userName === this.currentUser.username));
    this.saveDB();
    this.renderTasksTab();
  }

  deleteAdminTask(taskId) {
    if (!this.db || !this.db.dailyTasks) return;
    
    const taskTitle = this.db.dailyTasks.find(t => t.id === taskId)?.title || "Task";
    this.db.dailyTasks = this.db.dailyTasks.filter(t => t.id !== taskId);
    this.saveDB();
    this.showToast(`Removed daily bounty task "${taskTitle}" successfully.`, "info");
    this.renderAdminTasks();
  }

  verifyTaskSubmission(submissionId, newStatus) {
    if (!this.db || !this.db.taskSubmissions) return;

    const sub = this.db.taskSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    const notesInput = document.getElementById(`admin-sub-notes-${submissionId}`);
    const notes = notesInput ? notesInput.value.trim() : "";
    const oldStatus = sub.status;

    if (oldStatus === newStatus) {
      this.showToast(`Submission already marked as ${newStatus}`, "info");
      return;
    }

    sub.status = newStatus;
    sub.adminNotes = notes || (newStatus === "approved" ? "Satisfactory work." : "Disapproved profile metadata.");

    const player = this.db.users.find(u => u.username === sub.userName);

    if (newStatus === "approved") {
      // From pending/rejected to approved: Credit user
      if (player) {
         player.balance += sub.reward;
         
         // Push transaction history list
         if (!this.db.transactions) this.db.transactions = [];
         this.db.transactions.push({
           id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
           userName: player.username,
           paymentMethod: "Bounty Task Reward",
           phone: "Internal App Wallet",
           amount: sub.reward,
           transactionType: "Deposit", // Credited balance adds directly inside ledger
           status: "complete",
           bonusAmount: 0,
           notes: `Reward for: ${sub.taskTitle}`,
           date: new Date().toLocaleString("en-US", { hour12: true })
         });
      }
      this.showToast(`Deed approved! Loaded ৳${sub.reward} directly to user balance.`, "success");
    } else if (newStatus === "rejected") {
      // From approved to rejected: Deduct reward if it was already credited!
      if (oldStatus === "approved") {
        if (player) {
          player.balance = Math.max(0, player.balance - sub.reward);
          // Push refund/deduct transaction
          if (!this.db.transactions) this.db.transactions = [];
          this.db.transactions.push({
            id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userName: player.username,
            paymentMethod: "Bounty Task Revoked",
            phone: "Internal App Wallet",
            amount: sub.reward,
            transactionType: "Withdrawal", // Deducted balance records as withdrawal
            status: "complete",
            bonusAmount: 0,
            notes: `Revoked: ${sub.taskTitle} (Reason: ${sub.adminNotes})`,
            date: new Date().toLocaleString("en-US", { hour12: true })
          });
        }
        this.showToast(`Deed revoked! Deducted ৳${sub.reward} from user balance.`, "warning");
      } else {
        this.showToast(`Deed marked rejected: ${sub.adminNotes}`, "info");
      }
    } else if (newStatus === "pending") {
      // If reset back/decline to pending
      if (oldStatus === "approved" && player) {
        player.balance = Math.max(0, player.balance - sub.reward);
      }
      this.showToast("Deed reset back to pending status.", "info");
    }

    this.saveDB();
    this.renderAdminTasks();
  }

  openScreenshotViewer(submissionId) {
    if (!this.db || !this.db.taskSubmissions) return;
    const sub = this.db.taskSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    const modal = document.getElementById("screenshot-viewer-modal");
    const img = document.getElementById("screenshot-large-img");
    const title = document.getElementById("screenshot-title");
    const meta = document.getElementById("screenshot-meta");

    if (modal && img) {
      img.src = sub.screenshot;
      if (title) title.innerText = sub.taskTitle || "Screenshot Proof";
      if (meta) meta.innerText = `Submitted by: @${sub.userName} • Bounty reward: ৳${sub.reward} • Status: ${sub.status.toUpperCase()}`;
      
      // Reset state variables
      window.screenshotViewerState = {
        zoom: 1,
        panX: 0,
        panY: 0,
        rotate: 0,
        isDragging: false,
        startX: 0,
        startY: 0
      };
      
      // Clear inline transformation
      img.style.transform = "scale(1) translate(0px, 0px) rotate(0deg)";
      
      const percent = document.getElementById("screenshot-zoom-percent");
      if (percent) percent.innerText = "100%";
      const slider = document.getElementById("screenshot-zoom-slider");
      if (slider) slider.value = "1";

      modal.classList.remove("hidden");
    }
  }

  updateNotificationBanner() {
    const banner = document.getElementById("notif-permission-banner");
    if (!banner) return;

    if (!this.currentUser) {
      banner.classList.add("hidden");
      return;
    }

    if (localStorage.getItem("lw_alerts_enabled") === "true") {
      banner.classList.add("hidden");
      return;
    }

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        banner.classList.add("hidden");
      } else {
        banner.classList.remove("hidden");
      }
    } else {
      banner.classList.add("hidden");
    }
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
                    localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
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
                  localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
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

    if (updatedNotified) {
      localStorage.setItem("lw_notified_systems", JSON.stringify(notifiedItems));
    }
  }

  renderProfileChart() {
    const ctx = document.getElementById("profile-chart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      return;
    }

    if (this.profileChartInstance) {
      this.profileChartInstance.destroy();
    }

    const spent = parseFloat(this.currentUser.loss) || 0;
    const profit = parseFloat(this.currentUser.profit) || 0;
    const winnings = Math.max(0, spent + profit);

    this.profileChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Spent", "Winnings"],
        datasets: [{
          data: [spent, winnings],
          backgroundColor: ["#f43f5e", "#10b981"],
          borderWidth: 1,
          borderColor: "#0f172a"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a3b8",
              font: {
                size: 9,
                family: "JetBrains Mono"
              }
            }
          }
        },
        cutout: "60%"
      }
    });
  }

  // Toast Notifier
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-mono text-white transition-all transform translate-y-2 opacity-0 duration-350 shrink-0 select-none ${
      type === "success" ? "bg-emerald-950 border-emerald-500/30 text-emerald-300" :
      type === "error" ? "bg-rose-950 border-rose-500/30 text-rose-300" :
      "bg-slate-900 border-slate-700 text-slate-300"
    }`;

    const icon = document.createElement("i");
    icon.className = `fa-solid ${
      type === "success" ? "fa-circle-check text-emerald-400" :
      type === "error" ? "fa-circle-xmark text-rose-400" :
      "fa-circle-info text-cyan-400"
    }`;

    const text = document.createElement("span");
    text.innerText = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    // Remove
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Route Views Switcher
  getAppView() {
    // Check maintenance first
    if (this.db.settings.maintenanceMode && !this.isAdminMode) {
      return "maintenance";
    }
    if (this.isAdminMode) {
      return "admin";
    }
    if (!this.currentUser) {
      return "auth";
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

    if (view === "maintenance") {
      document.getElementById("screen-maintenance").classList.remove("hidden");
      this.renderMaintenance();
    } else if (view === "auth") {
      document.getElementById("screen-auth").classList.remove("hidden");
      this.renderAuth();
    } else if (view === "dashboard") {
      document.getElementById("screen-dashboard").classList.remove("hidden");
      this.renderDashboard();
    } else if (view === "admin") {
      document.getElementById("screen-admin").classList.remove("hidden");
      this.renderAdmin();
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
    const usernameEls = document.querySelectorAll(".curr-username");
    const balanceEls = document.querySelectorAll(".curr-balance");

    usernameEls.forEach(el => el.innerText = this.currentUser.username);
    balanceEls.forEach(el => el.innerText = this.currentUser.balance.toFixed(2));

    // Hide all tabs
    document.getElementById("tab-home").classList.add("hidden");
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
    } else if (this.currentTab === "refer") {
      if (referTab) referTab.classList.remove("hidden");
      this.renderReferTab();
    } else {
      const targetTab = document.getElementById(`tab-${this.currentTab}`);
      if (targetTab) targetTab.classList.remove("hidden");
    }

    if (this.currentTab === "home") {
      this.renderHomeTab();
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

  renderHomeTab() {
    this.updateNotificationBanner();
    const listEl = document.getElementById("pools-list-container");
    listEl.innerHTML = "";

    // Dynamically render dynamic Home Category Filter Tabs
    const tabsCont = document.getElementById("home-category-tabs");
    if (tabsCont) {
      tabsCont.innerHTML = "";
      
      // All Pools button
      const allBtn = document.createElement("button");
      allBtn.setAttribute("data-category", "all");
      if (this.currentHomeCategory === "all") {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
      } else {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
      }
      allBtn.innerHTML = "🎯 All Pools";
      tabsCont.appendChild(allBtn);

      // Category buttons dynamically mapped
      this.db.categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.setAttribute("data-category", cat.name);
        
        const isActive = (this.currentHomeCategory === cat.name);
        if (isActive) {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15 cursor-pointer transition active:scale-95";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
          }
        } else {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-900/30 bg-slate-900 text-emerald-400 hover:text-emerald-300 cursor-pointer transition active:scale-95 shadow-md";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
          }
        }
        btn.innerHTML = cat.label;
        tabsCont.appendChild(btn);
      });
    }

    const isAll = (this.currentHomeCategory === "all");
    const filteredLotteries = this.db.lotteries.filter(lot => {
      if (isAll) return true;
      return lot.category === this.currentHomeCategory;
    });

    if (filteredLotteries.length === 0) {
      listEl.innerHTML = `
        <div class="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl text-center space-y-2 mt-2">
          <p class="text-xs text-slate-500 font-mono">No active draw pools in this category right now.</p>
        </div>
      `;
      return;
    }

    filteredLotteries.forEach(lot => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden space-y-4 shadow-xl cursor-pointer hover:border-cyan-500/20 transition-all duration-300";

      const badgeColor = lot.category.includes("10") ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" :
                         lot.category.includes("20") ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" :
                         "bg-rose-950 text-rose-400 border border-rose-800/40";

      const progress = Math.min(100, Math.round((lot.soldTickets / lot.totalTickets) * 100));
      const cardDrawTime = new Date(lot.drawTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <div>
            <span class="text-[9px] uppercase font-bold tracking-widest ${badgeColor} px-2.5 py-0.5 rounded-full">
              ${lot.category}
            </span>
            <h3 class="text-sm font-bold text-white mt-1.5">${lot.name}</h3>
            <p class="text-[11px] text-slate-400 leading-normal mt-1">${lot.details}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs text-slate-500 font-mono block">Entry Fee</span>
            <span class="text-base font-black text-white font-mono block">৳${lot.entryFee}</span>
          </div>
        </div>

        <!-- Target Draw Date & Time -->
        <div class="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950/40 px-3 py-2 rounded-xl font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-regular fa-clock text-cyan-400"></i>
            <span>Draw Scheduled:</span>
          </div>
          <span class="text-white font-bold">${cardDrawTime}</span>
        </div>

        <!-- Progress of Pools -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Sold Tickets Progress</span>
            <span class="text-cyan-400 font-bold">${progress}% (${lot.soldTickets}/${lot.totalTickets})</span>
          </div>
          <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-rose-500" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-slate-800/80 pt-3 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-solid fa-trophy text-rose-500"></i>
            <span>Prize: <span class="text-white font-bold">৳${lot.prizeAmount}</span></span>
          </div>
          <button class="buy-pool-btn bg-gradient-to-r from-red-600 to-rose-600 hover:scale-103 text-white text-[11px] font-black py-2 px-4 rounded-xl shadow-lg transition active:opacity-90" data-id="${lot.id}">
            Buy Ticket
          </button>
        </div>
      `;

      // Allow popping up details modal on choosing pool card
      card.addEventListener("click", (e) => {
        if (e.target.closest(".buy-pool-btn")) return;
        this.openLotteryDetailsPop(lot.id);
      });

      listEl.appendChild(card);
    });

    // Attach buy logic
    document.querySelectorAll(".buy-pool-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Stop bubbling to prevent also opening modal
        const id = e.target.getAttribute("data-id");
        this.purchaseTicket(id);
      });
    });
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

    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    this.showToast(`Bought ticket ${code} successfully for ৳${lot.entryFee}!`, "success");
    this.currentTab = "tickets";
    this.render();
  }

  renderTicketsTab() {
    const listEl = document.getElementById("tickets-list-container");
    listEl.innerHTML = "";

    const userTickets = this.db.tickets.filter(t => t.userId === this.currentUser.id);

    if (userTickets.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-ticket text-xl text-slate-700 block mb-2"></i>
          No bought ticket records in wallet.
        </div>
      `;
      return;
    }

    userTickets.forEach(t => {
      const lot = this.db.lotteries.find(l => l.id === t.lotteryId) || { name: "Expired Draw Event" };
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800/80 p-4 rounded-3xl relative flex justify-between items-center cursor-pointer hover:border-cyan-500/20 transition-all duration-300";

      let statusBadge = "";
      if (t.status === "won") {
        statusBadge = `<span class="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">🏆 WON ৳${t.prizeAmount}</span>`;
      } else if (t.status === "lost") {
        statusBadge = `<span class="bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">❌ LOST</span>`;
      } else {
        statusBadge = `<span class="bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">⏳ RUNNING</span>`;
      }

      card.innerHTML = `
        <div class="space-y-1">
          <h4 class="text-xs font-black text-white leading-none">${lot.name}</h4>
          <span class="text-[10px] text-slate-500 font-mono block">Purchased: ${new Date(t.purchaseDate).toLocaleDateString()}</span>
          <div class="text-base font-black tracking-widest text-cyan-400 font-mono pt-1 select-all select-text">${t.code}</div>
        </div>
        <div class="text-right">
          ${statusBadge}
        </div>
      `;

      card.addEventListener("click", () => {
        this.openTicketLiveInfoPop(t.id);
      });

      listEl.appendChild(card);
    });
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

  renderWalletTab() {
    this.rebuildDepositGatewaySelect();
    this.updateSelectedDepositGatewayInstructions();
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

    const personalAccEl = document.getElementById("user-dep-account-personal");
    const agentAccEl = document.getElementById("user-dep-account-agent");
    const singleAccEl = document.getElementById("user-dep-account-single");
    const singleLabelEl = document.getElementById("user-dep-single-label");

    if (!titleEl || !instructionEl || !badgeEl || !qrBlock || !qrImg || !rowPersonal || !rowAgent || !rowSingle || !personalAccEl || !agentAccEl || !singleAccEl) return;

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
    } else {
      // Non-mobile (DBBL / Crypto)
      rowPersonal.classList.add("hidden");
      rowAgent.classList.add("hidden");
      rowSingle.classList.remove("hidden");

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
    const listEl = document.getElementById("history-list-container");
    const ledgerTabBtn = document.getElementById("history-subtab-ledger");
    const communityTabBtn = document.getElementById("history-subtab-community");
    const ledgerSection = document.getElementById("tab-history-ledger-section");
    const communitySection = document.getElementById("tab-history-community-section");

    if (!this.historySubTab) {
      this.historySubTab = "ledger";
    }

    if (this.historySubTab === "ledger") {
      if (ledgerTabBtn) {
        ledgerTabBtn.className = "py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/10";
      }
      if (communityTabBtn) {
        communityTabBtn.className = "py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 text-slate-400 bg-transparent hover:text-white";
      }
      if (ledgerSection) ledgerSection.classList.remove("hidden");
      if (communitySection) communitySection.classList.add("hidden");
    } else {
      if (ledgerTabBtn) {
        ledgerTabBtn.className = "py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 text-slate-400 bg-transparent hover:text-white";
      }
      if (communityTabBtn) {
        communityTabBtn.className = "py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/10";
      }
      if (ledgerSection) ledgerSection.classList.add("hidden");
      if (communitySection) communitySection.classList.remove("hidden");

      this.renderCommunitySection();
      return;
    }

    listEl.innerHTML = "";
    // Load user operations (Deposits & Withdrawals)
    const userDepos = this.db.deposits.filter(d => d.username === this.currentUser.username);
    const userWds = this.db.withdrawals.filter(w => w.username === this.currentUser.username);
    const userTx = (this.db.transactions || []).filter(tx => tx.userId === this.currentUser.id);

    // Combine
    const allOps = [];
    userDepos.forEach(d => allOps.push({ ...d, type: "deposit", sign: "+", color: "text-emerald-400", label: `Trx: ${d.trxId}` }));
    userWds.forEach(w => allOps.push({ ...w, type: "withdraw", sign: "-", color: "text-rose-400", label: `Tar: ${w.targetAccount}` }));
    userTx.forEach(tx => allOps.push({
      ...tx,
      type: tx.type === "credit" ? "Bonus/Credit" : "Charge/Debit",
      sign: tx.type === "credit" ? "+" : "-",
      color: tx.type === "credit" ? "text-emerald-400" : "text-rose-400",
      label: tx.walletNumber || `Ref: ${tx.id.slice(-6)}`
    }));

    // Sort by date
    allOps.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allOps.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-clock-rotate-left text-xl text-slate-700 block mb-2"></i>
          Wallet logs transaction ledger blank.
        </div>
      `;
      return;
    }

    allOps.forEach(op => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs";

      const sign = op.sign;
      const color = op.color;
      const trxLabel = op.label;

      let statusBadge = "";
      if (op.status === "approved") {
        statusBadge = `<span class="text-[10px] text-emerald-400 font-mono">Approved</span>`;
      } else if (op.status === "declined") {
        statusBadge = `<span class="text-[10px] text-rose-400 font-mono">Declined</span>`;
      } else {
        statusBadge = `<span class="text-[10px] text-amber-500 font-mono">Pending</span>`;
      }

      card.innerHTML = `
        <div class="space-y-0.5">
          <div class="font-bold text-white capitalize">${(op.type === "deposit" || op.type === "withdraw") ? (op.type + " via " + op.method) : op.method}</div>
          <div class="text-[10px] text-slate-500 font-mono">${trxLabel}</div>
        </div>
        <div class="text-right">
          <div class="font-black ${color} font-mono">${sign}৳${op.amount.toFixed(op.amount % 1 === 0 ? 0 : 2)}</div>
          ${statusBadge}
        </div>
      `;

      listEl.appendChild(card);
    });
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
                      <span>@${com.username}</span> 
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
                    <span class="text-[11px] font-black tracking-tight text-white font-sans">@${post.username}</span>
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
    // Dynamically calculate live statistics from database
    const winCounts = (this.db.tickets || []).filter(t => t.userId === this.currentUser.id && t.status === "won").length + (this.currentUser.wins || 0);
    
    document.getElementById("profile-wins").innerText = winCounts;
    document.getElementById("profile-loss").innerText = this.currentUser.loss || 0;
    document.getElementById("profile-profit").innerText = (this.currentUser.profit || 0).toFixed(2);
    document.getElementById("profile-join-date").innerText = this.currentUser.joinDate || "N/A";

    // Inject Dynamic Badge Badging Rack
    const badgeContainer = document.getElementById("profile-unlocked-badges");
    if (badgeContainer) {
      badgeContainer.innerHTML = "";
      
      const authorUser = this.currentUser;
      const postsCount = (this.db.communityPosts || []).filter(p => (p.userId === authorUser.id || p.username === authorUser.username) && p.status !== "banned").length;
      const commentsCount = (this.db.communityComments || []).filter(c => (c.userId === authorUser.id || c.username === authorUser.username) && c.status !== "banned").length;
      const totalContribution = postsCount + commentsCount;

      const isLuckyWinner = winCounts > 0;
      const isTopContributor = totalContribution >= 3;

      let badgesHtml = "";
      
      // Admin custom badge override mapping
      if (authorUser.customBadge) {
        const badgeMap = {
          vip: { label: "💎 VIP Player", style: "bg-cyan-950/70 text-cyan-400 border-cyan-800/60" },
          moderator: { label: "🛡️ Staff Mod", style: "bg-indigo-950/70 text-indigo-400 border-indigo-800/60" },
          star: { label: "⭐ Elite Star", style: "bg-purple-950/70 text-purple-400 border-purple-800/60" },
          premium: { label: "✨ Premium Member", style: "bg-fuchsia-950/70 text-fuchsia-400 border-fuchsia-800/60" },
          pro: { label: "🔥 Pro Active", style: "bg-orange-950/70 text-orange-400 border-orange-800/60" },
          legend: { label: "👑 Royal Legend", style: "bg-rose-950/70 text-rose-400 border-rose-800/60" }
        };
        const conf = badgeMap[authorUser.customBadge];
        if (conf) {
          badgesHtml += `<span class="${conf.style} px-2 py-0.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 shadow-md">${conf.label}</span>`;
        }
      }

      if (isLuckyWinner) {
        badgesHtml += `<span class="bg-amber-950/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md animate-pulse" title="Unlocked by winning active lotteries"><i class="fa-solid fa-trophy text-amber-500 text-[8px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      if (isTopContributor) {
        badgesHtml += `<span class="bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md" title="Unlocked with 3+ shares/replies"><i class="fa-solid fa-medal text-emerald-400 text-[8px]"></i> Top Contributor (${totalContribution})</span>`;
      }
      
      // Default baseline standard badge
      badgesHtml += `<span class="bg-slate-950 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-mono">🎖️ Active Player</span>`;
      
      badgeContainer.innerHTML = badgesHtml;
    }

    // Populate user details fields
    document.getElementById("profile-edit-email").value = this.currentUser.email || "";
    document.getElementById("profile-edit-phone").value = this.currentUser.phone || "";
    document.getElementById("profile-edit-dob").value = this.currentUser.dob || "";

    // Sync Avatar Image display
    const avatarImg = document.getElementById("profile-avatar-img");
    const avatarFallback = document.getElementById("profile-avatar-fallback");
    if (this.currentUser.photo) {
      avatarImg.src = this.currentUser.photo;
      avatarImg.classList.remove("hidden");
      avatarFallback.classList.add("hidden");
    } else {
      avatarImg.src = "";
      avatarImg.classList.add("hidden");
      avatarFallback.classList.remove("hidden");
    }
    this.renderProfileChart();
    this.renderUserInbox();
  }

  renderReferTab() {
    const userDisplay = document.getElementById("user-refer-code-display");
    const regionDisplay = document.getElementById("user-region-display");
    const linkDisplay = document.getElementById("user-refer-link-display");
    const totalCount = document.getElementById("user-refer-total-count");
    const tierDisplay = document.getElementById("user-refer-level-display");
    const profitsDisplay = document.getElementById("user-refer-earned-display");

    if (userDisplay) userDisplay.innerText = this.currentUser.username;
    if (regionDisplay) regionDisplay.innerText = this.currentUser.region || "Dhaka";
    
    const inviteUrl = window.location.origin + "/index.html?ref=" + encodeURIComponent(this.currentUser.username);
    if (linkDisplay) linkDisplay.innerText = inviteUrl;

    const count = this.currentUser.refersCount || 0;
    if (totalCount) totalCount.innerText = count;

    // Evaluate Milestone Levels configuration to decide current tier and earned rewards
    const levels = this.db.settings.milestoneLevels || [];
    let currentLvlTitle = "LV0: Cadet";
    let earnedBounties = 0;

    const sortedLevels = [...levels].sort((a,b) => a.count - b.count);
    sortedLevels.forEach(lvl => {
      if (count >= lvl.count) {
        currentLvlTitle = lvl.title;
      }
    });

    // Sum earnings from actual rewarded list
    const rewardedList = this.currentUser.rewardedMilestones || [];
    rewardedList.forEach(title => {
      const matchLvl = levels.find(l => l.title === title);
      if (matchLvl) earnedBounties += parseFloat(matchLvl.reward || 0);
    });

    if (tierDisplay) tierDisplay.innerText = currentLvlTitle;
    if (profitsDisplay) profitsDisplay.innerText = "৳" + earnedBounties.toFixed(2);

    // Render Milestone Levels checklist
    const levelsListEl = document.getElementById("user-refer-levels-list");
    if (levelsListEl) {
      levelsListEl.innerHTML = "";
      if (levels.length === 0) {
        levelsListEl.innerHTML = `<div class="text-slate-500 font-sans text-center py-2">No levels configured by admin.</div>`;
      } else {
        levels.forEach(lvl => {
          const reached = count >= lvl.count;
          const claimed = rewardedList.includes(lvl.title);
          
          let statusBadge = "";
          if (claimed) {
            statusBadge = `<span class="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded text-[8px] font-black uppercase"><i class="fa-solid fa-circle-check"></i> CLAIMED ৳${lvl.reward}</span>`;
          } else if (reached) {
            statusBadge = `<span class="bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded text-[8px] font-black uppercase animate-pulse"><i class="fa-solid fa-wand-magic-sparkles"></i> REACHED</span>`;
          } else {
            statusBadge = `<span class="bg-slate-950 text-slate-500 border border-slate-900 px-2 py-0.5 rounded text-[8px] font-bold">Goal: ${lvl.count} refers</span>`;
          }

          const card = document.createElement("div");
          card.className = "flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-900";
          card.innerHTML = `
            <div>
              <span class="block text-white font-bold text-[11px]">${this.escapeHTML(lvl.title)}</span>
              <span class="text-[8px] text-slate-500 font-sans font-medium block mt-0.5">Award money: ৳${lvl.reward}</span>
            </div>
            <div>${statusBadge}</div>
          `;
          levelsListEl.appendChild(card);
        });
      }
    }

    // Render Leaderboard list using top recruiters in system
    const ldrBody = document.getElementById("user-refer-leaderboard-body");
    if (ldrBody) {
      ldrBody.innerHTML = "";
      
      const recruiters = this.db.users
        .filter(u => u.refersCount > 0)
        .sort((a,b) => (b.refersCount || 0) - (a.refersCount || 0))
        .slice(0, 10);

      if (recruiters.length === 0) {
        ldrBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-slate-500 font-sans">No referral activities registered yet. Be the first!</td></tr>`;
      } else {
        recruiters.forEach((rec, idx) => {
          const rank = idx + 1;
          
          let badgeTag = "৳0";
          if (rank === 1) badgeTag = "৳1500 (Champion)";
          else if (rank === 2) badgeTag = "৳800";
          else if (rank === 3) badgeTag = "৳400";
          else badgeTag = "Commission share";

          const row = document.createElement("tr");
          row.className = "border-b border-slate-800/40 hover:bg-slate-900/40 transition";
          row.innerHTML = `
            <td class="py-2.5 font-bold ${rank <= 3 ? 'text-amber-400 font-black' : 'text-slate-500'}">#${rank}</td>
            <td class="py-2.5 text-slate-200">@${this.escapeHTML(rec.username)}</td>
            <td class="py-2.5 text-center text-cyan-400 font-black">${rec.refersCount}</td>
            <td class="py-2.5 text-right font-semibold text-emerald-400">${badgeTag}</td>
          `;
          ldrBody.appendChild(row);
        });
      }
    }

    // Render Referred Friends
    const friendsEl = document.getElementById("user-referred-friends-list");
    if (friendsEl) {
      friendsEl.innerHTML = "";
      const friends = this.currentUser.referredUsers || [];
      if (friends.length === 0) {
        friendsEl.innerHTML = `<div class="text-slate-500 font-sans text-center py-2">Invite people using your invitation link to list referred participants!</div>`;
      } else {
        friends.forEach(fr => {
          const card = document.createElement("div");
          card.className = "p-2.5 bg-slate-950/60 rounded-xl border border-slate-900/60 flex justify-between items-center";
          card.innerHTML = `
            <div>
              <span class="block font-bold text-white text-[11px]">@${this.escapeHTML(fr.username)}</span>
              <span class="text-[8px] text-slate-500 block mt-0.5">Joined at: ${fr.date ? fr.date.substring(0, 10) : 'N/A'}</span>
            </div>
            <span class="text-[9px] font-black text-pink-400 uppercase bg-pink-950/30 px-2 py-0.5 rounded border border-pink-900/40 font-mono">${fr.region || 'DHAKA'}</span>
          `;
          friendsEl.appendChild(card);
        });
      }
    }
  }

  renderBadgeRequestTab() {
    const listEl = document.getElementById("user-badge-reqs-history-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const myReqs = (this.db.badgeRequests || []).filter(r => r.userId === this.currentUser.id);
    
    if (myReqs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 bg-slate-900 border border-slate-850 text-[10px] text-slate-500 rounded-2xl font-mono">
          No previous badge requests submitted.
        </div>
      `;
    } else {
      // Sort newest first
      const sorted = [...myReqs].sort((a, b) => new Date(b.date) - new Date(a.date));
      sorted.forEach(r => {
        const item = document.createElement("div");
        item.className = "bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs font-mono";
        
        let badgeLabel = r.requestedBadge.toUpperCase();
        const badgeMap = {
          vip: "💎 VIP Player",
          moderator: "🛡️ Staff Mod",
          star: "⭐ Elite Star",
          premium: "✨ Premium Member",
          pro: "🔥 Pro Active",
          legend: "👑 Royal Legend"
        };
        badgeLabel = badgeMap[r.requestedBadge] || badgeLabel;

        let statusClass = "bg-slate-950 text-slate-400 border border-slate-800";
        if (r.status === "approved") {
          statusClass = "bg-green-950 text-green-400 border border-green-900/60";
        } else if (r.status === "rejected") {
          statusClass = "bg-red-950 text-red-500 border border-red-900/60";
        } else {
          statusClass = "bg-amber-950 text-amber-500 border border-amber-900/60 animate-pulse";
        }

        item.innerHTML = `
          <div class="pr-3 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-white text-[11px]">${badgeLabel}</span>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${statusClass}">${r.status.toUpperCase()}</span>
            </div>
            <div class="text-[9px] text-slate-500 font-mono mt-1">Submitted: ${new Date(r.date).toLocaleDateString()}</div>
            ${r.reason ? `<div class="text-[9px] text-slate-400 italic mt-1.5 bg-slate-950/60 p-2 border border-slate-850 rounded">"${r.reason}"</div>` : ""}
          </div>
          ${r.status === "pending" ? `
            <button class="com-act-cancel-badge-req text-[8px] bg-slate-950 hover:bg-rose-950 border border-slate-800/80 hover:border-rose-900 text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-xl transition cursor-pointer" data-req-id="${r.id}">
              Cancel
            </button>
          ` : ""}
        `;

        listEl.appendChild(item);
      });

      // Bind cancel buttons
      listEl.querySelectorAll(".com-act-cancel-badge-req").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const reqId = btn.getAttribute("data-req-id");
          this.db.badgeRequests = (this.db.badgeRequests || []).filter(r => r.id !== reqId);
          this.saveDB();
          this.showToast("Badge application request cancelled successfully.", "info");
          this.renderBadgeRequestTab();
        });
      });
    }
  }

  renderAdminBadgeRequests() {
    const listEl = document.getElementById("admin-badge-requests-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const reqs = this.db.badgeRequests || [];
    
    // Update count labels and bubble counters
    const pendingCount = reqs.filter(r => r.status === "pending").length;
    const subStatEl = document.getElementById("admin-badge-reqs-sub-stats");
    if (subStatEl) {
      subStatEl.innerText = `${pendingCount} pending applications`;
    }
    const headerBadge = document.getElementById("admin-badge-requests-count-badge");
    if (headerBadge) {
      headerBadge.innerText = pendingCount;
      if (pendingCount > 0) {
        headerBadge.classList.remove("hidden");
      } else {
        headerBadge.classList.add("hidden");
      }
    }

    if (reqs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-10 bg-slate-950 border border-slate-850 rounded-2xl text-[11px] text-slate-500 font-mono">
          <i class="fa-solid fa-ribbon text-slate-700 text-base block mb-1"></i>
          No badge requests submitted by any players yet.
        </div>
      `;
      return;
    }

    // Sort pending first, then newest
    const sorted = [...reqs].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.date) - new Date(a.date);
    });

    sorted.forEach(r => {
      const item = document.createElement("div");
      item.className = "bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 font-mono";

      const badgeMap = {
        vip: { icon: "💎", label: "VIP Player", value: "vip" },
        moderator: { icon: "🛡️", label: "Staff Mod", value: "moderator" },
        star: { icon: "⭐", label: "Elite Star", value: "star" },
        premium: { icon: "✨", label: "Premium Member", value: "premium" },
        pro: { icon: "🔥", label: "Pro Active", value: "pro" },
        legend: { icon: "👑", label: "Royal Legend", value: "legend" }
      };

      const bConf = badgeMap[r.requestedBadge] || { icon: "🎖️", label: r.requestedBadge, value: r.requestedBadge };

      let statusColor = "bg-slate-900 text-slate-400";
      if (r.status === "approved") {
        statusColor = "bg-green-950 text-green-400 border border-green-800/40";
      } else if (r.status === "rejected") {
        statusColor = "bg-red-950 text-red-500 border border-red-850/40";
      } else {
        statusColor = "bg-amber-950 text-amber-500 border border-amber-800/40 animate-pulse";
      }

      item.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-extrabold text-white text-sm">@${r.username}</span>
              <span class="text-[9px] text-slate-500">(${new Date(r.date).toLocaleString()})</span>
            </div>
            
            <div class="flex items-center gap-1.5 mt-2">
              <span class="text-slate-400 text-[10px]">Claims Badge:</span>
              <span class="bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-800/30">
                ${bConf.icon} ${bConf.label}
              </span>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold ${statusColor}">
                ${r.status.toUpperCase()}
              </span>
            </div>

            ${r.reason ? `
              <div class="text-[11px] text-slate-300 bg-slate-900 border border-slate-850 p-2.5 rounded-xl mt-2.5 italic font-sans">
                <span class="text-[9px] text-slate-500 block not-italic font-mono uppercase pb-0.5 font-bold">User Justification Message:</span>
                "${r.reason}"
              </div>
            ` : ""}
          </div>

          <div class="flex gap-1.5 self-start md:self-center">
            ${r.status === "pending" ? `
              <button class="admin-badge-act-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-[10px]" data-action="approve" data-req-id="${r.id}">
                Approve
              </button>
              <button class="admin-badge-act-btn bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-[10px]" data-action="reject" data-req-id="${r.id}">
                Reject
              </button>
            ` : ""}
            <button class="admin-badge-act-btn bg-slate-900 border border-slate-850 hover:bg-red-950/20 text-slate-400 hover:text-red-400 font-bold py-1.5 px-2.5 rounded-lg transition cursor-pointer text-[10px]" data-action="delete" data-req-id="${r.id}">
              Delete
            </button>
          </div>
        </div>
      `;

      listEl.appendChild(item);
    });

    // Bind action events
    listEl.querySelectorAll(".admin-badge-act-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const action = btn.getAttribute("data-action");
        const reqId = btn.getAttribute("data-req-id");
        
        const req = (this.db.badgeRequests || []).find(x => x.id === reqId);
        if (!req) return;

        if (action === "approve") {
          req.status = "approved";
          
          // Auto grant user the badge in users table
          const targetUser = (this.db.users || []).find(usr => usr.id === req.userId || usr.username === req.username);
          if (targetUser) {
            targetUser.customBadge = req.requestedBadge;
            this.showToast(`Granted ${req.requestedBadge.toUpperCase()} Badge to user @${targetUser.username}!`, "success");
          } else {
            this.showToast("User record not found, but marked as approved.", "info");
          }
        } else if (action === "reject") {
          req.status = "rejected";
          this.showToast("Badge request rejected.", "warning");
        } else if (action === "delete") {
          this.db.badgeRequests = (this.db.badgeRequests || []).filter(x => x.id !== reqId);
          this.showToast("Badge request deleted from database.", "info");
        }

        this.saveDB();
        this.renderAdminBadgeRequests(); // Redraw requests view
        this.renderAdmin(); // Sync headers count
      });
    });
  }

  // ================= ADMIN SYSTEM CONTROL VIEW RENDER =================
  renderAdmin() {
    // Select Admin tab classes matching selection
    const adminTabBtns = document.querySelectorAll(".admin-tab-selector-btn");
    adminTabBtns.forEach(btn => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId === this.currentAdminTab) {
        btn.className = "admin-tab-selector-btn text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 transition bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15";
      } else {
        btn.className = "admin-tab-selector-btn text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 transition bg-slate-900 border border-slate-800 text-slate-400 hover:text-white";
      }
    });

    // Hide all viewports
    document.getElementById("admin-tab-stats").classList.add("hidden");
    document.getElementById("admin-tab-users").classList.add("hidden");
    document.getElementById("admin-tab-lotteries").classList.add("hidden");
    document.getElementById("admin-tab-deposits").classList.add("hidden");
    document.getElementById("admin-tab-withdraws").classList.add("hidden");
    document.getElementById("admin-tab-settings").classList.add("hidden");
    document.getElementById("admin-tab-gateways").classList.add("hidden");
    const msgsTab = document.getElementById("admin-tab-messages");
    if (msgsTab) msgsTab.classList.add("hidden");
    const catTab = document.getElementById("admin-tab-categories");
    if (catTab) catTab.classList.add("hidden");
    const websiteTab = document.getElementById("admin-tab-website");
    if (websiteTab) websiteTab.classList.add("hidden");
    const reportsTab = document.getElementById("admin-tab-reports");
    if (reportsTab) reportsTab.classList.add("hidden");
    const badgeRequestsTab = document.getElementById("admin-tab-badge-requests");
    if (badgeRequestsTab) badgeRequestsTab.classList.add("hidden");
    const refAdminTab = document.getElementById("admin-tab-refer");
    if (refAdminTab) refAdminTab.classList.add("hidden");
    const vipAdminTab = document.getElementById("admin-tab-vip");
    if (vipAdminTab) vipAdminTab.classList.add("hidden");
    const jackpotAdminTab = document.getElementById("admin-tab-jackpot");
    if (jackpotAdminTab) jackpotAdminTab.classList.add("hidden");
    const tasksAdminTab = document.getElementById("admin-tab-tasks");
    if (tasksAdminTab) tasksAdminTab.classList.add("hidden");

    // Dynamic pending reports counter
    const pendingRepsCount = (this.db.reports || []).filter(r => r.status === "pending").length;
    const badgeEl = document.getElementById("admin-reports-count-badge");
    if (badgeEl) badgeEl.innerText = pendingRepsCount;

    // Dynamic pending badge requests counter
    const pendingBadgeReqsCount = (this.db.badgeRequests || []).filter(br => br.status === "pending").length;
    const badgeReqsCountEl = document.getElementById("admin-badge-requests-count-badge");
    if (badgeReqsCountEl) {
      badgeReqsCountEl.innerText = pendingBadgeReqsCount;
      if (pendingBadgeReqsCount > 0) {
        badgeReqsCountEl.classList.remove("hidden");
      } else {
        badgeReqsCountEl.classList.add("hidden");
      }
    }

    // Show current tab viewport
    const currentViewport = document.getElementById(`admin-tab-${this.currentAdminTab}`);
    if (currentViewport) currentViewport.classList.remove("hidden");

    if (this.currentAdminTab === "stats") {
      this.renderAdminStats();
    } else if (this.currentAdminTab === "users") {
      this.renderAdminUsers();
    } else if (this.currentAdminTab === "lotteries") {
      this.renderAdminLotteries();
    } else if (this.currentAdminTab === "deposits") {
      this.renderAdminDeposits();
    } else if (this.currentAdminTab === "withdraws") {
      this.renderAdminWithdraws();
    } else if (this.currentAdminTab === "categories") {
      this.renderAdminCategories();
    } else if (this.currentAdminTab === "messages") {
      this.renderAdminMessages();
    } else if (this.currentAdminTab === "website") {
      this.renderAdminWebsite();
    } else if (this.currentAdminTab === "reports") {
      this.renderAdminReports();
    } else if (this.currentAdminTab === "badge-requests") {
      this.renderAdminBadgeRequests();
    } else if (this.currentAdminTab === "refer") {
      this.renderAdminRefer();
    } else if (this.currentAdminTab === "vip") {
      this.renderAdminVipClub();
    } else if (this.currentAdminTab === "jackpot") {
      this.renderAdminJackpot();
    } else if (this.currentAdminTab === "tasks") {
      this.renderAdminTasks();
    } else if (this.currentAdminTab === "settings" || this.currentAdminTab === "gateways") {
      this.renderAdminSettings();
    }

    // Flush any pending real-time security alerts/toasts
    this.flushAdminToasts();
  }

  renderAdminStats() {
    // Collect facts of system
    const totalUsers = this.db.users.length;
    const activeLotteries = this.db.lotteries.filter(l => l.status === "active").length;
    const completedLotteries = this.db.lotteries.filter(l => l.status === "drawn").length;

    const totalDepositedApproved = this.db.deposits.filter(d => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);
    const pendingDeposCount = this.db.deposits.filter(d => d.status === "pending").length;
    const pendingWdsCount = this.db.withdrawals.filter(w => w.status === "pending").length;
    const totalWdsApproved = this.db.withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);

    const ticketPurchasedVolume = this.db.tickets.length * 10; // estimate factor on ticket volume or dynamic fees
    let actualPaidTicketSpent = 0;
    this.db.tickets.forEach(ticket => {
      const lot = this.db.lotteries.find(l => l.id === ticket.lotteryId);
      if (lot) actualPaidTicketSpent += lot.entryFee;
    });

    document.getElementById("admin-stat-sales").innerText = `৳${actualPaidTicketSpent}`;
    document.getElementById("admin-stat-players").innerText = totalUsers;
    document.getElementById("admin-stat-deposits").innerText = `৳${totalDepositedApproved}`;
    document.getElementById("admin-stat-pending").innerText = `${pendingDeposCount + pendingWdsCount} Ops`;

    // Logs metrics
    document.getElementById("admin-metric-total-pools").innerText = `${this.db.lotteries.length} pools`;
    document.getElementById("admin-metric-active-pools").innerText = `${activeLotteries} active Pools`;
    document.getElementById("admin-metric-total-completes").innerText = `${completedLotteries} completed Pools`;
    document.getElementById("admin-metric-withdrawn-approved").innerText = `৳${totalWdsApproved} paid out`;
  }

  renderAdminUsers() {
    const listEl = document.getElementById("admin-users-list-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    // Toggle clear search button visibility
    const clearBtn = document.getElementById("admin-players-clear-search-btn");
    if (clearBtn) {
      if (this.adminPlayersSearchQuery) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }

    let filteredUsers = this.db.users || [];
    const query = (this.adminPlayersSearchQuery || "").toLowerCase().trim();
    if (query) {
      filteredUsers = filteredUsers.filter(u => {
        const usernameMatch = (u.username || "").toLowerCase().includes(query);
        const emailMatch = (u.email || "").toLowerCase().includes(query);
        const phoneMatch = (u.phone || "").toLowerCase().includes(query);
        return usernameMatch || emailMatch || phoneMatch;
      });
    }

    if (filteredUsers.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="4" class="p-8 text-center text-slate-500 font-mono text-[10px]">
            No matching players found for search term "${query}"
          </td>
        </tr>
      `;
      return;
    }

    filteredUsers.forEach(u => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800 text-xs";

      let statusColor = u.status === "active" ? "bg-green-950 text-green-400 border border-green-800/40" :
                         u.status === "blocked" ? "bg-amber-950 text-amber-400 border border-amber-800/40" :
                         "bg-red-950 text-red-500 border border-red-800/30";

      // Display extra metrics matching profile badges if custom Badge selected
      let customBadgeBadge = "";
      if (u.customBadge) {
        const adminBadgeIcons = {
          vip: "💎 VIP",
          moderator: "🛡️ MOD",
          star: "⭐ STAR",
          premium: "✨ PREM",
          pro: "🔥 PRO",
          legend: "👑 LGND"
        };
        const label = adminBadgeIcons[u.customBadge] || u.customBadge.toUpperCase();
        customBadgeBadge = `<span class="bg-indigo-950/80 text-indigo-300 text-[8px] font-bold px-1.5 py-0.2 rounded ml-1 uppercase border border-indigo-900/50">${label}</span>`;
      }

      row.innerHTML = `
        <td class="p-4">
          <div class="font-bold text-white flex items-center gap-1">@${u.username} ${customBadgeBadge}</div>
          <div class="text-[10px] text-slate-500 font-mono">${u.email} ${u.phone ? `• ${u.phone}` : ""}</div>
        </td>
        <td class="p-4 font-mono font-bold text-cyan-400">৳${u.balance.toFixed(2)}</td>
        <td class="p-4">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono ${statusColor}">
            ${u.status.toUpperCase()}
          </span>
        </td>
        <td class="p-4 text-right">
          <button class="admin-edit-player-btn bg-slate-800 text-slate-300 py-1.5 px-3 rounded-xl hover:bg-slate-700 transition cursor-pointer" data-id="${u.id}">
            Modify
          </button>
        </td>
      `;

      listEl.appendChild(row);
    });

    document.querySelectorAll(".admin-edit-player-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const uId = e.currentTarget.getAttribute("data-id");
        this.openUserEditModal(uId);
      });
    });
  }

  renderAdminCategories() {
    const listEl = document.getElementById("admin-categories-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    this.db.categories.forEach(cat => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/60";

      const showPrizes = cat.type === "multi" ? cat.defaultPrizes : "—";
      const badgeClass = cat.type === "multi" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : "bg-cyan-950 text-cyan-400 border border-cyan-800/40";

      row.innerHTML = `
        <td class="p-3 font-bold text-white">${cat.label}</td>
        <td class="p-3 font-mono text-slate-400">${cat.name}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${badgeClass}">
            ${cat.type === "multi" ? "MULTI WINNER SPLIT" : "SINGLE WINNER"}
          </span>
        </td>
        <td class="p-3 font-mono text-cyan-400">${showPrizes}</td>
        <td class="p-3 text-right">
          <button class="admin-delete-category-btn bg-red-950 hover:bg-red-950/80 text-red-400 border border-red-900/40 text-[9px] font-bold py-1 px-2.5 rounded-lg transition" data-id="${cat.id}">
            Delete
          </button>
        </td>
      `;

      listEl.appendChild(row);
    });

    // Add category click bindings for security check
    document.querySelectorAll(".admin-delete-category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-id");
        const matched = this.db.categories.find(c => c.id === catId);
        if (!matched) return;

        // Prevent deleting original core categories to preserve live demo look
        if (["c1", "c2", "c3", "c4", "c5"].includes(catId)) {
          this.showToast("Cannot delete core defaults, only user custom ones!", "error");
          return;
        }

        if (confirm(`Remove custom category '${matched.label}' permanently?`)) {
          this.db.categories = this.db.categories.filter(c => c.id !== catId);
          this.saveDB();
          this.renderAdminCategories();
          this.showToast("Custom category wiped successfully.", "success");
        }
      });
    });
  }

  escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async getClientIP() {
    try {
      // Free public IP resolver
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip || "127.0.0.1";
    } catch (err) {
      // persistent simulated IP for full multi-account ban protection test in iframe sandboxes
      let storedIp = localStorage.getItem("lw_simulated_ip");
      if (!storedIp) {
        const randA = Math.floor(Math.random() * 150) + 100;
        const randB = Math.floor(Math.random() * 200) + 20;
        storedIp = `103.45.${randA}.${randB}`;
        localStorage.setItem("lw_simulated_ip", storedIp);
      }
      return storedIp;
    }
  }

  async getIPDetails() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const details = await response.json();
        return {
          ip: details.ip || "127.0.0.1",
          country: details.country_name || "",
          org: details.org || "",
          timezone: details.timezone || "",
          region: details.region || ""
        };
      }
    } catch (e) {
      console.warn("Retrying IP details fetch via fallback due to blocker", e);
    }
    const ip = await this.getClientIP();
    return { ip, country: "", org: "", timezone: "", region: "" };
  }

  isVPN(details) {
    if (!details) return false;
    const orgLower = (details.org || "").toLowerCase();
    const vpnKeywords = [
      "vpn", "proxy", "hosting", "cloud", "server", "datacenter", "mullvad", 
      "nordvpn", "expressvpn", "surfshark", "digitalocean", "linode", "ovh", 
      "colocation", "amazon", "google", "microsoft", "leaseweb", "vultr", "packet", 
      "private internet", "windscribe", "tor", "exit-node", "proton", "cloudflare", 
      "fastly", "dedicated", "contabo", "interserver", "hetzner"
    ];
    const isVpnOrg = vpnKeywords.some(keyword => orgLower.includes(keyword));
    if (isVpnOrg) return true;

    // Timezone discrepancy check: device timezone vs IP location timezone
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (details.timezone && clientTimezone && details.timezone !== clientTimezone) {
      return true;
    }
    return false;
  }

  triggerAdminSecurityAlert(type, message) {
    if (!this.db.securityLogs) {
      this.db.securityLogs = [];
    }
    const newLog = {
      id: "sec_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      type: type, // "duplicate_ip" or "region_restriction"
      message: message,
      timestamp: new Date().toISOString()
    };
    this.db.securityLogs.unshift(newLog);
    
    // Keep max 150 items
    if (this.db.securityLogs.length > 150) {
      this.db.securityLogs = this.db.securityLogs.slice(0, 150);
    }

    if (!this.db.pendingAdminToasts) {
      this.db.pendingAdminToasts = [];
    }
    this.db.pendingAdminToasts.push({
      id: newLog.id,
      message: message,
      type: type
    });

    this.saveDB();

    // If Admin Mode is currently active, instantly show a flashy red/amber security toast!
    if (this.isAdminMode) {
      this.flushAdminToasts();
    }
  }

  flushAdminToasts() {
    if (!this.isAdminMode) return;
    const toasts = this.db.pendingAdminToasts || [];
    if (toasts.length === 0) return;

    toasts.forEach(t => {
      let icon = "fa-solid fa-shield-halved text-rose-500 mr-2";
      if (t.type === "duplicate_ip") {
        icon = "fa-solid fa-fingerprint text-red-500 animate-bounce mr-2";
      } else if (t.type === "region_restriction") {
        icon = "fa-solid fa-earth-asia text-amber-500 animate-spin mr-2";
      }
      
      this.showToast(`<span class="flex items-center gap-1 font-mono text-[10px] text-rose-400">
        <i class="${icon}"></i>
        <strong>[AUTO-SECURITY]</strong> ${this.escapeHTML(t.message)}
      </span>`, "error");
    });

    this.db.pendingAdminToasts = [];
    this.saveDB();

    // If they are currently viewing the refer tab control, redraw in real-time
    if (this.currentAdminTab === "refer") {
      this.renderAdminRefer();
    }
  }

  renderAdminMessages() {
    const listEl = document.getElementById("admin-msg-history-list");
    const countEl = document.getElementById("admin-msg-sent-count");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    if (countEl) countEl.innerText = `${msgs.length} Sent`;

    if (msgs.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="5" class="py-6 text-center text-slate-500 font-mono text-[10px]">No sent messages history recorded.</td>
        </tr>
      `;
      return;
    }

    // Sort newer first
    const sorted = [...msgs].sort((a, b) => new Date(b.date) - new Date(a.date));

    listEl.innerHTML = sorted.map(m => {
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const recipientText = m.recipientType === "bulk" 
        ? `<span class="bg-cyan-950/45 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded text-[9px] font-sans font-bold">ALL USERS</span>` 
        : `<span class="bg-purple-950/45 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold">@${m.targetUsername}</span>`;

      let catBadge = "";
      if (m.category === "general") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-slate-950 text-slate-400 py-0.5 px-2 rounded-md border border-slate-800">📢 General</span>`;
      } else if (m.category === "deposit") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-emerald-950/45 text-emerald-400 py-0.5 px-2 rounded-md border border-emerald-900/20">💰 Deposit</span>`;
      } else if (m.category === "withdrawal") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-rose-950/45 text-rose-400 py-0.5 px-2 rounded-md border border-rose-900/20">💸 Payout</span>`;
      } else if (m.category === "bonus") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-amber-950/45 text-amber-400 py-0.5 px-2 rounded-md border border-amber-900/20">🎁 Bonus</span>`;
      } else if (m.category === "alert") {
        catBadge = `<span class="text-[10px] font-sans font-bold bg-yellow-950/45 text-yellow-400 py-0.5 px-2 rounded-md border border-yellow-900/20">⚠️ Alert</span>`;
      }

      return `
        <tr class="border-b border-slate-800/40 hover:bg-slate-950/20 transition">
          <td class="py-3 font-mono">${recipientText}</td>
          <td class="py-3">${catBadge}</td>
          <td class="py-3 font-sans text-slate-200">
            <div class="font-bold text-[11px]">${this.escapeHTML(m.subject)}</div>
            <div class="text-[9px] text-slate-500 mt-0.5 max-w-xs break-words">${this.escapeHTML(m.content)}</div>
          </td>
          <td class="py-3 font-mono text-[10px] text-slate-400">${dateStr}</td>
          <td class="py-3 text-right">
            <button class="delete-admin-msg-btn text-rose-500 hover:text-rose-400 p-1 bg-rose-950/25 border border-rose-900/20 hover:border-rose-800/45 rounded-lg active:scale-95 transition cursor-pointer" data-id="${m.id}" title="Delete msg">
              <i class="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Wire up delete button actions
    listEl.querySelectorAll(".delete-admin-msg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.db.messages = (this.db.messages || []).filter(m => m.id !== id);
        this.saveDB();
        this.renderAdminMessages();
        this.showToast("Message deleted from records.", "info");
      });
    });
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

  renderAdminWebsite() {
    const s = this.db.settings;
    if (!s) return;

    const siteNameEl = document.getElementById("sys-site-name");
    const siteInfoEl = document.getElementById("sys-site-info");
    const signupBonusEl = document.getElementById("sys-signup-bonus");
    const supportNumEl = document.getElementById("sys-support-num");
    const authFooterEl = document.getElementById("sys-auth-footer-text");

    if (siteNameEl) siteNameEl.value = s.siteName || "";
    if (siteInfoEl) siteInfoEl.value = s.siteInfo || "";
    if (signupBonusEl) signupBonusEl.value = s.signupBonus ?? 100;
    if (supportNumEl) supportNumEl.value = s.supportNumber || "";
    if (authFooterEl) authFooterEl.value = s.authFooterText || "";
  }

  renderAdminReports() {
    const postTabBtn = document.getElementById("admin-subtab-post-reports");
    const commentTabBtn = document.getElementById("admin-subtab-comment-reports");

    const postContainer = document.getElementById("admin-post-reports-container");
    const commentContainer = document.getElementById("admin-comment-reports-container");

    if (!this.currentAdminReportsTab) {
      this.currentAdminReportsTab = "post";
    }

    if (this.currentAdminReportsTab === "post") {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (postContainer) postContainer.classList.remove("hidden");
      if (commentContainer) commentContainer.classList.add("hidden");
    } else {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (postContainer) postContainer.classList.add("hidden");
      if (commentContainer) commentContainer.classList.remove("hidden");
    }

    // Filter pending reports
    const postReports = (this.db.reports || []).filter(r => r.type === "post" && r.status === "pending");
    const commentReports = (this.db.reports || []).filter(r => r.type === "comment" && r.status === "pending");

    const postCountBadge = document.getElementById("admin-post-reports-count");
    if (postCountBadge) postCountBadge.innerText = postReports.length;

    const commentCountBadge = document.getElementById("admin-comment-reports-count");
    if (commentCountBadge) commentCountBadge.innerText = commentReports.length;

    // Render Post Reports list
    const postList = document.getElementById("admin-post-reports-list");
    if (postList) {
      postList.innerHTML = "";
      if (postReports.length === 0) {
        postList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i class="fa-solid fa-circle-check text-slate-700 text-lg block mb-1"></i>
            No pending post reports. Clear slate!
          </div>
        `;
      } else {
        postReports.forEach(rep => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-rose-500 font-bold">Post Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-red-950/40 text-red-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-red-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Post Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <!-- Action Panel -->
            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-950/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-user-slash mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-hourglass-half mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-calendar-days mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-post bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-post-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-trash mr-1"></i> Delete Post Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i class="fa-solid fa-check mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          postList.appendChild(card);
        });
      }
    }

    // Render Comment Reports list
    const commentList = document.getElementById("admin-comment-reports-list");
    if (commentList) {
      commentList.innerHTML = "";
      if (commentReports.length === 0) {
        commentList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i class="fa-solid fa-circle-check text-slate-700 text-lg block mb-1"></i>
            No pending comment reports. Clear slate!
          </div>
        `;
      } else {
        commentReports.forEach(rep => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-yellow-500 font-bold">Comment Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-amber-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Comment Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <!-- Action Panel -->
            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-950/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-user-slash mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-hourglass-half mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-calendar-days mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-comment bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-comment-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i class="fa-solid fa-trash mr-1"></i> Delete Reply Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i class="fa-solid fa-check mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          commentList.appendChild(card);
        });
      }
    }
  }

  populateCreatePoolCategories() {
    const selectEl = document.getElementById("create-pool-cat");
    if (!selectEl) return;
    
    const preValue = selectEl.value;
    selectEl.innerHTML = "";
    
    this.db.categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.innerText = `${cat.label} (${cat.type === "multi" ? "Multi Winners" : "Single Winner"})`;
      selectEl.appendChild(opt);
    });
    
    if (preValue && this.db.categories.some(c => c.name === preValue)) {
      selectEl.value = preValue;
    } else if (this.db.categories.length > 0) {
      selectEl.value = this.db.categories[0].name;
    }
  }

  openUserEditModal(id) {
    const u = this.db.users.find(user => user.id === id);
    if (!u) return;

    document.getElementById("edit-player-modal-id").innerText = `@${u.username}`;
    document.getElementById("edit-player-id-field").value = u.id;
    document.getElementById("edit-player-balance").value = u.balance;
    document.getElementById("edit-player-email").value = u.email;
    document.getElementById("edit-player-phone").value = u.phone;
    document.getElementById("edit-player-password").value = ""; // Default empty
    document.getElementById("edit-player-status").value = u.status;
    
    const badgeDropdown = document.getElementById("edit-player-badge");
    if (badgeDropdown) {
      badgeDropdown.value = u.customBadge || "";
    }

    document.getElementById("admin-user-edit-modal").classList.remove("hidden");
  }

  savePlayerEditFromModal() {
    const id = document.getElementById("edit-player-id-field").value;
    const u = this.db.users.find(user => user.id === id);
    if (!u) return;

    u.balance = parseFloat(document.getElementById("edit-player-balance").value || "0");
    u.email = document.getElementById("edit-player-email").value;
    u.phone = document.getElementById("edit-player-phone").value;
    u.status = document.getElementById("edit-player-status").value;
    
    const badgeDropdown = document.getElementById("edit-player-badge");
    if (badgeDropdown) {
      u.customBadge = badgeDropdown.value;
    }

    const newPass = document.getElementById("edit-player-password").value.trim();
    if (newPass) {
      u.password = newPass;
      this.showToast(`Password successfully reset for @${u.username}!`, "success");
    }

    this.saveDB();
    this.showToast("Player edited successfully!", "success");
    document.getElementById("admin-user-edit-modal").classList.add("hidden");
    this.render();
  }

  renderAdminLotteries() {
    const listEl = document.getElementById("admin-pools-list-container");
    listEl.innerHTML = "";

    this.db.lotteries.forEach(lot => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative space-y-4 shadow-lg";

      const badge = lot.status === "drawn" ? `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-green-950 text-green-300">🏆 DRAW COMPLETED</span>` :
                                             `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-cyan-950 text-cyan-400">⏳ ACTIVE RUNNING</span>`;

      const drawBtn = lot.status === "active" ? `<button class="admin-manual-draw-trigger bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition" data-id="${lot.id}">Force Draw Winner</button>` : "";

      card.innerHTML = `
        <div class="flex justify-between items-start gap-4">
          <div>
            <span class="text-[9px] uppercase font-bold tracking-widest text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/30">
              ${lot.category}
            </span>
            <h4 class="text-sm font-bold text-white mt-1.5">${lot.name}</h4>
            <p class="text-[11px] text-slate-500 leading-normal font-mono">ID: ${lot.id} | Prize: ৳${lot.prizeAmount}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-sm font-bold text-white font-mono">Fee: ৳${lot.entryFee}</span>
            <div class="text-[10px] text-slate-500 mt-1 font-mono">${lot.soldTickets}/${lot.totalTickets} Sold</div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-slate-800 pt-3">
          ${badge}
          <div class="flex gap-2">
            ${drawBtn}
            <button class="admin-delete-pool bg-red-950 hover:bg-red-900 text-red-400 text-[10px] font-bold py-1.5 px-3 rounded-xl border border-red-900/30 transition" data-id="${lot.id}">Delete</button>
          </div>
        </div>
      `;

      listEl.appendChild(card);
    });

    // Manual draws award selector triggering
    document.querySelectorAll(".admin-manual-draw-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.openManualDrawModal(id);
      });
    });

    // Delete draw pool with iframe-safe confirmation
    document.querySelectorAll(".admin-delete-pool").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (btn.getAttribute("data-confirmed") === "true") {
          this.db.lotteries = this.db.lotteries.filter(l => String(l.id) !== String(id));
          this.db.tickets = this.db.tickets.filter(t => String(t.lotteryId) !== String(id));
          this.saveDB();
          this.render();
          this.showToast("Lottery pool and ticket sheets wiped.", "success");
        } else {
          btn.setAttribute("data-confirmed", "true");
          btn.innerText = "Confirm Delete ⚠️";
          btn.className = "bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-1.5 px-3 rounded-xl transition animate-pulse border border-red-500 shadow-md";
          
          setTimeout(() => {
            if (btn && btn.getAttribute("data-confirmed") === "true") {
              btn.setAttribute("data-confirmed", "false");
              btn.innerText = "Delete";
              btn.className = "admin-delete-pool bg-red-950 hover:bg-red-900 text-red-400 text-[10px] font-bold py-1.5 px-3 rounded-xl border border-red-900/30 transition";
            }
          }, 4000);
        }
      });
    });
  }

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

  executeManualDrawWinner() {
    const id = document.getElementById("draw-modal-id-field").value;
    const lot = this.db.lotteries.find(l => l.id === id);
    if (!lot) return;

    const ticketsOfPool = this.db.tickets.filter(t => t.lotteryId === lot.id && t.status === "pending");

    if (ticketsOfPool.length === 0) {
      this.showToast("Cannot complete draw. There are 0 tickets bought in this pool yet!", "error");
      return;
    }

    // Hide confirm action, show spinning animations
    document.getElementById("admin-confirm-draw-btn").classList.add("hidden");
    const loader = document.getElementById("spin-loader-graphic");
    loader.classList.remove("hidden");

    // Loop spin animation
    let count = 0;
    const randCodes = ["LW-492740", "LW-829103", "LW-290184", "LW-772910", "LW-538192"];
    const textEl = document.getElementById("spinning-codes-roll");
    
    const interval = setInterval(() => {
      textEl.innerText = randCodes[count % randCodes.length];
      count++;
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      loader.classList.add("hidden");

      // Check if admin entered an override code
      const overrideVal = document.getElementById("draw-override-winning-ticket").value.trim();
      
      const singleDisplay = document.getElementById("single-winner-display");
      const multiDisplay = document.getElementById("multi-winners-display");
      const multiList = document.getElementById("multi-winners-list");

      if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
        // Multi-winner draw logic!
        const shuffle = [...ticketsOfPool];
        
        // Handle override code for rank #1 winner if provided
        let firstWinningTicket = null;
        if (overrideVal) {
          firstWinningTicket = shuffle.find(t => t.code.toLowerCase() === overrideVal.toLowerCase());
          if (firstWinningTicket) {
            // Remove from shuffle so it is strictly selected as rank #1
            const idx = shuffle.indexOf(firstWinningTicket);
            if (idx > -1) shuffle.splice(idx, 1);
          } else {
            this.showToast("Override ticket not in pool buyers. Selected randomly.", "error");
          }
        }

        // Shuffle the rest randomly
        shuffle.sort(() => Math.random() - 0.5);

        // Put the override ticket at position 0 if matched
        if (firstWinningTicket) {
          shuffle.unshift(firstWinningTicket);
        }

        const winnersCount = Math.min(lot.multiWinnerPrizes.length, shuffle.length);
        const winnersDataList = [];

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
          }

          winnersDataList.push({
            rank: i + 1,
            prize: currentPrize,
            username: winnerUser ? winnerUser.username : "Removed User",
            code: winningTicket.code
          });
        }

        const winnerTicketIds = shuffle.slice(0, winnersCount).map(t => t.id);
        ticketsOfPool.forEach(t => {
          if (!winnerTicketIds.includes(t.id)) {
            t.status = "lost";
          }
        });

        lot.status = "drawn";
        this.saveDB();

        // Render UI displays
        if (singleDisplay) singleDisplay.classList.add("hidden");
        if (multiDisplay) multiDisplay.classList.remove("hidden");
        if (multiList) {
          multiList.innerHTML = "";
          winnersDataList.forEach(w => {
            const row = document.createElement("div");
            row.className = "flex justify-between items-center bg-slate-950/60 p-2 rounded-lg border border-slate-800/50 mt-1";
            row.innerHTML = `
              <div class="flex items-center gap-1.5 font-sans">
                <span class="text-[9px] font-bold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/30">Rank #${w.rank}</span>
                <span class="text-white text-[10px]">@${w.username}</span>
              </div>
              <div class="text-right font-mono">
                <span class="text-slate-500 block text-[9px]">${w.code}</span>
                <span class="text-emerald-400 font-bold text-[10px]">৳${w.prize}</span>
              </div>
            `;
            multiList.appendChild(row);
          });
        }

      } else {
        // Standard single winner
        let winningTicket = null;
        if (overrideVal) {
          winningTicket = ticketsOfPool.find(t => t.code.toLowerCase() === overrideVal.toLowerCase());
          if (!winningTicket) {
            this.showToast("Override code non-existent or already drawn. Selecting a random buyer...", "error");
            winningTicket = ticketsOfPool[Math.floor(Math.random() * ticketsOfPool.length)];
          }
        } else {
          winningTicket = ticketsOfPool[Math.floor(Math.random() * ticketsOfPool.length)];
        }

        const winnerUser = this.db.users.find(u => u.id === winningTicket.userId);
        if (winnerUser) {
          winnerUser.balance += lot.prizeAmount;
          winnerUser.wins += 1;
          winnerUser.profit += lot.prizeAmount;
        }

        winningTicket.status = "won";
        winningTicket.prizeAmount = lot.prizeAmount;

        ticketsOfPool.forEach(t => {
          if (t.id !== winningTicket.id) t.status = "lost";
        });

        lot.status = "drawn";
        this.saveDB();

        // Render UI displays
        if (multiDisplay) multiDisplay.classList.add("hidden");
        if (singleDisplay) singleDisplay.classList.remove("hidden");

        document.getElementById("drawn-winner-handle").innerText = winnerUser ? `@${winnerUser.username}` : "Unknown System Account";
        document.getElementById("drawn-winner-ticket-code").innerText = winningTicket.code;
        document.getElementById("drawn-winner-premium-reward").innerText = `৳${lot.prizeAmount}`;
      }

      const resultZone = document.getElementById("draw-winning-outcome-zone");
      if (resultZone) resultZone.classList.remove("hidden");

      this.showToast("Lucky draw award completed successfully!", "success");
    }, 3500);
  }

  renderAdminDeposits() {
    const listEl = document.getElementById("admin-deposits-list");
    listEl.innerHTML = "";

    const depos = this.db.deposits;
    if (depos.length === 0) {
      listEl.innerHTML = `<div class="p-8 text-center text-slate-500 font-mono text-xs">No payment deposits recorded.</div>`;
      return;
    }

    depos.forEach(d => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center text-xs shadow-md";

      let actionBlock = "";
      if (d.status === "pending") {
        actionBlock = `
          <div class="flex gap-2">
            <button class="approve-dep-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${d.id}">Approve</button>
            <button class="decline-dep-btn bg-rose-900 hover:bg-rose-800 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${d.id}">Decline</button>
          </div>
        `;
      } else {
        const clr = d.status === "approved" ? "text-emerald-400" : "text-rose-400";
        actionBlock = `<span class="uppercase font-mono font-bold text-[10px] ${clr}">${d.status}</span>`;
      }

      card.innerHTML = `
        <div class="space-y-1">
          <div class="font-bold text-white">@${d.username}</div>
          <div class="text-[10px] text-slate-400 font-mono">Gateway: ${d.method}</div>
          <div class="text-[10px] text-cyan-400 font-mono select-all">Trx tracer: ${d.trxId}</div>
          <div class="text-[9px] text-slate-600 font-mono">${new Date(d.date).toLocaleString()}</div>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0 text-right">
          <span class="text-sm font-black text-white font-mono">৳${d.amount}</span>
          ${actionBlock}
        </div>
      `;

      listEl.appendChild(card);
    });

    // Approve Deposit Logic
    document.querySelectorAll(".approve-dep-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        this.approveDeposit(id);
      });
    });

    // Decline Deposit Logic
    document.querySelectorAll(".decline-dep-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        this.declineDeposit(id);
      });
    });
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

  renderAdminWithdraws() {
    const listEl = document.getElementById("admin-withdraws-list");
    listEl.innerHTML = "";

    const wds = this.db.withdrawals;
    if (wds.length === 0) {
      listEl.innerHTML = `<div class="p-8 text-center text-slate-500 font-mono text-xs">No cash withdrawals pending.</div>`;
      return;
    }

    wds.forEach(w => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center text-xs shadow-md";

      let actionBlock = "";
      if (w.status === "pending") {
        actionBlock = `
          <div class="flex gap-2">
            <button class="approve-wd-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${w.id}">Approve/Paid</button>
            <button class="decline-wd-btn bg-rose-900 hover:bg-rose-800 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition" data-id="${w.id}">Refund/Decline</button>
          </div>
        `;
      } else {
        const clr = w.status === "approved" ? "text-emerald-400" : "text-rose-400";
        actionBlock = `<span class="uppercase font-mono font-bold text-[10px] ${clr}">${w.status}</span>`;
      }

      card.innerHTML = `
        <div class="space-y-1">
          <div class="font-bold text-white">@${w.username}</div>
          <div class="text-[10px] text-slate-400 font-mono">Recipient: ${w.targetAccount}</div>
          <div class="text-[10px] text-slate-400 font-mono">Method: ${w.method}</div>
          <div class="text-[9px] text-slate-600 font-mono">${new Date(w.date).toLocaleString()}</div>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0 text-right">
          <span class="text-sm font-black text-rose-400 font-mono">৳${w.amount}</span>
          ${actionBlock}
        </div>
      `;

      listEl.appendChild(card);
    });

    document.querySelectorAll(".approve-wd-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        this.approveWithdrawal(id);
      });
    });

    document.querySelectorAll(".decline-wd-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        this.declineWithdrawal(id);
      });
    });
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
      // Refund wallet
      u.balance += w.amount;
      u.profit += w.amount;
    }
    w.status = "declined";
    this.saveDB();
    this.render();
    this.showToast(`Refunded and declined withdrawal of ৳${w.amount} to @${w.username}.`, "info");
  }

  renderAdminRefer() {
    const s = this.db.settings;
    
    // Set targeting values
    const allowedInput = document.getElementById("ref-allowed-regions-input");
    const bannedInput = document.getElementById("ref-banned-regions-input");
    const preventionToggle = document.getElementById("ref-ip-prevention-toggle");
    const vpnBlockToggle = document.getElementById("ref-vpn-block-toggle");

    if (allowedInput) allowedInput.value = (s.allowedRegions || []).join(", ");
    if (bannedInput) bannedInput.value = (s.bannedRegions || []).join(", ");
    if (preventionToggle) preventionToggle.checked = s.ipPreventionEnabled !== false;
    if (vpnBlockToggle) vpnBlockToggle.checked = s.vpnBlockEnabled !== false;

    // Render Milestone Levels Table
    const tbody = document.getElementById("admin-milestone-levels-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      const levels = s.milestoneLevels || [];
      if (levels.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-slate-500 py-3 text-center">No reference levels saved. Create one below!</td></tr>`;
      } else {
        levels.forEach((lvl, idx) => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-850/60 hover:bg-slate-900/60 transition";
          tr.innerHTML = `
            <td class="py-2 text-white font-bold">${this.escapeHTML(lvl.title)}</td>
            <td class="py-2 text-center text-amber-400 font-bold">${lvl.count} refer(s)</td>
            <td class="py-2 text-center text-emerald-400 font-bold">৳${lvl.reward}</td>
            <td class="py-2 text-right">
              <button class="bg-rose-955/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 px-2 py-1 rounded transition text-[9px] cursor-pointer" data-delete-idx="${idx}">
                <i class="fa-solid fa-trash-can mr-1"></i> Delete
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Add Delete Listeners
        tbody.querySelectorAll("[data-delete-idx]").forEach(btn => {
          btn.addEventListener("click", () => {
             const idx = parseInt(btn.getAttribute("data-delete-idx"));
             s.milestoneLevels.splice(idx, 1);
             this.saveDB();
             this.showToast("Milestone level deleted successfully.", "info");
             this.renderAdminRefer();
          });
        });
      }
    }

    // Render flagged duplicate/shared-IP clones
    const sharedIpsList = document.getElementById("admin-shared-ips-list");
    if (sharedIpsList) {
       sharedIpsList.innerHTML = "";
       const ipMap = {};
       this.db.users.forEach(u => {
          const ip = u.registeredIp || "N/A";
          if (ip !== "N/A") {
             if (!ipMap[ip]) ipMap[ip] = [];
             ipMap[ip].push(u.username);
          }
       });

       let foundDuplicates = false;
       for (const [ip, names] of Object.entries(ipMap)) {
          if (names.length > 1) {
             foundDuplicates = true;
             const div = document.createElement("div");
             div.className = "py-2 border-b border-slate-850/50 flex flex-col gap-1 text-[11px]";
             div.innerHTML = `
                <div class="flex justify-between items-center">
                   <strong class="text-rose-400 font-mono"><i class="fa-solid fa-triangle-exclamation mr-1"></i> IP: ${ip}</strong>
                   <span class="bg-rose-950/40 border border-rose-900/45 px-2 py-0.5 rounded text-[8px] uppercase font-bold text-rose-300">${names.length} Clones</span>
                </div>
                <div class="text-[10px] text-slate-400 font-sans">
                   Shared by: ${names.map(n => `<span class="text-slate-200">@${n}</span>`).join(", ")}
                </div>
                <div class="pt-1">
                   <button class="bg-rose-950 hover:bg-rose-920 text-[9px] border border-rose-900 px-2 py-0.5 rounded text-rose-300 transition" data-ban-ip="${ip}">
                      Ban Network IP
                   </button>
                </div>
             `;
             sharedIpsList.appendChild(div);
          }
       }

       if (!foundDuplicates) {
          sharedIpsList.innerHTML = `<div class="text-slate-500 text-center py-4 font-sans">No shared IP duplicate logins registered. Network is safe.</div>`;
       } else {
          sharedIpsList.querySelectorAll("[data-ban-ip]").forEach(btn => {
             btn.addEventListener("click", () => {
                const ip = btn.getAttribute("data-ban-ip");
                if (ip && !s.bannedIPs.includes(ip)) {
                   s.bannedIPs.push(ip);
                   this.db.users.forEach(u => {
                      if (u.registeredIp === ip) u.status = "blocked";
                   });
                   this.saveDB();
                   this.showToast(`Banned IP ${ip} successfully and blocked all sharing clones!`, "success");
                   this.renderAdminRefer();
                } else {
                   this.showToast("This IP is already blacklisted.", "info");
                }
             });
          });
       }
    }

    // Render active banned IPs
    const bannedIpsList = document.getElementById("admin-banned-ips-list");
    if (bannedIpsList) {
       bannedIpsList.innerHTML = "";
       const banned = s.bannedIPs || [];
       if (banned.length === 0) {
          bannedIpsList.innerHTML = `<div class="text-slate-500 text-center py-4 font-sans">No permanently blacklisted network IPs list.</div>`;
       } else {
          banned.forEach((ip, idx) => {
             const div = document.createElement("div");
             div.className = "flex justify-between items-center py-1.5 border-b border-slate-850/40 text-[11px] font-mono";
             div.innerHTML = `
                <span class="text-slate-300"><i class="fa-solid fa-ban text-rose-500 mr-1.5"></i> ${ip}</span>
                <button class="text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950 border border-cyan-900 px-2 py-0.5 rounded text-[8px] transition cursor-pointer shrink-0" data-lift-ip="${ip}">
                   Unban IP
                </button>
             `;
             bannedIpsList.appendChild(div);
          });

          // Unban buttons
          bannedIpsList.querySelectorAll("[data-lift-ip]").forEach(btn => {
             btn.addEventListener("click", () => {
                const ip = btn.getAttribute("data-lift-ip");
                s.bannedIPs = s.bannedIPs.filter(item => item !== ip);
                this.saveDB();
                this.showToast(`IP address unbanned successfully: ${ip}`, "info");
                this.renderAdminRefer();
             });
          });
       }
    }

    // Render Security Logs
    const securityLogsList = document.getElementById("admin-security-logs-list");
    if (securityLogsList) {
      securityLogsList.innerHTML = "";
      const logs = this.db.securityLogs || [];
      if (logs.length === 0) {
        securityLogsList.innerHTML = `<div class="text-slate-500 text-center py-4 font-sans text-[10px]">No automatic security alerts generated yet. Active monitoring is online.</div>`;
      } else {
        logs.forEach(log => {
          let typeColor = "text-rose-400 bg-rose-950/20 border-rose-900/40";
          let icon = "fa-solid fa-fingerprint";
          if (log.type === "region_restriction") {
            typeColor = "text-amber-400 bg-amber-950/20 border-amber-900/40";
            icon = "fa-solid fa-earth-asia";
          }
          const div = document.createElement("div");
          div.className = "py-2 border-b border-slate-850/50 flex flex-col gap-1 text-[11px] font-mono";
          div.innerHTML = `
            <div class="flex justify-between items-center">
              <span class="px-2 py-0.5 rounded border text-[8px] font-bold uppercase ${typeColor}">
                <i class="${icon} mr-1"></i> ${log.type ? log.type.replace("_", " ") : "ALERT"}
              </span>
              <span class="text-[8px] text-slate-500">${log.timestamp ? log.timestamp.replace("T", " ").substring(0, 19) : "N/A"}</span>
            </div>
            <p class="text-slate-300 leading-normal text-[10.5px]">${this.escapeHTML(log.message)}</p>
          `;
          securityLogsList.appendChild(div);
        });
      }
    }
  }

  renderAdminSettings() {
    const s = this.db.settings;

    // Load Enable / Disable Toggles
    document.getElementById("sys-pay-bkash-enabled").checked = s.payBkashEnabled !== false;
    document.getElementById("sys-pay-nagad-enabled").checked = s.payNagadEnabled !== false;
    document.getElementById("sys-pay-rocket-enabled").checked = s.payRocketEnabled !== false;
    document.getElementById("sys-pay-upay-enabled").checked = s.payUpayEnabled !== false;
    document.getElementById("sys-pay-dbbl-enabled").checked = s.payDbblEnabled !== false;
    document.getElementById("sys-pay-usdt-enabled").checked = s.payUsdtEnabled !== false;
    document.getElementById("sys-pay-btc-enabled").checked = s.payBtcEnabled !== false;
    document.getElementById("sys-pay-eth-enabled").checked = s.payEthEnabled !== false;

    document.getElementById("sys-pay-bkash-personal").value = s.mobilePersonalBkash || s.mobileAgentBkash || "";
    document.getElementById("sys-pay-bkash-agent").value = s.mobileAgentBkash || "";
    document.getElementById("sys-pay-bkash-instruction").value = s.mobileInstructionBkash || "";
    
    document.getElementById("sys-pay-nagad-personal").value = s.mobilePersonalNagad || s.mobileAgentNagad || "";
    document.getElementById("sys-pay-nagad-agent").value = s.mobileAgentNagad || "";
    document.getElementById("sys-pay-nagad-instruction").value = s.mobileInstructionNagad || "";
    
    document.getElementById("sys-pay-rocket-personal").value = s.mobilePersonalRocket || s.mobileAgentRocket || "";
    document.getElementById("sys-pay-rocket-agent").value = s.mobileAgentRocket || "";
    document.getElementById("sys-pay-rocket-instruction").value = s.mobileInstructionRocket || "";
    
    document.getElementById("sys-pay-upay-personal").value = s.mobilePersonalUpay || s.mobileAgentUpay || "";
    document.getElementById("sys-pay-upay-agent").value = s.mobileAgentUpay || "";
    document.getElementById("sys-pay-upay-instruction").value = s.mobileInstructionUpay || "";
    
    document.getElementById("sys-pay-dbbl").value = s.dbblDetails || "";
    document.getElementById("sys-pay-dbbl-instruction").value = s.dbblInstruction || "";
    
    document.getElementById("sys-pay-crypto-usdt").value = s.cryptoAddressUSDT || "";
    document.getElementById("sys-pay-crypto-btc").value = s.cryptoAddressBTC || "";
    document.getElementById("sys-pay-crypto-eth").value = s.cryptoAddressETH || "";
    document.getElementById("sys-pay-crypto-qr-type").value = s.cryptoQRType || "auto";
    
    document.getElementById("sys-pay-crypto-qr-usdt").value = s.cryptoQRUrlUSDT || "";
    document.getElementById("sys-pay-crypto-qr-btc").value = s.cryptoQRUrlBTC || "";
    document.getElementById("sys-pay-crypto-qr-eth").value = s.cryptoQRUrlETH || "";
    document.getElementById("sys-pay-crypto-instruction").value = s.cryptoInstruction || "";

    // Toggle custom URLs section on render
    const customUrlsArea = document.getElementById("sys-pay-crypto-custom-urls");
    if (s.cryptoQRType === "custom") {
      customUrlsArea.classList.remove("hidden");
    } else {
      customUrlsArea.classList.add("hidden");
    }

    // Refresh Admin QR Code preview
    this.refreshAdminQRPreview();

    document.getElementById("sys-maintenance-toggle").checked = s.maintenanceMode || false;
    document.getElementById("sys-maintenance-msg").value = s.maintenanceMessage || "";
    document.getElementById("sys-app-url").value = s.forceUpdateLink || "";
    document.getElementById("sys-app-ver").value = s.appVersion || "";
    document.getElementById("sys-admin-p").value = s.adminPass || "";

    // Load Deposit Match Booster parameters
    document.getElementById("sys-dep-boost-percent").value = s.depBonusPercent || 10;
    document.getElementById("sys-dep-boost-min").value = s.depBonusMin || 500;
    document.getElementById("sys-dep-boost-toggle").checked = s.depBonusEnabled || false;
  }

  refreshAdminQRPreview() {
    const s = this.db.settings;
    const selectedCoinType = document.getElementById("admin-spa-qr-selector").value; // usdt, btc, eth
    const qrImg = document.getElementById("admin-spa-qr-preview");
    
    let activeAddress = "";
    let customQRUrl = "";

    if (selectedCoinType === "usdt") {
      activeAddress = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";
      customQRUrl = s.cryptoQRUrlUSDT;
    } else if (selectedCoinType === "btc") {
      activeAddress = s.cryptoAddressBTC || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
      customQRUrl = s.cryptoQRUrlBTC;
    } else {
      activeAddress = s.cryptoAddressETH || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      customQRUrl = s.cryptoQRUrlETH;
    }

    if (s.cryptoQRType === "custom" && customQRUrl) {
      qrImg.src = customQRUrl;
    } else {
      // Auto-generated QR via QRServer API
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeAddress)}`;
    }
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

  // Google Platform access token request
  authenticateGoogle(onSuccess) {
    if (this.googleAuthToken) {
      if (onSuccess) onSuccess();
      return;
    }

    const clientId = "537748328831-dev.apps.googleusercontent.com";
    const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly";

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scope,
      callback: (response) => {
        if (response.error !== undefined) {
          this.showToast("Google Authentication declined.", "error");
          return;
        }
        this.googleAuthToken = response.access_token;
        this.showToast("Google account successfully linked!", "success");

        // Sync visual panels
        const notAuthZone = document.getElementById("gdrive-not-auth");
        const authZone = document.getElementById("gdrive-auth-zone");
        if (notAuthZone && authZone) {
          notAuthZone.classList.add("hidden");
          authZone.classList.remove("hidden");
        }

        if (onSuccess) onSuccess();
      },
    });

    client.requestAccessToken();
  }

  // Disconnect Google account
  disconnectGoogle() {
    this.googleAuthToken = null;
    this.selectedReceiptFile = null;
    this.showToast("Google account credentials detached successfully.", "info");

    const notAuthZone = document.getElementById("gdrive-not-auth");
    const authZone = document.getElementById("gdrive-auth-zone");
    if (notAuthZone && authZone) {
      notAuthZone.classList.remove("hidden");
      authZone.classList.add("hidden");
    }
  }

  // Choose profile photo using Google Picker
  launchGooglePickerForAvatar() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            const fileId = doc[google.picker.Document.ID];
            
            // Build direct view url
            const directUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${this.googleAuthToken}`;
            
            this.currentUser.photo = directUrl;
            this.saveDB();
            this.showToast("Google Drive image assigned as profile avatar!", "success");
            this.render();
          }
        })
        .build();
      picker.setVisible(true);
    });
  }

  // Select Deposit proof receipt with Google Picker
  launchGooglePickerForReceipt() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes("image/png,image/jpeg,image/jpg,application/pdf");

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            this.selectedReceiptFile = {
              id: doc[google.picker.Document.ID],
              name: doc[google.picker.Document.NAME],
              thumb: doc[google.picker.Document.ICON_URL] || "https://img.icons8.com/color/48/000000/google-drive--v1.png"
            };

            // Display selection indicator
            const holder = document.getElementById("dep-selected-receipt-holder");
            const thumbImg = document.getElementById("dep-selected-receipt-thumb");
            const nameSpan = document.getElementById("dep-selected-receipt-name");

            thumbImg.src = this.selectedReceiptFile.thumb;
            nameSpan.innerText = this.selectedReceiptFile.name;
            holder.classList.remove("hidden");

            this.showToast("Deposit verification receipt attached!", "success");
          }
        })
        .build();
      picker.setVisible(true);
    });
  }

  // Backup logs as statements CSV file to Drive
  backupLedgersToDrive() {
    this.authenticateGoogle(() => {
      const userDepos = this.db.deposits.filter(d => d.username === this.currentUser.username);
      const userWds = this.db.withdrawals.filter(w => w.username === this.currentUser.username);

      let textContent = "Type,Amount,Gateway,TrxID/Account,Status,Date\n";
      userDepos.forEach(d => {
        textContent += `Deposit,${d.amount},${d.method},${d.trxId},${d.status},${d.date}\n`;
      });
      userWds.forEach(w => {
        textContent += `Withdrawal,${w.amount},${w.method},${w.targetAccount},${w.status},${w.date}\n`;
      });

      const fileMetadata = {
        name: `Statements_Ledger_Backups_${this.currentUser.username}.csv`,
        mimeType: 'text/csv'
      };

      const boundary = '314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: text/csv\r\n\r\n' +
        textContent +
        close_delim;

      fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.googleAuthToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      })
      .then(res => {
        if (res.ok) {
          this.showToast("Transaction history backed up securely to your Google Drive!", "success");
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        this.showToast("Failed to compile cloud file to Drive.", "error");
      });
    });
  }

  // Browse files from user's Drive folder backups
  browseDriveStatementsPicker() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      
      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            this.showToast(`Selected statement backup: ${doc[google.picker.Document.NAME]}`, "success");
          }
        })
        .build();
      picker.setVisible(true);
    });
  }
}

// Initialize Application State on DOM load
window.addEventListener("DOMContentLoaded", () => {
  const app = new StateManager();
  window.appInstance = app; // expose global handler helper

  // Setup security/blocking features as standard for high-security container app
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("selectstart", e => e.preventDefault());
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

  // User tab badge request triggers
  const profileBadgeReqBtn = document.getElementById("profile-badge-request-entry-btn");
  if (profileBadgeReqBtn) {
    profileBadgeReqBtn.addEventListener("click", () => {
      app.currentTab = "badge-request";
      app.renderDashboard();
    });
  }

  const badgeReqBackBtn = document.getElementById("badge-request-back-btn");
  if (badgeReqBackBtn) {
    badgeReqBackBtn.addEventListener("click", () => {
      app.currentTab = "profile";
      app.renderDashboard();
    });
  }

  // ---------------- PART A: USER-FACING REFER CORNER LISTENERS ----------------
  const profileReferEntryBtn = document.getElementById("profile-refer-entry-btn");
  if (profileReferEntryBtn) {
    profileReferEntryBtn.addEventListener("click", () => {
      app.currentTab = "refer";
      app.renderDashboard();
    });
  }

  const referBackBtn = document.getElementById("refer-back-btn");
  if (referBackBtn) {
    referBackBtn.addEventListener("click", () => {
      app.currentTab = "profile";
      app.renderDashboard();
    });
  }

  const copyReferCodeBtn = document.getElementById("copy-refer-code-btn");
  if (copyReferCodeBtn) {
    copyReferCodeBtn.addEventListener("click", () => {
      const code = app.currentUser.username;
      navigator.clipboard.writeText(code)
        .then(() => app.showToast("Affiliate code copied to clipboard!", "success"))
        .catch(() => {
          app.showToast(`Affiliate Code: ${code} (copied)`, "success");
        });
    });
  }

  const copyReferLinkBtn = document.getElementById("copy-refer-link-btn");
  if (copyReferLinkBtn) {
    copyReferLinkBtn.addEventListener("click", () => {
      const link = window.location.origin + "/index.html?ref=" + encodeURIComponent(app.currentUser.username);
      navigator.clipboard.writeText(link)
        .then(() => app.showToast("Quick invitation link copied!", "success"))
        .catch(() => {
          app.showToast("Link clipboard access restricted. Highlight & copy!", "info");
        });
    });
  }

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

  // User badge request submit form
  const submitBadgeReqBtn = document.getElementById("user-submit-badge-req-btn");
  if (submitBadgeReqBtn) {
    submitBadgeReqBtn.addEventListener("click", () => {
      const selectElement = document.getElementById("user-badge-req-select");
      const reasonElement = document.getElementById("user-badge-req-reason");

      if (!selectElement || !reasonElement) return;

      const requestedBadge = selectElement.value;
      const reason = reasonElement.value.trim();

      if (!reason) {
        app.showToast("Please provide a justification reason for your request.", "error");
        return;
      }

      // Check if they already have a pending or approved request for this badge
      const existing = (app.db.badgeRequests || []).find(r => r.userId === app.currentUser.id && r.requestedBadge === requestedBadge && r.status === "pending");
      if (existing) {
        app.showToast(`You already have a pending request for the ${requestedBadge.toUpperCase()} badge!`, "warning");
        return;
      }

      const activeBadge = app.currentUser.customBadge;
      if (activeBadge === requestedBadge) {
        app.showToast(`You are already assigned the ${requestedBadge.toUpperCase()} badge!`, "info");
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

      if (!app.db.badgeRequests) app.db.badgeRequests = [];
      app.db.badgeRequests.push(newReq);
      app.saveDB();

      reasonElement.value = ""; // clear textarea
      app.showToast("Your premium badge request has been successfully submitted for review!", "success");
      app.renderBadgeRequestTab();
    });
  }

  // Auth toggle
  const showRegisterBtn = document.getElementById("show-register-btn");
  const showLoginBtn = document.getElementById("show-login-btn");
  const signupBox = document.getElementById("auth-signup-box");
  const loginBox = document.getElementById("auth-login-box");

  showRegisterBtn.addEventListener("click", () => {
    loginBox.classList.add("hidden");
    signupBox.classList.remove("hidden");
  });

  showLoginBtn.addEventListener("click", () => {
    signupBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
  });

  // Login Trigger Action
  const loginForm = document.getElementById("auth-login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userVal = document.getElementById("auth-user").value.trim();
    const passVal = document.getElementById("auth-pass").value;

    // Direct check for IP ban right away
    const clientIp = await app.getClientIP();
    const bannedIPs = app.db.settings.bannedIPs || [];
    if (bannedIPs.includes(clientIp)) {
      app.showToast(`ACCESS BLOCKED: This network computer's IP (${clientIp}) is explicitly banned by operations manager.`, "error");
      return;
    }

    if (app.db.settings.vpnBlockEnabled !== false) {
      const details = await app.getIPDetails();
      if (app.isVPN(details)) {
        app.showToast(`VPN / PROXY REJECTED: VPN connection is strictly blocked. Turn off VPN & try again!`, "error");
        return;
      }
    }

    // Check for direct admin login credentials
    if (userVal.toLowerCase() === "admin" && (passVal === "Admin123" || passVal === app.db.settings.adminPass)) {
      app.isAdminMode = true;
      localStorage.setItem(app.adminSessionKey, "true");
      app.showToast("Admin access granted. Control room unlocked.", "success");
      app.render();
      return;
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
      app.showToast("This player is currently blocked under support investigation.", "error");
      return;
    }

    if (matched.status === "permanently_banned") {
      app.showToast("This account has been permanently barred by operations manager.", "error");
      return;
    }

    app.currentUser = matched;
    localStorage.setItem(app.sessionKey, JSON.stringify(matched));
    app.showToast(`Welcome back, @${matched.username}!`, "success");
    app.render();
  });

  // Sign up Trigger Action
  const registerForm = document.getElementById("auth-signup-form");
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userVal = document.getElementById("reg-user").value.trim();
    const emailVal = document.getElementById("reg-email").value.trim();
    const phoneVal = document.getElementById("reg-phone").value.trim();
    const dobVal = document.getElementById("reg-dob").value;
    const passVal = document.getElementById("reg-pass").value;
    const regionVal = document.getElementById("reg-region").value;
    const referByVal = document.getElementById("reg-refer-by").value.trim();

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

    // 2. Fetch Client IP and Check blocklists
    const clientIp = await app.getClientIP();
    const bannedIPs = app.db.settings.bannedIPs || [];
    if (bannedIPs.includes(clientIp)) {
      app.showToast(`SECURITY DETECTED: This computer's network IP (${clientIp}) has been banned!`, "error");
      return;
    }

    if (app.db.settings.vpnBlockEnabled !== false) {
      const details = await app.getIPDetails();
      if (app.isVPN(details)) {
        app.showToast(`SECURITY ALERT: VPN / Proxy detected. Sign-up is strictly forbidden. Disable VPN!`, "error");
        return;
      }
    }

    // 3. Multi-Account Restriction (1 account per IP)
    if (app.db.settings.ipPreventionEnabled !== false) {
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
      rewardedMilestones: []
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

    app.currentUser = newUser;
    localStorage.setItem(app.sessionKey, JSON.stringify(newUser));
    app.showToast(`Account registered successfully under region ${regionVal}! Enjoy ৳${welcomeBonus} Starter Wallet Bonus!`, "success");
    app.render();
  });

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

  // Log out action
  document.getElementById("profile-logout-btn").addEventListener("click", () => {
    app.currentUser = null;
    localStorage.removeItem(app.sessionKey);
    app.showToast("Logged out of player portal.", "info");
    app.render();
  });

  // Enable Notifications Button
  const enableNotifBtn = document.getElementById("enable-notif-btn");
  if (enableNotifBtn) {
    enableNotifBtn.addEventListener("click", () => {
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
    });
  }

  // Wallet Deposit Form submission routing
  const depositForm = document.getElementById("wallet-deposit-form");
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

  // Wallet Withdrawal request filing
  const withdrawForm = document.getElementById("wallet-withdraw-form");
  withdrawForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const amountVal = parseFloat(document.getElementById("wd-amount").value);
    const gateway = document.getElementById("wd-gateway").value;
    const targetVal = document.getElementById("wd-account").value.trim();

    if (amountVal < 100) {
      app.showToast("Minimum withdrawal is ৳100.", "error");
      return;
    }

    if (app.currentUser.balance < amountVal) {
      app.showToast("Insufficient purse balance for this extraction!", "error");
      return;
    }

    if (targetVal.length < 8) {
      app.showToast("Please enter a valid cash transfer recipient account.", "error");
      return;
    }

    // Process local balance block
    app.currentUser.balance -= amountVal;
    app.currentUser.profit -= amountVal;

    const newWd = {
      id: "w" + Date.now(),
      username: app.currentUser.username,
      amount: amountVal,
      method: gateway,
      targetAccount: targetVal,
      status: "pending",
      date: new Date().toISOString()
    };

    app.db.withdrawals.unshift(newWd);
    app.saveDB();

    app.showToast(`Payout request of ৳${amountVal} locked. Awaiting automated ledger dispatch.`, "success");
    app.currentTab = "history";
    app.render();

    // Reset fields
    document.getElementById("wd-amount").value = "";
    document.getElementById("wd-account").value = "";
  });

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
      
      // Inject 1.5% to jackpot settings pool
      app.db.settings.jackpotPool = (app.db.settings.jackpotPool || 84250.00) + totalCost * 0.015;

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
  document.getElementById("exit-admin-btn").addEventListener("click", () => {
    app.isAdminMode = false;
    localStorage.removeItem(app.adminSessionKey);
    app.showToast("Exited operations server space.", "info");
    app.render();
  });

  // Exit maintenance backdoor access
  document.getElementById("exit-maintenance-backdoor").addEventListener("click", openBypass);

  // Modal Editing Users Saving
  document.getElementById("admin-save-user-btn").addEventListener("click", () => {
    app.savePlayerEditFromModal();
  });

  document.getElementById("admin-close-modal-btn").addEventListener("click", () => {
    document.getElementById("admin-user-edit-modal").classList.add("hidden");
  });

  // Lottery draw trigger
  document.getElementById("admin-confirm-draw-btn").addEventListener("click", () => {
    app.executeManualDrawWinner();
  });

  document.getElementById("admin-close-draw-modal-btn").addEventListener("click", () => {
    document.getElementById("admin-draw-modal").classList.add("hidden");
    app.render();
  });

  // Create Lottery Pool Dialog Trigger
  document.getElementById("add-new-pool-master-btn").addEventListener("click", () => {
    app.populateCreatePoolCategories();
    document.getElementById("admin-create-pool-modal").classList.remove("hidden");
  });

  document.getElementById("admin-close-create-pool-modal").addEventListener("click", () => {
    document.getElementById("admin-create-pool-modal").classList.add("hidden");
  });

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

  // Save Settings forms
  const saveGatewaysForm = document.getElementById("admin-settings-gateways-form");
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

    // Legacy fallback string support
    s.cryptoAddress = s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X";

    app.saveDB();
    app.showToast("Live payment gateways and dynamic routes synchronized.", "success");
    app.render();
  });

  const saveAppConfigForm = document.getElementById("admin-settings-app-config-form");
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

    app.saveDB();
    app.showToast("Core system parameters and maintenance configs committed.", "success");
    app.render();
  });

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

  // Close details and ticket popup modals
  document.getElementById("close-lottery-details-btn").addEventListener("click", () => {
    document.getElementById("lottery-details-modal").classList.add("hidden");
  });
  
  document.getElementById("close-ticket-info-btn").addEventListener("click", () => {
    document.getElementById("ticket-info-modal").classList.add("hidden");
  });

  // Local user profile avatar photo upload input selection
  document.getElementById("profile-local-upload-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
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
  });

  // Google Picker avatar photo select button
  document.getElementById("profile-google-photo-btn").addEventListener("click", () => {
    app.launchGooglePickerForAvatar();
  });

  // Profile Edit form submitted inside SPA Tab
  document.getElementById("profile-edit-form-spa").addEventListener("submit", (e) => {
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
  });

  // Google Drive connect, disconnect and statement methods inside wallet tab
  document.getElementById("gdrive-authorize-btn").addEventListener("click", () => {
    app.authenticateGoogle();
  });

  document.getElementById("gdrive-disconnect-btn").addEventListener("click", () => {
    app.disconnectGoogle();
  });

  document.getElementById("backup-ledger-btn").addEventListener("click", () => {
    app.backupLedgersToDrive();
  });

  document.getElementById("view-backups-picker-btn").addEventListener("click", () => {
    app.browseDriveStatementsPicker();
  });

  // Deposit proof receipt selection with Google Drive Picker
  document.getElementById("dep-receipt-picker-btn").addEventListener("click", () => {
    app.launchGooglePickerForReceipt();
  });

  document.getElementById("dep-clear-receipt-btn").addEventListener("click", () => {
    app.selectedReceiptFile = null;
    document.getElementById("dep-selected-receipt-holder").classList.add("hidden");
    app.showToast("Receipt attachment removed.", "info");
  });

  // Dynamic user-side deposit channels swapper
  document.getElementById("dep-gateway").addEventListener("change", () => {
    app.updateSelectedDepositGatewayInstructions();
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
        localStorage.setItem(app.sessionKey, JSON.stringify(app.currentUser));
        
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
});
