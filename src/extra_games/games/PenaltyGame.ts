export const PenaltyGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
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

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold mb-2 font-mono">STADIUM GOALPOST</span>
            
            <div class="relative w-full max-w-[340px] h-52 bg-gradient-to-b from-slate-900 via-emerald-950/40 to-emerald-900/80 rounded-t-2xl border-x-4 border-t-4 border-slate-100 shadow-2xl overflow-hidden flex flex-col items-center justify-between p-2">
              <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] opacity-15 pointer-events-none"></div>

              <div class="relative z-10 grid grid-cols-3 grid-rows-2 gap-2 w-full h-36 p-1">
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-left" data-mult="1.45">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Left</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.45</span>
                </button>
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-center" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Center</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="top-right" data-mult="1.45">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Top Right</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.45</span>
                </button>
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-left" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Bot Left</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-center" data-mult="1.25">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Center</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.25</span>
                </button>
                <button class="penalty-corner-btn bg-slate-950/60 border border-dashed border-slate-500/80 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group" data-corner="bottom-right" data-mult="1.35">
                  <span class="text-[8px] font-black font-mono text-emerald-400 group-hover:scale-110 transition">Bot Right</span>
                  <span class="text-[7.5px] text-slate-400 font-mono">x1.35</span>
                </button>
              </div>

              <div class="relative w-full border-t-2 border-slate-200/40 flex items-center justify-center h-10">
                <div id="penalty-gk" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl transition-all duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] z-20">
                  🧤
                </div>
                <div id="penalty-ball" class="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl transition-all duration-300 pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] z-30">
                  ⚽
                </div>
              </div>
            </div>

            <div id="penalty-status" class="text-xs font-black text-slate-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Aim at any corner target to strike! ⚽
            </div>
          </div>

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
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="penalty-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>

            <div class="flex flex-col justify-end">
              <button id="penalty-btn-cashout" class="hidden w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-mono text-xs rounded-xl shadow-xl shadow-amber-500/20 transition cursor-pointer active:scale-95 uppercase tracking-wider border border-amber-300/40">
                Cash Out ৳<span id="penalty-cashout-val">0.00</span> 🏆
              </button>
              <div class="text-[8.5px] text-slate-400 font-mono text-center">Score consecutive goals to stack massive multipliers!</div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            Platform Commission: 5% fee on net profits. Scoring streak increases risk of goalkeeper save!
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const corners = document.querySelectorAll(".penalty-corner-btn");
    const gk = document.getElementById("penalty-gk");
    const ball = document.getElementById("penalty-ball");
    const status = document.getElementById("penalty-status");
    const streakVal = document.getElementById("penalty-streak-val");
    const multVal = document.getElementById("penalty-multiplier-val");
    const payoutVal = document.getElementById("penalty-potential-val");
    const cashBtn = document.getElementById("penalty-btn-cashout") as HTMLButtonElement;
    const cashVal = document.getElementById("penalty-cashout-val");
    const fsBtn = document.getElementById("penalty-fullscreen-toggle-btn");

    core.gameState = {
      active: false,
      bet: 10,
      streak: 0,
      multiplier: 1.00
    };

    const targetList = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
    const targetCoordinates: Record<string, any> = {
      "top-left": { ballLeft: "15%", ballBottom: "140px", gkLeft: "20%", gkRotate: "-35deg" },
      "top-center": { ballLeft: "50%", ballBottom: "150px", gkLeft: "50%", gkRotate: "180deg" },
      "top-right": { ballLeft: "85%", ballBottom: "140px", gkLeft: "80%", gkRotate: "35deg" },
      "bottom-left": { ballLeft: "15%", ballBottom: "40px", gkLeft: "20%", gkRotate: "-20deg" },
      "bottom-center": { ballLeft: "50%", ballBottom: "30px", gkLeft: "50%", gkRotate: "0deg" },
      "bottom-right": { ballLeft: "85%", ballBottom: "40px", gkLeft: "80%", gkRotate: "20deg" }
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
        core.handleBetAdjustment(btn.getAttribute("data-op"), "penalty-bet-amount");
      });
    });

    corners.forEach(btn => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-corner")!;
        const cornerMult = parseFloat(btn.getAttribute("data-mult")!);
        const bet = core.getBetAmount("penalty-bet-amount");

        if (!core.gameState.active) {
          if (!core.deductBalance(bet)) return;
          core.gameState.active = true;
          core.gameState.bet = bet;
          core.gameState.streak = 0;
          core.gameState.multiplier = 1.00;
        }

        corners.forEach((c: any) => c.disabled = true);

        if (status) {
          status.innerText = "⚽ SHOT IN FLIGHT! Goalkeeper diving...";
          status.className = "text-xs font-black text-amber-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
        }

        const gkDive = targetList[Math.floor(Math.random() * targetList.length)];
        const choiceCoords = targetCoordinates[choice];
        const gkCoords = targetCoordinates[gkDive];

        if (gk) {
          gk.style.left = gkCoords.gkLeft;
          gk.style.transform = `rotate(${gkCoords.gkRotate})`;
        }

        if (ball) {
          ball.style.left = choiceCoords.ballLeft;
          ball.style.bottom = choiceCoords.ballBottom;
        }

        if (navigator.vibrate) navigator.vibrate(30);

        setTimeout(() => {
          if (gkDive === choice) {
            if (status) {
              status.innerText = "🧤 BLOCKED! Goalkeeper saved the penalty!";
              status.className = "text-xs font-black text-rose-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
            }
            core.creditLoss(core.gameState.bet, "Penalty Shootout", `Shoot ${choice.toUpperCase()}`, `Blocked by Goalkeeper`);
            core.app.showToast("Blocked! Goalkeeper saved the shot.", "error");

            core.gameState.active = false;
            cashBtn.classList.add("hidden");
            if (streakVal) streakVal.innerText = "0 Goals";
            if (multVal) multVal.innerText = "1.00x";
            if (payoutVal) payoutVal.innerText = "৳0.00";
          } else {
            core.gameState.streak++;
            core.gameState.multiplier *= cornerMult;
            const currentPotential = core.gameState.bet * core.gameState.multiplier;

            if (status) {
              status.innerText = `⚽ GOAL! Streak: ${core.gameState.streak} | Mult: ${core.gameState.multiplier.toFixed(2)}x`;
              status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
            }

            if (streakVal) streakVal.innerText = `${core.gameState.streak} Goal${core.gameState.streak > 1 ? 's' : ''}`;
            if (multVal) multVal.innerText = `${core.gameState.multiplier.toFixed(2)}x`;
            if (payoutVal) payoutVal.innerText = `৳${currentPotential.toFixed(2)}`;

            if (cashVal) cashVal.innerText = currentPotential.toFixed(2);
            cashBtn.classList.remove("hidden");

            core.app.showToast(`⚽ Goal Scored! Streak: ${core.gameState.streak} (x${core.gameState.multiplier.toFixed(2)})`, "success");

            if (core.gameState.streak >= 4) {
              core.app.showCongratsSplash("⚽ PENALTY STREAK KING!", `Incredible ${core.gameState.streak} goals in a row! Current Payout: x${core.gameState.multiplier.toFixed(2)}`, `৳${currentPotential.toFixed(2)}`);
            }
          }

          setTimeout(() => {
            if (ball) {
              ball.style.left = "50%";
              ball.style.bottom = "4px";
            }
            if (gk) {
              gk.style.left = "50%";
              gk.style.transform = "none";
            }
            corners.forEach((c: any) => c.disabled = false);

            if (!core.gameState.active) {
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
      if (!core.gameState.active) return;
      core.gameState.active = false;
      cashBtn.classList.add("hidden");

      const finalPayout = core.gameState.bet * core.gameState.multiplier;
      const netWin = core.creditWinnings(finalPayout, core.gameState.bet, "Penalty Shootout", `Streak ${core.gameState.streak}`, `Won ${core.gameState.multiplier.toFixed(2)}x`);

      if (status) {
        status.innerText = `🏆 Cashed Out ৳${netWin.toFixed(2)}! Great Streak!`;
        status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg w-full max-w-sm";
      }

      core.app.showToast(`🏆 Cashed out penalty streak! Won ৳${netWin.toFixed(2)}`, "success");

      if (streakVal) streakVal.innerText = "0 Goals";
      if (multVal) multVal.innerText = "1.00x";
      if (payoutVal) payoutVal.innerText = "৳0.00";
    });
  }
};
