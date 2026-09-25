<!-- ================= ADMIN TAB: AGENT LEADERS NETWORK & CASH LOAD OPERATIONS HUB ================= -->
<div id="admin-tab-agent-leaders" class="hidden space-y-5 animate-fade-in font-sans">
  
  <!-- Top Hero Header -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/25 to-slate-950 p-5 sm:p-6 shadow-2xl border border-emerald-500/20">
    <div class="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5 text-[11px] font-mono tracking-wider text-slate-400">
          <span class="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE OPERATIONS HUB
          </span>
          <span>·</span>
          <span>AGENT NETWORK &amp; CASH DESK</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <i class="fa-solid fa-crown text-amber-400 text-lg sm:text-xl"></i>
          <span>এজেন্ট লিডার ও ক্যাশ লোড হাব</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed font-sans">
          Manage district recruiting leaders, refill agent purse balance instantly, monitor field networks, generate campaign invite links, and review candidate applications.
        </p>
      </div>
      
      <!-- Top Action Buttons -->
      <div class="flex items-center gap-2 flex-wrap">
        <button id="leader-add-new-btn" class="bg-gradient-to-r from-emerald-600 via-emerald-550 to-teal-550 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center gap-2">
          <i class="fa-solid fa-user-plus text-xs"></i>
          <span>Add New Leader (নতুন লিডার)</span>
        </button>
        <button id="leader-quick-cash-load-top-btn" class="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2">
          <i class="fa-solid fa-wallet text-sm"></i>
          <span>Instant Cash Load (টাকা লোড)</span>
        </button>
        <button id="leader-refresh-hub-btn" class="bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-3.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5" title="Refresh Leaders Data">
          <i class="fa-solid fa-arrows-rotate"></i>
          <span class="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
    
    <!-- Quick Metrics Strip (Responsive 2 to 4 columns) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-4 border-t border-slate-800/70 font-mono">
      <div class="bg-slate-950/75 p-3.5 sm:p-4 rounded-2xl border border-slate-850 hover:border-emerald-500/30 transition">
        <div class="flex items-center justify-between text-slate-400 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider">Active Leaders</span>
          <i class="fa-solid fa-crown text-amber-400 text-xs"></i>
        </div>
        <span id="hub-active-count-stat" class="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5 tabular-nums">0</span>
        <span class="text-[9.5px] text-slate-500 block mt-0.5 font-sans">Verified district agents</span>
      </div>
      
      <div class="bg-slate-950/75 p-3.5 sm:p-4 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition">
        <div class="flex items-center justify-between text-slate-400 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider">Sub-Agents Force</span>
          <i class="fa-solid fa-users text-indigo-400 text-xs"></i>
        </div>
        <span id="hub-subagents-count-stat" class="text-xl sm:text-2xl font-black text-indigo-400 block mt-0.5 tabular-nums">0</span>
        <span class="text-[9.5px] text-slate-500 block mt-0.5 font-sans">Recruited operators</span>
      </div>

      <div class="bg-slate-950/75 p-3.5 sm:p-4 rounded-2xl border border-slate-850 hover:border-amber-500/30 transition">
        <div class="flex items-center justify-between text-slate-400 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider">Leaders Wallet Balance</span>
          <i class="fa-solid fa-sack-dollar text-amber-400 text-xs"></i>
        </div>
        <span id="hub-leaders-balance-stat" class="text-xl sm:text-2xl font-black text-amber-400 block mt-0.5 tabular-nums">৳0.00</span>
        <span class="text-[9.5px] text-slate-500 block mt-0.5 font-sans">Active float in circulation</span>
      </div>

      <div class="bg-slate-950/75 p-3.5 sm:p-4 rounded-2xl border border-slate-850 hover:border-rose-500/30 transition">
        <div class="flex items-center justify-between text-slate-400 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider">Pending Applicants</span>
          <i class="fa-solid fa-user-clock text-rose-400 text-xs"></i>
        </div>
        <span id="hub-pending-count-stat" class="text-xl sm:text-2xl font-black text-rose-400 block mt-0.5 tabular-nums">0</span>
        <span class="text-[9.5px] text-slate-500 block mt-0.5 font-sans">Awaiting review approval</span>
      </div>
    </div>
  </div>

  <!-- Responsive Segmented Tab Switcher -->
  <div class="flex p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
    <button id="hub-tab-btn-leaders" class="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition-all bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95">
      <i class="fa-solid fa-crown text-amber-400"></i>
      <span>Leaders &amp; Cash Load</span>
    </button>
    <button id="hub-tab-btn-share" class="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer active:scale-95">
      <i class="fa-solid fa-share-nodes text-indigo-400"></i>
      <span>Campaigns &amp; QR</span>
    </button>
    <button id="hub-tab-btn-approvals" class="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer active:scale-95">
      <i class="fa-solid fa-user-check text-rose-400"></i>
      <span>Pending Queue</span>
      <span class="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/40 rounded-full text-[10px] font-mono font-bold" id="hub-badge-pending">0</span>
    </button>
  </div>

  <!-- ================= SUB-TAB 1: AGENT LEADERS DIRECTORY & CASH LOAD ================= -->
  <div id="hub-tab-content-leaders" class="space-y-6">
    
    <!-- Prominent Direct Cash Load Terminal Card -->
    <div class="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-500/30 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 text-xl shadow-md">
            <i class="fa-solid fa-money-bill-transfer"></i>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Direct Agent Cash Load (এজেন্ট ব্যালেন্স রিফিল টার্মিনাল)</span>
              <span class="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p class="text-xs text-slate-400 font-sans">Instantly credit and refill purse balance into any authorized district agent account.</p>
          </div>
        </div>
        <span class="bg-amber-950/90 text-amber-400 border border-amber-800/60 px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase self-start sm:self-auto flex items-center gap-1.5">
          <i class="fa-solid fa-bolt text-xs text-amber-400"></i>
          <span>Instant Float Credit</span>
        </span>
      </div>

      <!-- Live Agent Wallet Preview Card -->
      <div id="leader-cash-agent-preview-card" class="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md shrink-0">
            <span id="leader-cash-preview-initial">A</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 uppercase">Target Agent:</span>
              <strong id="leader-cash-preview-username" class="text-sm font-black text-white">@agent</strong>
              <span id="leader-cash-preview-district" class="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-bold font-sans">Dhaka</span>
            </div>
            <span id="leader-cash-preview-phone" class="text-[11px] text-slate-500 block mt-0.5">Phone: 01800000000</span>
          </div>
        </div>

        <div class="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-5">
          <div>
            <span class="text-[9.5px] text-slate-500 uppercase block">Current Purse</span>
            <span id="leader-cash-current-balance-preview" class="text-base font-black text-amber-400 tabular-nums">৳0.00</span>
          </div>
          <div class="text-slate-600 text-lg hidden sm:block">➔</div>
          <div>
            <span class="text-[9.5px] text-slate-500 uppercase block">Projected Balance</span>
            <span id="leader-cash-projected-balance-preview" class="text-base font-black text-emerald-400 tabular-nums">৳0.00</span>
          </div>
        </div>
      </div>

      <!-- Cash Load Input Form -->
      <form id="leader-quick-cash-form" class="space-y-4 text-xs font-mono">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          
          <!-- Select Leader (4 cols) -->
          <div class="md:col-span-4 space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wide">1. Select Agent Leader</label>
            <select id="leader-cash-select-user" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none cursor-pointer focus:border-amber-500 transition">
              <!-- Populated dynamically via admin.js -->
            </select>
          </div>

          <!-- Amount Input (4 cols) -->
          <div class="md:col-span-4 space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wide">2. Load Amount (৳ Taka)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400 font-black text-sm">৳</span>
              <input type="number" step="1" min="10" id="leader-cash-amount-input" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white font-bold outline-none focus:border-amber-500 transition text-sm" placeholder="e.g. 5000" />
            </div>
          </div>

          <!-- Confirm Action Button (4 cols) -->
          <div class="md:col-span-4 flex items-end">
            <button type="submit" id="leader-cash-submit-btn" class="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-2.5 px-4 rounded-xl transition cursor-pointer active:scale-95 uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-check text-sm"></i>
              <span>Confirm Cash Load</span>
            </button>
          </div>
        </div>

        <!-- Quick Preset Amount Pills -->
        <div class="flex items-center gap-2 flex-wrap pt-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-1">Quick Presets:</span>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="500">+৳500</button>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="1000">+৳1,000</button>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="2000">+৳2,000</button>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="5000">+৳5,000</button>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="10000">+৳10,000</button>
          <button type="button" class="leader-preset-pill bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer" data-val="25000">+৳25,000</button>
        </div>
      </form>
    </div>

    <!-- Leaders Directory Section -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-users-gear text-emerald-400"></i>
            <span>Agent Leaders Directory (লিডার তালিকা ও নেটওয়ার্ক)</span>
          </h3>
          <p class="text-xs text-slate-500 font-sans mt-0.5">All authorized recruiting leaders, their live purse balances, and one-click cash refill actions.</p>
        </div>

        <!-- Filter & Search Controls -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" id="hub-leaders-search-input" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-white text-xs outline-none focus:border-emerald-500 font-sans transition" placeholder="Search username, district, phone..." />
          </div>
        </div>
      </div>

      <!-- Leaders Cards Grid (Responsive 1 col mobile, 2 cols lg) -->
      <div id="hub-leaders-cards-container" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Populated dynamically via admin.js -->
      </div>

      <!-- Empty State -->
      <div id="hub-leaders-empty-state" class="hidden flex-col items-center justify-center p-12 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
        <div class="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <i class="fa-solid fa-user-slash text-xl"></i>
        </div>
        <h4 class="text-sm font-black text-white">No Agent Leaders Found</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-sm">No active agent leaders match your search or none are registered yet.</p>
      </div>
    </div>

    <!-- Recent Agent Cash Load Activity Ledger -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 font-sans">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div class="flex items-center gap-2.5">
          <i class="fa-solid fa-clock-rotate-left text-amber-400"></i>
          <h3 class="text-sm font-black text-white uppercase tracking-wider">Recent Agent Cash Refills (সাম্প্রতিক ক্যাশ লোড হিস্ট্রি)</h3>
        </div>
        <span class="text-[10px] text-slate-500 font-mono">Live Audit Trail</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase select-none">
              <th class="p-3">Date &amp; Time</th>
              <th class="p-3">Agent</th>
              <th class="p-3">Refill Amount</th>
              <th class="p-3">Reference / Note</th>
              <th class="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody id="hub-recent-cashloads-tbody" class="divide-y divide-slate-800/40 font-mono">
            <!-- Populated dynamically via admin.js -->
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <!-- ================= SUB-TAB 2: SHARE & TRACKED CAMPAIGN LINKS ================= -->
  <div id="hub-tab-content-share" class="hidden space-y-6">
    
    <!-- Recruiter Agent Leader Selection Dropdown -->
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
      <div class="flex items-center gap-2.5">
        <i class="fa-solid fa-user-check text-emerald-400 text-lg"></i>
        <h2 class="text-sm font-black text-white uppercase tracking-wider">Select Recruiter Agent Leader / লিডার নির্বাচন করুন</h2>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans">
        All generated links, campaign metrics, and candidate codes will automatically lock to this Leader's reference tree.
      </p>
      
      <div class="relative">
        <select id="hub-leader-select" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none text-xs font-semibold font-mono transition duration-300 focus:border-emerald-500 cursor-pointer">
          <!-- Populated dynamically with registered Leaders -->
        </select>
      </div>
    </div>

    <!-- Master Referral Link Box -->
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <i class="fa-solid fa-link text-emerald-400 text-lg"></i>
          <h2 class="text-sm font-black text-white uppercase tracking-wider">Master Registration Link</h2>
        </div>
        <span class="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-0.5 rounded-full font-mono font-bold">Tracked Node</span>
      </div>
      
      <div class="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
        <input id="hub-referral-link-input" type="text" class="bg-transparent text-xs text-white w-full px-2 outline-none font-mono tracking-tight select-all" readonly value="https://lotterywinner.app/?role=agent&ref=agent_dhaka" />
        <button id="hub-copy-master-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0">
          <i class="fa-solid fa-copy"></i>
          <span>Copy URL</span>
        </button>
      </div>

      <!-- Social Quick Share Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
        <button id="hub-share-whatsapp-btn" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition active:scale-95 cursor-pointer">
          <i class="fa-brands fa-whatsapp text-emerald-400 text-base"></i>
          <span>WhatsApp</span>
        </button>
        <button id="hub-share-telegram-btn" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition active:scale-95 cursor-pointer">
          <i class="fa-brands fa-telegram text-sky-400 text-base"></i>
          <span>Telegram</span>
        </button>
        <button id="hub-share-messenger-btn" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition active:scale-95 cursor-pointer">
          <i class="fa-brands fa-facebook-messenger text-blue-400 text-base"></i>
          <span>Messenger</span>
        </button>
        <button id="hub-share-sms-btn" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition active:scale-95 cursor-pointer">
          <i class="fa-solid fa-comment-sms text-amber-400 text-base"></i>
          <span>Direct SMS</span>
        </button>
      </div>
    </div>

    <!-- Custom Tracked Link Creator Card -->
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <i class="fa-solid fa-bullhorn text-indigo-400 text-lg"></i>
          <h2 class="text-sm font-black text-white uppercase tracking-wider">Custom Campaign Builder</h2>
        </div>
        <span class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Campaign Tracker</span>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 font-mono">Zone / Campaign Tag (e.g. Dhaka_Promo, Sylhet_Recruit)</label>
          <input id="hub-campaign-name" type="text" class="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono" placeholder="Enter campaign_tag" />
        </div>
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2">
            <input id="hub-sms-track" type="checkbox" checked class="w-4 h-4 accent-indigo-500 rounded cursor-pointer" />
            <label for="hub-sms-track" class="text-xs text-slate-400 cursor-pointer select-none font-sans">Include Campaign Analytics Meta-Header</label>
          </div>
          <button id="hub-generate-campaign-btn" class="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer">
            Generate Campaign URL
          </button>
        </div>
        
        <div id="hub-generated-result-block" class="hidden p-4 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2 animate-scale-up">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-indigo-400 font-black font-mono tracking-wider">GENERATED URL FOR SELECTED LEADER:</span>
            <button id="hub-copy-campaign-btn" class="text-xs text-indigo-400 hover:text-indigo-300 underline font-bold cursor-pointer transition-colors">Copy Link</button>
          </div>
          <p id="hub-custom-link-output" class="text-xs text-white font-mono break-all select-all leading-relaxed"></p>
        </div>
      </div>
    </div>

    <!-- Offline QR Code Generator Card -->
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
      <div class="space-y-2">
        <h2 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-qrcode text-emerald-400 text-lg"></i>
          <span>Offline Agent Registration QR Nodes</span>
        </h2>
        <p class="text-xs text-slate-400 leading-relaxed max-w-lg font-sans">
          Display a high-density QR matrix for physical walk-up registrations. Candidates can scan directly with mobile cameras to connect without referral typing errors.
        </p>
        <button id="hub-open-qr-btn" class="mt-2 bg-slate-950 hover:bg-slate-850 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all border border-slate-800 active:scale-95 cursor-pointer">
          <i class="fa-solid fa-qrcode"></i>
          <span>Generate QR Matrix</span>
        </button>
      </div>
      
      <div class="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center p-2.5 shadow-inner border border-slate-800 shrink-0">
        <i class="fa-solid fa-qrcode text-emerald-400 text-4xl"></i>
      </div>
    </div>
  </div>

  <!-- ================= SUB-TAB 3: LIVE PENDING AGENT APPROVALS QUEUE ================= -->
  <div id="hub-tab-content-approvals" class="hidden space-y-4 animate-fade-in">
    <!-- Filter Bar -->
    <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-filter text-emerald-400 text-sm"></i>
        <span class="text-xs text-white font-bold">Pending Live Candidates Queue: <strong class="text-emerald-400">Active Review</strong></span>
      </div>
      <div class="flex items-center gap-1 text-[11px] font-mono text-slate-400">
        <span>REALTIME VERIFICATION</span>
      </div>
    </div>

    <!-- Approvals List Container -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="hub-approvals-list-container">
      <!-- Populated dynamically via admin.js -->
    </div>

    <!-- Empty Queue Placeholder State -->
    <div class="hidden flex-col items-center justify-center p-16 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800" id="hub-empty-queue-state">
      <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
        <i class="fa-solid fa-circle-check text-2xl"></i>
      </div>
      <h3 class="text-sm font-black text-white tracking-wide">All Approvals Cleared</h3>
      <p class="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed font-sans">There are currently no active candidate registrations pending review in the system node.</p>
    </div>
  </div>

  <!-- ================= MODAL: QUICK AGENT CASH LOAD ================= -->
  <div class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 hidden" id="leader-cash-modal">
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-800 text-left relative animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
            <i class="fa-solid fa-wallet text-lg"></i>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider">Agent Cash Load / টাকা রিফিল</h3>
            <p class="text-[11px] text-slate-400 font-sans" id="modal-leader-subtitle">Load funds into agent purse</p>
          </div>
        </div>
        <button id="leader-close-cash-modal-btn" class="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form id="modal-agent-cash-form" class="space-y-4 text-xs font-mono">
        <input type="hidden" id="modal-cash-target-username" />
        
        <!-- Target Agent Info Card -->
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-500 uppercase block">Selected Agent</span>
            <span id="modal-cash-agent-name" class="text-sm font-black text-white">@agent</span>
            <span id="modal-cash-agent-district" class="text-[10px] text-emerald-400 block font-sans">Dhaka</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-500 uppercase block">Current Balance</span>
            <span id="modal-cash-agent-balance" class="text-base font-black text-amber-400">৳0.00</span>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Load Amount (৳)</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400 font-bold text-sm">৳</span>
            <input type="number" step="1" min="10" id="modal-cash-amount" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-white font-bold outline-none focus:border-amber-500 text-sm transition" placeholder="e.g. 5000" />
          </div>
        </div>

        <!-- Preset Pills in Modal -->
        <div class="grid grid-cols-4 gap-2">
          <button type="button" class="modal-preset-btn bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-center font-bold text-[11px] active:scale-95 cursor-pointer transition" data-val="1000">+৳1,000</button>
          <button type="button" class="modal-preset-btn bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-center font-bold text-[11px] active:scale-95 cursor-pointer transition" data-val="5000">+৳5,000</button>
          <button type="button" class="modal-preset-btn bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-center font-bold text-[11px] active:scale-95 cursor-pointer transition" data-val="10000">+৳10,000</button>
          <button type="button" class="modal-preset-btn bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-center font-bold text-[11px] active:scale-95 cursor-pointer transition" data-val="20000">+৳20,000</button>
        </div>

        <!-- Optional Note -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Note / Reference (Optional)</label>
          <input type="text" id="modal-cash-note" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-amber-500 font-sans transition" placeholder="e.g. Physical cash received / Weekly deposit float" />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          <button type="button" id="modal-cash-cancel-btn" class="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition active:scale-95 cursor-pointer">
            Cancel
          </button>
          <button type="submit" id="modal-cash-confirm-btn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-bolt"></i>
            <span>Load Balance</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Offline QR Modal Popup -->
  <div class="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 hidden" id="hub-qr-modal">
    <div class="bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-800 text-center relative animate-scale-up">
      <button id="hub-close-qr-modal-btn-top" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-all cursor-pointer border border-slate-800">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
      <h3 class="text-sm font-black text-white uppercase tracking-wider mb-1">Offline Registration Matrix</h3>
      <p class="text-xs text-slate-400 mb-5 font-sans">Scan this node to connect sub-agent registration directly under <span id="hub-qr-leader-label" class="text-white font-bold font-mono">@leader</span>.</p>
      
      <div class="bg-white p-5 rounded-2xl inline-block shadow-xl mb-5 border border-slate-200">
        <svg class="w-44 h-44 fill-slate-950" viewBox="0 0 24 24">
          <path d="M2,2H10V10H2V2M4,4V8H8V4H4M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M18,14V18H22V14H18M14,18H16V22H14V18M18,20H22V24H18V20M12,2H14V6H12V2M12,8H14V12H12V8M6,12H8V14H6V12M12,14H14V18H12V14M16,12H18V14H16V12M2,12H4V14H2V12M20,12H22V14H20V12Z"></path>
        </svg>
      </div>
      
      <p id="hub-qr-badge-code" class="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/40 py-2 px-4 rounded-xl mb-5 uppercase tracking-widest font-bold">@LEADER-OFFLINE-NODE</p>
      <button id="hub-close-qr-modal-btn" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black cursor-pointer active:scale-95 shadow-md transition-all">Done / সম্পন্ন</button>
    </div>
  </div>

  <!-- ================= MODAL: ADD NEW AGENT LEADER ================= -->
  <div class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 hidden" id="leader-add-modal">
    <div class="bg-slate-900 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-800 text-left relative animate-scale-up space-y-4 max-h-[95vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow">
            <i class="fa-solid fa-user-plus text-lg"></i>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider">Add Agent Leader / নতুন এজেন্ট লিডার</h3>
            <p class="text-[11px] text-slate-400 font-sans">Onboard a verified district recruiting leader</p>
          </div>
        </div>
        <button id="leader-close-add-modal-btn" class="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <form id="modal-add-leader-form" class="space-y-3.5 text-xs font-mono">
        <!-- Username -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Username / ইউজারনেম (Lowercase, no spaces)</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">@</span>
            <input type="text" id="add-leader-username" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-white font-bold outline-none focus:border-emerald-500 text-sm transition" placeholder="e.g. agent_sylhet" />
          </div>
        </div>

        <!-- Phone Number -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Phone Number / মোবাইল নাম্বার</label>
          <input type="tel" id="add-leader-phone" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 text-sm transition" placeholder="e.g. 01700000000" />
        </div>

        <!-- Email Address -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Email Address / ইমেইল</label>
          <input type="email" id="add-leader-email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 text-sm transition" placeholder="e.g. sylhet@agent.app" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- District Selector -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold">District / জেলা</label>
            <select id="add-leader-district" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 transition cursor-pointer">
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
              <option value="Comilla">Comilla</option>
              <option value="Coxs Bazar">Cox's Bazar</option>
            </select>
          </div>

          <!-- Commission Rate -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold">Commission / কমিশন %</label>
            <input type="number" step="0.1" min="0" max="100" id="add-leader-commission" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 transition" value="5.0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Initial Purse Balance -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold">Initial Balance / ব্যালেন্স (৳)</label>
            <input type="number" step="10" min="0" id="add-leader-balance" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 transition" value="5000" />
          </div>

          <!-- Plain Password -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] uppercase font-bold">Password / পাসওয়ার্ড</label>
            <input type="text" id="add-leader-password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 transition" value="123456" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-3">
          <button type="button" id="modal-add-cancel-btn" class="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition active:scale-95 cursor-pointer">
            Cancel
          </button>
          <button type="submit" id="modal-add-confirm-btn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-user-plus"></i>
            <span>Register Leader</span>
          </button>
        </div>
      </form>
    </div>
  </div>

</div>
