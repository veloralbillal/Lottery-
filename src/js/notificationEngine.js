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
    if (!("Notification" in window)) {
      this.showSimulatedBanner("Feature Enabled!", "Custom simulated system notifications are now active on your browser.", "winner");
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        try {
          new Notification("Lottery Winner Active! 🔔", {
            body: "Real-time push alerts are now officially integrated. Best of luck!",
            icon: "https://cdn-icons-png.flaticon.com/512/1055/1055683.png" // Clover icon fallback
          });
        } catch (err) {
          // Fallback if Notification constructor fails inside sandboxed frames
          this.showSimulatedBanner("Notifications Enabled! 🔔", "You will now receive beautiful lottery alerts on your screen.", "winner");
        }
      } else {
        this.showSimulatedBanner("In-App Alerts Active ⚙️", "Using high-speed, custom in-app floating banner notifications.", "clover");
      }
    });
  }

  /**
   * Triggers a push notification (both native system & simulated top banner)
   */
  static trigger(title, message, iconType = "clover", actionTab = null) {
    // 1. Show simulated iOS/Android banner (always runs for supreme aesthetics)
    this.showSimulatedBanner(title, message, iconType, actionTab);

    // 2. Trigger HTML5 Native System notification if permitted (runs on background/foreground)
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const logoUrl = window.location.origin + "/logo.jpg";
        const options = {
          body: message,
          icon: logoUrl,
          badge: logoUrl,
          tag: "lottery-winner-alert-" + Date.now(),
          vibrate: [200, 100, 200],
          requireInteraction: false
        };

        // Prefer Service Worker notification to show reliably in background & lockscreen
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
          }).catch(() => {
            new Notification(title, options);
          });
        } else {
          new Notification(title, options);
        }
      } catch (err) {
        console.log("Could not trigger native OS notification due to iframe sandbox restriction, using fallback.");
      }
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
