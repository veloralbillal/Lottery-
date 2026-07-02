/**
 * Lottery Winner - Pools / Home Tab Module (home.js)
 * 
 * Manages category filters, check-in rewards timers, and
 * active lottery pool interface card renderings.
 */

export class HomeTab {
  static init(appInstance) {
    console.log("Home Tab Module initialized securely.");
  }

  static render(appInstance) {
    appInstance.updateNotificationBanner();
    const listEl = document.getElementById("pools-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    // Dynamically render dynamic Home Category Filter Tabs
    const tabsCont = document.getElementById("home-category-tabs");
    if (tabsCont) {
      tabsCont.innerHTML = "";
      
      // All Pools button
      const allBtn = document.createElement("button");
      allBtn.setAttribute("data-category", "all");
      if (appInstance.currentHomeCategory === "all") {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
      } else {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
      }
      allBtn.innerHTML = "🎯 All Pools";
      tabsCont.appendChild(allBtn);

      // Category buttons dynamically mapped
      appInstance.db.categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.setAttribute("data-category", cat.name);
        
        const isActive = (appInstance.currentHomeCategory === cat.name);
        if (isActive) {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15 cursor-pointer transition active:scale-95";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
          }
        } else {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-900/30 bg-slate-900 text-emerald-400 hover:text-emerald-300 cursor-pointer transition active:scale-95 shadow-md";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
          }
        }
        btn.innerHTML = cat.label;
        tabsCont.appendChild(btn);
      });

      // Bind category buttons inside render so they work dynamically
      const catButtons = tabsCont.querySelectorAll(".home-cat-tab-btn");
      catButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          const cat = e.currentTarget.getAttribute("data-category");
          appInstance.currentHomeCategory = cat;
          appInstance.render();
        });
      });
    }

    const isAll = (appInstance.currentHomeCategory === "all");
    const filteredLotteries = appInstance.db.lotteries.filter(lot => {
      if (isAll) return true;
      return lot.category === appInstance.currentHomeCategory;
    });

    if (filteredLotteries.length === 0) {
      listEl.innerHTML = `
        <div class="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl text-center space-y-2 mt-2">
          <p class="text-xs text-slate-500 font-mono">No active draw pools in this category right now.</p>
        </div>
      `;
      return;
    }

    filteredLotteries.forEach(lot => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden space-y-4 shadow-xl cursor-pointer hover:border-cyan-500/20 transition-all duration-300";

      const badgeColor = lot.category.includes("10") ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" :
                         lot.category.includes("20") ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" :
                         "bg-rose-950 text-rose-400 border border-rose-800/40";

      const progress = Math.min(100, Math.round((lot.soldTickets / lot.totalTickets) * 100));
      const cardDrawTime = new Date(lot.drawTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <div>
            <span class="text-[9px] uppercase font-bold tracking-widest ${badgeColor} px-2.5 py-0.5 rounded-full">
              ${lot.category}
            </span>
            <h3 class="text-sm font-bold text-white mt-1.5">${lot.name}</h3>
            <p class="text-[11px] text-slate-400 leading-normal mt-1">${lot.details}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs text-slate-500 font-mono block">Entry Fee</span>
            <span class="text-base font-black text-white font-mono block">৳${lot.entryFee}</span>
          </div>
        </div>

        <!-- Target Draw Date & Time -->
        <div class="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950/40 px-3 py-2 rounded-xl font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-regular fa-clock text-cyan-400"></i>
            <span>Draw Scheduled:</span>
          </div>
          <span class="text-white font-bold">${cardDrawTime}</span>
        </div>

        <!-- Progress of Pools -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Sold Tickets Progress</span>
            <span class="text-cyan-400 font-bold">${progress}% (${lot.soldTickets}/${lot.totalTickets})</span>
          </div>
          <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-rose-500" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-slate-800/80 pt-3 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-solid fa-trophy text-rose-500"></i>
            <span>Prize: <span class="text-white font-bold">৳${lot.prizeAmount}</span></span>
          </div>
          <button class="buy-pool-btn bg-gradient-to-r from-red-600 to-rose-600 hover:scale-103 text-white text-[11px] font-black py-2 px-4 rounded-xl shadow-lg transition active:opacity-90" data-id="${lot.id}">
            Buy Ticket
          </button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".buy-pool-btn")) return;
        appInstance.openLotteryDetailsPop(lot.id);
      });

      listEl.appendChild(card);
    });

    document.querySelectorAll(".buy-pool-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute("data-id");
        appInstance.purchaseTicket(id);
      });
    });
  }
}
