/**
 * home_extensions.js
 *
 * Implements the premium, high-urgency Pools Tab Extension:
 * 🔥 HOT / TRENDING POOL CAROUSEL (সবচেয়ে দ্রুত পূর্ণ হওয়া পুল)
 *
 * Automatically filters active pools that are filling up fast (>75% or near draw limits),
 * presenting them in a beautiful, swipeable, animated glassmorphism card carousel to drive conversions.
 */

export class HomeExtensions {
  static init(appInstance) {
    console.log("Hot/Trending Pool Carousel Extension initialized successfully.");
    this.injectHTMLPlaceholder();
    this.setupListeners(appInstance);
  }

  static injectHTMLPlaceholder() {
    // Avoid double injection
    if (document.getElementById("home-extensions-container")) return;

    const homeTab = document.getElementById("tab-home");
    if (!homeTab) return;

    // Create the container and place it at the TOP of the home tab for maximum visibility!
    const extDiv = document.createElement("div");
    extDiv.id = "home-extensions-container";
    extDiv.className = "space-y-4 mb-4"; // Place at top of home tab with bottom margin

    // Insert as the very first child of the Home Tab for strategic visibility
    homeTab.insertBefore(extDiv, homeTab.firstChild);
  }

  static setupListeners(appInstance) {
    // Dynamic binding of quick purchase buttons inside the Carousel
    const extContainer = document.getElementById("home-extensions-container");
    if (!extContainer) return;

    extContainer.addEventListener("click", (e) => {
      const buyBtn = e.target.closest(".carousel-buy-btn");
      if (buyBtn) {
        e.stopPropagation();
        const lotId = buyBtn.getAttribute("data-id");
        if (lotId) {
          appInstance.purchaseTicket(lotId);
        }
      }

      const card = e.target.closest(".carousel-card-item");
      if (card && !e.target.closest(".carousel-buy-btn")) {
        const lotId = card.getAttribute("data-id");
        if (lotId) {
          appInstance.openLotteryDetailsPop(lotId);
        }
      }
    });
  }

  static render(appInstance) {
    this.injectHTMLPlaceholder();

    const extDiv = document.getElementById("home-extensions-container");
    if (!extDiv) return;

    // Find hot/trending pools (progress >= 70% or sold/total ratio is high, and not fully completed)
    const activeLotteries = appInstance.db.lotteries || [];
    const trendingPools = activeLotteries
      .map(lot => {
        const sold = lot.soldTickets || 0;
        const total = lot.totalTickets || 100;
        const progress = Math.round((sold / total) * 100);
        const left = total - sold;
        return { ...lot, progress, left };
      })
      .filter(lot => lot.left > 0) // Only active/not fully sold out
      .sort((a, b) => b.progress - a.progress); // Highest progress first

    // Select top 4 fastest-filling pools to show in carousel
    const hotPools = trendingPools.slice(0, 4);

    if (hotPools.length === 0) {
      // If no active fast pools, hide the container cleanly
      extDiv.innerHTML = "";
      extDiv.classList.add("hidden");
      return;
    }

    extDiv.classList.remove("hidden");

    let cardsHTML = "";
    hotPools.forEach((lot, index) => {
      const urgencyClass = lot.left <= 10 ? "text-red-400 font-black animate-pulse" : "text-amber-400 font-extrabold";
      const urgencyBadge = lot.left <= 5 ? "🔥 CRITICAL" : "⚡ FAST FILLING";

      cardsHTML += `
        <!-- Carousel Item -->
        <div class="carousel-card-item min-w-[280px] md:min-w-[310px] bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 border border-slate-800 hover:border-red-500/30 rounded-3xl p-4.5 relative overflow-hidden transition-all duration-300 cursor-pointer snap-start flex-shrink-0 shadow-lg" data-id="${lot.id}">
          
          <!-- Urgent Badge -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5">
            <span class="bg-red-950/80 border border-red-900/60 text-red-400 font-mono text-[8.5px] font-black px-2 py-0.5 rounded-full tracking-wider">
              ${urgencyBadge}
            </span>
          </div>

          <div class="space-y-3">
            <!-- Lottery Category / Title -->
            <div class="space-y-0.5 max-w-[180px]">
              <span class="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider block">${lot.category || "Main Draw"}</span>
              <h4 class="text-xs font-black text-white leading-tight truncate">${lot.name}</h4>
            </div>

            <!-- Urgent stats indicator -->
            <div class="flex items-center justify-between text-[11px] font-mono">
              <div class="space-y-0.5">
                <span class="text-[8.5px] text-slate-500 block">Remaining Slots</span>
                <span class="${urgencyClass} text-xs">Only ${lot.left} left!</span>
              </div>
              <div class="text-right space-y-0.5">
                <span class="text-[8.5px] text-slate-500 block">Ticket Rate</span>
                <span class="text-white font-extrabold text-xs">৳${lot.ticketPrice || 10}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                <span>Sold out velocity</span>
                <span class="text-red-400">${lot.progress}% Filled</span>
              </div>
              <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                <div class="bg-gradient-to-r from-amber-500 via-red-500 to-rose-600 h-full rounded-full transition-all duration-1000" style="width: ${lot.progress}%"></div>
              </div>
            </div>

            <!-- Buy Action -->
            <div class="pt-1 flex items-center justify-between gap-3">
              <span class="text-[8.5px] text-slate-500 font-mono italic">Tap card for specs</span>
              <button class="carousel-buy-btn bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[10px] uppercase py-1.5 px-4 rounded-xl cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-95 flex items-center gap-1 shadow-lg shadow-red-600/15 border border-red-500/20" data-id="${lot.id}">
                <i class="fa-solid fa-fire"></i> Book Slot
              </button>
            </div>
          </div>
        </div>
      `;
    });

    extDiv.innerHTML = `
      <!-- CAROUSEL MODULE HEADER -->
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <h3 class="text-[10.5px] font-black uppercase text-white tracking-widest font-mono flex items-center gap-1">
            🔥 TRENDING POOLS (দ্রুত পূর্ণ হওয়া ড্র)
          </h3>
        </div>
        <span class="text-[9px] text-slate-500 font-mono uppercase">Filling Fast</span>
      </div>

      <!-- HORIZONTAL SCROLL CAROUSEL STAGE -->
      <div class="flex items-center gap-3.5 overflow-x-auto pb-3.5 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4">
        ${cardsHTML}
      </div>
    `;
  }
}
