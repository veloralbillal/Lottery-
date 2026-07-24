/**
 * Lottery Winner - History & Community Module (history.js)
 * 
 * Manages standard community spaces, likes/dislikes, filter queries,
 * and listing dynamic comments/ledgers. Included advanced stats, filters,
 * searches, and secure receipt modal invoice generators.
 */

export class HistoryTab {
  static init(appInstance) {
    console.log("History Tab Module initialized successfully.");

    // Event delegation on the document level for advanced ledger operations
    document.addEventListener("input", (e) => {
      if (e.target.id === "ledger-search-input") {
        HistoryTab.render(appInstance);
      }
    });

    document.addEventListener("change", (e) => {
      if (e.target.id === "ledger-filter-type" || e.target.id === "ledger-filter-status") {
        HistoryTab.render(appInstance);
      }
    });

    // Close Receipt Modal
    document.addEventListener("click", (e) => {
      if (e.target.closest("#ledger-receipt-close-btn")) {
        const modal = document.getElementById("ledger-receipt-modal");
        if (modal) modal.classList.add("hidden");
        return;
      }

      // Close if click is outside modal card (backdrop click)
      const modal = document.getElementById("ledger-receipt-modal");
      if (modal && e.target === modal) {
        modal.classList.add("hidden");
        return;
      }

      // Copy reference button
      if (e.target.closest("#receipt-copy-ref-btn")) {
        const refEl = document.getElementById("receipt-reference");
        if (refEl) {
          const text = refEl.innerText || "";
          navigator.clipboard.writeText(text).then(() => {
            appInstance.showToast("Transaction reference copied to clipboard!", "success");
          }).catch(() => {
            appInstance.showToast("Failed to copy reference code.", "error");
          });
        }
        return;
      }

      // Download/Save receipt slip
      if (e.target.closest("#receipt-download-btn")) {
        const amount = document.getElementById("receipt-amount")?.innerText || "৳0.00";
        const type = document.getElementById("receipt-type")?.innerText || "N/A";
        const method = document.getElementById("receipt-method")?.innerText || "N/A";
        const ref = document.getElementById("receipt-reference")?.innerText || "N/A";
        const date = document.getElementById("receipt-date")?.innerText || "N/A";

        const textSlip = `
=== LOTTERY WINNER PORTAL ===
TRANSACTION INVOICE RECEIPT
=============================
Amount: ${amount}
Type: ${type}
Channel/Method: ${method}
Reference TRX: ${ref}
Date/Time: ${date}
Gateway Fee: ৳0.00 (Free)
=============================
Status: SECURED & VERIFIED
        `;

        navigator.clipboard.writeText(textSlip.trim()).then(() => {
          appInstance.showToast("Receipt saved! Invoice text copied to your clipboard.", "success");
        }).catch(() => {
          appInstance.showToast("Receipt saved to screen! Copy the reference manually.", "info");
        });
        return;
      }
    });
  }

  static render(appInstance) {
    const listEl = document.getElementById("history-list-container");
    const ledgerTabBtn = document.getElementById("history-subtab-ledger");
    const communityTabBtn = document.getElementById("history-subtab-community");
    const ledgerSection = document.getElementById("tab-history-ledger-section");
    const communitySection = document.getElementById("tab-history-community-section");

    if (!appInstance.historySubTab) {
      appInstance.historySubTab = "ledger";
    }

    if (appInstance.historySubTab === "ledger") {
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

      appInstance.renderCommunitySection();
      return;
    }

    if (!listEl) return;
    listEl.innerHTML = "";

    // Load user operations (Deposits & Withdrawals)
    const usernameVal = appInstance.currentUser?.username || "";
    const userIdVal = appInstance.currentUser?.id || "";

    const userDepos = (appInstance.db.deposits || []).filter(d => d.username && usernameVal && d.username.toLowerCase() === usernameVal.toLowerCase());
    const userWds = (appInstance.db.withdrawals || []).filter(w => w.username && usernameVal && w.username.toLowerCase() === usernameVal.toLowerCase());
    const userTx = (appInstance.db.transactions || []).filter(tx => tx.userId === userIdVal || (tx.username && usernameVal && tx.username.toLowerCase() === usernameVal.toLowerCase()));

    // Combine into unified payment ledger items
    const allOps = [];
    userDepos.forEach(d => {
      const trxVal = d.trxId || d.txid || d.id || "N/A";
      const methodVal = d.method || d.gateway || "Agent Load";
      allOps.push({
        id: d.id || "dep_" + Date.now(),
        amount: d.amount || 0,
        status: d.status || "pending",
        date: d.date || new Date().toISOString(),
        method: methodVal,
        type: "deposit",
        sign: "+",
        color: "text-emerald-400",
        label: `Trx: ${trxVal}`,
        rawReference: trxVal
      });
    });

    userWds.forEach(w => {
      const targetVal = w.targetAccount || w.phone || w.username || "Agent Handout";
      const methodVal = w.method || w.gateway || "Agent Payout";
      allOps.push({
        id: w.id || "wd_" + Date.now(),
        amount: w.amount || 0,
        status: w.status || "pending",
        date: w.date || new Date().toISOString(),
        method: methodVal,
        type: "withdraw",
        sign: "-",
        color: "text-rose-400",
        label: `Tar: ${targetVal}`,
        rawReference: targetVal
      });
    });

    userTx.forEach(tx => {
      const refVal = tx.walletNumber || `Ref: ${tx.id.slice(-6)}`;
      allOps.push({
        id: tx.id || "tx_" + Date.now(),
        amount: tx.amount || 0,
        status: "approved", // system adjustments are immediately auto-approved
        date: tx.date || new Date().toISOString(),
        method: tx.method || tx.description || "System adjustments",
        type: tx.type === "credit" ? "deposit" : "withdraw",
        sign: tx.type === "credit" ? "+" : "-",
        color: tx.type === "credit" ? "text-emerald-400" : "text-rose-400",
        label: refVal,
        rawReference: tx.id
      });
    });

    // Load ticket purchase transactions and lottery win payouts dynamically
    const userTickets = (appInstance.db.tickets || []).filter(t => t.userId === userIdVal);
    userTickets.forEach(t => {
      const lot = appInstance.db.lotteries.find(l => l.id === t.lotteryId) || {};
      const lotName = lot.name || "Lottery Draw";
      const entryFee = lot.entryFee || 10;

      // 1. Ticket purchase
      allOps.push({
        id: "buy_" + t.id,
        amount: entryFee,
        status: "approved",
        date: t.purchaseDate || new Date().toISOString(),
        method: `${lot.category || "Standard"} Ticket`,
        type: "withdraw",
        sign: "-",
        color: "text-rose-400",
        label: `Ticket: ${t.code} (${lotName})`,
        rawReference: t.code
      });

      // 2. Win prize if won
      if (t.status === "won" && t.prizeAmount > 0) {
        allOps.push({
          id: "win_" + t.id,
          amount: t.prizeAmount,
          status: "approved",
          date: t.purchaseDate || new Date().toISOString(),
          method: "Lottery Prize Win 🏆",
          type: "deposit",
          sign: "+",
          color: "text-emerald-400",
          label: `Prize won: ${t.code} (${lotName})`,
          rawReference: t.code
        });
      }
    });

    // Calculate interactive totals from all combined ops
    const creditSum = allOps.filter(op => op.type === "deposit" && op.status === "approved").reduce((sum, op) => sum + op.amount, 0);
    const debitSum = allOps.filter(op => op.type === "withdraw" && op.status === "approved").reduce((sum, op) => sum + op.amount, 0);
    const pendingCount = allOps.filter(op => op.status === "pending").length;

    const statDepEl = document.getElementById("ledger-stats-deposit");
    if (statDepEl) statDepEl.innerText = `৳${creditSum.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;

    const statWithEl = document.getElementById("ledger-stats-withdraw");
    if (statWithEl) statWithEl.innerText = `৳${debitSum.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;

    const statPendEl = document.getElementById("ledger-stats-pending");
    if (statPendEl) statPendEl.innerText = `${pendingCount} ${pendingCount === 1 ? 'Req' : 'Reqs'}`;

    // Read active multi-filters & search inputs
    const searchVal = document.getElementById("ledger-search-input")?.value?.trim().toLowerCase() || "";
    const filterType = document.getElementById("ledger-filter-type")?.value || "all";
    const filterStatus = document.getElementById("ledger-filter-status")?.value || "all";

    // Apply active filtering stream
    let filteredOps = [...allOps];

    if (searchVal) {
      filteredOps = filteredOps.filter(op => {
        const methodStr = op.method.toLowerCase();
        const refStr = op.rawReference.toLowerCase();
        const amtStr = op.amount.toString();
        const labelStr = op.label.toLowerCase();
        return methodStr.includes(searchVal) || refStr.includes(searchVal) || amtStr.includes(searchVal) || labelStr.includes(searchVal);
      });
    }

    if (filterType !== "all") {
      filteredOps = filteredOps.filter(op => op.type === filterType);
    }

    if (filterStatus !== "all") {
      filteredOps = filteredOps.filter(op => op.status === filterStatus);
    }

    // Sort by date newest first
    filteredOps.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredOps.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono bg-slate-950/45 border border-slate-900/60 rounded-3xl">
          <i class="fa-solid fa-clock-rotate-left text-xl text-slate-700 block mb-2"></i>
          No matching transactions found in your ledger.
        </div>
      `;
      return;
    }

    filteredOps.forEach(op => {
      const card = document.createElement("div");
      // Interactive cursor pointer class added to indicate clickability
      card.className = "bg-slate-900 hover:bg-slate-850 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs cursor-pointer active:scale-[0.99] transition duration-100 hover:border-slate-700 shadow-sm relative group overflow-hidden";

      const sign = op.sign;
      const color = op.color;
      const trxLabel = op.label;

      let statusBadge = "";
      if (op.status === "approved") {
        statusBadge = `<span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded font-mono">Approved</span>`;
      } else if (op.status === "declined") {
        statusBadge = `<span class="text-[10px] text-rose-400 font-bold bg-rose-950/40 border border-rose-900/30 px-1.5 py-0.5 rounded font-mono">Declined</span>`;
      } else {
        statusBadge = `<span class="text-[10px] text-amber-500 font-bold bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded font-mono animate-pulse">Pending</span>`;
      }

      card.innerHTML = `
        <div class="space-y-0.5 max-w-[70%]">
          <div class="font-extrabold text-white capitalize flex items-center gap-1.5">
            ${op.type === "deposit" ? '<i class="fa-solid fa-circle-arrow-down text-emerald-400 text-[10px]"></i>' : '<i class="fa-solid fa-circle-arrow-up text-rose-400 text-[10px]"></i>'}
            ${op.type === "deposit" ? "Credit" : "Debit"} via ${op.method}
          </div>
          <div class="text-[10px] text-slate-500 font-mono truncate">${trxLabel}</div>
        </div>
        <div class="text-right flex flex-col items-end gap-1 shrink-0">
          <div class="font-black ${color} font-mono text-[13px]">${sign}৳${op.amount.toFixed(op.amount % 1 === 0 ? 0 : 2)}</div>
          ${statusBadge}
        </div>
        <!-- Tap indicator icon visible on hover -->
        <div class="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-rose-500">
          <i class="fa-solid fa-up-right-from-square"></i>
        </div>
      `;

      // Interactive invoice overlay click action
      card.addEventListener("click", () => {
        const modal = document.getElementById("ledger-receipt-modal");
        if (!modal) return;

        // Populate fields
        const receiptAmountEl = document.getElementById("receipt-amount");
        if (receiptAmountEl) {
          receiptAmountEl.innerText = `${op.sign}৳${op.amount.toFixed(2)}`;
          receiptAmountEl.className = `text-xl font-black font-mono ${op.color}`;
        }

        const badgeEl = document.getElementById("receipt-status-badge");
        if (badgeEl) {
          badgeEl.innerText = op.status.toUpperCase();
          if (op.status === "approved") {
            badgeEl.className = "inline-block mt-1 px-2.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-900";
          } else if (op.status === "declined") {
            badgeEl.className = "inline-block mt-1 px-2.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-950 text-rose-400 border border-rose-900";
          } else {
            badgeEl.className = "inline-block mt-1 px-2.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-950 text-amber-500 border border-amber-900 animate-pulse";
          }
        }

        const typeEl = document.getElementById("receipt-type");
        if (typeEl) typeEl.innerText = op.type;

        const methodEl = document.getElementById("receipt-method");
        if (methodEl) methodEl.innerText = op.method;

        const refEl = document.getElementById("receipt-reference");
        if (refEl) refEl.innerText = op.rawReference;

        const dateEl = document.getElementById("receipt-date");
        if (dateEl) {
          dateEl.innerText = new Date(op.date).toLocaleString();
        }

        // Show the Invoice Receipt Modal overlay smoothly
        modal.classList.remove("hidden");
      });

      listEl.appendChild(card);
    });
  }
}

