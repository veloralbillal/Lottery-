export const KenoGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-indigo-400 tracking-widest block font-mono">LOTTERY TUBE ARENA</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-dice text-indigo-400"></i> Super Match Keno</h3>
          </div>
          <button id="keno-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-indigo-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-indigo-955/20 via-slate-900 to-slate-950 border border-indigo-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4">
            <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold mb-1 font-mono">DRAWING TUBE (20 BALLS)</span>
            
            <div id="keno-drawn-rack" class="w-full h-14 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 px-4 shadow-inner">
              <span class="text-[9.5px] text-slate-500 font-mono italic">Winning balls will appear here...</span>
            </div>

            <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 w-full max-w-sm" id="keno-number-grid">
              ${Array.from({ length: 20 }, (_, i) => `
                <button class="keno-num-btn h-9 bg-slate-900 hover:bg-slate-850 text-xs font-mono font-black text-white rounded-xl border border-slate-800 cursor-pointer transition active:scale-95 flex items-center justify-center shadow-sm" data-num="${i + 1}">
                  ${i + 1}
                </button>
              `).join("")}
            </div>

            <div class="flex items-center justify-between w-full max-w-sm px-1">
              <span id="keno-status" class="text-[8.5px] font-bold text-slate-400 font-mono">Selected: 0/5 numbers</span>
              <div class="flex items-center gap-1.5">
                <button id="keno-btn-auto-3" class="text-[8px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition">Auto 3</button>
                <button id="keno-btn-auto-5" class="text-[8px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition">Auto 5</button>
                <button id="keno-btn-clear" class="text-[8px] font-bold px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700 transition">Clear</button>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase block">Current Payout Table</span>
            <div id="keno-paytable-bar" class="grid grid-cols-4 gap-1.5">
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
                <input type="number" id="keno-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>
              <div class="grid grid-cols-4 gap-1">
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="keno-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
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
            ⚡ Stadium Rules: 5% platform fee on net winnings. Pick up to 5 numbers. 5 balls drawn out of 20 total.
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const gridBtns = document.querySelectorAll(".keno-num-btn");
    const status = document.getElementById("keno-status");
    const drawBtn = document.getElementById("keno-btn-draw") as HTMLButtonElement;
    const drawnRack = document.getElementById("keno-drawn-rack");
    const paytableBar = document.getElementById("keno-paytable-bar");

    let picks: number[] = [];

    const getPaytable = (pickCount: number) => {
      switch (pickCount) {
        case 1: return [{ m: 1, mult: 3.5 }];
        case 2: return [{ m: 1, mult: 1.0 }, { m: 2, mult: 8.0 }];
        case 3: return [{ m: 2, mult: 2.0 }, { m: 3, mult: 25.0 }];
        case 4: return [{ m: 2, mult: 1.0 }, { m: 3, mult: 5.0 }, { m: 4, mult: 50.0 }];
        case 5: return [{ m: 3, mult: 3.0 }, { m: 4, mult: 15.0 }, { m: 5, mult: 100.0 }];
        default: return [];
      }
    };

    const updatePaytableUI = () => {
      if (!paytableBar) return;
      const count = picks.length;
      if (count === 0) {
        paytableBar.innerHTML = `<div class="col-span-4 text-center text-[8px] text-slate-600 font-mono py-2 italic border border-dashed border-slate-800 rounded-xl">Pick numbers to view payout odds</div>`;
        return;
      }
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
        const num = parseInt(btn.getAttribute("data-num")!);
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
        const num = parseInt(btn.getAttribute("data-num")!);
        if (picks.includes(num)) {
          picks = picks.filter(x => x !== num);
        } else {
          if (picks.length >= 5) {
            core.app.showToast("Maximum 5 lucky numbers allowed!", "error");
            return;
          }
          picks.push(num);
        }
        updatePicksUI();
      });
    });

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

    document.querySelectorAll(".keno-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "keno-bet-amount");
      });
    });

    document.getElementById("keno-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    if (drawBtn) {
      drawBtn.addEventListener("click", () => {
        if (picks.length === 0) {
          core.app.showToast("Please select at least 1 lucky number!", "error");
          return;
        }

        const bet = core.getBetAmount("keno-bet-amount");
        if (!core.deductBalance(bet)) return;

        drawBtn.disabled = true;
        drawBtn.innerHTML = `<span>Drawing Balls...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

        if (drawnRack) {
          drawnRack.innerHTML = `<span class="text-[9px] text-indigo-400 font-mono animate-pulse">⚡ Rolling lottery tube...</span>`;
        }

        const winningNumbers: number[] = [];
        while (winningNumbers.length < 5) {
          const rand = Math.floor(Math.random() * 20) + 1;
          if (!winningNumbers.includes(rand)) winningNumbers.push(rand);
        }

        let ballIndex = 0;
        if (drawnRack) drawnRack.innerHTML = "";

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
            ballEl.innerText = ballNum.toString();
            if (drawnRack) drawnRack.appendChild(ballEl);

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
                const netWin = core.creditWinnings(payout, bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Matched ${matchCount}]`);
                if (status) {
                  status.innerText = `🎉 WON ৳${netWin.toFixed(2)}! Matched ${matchCount} ball(s) (${matches.join(",")})`;
                  status.className = "text-[9px] font-bold text-emerald-400 font-mono animate-pulse";
                }
                core.app.showToast(`🎉 Keno Match! Won ৳${netWin.toFixed(2)}`, "success");

                if (mult >= 10.0) {
                  core.app.showCongratsSplash("🎱 KENO MEGA MATCH!", `Matched ${matchCount} balls out of ${picks.length} picks!`, `৳${netWin.toFixed(2)}`);
                }
              } else if (mult === 1.0) {
                core.creditWinnings(payout, bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Push]`);
                if (status) {
                  status.innerText = `🤝 Push! Matched ${matchCount}. Bet refunded!`;
                  status.className = "text-[9px] font-bold text-amber-400 font-mono";
                }
                core.app.showToast("Push! Bet refunded.", "info");
              } else {
                core.creditLoss(bet, "Super Match Keno", `Picks: ${picks.join(",")}`, `Draws: ${winningNumbers.join(",")} [Matched ${matchCount}]`);
                if (status) {
                  status.innerText = `💥 Matched ${matchCount} ball(s). Better luck next draw!`;
                  status.className = "text-[9px] font-bold text-rose-400 font-mono";
                }
                core.app.showToast("No win this draw. Try again!", "error");
              }
            }, 500);
          }
        }, 300);
      });
    }
  }
};
