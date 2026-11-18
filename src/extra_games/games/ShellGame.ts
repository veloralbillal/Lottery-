export const ShellGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
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

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4 min-h-[220px]">
            <span class="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Find the Golden Coin 🪙</span>
            
            <div class="flex justify-around items-center w-full max-w-sm py-4" id="shell-cups-wrapper">
              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="0">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-955 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #1</span>
              </div>

              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="1">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-955 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #2</span>
              </div>

              <div class="flex flex-col items-center relative shell-cup-container cursor-pointer group active:scale-95 transition" data-cup="2">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-fuchsia-955 via-slate-900 to-purple-900 border-2 border-fuchsia-500/40 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-fuchsia-950/50 shell-cup transition-all duration-300 group-hover:border-fuchsia-400">
                  🏆
                </div>
                <div class="absolute bottom-2 text-2xl hidden shell-coin animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🪙</div>
                <span class="text-[9px] text-fuchsia-300 font-mono font-bold mt-2">Cup #3</span>
              </div>
            </div>

            <div id="shell-status" class="text-xs font-black text-fuchsia-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Tap a cup to start the magic shuffle! 🏆
            </div>
          </div>

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
              <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 text-center font-mono space-y-1">
                <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Potential Win</span>
                <span id="shell-potential-val" class="text-emerald-400 font-extrabold text-xs">৳28.50</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Magic Casino: 5% platform fee on net profit. Finding the golden coin is purely randomized.
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const cups = document.querySelectorAll(".shell-cup-container");
    const status = document.getElementById("shell-status");
    const betInput = document.getElementById("shell-bet-amount") as HTMLInputElement;
    const potentialVal = document.getElementById("shell-potential-val");

    const updatePotential = () => {
      const bet = parseFloat(betInput?.value || "10") || 10;
      if (potentialVal) potentialVal.innerText = `৳${(bet * 2.85).toFixed(2)}`;
    };

    if (betInput) betInput.addEventListener("input", updatePotential);
    updatePotential();

    document.querySelectorAll(".shell-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "shell-bet-amount");
        updatePotential();
      });
    });

    document.getElementById("shell-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    let isPlaying = false;

    cups.forEach(cup => {
      cup.addEventListener("click", () => {
        if (isPlaying) return;
        const bet = core.getBetAmount("shell-bet-amount");
        if (!core.deductBalance(bet)) return;

        isPlaying = true;
        const cupIdx = parseInt(cup.getAttribute("data-cup")!);

        if (status) {
          status.innerText = "✨ MAGIC SHUFFLE! Shuffling golden cups...";
          status.className = "text-xs font-black text-amber-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full animate-pulse";
        }

        const wrapper = document.getElementById("shell-cups-wrapper");
        if (wrapper) wrapper.classList.add("animate-pulse");

        setTimeout(() => {
          if (wrapper) wrapper.classList.remove("animate-pulse");
          
          const winningCup = Math.floor(Math.random() * 3);
          const isWin = cupIdx === winningCup;

          cups.forEach((c, idx) => {
            const innerCup = c.querySelector(".shell-cup")!;
            const coin = c.querySelector(".shell-coin")!;
            
            innerCup.classList.add("-translate-y-10", "opacity-50");
            
            if (idx === winningCup) {
              coin.classList.remove("hidden");
            }

            if (idx === cupIdx) {
              innerCup.classList.remove("opacity-50");
              innerCup.classList.add("border-fuchsia-400", "scale-105");
            }
          });

          if (navigator.vibrate) navigator.vibrate(isWin ? 50 : 20);

          if (isWin) {
            const payout = bet * 2.85;
            const netWin = core.creditWinnings(payout, bet, "Three Shell Cups", `Cup #${cupIdx + 1}`, `Found Coin in Cup #${winningCup + 1}`);
            if (status) {
              status.innerText = `🎉 FOUND IT! Won ৳${netWin.toFixed(2)} in Cup #${winningCup + 1}!`;
              status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
            }
            core.app.showToast(`🎉 MAGIC WIN! Won ৳${netWin.toFixed(2)}`, "success");
            core.app.showCongratsSplash("✨ SHELL MASTER!", `Your intuition was spot on! Found the golden coin in cup #${winningCup + 1}!`, `৳${netWin.toFixed(2)}`);
          } else {
            core.creditLoss(bet, "Three Shell Cups", `Cup #${cupIdx + 1}`, `Coin was in Cup #${winningCup + 1}`);
            if (status) {
              status.innerText = `❌ EMPTY! The golden coin was in Cup #${winningCup + 1}. Try again!`;
              status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
            }
            core.app.showToast(`Empty cup! Coin was in #${winningCup + 1}`, "error");
          }

          setTimeout(() => {
            cups.forEach(c => {
              const innerCup = c.querySelector(".shell-cup")!;
              const coin = c.querySelector(".shell-coin")!;
              innerCup.classList.remove("-translate-y-10", "opacity-50", "border-fuchsia-400", "scale-105");
              coin.classList.add("hidden");
            });
            if (status) {
              status.innerText = "Tap a cup to start the magic shuffle! 🏆";
              status.className = "text-xs font-black text-fuchsia-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full";
            }
            isPlaying = false;
          }, 3500);

        }, 1500);
      });
    });
  }
};
