<!-- ================= TAB: HISTORY (PAYMENT LEDGER LOGS & COMMUNITY) ================= -->
<div id="tab-history" class="hidden space-y-4">
  <!-- Dynamic Sub-Tab Selector -->
  <div class="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/60 shadow-lg mb-2">
    <button id="history-subtab-ledger" class="py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/10">
      <i class="fa-solid fa-clock-rotate-left"></i> Payment Ledgers
    </button>
    <button id="history-subtab-community" class="py-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 text-slate-400 bg-transparent hover:text-white">
      <i class="fa-solid fa-users"></i> Community Space
    </button>
  </div>

  <!-- Ledgers Container -->
  <div id="tab-history-ledger-section" class="space-y-4">
    <div class="flex justify-between items-center border-b border-slate-800 pb-2">
      <h2 class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Live Payments History</h2>
      <span class="text-[9px] uppercase font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">Real-time ledger</span>
    </div>

    <!-- Ledger Stats Dashboard -->
    <div class="grid grid-cols-3 gap-2 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-3 rounded-2xl font-mono text-xs shadow-md">
      <div class="space-y-0.5 text-center border-r border-slate-850/60">
        <span class="text-[8px] text-slate-500 uppercase block font-bold">Deposited</span>
        <span id="ledger-stats-deposit" class="text-emerald-400 font-extrabold text-[11px]">৳0</span>
      </div>
      <div class="space-y-0.5 text-center border-r border-slate-850/60">
        <span class="text-[8px] text-slate-500 uppercase block font-bold">Withdrawn</span>
        <span id="ledger-stats-withdraw" class="text-rose-400 font-extrabold text-[11px]">৳0</span>
      </div>
      <div class="space-y-0.5 text-center">
        <span class="text-[8px] text-slate-500 uppercase block font-bold">Pending</span>
        <span id="ledger-stats-pending" class="text-amber-400 font-extrabold text-[11px]">0 Req</span>
      </div>
    </div>

    <!-- Advanced Search & Multi-Filters Panel -->
    <div class="bg-slate-950 border border-slate-850/80 p-3 rounded-2xl space-y-2.5 font-mono text-[10px]">
      <div class="relative flex items-center bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden px-2.5">
        <i class="fa-solid fa-magnifying-glass text-slate-500 text-[10px] mr-2"></i>
        <input type="text" id="ledger-search-input" placeholder="Search by TRX / Method / Amount..." class="w-full bg-transparent border-none text-[10.5px] text-white py-1.5 outline-none placeholder-slate-600" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-[8px] text-slate-500 uppercase font-bold block">Type filter</label>
          <select id="ledger-filter-type" class="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer focus:border-rose-500/80">
            <option value="all">📁 All Types</option>
            <option value="deposit">📥 Deposits</option>
            <option value="withdraw">📤 Withdrawals</option>
            <option value="other">⚙️ Adjustments/Bonus</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-[8px] text-slate-500 uppercase font-bold block">Status filter</label>
          <select id="ledger-filter-status" class="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer focus:border-rose-500/80">
            <option value="all">🔍 All Statuses</option>
            <option value="approved">🟢 Approved</option>
            <option value="pending">🟡 Pending</option>
            <option value="declined">🔴 Declined</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Container for deposit withdrawal lists -->
    <div id="history-list-container" class="space-y-2.5"></div>
  </div>

  <!-- Detailed Receipt Overlay Modal -->
  <div id="ledger-receipt-modal" class="hidden fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-fade-in font-mono text-xs">
      <!-- Receipt Header Top bar -->
      <div class="bg-gradient-to-r from-red-600 to-rose-600 p-4 text-center relative">
        <button type="button" id="ledger-receipt-close-btn" class="absolute right-4 top-4 text-white/85 hover:text-white text-sm cursor-pointer">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
        <i class="fa-solid fa-receipt text-white text-2xl mb-1 block animate-bounce"></i>
        <h3 class="text-xs font-black text-white uppercase tracking-wider">Transaction Invoice</h3>
        <p class="text-[9px] text-red-100 uppercase tracking-widest mt-0.5">Lottery Winner Portal</p>
      </div>

      <!-- Receipt Content -->
      <div class="p-5 space-y-4">
        <!-- Amount Block -->
        <div class="text-center py-2 border-b border-dashed border-slate-800">
          <span class="text-[8px] text-slate-500 uppercase block font-bold">Transaction Amount</span>
          <span id="receipt-amount" class="text-xl font-black text-white">৳0.00</span>
          <span id="receipt-status-badge" class="inline-block mt-1 px-2.5 py-0.5 rounded text-[8px] font-bold"></span>
        </div>

        <!-- Meta list -->
        <div class="space-y-2 text-[10px]">
          <div class="flex justify-between">
            <span class="text-slate-500">Operation Type:</span>
            <span id="receipt-type" class="text-slate-300 font-bold uppercase"></span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Method/Channel:</span>
            <span id="receipt-method" class="text-white font-extrabold"></span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-slate-500">Reference:</span>
            <span id="receipt-reference" class="text-slate-300 select-all font-mono"></span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Timestamp:</span>
            <span id="receipt-date" class="text-slate-400"></span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">System Gateway Fee:</span>
            <span class="text-slate-500 font-bold">৳0.00 (Free)</span>
          </div>
        </div>

        <!-- Decorative barcode representation -->
        <div class="text-center pt-2 space-y-1 border-t border-dashed border-slate-800">
          <div class="text-[20px] font-sans tracking-[0.25em] text-slate-600 select-none">||||| | |||| ||| |||| | ||</div>
          <p class="text-[8px] text-slate-500">Secure cryptographic checkout authorization ledger slip</p>
        </div>

        <!-- Action tools -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button id="receipt-copy-ref-btn" class="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 rounded-xl transition cursor-pointer text-[9px] flex items-center justify-center gap-1">
            <i class="fa-solid fa-copy"></i> Copy Ref
          </button>
          <button id="receipt-download-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl transition cursor-pointer text-[9px] flex items-center justify-center gap-1">
            <i class="fa-solid fa-download"></i> Save Receipt
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Community Container -->
  <div id="tab-history-community-section" class="hidden space-y-4">
    <!-- Consent View (Shown or hidden based on consent verification state) -->
    <div id="community-consent-block" class="hidden bg-slate-900 border border-slate-800/60 p-5 rounded-3xl text-center space-y-4 shadow-xl">
      <div class="w-12 h-12 bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-lg border border-rose-900/30">
        <i class="fa-solid fa-user-shield"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-xs font-bold text-white uppercase tracking-wider">Public Profile Consent Needed</h3>
        <p class="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto font-sans">
          To open the Lottery Winner Community tab, write posts, comment, and look at live draw winners, please grant permission to share your **Username, Email Address, and Lotteries won** on the community space.
        </p>
      </div>
      <button id="community-grant-consent-btn" type="button" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.01] text-white text-xs font-bold py-3 rounded-xl shadow-lg transition">
        Agree & Share My Details
      </button>
    </div>

    <!-- Active Feed (Hidden if consent is missing) -->
    <div id="community-active-feed" class="hidden space-y-4">
      <!-- Live Wins Hall of Fame -->
      <div class="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-3xl space-y-2">
        <h3 class="text-[10px] font-bold uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-trophy text-amber-400 animate-pulse"></i> live lottery winning feed
        </h3>
        <div id="community-wins-list" class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          <!-- Populated dynamically with won ticket slots -->
        </div>
      </div>

      <!-- Create Post section -->
      <div class="bg-slate-900 border border-slate-800/80 p-4 rounded-3xl space-y-3 shadow-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-[10px] text-slate-300 font-bold uppercase font-mono">Create Live Community Post</span>
          </div>
          <span class="text-[8px] text-slate-500">Posting as: <span class="text-cyan-400 font-bold font-mono">@<span class="curr-username"></span></span></span>
        </div>
        <textarea id="community-new-post-text" placeholder="Share your ticket draw excitement or questions with other members..." rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500 resize-none font-sans"></textarea>
        <button id="community-submit-post-btn" type="button" class="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] py-2 px-4 rounded-lg active:scale-95 transition">
          Publish Post To Feed
        </button>
      </div>

      <!-- Community Search & Filtering System -->
      <div class="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-3xl space-y-3 shadow-md font-sans">
        <!-- Search Input with Magnifier Icon -->
        <div class="relative flex items-center bg-slate-950 border border-slate-850 rounded-xl overflow-hidden px-2.5">
          <i class="fa-solid fa-magnifying-glass text-slate-500 text-xs mr-2"></i>
          <input type="text" id="community-search-input" placeholder="Search posts or users..." class="w-full bg-transparent border-none text-xs text-white py-2 outline-none placeholder-slate-600" />
          <button id="community-clear-search-btn" class="hidden text-slate-500 hover:text-white text-xs px-1">
            <i class="fa-solid fa-circle-xmark"></i>
          </button>
        </div>
        <!-- Categories Filters (Pills) -->
        <div class="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          <button class="community-filter-pill px-3 py-1.5 rounded-xl font-bold bg-rose-600 text-white cursor-pointer transition shrink-0" data-filter="recent">
            <i class="fa-solid fa-clock mr-1"></i> Recent
          </button>
          <button class="community-filter-pill px-3 py-1.5 rounded-xl font-bold bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition shrink-0" data-filter="most-liked">
            <i class="fa-solid fa-heart text-rose-500 mr-1"></i> Most Liked
          </button>
          <button class="community-filter-pill px-3 py-1.5 rounded-xl font-bold bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition shrink-0" data-filter="my-posts">
            <i class="fa-solid fa-user text-cyan-400 mr-1"></i> My Posts
          </button>
        </div>
      </div>

      <!-- Feed Header label -->
      <div class="flex justify-between items-center border-b border-slate-800 pb-1 pt-1">
        <span class="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Posts Stream</span>
        <span class="text-[9px] text-cyan-400 font-mono" id="community-posts-count">0 Posts available</span>
      </div>

      <!-- Feed Posts list stream -->
      <div id="community-posts-feed-container" class="space-y-4">
        <!-- Dynamically loaded posts card with like, dislike, comment inputs & nested comment lists -->
      </div>
    </div>
  </div>
</div>
