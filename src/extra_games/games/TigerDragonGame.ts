export const TigerDragonGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-orange-400 tracking-widest block font-mono">ORIENTAL DRAGON CASINO</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-dragon text-orange-400"></i> Tiger vs Dragon</h3>
          </div>
          <button id="td-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-orange-955/60 hover:bg-orange-900 border border-orange-800/60 text-orange-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-orange-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-orange-955/20 via-slate-900 to-slate-950 border border-orange-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-6">
            <div class="flex justify-between items-center w-full max-w-xs gap-4 relative">
              <div class="flex flex-col items-center gap-3 relative z-10">
                <span class="text-[8px] text-amber-500 font-mono font-bold uppercase">Tiger Side</span>
                <div id="td-card-tiger" class="w-20 h-28 sm:w-24 sm:h-32 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-600/40 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500">
                  🐅
                </div>
                <div id="td-val-tiger" class="text-lg font-black text-white font-mono hidden">10</div>
              </div>

              <div class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-500 font-mono">VS</div>
                <div id="td-tie-indicator" class="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[8px] font-black text-slate-600 font-mono hidden">TIE!</div>
              </div>

              <div class="flex flex-col items-center gap-3 relative z-10">
                <span class="text-[8px] text-red-500 font-mono font-bold uppercase">Dragon Side</span>
                <div id="td-card-dragon" class="w-20 h-28 sm:w-24 sm:h-32 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-red-600/40 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500">
                  🐉
                </div>
                <div id="td-val-dragon" class="text-lg font-black text-white font-mono hidden">K</div>
              </div>
            </div>

            <div id="td-status" class="text-xs font-black text-orange-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Predict the winning side to play! 🐅 vs 🐉
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block text-center">Select Winning Prediction</span>
            <div class="grid grid-cols-3 gap-3">
              <button class="td-bet-btn p-3 rounded-2xl text-center font-mono border bg-amber-500/10 border-amber-500 text-amber-500 cursor-pointer active:scale-95 transition hover:bg-amber-500/20" data-side="tiger">
                <span class="text-xs font-black block">TIGER</span>
                <span class="text-[8px] block opacity-80">Payout: 1.95x</span>
              </button>
              <button class="td-bet-btn p-3 rounded-2xl text-center font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:bg-emerald-500/10 hover:border-emerald-500" data-side="tie">
                <span class="text-xs font-black block text-emerald-400">TIE</span>
                <span class="text-[8px] block opacity-80">Payout: 8.0x</span>
              </button>
              <button class="td-bet-btn p-3 rounded-2xl text-center font-mono border bg-red-500/10 border-red-500 text-red-500 cursor-pointer active:scale-95 transition hover:bg-red-500/20" data-side="dragon">
                <span class="text-xs font-black block">DRAGON</span>
                <span class="text-[8px] block opacity-80">Payout: 1.95x</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="td-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="td-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="td-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="td-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="td-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="td-btn-deal" class="w-full py-3.5 bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-orange-600/20 transition active:scale-95 cursor-pointer uppercase tracking-wider border border-orange-400/30">
                Deal Cards
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Casino oriental rules: Tiger/Dragon (1.95x), Tie (8x). Card values: A=1, K=13. 5% platform fee on net profit.
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const cardTiger = document.getElementById("td-card-tiger");
    const cardDragon = document.getElementById("td-card-dragon");
    const valTiger = document.getElementById("td-val-tiger");
    const valDragon = document.getElementById("td-val-dragon");
    const tieInd = document.getElementById("td-tie-indicator");
    const status = document.getElementById("td-status");
    const dealBtn = document.getElementById("td-btn-deal") as HTMLButtonElement;
    const betBtns = document.querySelectorAll(".td-bet-btn");

    let selectedSide = "";

    betBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        betBtns.forEach(b => {
          b.classList.remove("bg-amber-500/20", "border-amber-500", "text-amber-500", "bg-red-500/20", "border-red-500", "text-red-500", "bg-emerald-500/20", "border-emerald-500", "text-emerald-500", "bg-slate-900", "border-slate-800", "text-slate-400");
          b.classList.add("bg-slate-900", "border-slate-800", "text-slate-400");
        });

        const side = btn.getAttribute("data-side")!;
        selectedSide = side;

        if (side === "tiger") {
          btn.classList.replace("bg-slate-900", "bg-amber-500/20");
          btn.classList.replace("border-slate-800", "border-amber-500");
          btn.classList.replace("text-slate-400", "text-amber-500");
        } else if (side === "dragon") {
          btn.classList.replace("bg-slate-900", "bg-red-500/20");
          btn.classList.replace("border-slate-800", "border-red-500");
          btn.classList.replace("text-slate-400", "text-red-500");
        } else {
          btn.classList.replace("bg-slate-900", "bg-emerald-500/20");
          btn.classList.replace("border-slate-800", "border-emerald-500");
          btn.classList.replace("text-slate-400", "text-emerald-500");
        }
      });
    });

    document.querySelectorAll(".td-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "td-bet-amount");
      });
    });

    document.getElementById("td-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    if (dealBtn) {
      dealBtn.addEventListener("click", () => {
        if (!selectedSide) {
          core.app.showToast("Please select a side to bet!", "error");
          return;
        }

        const bet = core.getBetAmount("td-bet-amount");
        if (!core.deductBalance(bet)) return;

        dealBtn.disabled = true;
        dealBtn.innerHTML = `<span>Dealing...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

        if (cardTiger) {
          cardTiger.classList.add("scale-110", "rotate-3", "opacity-50");
          cardTiger.innerHTML = "🎴";
        }
        if (cardDragon) {
          cardDragon.classList.add("scale-110", "-rotate-3", "opacity-50");
          cardDragon.innerHTML = "🎴";
        }
        if (valTiger) valTiger.classList.add("hidden");
        if (valDragon) valDragon.classList.add("hidden");
        if (tieInd) tieInd.classList.add("hidden");

        if (status) {
          status.innerText = "🃏 Dealing cards... Who will win?";
          status.className = "text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full animate-pulse";
        }

        setTimeout(() => {
          const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
          const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

          const tIdx = Math.floor(Math.random() * 13);
          const dIdx = Math.floor(Math.random() * 13);

          const tCard = cards[tIdx];
          const dCard = cards[dIdx];
          const tVal = values[tIdx];
          const dVal = values[dIdx];

          const winningSide = tVal > dVal ? "tiger" : dVal > tVal ? "dragon" : "tie";
          const isWin = selectedSide === winningSide;

          if (cardTiger) {
            cardTiger.classList.remove("scale-110", "rotate-3", "opacity-50");
            cardTiger.innerHTML = `<span class="text-white font-black">${tCard}</span>`;
            if (winningSide === "tiger") cardTiger.classList.add("border-amber-400", "shadow-amber-500/30");
          }
          if (cardDragon) {
            cardDragon.classList.remove("scale-110", "-rotate-3", "opacity-50");
            cardDragon.innerHTML = `<span class="text-white font-black">${dCard}</span>`;
            if (winningSide === "dragon") cardDragon.classList.add("border-red-400", "shadow-red-500/30");
          }
          if (valTiger) {
            valTiger.innerText = tVal.toString();
            valTiger.classList.remove("hidden");
          }
          if (valDragon) {
            valDragon.innerText = dVal.toString();
            valDragon.classList.remove("hidden");
          }
          if (winningSide === "tie" && tieInd) tieInd.classList.remove("hidden");

          if (navigator.vibrate) navigator.vibrate(isWin ? 40 : 20);

          if (isWin) {
            const mult = winningSide === "tie" ? 8.0 : 1.95;
            const payout = bet * mult;
            const netWin = core.creditWinnings(payout, bet, "Tiger vs Dragon", selectedSide.toUpperCase(), `Tiger(${tCard}) vs Dragon(${dCard}) - ${winningSide.toUpperCase()} WON`);
            
            if (status) {
              status.innerText = `🎉 WINNER! ${winningSide.toUpperCase()} won! Won ৳${netWin.toFixed(2)}`;
              status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
            }
            core.app.showToast(`🎉 DEALT WIN! Won ৳${netWin.toFixed(2)}`, "success");
            
            if (mult >= 8.0) {
              core.app.showCongratsSplash("🐅 VS 🐉 TIE MASTER!", `Incredible prediction! Dealt a perfect TIE (Value: ${tVal})!`, `৳${netWin.toFixed(2)}`);
            }
          } else {
            core.creditLoss(bet, "Tiger vs Dragon", selectedSide.toUpperCase(), `Tiger(${tCard}) vs Dragon(${dCard}) - ${winningSide.toUpperCase()} WON`);
            if (status) {
              status.innerText = `❌ LOSS! ${winningSide.toUpperCase()} won this round. Try again!`;
              status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
            }
            core.app.showToast(`Lost! ${winningSide.toUpperCase()} won.`, "error");
          }

          setTimeout(() => {
            dealBtn.disabled = false;
            dealBtn.innerHTML = "Deal Cards";
            if (cardTiger) cardTiger.classList.remove("border-amber-400", "shadow-amber-500/30");
            if (cardDragon) cardDragon.classList.remove("border-red-400", "shadow-red-500/30");
          }, 3000);

        }, 1000);
      });
    }
  }
};
