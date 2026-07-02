<!-- Beautiful Immersive Full-Screen Offline Portal -->
<div id="offline-modal" class="hidden fixed inset-0 bg-slate-950 z-[1050] flex flex-col justify-center items-center p-6 select-none overflow-y-auto transition-all duration-500">
  <!-- High-fidelity background vector glows -->
  <div class="absolute w-[450px] h-[450px] bg-red-650/10 rounded-full blur-[100px] top-1/4 left-1/4 pointer-events-none animate-pulse"></div>
  <div class="absolute w-[450px] h-[450px] bg-amber-600/5 rounded-full blur-[100px] bottom-1/4 right-1/4 pointer-events-none animate-pulse delay-500"></div>

  <!-- Adaptive responsive container -->
  <div class="flex flex-col md:flex-row gap-6 max-w-4xl w-full items-center justify-center relative z-10 scale-95 md:scale-100">

    <!-- Main Locking UI Glass Card -->
    <div class="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-red-500/20 rounded-[32px] p-6 max-w-sm w-full text-center space-y-6 shadow-[0_25px_60px_rgba(239,68,68,0.15)] relative overflow-hidden backdrop-blur-xl">
      <!-- Accent indicator decoration -->
      <div class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>
      
      <!-- Pulsing Network Radar Container -->
      <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
        <!-- Pulse ripple 1 -->
        <div class="absolute inset-0 rounded-full bg-red-650/15 border border-red-500/10 animate-[ping_2s_infinite]"></div>
        <!-- Pulse ripple 2 -->
        <div class="absolute inset-2 rounded-full bg-red-650/10 border border-red-500/10 animate-[ping_3s_infinite_delay-300]"></div>
        
        <!-- Core WiFi Off Circle -->
        <div class="w-16 h-16 bg-gradient-to-b from-red-955/40 to-slate-900 border border-red-500/30 rounded-3xl flex items-center justify-center text-red-500 text-3xl shadow-xl relative preserve-3d group-hover:scale-105 transition-transform duration-300">
          <i class="fa-solid fa-signal text-slate-500/40 text-xl absolute"></i>
          <i class="fa-solid fa-wifi text-red-500 relative z-[2]"></i>
          <!-- Visual lock slash -->
          <div class="absolute w-12 h-1 bg-red-500 rotate-45 rounded-full shadow-lg border border-slate-950 z-[3]"></div>
        </div>
      </div>

      <!-- Warning Title Block -->
      <div class="space-y-2 relative">
        <span class="font-mono text-[9px] tracking-widest text-red-400 font-extrabold uppercase bg-red-955/45 px-3 py-1 rounded-full border border-red-900/30">
          Network Error Detect
        </span>
        <h2 class="text-lg font-black font-display tracking-tight text-white uppercase pt-1">Connection Interrupted</h2>
        <p class="text-[11px] text-slate-400 font-sans leading-relaxed">
          Your internet communication channel dropped. Don't worry! Your live state is preserved. Local actions will sync back securely when you reconnect.
        </p>
      </div>

      <!-- Connection Telemetry Table -->
      <div class="bg-slate-950/80 border border-slate-850/85 p-3.5 rounded-2xl space-y-2.5 font-mono text-[9.5px] text-left">
        <div class="flex justify-between items-center pb-1.5 border-b border-slate-900">
          <span class="text-slate-500">Live Connection</span>
          <span class="text-rose-500 font-bold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> DISCONNECTED
          </span>
        </div>
        <div class="flex justify-between items-center pb-1.5 border-b border-slate-900">
          <span class="text-slate-500">Local DB Status</span>
          <span class="text-emerald-400 font-bold flex items-center gap-1">
            <i class="fa-solid fa-circle-check"></i> READY (OFFLINE)
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">Failed Node API</span>
          <span class="text-slate-400 font-semibold text-right">firebase-firestore.js</span>
        </div>
      </div>

      <!-- Control CTA -->
      <div class="flex flex-col gap-2.5 relative pt-1">
        <button onclick="window.appInstance.checkNetworkStatus()" class="bg-gradient-to-r from-red-655 to-rose-600 hover:opacity-90 text-white text-[11px] font-black py-3 rounded-xl transition cursor-pointer active:scale-98 shadow-lg shadow-rose-955/30 flex items-center justify-center gap-1.5 group">
          <i class="fa-solid fa-arrows-rotate animate-[spin_6s_linear_infinite] text-rose-200"></i> RETRY LIVE HANDSHAKE
        </button>
        
        <button onclick="document.getElementById('offline-modal').classList.add('hidden')" class="bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/60 text-slate-400 hover:text-slate-200 text-[10px] font-medium py-2 rounded-xl transition-colors cursor-pointer">
          CONTINUE IN READ-ONLY MODE
        </button>
      </div>
    </div>

    <!-- 3D LUCKY COIN FLIP MATCH GAME CARD -->
    <div class="bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 border border-slate-800/80 rounded-[32px] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <!-- Ambient glowing decoration -->
      <div class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
      
      <div class="flex items-center justify-between border-b border-slate-850 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="text-cyan-400"><i class="fa-solid fa-gamepad animate-pulse text-sm"></i></span>
          <span class="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider">Lucky Flip Pair Game</span>
        </div>
        <span id="offline-score-badge" class="font-mono text-[9.5px] uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 bg-amber-955/40 border border-amber-500/20 px-2 py-0.5 rounded-full">Score: 0</span>
      </div>

      <p class="text-[10.5px] text-slate-400 font-sans leading-relaxed">
        Internet offline? Let's play! Flip card pairs to trigger matching symbols and get double safety tickets.
      </p>

      <!-- Game Grid -->
      <div id="offline-game-grid" class="grid grid-cols-4 gap-2 pt-1 select-none">
        <!-- Populated dynamically with beautiful 3D flip card elements -->
      </div>

      <div class="pt-2">
        <button onclick="window.appInstance.restartOfflineGame()" class="bg-slate-950 border border-slate-850 hover:border-slate-800 text-cyan-400 hover:text-cyan-300 font-mono text-[9.5px] py-2 px-4 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 w-full cursor-pointer">
          <i class="fa-solid fa-rotate-right text-[10px]"></i> RESET CARD DECK
        </button>
      </div>
    </div>

  </div>
</div>

<!-- ================= CLOUD SYNC DIAGNOSTICS MODAL ================= -->
<div id="cloud-sync-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1050] flex items-center justify-center p-4">
  <div class="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden">
    <!-- Glowing accent border -->
    <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-50 blur-xl pointer-events-none"></div>
    
    <div class="flex justify-between items-center border-b border-slate-850 pb-3 relative">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-cloud-arrow-up text-cyan-400 text-lg"></i>
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-200">Cloud Sync Monitor</h3>
      </div>
      <button onclick="document.getElementById('cloud-sync-modal').classList.add('hidden')" class="text-slate-500 hover:text-slate-300 transition text-sm">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Pulse Status Panel -->
    <div class="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex items-center gap-4 relative">
      <div class="w-12 h-12 rounded-xl bg-cyan-955/40 border border-cyan-800/30 flex items-center justify-center text-cyan-400 text-xl shrink-0" id="sync-modal-icon-container">
        <i class="fa-solid fa-circle-notch animate-spin text-cyan-400" id="sync-modal-icon"></i>
      </div>
      <div class="space-y-1">
        <span class="text-[9px] uppercase font-mono text-slate-500 block">Current Status</span>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" id="sync-modal-dot"></span>
          <span class="text-xs font-black text-white uppercase tracking-wider" id="sync-modal-state-text">Synced</span>
        </div>
        <span class="text-[10px] text-slate-400 block" id="sync-modal-state-subtext">Connected to Google Cloud</span>
      </div>
    </div>

    <!-- Sync Stats List -->
    <div class="bg-slate-950/40 border border-slate-850/50 p-4 rounded-2xl space-y-3 font-mono text-[10px]">
      <div class="flex justify-between border-b border-slate-850 pb-2">
        <span class="text-slate-500">Sync Engine</span>
        <span class="text-slate-300 font-bold">Google Firebase Firestore</span>
      </div>
      <div class="flex justify-between border-b border-slate-850 pb-2">
        <span class="text-slate-500">Database ID</span>
        <span class="text-cyan-400 font-bold text-[9px] truncate max-w-[155px]" id="sync-modal-project-id">Firestore Core</span>
      </div>
      <div class="flex justify-between border-b border-slate-850 pb-2">
        <span class="text-slate-500">Registered Players</span>
        <span class="text-slate-300 font-bold" id="sync-stat-users">--</span>
      </div>
      <div class="flex justify-between border-b border-slate-850 pb-2">
        <span class="text-slate-500 font-mono">Lotteries / Pools</span>
        <span class="text-slate-300 font-bold" id="sync-stat-pools">--</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Last Synced Status</span>
        <span class="text-emerald-400 font-bold" id="sync-stat-time">Synced Just Now</span>
      </div>
    </div>

    <!-- Action triggers -->
    <div class="flex flex-col gap-2 relative">
      <button id="sync-manual-trigger-btn" class="bg-gradient-to-r from-cyan-600 to-rose-600 hover:opacity-90 text-white text-xs font-black py-3 rounded-xl transition cursor-pointer active:scale-98 flex items-center justify-center gap-2">
        <i class="fa-solid fa-arrows-rotate" id="sync-manual-icon"></i> <span>Sync & Refresh Data</span>
      </button>
      
      <button onclick="document.getElementById('cloud-sync-modal').classList.add('hidden')" class="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 text-[10px] subpixel-antialiased font-bold py-2 px-4 rounded-xl transition">
        Close Panel
      </button>
    </div>

    <!-- Friendly Bengali Instruction -->
    <p class="text-[9px] text-slate-500 text-center font-sans leading-normal">
      💡 আপনার সমস্ত ডেটা গুগুল ক্লাউডে রিয়েল-টাইমে সুরক্ষিতভাবে সংরক্ষণ এবং সিঙ্ক করা হচ্ছে।
    </p>
  </div>
</div>
