/**
 * Lottery Winner - Extra Premium Arcade Games Module (extraGames.js)
 * 
 * Includes 10 trending game modes:
 * 1. Rocket Fly (Crash)
 * 2. Plinko Ball Drop
 * 3. Football Penalty Shootout
 * 4. Tower Legend
 * 5. Wheel of Fortune
 * 6. Super Match Keno
 * 7. Cricket Sixer Hit
 * 8. Aviator Jet Ride
 * 9. Three Shell Cups
 * 10. Tiger vs Dragon
 * 
 * Each game applies a 5% platform commission to winning payouts.
 */

import { FloatingToastNotification } from "../floating_toast.js";

export const ExtraGamesModule = {
  activeGame: null, // "crash", "plinko", etc.
  gameState: {},
  app: null,

  init(appInstance) {
    this.app = appInstance;
    console.log("ExtraGamesModule initialized successfully with 10 Premium games.");
  },

  renderGame(appInstance, gameKey) {
    this.app = appInstance;

    const container = document.getElementById("game-extragames-panel");
    if (!container) return;

    // Hide other panels
    ["game-lobby-panel", "game-coinflip-panel", "game-highlow-panel", "game-quickdraw-panel", "game-syndicate-panel", "game-mines-panel", "game-dice-panel"].forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });

    container.classList.remove("hidden");

    // Only rebuild DOM if active game changed or container is empty
    if (this.activeGame !== gameKey || container.children.length === 0) {
      if (this.gameState && this.gameState.interval) {
        clearInterval(this.gameState.interval);
      }

      this.activeGame = gameKey;
      this.gameState = {};

      let html = "";
      switch (gameKey) {
        case "crash":
          html = this.getCrashTemplate();
          break;
        case "plinko":
          html = this.getPlinkoTemplate();
          break;
        case "penalty":
          html = this.getPenaltyTemplate();
          break;
        case "tower":
          html = this.getTowerTemplate();
          break;
        case "wheel":
          html = this.getWheelTemplate();
          break;
        case "keno":
          html = this.getKenoTemplate();
          break;
        case "cricket":
          html = this.getCricketTemplate();
          break;
        case "aviator":
          html = this.getAviatorTemplate();
          break;
        case "shell":
          html = this.getShellTemplate();
          break;
        case "tigerdragon":
          html = this.getTigerDragonTemplate();
          break;
        default:
          html = `<div class="text-center py-10 text-slate-500 font-mono text-xs">Unknown game selection.</div>`;
      }

      container.innerHTML = html;
      this.bindGameEvents(gameKey);
    }
  },

  bindGameEvents(gameKey) {
    switch (gameKey) {
      case "crash":
        this.bindCrashEvents();
        break;
      case "plinko":
        this.bindPlinkoEvents();
        break;
      case "penalty":
        this.bindPenaltyEvents();
        break;
      case "tower":
        this.bindTowerEvents();
        break;
      case "wheel":
        this.bindWheelEvents();
        break;
      case "keno":
        this.bindKenoEvents();
        break;
      case "cricket":
        this.bindCricketEvents();
        break;
      case "aviator":
        this.bindAviatorEvents();
        break;
      case "shell":
        this.bindShellEvents();
        break;
      case "tigerdragon":
        this.bindTigerDragonEvents();
        break;
    }
  },

  // Helper to safely fetch bet amount
  getBetAmount(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return 10;
    return Math.max(5, Math.floor(parseFloat(el.value) || 10));
  },

  // Helper to adjust bet quantity buttons
  handleBetAdjustment(op, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !this.app.currentUser) return;
    let currentBet = parseFloat(input.value) || 10;
    if (op === "half") currentBet = Math.max(5, currentBet / 2);
    else if (op === "double") currentBet = Math.min(1000, currentBet * 2);
    else if (op === "min") currentBet = 5;
    else if (op === "max") currentBet = Math.min(1000, this.app.currentUser.balance);
    input.value = Math.floor(currentBet);
  },

  // Helper to deduct bet from user's balance
  deductBalance(amount) {
    if (!this.app.currentUser) return false;
    if (this.app.currentUser.balance < amount) {
      this.app.showToast("Inadequate wallet balance. Please add money!", "error");
      return false;
    }
    this.app.currentUser.balance -= amount;
    this.app.currentUser.loss = (this.app.currentUser.loss || 0) + amount;
    this.app.saveDB();
    this.app.render();
    return true;
  },

  // Helper to credit winnings with 5% commission deducted
  creditWinnings(winAmount, betAmount, gameName, choiceLabel, resultLabel) {
    if (!this.app.currentUser) return;
    
    // Win calculation with 5% commission
    const profit = winAmount - betAmount;
    let netWin = winAmount;
    if (profit > 0) {
      const commission = profit * 0.05;
      netWin = winAmount - commission;
    }

    this.app.currentUser.balance += netWin;
    this.app.currentUser.profit = (this.app.currentUser.profit || 0) + (netWin - betAmount);
    this.app.saveDB();
    this.app.render();

    // Add to games ledger
    if (!this.app.db.gamesLedger) {
      this.app.db.gamesLedger = [];
    }
    this.app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: this.app.currentUser.id,
      username: this.app.currentUser.username,
      gameType: gameName,
      bet: betAmount,
      choice: choiceLabel,
      status: netWin > betAmount ? "won" : "lost",
      result: resultLabel,
      payout: netWin,
      date: new Date().toISOString()
    });

    // Save and re-render recent log list
    this.app.saveDB();
    
    // Try to trigger history update in GameHubModule if imported
    const ledgerContainer = document.getElementById("games-history-logs-container");
    if (ledgerContainer && window.GameHubModule) {
      window.GameHubModule.renderRecentLedger(this.app);
    } else {
      this.renderEmbeddedRecentLedger();
    }

    return netWin;
  },

  // Helper to credit a loss
  creditLoss(betAmount, gameName, choiceLabel, resultLabel) {
    if (!this.app.currentUser) return;

    if (!this.app.db.gamesLedger) {
      this.app.db.gamesLedger = [];
    }
    this.app.db.gamesLedger.unshift({
      id: "game-" + Date.now(),
      userId: this.app.currentUser.id,
      username: this.app.currentUser.username,
      gameType: gameName,
      bet: betAmount,
      choice: choiceLabel,
      status: "lost",
      result: resultLabel,
      payout: 0,
      date: new Date().toISOString()
    });

    this.app.saveDB();

    const ledgerContainer = document.getElementById("games-history-logs-container");
    if (ledgerContainer && window.GameHubModule) {
      window.GameHubModule.renderRecentLedger(this.app);
    } else {
      this.renderEmbeddedRecentLedger();
    }
  },

  renderEmbeddedRecentLedger() {
    if (!this.app.currentUser) return;
    const historyContainer = document.getElementById("games-history-logs-container");
    const totalPlayedEl = document.getElementById("games-total-played");
    if (!historyContainer) return;

    const myGames = (this.app.db.gamesLedger || []).filter(g => g.userId === this.app.currentUser.id);
    if (totalPlayedEl) {
      totalPlayedEl.innerText = `${myGames.length} Play${myGames.length !== 1 ? 's' : ''}`;
    }

    if (myGames.length === 0) {
      historyContainer.innerHTML = `<div class="text-[9.5px] text-slate-600 text-center py-4">No games played yet.</div>`;
    } else {
      historyContainer.innerHTML = myGames.slice(0, 5).map(game => {
        const isWin = game.status === "won";
        const statusText = isWin ? "WIN" : "LOSE";
        const statusColor = isWin ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/30" : "text-rose-400 bg-rose-950/40 border-rose-900/30";
        return `
          <div class="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded-xl text-[9.5px]">
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded text-[8px] font-black border ${statusColor}">${statusText}</span>
              <div class="flex flex-col text-left">
                <span class="text-white font-bold">${game.gameType}: ${game.choice}</span>
                <span class="text-[7.5px] text-slate-500">Result: ${game.result}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-slate-400 font-bold block">Bet: ৳${game.bet}</span>
              <span class="${isWin ? "text-emerald-400" : "text-slate-500"} font-black text-[8.5px]">
                ${isWin ? "+৳" + game.payout.toFixed(1) : "-৳" + game.bet.toFixed(1)}
              </span>
            </div>
          </div>
        `;
      }).join("");
    }
  },


  // =========================================================================
  // 1. ROCKET FLY (CRASH) GAME
  // =========================================================================
  getCrashTemplate() {
    return `
      <div class="bg-gradient-to-b from-red-955/20 to-slate-950 border border-red-900/20 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
        <div class="absolute -right-20 -top-20 w-40 h-40 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>

        <div class="flex flex-col gap-5">
          <!-- Visual Screen -->
          <div class="bg-slate-950 border border-slate-900 rounded-2.5xl p-6 flex flex-col items-center justify-center text-center relative h-48 overflow-hidden">
            <span class="text-[8px] text-slate-500 uppercase tracking-wider block font-bold mb-1 font-mono">Rocket Live Multiplier</span>
            
            <!-- Animated Rocket and Chart Area -->
            <div id="crash-rocket-area" class="relative w-full h-24 flex items-center justify-center">
              <div id="crash-rocket" class="absolute bottom-2 left-4 text-3xl transition-all duration-100 ease-out">🚀</div>
              <div id="crash-multiplier-text" class="text-4xl font-black text-red-500 font-mono tracking-tight animate-pulse">1.00x</div>
            </div>

            <div id="crash-status-bar" class="text-[9px] text-slate-400 font-mono mt-2">Ready for Lift Off</div>
          </div>

          <!-- Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[8px] text-slate-500 uppercase font-bold block font-mono">Bet Amount (৳)</label>
              <div class="flex items-center bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5">
                <span class="text-slate-500 text-xs font-bold mr-1.5">৳</span>
                <input type="number" id="crash-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="crash-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px]" data-op="half">½x</button>
                <button class="crash-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px]" data-op="double">2x</button>
                <button class="crash-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px]" data-op="min">Min</button>
                <button class="crash-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px]" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="crash-btn-start" class="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-lg active:scale-95 transition cursor-pointer border border-red-500/20">
                Launch Rocket 🚀
              </button>
              <button id="crash-btn-cashout" class="hidden w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-lg active:scale-95 transition cursor-pointer border border-emerald-500/20">
                Cash Out Now ৳<span id="crash-cashout-val">0.00</span>
              </button>
            </div>
          </div>

          <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center text-[8px] text-slate-500 font-mono">
            Platform Commission: 5% deducted on net profit. Cash out before explosion!
          </div>
        </div>
      </div>
    `;
  },

  bindCrashEvents() {
    const startBtn = document.getElementById("crash-btn-start");
    const cashBtn = document.getElementById("crash-btn-cashout");
    const multText = document.getElementById("crash-multiplier-text");
    const statusBar = document.getElementById("crash-status-bar");
    const rocket = document.getElementById("crash-rocket");
    const cashVal = document.getElementById("crash-cashout-val");

    document.querySelectorAll(".crash-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "crash-bet-amount");
      });
    });

    startBtn.addEventListener("click", () => {
      const bet = this.getBetAmount("crash-bet-amount");
      if (!this.deductBalance(bet)) return;

      this.gameState = {
        running: true,
        bet: bet,
        mult: 1.00,
        crashPoint: (1.1 + Math.random() * 8.5).toFixed(2), // Random crash point up to 9.6
        interval: null
      };

      startBtn.classList.add("hidden");
      cashBtn.classList.remove("hidden");
      statusBar.innerText = "Rocket launched! Flying...";
      statusBar.className = "text-[9px] text-yellow-400 font-mono mt-2";
      multText.className = "text-4xl font-black text-yellow-400 font-mono tracking-tight";

      this.gameState.interval = setInterval(() => {
        if (!this.gameState.running) return;

        this.gameState.mult += 0.05 + (this.gameState.mult * 0.02); // exponential increase speed
        multText.innerText = this.gameState.mult.toFixed(2) + "x";

        // Move rocket visually
        const xPos = Math.min(80, (this.gameState.mult - 1) * 10);
        const yPos = Math.min(80, (this.gameState.mult - 1) * 12);
        if (rocket) {
          rocket.style.left = `${10 + xPos}%`;
          rocket.style.bottom = `${10 + yPos}%`;
        }

        if (cashVal) {
          cashVal.innerText = (this.gameState.bet * this.gameState.mult).toFixed(1);
        }

        // Crash validation
        if (this.gameState.mult >= parseFloat(this.gameState.crashPoint)) {
          clearInterval(this.gameState.interval);
          this.gameState.running = false;
          multText.innerText = "CRASHED! " + this.gameState.crashPoint + "x";
          multText.className = "text-4xl font-black text-rose-500 font-mono tracking-tight animate-bounce";
          statusBar.innerText = "💥 Boom! Exploded at " + this.gameState.crashPoint + "x";
          statusBar.className = "text-[9px] text-rose-500 font-mono mt-2";
          
          if (rocket) {
            rocket.style.transform = "scale(1.5) rotate(90deg)";
            rocket.innerText = "💥";
          }

          this.creditLoss(this.gameState.bet, "Rocket Fly (Crash)", "Auto-Fly", "Crashed at " + this.gameState.crashPoint + "x");
          this.app.showToast("Crashed! Better luck next launch.", "error");

          setTimeout(() => {
            if (rocket) {
              rocket.style.transform = "none";
              rocket.innerText = "🚀";
              rocket.style.left = "10%";
              rocket.style.bottom = "10%";
            }
            startBtn.classList.remove("hidden");
            cashBtn.classList.add("hidden");
            multText.innerText = "1.00x";
            multText.className = "text-4xl font-black text-red-500 font-mono tracking-tight";
            statusBar.innerText = "Ready for Lift Off";
            statusBar.className = "text-[9px] text-slate-500 font-mono mt-2";
          }, 4000);
        }
      }, 100);
    });

    cashBtn.addEventListener("click", () => {
      if (!this.gameState.running) return;
      this.gameState.running = false;
      clearInterval(this.gameState.interval);

      const winMult = this.gameState.mult;
      const payout = this.gameState.bet * winMult;
      const netWin = this.creditWinnings(payout, this.gameState.bet, "Rocket Fly (Crash)", `Cashout ${winMult.toFixed(2)}x`, `Won at ${winMult.toFixed(2)}x`);

      multText.className = "text-4xl font-black text-emerald-400 font-mono tracking-tight";
      statusBar.innerText = `🎉 Successfully Cashed Out ৳${netWin.toFixed(1)}!`;
      statusBar.className = "text-[9px] text-emerald-400 font-mono mt-2";
      this.app.showToast(`Cashed Out successfully! Won ৳${netWin.toFixed(1)}`, "success");

      setTimeout(() => {
        if (rocket) {
          rocket.style.left = "10%";
          rocket.style.bottom = "10%";
        }
        startBtn.classList.remove("hidden");
        cashBtn.classList.add("hidden");
        multText.innerText = "1.00x";
        multText.className = "text-4xl font-black text-red-500 font-mono tracking-tight";
        statusBar.innerText = "Ready for Lift Off";
        statusBar.className = "text-[9px] text-slate-500 font-mono mt-2";
      }, 3000);
    });
  },

  // =========================================================================
  // 2. PLINKO BALL DROP
  // =========================================================================
  getPlinkoTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top Header Bar -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-amber-400 tracking-widest block font-mono">PEGBOARD CASINO ARENA</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-[#f59e0b] fa-circle-dot text-amber-400"></i> Plinko Ball Drop</h3>
          </div>
          <button id="plinko-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 text-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-amber-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-amber-955/20 via-slate-900 to-slate-950 border border-amber-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Pegboard Arena Screen -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <!-- Canvas container -->
            <div class="relative w-full max-w-[340px] h-[300px] flex items-center justify-center">
              <canvas id="plinko-game-canvas" width="340" height="300" class="w-full h-full rounded-2xl"></canvas>
            </div>

            <!-- Buckets / Output Multipliers Display Grid -->
            <div id="plinko-buckets-container" class="grid grid-cols-9 gap-1 w-full max-w-[340px] font-mono text-[8px] sm:text-[9px] text-slate-950 font-black mt-2">
              <!-- Rendered dynamically -->
            </div>

            <div id="plinko-status" class="text-xs font-black text-slate-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Select Risk & Drop the Lucky Ball! 🟡
            </div>
          </div>

          <!-- Risk Selector Grid -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[8px] text-slate-400 font-mono font-bold uppercase">
              <span>Risk Level</span>
              <span id="plinko-risk-mode-label" class="text-emerald-400">LOW RISK</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button class="plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-pointer active:scale-95 transition" data-risk="low">
                Low Risk
              </button>
              <button class="plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="med">
                Medium
              </button>
              <button class="plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="high">
                High Risk
              </button>
            </div>
          </div>

          <!-- Inputs and Betting Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="plinko-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="plinko-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="plinko-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="plinko-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="plinko-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="plinko-btn-drop" class="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-mono text-xs rounded-xl shadow-xl shadow-amber-500/20 transition active:scale-95 cursor-pointer uppercase tracking-wider border border-amber-300/40 flex items-center justify-center gap-2">
                <span>Drop Lucky Ball</span> 🟡
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Fair Play Engine: 5% platform fee on net winnings. Plinko physics uses standard binomial distribution trajectory.
          </div>
        </div>
      </div>
    `;
  },

  bindPlinkoEvents() {
    const dropBtn = document.getElementById("plinko-btn-drop");
    const status = document.getElementById("plinko-status");
    const riskBtns = document.querySelectorAll(".plinko-risk-btn");
    const qtyBtns = document.querySelectorAll(".plinko-qty-btn");
    const canvas = document.getElementById("plinko-game-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let selectedRisk = "low";

    const riskConfigs = {
      low: {
        label: "LOW RISK MODE",
        colorClass: "text-emerald-400",
        mults: [0.5, 1.0, 1.1, 1.2, 1.5, 1.2, 1.1, 1.0, 0.5],
        bgColors: ["#334155", "#0284c7", "#0d9488", "#10b981", "#fbbf24", "#10b981", "#0d9488", "#0284c7", "#334155"]
      },
      med: {
        label: "MEDIUM RISK MODE",
        colorClass: "text-amber-400",
        mults: [0.2, 0.7, 1.2, 2.0, 4.0, 2.0, 1.2, 0.7, 0.2],
        bgColors: ["#e11d48", "#f97316", "#06b6d4", "#10b981", "#a855f7", "#10b981", "#06b6d4", "#f97316", "#e11d48"]
      },
      high: {
        label: "HIGH RISK MODE",
        colorClass: "text-rose-400",
        mults: [0.0, 0.2, 0.5, 3.0, 15.0, 3.0, 0.5, 0.2, 0.0],
        bgColors: ["#1e293b", "#e11d48", "#f97316", "#8b5cf6", "#eab308", "#8b5cf6", "#f97316", "#e11d48", "#1e293b"]
      }
    };

    // Pegboard layout settings: 8 rows
    // Row 0 has 3 pins, Row 7 has 10 pins -> 9 spaces (buckets)
    const rows = 8;
    const startY = 35;
    const rowHeight = 28;

    const getPinsPositions = () => {
      const pins = [];
      const width = canvas.width;
      for (let r = 0; r < rows; r++) {
        const pinCount = r + 3;
        const spacing = 28;
        const startX = (width - (pinCount - 1) * spacing) / 2;
        const y = startY + r * rowHeight;
        for (let c = 0; c < pinCount; c++) {
          const x = startX + c * spacing;
          pins.push({ x, y, r, c, active: false });
        }
      }
      return pins;
    };

    let pins = getPinsPositions();

    const renderPegboard = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw pins
      pins.forEach(pin => {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.active ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = pin.active ? "#fbbf24" : "#94a3b8";
        ctx.shadowColor = pin.active ? "#fbbf24" : "rgba(0,0,0,0.5)";
        ctx.shadowBlur = pin.active ? 10 : 2;
        ctx.fill();
      });
    };

    const renderBucketsUI = () => {
      const container = document.getElementById("plinko-buckets-container");
      if (!container) return;
      const config = riskConfigs[selectedRisk];

      container.innerHTML = config.mults.map((m, idx) => `
        <div id="plinko-bucket-${idx}" class="py-2 px-0.5 rounded-lg text-center transition-all duration-300 shadow-md font-mono font-black" style="background-color: ${config.bgColors[idx]}; color: #ffffff">
          x${m}
        </div>
      `).join("");

      const labelEl = document.getElementById("plinko-risk-mode-label");
      if (labelEl) {
        labelEl.innerText = config.label;
        labelEl.className = config.colorClass + " font-bold";
      }
    };

    renderPegboard();
    renderBucketsUI();

    // Risk selectors
    riskBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        riskBtns.forEach(b => {
          b.className = "plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        btn.className = "plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-pointer active:scale-95 transition";
        selectedRisk = btn.getAttribute("data-risk");
        renderBucketsUI();
      });
    });

    // Quantity controls
    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "plinko-bet-amount");
      });
    });

    // Fullscreen toggle
    const fsBtn = document.getElementById("plinko-fullscreen-toggle-btn");
    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const panel = document.getElementById("game-extragames-panel") || document.getElementById("game-subtab-container");
        if (panel) {
          if (!document.fullscreenElement) {
            panel.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    // Ball animation handler
    let isDropping = false;

    dropBtn.addEventListener("click", () => {
      if (isDropping) return;
      const bet = this.getBetAmount("plinko-bet-amount");
      if (!this.deductBalance(bet)) return;

      isDropping = true;
      dropBtn.disabled = true;
      dropBtn.innerHTML = `<span>Bouncing...</span> 🟡`;

      if (status) {
        status.innerText = "🟡 Ball dropped! Bouncing off pegs...";
        status.className = "text-xs font-black text-amber-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
      }

      // Generate random trajectory (8 steps)
      let currentCol = 0;
      const steps = [];
      for (let r = 0; r < rows; r++) {
        const dir = Math.random() < 0.5 ? 0 : 1; // 0 = left pin, 1 = right pin
        currentCol += dir;
        steps.push(currentCol);
      }

      // Final bucket index is 0 to 8
      const finalBucketIdx = steps[steps.length - 1];
      const curConfig = riskConfigs[selectedRisk];
      const mult = curConfig.mults[finalBucketIdx];

      // Ball animation state
      let currentStep = 0;
      let ballX = canvas.width / 2;
      let ballY = 10;

      const animateStep = () => {
        if (currentStep < rows) {
          const pinCount = currentStep + 3;
          const spacing = 28;
          const startX = (canvas.width - (pinCount - 1) * spacing) / 2;
          const targetCol = steps[currentStep];
          const targetPinX = startX + targetCol * spacing;
          const targetPinY = startY + currentStep * rowHeight;

          ballX = targetPinX;
          ballY = targetPinY - 8;

          // Light up hit pin
          pins.forEach(p => p.active = false);
          const hitPin = pins.find(p => p.r === currentStep && Math.abs(p.x - targetPinX) < 2);
          if (hitPin) hitPin.active = true;

          renderPegboard();

          // Draw active ball
          ctx.beginPath();
          ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#f59e0b";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 12;
          ctx.fill();

          if (navigator.vibrate) navigator.vibrate(15);

          currentStep++;
          setTimeout(animateStep, 180);
        } else {
          // Ball reaches bucket
          pins.forEach(p => p.active = false);
          renderPegboard();

          // Bucket highlight
          const targetBucket = document.getElementById(`plinko-bucket-${finalBucketIdx}`);
          if (targetBucket) {
            targetBucket.className += " scale-110 ring-2 ring-white shadow-xl shadow-amber-500/50 z-10";
            setTimeout(() => {
              renderBucketsUI();
            }, 2000);
          }

          const winAmount = bet * mult;
          if (mult > 1.0) {
            const netWin = this.creditWinnings(winAmount, bet, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `🎉 WON ৳${netWin.toFixed(2)}! Landed on x${mult}`;
              status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
            }
            this.app.showToast(`🎉 Plinko Hit! Won ৳${netWin.toFixed(2)} (x${mult})!`, "success");

            if (mult >= 4.0) {
              this.app.showCongratsSplash("🟡 PLINKO BIG HIT!", `Awesome ball drop! Landed directly in the x${mult} multiplier bucket!`, `৳${netWin.toFixed(2)}`);
            }
          } else if (mult === 1.0) {
            this.creditWinnings(winAmount, bet, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `🤝 Push! Returned ৳${winAmount.toFixed(2)}`;
              status.className = "text-xs font-black text-amber-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 shadow-lg w-full max-w-sm";
            }
            this.app.showToast(`Returned ৳${winAmount.toFixed(2)} (x1.0)`, "info");
          } else {
            this.creditLoss(bet - winAmount, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `💥 Landed on x${mult}. Try another drop!`;
              status.className = "text-xs font-black text-rose-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
            }
            this.app.showToast(`Landed on x${mult}. Better luck next drop!`, "error");
          }

          isDropping = false;
          dropBtn.disabled = false;
          dropBtn.innerHTML = `<span>Drop Lucky Ball</span> 🟡`;
        }
      };

      animateStep();
    });
  },

  // =========================================================================
  // 3. FOOTBALL PENALTY SHOOTOUT
  // =========================================================================
  getPenaltyTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top Header Bar -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-emerald-400 tracking-widest block font-mono">STADIUM FOOTBALL ARENA</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-futbol text-emerald-400"></i> Football Penalty Shootout</h3>
          </div>
          <button id="penalty-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-emerald-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-emerald-955/20 via-slate-900 to-slate-950 border border-emerald-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Stadium Pitch Arena -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold mb-2 font-mono">STADIUM GOALPOST</span>
            
            <!-- Goal Post Frame & Pitch -->
            <div class="relative w-full max-w-[340px] h-52 bg-gradient-to-b from-slate-900 via-emerald-950/40 to-emerald-900/80 rounded-t-2xl border-x-4 border-t-4 border-slate-100 shadow-2xl overflow-hidden flex flex-col items-center justify-between p-2">
              <!-- Goal Net Crosshatch Grid pattern background -->
              <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] opacity-15 pointer-events-none"></div>

              <!-- Goal Target Corners Grid -->
              <div class="relative z-10 grid grid-cols-3 grid-rows-2 gap-2 w-full h-36 p-1">
                <!-- Top Left -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-left" data-mult="1.45">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Left</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.45</span>
                </button>

                <!-- Top Center (or blank space/goalkeeper initial spot) -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-center" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Center</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>

                <!-- Top Right -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-right" data-mult="1.45">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Right</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.45</span>
                </button>

                <!-- Bottom Left -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-left" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Bot Left</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>

                <!-- Bottom Center -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-center" data-mult="1.25">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Center</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.25</span>
                </button>

                <!-- Bottom Right -->
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-right" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Bot Right</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>
              </div>

              <!-- Pitch Line & Penalty Spot -->
              <div class="relative w-full border-t-2 border-slate-200/40 flex items-center justify-center h-10">
                <!-- Goalkeeper representation -->
                <div id="penalty-gk" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl transition-all duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] z-20">
                  🧤
                </div>
                
                <!-- Ball at penalty spot -->
                <div id="penalty-ball" class="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl transition-all duration-300 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] z-30">
                  ⚽
                </div>
              </div>
            </div>

            <!-- Status banner -->
            <div id="penalty-status" class="text-xs font-black text-slate-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Aim at any corner target to strike! ⚽
            </div>
          </div>

          <!-- Live Streak Stats Ledger -->
          <div class="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl text-center font-mono">
            <div>
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Goal Streak</span>
              <span id="penalty-streak-val" class="text-white font-extrabold text-xs">0 Goals</span>
            </div>
            <div class="border-x border-slate-850">
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Multiplier</span>
              <span id="penalty-multiplier-val" class="text-teal-400 font-extrabold text-xs">1.00x</span>
            </div>
            <div>
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Est. Cashout</span>
              <span id="penalty-potential-val" class="text-emerald-400 font-extrabold text-xs">৳0.00</span>
            </div>
          </div>

          <!-- Controls and Cashout Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="penalty-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end gap-1.5">
              <button id="penalty-cashout" class="hidden w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black font-mono text-xs rounded-xl shadow-xl shadow-emerald-500/20 transition cursor-pointer active:scale-95 uppercase tracking-wider border border-emerald-300/40">
                Cash Out ৳<span id="penalty-cash-val">0.00</span> 🏆
              </button>
              <div class="text-[8.5px] text-slate-400 font-mono text-center">Score consecutive goals to multiply your streak! Cash out anytime.</div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            Platform Commission: 5% fee on net profits. Fair random goalkeeper dive engine!
          </div>
        </div>
      </div>
    `;
  },

  bindPenaltyEvents() {
    const corners = document.querySelectorAll(".penalty-corner-btn");
    const gk = document.getElementById("penalty-gk");
    const ball = document.getElementById("penalty-ball");
    const status = document.getElementById("penalty-status");
    const cashBtn = document.getElementById("penalty-cashout");
    const cashVal = document.getElementById("penalty-cash-val");
    const streakVal = document.getElementById("penalty-streak-val");
    const multVal = document.getElementById("penalty-multiplier-val");
    const payoutVal = document.getElementById("penalty-potential-val");
    const fsBtn = document.getElementById("penalty-fullscreen-toggle-btn");

    this.gameState = {
      active: false,
      bet: 10,
      streak: 0,
      multiplier: 1.00
    };

    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const panel = document.getElementById("game-extragames-panel") || document.getElementById("game-subtab-container");
        if (panel) {
          if (!document.fullscreenElement) {
            panel.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    document.querySelectorAll(".penalty-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "penalty-bet-amount");
      });
    });

    const targetCoordinates = {
      "top-left": { ballLeft: "18%", ballBottom: "140px", gkLeft: "18%", gkRotate: "-40deg" },
      "top-center": { ballLeft: "50%", ballBottom: "145px", gkLeft: "50%", gkRotate: "0deg" },
      "top-right": { ballLeft: "82%", ballBottom: "140px", gkLeft: "82%", gkRotate: "40deg" },
      "bottom-left": { ballLeft: "18%", ballBottom: "50px", gkLeft: "18%", gkRotate: "-20deg" },
      "bottom-center": { ballLeft: "50%", ballBottom: "55px", gkLeft: "50%", gkRotate: "0deg" },
      "bottom-right": { ballLeft: "82%", ballBottom: "50px", gkLeft: "82%", gkRotate: "20deg" }
    };

    const targetList = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];

    corners.forEach(btn => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-corner");
        const cornerMult = parseFloat(btn.getAttribute("data-mult") || "1.35");
        const bet = this.getBetAmount("penalty-bet-amount");

        if (!this.gameState.active) {
          if (!this.deductBalance(bet)) return;
          this.gameState.active = true;
          this.gameState.bet = bet;
          this.gameState.streak = 0;
          this.gameState.multiplier = 1.00;
        }

        // Disable corner buttons during shot
        corners.forEach(c => c.disabled = true);

        if (status) {
          status.innerText = "⚽ SHOT IN FLIGHT! Goalkeeper diving...";
          status.className = "text-xs font-black text-amber-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
        }

        // Random goalkeeper dive direction
        const gkDive = targetList[Math.floor(Math.random() * targetList.length)];
        const choiceCoords = targetCoordinates[choice];
        const gkCoords = targetCoordinates[gkDive];

        // Animate goalkeeper dive
        if (gk) {
          gk.style.left = gkCoords.gkLeft;
          gk.style.transform = `rotate(${gkCoords.gkRotate})`;
        }

        // Animate ball trajectory
        if (ball) {
          ball.style.left = choiceCoords.ballLeft;
          ball.style.bottom = choiceCoords.ballBottom;
        }

        if (navigator.vibrate) navigator.vibrate(30);

        setTimeout(() => {
          if (gkDive === choice) {
            // SAVED! Penalty blocked
            if (status) {
              status.innerText = "🧤 BLOCKED! Goalkeeper saved the penalty!";
              status.className = "text-xs font-black text-rose-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
            }
            this.creditLoss(this.gameState.bet, "Penalty Shootout", `Shoot ${choice.toUpperCase()}`, `Blocked by Goalkeeper`);
            this.app.showToast("Blocked! Goalkeeper saved the shot.", "error");

            this.gameState.active = false;
            cashBtn.classList.add("hidden");
            if (streakVal) streakVal.innerText = "0 Goals";
            if (multVal) multVal.innerText = "1.00x";
            if (payoutVal) payoutVal.innerText = "৳0.00";
          } else {
            // GOAL SCORED!
            this.gameState.streak++;
            this.gameState.multiplier *= cornerMult;
            const currentPotential = this.gameState.bet * this.gameState.multiplier;

            if (status) {
              status.innerText = `⚽ GOAL! Streak: ${this.gameState.streak} | Mult: ${this.gameState.multiplier.toFixed(2)}x`;
              status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
            }

            if (streakVal) streakVal.innerText = `${this.gameState.streak} Goal${this.gameState.streak > 1 ? 's' : ''}`;
            if (multVal) multVal.innerText = `${this.gameState.multiplier.toFixed(2)}x`;
            if (payoutVal) payoutVal.innerText = `৳${currentPotential.toFixed(2)}`;

            if (cashVal) cashVal.innerText = currentPotential.toFixed(2);
            cashBtn.classList.remove("hidden");

            this.app.showToast(`⚽ Goal Scored! Streak: ${this.gameState.streak} (x${this.gameState.multiplier.toFixed(2)})`, "success");

            if (this.gameState.streak >= 4) {
              this.app.showCongratsSplash("⚽ PENALTY STREAK KING!", `Incredible ${this.gameState.streak} goals in a row! Current Payout: x${this.gameState.multiplier.toFixed(2)}`, `৳${currentPotential.toFixed(2)}`);
            }
          }

          // Reset ball and goalkeeper visually
          setTimeout(() => {
            if (ball) {
              ball.style.left = "50%";
              ball.style.bottom = "4px";
            }
            if (gk) {
              gk.style.left = "50%";
              gk.style.transform = "none";
            }
            corners.forEach(c => c.disabled = false);

            if (!this.gameState.active) {
              if (status) {
                status.innerText = "Aim at any corner target to strike! ⚽";
                status.className = "text-xs font-black text-slate-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
              }
            }
          }, 1200);

        }, 600);
      });
    });

    cashBtn.addEventListener("click", () => {
      if (!this.gameState.active) return;
      this.gameState.active = false;
      cashBtn.classList.add("hidden");

      const finalPayout = this.gameState.bet * this.gameState.multiplier;
      const netWin = this.creditWinnings(finalPayout, this.gameState.bet, "Penalty Shootout", `Streak ${this.gameState.streak}`, `Won ${this.gameState.multiplier.toFixed(2)}x`);

      if (status) {
        status.innerText = `🏆 Cashed Out ৳${netWin.toFixed(2)}! Great Streak!`;
        status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg w-full max-w-sm";
      }

      this.app.showToast(`🏆 Cashed out penalty streak! Won ৳${netWin.toFixed(2)}`, "success");

      if (streakVal) streakVal.innerText = "0 Goals";
      if (multVal) multVal.innerText = "1.00x";
      if (payoutVal) payoutVal.innerText = "৳0.00";
    });
  },

  // =========================================================================
  // 4. TOWER LEGEND GAME
  // =========================================================================
  getTowerTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top Header Bar -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-cyan-400 tracking-widest block font-mono">TOWER CLIMBER ARENA</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-chess-rook text-cyan-400"></i> Tower Legend</h3>
          </div>
          <button id="tower-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-cyan-955/60 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-cyan-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-cyan-955/20 via-slate-900 to-slate-950 border border-cyan-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Tower Climber Arena Screen -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold mb-3 font-mono">5-TIER FORTRESS TOWER</span>
            
            <!-- Rows stack from top (Row 5) to bottom (Row 1) -->
            <div class="space-y-2.5 w-full max-w-[320px]" id="tower-grid-rows">
              <!-- Row 5 (Top Tier) -->
              <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-2xl border border-slate-800/80 transition-all duration-300 opacity-60" data-row="5">
                <div class="w-16 shrink-0 text-left">
                  <span class="text-[8px] text-amber-400 font-mono font-black block">TIER 5</span>
                  <span class="text-[9px] text-white font-bold font-mono">5.60x</span>
                </div>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="0" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="1" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="2" disabled>?</button>
                </div>
              </div>

              <!-- Row 4 -->
              <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-2xl border border-slate-800/80 transition-all duration-300 opacity-60" data-row="4">
                <div class="w-16 shrink-0 text-left">
                  <span class="text-[8px] text-cyan-400 font-mono font-black block">TIER 4</span>
                  <span class="text-[9px] text-white font-bold font-mono">4.00x</span>
                </div>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="0" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="1" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="2" disabled>?</button>
                </div>
              </div>

              <!-- Row 3 -->
              <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-2xl border border-slate-800/80 transition-all duration-300 opacity-60" data-row="3">
                <div class="w-16 shrink-0 text-left">
                  <span class="text-[8px] text-cyan-400 font-mono font-black block">TIER 3</span>
                  <span class="text-[9px] text-white font-bold font-mono">2.80x</span>
                </div>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="0" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="1" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="2" disabled>?</button>
                </div>
              </div>

              <!-- Row 2 -->
              <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-2xl border border-slate-800/80 transition-all duration-300 opacity-60" data-row="2">
                <div class="w-16 shrink-0 text-left">
                  <span class="text-[8px] text-cyan-400 font-mono font-black block">TIER 2</span>
                  <span class="text-[9px] text-white font-bold font-mono">2.00x</span>
                </div>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="0" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="1" disabled>?</button>
                  <button class="tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition" data-col="2" disabled>?</button>
                </div>
              </div>

              <!-- Row 1 (Bottom Tier - Active First) -->
              <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border-2 border-cyan-500/60 shadow-lg shadow-cyan-500/10 transition-all duration-300" data-row="1">
                <div class="w-16 shrink-0 text-left">
                  <span class="text-[8px] text-cyan-400 font-mono font-black block">TIER 1</span>
                  <span class="text-[9px] text-emerald-400 font-bold font-mono">1.40x</span>
                </div>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <button class="tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition" data-col="0">?</button>
                  <button class="tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition" data-col="1">?</button>
                  <button class="tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition" data-col="2">?</button>
                </div>
              </div>
            </div>

            <!-- Status Banner -->
            <div id="tower-status" class="text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Place bet & select a tile on Tier 1 to start climbing! 🏰
            </div>
          </div>

          <!-- Realtime Stats Sheet -->
          <div class="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl text-center font-mono">
            <div>
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Current Tier</span>
              <span id="tower-tier-val" class="text-white font-extrabold text-xs">Tier 1</span>
            </div>
            <div class="border-x border-slate-850">
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Multiplier</span>
              <span id="tower-multiplier-val" class="text-teal-400 font-extrabold text-xs">1.00x</span>
            </div>
            <div>
              <span class="text-[8px] text-slate-500 uppercase block font-bold">Est. Cashout</span>
              <span id="tower-potential-val" class="text-emerald-400 font-extrabold text-xs">৳0.00</span>
            </div>
          </div>

          <!-- Controls Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="tower-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="tower-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="tower-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="tower-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="tower-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end gap-1.5">
              <button id="tower-cashout" class="hidden w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-mono text-xs rounded-xl shadow-xl shadow-amber-500/20 transition cursor-pointer active:scale-95 uppercase tracking-wider border border-amber-300/40">
                Cash Out ৳<span id="tower-cash-val">0.00</span> 🏆
              </button>
              <div class="text-[8.5px] text-slate-400 font-mono text-center">Avoid 1 hidden trap per tier to reach Tier 5 (5.60x multiplier)!</div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            Platform Commission: 5% fee on net profits. 2 out of 3 tiles are safe per level!
          </div>
        </div>
      </div>
    `;
  },

  bindTowerEvents() {
    const gridRows = document.getElementById("tower-grid-rows");
    const status = document.getElementById("tower-status");
    const cashBtn = document.getElementById("tower-cashout");
    const cashVal = document.getElementById("tower-cash-val");
    const tierVal = document.getElementById("tower-tier-val");
    const multVal = document.getElementById("tower-multiplier-val");
    const payoutVal = document.getElementById("tower-potential-val");
    const fsBtn = document.getElementById("tower-fullscreen-toggle-btn");

    this.gameState = {
      active: false,
      bet: 10,
      currentRow: 1,
      multiplier: 1.00,
      rowsConfig: [] // random setups of traps for 5 rows
    };

    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const panel = document.getElementById("game-extragames-panel") || document.getElementById("game-subtab-container");
        if (panel) {
          if (!document.fullscreenElement) {
            panel.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    document.querySelectorAll(".tower-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "tower-bet-amount");
      });
    });

    const triggerReset = () => {
      const rows = gridRows.querySelectorAll("[data-row]");
      rows.forEach(r => {
        const rNum = parseInt(r.getAttribute("data-row"));
        const btns = r.querySelectorAll(".tower-step-btn");
        btns.forEach(b => {
          b.innerText = "?";
          b.disabled = rNum !== 1;
          b.className = rNum === 1
            ? "tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition"
            : "tower-step-btn h-10 bg-slate-950 rounded-xl text-xs font-black font-mono text-slate-600 border border-slate-850 cursor-not-allowed transition";
        });
        r.className = rNum === 1
          ? "flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border-2 border-cyan-500/60 shadow-lg shadow-cyan-500/10 transition-all duration-300 opacity-100"
          : "flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-2xl border border-slate-800/80 transition-all duration-300 opacity-60";
      });

      if (tierVal) tierVal.innerText = "Tier 1";
      if (multVal) multVal.innerText = "1.00x";
      if (payoutVal) payoutVal.innerText = "৳0.00";
    };

    // Bind step button clicks using delegation
    gridRows.addEventListener("click", (e) => {
      const btn = e.target.closest(".tower-step-btn");
      if (!btn || btn.disabled) return;

      const rowEl = btn.closest("[data-row]");
      const rowNum = parseInt(rowEl.getAttribute("data-row"));
      const colNum = parseInt(btn.getAttribute("data-col"));
      const bet = this.getBetAmount("tower-bet-amount");

      // Start game
      if (!this.gameState.active) {
        if (!this.deductBalance(bet)) return;
        this.gameState.active = true;
        this.gameState.bet = bet;
        this.gameState.currentRow = 1;
        this.gameState.multiplier = 1.00;

        // Configure trap positions for each of the 5 rows
        this.gameState.rowsConfig = [];
        for (let i = 0; i <= 5; i++) {
          this.gameState.rowsConfig.push(Math.floor(Math.random() * 3)); // Trap is at index 0, 1, or 2
        }
      }

      if (rowNum !== this.gameState.currentRow) return;

      const isTrap = this.gameState.rowsConfig[rowNum] === colNum;

      if (isTrap) {
        // Trap hit! Lose
        btn.innerText = "💥";
        btn.className = "tower-step-btn h-10 bg-rose-900/80 border-2 border-rose-500 rounded-xl text-xs font-black text-white shadow-lg animate-bounce";
        rowEl.className = "flex items-center justify-between gap-2 p-2 bg-rose-950/60 rounded-2xl border-2 border-rose-500 shadow-xl opacity-100";
        
        if (status) {
          status.innerText = `💥 BOOM! Hit trap on Tier ${rowNum}!`;
          status.className = "text-xs font-black text-rose-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
        }

        this.creditLoss(this.gameState.bet, "Tower Legend", `Tier ${rowNum} Tile ${colNum + 1}`, `Hit trap at Tier ${rowNum}`);
        this.app.showToast("Broke! Hit hidden tower trap.", "error");

        if (navigator.vibrate) navigator.vibrate(80);

        this.gameState.active = false;
        cashBtn.classList.add("hidden");

        setTimeout(() => {
          triggerReset();
          if (status) {
            status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
            status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
          }
        }, 2500);
      } else {
        // Safe step! Multiplier climbs
        const rowMultipliers = { 1: 1.40, 2: 2.00, 3: 2.80, 4: 4.00, 5: 5.60 };
        this.gameState.multiplier = rowMultipliers[rowNum];
        const currentPotential = this.gameState.bet * this.gameState.multiplier;

        btn.innerText = "💎";
        btn.className = "tower-step-btn h-10 bg-emerald-900/80 border-2 border-emerald-400 rounded-xl text-xs font-black text-white shadow-lg";

        if (navigator.vibrate) navigator.vibrate(30);

        if (tierVal) tierVal.innerText = `Tier ${rowNum}`;
        if (multVal) multVal.innerText = `${this.gameState.multiplier.toFixed(2)}x`;
        if (payoutVal) payoutVal.innerText = `৳${currentPotential.toFixed(2)}`;

        if (rowNum === 5) {
          // Completed Tier 5! Automatically Cash Out
          if (status) {
            status.innerText = `👑 CONQUERED THE TOWER! Won ৳${(currentPotential * 0.95).toFixed(2)}`;
            status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
          }

          this.creditWinnings(currentPotential, this.gameState.bet, "Tower Legend", "Climb Tier 5 (Max)", "Conquered Fortress Tower!");
          this.app.showToast(`🎉 Conquered Tower! Won ৳${(currentPotential * 0.95).toFixed(2)} (x5.60)!`, "success");
          this.app.showCongratsSplash("👑 TOWER LEGEND CONQUERED!", `Masterful climb! Reached Tier 5 peak with x5.60 multiplier!`, `৳${(currentPotential * 0.95).toFixed(2)}`);

          this.gameState.active = false;
          cashBtn.classList.add("hidden");

          setTimeout(() => {
            triggerReset();
            if (status) {
              status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
              status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
            }
          }, 3500);
        } else {
          // Advance to next tier
          this.gameState.currentRow = rowNum + 1;
          if (status) {
            status.innerText = `✨ Tier ${rowNum} Cleared! Current Mult: ${this.gameState.multiplier.toFixed(2)}x`;
            status.className = "text-xs font-black text-amber-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
          }

          if (cashVal) cashVal.innerText = currentPotential.toFixed(2);
          cashBtn.classList.remove("hidden");

          this.app.showToast(`✨ Tier ${rowNum} Cleared! Mult: ${this.gameState.multiplier.toFixed(2)}x`, "success");

          // Disable previous rows, enable next tier row
          const rows = gridRows.querySelectorAll("[data-row]");
          rows.forEach(r => {
            const rNum = parseInt(r.getAttribute("data-row"));
            const rBtns = r.querySelectorAll(".tower-step-btn");
            if (rNum === this.gameState.currentRow) {
              r.className = "flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 transition-all duration-300 opacity-100";
              rBtns.forEach(b => {
                b.disabled = false;
                b.className = "tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition";
              });
            } else if (rNum < this.gameState.currentRow) {
              rBtns.forEach(b => b.disabled = true);
              r.className = "flex items-center justify-between gap-2 p-2 bg-slate-950/40 rounded-2xl border border-slate-900 transition-all duration-300 opacity-50";
            }
          });
        }
      }
    });

    cashBtn.addEventListener("click", () => {
      if (!this.gameState.active) return;
      this.gameState.active = false;
      cashBtn.classList.add("hidden");

      const finalPayout = this.gameState.bet * this.gameState.multiplier;
      const netWin = this.creditWinnings(finalPayout, this.gameState.bet, "Tower Legend", `Climb Tier ${this.gameState.currentRow - 1}`, `Cashed Out Tier ${this.gameState.currentRow - 1}`);

      if (status) {
        status.innerText = `🏆 Cashed Out ৳${netWin.toFixed(2)} at Tier ${this.gameState.currentRow - 1}!`;
        status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg w-full max-w-sm";
      }

      this.app.showToast(`🏆 Cashed out Tower climb! Won ৳${netWin.toFixed(2)}`, "success");

      setTimeout(() => {
        triggerReset();
        if (status) {
          status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
          status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
        }
      }, 2500);
    });
  },

  // =========================================================================
  // 5. WHEEL OF FORTUNE
  // =========================================================================
  getWheelTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-rose-400 tracking-widest block font-mono">CASINO NEON WHEEL</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-spinner text-rose-400 animate-spin-slow"></i> Wheel of Fortune</h3>
          </div>
          <button id="wheel-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-rose-955/20 via-slate-900 to-slate-950 border border-rose-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Visual Wheel Stage Container -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <!-- Pointer Top Arrow -->
            <div class="absolute top-2 z-30 flex flex-col items-center drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
              <div class="w-4 h-6 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-b-full border border-amber-200 shadow-lg animate-bounce"></div>
            </div>

            <!-- Outer glowing border frame with HTML5 Canvas Disk -->
            <div class="relative w-56 h-56 sm:w-64 sm:h-64 mt-4 flex items-center justify-center">
              <!-- Outer Glowing Lights Ring -->
              <div id="wheel-outer-lights-ring" class="absolute inset-0 rounded-full border-4 border-slate-800 shadow-[0_0_25px_rgba(244,63,94,0.15)] z-10 pointer-events-none"></div>
              
              <!-- Disk rotatable container -->
              <div id="wheel-rotor-disk" class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden transition-all duration-[3800ms] ease-out select-none shadow-2xl border-2 border-slate-800">
                <canvas id="wheel-game-canvas" width="260" height="260" class="w-full h-full rounded-full"></canvas>
              </div>

              <!-- Center Metallic Hub Button -->
              <div id="wheel-center-hub" class="absolute z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-900 via-rose-955 to-slate-950 border-4 border-slate-800 shadow-xl flex flex-col items-center justify-center pointer-events-none">
                <span class="text-[9px] sm:text-[10px] font-black text-rose-400 font-mono tracking-tighter">SPIN</span>
                <i class="fa-solid fa-crown text-[8px] text-amber-400"></i>
              </div>
            </div>

            <!-- Status banner -->
            <div id="wheel-status" class="text-xs font-black text-slate-300 font-mono mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Select Risk & Spin the Neon Wheel! 🎡
            </div>
          </div>

          <!-- Active Risk Level Multiplier Badges Grid -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[8px] text-slate-400 font-mono font-bold uppercase">
              <span>Segment Multipliers (8 Sectors)</span>
              <span id="wheel-risk-label" class="text-emerald-400">LOW RISK MODE</span>
            </div>
            <div id="wheel-segments-preview" class="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              <!-- Dynamic 8 segment cards -->
            </div>
          </div>

          <!-- Controls & Betting Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Risk Selection -->
            <div class="space-y-2">
              <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Select Risk Mode</label>
              <div class="grid grid-cols-3 gap-2">
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-95 transition" data-risk="low">
                  <span>Low Risk</span>
                  <span class="block text-[7.5px] font-normal text-emerald-300/80">100% Win</span>
                </button>
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="med">
                  <span>Medium</span>
                  <span class="block text-[7.5px] font-normal text-slate-500">75% Win</span>
                </button>
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="high">
                  <span>High Risk</span>
                  <span class="block text-[7.5px] font-normal text-slate-500">50x Jackpot</span>
                </button>
              </div>
            </div>

            <!-- Bet Amount & Quick Controls -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="wheel-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>

              <div class="grid grid-cols-4 gap-1">
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>
          </div>

          <!-- Realtime Stats Bar -->
          <div class="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl text-center font-mono">
            <div>
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Win Chance</span>
              <span id="wheel-stat-chance" class="text-white font-extrabold text-xs">100%</span>
            </div>
            <div class="border-x border-slate-850">
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Max Multiplier</span>
              <span id="wheel-stat-mult" class="text-rose-400 font-extrabold text-xs">2.0x</span>
            </div>
            <div>
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Max Payout</span>
              <span id="wheel-stat-payout" class="text-emerald-400 font-extrabold text-xs">৳20.00</span>
            </div>
          </div>

          <!-- Spin Trigger Button -->
          <button id="wheel-btn-spin" class="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-rose-600/20 transition active:scale-95 cursor-pointer hover:scale-[1.005] border border-rose-400/30 uppercase tracking-wider flex items-center justify-center gap-2">
            <span>Spin Wheel</span> <i class="fa-solid fa-sync text-xs"></i>
          </button>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Fair Play Engine: 5% platform fee applied to net profits. Segment landing is strictly randomized.
          </div>
        </div>
      </div>
    `;
  },

  bindWheelEvents() {
    const spinBtn = document.getElementById("wheel-btn-spin");
    const status = document.getElementById("wheel-status");
    const riskBtns = document.querySelectorAll(".wheel-risk-btn");
    const qtyBtns = document.querySelectorAll(".wheel-qty-btn");
    const betInput = document.getElementById("wheel-bet-amount");

    let selectedRisk = "low";

    const riskConfigs = {
      low: {
        label: "LOW RISK MODE (100% WIN CHANCE)",
        winChance: "100%",
        colorClass: "text-emerald-400",
        segments: [
          { mult: 1.2, label: "1.2x", color: "#0d9488", text: "#ffffff" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 1.2, label: "1.2x", color: "#06b6d4", text: "#ffffff" },
          { mult: 1.8, label: "1.8x", color: "#8b5cf6", text: "#ffffff" },
          { mult: 1.3, label: "1.3x", color: "#6366f1", text: "#ffffff" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 1.4, label: "1.4x", color: "#f59e0b", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#f43f5e", text: "#ffffff" }
        ]
      },
      med: {
        label: "MEDIUM RISK MODE (75% WIN CHANCE)",
        winChance: "75%",
        colorClass: "text-amber-400",
        segments: [
          { mult: 0.0, label: "0x", color: "#334155", text: "#94a3b8" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#06b6d4", text: "#ffffff" },
          { mult: 0.5, label: "0.5x", color: "#f97316", text: "#ffffff" },
          { mult: 1.8, label: "1.8x", color: "#8b5cf6", text: "#ffffff" },
          { mult: 3.0, label: "3.0x", color: "#eab308", text: "#ffffff" },
          { mult: 0.0, label: "0x", color: "#334155", text: "#94a3b8" },
          { mult: 5.0, label: "5.0x", color: "#ec4899", text: "#ffffff" }
        ]
      },
      high: {
        label: "HIGH RISK MODE (50x MEGA JACKPOT)",
        winChance: "37.5%",
        colorClass: "text-rose-400",
        segments: [
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 0.5, label: "0.5x", color: "#f97316", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#06b6d4", text: "#ffffff" },
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 5.0, label: "5.0x", color: "#10b981", text: "#ffffff" },
          { mult: 10.0, label: "10.0x", color: "#a855f7", text: "#ffffff" },
          { mult: 50.0, label: "50x 👑", color: "#eab308", text: "#020617" }
        ]
      }
    };

    const drawWheelCanvas = (segments) => {
      const canvas = document.getElementById("wheel-game-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const numSectors = segments.length;
      const arc = (Math.PI * 2) / numSectors;
      const center = canvas.width / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numSectors; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, center - 4, angle, angle + arc);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = segments[i].text || "#ffffff";
        ctx.font = 'black 11px "JetBrains Mono", monospace';
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 4;
        ctx.fillText(segments[i].label, center - 18, 4);
        ctx.restore();
      }

      for (let j = 0; j < 16; j++) {
        const dotAngle = j * (Math.PI / 8);
        const x = center + Math.cos(dotAngle) * (center - 8);
        const y = center + Math.sin(dotAngle) * (center - 8);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = j % 2 === 0 ? "#fbbf24" : "#ffffff";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 3;
        ctx.fill();
      }
    };

    const updatePreviewBadges = (segments) => {
      const container = document.getElementById("wheel-segments-preview");
      if (!container) return;
      container.innerHTML = segments.map((s, idx) => `
        <div id="wheel-badge-${idx}" class="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-mono transition-all duration-300">
          <span class="text-[7px] text-slate-500 uppercase block font-bold">Sec ${idx + 1}</span>
          <span class="text-[10px] font-black block" style="color: ${s.mult > 1 ? '#4ade80' : s.mult > 0 ? '#f97316' : '#64748b'}">${s.label}</span>
        </div>
      `).join("");
    };

    const updateStats = () => {
      const curRisk = riskConfigs[selectedRisk];
      const maxM = Math.max(...curRisk.segments.map(s => s.mult));
      const bet = parseFloat(document.getElementById("wheel-bet-amount")?.value) || 10;
      
      const chanceEl = document.getElementById("wheel-stat-chance");
      const multEl = document.getElementById("wheel-stat-mult");
      const payoutEl = document.getElementById("wheel-stat-payout");
      const labelEl = document.getElementById("wheel-risk-label");

      if (chanceEl) chanceEl.innerText = curRisk.winChance;
      if (multEl) multEl.innerText = maxM.toFixed(1) + "x";
      if (payoutEl) payoutEl.innerText = "৳" + (bet * maxM).toFixed(2);
      if (labelEl) {
        labelEl.innerText = curRisk.label;
        labelEl.className = curRisk.colorClass + " font-bold";
      }
    };

    // Initial render
    drawWheelCanvas(riskConfigs[selectedRisk].segments);
    updatePreviewBadges(riskConfigs[selectedRisk].segments);
    updateStats();

    // Risk selectors
    riskBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        riskBtns.forEach(b => {
          b.className = "wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        btn.className = "wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-95 transition";
        selectedRisk = btn.getAttribute("data-risk");
        
        drawWheelCanvas(riskConfigs[selectedRisk].segments);
        updatePreviewBadges(riskConfigs[selectedRisk].segments);
        updateStats();
      });
    });

    // Quantity buttons
    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const op = btn.getAttribute("data-op");
        this.handleBetAdjustment(op, "wheel-bet-amount");
        updateStats();
      });
    });

    if (betInput) {
      betInput.addEventListener("input", updateStats);
    }

    // Fullscreen toggle
    const fsBtn = document.getElementById("wheel-fullscreen-toggle-btn");
    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const panel = document.getElementById("game-extragames-panel") || document.getElementById("game-subtab-container");
        if (panel) {
          if (!document.fullscreenElement) {
            panel.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    // Spin Action
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        const bet = this.getBetAmount("wheel-bet-amount");
        if (!this.deductBalance(bet)) return;

        spinBtn.disabled = true;
        spinBtn.innerHTML = `<span>Spinning...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;
        if (status) {
          status.innerText = "⚡ The Neon Wheel is spinning! Wish you luck...";
          status.className = "text-xs font-black text-rose-300 font-mono mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
        }

        const curConfig = riskConfigs[selectedRisk];
        const segments = curConfig.segments;
        const numSectors = segments.length;

        // Pick target index
        const targetIndex = Math.floor(Math.random() * numSectors);
        const outcome = segments[targetIndex];

        // Target rotation calculation:
        // Sector index center is at: targetIndex * 45 + 22.5 deg.
        // To rotate center to top (0 deg / 12 o'clock):
        const targetSectorCenter = targetIndex * 45 + 22.5;
        const degreesToTop = (360 - targetSectorCenter) % 360;

        // 7 full revolutions (2520 deg) + degreesToTop
        const totalRotation = 2520 + degreesToTop;

        const disk = document.getElementById("wheel-rotor-disk");
        if (disk) {
          disk.style.transition = "transform 3.8s cubic-bezier(0.15, 0.85, 0.15, 1.0)";
          disk.style.transform = `rotate(${totalRotation}deg)`;
        }

        if (navigator.vibrate) {
          let tickCount = 0;
          const tickInterval = setInterval(() => {
            navigator.vibrate(30);
            tickCount++;
            if (tickCount >= 10) clearInterval(tickInterval);
          }, 350);
        }

        setTimeout(() => {
          spinBtn.disabled = false;
          spinBtn.innerHTML = `<span>Spin Wheel</span> <i class="fa-solid fa-sync text-xs"></i>`;

          if (disk) {
            disk.style.transition = "none";
            disk.style.transform = `rotate(${degreesToTop}deg)`;
            setTimeout(() => {
              disk.style.transition = "transform 3.8s cubic-bezier(0.15, 0.85, 0.15, 1.0)";
            }, 50);
          }

          const targetBadge = document.getElementById(`wheel-badge-${targetIndex}`);
          if (targetBadge) {
            targetBadge.className = "p-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-500/20 text-center font-mono scale-110 shadow-lg shadow-emerald-500/20 transition-all duration-300";
            setTimeout(() => {
              targetBadge.className = "p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-mono transition-all duration-300";
            }, 2500);
          }

          const winAmount = bet * outcome.mult;
          if (outcome.mult > 1.0) {
            const netWin = this.creditWinnings(winAmount, bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed ${outcome.label}`);
            if (status) {
              status.innerText = `🎉 WINNER! Landed on ${outcome.label}! Won ৳${netWin.toFixed(2)}`;
              status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
            }
            this.app.showToast(`🎉 WINNER! Won ৳${netWin.toFixed(2)} on ${outcome.label}!`, "success");
            
            if (outcome.mult >= 5.0) {
              this.app.showCongratsSplash("🎡 WHEEL JACKPOT WINNER!", `Spectacular spin! You landed right on the ${outcome.label} segment!`, `৳${netWin.toFixed(2)}`);
            }
          } else if (outcome.mult === 1.0) {
            this.creditWinnings(winAmount, bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Refund ${outcome.label}`);
            if (status) {
              status.innerText = `🤝 Push! Landed on ${outcome.label}. Bet refunded!`;
              status.className = "text-xs font-black text-amber-400 font-mono mt-4 px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 shadow-lg w-full max-w-sm";
            }
            this.app.showToast(`Push! Landed on ${outcome.label}`, "info");
          } else {
            this.creditLoss(bet - winAmount, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed ${outcome.label}`);
            if (status) {
              status.innerText = `💥 Landed on ${outcome.label}. Better luck next spin!`;
              status.className = "text-xs font-black text-rose-400 font-mono mt-4 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
            }
            this.app.showToast(`Landed on ${outcome.label}. Try again!`, "error");
          }
        }, 3800);
      });
    }
  },

  // =========================================================================
  // 6. SUPER MATCH KENO
  // =========================================================================
  getKenoTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-indigo-400 tracking-widest block font-mono">LOTTERY NEON KENO</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-clover text-indigo-400"></i> Super Match Keno</h3>
          </div>
          <button id="keno-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-indigo-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-indigo-955/20 via-slate-900 to-slate-950 border border-indigo-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Keno Board Grid & Drawn Balls Rack -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4">
            
            <!-- Quick Pick & Clear Buttons -->
            <div class="flex items-center justify-between w-full max-w-md">
              <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold font-mono">Pick 1 to 5 Numbers (1-20)</span>
              <div class="flex items-center gap-1.5">
                <button id="keno-btn-auto-3" class="px-2 py-1 text-[8px] font-bold font-mono rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50 cursor-pointer active:scale-95 transition">Auto 3</button>
                <button id="keno-btn-auto-5" class="px-2 py-1 text-[8px] font-bold font-mono rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50 cursor-pointer active:scale-95 transition">Auto 5</button>
                <button id="keno-btn-clear" class="px-2 py-1 text-[8px] font-bold font-mono rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 cursor-pointer active:scale-95 transition">Clear</button>
              </div>
            </div>

            <!-- 20-Number Keno Grid -->
            <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 w-full max-w-md" id="keno-board-grid">
              ${Array.from({ length: 20 }, (_, i) => i + 1).map(num => `
                <button class="keno-num-btn h-9 bg-slate-900 hover:bg-slate-800 text-xs font-mono font-black text-white rounded-xl border border-slate-800 cursor-pointer transition active:scale-95 flex items-center justify-center shadow-sm" data-num="${num}">${num}</button>
              `).join("")}
            </div>

            <!-- Drawn Balls Tube Rack -->
            <div class="w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-2xl p-2.5 flex flex-col items-center gap-2">
              <div class="flex justify-between items-center w-full px-1">
                <span class="text-[8.5px] font-mono font-bold text-slate-400 uppercase">Lottery Tube Draw (5 Balls)</span>
                <span id="keno-status" class="text-[8.5px] font-bold text-indigo-400 font-mono">Selected: 0/5 numbers</span>
              </div>
              <div id="keno-drawn-rack" class="flex items-center justify-center gap-2 min-h-[38px] w-full">
                <span class="text-[9px] text-slate-600 font-mono italic">Waiting for draw...</span>
              </div>
            </div>
          </div>

          <!-- Live Multipliers Table -->
          <div class="space-y-1.5">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block">Current Payout Multipliers</span>
            <div id="keno-paytable-bar" class="grid grid-cols-5 gap-1.5 text-center font-mono text-[9px]">
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-500">1 M: 0.0x</div>
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-500">2 M: 1.2x</div>
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-500">3 M: 3.5x</div>
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-500">4 M: 10x</div>
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-500">5 M: 30x</div>
            </div>
          </div>

          <!-- Controls & Bet Amount -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="keno-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-800 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="keno-btn-draw" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-indigo-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-indigo-400/30">
                <span>Draw Winning Balls</span> <i class="fa-solid fa-dice text-xs"></i>
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Fair Play Keno: 5% platform fee applied to net profits. 5 lucky balls randomly drawn per round.
          </div>
        </div>
      </div>
    `;
  },

  bindKenoEvents() {
    const gridBtns = document.querySelectorAll(".keno-num-btn");
    const drawBtn = document.getElementById("keno-btn-draw");
    const status = document.getElementById("keno-status");
    const drawnRack = document.getElementById("keno-drawn-rack");
    const paytableBar = document.getElementById("keno-paytable-bar");

    let picks = [];

    const getPaytable = (pickCount) => {
      switch(pickCount) {
        case 1: return [{ m: 1, mult: 2.5 }];
        case 2: return [{ m: 1, mult: 0.5 }, { m: 2, mult: 4.5 }];
        case 3: return [{ m: 1, mult: 0.0 }, { m: 2, mult: 2.5 }, { m: 3, mult: 9.0 }];
        case 4: return [{ m: 1, mult: 0.0 }, { m: 2, mult: 1.5 }, { m: 3, mult: 5.0 }, { m: 4, mult: 18.0 }];
        case 5: return [{ m: 1, mult: 0.0 }, { m: 2, mult: 1.2 }, { m: 3, mult: 3.5 }, { m: 4, mult: 10.0 }, { m: 5, mult: 30.0 }];
        default: return [{ m: 1, mult: 0.0 }, { m: 2, mult: 1.2 }, { m: 3, mult: 3.5 }, { m: 4, mult: 10.0 }, { m: 5, mult: 30.0 }];
      }
    };

    const updatePaytableUI = () => {
      if (!paytableBar) return;
      const count = picks.length || 5;
      const table = getPaytable(count);
      paytableBar.innerHTML = table.map(item => `
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
          <span class="text-[7.5px] text-slate-500 uppercase block font-bold">${item.m} Match${item.m > 1 ? 'es' : ''}</span>
          <span class="text-[10px] font-black ${item.mult > 1 ? 'text-emerald-400' : item.mult > 0 ? 'text-amber-400' : 'text-slate-500'}">${item.mult}x</span>
        </div>
      `).join("");
    };

    const updatePicksUI = () => {
      gridBtns.forEach(btn => {
        const num = parseInt(btn.getAttribute("data-num"));
        if (picks.includes(num)) {
          btn.className = "keno-num-btn h-9 bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300 font-mono font-black rounded-xl cursor-pointer scale-105 shadow-md shadow-indigo-500/20 transition";
        } else {
          btn.className = "keno-num-btn h-9 bg-slate-900 hover:bg-slate-850 text-xs font-mono font-black text-white rounded-xl border border-slate-800 cursor-pointer transition active:scale-95 flex items-center justify-center shadow-sm";
        }
      });

      if (status) {
        status.innerText = `Selected: ${picks.length}/5 numbers (${picks.join(", ") || 'None'})`;
        status.className = picks.length > 0 ? "text-[8.5px] font-bold text-indigo-300 font-mono" : "text-[8.5px] font-bold text-slate-400 font-mono";
      }

      updatePaytableUI();
    };

    gridBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const num = parseInt(btn.getAttribute("data-num"));
        if (picks.includes(num)) {
          picks = picks.filter(x => x !== num);
        } else {
          if (picks.length >= 5) {
            this.app.showToast("Maximum 5 lucky numbers allowed!", "error");
            return;
          }
          picks.push(num);
        }
        updatePicksUI();
      });
    });

    // Auto Pick & Clear
    document.getElementById("keno-btn-auto-3")?.addEventListener("click", () => {
      picks = [];
      while (picks.length < 3) {
        const r = Math.floor(Math.random() * 20) + 1;
        if (!picks.includes(r)) picks.push(r);
      }
      updatePicksUI();
    });

    document.getElementById("keno-btn-auto-5")?.addEventListener("click", () => {
      picks = [];
      while (picks.length < 5) {
        const r = Math.floor(Math.random() * 20) + 1;
        if (!picks.includes(r)) picks.push(r);
      }
      updatePicksUI();
    });

    document.getElementById("keno-btn-clear")?.addEventListener("click", () => {
      picks = [];
      updatePicksUI();
    });

    // Quantity buttons
    document.querySelectorAll(".keno-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "keno-bet-amount");
      });
    });

    // Fullscreen toggle
    document.getElementById("keno-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    // Draw Action
    if (drawBtn) {
      drawBtn.addEventListener("click", () => {
        if (picks.length === 0) {
          this.app.showToast("Please select at least 1 lucky number!", "error");
          return;
        }

        const bet = this.getBetAmount("keno-bet-amount");
        if (!this.deductBalance(bet)) return;

        drawBtn.disabled = true;
        drawBtn.innerHTML = `<span>Drawing Balls...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

        if (drawnRack) {
          drawnRack.innerHTML = `<span class="text-[9px] text-indigo-400 font-mono animate-pulse">⚡ Rolling lottery tube...</span>`;
        }

        // Draw 5 winning numbers out of 20
        const winningNumbers = [];
        while (winningNumbers.length < 5) {
          const rand = Math.floor(Math.random() * 20) + 1;
          if (!winningNumbers.includes(rand)) winningNumbers.push(rand);
        }

        let ballIndex = 0;
        drawnRack.innerHTML = "";

        const drawInterval = setInterval(() => {
          if (ballIndex < winningNumbers.length) {
            const ballNum = winningNumbers[ballIndex];
            const isMatch = picks.includes(ballNum);

            const ballEl = document.createElement("div");
            ballEl.className = `w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-lg animate-bounce ${
              isMatch 
                ? 'bg-gradient-to-tr from-emerald-600 to-green-400 text-white border-2 border-emerald-300 shadow-emerald-500/40' 
                : 'bg-gradient-to-tr from-indigo-700 to-purple-600 text-white border border-indigo-400/50'
            }`;
            ballEl.innerText = ballNum;
            drawnRack.appendChild(ballEl);

            if (isMatch) {
              const matchedBtn = document.querySelector(`.keno-num-btn[data-num="${ballNum}"]`);
              if (matchedBtn) {
                matchedBtn.className = "keno-num-btn h-9 bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300 font-mono font-black rounded-xl shadow-lg shadow-emerald-500/30 scale-110 transition";
              }
            }

            if (navigator.vibrate) navigator.vibrate(30);
            ballIndex++;
          } else {
            clearInterval(drawInterval);

            // Calculate Matches
            const matches = picks.filter(x => winningNumbers.includes(x));
            const matchCount = matches.length;
            const table = getPaytable(picks.length);
            const payoutObj = table.find(t => t.m === matchCount) || { mult: 0 };
            const mult = payoutObj.mult;

            const payout = bet * mult;

            setTimeout(() => {
              drawBtn.disabled = false;
              drawBtn.innerHTML = `<span>Draw Winning Balls</span> <i class="fa-solid fa-dice text-xs"></i>`;

              if (mult > 1.0) {
                const netWin = this.creditWinnings(payout, bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Matched ${matchCount}]`);
                if (status) {
                  status.innerText = `🎉 WON ৳${netWin.toFixed(2)}! Matched ${matchCount} ball(s) (${matches.join(",")})`;
                  status.className = "text-[9px] font-bold text-emerald-400 font-mono animate-pulse";
                }
                this.app.showToast(`🎉 Keno Match! Won ৳${netWin.toFixed(2)}`, "success");

                if (mult >= 10.0) {
                  this.app.showCongratsSplash("🎱 KENO MEGA MATCH!", `Matched ${matchCount} balls out of ${picks.length} picks!`, `৳${netWin.toFixed(2)}`);
                }
              } else if (mult === 1.0) {
                this.creditWinnings(payout, bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Push]`);
                if (status) {
                  status.innerText = `🤝 Push! Matched ${matchCount}. Bet refunded!`;
                  status.className = "text-[9px] font-bold text-amber-400 font-mono";
                }
                this.app.showToast("Push! Bet refunded.", "info");
              } else {
                this.creditLoss(bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Matched ${matchCount}]`);
                if (status) {
                  status.innerText = `💥 Matched ${matchCount} ball(s). Better luck next draw!`;
                  status.className = "text-[9px] font-bold text-rose-400 font-mono";
                }
                this.app.showToast("No win this draw. Try again!", "error");
              }
            }, 500);
          }
        }, 300);
      });
    }
  },

  // =========================================================================
  // 7. CRICKET SIXER HIT
  // =========================================================================
  getCricketTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-teal-400 tracking-widest block font-mono">T20 STADIUM LEAGUE</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-baseball text-teal-400"></i> Cricket Sixer Hit</h3>
          </div>
          <button id="cricket-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900 border border-teal-800/60 text-teal-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-teal-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-teal-955/20 via-slate-900 to-slate-950 border border-teal-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-teal-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Live Pitch & Stadium Jumbotron Arena -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4">
            
            <!-- Stadium Header & Last 5 Balls History -->
            <div class="flex items-center justify-between w-full">
              <div class="text-left">
                <span class="text-[7.5px] text-emerald-400 font-mono font-bold uppercase block">Stadium Condition</span>
                <span id="cricket-pitch-condition" class="text-[9.5px] text-white font-bold font-mono">Flat Pitch - Fast Outfield 🏟️</span>
              </div>
              <div class="text-right">
                <span class="text-[7.5px] text-slate-400 font-mono font-bold uppercase block mb-0.5">Last 5 Deliveries</span>
                <div id="cricket-history-bar" class="flex items-center gap-1">
                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[9px] font-bold">6</span>
                  <span class="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono text-[9px] font-bold">4</span>
                  <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono text-[9px] font-bold">W</span>
                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[9px] font-bold">6</span>
                  <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[9px] font-bold">1</span>
                </div>
              </div>
            </div>

            <!-- Pitch Green Arena -->
            <div class="relative w-full h-40 border-2 border-emerald-800/40 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 flex flex-col items-center justify-between py-3 overflow-hidden shadow-2xl">
              <!-- Pitch Crease lines -->
              <div class="w-full border-b border-emerald-500/20 text-[8px] text-slate-400 font-mono">Bowler's Crease</div>
              
              <!-- Bowling animation visual element -->
              <div id="cricket-ball" class="absolute top-6 left-1/2 -translate-x-1/2 text-lg transition-all duration-700 z-20 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">🔴</div>
              
              <!-- Batter with bat visual -->
              <div class="relative z-10 flex flex-col items-center">
                <div id="cricket-batter" class="text-3xl select-none transition-transform duration-300">🏏</div>
                <div class="text-[8px] font-mono font-bold text-amber-300">Wickets 🦯🦯🦯</div>
              </div>

              <div class="w-full border-t border-emerald-500/20 text-[8px] text-slate-400 font-mono">Striker's Crease</div>
            </div>

            <!-- Commentary Jumbotron Banner -->
            <div id="cricket-status" class="text-xs font-black text-teal-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Select Shot & Face Fast Bowler! 🏏
            </div>
          </div>

          <!-- Shot Type Selection Cards -->
          <div class="space-y-2">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block">Select Batting Shot & Risk Level</span>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button class="cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-pointer active:scale-95 transition" data-shot="push">
                <span class="text-[10px] font-black block">Push & Run</span>
                <span class="text-[8px] block opacity-80">1.2x | 85% Win</span>
              </button>
              <button class="cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-shot="drive">
                <span class="text-[10px] font-black block">Cover Drive</span>
                <span class="text-[8px] block opacity-80">2.0x | 50% Win</span>
              </button>
              <button class="cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-shot="six">
                <span class="text-[10px] font-black block">Sixer Hit</span>
                <span class="text-[8px] block opacity-80">3.5x | 30% Win</span>
              </button>
              <button class="cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-shot="heli">
                <span class="text-[10px] font-black block">Helicopter</span>
                <span class="text-[8px] block opacity-80">6.0x | 18% Win</span>
              </button>
              <button class="cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700 col-span-2 sm:col-span-1" data-shot="scoop">
                <span class="text-[10px] font-black block">Dilscoop</span>
                <span class="text-[8px] block opacity-80">12.0x | 9% Win</span>
              </button>
            </div>
          </div>

          <!-- Controls & Bet Amount -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="cricket-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="cricket-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="cricket-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="cricket-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="cricket-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="cricket-btn-strike" class="w-full py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-teal-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-teal-400/30">
                <span>Face Bowler</span> <i class="fa-solid fa-baseball text-xs"></i>
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Stadium League: 5% platform fee applied to net profit boundaries.
          </div>
        </div>
      </div>
    `;
  },

  bindCricketEvents() {
    const ball = document.getElementById("cricket-ball");
    const batter = document.getElementById("cricket-batter");
    const status = document.getElementById("cricket-status");
    const strikeBtn = document.getElementById("cricket-btn-strike");
    const shotBtns = document.querySelectorAll(".cricket-shot-btn");
    const historyBar = document.getElementById("cricket-history-bar");

    let selectedShot = "push";
    const history = ["6", "4", "W", "6", "1"];

    const shotConfigs = {
      push: { label: "Push & Run", mult: 1.20, winChance: 0.85 },
      drive: { label: "Cover Drive", mult: 2.00, winChance: 0.50 },
      six: { label: "Sixer Hit", mult: 3.50, winChance: 0.30 },
      heli: { label: "Helicopter Shot", mult: 6.00, winChance: 0.18 },
      scoop: { label: "Dilscoop", mult: 12.00, winChance: 0.09 }
    };

    shotBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        shotBtns.forEach(b => {
          b.className = "cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        btn.className = "cricket-shot-btn p-2.5 rounded-xl text-center font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-pointer active:scale-95 transition";
        selectedShot = btn.getAttribute("data-shot");
      });
    });

    document.querySelectorAll(".cricket-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "cricket-bet-amount");
      });
    });

    // Fullscreen toggle
    document.getElementById("cricket-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    const updateHistoryUI = (res) => {
      history.shift();
      history.push(res);
      if (historyBar) {
        historyBar.innerHTML = history.map(h => `
          <span class="px-1.5 py-0.5 rounded ${h === 'W' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : h === '6' || h === '12' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'} font-mono text-[9px] font-bold">${h}</span>
        `).join("");
      }
    };

    if (strikeBtn) {
      strikeBtn.addEventListener("click", () => {
        const bet = this.getBetAmount("cricket-bet-amount");
        if (!this.deductBalance(bet)) return;

        strikeBtn.disabled = true;
        strikeBtn.innerHTML = `<span>Bowler Running...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

        if (status) {
          status.innerText = "⚡ Fast Bowler is running in to deliver...";
          status.className = "text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full animate-pulse";
        }

        if (ball) {
          ball.style.top = "20px";
          ball.style.transform = "scale(0.8) rotate(0deg)";
        }

        setTimeout(() => {
          // Ball zooms to batter
          if (ball) {
            ball.style.top = "110px";
            ball.style.transform = "scale(1.5) rotate(360deg)";
          }

          if (batter) {
            batter.style.transform = "rotate(-25deg) scale(1.15)";
          }

          if (navigator.vibrate) navigator.vibrate(40);

          setTimeout(() => {
            strikeBtn.disabled = false;
            strikeBtn.innerHTML = `<span>Face Bowler</span> <i class="fa-solid fa-baseball text-xs"></i>`;

            if (ball) {
              ball.style.top = "20px";
              ball.style.transform = "scale(0.8) rotate(0deg)";
            }
            if (batter) {
              batter.style.transform = "none";
            }

            const cfg = shotConfigs[selectedShot];
            const isWin = Math.random() < cfg.winChance;
            const payout = bet * (isWin ? cfg.mult : 0);

            if (isWin) {
              const resCode = cfg.mult >= 6 ? "6" : cfg.mult >= 2 ? "4" : "1";
              updateHistoryUI(resCode);

              const netWin = this.creditWinnings(payout, bet, "Cricket Sixer Hit", cfg.label, `Hit boundary at ${cfg.mult}x`);
              if (status) {
                status.innerText = `💥 BOOM! ${cfg.label} connected! Won ৳${netWin.toFixed(2)}`;
                status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
              }
              this.app.showToast(`🎉 CRACKING HIT! Won ৳${netWin.toFixed(2)}`, "success");

              if (cfg.mult >= 6.0) {
                this.app.showCongratsSplash("🏏 MONSTER SIXER!", `What a shot! Outstanding ${cfg.label} out of the stadium!`, `৳${netWin.toFixed(2)}`);
              }
            } else {
              updateHistoryUI("W");
              this.creditLoss(bet, "Cricket Sixer Hit", cfg.label, "Caught / Bowled Out");
              if (status) {
                status.innerText = `❌ OUT! Clean bowled or caught on boundary. Better luck next ball!`;
                status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
              }
              this.app.showToast("Wicket! Out. Try another shot!", "error");
            }

          }, 700);
        }, 800);
      });
    }
  },

  // =========================================================================
  // 8. AVIATOR JET RIDE
  // =========================================================================
  getAviatorTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-red-400 tracking-widest block font-mono">PRO CRASH MULTIPLIER</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-plane-departure text-red-400"></i> Aviator Jet Ride</h3>
          </div>
          <button id="aviator-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-red-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-red-955/20 via-slate-900 to-slate-950 border border-red-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Radar Arena & Jet Horizon Flight Screen -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-3">
            
            <!-- Flight History Multipliers Bar -->
            <div class="flex items-center justify-between w-full">
              <span class="text-[7.5px] text-slate-400 font-mono font-bold uppercase">Recent Flights</span>
              <div id="aviator-history-bar" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[220px] sm:max-w-xs">
                <span class="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono font-bold">1.24x</span>
                <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">3.85x</span>
                <span class="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-bold">14.20x</span>
                <span class="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono font-bold">1.10x</span>
                <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">2.40x</span>
              </div>
            </div>

            <!-- Curved Flight Radar Box -->
            <div id="aviator-radar-box" class="relative w-full h-48 sm:h-56 border-2 border-slate-800 rounded-2xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <!-- Radar grid lines -->
              <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

              <!-- Animated Jet Plane -->
              <div id="aviator-jet" class="absolute bottom-4 left-6 text-3xl sm:text-4xl transition-all duration-150 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] z-10">✈️</div>

              <!-- Main Ascending Multiplier Display -->
              <div class="z-20 text-center pointer-events-none">
                <div id="aviator-multiplier-text" class="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  1.00x
                </div>
                <div id="aviator-status-bar" class="text-[9.5px] font-bold text-slate-400 font-mono mt-1">
                  Ready for Takeoff
                </div>
              </div>
            </div>
          </div>

          <!-- Auto Cashout & Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <div class="flex items-center gap-2">
                  <span class="text-[8px] text-slate-400 font-mono font-bold">Auto Cashout:</span>
                  <input type="number" id="aviator-auto-cashout-val" class="w-14 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5 text-red-400 text-[9px] font-bold font-mono text-center focus:outline-none" value="2.00" step="0.1" min="1.1" max="100" />
                  <span class="text-[8px] text-slate-400 font-mono">x</span>
                </div>
              </div>

              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="aviator-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>

              <div class="grid grid-cols-4 gap-1">
                <button class="aviator-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="aviator-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="aviator-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="aviator-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="aviator-btn-start" class="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-red-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-red-400/30">
                <span>Launch Jet Takeoff</span> <i class="fa-solid fa-plane-departure text-xs"></i>
              </button>
              <button id="aviator-btn-cashout" class="hidden w-full py-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-emerald-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-400/30">
                <span>CASHOUT ৳<span id="aviator-cashout-val">0.00</span></span> <i class="fa-solid fa-sack-dollar text-xs"></i>
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Aviator Fair Play: Cash out before the jet flies away! 5% platform fee applied to net profit.
          </div>
        </div>
      </div>
    `;
  },

  bindAviatorEvents() {
    const startBtn = document.getElementById("aviator-btn-start");
    const cashBtn = document.getElementById("aviator-btn-cashout");
    const multText = document.getElementById("aviator-multiplier-text");
    const statusBar = document.getElementById("aviator-status-bar");
    const jet = document.getElementById("aviator-jet");
    const cashVal = document.getElementById("aviator-cashout-val");
    const historyBar = document.getElementById("aviator-history-bar");
    const autoCashInput = document.getElementById("aviator-auto-cashout-val");

    const history = ["1.24x", "3.85x", "14.20x", "1.10x", "2.40x"];

    document.querySelectorAll(".aviator-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "aviator-bet-amount");
      });
    });

    // Fullscreen toggle
    document.getElementById("aviator-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    const updateHistoryUI = (valStr) => {
      history.shift();
      history.push(valStr);
      if (historyBar) {
        historyBar.innerHTML = history.map(h => {
          const num = parseFloat(h);
          const colorClass = num >= 10 ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : num >= 2 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30";
          return `<span class="px-2 py-0.5 rounded-lg ${colorClass} border text-[9px] font-mono font-bold">${h}</span>`;
        }).join("");
      }
    };

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const bet = this.getBetAmount("aviator-bet-amount");
        if (!this.deductBalance(bet)) return;

        const autoTarget = parseFloat(autoCashInput?.value || "0") || 0;

        this.gameState = {
          running: true,
          bet: bet,
          mult: 1.00,
          flyawayPoint: (1.05 + Math.random() * 12).toFixed(2),
          autoCashTarget: autoTarget,
          interval: null
        };

        startBtn.classList.add("hidden");
        cashBtn.classList.remove("hidden");

        if (statusBar) {
          statusBar.innerText = "🚀 Jet Flying High...";
          statusBar.className = "text-[9.5px] font-bold text-amber-300 font-mono mt-1 animate-pulse";
        }
        if (multText) {
          multText.className = "text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]";
        }

        this.gameState.interval = setInterval(() => {
          if (!this.gameState.running) return;

          this.gameState.mult += 0.03 + (this.gameState.mult * 0.012);
          const currentMult = this.gameState.mult;

          if (multText) {
            multText.innerText = currentMult.toFixed(2) + "x";
          }

          const xPos = Math.min(80, (currentMult - 1) * 7);
          const yPos = Math.min(75, (currentMult - 1) * 9);
          if (jet) {
            jet.style.left = `${8 + xPos}%`;
            jet.style.bottom = `${8 + yPos}%`;
          }

          if (cashVal) {
            cashVal.innerText = (this.gameState.bet * currentMult).toFixed(2);
          }

          // Auto Cashout trigger check
          if (this.gameState.autoCashTarget > 1.0 && currentMult >= this.gameState.autoCashTarget) {
            cashBtn.click();
            return;
          }

          // Flyaway check
          if (currentMult >= parseFloat(this.gameState.flyawayPoint)) {
            clearInterval(this.gameState.interval);
            this.gameState.running = false;

            const finalFly = parseFloat(this.gameState.flyawayPoint).toFixed(2) + "x";
            updateHistoryUI(finalFly);

            if (multText) {
              multText.innerText = "FLEW AWAY! " + finalFly;
              multText.className = "text-3xl sm:text-4xl font-black text-rose-500 font-mono tracking-tight animate-pulse";
            }
            if (statusBar) {
              statusBar.innerText = "💥 Jet Flew Away at " + finalFly;
              statusBar.className = "text-[9.5px] font-bold text-rose-500 font-mono mt-1";
            }

            this.creditLoss(this.gameState.bet, "Aviator Jet Ride", "Auto-Flyaway", "Flew away at " + finalFly);
            this.app.showToast("Plane flew away. Better luck next flight!", "error");

            setTimeout(() => {
              if (jet) {
                jet.style.left = "8%";
                jet.style.bottom = "8%";
              }
              startBtn.classList.remove("hidden");
              cashBtn.classList.add("hidden");
              if (multText) {
                multText.innerText = "1.00x";
                multText.className = "text-4xl sm:text-5xl font-black text-white font-mono tracking-tight";
              }
              if (statusBar) {
                statusBar.innerText = "Ready for Takeoff";
                statusBar.className = "text-[9.5px] font-bold text-slate-400 font-mono mt-1";
              }
            }, 3000);
          }
        }, 100);
      });
    }

    if (cashBtn) {
      cashBtn.addEventListener("click", () => {
        if (!this.gameState.running) return;
        this.gameState.running = false;
        clearInterval(this.gameState.interval);

        const winMult = this.gameState.mult;
        const payout = this.gameState.bet * winMult;
        const netWin = this.creditWinnings(payout, this.gameState.bet, "Aviator Jet Ride", `Cashout ${winMult.toFixed(2)}x`, `Cashed at ${winMult.toFixed(2)}x`);

        updateHistoryUI(winMult.toFixed(2) + "x");

        if (multText) {
          multText.className = "text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]";
        }
        if (statusBar) {
          statusBar.innerText = `🎉 CASHED OUT ৳${netWin.toFixed(2)}!`;
          statusBar.className = "text-[9.5px] font-bold text-emerald-400 font-mono mt-1 animate-pulse";
        }

        this.app.showToast(`🎉 Cashed Out! Won ৳${netWin.toFixed(2)}`, "success");

        if (winMult >= 5.0) {
          this.app.showCongratsSplash("✈️ HIGH FLYING WIN!", `Outstanding cashout at ${winMult.toFixed(2)}x multiplier!`, `৳${netWin.toFixed(2)}`);
        }

        setTimeout(() => {
          if (jet) {
            jet.style.left = "8%";
            jet.style.bottom = "8%";
          }
          startBtn.classList.remove("hidden");
          cashBtn.classList.add("hidden");
          if (multText) {
            multText.innerText = "1.00x";
            multText.className = "text-4xl sm:text-5xl font-black text-white font-mono tracking-tight";
          }
          if (statusBar) {
            statusBar.innerText = "Ready for Takeoff";
            statusBar.className = "text-[9.5px] font-bold text-slate-400 font-mono mt-1";
          }
        }, 3000);
      });
    }
  },

  // =========================================================================
  // 9. THREE SHELL CUPS GAME
  // =========================================================================
  getShellTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-fuchsia-400 tracking-widest block font-mono">MAGIC STREET CASINO</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-whiskey-glass text-fuchsia-400"></i> Three Shell Cups</h3>
          </div>
          <button id="shell-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-fuchsia-955/60 hover:bg-fuchsia-900 border border-fuchsia-800/60 text-fuchsia-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-fuchsia-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-fuchsia-955/20 via-slate-900 to-slate-950 border border-fuchsia-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Shells Table Arena -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4 min-h-[220px]">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Find the Golden Coin 🪙</span>
            
            <!-- 3 Golden Cups Container -->
            <div class="flex justify-around items-center w-full max-w-sm py-4" id="shell-cups-wrapper">
              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="0">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-950 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #1</span>
              </div>

              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="1">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-950 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #2</span>
              </div>

              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="2">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-950 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #3</span>
              </div>
            </div>

            <!-- Commentary Banner -->
            <div id="shell-status" class="text-xs font-black text-fuchsia-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Tap a cup to start the magic shuffle! 🏆
            </div>
          </div>

          <!-- Controls & Bet Amount -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Winning Payout: 2.85x</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="shell-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="shell-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="shell-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="shell-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="shell-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <div class="bg-slate-950 p-3 border border-slate-850 rounded-xl text-center space-y-1">
                <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block">Instant Play Instruction</span>
                <p class="text-[9.5px] font-bold font-mono text-fuchsia-300">Click any cup above to place your bet & reveal!</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Street Magic: 33% winning chance per pick. 5% platform fee applied to net profits.
          </div>
        </div>
      </div>
    `;
  },

  bindShellEvents() {
    const wrapper = document.getElementById("shell-cups-wrapper");
    const containers = document.querySelectorAll(".shell-cup-container");
    const status = document.getElementById("shell-status");

    let isShuffling = false;

    document.querySelectorAll(".shell-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "shell-bet-amount");
      });
    });

    // Fullscreen toggle
    document.getElementById("shell-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    if (wrapper) {
      wrapper.addEventListener("click", (e) => {
        const container = e.target.closest(".shell-cup-container");
        if (!container || isShuffling) return;

        const choiceIdx = parseInt(container.getAttribute("data-cup"));
        const bet = this.getBetAmount("shell-bet-amount");

        if (!this.deductBalance(bet)) return;

        isShuffling = true;
        if (status) {
          status.innerText = "🔮 Magic Shuffling Cups... Keep your eyes on the cups!";
          status.className = "text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full animate-pulse";
        }

        // Hide coins & reset position
        containers.forEach(c => {
          c.querySelector(".shell-coin").classList.add("hidden");
          c.querySelector(".shell-cup").style.transform = "none";
        });

        // Fast Shuffle animation
        let count = 0;
        const interval = setInterval(() => {
          containers.forEach(c => {
            const shiftX = Math.random() * 30 - 15;
            c.querySelector(".shell-cup").style.transform = `translateX(${shiftX}px)`;
          });
          count++;

          if (count >= 10) {
            clearInterval(interval);
            containers.forEach(c => c.querySelector(".shell-cup").style.transform = "none");

            const coinIdx = Math.floor(Math.random() * 3);

            setTimeout(() => {
              isShuffling = false;

              const chosenEl = wrapper.querySelector(`[data-cup="${choiceIdx}"]`);
              const coinEl = wrapper.querySelector(`[data-cup="${coinIdx}"]`);

              if (chosenEl) chosenEl.querySelector(".shell-cup").style.transform = "translateY(-30px)";
              if (coinEl) {
                coinEl.querySelector(".shell-coin").classList.remove("hidden");
                coinEl.querySelector(".shell-cup").style.transform = "translateY(-30px)";
              }

              const won = choiceIdx === coinIdx;
              const payout = bet * 3.0; // 2.85x after 5% net fee

              if (won) {
                const netWin = this.creditWinnings(payout, bet, "Three Shell Cups", `Cup ${choiceIdx + 1}`, `Coin under Cup ${coinIdx + 1}`);
                if (status) {
                  status.innerText = `🎉 PERFECT MATCH! Coin was under Cup #${coinIdx + 1}! Won ৳${netWin.toFixed(2)}`;
                  status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
                }
                this.app.showToast(`🎉 Found Coin! Won ৳${netWin.toFixed(2)}`, "success");
              } else {
                this.creditLoss(bet, "Three Shell Cups", `Cup ${choiceIdx + 1}`, `Coin under Cup ${coinIdx + 1}`);
                if (status) {
                  status.innerText = `❌ Empty Cup! Coin was under Cup #${coinIdx + 1}. Try again!`;
                  status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
                }
                this.app.showToast("Empty cup! Try again.", "error");
              }

            }, 400);
          }
        }, 120);
      });
    }
  },

  // =========================================================================
  // 10. TIGER VS DRAGON
  // =========================================================================
  getTigerDragonTemplate() {
    return `
      <div class="space-y-4">
        <!-- Top bar header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-amber-400 tracking-widest block font-mono">BACCARAT CLASH CASINO</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-dragon text-amber-400"></i> Tiger vs Dragon</h3>
          </div>
          <button id="tiger-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-amber-955/60 hover:bg-amber-900 border border-amber-800/60 text-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-amber-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-amber-955/20 via-slate-900 to-slate-950 border border-amber-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <!-- Casino Table Clash Arena -->
          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4 min-h-[220px]">
            
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Single Card Baccarat Showdown</span>

            <!-- Tiger & Dragon Duel Hands -->
            <div class="flex justify-between items-center w-full max-w-sm px-2">
              
              <!-- Tiger Side Card -->
              <div class="flex flex-col items-center p-3 sm:p-4 bg-orange-950/30 border-2 border-orange-500/40 rounded-2xl w-32 shadow-xl shadow-orange-950/40">
                <span class="text-xs text-orange-400 font-black font-mono flex items-center gap-1">🐯 TIGER</span>
                <div id="tiger-card" class="w-16 h-22 sm:w-20 sm:h-28 bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-orange-400/50 rounded-xl flex items-center justify-center text-3xl font-black font-mono text-white mt-2 shadow-2xl transition-all">
                  ❓
                </div>
                <span id="tiger-card-suit" class="text-[9px] font-mono font-bold text-orange-300 mt-1">Ready</span>
              </div>

              <!-- VS Badge -->
              <div class="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black font-mono text-amber-400 shadow-md">
                VS
              </div>

              <!-- Dragon Side Card -->
              <div class="flex flex-col items-center p-3 sm:p-4 bg-red-950/30 border-2 border-red-500/40 rounded-2xl w-32 shadow-xl shadow-red-950/40">
                <span class="text-xs text-red-400 font-black font-mono flex items-center gap-1">🐲 DRAGON</span>
                <div id="dragon-card" class="w-16 h-22 sm:w-20 sm:h-28 bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-red-400/50 rounded-xl flex items-center justify-center text-3xl font-black font-mono text-white mt-2 shadow-2xl transition-all">
                  ❓
                </div>
                <span id="dragon-card-suit" class="text-[9px] font-mono font-bold text-red-300 mt-1">Ready</span>
              </div>
            </div>

            <!-- Commentary Jumbotron Banner -->
            <div id="tiger-status" class="text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Select Bet Segment & Deal Cards! 🃏
            </div>
          </div>

          <!-- Bet Segment Options -->
          <div class="space-y-2">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block">Select Target Segment</span>
            <div class="grid grid-cols-3 gap-2">
              <button class="tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-orange-500/15 border-orange-500 text-orange-400 cursor-pointer active:scale-95 transition" data-segment="tiger">
                <span class="text-xs font-black block">🐯 TIGER</span>
                <span class="text-[8px] block opacity-80">Payout: 1.90x</span>
              </button>

              <button class="tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-segment="tie">
                <span class="text-xs font-black block">🤝 TIE MATCH</span>
                <span class="text-[8px] block opacity-80">Payout: 8.00x</span>
              </button>

              <button class="tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-segment="dragon">
                <span class="text-xs font-black block">🐲 DRAGON</span>
                <span class="text-[8px] block opacity-80">Payout: 1.90x</span>
              </button>
            </div>
          </div>

          <!-- Controls & Bet Amount -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="tiger-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="tiger-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="tiger-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="tiger-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="tiger-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="tiger-btn-deal" class="w-full py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-amber-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-400/30">
                <span>Deal Clash Cards</span> <i class="fa-solid fa-clone text-xs"></i>
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Casino Fair Deal: Single deck card ranks (K high, A low). 5% platform fee on net profits.
          </div>
        </div>
      </div>
    `;
  },

  bindTigerDragonEvents() {
    const tigerCard = document.getElementById("tiger-card");
    const dragonCard = document.getElementById("dragon-card");
    const tigerSuit = document.getElementById("tiger-card-suit");
    const dragonSuit = document.getElementById("dragon-card-suit");
    const status = document.getElementById("tiger-status");
    const dealBtn = document.getElementById("tiger-btn-deal");
    const segmentBtns = document.querySelectorAll(".tiger-bet-btn");

    let selectedSegment = "tiger";

    segmentBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        segmentBtns.forEach(b => {
          b.className = "tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        
        const seg = btn.getAttribute("data-segment");
        if (seg === "tiger") {
          btn.className = "tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-orange-500/20 border-orange-500 text-orange-400 cursor-pointer active:scale-95 transition";
        } else if (seg === "dragon") {
          btn.className = "tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-red-500/20 border-red-500 text-red-400 cursor-pointer active:scale-95 transition";
        } else {
          btn.className = "tiger-bet-btn p-3 rounded-xl text-center font-mono border bg-amber-500/20 border-amber-500 text-amber-300 cursor-pointer active:scale-95 transition";
        }

        selectedSegment = seg;
      });
    });

    document.querySelectorAll(".tiger-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleBetAdjustment(btn.getAttribute("data-op"), "tiger-bet-amount");
      });
    });

    // Fullscreen toggle
    document.getElementById("tiger-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    if (dealBtn) {
      dealBtn.addEventListener("click", () => {
        const bet = this.getBetAmount("tiger-bet-amount");
        if (!this.deductBalance(bet)) return;

        dealBtn.disabled = true;
        dealBtn.innerHTML = `<span>Dealing Cards...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

        if (status) {
          status.innerText = "🃏 Dealer is shuffling & drawing cards...";
          status.className = "text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full animate-pulse";
        }

        if (tigerCard) tigerCard.innerText = "❓";
        if (dragonCard) dragonCard.innerText = "❓";
        if (tigerSuit) tigerSuit.innerText = "Shuffling";
        if (dragonSuit) dragonSuit.innerText = "Shuffling";

        setTimeout(() => {
          const ranks = [
            { val: 1, label: "A" }, { val: 2, label: "2" }, { val: 3, label: "3" }, { val: 4, label: "4" },
            { val: 5, label: "5" }, { val: 6, label: "6" }, { val: 7, label: "7" }, { val: 8, label: "8" },
            { val: 9, label: "9" }, { val: 10, label: "10" }, { val: 11, label: "J" }, { val: 12, label: "Q" },
            { val: 13, label: "K" }
          ];

          const suits = ["♠️", "♥️", "♦️", "♣️"];

          const tCard = ranks[Math.floor(Math.random() * ranks.length)];
          const dCard = ranks[Math.floor(Math.random() * ranks.length)];
          const tSuit = suits[Math.floor(Math.random() * suits.length)];
          const dSuit = suits[Math.floor(Math.random() * suits.length)];

          if (tigerCard) tigerCard.innerText = tCard.label;
          if (dragonCard) dragonCard.innerText = dCard.label;
          if (tigerSuit) tigerSuit.innerText = `Suit: ${tSuit}`;
          if (dragonSuit) dragonSuit.innerText = `Suit: ${dSuit}`;

          if (navigator.vibrate) navigator.vibrate(30);

          let resultType = "";
          if (tCard.val > dCard.val) resultType = "tiger";
          else if (dCard.val > tCard.val) resultType = "dragon";
          else resultType = "tie";

          let mult = 0;
          if (selectedSegment === resultType) {
            mult = resultType === "tie" ? 8.0 : 1.90;
          }

          const payout = bet * mult;
          const resultLabel = `Tiger ${tCard.label}${tSuit} vs Dragon ${dCard.label}${dSuit}`;

          setTimeout(() => {
            dealBtn.disabled = false;
            dealBtn.innerHTML = `<span>Deal Clash Cards</span> <i class="fa-solid fa-clone text-xs"></i>`;

            if (mult > 1.0) {
              const netWin = this.creditWinnings(payout, bet, "Tiger vs Dragon", selectedSegment.toUpperCase(), resultLabel);
              if (status) {
                status.innerText = `🎉 WINNER! ${resultType.toUpperCase()} won (${resultLabel})! Won ৳${netWin.toFixed(2)}`;
                status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
              }
              this.app.showToast(`🎉 ${resultType.toUpperCase()} Win! Won ৳${netWin.toFixed(2)}`, "success");

              if (mult >= 8.0) {
                this.app.showCongratsSplash("🔥 TIE CLASH WIN!", `Mega win on Tie match bet!`, `৳${netWin.toFixed(2)}`);
              }
            } else {
              this.creditLoss(bet, "Tiger vs Dragon", selectedSegment.toUpperCase(), resultLabel);
              if (status) {
                status.innerText = `❌ ${resultType.toUpperCase()} WON (${resultLabel}). Better luck next hand!`;
                status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
              }
              this.app.showToast(`Outcome: ${resultType.toUpperCase()}. Try again!`, "error");
            }
          }, 300);

        }, 1200);
      });
    }
  }
};

// Global assignment for easy cross-file integration
window.ExtraGamesModule = ExtraGamesModule;

