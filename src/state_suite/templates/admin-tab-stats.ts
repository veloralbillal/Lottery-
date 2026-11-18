export const template = `
      <!-- ================= ADMIN TAB: DASHBOARD STATISTICS ================= -->
      <div id="admin-tab-stats" class="space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
            <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Total Users</span>
            <span id="admin-stat-users" class="text-2xl font-black text-white tabular-nums">0</span>
            <div class="h-1 w-full bg-slate-950 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-blue-500 w-1/3"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
            <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Total Deposits</span>
            <span id="admin-stat-deposits" class="text-2xl font-black text-emerald-400 tabular-nums">৳0</span>
            <div class="h-1 w-full bg-slate-950 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-emerald-500 w-1/2"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
            <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Total Withdraws</span>
            <span id="admin-stat-withdraws" class="text-2xl font-black text-rose-400 tabular-nums">৳0</span>
            <div class="h-1 w-full bg-slate-950 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-rose-500 w-1/4"></div>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
            <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Active Tickets</span>
            <span id="admin-stat-tickets" class="text-2xl font-black text-amber-400 tabular-nums">0</span>
            <div class="h-1 w-full bg-slate-950 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-amber-500 w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- System Performance & Live Logs -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl font-mono text-[10px]">
          <h3 class="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-cyan-400"></i>
            Live System Pulse
          </h3>
          <div id="admin-live-logs" class="bg-slate-950 rounded-2xl p-4 h-48 overflow-y-auto space-y-1.5 text-slate-400">
            <div class="flex gap-2">
              <span class="text-emerald-500">[INFO]</span>
              <span>System core initialized. Ready for operations.</span>
            </div>
          </div>
        </div>
      </div>
`;
