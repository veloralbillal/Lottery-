/**
 * Lottery Winner - Dice Roll Game Module (diceRoll.js)
 * 
 * High-performance Dice Roll mini-game with Under/Over prediction,
 * dynamic slider, real-time multiplier calculation, full-screen mode,
 * and 3D rolling animations.
 */

import { FloatingToastNotification } from "../floating_toast.js";

export const DiceRollGame = {
  state: {
    bet: 10,
    target: 50,
    isUnder: true,
    isRolling: false,
    lastRoll: 50.00,
    isFullScreen: false,
  },

  init(appInstance) {
    this.bindEvents(appInstance);
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle for Dice Roll
      if (e.target.closest("#dice-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Roll Under / Roll Over buttons
      if (e.target.closest("#dice-pred-under-btn")) {
        this.state.isUnder = true;
        this.updatePredictionUI();
        this.updateStatePreview();
        return;
      }

      if (e.target.closest("#dice-pred-over-btn")) {
        this.state.isUnder = false;
        this.updatePredictionUI();
        this.updateStatePreview();
        return;
      }

      // 3. Quick Bet Buttons
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
          this.state.bet = Math.floor(currentBet);
          this.updateStatePreview();
        }
        return;
      }

      // 4. Roll Trigger
      if (e.target.closest("#dice-roll-trigger-btn")) {
        this.rollDice(app);
        return;
      }
    });

    // Slider listener
    document.addEventListener("input", (e) => {
      if (e.target.id === "dice-target-slider") {
        this.state.target = parseInt(e.target.value || "50");
        this.updateStatePreview();
      } else if (e.target.id === "dice-bet-amount") {
        this.state.bet = parseFloat(e.target.value) || 10;
        this.updateStatePreview();
      }
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-dice-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("dice-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-teal-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-teal-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  updatePredictionUI() {
    const underBtn = document.getElementById("dice-pred-under-btn");
    const overBtn = document.getElementById("dice-pred-over-btn");
    const glowFill = document.getElementById("dice-slider-fill-glow");

    if (this.state.isUnder) {
      if (underBtn) underBtn.className = "w-full flex flex-col items-center gap-1 bg-rose-500/15 border-2 border-rose-500 text-rose-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-lg shadow-rose-500/10";
      if (overBtn) overBtn.className = "w-full flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";
      if (glowFill) {
        glowFill.style.left = "0%";
        glowFill.style.width = `${this.state.target}%`;
        glowFill.className = "absolute h-full rounded-full bg-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-200";
      }
    } else {
      if (overBtn) overBtn.className = "w-full flex flex-col items-center gap-1 bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-lg shadow-emerald-500/10";
      if (underBtn) underBtn.className = "w-full flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";
      if (glowFill) {
        glowFill.style.left = `${this.state.target}%`;
        glowFill.style.width = `${100 - this.state.target}%`;
        glowFill.className = "absolute h-full rounded-full bg-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-200";
      }
    }
  },

  updateStatePreview() {
    const targetDisp = document.getElementById("dice-target-display-val");
    if (targetDisp) targetDisp.innerText = this.state.target;

    const winChance = this.state.isUnder ? this.state.target : (100 - this.state.target);
    const chanceEl = document.getElementById("dice-win-chance-val");
    if (chanceEl) chanceEl.innerText = `${winChance}%`;

    // Multiplier with 5% house edge: (95 / winChance)
    const multiplier = winChance > 0 ? (95 / winChance) : 0;
    const multEl = document.getElementById("dice-multiplier-val");
    if (multEl) multEl.innerText = `${multiplier.toFixed(2)}x`;

    const betInput = document.getElementById("dice-bet-amount");
    const betVal = parseFloat(betInput?.value || "10");
    const payout = betVal * multiplier;

    const payoutEl = document.getElementById("dice-potential-payout-val");
    if (payoutEl) payoutEl.innerText = `৳${payout.toFixed(2)}`;

    this.updatePredictionUI();
  },

  rollDice(app) {
    if (this.state.isRolling) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
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

    this.state.isRolling = true;
    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    const rollBtn = document.getElementById("dice-roll-trigger-btn");
    const graphicVal = document.getElementById("dice-result-graphic-val");

    if (rollBtn) {
      rollBtn.disabled = true;
      rollBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> Rolling Dice...`;
      rollBtn.className = "w-full py-3 bg-slate-900 border border-slate-800 text-slate-500 font-extrabold font-mono text-xs rounded-xl shadow-lg cursor-not-allowed";
    }

    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

    // Rolling visual animation effect
    let counter = 0;
    const rollInterval = setInterval(() => {
      counter++;
      const randomDisplay = (Math.random() * 99.99).toFixed(2);
      if (graphicVal) graphicVal.innerText = randomDisplay;
      if (counter >= 15) {
        clearInterval(rollInterval);
        this.finishRoll(app, betAmount);
      }
    }, 60);
  },

  finishRoll(app, betAmount) {
    const rollResult = parseFloat((Math.random() * 99.99).toFixed(2));
    this.state.lastRoll = rollResult;

    const winChance = this.state.isUnder ? this.state.target : (100 - this.state.target);
    const multiplier = winChance > 0 ? (95 / winChance) : 0;
    const isWin = this.state.isUnder ? (rollResult < this.state.target) : (rollResult > this.state.target);
    const payout = isWin ? betAmount * multiplier : 0;

    const graphicVal = document.getElementById("dice-result-graphic-val");
    if (graphicVal) {
      graphicVal.innerText = rollResult.toFixed(2);
      if (isWin) {
        graphicVal.className = "text-5xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-bounce";
      } else {
        graphicVal.className = "text-5xl font-black text-rose-500 font-mono tracking-tight drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]";
      }
    }

    if (isWin) {
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
        method: `Dice Roll Win (${multiplier.toFixed(2)}x)`,
        walletNumber: `Roll ${this.state.isUnder ? "Under" : "Over"} ${this.state.target}`,
        date: new Date().toISOString(),
        status: "approved"
      });

      app.showToast(`🎉 WIN! Dice rolled ${rollResult.toFixed(2)}! You won ৳${payout.toFixed(2)}!`, "success");
      FloatingToastNotification.broadcastCustom("DICE ROLL WIN 🎲", `@<span class="text-white font-bold">${app.currentUser.username}</span> rolled <strong class="text-teal-400">${rollResult.toFixed(2)}</strong> (${this.state.isUnder ? "Under" : "Over"} ${this.state.target}), winning <strong class="text-emerald-400">৳${payout.toFixed(2)}</strong>!`, "success");
    } else {
      app.db.transactions.push({
        id: "tx-game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        type: "debit",
        amount: betAmount,
        method: "Dice Roll Loss",
        walletNumber: `Roll ${this.state.isUnder ? "Under" : "Over"} ${this.state.target}`,
        date: new Date().toISOString(),
        status: "approved"
      });
      app.showToast(`😢 Dice rolled ${rollResult.toFixed(2)}. Target was ${this.state.isUnder ? "< " : "> "}${this.state.target}. Try again!`, "error");
    }

    if (!app.db.gamesLedger) app.db.gamesLedger = [];
    app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      gameType: "Dice Roll",
      bet: betAmount,
      choice: `${this.state.isUnder ? "Under" : "Over"} ${this.state.target}`,
      result: rollResult.toFixed(2),
      status: isWin ? "won" : "lost",
      payout,
      date: new Date().toISOString()
    });

    app.saveDB();
    this.state.isRolling = false;

    const rollBtn = document.getElementById("dice-roll-trigger-btn");
    if (rollBtn) {
      rollBtn.disabled = false;
      rollBtn.innerHTML = `Roll Dice 🎲`;
      rollBtn.className = "w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer hover:scale-[1.01] border border-teal-400/20";
    }

    app.render();
  }
};
