import { FloatingToastNotification } from "../floating_toast.js";

export const ExtraGamesCore = {
  activeGame: null as string | null,
  gameState: {} as any,
  app: null as any,

  init(appInstance: any) {
    this.app = appInstance;
    console.log("ExtraGamesModule initialized successfully with 10 Premium games.");
  },

  getBetAmount(inputId: string) {
    const el = document.getElementById(inputId) as HTMLInputElement;
    if (!el) return 10;
    return Math.max(5, Math.floor(parseFloat(el.value) || 10));
  },

  handleBetAdjustment(op: string, inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input || !this.app.currentUser) return;
    let currentBet = parseFloat(input.value) || 10;
    if (op === "half") currentBet = Math.max(5, currentBet / 2);
    else if (op === "double") currentBet = Math.min(1000, currentBet * 2);
    else if (op === "min") currentBet = 5;
    else if (op === "max") currentBet = Math.min(1000, this.app.currentUser.balance);
    input.value = Math.floor(currentBet).toString();
  },

  deductBalance(amount: number) {
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

  creditWinnings(winAmount: number, betAmount: number, gameName: string, choiceLabel: string, resultLabel: string) {
    if (!this.app.currentUser) return 0;
    
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

    this.app.saveDB();
    
    const ledgerContainer = document.getElementById("games-history-logs-container");
    if (ledgerContainer && (window as any).GameHubModule) {
      (window as any).GameHubModule.renderRecentLedger(this.app);
    } else {
      this.renderEmbeddedRecentLedger();
    }

    return netWin;
  },

  creditLoss(betAmount: number, gameName: string, choiceLabel: string, resultLabel: string) {
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
    if (ledgerContainer && (window as any).GameHubModule) {
      (window as any).GameHubModule.renderRecentLedger(this.app);
    } else {
      this.renderEmbeddedRecentLedger();
    }
  },

  renderEmbeddedRecentLedger() {
    if (!this.app.currentUser) return;
    const historyContainer = document.getElementById("games-history-logs-container");
    const totalPlayedEl = document.getElementById("games-total-played");
    if (!historyContainer) return;

    const myGames = (this.app.db.gamesLedger || []).filter((g: any) => g.userId === this.app.currentUser.id);
    if (totalPlayedEl) {
      totalPlayedEl.innerText = `${myGames.length} Play${myGames.length !== 1 ? 's' : ''}`;
    }

    if (myGames.length === 0) {
      historyContainer.innerHTML = `<div class="text-[9.5px] text-slate-600 text-center py-4">No games played yet.</div>`;
    } else {
      historyContainer.innerHTML = myGames.slice(0, 5).map((game: any) => {
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
  }
};
