<!-- ================= TAB: EVENTS (PROMOTIONS & BANNER SLIDER) ================= -->
<div id="tab-events" class="hidden space-y-4">
  <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-3xl flex items-center gap-3">
    <div class="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-lg shrink-0">
      <i class="fa-solid fa-bullhorn animate-pulse"></i>
    </div>
    <div>
      <h3 class="text-xs font-bold text-white">Interactive Events & Special Offers</h3>
      <p class="text-[10px] text-slate-500 font-mono">Stay updated with our latest promotions and event giveaways.</p>
    </div>
  </div>

  <!-- Full Screen Popup Event Embed Card -->
  <div id="embedded-popup-event-card" class="bg-gradient-to-b from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden hidden">
    <!-- Neon grid background accent -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-50"></div>
    
    <div class="relative z-10 space-y-3.5">
      <div class="flex items-center justify-between">
        <span class="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[8.5px] font-mono px-3 py-1 rounded-full uppercase font-black tracking-widest flex items-center gap-1.5">
          <i class="fa-solid fa-gift animate-pulse text-[9.5px]"></i> LIVE EVENT GIVEAWAY
        </span>
        <span class="text-[9px] text-rose-500 font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">Active Now</span>
      </div>

      <div class="rounded-2xl overflow-hidden border border-slate-850 h-36 relative bg-slate-950">
        <img id="embedded-event-img" src="" alt="Promo Banner" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      </div>

      <div class="space-y-1.5">
        <h3 id="embedded-event-title" class="text-xs md:text-sm font-black text-white font-sans tracking-tight"></h3>
        <p id="embedded-event-message" class="text-[10px] md:text-xs text-slate-350 leading-relaxed font-sans"></p>
      </div>

      <button id="embedded-event-action-btn" class="w-full bg-gradient-to-r from-cyan-500 to-rose-600 hover:scale-101 text-white text-xs font-black py-3 rounded-xl shadow-xl transition active:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer">
        <span id="embedded-event-action-text">Explore Offer</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
      </button>
    </div>
  </div>

  <!-- Fallback if no active announcements/slides -->
  <div id="events-empty-fallback" class="bg-slate-950/40 border border-slate-900 rounded-3xl p-8 text-center space-y-2 hidden">
    <div class="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
      <i class="fa-solid fa-hourglass-empty"></i>
    </div>
    <h4 class="text-xs font-bold text-slate-400">No active events or promotions right now</h4>
    <p class="text-[10px] text-slate-600 font-sans max-w-xs mx-auto">Check back later! We regularly launch special token giveaways, cashback hours, and milestone pool multipliers.</p>
  </div>
</div>
