export const TowerGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
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

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-bold mb-3 font-mono">5-TIER FORTRESS TOWER</span>
            
            <div class="space-y-2.5 w-full max-w-[320px]" id="tower-grid-rows">
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

            <div id="tower-status" class="text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Place bet & select a tile on Tier 1 to start climbing! 🏰
            </div>
          </div>

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
              <div class="text-[8.5px] text-slate-400 font-mono text-center">Find the ONLY 1 safe tile per tier among 2 hidden traps!</div>
            </div>
          </div>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            Platform Commission: 5% fee on net profits. Only 1 out of 3 tiles is safe per level (33% win chance)!
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const gridRows = document.getElementById("tower-grid-rows");
    const status = document.getElementById("tower-status");
    const cashBtn = document.getElementById("tower-cashout") as HTMLButtonElement;
    const cashVal = document.getElementById("tower-cash-val");
    const tierVal = document.getElementById("tower-tier-val");
    const multVal = document.getElementById("tower-multiplier-val");
    const payoutVal = document.getElementById("tower-potential-val");
    const fsBtn = document.getElementById("tower-fullscreen-toggle-btn");

    if (!gridRows) return;

    core.gameState = {
      active: false,
      bet: 10,
      currentRow: 1,
      multiplier: 1.00,
      rowsConfig: []
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
        core.handleBetAdjustment(btn.getAttribute("data-op"), "tower-bet-amount");
      });
    });

    const triggerReset = () => {
      const rows = gridRows.querySelectorAll("[data-row]");
      rows.forEach(r => {
        const rNum = parseInt(r.getAttribute("data-row")!);
        const btns = r.querySelectorAll(".tower-step-btn");
        btns.forEach((b: any) => {
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

    gridRows.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest(".tower-step-btn") as HTMLButtonElement;
      if (!btn || btn.disabled) return;

      const rowEl = btn.closest("[data-row]")!;
      const rowNum = parseInt(rowEl.getAttribute("data-row")!);
      const colNum = parseInt(btn.getAttribute("data-col")!);
      const bet = core.getBetAmount("tower-bet-amount");

      if (!core.gameState.active) {
        if (!core.deductBalance(bet)) return;
        core.gameState.active = true;
        core.gameState.bet = bet;
        core.gameState.currentRow = 1;
        core.gameState.multiplier = 1.00;

        core.gameState.rowsConfig = [];
        for (let i = 0; i <= 5; i++) {
          core.gameState.rowsConfig.push(Math.floor(Math.random() * 3));
        }
      }

      if (rowNum !== core.gameState.currentRow) return;

      const isTrap = core.gameState.rowsConfig[rowNum] !== colNum;

      if (isTrap) {
        btn.innerText = "💥";
        btn.className = "tower-step-btn h-10 bg-rose-900/80 border-2 border-rose-500 rounded-xl text-xs font-black text-white shadow-lg animate-bounce";
        rowEl.className = "flex items-center justify-between gap-2 p-2 bg-rose-950/60 rounded-2xl border-2 border-rose-500 shadow-xl opacity-100";
        
        if (status) {
          status.innerText = `💥 BOOM! Hit trap on Tier ${rowNum}!`;
          status.className = "text-xs font-black text-rose-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
        }

        core.creditLoss(core.gameState.bet, "Tower Legend", `Tier ${rowNum} Tile ${colNum + 1}`, `Hit trap at Tier ${rowNum}`);
        core.app.showToast("Broke! Hit hidden tower trap.", "error");

        if (navigator.vibrate) navigator.vibrate(80);

        core.gameState.active = false;
        cashBtn.classList.add("hidden");

        setTimeout(() => {
          triggerReset();
          if (status) {
            status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
            status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
          }
        }, 2500);
      } else {
        const rowMultipliers: Record<number, number> = { 1: 1.40, 2: 2.00, 3: 2.80, 4: 4.00, 5: 5.60 };
        core.gameState.multiplier = rowMultipliers[rowNum];
        const currentPotential = core.gameState.bet * core.gameState.multiplier;

        btn.innerText = "💎";
        btn.className = "tower-step-btn h-10 bg-emerald-900/80 border-2 border-emerald-400 rounded-xl text-xs font-black text-white shadow-lg";

        if (navigator.vibrate) navigator.vibrate(30);

        if (tierVal) tierVal.innerText = `Tier ${rowNum}`;
        if (multVal) multVal.innerText = `${core.gameState.multiplier.toFixed(2)}x`;
        if (payoutVal) payoutVal.innerText = `৳${currentPotential.toFixed(2)}`;

        if (rowNum === 5) {
          if (status) {
            status.innerText = `👑 CONQUERED THE TOWER! Won ৳${(currentPotential * 0.95).toFixed(2)}`;
            status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
          }

          core.creditWinnings(currentPotential, core.gameState.bet, "Tower Legend", "Climb Tier 5 (Max)", "Conquered Fortress Tower!");
          core.app.showToast(`🎉 Conquered Tower! Won ৳${(currentPotential * 0.95).toFixed(2)} (x5.60)!`, "success");
          core.app.showCongratsSplash("👑 TOWER LEGEND CONQUERED!", `Masterful climb! Reached Tier 5 peak with x5.60 multiplier!`, `৳${(currentPotential * 0.95).toFixed(2)}`);

          core.gameState.active = false;
          cashBtn.classList.add("hidden");

          setTimeout(() => {
            triggerReset();
            if (status) {
              status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
              status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
            }
          }, 3500);
        } else {
          core.gameState.currentRow = rowNum + 1;
          if (status) {
            status.innerText = `✨ Tier ${rowNum} Cleared! Current Mult: ${core.gameState.multiplier.toFixed(2)}x`;
            status.className = "text-xs font-black text-amber-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
          }

          if (cashVal) cashVal.innerText = currentPotential.toFixed(2);
          cashBtn.classList.remove("hidden");

          core.app.showToast(`✨ Tier ${rowNum} Cleared! Mult: ${core.gameState.multiplier.toFixed(2)}x`, "success");

          const rows = gridRows.querySelectorAll("[data-row]");
          rows.forEach(r => {
            const rNum = parseInt(r.getAttribute("data-row")!);
            const rBtns = r.querySelectorAll(".tower-step-btn");
            if (rNum === core.gameState.currentRow) {
              r.className = "flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 transition-all duration-300 opacity-100";
              rBtns.forEach((b: any) => {
                b.disabled = false;
                b.className = "tower-step-btn h-10 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-black font-mono text-white border border-slate-700 cursor-pointer active:scale-95 transition";
              });
            } else if (rNum < core.gameState.currentRow) {
              rBtns.forEach((b: any) => b.disabled = true);
              r.className = "flex items-center justify-between gap-2 p-2 bg-slate-950/40 rounded-2xl border border-slate-900 transition-all duration-300 opacity-50";
            }
          });
        }
      }
    });

    cashBtn.addEventListener("click", () => {
      if (!core.gameState.active) return;
      core.gameState.active = false;
      cashBtn.classList.add("hidden");

      const finalPayout = core.gameState.bet * core.gameState.multiplier;
      const netWin = core.creditWinnings(finalPayout, core.gameState.bet, "Tower Legend", `Climb Tier ${core.gameState.currentRow - 1}`, `Cashed Out Tier ${core.gameState.currentRow - 1}`);

      if (status) {
        status.innerText = `🏆 Cashed Out ৳${netWin.toFixed(2)} at Tier ${core.gameState.currentRow - 1}!`;
        status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg w-full max-w-sm";
      }

      core.app.showToast(`🏆 Cashed out Tower climb! Won ৳${netWin.toFixed(2)}`, "success");

      setTimeout(() => {
        triggerReset();
        if (status) {
          status.innerText = "Place bet & select a tile on Tier 1 to start climbing! 🏰";
          status.className = "text-xs font-black text-slate-300 font-mono mt-4 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm";
        }
      }, 2500);
    });
  }
};
