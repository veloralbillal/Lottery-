<!-- ================= ADMIN TAB: SUB-AGENTS LIST ================= -->
<div id="admin-tab-subagents-list" class="hidden space-y-6">

  <!-- LIST VIEWPORT -->
  <div id="subagents-list-view" class="space-y-6">
    <!-- Header -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-base font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-users text-indigo-400"></i> Sub-Agents Registry
          </h3>
          <p class="text-xs text-slate-500 font-mono">Field operator accounts recruited under parent agent leaders.</p>
        </div>
        
        <!-- Search Bar -->
        <div class="relative w-full sm:w-72 font-sans">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-550">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input id="subagents-list-search-input" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-white outline-none focus:border-indigo-500 font-sans text-xs" placeholder="Search sub-agents..." />
        </div>
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4 font-mono text-xs">
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Active Operators</span>
          <span id="subagents-list-stat-count" class="text-base font-black text-white block mt-0.5">0 Sub-agents</span>
        </div>
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Total Sales Volume</span>
          <span id="subagents-list-stat-sales" class="text-base font-black text-indigo-400 block mt-0.5">৳0.00</span>
        </div>
        <div class="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
          <span class="text-[10px] text-slate-500 font-bold uppercase block">Total Direct Players</span>
          <span id="subagents-list-stat-players" class="text-base font-black text-emerald-400 block mt-0.5">0 Players</span>
        </div>
      </div>
    </div>

    <!-- Subagents List Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="overflow-x-auto font-sans">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
              <th class="p-3">Sub-Agent Operator</th>
              <th class="p-3">Parent Leader</th>
              <th class="p-3">Balance & Commission</th>
              <th class="p-3">Direct Bookings</th>
              <th class="p-3">Mission Quota</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="subagents-list-tbody" class="divide-y divide-slate-800/50">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- DETAIL VIEWPORT -->
  <div id="subagents-detail-view" class="hidden space-y-6">
    <!-- Back Header -->
    <div class="flex items-center gap-3">
      <button id="subagents-detail-back-btn" class="bg-slate-900 hover:bg-slate-800 text-slate-300 font-black py-2 px-4 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
        <i class="fa-solid fa-arrow-left"></i> Back to Sub-Agents List
      </button>
      <span class="text-slate-600 font-mono text-xs">/ System Operations / Sub-Agent Details</span>
    </div>

    <!-- Profile Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- General profile info -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-950/40">
            <span id="detail-sub-avatar-initial">S</span>
          </div>
          <div>
            <h4 class="text-base font-black text-white" id="detail-sub-username">@operator</h4>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-slate-500 font-mono text-[9px] uppercase">Leader:</span>
              <span class="text-amber-400 font-mono text-[10px] font-bold" id="detail-sub-parent-lbl">@leader</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-800/80 pt-4 space-y-3.5 font-mono text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Email:</span>
            <span class="text-slate-300 select-all" id="detail-sub-email">sub@agents.app</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Phone:</span>
            <span class="text-slate-300 select-all" id="detail-sub-phone">01800000000</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Operator Status:</span>
            <span class="font-bold uppercase text-emerald-400" id="detail-sub-status-lbl">ACTIVE</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Balance:</span>
            <span class="text-indigo-400 font-bold" id="detail-sub-balance-lbl">৳0.00</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Commission Rate:</span>
            <span class="text-emerald-400 font-bold" id="detail-sub-commission-lbl">3.0%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-550">Total Bookings:</span>
            <span class="text-white font-bold" id="detail-sub-bookings-lbl">0 Sales</span>
          </div>
        </div>

        <button id="detail-sub-edit-profile-btn" class="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
          <i class="fa-solid fa-user-gear"></i> Edit Operator Settings
        </button>
      </div>

      <!-- Performance target mission card -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h4 class="text-sm font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-flag text-indigo-400"></i> Monthly Mission & Targets Progress
          </h4>
          <p class="text-xs text-slate-550 font-sans">Performance-based wallet rewards added automatically upon achieving targets.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Required Sales Quota</span>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-black text-white font-mono" id="detail-sub-target-tickets">0</span>
              <span class="text-xs text-slate-500">tickets</span>
            </div>
            <span class="text-[9.5px] text-slate-600 block leading-tight font-sans">Operator target for this calendar month</span>
          </div>

          <div class="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-1">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Operator Reward Cash</span>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-black text-emerald-400 font-mono" id="detail-sub-target-reward">৳0.00</span>
            </div>
            <span class="text-[9.5px] text-slate-600 block leading-tight font-sans">Credit added immediately upon completion</span>
          </div>
        </div>

        <!-- Progress bar and countdown -->
        <div class="bg-slate-950/40 p-5 border border-slate-850 rounded-2xl space-y-4">
          <div class="flex justify-between items-center text-xs font-mono">
            <div>
              <span class="text-slate-500 uppercase tracking-wide">Target Pool Filter:</span>
              <strong class="text-white ml-1 font-sans" id="detail-sub-target-pool">Any Active Pool</strong>
            </div>
            <div>
              <span class="text-slate-500 uppercase tracking-wide">Target Accomplished:</span>
              <strong class="text-indigo-400 ml-1" id="detail-sub-progress-pct">0%</strong>
            </div>
          </div>

          <!-- Progress bar track -->
          <div class="relative w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div id="detail-sub-progress-bar" class="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10.5px] font-mono border-t border-slate-850/60 pt-3">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500">Tickets Logged:</span>
              <strong class="text-white" id="detail-sub-progress-val">0 / 0 Tickets</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-550">Mission Quota Status:</span>
              <span id="detail-sub-mission-badge" class="font-bold py-0.5 px-2 rounded text-[9px] uppercase tracking-wider bg-rose-950/60 text-rose-400">UNFINISHED</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Players registered under this sub-agent -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div>
        <h4 class="text-sm font-black text-white flex items-center gap-2">
          <i class="fa-solid fa-users text-emerald-400"></i> Customers Referred / Registered Players
        </h4>
        <p class="text-xs text-slate-500 font-sans">All players registered directly under this operator account, including their transaction states.</p>
      </div>

      <div class="overflow-x-auto font-sans">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
              <th class="p-3">Player Details</th>
              <th class="p-3">Wallet Balance</th>
              <th class="p-3">Registration Email</th>
              <th class="p-3">Phone Number</th>
              <th class="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody id="detail-sub-players-tbody" class="divide-y divide-slate-800/40">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

  </div>

</div>
