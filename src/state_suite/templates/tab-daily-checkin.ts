export const template = `<!-- ================= TAB: DAILY CHECK-IN REWARDS (SEPARATE PAGE) ================= -->
<div id="tab-daily-checkin" class="hidden space-y-5">
  <!-- Top Header with Back Button -->
  <div class="flex items-center justify-between bg-slate-900/95 p-3 rounded-2xl border border-emerald-500/30 shadow-lg">
    <div class="flex items-center gap-3">
      <button type="button" class="tab-selector-btn w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 hover:text-white hover:border-emerald-500/40 transition cursor-pointer active:scale-95" data-tab="home" title="Back to Home">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
      </button>
      <div>
        <h2 class="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
          <i data-lucide="calendar" class="w-4 h-4 text-emerald-400"></i>
          <span>Daily Check-In</span>
        </h2>
        <p class="text-[9px] text-slate-400 font-mono">৭-দিনের ধারাবাহিক লগইন রিওয়ার্ড ও ভিআইপি বোনাস</p>
      </div>
    </div>
    <span id="daily-checkin-status-badge" class="text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-mono">
      READY
    </span>
  </div>

  <!-- Main 7-Day Streak Card -->
  <div class="bg-gradient-to-br from-[#0f172a] via-[#0b0f19] to-[#111d24] border border-emerald-500/35 p-5 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
    <div class="absolute -right-12 -top-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-12 -bottom-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Streak Info -->
    <div class="bg-slate-950/80 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between font-mono relative z-10">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-orange-400">
          <i data-lucide="flame" class="w-5 h-5 animate-pulse"></i>
        </div>
        <div>
          <span class="text-[8.5px] uppercase tracking-wider text-slate-400 block">Current Streak</span>
          <span id="daily-checkin-streak-val" class="text-xs font-black text-emerald-400">0 of 7 Consecutive Days</span>
        </div>
      </div>
      <div class="text-right">
        <span class="text-[8.5px] uppercase tracking-wider text-slate-400 block">VIP Boost</span>
        <span id="daily-checkin-vip-mult" class="text-xs font-black text-amber-300">1.0x</span>
      </div>
    </div>

    <!-- 7-Day Grid -->
    <div id="daily-checkin-grid" class="grid grid-cols-4 sm:grid-cols-7 gap-2.5 font-mono text-center relative z-10">
      <!-- Dynamically populated -->
    </div>

    <!-- Sponsor Task Locker Panel -->
    <div id="daily-checkin-task-locker" class="hidden bg-slate-950/90 border border-amber-500/40 p-4 rounded-2xl space-y-3 text-center relative z-10">
      <div class="space-y-1">
        <span class="text-[10px] font-black text-amber-400 uppercase tracking-wider block font-mono">🔒 আজকের বোনাস আনলক করুন</span>
        <p id="daily-checkin-sponsor-instruction" class="text-[11px] text-slate-300 font-sans leading-relaxed">
          আজকের ডেইলি চেক-ইন বোনাস আনলক করতে স্পন্সর লিংক ভিজিট করে ভেরিফাই করুন।
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <a id="daily-checkin-sponsor-btn" href="https://google.com" target="_blank" rel="noopener noreferrer" class="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-[11px] py-2.5 px-4 rounded-xl text-center cursor-pointer transition shadow-lg flex items-center justify-center gap-1.5">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          <span id="daily-checkin-sponsor-btn-text">স্পন্সর লিংক ভিজিট করুন</span>
        </a>
        <button type="button" id="daily-checkin-verify-btn" class="bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-mono font-black text-[11px] py-2.5 px-4 rounded-xl transition cursor-pointer active:scale-95">
          Verify & Unlock ✓
        </button>
      </div>
    </div>

    <!-- Claim Action Button -->
    <button type="button" id="daily-checkin-claim-btn" class="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition cursor-pointer active:scale-[0.99] shadow-lg shadow-emerald-500/20 border border-emerald-300/40 font-mono uppercase tracking-wider flex items-center justify-center gap-2 relative z-10">
      <i data-lucide="gift" class="w-4 h-4"></i>
      <span>Claim Today's Streak Reward</span>
    </button>

    <p class="text-[9.5px] text-slate-500 text-center font-sans leading-relaxed relative z-10">
      * প্রতিদিন ধারাবাহিকভাবে চেক-ইন করলে বোনাস বাড়তে থাকে। ১ দিন মিস হলে স্ট্রিক রিসেট হবে।
    </p>
  </div>
</div>
`;
