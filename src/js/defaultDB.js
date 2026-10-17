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
    blogs: [
      {
        id: "blog-1",
        title: "How to Win Mega Progressive Jackpot: Pro Strategies & Tips",
        category: "Lottery Tips",
        author: "Admin Editorial",
        date: "2026-10-16",
        readTime: "4 min read",
        views: 1420,
        likes: 389,
        image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60",
        excerpt: "Discover the proven mathematical patterns, ticket timing strategies, and Syndicate pool tactics used by top winners to secure massive jackpots.",
        content: "Winning the Mega Progressive Jackpot requires more than just luck—it requires strategic timing and smart bankroll management. Here are the top 3 strategies used by our leading champions:\n\n1. **Syndicate Pool Collaboration**: Joining or creating a syndicate allows you to pool funds with trusted friends, purchasing more tickets across multiple draw slots without breaking your personal budget.\n\n2. **Timing Your Entries**: Entering active pools during high-activity hours when the progressive multiplier increases ensures maximum return on your ৳20 ticket investment.\n\n3. **Diversified Ticket Selection**: Instead of concentrating all entries on a single draw, spread your tickets across ৳10 Sliders, ৳20 Sliders, and Mega Jackpots to balance win frequency with high payout ceilings."
      },
      {
        id: "blog-2",
        title: "@arif_99 Wins ৳25,000 Grand Prize in Record Time!",
        category: "Winners Stories",
        author: "Community Editor",
        date: "2026-10-15",
        readTime: "3 min read",
        views: 980,
        likes: 245,
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60",
        excerpt: "Read how @arif_99 used the Daily Check-in bonus and a single ৳20 ticket to claim the ৳25,000 Mega Jackpot prize yesterday afternoon.",
        content: "Yesterday marked another milestone for our community as user **@arif_99** claimed the prestigious **৳25,000 Grand Prize** from the Mega Progressive Jackpot pool!\n\nWhen interviewed, Arif shared his secret: *'I always claim my daily check-in bonus every morning. I used today's free bonus to grab a ticket on the Mega Jackpot pool, and within minutes, the live draw ticker announced my win! Instant cashout to my bKash account was processed in under 2 minutes.'*\n\nCongratulations to Arif from all of us at Mobile Lottery Portal!"
      },
      {
        id: "blog-3",
        title: "Instant Cashout Update: Zero Fee Withdrawals Now Live for bKash & Nagad",
        category: "Platform Updates",
        author: "System Administrator",
        date: "2026-10-14",
        readTime: "2 min read",
        views: 2150,
        likes: 512,
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60",
        excerpt: "We are thrilled to announce 0% fee instant withdrawals for bKash, Nagad, Rocket, and Crypto USDT channels with automated approval.",
        content: "To give back to our loyal community, our engineering team has successfully deployed the new **Fast Taka Cashout** gateway infrastructure.\n\n- **0% Withdrawal Fees**: Enjoy fee-free cashouts on all bKash and Nagad transactions.\n- **Instant Approval**: Payout requests are verified and disbursed automatically within minutes 24/7.\n- **Enhanced Security**: 4-digit PIN locks protect every cashout request."
      }
    ],
    blogCategories: [
      { id: "bcat-1", name: "Lottery Tips", slug: "lottery-tips", description: "Pro mathematical patterns & draw strategies" },
      { id: "bcat-2", name: "Winners Stories", slug: "winners-stories", description: "Interviews with jackpot champions" },
      { id: "bcat-3", name: "Platform Updates", slug: "platform-updates", description: "Gateway upgrades, cashouts & fee alerts" },
      { id: "bcat-4", name: "Guides", slug: "guides", description: "Step-by-step app walkthroughs" }
    ],
    blogComments: [
      { id: "comm-1", blogId: "blog-1", username: "rafiq_21", text: "Very helpful tips! Thanks admin.", date: "2026-10-16", status: "approved" },
      { id: "comm-2", blogId: "blog-2", username: "arif_99", text: "Thank you! Still can't believe I won!", date: "2026-10-15", status: "approved" }
    ],
    reports: [],
    badgeRequests: [],
    messages: [],
    taskSubmissions: [],
    agentChats: [],
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
      quickDrawEnabled: false,
      ogSettings: {
        title: "Mobile Lottery Portal",
        description: "Join the best lottery experience.",
        image: "https://example.com/logo.jpg"
      }
    }
  };
}
