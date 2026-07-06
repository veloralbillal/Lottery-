<!-- ================= TAB: HOME (LOTTERY POOLS LIST) ================= -->
<div id="tab-home" class="space-y-4">
  <!-- Live Platform Activity & Winners Ticker -->
  <div id="live-activity-ticker-container" class="bg-slate-950/80 border border-slate-900 rounded-2xl py-2 px-3.5 flex items-center gap-2.5 overflow-hidden shadow-lg backdrop-blur-md select-none font-mono text-[9px] mb-1">
    <div class="flex items-center gap-1.5 shrink-0 bg-red-950/40 border border-red-900/30 text-red-400 px-2 py-0.5 rounded-lg font-black tracking-widest text-[8px] uppercase">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Updates
    </div>
    <div class="relative w-full overflow-hidden h-3.5">
      <div id="live-activity-ticker-track" class="absolute inset-0 flex items-center gap-6 whitespace-nowrap transition-transform duration-500 ease-out">
        <span class="text-slate-400">Loading live updates stream...</span>
      </div>
    </div>
  </div>

  <!-- Dynamic Banner Slider (Controlled via Admin panel Event tab) -->
  <div id="home-banner-slider-wrapper" class="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 mb-3 group/slider h-32 hidden">
    <div id="home-banner-slider-track" class="flex transition-transform duration-500 ease-out h-full">
      <!-- Banners rendered dynamically here -->
    </div>
    <!-- Bullet navigation dots -->
    <div id="home-banner-slider-dots" class="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
      <!-- Dots rendered dynamically here -->
    </div>
    <!-- Navigation arrows -->
    <button id="slider-prev-btn" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover/slider:opacity-100 transition duration-300 z-20 cursor-pointer">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <button id="slider-next-btn" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover/slider:opacity-100 transition duration-300 z-20 cursor-pointer">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </div>

  <!-- Notification & Vibration Permission request alert banner card -->
  <div id="notif-permission-banner" class="hidden bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-900/30 p-4 rounded-3xl relative overflow-hidden shadow-lg mb-2 flex items-center justify-between gap-3 font-mono">
    <div class="space-y-1">
      <span class="text-[9px] uppercase font-bold text-cyan-400 tracking-widest block flex items-center gap-1">
        <i class="fa-solid fa-bell animate-bounce text-cyan-400"></i> ALERT MANAGER
      </span>
      <h3 class="text-xs font-bold text-white">Enable Draw Alerts & Vibrations</h3>
      <p class="text-[10px] text-slate-300 leading-normal max-w-[210px]">Get notified and vibrate exactly 5 minutes before your ticket draws start!</p>
    </div>
    <button id="enable-notif-btn" class="shrink-0 bg-gradient-to-r from-cyan-500 to-rose-600 hover:scale-103 text-white text-[10px] font-black py-2.5 px-3.5 rounded-xl shadow-lg transition active:opacity-90">
      Enable Alerts
    </button>
  </div>

  <!-- Decorative promotional hero slider -->
  <div class="interactive-tilt-card holo-glass-gradient border border-red-900/20 p-5 rounded-3xl relative overflow-hidden shadow-lg mb-2 flex items-center justify-between">
    <div class="space-y-1 z-10">
      <span class="text-[9px] uppercase font-bold text-red-500 tracking-widest font-mono block">EASY PAYOUT</span>
      <h2 class="text-base font-black text-white font-display">Fast Taka Cashout</h2>
      <p class="text-[10px] text-slate-400 leading-normal max-w-[210px]">Instant approval on bKash / Nagad / Rocket and Crypto USDT withdrawals.</p>
    </div>
    <!-- Dynamic graphical card badge vector icon -->
    <div class="text-red-500/15 text-5xl mr-2 absolute right-4 bottom-4 pointer-events-none">
      <i class="fa-solid fa-bolt-lightning"></i>
    </div>
  </div>

  <!-- Interactive Premium High-Yield Feature Tiles -->
  <div class="grid grid-cols-4 gap-1.5 my-3">
    <!-- VIP Lounge Button -->
    <button id="home-vip-upgrade-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-amber-955/20 to-slate-900/90 border border-amber-900/15 p-1.5 rounded-xl hover:bg-slate-850 cursor-pointer text-center group transition active:scale-95 shadow-md">
      <div class="w-7 h-7 rounded-full bg-amber-950/40 border border-amber-800/20 flex items-center justify-center mb-1 group-hover:scale-115 transition">
        <i class="fa-solid fa-crown text-amber-400 text-[10px] animate-bounce"></i>
      </div>
      <span class="text-[9px] font-bold text-white block truncate">VIP Lounge</span>
      <span class="text-[6.5px] text-amber-500 font-mono mt-0.5">Perks</span>
    </button>
    <!-- Lucky Spin Wheel Button -->
    <button id="home-lucky-spin-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-cyan-955/20 to-slate-900/90 border border-cyan-900/15 p-1.5 rounded-xl hover:bg-slate-850 cursor-pointer text-center group transition active:scale-95 shadow-md">
      <div class="w-7 h-7 rounded-full bg-cyan-950/40 border border-cyan-800/15 flex items-center justify-center mb-1 group-hover:scale-115 transition">
        <i class="fa-solid fa-circle-notch text-cyan-400 text-[10px] animate-spin"></i>
      </div>
      <span class="text-[9px] font-bold text-white block truncate">Lucky Wheel</span>
      <span class="text-[6.5px] text-cyan-500 font-mono mt-0.5">Free Spin</span>
    </button>
    <!-- Daily Rewards / Check-in -->
    <button id="home-checkin-bonus-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-emerald-955/20 to-slate-900/90 border border-emerald-900/15 p-1.5 rounded-xl hover:bg-slate-850 cursor-pointer text-center group transition active:scale-95 shadow-md">
      <div class="w-7 h-7 rounded-full bg-emerald-950/40 border border-emerald-800/15 flex items-center justify-center mb-1 group-hover:scale-115 transition">
        <i class="fa-solid fa-calendar-check text-emerald-400 text-[10px]"></i>
      </div>
      <span class="text-[9px] font-bold text-white block truncate">Daily Check</span>
      <span id="home-checkin-status-label" class="text-[6.5px] text-emerald-500 font-mono mt-0.5">Claim</span>
    </button>
    <!-- Daily Bounty Tasks -->
    <button id="home-daily-tasks-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-purple-955/20 to-slate-900/90 border border-purple-900/15 p-1.5 rounded-xl hover:bg-slate-850 cursor-pointer text-center group transition active:scale-95 shadow-md">
      <div class="w-7 h-7 rounded-full bg-purple-950/40 border border-purple-800/15 flex items-center justify-center mb-1 group-hover:scale-115 transition">
        <i class="fa-solid fa-tasks text-purple-400 text-[10px]"></i>
      </div>
      <span class="text-[9px] font-bold text-white block truncate">Daily Task</span>
      <span class="text-[6.5px] text-purple-500 font-mono mt-0.5">Earn Taka</span>
    </button>
  </div>

  <!-- Progressive Jackpot Banner Card -->
  <div class="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-800/40 p-4 rounded-3xl relative overflow-hidden shadow-2xl mb-3 font-mono">
    <!-- Atmospheric background glows -->
    <div class="absolute -right-16 -top-16 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>

    <div class="flex items-center justify-between z-10 relative">
      <div class="space-y-1.5">
        <span class="text-[8px] uppercase font-black text-purple-400 tracking-widest flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
          MEGA PROGRESSIVE JACKPOT POOL
        </span>
        <span id="jackpot-pool-amount" class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-250 block scale-y-105 tracking-tight">৳84,250.00</span>
        <div class="flex items-center gap-1.5 text-[8.5px] text-slate-400">
          <span>Draw Countdown:</span>
          <span id="jackpot-countdown" class="text-purple-300 font-bold bg-purple-950/40 border border-purple-900/30 px-1.5 py-0.5 rounded">02h : 45m : 12s</span>
        </div>
      </div>
      <button id="buy-jackpot-ticket-btn" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2 px-3 rounded-2xl text-[10px] text-white font-extrabold flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer border border-purple-400/20">
        <span>Buy Ticket</span>
        <span id="home-jackpot-ticket-price" class="text-[7.5px] text-purple-200 mt-0.5 font-normal">৳20.00</span>
      </button>
    </div>
    
    <div class="flex justify-between items-center text-[7px] text-slate-500 pr-1 pt-2 mt-2 border-t border-purple-900/30">
      <span>* 1% of all active ticket registrations automatically upgrades this pool!</span>
      <span class="text-purple-400 font-extrabold" id="jackpot-tickets-count">Your Entries: 0 tickets</span>
    </div>
  </div>

  <!-- Horizontal Category Tabs for Filters -->
  <div class="space-y-1.5 mt-2">
    <span class="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-widest block">Select Category</span>
    <div id="home-category-tabs" class="flex items-center gap-2 overflow-x-auto py-1 pb-2.5 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-800">
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md" data-category="all">
        🎯 All Pools
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md" data-category="10 Taka Banner">
        🎟️ ৳10 Sliders
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md" data-category="20 Taka Banner">
        🎟️ ৳20 Sliders
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md" data-category="Mega Jackpot">
        💎 Jackpots
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-900/30 bg-slate-900 text-emerald-400 hover:text-emerald-300 transition active:scale-95 cursor-pointer shadow-md" data-category="3 Winner Category">
        👑 3 Winners Category
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-rose-900/30 bg-slate-900 text-rose-400 hover:text-rose-300 transition active:scale-95 cursor-pointer shadow-md" data-category="15 Winner Category">
        🚀 15 Winners Category
      </button>
    </div>
  </div>

  <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">Active Lottery Draw Pools</h2>
  
  <!-- Container for injected pools cards -->
  <div id="pools-list-container" class="space-y-4"></div>
</div>
