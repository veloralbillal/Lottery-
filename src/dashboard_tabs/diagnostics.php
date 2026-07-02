<!-- ================= FEATURE 2: FLOATING CONNECTION DIAGNOSTICS STRIP ================= -->
<div id="dashboard-network-diagnostic-strip" class="fixed bottom-[65px] left-1/2 -translate-x-1/2 z-30 max-w-sm w-[92%] bg-slate-900/90 border border-slate-800/80 rounded-2xl py-2 px-3.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-2.5 font-mono text-[9px] text-slate-450 select-none animate-in fade-in duration-300">
  <div class="flex items-center gap-2">
    <!-- Transmitting signal locator -->
    <span class="relative flex h-2 w-2">
      <span id="dashboard-network-ping-pulse" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span id="dashboard-network-dot" class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span class="text-slate-300">Sync Status:</span>
    <span id="dashboard-network-label" class="text-emerald-400 font-extrabold uppercase">ONLINE (SECURE)</span>
  </div>
  <div class="flex items-center gap-3">
    <span id="dashboard-network-latency" class="text-slate-500 font-bold">Ping: <strong id="curr-ping-val" class="text-emerald-400 font-mono">24ms</strong></span>
    <button id="dashboard-network-test-btn" onclick="window.appInstance.runPingSpeedtest()" class="bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-black px-2 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer">
      <i class="fa-solid fa-gauge-high text-[8.5px] text-rose-500"></i> Speedtest
    </button>
  </div>
</div>
