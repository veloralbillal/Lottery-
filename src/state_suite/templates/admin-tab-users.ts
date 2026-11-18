export const template = `
      <!-- ================= ADMIN TAB: USER CONTROL & MANAGEMENT ================= -->
      <div id="admin-tab-users" class="hidden space-y-6">
        
        <!-- Breadcrumb & Top Bar -->
        <div class="flex flex-col gap-2 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-amber-500 text-xs font-mono tracking-widest font-bold flex items-center gap-1.5 uppercase">
                <i class="fa-solid fa-terminal text-[10px]"></i>
                ADMIN CONSOLE / ইউজার নিয়ন্ত্রণ
              </span>
            </div>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span class="font-mono text-[9px] uppercase font-bold text-amber-400 tracking-wide">ROOT ACCESS</span>
            </div>
          </div>
          <div class="flex flex-col">
            <h1 class="text-base font-black text-white">User Control & Management</h1>
            <p class="text-xs text-slate-500">ইউজার নিয়ন্ত্রণ ও পর্যবেক্ষণ • Monitor, audit and enforce security policies on platform players.</p>
          </div>
        </div>

        <!-- User Overview Analytics Grid (2x2 / 4x1) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Users -->
          <div class="flex flex-col p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Total Users</span>
              <div class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500">
                <i class="fa-solid fa-users text-[11px]"></i>
              </div>
            </div>
            <div class="mt-2.5 flex flex-col">
              <span id="admin-users-stat-total" class="text-lg font-black text-white font-mono tabular-nums">0</span>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="text-[9.5px] text-emerald-400 font-mono font-bold">+142 today</span>
              </div>
            </div>
            <div class="absolute -right-4 -bottom-4 w-12 h-12 bg-amber-500/5 rounded-full pointer-events-none blur-xl"></div>
          </div>
          <!-- Card 2: Active Sessions -->
          <div class="flex flex-col p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Active Online</span>
              <div class="w-7 h-7 rounded-lg bg-cyan-950/40 flex items-center justify-center text-cyan-400">
                <i class="fa-solid fa-circle-nodes text-[11px]"></i>
              </div>
            </div>
            <div class="mt-2.5 flex flex-col">
              <div class="flex items-center gap-2">
                <span id="admin-users-stat-online" class="text-lg font-black text-white font-mono tabular-nums">0</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span class="text-[9.5px] text-slate-500">লাইভ ইউজার সেশন</span>
            </div>
          </div>
          <!-- Card 3: Flagged / Review -->
          <div class="flex flex-col p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Flagged Fraud</span>
              <div class="w-7 h-7 rounded-lg bg-rose-950/40 flex items-center justify-center text-rose-400">
                <i class="fa-solid fa-triangle-exclamation text-[11px]"></i>
              </div>
            </div>
            <div class="mt-2.5 flex flex-col">
              <span id="admin-users-stat-flagged" class="text-lg font-black text-rose-450 font-mono tabular-nums">0</span>
              <span class="text-[9.5px] text-slate-500">সতর্কতা / Needs Review</span>
            </div>
          </div>
          <!-- Card 4: Total Wallet Pool -->
          <div class="flex flex-col p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Wallet Pool</span>
              <div class="w-7 h-7 rounded-lg bg-emerald-950/40 flex items-center justify-center text-emerald-400">
                <i class="fa-solid fa-wallet text-[11px]"></i>
              </div>
            </div>
            <div class="mt-2.5 flex flex-col">
              <span id="admin-users-stat-balance" class="text-lg font-black text-white font-mono tabular-nums">৳0.00</span>
              <span class="text-[9.5px] text-slate-500">মোট ইউজার ডিপোজিট</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <!-- Search input with premium glowing borders -->
          <div class="relative w-full md:w-96 font-sans">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input id="admin-players-search-input" type="text" placeholder="Search user by Username, Phone, Email..." class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/80 rounded-2xl py-3 pl-10 pr-10 text-xs text-white outline-none transition-all placeholder:text-slate-550 font-sans shadow-inner" />
            <button id="admin-players-clear-search-btn" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white hidden cursor-pointer">
              <i class="fa-solid fa-circle-xmark text-xs"></i>
            </button>
          </div>

          <!-- Filter chips scrollable -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full font-mono text-xs" id="admin-users-filter-bar">
            <!-- Filter buttons populated dynamically -->
          </div>
        </div>

        <!-- Dynamic Monitored Accounts List -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Monitored Accounts Feed</span>
            <span class="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Realtime Feed</span>
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-users-cards-grid">
            <!-- Populated dynamically with beautiful profile cards via JS -->
          </div>
        </div>

        <!-- User Policy & Security Controls Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div class="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
              <i class="fa-solid fa-shield-halved text-base"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-black text-white">Platform Security Rules</span>
              <span class="text-[10px] text-slate-500 font-mono">প্ল্যাটফর্ম ইউজার নিরাপত্তা পলিসি</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Toggle Item 1 -->
            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
              <div class="flex flex-col pr-4 space-y-0.5">
                <span class="text-xs font-bold text-white">Enforce OTP on High Cashouts</span>
                <span class="text-[10px] text-slate-500 leading-relaxed">৳5,000 এর বেশি ক্যাশআউটে SMS OTP যাচাইকরণ</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
                <input type="checkbox" id="toggle-otp" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-950 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <!-- Toggle Item 2 -->
            <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
              <div class="flex flex-col pr-4 space-y-0.5">
                <span class="text-xs font-bold text-white">Auto-Freeze on Failed PIN</span>
                <span class="text-[10px] text-slate-500 leading-relaxed">&gt;3 বার ভুল পিন দিলে একাওন্ট তাৎক্ষণিক লক করা হবে</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
                <input type="checkbox" id="toggle-freeze" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-950 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          <!-- Slider Setting -->
          <div class="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-white">Max Daily Spend Limit</span>
              <span class="text-emerald-400 font-black font-mono tabular-nums text-sm" id="limit-label">৳50,000</span>
            </div>
            <input type="range" id="spend-slider" min="5000" max="200000" step="5000" value="50000" class="w-full accent-emerald-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer" />
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>৳5,000 (Min)</span>
              <span>দৈনিক সর্বোচ্চ বেটিং কোটা</span>
              <span>৳200,000 (VIP)</span>
            </div>
          </div>

          <!-- Save Policy CTA -->
          <button id="admin-save-policy-btn" class="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-rose-950/40 transition-all cursor-pointer">
            Save Security Policies
          </button>
        </div>
      </div>
`;
