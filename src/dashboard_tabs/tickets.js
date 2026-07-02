/**
 * Lottery Winner - Purchased Tickets Ledger Module (tickets.js)
 * 
 * Handles rendering of user-purchased lottery codes and verifying pending states.
 */

export class TicketsTab {
  static init(appInstance) {
    console.log("Tickets Tab Module initialized successfully.");
  }

  static render(appInstance) {
    const listEl = document.getElementById("tickets-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    const userTickets = appInstance.db.tickets.filter(t => t.userId === appInstance.currentUser.id);

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
      const lot = appInstance.db.lotteries.find(l => l.id === t.lotteryId) || { name: "Expired Draw Event" };
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
        appInstance.openTicketLiveInfoPop(t.id);
      });

      listEl.appendChild(card);
    });
  }
}
