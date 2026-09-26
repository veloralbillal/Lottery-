<!-- ================= TAB: DAILY BOUNTY TASKS SYSTEM (SEPARATE VIEW) ================= -->
<div id="tab-tasks" class="hidden space-y-6">
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button class="tab-selector-btn w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer" data-tab="home">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">Bounty Tasks Room</h2>
      <p class="text-[9px] text-slate-500 font-mono">Finish easy tasks and upload screenshots to earn cash</p>
    </div>
  </div>

  <!-- Daily tasks info banner -->
  <div class="bg-gradient-to-r from-slate-900 to-indigo-955/35 border border-indigo-900/30 p-4 rounded-3xl flex items-center justify-between gap-4 font-sans text-xs">
    <div class="space-y-1">
      <span class="text-purple-400 font-extrabold uppercase text-[9px] tracking-wider block font-mono">PRO VERIFICATION PROTOCOLS</span>
      <p class="text-slate-300 leading-relaxed text-[10px]">
        Click "Open task Link" to view target channel or post. Grab a high-res screenshot of task execution and submit using upload buttons. Admin team reviews submissions to dispatch wallet balance!
      </p>
    </div>
    <i class="fa-solid fa-circle-check text-2xl text-purple-400 shrink-0"></i>
  </div>

  <!-- User Daily bounty task items -->
  <div id="user-daily-tasks-list" class="space-y-4">
    <!-- Dynamically populated via JS -->
  </div>
</div>
