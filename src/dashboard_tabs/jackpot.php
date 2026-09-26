<!-- ================= TAB: MEGA PROGRESSIVE JACKPOT SYSTEM ================= -->
<div id="tab-jackpot" class="hidden space-y-6">
  
  <!-- Header Bar -->
  <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-900">
    <div class="flex items-center gap-3">
      <button class="tab-selector-btn w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer active:scale-95" data-tab="home">
        <i class="fa-solid fa-arrow-left text-xs"></i>
      </button>
      <div>
        <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-crown text-amber-400"></i> Mega Jackpot Arena
        </h2>
        <p class="text-[9px] text-slate-500 font-mono">Real-time progressive multiplier lottery pools</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>LIVE POOL</span>
      </span>
    </div>
  </div>

  <!-- User Stats & Win Probability Summary -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
    <div class="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl text-center relative overflow-hidden">
      <span class="text-[8.5px] uppercase font-bold text-slate-500 block mb-1">Your Total Entries</span>
      <span id="tab-jackpot-user-tickets-count" class="text-lg font-black text-purple-400 block">0 Tickets</span>
    </div>
    <div class="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl text-center relative overflow-hidden">
      <span class="text-[8.5px] uppercase font-bold text-slate-500 block mb-1">Your Win Odds</span>
      <span id="tab-jackpot-user-odds" class="text-lg font-black text-cyan-400 block">0.00%</span>
    </div>
    <div class="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl text-center relative overflow-hidden">
      <span class="text-[8.5px] uppercase font-bold text-slate-500 block mb-1">Active Pool Size</span>
      <span id="tab-jackpot-total-pool-stat" class="text-lg font-black text-amber-400 block">৳84,250</span>
    </div>
    <div class="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl text-center relative overflow-hidden">
      <span class="text-[8.5px] uppercase font-bold text-slate-500 block mb-1">VIP Discount</span>
      <span id="tab-jackpot-user-vip-discount" class="text-lg font-black text-emerald-400 block">0% OFF</span>
    </div>
  </div>

  <!-- Main Progressive Jackpot Spotlight Card -->
  <div class="bg-gradient-to-r from-purple-955 via-indigo-950 to-slate-950 border border-purple-500/40 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl font-mono text-center space-y-4">
    <!-- Glow effects -->
    <div class="absolute -right-20 -top-20 w-52 h-52 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none"></div>
    <div class="absolute -left-20 -bottom-20 w-52 h-52 bg-amber-500/15 rounded-full blur-[60px] pointer-events-none"></div>

    <div class="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-500/30 px-3.5 py-1 rounded-full text-purple-300 text-[10px] font-bold">
      <i class="fa-solid fa-gem text-amber-400 animate-bounce"></i>
      <span>MEGA GRAND PROGRESSIVE POOL</span>
    </div>

    <div>
      <span id="tab-jackpot-pool-amount" class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 block tracking-tight scale-y-105 my-2 drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]">
        ৳84,250.00
      </span>
      <p class="text-[10px] text-slate-400 max-w-sm mx-auto">100% of all ticket purchases are continuously added live directly into this mega jackpot prize fund!</p>
    </div>

    <!-- Countdown Timer -->
    <div class="inline-flex items-center gap-2.5 text-xs bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-slate-300">
      <i class="fa-solid fa-hourglass-half text-amber-400 animate-spin"></i>
      <span>Next Draw Countdown:</span>
      <span id="tab-jackpot-countdown" class="text-amber-400 font-extrabold bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/40">02h : 45m : 12s</span>
    </div>

    <!-- Interactive Ticket Purchase Box -->
    <div class="mt-6 max-w-md mx-auto bg-slate-950/90 border border-slate-850 p-5 rounded-3xl space-y-4 text-left shadow-2xl">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400 font-bold flex items-center gap-1.5">
          <i class="fa-solid fa-ticket text-purple-400"></i> Select Ticket Quantity:
        </span>
        <span class="text-white font-extrabold font-mono text-sm" id="jackpot-bulk-cost">৳20.00</span>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="grid grid-cols-5 gap-1.5">
        <button type="button" class="jp-qty-btn bg-purple-950/40 border border-purple-500/40 text-white rounded-xl py-2 font-bold hover:bg-purple-900/40 text-xs active:scale-95 transition cursor-pointer" data-qty="1">1x</button>
        <button type="button" class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-xl py-2 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer" data-qty="5">5x</button>
        <button type="button" class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-xl py-2 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer" data-qty="10">10x</button>
        <button type="button" class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-xl py-2 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer" data-qty="20">20x</button>
        <button type="button" class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-xl py-2 font-bold hover:bg-slate-850 text-xs active:scale-95 transition cursor-pointer" data-qty="50">50x</button>
      </div>

      <!-- Custom Input quantity row -->
      <div class="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
        <span class="text-[10px] text-slate-500 font-bold uppercase pl-2">Custom Qty:</span>
        <input type="number" id="jackpot-custom-qty-input" min="1" max="1000" value="1" class="w-full bg-transparent text-white font-bold text-xs font-mono outline-none px-2 py-1" placeholder="Enter amount..." />
        <button type="button" id="jackpot-qty-plus-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer">+</button>
      </div>

      <input type="hidden" id="jackpot-selected-qty" value="1" />

      <!-- Submit Buy Button -->
      <button id="tab-buy-jackpot-btn" class="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:brightness-110 py-3 rounded-2xl text-xs text-white font-black shadow-xl hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-purple-400/30 flex items-center justify-center gap-2 uppercase tracking-wider font-mono">
        <i class="fa-solid fa-cart-shopping text-sm"></i> BUY JACKPOT ENTRIES NOW
      </button>

      <div class="flex items-center justify-between text-[10px] text-purple-400 font-bold px-1" id="tab-jackpot-user-entries">
        <span>Your Active Entries: 0 tickets</span>
        <span class="text-slate-500 font-normal">Standard Ticket: <strong id="tab-jackpot-ticket-price-info" class="text-purple-300">৳20.00</strong></span>
      </div>
    </div>
  </div>

  <!-- Multi-Tier Jackpots (Daily Super & Mini Jackpot Cards) -->
  <div class="space-y-3">
    <h3 class="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 font-mono">
      <i class="fa-solid fa-layer-group text-amber-400"></i> Active Jackpot Tiers
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
      
      <!-- Daily Super Jackpot Card -->
      <div class="bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-3 relative overflow-hidden hover:border-slate-800 transition">
        <div class="flex items-center justify-between">
          <span class="text-[9px] uppercase font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full flex items-center gap-1">
            <i class="fa-solid fa-bolt text-amber-400"></i> DAILY SUPER POOL
          </span>
          <span class="text-[9px] text-slate-500">Draws Every 24 Hours</span>
        </div>

        <div>
          <span class="text-2xl font-black text-white block">৳25,000.00</span>
          <span class="text-[9.5px] text-slate-400 block mt-0.5">Ticket Price: <strong class="text-amber-400">৳10.00</strong> per entry</span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px]">
          <span class="text-slate-500">Draw In: <strong class="text-slate-300" id="daily-jackpot-timer">18h : 12m : 05s</strong></span>
          <button type="button" class="tab-selector-btn text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition active:scale-95" data-tab="jackpot">
            Participate
          </button>
        </div>
      </div>

      <!-- Hourly Mini Jackpot Card -->
      <div class="bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-3 relative overflow-hidden hover:border-slate-800 transition">
        <div class="flex items-center justify-between">
          <span class="text-[9px] uppercase font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full flex items-center gap-1">
            <i class="fa-solid fa-clock text-cyan-400"></i> HOURLY MINI POOL
          </span>
          <span class="text-[9px] text-slate-500">Draws Every Hour</span>
        </div>

        <div>
          <span class="text-2xl font-black text-white block">৳5,000.00</span>
          <span class="text-[9.5px] text-slate-400 block mt-0.5">Ticket Price: <strong class="text-cyan-400">৳5.00</strong> per entry</span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px]">
          <span class="text-slate-500">Draw In: <strong class="text-slate-300" id="mini-jackpot-timer">00h : 38m : 14s</strong></span>
          <button type="button" class="tab-selector-btn text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition active:scale-95" data-tab="jackpot">
            Participate
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Recent Jackpot Winners Hall of Fame -->
  <div class="bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4 font-mono">
    <div class="flex items-center justify-between border-b border-slate-850 pb-3">
      <h3 class="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
        <i class="fa-solid fa-trophy text-amber-400"></i> Jackpot Hall of Fame
      </h3>
      <span class="text-[9px] text-slate-500">Latest Mega Draw Winners</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="jackpot-hall-of-fame-grid">
      <!-- Dynamically populated or static fallback list -->
      <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
          👑
        </div>
        <div>
          <strong class="text-white text-xs block">@Karim_Boss</strong>
          <span class="text-[9px] text-emerald-400 font-bold block">Won ৳84,250.00</span>
          <span class="text-[8px] text-slate-500 block">Mega Jackpot • Yesterday</span>
        </div>
      </div>

      <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 text-white flex items-center justify-center font-black text-sm shrink-0">
          💎
        </div>
        <div>
          <strong class="text-white text-xs block">@Pro_Gamer_BD</strong>
          <span class="text-[9px] text-emerald-400 font-bold block">Won ৳25,000.00</span>
          <span class="text-[8px] text-slate-500 block">Daily Super Pool • 2 days ago</span>
        </div>
      </div>

      <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
          ⚡
        </div>
        <div>
          <strong class="text-white text-xs block">@LuckyRider777</strong>
          <span class="text-[9px] text-emerald-400 font-bold block">Won ৳5,000.00</span>
          <span class="text-[8px] text-slate-500 block">Hourly Mini Pool • 3 hours ago</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Live Registrations Stream -->
  <div class="bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4 font-mono">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-850 pb-3">
      <h3 class="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
        <i class="fa-solid fa-list-check text-purple-400"></i> Active Ticket Registrations
      </h3>
      <span class="text-slate-500 text-[9px]" id="jackpot-active-counter">0 total purchased</span>
    </div>

    <div class="overflow-x-auto text-[10px]">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-850 pb-2 text-slate-500 text-[9px] uppercase font-bold tracking-wider">
            <th class="py-2">Player</th>
            <th class="py-2 text-center">Tickets</th>
            <th class="py-2 text-center">Total Paid</th>
            <th class="py-2 text-right">Date Time</th>
          </tr>
        </thead>
        <tbody id="jackpot-registrations-tbody" class="divide-y divide-slate-850/40 text-[11px]">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
  </div>

  <!-- How Jackpot Works Info Box -->
  <div class="bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-3 font-mono">
    <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
      <i class="fa-solid fa-shield-halved text-emerald-400"></i> Fair Play & Automated Draw Rules
    </h4>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-slate-400 leading-relaxed">
      <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-850 space-y-1">
        <strong class="text-white block font-bold">1. 100% Prize Pool Addition</strong>
        <p>Every single ticket purchased instantly adds 100% of its value directly to the progressive jackpot prize pool.</p>
      </div>
      <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-850 space-y-1">
        <strong class="text-white block font-bold">2. Weighted Probability</strong>
        <p>Buying more ticket entries directly multiplies your odds of winning the random selection when the draw timer reaches zero.</p>
      </div>
      <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-850 space-y-1">
        <strong class="text-white block font-bold">3. Instant Wallet Credit</strong>
        <p>The system automatically awards the full jackpot pool to the winning player's wallet balance instantly upon draw.</p>
      </div>
    </div>
  </div>

</div>
