/**
 * Lottery Winner - High-Low Card Game Module (highLow.js)
 * 
 * High-Low card prediction mini-game with card deal animation,
 * Higher/Lower selection, tie refund support, and full screen mode.
 */

import { FloatingToastNotification } from "../floating_toast.js";

export const HighLowGame = {
  state: {
    currentCard: { rank: 8, suit: "♠", label: "8" },
    isDrawing: false,
    selectedPrediction: "",
    bet: 10,
    isFullScreen: false,
  },

  init(appInstance) {
    this.resetCard();
    this.bindEvents(appInstance);
  },

  resetCard() {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = [
      { rank: 2, label: "2" },
      { rank: 3, label: "3" },
      { rank: 4, label: "4" },
      { rank: 5, label: "5" },
      { rank: 6, label: "6" },
      { rank: 7, label: "7" },
      { rank: 8, label: "8" },
      { rank: 9, label: "9" },
      { rank: 10, label: "10" },
      { rank: 11, label: "J" },
      { rank: 12, label: "Q" },
      { rank: 13, label: "K" },
      { rank: 14, label: "A" }
    ];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    this.state.currentCard = { ...rank, suit };
  },

  bindEvents(app) {
    document.addEventListener("click", (e) => {
      if (app.currentTab !== "games") return;

      // 1. Fullscreen toggle
      if (e.target.closest("#hl-fullscreen-toggle-btn")) {
        this.toggleFullScreen();
        return;
      }

      // 2. Higher Button
      const hlHigherBtn = e.target.closest("#hl-bet-higher-btn");
      if (hlHigherBtn) {
        this.state.selectedPrediction = "higher";
        const input = document.getElementById("hl-selected-prediction");
        if (input) input.value = "higher";
        hlHigherBtn.className = "flex flex-col items-center gap-1 bg-emerald-500/15 border border-emerald-500 text-emerald-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-md shadow-emerald-500/5";
        const lowerBtn = document.getElementById("hl-bet-lower-btn");
        if (lowerBtn) lowerBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";
        this.play(app);
        return;
      }

      // 3. Lower Button
      const hlLowerBtn = e.target.closest("#hl-bet-lower-btn");
      if (hlLowerBtn) {
        this.state.selectedPrediction = "lower";
        const input = document.getElementById("hl-selected-prediction");
        if (input) input.value = "lower";
        hlLowerBtn.className = "flex flex-col items-center gap-1 bg-rose-500/15 border border-rose-500 text-rose-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-md shadow-rose-500/5";
        const higherBtn = document.getElementById("hl-bet-higher-btn");
        if (higherBtn) higherBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";
        this.play(app);
        return;
      }

      // 4. Bet Quantity adjustments
      const hlQtyBtn = e.target.closest(".hl-qty-btn");
      if (hlQtyBtn) {
        const op = hlQtyBtn.getAttribute("data-op");
        const input = document.getElementById("hl-bet-amount");
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
    });
  },

  toggleFullScreen() {
    const panel = document.getElementById("game-highlow-panel");
    if (!panel) return;

    this.state.isFullScreen = !this.state.isFullScreen;
    const btn = document.getElementById("hl-fullscreen-toggle-btn");

    if (this.state.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-indigo-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-indigo-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  },

  renderView(app) {
    const cardRankTop = document.getElementById("card-rank-top");
    const cardRankBottom = document.getElementById("card-rank-bottom");
    const cardRankCenter = document.getElementById("card-rank-center");
    const cardSuitTop = document.getElementById("card-suit-top");
    const cardSuitBottom = document.getElementById("card-suit-bottom");
    const hlCurrentInfo = document.getElementById("hl-current-info");

    const redSuits = ["♥", "♦"];
    const isRed = redSuits.includes(this.state.currentCard.suit);

    if (cardRankTop) cardRankTop.innerText = this.state.currentCard.label;
    if (cardRankBottom) cardRankBottom.innerText = this.state.currentCard.label;
    if (cardRankCenter) cardRankCenter.innerText = this.state.currentCard.label;
    if (cardSuitTop) {
      cardSuitTop.innerText = this.state.currentCard.suit;
      cardSuitTop.className = isRed ? "text-xs font-black text-rose-500" : "text-xs font-black text-indigo-400";
    }
    if (cardSuitBottom) {
      cardSuitBottom.innerText = this.state.currentCard.suit;
      cardSuitBottom.className = isRed ? "text-xs font-black text-rose-500" : "text-xs font-black text-indigo-400";
    }

    if (hlCurrentInfo) {
      let cardName = this.state.currentCard.label;
      if (this.state.currentCard.label === "J") cardName = "Jack (11)";
      else if (this.state.currentCard.label === "Q") cardName = "Queen (12)";
      else if (this.state.currentCard.label === "K") cardName = "King (13)";
      else if (this.state.currentCard.label === "A") cardName = "Ace (14)";
      else cardName = `${this.state.currentCard.label} (Rank ${this.state.currentCard.rank})`;

      hlCurrentInfo.innerHTML = `<span class="${isRed ? 'text-rose-400' : 'text-indigo-400'} font-black">${cardName}${this.state.currentCard.suit}</span>`;
    }
  },

  play(app) {
    if (this.state.isDrawing) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const betInput = document.getElementById("hl-bet-amount");
    const betAmount = Math.floor(parseFloat(betInput?.value || 0));
    const selectedPrediction = this.state.selectedPrediction;

    if (!selectedPrediction) return;

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

    this.state.isDrawing = true;
    app.currentUser.balance -= betAmount;
    app.currentUser.loss = (app.currentUser.loss || 0) + betAmount;
    app.currentUser.profit = (app.currentUser.profit || 0) - betAmount;
    app.saveDB();
    app.render();

    const cardWrapper = document.getElementById("highlow-card-wrapper");
    if (cardWrapper) {
      cardWrapper.classList.add("animate-pulse", "scale-95", "rotate-y-180");
    }

    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = [
      { rank: 2, label: "2" },
      { rank: 3, label: "3" },
      { rank: 4, label: "4" },
      { rank: 5, label: "5" },
      { rank: 6, label: "6" },
      { rank: 7, label: "7" },
      { rank: 8, label: "8" },
      { rank: 9, label: "9" },
      { rank: 10, label: "10" },
      { rank: 11, label: "J" },
      { rank: 12, label: "Q" },
      { rank: 13, label: "K" },
      { rank: 14, label: "A" }
    ];

    const prevCard = this.state.currentCard;
    const nextRank = ranks[Math.floor(Math.random() * ranks.length)];
    const nextSuit = suits[Math.floor(Math.random() * suits.length)];
    const nextCard = { ...nextRank, suit: nextSuit };

    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      let isWin = false;
      let isTie = prevCard.rank === nextCard.rank;

      if (!isTie) {
        if (selectedPrediction === "higher") {
          isWin = nextCard.rank > prevCard.rank;
        } else if (selectedPrediction === "lower") {
          isWin = nextCard.rank < prevCard.rank;
        }
      }

      let payout = 0;
      if (isTie) {
        payout = betAmount;
        app.currentUser.balance += payout;
        app.currentUser.profit = (app.currentUser.profit || 0) + payout;
        if (app.currentUser.loss >= payout) {
          app.currentUser.loss -= payout;
        } else {
          app.currentUser.loss = 0;
        }
        app.showToast(`🤝 Tie! Both cards have rank ${prevCard.label}. Your bet was refunded!`, "info");
      } else if (isWin) {
        payout = betAmount * 2;
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
          method: "High-Low Win (2.00x)",
          walletNumber: `${selectedPrediction.toUpperCase()} prediction`,
          date: new Date().toISOString(),
          status: "approved"
        });

        app.showToast(`🎉 WIN! Drawn Card is ${nextCard.label}${nextCard.suit}! You won ৳${payout.toFixed(2)}!`, "success");
        FloatingToastNotification.broadcastCustom("HIGH-LOW WIN 🃏", `@<span class="text-white font-bold">${app.currentUser.username}</span> guessed <strong class="text-emerald-400">${selectedPrediction.toUpperCase()}</strong> on High-Low, card was <strong class="text-cyan-400">${nextCard.label}${nextCard.suit}</strong>, winning <strong class="text-emerald-400">৳${payout.toFixed(2)}</strong>!`, "success");
      } else {
        app.db.transactions.push({
          id: "tx-game-" + Date.now(),
          userId: app.currentUser.id,
          username: app.currentUser.username,
          type: "debit",
          amount: betAmount,
          method: "High-Low Loss",
          walletNumber: `${selectedPrediction.toUpperCase()} prediction`,
          date: new Date().toISOString(),
          status: "approved"
        });
        app.showToast(`😢 Lose! Drawn card is ${nextCard.label}${nextCard.suit}. Try again!`, "error");
      }

      if (!app.db.gamesLedger) app.db.gamesLedger = [];
      app.db.gamesLedger.unshift({
        id: "game-" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        gameType: "High-Low",
        bet: betAmount,
        choice: selectedPrediction.toUpperCase(),
        result: `${nextCard.label}${nextCard.suit}`,
        status: isTie ? "tie" : (isWin ? "won" : "lost"),
        payout,
        date: new Date().toISOString()
      });

      this.state.currentCard = nextCard;
      app.saveDB();
      this.state.isDrawing = false;

      if (cardWrapper) {
        cardWrapper.classList.remove("animate-pulse", "scale-95", "rotate-y-180");
      }

      this.state.selectedPrediction = "";
      const input = document.getElementById("hl-selected-prediction");
      if (input) input.value = "";

      const higherBtn = document.getElementById("hl-bet-higher-btn");
      if (higherBtn) higherBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";

      const lowerBtn = document.getElementById("hl-bet-lower-btn");
      if (lowerBtn) lowerBtn.className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";

      this.renderView(app);
      app.render();
    }, 1000);
  }
};
