<!-- ================= TAB: MEGA PROGRESSIVE JACKPOT SYSTEM (SEPARATE VIEW) ================= -->
<div id="tab-jackpot" class="hidden space-y-6">
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button class="tab-selector-btn w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer" data-tab="home">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">Mega Jackpot Room</h2>
      <p class="text-[9px] text-slate-500 font-mono">Real-time progressive multiplier lottery pool</p>
    </div>
  </div>

  <!-- Progressive Jackpot Main Card -->
  <div class="bg-gradient-to-r from-purple-955 via-indigo-950 to-slate-900 border border-indigo-500/40 p-6 rounded-3xl relative overflow-hidden shadow-2xl font-mono text-center">
    <!-- Glow background -->
    <div class="absolute -right-20 -top-20 w-44 h-44 bg-purple-500/15 rounded-full blur-[50px] pointer-events-none"></div>
    <div class="absolute -left-20 -bottom-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-[50px] pointer-events-none"></div>
    
    <i class="fa-solid fa-gem text-amber-400 text-3xl animate-bounce mb-2 block mx-auto"></i>
    <span class="text-[9px] uppercase font-bold text-indigo-405 tracking-widest block">GRAND PROGRESSIVE JACKPOT POOL</span>
    
    <span id="tab-jackpot-pool-amount" class="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-250 block scale-y-105 tracking-tight my-2">৳84,250.00</span>
    
    <div class="inline-flex items-center gap-2 text-[10px] bg-slate-950/60 border border-slate-850 px-3 py-1 rounded-full text-slate-300 mt-1">
      <span>Next Jackpot Draw:</span>
      <span id="tab-jackpot-countdown" class="text-purple-300 font-bold bg-purple-950/50 px-1.5 py-0.5 rounded">02h : 45m : 12s</span>
    </div>

    <!-- Ticket custom bulk buy container -->
    <div class="mt-6 max-w-sm mx-auto bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-3.5">
      <div class="flex justify-between items-center text-[11px] text-slate-400">
        <span>Select Tickets Amount:</span>
        <span class="text-white font-bold text-xs" id="jackpot-bulk-cost">৳20.00</span>
      </div>
      
      <div class="grid grid-cols-5 gap-1.5">
        <button class="jp-qty-btn bg-purple-950/30 border border-purple-500/30 text-white rounded-lg py-1.5 font-bold hover:bg-slate-800 text-xs active:scale-95 transition" data-qty="1">1x</button>
        <button class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 font-bold hover:bg-slate-850 text-xs active:scale-95 transition" data-qty="5">5x</button>
        <button class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 font-bold hover:bg-slate-855 text-xs active:scale-95 transition" data-qty="10">10x</button>
        <button class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 font-bold hover:bg-slate-855 text-xs active:scale-95 transition" data-qty="20">20x</button>
        <button class="jp-qty-btn bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 font-bold hover:bg-slate-855 text-xs active:scale-95 transition" data-qty="50">50x</button>
      </div>

      <input type="hidden" id="jackpot-selected-qty" value="1" />

      <button id="tab-buy-jackpot-btn" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 rounded-xl text-xs text-white font-extrabold shadow-lg hover:scale-[1.01] active:scale-95 transition cursor-pointer border border-purple-400/20 block">
        Buy Ticket Entry
      </button>

      <div class="text-[9px] text-purple-400 font-extrabold text-center" id="tab-jackpot-user-entries">
        Your Entries: 0 tickets
      </div>
    </div>

    <p class="text-[9px] text-slate-500 block mt-4 leading-relaxed max-w-md mx-auto">
      * Premium ticket rate is standard <span id="tab-jackpot-ticket-price-info" class="text-purple-400 font-bold">৳20.00</span>. 1.5% of ticket purchases gets instantly added into this progressive grand jackpot pool!
    </p>
  </div>

  <!-- Entries Purchased History List -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center justify-between border-b border-slate-850 pb-2 font-mono">
      <span class="flex items-center gap-1.5"><i class="fa-solid fa-history text-purple-500"></i> Active Ticket Registrations</span>
      <span class="text-slate-500 text-[8px] font-mono tracking-normal capitalize" id="jackpot-active-counter">0 total purchased</span>
    </h3>
    
    <div class="overflow-x-auto font-mono text-[10px]">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-850 pb-1.5 text-slate-500 text-[9px] uppercase font-bold tracking-wider">
            <th class="py-1.5">Player</th>
            <th class="py-1.5 text-center">Qty Purchased</th>
            <th class="py-1.5 text-center">Cost Amount</th>
            <th class="py-1.5 text-right">Date Time</th>
          </tr>
        </thead>
        <tbody id="jackpot-registrations-tbody" class="divide-y divide-slate-800/40 text-[11px]">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
  </div>
</div>
