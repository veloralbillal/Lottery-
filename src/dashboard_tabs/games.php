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
  <div id="game-lobby-panel" class="space-y-6">
    <!-- Promotional Banner -->
    <div class="bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-slate-950 border border-amber-500/20 p-5 rounded-3xl relative overflow-hidden shadow-xl shadow-amber-500/5">
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex items-center justify-between gap-4">
        <div class="space-y-1.5 max-w-md">
          <span class="text-[8.5px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono">Provably Fair & Instant Payouts</span>
          <h2 class="text-base sm:text-lg font-black text-white tracking-tight">ভিআইপি ক্যাসিও গেমস লাউঞ্জ 🎰</h2>
          <p class="text-[10px] text-slate-300 leading-relaxed font-sans">Multiply wallet rewards up to 100x with provably fair RNG algorithms, instant balances updates, and zero payment processing delay!</p>
        </div>
        <div class="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-slate-950 text-2xl shadow-lg shadow-amber-500/20 shrink-0">
          <i class="fa-solid fa-gamepad animate-pulse"></i>
        </div>
      </div>
    </div>

    <!-- 1. VIP Premium Games Section -->
    <div class="space-y-3.5">
      <div class="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span>🔥 VIP Premium Games (ভিআইপি প্রিমিয়াম গেমস)</span>
        </h3>
        <span class="text-[9px] text-slate-500 font-mono">Popular Pick</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <!-- Coin Flip Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#0c0f1d] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-purple-500/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="coinflip">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-pink-300 text-purple-950 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-200/40 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-coins text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-purple-400 font-black uppercase tracking-wider block">MULTIPLIER GAME</span>
                <h4 class="text-xs font-black text-white group-hover:text-purple-300 transition">কয়েন ফ্লিপ (Coin Flip Pro)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-purple-500/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-purple-300/80 font-mono font-bold uppercase tracking-widest block leading-none">গুণক</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">2.0x</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">হেডস বা টেইলস সিলেক্ট করে আপনার ব্যালেন্স দ্বিগুণ করুন তাৎক্ষণিকভাবে।</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>Provably Fair RNG</span>
              <span class="text-purple-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span> Instant Double Up
              </span>
            </div>
          </div>
        </button>

        <!-- Mines Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#1c0f10] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-orange-500/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="mines">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-orange-500/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-red-950 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/40 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-bomb text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-orange-400 font-black uppercase tracking-wider block">HIGH STAKES</span>
                <h4 class="text-xs font-black text-white group-hover:text-orange-300 transition">মাইন্স গেম (Mines Sweeper)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-orange-500/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-orange-300/80 font-mono font-bold uppercase tracking-widest block leading-none">গুণক</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">x50+</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">বোমা এড়িয়ে মাটির নিচ থেকে হীরার টুকরো খুঁজে বের করুন এবং প্রাইজ বাড়ান।</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>95% Win rate</span>
              <span class="text-orange-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Diamond Multipliers
              </span>
            </div>
          </div>
        </button>

        <!-- Crash Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#12071d] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-fuchsia-500/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="crash">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-fuchsia-500/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-400 text-purple-950 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/40 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-rocket text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-fuchsia-400 font-black uppercase tracking-wider block">EXPONENTIAL</span>
                <h4 class="text-xs font-black text-white group-hover:text-fuchsia-300 transition">ক্র্যাশ রকেট (Rocket Fly)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-fuchsia-500/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-fuchsia-300/80 font-mono font-bold uppercase tracking-widest block leading-none">গুণক</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">x100</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">রকেট উড়ে যাওয়ার আগেই ক্যাশ আউট করে লুফে নিন বড় পরিমাণের বোনাস টাকা।</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>Realtime Multipliers</span>
              <span class="text-fuchsia-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span> Fast Fly cashout
              </span>
            </div>
          </div>
        </button>

        <!-- Quick Draw Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#1c140a] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-rose-500/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="quickdraw">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-300 text-rose-950 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-rose-200/60 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-bolt text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-rose-400 font-black uppercase tracking-wider block">AUTO DRAWING</span>
                <h4 class="text-xs font-black text-white group-hover:text-rose-300 transition">কুইক ড্র (১-মিনিট ইনস্ট্যান্ট)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-rose-500/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-rose-300/80 font-mono font-bold uppercase tracking-widest block leading-none">টিকেট</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">৳১০</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">প্রতি মিনিটে লাইভ ড্র সম্পন্ন করা হয়। যত টিকিট বিক্রি হবে জ্যাকপট তত বাড়বে!</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>Automatic Draws</span>
              <span class="text-rose-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Dynamic Prize Pool
              </span>
            </div>
          </div>
        </button>

        <!-- Group Syndicate Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#071d12] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-teal-500/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="syndicate">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-green-300 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-200/60 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-users text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-teal-400 font-black uppercase tracking-wider block">COOPERATIVE</span>
                <h4 class="text-xs font-black text-white group-hover:text-teal-300 transition">গ্রুপ সিন্ডিকেট (Syndicate)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-teal-500/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-teal-300/80 font-mono font-bold uppercase tracking-widest block leading-none">খরচ</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">ভাগাভাগি</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">বন্ধুদের সাথে টিকেটের খরচ ভাগাভাগি করে সিন্ডিকেট দল গঠন করে প্রাইজ জিতুন।</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>Risk Splitting</span>
              <span class="text-teal-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Multi-player Co-op
              </span>
            </div>
          </div>
        </button>

        <!-- Dice Roll Premium Card -->
        <button class="game-launch-btn text-left bg-gradient-to-br from-[#07131d] via-slate-950 to-slate-950 border border-slate-800/80 hover:border-teal-400/50 p-4.5 rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-97 shadow-xl flex flex-col justify-between relative overflow-hidden" data-subtab="dice">
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-teal-400/5 rounded-full blur-xl pointer-events-none group-hover:bg-teal-400/10 transition-all duration-300"></div>
          
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-sky-300 text-teal-950 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-200/60 group-hover:scale-110 transition duration-300 shrink-0">
                <i class="fa-solid fa-dice text-[15px]"></i>
              </div>
              <div>
                <span class="text-[8.5px] font-mono text-teal-400 font-black uppercase tracking-wider block">FAST PACE</span>
                <h4 class="text-xs font-black text-white group-hover:text-teal-300 transition">ডাইস রোল (Dice Roll Pro)</h4>
              </div>
            </div>
            
            <div class="text-right shrink-0 bg-slate-950/40 border-l border-teal-400/20 pl-3.5 pr-1 py-1">
              <span class="text-[8.5px] text-teal-300/80 font-mono font-bold uppercase tracking-widest block leading-none">রিটার্ন</span>
              <span class="text-sm font-black text-white font-mono block mt-1 leading-none">x95</span>
            </div>
          </div>

          <!-- Perforated Divider with Side Notches -->
          <div class="relative py-1 w-full my-2">
            <div class="lottery-ticket-notch-left" style="top: 50%; transform: translateY(-50%);"></div>
            <div class="lottery-ticket-dashed"></div>
            <div class="lottery-ticket-notch-right" style="top: 50%; transform: translateY(-50%);"></div>
          </div>

          <div>
            <p class="text-[9.5px] text-slate-400 font-sans leading-relaxed">ডাইসের স্লাইডার ড্র্যাগ করে নিজের পছন্দমত উইন রেট এবং গুণক নির্ধারণ করুন।</p>
            <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-3">
              <span>Adjustable Odds</span>
              <span class="text-teal-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Highly customizable
              </span>
            </div>
          </div>
        </button>

      </div>
    </div>

    <!-- 2. Arcade Classics & Trending Mini-Games Grid -->
    <div class="space-y-3.5">
      <div class="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group text-slate-400"></i>
          <span>🎮 Arcade Classics &amp; Mini-Games (অন্যান্য ট্র্যান্ডিং গেমস)</span>
        </h3>
        <span class="text-[9px] text-slate-500 font-mono">10 Arcade Legends</span>
      </div>

      <div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        
        <!-- High Low Game Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-indigo-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="highlow">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-400 to-sky-300 text-indigo-950 flex items-center justify-center mb-2 shadow-md border border-indigo-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-arrow-up-9-1 text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-indigo-300 transition w-full">High Low</span>
          <span class="text-[7.5px] text-indigo-400 font-mono font-black mt-1 uppercase">Multiplier cards</span>
        </button>

        <!-- Plinko Game Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="plinko">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 flex items-center justify-center mb-2 shadow-md border border-yellow-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-circle-nodes text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-amber-300 transition w-full">Plinko</span>
          <span class="text-[7.5px] text-amber-400 font-mono font-black mt-1 uppercase">Drop Ball</span>
        </button>

        <!-- Penalty Shootout Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="penalty">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 text-emerald-950 flex items-center justify-center mb-2 shadow-md border border-emerald-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-futbol text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-emerald-300 transition w-full">Shootout</span>
          <span class="text-[7.5px] text-emerald-400 font-mono font-black mt-1 uppercase">Penalty goal</span>
        </button>

        <!-- Tower Climb Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="tower">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-teal-300 text-cyan-950 flex items-center justify-center mb-2 shadow-md border border-cyan-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-chess-rook text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-cyan-300 transition w-full">Tower Climb</span>
          <span class="text-[7.5px] text-cyan-400 font-mono font-black mt-1 uppercase">Safe Floor</span>
        </button>

        <!-- Fortune Wheel Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-rose-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="wheel">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-orange-300 text-rose-950 flex items-center justify-center mb-2 shadow-md border border-rose-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-spinner text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-rose-300 transition w-full">Fortune Wheel</span>
          <span class="text-[7.5px] text-rose-400 font-mono font-black mt-1 uppercase">Lucky Spin</span>
        </button>

        <!-- Match Keno Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-indigo-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="keno">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-violet-400 text-indigo-950 flex items-center justify-center mb-2 shadow-md border border-indigo-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-table-cells-large text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-indigo-300 transition w-full">Super Keno</span>
          <span class="text-[7.5px] text-indigo-400 font-mono font-black mt-1 uppercase">Classic grid</span>
        </button>

        <!-- Cricket Sixer Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-teal-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="cricket">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 via-emerald-400 to-lime-300 text-teal-950 flex items-center justify-center mb-2 shadow-md border border-teal-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-baseball-bat-ball text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-teal-300 transition w-full">Cricket</span>
          <span class="text-[7.5px] text-teal-400 font-mono font-black mt-1 uppercase">Over Sixer</span>
        </button>

        <!-- Aviator Jet Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-red-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="aviator">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-pink-400 text-red-950 flex items-center justify-center mb-2 shadow-md border border-red-400/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-plane text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-red-300 transition w-full">Aviator</span>
          <span class="text-[7.5px] text-red-400 font-mono font-black mt-1 uppercase">Jet Cashout</span>
        </button>

        <!-- Shell Guess Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-fuchsia-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="shell">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-pink-400 text-fuchsia-950 flex items-center justify-center mb-2 shadow-md border border-fuchsia-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-glass-water-droplet text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-fuchsia-300 transition w-full">Shell Cup</span>
          <span class="text-[7.5px] text-fuchsia-400 font-mono font-black mt-1 uppercase">Cup Guess</span>
        </button>

        <!-- Tiger vs Dragon Card -->
        <button class="game-launch-btn flex flex-col items-center justify-center bg-gradient-to-b from-[#131930] via-[#0d1224] to-[#090d1a] border border-slate-800 hover:border-orange-500/40 p-3 rounded-xl cursor-pointer text-center group transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md" data-subtab="tigerdragon">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-orange-950 flex items-center justify-center mb-2 shadow-md border border-orange-200/60 group-hover:scale-110 transition duration-200 shrink-0">
            <i class="fa-solid fa-shield-cat text-[11px]"></i>
          </div>
          <span class="text-[10px] font-bold text-white block truncate group-hover:text-orange-300 transition w-full">Tiger Dragon</span>
          <span class="text-[7.5px] text-orange-400 font-mono font-black mt-1 uppercase">Deck Battle</span>
        </button>

      </div>
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

    <div class="bg-gradient-to-b from-amber-950/20 via-slate-955 to-slate-950 border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
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
      <button id="quickdraw-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-955/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
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
      <button id="syndicate-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-emerald-955/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
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
      <button id="mines-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-rose-955/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
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
      <button id="dice-fullscreen-toggle-btn" class="text-[9px] font-bold font-mono px-3 py-1.5 rounded-xl bg-teal-955/60 hover:bg-teal-900 border border-teal-800/60 text-teal-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
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
