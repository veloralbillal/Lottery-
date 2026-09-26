<!-- ================= TAB: SECURE OTP SYSTEM (SEPARATE VIEW) ================= -->
<div id="tab-otp" class="hidden space-y-6">
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button id="otp-back-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">Secure Cashout OTP</h2>
      <p class="text-[9px] text-slate-500 font-mono">Generate and manage secure withdrawal codes</p>
    </div>
  </div>

  <!-- Dynamic OTP Display Card -->
  <div class="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-6 rounded-[32px] text-center space-y-5 shadow-2xl">
    <div class="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>

    <div class="space-y-1">
      <div class="w-12 h-12 mx-auto bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg shadow-cyan-500/10 mb-2">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <h3 class="text-xs font-black font-mono uppercase tracking-wider text-slate-400">Verified Cashout Token</h3>
    </div>

    <!-- OTP Display Box -->
    <div class="bg-slate-950 border-2 border-slate-900/80 rounded-3xl p-6 relative overflow-hidden group">
      <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 16px 16px;"></div>
      <span class="text-[8.5px] text-slate-500 uppercase tracking-widest font-mono font-bold block mb-1">Deduction authorization code</span>
      
      <!-- Big OTP -->
      <div id="dashboard-otp-digits" class="text-4xl font-black text-cyan-400 font-mono tracking-[0.25em] pl-[0.25em] py-2 relative select-all transition duration-300 animate-pulse">
        ------
      </div>
      
      <!-- Status Indicator -->
      <div class="flex items-center justify-center gap-1.5 pt-2 text-[10px] font-mono text-cyan-400">
        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" id="dashboard-otp-dot"></span>
        <span id="dashboard-otp-status">Synchronizing Server...</span>
      </div>
    </div>

    <!-- Progressive Countdown Bar -->
    <div class="space-y-1.5 text-left">
      <div class="flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>OTP Auto-Rotates in:</span>
        <span id="dashboard-otp-countdown" class="font-bold text-white">30s</span>
      </div>
      <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
        <div id="dashboard-otp-progress" class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000 ease-linear" style="width: 100%"></div>
      </div>
    </div>
  </div>

  <!-- Security Information Info Board -->
  <div class="bg-gradient-to-r from-cyan-950/20 to-slate-950 p-4 border border-cyan-500/20 rounded-2xl text-slate-400 text-[10px] space-y-2 font-mono">
    <h4 class="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
      <i class="fa-solid fa-lock"></i> Verification Protocol
    </h4>
    <p class="leading-relaxed">
      Provide this OTP to a verified support agent at any physical or online district cashout counter to authorize deduction from your account balance.
    </p>
    <p class="text-[9px] text-slate-500">
      OTPs expire and rotate every 30 seconds automatically to ensure maximum account security.
    </p>
  </div>
</div>
