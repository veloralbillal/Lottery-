/**
 * Lottery Winner - Group Syndicate Game Module (syndicate.js)
 * 
 * Group lottery play & ticket cost splitting module with live share purchasing,
 * balance deduction, progress bars, and dividend percentage calculators.
 */

import { FloatingToastNotification } from "../floating_toast.js";

export const SyndicateGame = {
  state: {
    isFullScreen: false,
    pools: [
      { id: "101", name: "Mega Bumper Group Pool", price: 50, sold: 85, total: 100, tickets: 100, category: "Mega Pool" },
      { id: "102", name: "Fast Track Syndicate", price: 25, sold: 32, total: 50, tickets: 50, category: "Express Pool" },
      { id: "103", name: "Royal VIP Jackpot Club", price: 100, sold: 18, total: 20, tickets: 200, category: "High Roller" }
    ]
  },

  init(appInstance) {
    this.bindEvents(appInstance);
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle
      if (e.target.closest("#syndicate-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Buy share button
      const joinBtn = e.target.closest(".syndicate-join-btn");
      if (joinBtn) {
        const id = joinBtn.getAttribute("data-id");
        this.buyShare(app, id);
        return;
      }
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-syndicate-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("syndicate-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-emerald-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-emerald-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  buyShare(app, poolId) {
    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const pool = this.state.pools.find(p => p.id === poolId);
    if (!pool) return;

    if (pool.sold >= pool.total) {
      app.showToast("This syndicate pool is sold out!", "error");
      return;
    }

    if (app.currentUser.balance < pool.price) {
      app.showToast(`Insufficient balance! Share costs ৳${pool.price}.`, "error");
      return;
    }

    app.currentUser.balance -= pool.price;
    app.currentUser.loss = (app.currentUser.loss || 0) + pool.price;
    pool.sold += 1;

    app.db.transactions.push({
      id: "tx-syn-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      type: "debit",
      amount: pool.price,
      method: "Group Syndicate Share Purchase",
      walletNumber: `Pool #${pool.id} (${pool.name})`,
      date: new Date().toISOString(),
      status: "approved"
    });

    if (!app.db.gamesLedger) app.db.gamesLedger = [];
    app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      gameType: "Group Syndicate",
      bet: pool.price,
      choice: `1 Share in Pool #${pool.id}`,
      result: `${((1 / pool.total) * 100).toFixed(1)}% Dividend Claim`,
      status: "active",
      payout: 0,
      date: new Date().toISOString()
    });

    app.saveDB();
    if (navigator.vibrate) navigator.vibrate(80);

    app.showToast(`🎉 Share purchased in Pool #${pool.id}! Share dividend registered.`, "success");
    FloatingToastNotification.broadcastCustom("SYNDICATE JOINED 👥", `@<span class="text-white font-bold">${app.currentUser.username}</span> bought a ৳${pool.price} share in <strong class="text-emerald-400">${pool.name}</strong>!`, "success");

    this.renderView(app);
    app.render();
  },

  renderView(app) {
    const container = document.getElementById("syndicate-gameplay-container");
    if (!container) return;

    const poolHTML = this.state.pools.map(pool => {
      const pct = Math.round((pool.sold / pool.total) * 100);
      const isSoldOut = pool.sold >= pool.total;
      const dividendPerShare = ((1 / pool.total) * 100).toFixed(1);

      return `
        <div class="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-[8px] text-emerald-400 font-bold font-mono uppercase tracking-wide">POOL #${pool.id} • ${pool.tickets} TICKETS INCLUDED</span>
              <h4 class="text-xs font-black text-white font-mono">${pool.name}</h4>
              <p class="text-[9px] text-slate-400 font-mono">৳${pool.price} / Share • Dividend: <strong class="text-emerald-400">${dividendPerShare}%</strong> per share</p>
            </div>
            <button class="syndicate-join-btn ${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95 cursor-pointer'} px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono transition border border-emerald-500/20" data-id="${pool.id}" ${isSoldOut ? 'disabled' : ''}>
              ${isSoldOut ? 'Sold Out' : 'Buy Share 🎟️'}
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>Pool Filled: ${pool.sold} / ${pool.total} Shares</span>
              <span class="text-emerald-400 font-bold">${pct}%</span>
            </div>
            <div class="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="bg-gradient-to-b from-emerald-955/30 via-slate-900 to-slate-950 border border-emerald-900/30 p-5 rounded-3xl relative overflow-hidden shadow-2xl space-y-4">
        <div class="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        <div class="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-emerald-400 tracking-widest block font-mono">GROUP SYNDICATE PLAY</span>
            <h3 class="text-xs font-black text-white font-mono">Mega Jackpot Cost-Split Pools</h3>
          </div>
          <span class="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase font-mono">Split Cost 👥</span>
        </div>

        <p class="text-[9px] text-slate-400 leading-normal font-sans">Buy ticket shares in group pools with fellow players. If any ticket wins, payout is automatically split proportionally across all share holders!</p>

        <div class="space-y-3">
          ${poolHTML}
        </div>
      </div>
    `;
  }
};

