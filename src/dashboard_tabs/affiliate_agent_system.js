/**
 * Lottery Winner - Tiered Affiliate Agent & Sub-Agent System
 * 
 * Manages Level 1 and Level 2 downlines, computes real-time ticket-sale commissions,
 * and processes commission payout transfers & withdrawals.
 */

export class AffiliateAgentSystem {
  static expandedL1Nodes = new Set();

  static init(appInstance) {
    console.log("Tiered Affiliate Agent & Sub-Agent System Initialized.");
    this.setupListeners(appInstance);
  }

  static setupListeners(appInstance) {
    // Handle toggle expand of Level 1 downline nodes
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".toggle-l2-btn");
      if (toggleBtn) {
        const username = toggleBtn.getAttribute("data-username");
        if (this.expandedL1Nodes.has(username)) {
          this.expandedL1Nodes.delete(username);
        } else {
          this.expandedL1Nodes.add(username);
        }
        this.render(appInstance);
        return;
      }

      // Handle payout maximum click
      const maxBtn = e.target.closest("#affiliate-payout-max-btn");
      if (maxBtn) {
        const purseEl = document.getElementById("affiliate-available-purse");
        if (purseEl) {
          const purseValStr = purseEl.innerText.replace("৳", "").replace(/,/g, "");
          const purseVal = parseFloat(purseValStr) || 0;
          const inputEl = document.getElementById("affiliate-payout-amount");
          if (inputEl) {
            inputEl.value = Math.floor(purseVal);
          }
        }
        return;
      }

      // Handle payout submission
      const submitBtn = e.target.closest("#affiliate-submit-payout-btn");
      if (submitBtn) {
        this.handleSubmitPayout(appInstance);
        return;
      }

      // Handle payout simulated approval/rejection (for interactive testing)
      const approveBtn = e.target.closest(".simulate-approve-payout-btn");
      if (approveBtn) {
        const payoutId = approveBtn.getAttribute("data-id");
        this.simulatePayoutStatus(appInstance, payoutId, "approved");
        return;
      }

      const rejectBtn = e.target.closest(".simulate-reject-payout-btn");
      if (rejectBtn) {
        const payoutId = rejectBtn.getAttribute("data-id");
        this.simulatePayoutStatus(appInstance, payoutId, "rejected");
        return;
      }
    });
  }

  /**
   * Evaluates the tiered affiliate statistics
   */
  static getAffiliateData(appInstance) {
    const db = appInstance.db;
    const currentUser = appInstance.currentUser;
    if (!db || !currentUser) {
      return {
        level1Users: [],
        level2UsersMap: {},
        totalNetworkSize: 0,
        level1Comm: 0,
        level2Comm: 0,
        totalComm: 0,
        totalPayoutsApproved: 0,
        totalPayoutsPending: 0,
        availableWallet: 0,
        payouts: []
      };
    }

    // 1. Get Level 1 Users (direct referrals)
    // We look at all users who have referredBy equal to current username, OR who are in referredUsers.
    const directUsernames = new Set();
    if (currentUser.referredUsers) {
      currentUser.referredUsers.forEach(r => directUsernames.add(r.username.toLowerCase()));
    }

    const level1Users = db.users.filter(u => {
      if (u.username.toLowerCase() === currentUser.username.toLowerCase()) return false;
      return (u.referredBy && u.referredBy.toLowerCase() === currentUser.username.toLowerCase()) || 
             directUsernames.has(u.username.toLowerCase());
    });

    // Ensure we track directUsernames accurately for Level 2 lookups
    const l1LowerUsernames = level1Users.map(u => u.username.toLowerCase());

    // 2. Get Level 2 Users (indirect referrals) grouped by Level 1 parent
    const level2UsersMap = {};
    level1Users.forEach(l1User => {
      level2UsersMap[l1User.username] = [];
    });

    db.users.forEach(u => {
      if (!u.referredBy) return;
      const parentLower = u.referredBy.toLowerCase();
      if (parentLower === currentUser.username.toLowerCase()) return; // Skip direct L1s

      const matchedL1 = level1Users.find(l1 => l1.username.toLowerCase() === parentLower);
      if (matchedL1) {
        level2UsersMap[matchedL1.username].push(u);
      }
    });

    // 3. Gather tickets to compute commissions
    const tickets = db.tickets || [];
    const lotteries = db.lotteries || [];

    // Map lottery ID to entry fee for fast lookup
    const lotteryFees = {};
    lotteries.forEach(l => {
      lotteryFees[l.id] = parseFloat(l.entryFee || 100);
    });

    let level1Comm = 0;
    let level2Comm = 0;

    // Commission Rates
    const l1RatePct = (currentUser.commissionRate !== undefined) ? parseFloat(currentUser.commissionRate) : 5.0;
    const l2RatePct = 2.0; // Fixed 2% Level 2 commission

    // Track ticket aggregations per user
    const l1Stats = {};
    const l2Stats = {};

    level1Users.forEach(u => {
      l1Stats[u.id] = { ticketsCount: 0, spent: 0, comm: 0 };
    });

    Object.keys(level2UsersMap).forEach(parentKey => {
      level2UsersMap[parentKey].forEach(u => {
        l2Stats[u.id] = { ticketsCount: 0, spent: 0, comm: 0 };
      });
    });

    // Iterate through all tickets
    tickets.forEach(t => {
      const fee = lotteryFees[t.lotteryId] || 100;
      
      // Level 1 ticket commission
      if (l1Stats[t.userId] !== undefined) {
        l1Stats[t.userId].ticketsCount++;
        l1Stats[t.userId].spent += fee;
        const comm = fee * (l1RatePct / 100);
        l1Stats[t.userId].comm += comm;
        level1Comm += comm;
      }
      
      // Level 2 ticket commission
      if (l2Stats[t.userId] !== undefined) {
        l2Stats[t.userId].ticketsCount++;
        l2Stats[t.userId].spent += fee;
        
        // Find parent sub-agent to compute exact override split, fallback to fixed l2RatePct (2.0%)
        const l2User = db.users.find(u => u.id === t.userId);
        let overrideRate = l2RatePct;
        if (l2User && l2User.referredBy) {
          const subAgent = db.users.find(u => u.username.toLowerCase() === l2User.referredBy.toLowerCase() && u.role === "subagent");
          if (subAgent) {
            overrideRate = Math.max(0, l1RatePct - (subAgent.commissionRate || 3.0));
          }
        }

        const comm = fee * (overrideRate / 100);
        l2Stats[t.userId].comm += comm;
        level2Comm += comm;
      }
    });

    // 4. Calculate payouts from db.affiliatePayouts
    const payouts = (db.affiliatePayouts || []).filter(p => p.username.toLowerCase() === currentUser.username.toLowerCase());
    const totalPayoutsApproved = payouts.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
    const totalPayoutsPending = payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

    const totalComm = level1Comm + level2Comm;
    const availableWallet = Math.max(0, totalComm - totalPayoutsApproved - totalPayoutsPending);

    // Flat network size count
    let level2Count = 0;
    Object.keys(level2UsersMap).forEach(k => {
      level2Count += level2UsersMap[k].length;
    });
    const totalNetworkSize = level1Users.length + level2Count;

    return {
      level1Users,
      level2UsersMap,
      l1Stats,
      l2Stats,
      totalNetworkSize,
      level1Comm,
      level2Comm,
      totalComm,
      totalPayoutsApproved,
      totalPayoutsPending,
      availableWallet,
      payouts
    };
  }

  static render(appInstance) {
    const data = this.getAffiliateData(appInstance);

    // Update the dynamic stat labels
    const sizeEl = document.getElementById("affiliate-network-size");
    const earnedEl = document.getElementById("affiliate-total-earned");
    const paidEl = document.getElementById("affiliate-payouts-total");
    const purseEl = document.getElementById("affiliate-available-purse");

    if (sizeEl) sizeEl.innerText = `${data.totalNetworkSize} Player${data.totalNetworkSize !== 1 ? 's' : ''}`;
    if (earnedEl) earnedEl.innerText = "৳" + data.totalComm.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (paidEl) paidEl.innerText = "৳" + data.totalPayoutsApproved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (purseEl) purseEl.innerText = "৳" + data.availableWallet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Render tree nodes
    const treeRoot = document.getElementById("affiliate-tree-root");
    if (treeRoot) {
      treeRoot.innerHTML = "";
      if (data.level1Users.length === 0) {
        treeRoot.innerHTML = `
          <div class="text-center py-4 text-slate-550 text-[10px] font-sans">
            <i class="fa-solid fa-users-slash text-slate-650 text-base mb-1 block"></i>
            You do not have any referred players yet. Invite friends using your referral link!
          </div>
        `;
      } else {
        data.level1Users.forEach(u1 => {
          const stats = data.l1Stats[u1.id] || { ticketsCount: 0, spent: 0, comm: 0 };
          const subagents = data.level2UsersMap[u1.username] || [];
          const isExpanded = this.expandedL1Nodes.has(u1.username);

          const l1Card = document.createElement("div");
          l1Card.className = "bg-slate-950/70 p-3 rounded-2xl border border-slate-900 space-y-2";
          
          let l1Content = `
            <div class="flex items-center justify-between">
              <div>
                <span class="text-white font-black text-xs">@${appInstance.escapeHTML(u1.username)}</span>
                <span class="bg-indigo-950 text-indigo-400 border border-indigo-900 px-1 py-0.5 rounded text-[7px] uppercase font-bold ml-1.5">Direct L1</span>
                <span class="block text-[8px] text-slate-500 mt-0.5">Joined: ${u1.joinDate || 'N/A'} • Status: <span class="${u1.status === 'active' ? 'text-emerald-400' : 'text-rose-400'} font-black">${u1.status.toUpperCase()}</span></span>
              </div>
              <div class="text-right flex items-center gap-2">
                <div class="mr-1">
                  <span class="block text-[7px] text-slate-550 uppercase">Earned L1 (5%)</span>
                  <span class="text-emerald-400 text-[11px] font-black">৳${stats.comm.toFixed(2)}</span>
                </div>
                ${subagents.length > 0 ? `
                  <button class="toggle-l2-btn px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[8px] font-black text-cyan-400 flex items-center gap-1 cursor-pointer" data-username="${appInstance.escapeHTML(u1.username)}">
                    <i class="fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'}"></i>
                    ${subagents.length} Downline${subagents.length > 1 ? 's' : ''}
                  </button>
                ` : `
                  <span class="px-2 py-1 rounded-lg bg-slate-900/40 border border-slate-950 text-[7px] font-semibold text-slate-600 uppercase">0 Downlines</span>
                `}
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] text-slate-400 bg-slate-900/40 px-2 py-1.5 rounded-lg border border-slate-950/50">
              <span>Tickets Bought: <strong class="text-white">${stats.ticketsCount}</strong></span>
              <span>Total Volume: <strong class="text-cyan-400">৳${stats.spent}</strong></span>
            </div>
          `;

          // If L2 expanded, append subagent node list
          if (isExpanded && subagents.length > 0) {
            let l2ListHtml = `
              <div class="pl-4 mt-2 border-l border-dashed border-slate-800 space-y-1.5 pt-1">
                <span class="block text-[7px] text-slate-500 uppercase font-black tracking-wider"><i class="fa-solid fa-turn-up rotate-90 inline-block mr-1"></i> Level 2 Sub-Agents</span>
            `;

            subagents.forEach(u2 => {
              const stats2 = data.l2Stats[u2.id] || { ticketsCount: 0, spent: 0, comm: 0 };
              l2ListHtml += `
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-850 flex justify-between items-center text-[9px]">
                  <div>
                    <span class="text-slate-300 font-bold">@${appInstance.escapeHTML(u2.username)}</span>
                    <span class="block text-[7px] text-slate-500">Joined: ${u2.joinDate || 'N/A'} • Status: <span class="${u2.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}">${u2.status}</span></span>
                  </div>
                  <div class="flex gap-4 items-center">
                    <div class="text-[8px] text-slate-400 text-right">
                      <span>Purchased: <strong class="text-white">${stats2.ticketsCount}</strong></span>
                      <span class="block">Vol: <strong class="text-cyan-400">৳${stats2.spent}</strong></span>
                    </div>
                    <div class="text-right">
                      <span class="block text-[7px] text-slate-550 uppercase">Earn L2 (2%)</span>
                      <strong class="text-emerald-400 font-black">৳${stats2.comm.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              `;
            });

            l2ListHtml += `</div>`;
            l1Content += l2ListHtml;
          }

          l1Card.innerHTML = l1Content;
          treeRoot.appendChild(l1Card);
        });
      }
    }

    // Render payout log history
    const logsRoot = document.getElementById("affiliate-payout-logs");
    if (logsRoot) {
      logsRoot.innerHTML = "";
      if (data.payouts.length === 0) {
        logsRoot.innerHTML = `
          <div class="text-[8px] text-slate-600 text-center py-6">
            No payout activities recorded yet.
          </div>
        `;
      } else {
        const sortedPayouts = [...data.payouts].sort((a,b) => b.id.localeCompare(a.id));
        sortedPayouts.forEach(p => {
          const logCard = document.createElement("div");
          logCard.className = "bg-slate-900 p-2 rounded-xl border border-slate-850/70 text-[9px] flex justify-between items-center";
          
          let statusColor = "text-amber-400 bg-amber-950/20 border-amber-900/50";
          if (p.status === "approved") statusColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/50";
          if (p.status === "rejected") statusColor = "text-rose-400 bg-rose-950/20 border-rose-900/50";

          logCard.innerHTML = `
            <div>
              <div class="flex items-center gap-1.5">
                <strong class="text-white">৳${p.amount}</strong>
                <span class="text-[7px] text-slate-500 uppercase">${p.gateway}</span>
              </div>
              <span class="block text-[7px] text-slate-500">${p.date ? p.date.substring(0, 16).replace("T", " ") : 'N/A'}</span>
              ${p.account ? `<span class="block text-[7px] text-cyan-500 font-bold">Acct: ${appInstance.escapeHTML(p.account)}</span>` : ''}
            </div>
            <div class="flex items-center gap-1">
              <span class="px-1.5 py-0.5 rounded text-[7px] uppercase border ${statusColor} font-black">${p.status.toUpperCase()}</span>
              ${p.status === "pending" ? `
                <div class="flex gap-1 ml-1.5">
                  <button class="simulate-approve-payout-btn px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[7px] font-bold cursor-pointer" data-id="${p.id}" title="Simulate Approve">Approve</button>
                  <button class="simulate-reject-payout-btn px-1.5 py-0.5 bg-rose-500 text-white rounded text-[7px] font-bold cursor-pointer" data-id="${p.id}" title="Simulate Decline">Reject</button>
                </div>
              ` : ''}
            </div>
          `;
          logsRoot.appendChild(logCard);
        });
      }
    }
  }

  static handleSubmitPayout(appInstance) {
    const gatewayEl = document.getElementById("affiliate-payout-gateway");
    const accountEl = document.getElementById("affiliate-payout-account");
    const amountEl = document.getElementById("affiliate-payout-amount");

    if (!gatewayEl || !amountEl) return;

    const gateway = gatewayEl.value;
    const account = accountEl ? accountEl.value.trim() : "";
    const amount = parseFloat(amountEl.value) || 0;

    const stats = this.getAffiliateData(appInstance);

    if (amount < 50) {
      appInstance.showToast("Minimum affiliate cashout is ৳50.00!", "error");
      return;
    }

    if (amount > stats.availableWallet) {
      appInstance.showToast(`Insufficient commission wallet. Available: ৳${stats.availableWallet.toFixed(2)}`, "error");
      return;
    }

    if (gateway !== "transfer" && !account) {
      appInstance.showToast("Account number is required for mobile wallet payouts!", "error");
      return;
    }

    const currentUser = appInstance.currentUser;

    // Create the Payout Record
    const payoutId = "pay_" + Date.now() + "_" + Math.floor(Math.random() * 99);
    const isInstant = gateway === "transfer";

    const newPayout = {
      id: payoutId,
      username: currentUser.username,
      gateway: gateway,
      account: isInstant ? "" : account,
      amount: amount,
      status: isInstant ? "approved" : "pending",
      date: new Date().toISOString()
    };

    if (!appInstance.db.affiliatePayouts) appInstance.db.affiliatePayouts = [];
    appInstance.db.affiliatePayouts.push(newPayout);

    if (isInstant) {
      // Credit directly to player balance
      currentUser.balance = (currentUser.balance || 0) + amount;
      
      // Save Transaction Ledger
      if (!appInstance.db.ledgers) appInstance.db.ledgers = [];
      appInstance.db.ledgers.push({
        id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 100),
        username: currentUser.username,
        type: "deposit",
        amount: amount,
        date: new Date().toISOString(),
        description: `Instant Transfer from Affiliate Commission Balance`
      });

      appInstance.showToast(`Successfully transferred ৳${amount.toFixed(2)} directly into your active balance!`, "success");
    } else {
      appInstance.showToast(`Affiliate payout request of ৳${amount.toFixed(2)} submitted successfully!`, "success");
    }

    // Reset input
    amountEl.value = "";
    if (accountEl) accountEl.value = "";

    // Save and re-render
    appInstance.saveDB();
    appInstance.render();
  }

  static simulatePayoutStatus(appInstance, payoutId, outcome) {
    const db = appInstance.db;
    if (!db || !db.affiliatePayouts) return;

    const payoutIndex = db.affiliatePayouts.findIndex(p => p.id === payoutId);
    if (payoutIndex === -1) return;

    const payout = db.affiliatePayouts[payoutIndex];
    if (payout.status !== "pending") return;

    payout.status = outcome;

    if (outcome === "approved") {
      // If approved, show general bKash / Nagad confirmation message
      const autoNotice = {
        id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
        recipientType: "specific",
        targetUsername: payout.username,
        category: "bonus",
        subject: `✅ Affiliate Payout Approved: ৳${payout.amount}!`,
        content: `Your commission cashout request of ৳${payout.amount} via ${payout.gateway.toUpperCase()} has been successfully processed and disbursed to your account: ${payout.account}!`,
        date: new Date().toISOString(),
        readBy: []
      };
      if (!db.messages) db.messages = [];
      db.messages.push(autoNotice);
      appInstance.showToast(`Simulated payout approval: ৳${payout.amount} has been approved!`, "success");
    } else {
      appInstance.showToast(`Simulated payout rejection: ৳${payout.amount} has been rejected.`, "info");
    }

    appInstance.saveDB();
    appInstance.render();
  }
}
