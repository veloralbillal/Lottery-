<!-- ================= TAB: IN-APP REWARDS GAME HUB ================= -->
<div id="tab-games" class="hidden space-y-4">
  <!-- Game Hub Header -->
  <div class="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/5">
    <div class="flex items-center gap-3">
      <button class="tab-selector-btn w-8 h-8 rounded-full bg-slate-900 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:text-amber-300 transition cursor-pointer shadow-inner active:scale-95" data-tab="home">
        <i class="fa-solid fa-arrow-left text-xs"></i>
      </button>
      <div>
        <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-crown text-amber-400 animate-pulse"></i> VIP Casino Games Hub
        </h2>
        <p class="text-[8.5px] text-slate-400 font-mono">Instant Payout Live Mini-Games & Multiplier Arcade 🎰</p>
      </div>
    </div>
    <!-- Back to Game Menu Button -->
    <button id="games-back-to-lobby-btn" class="hidden text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md">
      <i class="fa-solid fa-gamepad text-amber-400"></i> Game Hub
    </button>
  </div>

  <!-- ================= SUB-TAB 0: LOBBY (Dashboard showing all games) ================= -->
  <div id="game-lobby-panel" class="space-y-4">
    <!-- Promotional Banner -->
    <div class="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border border-amber-500/30 p-4.5 rounded-3xl relative overflow-hidden shadow-xl shadow-amber-500/5">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex items-center justify-between">
        <div class="space-y-1 max-w-[240px]">
          <span class="text-[8px] bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">PROVEN FAIR & INSTANT PAYOUTS</span>
          <h2 class="text-sm font-black text-white tracking-tight">Select Game & Win Live Cash!</h2>
          <p class="text-[9.5px] text-slate-300 leading-normal font-sans">Multiply wallet rewards up to 100x with provably fair RNG algorithms and zero latency!</p>
        </div>
        <div class="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
          <i class="fa-solid fa-trophy"></i>
        </div>
      </div>
    </div>

    <!-- Games Bento Grid -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Coin Flip Game Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/20 hover:border-purple-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-purple-500/10 group" data-subtab="coinflip">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-coins text-purple-300 text-sm"></i>
            </div>
            <span class="text-[7px] bg-purple-500/15 border border-purple-500/30 text-purple-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">2x Instant</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-purple-300 transition">Coin Flip</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">Flip coin heads or tails for instant 2.0x win payouts!</p>
        </div>
        <span class="text-[9px] font-extrabold text-purple-400 font-mono mt-3 flex items-center gap-1 group-hover:text-purple-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- High-Low Card Game Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 hover:border-indigo-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-indigo-500/10 group" data-subtab="highlow">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-arrow-up-9-1 text-indigo-300 text-sm"></i>
            </div>
            <span class="text-[7px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">Multiplier</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-indigo-300 transition">High-Low Card</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">Predict if the next card drawn is higher or lower!</p>
        </div>
        <span class="text-[9px] font-extrabold text-indigo-400 font-mono mt-3 flex items-center gap-1 group-hover:text-indigo-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- Quick Draw Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/20 hover:border-rose-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-rose-500/10 group" data-subtab="quickdraw">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-bolt text-rose-300 text-sm animate-pulse"></i>
            </div>
            <span class="text-[7px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">60s Speed</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-rose-300 transition">Quick Draw</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">1-minute automatic draw pools with instant auto-payouts!</p>
        </div>
        <span class="text-[9px] font-extrabold text-rose-400 font-mono mt-3 flex items-center gap-1 group-hover:text-rose-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- Group Syndicate Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 hover:border-emerald-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-emerald-500/10 group" data-subtab="syndicate">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-users text-emerald-300 text-sm"></i>
            </div>
            <span class="text-[7px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">Pool Share</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-emerald-300 transition">Group Syndicate</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">Buy syndicate shares with friends & split jackpot prize pools!</p>
        </div>
        <span class="text-[9px] font-extrabold text-emerald-400 font-mono mt-3 flex items-center gap-1 group-hover:text-emerald-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- Mines Game Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/20 hover:border-rose-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-rose-500/10 group" data-subtab="mines">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-bomb text-rose-300 text-sm"></i>
            </div>
            <span class="text-[7px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">Hot 🔥</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-rose-300 transition">Mines Sweeper</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">Pick safe gems, boost multiplier, and cash out anytime!</p>
        </div>
        <span class="text-[9px] font-extrabold text-rose-400 font-mono mt-3 flex items-center gap-1 group-hover:text-rose-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- Dice Roll Game Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/20 hover:border-teal-400/50 rounded-2.5xl text-left transition duration-200 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-teal-500/10 group" data-subtab="dice">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-md">
              <i class="fa-solid fa-dice text-teal-300 text-sm"></i>
            </div>
            <span class="text-[7px] bg-teal-500/15 border border-teal-500/30 text-teal-300 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">Hot 🔥</span>
          </div>
          <h3 class="text-xs font-black text-white font-mono mt-1 group-hover:text-teal-300 transition">Dice Roll</h3>
          <p class="text-[8.5px] text-slate-400 leading-relaxed font-sans">Roll Under/Over custom targets for up to 95x return!</p>
        </div>
        <span class="text-[9px] font-extrabold text-teal-400 font-mono mt-3 flex items-center gap-1 group-hover:text-teal-200">Play Live <i class="fa-solid fa-chevron-right text-[7px] group-hover:translate-x-1 transition"></i></span>
      </button>

      <!-- Heading/Separator for Extra Premium Arcade -->
      <div class="col-span-2 pt-3 pb-1">
        <div class="flex items-center gap-2">
          <div class="h-[1px] bg-gradient-to-r from-purple-500/30 to-transparent flex-1"></div>
          <span class="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">🔥 Premium Live Arcade (New 10 Games)</span>
          <div class="h-[1px] bg-gradient-to-l from-purple-500/30 to-transparent flex-1"></div>
        </div>
      </div>

      <!-- 1. Rocket Fly (Crash) Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-purple-955/20 via-slate-900 to-slate-950 border border-purple-500/10 hover:border-purple-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="crash">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-rocket text-purple-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Crash x100</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Rocket Fly (Crash)</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Cash out your growing multiplier before the rocket explodes!</p>
        </div>
        <span class="text-[8.5px] font-bold text-purple-400 font-mono mt-3 flex items-center gap-1 group-hover:text-purple-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 2. Plinko Ball Drop Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-amber-955/20 via-slate-900 to-slate-950 border border-amber-500/10 hover:border-amber-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="plinko">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-circle-nodes text-amber-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Multi-Pockets</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Plinko Ball Drop</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Bounce balls through pins down to giant multiplier pockets!</p>
        </div>
        <span class="text-[8.5px] font-bold text-amber-400 font-mono mt-3 flex items-center gap-1 group-hover:text-amber-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 3. Football Shootout Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-955/20 via-slate-900 to-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="penalty">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-futbol text-emerald-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Vs Keeper</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Penalty Shootout</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Kick penalties, beat the goalie, and compile continuous wins!</p>
        </div>
        <span class="text-[8.5px] font-bold text-emerald-400 font-mono mt-3 flex items-center gap-1 group-hover:text-emerald-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 4. Tower Climb (Legend) Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-cyan-955/20 via-slate-900 to-slate-950 border border-cyan-500/10 hover:border-cyan-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="tower">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-chess-rook text-cyan-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Safe Path</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Tower Legend</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Climb tower levels row-by-row, avoiding tiles containing hidden traps!</p>
        </div>
        <span class="text-[8.5px] font-bold text-cyan-400 font-mono mt-3 flex items-center gap-1 group-hover:text-cyan-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 5. Wheel of Fortune Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-rose-955/20 via-slate-900 to-slate-950 border border-rose-500/10 hover:border-rose-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="wheel">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-spinner text-rose-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Spin Wheel</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Wheel of Fortune</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Select low or high risk segments, spin the neon wheel & win big!</p>
        </div>
        <span class="text-[8.5px] font-bold text-rose-400 font-mono mt-3 flex items-center gap-1 group-hover:text-rose-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 6. Super Match Keno Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-indigo-955/20 via-slate-900 to-slate-950 border border-indigo-500/10 hover:border-indigo-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="keno">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-table-cells-large text-indigo-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Lucky Draw</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Super Match Keno</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Pick lucky numbers out of a grid of ten, draw, and match to win!</p>
        </div>
        <span class="text-[8.5px] font-bold text-indigo-400 font-mono mt-3 flex items-center gap-1 group-hover:text-indigo-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 7. Cricket Sixer Hit Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-teal-955/20 via-slate-900 to-slate-950 border border-teal-500/10 hover:border-teal-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="cricket">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-baseball-bat-ball text-teal-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Sixer Hit</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Cricket Sixer Hit</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Guess the ball delivery pitch type, hit massive runs & stack profit!</p>
        </div>
        <span class="text-[8.5px] font-bold text-teal-400 font-mono mt-3 flex items-center gap-1 group-hover:text-teal-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 8. Aviator Jet Ride Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-red-955/20 via-slate-900 to-slate-950 border border-red-500/10 hover:border-red-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="aviator">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-plane text-red-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Jet Ride</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Aviator Jet Ride</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Watch the jet soar & fly up. Tap cash out before the plane flies away!</p>
        </div>
        <span class="text-[8.5px] font-bold text-red-400 font-mono mt-3 flex items-center gap-1 group-hover:text-red-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 9. Three Shell Cups Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-fuchsia-955/20 via-slate-900 to-slate-950 border border-fuchsia-500/10 hover:border-fuchsia-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="shell">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-glass-water-droplet text-fuchsia-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Cups Guess</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Three Cups Shell</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Place bets, track the shuffling cups & select the one containing gold!</p>
        </div>
        <span class="text-[8.5px] font-bold text-fuchsia-400 font-mono mt-3 flex items-center gap-1 group-hover:text-fuchsia-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>

      <!-- 10. Tiger vs Dragon Card -->
      <button class="game-launch-btn flex flex-col justify-between p-4 bg-gradient-to-br from-orange-955/20 via-slate-900 to-slate-950 border border-orange-500/10 hover:border-orange-500/25 rounded-2.5xl text-left transition hover:scale-[1.01] active:scale-97 shadow-md group" data-subtab="tigerdragon">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <i class="fa-solid fa-shield-cat text-orange-400 text-xs"></i>
            </div>
            <span class="text-[6.5px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded-full uppercase font-mono">Table Clash</span>
          </div>
          <h3 class="text-[10.5px] font-black text-white font-mono mt-1">Tiger vs Dragon</h3>
          <p class="text-[8.5px] text-slate-400 leading-normal font-sans">Bet on Tiger, Dragon, or Tie! The highest single card dealt wins!</p>
        </div>
        <span class="text-[8.5px] font-bold text-orange-400 font-mono mt-3 flex items-center gap-1 group-hover:text-orange-300">Play Now <i class="fa-solid fa-chevron-right text-[6.5px]"></i></span>
      </button>
    </div>
  </div>

  <!-- ================= SUB-TAB 1: COIN FLIP ================= -->
  <div id="game-coinflip-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/30 shadow-xl">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-amber-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-2"><i class="fa-solid fa-coins text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"></i> Coin Flip Pro</h3>
      </div>
      <button id="coin-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-amber-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <div class="bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
      <div class="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

      <!-- Coin flip Arena -->
      <div class="flex flex-col items-center justify-center py-4">
        <!-- Coin Visual Wrapper -->
        <div class="relative w-28 h-28 cursor-pointer select-none perspective-1000 mb-6" id="coin-visual-wrapper">
          <div class="w-full h-full relative transition-transform duration-[1500ms] preserve-3d" id="coin-rotator">
            <!-- Heads Side (Front) -->
            <div class="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-[6px] border-slate-950 shadow-2xl shadow-amber-500/20 flex flex-col items-center justify-center backface-hidden z-10">
              <div class="absolute inset-1.5 border-2 border-yellow-200/50 rounded-full flex flex-col items-center justify-center">
                <i class="fa-solid fa-crown text-slate-950 text-3xl drop-shadow"></i>
                <span class="text-[8.5px] font-black text-slate-950 font-mono tracking-widest mt-0.5 uppercase">Heads</span>
              </div>
            </div>
            <!-- Tails Side (Back) -->
            <div class="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-indigo-400 via-slate-700 to-indigo-900 border-[6px] border-slate-950 shadow-2xl shadow-indigo-500/20 flex flex-col items-center justify-center rotate-y-180 backface-hidden">
              <div class="absolute inset-1.5 border-2 border-indigo-300/40 rounded-full flex flex-col items-center justify-center">
                <i class="fa-solid fa-dice-five text-white text-3xl drop-shadow"></i>
                <span class="text-[8.5px] font-black text-white font-mono tracking-widest mt-0.5 uppercase">Tails</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center space-y-2 mb-6">
          <span class="text-[9px] uppercase font-bold text-amber-400 tracking-widest block font-mono">Select Target Side:</span>
          <div class="flex items-center gap-3 justify-center">
            <button id="coin-side-heads-btn" class="px-6 py-2.5 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-amber-500/15 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10" data-side="heads">
              Heads (H)
            </button>
            <button id="coin-side-tails-btn" class="px-6 py-2.5 rounded-xl text-xs font-black font-mono border-2 cursor-pointer transition active:scale-95 bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700" data-side="tails">
              Tails (T)
            </button>
          </div>
          <input type="hidden" id="coin-selected-side" value="heads" />
        </div>

        <!-- Betting Controls -->
        <div class="w-full max-w-sm mx-auto bg-slate-950/90 border border-slate-900 p-5 rounded-2.5xl space-y-3.5 shadow-2xl">
          <div class="flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
            <span>Betting Stake (৳):</span>
            <span class="text-amber-400 font-extrabold flex items-center gap-1"><i class="fa-solid fa-bolt text-xs"></i> 2.00x Payout</span>
          </div>

          <div class="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
            <span class="text-slate-500 text-sm font-bold mr-2">৳</span>
            <input type="number" id="coin-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
          </div>

          <div class="grid grid-cols-4 gap-1.5">
            <button class="coin-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg py-1.5 font-bold font-mono text-[9.5px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
            <button class="coin-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg py-1.5 font-bold font-mono text-[9.5px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
            <button class="coin-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg py-1.5 font-bold font-mono text-[9.5px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
            <button class="coin-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg py-1.5 font-bold font-mono text-[9.5px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
          </div>

          <button id="games-coinflip-play-btn" class="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black py-3 rounded-xl text-xs shadow-xl shadow-amber-500/10 hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-amber-300/30 block font-mono">
            FLIP COIN NOW
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= SUB-TAB 2: HIGH LOW CARD ================= -->
  <div id="game-highlow-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-indigo-900/40 shadow-md">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-arrow-up-9-1 text-indigo-400"></i> High-Low Card</h3>
      </div>
      <button id="hl-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-indigo-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <div class="bg-gradient-to-b from-indigo-955/35 to-slate-950 border border-indigo-900/30 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
      <div class="absolute -left-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

      <!-- High Low Arena -->
      <div class="flex flex-col items-center justify-center py-4">
        <!-- Current card visual layout -->
        <div class="relative w-24 h-32 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-500/30 rounded-2xl shadow-xl flex flex-col justify-between p-3 mb-6 select-none font-mono" id="highlow-card-wrapper">
          <!-- Top Left Suit -->
          <div class="flex flex-col items-center leading-none text-left w-fit self-start">
            <span class="text-xs font-black text-indigo-400" id="card-suit-top">♠</span>
            <span class="text-[8.5px] font-black text-white" id="card-rank-top">A</span>
          </div>

          <!-- Center Large Value Display -->
          <div class="text-center self-center" id="card-center-glow">
            <span class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-300 to-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]" id="card-rank-center">A</span>
          </div>

          <!-- Bottom Right Suit -->
          <div class="flex flex-col items-center leading-none text-right w-fit self-end rotate-180">
            <span class="text-xs font-black text-indigo-400" id="card-suit-bottom">♠</span>
            <span class="text-[8.5px] font-black text-white" id="card-rank-bottom">A</span>
          </div>
        </div>

        <div class="text-center space-y-1.5 mb-5 w-full">
          <span class="text-[8.5px] uppercase font-bold text-indigo-400 tracking-widest block font-mono">Predict Next Card Value:</span>
          <div class="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button id="hl-bet-higher-btn" class="flex flex-col items-center gap-1 bg-emerald-950/20 hover:bg-emerald-955/35 border border-emerald-500/30 text-emerald-400 py-2.5 px-3 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition">
              <i class="fa-solid fa-arrow-up text-[10px] animate-bounce"></i>
              Higher (High)
            </button>
            <button id="hl-bet-lower-btn" class="flex flex-col items-center gap-1 bg-rose-950/20 hover:bg-rose-955/35 border border-rose-500/30 text-rose-400 py-2.5 px-3 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition">
              <i class="fa-solid fa-arrow-down text-[10px] animate-bounce"></i>
              Lower (Low)
            </button>
          </div>
          <input type="hidden" id="hl-selected-prediction" value="" />
        </div>

        <!-- Betting Controls -->
        <div class="w-full max-w-xs mx-auto bg-slate-950/80 border border-slate-900 p-4 rounded-2xl space-y-3">
          <div class="flex justify-between items-center text-[9px] text-slate-400 font-mono">
            <span>Enter Betting Cash (৳):</span>
            <span class="text-indigo-400 font-bold">Double payout (2.00x)</span>
          </div>

          <div class="flex items-center bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5">
            <span class="text-slate-500 text-xs font-bold mr-1.5">৳</span>
            <input type="number" id="hl-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
          </div>

          <div class="grid grid-cols-4 gap-1">
            <button class="hl-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1.5 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
            <button class="hl-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1.5 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
            <button class="hl-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1.5 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
            <button class="hl-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1.5 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
          </div>

          <div class="text-[9px] text-slate-500 font-mono text-center">
            Current card is <strong class="text-indigo-300" id="hl-current-info">A♠</strong>. Tie refunds your bet.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= SUB-TAB 3: QUICK DRAW ================= -->
  <div id="game-quickdraw-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-rose-900/40 shadow-md">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-rose-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-bolt text-rose-400"></i> Quick Draw</h3>
      </div>
      <button id="quickdraw-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <!-- Active Draw Details Card -->
    <div id="quickdraw-draw-card-container">
      <!-- Generated dynamically in gameHub.js -->
    </div>
  </div>

  <!-- ================= SUB-TAB 4: GROUP SYNDICATE ================= -->
  <div id="game-syndicate-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-emerald-900/40 shadow-md">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-users text-emerald-400"></i> Group Syndicate</h3>
      </div>
      <button id="syndicate-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-emerald-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <!-- Main Syndicate view inside Games Hub -->
    <div id="syndicate-gameplay-container" class="space-y-4">
      <!-- Generated dynamically in gameHub.js -->
    </div>
  </div>

  <!-- ================= SUB-TAB: MINES SWEEPER ================= -->
  <div id="game-mines-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-rose-900/40 shadow-md">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-rose-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-bomb text-rose-400"></i> Mines Sweeper</h3>
      </div>
      <button id="mines-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-rose-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <div class="bg-gradient-to-b from-rose-955/20 to-slate-950 border border-rose-900/20 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
      <div class="absolute -right-20 -top-20 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none"></div>

      <div class="flex flex-col md:flex-row gap-5">
        <!-- Grid Section -->
        <div class="flex-1 flex flex-col items-center justify-center">
          <!-- 5x5 Grid -->
          <div id="mines-game-grid" class="grid grid-cols-5 gap-2 w-full max-w-[280px] aspect-square">
            <!-- 25 cell buttons rendered dynamically -->
          </div>
        </div>

        <!-- Controls Section -->
        <div class="w-full md:w-[180px] space-y-3 shrink-0">
          <div class="space-y-1 bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl text-center">
            <span class="text-[8px] text-slate-500 uppercase block font-bold">Multiplier</span>
            <span id="mines-next-multiplier" class="text-rose-400 font-extrabold text-[15px] font-mono">1.00x</span>
          </div>

          <div class="space-y-1.5">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Number of Mines</label>
            <div class="grid grid-cols-5 gap-1">
              <button class="mines-count-set-btn px-2 py-1.5 rounded-lg text-xs font-black font-mono border bg-rose-500/15 border-rose-500 text-rose-400 active:scale-95 transition cursor-pointer" data-count="1">1</button>
              <button class="mines-count-set-btn px-2 py-1.5 rounded-lg text-xs font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 active:scale-95 transition cursor-pointer" data-count="3">3</button>
              <button class="mines-count-set-btn px-2 py-1.5 rounded-lg text-xs font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 active:scale-95 transition cursor-pointer" data-count="5">5</button>
              <button class="mines-count-set-btn px-2 py-1.5 rounded-lg text-xs font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 active:scale-95 transition cursor-pointer" data-count="10">10</button>
              <button class="mines-count-set-btn px-2 py-1.5 rounded-lg text-xs font-black font-mono border bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 active:scale-95 transition cursor-pointer" data-count="24">24</button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Bet Amount</label>
            <div class="flex items-center bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5">
              <span class="text-slate-500 text-xs font-bold mr-1.5">৳</span>
              <input type="number" id="mines-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
            </div>

            <div class="grid grid-cols-4 gap-1">
              <button class="mines-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
              <button class="mines-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
              <button class="mines-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
              <button class="mines-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
            </div>
          </div>

          <button id="mines-start-btn" class="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-rose-400/20 block font-mono">
            Start Game 💣
          </button>
          <button id="mines-cashout-btn" class="hidden w-full bg-slate-900 border border-slate-850 text-slate-500 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-not-allowed transition block font-mono">
            Cash Out
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= SUB-TAB: DICE ROLL ================= -->
  <div id="game-dice-panel" class="hidden space-y-4">
    <!-- Game Navigation Header -->
    <div class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-teal-900/40 shadow-md">
      <button class="games-back-to-lobby-btn text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-400 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-arrow-left"></i> Back to Hub
      </button>
      <div class="text-center">
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5"><i class="fa-solid fa-dice text-teal-400"></i> Dice Roll</h3>
      </div>
      <button id="dice-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900 border border-teal-800/60 text-teal-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
        <i class="fa-solid fa-expand text-teal-400"></i> <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    <div class="bg-gradient-to-b from-teal-955/20 to-slate-950 border border-teal-900/20 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
      <div class="absolute -right-20 -top-20 w-40 h-40 bg-teal-500/10 rounded-full blur-[40px] pointer-events-none"></div>

      <div class="flex flex-col gap-5">
        <!-- Visual Screen Section -->
        <div class="bg-slate-950 border border-slate-900/80 rounded-2.5xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <span class="text-[8px] text-slate-500 uppercase tracking-wider block font-bold mb-1">Rnd Dice Output</span>
          <!-- Dynamic large roll display -->
          <div id="dice-result-graphic-val" class="text-4xl font-black text-teal-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(20,184,166,0.2)]">50.00</div>
          
          <!-- Slider display and track -->
          <div class="w-full max-w-[360px] mt-6 relative px-2">
            <div class="h-1.5 w-full bg-slate-900 rounded-full relative">
              <!-- Glow overlay matching Under/Over selection -->
              <div id="dice-slider-fill-glow" class="absolute h-full rounded-full bg-rose-500/60 left-0" style="width: 50%;"></div>
            </div>
            <input type="range" id="dice-target-slider" min="2" max="98" value="50" class="w-full absolute inset-y-0 left-0 bg-transparent appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-950 [&::-webkit-slider-thumb]:shadow-md" />
          </div>

          <div class="flex justify-between w-full max-w-[360px] mt-2.5 text-[10px] text-slate-500 font-mono">
            <span>0</span>
            <span>25</span>
            <span class="text-teal-400 font-bold">Target: <span id="dice-target-display-val">50</span></span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <!-- Inputs and Controls Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Prediction Mode Selectors -->
          <div class="space-y-2">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Roll Direction</label>
            <div class="flex gap-2">
              <button id="dice-pred-under-btn" class="w-full flex flex-col items-center gap-1 bg-rose-500/15 border-2 border-rose-500 text-rose-400 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition shadow-lg shadow-rose-500/5">
                <span>Roll Under</span>
                <span class="text-[9px] text-slate-400 font-normal">Win if < Target</span>
              </button>
              <button id="dice-pred-over-btn" class="w-full flex flex-col items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 py-3 px-4 rounded-2xl font-black font-mono text-xs cursor-pointer active:scale-95 transition">
                <span>Roll Over</span>
                <span class="text-[9px] text-slate-400 font-normal">Win if > Target</span>
              </button>
            </div>
          </div>

          <!-- Bet inputs & outputs -->
          <div class="space-y-2">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Bet Amount</label>
            <div class="flex items-center bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5">
              <span class="text-slate-500 text-xs font-bold mr-1.5">৳</span>
              <input type="number" id="dice-bet-amount" class="w-full bg-transparent border-none text-white text-xs font-bold font-mono focus:outline-none" value="10" min="5" max="1000" />
            </div>

            <div class="grid grid-cols-4 gap-1">
              <button class="dice-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="half">½x</button>
              <button class="dice-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="double">2x</button>
              <button class="dice-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="min">Min</button>
              <button class="dice-qty-btn bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg py-1 font-bold font-mono text-[9px] active:scale-95 transition cursor-pointer" data-op="max">Max</button>
            </div>
          </div>
        </div>

        <!-- Realtime stat sheets -->
        <div class="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-900 p-3 rounded-2xl text-center font-mono">
          <div>
            <span class="text-[8px] text-slate-500 uppercase block font-bold">Win Chance</span>
            <span id="dice-win-chance-val" class="text-white font-extrabold text-xs">50%</span>
          </div>
          <div class="border-x border-slate-900">
            <span class="text-[8px] text-slate-500 uppercase block font-bold">Multiplier</span>
            <span id="dice-multiplier-val" class="text-teal-400 font-extrabold text-xs">1.90x</span>
          </div>
          <div>
            <span class="text-[8px] text-slate-500 uppercase block font-bold">Est. Payout</span>
            <span id="dice-potential-payout-val" class="text-emerald-400 font-extrabold text-xs">৳19.00</span>
          </div>
        </div>

        <button id="dice-roll-trigger-btn" class="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer hover:scale-[1.01] border border-teal-400/20">
          Roll Dice 🎲
        </button>
      </div>
    </div>
  </div>

  <!-- ================= SUB-TAB: EXTRA TRENDING GAMES (DYNAMICALLY RENDERED) ================= -->
  <div id="game-extragames-panel" class="hidden space-y-4">
    <!-- Dynamic templates loaded via extraGames.js -->
  </div>

  <!-- Recent Games Ledger (Only shown if not on lobby) -->
  <div id="games-ledger-container" class="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 font-mono hidden">
    <div class="flex justify-between items-center border-b border-slate-850 pb-2">
      <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
        <i class="fa-solid fa-clock-rotate-left"></i> Your Recent Game Rolls
      </h3>
      <span class="text-[8px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full" id="games-total-played">0 Plays</span>
    </div>

    <!-- Scrollable container -->
    <div class="max-h-48 overflow-y-auto space-y-1.5 pr-0.5" id="games-history-logs-container">
      <div class="text-[9.5px] text-slate-600 text-center py-4">No games played yet. Start flipping or drawing to fill ledger!</div>
    </div>
  </div>
</div>
