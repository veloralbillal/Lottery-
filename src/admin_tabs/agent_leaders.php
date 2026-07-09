<!-- ================= ADMIN TAB: AGENT LEADERS ================= -->
<div id="admin-tab-agent-leaders" class="hidden space-y-6">
  
  <!-- LIST VIEWPORT -->
  <div id="agent-leaders-list-view" class="space-y-6">
    <!-- Header -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-base font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-crown text-amber-500"></i> Agent Leaders Registry
          </h3>
          <p class="text-xs text-slate-500 font-mono">Top-tier agents with recruitment authority and performance missions.</p>
        </div>
        
        <!-- Search Bar -->
        <div class="relative w-full sm:w-72 font-sans">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-550">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input id="agent-leaders-search-input" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-white outline-none focus:border-rose-500 font-sans text-xs" placeholder="Search by username, email, phone..." />
        </div>
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4 font-mono text-xs">
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Total Agent Leaders</span>
          <span id="agent-leaders-stat-count" class="text-base font-black text-white block mt-0.5">0 Leaders</span>
        </div>
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Recruited Sub-Agents</span>
          <span id="agent-leaders-stat-subs" class="text-base font-black text-cyan-400 block mt-0.5">0 Sub-agents</span>
        </div>
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Active Missions Tracker</span>
          <span id="agent-leaders-stat-missions" class="text-base font-black text-emerald-400 block mt-0.5">0 Active</span>
        </div>
      </div>
    </div>

    <!-- Leaders List Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="overflow-x-auto font-sans">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
              <th class="p-3">Leader Account</th>
              <th class="p-3">Assigned District</th>
              <th class="p-3">Balance & Commission</th>
              <th class="p-3">Sub-Agents Count</th>
              <th class="p-3">Monthly Progress</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="agent-leaders-list-tbody" class="divide-y divide-slate-800/50">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- DETAIL VIEWPORT -->
  <div id="agent-leaders-detail-view" class="hidden space-y-6">
    <!-- Back Header -->
    <div class="flex items-center gap-3">
      <button id="agent-leaders-detail-back-btn" class="bg-slate-900 hover:bg-slate-800 text-slate-300 font-black py-2 px-4 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
        <i class="fa-solid fa-arrow-left"></i> Back to Leaders List
      </button>
      <span class="text-slate-600 font-mono text-xs">/ System Operations / Agent Leader Details</span>
    </div>

    <!-- Leader Profile Card & Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- General profile info -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-950/40">
            <span id="detail-leader-avatar-initial">A</span>
          </div>
          <div>
            <h4 class="text-base font-black text-white" id="detail-leader-username">@username</h4>
            <span class="bg-rose-950 text-rose-400 border border-rose-900/40 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold" id="detail-leader-district-badge">DHAKA</span>
          </div>
        </div>

        <div class="border-t border-slate-800/80 pt-4 space-y-3.5 font-mono text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Email:</span>
            <span class="text-slate-300 select-all" id="detail-leader-email">dhaka@agents.app</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Phone:</span>
            <span class="text-slate-300 select-all" id="detail-leader-phone">01700000000</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Account Status:</span>
            <span class="font-bold uppercase text-emerald-400" id="detail-leader-status-lbl">ACTIVE</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Wallet Balance:</span>
            <span class="text-rose-400 font-bold" id="detail-leader-balance-lbl">৳0.00</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Commission Rate:</span>
            <span class="text-emerald-400 font-bold" id="detail-leader-commission-lbl">5.0%</span>
          </div>
        </div>

        <!-- Edit shortcuts -->
        <button id="detail-leader-edit-profile-btn" class="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
          <i class="fa-solid fa-user-gear"></i> Edit Agent Credentials
        </button>
      </div>

      <!-- Performance target mission card -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h4 class="text-sm font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-bullseye text-rose-500"></i> Monthly Target & Mission Performance
          </h4>
          <p class="text-xs text-slate-550 font-sans">Active sales quotas, target pools, and reward tracking for this calendar month.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Target Ticket Sales</span>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-black text-white font-mono" id="detail-leader-target-tickets">0</span>
              <span class="text-xs text-slate-500">tickets</span>
            </div>
            <span class="text-[9.5px] text-slate-600 block leading-tight font-sans">Required monthly booking volume</span>
          </div>

          <div class="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Mission Cash Reward</span>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-black text-emerald-400 font-mono" id="detail-leader-target-reward">৳0.00</span>
            </div>
            <span class="text-[9.5px] text-slate-600 block leading-tight font-sans">Claimable upon quota completion</span>
          </div>
        </div>

        <!-- Progress bar and countdown -->
        <div class="bg-slate-950/40 p-5 border border-slate-850 rounded-2xl space-y-4">
          <div class="flex justify-between items-center text-xs font-mono">
            <div>
              <span class="text-slate-500 uppercase tracking-wide">Target Pool Filter:</span>
              <strong class="text-white ml-1 font-sans" id="detail-leader-target-pool">Any Active Pool</strong>
            </div>
            <div>
              <span class="text-slate-500 uppercase tracking-wide">Progress Rate:</span>
              <strong class="text-cyan-400 ml-1" id="detail-leader-progress-pct">0%</strong>
            </div>
          </div>

          <!-- Progress bar track -->
          <div class="relative w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div id="detail-leader-progress-bar" class="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10.5px] font-mono border-t border-slate-850/60 pt-3">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500">Tickets Logged:</span>
              <strong class="text-white" id="detail-leader-progress-val">0 / 0 Tickets</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-550">Mission Status:</span>
              <span id="detail-leader-mission-badge" class="font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-rose-950/60 text-rose-400">UNFINISHED</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-Agents Registry Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div>
        <h4 class="text-sm font-black text-white flex items-center gap-2">
          <i class="fa-solid fa-users text-indigo-400"></i> Recruited Sub-Agents Network (Operators)
        </h4>
        <p class="text-xs text-slate-500 font-sans">Individual sub-agents managed by this leader, including their commission structures and transaction counts.</p>
      </div>

      <div class="overflow-x-auto font-sans">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
              <th class="p-3">Sub-Agent Operator</th>
              <th class="p-3">Wallet Balance</th>
              <th class="p-3">Comm. Rate</th>
              <th class="p-3">Direct Bookings</th>
              <th class="p-3">Target Quota</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody id="detail-leader-subagents-tbody" class="divide-y divide-slate-800/40">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

  </div>

</div>
