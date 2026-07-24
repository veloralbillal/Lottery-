/**
 * Lottery Winner - Coin Flip Game Module (coinFlip.js)
 * 
 * Double-or-nothing Coin Flip game with 3D coin rotation animation,
 * side selector (Heads/Tails), bet sizing shortcuts, and full screen mode.
 */

import { FloatingToastNotification } from "../floating_toast.js";

export const CoinFlipGame = {
  state: {
    selectedSide: "heads",
    bet: 10,
    isFlipping: false,
    isFullScreen: false,
  },

  init(appInstance) {
    this.bindEvents(appInstance);
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle
      if (e.target.closest("#coin-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Side selectors
      const headsBtn = e.target.closest("#coin-side-heads-btn");
      if (headsBtn) {
        this.state.selectedSide = "heads";
        const input = document.getElementById("coin-selected-side");
        if (input) input.value = "heads";
        headsBtn.className = "px-5 py-2 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5";
        const tailsBtn = document.getElementById("coin-side-tails-btn");
        if (tailsBtn) tailsBtn.className = "px-5 py-2 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700";
        return;
      }

      const tailsBtn = e.target.closest("#coin-side-tails-btn");
      if (tailsBtn) {
        this.state.selectedSide = "tails";
        const input = document.getElementById("coin-selected-side");
        if (input) input.value = "tails";
        tailsBtn.className = "px-5 py-2 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5";
        const headsBtnEl = document.getElementById("coin-side-heads-btn");
        if (headsBtnEl) headsBtnEl.className = "px-5 py-2 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700";
        return;
      }

      // 3. Bet Quantity adjustments
      const coinQtyBtn = e.target.closest(".coin-qty-btn");
      if (coinQtyBtn) {
        const op = coinQtyBtn.getAttribute("data-op");
        const input = document.getElementById("coin-bet-amount");
        if (input && app.currentUser) {
          let currentBet = parseFloat(input.value) || 10;
          if (op === "half") currentBet = Math.max(5, currentBet / 2);
          else if (op === "double") currentBet = Math.min(1000, currentBet * 2);
          else if (op === "min") currentBet = 5;
          else if (op === "max") currentBet = Math.min(1000, app.currentUser.balance);
          input.value = Math.floor(currentBet);
          this.state.bet = Math.floor(currentBet);
        }
        return;
      }

      // 4. Play Button
      if (e.target.closest("#games-coinflip-play-btn")) {
        this.play(app);
        return;
      }
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-coinflip-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("coin-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-purple-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-purple-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  play(app) {
    if (this.state.isFlipping) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const betInput = document.getElementById("coin-bet-amount");
    const betAmount = Math.floor(parseFloat(betInput?.value || 0));
    const selectedSide = this.state.selectedSide;

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

    this.state.isFlipping = true;
    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    const coinRotator = document.getElementById("coin-rotator");
    const playBtn = document.getElementById("games-coinflip-play-btn");

    if (playBtn) {
      playBtn.disabled = true;
      playBtn.innerText = "Flipping Destiny...";
      playBtn.className = "w-full bg-slate-900 border border-slate-800 text-slate-500 py-3 rounded-xl text-xs font-extrabold font-mono cursor-not-allowed";
    }

    const sides = ["heads", "tails"];
    const outcome = sides[Math.floor(Math.random() * 2)];
    const rotY = outcome === "heads" ? 1800 : 1980;

    if (coinRotator) {
      coinRotator.style.transition = "transform 1500ms cubic-bezier(0.25, 0.1, 0.25, 1.15)";
      coinRotator.style.transform = `rotateY(${rotY}deg)`;
    }

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => {
      const isWin = outcome === selectedSide;
      const payout = isWin ? betAmount * 2 : 0;

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
          method: "Coin Flip Win (2.00x)",
          walletNumber: `Bet on ${selectedSide.toUpperCase()}`,
          date: new Date().toISOString(),
          status: "approved"
        });

        app.showToast(`🎉 WIN! Coin landed on ${outcome.toUpperCase()}! You won ৳${payout.toFixed(2)}!`, "success");
        FloatingToastNotification.broadcastCustom("COIN FLIP WIN 🪙", `@<span class="text-white font-bold">${app.currentUser.username}</span> flipped the coin, landed on <strong class="text-yellow-400">${outcome.toUpperCase()}</strong>, winning <strong class="text-emerald-400">৳${payout.toFixed(2)}</strong>!`, "success");
      } else {
        app.db.transactions.push({
          id: "tx-game-" + Date.now(),
          userId: app.currentUser.id,
          username: app.currentUser.username,
          type: "debit",
          amount: betAmount,
          method: "Coin Flip Loss",
          walletNumber: `Bet on ${selectedSide.toUpperCase()}`,
          date: new Date().toISOString(),
          status: "approved"
        });
        app.showToast(`😢 Lose! Coin landed on ${outcome.toUpperCase()}. Try again!`, "error");
      }

      if (!app.db.gamesLedger) app.db.gamesLedger = [];
      app.db.gamesLedger.unshift({
        id: "game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        gameType: "Coin Flip",
        bet: betAmount,
        choice: selectedSide.toUpperCase(),
        result: outcome.toUpperCase(),
        status: isWin ? "won" : "lost",
        payout,
        date: new Date().toISOString()
      });

      app.saveDB();
      this.state.isFlipping = false;

      if (playBtn) {
        playBtn.disabled = false;
        playBtn.innerText = "Flip Coin now!";
        playBtn.className = "w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 rounded-xl text-xs text-white font-extrabold shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-purple-400/20 block font-mono";
      }

      app.render();
    }, 1500);
  }
};
