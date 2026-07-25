// ============================================================================
// LUCKY WHEEL & DAILY CHECK-IN SYSTEM MODULE
// ============================================================================

import { FloatingToastNotification } from "../floating_toast.js";
import { DeviceFingerprint } from "./deviceFingerprint.js";

export const LuckyWheelModule = {
  renderDailyCheckinGrid() {
    const grid = document.getElementById("checkin-grid-days-container");
    if (!grid || !this.currentUser) return;

    grid.innerHTML = "";
    
    // Check if streak is broken (sequential interval passed 36 hours elapsed)
    const todayStr = new Date().toISOString().split("T")[0];
    let isStreakBroken = false;
    if (this.currentUser.lastCheckinDate) {
      const lastCheck = new Date(this.currentUser.lastCheckinDate);
      const today = new Date(todayStr);
      const elapsedDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) {
        isStreakBroken = true;
      }
    }

    if (isStreakBroken) {
      this.currentUser.checkinStreak = 0;
      this.saveDB();
    }

    const currentStreak = this.currentUser.checkinStreak || 0;
    const todayClaimed = (this.currentUser.lastCheckinDate === todayStr);

    const rewardsList = this.db.settings.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const vipMult = this.getVIPMultiplier(this.currentUser);

    for (let i = 0; i < 7; i++) {
      const dayNum = i + 1;
      const baseVal = rewardsList[i];
      const boostedVal = baseVal * vipMult;
      
      let cardClass = "";
      let iconHtml = "";
      let labelStatus = "";

      // Determine day status
      if (dayNum <= currentStreak) {
        // Claimed and complete
        cardClass = "bg-emerald-950/40 border border-emerald-500/35 p-2 rounded-xl text-emerald-400";
        iconHtml = '<i class="fa-solid fa-square-check text-base"></i>';
        labelStatus = "Claimed";
      } else if (dayNum === currentStreak + 1 && !todayClaimed) {
        // Ready to claim today
        cardClass = "bg-slate-950 border border-amber-500/50 p-2 rounded-xl text-amber-400 animate-pulse cursor-pointer";
        iconHtml = '<i class="fa-solid fa-gift text-base animate-bounce"></i>';
        labelStatus = "Unlock";
      } else {
        // Locked / upcoming days
        cardClass = "bg-slate-950/60 border border-slate-900 p-2 rounded-xl text-slate-500";
        iconHtml = '<i class="fa-solid fa-lock text-xs"></i>';
        labelStatus = "Locked";
      }

      grid.innerHTML += `
        <div class="${cardClass}">
          <span class="text-[8px] font-mono block text-slate-400 uppercase">Day ${dayNum}</span>
          <div class="my-1.5">${iconHtml}</div>
          <span class="text-[10px] font-black block">৳${boostedVal.toFixed(1)}</span>
          <span class="text-[7px] text-slate-500 uppercase block font-sans">${labelStatus}</span>
        </div>
      `;
    }

    // Update status labels
    const streakValEl = document.getElementById("checkin-current-streak-val");
    if (streakValEl) streakValEl.innerText = `${currentStreak} of 7 Consecutive Days`;

    const badgeStatus = document.getElementById("checkin-today-status-badge");
    if (badgeStatus) {
      if (todayClaimed) {
        badgeStatus.className = "text-[9px] font-bold bg-emerald-955 text-emerald-400 border border-emerald-900/45 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "CLAIMED TODAY";
      } else if (isStreakBroken) {
        badgeStatus.className = "text-[9px] font-bold bg-rose-955 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "STREAK RESET";
      } else {
        badgeStatus.className = "text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-lg";
        badgeStatus.innerText = "READY TO CLAIM";
      }
    }

    // Task locker visibility
    const taskCompleted = (this.currentUser.lastDailyTaskDate === todayStr);
    const taskLockerPanel = document.getElementById("checkin-task-locker-panel");
    const claimBtn = document.getElementById("checkin-claim-action-btn");
    const isTaskRequired = (this.db.settings.sponsorTaskRequired !== false);

    if (taskLockerPanel && claimBtn) {
      if (todayClaimed) {
        taskLockerPanel.classList.add("hidden");
        claimBtn.classList.add("hidden");
      } else {
        if (isTaskRequired && !taskCompleted) {
          taskLockerPanel.classList.remove("hidden");
          claimBtn.classList.add("hidden");
          
          // Dynamic instruction text from admin config
          const instrEl = document.getElementById("checkin-sponsor-instruction-text");
          if (instrEl) {
            instrEl.innerText = this.db.settings.sponsorLinkInstruction || "আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করুন।";
          }

          // Reset sponsor button text to let them do it again today
          const sponsorBtn = document.getElementById("checkin-sponsor-task-btn");
          if (sponsorBtn) {
            const btnTitle = this.db.settings.sponsorLinkTitle || "স্পন্সর লিংক ভিজিট করুন";
            const timerSec = this.db.settings.sponsorTaskTimer ?? 5;
            sponsorBtn.href = this.db.settings.sponsorLink || "https://google.com";
            sponsorBtn.target = "_blank";
            sponsorBtn.style.pointerEvents = "auto";
            sponsorBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${btnTitle} (${timerSec}s)`;
            sponsorBtn.className = "flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-[10px] py-2.5 px-4 rounded-xl text-center cursor-pointer transition shadow-lg shadow-amber-500/5 flex items-center justify-center gap-1.5 select-none";
          }
        } else {
          taskLockerPanel.classList.add("hidden");
          claimBtn.classList.remove("hidden");
        }
      }
    }
  },

  claimDailyCheckinReward() {
    if (!this.currentUser) {
      this.showToast("Please register or login to claim check-in awards!", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (this.currentUser.lastCheckinDate === todayStr) {
      this.showToast("Oops! You've already checked in today! Streak bonus will unlock again tomorrow.", "error");
      return;
    }

    // Secondary security check: is daily task required & completed?
    const isTaskRequired = (this.db.settings.sponsorTaskRequired !== false);
    if (isTaskRequired && this.currentUser.lastDailyTaskDate !== todayStr) {
      this.showToast("Please complete today's sponsor task first to unlock the claim button!", "error");
      return;
    }

    // Device Fingerprint anti-abuse checks
    const fp = DeviceFingerprint.getFingerprint(this.currentUser.username);
    if (!this.db.deviceCheckins) {
      this.db.deviceCheckins = [];
    }
    const alreadyClaimedFP = this.db.deviceCheckins.find(c => c.date === todayStr && c.fingerprint === fp && c.username.toLowerCase() !== this.currentUser.username.toLowerCase());
    if (alreadyClaimedFP) {
      this.showToast("🚫 ডিভাইস লিমিট অতিক্রম হয়েছে! এই ডিভাইস থেকে অন্য একটি অ্যাকাউন্টে ইতিমধ্যে আজকের রিওয়ার্ড সংগ্রহ করা হয়েছে।", "error");
      return;
    }

    // Save index
    let currentStreak = this.currentUser.checkinStreak || 0;
    
    // Check if streak was broken previously (elapsed > 36 hours)
    let isStreakBroken = false;
    if (this.currentUser.lastCheckinDate) {
      const lastCheck = new Date(this.currentUser.lastCheckinDate);
      const today = new Date(todayStr);
      const elapsedDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) {
        isStreakBroken = true;
      }
    }

    if (isStreakBroken) {
      currentStreak = 0;
    }

    // Increment streak up to resetting on Day 7 completion
    const newStreak = (currentStreak % 7) + 1;
    this.currentUser.checkinStreak = newStreak;
    this.currentUser.lastCheckinDate = todayStr;

    // Record fingerprint claim
    this.db.deviceCheckins.push({
      date: todayStr,
      fingerprint: fp,
      username: this.currentUser.username
    });

    const rewardsList = this.db.settings.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const baseVal = rewardsList[newStreak - 1];
    const vipMult = this.getVIPMultiplier(this.currentUser);
    const finalBonus = baseVal * vipMult;

    // Credit reward
    this.currentUser.balance += finalBonus;

    // Log checkin ledger history
    this.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 10),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "credit",
      amount: finalBonus,
      method: "Daily Check-In Reward",
      walletNumber: `Day ${newStreak} Active Streak`,
      date: new Date().toISOString(),
      status: "approved"
    });

    this.saveDB();
    this.showToast(`🎁 Day ${newStreak} checked-in! Claimed ৳${finalBonus.toFixed(2)} cash (VIP Boost applied: ${vipMult}x). Come back tomorrow!`, "success");
    FloatingToastNotification.broadcastCustom("DAILY CHECK-IN STREAK! 📅", `@<span class="text-white font-bold">${this.currentUser.username}</span> claimed Day ${newStreak} consecutive check-in reward of <strong class="text-indigo-400">৳${finalBonus.toFixed(2)}</strong>!`, "success");
    if (navigator.vibrate) navigator.vibrate(150);
    
    this.renderDailyCheckinGrid();
    this.render(); // Refreshes primary headers
  },

  renderLuckyWheel() {
    const canvas = document.getElementById("lucky-spin-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const sectors = [
      { value: 10, label: "৳10", color: "#0f766e", text: "#ffffff" },       // Vibrant Teal
      { value: 0, label: "Oops!", color: "#334155", text: "#94a3b8" },       // Slate
      { value: 20, label: "৳20", color: "#0284c7", text: "#ffffff" },       // Sky Blue
      { value: 50, label: "৳50", color: "#7c3aed", text: "#ffffff" },       // Electric Purple
      { value: 15, label: "৳15", color: "#2563eb", text: "#ffffff" },       // Royal Blue
      { value: 100, label: "৳100", color: "#d97706", text: "#ffffff" },     // Amber Gold
      { value: 250, label: "৳250", color: "#059669", text: "#ffffff" },     // Emerald
      { value: 500, label: "৳500 Jackpot 👑", color: "#e11d48", text: "#ffffff" } // Neon Rose Gold
    ];

    const numSectors = sectors.length;
    const arc = (Math.PI * 2) / numSectors;
    const center = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSectors; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = sectors[i].color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, center - 2, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      // Draw Sector Separators
      ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Write Sector Texts labels
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = sectors[i].text || "#ffffff";
      ctx.font = 'black 10px "JetBrains Mono", monospace';
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 4;
      ctx.fillText(sectors[i].label, center - 16, 3.5);
      ctx.restore();
    }

    // Render Outer perimeter bulb dot indicators
    for (let j = 0; j < 16; j++) {
      const dotAngle = j * (Math.PI / 8);
      const x = center + Math.cos(dotAngle) * (center - 6);
      const y = center + Math.sin(dotAngle) * (center - 6);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = (j % 2 === 0) ? "#fbbf24" : "#ffffff";
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 3;
      ctx.fill();
    }

    // Refresh Fortune wheel timer labels
    const timerLabel = document.getElementById("lucky-spin-timer-label");
    if (timerLabel && this.currentUser) {
      if (!this.currentUser.lastSpinTime) {
        timerLabel.innerText = "READY NOW";
        timerLabel.className = "text-emerald-400 font-bold animate-pulse";
      } else {
        const timeDiff = Date.now() - this.currentUser.lastSpinTime;
        const remaining = 24 * 60 * 60 * 1000 - timeDiff;
        if (remaining <= 0) {
          timerLabel.innerText = "READY NOW";
          timerLabel.className = "text-emerald-400 font-bold animate-pulse";
        } else {
          const hrs = Math.floor(remaining / 3600000);
          const mins = Math.floor((remaining % 3600000) / 60000);
          timerLabel.innerText = `READY IN: ${hrs}h ${mins}m`;
          timerLabel.className = "text-slate-500 font-normal";
        }
      }
    }

    // Refresh Referral Spin Tokens display
    const tokensLabel = document.getElementById("lucky-spin-tokens-val");
    if (tokensLabel && this.currentUser) {
      const tokensCount = this.currentUser.spinTokens || 0;
      if (tokensCount > 0) {
        tokensLabel.innerText = `${tokensCount} Token${tokensCount !== 1 ? 's' : ''} Available`;
        tokensLabel.className = "text-amber-400 font-extrabold animate-pulse";
      } else {
        tokensLabel.innerText = "0 Tokens (Refer for spins)";
        tokensLabel.className = "text-slate-500 font-normal";
      }
    }

    this.renderLuckySpinHistory();
  },

  renderLuckySpinHistory() {
    if (!this.currentUser) return;
    const historyList = document.getElementById("lucky-spin-history-list");
    const historyCount = document.getElementById("lucky-spin-history-count");
    if (!historyList) return;

    if (!this.db.spinHistory) {
      this.db.spinHistory = [];
    }

    const userSpins = this.db.spinHistory.filter(
      spin => spin.username === this.currentUser.username
    );

    if (historyCount) {
      historyCount.innerText = `${userSpins.length} play${userSpins.length !== 1 ? "s" : ""}`;
    }

    if (userSpins.length === 0) {
      historyList.innerHTML = `<div class="text-center text-slate-600 py-3 font-sans text-[10px]">No past spin results recorded.</div>`;
      return;
    }

    // Sort by date descending
    const sortedSpins = [...userSpins].sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sortedSpins.map(spin => {
      const isWin = spin.prizeAmount > 0;
      const formattedDate = new Date(spin.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="flex items-center justify-between bg-slate-950 border ${isWin ? "border-emerald-900/30 bg-emerald-955/15" : "border-slate-850"} p-2 rounded-xl">
          <div class="flex items-center gap-1.5">
            <span class="${isWin ? "text-amber-400" : "text-slate-500"}">
              <i class="fa-solid ${isWin ? "fa-crown animate-pulse" : "fa-face-frown"} text-[9px]"></i>
            </span>
            <div class="flex flex-col">
              <span class="${isWin ? "text-white font-bold" : "text-slate-400"}">${spin.label}</span>
              <span class="text-[8px] text-slate-500">${formattedDate}</span>
            </div>
          </div>
          <span class="${isWin ? "text-emerald-400 font-extrabold" : "text-slate-500 font-medium"}">
            ${isWin ? "+৳" + spin.prizeAmount.toFixed(1) : "No win"}
          </span>
        </div>
      `;
    }).join("");
  },

  spinLuckyWheel() {
    if (!this.currentUser) {
      this.showToast("Please register or login to spin the wheel!", "error");
      return;
    }

    const disk = document.getElementById("lucky-spin-wheel-disk");
    const triggerBtn = document.getElementById("lucky-spin-trigger-btn");
    if (!disk || !triggerBtn) return;

    // Check spin availability:
    // 1. Check if user has free Spin Tokens
    const hasToken = (this.currentUser.spinTokens || 0) > 0;
    
    // 2. Check if daily free spin is available (24 hrs)
    const isFree = !this.currentUser.lastSpinTime || (Date.now() - this.currentUser.lastSpinTime >= 24 * 60 * 60 * 1000);
    const spinCost = 50.00;

    const fp = DeviceFingerprint.getFingerprint(this.currentUser.username);

    // Device fingerprint anti-abuse check for free spin
    if (!hasToken && isFree) {
      if (!this.db.deviceSpins) {
        this.db.deviceSpins = [];
      }
      const todayStr = new Date().toISOString().split("T")[0];
      const alreadySpunFP = this.db.deviceSpins.find(s => s.date === todayStr && s.fingerprint === fp && s.username.toLowerCase() !== this.currentUser.username.toLowerCase());
      if (alreadySpunFP) {
        this.showToast("🚫 ডিভাইস লিমিট অতিক্রম হয়েছে! এই ডিভাইস থেকে অন্য একটি অ্যাকাউন্টে ইতিমধ্যে আজকের ফ্রি স্পিন নেওয়া হয়েছে।", "error");
        return;
      }
    }

    let usedToken = false;

    if (hasToken) {
      usedToken = true;
      this.currentUser.spinTokens--;
      this.showToast("🎟️ Using 1 Referral Spin Token! Spin is completely free!", "success");
    } else if (isFree) {
      // Use daily free spin
      this.showToast("🎁 Using your FREE Daily Spin!", "success");
    } else {
      // Charge spin fee
      if (this.currentUser.balance < spinCost) {
        this.showToast(`Oops! An extra spin costs ৳${spinCost} Taka. Deposit, refer a friend for free spin tokens, or wait for your free daily spin!`, "error");
        return;
      }
      this.currentUser.balance -= spinCost;
      
      // record charge transaction
      this.db.transactions.push({
        id: "tx" + Date.now() + Math.floor(Math.random() * 100),
        userId: this.currentUser.id,
        username: this.currentUser.username,
        type: "debit",
        amount: spinCost,
        method: "Fortune Wheel Spin Fee",
        walletNumber: "Main Spinner Room",
        date: new Date().toISOString(),
        status: "approved"
      });
    }

    // Disable triggers during rotation sweep
    triggerBtn.disabled = true;
    triggerBtn.className = "absolute z-20 w-14 h-14 bg-slate-805 text-slate-600 font-black text-xs font-mono rounded-full flex flex-col items-center justify-center border-4 border-slate-900 pointer-events-none uppercase tracking-tighter";

    const sectors = [
      { value: 10, label: "৳10" },
      { value: 0, label: "Oops!" },
      { value: 20, label: "৳20" },
      { value: 50, label: "৳50" },
      { value: 15, label: "৳15" },
      { value: 100, label: "৳100" },
      { value: 250, label: "৳250" },
      { value: 500, label: "৳500" }
    ];

    const randomSectorIndex = Math.floor(Math.random() * sectors.length);
    const targetSector = sectors[randomSectorIndex];

    const targetSpins = 6;
    const targetAngle = (targetSpins * 360) + (360 - (randomSectorIndex * 45) - 22.5);

    disk.style.transform = `rotate(${targetAngle}deg)`;

    // Sound alert mockup
    if (navigator.vibrate) {
      setTimeout(() => navigator.vibrate(50), 1000);
      setTimeout(() => navigator.vibrate(50), 2000);
      setTimeout(() => navigator.vibrate(50), 3000);
    }

    const appRef = this;
    const finalUsedToken = usedToken;
    const finalIsFree = isFree;

    setTimeout(() => {
      // Resolve reward payload
      const winVal = targetSector.value;
      const vipMult = appRef.getVIPMultiplier(appRef.currentUser);
      const finalWinnings = winVal * vipMult;

      if (winVal > 0) {
        appRef.currentUser.balance += finalWinnings;

        // Log winning ledger history ticket
        appRef.db.transactions.push({
          id: "tx" + Date.now() + Math.floor(Math.random() * 10),
          userId: appRef.currentUser.id,
          username: appRef.currentUser.username,
          type: "credit",
          amount: finalWinnings,
          method: "Lucky Wheel Spin Win",
          walletNumber: `${targetSector.label} Sector (VIP Multiplier: ${vipMult}x)`,
          date: new Date().toISOString(),
          status: "approved"
        });

        // Trigger dynamic interactive congratulations splash screen and live confetti particle celebrate burst
        appRef.showCongratsSplash(
          "WHEEL OF FORTUNE WINNER!",
          `Splendid! You spun the wheel of destiny and it landed right on the "${targetSector.label}" sector! (A VIP Multiplier boost of ${vipMult}x has been credited directly into your real-time balance).`,
          `৳${finalWinnings.toFixed(2)}`
        );
        FloatingToastNotification.broadcastCustom("LUCKY WHEEL WIN! 🎡", `@<span class="text-white font-bold">${appRef.currentUser.username}</span> spun the Lucky Wheel and won <strong class="text-cyan-400">৳${finalWinnings.toFixed(2)}</strong> on the ${targetSector.label} sector!`, "success");
      } else {
        appRef.showToast("💨 Landed on Oops! better luck next spin! Try again!", "info");
        FloatingToastNotification.broadcastCustom("LUCKY WHEEL SPIN 🎡", `@<span class="text-white font-bold">${appRef.currentUser.username}</span> spun the wheel of destiny. Landed on oops/no win!`, "info");
      }

      // Record cooling interval timestamp for free daily spin trigger logic (only if we didn't use a token)
      if (finalIsFree && !finalUsedToken) {
        appRef.currentUser.lastSpinTime = Date.now();
        if (!appRef.db.deviceSpins) {
          appRef.db.deviceSpins = [];
        }
        appRef.db.deviceSpins.push({
          date: new Date().toISOString().split("T")[0],
          fingerprint: fp,
          username: appRef.currentUser.username
        });
      }
      appRef.saveDB();

      // Reset Wheel visual button
      triggerBtn.disabled = false;
      triggerBtn.className = "absolute z-20 w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-[10px] font-sans rounded-full flex flex-col items-center justify-center border-4 border-slate-900 shadow-xl shadow-amber-500/10 cursor-pointer uppercase tracking-tighter transition-all duration-300";

      // Redraw tab visual components
      appRef.renderLuckyWheel();
      appRef.render(); // Redraw header balances
    }, 4500);
  }
};
