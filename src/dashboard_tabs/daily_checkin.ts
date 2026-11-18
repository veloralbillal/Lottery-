/**
 * Daily Check-In Rewards Tab Module (src/dashboard_tabs/daily_checkin.ts)
 * Renders and manages the dedicated Daily Check-In & 7-Day Streak view.
 */

import { LuckyWheelModule } from "../js/luckyWheel.js";
import { DeviceFingerprint } from "../js/deviceFingerprint.js";
import { FloatingToastNotification } from "../floating_toast.js";

export class DailyCheckinTab {
  private static sponsorVisitedToday = false;

  static init(appInstance: any) {
    document.addEventListener("click", (e) => {
      if (appInstance.currentTab !== "daily-checkin") return;
      const target = e.target as HTMLElement;

      if (target.closest("#daily-checkin-sponsor-btn")) {
        this.sponsorVisitedToday = true;
        return;
      }

      if (target.closest("#daily-checkin-verify-btn")) {
        e.preventDefault();
        if (!appInstance.currentUser) {
          appInstance.showToast("Please register or login first!", "error");
          return;
        }
        const todayStr = new Date().toISOString().split("T")[0];
        appInstance.currentUser.lastDailyTaskDate = todayStr;
        appInstance.saveDB();
        appInstance.showToast("✅ Sponsor task verified! Claim button unlocked.", "success");
        this.render(appInstance);
        return;
      }

      if (target.closest("#daily-checkin-claim-btn")) {
        e.preventDefault();
        this.claimReward(appInstance);
        return;
      }
    });
  }

  static render(appInstance: any) {
    const grid = document.getElementById("daily-checkin-grid");
    const user = appInstance?.currentUser;
    if (!grid || !user) return;

    const todayStr = new Date().toISOString().split("T")[0];
    let isStreakBroken = false;
    if (user.lastCheckinDate) {
      const lastCheck = new Date(user.lastCheckinDate).getTime();
      const today = new Date(todayStr).getTime();
      const elapsedDays = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) {
        isStreakBroken = true;
      }
    }

    if (isStreakBroken && user.checkinStreak !== 0) {
      user.checkinStreak = 0;
      appInstance.saveDB();
    }

    const currentStreak = user.checkinStreak || 0;
    const todayClaimed = user.lastCheckinDate === todayStr;
    const rewardsList: number[] = appInstance.db?.settings?.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const vipMult: number = typeof appInstance.getVIPMultiplier === "function"
      ? appInstance.getVIPMultiplier(user)
      : LuckyWheelModule.getVIPMultiplier(user);

    let html = "";
    for (let i = 0; i < 7; i++) {
      const dayNum = i + 1;
      const baseVal = Number(rewardsList[i] ?? 2);
      const boostedVal = baseVal * vipMult;

      let cardClass = "bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl text-slate-500";
      let iconHtml = `<i data-lucide="lock" class="w-4 h-4 mx-auto text-slate-500"></i>`;
      let labelStatus = "Locked";

      if (dayNum <= currentStreak) {
        cardClass = "bg-emerald-950/45 border border-emerald-500/40 p-2.5 rounded-2xl text-emerald-400";
        iconHtml = `<i data-lucide="check-circle" class="w-4 h-4 mx-auto text-emerald-400"></i>`;
        labelStatus = "Claimed";
      } else if (dayNum === currentStreak + 1 && !todayClaimed) {
        cardClass = "bg-amber-950/30 border border-amber-500/60 p-2.5 rounded-2xl text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
        iconHtml = `<i data-lucide="gift" class="w-4 h-4 mx-auto text-amber-400 animate-bounce"></i>`;
        labelStatus = "Today";
      }

      html += `
        <div class="${cardClass}">
          <span class="text-[8.5px] font-mono block text-slate-400 uppercase">Day ${dayNum}</span>
          <div class="my-2">${iconHtml}</div>
          <span class="text-[11px] font-black block text-white">৳${boostedVal.toFixed(1)}</span>
          <span class="text-[7.5px] uppercase block font-sans mt-0.5">${labelStatus}</span>
        </div>
      `;
    }
    grid.innerHTML = html;

    const streakValEl = document.getElementById("daily-checkin-streak-val");
    if (streakValEl) streakValEl.innerText = `${currentStreak} of 7 Consecutive Days`;

    const vipMultEl = document.getElementById("daily-checkin-vip-mult");
    if (vipMultEl) vipMultEl.innerText = `${vipMult.toFixed(2)}x`;

    const badgeStatus = document.getElementById("daily-checkin-status-badge");
    if (badgeStatus) {
      if (todayClaimed) {
        badgeStatus.className = "text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-xl font-mono";
        badgeStatus.innerText = "CLAIMED TODAY ✓";
      } else if (isStreakBroken) {
        badgeStatus.className = "text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-xl font-mono";
        badgeStatus.innerText = "STREAK RESET";
      } else {
        badgeStatus.className = "text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-mono";
        badgeStatus.innerText = "READY TO CLAIM";
      }
    }

    const taskCompleted = user.lastDailyTaskDate === todayStr;
    const taskLocker = document.getElementById("daily-checkin-task-locker");
    const claimBtn = document.getElementById("daily-checkin-claim-btn") as HTMLButtonElement | null;
    const isTaskRequired = appInstance.db?.settings?.sponsorTaskRequired !== false;

    if (taskLocker && claimBtn) {
      if (todayClaimed) {
        taskLocker.classList.add("hidden");
        claimBtn.classList.remove("hidden");
        claimBtn.disabled = true;
        claimBtn.className = "w-full bg-slate-900 border border-emerald-500/30 text-emerald-400 font-black text-xs py-3.5 rounded-2xl cursor-not-allowed font-mono uppercase tracking-wider flex items-center justify-center gap-2 relative z-10";
        claimBtn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>আজকের চেক-ইন বোনাস সংগ্রহ হয়েছে ✓</span>`;
      } else if (isTaskRequired && !taskCompleted) {
        taskLocker.classList.remove("hidden");
        claimBtn.classList.add("hidden");

        const instrEl = document.getElementById("daily-checkin-sponsor-instruction");
        if (instrEl) {
          instrEl.innerText = appInstance.db?.settings?.sponsorLinkInstruction || "আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করে Verify বাটনে ক্লিক করুন।";
        }
        const sponsorBtn = document.getElementById("daily-checkin-sponsor-btn") as HTMLAnchorElement | null;
        if (sponsorBtn) {
          sponsorBtn.href = appInstance.db?.settings?.sponsorLink || "https://google.com";
          const btnText = document.getElementById("daily-checkin-sponsor-btn-text");
          if (btnText) {
            btnText.innerText = appInstance.db?.settings?.sponsorLinkTitle || "স্পন্সর লিংক ভিজিট করুন";
          }
        }
      } else {
        taskLocker.classList.add("hidden");
        claimBtn.classList.remove("hidden");
        claimBtn.disabled = false;
        claimBtn.className = "w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition cursor-pointer active:scale-[0.99] shadow-lg shadow-emerald-500/20 border border-emerald-300/40 font-mono uppercase tracking-wider flex items-center justify-center gap-2 relative z-10";
        claimBtn.innerHTML = `<i data-lucide="gift" class="w-4 h-4"></i><span>Claim Today's Streak Reward</span>`;
      }
    }

    if (typeof appInstance.refreshIconsForContainer === "function") {
      const container = document.getElementById("tab-daily-checkin");
      if (container) appInstance.refreshIconsForContainer(container);
    }
  }

  static claimReward(appInstance: any) {
    const user = appInstance?.currentUser;
    if (!user) {
      appInstance.showToast("Please register or login to claim check-in rewards!", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (user.lastCheckinDate === todayStr) {
      appInstance.showToast("আজকের ডেইলি চেক-ইন বোনাস ইতিমধ্যেই নেওয়া হয়েছে! আগামীকাল আবার আসুন।", "error");
      return;
    }

    const isTaskRequired = appInstance.db?.settings?.sponsorTaskRequired !== false;
    if (isTaskRequired && user.lastDailyTaskDate !== todayStr) {
      appInstance.showToast("অনুগ্রহ করে প্রথমে স্পন্সর লিংক ভিজিট করে Verify করুন!", "error");
      return;
    }

    const fp = DeviceFingerprint.getFingerprint(user.username);
    if (!appInstance.db.deviceCheckins) appInstance.db.deviceCheckins = [];
    const alreadyClaimedFP = appInstance.db.deviceCheckins.find(
      (c: any) => c.date === todayStr && c.fingerprint === fp && c.username?.toLowerCase() !== user.username?.toLowerCase()
    );
    if (alreadyClaimedFP) {
      appInstance.showToast("🚫 ডিভাইস লিমিট অতিক্রম হয়েছে! এই ডিভাইস থেকে অন্য অ্যাকাউন্টে আজকের রিওয়ার্ড নেওয়া হয়েছে।", "error");
      return;
    }

    let currentStreak = user.checkinStreak || 0;
    if (user.lastCheckinDate) {
      const elapsedDays = Math.floor((new Date(todayStr).getTime() - new Date(user.lastCheckinDate).getTime()) / (1000 * 60 * 60 * 24));
      if (elapsedDays > 1) currentStreak = 0;
    }

    const newStreak = (currentStreak % 7) + 1;
    user.checkinStreak = newStreak;
    user.lastCheckinDate = todayStr;

    appInstance.db.deviceCheckins.push({
      date: todayStr,
      fingerprint: fp,
      username: user.username
    });

    const rewardsList: number[] = appInstance.db?.settings?.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    const baseVal = Number(rewardsList[newStreak - 1] ?? 2);
    const vipMult: number = typeof appInstance.getVIPMultiplier === "function"
      ? appInstance.getVIPMultiplier(user)
      : LuckyWheelModule.getVIPMultiplier(user);
    const finalBonus = baseVal * vipMult;

    user.balance = (Number(user.balance) || 0) + finalBonus;

    if (!appInstance.db.transactions) appInstance.db.transactions = [];
    appInstance.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 10),
      userId: user.id,
      username: user.username,
      type: "credit",
      amount: finalBonus,
      method: "Daily Check-In Reward",
      walletNumber: `Day ${newStreak} Active Streak`,
      date: new Date().toISOString(),
      status: "approved"
    });

    appInstance.saveDB();
    appInstance.showToast(`🎁 Day ${newStreak} checked-in! Claimed ৳${finalBonus.toFixed(2)} cash!`, "success");
    FloatingToastNotification.broadcastCustom(
      "DAILY CHECK-IN STREAK! 📅",
      `@${user.username} claimed Day ${newStreak} check-in reward of ৳${finalBonus.toFixed(2)}!`,
      "success"
    );
    if (navigator.vibrate) navigator.vibrate(150);

    appInstance.render();
  }
}
