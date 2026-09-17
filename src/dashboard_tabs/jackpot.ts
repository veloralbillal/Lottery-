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
    if (!appInstance || !appInstance.db) return;
    const s = appInstance.db.settings || {};
    const poolVal = s.jackpotPool || 84250.00;

    // 1. Primary pool displays
    const poolAmountEl = document.getElementById("tab-jackpot-pool-amount");
    if (poolAmountEl) {
      poolAmountEl.innerText = `৳${poolVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const totalPoolStatEl = document.getElementById("tab-jackpot-total-pool-stat");
    if (totalPoolStatEl) {
      totalPoolStatEl.innerText = `৳${Math.floor(poolVal).toLocaleString('en-US')}`;
    }

    // 2. User Stats & Odds calculations
    const regs = appInstance.db.jackpotRegistrations || [];
    const totalTicketsSold = regs.reduce((sum, r) => sum + (r.qty || 0), 0);

    let userTickets = 0;
    if (appInstance.currentUser) {
      userTickets = regs
        .filter(r => r.userName === appInstance.currentUser.username)
        .reduce((sum, r) => sum + (r.qty || 0), 0);
    }

    const userTicketsCountEl = document.getElementById("tab-jackpot-user-tickets-count");
    if (userTicketsCountEl) {
      userTicketsCountEl.innerText = `${userTickets} Ticket${userTickets !== 1 ? 's' : ''}`;
    }

    const userOddsEl = document.getElementById("tab-jackpot-user-odds");
    if (userOddsEl) {
      if (totalTicketsSold > 0 && userTickets > 0) {
        const odds = ((userTickets / totalTicketsSold) * 100).toFixed(2);
        userOddsEl.innerText = `${odds}%`;
      } else {
        userOddsEl.innerText = "0.00%";
      }
    }

    const vipDiscountEl = document.getElementById("tab-jackpot-user-vip-discount");
    if (vipDiscountEl) {
      const discountPercent = appInstance.currentUser ? appInstance.getUserTicketDiscount(appInstance.currentUser) : 0;
      vipDiscountEl.innerText = discountPercent > 0 ? `${discountPercent}% OFF` : "0% OFF";
    }

    // 3. Dynamic countdown timers
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
        countdownEl.innerText = "00h : 00m : 00s (Drawing)";
      }
    }

    const dailyTimerEl = document.getElementById("daily-jackpot-timer");
    if (dailyTimerEl) {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        dailyTimerEl.innerText = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
      }
    }

    const miniTimerEl = document.getElementById("mini-jackpot-timer");
    if (miniTimerEl) {
      const now = new Date();
      const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59);
      const diff = endOfHour.getTime() - now.getTime();
      if (diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        miniTimerEl.innerText = `00h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
      }
    }

    // 4. Registrations Table
    const tbody = document.getElementById("jackpot-registrations-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      const activeCounter = document.getElementById("jackpot-active-counter");
      if (activeCounter) activeCounter.innerText = `${regs.length} total entry ${regs.length !== 1 ? 'records' : 'record'}`;

      if (regs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500 font-sans">No active ticket entries yet. Be the first to buy!</td></tr>`;
      } else {
        [...regs].reverse().slice(0, 15).forEach(reg => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-850/30 hover:bg-slate-900/40 transition text-slate-300";
          tr.innerHTML = `
            <td class="py-2.5 font-bold text-white flex items-center gap-1.5 font-mono text-left">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span> ${appInstance.escapeHTML(reg.userName)}
            </td>
            <td class="py-2.5 text-center text-purple-300 font-bold font-mono">${reg.qty}x</td>
            <td class="py-2.5 text-center text-emerald-400 font-bold font-mono">৳${(reg.spent || 0).toFixed(2)}</td>
            <td class="py-2.5 text-right text-slate-500 text-[9px] font-mono">${reg.date || ''}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // 5. Cost & Quantity calculations
    const selectedQtyInput = document.getElementById("jackpot-selected-qty");
    const customQtyInput = document.getElementById("jackpot-custom-qty-input");
    
    let qtyVal = parseInt(selectedQtyInput ? selectedQtyInput.value : 1);
    if (isNaN(qtyVal) || qtyVal < 1) qtyVal = 1;

    const bulkCostEl = document.getElementById("jackpot-bulk-cost");
    if (bulkCostEl) {
      const ticketCost = s.jackpotTicketCost || 20.00;
      const discountPercent = appInstance.currentUser ? appInstance.getUserTicketDiscount(appInstance.currentUser) : 0;
      const finalCostPerTicket = ticketCost * (1 - discountPercent / 100);
      const totalCost = qtyVal * finalCostPerTicket;
      if (discountPercent > 0) {
        bulkCostEl.innerHTML = `<span class="line-through text-slate-500 mr-2 text-xs">৳${(qtyVal * ticketCost).toFixed(2)}</span> ৳${totalCost.toFixed(2)}`;
      } else {
        bulkCostEl.innerText = `৳${totalCost.toFixed(2)}`;
      }
    }

    // 6. User Entries text bottom indicator
    const userEntriesEl = document.getElementById("tab-jackpot-user-entries");
    if (userEntriesEl && appInstance.currentUser) {
      const ticketCost = s.jackpotTicketCost || 20.00;
      userEntriesEl.innerHTML = `
        <span>Your Active Entries: <strong class="text-white font-mono">${userTickets} tickets</strong></span>
        <span class="text-slate-500 font-normal">Ticket Price: <strong class="text-purple-300 font-mono">৳${ticketCost.toFixed(2)}</strong></span>
      `;
    }
  }
}
