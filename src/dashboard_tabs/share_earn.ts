/**
 * Lottery Winner - Affiliation & Referral Module (refer.js)
 * 
 * Sets referral code copies, recruiter lists, and bonus status trackers.
 */

import { ReferralExtensions } from "./share_earn_extensions.js";
import { AffiliateAgentSystem } from "./affiliate_agent_system.js";

export class ReferTab {
  private static initialized = false;

  static init(appInstance: any) {
    if (this.initialized) return;
    this.initialized = true;
    console.log("Refer Tab Module initialized successfully.");
    ReferralExtensions.init(appInstance);
    AffiliateAgentSystem.init(appInstance);

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("#refer-back-btn")) {
        e.preventDefault();
        appInstance.navigateTo("profile");
        return;
      }

      if (target.closest("#copy-refer-code-btn")) {
        if (!appInstance.currentUser) return;
        const code = appInstance.currentUser.username || "";
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard
            .writeText(code)
            .then(() => appInstance.showToast("Affiliate code copied to clipboard!", "success"))
            .catch(() => appInstance.showToast(`Affiliate Code: ${code} (copied)`, "success"));
        } else {
          appInstance.showToast(`Affiliate Code: ${code}`, "info");
        }
        return;
      }

      if (target.closest("#copy-refer-link-btn")) {
        if (!appInstance.currentUser) return;
        const inviteUrl =
          window.location.origin + "/index.html?ref=" + encodeURIComponent(appInstance.currentUser.username || "");
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard
            .writeText(inviteUrl)
            .then(() => appInstance.showToast("Quick invitation link copied!", "success"))
            .catch(() => appInstance.showToast("Link clipboard access restricted. Highlight & copy!", "info"));
        } else {
          appInstance.showToast(inviteUrl, "info");
        }
      }
    });
  }

  static render(appInstance: any) {
    if (!appInstance?.currentUser) return;

    const userDisplay = document.getElementById("user-refer-code-display");
    const regionDisplay = document.getElementById("user-region-display");
    const linkDisplay = document.getElementById("user-refer-link-display");
    const totalCount = document.getElementById("user-refer-total-count");
    const tierDisplay = document.getElementById("user-refer-level-display");
    const profitsDisplay = document.getElementById("user-refer-earned-display");

    if (userDisplay) userDisplay.innerText = appInstance.currentUser.username || "PLAYER";
    if (regionDisplay) regionDisplay.innerText = appInstance.currentUser.region || "Dhaka";
    
    const inviteUrl = window.location.origin + "/index.html?ref=" + encodeURIComponent(appInstance.currentUser.username || "");
    if (linkDisplay) linkDisplay.innerText = inviteUrl;

    const count = appInstance.currentUser.refersCount || 0;
    if (totalCount) totalCount.innerText = String(count);

    // Evaluate Milestone Levels configuration to decide current tier and earned rewards
    const levels = appInstance.db?.settings?.milestoneLevels || [];
    let currentLvlTitle = "LV0: Cadet";
    let earnedBounties = 0;

    const sortedLevels = [...levels].sort((a,b) => a.count - b.count);
    sortedLevels.forEach(lvl => {
      if (count >= lvl.count) {
        currentLvlTitle = lvl.title;
      }
    });

    // Sum earnings from actual rewarded list
    const rewardedList = appInstance.currentUser.rewardedMilestones || [];
    rewardedList.forEach(title => {
      const matchLvl = levels.find(l => l.title === title);
      if (matchLvl) earnedBounties += parseFloat(matchLvl.reward || 0);
    });

    if (tierDisplay) tierDisplay.innerText = currentLvlTitle;
    if (profitsDisplay) profitsDisplay.innerText = "৳" + earnedBounties.toFixed(2);

    // Render Milestone Levels checklist
    const levelsListEl = document.getElementById("user-refer-levels-list");
    if (levelsListEl) {
      levelsListEl.innerHTML = "";
      if (levels.length === 0) {
        levelsListEl.innerHTML = `<div class="text-slate-500 font-sans text-center py-2">No levels configured by admin.</div>`;
      } else {
        levels.forEach(lvl => {
          const reached = count >= lvl.count;
          const claimed = rewardedList.includes(lvl.title);
          
          let statusBadge = "";
          if (claimed) {
            statusBadge = `<span class="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i> CLAIMED ৳${lvl.reward}</span>`;
          } else if (reached) {
            statusBadge = `<button class="claim-milestone-btn bg-gradient-to-r from-cyan-500 to-rose-600 hover:brightness-110 active:scale-95 text-white px-2.5 py-1 rounded-xl text-[8px] font-black uppercase cursor-pointer animate-pulse flex items-center gap-1 shadow-md transition" data-title="${appInstance.escapeHTML(lvl.title)}"><i data-lucide="gift" class="w-3 h-3"></i> Claim ৳${lvl.reward}</button>`;
          } else {
            statusBadge = `<span class="bg-slate-950 text-slate-500 border border-slate-900 px-2 py-0.5 rounded text-[8px] font-bold">Goal: ${lvl.count} refers</span>`;
          }

          const card = document.createElement("div");
          card.className = "flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-900";
          card.innerHTML = `
            <div>
              <span class="block text-white font-bold text-[11px]">${appInstance.escapeHTML(lvl.title)}</span>
              <span class="text-[8px] text-slate-500 font-sans font-medium block mt-0.5">Award money: ৳${lvl.reward}</span>
            </div>
            <div>${statusBadge}</div>
          `;
          levelsListEl.appendChild(card);
        });
      }
    }

    // Render Leaderboard list using top recruiters in system
    const ldrBody = document.getElementById("user-refer-leaderboard-body");
    if (ldrBody) {
      ldrBody.innerHTML = "";
      
      const recruiters = appInstance.db.users
        .filter(u => u.refersCount > 0)
        .sort((a,b) => (b.refersCount || 0) - (a.refersCount || 0))
        .slice(0, 10);

      if (recruiters.length === 0) {
        ldrBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-slate-500 font-sans">No referral activities registered yet. Be the first!</td></tr>`;
      } else {
        recruiters.forEach((rec, idx) => {
          const rank = idx + 1;
          
          let badgeTag = "৳0";
          if (rank === 1) badgeTag = "৳1500 (Champion)";
          else if (rank === 2) badgeTag = "৳800";
          else if (rank === 3) badgeTag = "৳400";
          else badgeTag = "Commission share";

          const row = document.createElement("tr");
          row.className = "border-b border-slate-800/40 hover:bg-slate-900/40 transition";
          row.innerHTML = `
            <td class="py-2.5 font-bold ${rank <= 3 ? 'text-amber-400 font-black' : 'text-slate-500'}">#${rank}</td>
            <td class="py-2.5 text-slate-200 font-sans">@${appInstance.escapeHTML(rec.username)}</td>
            <td class="py-2.5 text-center text-cyan-400 font-black font-mono">${rec.refersCount}</td>
            <td class="py-2.5 text-right font-semibold text-emerald-400 font-mono">${badgeTag}</td>
          `;
          ldrBody.appendChild(row);
        });
      }
    }

    // Render Referred Friends
    const friendsEl = document.getElementById("user-referred-friends-list");
    if (friendsEl) {
      friendsEl.innerHTML = "";
      const friends = appInstance.currentUser.referredUsers || [];
      if (friends.length === 0) {
        friendsEl.innerHTML = `<div class="text-slate-500 font-sans text-center py-2">Invite people using your invitation link to list referred participants!</div>`;
      } else {
        friends.forEach(fr => {
          const card = document.createElement("div");
          card.className = "p-2.5 bg-slate-955/60 rounded-xl border border-slate-900/60 flex justify-between items-center";
          card.innerHTML = `
            <div>
              <span class="block font-bold text-white text-[11px]">@${appInstance.escapeHTML(fr.username)}</span>
              <span class="text-[8px] text-slate-500 block mt-0.5">Joined at: ${fr.date ? fr.date.substring(0, 10) : 'N/A'}</span>
            </div>
            <span class="text-[9px] font-black text-pink-400 uppercase bg-pink-955/30 px-2 py-0.5 rounded border border-pink-900/40 font-mono">${fr.region || 'DHAKA'}</span>
          `;
          friendsEl.appendChild(card);
        });
      }
    }

    // Render the premium Referral Extensions (Progress bar, calculator, marketing social templates)
    ReferralExtensions.render(appInstance);
    AffiliateAgentSystem.render(appInstance);

    if (appInstance && typeof appInstance.refreshIcons === "function") {
      appInstance.refreshIcons();
    }
  }
}
