<!-- ================= ADMIN TAB: VIDEO BOUNTY (SEPARATE VIEW) ================= -->
<div id="admin-tab-video-bounty" class="hidden space-y-6">
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl text-xs font-mono">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
      <div>
        <h3 class="text-sm font-bold uppercase text-rose-500 tracking-wider flex items-center gap-1.5 font-display">
          <i class="fa-solid fa-video animate-pulse"></i> TikTok & Reels Bounty Manager
        </h3>
        <p class="text-[10px] text-slate-500 mt-0.5 font-sans">Approve with ৳100 - ৳500 reward balance credit or reject player video review applications.</p>
      </div>
      <i class="fa-solid fa-gift text-slate-700 text-xl"></i>
    </div>

    <!-- Stats & Filters Info -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-slate-950 p-3 rounded-2xl border border-slate-850">
        <span class="text-[8px] text-slate-500 uppercase block">Pending Review</span>
        <span id="admin-bounty-pending-count" class="text-xs font-black text-amber-500 mt-1 block">0 claims</span>
      </div>
      <div class="bg-slate-950 p-3 rounded-2xl border border-slate-850">
        <span class="text-[8px] text-slate-500 uppercase block">Approved Claims</span>
        <span id="admin-bounty-approved-count" class="text-xs font-black text-emerald-500 mt-1 block">0 claims</span>
      </div>
      <div class="bg-slate-950 p-3 rounded-2xl border border-slate-850">
        <span class="text-[8px] text-slate-500 uppercase block">Total Payouts</span>
        <span id="admin-bounty-total-payout" class="text-xs font-black text-rose-400 mt-1 block">৳0</span>
      </div>
      <div class="bg-slate-950 p-3 rounded-2xl border border-slate-850">
        <span class="text-[8px] text-slate-500 uppercase block">Min Views Target</span>
        <span class="text-xs font-black text-cyan-400 mt-1 block">2,000+</span>
      </div>
    </div>

    <!-- Claims List -->
    <div class="space-y-3">
      <h4 class="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
        <span>📋 Bounty Applications List</span>
        <span id="admin-bounties-sub-stats" class="text-rose-400 font-sans text-[9px] font-semibold text-right">0 pending reviews</span>
      </h4>
      
      <div id="admin-bounties-list" class="space-y-3 font-sans">
        <!-- Dynamically populated via JS -->
      </div>
    </div>
  </div>
</div>
