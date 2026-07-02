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

    <!-- Container for deposit withdrawal lists -->
    <div id="history-list-container" class="space-y-3"></div>
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
