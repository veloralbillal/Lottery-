import { CustomizerStore } from "../dashboard_tabs/customizer_store.js";

export class ProfileSystem {
  static openUserProfile(system: any, username: string) {
    if (!username) return;
    const u = system.findUserByIdOrUsername(username);
    if (!u) {
      system.app.showToast("Player details could not be parsed.", "error");
      return;
    }

    const currentLoggedInUser = system.app.currentUser || { id: "guest", username: "guest" };

    const modal = document.getElementById("profile-details-modal");
    if (!modal) return;

    modal.setAttribute("data-target-user", u.username);
    modal.style.zIndex = "105000";

    const initialSpan = document.getElementById("profile-detail-initials");
    if (initialSpan) {
      initialSpan.innerText = u.username ? u.username[0].toUpperCase() : "?";
    }

    // Overlay Avatar frame & 3D Animation Overlay
    const frameOverlay = document.getElementById("profile-detail-frame-overlay");
    if (frameOverlay) {
      frameOverlay.innerHTML = CustomizerStore.getFrameOverlayHTML(u.avatarFrame || "none");
    }

    const animOverlay = document.getElementById("profile-detail-anim-overlay");
    if (animOverlay) {
      const glow = u.profileGlow || u.profileAnimation || "hologram_3d";
      animOverlay.innerHTML = CustomizerStore.getAnimationOverlayHTML(glow);
    }

    const bannerOverlay = document.getElementById("profile-detail-banner-overlay");
    if (bannerOverlay) {
      CustomizerStore.applyBannerBackground(bannerOverlay, u.profileBanner || "cyber_neon");
    }

    const usernameEl = document.getElementById("profile-detail-username");
    if (usernameEl) usernameEl.innerText = `@${u.username}`;

    const emailEl = document.getElementById("profile-detail-email");
    if (emailEl) {
      let maskedEmail = "no-email@lottery.app";
      if (u.email) {
        const parts = u.email.split("@");
        if (parts.length === 2 && parts[0].length > 1) {
          maskedEmail = parts[0][0] + "xx" + parts[0][parts[0].length - 1] + "@" + parts[1];
        } else {
          maskedEmail = u.email;
        }
      }
      emailEl.innerText = maskedEmail;
    }

    const spent = parseFloat(u.loss) || 0;
    const profit = parseFloat(u.profit) || 0;
    const lotteriesCount = (system.app.db.tickets || []).filter((t: any) => t.userId === u.id).length + (u.wins ? u.wins * 2 : 0);
    const winCounts = (system.app.db.tickets || []).filter((t: any) => t.userId === u.id && t.status === "won").length + (u.wins || 0);

    const lotteryCountEl = document.getElementById("profile-detail-lotteries-count");
    if (lotteryCountEl) lotteryCountEl.innerText = String(lotteriesCount || Math.floor(spent / 5));

    const winsCountEl = document.getElementById("profile-detail-wins-count");
    if (winsCountEl) winsCountEl.innerText = String(winCounts);

    const lossEl = document.getElementById("profile-detail-loss");
    if (lossEl) lossEl.innerText = `৳${spent.toFixed(2)}`;

    const profitEl = document.getElementById("profile-detail-profit");
    if (profitEl) {
      profitEl.innerText = `৳${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`;
      profitEl.className = profit >= 0 ? "text-xs font-black text-emerald-400" : "text-xs font-black text-rose-400";
    }

    const badgesContainer = document.getElementById("profile-detail-badges");
    if (badgesContainer) {
      badgesContainer.innerHTML = "";
      let badgesHtml = "";
      
      if (u.customBadge) {
        const badgeMap: any = {
          vip: { label: "💎 VIP Player", style: "bg-cyan-950/70 text-cyan-400 border-cyan-800/60" },
          moderator: { label: "🛡️ Staff Mod", style: "bg-indigo-950/70 text-indigo-400 border-indigo-800/60" },
          star: { label: "⭐ Elite Star", style: "bg-purple-950/70 text-purple-400 border-purple-800/60" },
          premium: { label: "✨ Premium Member", style: "bg-fuchsia-950/70 text-fuchsia-400 border-fuchsia-800/60" },
          pro: { label: "🔥 Pro Bettor", style: "bg-orange-950/70 text-orange-400 border-orange-800/60" },
          legend: { label: "👑 Royal Legend", style: "bg-rose-950/70 text-rose-400 border-rose-800/60" }
        };
        const conf = badgeMap[u.customBadge];
        if (conf) {
          badgesHtml += `<span class="${conf.style} px-2 py-0.5 rounded-lg text-[8px] font-bold border flex items-center gap-1 shadow-md">${conf.label}</span>`;
        }
      }

      if (winCounts > 0) {
        badgesHtml += `<span class="bg-amber-950/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-1 shadow-md"><i data-lucide="trophy" class="text-amber-500 text-[7px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      
      badgesHtml += `<span class="bg-slate-950 border border-slate-800/85 text-slate-400 px-2 py-0.5 rounded-lg text-[8px] font-mono shadow-sm">🎖️ Active Player</span>`;
      badgesContainer.innerHTML = badgesHtml;
    }

    const addFriendBtn = document.getElementById("profile-detail-add-friend-btn") as HTMLButtonElement | null;
    const sendMsgBtn = document.getElementById("profile-detail-message-btn");
    
    if (currentLoggedInUser.id === "guest" || (currentLoggedInUser.username && u.username.toLowerCase() === currentLoggedInUser.username.toLowerCase()) || u.id === currentLoggedInUser.id) {
      if (addFriendBtn) addFriendBtn.classList.add("hidden");
      if (sendMsgBtn) sendMsgBtn.classList.add("hidden");
    } else {
      if (addFriendBtn) {
        addFriendBtn.classList.remove("hidden");
        const rel = system.getFriendshipRelation(u.username);
        if (!rel) {
          addFriendBtn.innerHTML = `<i data-lucide="user-plus" class="text-emerald-400"></i> Add Friend`;
          addFriendBtn.disabled = false;
        } else if (rel.status === "accepted") {
          addFriendBtn.innerHTML = `<i data-lucide="user-check" class="text-indigo-400"></i> Friends ✓`;
          addFriendBtn.disabled = true;
        } else {
          if (rel.fromId === currentLoggedInUser.id || rel.fromId === currentLoggedInUser.username) {
            addFriendBtn.innerHTML = `<i data-lucide="clock" class="text-slate-500 animate-pulse"></i> Sent (Pending)`;
            addFriendBtn.disabled = true;
          } else {
            addFriendBtn.innerHTML = `<i data-lucide="check" class="text-emerald-400 animate-bounce"></i> Accept Invite`;
            addFriendBtn.disabled = false;
          }
        }
      }
      if (sendMsgBtn) sendMsgBtn.classList.remove("hidden");
    }

    modal.classList.remove("hidden");
    const innerCard = modal.querySelector(".active-modal-anim") as HTMLElement | null;
    if (innerCard) {
      system.setup3DTiltEffect(innerCard);
      setTimeout(() => {
        innerCard.classList.remove("scale-95", "opacity-0");
        innerCard.classList.add("scale-100", "opacity-100");
      }, 30);
    }
  }

  static setup3DTiltEffect(system: any, card: HTMLElement) {
    if (!card) return;
    let sheen = card.querySelector("#profile-detail-3d-sheen") as HTMLElement | null;

    const onMove = (clientX: number, clientY: number) => {
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 16;
      const rotateX = -((y - centerY) / centerY) * 16;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      card.style.transition = "transform 0.08s ease-out";

      if (sheen) {
        const sheenX = (x / rect.width) * 100;
        const sheenY = (y / rect.height) * 100;
        sheen.style.opacity = "0.9";
        sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.2) 0%, rgba(34,211,238,0.12) 45%, transparent 80%)`;
      }
    };

    const onReset = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
      if (sheen) sheen.style.opacity = "0";
    };

    card.onmousemove = (e) => onMove(e.clientX, e.clientY);
    card.onmouseleave = onReset;

    card.ontouchmove = (e: any) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    card.ontouchend = onReset;
  }

  static handleFriendAction(system: any, targetUsername: string) {
    if (!system.app.currentUser) {
      system.app.showToast("Please log in to proceed with social features.", "error");
      return;
    }
    const clientUser = system.app.currentUser;
    const target = system.findUserByIdOrUsername(targetUsername);
    if (!target) {
      system.app.showToast("Target user doesn't exist.", "error");
      return;
    }

    if (target.username.toLowerCase() === clientUser.username.toLowerCase() || target.id === clientUser.id) {
      system.app.showToast("You cannot friend invite yourself.", "info");
      return;
    }

    const rel = system.getFriendshipRelation(target.username);
    if (!rel) {
      const request = {
        id: "rel_" + Math.random().toString(36).substring(2, 10),
        fromId: clientUser.id || clientUser.username,
        fromUsername: clientUser.username,
        toId: target.id || target.username,
        toUsername: target.username,
        status: "pending",
        timestamp: new Date().toISOString()
      };

      if (!system.app.db.friendships) system.app.db.friendships = [];
      system.app.db.friendships.push(request);
      system.app.saveDB();
      system.app.showToast(`Friend invite sent to @${target.username}!`, "success");
      system.openUserProfile(target.username);
    } else if (rel.status === "pending" && (rel.toId === clientUser.id || rel.toId?.toLowerCase() === clientUser.username?.toLowerCase())) {
      rel.status = "accepted";
      const welcomeMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 10),
        fromId: target.id || target.username,
        toId: clientUser.id || clientUser.username,
        content: `👋 I accepted your invite! Let's compete inside the leaderboards. Best of luck with your ticket draws!`,
        timestamp: new Date().toISOString(),
        status: "unread"
      };
      
      if (!system.app.db.directMessages) system.app.db.directMessages = [];
      system.app.db.directMessages.push(welcomeMsg);
      
      system.app.saveDB();
      system.app.showToast(`Connection established! You are now friends with @${target.username}.`, "success");
      system.openUserProfile(target.username);
    }
    system.updateNotificationBadgeOff();
  }
}
