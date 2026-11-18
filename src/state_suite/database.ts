import { getDefaultDB } from "../js/defaultDB.js";
import { removeCircularReferences, safeStringify } from "./utils";

export interface DatabaseModule {
  dbKey: string;
  db: any;
  saveDB: () => void;
}

export function initDatabase(state: DatabaseModule) {
  let raw = localStorage.getItem(state.dbKey);
  if (!raw || raw === "undefined" || raw === "null") {
    const defaultDB = getDefaultDB();
    localStorage.setItem(state.dbKey, safeStringify(defaultDB));
    state.db = defaultDB;
  } else {
    try {
      state.db = JSON.parse(raw);
      if (state.db) {
        state.db = removeCircularReferences(state.db);
      } else {
        throw new Error("Parsed DB is null");
      }
    } catch (e) {
      console.error("Failed to parse local DB raw. Resetting to default database state.", e);
      localStorage.removeItem(state.dbKey);
      const defaultDB = getDefaultDB();
      localStorage.setItem(state.dbKey, safeStringify(defaultDB));
      state.db = defaultDB;
    }
  }

  // 🛡️ CRITICAL: Guarantee ALL collections exist to prevent crashes in render()
  if (!state.db) state.db = getDefaultDB();
  const staticMockIds = new Set([
    "u_agent_dhaka", "u_agent_sylhet", "u_mod_support",
    "u1", "u2", "u3",
    "l1", "l2", "l3", "l_quick_default",
    "t1", "t2", "t3",
    "d1", "d2", "w1",
    "syn_mock_1", "syn_mock_2"
  ]);
  
  const collections = ['users', 'staff', 'agents', 'lotteries', 'tickets', 'deposits', 'withdrawals', 'categories', 'syndicates', 'communityPosts', 'communityComments', 'reports', 'badgeRequests', 'messages', 'taskSubmissions', 'dailyTasks', 'jackpotRegistrations', 'transactions', 'spinHistory', 'securityLogs', 'securityRateLimits', 'pendingAdminToasts', 'webPushAds', 'videoBounties'];
  
  collections.forEach(col => {
    if (!state.db[col]) state.db[col] = [];
  });

  state.db.users = state.db.users.filter((u: any) => u && !staticMockIds.has(u.id));
  state.db.staff = state.db.staff.filter((s: any) => s && !staticMockIds.has(s.id));
  state.db.agents = state.db.agents.filter((a: any) => a && !staticMockIds.has(a.id));
  state.db.lotteries = state.db.lotteries.filter((l: any) => l && !staticMockIds.has(l.id));
  state.db.tickets = state.db.tickets.filter((t: any) => t && !staticMockIds.has(t.id));
  state.db.deposits = state.db.deposits.filter((d: any) => d && !staticMockIds.has(d.id));
  state.db.withdrawals = state.db.withdrawals.filter((w: any) => w && !staticMockIds.has(w.id));
  
  if (!state.db.settings) state.db.settings = (getDefaultDB() as any).settings || {};
  
  if (!state.db.settings.twoFactorAuth) {
    state.db.settings.twoFactorAuth = {
      enabled: false,
      pin: "829401",
      backupCodes: ["LW-9821", "LW-4412", "LW-7729", "LW-3184", "LW-5590"],
      usedBackupCodes: [],
      enforceOnLogin: true,
      enforceOnWithdraw: true,
      enforceOnCredentials: true,
      enforceOnFinance: true
    };
  }
  
  if (!state.db.settings.rateLimitPolicy) {
    state.db.settings.rateLimitPolicy = {
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      maxRegistrationAttempts: 5,
      maxSensitiveReqPerMin: 10
    };
  }

  // Ensure all users, staff, and agents have non-null email and password for SQL bulk-sync
  [state.db.users, state.db.staff, state.db.agents].forEach((arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((item: any) => {
        if (item) {
          if (!item.email) item.email = `${item.username || item.id || 'user'}@lotterywinner.app`;
          if (!item.password) item.password = "password123";
        }
      });
    }
  });

  if (state.db.syndicates) {
    state.db.syndicates.forEach((s: any) => {
      if (!s.joinedUserIds) s.joinedUserIds = [];
      if (!s.joinedUsernames) s.joinedUsernames = [];
    });
  }

  // Ensure all existing lotteries have valid, clean details and descriptions
  if (state.db && Array.isArray(state.db.lotteries)) {
    let lotteriesCleaned = false;
    state.db.lotteries.forEach((l: any) => {
      if (!l) return;
      const raw = l.details;
      if (!raw || raw === "undefined" || raw === "null" || (typeof raw === "string" && raw.trim() === "")) {
        if (l.description && l.description !== "undefined" && l.description !== "null" && String(l.description).trim() !== "") {
          l.details = String(l.description).trim();
        } else {
          l.details = `Exclusive \u09f3${l.entryFee || 10} lottery draw pool. The lucky winner receives \u09f3${(l.prizeAmount || l.prizePool || 0).toLocaleString()}!`;
        }
        lotteriesCleaned = true;
      }
      if (!l.description || l.description === "undefined" || l.description === "null") {
        l.description = l.details;
        lotteriesCleaned = true;
      }
    });
    if (lotteriesCleaned) {
      state.saveDB();
    }
  }

  // Settings defaults
  const s = state.db.settings;
  if (s.quickDrawEnabled === undefined) s.quickDrawEnabled = false;
  if (s.mirofishEnabled === undefined) s.mirofishEnabled = true;
  if (s.mirofishChatEnabled === undefined) s.mirofishChatEnabled = true;
  if (s.ipPreventionEnabled === undefined) s.ipPreventionEnabled = true;
  if (s.vpnBlockEnabled === undefined) s.vpnBlockEnabled = true;
  if (!s.bannedIPs) s.bannedIPs = [];
  if (!s.allowedRegions) s.allowedRegions = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"];
  if (!s.bannedRegions) s.bannedRegions = ["Barisal"];
  if (!s.ogSettings) s.ogSettings = { title: "Mobile Lottery Portal", description: "Join the best lottery experience.", image: "https://example.com/logo.jpg" };
  if (!s.milestoneLevels) s.milestoneLevels = [
    { title: "Bronze Recruiter", count: 3, reward: 50 },
    { title: "Silver Partner", count: 8, reward: 150 },
    { title: "Gold Ambassador", count: 20, reward: 500 },
    { title: "Supreme Influencer", count: 50, reward: 1500 }
  ];
  if (!s.popupEvent) s.popupEvent = { enabled: true, title: "Eid Mega Draw Festival! \ud83c\udf89", message: "Deposit \u09f3500 or more today and get a free Ticket to the \u09f3100,000 Eid Pool!", imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop", actionText: "Claim Bonus", actionLink: "wallet" };
  if (!s.bannerSlides || s.bannerSlides.length === 0) s.bannerSlides = [
    { id: "b1", title: "Super Fast Payouts In 5 Minutes! \u26a1", subtitle: "bKash, Nagad, Rocket & Crypto USDT - 0% Fee Instant Cashout", imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=800&auto=format&fit=crop", link: "wallet" },
    { id: "b2", title: "Earn 10% Referral Lifetime Bonus! \ud83d\udc65", subtitle: "\u09ac\u09a8\u09cd\u09a7\u09c1\u09a6\u09c7\u09b0 \u0987\u09a8\u09ad\u09be\u0987\u099f \u0995\u09b0\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u09be\u09a8 \u0986\u099c\u09c0\u09ac\u09a8 \u09e7\u09e6% \u0986\u09a8\u09b2\u09bf\u09ae\u09bf\u099f\u09c7\u09a1 \u0995\u09ae\u09bf\u09b6\u09a8!", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop", link: "refer" }
  ];

  state.db.users.forEach(u => {
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

  if (s.vipTiers === undefined) s.vipTiers = [
    { id: "vip_1", title: "Bronze VIP 1", price: 100, multiplier: 1.05, discount: 3, bonus: 5 },
    { id: "vip_2", title: "Silver VIP 2", price: 250, multiplier: 1.10, discount: 5, bonus: 15 },
    { id: "vip_3", title: "Gold VIP 3", price: 500, multiplier: 1.20, discount: 8, bonus: 40 },
    { id: "vip_4", title: "Platinum VIP 4", price: 1000, multiplier: 1.35, discount: 12, bonus: 100 },
    { id: "vip_5", title: "Crown VIP 5", price: 2500, multiplier: 1.60, discount: 20, bonus: 300 }
  ];
  if (s.spinPrice === undefined) s.spinPrice = 50;
  if (s.checkinRewards === undefined) s.checkinRewards = [2, 4, 6, 8, 10, 15, 25];
  if (s.jackpotPool === undefined) s.jackpotPool = 84250.00;
  if (s.jackpotTicketCost === undefined) s.jackpotTicketCost = 20.00;
  if (!s.jackpotExpiry) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    s.jackpotExpiry = tomorrow.toISOString().slice(0, 16);
  }

  if (state.db.categories.length === 0) {
    state.db.categories = [
      { id: "c1", name: "10 Taka Banner", label: "\ud83c\udf9f\ufe0f \u09f310 Sliders", type: "single", defaultPrizes: "" },
      { id: "c2", name: "20 Taka Banner", label: "\ud83c\udf9f\ufe0f \u09f320 Sliders", type: "single", defaultPrizes: "" },
      { id: "c3", name: "Mega Jackpot", label: "\ud83d\udc8e Jackpots", type: "single", defaultPrizes: "" },
      { id: "c4", name: "3 Winner Category", label: "\ud83d\udc51 3 Winners Category", type: "multi", defaultPrizes: "50, 30, 20" },
      { id: "c5", name: "15 Winner Category", label: "\ud83d\ude80 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" },
      { id: "c6", name: "Syndicate", label: "\ud83d\udc65 \u0997\u09cd\u09b0\u09c1\u09aa \u09b2\u099f\u09be\u09b0\u09bf (Syndicate)", type: "syndicate", defaultPrizes: "" },
      { id: "c7", name: "Quick Draw", label: "\u26a1 \u0995\u09c1\u0987\u0995 \u09b2\u099f\u09be\u09b0\u09bf (1-Min)", type: "single", defaultPrizes: "" }
    ];
  }

  // Admin and Payment Defaults
  if (s.adminPass === "admin123" || !s.adminPass) s.adminPass = "Admin123";
  if (s.payCryptomusEnabled === undefined) s.payCryptomusEnabled = true;
  if (s.payUddoktapayEnabled === undefined) s.payUddoktapayEnabled = true;
  if (s.payZinipayEnabled === undefined) s.payZinipayEnabled = true;
  if (s.payBkashPgwEnabled === undefined) s.payBkashPgwEnabled = true;
  if (s.payNagadPgwEnabled === undefined) s.payNagadPgwEnabled = true;
  
  // SQL Bridge Node configuration (Primary + Backup Load-Balanced Cluster)
  state.db.syncNodes = [
    {
      id: "node-sql",
      name: "MySQL Primary Cluster (veloralb_lottery)",
      type: "sql",
      endpoint: "https://api.veloralbillal.top/db_bridge.php",
      priority: 1,
      status: "connected",
      latency: 12,
      active: true,
      mode: "dual_sync",
      description: "cPanel Primary MySQL Database (veloralb_lottery) via Bridge API.",
      tier: "premium",
      sqlHost: "localhost",
      sqlPort: "3306",
      sqlUser: "veloralb_billal",
      sqlDb: "veloralb_lottery"
    },
    {
      id: "node-sql-backup",
      name: "MySQL Backup & LB Replica (veloralb_Lotto)",
      type: "sql",
      endpoint: "localhost:3306/veloralb_Lotto",
      priority: 2,
      status: "standby",
      latency: 14,
      active: false,
      mode: "active_sync",
      description: "Backup MySQL Replica & Read Load-Balancing Node (veloralb_Lotto).",
      tier: "premium",
      sqlHost: "localhost",
      sqlPort: "3306",
      sqlUser: "veloralb_billal",
      sqlDb: "veloralb_Lotto"
    }
  ];

  if (!state.db.sqlDbConfig) {
    state.db.sqlDbConfig = {
      host: "https://api.veloralbillal.top/db_bridge.php",
      port: "3306",
      database: "veloralb_lottery",
      username: "veloralb_billal",
      password: "Z3[9T*x39URzna",
      autoSync: true,
      activeEngine: "mysql",
      lastSyncTime: new Date().toISOString(),
      syncStatus: "synced"
    };
  }

  if (!state.db.backupSqlConfig) {
    state.db.backupSqlConfig = {
      enabled: true,
      host: "localhost",
      port: "3306",
      database: "veloralb_Lotto",
      username: "veloralb_billal",
      password: "Z3[9T*x39URzna",
      bridgeUrl: "",
      syncStatus: "standby"
    };
  }
}
