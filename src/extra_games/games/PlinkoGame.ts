export const PlinkoGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-amber-400 tracking-widest block font-mono">PEGBOARD CASINO ARENA</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-circle-dot text-amber-400"></i> Plinko Ball Drop</h3>
          </div>
          <button id="plinko-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 text-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-amber-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-amber-955/20 via-slate-900 to-slate-950 border border-amber-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <div class="relative w-full max-w-[340px] h-[300px] flex items-center justify-center">
              <canvas id="plinko-game-canvas" width="340" height="300" class="w-full h-full rounded-2xl"></canvas>
            </div>
            <div id="plinko-buckets-container" class="grid grid-cols-9 gap-1 w-full max-w-[340px] font-mono text-[8px] sm:text-[9px] text-slate-950 font-black mt-2">
            </div>
            <div id="plinko-status" class="text-xs font-black text-slate-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Select Risk & Drop the Lucky Ball! 🟡
            </div>
          </div>

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

  bindEvents(core: any) {
    const dropBtn = document.getElementById("plinko-btn-drop") as HTMLButtonElement;
    const status = document.getElementById("plinko-status");
    const riskBtns = document.querySelectorAll(".plinko-risk-btn");
    const qtyBtns = document.querySelectorAll(".plinko-qty-btn");
    const canvas = document.getElementById("plinko-game-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let selectedRisk = "low";

    const riskConfigs: Record<string, any> = {
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

      container.innerHTML = config.mults.map((m: number, idx: number) => `
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

    riskBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        riskBtns.forEach(b => {
          b.className = "plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        btn.className = "plinko-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 cursor-pointer active:scale-95 transition";
        selectedRisk = btn.getAttribute("data-risk")!;
        renderBucketsUI();
      });
    });

    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        core.handleBetAdjustment(btn.getAttribute("data-op"), "plinko-bet-amount");
      });
    });

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

    let isDropping = false;

    dropBtn.addEventListener("click", () => {
      if (isDropping) return;
      const bet = core.getBetAmount("plinko-bet-amount");
      if (!core.deductBalance(bet)) return;

      isDropping = true;
      dropBtn.disabled = true;
      dropBtn.innerHTML = `<span>Bouncing...</span> 🟡`;

      if (status) {
        status.innerText = "🟡 Ball dropped! Bouncing off pegs...";
        status.className = "text-xs font-black text-amber-300 font-mono mt-3 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
      }

      let currentCol = 0;
      const steps = [];
      for (let r = 0; r < rows; r++) {
        const dir = Math.random() < 0.5 ? 0 : 1;
        currentCol += dir;
        steps.push(currentCol);
      }

      const finalBucketIdx = steps[steps.length - 1];
      const curConfig = riskConfigs[selectedRisk];
      const mult = curConfig.mults[finalBucketIdx];

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

          pins.forEach(p => p.active = false);
          const hitPin = pins.find(p => p.r === currentStep && Math.abs(p.x - targetPinX) < 2);
          if (hitPin) hitPin.active = true;

          renderPegboard();

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
          pins.forEach(p => p.active = false);
          renderPegboard();

          const targetBucket = document.getElementById(`plinko-bucket-${finalBucketIdx}`);
          if (targetBucket) {
            targetBucket.className += " scale-110 ring-2 ring-white shadow-xl shadow-amber-500/50 z-10";
            setTimeout(() => {
              renderBucketsUI();
            }, 2000);
          }

          const winAmount = bet * mult;
          if (mult > 1.0) {
            const netWin = core.creditWinnings(winAmount, bet, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `🎉 WON ৳${netWin.toFixed(2)}! Landed on x${mult}`;
              status.className = "text-xs font-black text-emerald-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
            }
            core.app.showToast(`🎉 Plinko Hit! Won ৳${netWin.toFixed(2)} (x${mult})!`, "success");

            if (mult >= 4.0) {
              core.app.showCongratsSplash("🟡 PLINKO BIG HIT!", `Awesome ball drop! Landed directly in the x${mult} multiplier bucket!`, `৳${netWin.toFixed(2)}`);
            }
          } else if (mult === 1.0) {
            core.creditWinnings(winAmount, bet, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `🤝 Push! Returned ৳${winAmount.toFixed(2)}`;
              status.className = "text-xs font-black text-amber-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 shadow-lg w-full max-w-sm";
            }
            core.app.showToast(`Returned ৳${winAmount.toFixed(2)} (x1.0)`, "info");
          } else {
            core.creditLoss(bet - winAmount, "Plinko Drop", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
            if (status) {
              status.innerText = `💥 Landed on x${mult}. Try another drop!`;
              status.className = "text-xs font-black text-rose-400 font-mono mt-3 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
            }
            core.app.showToast(`Landed on x${mult}. Better luck next drop!`, "error");
          }

          isDropping = false;
          dropBtn.disabled = false;
          dropBtn.innerHTML = `<span>Drop Lucky Ball</span> 🟡`;
        }
      };

      animateStep();
    });
  }
};
