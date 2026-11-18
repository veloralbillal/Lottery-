export const WheelGame = {
  getTemplate() {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span class="text-[7.5px] uppercase font-bold text-rose-400 tracking-widest block font-mono">CASINO NEON WHEEL</span>
            <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-spinner text-rose-400 animate-spin-slow"></i> Wheel of Fortune</h3>
          </div>
          <button id="wheel-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div class="bg-gradient-to-b from-rose-955/20 via-slate-900 to-slate-950 border border-rose-900/30 p-4 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-5">
          <div class="absolute -right-20 -top-20 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="bg-slate-950 border border-slate-850 rounded-2.5xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <div class="absolute top-2 z-30 flex flex-col items-center drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
              <div class="w-4 h-6 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-b-full border border-amber-200 shadow-lg animate-bounce"></div>
            </div>

            <div class="relative w-56 h-56 sm:w-64 sm:h-64 mt-4 flex items-center justify-center">
              <div id="wheel-outer-lights-ring" class="absolute inset-0 rounded-full border-4 border-slate-800 shadow-[0_0_25px_rgba(244,63,94,0.15)] z-10 pointer-events-none"></div>
              
              <div id="wheel-rotor-disk" class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden transition-all duration-[3800ms] ease-out select-none shadow-2xl border-2 border-slate-800">
                <canvas id="wheel-game-canvas" width="260" height="260" class="w-full h-full rounded-full"></canvas>
              </div>

              <div id="wheel-center-hub" class="absolute z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-900 via-rose-955 to-slate-950 border-4 border-slate-800 shadow-xl flex flex-col items-center justify-center pointer-events-none">
                <span class="text-[9px] sm:text-[10px] font-black text-rose-400 font-mono tracking-tighter">SPIN</span>
                <i class="fa-solid fa-crown text-[8px] text-amber-400"></i>
              </div>
            </div>

            <div id="wheel-status" class="text-xs font-black text-slate-300 font-mono mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm">
              Select Risk & Spin the Neon Wheel! 🎡
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[8px] text-slate-400 font-mono font-bold uppercase">
              <span>Segment Multipliers (8 Sectors)</span>
              <span id="wheel-risk-label" class="text-emerald-400">LOW RISK MODE</span>
            </div>
            <div id="wheel-segments-preview" class="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Select Risk Mode</label>
              <div class="grid grid-cols-3 gap-2">
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-95 transition" data-risk="low">
                  <span>Low Risk</span>
                  <span class="block text-[7.5px] font-normal text-emerald-300/80">100% Win</span>
                </button>
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="med">
                  <span>Medium</span>
                  <span class="block text-[7.5px] font-normal text-slate-500">75% Win</span>
                </button>
                <button class="wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700" data-risk="high">
                  <span>High Risk</span>
                  <span class="block text-[7.5px] font-normal text-slate-500">50x Jackpot</span>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[8px] text-slate-400 uppercase font-bold block font-mono">Bet Amount (৳)</label>
                <span class="text-[8px] text-slate-500 font-mono">Min ৳5 | Max ৳1000</span>
              </div>
              <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span class="text-slate-400 text-xs font-bold font-mono mr-1.5">৳</span>
                <input type="number" id="wheel-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
              </div>

              <div class="grid grid-cols-4 gap-1">
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
                <button class="wheel-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl text-center font-mono">
            <div>
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Win Chance</span>
              <span id="wheel-stat-chance" class="text-white font-extrabold text-xs">100%</span>
            </div>
            <div class="border-x border-slate-850">
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Max Multiplier</span>
              <span id="wheel-stat-mult" class="text-rose-400 font-extrabold text-xs">2.0x</span>
            </div>
            <div>
              <span class="text-[7.5px] text-slate-500 uppercase block font-bold">Max Payout</span>
              <span id="wheel-stat-payout" class="text-emerald-400 font-extrabold text-xs">৳20.00</span>
            </div>
          </div>

          <button id="wheel-btn-spin" class="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black font-mono text-xs rounded-xl shadow-xl shadow-rose-600/20 transition active:scale-95 cursor-pointer hover:scale-[1.005] border border-rose-400/30 uppercase tracking-wider flex items-center justify-center gap-2">
            <span>Spin Wheel</span> <i class="fa-solid fa-sync text-xs"></i>
          </button>

          <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-center text-[8px] text-slate-500 font-mono">
            ⚡ Fair Play Engine: 5% platform fee applied to net profits. Segment landing is strictly randomized.
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(core: any) {
    const spinBtn = document.getElementById("wheel-btn-spin") as HTMLButtonElement;
    const status = document.getElementById("wheel-status");
    const riskBtns = document.querySelectorAll(".wheel-risk-btn");
    const qtyBtns = document.querySelectorAll(".wheel-qty-btn");
    const betInput = document.getElementById("wheel-bet-amount") as HTMLInputElement;

    let selectedRisk = "low";

    const riskConfigs: Record<string, any> = {
      low: {
        label: "LOW RISK MODE (100% WIN CHANCE)",
        winChance: "100%",
        colorClass: "text-emerald-400",
        segments: [
          { mult: 1.2, label: "1.2x", color: "#0d9488", text: "#ffffff" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 1.2, label: "1.2x", color: "#06b6d4", text: "#ffffff" },
          { mult: 1.8, label: "1.8x", color: "#8b5cf6", text: "#ffffff" },
          { mult: 1.3, label: "1.3x", color: "#6366f1", text: "#ffffff" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 1.4, label: "1.4x", color: "#f59e0b", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#f43f5e", text: "#ffffff" }
        ]
      },
      med: {
        label: "MEDIUM RISK MODE (75% WIN CHANCE)",
        winChance: "75%",
        colorClass: "text-amber-400",
        segments: [
          { mult: 0.0, label: "0x", color: "#334155", text: "#94a3b8" },
          { mult: 1.5, label: "1.5x", color: "#10b981", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#06b6d4", text: "#ffffff" },
          { mult: 0.5, label: "0.5x", color: "#f97316", text: "#ffffff" },
          { mult: 1.8, label: "1.8x", color: "#8b5cf6", text: "#ffffff" },
          { mult: 3.0, label: "3.0x", color: "#eab308", text: "#ffffff" },
          { mult: 0.0, label: "0x", color: "#334155", text: "#94a3b8" },
          { mult: 5.0, label: "5.0x", color: "#ec4899", text: "#ffffff" }
        ]
      },
      high: {
        label: "HIGH RISK MODE (50x MEGA JACKPOT)",
        winChance: "37.5%",
        colorClass: "text-rose-400",
        segments: [
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 0.5, label: "0.5x", color: "#f97316", text: "#ffffff" },
          { mult: 2.0, label: "2.0x", color: "#06b6d4", text: "#ffffff" },
          { mult: 0.0, label: "0x", color: "#1e293b", text: "#64748b" },
          { mult: 5.0, label: "5.0x", color: "#10b981", text: "#ffffff" },
          { mult: 10.0, label: "10.0x", color: "#a855f7", text: "#ffffff" },
          { mult: 50.0, label: "50x 👑", color: "#eab308", text: "#020617" }
        ]
      }
    };

    const drawWheelCanvas = (segments: any[]) => {
      const canvas = document.getElementById("wheel-game-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const numSectors = segments.length;
      const arc = (Math.PI * 2) / numSectors;
      const center = canvas.width / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numSectors; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, center - 4, angle, angle + arc);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = segments[i].text || "#ffffff";
        ctx.font = 'black 11px "JetBrains Mono", monospace';
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 4;
        ctx.fillText(segments[i].label, center - 18, 4);
        ctx.restore();
      }

      for (let j = 0; j < 16; j++) {
        const dotAngle = j * (Math.PI / 8);
        const x = center + Math.cos(dotAngle) * (center - 8);
        const y = center + Math.sin(dotAngle) * (center - 8);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = j % 2 === 0 ? "#fbbf24" : "#ffffff";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 3;
        ctx.fill();
      }
    };

    const updatePreviewBadges = (segments: any[]) => {
      const container = document.getElementById("wheel-segments-preview");
      if (!container) return;
      container.innerHTML = segments.map((s, idx) => `
        <div id="wheel-badge-${idx}" class="p-1.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-mono transition-all duration-300">
          <span class="text-[7px] text-slate-500 uppercase block font-bold">Sec ${idx + 1}</span>
          <span class="text-[10px] font-black block" style="color: ${s.mult > 1 ? '#4ade80' : s.mult > 0 ? '#f97316' : '#64748b'}">${s.label}</span>
        </div>
      `).join("");
    };

    const updateStats = () => {
      const curRisk = riskConfigs[selectedRisk];
      const maxM = Math.max(...curRisk.segments.map((s: any) => s.mult));
      const bet = parseFloat(document.getElementById("wheel-bet-amount")?.getAttribute("value") || (document.getElementById("wheel-bet-amount") as HTMLInputElement)?.value) || 10;
      
      const chanceEl = document.getElementById("wheel-stat-chance");
      const multEl = document.getElementById("wheel-stat-mult");
      const payoutEl = document.getElementById("wheel-stat-payout");
      const labelEl = document.getElementById("wheel-risk-label");

      if (chanceEl) chanceEl.innerText = curRisk.winChance;
      if (multEl) multEl.innerText = maxM.toFixed(1) + "x";
      if (payoutEl) payoutEl.innerText = "৳" + (bet * maxM).toFixed(2);
      if (labelEl) {
        labelEl.innerText = curRisk.label;
        labelEl.className = curRisk.colorClass + " font-bold";
      }
    };

    drawWheelCanvas(riskConfigs[selectedRisk].segments);
    updatePreviewBadges(riskConfigs[selectedRisk].segments);
    updateStats();

    riskBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        riskBtns.forEach(b => {
          b.className = "wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition hover:border-slate-700";
        });
        btn.className = "wheel-risk-btn py-2.5 px-2 rounded-xl text-[10px] font-black font-mono border bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5 cursor-pointer active:scale-95 transition";
        selectedRisk = btn.getAttribute("data-risk")!;
        
        drawWheelCanvas(riskConfigs[selectedRisk].segments);
        updatePreviewBadges(riskConfigs[selectedRisk].segments);
        updateStats();
      });
    });

    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const op = btn.getAttribute("data-op")!;
        core.handleBetAdjustment(op, "wheel-bet-amount");
        updateStats();
      });
    });

    if (betInput) {
      betInput.addEventListener("input", updateStats);
    }

    const fsBtn = document.getElementById("wheel-fullscreen-toggle-btn");
    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const panel = document.getElementById("game-extragames-panel") || document.getElementById("game-subtab-container");
        if (panel) {
          if (!document.fullscreenElement) panel.requestFullscreen().catch(() => {});
          else document.exitFullscreen().catch(() => {});
        }
      });
    }

    let isSpinning = false;
    let currentRotation = 0;

    spinBtn.addEventListener("click", () => {
      if (isSpinning) return;
      const bet = core.getBetAmount("wheel-bet-amount");
      if (!core.deductBalance(bet)) return;

      isSpinning = true;
      spinBtn.disabled = true;
      spinBtn.innerHTML = `<span>Spinning...</span> <i class="fa-solid fa-spinner animate-spin text-xs"></i>`;

      if (status) {
        status.innerText = "🎡 Wheel spinning! Good luck...";
        status.className = "text-xs font-black text-amber-300 font-mono mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm w-full max-w-sm animate-pulse";
      }

      const curRisk = riskConfigs[selectedRisk];
      const segments = curRisk.segments;
      const numSectors = segments.length;
      const targetIdx = Math.floor(Math.random() * numSectors);
      
      const extraSpins = 5 + Math.floor(Math.random() * 5);
      const sectorAngle = 360 / numSectors;
      const targetAngle = 360 - (targetIdx * sectorAngle) - (sectorAngle / 2);
      
      currentRotation += (extraSpins * 360) + targetAngle - (currentRotation % 360);
      
      const rotor = document.getElementById("wheel-rotor-disk");
      if (rotor) {
        rotor.style.transform = `rotate(${currentRotation}deg)`;
      }

      setTimeout(() => {
        const landed = segments[targetIdx];
        const mult = landed.mult;
        const payout = bet * mult;

        if (mult > 1.0) {
          const netWin = core.creditWinnings(payout, bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult} (${landed.label})`);
          if (status) {
            status.innerText = `🎉 WON ৳${netWin.toFixed(2)}! Landed on x${mult}`;
            status.className = "text-xs font-black text-emerald-400 font-mono mt-4 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 shadow-lg animate-pulse w-full max-w-sm";
          }
          core.app.showToast(`🎉 Wheel Win! Won ৳${netWin.toFixed(2)} (x${mult})!`, "success");

          if (mult >= 5.0) {
            core.app.showCongratsSplash("🎡 WHEEL BIG WIN!", `Amazing spin! Landed on the ${landed.label} sector!`, `৳${netWin.toFixed(2)}`);
          }
        } else if (mult === 1.0) {
          core.creditWinnings(payout, bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed on x1.0 (Push)`);
          if (status) {
            status.innerText = `🤝 Push! Payout x1.0. Refunded!`;
            status.className = "text-xs font-black text-amber-400 font-mono mt-4 px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 shadow-lg w-full max-w-sm";
          }
          core.app.showToast("Push! Bet returned.", "info");
        } else if (mult > 0) {
          const netWin = core.creditWinnings(payout, bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed on x${mult}`);
          if (status) {
            status.innerText = `📉 Landed on x${mult}. Returned ৳${netWin.toFixed(2)}`;
            status.className = "text-xs font-black text-rose-300 font-mono mt-4 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
          }
          core.app.showToast(`Landed on x${mult}. Better luck next spin!`, "warning");
        } else {
          core.creditLoss(bet, "Wheel of Fortune", `${selectedRisk.toUpperCase()} Risk`, `Landed on x0 (LOSE)`);
          if (status) {
            status.innerText = `💥 Landed on 0x. Try another spin!`;
            status.className = "text-xs font-black text-rose-400 font-mono mt-4 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 shadow-lg w-full max-w-sm";
          }
          core.app.showToast("Landed on 0x. Better luck next time!", "error");
        }

        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.innerHTML = `<span>Spin Wheel</span> <i class="fa-solid fa-sync text-xs"></i>`;
      }, 4000);
    });
  }
};
