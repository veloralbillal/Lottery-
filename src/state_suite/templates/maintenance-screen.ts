export const maintenanceScreenTemplate = `
    <!-- ================= SCREEN 1: MAINTENANCE LOCK SCREEN ================= -->
    <div id="screen-maintenance" class="hidden fixed inset-0 bg-slate-950 flex flex-col justify-between p-6 z-50 overflow-y-auto">
      <div class="my-auto max-w-md w-full mx-auto text-center space-y-6">
        <div class="w-20 h-20 bg-rose-950/40 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-500 text-3xl animate-pulse">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="space-y-2">
          <h1 class="text-2xl font-black font-display tracking-tight text-white uppercase">System Upgrading</h1>
          <p id="maintenance-text" class="text-xs text-slate-400 font-medium px-4 leading-relaxed"></p>
        </div>

        <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-3 font-mono text-left text-xs max-w-xs mx-auto">
          <div class="flex justify-between border-b border-slate-800 pb-2">
            <span class="text-slate-500">Service Area</span>
            <span class="text-cyan-400 font-bold">Dhaka, BD (Inward)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Security Build</span>
            <span class="text-white font-bold">v<span id="maintenance-apk-ver">5.2.0</span></span>
          </div>
        </div>

        <a id="maintenance-apk-link" href="#" class="inline-block bg-gradient-to-r from-cyan-500 to-rose-500 hover:scale-103 text-white text-xs font-black py-3.5 px-8 rounded-2xl shadow-xl shadow-cyan-500/10 transition active:opacity-90">
          <i class="fa-solid fa-download mr-1.5 animate-bounce"></i> Download Latest Android APK
        </a>
      </div>

      <div class="text-center text-[10px] text-slate-600 font-mono">
        <span class="hover:text-slate-400 cursor-pointer select-none transition" id="exit-maintenance-backdoor" onclick="if(window.openBypass){window.openBypass();}">
          Developer Backlogin
        </span>
      </div>
    </div>
`;
