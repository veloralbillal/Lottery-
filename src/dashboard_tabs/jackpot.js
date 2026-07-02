/**
 * Lottery Winner - Progressive Mega Jackpot Module (jackpot.js)
 * 
 * Sets ticket multipliers, displays real-time countdown loops,
 * and files secure ticket registration entries.
 */

export class JackpotTab {
  static init(appInstance) {
    console.log("Jackpot Tab Module initialized successfully.");
  }

  static render(appInstance) {
    const s = appInstance.db.settings;
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
      const regs = appInstance.db.jackpotRegistrations || [];
      const activeCounter = document.getElementById("jackpot-active-counter");
      if (activeCounter) activeCounter.innerText = `${regs.length} total purchased`;

      if (regs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500 font-sans">No active ticket entries. Be the first to buy!</td></tr>`;
      } else {
        // Show reverse chronological entries
        [...regs].reverse().forEach(reg => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-850/30 hover:bg-slate-900/40 transition text-slate-300";
          tr.innerHTML = `
            <td class="py-2.5 font-bold text-white flex items-center gap-1.5 font-mono text-left">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> ${appInstance.escapeHTML(reg.userName)}
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
      const discountPercent = appInstance.currentUser ? appInstance.getUserTicketDiscount(appInstance.currentUser) : 0;
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
    if (userEntriesEl && appInstance.currentUser) {
      const userRegsSum = (appInstance.db.jackpotRegistrations || [])
        .filter(r => r.userName === appInstance.currentUser.username)
        .reduce((sum, r) => sum + r.qty, 0);
      userEntriesEl.innerText = `Your Entries: ${userRegsSum} tickets`;
    }
  }
}
