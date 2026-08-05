/**
 * Lottery Winner - Native & Custom Top-Down Push Notification Engine
 * 
 * Implements real HTML5 Web Notifications (when permission granted)
 * and an ultra-realistic, top-down iOS/Android simulated push banner 
 * with dynamic Web Audio synthesized chime sounds and interactive tap triggers.
 */

export class NotificationEngine {
  static permissionPromptShown = false;
  static isInitialized = false;
  static appInstance = null;
  static simulatedTimer = null;

  static init(appInstance) {
    if (this.isInitialized) return;
    this.appInstance = appInstance;
    this.isInitialized = true;

    console.log("Notification Engine initialized.");

    // Ensure the top-down container exists in the DOM
    this.ensureSimulatedContainer();

    // Register Service Worker for Native Device Status Bar Push Notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("Service Worker registered for Status Bar Notifications:", reg.scope);
      }).catch((err) => {
        console.warn("Service Worker registration skipped:", err);
      });

      // Listen for messages from Service Worker (e.g. notification click tab navigation)
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NAVIGATE_TAB" && event.data.tab && this.appInstance) {
          if (event.data.tab.startsWith("http")) {
            window.open(event.data.tab, "_blank");
          } else {
            this.appInstance.currentTab = event.data.tab;
            this.appInstance.render();
            if (this.appInstance.showToast) {
              this.appInstance.showToast("Opened via Status Bar Notification!", "success");
            }
          }
        }
      });
    }

    // Check localStorage if permission prompt was dismissed
    const dismissed = localStorage.getItem("lw_push_prompt_dismissed") === "true";
    
    // Automatically trigger permission prompt after 6 seconds if not dismissed
    if (!dismissed) {
      setTimeout(() => {
        this.showPermissionPrompt();
      }, 6000);
    }

    // Schedule high-quality simulated background push notifications (like real apps)
    this.scheduleSimulatedPushEvents();
  }

  /**
   * Synthesizes a beautiful, crystal-clear mobile notification chime sound
   * using native Web Audio API (extremely robust, 0% latency, 0 external files)
   */
  static playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // Beautiful double-bell chime (e.g. Ding-Dong)
      const playTone = (freq, startTime, duration, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Soft exponential decay
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Play Ding (high chime)
      playTone(987.77, ctx.currentTime, 0.45, 0.15); // B5 note
      // Play Dong (harmonious chime slightly delayed)
      playTone(1318.51, ctx.currentTime + 0.12, 0.6, 0.12); // E6 note
      
    } catch (e) {
      console.warn("AudioContext failed to play chime (user interaction required):", e);
    }
  }

  /**
   * Create the container for top-down simulated notifications
   */
  static ensureSimulatedContainer() {
    let container = document.getElementById("simulated-push-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "simulated-push-container";
      // Fixed at top, centered, high z-index, pointer events none so users can click behind
      container.className = "fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-3 px-4 pointer-events-none";
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Slides down an elegant, iOS/Android style push notification banner
   */
  static showSimulatedBanner(title, message, iconType = "clover", actionTab = null) {
    const container = this.ensureSimulatedContainer();

    // Play synthesized bell
    this.playChime();

    const banner = document.createElement("div");
    // Native Lockscreen Notification styling (Exact match to Image1.png with rounded corners, backdrop-blur, matte-black tint)
    banner.className = "w-full max-w-[360px] bg-[#19191b]/95 border border-white/5 rounded-[22px] p-3.5 flex gap-3.5 items-center pointer-events-auto shadow-[0_20px_45px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-2xl transform -translate-y-24 opacity-0 transition-all duration-500 ease-out cursor-pointer hover:bg-[#202022]/95 active:scale-[0.98] select-none";
    
    // Choose icon, app title, and color badge dynamically based on type (matching system notification vibes)
    let appTitle = "Lottery Winner";
    let iconBgClass = "bg-[#059669]"; // default clover emerald
    let iconEmblem = `<i class="fa-solid fa-clover text-white text-[15px]"></i>`;
    let rightThumbHTML = "";

    if (iconType === "jackpot" || iconType === "gift") {
      appTitle = "Grand Jackpot";
      iconBgClass = "bg-gradient-to-br from-amber-500 to-yellow-500";
      iconEmblem = `<i class="fa-solid fa-gift text-slate-950 text-[14px]"></i>`;
    } else if (iconType === "success" || iconType === "winner") {
      appTitle = "Winner Draw";
      iconBgClass = "bg-gradient-to-br from-[#d946ef] to-[#c084fc]";
      iconEmblem = `<i class="fa-solid fa-trophy text-white text-[13px] animate-bounce"></i>`;
    } else if (iconType === "agent") {
      appTitle = "Agent Cash Service";
      iconBgClass = "bg-gradient-to-br from-blue-500 to-indigo-600";
      iconEmblem = `<i class="fa-solid fa-user-tie text-white text-[14px]"></i>`;
    } else if (iconType === "bkash") {
      appTitle = "bKash Voucher";
      iconBgClass = "bg-[#e2136e]"; // bkash pink
      iconEmblem = `<i class="fa-solid fa-credit-card text-white text-[13px]"></i>`;
      rightThumbHTML = `<div class="w-8 h-8 rounded-full bg-pink-900/50 flex items-center justify-center font-black text-pink-300 text-[10px]">৳</div>`;
    } else if (iconType === "nagad") {
      appTitle = "Nagad Pay";
      iconBgClass = "bg-[#f54607]"; // nagad orange
      iconEmblem = `<i class="fa-solid fa-wallet text-white text-[13px]"></i>`;
    } else if (iconType === "whatsapp") {
      appTitle = "WhatsApp Live Help";
      iconBgClass = "bg-[#25D366]"; // whatsapp green
      iconEmblem = `<i class="fa-brands fa-whatsapp text-white text-[18px]"></i>`;
    }

    // Dynamic lockscreen time tracker
    const randomTimes = ["now", "1m ago", "2m ago", "5m ago"];
    const displayTime = randomTimes[Math.floor(Math.random() * randomTimes.length)];

    banner.innerHTML = `
      <!-- App Icon Group -->
      <div class="w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center shrink-0 shadow-lg shadow-black/30">
        ${iconEmblem}
      </div>

      <!-- Text Payload -->
      <div class="flex-1 min-w-0 font-sans">
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="text-[12.5px] font-extrabold text-white/95 tracking-tight truncate">${appTitle}</span>
          <span class="text-[10px] text-white/30">•</span>
          <span class="text-[10px] text-white/40 font-mono font-medium">${displayTime}</span>
        </div>
        <p class="text-[11.5px] text-white/90 leading-tight font-bold truncate">
          ${title}
        </p>
        <p class="text-[11px] text-[#9fa0a7] leading-snug font-normal mt-0.5 line-clamp-2">
          ${message}
        </p>
      </div>

      <!-- Expand and Action buttons (looks just like Image1.png down arrow collapse) -->
      <div class="flex items-center gap-2 shrink-0">
        ${rightThumbHTML}
        <div class="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition duration-150" onclick="event.stopPropagation(); this.closest('.transform').remove();">
          <i class="fa-solid fa-chevron-down text-[9.5px]"></i>
        </div>
      </div>
    `;

    // Tap behaviour to redirect to specific tab
    banner.addEventListener("click", () => {
      banner.classList.add("-translate-y-24", "opacity-0");
      setTimeout(() => banner.remove(), 400);

      if (actionTab && this.appInstance) {
        this.appInstance.currentTab = actionTab;
        this.appInstance.render();
        this.appInstance.showToast(`Navigated to ${actionTab.replace("tab-", "")} via notification!`, "success");
      }
    });

    container.appendChild(banner);

    // Slide down in next frame
    setTimeout(() => {
      banner.classList.remove("-translate-y-24", "opacity-0");
    }, 50);

    // Auto remove after 6 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.classList.add("-translate-y-24", "opacity-0");
        setTimeout(() => banner.remove(), 500);
      }
    }, 6500);
  }

  /**
   * Prompts the user elegantly to enable native web notifications
   */
  static showPermissionPrompt() {
    if (this.permissionPromptShown) return;
    this.permissionPromptShown = true;

    // Check if notification permission is already granted/denied
    if ("Notification" in window && (Notification.permission === "granted" || Notification.permission === "denied")) {
      return; // Already decided
    }

    const promptCard = document.createElement("div");
    promptCard.id = "push-permission-prompt-card";
    promptCard.className = "fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 max-w-sm bg-slate-900 border-2 border-cyan-500/40 p-4 rounded-2.5xl z-50 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-md transform translate-y-12 opacity-0 transition-all duration-500 ease-out font-sans";
    
    promptCard.innerHTML = `
      <div class="flex gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-rose-600 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-bell text-white text-sm animate-swing"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-xs font-bold text-white tracking-tight">Enable App Push Notifications? 🔔</h3>
          <p class="text-[10px] text-slate-300 leading-normal">
            Get instant lottery draw announcements, daily streaking reminders, cash deposits updates, and exclusive promos directly on your device.
          </p>
        </div>
      </div>
      <div class="flex gap-2 justify-end mt-3 text-[10px] font-mono">
        <button id="push-prompt-cancel" class="bg-slate-950 hover:bg-slate-850 text-slate-400 py-1.5 px-3 rounded-xl border border-slate-850 transition cursor-pointer">
          Later
        </button>
        <button id="push-prompt-accept" class="bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-bold py-1.5 px-4 rounded-xl shadow-lg transition cursor-pointer">
          Allow Notifications
        </button>
      </div>
    `;

    document.body.appendChild(promptCard);

    // Slide up animation
    setTimeout(() => {
      promptCard.classList.remove("translate-y-12", "opacity-0");
    }, 100);

    // Event listener for Later
    document.getElementById("push-prompt-cancel").addEventListener("click", () => {
      localStorage.setItem("lw_push_prompt_dismissed", "true");
      promptCard.classList.add("translate-y-12", "opacity-0");
      setTimeout(() => promptCard.remove(), 500);
    });

    // Event listener for Accept
    document.getElementById("push-prompt-accept").addEventListener("click", () => {
      promptCard.classList.add("translate-y-12", "opacity-0");
      setTimeout(() => promptCard.remove(), 500);
      this.requestNativePermission();
    });
  }

  /**
   * Request native permission and fallback gracefully
   */
  static requestNativePermission() {
    this.playChime();

    if (!("Notification" in window)) {
      this.showSimulatedBanner("Feature Enabled!", "Custom in-app notifications active.", "winner");
      return Promise.resolve(false);
    }

    return Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        this.sendNativeNotification("Lottery Winner Active! 🔔", {
          body: "Real-time mobile & desktop status bar notifications are enabled!",
          icon: "/logo.jpg",
          badge: "/logo.jpg",
          tag: "welcome-status-bar-" + Date.now(),
          vibrate: [200, 100, 200]
        });
        this.showSimulatedBanner("Status Bar Push Enabled! 🟢", "Mobile & Desktop Status Bar Push Notifications are now active!", "winner");
        return true;
      } else {
        this.showSimulatedBanner("Permission Blocked 🔴", "Allow Notifications in site permissions/address bar to receive Status Bar alerts.", "clover");
        return false;
      }
    }).catch(err => {
      console.warn("Notification.requestPermission error:", err);
      this.showSimulatedBanner("Notifications Active ⚙️", "Using high-speed floating banner notifications.", "clover");
      return false;
    });
  }

  /**
   * Sends a real native device OS status bar push notification using Browser Notification API & Service Worker
   */
  static async sendNativeNotification(title, options = {}) {
    if (!("Notification" in window)) return false;

    // Auto-request permission if permission state is still default
    if (Notification.permission === "default") {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          console.warn("Native Notification permission was not granted by user.");
          return false;
        }
      } catch (e) {
        console.warn("Error requesting native notification permission:", e);
        return false;
      }
    }

    if (Notification.permission !== "granted") return false;

    try {
      // 1. Service Worker postMessage dispatch (Most reliable for PWA & Mobile Status Bar)
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "TRIGGER_NATIVE_PUSH",
          payload: {
            title,
            message: options.body || options.message,
            icon: options.icon || "/logo.jpg",
            badge: options.badge || "/logo.jpg",
            imageUrl: options.image || options.imageUrl,
            targetTab: options.data ? options.data.url : "/",
            tag: options.tag || "status-bar-" + Date.now()
          }
        });
      }

      // 2. Try Service Worker Registration showNotification directly
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, options);
            return true;
          }
        } catch (swErr) {
          console.warn("SW showNotification failed, attempting direct Notification constructor:", swErr);
        }
      }

      // 3. Direct constructor fallback
      const notif = new Notification(title, options);
      if (options.data && options.data.url) {
        notif.onclick = () => {
          window.focus();
          if (this.appInstance && options.data.url) {
            this.appInstance.currentTab = options.data.url;
            this.appInstance.render();
          }
        };
      }
      return true;
    } catch (err) {
      console.warn("Could not dispatch native OS notification:", err);
      return false;
    }
  }

  /**
   * Triggers a push notification (both native device status bar & top-down simulated banner)
   */
  static trigger(title, message, iconType = "clover", actionTab = null) {
    // 1. Show top-down simulated in-app banner
    this.showSimulatedBanner(title, message, iconType, actionTab);

    // 2. Trigger real HTML5 Native OS Status Bar Notification
    const logoUrl = window.location.origin + "/logo.jpg";
    this.sendNativeNotification(title, {
      body: message,
      icon: logoUrl,
      badge: logoUrl,
      tag: "lottery-winner-alert-" + Date.now(),
      vibrate: [200, 100, 200],
      data: { url: actionTab }
    });
  }

  /**
   * Triggers a rich Web Push Ad (native device status bar + top banner + interactive 3D Web Push Ad modal)
   */
  static triggerWebPushAd(adData) {
    this.playChime();

    // 1. Trigger Native Device OS Status Bar Push Alert (System Tray)
    const logoUrl = adData.imageUrl || (window.location.origin + "/logo.jpg");
    this.sendNativeNotification(`⚡ ${adData.title}`, {
      body: adData.message,
      icon: logoUrl,
      image: adData.imageUrl || undefined,
      badge: logoUrl,
      tag: "web-push-ad-" + (adData.id || Date.now()),
      vibrate: [300, 100, 300],
      renotify: true,
      data: { url: adData.targetTab }
    });

    // 2. Show top-down simulated banner notification on app top header
    this.showSimulatedBanner(adData.title, adData.message, adData.iconType || "bkash", adData.targetTab);

    // 3. Render rich full Web Push Ad modal card popup on screen
    this.showWebPushAdModal(adData);
  }

  /**
   * Displays an interactive 3D Web Push Ad modal popup on screen with image banner & direct CTA link
   */
  static showWebPushAdModal(adData) {
    const existing = document.getElementById("web-push-ad-modal-popup");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "web-push-ad-modal-popup";
    modal.className = "fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-rose-500/10 font-sans animate-in fade-in duration-300";

    const ctaText = adData.ctaText || "👉 Claim Offer Now";
    const imgHtml = adData.imageUrl ? `
      <div class="relative w-full h-44 rounded-2xl overflow-hidden mb-3 border border-slate-800 shadow-lg group">
        <img src="${adData.imageUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Web Push Ad" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <span class="absolute top-2.5 right-2.5 bg-rose-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-md font-mono flex items-center gap-1">
          <i class="fa-solid fa-rectangle-ad"></i> SPONSORED AD
        </span>
      </div>
    ` : `
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl mx-auto mb-2 shadow-xl shadow-cyan-500/20 animate-bounce">
        <i class="fa-solid fa-bullhorn"></i>
      </div>
    `;

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-[28px] max-w-sm w-full shadow-2xl relative text-center text-slate-100 transition-all duration-300 transform scale-95 animate-in zoom-in-95" style="perspective: 1000px;">
        <button id="web-push-ad-close-btn" class="absolute top-3 right-3 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer z-30 transition shadow-md">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- Category Badge -->
        <div class="inline-flex items-center gap-1.5 bg-slate-950 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400 font-bold mb-3 shadow-inner">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          OFFICIAL ANNOUNCEMENT • WEB PUSH AD
        </div>

        ${imgHtml}

        <div class="space-y-2 mb-4">
          <h3 class="text-base font-black text-white leading-snug tracking-tight font-display">
            ${adData.title}
          </h3>
          <p class="text-xs text-slate-300 leading-relaxed font-sans font-medium px-1">
            ${adData.message}
          </p>
        </div>

        <div class="space-y-2 pt-1 font-mono">
          <button id="web-push-ad-cta-btn" class="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2">
            <span>${ctaText}</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
          
          <button id="web-push-ad-dismiss-btn" class="w-full bg-transparent hover:bg-slate-950 text-slate-500 hover:text-slate-300 text-[10px] py-1.5 rounded-xl transition cursor-pointer">
            Dismiss Announcement
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => modal.remove(), 250);
    };

    const closeBtn = document.getElementById("web-push-ad-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    
    const dismissBtn = document.getElementById("web-push-ad-dismiss-btn");
    if (dismissBtn) dismissBtn.addEventListener("click", closeModal);

    const ctaBtn = document.getElementById("web-push-ad-cta-btn");
    if (ctaBtn) {
      ctaBtn.addEventListener("click", () => {
        if (adData.id && this.appInstance && this.appInstance.db && this.appInstance.db.webPushAds) {
          const ad = this.appInstance.db.webPushAds.find(a => a.id === adData.id);
          if (ad) ad.clicks = (ad.clicks || 0) + 1;
          this.appInstance.saveDB();
        }

        closeModal();

        if (adData.targetTab && this.appInstance) {
          if (adData.targetTab.startsWith("http")) {
            window.open(adData.targetTab, "_blank");
          } else {
            this.appInstance.currentTab = adData.targetTab;
            this.appInstance.render();
            this.appInstance.showToast(`Navigated via Web Push Ad!`, "success");
          }
        }
      });
    }
  }

  /**
   * Realistic background scheduler to trigger immersive push alerts periodically
   */
  static scheduleSimulatedPushEvents() {
    // Disabled to prevent spamming the user interface as requested by the user
    return;

    if (this.simulatedTimer) {
      clearInterval(this.simulatedTimer);
    }

    const events = [
      {
        title: "⚡ ১-মিনিট ইনস্ট্যান্ট কুইক ড্র!",
        message: "Next high-speed draw starting in 15 seconds! Claim your ticket for ৳15 now.",
        icon: "clover",
        tab: "tab-games"
      },
      {
        title: "👑 ভিআইপি মেম্বারশিপ আপডেট!",
        message: "Level up your VIP tier today to enjoy up to ৳2,000 monthly bonus rewards!",
        icon: "gift",
        tab: "tab-home"
      },
      {
        title: "🏆 নতুন উইনার এলার্ট! 🎉",
        message: "Player @rifat_bkash won ৳2,500 cash in Dhaka Daily Draw with ticket code LW-889345!",
        icon: "winner",
        tab: "tab-history"
      },
      {
        title: "💰 প্রগ্রেসিভ জ্যাকপট বাড়ছে!",
        message: "The Grand Jackpot pool is nearing ৳90,000. Take a shot with bulk tickets!",
        icon: "jackpot",
        tab: "tab-jackpot"
      },
      {
        title: "📅 ডেইলি রিওয়ার্ড রেডি!",
        message: "Don't break your consecutive streak! Open app and check-in to boost reward points.",
        icon: "gift",
        tab: "tab-tasks"
      },
      {
        title: "🤝 এজেন্ট সার্ভিস অনলাইন!",
        message: "Agents are online and verified. Cash-ins are credited within 2 minutes!",
        icon: "agent",
        tab: "tab-wallet"
      },
      {
        title: "💬 Customer Help Line Active",
        message: "যেকোনো সাহায্য বা ডিপোজিট সংক্রান্ত সমস্যার জন্য আমাদের WhatsApp এজেন্টের সাথে সরাসরি কথা বলুন।",
        icon: "whatsapp",
        tab: "tab-home"
      }
    ];

    // Trigger random pushes every 25 to 35 seconds to keep user interface immersive
    const triggerNext = () => {
      const delay = 25000 + Math.random() * 10000;
      this.simulatedTimer = setTimeout(() => {
        const rand = events[Math.floor(Math.random() * events.length)];
        
        // Only trigger if app is active and user is logged in
        if (this.appInstance && this.appInstance.currentUser) {
          // If it's a jackpot alert, fetch live jackpot pool if possible
          if (rand.icon === "jackpot" && this.appInstance.db.settings) {
            const poolVal = parseFloat(this.appInstance.db.settings.jackpotPool || 84250);
            rand.message = `The Grand Jackpot pool has reached ৳${Math.floor(poolVal).toLocaleString()}! Secure your ticket now.`;
          }
          this.trigger(rand.title, rand.message, rand.icon, rand.tab);
        }
        
        triggerNext();
      }, delay);
    };

    triggerNext();
  }
}
