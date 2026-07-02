/**
 * Lottery Winner - History & Community Module (history.js)
 * 
 * Manages standard community spaces, likes/dislikes, filter queries,
 * and listing dynamic comments/ledgers.
 */

export class HistoryTab {
  static init(appInstance) {
    console.log("History Tab Module initialized successfully.");
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
    const userDepos = appInstance.db.deposits.filter(d => d.username === appInstance.currentUser.username);
    const userWds = appInstance.db.withdrawals.filter(w => w.username === appInstance.currentUser.username);
    const userTx = (appInstance.db.transactions || []).filter(tx => tx.userId === appInstance.currentUser.id);

    // Combine
    const allOps = [];
    userDepos.forEach(d => {
      const trxVal = d.trxId || d.txid || d.id;
      const methodVal = d.method || d.gateway || "Agent Load";
      allOps.push({
        ...d,
        method: methodVal,
        type: "deposit",
        sign: "+",
        color: "text-emerald-400",
        label: `Trx: ${trxVal}`
      });
    });
    userWds.forEach(w => {
      const targetVal = w.targetAccount || w.phone || w.username || "Agent Handout";
      const methodVal = w.method || w.gateway || "Agent Payout";
      allOps.push({
        ...w,
        method: methodVal,
        type: "withdraw",
        sign: "-",
        color: "text-rose-400",
        label: `Tar: ${targetVal}`
      });
    });
    userTx.forEach(tx => {
      const refVal = tx.walletNumber || `Ref: ${tx.id.slice(-6)}`;
      allOps.push({
        ...tx,
        method: tx.method || tx.description || "System adjustments",
        type: tx.type === "credit" ? "Bonus/Credit" : "Charge/Debit",
        sign: tx.type === "credit" ? "+" : "-",
        color: tx.type === "credit" ? "text-emerald-400" : "text-rose-400",
        label: refVal
      });
    });

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
}
