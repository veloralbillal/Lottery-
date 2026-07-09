/**
 * Lottery Winner - Live Floating Toast Notification System
 * 
 * Spawns real-time and simulated pop-up toasts in the screen corner whenever
 * players win lottery tickets, claim progressive jackpots, or receive rewards.
 */

export class FloatingToastNotification {
  static container = null;
  static isRunning = false;

  static start(appInstance) {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log("Live Floating Toast Notifications started.");
    
    // Create the container in DOM
    this.ensureContainer();

    // Trigger first toast after 4 seconds
    setTimeout(() => {
      this.showRandomToast(appInstance);
    }, 4000);

    // Schedule regular toasts every 14 to 22 seconds
    this.scheduleNext(appInstance);
  }

  static ensureContainer() {
    if (this.container) return;
    this.container = document.getElementById("floating-toast-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "floating-toast-container";
      this.container.className = "fixed bottom-16 right-4 sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2.5 max-w-[280px] sm:max-w-xs pointer-events-none font-mono";
      document.body.appendChild(this.container);
    }
  }

  static scheduleNext(appInstance) {
    const delay = 14000 + Math.random() * 8000; // between 14s and 22s
    setTimeout(() => {
      this.showRandomToast(appInstance);
      this.scheduleNext(appInstance);
    }, delay);
  }

  static showRandomToast(appInstance) {
    const db = appInstance.db;
    if (!db) return;

    // Grab a random registered user if possible, otherwise use a placeholder pool
    const users = db.users || [];
    let username = "player_luck";
    if (users.length > 0) {
      const randUser = users[Math.floor(Math.random() * users.length)];
      username = randUser.username;
    } else {
      const placeholders = ["sadik_99", "rifat_bkash", "milon_dhaka", "nasrin_begum", "tarek_nagad", "kamrul_10"];
      username = placeholders[Math.floor(Math.random() * placeholders.length)];
    }

    const events = [
      {
        type: "lottery_win",
        icon: "fa-solid fa-trophy text-emerald-400",
        border: "border-emerald-500/40 shadow-emerald-950/20",
        glow: "rgba(16,185,129,0.15)",
        title: "TICKET DRAW WIN! 🎉",
        text: () => {
          const wins = [500, 800, 1000, 1500, 2000];
          const winAmt = wins[Math.floor(Math.random() * wins.length)];
          const draws = ["Dhaka Daily", "Sylhet Express", "Chittagong Star", "Weekend Golden Pool"];
          const drawName = draws[Math.floor(Math.random() * draws.length)];
          return `@<span class="text-white font-bold">${username}</span> won <strong class="text-emerald-400">৳${winAmt}</strong> on the ${drawName} Draw!`;
        }
      },
      {
        type: "jackpot_win",
        icon: "fa-solid fa-crown text-amber-400 animate-bounce",
        border: "border-amber-500/50 shadow-amber-950/30",
        glow: "rgba(245,158,11,0.2)",
        title: "MEGA JACKPOT HIT! 🚀",
        text: () => {
          const jpPool = db.settings ? parseFloat(db.settings.jackpotPool || 25000) : 25000;
          const pct = 0.2 + Math.random() * 0.4; // 20% to 60% of pool
          const hitAmt = Math.floor(jpPool * pct);
          return `@<span class="text-white font-bold">${username}</span> claimed <strong class="text-amber-400">৳${hitAmt.toLocaleString()}</strong> from Progressive Jackpot!`;
        }
      },
      {
        type: "affiliate_commission",
        icon: "fa-solid fa-money-bill-trend-up text-pink-400",
        border: "border-pink-500/40 shadow-pink-950/20",
        glow: "rgba(236,72,153,0.15)",
        title: "COMMISSION PAID! 💸",
        text: () => {
          const earnings = [40, 75, 120, 250, 480];
          const commAmt = earnings[Math.floor(Math.random() * earnings.length)];
          return `@<span class="text-white font-bold">${username}</span> received <strong class="text-pink-400">৳${commAmt}</strong> Level 1 affiliate commission!`;
        }
      },
      {
        type: "lucky_spin",
        icon: "fa-solid fa-dharmachakra text-cyan-400 animate-spin-slow",
        border: "border-cyan-500/40 shadow-cyan-950/20",
        glow: "rgba(6,182,212,0.15)",
        title: "LUCKY WHEEL HIT! 🎡",
        text: () => {
          const prizes = ["Golden Ticket", "৳150 Cash Bonus", "৳250 Promo Code", "Double XP badge"];
          const prizeName = prizes[Math.floor(Math.random() * prizes.length)];
          return `@<span class="text-white font-bold">${username}</span> spun the Lucky Wheel and won <strong class="text-cyan-400">${prizeName}</strong>!`;
        }
      },
      {
        type: "consecutive_checkin",
        icon: "fa-solid fa-calendar-check text-indigo-400",
        border: "border-indigo-500/40 shadow-indigo-950/20",
        glow: "rgba(99,102,241,0.15)",
        title: "DAILY CHECK-IN STREAK! 📅",
        text: () => {
          const days = [3, 4, 5, 6, 7];
          const day = days[Math.floor(Math.random() * days.length)];
          const bonus = day * 25;
          return `@<span class="text-white font-bold">${username}</span> claimed Day ${day} consecutive check-in reward of <strong class="text-indigo-400">৳${bonus}</strong>!`;
        }
      }
    ];

    const chosenEvent = events[Math.floor(Math.random() * events.length)];
    this.createToast(chosenEvent);
  }

  /**
   * Spawns a custom floating toast dynamically with elegant design
   */
  static createToast(event) {
    this.ensureContainer();

    const toast = document.createElement("div");
    toast.className = `p-3 bg-slate-950/95 border ${event.border} rounded-2xl flex gap-3 items-start pointer-events-auto shadow-lg backdrop-blur-md transition-all duration-500 translate-x-12 opacity-0 select-none`;
    toast.style.boxShadow = `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px ${event.glow}`;

    toast.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
        <i class="${event.icon} text-xs"></i>
      </div>
      <div class="flex-1 space-y-0.5">
        <div class="text-[8px] font-black uppercase text-slate-500 tracking-wider flex justify-between items-center">
          <span>${event.title}</span>
          <span class="text-[7px] text-slate-650">Just now</span>
        </div>
        <p class="text-[10px] text-slate-300 leading-relaxed font-sans">
          ${event.text()}
        </p>
      </div>
    `;

    // Append to container
    this.container.appendChild(toast);

    // Trigger animation in next frame
    setTimeout(() => {
      toast.classList.remove("translate-x-12", "opacity-0");
    }, 50);

    // Auto-remove toast after 5.5 seconds
    setTimeout(() => {
      toast.classList.add("translate-x-12", "opacity-0");
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 5500);
  }

  /**
   * Utility to broadcast a specific custom toast directly (e.g. from real events)
   */
  static broadcastCustom(title, text, type = "info") {
    this.ensureContainer();

    const config = {
      info: { icon: "fa-solid fa-circle-info text-cyan-400", border: "border-cyan-500/40", glow: "rgba(6,182,212,0.15)" },
      success: { icon: "fa-solid fa-circle-check text-emerald-400", border: "border-emerald-500/40", glow: "rgba(16,185,129,0.15)" },
      warning: { icon: "fa-solid fa-triangle-exclamation text-amber-400", border: "border-amber-500/40", glow: "rgba(245,158,11,0.15)" }
    };

    const c = config[type] || config.info;

    const toast = document.createElement("div");
    toast.className = `p-3 bg-slate-950/95 border ${c.border} rounded-2xl flex gap-3 items-start pointer-events-auto shadow-lg backdrop-blur-md transition-all duration-500 translate-x-12 opacity-0 select-none`;
    toast.style.boxShadow = `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px ${c.glow}`;

    toast.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
        <i class="${c.icon} text-xs"></i>
      </div>
      <div class="flex-1 space-y-0.5">
        <div class="text-[8px] font-black uppercase text-slate-500 tracking-wider">
          <span>${title}</span>
        </div>
        <p class="text-[10px] text-slate-300 leading-relaxed font-sans">
          ${text}
        </p>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-x-12", "opacity-0");
    }, 50);

    setTimeout(() => {
      toast.classList.add("translate-x-12", "opacity-0");
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 5500);
  }
}
