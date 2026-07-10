/**
 * Default Database structure for the Mobile Lottery Portal.
 * Separated to keep the codebase modular, neat, and highly maintainable.
 */

export function getDefaultDB() {
  return {
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
      },
      {
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
      },
      {
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
      },
      {
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
}
