<div class="flex flex-col w-full pb-28 font-sans text-slate-100 space-y-3 px-0 sm:px-1 select-none box-border overflow-x-hidden">
  
  <!-- Total Liquid Wallet Purse Card -->
  <div class="flex flex-col relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1626] to-slate-950 p-5 border border-slate-800 shadow-xl">
    <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-bold">TOTAL LIQUID PURSE</span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
      <div class="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800">
        <span class="text-[10px] text-emerald-400 font-mono font-bold">BDT (৳)</span>
      </div>
    </div>
    <div class="flex items-baseline gap-2 mb-2">
      <h1 class="text-3xl font-black text-white font-mono tracking-tight">৳<span class="curr-balance">0</span>.<span class="text-emerald-400">00</span></h1>
    </div>
    <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
      <span>Instant Draw Purchases</span>
      <span class="text-emerald-400 font-bold">Escrow Verified</span>
    </div>
  </div>

  <!-- Primary Action Buttons (Deposit, Withdraw, Agent) -->
  <div class="grid grid-cols-3 gap-2.5">
    <button type="button" onclick="if(window.app){window.app.currentTab='deposit'; window.app.render();}" class="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-[#00f076] hover:bg-[#22ff8f] text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer font-mono uppercase tracking-wide active:scale-95">
      <i class="fa-solid fa-plus text-sm"></i>
      <span>Deposit</span>
    </button>
    <button type="button" onclick="if(window.app){window.app.currentTab='withdraw'; window.app.render();}" class="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-800 font-bold text-xs shadow-lg transition cursor-pointer font-mono uppercase tracking-wide active:scale-95">
      <i class="fa-solid fa-minus text-sm text-rose-400"></i>
      <span>Withdraw</span>
    </button>
    <button type="button" onclick="if(window.app){window.app.currentTab='agent'; window.app.render();}" class="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-800 font-bold text-xs shadow-lg transition cursor-pointer font-mono uppercase tracking-wide active:scale-95">
      <i class="fa-solid fa-headset text-sm text-amber-400"></i>
      <span>Agent Desk</span>
    </button>
  </div>

  <!-- 24H Transaction Limit Allowance -->
  <div class="flex flex-col rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-4 shadow-sm space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase text-white font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-gauge-high text-emerald-400 text-xs"></i>
        <span>24H Limit Allowance</span>
      </h2>
      <span class="text-xs text-emerald-400 font-mono font-bold">৳0 / ৳100,000</span>
    </div>
    <div class="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
      <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[0%] rounded-full transition-all"></div>
    </div>
    <p class="text-[10px] text-slate-400 font-sans leading-relaxed">Standard Tier (Level 1). Complete additional lottery draws to increase your daily disbursement quota.</p>
  </div>

  <!-- Quick Transaction History Entry -->
  <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition" onclick="if(window.app){window.app.currentTab='history'; window.app.render();}">
    <div class="flex items-center gap-2.5">
      <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
        <i class="fa-solid fa-clock-rotate-left text-sm text-cyan-400"></i>
      </div>
      <div>
        <h3 class="text-xs font-bold text-white font-mono">Statement & Activity Log</h3>
        <p class="text-[10px] text-slate-400">View deposits, withdrawals & draw winnings</p>
      </div>
    </div>
    <i class="fa-solid fa-chevron-right text-xs text-slate-400"></i>
  </div>
</div>
