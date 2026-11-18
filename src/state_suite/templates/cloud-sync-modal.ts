export const cloudSyncModalTemplate = `
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
          <div class="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center text-cyan-400 text-xl shrink-0" id="sync-modal-icon-container">
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
            <span class="text-cyan-400 font-bold text-[9px] truncate max-w-[155px]" id="sync-modal-project-id" title="ai-studio-974d5483-e694-46e0-8f50-3cc61524c974">ai-studio-974d5483...</span>
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
`;
