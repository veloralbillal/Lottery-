<!-- ================= TAB: RECOVERY (ACCOUNT RECOVERY & KEYS) ================= -->
<div id="tab-recovery" class="hidden space-y-6">

  <!-- Header Branding Board -->
  <div class="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-6 rounded-3xl text-center space-y-4 shadow-2xl transition duration-500 hover:border-slate-700/60">
    <!-- Atmospheric glows -->
    <div class="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
    <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

    <div class="relative w-20 h-20 mx-auto group">
      <!-- Animated outer pulse border ring -->
      <div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-500 to-emerald-500 opacity-60 group-hover:opacity-100 blur-[2px] animate-pulse transition duration-700"></div>
      
      <!-- Core icon mask -->
      <div class="relative w-20 h-20 bg-slate-950 border-2 border-slate-900 text-amber-400 rounded-full flex items-center justify-center text-3xl overflow-hidden shadow-inner">
        <i class="fa-solid fa-key-skeleton"></i>
      </div>
    </div>

    <div class="space-y-1">
      <h3 class="text-lg font-black text-white font-display tracking-tight uppercase">Recovery Console</h3>
      <p class="text-[9px] text-amber-500 font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
        <span class="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
        SECURE ACCOUNT RESTORATION KEYS
      </p>
    </div>
  </div>

  <!-- Account Master Recovery Key Section -->
  <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-5 shadow-xl text-xs font-mono">
    <div class="flex justify-between items-center border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-amber-950 border border-amber-900 flex items-center justify-center">
          <i class="fa-solid fa-shield-halved text-amber-400 text-xs"></i>
        </div>
        <div>
          <h4 class="text-xs font-black text-white uppercase tracking-tight">Your Master Recovery Key</h4>
          <p class="text-[8px] text-slate-500 font-sans tracking-tight">Used to reset your passphrase if you are locked out of the portal.</p>
        </div>
      </div>
    </div>

    <!-- Instructions / Information -->
    <div class="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 text-[9.5px] text-slate-400 leading-relaxed font-sans space-y-2">
      <p>
        A <strong class="text-amber-400 font-semibold">Master Recovery Code</strong> is a high-entropy cryptographic passkey bound directly to your user account profile records. 
      </p>
      <p>
        If you lose your login password or are locked out due to security checks, you can visit the <strong class="text-white">Forgot Password Portal</strong> and submit this code to perform an immediate system-authoritative password bypass and reset.
      </p>
      <div class="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2 text-[9px] text-amber-500">
        <i class="fa-solid fa-circle-exclamation text-amber-500 text-[10px] mt-0.5"></i>
        <span><strong>CRITICAL WARNING:</strong> Keep this code completely private. Anyone with access to this code can reset your password and take full control of your lottery balances!</span>
      </div>
    </div>

    <!-- Active Code Generator or Display Container -->
    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-4 relative overflow-hidden">
      <!-- Background mesh detail -->
      <div class="absolute inset-0 opacity-[0.01] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 16px 16px;"></div>

      <div class="text-center space-y-2">
        <span class="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">ACTIVE MASTER RECOVERY PASSKEY</span>
        
        <!-- Code output block -->
        <div id="recovery-key-display-box" class="py-3 px-4 bg-slate-900 border border-slate-850 rounded-xl text-center flex items-center justify-center gap-3">
          <span id="recovery-active-key" class="text-sm md:text-base font-black text-white tracking-widest font-mono select-all">NOT GENERATED YET</span>
          <button type="button" id="recovery-copy-key-btn" class="hidden text-amber-400 hover:text-amber-300 p-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:scale-105 transition cursor-pointer" title="Copy Key to Clipboard">
            <i class="fa-solid fa-copy text-xs"></i>
          </button>
        </div>

        <p id="recovery-key-hint-lbl" class="text-[9px] text-slate-500 font-sans">You have not generated an account recovery key yet.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 pt-2">
        <!-- Generate Code Button -->
        <button type="button" id="recovery-generate-btn" class="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black py-2.5 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20 uppercase tracking-wider">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Master Key
        </button>

        <!-- Save/Download offline backup button -->
        <button type="button" id="recovery-download-btn" class="hidden flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-wider">
          <i class="fa-solid fa-download"></i> Save Backup File
        </button>
      </div>
    </div>
  </div>

  <!-- Recovery Navigation Footer Options -->
  <div class="space-y-3">
    <!-- Navigate Back to Profile -->
    <button id="recovery-back-btn" class="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center">
          <i class="fa-solid fa-arrow-left text-slate-400 text-xs"></i>
        </div>
        <div>
          <span class="text-xs font-bold text-white block">Back to Profile Options</span>
          <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Return to your main identity card and personal stats center</span>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right text-slate-700 text-xs"></i>
    </button>
  </div>

</div>
