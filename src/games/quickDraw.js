/**
 * Lottery Winner - Quick Draw Game Module (quickDraw.js)
 * 
 * Lightning fast 60-second automatic lottery draws with live countdown timer
 * and instant ticket buying. Includes full screen view mode.
 */

export const QuickDrawGame = {
  state: {
    timerInterval: null,
    isFullScreen: false,
  },

  init(appInstance) {
    this.bindEvents(appInstance);
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle
      if (e.target.closest("#quickdraw-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Buy Ticket Button
      if (e.target.closest("#games-quick-buy-btn")) {
        const activeQuick = app.db.lotteries.find(l => l.category === "Quick Draw" && l.status === "active");
        if (activeQuick) {
          if (!app.currentUser) {
            app.showToast("Please register or login to buy tickets!", "error");
            return;
          }
          app.purchaseTicket(activeQuick.id);
          this.renderView(app);
        }
        return;
      }
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-quickdraw-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("quickdraw-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-rose-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  renderView(app) {
    const container = document.getElementById("quickdraw-draw-card-container");
    if (!container) return;

    let activeQuick = app.db.lotteries.find(l => l.category === "Quick Draw" && l.status === "active");

    if (!activeQuick) {
      // Auto-generate if missing
      const initialSold = 5;
      const initialFee = 10;
      activeQuick = {
        id: "draw-qd-" + Date.now(),
        name: "⚡ 60-Sec Quick Draw #" + Math.floor(1000 + Math.random() * 9000),
        title: "⚡ 60-Sec Quick Draw #" + Math.floor(1000 + Math.random() * 9000),
        category: "Quick Draw",
        entryFee: initialFee,
        ticketPrice: initialFee,
        prizeAmount: Math.round(initialSold * initialFee * 0.95 * 100) / 100,
        prizePool: Math.round(initialSold * initialFee * 0.95 * 100) / 100,
        drawTime: new Date(Date.now() + 60 * 1000).toISOString(),
        totalTickets: 50,
        soldTickets: initialSold,
        status: "active"
      };
      app.db.lotteries.unshift(activeQuick);
      app.saveDB();
    }

    // Ensure fallback properties for legacy DB items
    if (!activeQuick.entryFee) activeQuick.entryFee = activeQuick.ticketPrice || 10;
    if (!activeQuick.prizeAmount) activeQuick.prizeAmount = activeQuick.prizePool || 50;
    if (!activeQuick.name && activeQuick.title) activeQuick.name = activeQuick.title;

    const myTickets = app.currentUser ? (app.db.tickets || []).filter(t => t.lotteryId === activeQuick.id && t.userId === app.currentUser.id) : [];

    const drawMs = new Date(activeQuick.drawTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((drawMs - now) / 1000));

      const timerEl = document.getElementById("quickdraw-timer-countdown");
      if (timerEl) {
        const secs = diff % 60;
        const mins = Math.floor(diff / 60);
        timerEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      if (diff <= 0) {
        // Auto-resolve draw
        if (this.state.timerInterval) {
          clearInterval(this.state.timerInterval);
          this.state.timerInterval = null;
        }

        activeQuick.status = "drawn";
        const winnerIndex = Math.floor(Math.random() * (activeQuick.soldTickets || 1));
        activeQuick.winningTicket = "TK-" + (1000 + winnerIndex);
        app.saveDB();

        setTimeout(() => {
          this.renderView(app);
        }, 1500);
      }
    };

    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    this.state.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    const displayTitle = activeQuick.name || activeQuick.title || "⚡ 1-Min Quick Cash Draw";
    const displayPrice = activeQuick.entryFee || 10;
    const displayPrize = activeQuick.prizeAmount || 50;

    container.innerHTML = `
      <div class="bg-gradient-to-b from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
        <div class="absolute -right-20 -top-20 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span class="text-[7.5px] uppercase font-bold text-rose-400 tracking-widest block font-mono">LIVE DRAWING POOL</span>
              <h3 class="text-xs font-black text-white font-mono">${displayTitle}</h3>
            </div>
            <div class="text-right">
              <span class="text-[7.5px] uppercase font-bold text-slate-500 block font-mono">EST. PRIZE POOL</span>
              <span class="text-sm font-black text-emerald-400 font-mono">৳${displayPrize}</span>
            </div>
          </div>

          <!-- Timer Clock Banner -->
          <div class="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-center space-y-1 shadow-inner">
            <span class="text-[8px] text-slate-400 uppercase tracking-widest block font-bold font-mono">DRAW STARTS IN</span>
            <div class="text-3xl font-black text-rose-400 font-mono tracking-tight animate-pulse" id="quickdraw-timer-countdown">00:60</div>
            <p class="text-[8.5px] text-slate-400 font-sans">Automatic winner pick when clock reaches zero!</p>
          </div>

          <!-- Ticket Stats -->
          <div class="grid grid-cols-2 gap-3 bg-slate-950 border border-slate-850 p-3 rounded-2xl font-mono text-center">
            <div>
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Ticket Price</span>
              <span class="text-white font-bold text-xs">৳${displayPrice}</span>
            </div>
            <div class="border-l border-slate-850">
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Your Tickets</span>
              <span class="text-rose-400 font-extrabold text-xs">${myTickets.length} Entries</span>
            </div>
          </div>

          <!-- Action Button -->
          <button id="games-quick-buy-btn" class="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-xl transition active:scale-95 cursor-pointer hover:scale-[1.01] border border-rose-400/30">
            Buy Quick Ticket (৳${displayPrice}) 🎟️
          </button>
        </div>
      </div>
    `;
  }
};
