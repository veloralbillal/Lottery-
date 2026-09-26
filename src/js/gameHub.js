/**
 * Lottery Winner - Games Hub Module (gameHub.js)
 * 
 * Implements client-side Coin Flip, High-Low mini-games,
 * 1-Minute Quick Draw, and Group Syndicate play.
 */

import { FloatingToastNotification } from "../floating_toast.js";
import { DiceRollGame } from "../games/diceRoll.js";
import { MinesGame } from "../games/mines.js";
import { CoinFlipGame } from "../games/coinFlip.js";
import { HighLowGame } from "../games/highLow.js";
import { QuickDrawGame } from "../games/quickDraw.js";
import { SyndicateGame } from "../games/syndicate.js";
import { ExtraGamesModule } from "../games/extraGames.js";

export const GameHubModule = {
  activeSubTab: "lobby", // 'lobby' | 'coinflip' | 'highlow' | 'quickdraw' | 'syndicate' | 'mines' | 'dice'

  init(appInstance) {
    console.log("GameHubModule initialized with modular games architecture.");
    
    // Initialize modular game handlers
    DiceRollGame.init(appInstance);
    MinesGame.init(appInstance);
    CoinFlipGame.init(appInstance);
    HighLowGame.init(appInstance);
    QuickDrawGame.init(appInstance);
    SyndicateGame.init(appInstance);
    ExtraGamesModule.init(appInstance);

    this.setupEventListeners(appInstance);
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
    this.currentCard = { ...rank, suit };
  },

  setupEventListeners(appInstance) {
    // We register a delegator on document for clicks when on the games tab
    document.addEventListener("click", (e) => {
      if (appInstance.currentTab !== "games") return;

      // 1. Launch Game button (Bento dashboard card)
      const launchBtn = e.target.closest(".game-launch-btn");
      if (launchBtn) {
        const subtab = launchBtn.getAttribute("data-subtab");
        this.activeSubTab = subtab;
        this.render(appInstance);
        return;
      }

      // 2. Back to lobby / menu button
      if (e.target.closest("#games-back-to-lobby-btn, .games-back-to-lobby-btn")) {
        this.activeSubTab = "lobby";
        if (ExtraGamesModule.gameState && ExtraGamesModule.gameState.interval) {
          clearInterval(ExtraGamesModule.gameState.interval);
        }
        ExtraGamesModule.activeGame = null;
        this.render(appInstance);
        return;
      }
    });
  },

  playCoinFlip(app) {
    if (this.isFlipping) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const betInput = document.getElementById("coin-bet-amount");
    const betAmount = Math.floor(parseFloat(betInput?.value || 0));
    const selectedSide = document.getElementById("coin-selected-side")?.value || "heads";

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

    // Process Bet Charge
    this.isFlipping = true;
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

      if (!app.db.gamesLedger) {
        app.db.gamesLedger = [];
      }
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
      this.isFlipping = false;

      if (coinRotator) {
        coinRotator.style.transition = "none";
        coinRotator.style.transform = outcome === "heads" ? "rotateY(0deg)" : "rotateY(180deg)";
      }

      this.render(app);
      app.render();
    }, 1600);
  },

  playHighLow(app) {
    if (this.isDrawing) return;

    if (!app.currentUser) {
      app.showToast("Please register or login first!", "error");
      return;
    }

    const betInput = document.getElementById("hl-bet-amount");
    const betAmount = Math.floor(parseFloat(betInput?.value || 0));
    const selectedPrediction = document.getElementById("hl-selected-prediction")?.value;

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

    this.isDrawing = true;
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

    const prevCard = this.currentCard;
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

      if (!app.db.gamesLedger) {
        app.db.gamesLedger = [];
      }
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

      this.currentCard = nextCard;
      app.saveDB();
      this.isDrawing = false;

      if (cardWrapper) {
        cardWrapper.classList.remove("animate-pulse", "scale-95", "rotate-y-180");
      }

      document.getElementById("hl-selected-prediction").value = "";
      document.getElementById("hl-bet-higher-btn").className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";
      document.getElementById("hl-bet-lower-btn").className = "flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition";

      this.render(app);
      app.render();
    }, 1000);
  },

  render(appInstance) {
    if (!appInstance) return;

    const lobbyPanel = document.getElementById("game-lobby-panel");
    const cfPanel = document.getElementById("game-coinflip-panel");
    const hlPanel = document.getElementById("game-highlow-panel");
    const qdPanel = document.getElementById("game-quickdraw-panel");
    const synPanel = document.getElementById("game-syndicate-panel");
    const minesPanel = document.getElementById("game-mines-panel");
    const dicePanel = document.getElementById("game-dice-panel");
    const extraPanel = document.getElementById("game-extragames-panel");

    const backBtn = document.getElementById("games-back-to-lobby-btn");
    const ledgerContainer = document.getElementById("games-ledger-container");

    // Hide all first
    lobbyPanel?.classList.add("hidden");
    cfPanel?.classList.add("hidden");
    hlPanel?.classList.add("hidden");
    qdPanel?.classList.add("hidden");
    synPanel?.classList.add("hidden");
    minesPanel?.classList.add("hidden");
    dicePanel?.classList.add("hidden");
    extraPanel?.classList.add("hidden");

    // Stop active intervals to avoid multiple loops running
    if (this.quickDrawTimerInterval) {
      clearInterval(this.quickDrawTimerInterval);
      this.quickDrawTimerInterval = null;
    }

    const extraGamesList = ["crash", "plinko", "penalty", "tower", "wheel", "keno", "cricket", "aviator", "shell", "tigerdragon"];

    if (this.activeSubTab === "lobby") {
      lobbyPanel?.classList.remove("hidden");
      backBtn?.classList.add("hidden");
      ledgerContainer?.classList.add("hidden");
    } else {
      backBtn?.classList.remove("hidden");
      ledgerContainer?.classList.remove("hidden");

      if (this.activeSubTab === "coinflip") {
        cfPanel?.classList.remove("hidden");
        CoinFlipGame.state.isFlipping = false;
        this.renderRecentLedger(appInstance);
      } else if (this.activeSubTab === "highlow") {
        hlPanel?.classList.remove("hidden");
        HighLowGame.renderView(appInstance);
        this.renderRecentLedger(appInstance);
      } else if (this.activeSubTab === "quickdraw") {
        qdPanel?.classList.remove("hidden");
        QuickDrawGame.renderView(appInstance);
        this.renderRecentLedger(appInstance);
      } else if (this.activeSubTab === "syndicate") {
        synPanel?.classList.remove("hidden");
        SyndicateGame.renderView(appInstance);
        this.renderRecentLedger(appInstance);
      } else if (this.activeSubTab === "mines") {
        minesPanel?.classList.remove("hidden");
        MinesGame.renderGrid(false);
        MinesGame.renderButtons();
        MinesGame.updateMultiplierPreview();
        this.renderRecentLedger(appInstance);
      } else if (this.activeSubTab === "dice") {
        dicePanel?.classList.remove("hidden");
        DiceRollGame.updateStatePreview();
        this.renderRecentLedger(appInstance);
      } else if (extraGamesList.includes(this.activeSubTab)) {
        extraPanel?.classList.remove("hidden");
        ExtraGamesModule.renderGame(appInstance, this.activeSubTab);
        this.renderRecentLedger(appInstance);
      }
    }
  },

  renderCoinFlipView(appInstance) {
    const flipBtn = document.getElementById("games-coinflip-play-btn");
    if (flipBtn && !this.isFlipping) {
      flipBtn.disabled = false;
      flipBtn.innerText = "Flip Coin now!";
      flipBtn.className = "w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 rounded-xl text-xs text-white font-extrabold shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-purple-400/20 block font-mono";
    }
    this.renderRecentLedger(appInstance);
  },

  renderHighLowView(appInstance) {
    const cardRankTop = document.getElementById("card-rank-top");
    const cardRankBottom = document.getElementById("card-rank-bottom");
    const cardRankCenter = document.getElementById("card-rank-center");
    const cardSuitTop = document.getElementById("card-suit-top");
    const cardSuitBottom = document.getElementById("card-suit-bottom");
    const hlCurrentInfo = document.getElementById("hl-current-info");

    const redSuits = ["♥", "♦"];
    const isRed = redSuits.includes(this.currentCard.suit);

    if (cardRankTop) cardRankTop.innerText = this.currentCard.label;
    if (cardRankBottom) cardRankBottom.innerText = this.currentCard.label;
    if (cardRankCenter) cardRankCenter.innerText = this.currentCard.label;
    if (cardSuitTop) {
      cardSuitTop.innerText = this.currentCard.suit;
      cardSuitTop.className = isRed ? "text-xs font-black text-rose-500" : "text-xs font-black text-indigo-400";
    }
    if (cardSuitBottom) {
      cardSuitBottom.innerText = this.currentCard.suit;
      cardSuitBottom.className = isRed ? "text-xs font-black text-rose-500" : "text-xs font-black text-indigo-400";
    }

    if (hlCurrentInfo) {
      let cardName = this.currentCard.label;
      if (this.currentCard.label === "J") cardName = "Jack (11)";
      else if (this.currentCard.label === "Q") cardName = "Queen (12)";
      else if (this.currentCard.label === "K") cardName = "King (13)";
      else if (this.currentCard.label === "A") cardName = "Ace (14)";
      else cardName = `${this.currentCard.label} (Rank ${this.currentCard.rank})`;

      hlCurrentInfo.innerHTML = `<span class="${isRed ? 'text-rose-400' : 'text-indigo-400'} font-black">${cardName}${this.currentCard.suit}</span>`;
    }
    this.renderRecentLedger(appInstance);
  },

  renderRecentLedger(appInstance) {
    if (!appInstance.currentUser) return;
    const historyContainer = document.getElementById("games-history-logs-container");
    const totalPlayedEl = document.getElementById("games-total-played");

    const myGames = (appInstance.db.gamesLedger || []).filter(g => g.userId === appInstance.currentUser.id);

    if (totalPlayedEl) {
      totalPlayedEl.innerText = `${myGames.length} Play${myGames.length !== 1 ? 's' : ''}`;
    }

    if (historyContainer) {
      if (myGames.length === 0) {
        historyContainer.innerHTML = `<div class="text-[9.5px] text-slate-600 text-center py-4">No games played yet. Start flipping or drawing to fill ledger!</div>`;
      } else {
        historyContainer.innerHTML = myGames.slice(0, 10).map(game => {
          const isWin = game.status === "won";
          const isTie = game.status === "tie";
          const statusText = isTie ? "TIE" : (isWin ? "WIN" : "LOSE");
          const statusColor = isTie ? "text-slate-400 bg-slate-900 border-slate-800" : (isWin ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/30" : "text-rose-400 bg-rose-950/40 border-rose-900/30");
          const formattedDate = new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return `
            <div class="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded-xl text-[9.5px]">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded text-[8px] font-black border ${statusColor}">${statusText}</span>
                <div class="flex flex-col text-left">
                  <span class="text-white font-bold">${game.gameType}: Choose ${game.choice}</span>
                  <span class="text-[7.5px] text-slate-500">${formattedDate} (Result: ${game.result})</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-slate-400 font-bold block">Bet: ৳${game.bet}</span>
                <span class="${isWin ? "text-emerald-400" : "text-slate-500"} font-black text-[8.5px]">
                  ${isTie ? "৳0.0" : (isWin ? "+৳" + game.payout.toFixed(1) : "-৳" + game.bet.toFixed(1))}
                </span>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  },

  renderQuickDrawView(appInstance) {
    const activeQuick = appInstance.db.lotteries.find(l => l.category === "Quick Draw" && l.status === "active");
    const container = document.getElementById("quickdraw-draw-card-container");
    if (!container) return;

    if (!activeQuick) {
      container.innerHTML = `
        <div class="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl text-center space-y-3 shadow-md">
          <div class="animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-xs text-slate-500 font-mono">Spawning next high-speed Quick Draw pool...</p>
        </div>
      `;
      appInstance.checkAndExecuteAutoDraws();
      return;
    }

    const progress = Math.min(100, Math.round((activeQuick.soldTickets / activeQuick.totalTickets) * 100));
    const myTickets = appInstance.db.tickets.filter(t => t.lotteryId === activeQuick.id && t.userId === appInstance.currentUser?.id && t.status === "pending");

    const pastQuickDraws = appInstance.db.lotteries.filter(l => l.category === "Quick Draw" && l.status === "drawn")
      .sort((a,b) => new Date(b.drawTime).getTime() - new Date(a.drawTime).getTime())
      .slice(0, 6);

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Live High-Speed Countdown Arena -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-rose-955/30 border border-rose-500/20 p-5 rounded-3xl text-center space-y-5 shadow-xl relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div class="space-y-1">
            <span class="bg-rose-500/10 text-rose-500 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-500/20 inline-block font-mono">
              ⚡ কুইক লটারি (1-Min High Frequency)
            </span>
            <h2 class="text-xs font-black text-white mt-1">${activeQuick.name}</h2>
            <p class="text-[9.5px] text-slate-400 max-w-xs mx-auto">অটোমেটিক ড্র হবে প্রতি ১ মিনিট পর পর। সুপারফাস্ট ১-ক্লিক ড্র গেম!</p>
          </div>

          <!-- Dynamic Live Timer -->
          <div class="bg-slate-950 border border-slate-900 max-w-xs mx-auto py-3 px-4 rounded-2xl shadow-inner text-center">
            <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Time Remaining until Draw</span>
            <div id="games-quickdraw-timer" class="text-2xl font-black text-rose-500 tracking-tight font-mono">
              ⏱ Calculating...
            </div>
          </div>

          <!-- Payout grid -->
          <div class="max-w-xs mx-auto text-center">
            <div class="bg-slate-950/50 py-2 px-4 rounded-xl border border-slate-900 inline-block">
              <span class="text-[9px] text-slate-500 font-mono block mb-0.5">Ticket Cost</span>
              <strong class="text-xs text-rose-400 font-mono">৳${activeQuick.entryFee} Taka</strong>
            </div>
          </div>

          <!-- Action block -->
          <div class="space-y-2.5 pt-1">
            <button id="games-quick-buy-btn" class="w-full max-w-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-[10.5px] font-black py-2.5 rounded-xl transition cursor-pointer active:scale-97 hover:shadow-lg hover:shadow-rose-500/10 border border-rose-400/20">
              🎟️ Buy ticket for ৳${activeQuick.entryFee} Taka
            </button>

            <!-- Personal purchased indicators -->
            <div class="space-y-1">
              <span class="text-[8.5px] font-mono text-slate-500 block">আপনার টিকেটসমূহ (This Draw):</span>
              <div class="flex flex-wrap justify-center gap-1">
                ${myTickets.map(t => `
                  <span class="bg-rose-950/40 text-rose-400 text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-md border border-rose-900/40">
                    🎟️ ${t.code}
                  </span>
                `).join("")}
                ${myTickets.length === 0 ? `
                  <span class="text-[8px] text-slate-600 italic">কোনো টিকেট কেনা হয়নি</span>
                ` : ""}
              </div>
            </div>
          </div>
        </div>

        <!-- Feed of Past Winners -->
        <div class="space-y-2.5 font-mono">
          <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="fa-solid fa-trophy text-amber-500"></i> Past Quick Draw Winners
          </h3>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60 shadow-md">
            ${pastQuickDraws.map(l => {
              const drawTicket = appInstance.db.tickets.find(t => t.lotteryId === l.id && t.status === "won");
              let winnerName = "No active tickets sold";
              if (drawTicket) {
                const wUser = appInstance.db.users.find(u => u.id === drawTicket.userId);
                winnerName = wUser ? `@${wUser.username}` : "Anonymous Player";
              }
              const drawDateStr = new Date(l.drawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return `
                <div class="flex items-center justify-between p-2.5 text-[9.5px] bg-slate-950/30">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <div class="flex flex-col text-left">
                      <strong class="text-white">${l.name.split(" ")[0]} ${l.id.slice(-4)}</strong>
                      <span class="text-[7.5px] text-slate-500">Drawn at: ${drawDateStr}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-emerald-400 font-extrabold block">৳${(l.prizeAmount ?? l.prizePool ?? 0).toFixed(1)}</span>
                    <span class="text-slate-400 text-[8px] font-bold block">${winnerName}</span>
                  </div>
                </div>
              `;
            }).join("")}

            ${pastQuickDraws.length === 0 ? `
              <div class="p-6 text-center text-slate-500 text-[9px]">Completed Draw records will occupy here shortly...</div>
            ` : ""}
          </div>
        </div>
      </div>
    `;

    // Start Live countdown timer loop for Quick Draw
    const updateGamesTimer = () => {
      const timerEl = document.getElementById("games-quickdraw-timer");
      if (!timerEl) {
        clearInterval(this.quickDrawTimerInterval);
        this.quickDrawTimerInterval = null;
        return;
      }

      const now = Date.now();
      const drawTime = new Date(activeQuick.drawTime).getTime();
      const diff = drawTime - now;

      if (diff <= 0) {
        timerEl.innerText = "DRAWING NOW... ⏳";
        clearInterval(this.quickDrawTimerInterval);
        this.quickDrawTimerInterval = null;

        setTimeout(() => {
          appInstance.checkAndExecuteAutoDraws();
          this.renderQuickDrawView(appInstance);
        }, 1000);
      } else {
        const totalSeconds = Math.ceil(diff / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        timerEl.innerText = `⏱ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    };

    updateGamesTimer();
    this.quickDrawTimerInterval = setInterval(updateGamesTimer, 1000);
    this.renderRecentLedger(appInstance);
  },

  renderSyndicateView(appInstance) {
    const container = document.getElementById("syndicate-gameplay-container");
    if (!container) return;

    // Get lists of syndicates and user syndicates
    const pendingSyndicates = (appInstance.db.syndicates || []).filter(s => s.status === "pending");
    const mySyndicates = (appInstance.db.syndicates || []).filter(s => s.joinedUserIds.includes(appInstance.currentUser?.id));

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Syndicate Intro Banner -->
        <div class="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/20 p-4 rounded-3xl relative overflow-hidden text-center md:text-left space-y-1.5">
          <div class="absolute -right-10 -top-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <span class="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block font-mono">👥 Syndicate Play</span>
          <h2 class="text-xs font-black text-white">গ্রুপ লটারি (Syndicate Mode)</h2>
          <p class="text-[9.5px] text-slate-300 leading-normal font-sans">
            ২ বা ৩ জন বন্ধু মিলে টাকা পুল (Pool) করে একসাথে একটি বড় টিকিট কিনুন! জিতলে পুরস্কারের টাকা সবার মাঝে সমানভাবে ভাগ হয়ে যাবে। জয়ের সম্ভাবনাও বাড়বে এবং টিকিট কেনার খরচও ভাগ হয়ে যাবে!
          </p>
        </div>

        <!-- Create & Join forms -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Create Syndicate Form -->
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2.5xl space-y-3 shadow-md text-left font-sans">
            <h3 class="text-[10.5px] font-bold text-white flex items-center gap-1.5 uppercase font-mono"><i class="fa-solid fa-circle-plus text-red-500"></i> Create Syndicate</h3>
            
            <div class="space-y-2 text-[9.5px]">
              <div>
                <label class="text-slate-400 block mb-1">গ্রুপের নাম (Custom Name)</label>
                <input type="text" id="games-syn-create-name" placeholder="যেমন: ঢাকা লাকি বয়েজ" class="w-full text-xs text-white bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-red-500" />
              </div>
              
              <div>
                <label class="text-slate-400 block mb-1">লটারি সিলেক্ট করুন (Target Draw)</label>
                <select id="games-syn-create-lottery" class="w-full text-xs text-white bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 outline-none focus:border-red-500">
                  ${appInstance.db.lotteries.filter(l => l.category !== "Quick Draw" && l.status === "active").map(l => `
                    <option value="${l.id}">${l.name} (৳${l.entryFee || 0} Entry, Prize: ৳${l.prizeAmount || l.prizePool || 0})</option>
                  `).join("")}
                </select>
              </div>

              <div>
                <label class="text-slate-400 block mb-1">গ্রুপ মেম্বার সাইজ (Total Seats)</label>
                <select id="games-syn-create-size" class="w-full text-xs text-white bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 outline-none focus:border-red-500">
                  <option value="2">২ জন বন্ধু (৫০% খরচ ভাগ)</option>
                  <option value="3" selected>৩ জন বন্ধু (৩৩.৩% খরচ ভাগ)</option>
                </select>
              </div>

              <button id="games-syn-btn-create" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer active:scale-97 block font-mono mt-2 shadow-md">
                Create Group & Pay Share 🚀
              </button>
            </div>
          </div>

          <!-- Join Syndicate Form -->
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2.5xl space-y-3 shadow-md text-left font-sans flex flex-col justify-between">
            <div class="space-y-3">
              <h3 class="text-[10.5px] font-bold text-white flex items-center gap-1.5 uppercase font-mono"><i class="fa-solid fa-circle-right text-cyan-400"></i> Join Syndicate</h3>
              <p class="text-[9.5px] text-slate-500 leading-normal">Have a syndicate group invitation code? Enter the 6-character secure hash code below to pool balances and buy seats instantly.</p>
              
              <div>
                <label class="text-[9.5px] text-slate-400 block mb-1">গ্রুপ কোড (Secure 6-Char Hash)</label>
                <input type="text" id="games-syn-join-code" placeholder="যেমন: SYN92K" class="w-full text-xs text-center font-mono font-black text-cyan-400 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-cyan-500" />
              </div>
            </div>

            <button id="games-syn-btn-join" class="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer active:scale-97 block font-mono mt-3 shadow-md">
              Join Group & Pay Share 👥
            </button>
          </div>
        </div>

        <!-- Syndicate Lobby List -->
        <div class="space-y-2.5 text-left">
          <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5"><i class="fa-solid fa-users-viewfinder"></i> Pending Groups Lobby (${pendingSyndicates.length} Open)</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            ${pendingSyndicates.map(s => {
              const lot = appInstance.db.lotteries.find(l => l.id === s.lotteryId);
              if (!lot) return "";
              const seatsLeft = s.size - s.joinedUserIds.length;
              const costPerMember = Math.round((lot.entryFee / s.size) * 100) / 100;

              return `
                <div class="bg-slate-950 border border-slate-900 rounded-2xl p-3.5 space-y-3 font-mono">
                  <div class="flex justify-between items-start">
                    <div class="text-left">
                      <strong class="text-white text-xs block truncate max-w-[150px] font-sans">${s.name || 'Friend Group'}</strong>
                      <span class="text-[8px] text-slate-500 block truncate max-w-[150px]">${lot.name}</span>
                    </div>
                    <span class="text-[8.5px] font-black text-cyan-400 bg-cyan-950/50 border border-cyan-800/30 px-2 py-0.5 rounded-lg">Code: ${s.code}</span>
                  </div>

                  <div class="flex justify-between items-center text-[9px] border-t border-dashed border-slate-900 pt-2 text-slate-400">
                    <div>
                      <span class="block text-[7.5px] text-slate-500">Cost/Member</span>
                      <strong class="text-white">৳${costPerMember}</strong>
                    </div>
                    <div>
                      <span class="block text-[7.5px] text-slate-500">Seats Taken</span>
                      <strong class="text-emerald-400">${s.joinedUserIds.length} / ${s.size}</strong>
                    </div>
                    <div>
                      <span class="block text-[7.5px] text-slate-500">Draw Prize</span>
                      <strong class="text-yellow-400">৳${lot.prizeAmount || lot.prizePool || 0}</strong>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <button class="games-syn-copy-btn bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-1.5 rounded-lg transition cursor-pointer text-[8.5px] flex items-center justify-center gap-1 active:scale-95" data-code="${s.code}">
                      <i class="fa-solid fa-copy"></i> Copy Code
                    </button>
                    <button class="games-syn-join-action-btn bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-1.5 rounded-lg transition cursor-pointer text-[8.5px] flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-500/5" data-id="${s.id}">
                      <i class="fa-solid fa-circle-check"></i> Join Spot
                    </button>
                  </div>
                </div>
              `;
            }).join("")}

            ${pendingSyndicates.length === 0 ? `
              <div class="col-span-full bg-slate-900/30 border border-slate-850 p-6 rounded-2xl text-center text-slate-500 text-[9.5px]">No pending syndicates in lobby. Create the first one above! 👥</div>
            ` : ""}
          </div>
        </div>

        <!-- My Syndicates History -->
        <div class="space-y-2.5 text-left font-mono">
          <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><i class="fa-solid fa-list-check"></i> My Syndicates History</h3>
          
          <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md divide-y divide-slate-800/60">
            ${mySyndicates.map(s => {
              const lot = appInstance.db.lotteries.find(l => l.id === s.lotteryId);
              if (!lot) return "";
              
              let statusLabel = "";
              let statusColor = "";
              if (s.status === "pending") {
                statusLabel = "Funding";
                statusColor = "text-cyan-400 bg-cyan-950/40 border-cyan-800/35";
              } else if (s.status === "active") {
                statusLabel = "Active Draw";
                statusColor = "text-yellow-400 bg-yellow-950/40 border-yellow-850/35";
              } else if (s.status === "drawn") {
                const winningTicket = appInstance.db.tickets.find(t => t.lotteryId === s.lotteryId && t.isSyndicate && t.syndicateId === s.id && t.status === "won");
                if (winningTicket) {
                  const share = Math.round((winningTicket.prizeAmount / s.size) * 100) / 100;
                  statusLabel = `Won (৳${share} Split)`;
                  statusColor = "text-emerald-400 bg-emerald-950/40 border-emerald-900/30";
                } else {
                  statusLabel = "Drawn (Loss)";
                  statusColor = "text-slate-400 bg-slate-950 border-slate-800";
                }
              }

              return `
                <div class="flex items-center justify-between p-3 text-[9.5px]">
                  <div class="text-left space-y-0.5">
                    <strong class="text-white text-xs font-sans block">${s.name || 'Friend Group'}</strong>
                    <span class="text-[8px] text-slate-500 block truncate max-w-[180px]">${lot.name}</span>
                  </div>
                  <div class="text-right flex flex-col items-end gap-1">
                    <span class="px-2 py-0.5 rounded-lg border text-[8.5px] font-bold ${statusColor}">${statusLabel}</span>
                    <span class="text-[7.5px] text-slate-500">Seats: ${s.joinedUserIds.length}/${s.size} members</span>
                  </div>
                </div>
              `;
            }).join("")}

            ${mySyndicates.length === 0 ? `
              <div class="p-6 text-center text-slate-500 text-[9.5px]">You have not created or joined any group syndicates yet.</div>
            ` : ""}
          </div>
        </div>
      </div>
    `;

    // Bind Syndicate event listeners manually
    const btnCreate = document.getElementById("games-syn-btn-create");
    if (btnCreate) {
      btnCreate.addEventListener("click", () => {
        const nameInput = document.getElementById("games-syn-create-name");
        const lotSelect = document.getElementById("games-syn-create-lottery");
        const sizeSelect = document.getElementById("games-syn-create-size");

        if (!lotSelect || !sizeSelect) return;
        const lotId = lotSelect.value;
        const size = parseInt(sizeSelect.value);
        const name = nameInput ? nameInput.value.trim() : "";

        appInstance.createSyndicate(lotId, size, name);
        this.renderSyndicateView(appInstance); // Re-render immediately
      });
    }

    const btnJoin = document.getElementById("games-syn-btn-join");
    if (btnJoin) {
      btnJoin.addEventListener("click", () => {
        const codeInput = document.getElementById("games-syn-join-code");
        if (!codeInput) return;
        const code = codeInput.value.trim();
        if (!code) {
          appInstance.showToast("Please enter a syndicate group code!", "error");
          return;
        }
        appInstance.joinSyndicateByCode(code);
        this.renderSyndicateView(appInstance);
      });
    }

    document.querySelectorAll(".games-syn-copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const code = e.currentTarget.getAttribute("data-code");
        navigator.clipboard.writeText(code).then(() => {
          appInstance.showToast(`Code ${code} copied to clipboard! Share with friends!`, "success");
        });
      });
    });

    document.querySelectorAll(".games-syn-join-action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const synId = e.currentTarget.getAttribute("data-id");
        appInstance.joinSyndicateById(synId);
        this.renderSyndicateView(appInstance);
      });
    });

    this.renderRecentLedger(appInstance);
  }
};

window.GameHubModule = GameHubModule;
