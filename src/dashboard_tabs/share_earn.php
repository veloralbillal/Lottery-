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

  <!-- Milestone Progress Bar Container -->
  <div id="refer-milestone-progress-container" class="space-y-3"></div>

  <!-- Interactive Calculator Estimator Container -->
  <div id="refer-calculator-container" class="space-y-3"></div>

  <!-- High Converting Marketing Templates Container -->
  <div id="refer-marketing-templates-container" class="space-y-3"></div>

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

  <!-- ================= TIERED AGENT & SUB-AGENT AFFILIATE TREE ================= -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 font-mono">
      <i class="fa-solid fa-sitemap text-emerald-400"></i> Tiered Agent & Sub-Agent Affiliate Tree
    </h3>
    
    <p class="text-[9px] text-slate-400 font-mono leading-relaxed">
      Track your direct downlines (L1), indirect downlines (L2), real-time commission earnings, and request instant payouts.
    </p>

    <!-- Stat Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
      <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span class="block text-[7px] text-slate-500 font-black uppercase">Network Size</span>
        <strong id="affiliate-network-size" class="text-[13px] font-black text-cyan-400 block mt-0.5">0 Players</strong>
        <span class="block text-[6px] text-slate-600">L1 + L2 combined</span>
      </div>
      <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span class="block text-[7px] text-slate-500 font-black uppercase">Total Comms</span>
        <strong id="affiliate-total-earned" class="text-[13px] font-black text-emerald-400 block mt-0.5">৳0.00</strong>
        <span class="block text-[6px] text-slate-600">Lifetime accumulated</span>
      </div>
      <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span class="block text-[7px] text-slate-500 font-black uppercase">Paid Payouts</span>
        <strong id="affiliate-payouts-total" class="text-[13px] font-black text-amber-400 block mt-0.5">৳0.00</strong>
        <span class="block text-[6px] text-slate-600">Approved withdrawals</span>
      </div>
      <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span class="block text-[7px] text-slate-500 font-black uppercase">Available Wallet</span>
        <strong id="affiliate-available-purse" class="text-[13px] font-black text-pink-400 block mt-0.5">৳0.00</strong>
        <span class="block text-[6px] text-slate-600">Unwithdrawn balance</span>
      </div>
    </div>

    <!-- Active Tree View Selector / Display -->
    <div class="space-y-2.5">
      <span class="block text-[8px] text-slate-500 uppercase font-black font-mono">Affiliate Tree Interactive Nodes (Click to Expand L2)</span>
      <div class="space-y-2 font-mono" id="affiliate-tree-root">
        <!-- Renders interactive tree structure -->
      </div>
    </div>

    <!-- Payout Request Area -->
    <div class="border-t border-slate-800/80 pt-3.5 space-y-3 font-mono">
      <span class="block text-[8px] text-slate-500 uppercase font-black"><i class="fa-solid fa-wallet text-pink-400"></i> Commission Cashout Request</span>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-900">
        <!-- Form to request payout -->
        <div class="space-y-2.5">
          <div>
            <label class="block text-[7px] text-slate-500 uppercase font-black mb-1">Select Gateway</label>
            <select id="affiliate-payout-gateway" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500">
              <option value="bkash">bKash Personal</option>
              <option value="nagad">Nagad Personal</option>
              <option value="rocket">Rocket Personal</option>
              <option value="transfer">Transfer to Main Balance (Instant)</option>
            </select>
          </div>
          <div>
            <label class="block text-[7px] text-slate-500 uppercase font-black mb-1">Account Number (not required for Main Transfer)</label>
            <input id="affiliate-payout-account" type="text" placeholder="e.g. 017XXXXXXXX" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200 outline-none placeholder-slate-600 focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-[7px] text-slate-500 uppercase font-black mb-1">Cashout Amount (৳)</label>
            <div class="flex gap-1">
              <input id="affiliate-payout-amount" type="number" step="10" min="50" placeholder="Min ৳50" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200 outline-none placeholder-slate-600 focus:border-emerald-500">
              <button id="affiliate-payout-max-btn" class="bg-slate-800 hover:bg-slate-700 text-white px-2 rounded-lg text-[8px] font-bold uppercase cursor-pointer">Max</button>
            </div>
          </div>
          <button id="affiliate-submit-payout-btn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black py-2 rounded-xl text-[9px] uppercase cursor-pointer shadow-md transition-all">Submit Commission Payout</button>
        </div>

        <!-- History of Payout requests -->
        <div class="space-y-2">
          <label class="block text-[7px] text-slate-500 uppercase font-black border-b border-slate-900/40 pb-1 flex justify-between">
            <span>Payout Request Logs</span>
            <span class="text-[6px] text-slate-600">(Simulated auto-approval ready)</span>
          </label>
          <div id="affiliate-payout-logs" class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            <!-- Dynamic payout request entries -->
            <div class="text-[8px] text-slate-600 text-center py-4">No payout activities recorded yet.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
