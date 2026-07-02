<!-- ================= TAB: REFER & EARN SYSTEM (SEPARATE VIEW) ================= -->
<div id="tab-refer" class="hidden space-y-6">
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button id="refer-back-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">Refer & Earn Program</h2>
      <p class="text-[9px] text-slate-500 font-mono">Invite friends and earn level commissions!</p>
    </div>
  </div>

  <!-- Refer Details & Code Card -->
  <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl font-mono text-xs">
    <h3 class="text-[10px] font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
      <i class="fa-solid fa-share-nodes text-cyan-500"></i> Your Affiliation Code
    </h3>
    
    <div class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-950 p-3 rounded-xl border border-slate-900 relative">
          <span class="block text-[8px] text-slate-500 uppercase font-black">My Refer Code</span>
          <span id="user-refer-code-display" class="block text-xs font-black text-white mt-1 uppercase select-all tracking-wide">NONE</span>
          <button id="copy-refer-code-btn" class="absolute right-2 top-2 p-1 text-slate-500 hover:text-cyan-400 cursor-pointer transition" type="button">
            <i class="fa-solid fa-copy text-[10px]"></i>
          </button>
        </div>
        
        <div class="bg-slate-950 p-3 rounded-xl border border-slate-900 relative">
          <span class="block text-[8px] text-slate-500 uppercase font-black">Region Level Status</span>
          <span id="user-region-display" class="block text-xs font-black text-pink-400 mt-1 uppercase">DHAKA</span>
        </div>
      </div>

      <!-- Refer URL generator -->
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-900 relative">
        <span class="block text-[8px] text-slate-500 uppercase font-black">Quick Referral Invitation Link</span>
        <span id="user-refer-link-display" class="block text-[9px] font-mono text-cyan-400 mt-1 break-all select-all font-bold">https://live-lottery-winner.net/register?ref=none</span>
        <button id="copy-refer-link-btn" class="absolute right-2 top-2 p-1 text-slate-500 hover:text-cyan-400 cursor-pointer transition" type="button">
          <i class="fa-solid fa-copy text-[10px]"></i>
        </button>
      </div>

      <!-- Quick stats tally -->
      <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/85">
          <span class="block text-[7px] text-slate-500 font-bold">TOTAL REFERS</span>
          <strong id="user-refer-total-count" class="text-xs font-black text-amber-400 block mt-0.5">0</strong>
        </div>
        <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/85">
          <span class="block text-[7px] text-slate-500 font-bold">LEVEL TIERS</span>
          <strong id="user-refer-level-display" class="text-[8px] font-black text-rose-400 block mt-1">LV0: Cadet</strong>
        </div>
        <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/85">
          <span class="block text-[7px] text-slate-500 font-bold">TOTAL PROFITS</span>
          <strong id="user-refer-earned-display" class="text-xs font-black text-emerald-400 block mt-0.5">৳0.00</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- Dynamic Refer Bonus Levels list cards -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 font-mono">
      <i class="fa-solid fa-circle-nodes text-yellow-500 animate-pulse"></i> Referral Badges & Level Milestones
    </h3>
    
    <div id="user-refer-levels-list" class="space-y-2.5 font-mono text-[10px]">
      <!-- Dynamic user level items based on database levels configuration -->
    </div>
  </div>

  <!-- Leaderboard top referrers -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 font-mono">
      <i class="fa-solid fa-trophy text-amber-400"></i> Top Recruiter Champion Leaderboard
    </h3>
    
    <div class="overflow-x-auto font-mono text-[10px]">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 pb-1.5 text-slate-500 text-[9px] uppercase font-bold tracking-wider">
            <th class="py-1">Rank</th>
            <th class="py-1">Recruiter</th>
            <th class="py-1 text-center">Invites</th>
            <th class="py-1 text-right">Prize Bonus</th>
          </tr>
        </thead>
        <tbody id="user-refer-leaderboard-body" class="divide-y divide-slate-800/50 text-[11px]">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
  </div>

  <!-- Referred friends list -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
    <h3 class="text-[10px] font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 font-mono">
      <i class="fa-solid fa-people-carry-box text-cyan-400"></i> My Referred Members
    </h3>
    <div id="user-referred-friends-list" class="space-y-2 text-xs font-mono">
      <!-- Dynamically rendered -->
    </div>
  </div>
</div>
