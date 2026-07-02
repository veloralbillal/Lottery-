<!-- ================= TAB: BADGE REQUEST SYSTEM (SEPARATE VIEW) ================= -->
<div id="tab-badge-request" class="hidden space-y-6">
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button id="badge-request-back-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">Apply for Premium Badge</h2>
      <p class="text-[9px] text-slate-500 font-mono">Unlock a special title badge to distinguish your profile!</p>
    </div>
  </div>

  <!-- Quick requirements banner -->
  <div class="bg-gradient-to-r from-rose-950/20 to-slate-950 p-4 border border-rose-500/20 rounded-2xl text-slate-400 text-[10px] space-y-1.5 font-mono">
    <h4 class="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
      <i class="fa-solid fa-circle-info"></i> How does it work?
    </h4>
    <p class="leading-relaxed">
      Once submitted, your request is reviewed by the system administrators. They will inspect your win stats, forum contribution points, and account history to grant the preferred custom badge dynamically.
    </p>
  </div>

  <!-- Form to submit badge request -->
  <div class="bg-slate-905 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 font-mono">
      <i class="fa-solid fa-signature text-rose-500"></i> Badge Request Forms
    </h3>

    <div class="space-y-4 text-xs font-mono">
      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Choose Desired Badge Title</label>
        <select id="user-badge-req-select" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 px-3 text-white outline-none cursor-pointer">
          <option value="vip">💎 VIP Player (Active lottery legend)</option>
          <option value="moderator">🛡️ Staff Mod (Supports community safety checks)</option>
          <option value="star">⭐ Elite Star (Outstanding player)</option>
          <option value="premium">✨ Premium member (Active contributor)</option>
          <option value="pro">🔥 Pro Active (Hardcore gamer master)</option>
          <option value="legend">👑 Royal Legend (Supreme VIP status)</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Justification logic (Reason/Message)</label>
        <textarea id="user-badge-req-reason" rows="3" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl p-3 text-white outline-none resize-none" placeholder="Explain why you deserve this premium badge status... (e.g. 'I support other players and keep things friendly')"></textarea>
      </div>

      <button id="user-submit-badge-req-btn" class="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black py-3 rounded-xl transition cursor-pointer hover:scale-[1.01] shadow-lg flex items-center justify-center gap-1.5 text-xs">
        <i class="fa-solid fa-paper-plane mr-0.5"></i> Submit Badge Request
      </button>
    </div>
  </div>

  <!-- Previous Badge Request List History -->
  <div class="space-y-3">
    <h3 class="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
      <i class="fa-solid fa-list-check"></i> Request history & status
    </h3>
    <div id="user-badge-reqs-history-list" class="space-y-2.5">
      <!-- Inline items populated via JS -->
    </div>
  </div>
</div>
