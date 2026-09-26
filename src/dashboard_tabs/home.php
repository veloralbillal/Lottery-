<!-- ================= TAB: HOME (LOTTERY POOLS LIST) ================= -->
<div id="tab-home" class="space-y-4">
  <!-- Live Platform Activity & Winners Ticker -->
  <div id="live-activity-ticker-container" class="bg-gradient-to-r from-[#111628]/95 via-[#0b0e1d]/95 to-[#15122a]/95 border border-amber-500/35 rounded-2xl py-2 px-3.5 flex items-center gap-2.5 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-md select-none font-mono text-[9px] mb-2">
    <div class="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-red-600/25 to-rose-600/35 border border-red-500/60 text-red-300 px-2.5 py-1 rounded-full font-black tracking-widest text-[8px] uppercase shadow-[0_0_10px_rgba(239,68,68,0.4)]">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]"></span> LIVE UPDATES
    </div>
    <div class="relative w-full overflow-hidden h-4">
      <div id="live-activity-ticker-track" class="absolute inset-0 flex items-center gap-6 whitespace-nowrap transition-transform duration-500 ease-out text-slate-300">
        <span class="inline-flex items-center gap-1.5 text-[9.5px] font-mono text-slate-300">
          <i class="fa-solid fa-trophy text-amber-400 animate-pulse text-[8.5px]"></i>
          <span class="text-amber-300 font-bold">@arif_99</span> won <strong class="text-emerald-400 font-black">৳25,000</strong> from Mega Jackpot Pool! 🏆
        </span>
        <span class="inline-flex items-center gap-1.5 text-[9.5px] font-mono text-slate-300">
          <i class="fa-solid fa-bolt text-amber-400 animate-pulse text-[8.5px]"></i>
          <span class="text-amber-300 font-bold">@tamim</span> won <strong class="text-emerald-400 font-black">৳500</strong> from Lucky Spin! 🎡
        </span>
      </div>
    </div>
  </div>

  <!-- Dynamic Banner Slider (Controlled via Admin panel Event tab) -->
  <div id="home-banner-slider-wrapper" class="lottery-ticket-card relative w-full rounded-3xl overflow-hidden shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(251,191,36,0.18)] border border-amber-500/35 bg-gradient-to-br from-[#12162c] via-[#090c1a] to-[#18112e] mb-3 group/slider h-38 sm:h-44 hidden">
    <!-- Ticket Notches -->
    <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
    <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>

    <div id="home-banner-slider-track" class="flex transition-transform duration-500 ease-out h-full">
      <!-- Banners rendered dynamically here -->
    </div>
    <!-- Bullet navigation dots -->
    <div id="home-banner-slider-dots" class="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
      <!-- Dots rendered dynamically here -->
    </div>
    <!-- Navigation arrows -->
    <button id="slider-prev-btn" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/35 text-amber-300 hover:text-white hover:border-amber-400 hover:scale-110 flex items-center justify-center text-xs opacity-0 group-hover/slider:opacity-100 transition duration-300 z-20 cursor-pointer shadow-lg active:scale-95">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <button id="slider-next-btn" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/35 text-amber-300 hover:text-white hover:border-amber-400 hover:scale-110 flex items-center justify-center text-xs opacity-0 group-hover/slider:opacity-100 transition duration-300 z-20 cursor-pointer shadow-lg active:scale-95">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </div>

  <!-- Notification & Vibration Permission request alert banner card -->
  <div id="notif-permission-banner" class="hidden bg-gradient-to-r from-[#12192e] to-slate-950 border border-cyan-500/30 p-4 rounded-3xl relative overflow-hidden shadow-lg mb-2 flex items-center justify-between gap-3 font-mono">
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

  <!-- Decorative promotional hero slider: Fast Taka Cashout (Enhanced in Image 2 Luxury Lottery Aesthetic) -->
  <div class="lottery-ticket-card rounded-3xl p-4 sm:p-5 relative overflow-hidden mb-3 border border-amber-500/30 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.7),0_0_20px_-5px_rgba(251,191,36,0.15)] bg-gradient-to-r from-[#12162a] via-[#0b0e1e] to-[#17132a]">
    <!-- Ambient glowing lights -->
    <div class="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
    <div class="absolute -left-8 -bottom-8 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

    <div class="flex items-center justify-between gap-3 relative z-10">
      <div class="space-y-1.5 flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1 text-[8.5px] uppercase font-mono font-black tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/35 px-2.5 py-0.5 rounded-full shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            ⚡ INSTANT CASHOUT
          </span>
          <span class="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            ০% ফি (Free)
          </span>
        </div>
        <h2 class="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
          <span>Fast Taka Cashout</span>
          <span class="text-amber-400 text-xs">⚡</span>
        </h2>
        <p class="text-[11px] text-slate-300/90 leading-relaxed font-sans">
          Instant approval on <strong class="text-pink-400 font-bold">bKash</strong>, <strong class="text-orange-400 font-bold">Nagad</strong>, <strong class="text-purple-400 font-bold">Rocket</strong> and <strong class="text-emerald-400 font-bold">Crypto USDT</strong> withdrawals.
        </p>
      </div>

      <!-- 3D Glowing Lightning Emblem -->
      <div class="shrink-0 flex items-center justify-center">
        <div class="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500/25 via-yellow-500/10 to-amber-900/40 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)] relative group cursor-pointer hover:scale-105 transition-transform duration-300">
          <div class="absolute inset-0 rounded-2xl bg-amber-400/10 animate-ping opacity-30 pointer-events-none"></div>
          <i class="fa-solid fa-bolt text-2xl text-transparent bg-clip-text bg-gradient-to-t from-amber-400 via-yellow-200 to-white drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Premium High-Yield Feature Tiles (8 Modules in 2 Rows with 3D Medallions) -->
  <div class="grid grid-cols-4 gap-2 my-3">
    <!-- VIP Lounge Button -->
    <button id="home-vip-upgrade-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-amber-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(245,158,11,0.45)] border border-yellow-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-crown text-[11px]"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-amber-300 transition">VIP Lounge</span>
      <span class="text-[7px] text-amber-400 font-mono font-bold mt-0.5 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/20">Perks</span>
    </button>

    <!-- Lucky Spin Wheel Button -->
    <button id="home-lucky-spin-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-cyan-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-teal-300 text-slate-950 flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(6,182,212,0.45)] border border-cyan-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-circle-notch text-[11px] animate-spin"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-cyan-300 transition">Lucky Wheel</span>
      <span class="text-[7px] text-cyan-400 font-mono font-bold mt-0.5 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">Free Spin</span>
    </button>

    <!-- Daily Rewards / Check-in -->
    <button id="home-checkin-bonus-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-emerald-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 text-emerald-950 flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(16,185,129,0.45)] border border-emerald-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-calendar-check text-[11px]"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-emerald-300 transition">Daily Check</span>
      <span id="home-checkin-status-label" class="text-[7px] text-emerald-400 font-mono font-bold mt-0.5 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">Claim</span>
    </button>

    <!-- Daily Bounty Tasks -->
    <button id="home-daily-tasks-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-purple-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-violet-300 text-white flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(168,85,247,0.45)] border border-purple-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-list-check text-[11px]"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-purple-300 transition">Daily Task</span>
      <span class="text-[7px] text-purple-400 font-mono font-bold mt-0.5 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/20">Earn Taka</span>
    </button>
  </div>

  <!-- Sub-Feature Games Grid (4 Options - Row 2) -->
  <div class="grid grid-cols-4 gap-2 mb-3">
    <!-- Game Hub Button -->
    <button id="home-games-hub-sub-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-indigo-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 text-white flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(99,102,241,0.45)] border border-indigo-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-gamepad text-[11px]"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-pink-300 transition">Game Hub</span>
      <span class="text-[7px] text-pink-400 font-mono font-bold mt-0.5 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-500/20">Play & Win</span>
    </button>

    <!-- Group Lottery Button -->
    <button id="home-group-lottery-sub-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800/90 hover:border-teal-500/40 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-300 text-slate-950 flex items-center justify-center mb-1.5 shadow-[0_3px_10px_rgba(20,184,166,0.45)] border border-teal-200/60 group-hover:scale-110 transition duration-200">
        <i class="fa-solid fa-users text-[11px]"></i>
      </div>
      <span class="text-[9.5px] font-black text-white block truncate group-hover:text-teal-300 transition">Group Lottery</span>
      <span class="text-[7px] text-teal-400 font-mono font-bold mt-0.5 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-500/20">Split Cost</span>
    </button>

    <!-- Coming Soon 1 -->
    <button id="home-coming-soon-1-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#0e1220] to-[#080a14] border border-slate-800/60 p-2 sm:p-2.5 rounded-2xl opacity-60 text-center group transition active:scale-95 shadow-md">
      <div class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400 flex items-center justify-center mb-1.5">
        <i class="fa-solid fa-gift text-[10px]"></i>
      </div>
      <span class="text-[9.5px] font-bold text-slate-400 block truncate">Lucky Box</span>
      <span class="text-[7px] text-slate-500 font-mono mt-0.5">Locked</span>
    </button>

    <!-- Coming Soon 2 -->
    <button id="home-coming-soon-2-btn" class="flex flex-col items-center justify-center bg-gradient-to-b from-[#0e1220] to-[#080a14] border border-slate-800/60 p-2 sm:p-2.5 rounded-2xl opacity-60 text-center group transition active:scale-95 shadow-md">
      <div class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400 flex items-center justify-center mb-1.5">
        <i class="fa-solid fa-dice text-[10px]"></i>
      </div>
      <span class="text-[9.5px] font-bold text-slate-400 block truncate">Live Poker</span>
      <span class="text-[7px] text-slate-500 font-mono mt-0.5">Locked</span>
    </button>
  </div>

  <!-- Progressive Jackpot Banner Card (Enhanced in Image 2 Luxury Lottery Aesthetic) -->
  <div class="lottery-ticket-card rounded-3xl p-4 sm:p-5 relative overflow-hidden mb-3 border border-amber-500/35 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(251,191,36,0.18)] bg-gradient-to-br from-[#12162c] via-[#090c1a] to-[#18112e]">
    <!-- Ambient atmospheric glows -->
    <div class="absolute -right-16 -top-16 w-36 h-36 bg-amber-500/15 rounded-full blur-[45px] pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-36 h-36 bg-purple-500/15 rounded-full blur-[45px] pointer-events-none"></div>

    <!-- Ticket Perforation Notches on Sides -->
    <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
    <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>

    <div class="flex items-center justify-between z-10 relative gap-3">
      <div class="space-y-2 flex-1 min-w-0">
        <!-- Top Pill Badges -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[8.5px] uppercase font-mono font-black tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow">
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            👑 MEGA PROGRESSIVE JACKPOT
          </span>
          <span class="text-[8px] uppercase font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
            ⭐ LIVE GRAND PRIZE
          </span>
        </div>

        <!-- Big Bold Metallic Gold Amount -->
        <div>
          <span id="jackpot-pool-amount" class="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-mono tracking-tight block scale-y-105 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">৳84,250.00</span>
        </div>

        <!-- Countdown Timer Box -->
        <div class="flex items-center gap-2 text-[9.5px] font-mono text-slate-300 bg-slate-950/80 border border-amber-500/20 px-2.5 py-1 rounded-xl w-fit shadow-inner">
          <i class="fa-regular fa-clock text-cyan-300 text-[11px]"></i>
          <span class="text-slate-400">Draw Countdown:</span>
          <span id="jackpot-countdown" class="text-amber-300 font-black tracking-wide font-mono">02h : 45m : 12s</span>
        </div>
      </div>

      <!-- Golden Ticket Buy CTA Button (Matching Image 2 lottery-ticket-btn) -->
      <button id="buy-jackpot-ticket-btn" class="lottery-ticket-btn px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 cursor-pointer active:scale-95 shadow-lg shadow-amber-600/35 font-black border border-yellow-200/50 min-w-[105px]">
        <span class="flex items-center gap-1.5 text-xs text-white">
          <i class="fa-solid fa-ticket"></i> Buy Ticket
        </span>
        <span id="home-jackpot-ticket-price" class="text-[9px] text-amber-100 font-mono font-bold mt-0.5">৳20.00</span>
      </button>
    </div>
    
    <!-- Ticket Dashed Divider -->
    <div class="lottery-ticket-dashed my-2.5 opacity-60"></div>

    <!-- Bottom Info & Entries Summary -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[8px] font-mono text-slate-400 pt-0.5">
      <span class="flex items-center gap-1">
        <i class="fa-solid fa-sparkles text-amber-400"></i> * 1% of all active ticket registrations automatically upgrades this pool!
      </span>
      <span class="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black font-mono text-[8.5px] px-2.5 py-0.5 rounded-full" id="jackpot-tickets-count">
        Your Entries: 0 tickets
      </span>
    </div>
  </div>

  <!-- Horizontal Category Tabs for Filters (Enhanced in Image 2 Luxury Lottery Aesthetic) -->
  <div class="space-y-2 mt-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-1 h-3.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
        <span class="text-[9.5px] uppercase font-black text-amber-300/90 font-mono tracking-widest block">Select Category / বিভাগ সিলেক্ট করুন</span>
      </div>
      <span class="text-[8.5px] font-mono text-slate-400">Tap to filter</span>
    </div>

    <div id="home-category-tabs" class="flex items-center gap-2 overflow-x-auto py-1 pb-2.5 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-800">
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-yellow-200/50 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 shadow-lg shadow-amber-600/30 transition active:scale-95 cursor-pointer" data-category="all">
        🎯 All Pools
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-gradient-to-b from-[#131728] to-[#0c0f1c] text-slate-300 hover:text-white hover:border-amber-500/40 transition active:scale-95 cursor-pointer shadow-md" data-category="10 Taka Banner">
        🎟️ ৳10 Sliders
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-gradient-to-b from-[#131728] to-[#0c0f1c] text-slate-300 hover:text-white hover:border-amber-500/40 transition active:scale-95 cursor-pointer shadow-md" data-category="20 Taka Banner">
        🎟️ ৳20 Sliders
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-gradient-to-b from-[#131728] to-[#0c0f1c] text-slate-300 hover:text-white hover:border-amber-500/40 transition active:scale-95 cursor-pointer shadow-md" data-category="Mega Jackpot">
        💎 Jackpots
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-900/30 bg-gradient-to-b from-[#131728] to-[#0c0f1c] text-emerald-400 hover:text-emerald-300 transition active:scale-95 cursor-pointer shadow-md" data-category="3 Winner Category">
        👑 3 Winners Category
      </button>
      <button class="home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-rose-900/30 bg-gradient-to-b from-[#131728] to-[#0c0f1c] text-rose-400 hover:text-rose-300 transition active:scale-95 cursor-pointer shadow-md" data-category="15 Winner Category">
        🚀 15 Winners Category
      </button>
    </div>
  </div>

  <!-- Active Lottery Draw Pools Header -->
  <div class="flex items-center justify-between mb-2 mt-4">
    <div class="flex items-center gap-2">
      <span class="w-1 h-3.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
      <h2 class="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
        <span>Active Lottery Draw Pools</span>
        <span class="text-amber-400">🎟️</span>
      </h2>
    </div>
    <span class="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> লাইভ ড্র রানিং
    </span>
  </div>
  
  <!-- Container for injected pools cards -->
  <div id="pools-list-container" class="space-y-4"></div>
</div>

