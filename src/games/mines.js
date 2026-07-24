/**
 * Lottery Winner - Mines Sweeper Game Module (mines.js)
 * 
 * Mines Sweeper mini-game with dynamic grid, configurable mine counts,
 * real-time risk multiplier calculation, cashout feature, and full screen mode.
 */

import { FloatingToastNotification } from "../floating_toast.js";

function combin(n, r) {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let val = 1;
  for (let i = 1; i <= r; i++) {
    val = val * (n - i + 1) / i;
  }
  return val;
}

export const MinesGame = {
  state: {
    active: false,
    minesCount: 3,
    bet: 10,
    grid: [], // Array of 25 cells: { index, isMine, clicked }
    clicks: 0,
    multiplier: 1.0,
    isFullScreen: false
  },

  init(appInstance) {
    this.bindEvents(appInstance);
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle for Mines
      if (e.target.closest("#mines-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Bet Quantity Buttons
      const minesQtyBtn = e.target.closest(".mines-qty-btn");
      if (minesQtyBtn) {
        const op = minesQtyBtn.getAttribute("data-op");
        const input = document.getElementById("mines-bet-amount");
        if (input && app.currentUser) {
          let currentBet = parseFloat(input.value) || 10;
          if (op === "half") currentBet = Math.max(5, currentBet / 2);
          else if (op === "double") currentBet = Math.min(1000, currentBet * 2);
          else if (op === "min") currentBet = 5;
          else if (op === "max") currentBet = Math.min(1000, app.currentUser.balance);
          input.value = Math.floor(currentBet);
          this.state.bet = Math.floor(currentBet);
          this.updateMultiplierPreview();
        }
        return;
      }

      // 3. Mine Count Set Buttons
      const mineSetBtn = e.target.closest(".mines-count-set-btn");
      if (mineSetBtn) {
        if (this.state.active) return;
        const count = parseInt(mineSetBtn.getAttribute("data-count") || "3");
        this.state.minesCount = count;
        this.renderButtons();
        this.updateMultiplierPreview();
        return;
      }

      // 4. Start Game Button
      if (e.target.closest("#mines-start-btn")) {
        this.startGame(app);
        return;
      }

      // 5. Cashout Button
      if (e.target.closest("#mines-cashout-btn")) {
        this.cashoutGame(app);
        return;
      }

      // 6. Mine Cell Click
      const cellBtn = e.target.closest(".mines-cell-btn");
      if (cellBtn) {
        const index = parseInt(cellBtn.getAttribute("data-index") || "0");
        this.clickCell(app, index);
        return;
      }
    });

    // Input change
    document.addEventListener("input", (e) => {
      if (e.target.id === "mines-bet-amount") {
        this.state.bet = parseFloat(e.target.value) || 10;
        this.updateMultiplierPreview();
      }
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-mines-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("mines-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-rose-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  calculateMultiplier(clicks, minesCount) {
    if (clicks <= 0) return 1.0;
    const totalCells = 25;
    const safeCells = totalCells - minesCount;
    const prob = combin(safeCells, clicks) / combin(totalCells, clicks);
    if (prob <= 0) return 1.0;
    const rawMult = 0.95 / prob; // 5% house edge
    return Math.max(1.01, parseFloat(rawMult.toFixed(2)));
  },

  renderGrid(revealAll = false) {
    const gridEl = document.getElementById("mines-game-grid");
    if (!gridEl) return;

    let html = "";
    for (let i = 0; i < 25; i++) {
      const cell = this.state.grid[i] || { index: i, isMine: false, clicked: false };

      let cellStyle = "bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700 hover:bg-slate-850 cursor-pointer";
      let cellContent = `<span class="text-[10px] font-mono text-slate-700 font-bold">${i + 1}</span>`;

      if (cell.clicked) {
        if (cell.isMine) {
          cellStyle = "bg-rose-950 border-rose-500 text-rose-400 animate-pulse shadow-lg shadow-rose-500/20";
          cellContent = `<i class="fa-solid fa-bomb text-lg text-rose-400"></i>`;
        } else {
          cellStyle = "bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10";
          cellContent = `<i class="fa-solid fa-gem text-base text-emerald-400"></i>`;
        }
      } else if (revealAll) {
        if (cell.isMine) {
          cellStyle = "bg-rose-950/40 border-rose-900/40 text-rose-500/60 opacity-70";
          cellContent = `<i class="fa-solid fa-bomb text-sm"></i>`;
        } else {
          cellStyle = "bg-slate-900/50 border-slate-850 text-slate-600 opacity-50";
          cellContent = `<i class="fa-solid fa-gem text-xs text-slate-600"></i>`;
        }
      }

      html += `
        <button class="mines-cell-btn ${cellStyle} border-2 rounded-2xl flex items-center justify-center aspect-square transition-all duration-150 active:scale-90" data-index="${i}">
          ${cellContent}
        </button>
      `;
    }

    gridEl.innerHTML = html;
  },

  renderButtons() {
    document.querySelectorAll(".mines-count-set-btn").forEach((btn) => {
      const count = parseInt(btn.getAttribute("data-count") || "3");
      if (count === this.state.minesCount) {
        btn.className = "mines-count-set-btn px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border-2 transition active:scale-95 cursor-pointer bg-rose-500/15 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5";
      } else {
        btn.className = "mines-count-set-btn px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border-2 transition active:scale-95 cursor-pointer bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700";
      }
    });
  },

  updateMultiplierPreview() {
    const nextMult = this.calculateMultiplier(this.state.clicks + 1, this.state.minesCount);
    const currMult = this.calculateMultiplier(this.state.clicks, this.state.minesCount);

    const currEl = document.getElementById("mines-current-mult-val");
    if (currEl) currEl.innerText = `${currMult.toFixed(2)}x`;

    const nextEl = document.getElementById("mines-next-mult-val");
    if (nextEl) nextEl.innerText = `${nextMult.toFixed(2)}x`;

    const betInput = document.getElementById("mines-bet-amount");
    const betVal = parseFloat(betInput?.value || "10");
    const payout = betVal * currMult;

    const payoutEl = document.getElementById("mines-current-payout-val");
    if (payoutEl) payoutEl.innerText = `৳${payout.toFixed(2)}`;

    const cashoutBtn = document.getElementById("mines-cashout-btn");
    if (cashoutBtn && this.state.active) {
      cashoutBtn.innerText = `Cash Out ৳${payout.toFixed(2)} (${currMult.toFixed(2)}x)`;
    }

    this.renderButtons();
  },

  startGame(app) {
    if (this.state.active) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const betInput = document.getElementById("mines-bet-amount");
    const betAmount = Math.floor(parseFloat(betInput?.value || 0));

    if (isNaN(betAmount) || betAmount < 5) {
      app.showToast("Minimum bet is ৳5!", "error");
      return;
    }

    if (betAmount > 1000) {
      app.showToast("Maximum bet is ৳1000!", "error");
      return;
    }

    if (app.currentUser.balance < betAmount) {
      app.showToast("Insufficient balance! Please deposit to play.", "error");
      return;
    }

    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    this.state.active = true;
    this.state.bet = betAmount;
    this.state.clicks = 0;
    this.state.multiplier = 1.0;

    const minesIndices = new Set();
    while (minesIndices.size < this.state.minesCount) {
      minesIndices.add(Math.floor(Math.random() * 25));
    }

    this.state.grid = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      isMine: minesIndices.has(i),
      clicked: false
    }));

    const startBtn = document.getElementById("mines-start-btn");
    const cashoutBtn = document.getElementById("mines-cashout-btn");

    if (startBtn) startBtn.classList.add("hidden");
    if (cashoutBtn) {
      cashoutBtn.classList.remove("hidden");
      cashoutBtn.disabled = false;
      cashoutBtn.className = "w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-black font-mono shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-emerald-400/20 block";
    }

    this.renderGrid(false);
    this.updateMultiplierPreview();
    app.showToast("💣 Mines game started! Pick safe tiles to cash out.", "info");
  },

  clickCell(app, index) {
    if (!this.state.active) return;
    const cell = this.state.grid[index];
    if (!cell || cell.clicked) return;

    cell.clicked = true;

    if (cell.isMine) {
      // BOOM
      this.state.active = false;
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

      this.renderGrid(true);

      const startBtn = document.getElementById("mines-start-btn");
      const cashoutBtn = document.getElementById("mines-cashout-btn");

      if (startBtn) startBtn.classList.remove("hidden");
      if (cashoutBtn) cashoutBtn.classList.add("hidden");

      if (!app.db.gamesLedger) app.db.gamesLedger = [];
      app.db.gamesLedger.unshift({
        id: "game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        gameType: "Mines Sweeper",
        bet: this.state.bet,
        choice: `${this.state.minesCount} Mines (${this.state.clicks} Safe Tiles)`,
        result: "BOOM 💣",
        status: "lost",
        payout: 0,
        date: new Date().toISOString()
      });

      app.saveDB();
      app.showToast(`💥 BOOM! Hit a mine! You lost ৳${this.state.bet}.`, "error");
      app.render();
      return;
    }

    // Safe Gem
    this.state.clicks++;
    this.state.multiplier = this.calculateMultiplier(this.state.clicks, this.state.minesCount);

    if (navigator.vibrate) navigator.vibrate(50);

    this.renderGrid(false);
    this.updateMultiplierPreview();

    // Check if cleared all safe cells
    const maxSafe = 25 - this.state.minesCount;
    if (this.state.clicks >= maxSafe) {
      this.cashoutGame(app);
    }
  },

  cashoutGame(app) {
    if (!this.state.active) return;

    const payout = this.state.bet * this.state.multiplier;
    this.state.active = false;

    app.currentUser.balance += payout;
    app.currentUser.profit = (app.currentUser.profit || 0) + payout;
    if (app.currentUser.loss >= payout) {
      app.currentUser.loss -= payout;
    } else {
      app.currentUser.loss = 0;
    }

    app.db.transactions.push({
      id: "tx-game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      type: "credit",
      amount: payout,
      method: `Mines Win (${this.state.multiplier.toFixed(2)}x)`,
      walletNumber: `${this.state.clicks} Safe Gems Uncovered`,
      date: new Date().toISOString(),
      status: "approved"
    });

    if (!app.db.gamesLedger) app.db.gamesLedger = [];
    app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      gameType: "Mines Sweeper",
      bet: this.state.bet,
      choice: `${this.state.minesCount} Mines (${this.state.clicks} Safe Gems)`,
      result: `Cashout ${this.state.multiplier.toFixed(2)}x`,
      status: "won",
      payout,
      date: new Date().toISOString()
    });

    app.saveDB();

    const startBtn = document.getElementById("mines-start-btn");
    const cashoutBtn = document.getElementById("mines-cashout-btn");

    if (startBtn) startBtn.classList.remove("hidden");
    if (cashoutBtn) cashoutBtn.classList.add("hidden");

    this.renderGrid(true);

    app.showToast(`🎉 CASHOUT! Uncovered ${this.state.clicks} gems! Won ৳${payout.toFixed(2)} (${this.state.multiplier.toFixed(2)}x)!`, "success");
    FloatingToastNotification.broadcastCustom("MINES CASHOUT 💎", `@<span class="text-white font-bold">${app.currentUser.username}</span> cleared <strong class="text-emerald-400">${this.state.clicks} Safe Gems</strong> on Mines, cashing out <strong class="text-emerald-400">৳${payout.toFixed(2)} (${this.state.multiplier.toFixed(2)}x)</strong>!`, "success");

    app.render();
  }
};
