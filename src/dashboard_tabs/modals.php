<!-- Beautiful dialog with input form instead of prompt() -->
<div id="maintenance-backdoor-modal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-start justify-center p-4 z-[999] md:items-center overflow-y-auto">
  <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto">
    <div class="space-y-1">
      <h3 class="text-sm font-black font-display text-white uppercase tracking-wider flex items-center gap-2">
        <i class="fa-solid fa-shield-halved text-cyan-400 font-bold"></i> Administrative Access
      </h3>
      <p class="text-[10px] text-slate-500">Provide the master security passphrase key to authenticate developer bypass.</p>
    </div>
    
    <div class="space-y-1.5">
      <label class="block text-[9px] uppercase font-mono text-slate-400">Passphrase Code</label>
      <div class="relative">
        <i class="fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
        <input type="password" id="backdoor-pass-input" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-cyan-400" placeholder="••••••••" />
      </div>
    </div>

    <div id="backdoor-error-msg" class="hidden text-[10px] text-rose-400 font-mono bg-rose-955/25 border border-rose-900/30 p-2.5 rounded-xl flex items-center gap-1.5">
      <i class="fa-solid fa-triangle-exclamation"></i> Invalid developer signature.
    </div>

    <div class="flex gap-2 pt-2">
      <button id="backdoor-cancel-btn" type="button" class="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 font-semibold text-xs py-2.5 rounded-xl transition">
        Dismiss
      </button>
      <button id="backdoor-submit-btn" type="button" class="flex-1 bg-gradient-to-r from-cyan-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shrink-0">
        Verify Access
      </button>
    </div>
  </div>
</div>

<!-- ================= MODAL: REPORT IN-APP FORM DIALOG ================= -->
<div id="community-report-modal" class="hidden fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-start justify-center p-4 z-[999] font-sans md:items-center overflow-y-auto">
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto">
    <div class="flex items-start justify-between">
      <div class="space-y-0.5">
        <h3 class="text-sm font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-triangle-exclamation animate-pulse"></i> Submit Safety Report
        </h3>
        <p class="text-[10px] text-slate-500 font-sans">Flag inappropriate content for immediate Administrator review.</p>
      </div>
      <button id="community-report-close-btn" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <input type="hidden" id="report-modal-target-id" />
    <input type="hidden" id="report-modal-target-type" />

    <div class="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
      <span class="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Reported Content Preview</span>
      <p id="report-modal-content-preview" class="text-[10px] text-slate-300 italic truncate font-sans"></p>
      <span class="text-[8px] text-slate-400 block font-mono">Author: <strong class="text-cyan-400" id="report-modal-author-preview">@user</strong></span>
    </div>

    <div class="space-y-1.5 font-sans">
      <label class="block text-[9px] uppercase font-mono text-slate-400 font-bold">Violation Reason</label>
      <select id="report-modal-reason-dropdown" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-white outline-none focus:border-rose-500">
        <option value="Spam / Advertisements / Scams">Spam / Advertisements / Scams</option>
        <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
        <option value="Abusive language / Profanity">Abusive language / Profanity</option>
        <option value="Fraud / Fake win distribution claims">Fraud / Fake win distribution claims</option>
        <option value="Other Safety violations">Other Safety violations</option>
      </select>
    </div>

    <div class="space-y-1.5 font-sans">
      <label class="block text-[9px] uppercase font-mono text-slate-400 font-bold">Additional Context Details (Optional)</label>
      <textarea id="report-modal-details" rows="2" placeholder="Tell us more about the violation rules breached..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none placeholder-slate-700 focus:border-rose-500 resize-none"></textarea>
    </div>

    <div class="grid grid-cols-2 gap-2 pt-1 font-sans">
      <button id="community-report-cancel-btn" type="button" class="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold text-xs py-2 rounded-xl transition">
        Cancel
      </button>
      <button id="community-report-submit-btn" type="button" class="bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs py-2 rounded-xl transition shadow-lg shadow-red-600/10">
        Submit Report
      </button>
    </div>
  </div>
</div>

<!-- Beautiful Fullscreen Task Proof Screenshot Viewer Lightbox -->
<div id="screenshot-viewer-modal" class="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md hidden flex flex-col justify-between p-4 selection:bg-purple-500/20">
  <!-- Lightbox Header -->
  <div class="flex items-center justify-between border-b border-slate-850 pb-3 max-w-5xl w-full mx-auto">
    <div class="space-y-0.5 text-left">
      <span class="text-[8px] uppercase tracking-widest font-mono text-purple-400 font-bold block">TASK PROOF HIGH-RES INSPECTOR</span>
      <h3 id="screenshot-title" class="text-sm font-black text-white font-sans max-w-md truncate">Screenshot Proof</h3>
      <span id="screenshot-meta" class="text-[9.5px] text-slate-400 block font-mono">Submitted by: @username • ৳50.00 Bounty</span>
    </div>
    <div class="flex items-center gap-1.5">
      <button id="screenshot-close-btn" type="button" class="bg-rose-955 border border-rose-950 hover:bg-rose-900 text-rose-400 rounded-xl py-2.5 px-5 text-xs font-black transition flex items-center gap-1.5 cursor-pointer">
        <i class="fa-solid fa-xmark"></i> Close Viewer
      </button>
    </div>
  </div>

  <!-- Lightbox Canvas Viewport (Fixed Screen, No Zoom) -->
  <div class="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center relative overflow-hidden my-4 border border-slate-900 bg-slate-950 rounded-3xl select-none" id="screenshot-viewport">
    <!-- Static Image -->
    <img id="screenshot-large-img" src="" alt="Proof high-res screenshot view" 
         class="max-h-[80vh] max-w-full object-contain select-text cursor-default" />
  </div>
</div>
