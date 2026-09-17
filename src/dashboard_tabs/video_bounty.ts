/**
 * Lottery Winner - TikTok & Reels Video Bounty Module (video_bounty.js)
 * 
 * Manages video review submissions, view estimates, and status updates for bounty claims.
 */

export class VideoBountyTab {
  static init(appInstance) {
    console.log("Video Bounty Tab Module initialized.");
    
    // Global listener for submission to avoid double-binding on render
    document.addEventListener("click", async (e) => {
      if (e.target.closest("#user-submit-bounty-btn")) {
        const platform = document.getElementById("user-bounty-platform")?.value;
        const videoUrl = document.getElementById("user-bounty-video-url")?.value?.trim();
        const viewsStr = document.getElementById("user-bounty-views")?.value?.trim();
        const note = document.getElementById("user-bounty-note")?.value?.trim() || "";

        if (!videoUrl) {
          appInstance.showToast("Please provide a valid video link!", "error");
          return;
        }
        if (!viewsStr || isNaN(viewsStr) || parseInt(viewsStr) < 0) {
          appInstance.showToast("Please provide a valid views estimate!", "error");
          return;
        }

        const views = parseInt(viewsStr);
        if (views < 2000) {
          appInstance.showToast("Minimum 2,000 views required to submit bounty claim!", "warning");
          return;
        }

        // Check if already submitted this URL
        if (!appInstance.db.videoBounties) appInstance.db.videoBounties = [];
        const existing = appInstance.db.videoBounties.find(b => b.videoUrl.toLowerCase() === videoUrl.toLowerCase());
        if (existing) {
          appInstance.showToast("This video URL has already been submitted!", "warning");
          return;
        }

        const newBounty = {
          id: "bounty_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          userId: appInstance.currentUser.id,
          username: appInstance.currentUser.username,
          platform: platform,
          videoUrl: videoUrl,
          views: views,
          note: note,
          date: new Date().toISOString(),
          status: "pending",
          reward: 0, // Admin decides between 100 - 500
          adminNotes: ""
        };

        appInstance.db.videoBounties.push(newBounty);
        appInstance.saveDB();

        // Clear inputs
        const urlInput = document.getElementById("user-bounty-video-url");
        if (urlInput) urlInput.value = "";
        const viewsInput = document.getElementById("user-bounty-views");
        if (viewsInput) viewsInput.value = "";
        const noteInput = document.getElementById("user-bounty-note");
        if (noteInput) noteInput.value = "";

        appInstance.showToast("Your video review bounty claim submitted successfully!", "success");
        VideoBountyTab.render(appInstance);
      }

      if (e.target.closest(".com-act-cancel-bounty")) {
        const bountyId = e.target.closest(".com-act-cancel-bounty").getAttribute("data-bounty-id");
        appInstance.db.videoBounties = (appInstance.db.videoBounties || []).filter(b => b.id !== bountyId);
        appInstance.saveDB();
        appInstance.showToast("Bounty claim cancelled successfully.", "info");
        VideoBountyTab.render(appInstance);
      }
    });
  }

  static render(appInstance) {
    const listEl = document.getElementById("user-bounty-history-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const myBounties = (appInstance.db.videoBounties || []).filter(b => b.userId === appInstance.currentUser.id);

    if (myBounties.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 bg-slate-900 border border-slate-850 text-[10px] text-slate-500 rounded-2xl font-mono">
          No video bounty submissions yet. Review us on TikTok/Reels to get started!
        </div>
      `;
      return;
    }

    // Sort newest first
    const sorted = [...myBounties].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(b => {
      const item = document.createElement("div");
      item.className = "bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs font-mono";

      let statusClass = "bg-slate-950 text-slate-400 border border-slate-800";
      if (b.status === "approved") {
        statusClass = "bg-green-950 text-green-400 border border-green-900/60";
      } else if (b.status === "rejected") {
        statusClass = "bg-red-950 text-red-500 border border-red-900/60";
      } else {
        statusClass = "bg-amber-950 text-amber-500 border border-amber-900/60 animate-pulse";
      }

      const platformLabels = {
        tiktok: "🎵 TikTok",
        youtube: "📹 YouTube Shorts",
        facebook: "👥 Facebook Reels",
        instagram: "📸 Instagram Reels"
      };
      const pLabel = platformLabels[b.platform] || b.platform;

      item.innerHTML = `
        <div class="pr-3 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-white text-[11px]">${pLabel} Bounty Claim</span>
            <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${statusClass}">${b.status.toUpperCase()}</span>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 flex flex-wrap gap-x-2">
            <span>Views Claimed: <strong class="text-slate-300">${b.views.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Date: ${new Date(b.date).toLocaleDateString()}</span>
          </div>
          <div class="text-[10px] text-cyan-400 truncate mt-1">
            <a href="${b.videoUrl}" target="_blank" class="hover:underline flex items-center gap-1">
              <i class="fa-solid fa-link text-[8px]"></i> ${b.videoUrl}
            </a>
          </div>
          ${b.status === "approved" ? `
            <div class="text-[9px] text-emerald-400 mt-1">
              🎉 Rewarded: <strong>৳${b.reward}</strong>
            </div>
          ` : ""}
          ${b.adminNotes ? `
            <div class="text-[9px] text-slate-400 italic mt-1.5 bg-slate-950/60 p-2 border border-slate-850 rounded">
              <span class="text-[8px] text-slate-500 block font-bold not-italic font-mono uppercase pb-0.5">Admin Note:</span>
              "${b.adminNotes}"
            </div>
          ` : ""}
        </div>
        ${b.status === "pending" ? `
          <button class="com-act-cancel-bounty text-[8px] bg-slate-950 hover:bg-rose-950 border border-slate-800/80 hover:border-rose-900 text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-xl transition cursor-pointer" data-bounty-id="${b.id}">
            Cancel
          </button>
        ` : ""}
      `;

      listEl.appendChild(item);
    });
  }
}
