// ========================================================
// LIVE LOTTERY DRAW REVEAL & WINNER CELEBRATION ENGINE
// Engaging 3D Slot Tumbler Animation, Multi-Winner Showcase,
// Real-time Multi-User Broadcast & Profile Navigation
// ========================================================

import { UIEffectsModule } from "./uiEffects.js";

export interface WinnerProfileItem {
  userId?: string;
  username: string;
  name: string;
  avatar?: string;
  ticketCode: string;
  prizeAmount: number;
  rank?: number;
}

export interface DrawCelebrationEvent {
  id: string;
  lotteryId: string;
  lotteryName: string;
  category?: string;
  prizeAmount?: number;
  drawTime?: string;
  winningTicketCodes: string[];
  winnersCount: number;
  winners: WinnerProfileItem[];
}

export class LiveDrawRevealEngine {
  private static app: any = null;
  private static broadcastChannel: BroadcastChannel | null = null;
  private static lastShownDrawId: string | null = null;
  private static audioCtx: AudioContext | null = null;
  private static isAnimating: boolean = false;
  private static pollTimer: any = null;

  static init(appInstance: any) {
    this.app = appInstance;
    this.lastShownDrawId = localStorage.getItem("lw_last_shown_draw_id") || null;

    // 1. Initialize BroadcastChannel for instant cross-tab sync
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.broadcastChannel = new BroadcastChannel("lottery_live_draw_broadcast");
        this.broadcastChannel.onmessage = (event) => {
          if (event && event.data && event.data.id) {
            this.handleIncomingDrawEvent(event.data);
          }
        };
      }
    } catch (err) {
      console.warn("BroadcastChannel not supported in this environment:", err);
    }

    // 2. Storage event listener for fallback cross-tab sync
    window.addEventListener("storage", (e) => {
      if (e.key === "lw_live_draw_broadcast" && e.newValue) {
        try {
          const drawEvent = JSON.parse(e.newValue);
          if (drawEvent && drawEvent.id) {
            this.handleIncomingDrawEvent(drawEvent);
          }
        } catch (parseErr) {
          console.warn("Storage sync parse error:", parseErr);
        }
      }
    });

    // 3. Poll server for new draws across all devices/users
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      this.pollLatestServerDraw();
    }, 4000);

    // 4. Modal Event Bindings
    this.bindModalEvents();
  }

  private static getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Soft mechanical reel tick
  static playReelTickSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Crisp lock-in metallic chime
  static playReelLockSound(index: number = 0) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = 587.33; // D5
      const noteFreq = baseFreq + index * 90;

      osc.type = "sine";
      osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Grand victory fanfare chords
  static playFanfareSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      // Arpeggiated victory chord (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;
        const duration = 0.65;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  // Check if current view is the Admin Panel or not the User Panel
  static isUserInAdminPanel(): boolean {
    try {
      // 1. Check if admin screen DOM element is currently visible (not hidden)
      const adminScreen = document.getElementById("screen-admin");
      if (adminScreen && !adminScreen.classList.contains("hidden")) {
        return true;
      }

      // 2. Check if user panel (dashboard) DOM element is hidden
      const dashboardScreen = document.getElementById("screen-dashboard");
      if (!dashboardScreen || dashboardScreen.classList.contains("hidden")) {
        // If screen-dashboard is hidden, user is NOT in user panel (they are in admin, auth, maintenance, etc.)
        return true;
      }

      // 3. Check App instance flags
      const winApp = this.app || (window as any).app;
      if (winApp) {
        if (winApp.isAdminMode === true) {
          return true;
        }
        if (typeof winApp.getAppView === "function") {
          const view = winApp.getAppView();
          if (view === "admin" || view !== "dashboard") {
            return true;
          }
        }
        if (winApp.currentUser && winApp.currentUser.role === "moderator") {
          return true;
        }
      }

      // 4. Check active admin session in localStorage
      if (localStorage.getItem("lw_admin_session")) {
        if (adminScreen && !adminScreen.classList.contains("hidden")) {
          return true;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  // Public method to close the modal
  static closeWinningDrawRevealModal() {
    const modal = document.getElementById("lottery-draw-winner-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  }

  // Broadcast a newly completed draw to all connected clients & server
  static broadcastDrawEvent(drawEvent: DrawCelebrationEvent) {
    if (!drawEvent || !drawEvent.id) return;

    // 1. Post to BroadcastChannel (same browser, other tabs)
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(drawEvent);
      }
    } catch (e) {}

    // 2. LocalStorage trigger
    try {
      localStorage.setItem("lw_live_draw_broadcast", JSON.stringify(drawEvent));
    } catch (e) {}

    // 3. Post to Node Server API (/api/draws/broadcast)
    fetch("/api/draws/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drawEvent)
    }).catch(err => {
      console.warn("Non-fatal server broadcast warning:", err);
    });

    // 4. Trigger locally ONLY if currently in USER PANEL (never in admin panel)
    if (!this.isUserInAdminPanel()) {
      this.showWinningDrawRevealModal(drawEvent);
    }
  }

  private static handleIncomingDrawEvent(drawEvent: DrawCelebrationEvent) {
    if (!drawEvent || !drawEvent.id) return;
    if (this.lastShownDrawId === drawEvent.id) return;
    if (this.isUserInAdminPanel()) return;
    this.showWinningDrawRevealModal(drawEvent);
  }

  private static async pollLatestServerDraw() {
    try {
      if (this.isUserInAdminPanel()) return;

      const res = await fetch("/api/draws/latest");
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.latest && data.latest.id) {
        if (this.lastShownDrawId !== data.latest.id) {
          // If within the last 30 minutes, display to the user
          const drawTimestamp = new Date(data.latest.drawTime || Date.now()).getTime();
          if (Date.now() - drawTimestamp < 30 * 60 * 1000) {
            this.handleIncomingDrawEvent(data.latest);
          }
        }
      }
    } catch (e) {}
  }

  // Main UI entry point for showing the winning draw reveal modal
  static showWinningDrawRevealModal(drawEvent: DrawCelebrationEvent) {
    if (!drawEvent) return;

    // CRITICAL: Winner celebration popup MUST ONLY show in the USER PANEL (screen-dashboard).
    // It must NEVER show in the ADMIN PANEL (screen-admin).
    if (this.isUserInAdminPanel()) {
      this.closeWinningDrawRevealModal();
      return;
    }

    this.lastShownDrawId = drawEvent.id;
    try {
      localStorage.setItem("lw_last_shown_draw_id", drawEvent.id);
    } catch (e) {}

    const modal = document.getElementById("lottery-draw-winner-modal");
    if (!modal) {
      console.warn("lottery-draw-winner-modal not found in DOM");
      return;
    }

    // Set Header info
    const catEl = document.getElementById("draw-winner-modal-category");
    if (catEl) catEl.innerText = drawEvent.category || "Live Draw";

    const nameEl = document.getElementById("draw-winner-modal-lottery-name");
    if (nameEl) nameEl.innerText = drawEvent.lotteryName;

    const jackpotEl = document.getElementById("draw-winner-modal-jackpot");
    if (jackpotEl) jackpotEl.innerText = `৳${(drawEvent.prizeAmount || 0).toLocaleString()}`;

    const winnersCountLabel = document.getElementById("draw-winners-count-label");
    if (winnersCountLabel) {
      const count = drawEvent.winnersCount || (drawEvent.winners ? drawEvent.winners.length : 1);
      winnersCountLabel.innerText = `মোট বিজয়ী (${count} জন)`;
    }

    // Reset Reveal Stage
    const statusText = document.getElementById("draw-reveal-status-text");
    if (statusText) {
      statusText.innerHTML = `<i class="fa-solid fa-arrows-rotate animate-spin text-amber-400"></i> <span>উইনিং টিকিট ড্র হচ্ছে...</span>`;
    }

    const ticketBanner = document.getElementById("draw-revealed-ticket-banner");
    if (ticketBanner) ticketBanner.classList.add("hidden");

    // Populate Winners Profile Cards
    this.renderWinnerProfiles(drawEvent.winners);

    // Check Current User Participation
    this.renderUserParticipationBadge(drawEvent);

    // Reveal modal with pop-in animation
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.style.zIndex = "100000";

    const card = modal.querySelector(".active-draw-modal-anim");
    if (card) {
      card.classList.remove("scale-95", "opacity-0");
      card.classList.add("scale-100", "opacity-100");
    }

    // Primary Winning Ticket code to animate in the digital tumbler
    const primaryCode = (drawEvent.winningTicketCodes && drawEvent.winningTicketCodes.length > 0)
      ? drawEvent.winningTicketCodes[0]
      : (drawEvent.winners && drawEvent.winners.length > 0 ? drawEvent.winners[0].ticketCode : "LW-777777");

    // Start engaging digit tumbler reveal animation
    this.startReelsAnimation(primaryCode, drawEvent);
  }

  // Theatrical 3D Slot Tumbler Digit Reveal Animation
  private static startReelsAnimation(ticketCode: string, drawEvent: DrawCelebrationEvent) {
    const container = document.getElementById("draw-reveal-reels-container");
    if (!container) return;
    container.innerHTML = "";

    const chars = ticketCode.split("");
    const reelElements: HTMLElement[] = [];
    const intervalIds: any[] = [];

    // Create a 3D slot drum column for each character
    chars.forEach((char, idx) => {
      const col = document.createElement("div");
      col.className = "reel-digit-column w-8 h-12 sm:w-11 sm:h-14 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-amber-300 font-mono shadow-[0_0_15px_rgba(245,158,11,0.2)] select-none transition-all duration-300 transform";
      col.setAttribute("data-target-char", char);
      col.innerText = char === "-" ? "-" : String(Math.floor(Math.random() * 10));
      container.appendChild(col);
      reelElements.push(col);

      // Start rapid digit spinning for alphanumeric characters
      if (char !== "-") {
        const pool = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const intId = setInterval(() => {
          col.innerText = pool[Math.floor(Math.random() * pool.length)];
          // Occasionally trigger tick sound
          if (Math.random() < 0.3) {
            LiveDrawRevealEngine.playReelTickSound();
          }
        }, 55);
        intervalIds.push(intId);
      } else {
        intervalIds.push(null);
      }
    });

    // Sequentially lock in each digit from left to right with dramatic halt
    const lockBaseDelay = 800; // time spinning before first reel locks
    const lockStepInterval = 280; // delay between each reel locking

    chars.forEach((targetChar, idx) => {
      setTimeout(() => {
        if (intervalIds[idx]) {
          clearInterval(intervalIds[idx]);
        }
        const col = reelElements[idx];
        if (col) {
          col.innerText = targetChar;
          // Flash gold and pop scale
          col.classList.remove("border-amber-500/40");
          col.classList.add("border-amber-300", "bg-amber-950/80", "scale-110", "shadow-[0_0_20px_rgba(251,191,36,0.6)]");
          LiveDrawRevealEngine.playReelLockSound(idx);

          // Settle down after pop
          setTimeout(() => {
            col.classList.remove("scale-110");
          }, 180);
        }

        // When the final reel locks in:
        if (idx === chars.length - 1) {
          setTimeout(() => {
            LiveDrawRevealEngine.onAllReelsLocked(ticketCode, drawEvent);
          }, 250);
        }
      }, lockBaseDelay + idx * lockStepInterval);
    });
  }

  // Climax celebration when all winning reels lock in
  private static onAllReelsLocked(ticketCode: string, drawEvent: DrawCelebrationEvent) {
    const statusText = document.getElementById("draw-reveal-status-text");
    if (statusText) {
      statusText.innerHTML = `
        <span class="flex items-center gap-1.5 text-emerald-400 font-black animate-pulse">
          <i class="fa-solid fa-circle-check"></i>
          <span>🎉 ড্র সম্পন্ন! বিজয়ী টিকিট নিশ্চিত হয়েছে!</span>
        </span>
      `;
    }

    const ticketBanner = document.getElementById("draw-revealed-ticket-banner");
    const codeEl = document.getElementById("draw-revealed-ticket-code");
    if (ticketBanner && codeEl) {
      codeEl.innerText = ticketCode;
      ticketBanner.classList.remove("hidden");
    }

    // Play triumphant brass victory fanfare
    this.playFanfareSound();

    // Trigger colorful confetti shower on the screen canvas
    try {
      UIEffectsModule.triggerConfetti();
    } catch (e) {
      console.warn("UIEffectsModule confetti error:", e);
    }
  }

  // Render clickable mini winner profiles with photo, stats, badge
  private static renderWinnerProfiles(winners: WinnerProfileItem[] = []) {
    const container = document.getElementById("draw-winners-cards-container");
    if (!container) return;

    if (!winners || winners.length === 0) {
      container.innerHTML = `
        <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-mono">
          বিজয়ী তথ্য প্রসেস হচ্ছে...
        </div>
      `;
      return;
    }

    const rankEmojis = ["👑", "🥇", "🥈", "🥉", "⭐"];
    const rankColors = [
      "bg-amber-500 border border-amber-300",
      "bg-amber-500 border border-amber-300",
      "bg-slate-400 border border-slate-200",
      "bg-amber-700 border border-amber-500",
      "bg-indigo-600 border border-indigo-400"
    ];

    let cardsHtml = "";
    winners.forEach((w, i) => {
      const rankBadge = rankColors[i] || rankColors[4];
      const rankEmoji = rankEmojis[i] || "⭐";
      const prizeFormatted = `+৳${(w.prizeAmount || 0).toLocaleString()}`;
      const initials = (w.name || w.username || "W").charAt(0).toUpperCase();

      const avatarHtml = w.avatar
        ? `<img src="${w.avatar}" alt="${w.username}" class="w-full h-full rounded-full object-cover" onerror="this.outerHTML='<div class=\\'w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-black text-sm\\'>${initials}</div>'" />`
        : `<div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-black text-sm">${initials}</div>`;

      cardsHtml += `
        <div class="winner-profile-card flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/80 transition-all duration-200 cursor-pointer shadow-md group active:scale-[0.98]" data-username="${w.username}">
          <div class="flex items-center gap-3">
            <!-- Avatar with Rank Badge & VIP Ring -->
            <div class="relative w-11 h-11 shrink-0">
              <div class="w-full h-full rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-md">
                ${avatarHtml}
              </div>
              <span class="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full ${rankBadge} flex items-center justify-center text-[10px] text-white shadow font-bold">
                ${rankEmoji}
              </span>
              <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>

            <!-- Name, Handle & Ticket Code -->
            <div class="space-y-0.5 text-left">
              <div class="flex items-center gap-1.5">
                <h5 class="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  ${w.name || w.username}
                </h5>
                <span class="text-[9.5px] text-slate-400 font-mono">@${w.username}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span class="text-amber-400/90 font-bold"><i class="fa-solid fa-ticket text-[9px]"></i> #${w.ticketCode}</span>
              </div>
            </div>
          </div>

          <!-- Won Amount & Profile Action Arrow -->
          <div class="flex flex-col items-end gap-1">
            <span class="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              ${prizeFormatted}
            </span>
            <span class="text-[9px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <span>প্রোফাইল</span>
              <i class="fa-solid fa-chevron-right text-[8px]"></i>
            </span>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;

    // Attach click events on all winner profile cards to navigate to their full profile details
    container.querySelectorAll(".winner-profile-card").forEach(card => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const username = card.getAttribute("data-username");
        if (username) {
          LiveDrawRevealEngine.navigateToUserProfile(username);
        }
      });
    });
  }

  // Opens user profile modal seamlessly
  private static navigateToUserProfile(username: string) {
    if (!username) return;
    if ((window as any).chatProfileHelper && typeof (window as any).chatProfileHelper.openUserProfile === "function") {
      (window as any).chatProfileHelper.openUserProfile(username);
    } else if (this.app && typeof this.app.openUserProfile === "function") {
      this.app.openUserProfile(username);
    } else {
      console.warn("Profile viewer helper not ready");
    }
  }

  // Check if current logged-in user won or participated
  private static renderUserParticipationBadge(drawEvent: DrawCelebrationEvent) {
    const badgeEl = document.getElementById("draw-user-participation-badge");
    if (!badgeEl) return;

    if (!this.app || !this.app.currentUser) {
      badgeEl.classList.add("hidden");
      badgeEl.innerHTML = "";
      return;
    }

    const currentUserId = this.app.currentUser.id;
    const currentUsername = this.app.currentUser.username;

    // Did user win?
    const wonItem = drawEvent.winners.find(w => w.userId === currentUserId || (w.username && w.username.toLowerCase() === currentUsername.toLowerCase()));

    if (wonItem) {
      badgeEl.classList.remove("hidden");
      badgeEl.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-950/90 via-teal-950 to-emerald-950 border border-emerald-500/50 rounded-2xl p-3 text-center space-y-1 shadow-lg shadow-emerald-500/10 animate-pulse">
          <div class="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-xs font-mono">
            <i class="fa-solid fa-trophy text-amber-400"></i>
            <span>অভিনন্দন! আপনি এই ড্রতে ৳${(wonItem.prizeAmount || 0).toLocaleString()} জিতেছেন!</span>
          </div>
          <p class="text-[10px] text-emerald-400/80 font-sans">
            পুরস্কারের টাকা তাৎক্ষণিকভাবে আপনার মূল ওয়ালেটে জমা হয়েছে।
          </p>
        </div>
      `;
      return;
    }

    // Did user participate?
    const userTickets = (this.app.db && this.app.db.tickets)
      ? this.app.db.tickets.filter((t: any) => t.userId === currentUserId && t.lotteryId === drawEvent.lotteryId)
      : [];

    if (userTickets.length > 0) {
      badgeEl.classList.remove("hidden");
      badgeEl.innerHTML = `
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center text-xs text-slate-300 font-mono">
          <span class="text-amber-400">আপনার টিকিট ছিল:</span> ${userTickets.map((t: any) => t.code).join(", ")}
          <span class="block text-[10px] text-slate-400 mt-0.5">পরবর্তী ড্রতে আবার চেষ্টা করুন এবং বড় জ্যাকপট জিতুন!</span>
        </div>
      `;
    } else {
      badgeEl.classList.add("hidden");
      badgeEl.innerHTML = "";
    }
  }

  // Bind close and action button events
  private static bindModalEvents() {
    const modal = document.getElementById("lottery-draw-winner-modal");
    if (!modal) return;

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.style.display = "none";
    };

    const closeBtn = document.getElementById("close-draw-winner-modal-btn");
    if (closeBtn) closeBtn.onclick = closeModal;

    const dismissBtn = document.getElementById("draw-winner-modal-dismiss-btn");
    if (dismissBtn) dismissBtn.onclick = closeModal;

    // Backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    // "আমার টিকিট দেখুন" button
    const checkTicketsBtn = document.getElementById("draw-winner-modal-check-tickets-btn");
    if (checkTicketsBtn) {
      checkTicketsBtn.onclick = () => {
        closeModal();
        if (this.app && typeof this.app.switchTab === "function") {
          this.app.switchTab("tickets");
        }
      };
    }
  }
}
