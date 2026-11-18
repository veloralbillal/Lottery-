export const AviatorGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
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

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-3">
            <div class="flex items-center justify-between w-full">
              <span class="text-[7.5px] text-slate-400 font-mono font-bold uppercase">Recent Flights</span>
              <div id="aviator-history-bar" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[220px] sm:max-w-xs">
              </div>
            </div>

            <div id="aviator-radar-box" class="relative w-full h-48 sm:h-56 border-2 border-slate-800 rounded-2xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
              <div id="aviator-jet" class="absolute bottom-4 left-6 text-3xl sm:text-4xl transition-all duration-150 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] z-10">✈️</div>
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
                <button class="aviator-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
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

  bindEvents(core: any) {
    const startBtn = document.getElementById("aviator-btn-start") as HTMLButtonElement;
    const cashBtn = document.getElementById("aviator-btn-cashout") as HTMLButtonElement;
    const multText = document.getElementById("aviator-multiplier-text");
    const statusBar = document.getElementById("aviator-status-bar");
    const jet = document.getElementById("aviator-jet");
    const cashVal = document.getElementById("aviator-cashout-val");
    const historyBar = document.getElementById("aviator-history-bar");
    const autoCashInput = document.getElementById("aviator-auto-cashout-val") as HTMLInputElement;

    const history = ["1.24x", "3.85x", "14.20x", "1.10x", "2.40x"];

    const updateHistoryUI = (valStr: string) => {
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

    updateHistoryUI(history[history.length - 1]); // Initial render of default history

    document.querySelectorAll(".aviator-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "aviator-bet-amount");
      });
    });

    document.getElementById("aviator-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const bet = core.getBetAmount("aviator-bet-amount");
        if (!core.deductBalance(bet)) return;

        const autoTarget = parseFloat(autoCashInput?.value || "0") || 0;

        let flyPoint;
        const rJet = Math.random();
        if (rJet < 0.40) {
          flyPoint = (1.00 + Math.random() * 0.06).toFixed(2);
        } else if (rJet < 0.80) {
          flyPoint = (1.07 + Math.random() * 0.48).toFixed(2);
        } else {
          flyPoint = (1.56 + Math.pow(Math.random(), 2) * 1.44).toFixed(2);
        }

        core.gameState = {
          running: true,
          bet: bet,
          mult: 1.00,
          flyawayPoint: flyPoint,
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

        core.gameState.interval = setInterval(() => {
          if (!core.gameState.running) return;

          core.gameState.mult += 0.03 + (core.gameState.mult * 0.012);
          const currentMult = core.gameState.mult;

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
            cashVal.innerText = (core.gameState.bet * currentMult).toFixed(2);
          }

          if (core.gameState.autoCashTarget > 1.0 && currentMult >= core.gameState.autoCashTarget) {
            cashBtn.click();
            return;
          }

          if (currentMult >= parseFloat(core.gameState.flyawayPoint)) {
            clearInterval(core.gameState.interval);
            core.gameState.running = false;

            const finalFly = parseFloat(core.gameState.flyawayPoint).toFixed(2) + "x";
            updateHistoryUI(finalFly);

            if (multText) {
              multText.innerText = "FLEW AWAY! " + finalFly;
              multText.className = "text-3xl sm:text-4xl font-black text-rose-500 font-mono tracking-tight animate-pulse";
            }
            if (statusBar) {
              statusBar.innerText = "💥 Jet Flew Away at " + finalFly;
              statusBar.className = "text-[9.5px] font-bold text-rose-500 font-mono mt-1";
            }

            core.creditLoss(core.gameState.bet, "Aviator Jet Ride", "Auto-Flyaway", "Flew away at " + finalFly);
            core.app.showToast("Plane flew away. Better luck next flight!", "error");

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
        if (!core.gameState.running) return;
        core.gameState.running = false;
        clearInterval(core.gameState.interval);

        const winMult = core.gameState.mult;
        const payout = core.gameState.bet * winMult;
        const netWin = core.creditWinnings(payout, core.gameState.bet, "Aviator Jet Ride", `Cashout ${winMult.toFixed(2)}x`, `Cashed at ${winMult.toFixed(2)}x`);

        updateHistoryUI(winMult.toFixed(2) + "x");

        if (multText) {
          multText.className = "text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]";
        }
        if (statusBar) {
          statusBar.innerText = `🎉 CASHED OUT ৳${netWin.toFixed(2)}!`;
          statusBar.className = "text-[9.5px] font-bold text-emerald-400 font-mono mt-1 animate-pulse";
        }

        core.app.showToast(`🎉 Cashed Out! Won ৳${netWin.toFixed(2)}`, "success");

        if (winMult >= 5.0) {
          core.app.showCongratsSplash("✈️ HIGH FLYING WIN!", `Outstanding cashout at ${winMult.toFixed(2)}x multiplier!`, `৳${netWin.toFixed(2)}`);
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
  }
};
