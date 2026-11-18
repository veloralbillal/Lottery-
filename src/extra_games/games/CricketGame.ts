export const CricketGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
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

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner space-y-4">
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

            <div class="relative w-full h-40 border-2 border-emerald-800/40 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 flex flex-col items-center justify-between py-3 overflow-hidden shadow-2xl">
              <div class="w-full border-b border-emerald-500/20 text-[8px] text-slate-400 font-mono">Bowler's Crease</div>
              
              <div id="cricket-ball" class="absolute top-6 left-1/2 -translate-x-1/2 text-lg transition-all duration-700 z-20 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">🔴</div>
              
              <div class="relative z-10 flex flex-col items-center">
                <div id="cricket-batter" class="text-3xl select-none transition-transform duration-300">🏏</div>
                <div class="text-[8px] font-mono font-bold text-amber-300">Wickets 🦯🦯🦯</div>
              </div>

              <div class="w-full border-t border-emerald-500/20 text-[8px] text-slate-400 font-mono">Striker's Crease</div>
            </div>

            <div id="cricket-status" class="text-xs font-black text-teal-300 font-mono px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm w-full">
              Select Shot & Face Fast Bowler! 🏏
            </div>
          </div>

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
                <button class="cricket-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
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

  bindEvents(core: any) {
    const ball = document.getElementById("cricket-ball");
    const batter = document.getElementById("cricket-batter");
    const status = document.getElementById("cricket-status");
    const strikeBtn = document.getElementById("cricket-btn-strike") as HTMLButtonElement;
    const shotBtns = document.querySelectorAll(".cricket-shot-btn");
    const historyBar = document.getElementById("cricket-history-bar");

    let selectedShot = "push";
    const history = ["6", "4", "W", "6", "1"];

    const shotConfigs: Record<string, any> = {
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
        selectedShot = btn.getAttribute("data-shot")!;
      });
    });

    document.querySelectorAll(".cricket-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "cricket-bet-amount");
      });
    });

    document.getElementById("cricket-fullscreen-toggle-btn")?.addEventListener("click", () => {
      const panel = document.getElementById("game-extragames-panel");
      if (panel) {
        if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    });

    const updateHistoryUI = (res: string) => {
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
        const bet = core.getBetAmount("cricket-bet-amount");
        if (!core.deductBalance(bet)) return;

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

              const netWin = core.creditWinnings(payout, bet, "Cricket Sixer Hit", cfg.label, `Hit boundary at ${cfg.mult}x`);
              if (status) {
                status.innerText = `💥 BOOM! ${cfg.label} connected! Won ৳${netWin.toFixed(2)}`;
                status.className = "text-xs font-black text-emerald-400 font-mono px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full";
              }
              core.app.showToast(`🎉 CRACKING HIT! Won ৳${netWin.toFixed(2)}`, "success");

              if (cfg.mult >= 6.0) {
                core.app.showCongratsSplash("🏏 MONSTER SIXER!", `What a shot! Outstanding ${cfg.label} out of the stadium!`, `৳${netWin.toFixed(2)}`);
              }
            } else {
              updateHistoryUI("W");
              core.creditLoss(bet, "Cricket Sixer Hit", cfg.label, "Caught / Bowled Out");
              if (status) {
                status.innerText = `❌ OUT! Clean bowled or caught on boundary. Better luck next ball!`;
                status.className = "text-xs font-black text-rose-400 font-mono px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full";
              }
              core.app.showToast("Wicket! Out. Try another shot!", "error");
            }

          }, 700);
        }, 800);
      });
    }
  }
};
