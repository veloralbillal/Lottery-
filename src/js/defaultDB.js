/**
 * Default Database structure for the Mobile Lottery Portal.
 * Single Source of Truth Architecture: All dynamic collections (users, staff, agents,
 * lotteries, tickets, deposits, withdrawals, transactions) initialize as empty arrays
 * and are hydrated directly from the primary MySQL database.
 */

export function getDefaultDB() {
  return {
    users: [],
    staff: [],
    agents: [],
    categories: [
      { id: "c1", name: "10 Taka Banner", label: "🎟️ ৳10 Sliders", type: "single", defaultPrizes: "" },
      { id: "c2", name: "20 Taka Banner", label: "🎟️ ৳20 Sliders", type: "single", defaultPrizes: "" },
      { id: "c3", name: "Mega Jackpot", label: "💎 Jackpots", type: "single", defaultPrizes: "" },
      { id: "c4", name: "3 Winner Category", label: "👑 3 Winners Category", type: "multi", defaultPrizes: "50, 30, 20" },
      { id: "c5", name: "15 Winner Category", label: "🚀 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" },
      { id: "c6", name: "Syndicate", label: "👥 গ্রুপ লটারি (Syndicate)", type: "syndicate", defaultPrizes: "" },
      { id: "c7", name: "Quick Draw", label: "⚡ কুইক লটারি (1-Min)", type: "single", defaultPrizes: "" }
    ],
    lotteries: [],
    tickets: [],
    deposits: [],
    withdrawals: [],
    transactions: [],
    agentLedger: [],
    syndicates: [],
    communityPosts: [],
    communityComments: [],
    reports: [],
    badgeRequests: [],
    messages: [],
    taskSubmissions: [],
    dailyTasks: [],
    jackpotRegistrations: [],
    webPushAds: [],
    products: [],
    settings: {
      mobileAgentBkash: "01799228833",
      mobileAgentNagad: "01855221144",
      mobileAgentRocket: "01688554422",
      mobileAgentUpay: "01922334455",
      dbblDetails: "Rocket Wallet Agent route system. Input account numbers directly.",
      cryptoAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X",
      payZinipayEnabled: true,
      payZiniPayEnabled: true,
      zinipayApiKey: "zp_live_948275910284729104",
      zinipayMode: "live",
      zinipayBaseUrl: "https://api.zinipay.com/v1/payment/create",
      zinipayInstruction: "Pay instantly with bKash, Nagad, Rocket or Cards through ZiniPay automated gateway.",
      maintenanceMode: false,
      maintenanceMessage: "Internal server hardware upgrade and database syncing in progress. Please try again soon.",
      appVersion: "5.2.0",
      forceUpdateLink: "https://example.com/download/LotteryWinner_v5.2.apk",
      adminPass: "Admin123",
      signupBonusEnabled: true,
      signupBonus: 50,
      shopEnabled: true,
      quickDrawEnabled: false
    }
  };
}
