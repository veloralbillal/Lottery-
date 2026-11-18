/**
 * Lottery Winner - Edit Royal Profile Module (edit_profile.ts)
 *
 * Handles full-page profile editing, avatar upload, frame selection, showcase tabs, and public preview modal.
 */

export class EditProfileTab {
  private static initialized = false;
  private static showcaseTab: "posts" | "badges" = "posts";

  static init(appInstance: any) {
    if (this.initialized) return;
    this.initialized = true;
    console.log("Edit Profile Tab Module initialized successfully.");

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest("#edit-profile-back-btn") ||
        target.closest("#edit-profile-cancel-btn") ||
        target.closest("#edit-profile-cancel-btn-bottom")
      ) {
        e.preventDefault();
        appInstance.navigateTo("profile");
        return;
      }

      const frameBtn = target.closest(".edit-profile-frame-btn");
      if (frameBtn && appInstance.currentUser) {
        e.preventDefault();
        const frame = frameBtn.getAttribute("data-frame") || "none";
        appInstance.currentUser.avatarFrame = frame;
        const dbUser = (appInstance.db?.users || []).find((u: any) => u.id === appInstance.currentUser.id);
        if (dbUser) dbUser.avatarFrame = frame;
        appInstance.saveDB();
        EditProfileTab.render(appInstance);
        appInstance.showToast(`Selected Frame Effect: ${frame.toUpperCase()}`, "success");
        return;
      }

      if (target.closest("#edit-profile-copy-link-btn") && appInstance.currentUser) {
        const shareUrl =
          window.location.origin +
          window.location.pathname +
          "?profile=" +
          encodeURIComponent(appInstance.currentUser.username || "user");
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => appInstance.showToast("Profile link copied to clipboard successfully!", "success"))
            .catch(() => appInstance.showToast("Failed to copy link", "error"));
        }
        return;
      }

      if (target.closest("#edit-profile-view-as-btn") || target.closest("#edit-profile-view-as-trigger")) {
        EditProfileTab.openPublicPreview(appInstance);
        return;
      }

      if (
        target.closest("#public-profile-preview-close-btn") ||
        target.closest("#public-profile-preview-done-btn") ||
        target.id === "public-profile-preview-modal"
      ) {
        const modal = document.getElementById("public-profile-preview-modal");
        if (modal) modal.classList.add("hidden");
        return;
      }

      if (target.closest("#edit-profile-showcase-tab-posts")) {
        EditProfileTab.showcaseTab = "posts";
        EditProfileTab.renderShowcase(appInstance);
        return;
      }

      if (target.closest("#edit-profile-showcase-tab-badges")) {
        EditProfileTab.showcaseTab = "badges";
        EditProfileTab.renderShowcase(appInstance);
        return;
      }
    });

    document.addEventListener("submit", (e) => {
      const form = (e.target as HTMLElement | null)?.closest("#edit-profile-main-form");
      if (!form) return;
      e.preventDefault();
      if (!appInstance.currentUser) return;

      const username = (document.getElementById("edit-profile-username") as HTMLInputElement | null)?.value.trim() || "";
      const phone = (document.getElementById("edit-profile-phone") as HTMLInputElement | null)?.value.trim() || "";
      const email = (document.getElementById("edit-profile-email") as HTMLInputElement | null)?.value.trim() || "";
      const bio = (document.getElementById("edit-profile-bio") as HTMLTextAreaElement | null)?.value.trim() || "";
      const dob = (document.getElementById("edit-profile-dob") as HTMLInputElement | null)?.value.trim() || "";
      const address = (document.getElementById("edit-profile-address") as HTMLInputElement | null)?.value.trim() || "";
      const glowEl = document.getElementById("edit-profile-glow") as HTMLSelectElement | null;

      if (!username) {
        appInstance.showToast("Username is required!", "error");
        return;
      }

      appInstance.currentUser.username = username;
      appInstance.currentUser.phone = phone;
      appInstance.currentUser.email = email;
      appInstance.currentUser.bio = bio;
      appInstance.currentUser.dob = dob;
      appInstance.currentUser.address = address;
      if (glowEl) appInstance.currentUser.profileGlow = glowEl.value;

      const users = appInstance.db?.users || [];
      const idx = users.findIndex((u: any) => u.id === appInstance.currentUser.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...appInstance.currentUser };
      }

      appInstance.saveDB();
      appInstance.showToast("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!", "success");
      appInstance.navigateTo("profile");
    });

    document.addEventListener("change", (e) => {
      const input = (e.target as HTMLElement | null)?.closest("#edit-profile-avatar-file") as HTMLInputElement | null;
      if (input && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (!appInstance.currentUser || !ev.target?.result) return;
          const photoData = String(ev.target.result);
          appInstance.currentUser.photo = photoData;
          const dbUser = (appInstance.db?.users || []).find((u: any) => u.id === appInstance.currentUser.id);
          if (dbUser) dbUser.photo = photoData;
          appInstance.saveDB();
          appInstance.showToast("প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!", "success");
          EditProfileTab.render(appInstance);
        };
        reader.readAsDataURL(input.files[0]);
      }
    });
  }

  static openPublicPreview(appInstance: any) {
    const user = appInstance.currentUser;
    const modal = document.getElementById("public-profile-preview-modal");
    if (!modal || !user) return;

    modal.classList.remove("hidden");
    const uEl = document.getElementById("preview-modal-username");
    const vibeEl = document.getElementById("preview-modal-vibe");
    const bioEl = document.getElementById("preview-modal-bio");
    const lvlEl = document.getElementById("preview-modal-level");
    const imgEl = document.getElementById("preview-modal-avatar-img") as HTMLImageElement | null;
    const initEl = document.getElementById("preview-modal-avatar-initial");

    if (uEl) uEl.textContent = `@${user.username || "user"}`;
    if (vibeEl) vibeEl.textContent = `"${user.vibe || user.vibeStatus || "🍀 Feeling Lucky"}"`;
    if (bioEl) bioEl.textContent = user.bio ? `"${user.bio}"` : '"No creator statement provided yet."';
    if (lvlEl) lvlEl.textContent = `Level ${user.level || 1}`;
    if (imgEl && initEl) {
      if (user.photo) {
        imgEl.src = user.photo;
        imgEl.classList.remove("hidden");
        initEl.classList.add("hidden");
      } else {
        imgEl.src = "";
        imgEl.classList.add("hidden");
        initEl.classList.remove("hidden");
        initEl.textContent = (user.username || "U").charAt(0).toUpperCase();
      }
    }
  }

  static renderShowcase(appInstance: any) {
    const user = appInstance.currentUser;
    const previewEl = document.getElementById("edit-profile-posts-badges-preview");
    const postsTabBtn = document.getElementById("edit-profile-showcase-tab-posts");
    const badgesTabBtn = document.getElementById("edit-profile-showcase-tab-badges");
    if (!previewEl || !user) return;

    if (this.showcaseTab === "posts") {
      if (postsTabBtn) postsTabBtn.className = "flex-1 pb-3 text-center font-black border-b-2 border-rose-500 text-white cursor-pointer transition";
      if (badgesTabBtn) badgesTabBtn.className = "flex-1 pb-3 text-center font-bold text-slate-500 hover:text-slate-300 border-b-2 border-transparent cursor-pointer transition";

      const posts = (appInstance.db?.communityPosts || []).filter(
        (p: any) => (p.userId === user.id || p.username === user.username) && p.status !== "banned"
      );

      if (posts.length === 0) {
        previewEl.innerHTML = `
          <div class="py-6 text-center space-y-2">
            <div class="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto text-slate-600 text-lg border border-slate-800/80">
              <i data-lucide="layers" class="w-4 h-4 inline"></i>
            </div>
            <h5 class="text-xs font-bold text-white font-mono">No Community Posts Yet</h5>
            <p class="text-[10px] text-slate-500 max-w-xs mx-auto font-sans leading-normal">
              Share your ticket predictions, big wins, and tips with other players in the Community Space!
            </p>
          </div>
        `;
      } else {
        previewEl.innerHTML = `
          <div class="grid grid-cols-1 gap-2.5 text-left">
            ${posts.map((p: any) => `
              <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div class="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span class="text-cyan-400 font-bold">@${appInstance.escapeHTML(p.username || user.username)}</span>
                  <span>${new Date(p.date || Date.now()).toLocaleDateString()}</span>
                </div>
                <p class="text-xs text-slate-200 font-sans leading-relaxed">${appInstance.escapeHTML(p.text || "")}</p>
                <div class="flex items-center gap-3 pt-1 text-[9px] text-slate-500 font-mono">
                  <span><i data-lucide="heart" class="w-3 h-3 text-rose-500 mr-1 inline"></i>${(p.likes || []).length} Likes</span>
                  <span><i data-lucide="message-square" class="w-3 h-3 text-cyan-500 mr-1 inline"></i>${(appInstance.db?.communityComments || []).filter((c: any) => c.postId === p.id).length} Replies</span>
                </div>
              </div>
            `).join("")}
          </div>
        `;
      }
    } else {
      if (postsTabBtn) postsTabBtn.className = "flex-1 pb-3 text-center font-bold text-slate-500 hover:text-slate-300 border-b-2 border-transparent cursor-pointer transition";
      if (badgesTabBtn) badgesTabBtn.className = "flex-1 pb-3 text-center font-black border-b-2 border-rose-500 text-white cursor-pointer transition";

      const badgeMap: Record<string, string> = {
        vip: "💎 VIP Player",
        moderator: "🛡️ Staff Mod",
        star: "⭐ Elite Star",
        premium: "✨ Premium Member",
        pro: "🔥 Pro Active",
        legend: "👑 Royal Legend"
      };
      const winCount = (appInstance.db?.tickets || []).filter(
        (t: any) => (t.userId === user.id || t.username === user.username) && t.status === "won"
      ).length;

      previewEl.innerHTML = `
        <div class="flex flex-wrap justify-center gap-2 py-4">
          ${user.customBadge ? `<span class="px-3 py-1.5 rounded-xl bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 text-[10px] font-bold">${badgeMap[user.customBadge] || user.customBadge}</span>` : ""}
          ${winCount > 0 ? `<span class="px-3 py-1.5 rounded-xl bg-amber-950/70 text-amber-300 border border-amber-700/50 text-[10px] font-bold">🏆 Lucky Winner (${winCount})</span>` : ""}
          <span class="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold">🎖️ Level ${user.level || 1} Player</span>
        </div>
      `;
    }

    if (typeof appInstance.refreshIconsForContainer === "function") {
      appInstance.refreshIconsForContainer(previewEl);
    }
  }

  static render(appInstance: any) {
    const user = appInstance?.currentUser;
    if (!user) return;

    const uInput = document.getElementById("edit-profile-username") as HTMLInputElement | null;
    const phoneInput = document.getElementById("edit-profile-phone") as HTMLInputElement | null;
    const emailInput = document.getElementById("edit-profile-email") as HTMLInputElement | null;
    const bioInput = document.getElementById("edit-profile-bio") as HTMLTextAreaElement | null;
    const dobInput = document.getElementById("edit-profile-dob") as HTMLInputElement | null;
    const addrInput = document.getElementById("edit-profile-address") as HTMLInputElement | null;
    const glowSelect = document.getElementById("edit-profile-glow") as HTMLSelectElement | null;
    const displayUser = document.getElementById("edit-profile-display-username");
    const avatarPreview = document.getElementById("edit-profile-avatar-preview");
    const vibePill = document.getElementById("edit-profile-vibe-pill");
    const shareInput = document.getElementById("edit-profile-share-link-input") as HTMLInputElement | null;

    if (uInput) uInput.value = user.username || "";
    if (phoneInput) phoneInput.value = user.phone || "";
    if (emailInput) emailInput.value = user.email || "";
    if (bioInput) bioInput.value = user.bio || "";
    if (dobInput) dobInput.value = user.dob || "";
    if (addrInput) addrInput.value = user.address || "";
    if (glowSelect) glowSelect.value = user.profileGlow || "none";
    if (displayUser) displayUser.textContent = `@${user.username || "user"}`;
    if (vibePill) vibePill.textContent = user.vibe || user.vibeStatus || "🍀 Feeling Lucky";

    if (avatarPreview) {
      if (user.photo) {
        avatarPreview.innerHTML = `<img src="${user.photo}" alt="Avatar" class="w-full h-full object-cover">`;
      } else {
        avatarPreview.innerHTML = `<span id="edit-profile-avatar-initial">${(user.username || "U").charAt(0).toUpperCase()}</span>`;
      }
    }

    if (shareInput) {
      shareInput.value =
        window.location.origin +
        window.location.pathname +
        "?profile=" +
        encodeURIComponent(user.username || "user");
    }

    const activeFrame = user.avatarFrame || "none";
    document.querySelectorAll(".edit-profile-frame-btn").forEach((btn) => {
      const btnFrame = btn.getAttribute("data-frame") || "none";
      if (btnFrame === activeFrame) {
        btn.className = "edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 cursor-pointer flex flex-col items-center gap-1.5 shrink-0 scale-105";
      } else {
        btn.className = "edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-slate-700/60 text-slate-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-800 shrink-0";
      }
    });

    this.renderShowcase(appInstance);

    const container = document.getElementById("tab-edit-profile");
    if (container && typeof appInstance.refreshIconsForContainer === "function") {
      appInstance.refreshIconsForContainer(container);
    } else if (typeof appInstance.refreshIcons === "function") {
      appInstance.refreshIcons();
    }
  }
}
