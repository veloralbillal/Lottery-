export const CrashGame = {
  getTemplate() {
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

  bindEvents(core: any) {
    const startBtn = document.getElementById("crash-btn-start") as HTMLButtonElement;
    const cashBtn = document.getElementById("crash-btn-cashout") as HTMLButtonElement;
    const multText = document.getElementById("crash-multiplier-text");
    const statusBar = document.getElementById("crash-status-bar");
    const rocket = document.getElementById("crash-rocket");
    const cashVal = document.getElementById("crash-cashout-val");

    if (!startBtn || !cashBtn) return;

    document.querySelectorAll(".crash-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "crash-bet-amount");
      });
    });

    startBtn.addEventListener("click", () => {
      const bet = core.getBetAmount("crash-bet-amount");
      if (!core.deductBalance(bet)) return;

      let crashValPoint;
      const rCrash = Math.random();
      if (rCrash < 0.40) {
        crashValPoint = (1.00 + Math.random() * 0.07).toFixed(2);
      } else if (rCrash < 0.80) {
        crashValPoint = (1.08 + Math.random() * 0.42).toFixed(2);
      } else {
        crashValPoint = (1.51 + Math.pow(Math.random(), 2) * 1.29).toFixed(2);
      }

      core.gameState = {
        running: true,
        bet: bet,
        mult: 1.00,
        crashPoint: crashValPoint,
        interval: null
      };

      startBtn.classList.add("hidden");
      cashBtn.classList.remove("hidden");
      if (statusBar) {
        statusBar.innerText = "Rocket launched! Flying...";
        statusBar.className = "text-[9px] text-yellow-400 font-mono mt-2";
      }
      if (multText) {
        multText.className = "text-4xl font-black text-yellow-400 font-mono tracking-tight";
      }

      core.gameState.interval = setInterval(() => {
        if (!core.gameState.running) return;

        core.gameState.mult += 0.05 + (core.gameState.mult * 0.02);
        if (multText) {
          multText.innerText = core.gameState.mult.toFixed(2) + "x";
        }

        const xPos = Math.min(80, (core.gameState.mult - 1) * 10);
        const yPos = Math.min(80, (core.gameState.mult - 1) * 12);
        if (rocket) {
          rocket.style.left = `${10 + xPos}%`;
          rocket.style.bottom = `${10 + yPos}%`;
        }

        if (cashVal) {
          cashVal.innerText = (core.gameState.bet * core.gameState.mult).toFixed(1);
        }

        if (core.gameState.mult >= parseFloat(core.gameState.crashPoint)) {
          clearInterval(core.gameState.interval);
          core.gameState.running = false;
          if (multText) {
            multText.innerText = "CRASHED! " + core.gameState.crashPoint + "x";
            multText.className = "text-4xl font-black text-rose-500 font-mono tracking-tight animate-bounce";
          }
          if (statusBar) {
            statusBar.innerText = "💥 Boom! Exploded at " + core.gameState.crashPoint + "x";
            statusBar.className = "text-[9px] text-rose-500 font-mono mt-2";
          }
          
          if (rocket) {
            rocket.style.transform = "scale(1.5) rotate(90deg)";
            rocket.innerText = "💥";
          }

          core.creditLoss(core.gameState.bet, "Rocket Fly (Crash)", "Auto-Fly", "Crashed at " + core.gameState.crashPoint + "x");
          core.app.showToast("Crashed! Better luck next launch.", "error");

          setTimeout(() => {
            if (rocket) {
              rocket.style.transform = "none";
              rocket.innerText = "🚀";
              rocket.style.left = "10%";
              rocket.style.bottom = "10%";
            }
            startBtn.classList.remove("hidden");
            cashBtn.classList.add("hidden");
            if (multText) {
              multText.innerText = "1.00x";
              multText.className = "text-4xl font-black text-red-500 font-mono tracking-tight";
            }
            if (statusBar) {
              statusBar.innerText = "Ready for Lift Off";
              statusBar.className = "text-[9px] text-slate-500 font-mono mt-2";
            }
          }, 4000);
        }
      }, 100);
    });

    cashBtn.addEventListener("click", () => {
      if (!core.gameState.running) return;
      core.gameState.running = false;
      clearInterval(core.gameState.interval);

      const winMult = core.gameState.mult;
      const payout = core.gameState.bet * winMult;
      const netWin = core.creditWinnings(payout, core.gameState.bet, "Rocket Fly (Crash)", `Cashout ${winMult.toFixed(2)}x`, `Won at ${winMult.toFixed(2)}x`);

      if (multText) {
        multText.className = "text-4xl font-black text-emerald-400 font-mono tracking-tight";
      }
      if (statusBar) {
        statusBar.innerText = `🎉 Successfully Cashed Out ৳${netWin.toFixed(1)}!`;
        statusBar.className = "text-[9px] text-emerald-400 font-mono mt-2";
      }
      core.app.showToast(`Cashed Out successfully! Won ৳${netWin.toFixed(1)}`, "success");

      setTimeout(() => {
        if (rocket) {
          rocket.style.left = "10%";
          rocket.style.bottom = "10%";
        }
        startBtn.classList.remove("hidden");
        cashBtn.classList.add("hidden");
        if (multText) {
          multText.innerText = "1.00x";
          multText.className = "text-4xl font-black text-red-500 font-mono tracking-tight";
        }
        if (statusBar) {
          statusBar.innerText = "Ready for Lift Off";
          statusBar.className = "text-[9px] text-slate-500 font-mono mt-2";
        }
      }, 3000);
    });
  }
};
