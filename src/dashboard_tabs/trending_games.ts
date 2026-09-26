/**
 * Lottery Winner - Trending Premium Games Module (trending_games.js)
 * 
 * Implements Mines Sweeper and Dice Roll under/over.
 * Both games feature real-time calculation and a built-in 5% platform commission.
 */

import { FloatingToastNotification } from "../floating_toast.js";

// Helper for combination math used in Mines Multipliers
function combin(n, r) {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let val = 1;
  for (let i = 1; i <= r; i++) {
    val = val * (n - i + 1) / i;
  }
  return val;
}

export const TrendingGamesModule = {
  minesState: {
    active: false,
    minesCount: 3,
    bet: 10,
    grid: [], // Array of 25 cells: { index, isMine, clicked }
    clicks: 0,
    multiplier: 1.0,
  },

  diceState: {
    bet: 10,
    target: 50,
    isUnder: true,
    isRolling: false,
  },

  init(appInstance) {
    console.log("TrendingGamesModule initialized successfully.");
    this.setupEventListeners(appInstance);
  },

  setupEventListeners(app) {
    // Mines listeners
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // Bet adjustments for Mines
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
        }
        return;
      }

      // Bet adjustments for Dice
      const diceQtyBtn = e.target.closest(".dice-qty-btn");
      if (diceQtyBtn) {
        const op = diceQtyBtn.getAttribute("data-op");
        const input = document.getElementById("dice-bet-amount");
        if (input && app.currentUser) {
          let currentBet = parseFloat(input.value) || 10;
          if (op === "half") currentBet = Math.max(5, currentBet / 2);
          else if (op === "double") currentBet = Math.min(1000, currentBet * 2);
          else if (op === "min") currentBet = 5;
          else if (op === "max") currentBet = Math.min(1000, app.currentUser.balance);
          input.value = Math.floor(currentBet);
        }
        return;
      }

      // Mines Count increase/decrease
      const mineSetBtn = e.target.closest(".mines-count-set-btn");
      if (mineSetBtn) {
        if (this.minesState.active) return; // cannot change mines count during active game
        const count = parseInt(mineSetBtn.getAttribute("data-count") || "3");
        this.minesState.minesCount = count;
        this.renderMinesButtons();
        this.updateMinesMultiplierPreview();
        return;
      }

      // Start Mines Game
      if (e.target.closest("#mines-start-btn")) {
        this.startMinesGame(app);
        return;
      }

      // Cash Out Mines Game
      if (e.target.closest("#mines-cashout-btn")) {
        this.cashoutMinesGame(app);
        return;
      }

      // Cell Click inside Mines Grid
      const cellEl = e.target.closest(".mines-cell-btn");
      if (cellEl) {
        const cellIdx = parseInt(cellEl.getAttribute("data-index") || "0");
        this.handleMinesCellClick(app, cellIdx);
        return;
      }

      // Dice roll prediction type
      const dicePredUnderBtn = e.target.closest("#dice-pred-under-btn");
      if (dicePredUnderBtn) {
        this.diceState.isUnder = true;
        this.updateDiceStatePreview();
        return;
      }

      const dicePredOverBtn = e.target.closest("#dice-pred-over-btn");
      if (dicePredOverBtn) {
        this.diceState.isUnder = false;
        this.updateDiceStatePreview();
        return;
      }

      // Roll Dice trigger
      if (e.target.closest("#dice-roll-trigger-btn")) {
        this.playDiceRoll(app);
        return;
      }
    });

    // Realtime Slider for Dice
    document.addEventListener("input", (e) => {
      if (e.target.id === "dice-target-slider") {
        this.diceState.target = parseInt(e.target.value) || 50;
        this.updateDiceStatePreview();
      }
    });
  },

  // Renders Mine selection buttons state
  renderMinesButtons() {
    const btns = document.querySelectorAll(".mines-count-set-btn");
    btns.forEach(btn => {
      const cnt = parseInt(btn.getAttribute("data-count") || "3");
      if (cnt === this.minesState.minesCount) {
        btn.className = "mines-count-set-btn px-3 py-1.5 rounded-lg text-xs font-black font-mono border bg-rose-500/15 border-rose-500 text-rose-400 active:scale-95 transition cursor-pointer";
      } else {
        btn.className = "mines-count-set-btn px-3 py-1.5 rounded-lg text-xs font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 active:scale-95 transition cursor-pointer";
      }
    });
  },

  // Realtime display of potential multipliers
  updateMinesMultiplierPreview() {
    const nextMultEl = document.getElementById("mines-next-multiplier");
    const minesCount = this.minesState.minesCount;
    if (nextMultEl) {
      // preview multiplier for 1st safe click
      const rawMult = combin(25, 1) / combin(25 - minesCount, 1);
      const withCom = rawMult * 0.95; // 5% house commission
      nextMultEl.innerText = `${withCom.toFixed(2)}x`;
    }
  },

  startMinesGame(app) {
    if (this.minesState.active) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first to play!", "error");
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

    // Initialize state
    this.minesState.active = true;
    this.minesState.bet = betAmount;
    this.minesState.clicks = 0;
    this.minesState.multiplier = 1.0;

    // Deduct user balance
    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    // Place mines randomly in the grid
    const totalCells = 25;
    const mineIndices = [];
    while (mineIndices.length < this.minesState.minesCount) {
      const randIdx = Math.floor(Math.random() * totalCells);
      if (!mineIndices.includes(randIdx)) {
        mineIndices.push(randIdx);
      }
    }

    const grid = [];
    for (let i = 0; i < totalCells; i++) {
      grid.push({
        index: i,
        isMine: mineIndices.includes(i),
        clicked: false,
      });
    }
    this.minesState.grid = grid;

    // Toggle betting control forms state
    const startBtn = document.getElementById("mines-start-btn");
    const cashoutBtn = document.getElementById("mines-cashout-btn");
    if (startBtn) startBtn.classList.add("hidden");
    if (cashoutBtn) {
      cashoutBtn.classList.remove("hidden");
      cashoutBtn.disabled = true;
      cashoutBtn.innerText = "Cash Out (0 clicks)";
      cashoutBtn.className = "w-full py-2.5 rounded-xl text-xs font-extrabold font-mono transition bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed";
    }

    // Disable inputs & count adjustments
    if (betInput) betInput.disabled = true;
    document.querySelectorAll(".mines-qty-btn").forEach(btn => btn.disabled = true);
    document.querySelectorAll(".mines-count-set-btn").forEach(btn => btn.disabled = true);

    // Redraw Grid
    this.renderMinesGrid(false);
    app.showToast("Mines Sweeper game started! Choose a tile 💎", "success");
  },

  renderMinesGrid(revealAll = false) {
    const gridContainer = document.getElementById("mines-game-grid");
    if (!gridContainer) return;

    gridContainer.innerHTML = this.minesState.grid.map(cell => {
      let cellClass = "mines-cell-btn aspect-square rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center cursor-pointer transition hover:scale-[1.03] active:scale-95 duration-100 hover:border-rose-500/30";
      let content = `<span class="w-3.5 h-3.5 rounded-full bg-slate-850/60 shadow-inner"></span>`;

      if (cell.clicked) {
        if (cell.isMine) {
          cellClass = "aspect-square rounded-2xl bg-rose-950/60 border border-rose-600/60 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10";
          content = `<i class="fa-solid fa-bomb text-lg animate-bounce"></i>`;
        } else {
          cellClass = "aspect-square rounded-2xl bg-emerald-950/50 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10";
          content = `<i class="fa-solid fa-gem text-lg"></i>`;
        }
      } else if (revealAll) {
        if (cell.isMine) {
          cellClass = "aspect-square rounded-2xl bg-slate-900/60 border border-rose-900/30 flex items-center justify-center text-rose-500/60";
          content = `<i class="fa-solid fa-bomb text-sm"></i>`;
        } else {
          cellClass = "aspect-square rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-center text-emerald-500/60";
          content = `<i class="fa-solid fa-gem text-sm"></i>`;
        }
      }

      return `<button class="${cellClass}" data-index="${cell.index}">${content}</button>`;
    }).join("");
  },

  handleMinesCellClick(app, cellIdx) {
    if (!this.minesState.active) return;
    const cell = this.minesState.grid[cellIdx];
    if (cell.clicked) return;

    cell.clicked = true;
    this.minesState.clicks++;

    if (navigator.vibrate) navigator.vibrate(50);

    if (cell.isMine) {
      // Hit a mine! Boom!
      this.minesState.active = false;
      this.renderMinesGrid(true); // reveal all mines

      // Push Lose Transaction
      app.db.transactions.push({
        id: "tx-game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        type: "debit",
        amount: this.minesState.bet,
        method: "Mines Sweeper Boom",
        walletNumber: `Lost Bet (${this.minesState.minesCount} Mines)`,
        date: new Date().toISOString(),
        status: "approved"
      });

      if (!app.db.gamesLedger) app.db.gamesLedger = [];
      app.db.gamesLedger.unshift({
        id: "game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        gameType: "Mines Sweeper",
        bet: this.minesState.bet,
        choice: `${this.minesState.minesCount} Mines`,
        result: `💣 Boom on click #${this.minesState.clicks}`,
        status: "lost",
        payout: 0,
        date: new Date().toISOString()
      });

      app.saveDB();
      app.render();

      app.showToast("💥 BOOM! You hit a mine and lost your bet. Try again!", "error");

      // Reset UI controls
      this.resetMinesControls();
    } else {
      // Safe spot clicked!
      // Calculate multiplier based on remaining safe spots:
      // Payout multiplier = (combin(25, clicks) / combin(25 - minesCount, clicks)) * 0.95
      const minesCount = this.minesState.minesCount;
      const clicks = this.minesState.clicks;
      const rawMult = combin(25, clicks) / combin(25 - minesCount, clicks);
      const withCom = rawMult * 0.95; // 5% house edge commission kept!
      
      this.minesState.multiplier = withCom;
      const currentPayout = this.minesState.bet * withCom;

      this.renderMinesGrid(false);

      // Update Cash Out button
      const cashoutBtn = document.getElementById("mines-cashout-btn");
      if (cashoutBtn) {
        cashoutBtn.disabled = false;
        cashoutBtn.innerText = `Cash Out (৳${currentPayout.toFixed(2)})`;
        cashoutBtn.className = "w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 rounded-xl text-xs text-white font-extrabold shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-emerald-400/20 block font-mono";
      }

      // Update next multiplier preview
      const nextMultEl = document.getElementById("mines-next-multiplier");
      if (nextMultEl) {
        const nextRaw = combin(25, clicks + 1) / combin(25 - minesCount, clicks + 1);
        const nextWithCom = nextRaw * 0.95;
        nextMultEl.innerText = `${nextWithCom.toFixed(2)}x`;
      }

      app.showToast(`💎 Safe! Current payout is ৳${currentPayout.toFixed(2)}`, "success");
    }
  },

  cashoutMinesGame(app) {
    if (!this.minesState.active) return;

    this.minesState.active = false;
    const finalPayout = this.minesState.bet * this.minesState.multiplier;

    // Pay Winnings
    app.currentUser.balance += finalPayout;
    app.currentUser.profit = (app.currentUser.profit || 0) + finalPayout;
    if (app.currentUser.loss >= finalPayout) {
      app.currentUser.loss -= finalPayout;
    } else {
      app.currentUser.loss = 0;
    }

    // Push Win Transaction
    app.db.transactions.push({
      id: "tx-game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      type: "credit",
      amount: finalPayout,
      method: `Mines Win (${this.minesState.multiplier.toFixed(2)}x)`,
      walletNumber: `Cleared ${this.minesState.clicks} spots with ${this.minesState.minesCount} Mines`,
      date: new Date().toISOString(),
      status: "approved"
    });

    if (!app.db.gamesLedger) app.db.gamesLedger = [];
    app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      gameType: "Mines Sweeper",
      bet: this.minesState.bet,
      choice: `${this.minesState.minesCount} Mines`,
      result: `🎉 Cashed out ${this.minesState.clicks} safe clicks`,
      status: "won",
      payout: finalPayout,
      date: new Date().toISOString()
    });

    app.saveDB();
    app.render();

    this.renderMinesGrid(true); // reveal board
    app.showToast(`🎉 WIN! You successfully cashed out ৳${finalPayout.toFixed(2)}!`, "success");
    FloatingToastNotification.broadcastCustom("MINES WIN 💎", `@<span class="text-white font-bold">${app.currentUser.username}</span> cleared <strong class="text-emerald-400">${this.minesState.clicks} spots</strong> in Mines, winning <strong class="text-emerald-400">৳${finalPayout.toFixed(2)}</strong>!`, "success");

    this.resetMinesControls();
  },

  resetMinesControls() {
    const startBtn = document.getElementById("mines-start-btn");
    const cashoutBtn = document.getElementById("mines-cashout-btn");
    if (startBtn) startBtn.classList.remove("hidden");
    if (cashoutBtn) cashoutBtn.classList.add("hidden");

    const betInput = document.getElementById("mines-bet-amount");
    if (betInput) betInput.disabled = false;

    document.querySelectorAll(".mines-qty-btn").forEach(btn => btn.disabled = false);
    document.querySelectorAll(".mines-count-set-btn").forEach(btn => btn.disabled = false);
  },


  // ==================== DICE ROLL GAME IMPLEMENTATION ====================

  updateDiceStatePreview() {
    const slider = document.getElementById("dice-target-slider");
    const label = document.getElementById("dice-target-display-val");
    const winChanceEl = document.getElementById("dice-win-chance-val");
    const multEl = document.getElementById("dice-multiplier-val");
    const payoutEl = document.getElementById("dice-potential-payout-val");
    const sliderBarGlow = document.getElementById("dice-slider-fill-glow");

    if (!slider) return;

    const targetVal = parseInt(slider.value);
    if (label) label.innerText = targetVal;

    // Dynamic slider visual coloring (Under vs Over)
    if (sliderBarGlow) {
      if (this.diceState.isUnder) {
        sliderBarGlow.style.left = "0%";
        sliderBarGlow.style.width = `${targetVal}%`;
        sliderBarGlow.style.background = "linear-gradient(90deg, rgba(244,63,94,0.1) 0%, rgba(244,63,94,0.6) 100%)";
      } else {
        sliderBarGlow.style.left = `${targetVal}%`;
        sliderBarGlow.style.width = `${100 - targetVal}%`;
        sliderBarGlow.style.background = "linear-gradient(90deg, rgba(20,184,166,0.6) 0%, rgba(20,184,166,0.1) 100%)";
      }
    }

    // Update buttons highlight
    const underBtn = document.getElementById("dice-pred-under-btn");
    const overBtn = document.getElementById("dice-pred-over-btn");
    if (underBtn && overBtn) {
      if (this.diceState.isUnder) {
        underBtn.className = "flex flex-col items-center gap-1 bg-rose-500/15 border-2 border-rose-500 text-rose-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-lg shadow-rose-500/5 w-full";
        overBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition w-full";
      } else {
        overBtn.className = "flex flex-col items-center gap-1 bg-teal-500/15 border-2 border-teal-500 text-teal-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-lg shadow-teal-500/5 w-full";
        underBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition w-full";
      }
    }

    // Win Chance
    const winChance = this.diceState.isUnder ? targetVal : (100 - targetVal);
    if (winChanceEl) winChanceEl.innerText = `${winChance.toFixed(0)}%`;

    // Multiplier with 5% platform commission
    const prob = winChance / 100;
    const multiplier = prob > 0 ? (0.95 / prob) : 0;
    if (multEl) multEl.innerText = `${multiplier.toFixed(2)}x`;

    // Potential Payout
    const betInput = document.getElementById("dice-bet-amount");
    const betVal = Math.floor(parseFloat(betInput?.value || 10));
    if (payoutEl) {
      payoutEl.innerText = `৳${(betVal * multiplier).toFixed(2)}`;
    }
  },

  playDiceRoll(app) {
    if (this.diceState.isRolling) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first to roll the dice!", "error");
      return;
    }

    const betInput = document.getElementById("dice-bet-amount");
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

    // Setup rolling lock
    this.diceState.isRolling = true;
    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    const resultScreen = document.getElementById("dice-result-graphic-val");
    const rollBtn = document.getElementById("dice-roll-trigger-btn");

    if (rollBtn) {
      rollBtn.disabled = true;
      rollBtn.innerText = "Rolling Multiplier... 🎲";
      rollBtn.className = "w-full py-3 bg-slate-900 border border-slate-850 text-slate-500 font-extrabold font-mono text-xs rounded-xl cursor-not-allowed";
    }

    if (navigator.vibrate) navigator.vibrate([80, 50, 80]);

    // Animate rolling numbers
    let spinCount = 0;
    const interval = setInterval(() => {
      if (resultScreen) {
        resultScreen.innerText = (Math.random() * 100).toFixed(1);
      }
      spinCount++;
      if (spinCount > 15) {
        clearInterval(interval);
        
        // Final roll result
        const finalRoll = Math.round(Math.random() * 99.99 * 100) / 100;
        if (resultScreen) {
          resultScreen.innerText = finalRoll.toFixed(2);
        }

        const isUnder = this.diceState.isUnder;
        const targetVal = this.diceState.target;
        const winChance = isUnder ? targetVal : (100 - targetVal);
        const prob = winChance / 100;
        const multiplier = 0.95 / prob; // 5% platform commission

        const isWin = isUnder ? (finalRoll < targetVal) : (finalRoll > targetVal);
        const payout = isWin ? betAmount * multiplier : 0;

        if (isWin) {
          app.currentUser.balance += payout;
          app.currentUser.profit = (app.currentUser.profit || 0) + payout;
          if (app.currentUser.loss >= payout) {
            app.currentUser.loss -= payout;
          } else {
            app.currentUser.loss = 0;
          }

          // WIN log
          app.db.transactions.push({
            id: "tx-game-" + Date.now(),
            userId: app.currentUser.id,
            username: app.currentUser.username,
            type: "credit",
            amount: payout,
            method: `Dice roll win (${multiplier.toFixed(2)}x)`,
            walletNumber: `Rolled ${finalRoll.toFixed(2)} (${isUnder ? 'Under' : 'Over'} ${targetVal})`,
            date: new Date().toISOString(),
            status: "approved"
          });

          if (!app.db.gamesLedger) app.db.gamesLedger = [];
          app.db.gamesLedger.unshift({
            id: "game-" + Date.now(),
            userId: app.currentUser.id,
            username: app.currentUser.username,
            gameType: "Dice Roll",
            bet: betAmount,
            choice: `${isUnder ? 'Under' : 'Over'} ${targetVal}`,
            result: `Rolled ${finalRoll.toFixed(2)}`,
            status: "won",
            payout,
            date: new Date().toISOString()
          });

          app.saveDB();
          app.render();

          app.showToast(`🎉 WIN! You rolled ${finalRoll.toFixed(2)}! Won ৳${payout.toFixed(2)}!`, "success");
          FloatingToastNotification.broadcastCustom("DICE ROLL WIN 🎲", `@<span class="text-white font-bold">${app.currentUser.username}</span> rolled <strong class="text-yellow-400">${finalRoll.toFixed(2)}</strong> on Dice, winning <strong class="text-emerald-400">৳${payout.toFixed(2)}</strong>!`, "success");
        } else {
          // LOSE log
          app.db.transactions.push({
            id: "tx-game-" + Date.now(),
            userId: app.currentUser.id,
            username: app.currentUser.username,
            type: "debit",
            amount: betAmount,
            method: "Dice roll loss",
            walletNumber: `Rolled ${finalRoll.toFixed(2)} (${isUnder ? 'Under' : 'Over'} ${targetVal})`,
            date: new Date().toISOString(),
            status: "approved"
          });

          if (!app.db.gamesLedger) app.db.gamesLedger = [];
          app.db.gamesLedger.unshift({
            id: "game-" + Date.now(),
            userId: app.currentUser.id,
            username: app.currentUser.username,
            gameType: "Dice Roll",
            bet: betAmount,
            choice: `${isUnder ? 'Under' : 'Over'} ${targetVal}`,
            result: `Rolled ${finalRoll.toFixed(2)}`,
            status: "lost",
            payout: 0,
            date: new Date().toISOString()
          });

          app.saveDB();
          app.render();

          app.showToast(`😢 Lose! You rolled ${finalRoll.toFixed(2)}. Better luck next roll!`, "error");
        }

        // Unlock
        this.diceState.isRolling = false;
        if (rollBtn) {
          rollBtn.disabled = false;
          rollBtn.innerText = "Roll Dice 🎲";
          rollBtn.className = "w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer hover:scale-[1.01] border border-teal-400/20";
        }
      }
    }, 80);
  }
};
