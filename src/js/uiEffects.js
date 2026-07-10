import { FloatingToastNotification } from "../floating_toast.js";

export const UIEffectsModule = {
  init3DTiltEffect() {
    // Elegant mouse coordinate tracking to tilt any card with interactive-tilt-card class
    document.addEventListener("mousemove", (e) => {
      if (!e.target || typeof e.target.closest !== "function") return;
      const card = e.target.closest(".interactive-tilt-card");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate relative delta percentage from center
      const rotateX = -((y - centerY) / centerY) * 10; // Max 10 deg vertical rotation
      const rotateY = ((x - centerX) / centerX) * 10;  // Max 10 deg horizontal rotation

      // Apply dynamic 3D perspective and scales
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
    });

    document.addEventListener("mouseleave", (e) => {
      if (!e.target || typeof e.target.closest !== "function") return;
      const card = e.target.closest(".interactive-tilt-card");
      if (!card) return;
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }, true);
  },

  triggerConfetti() {
    const canvas = document.getElementById("celebration-confetti-canvas");
    if (!canvas) return;

    canvas.classList.remove("hidden");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#06b6d4", "#ec4899", "#eab308", "#10b981", "#6366f1", "#f97316"];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 4 + 3,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    let animationFrameId;
    const startTime = Date.now();

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

        if (p.y < canvas.height) {
          activeParticles++;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (Date.now() - startTime < 4000 && activeParticles > 0) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        canvas.classList.add("hidden");
        cancelAnimationFrame(animationFrameId);
      }
    }

    draw();
  },

  showCongratsSplash(title, message, rewardAmount) {
    const modal = document.getElementById("congrats-splash-modal");
    const titleEl = document.getElementById("congrats-splash-title");
    const msgEl = document.getElementById("congrats-splash-message");
    const amountEl = document.getElementById("congrats-splash-amount");
    const closeBtn = document.getElementById("congrats-splash-close-btn");
    const shareBtn = document.getElementById("congrats-splash-share-btn");

    if (!modal) return;

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerHTML = message;
    if (amountEl) {
      if (rewardAmount && rewardAmount !== "undefined" && rewardAmount !== "৳undefined" && rewardAmount !== "৳undefined.00") {
        amountEl.innerText = rewardAmount;
        if (amountEl.parentElement) amountEl.parentElement.classList.remove("hidden");
      } else {
        amountEl.innerText = "";
        if (amountEl.parentElement) amountEl.parentElement.classList.add("hidden");
      }
    }

    modal.classList.remove("hidden");
    this.triggerConfetti();

    if (navigator.vibrate) navigator.vibrate([100, 50, 150]);

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add("hidden");
      };
    }

    if (shareBtn) {
      shareBtn.onclick = () => {
        try {
          const prizeString = rewardAmount ? `\n💰 Prize claimed: ${rewardAmount} Taka!` : "";
          const shareText = encodeURIComponent(`🎉 I just unlocked an achievement on Lottery Winner!\n🏆 Goal: ${title}${prizeString}\nJoin now: ${window.location.origin}`);
          const link = document.createElement("a");
          link.href = `https://t.me/share/url?url=${shareText}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.click();
        } catch (err) {
          const clipboardText = rewardAmount 
            ? `I just claimed ৳${rewardAmount} on Lottery Winner! Join now: ${window.location.origin}`
            : `I just unlocked an achievement on Lottery Winner! Join now: ${window.location.origin}`;
          navigator.clipboard.writeText(clipboardText);
          this.showToast("Link copied to clipboard! You can share it anywhere.", "success");
        }
      };
    }
  },

  startLiveActivityTicker() {
    const track = document.getElementById("live-activity-ticker-track");
    if (!track) return;

    const templates = [
      "@{user} just won ৳{amount} from Lucky Spin! 🎡",
      "@{user} claimed ৳{amount} {level} Milestone Reward! 🏆",
      "@{user} purchased {tickets} ticket entries to {pool}! 🎫",
      "@{user} requested bKash cashout withdrawal of ৳{amount}! 💸",
      "@{user} made a secure bKash deposit of ৳{amount}! 💳",
      "New player @{user} registered via affiliate link! 🌟",
      "@{user} completed automated Cashout OTP checkout! 🔒"
    ];

    const banglaNames = [
      "shohan", "arif_99", "rifat", "nayem_dx", "sajid", "tamim", "rakib_pro", 
      "bKash_agent", "taka_master", "lucky_win", "shakib_75", "mim_tabassum",
      "ruma_akter", "faisal_khan", "hasan_joy", "tanvir_boss", "mehedi"
    ];

    const pools = [
      "Mega Jackpot Pool", "Daily Cash Draw", "Eid Festival Grand Pool", "Bronze Starter Pool"
    ];

    const levels = [
      "Bronze Recruiter", "Silver Partner", "Gold Ambassador", "Supreme Influencer"
    ];

    const generateRandomActivity = () => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const user = banglaNames[Math.floor(Math.random() * banglaNames.length)];
      let amount = (Math.floor(Math.random() * 15) * 50 + 50).toFixed(0);
      if (template.includes("Spin")) {
        amount = [10, 15, 20, 50, 100, 250, 500][Math.floor(Math.random() * 7)];
      }
      const tickets = Math.floor(Math.random() * 8) + 1;
      const pool = pools[Math.floor(Math.random() * pools.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];

      return template
        .replace("{user}", user)
        .replace("{amount}", amount)
        .replace("{tickets}", tickets)
        .replace("{pool}", pool)
        .replace("{level}", level);
    };

    const updateTickerText = () => {
      let html = "";
      for (let i = 0; i < 4; i++) {
        const text = generateRandomActivity();
        html += `
          <span class="inline-flex items-center gap-1.5 text-[9.5px] font-medium text-slate-300">
            <i class="fa-solid fa-bolt-lightning text-amber-500 animate-pulse text-[8px]"></i>
            ${text}
          </span>
        `;
      }
      track.innerHTML = html;
      
      track.style.opacity = "0";
      setTimeout(() => {
        track.style.opacity = "1";
      }, 150);
    };

    updateTickerText();

    if (this.liveTickerInterval) {
      clearInterval(this.liveTickerInterval);
    }
    this.liveTickerInterval = setInterval(updateTickerText, 6000);
  },

  initSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    const progress = document.getElementById("splash-progress");
    const percent = document.getElementById("splash-percent");
    const card = document.getElementById("splash-3d-card");

    if (!splashScreen) return;

    // 1. Continuous 3D auto-rotation logic for the card (when no mouse is hovering)
    let isHovered = false;

    if (card) {
      card.addEventListener("mouseenter", () => { isHovered = true; });
      card.addEventListener("mouseleave", () => { 
        isHovered = false; 
        card.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      });
    }

    const autoRotateInterval = setInterval(() => {
      if (isHovered || !card) return;
      // Cycle through a gentle infinity loop or sinusoidal tilt
      const time = Date.now() * 0.0015;
      const rotateY = Math.sin(time) * 15 + 10;
      const rotateX = Math.cos(time * 0.8) * 10 + 8;
      card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.02, 1.02, 1.02)`;
    }, 30);

    // 2. Animate progress bar from 0% to 100%
    let percentage = 0;
    const progressInterval = setInterval(() => {
      if (percentage < 100) {
        // Vary increment to mimic asymmetric network loading profile
        const increment = Math.floor(Math.random() * 4) + 1;
        percentage = Math.min(100, percentage + increment);
        if (progress) progress.style.width = `${percentage}%`;
        if (percent) percent.innerText = `${percentage}%`;
      } else {
        clearInterval(progressInterval);
        clearInterval(autoRotateInterval);

        // Transition fade out elegantly
        splashScreen.style.opacity = "0";
        setTimeout(() => {
          splashScreen.classList.add("hidden");
        }, 750);
      }
    }, 40);
  },

  init3DAuthCard() {
    const card = document.getElementById("auth-3d-vip-card");
    if (!card) return;

    let isHovered = false;
    card.addEventListener("mouseenter", () => { isHovered = true; });
    card.addEventListener("mouseleave", () => { 
      isHovered = false; 
      card.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
    });

    setInterval(() => {
      if (isHovered) return;
      const time = Date.now() * 0.001;
      const rotateY = Math.sin(time) * 12 - 5;
      const rotateX = Math.cos(time * 0.9) * 8 + 6;
      card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.01, 1.01, 1.01)`;
    }, 40);
  },

  getUserTicketDiscount(user) {
    if (!user || !user.vipLevelId) return 0;
    const tier = this.db.settings.vipTiers.find(t => t.id === user.vipLevelId);
    return tier ? (tier.discount || 0) : 0;
  },

  getVIPMultiplier(user) {
    if (!user || !user.vipLevelId) return 1.0;
    const tier = this.db.settings.vipTiers.find(t => t.id === user.vipLevelId);
    return tier ? (tier.multiplier || 1.0) : 1.0;
  },

  tickProgressiveJackpot() {
    if (this.db && this.db.settings) {
      // Update the user interface with the current actual pool size
      const poolAmountEl = document.getElementById("jackpot-pool-amount");
      if (poolAmountEl) {
        poolAmountEl.innerText = "৳" + this.db.settings.jackpotPool.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      // Update countdown dynamic timer
      const cdEl = document.getElementById("jackpot-countdown");
      if (cdEl) {
        const now = new Date();
        let target = new Date(this.db.settings.jackpotExpiry || "");
        if (isNaN(target.getTime())) {
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }
        const diffMs = target.getTime() - now.getTime();
        if (diffMs > 0) {
          const hrs = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          const secs = Math.floor((diffMs % 60000) / 1000);
          cdEl.innerText = `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
        } else {
          cdEl.innerText = "00h : 00m : 00s (Ended)";
        }
      }

      // Update active user entries summary
      const entriesLabel = document.getElementById("jackpot-tickets-count");
      if (entriesLabel && this.currentUser) {
        entriesLabel.innerText = `Your Entries: ${this.currentUser.jackpotTickets || 0} tickets`;
      }
    }
  },

  openScreenshotViewer(submissionId) {
    if (!this.db || !this.db.taskSubmissions) return;
    const sub = this.db.taskSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    const modal = document.getElementById("screenshot-viewer-modal");
    const img = document.getElementById("screenshot-large-img");
    const title = document.getElementById("screenshot-title");
    const meta = document.getElementById("screenshot-meta");

    if (modal && img) {
      img.src = sub.screenshot;
      if (title) title.innerText = sub.taskTitle || "Screenshot Proof";
      if (meta) meta.innerText = `Submitted by: @${sub.userName} • Bounty reward: ৳${sub.reward} • Status: ${sub.status.toUpperCase()}`;
      
      // Reset state variables
      window.screenshotViewerState = {
        zoom: 1,
        panX: 0,
        panY: 0,
        rotate: 0,
        isDragging: false,
        startX: 0,
        startY: 0
      };
      
      // Clear inline transformation
      img.style.transform = "scale(1) translate(0px, 0px) rotate(0deg)";
      
      const percent = document.getElementById("screenshot-zoom-percent");
      if (percent) percent.innerText = "100%";
      const slider = document.getElementById("screenshot-zoom-slider");
      if (slider) slider.value = "1";

      modal.classList.remove("hidden");
    }
  },

  updateNotificationBanner() {
    const banner = document.getElementById("notif-permission-banner");
    if (!banner) return;

    if (!this.currentUser) {
      banner.classList.add("hidden");
      return;
    }

    if (localStorage.getItem("lw_alerts_enabled") === "true") {
      banner.classList.add("hidden");
      return;
    }

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        banner.classList.add("hidden");
      } else {
        banner.classList.remove("hidden");
      }
    } else {
      banner.classList.add("hidden");
    }
  },

  showCashoutDeductionPopup(deduction) {
    const existing = document.getElementById("cashout-deduction-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "cashout-deduction-popup";
    popup.className = "fixed inset-0 flex items-center justify-center z-[9999] bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300 p-4";
    
    const timeStr = new Date(deduction.timestamp).toLocaleString();

    popup.innerHTML = `
      <div class="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/30 p-6 rounded-[32px] shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-[30px] pointer-events-none"></div>
        
        <div class="w-16 h-16 mx-auto bg-gradient-to-tr from-rose-500 to-red-600 rounded-3xl flex items-center justify-center text-white text-2xl shadow-lg shadow-rose-500/10 mb-2">
          <i class="fa-solid fa-receipt animate-bounce"></i>
        </div>

        <div class="space-y-1">
          <h3 class="text-base font-black font-display text-white uppercase tracking-tight">Balance Deducted</h3>
          <p class="text-[9.5px] text-slate-500 font-mono tracking-widest uppercase">Official Cashout Receipt</p>
        </div>

        <div class="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
          <div class="flex justify-between border-b border-slate-850/60 pb-1.5">
            <span class="text-slate-500 uppercase text-[9px]">Deducted Amount</span>
            <span class="text-rose-450 font-black text-sm">৳${parseFloat(deduction.amount).toFixed(2)}</span>
          </div>
          <div class="flex justify-between border-b border-slate-850/60 py-1.5">
            <span class="text-slate-500 uppercase text-[9px]">Agent Handler</span>
            <span class="text-white font-bold">@${deduction.agentUsername}</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="text-slate-500 uppercase text-[9px]">Timestamp</span>
            <span class="text-slate-300 text-[10px]">${timeStr}</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Dismissing in:</span>
            <span id="popup-dismiss-secs" class="font-bold text-white">5s</span>
          </div>
          <div class="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
            <div id="popup-dismiss-progress" class="h-full bg-rose-600 w-full transition-all duration-1000 ease-linear"></div>
          </div>
        </div>

        <button id="dismiss-cashout-popup-btn" class="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
          Dismiss Now
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    let popupRemaining = 5;
    const progressEl = document.getElementById("popup-dismiss-progress");
    const secondsEl = document.getElementById("popup-dismiss-secs");

    const timer = setInterval(() => {
      popupRemaining--;
      if (secondsEl) secondsEl.innerText = `${popupRemaining}s`;
      if (progressEl) {
        progressEl.style.width = `${(popupRemaining / 5) * 100}%`;
      }
      
      if (popupRemaining <= 0) {
        clearInterval(timer);
        popup.remove();
      }
    }, 1000);

    const dismissBtn = document.getElementById("dismiss-cashout-popup-btn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        clearInterval(timer);
        popup.remove();
      });
    }
  },

  renderProfileChart() {
    const ctx = document.getElementById("profile-chart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      return;
    }

    if (this.profileChartInstance) {
      this.profileChartInstance.destroy();
    }

    const spent = parseFloat(this.currentUser.loss) || 0;
    const profit = parseFloat(this.currentUser.profit) || 0;
    const winnings = Math.max(0, spent + profit);

    this.profileChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Spent", "Winnings"],
        datasets: [{
          data: [spent, winnings],
          backgroundColor: ["#f43f5e", "#10b981"],
          borderWidth: 1,
          borderColor: "#0f172a"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a3b8",
              font: {
                size: 9,
                family: "JetBrains Mono"
              }
            }
          }
        },
        cutout: "60%"
      }
    });
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-mono text-white transition-all transform translate-y-2 opacity-0 duration-350 shrink-0 select-none ${
      type === "success" ? "bg-emerald-950 border-emerald-500/30 text-emerald-300" :
      type === "error" ? "bg-rose-950 border-rose-500/30 text-rose-300" :
      "bg-slate-900 border-slate-700 text-slate-300"
    }`;

    const icon = document.createElement("i");
    icon.className = `fa-solid ${
      type === "success" ? "fa-circle-check text-emerald-400" :
      type === "error" ? "fa-circle-xmark text-rose-400" :
      "fa-circle-info text-cyan-400"
    }`;

    const text = document.createElement("span");
    text.innerText = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    // Remove
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  renderHomeBannerSliders() {
    const wrapper = document.getElementById("home-banner-slider-wrapper");
    const track = document.getElementById("home-banner-slider-track");
    const dotsContainer = document.getElementById("home-banner-slider-dots");
    if (!wrapper || !track || !dotsContainer) return;

    // Clear any previous interval
    if (this.bannerSliderInterval) {
      clearInterval(this.bannerSliderInterval);
      this.bannerSliderInterval = null;
    }

    const slides = this.db.settings.bannerSlides || [];
    if (slides.length === 0) {
      wrapper.classList.add("hidden");
      return;
    }

    wrapper.classList.remove("hidden");
    track.innerHTML = "";
    dotsContainer.innerHTML = "";
    this.currentSlideIndex = 0;

    slides.forEach((slide, idx) => {
      // Create slide element
      const slideDiv = document.createElement("div");
      slideDiv.className = "w-full shrink-0 h-full relative cursor-pointer select-none overflow-hidden rounded-3xl";
      slideDiv.style.width = "100%";
      slideDiv.style.minWidth = "100%";
      slideDiv.style.flexShrink = "0";
      slideDiv.innerHTML = `
        <img src="${slide.imageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop'}" alt="${slide.title}" class="w-full h-full object-cover select-none pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-center px-6 md:px-8 space-y-1.5">
          <span class="inline-block self-start text-[7px] md:text-[8px] uppercase font-black text-white bg-red-600 border border-red-500/30 px-2 py-0.5 rounded-full tracking-widest font-mono shadow-md">${slide.subtitle || 'SPECIAL PROMOTION'}</span>
          <h3 class="text-xs md:text-sm font-black text-white font-display leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-[280px] tracking-wide">${slide.title}</h3>
          <span class="text-[8px] text-cyan-400 font-mono font-bold flex items-center gap-1.5 bg-slate-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md self-start">
            <i class="fa-solid fa-circle-arrow-right text-[9px] animate-bounce"></i> Tap to visit now
          </span>
        </div>
      `;

      // Tap to navigate
      slideDiv.addEventListener("click", () => {
        if (slide.link) {
          this.currentTab = slide.link;
          this.renderDashboard();
        }
      });

      track.appendChild(slideDiv);

      // Create indicator dot
      const dot = document.createElement("button");
      dot.className = `w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-cyan-400 w-3' : 'bg-slate-700'}`;
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        this.goToSlide(idx);
      });
      dotsContainer.appendChild(dot);
    });

    // Update track translation
    track.style.transform = "translateX(0%)";

    // Setup left/right click navigation
    const prevBtn = document.getElementById("slider-prev-btn");
    const nextBtn = document.getElementById("slider-next-btn");
    if (prevBtn && nextBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        const prevIdx = (this.currentSlideIndex - 1 + slides.length) % slides.length;
        this.goToSlide(prevIdx);
      };
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        const nextIdx = (this.currentSlideIndex + 1) % slides.length;
        this.goToSlide(nextIdx);
      };
    }

    // Setup auto-slide
    const intervalTime = 5000;
    this.bannerSliderInterval = setInterval(() => {
      const nextIdx = (this.currentSlideIndex + 1) % slides.length;
      this.goToSlide(nextIdx);
    }, intervalTime);
  },

  goToSlide(idx) {
    const track = document.getElementById("home-banner-slider-track");
    const dotsContainer = document.getElementById("home-banner-slider-dots");
    if (!track || !dotsContainer) return;

    const slides = this.db.settings.bannerSlides || [];
    if (slides.length === 0) return;

    this.currentSlideIndex = idx;
    track.style.transform = `translateX(-${idx * 100}%)`;

    // Update dots
    const dots = dotsContainer.querySelectorAll("button");
    dots.forEach((dot, dIdx) => {
      if (dIdx === idx) {
        dot.className = "w-1.5 h-1.5 rounded-full transition-all duration-300 bg-cyan-400 w-3";
      } else {
        dot.className = "w-1.5 h-1.5 rounded-full transition-all duration-300 bg-slate-700";
      }
    });
  },

  triggerFullScreenPopup() {
    if (!this.currentUser) return;
    const settings = this.db.settings || {};
    const popup = settings.popupEvent || {};
    
    if (popup.enabled && sessionStorage.getItem("lw_popup_dismissed") !== "true") {
      const modal = document.getElementById("full-screen-popup-modal");
      if (modal) {
        const img = document.getElementById("popup-event-img");
        if (img) img.src = popup.imageUrl || "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop";
        
        const title = document.getElementById("popup-event-title");
        if (title) title.innerText = popup.title || "Eid Mega Draw Festival! 🎉";
        
        const message = document.getElementById("popup-event-message");
        if (message) message.innerText = popup.message || "";
        
        const actionBtnSpan = document.getElementById("popup-event-action-text-span");
        if (actionBtnSpan) actionBtnSpan.innerText = popup.actionText || "Claim Bonus";
        
        modal.classList.remove("hidden");
      }
    }
  }
};
