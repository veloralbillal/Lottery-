/**
 * Lottery Winner - User Profile & Identity Module (profile.js)
 * 
 * Manages photo synchronization with Google Photos, profile modifications,
 * and inbox notifications.
 */

export class ProfileTab {
  static init(appInstance) {
    console.log("Profile Tab Module initialized successfully.");
  }

  static render(appInstance) {
    // Sync unread messages indicators
    window.chatProfileHelper?.updateNotificationBadgeOff();

    // Dynamically calculate live statistics from database
    const winCounts = (appInstance.db.tickets || []).filter(t => t.userId === appInstance.currentUser.id && t.status === "won").length + (appInstance.currentUser.wins || 0);
    
    const winsEl = document.getElementById("profile-wins");
    if (winsEl) winsEl.innerText = winCounts;
    const lossEl = document.getElementById("profile-loss");
    if (lossEl) lossEl.innerText = appInstance.currentUser.loss || 0;
    const profitEl = document.getElementById("profile-profit");
    if (profitEl) profitEl.innerText = (appInstance.currentUser.profit || 0).toFixed(2);
    const joinDateEl = document.getElementById("profile-join-date");
    if (joinDateEl) joinDateEl.innerText = appInstance.currentUser.joinDate || "N/A";

    // Inject Dynamic Badge Badging Rack
    const badgeContainer = document.getElementById("profile-unlocked-badges");
    if (badgeContainer) {
      badgeContainer.innerHTML = "";
      
      const authorUser = appInstance.currentUser;
      const postsCount = (appInstance.db.communityPosts || []).filter(p => (p.userId === authorUser.id || p.username === authorUser.username) && p.status !== "banned").length;
      const commentsCount = (appInstance.db.communityComments || []).filter(c => (c.userId === authorUser.id || c.username === authorUser.username) && c.status !== "banned").length;
      const totalContribution = postsCount + commentsCount;

      const isLuckyWinner = winCounts > 0;
      const isTopContributor = totalContribution >= 3;

      let badgesHtml = "";
      
      // Admin custom badge override mapping
      if (authorUser.customBadge) {
        const badgeMap = {
          vip: { label: "💎 VIP Player", style: "bg-cyan-955/70 text-cyan-400 border-cyan-800/60" },
          moderator: { label: "🛡️ Staff Mod", style: "bg-indigo-955/70 text-indigo-400 border-indigo-800/60" },
          star: { label: "⭐ Elite Star", style: "bg-purple-955/70 text-purple-400 border-purple-800/60" },
          premium: { label: "✨ Premium Member", style: "bg-fuchsia-955/70 text-fuchsia-400 border-fuchsia-800/60" },
          pro: { label: "🔥 Pro Active", style: "bg-orange-955/70 text-orange-400 border-orange-800/60" },
          legend: { label: "👑 Royal Legend", style: "bg-rose-955/70 text-rose-400 border-rose-800/60" }
        };
        const conf = badgeMap[authorUser.customBadge];
        if (conf) {
          badgesHtml += `<span class="${conf.style} px-2 py-0.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 shadow-md">${conf.label}</span>`;
        }
      }

      if (isLuckyWinner) {
        badgesHtml += `<span class="bg-amber-955/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md animate-pulse" title="Unlocked by winning active lotteries"><i class="fa-solid fa-trophy text-amber-500 text-[8px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      if (isTopContributor) {
        badgesHtml += `<span class="bg-emerald-955/70 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md" title="Unlocked with 3+ shares/replies"><i class="fa-solid fa-medal text-emerald-400 text-[8px]"></i> Top Contributor (${totalContribution})</span>`;
      }
      
      // Default baseline standard badge
      badgesHtml += `<span class="bg-slate-955 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-mono">🎖️ Active Player</span>`;
      
      badgeContainer.innerHTML = badgesHtml;
    }

    // Populate user details fields
    const emailEl = document.getElementById("profile-edit-email");
    if (emailEl) emailEl.value = appInstance.currentUser.email || "";
    const phoneEl = document.getElementById("profile-edit-phone");
    if (phoneEl) phoneEl.value = appInstance.currentUser.phone || "";
    const dobEl = document.getElementById("profile-edit-dob");
    if (dobEl) dobEl.value = appInstance.currentUser.dob || "";

    // Sync Avatar Image display
    const avatarImg = document.getElementById("profile-avatar-img");
    const avatarFallback = document.getElementById("profile-avatar-fallback");
    if (avatarImg && avatarFallback) {
      if (appInstance.currentUser.photo) {
        avatarImg.src = appInstance.currentUser.photo;
        avatarImg.classList.remove("hidden");
        avatarFallback.classList.add("hidden");
      } else {
        avatarImg.src = "";
        avatarImg.classList.add("hidden");
        avatarFallback.classList.remove("hidden");
      }
    }
    appInstance.renderProfileChart();
    appInstance.renderUserInbox();
  }
}
