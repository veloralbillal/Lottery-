<!-- ================= ADMIN TAB: AGENT LEADERS NETWORK & APPROVAL HUB ================= -->
<div id="admin-tab-agent-leaders" class="hidden space-y-6 animate-fade-in font-sans">
  
  <!-- Top Hero Status & Welcome Banner -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b120c] to-[#121c13] p-6 mb-6 shadow-xl border border-[#233525]">
    <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00e470]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-10 -top-10 w-40 h-40 bg-[#b2ffbe]/5 rounded-full blur-2xl pointer-events-none"></div>
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
      <div>
        <div class="flex items-center gap-2 mb-1.5 text-[11px] font-mono tracking-wider text-[#bacbb8]">
          <span class="text-[#00e470] font-bold">● HUB OPERATIONAL</span>
          <span>·</span>
          <span>SYSTEM NODE ID: AGT-8824</span>
        </div>
        <h1 class="text-2xl font-black text-[#dbe6d8] tracking-tight flex items-center gap-2.5">
          এজেন্ট নেটওয়ার্ক ও অনুমোদন হাব
        </h1>
        <p class="text-xs text-[#bacbb8] mt-1 max-w-xl leading-relaxed">
          Manage system-wide recruiter campaigns, distribute authenticated registration tokens, and process candidate credentials.
        </p>
      </div>
      
      <div class="w-12 h-12 rounded-xl bg-[#1b281d] border border-[#2a3f2d] flex items-center justify-center text-[#00e470] shadow-lg shrink-0">
        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">hub</span>
      </div>
    </div>
    
    <!-- Quick Metrics Strip -->
    <div class="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#233525]/60">
      <div class="bg-[#090f0a]/80 p-4 rounded-xl border border-[#1f3021]/60 transition duration-300 hover:border-[#344d37]">
        <span class="text-[10px] text-[#8ea08d] block font-mono uppercase tracking-widest">Active Agents</span>
        <span id="hub-active-count-stat" class="text-2xl font-black text-[#b2ffbe] block mt-1 font-mono tracking-tight tabular-nums">0</span>
      </div>
      <div class="bg-[#090f0a]/80 p-4 rounded-xl border border-[#1f3021]/60 transition duration-300 hover:border-[#344d37]">
        <span class="text-[10px] text-[#8ea08d] block font-mono uppercase tracking-widest">Pending Review</span>
        <span id="hub-pending-count-stat" class="text-2xl font-black text-[#f4bd75] block mt-1 font-mono tracking-tight tabular-nums">0</span>
      </div>
      <div class="bg-[#090f0a]/80 p-4 rounded-xl border border-[#1f3021]/60 transition duration-300 hover:border-[#344d37]">
        <span class="text-[10px] text-[#8ea08d] block font-mono uppercase tracking-widest">Commission Volume</span>
        <span id="hub-volume-count-stat" class="text-2xl font-black text-[#96baff] block mt-1 font-mono tracking-tight tabular-nums">৳0.00</span>
      </div>
    </div>
  </div>

  <!-- Tab Navigation Switcher -->
  <div class="flex p-1 bg-[#0b120c] rounded-xl mb-6 border border-[#233525]/60 shadow-inner">
    <button id="hub-tab-btn-share" class="flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all bg-[#00e470] text-[#002a11] flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:opacity-95 active:scale-[0.98]">
      <span class="material-symbols-outlined text-[18px]">share</span>
      <span>Share &amp; Tracked Links</span>
    </button>
    <button id="hub-tab-btn-approvals" class="flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all text-[#bacbb8] hover:text-[#dbe6d8] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
      <span class="material-symbols-outlined text-[18px]">verified_user</span>
      <span>Live Candidates Queue</span>
      <span class="px-2 py-0.5 bg-[#4c161a] text-[#ffb4ab] border border-[#ffb4ab]/10 rounded-full text-[10px] font-mono font-bold" id="hub-badge-pending">0</span>
    </button>
  </div>

  <!-- SECTION 1: SHARE & LINKS HUB -->
  <div class="flex flex-col gap-6" id="hub-tab-content-share">
    
    <!-- Recruiter Agent Leader Selection Dropdown -->
    <div class="bg-[#121c13] rounded-2xl p-6 shadow-md border border-[#233525] space-y-4">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-[#00e470] text-[20px]">account_circle</span>
        <h2 class="text-sm font-black text-[#dbe6d8] uppercase tracking-wider">Select Recruiter Agent Leader / লিডার নির্বাচন করুন</h2>
      </div>
      <p class="text-xs text-[#bacbb8] leading-relaxed max-w-2xl">
        All generated links, campaign metrics, and candidate codes will automatically lock to this Leader's reference tree.
      </p>
      
      <div class="relative">
        <select id="hub-leader-select" class="w-full bg-[#0a0f0a] border border-[#233525] text-[#dbe6d8] rounded-xl py-3.5 px-4 outline-none text-xs font-semibold font-mono transition duration-300 focus:border-[#00e470] appearance-none cursor-pointer">
          <!-- Populated dynamically with registered Leaders -->
        </select>
        <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#bacbb8]">
          <span class="material-symbols-outlined text-[18px]">unfold_more</span>
        </div>
      </div>
    </div>

    <!-- Master Referral Link Box -->
    <div class="bg-[#121c13] rounded-2xl p-6 shadow-md border border-[#233525] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[#00e470] text-[20px]">link</span>
          <h2 class="text-sm font-black text-[#dbe6d8] uppercase tracking-wider">Master Registration Link</h2>
        </div>
        <span class="text-[10px] text-[#00e470] bg-[#00e470]/10 border border-[#00e470]/20 px-2.5 py-0.5 rounded-md font-mono font-bold">Tracked Node</span>
      </div>
      
      <div class="flex items-center gap-2 bg-[#0a0f0a] p-2 rounded-xl border border-[#233525] focus-within:border-[#00e470] transition-colors">
        <input id="hub-referral-link-input" type="text" class="bg-transparent text-xs text-[#dbe6d8] w-full px-2 outline-none font-mono tracking-tight select-all" readonly value="https://lotterywinner.app/agent/ref/WINNER_772250?src=app_hub" />
        <button id="hub-copy-master-btn" class="bg-[#00e470] hover:bg-[#00c962] text-[#002a11] px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">content_copy</span>
          <span>Copy URL</span>
        </button>
      </div>

      <!-- Social Quick Share Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button class="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0f0a] hover:bg-[#1a251c] transition-all text-[#dbe6d8] cursor-pointer border border-[#1f2d21] group active:scale-[0.98]" onclick="alert('Sharing Registration Link to WhatsApp Channels...')">
          <i class="fa-brands fa-whatsapp text-[#00e470] text-lg group-hover:scale-110 transition-transform"></i>
          <span class="text-xs font-mono">WhatsApp</span>
        </button>
        <button class="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0f0a] hover:bg-[#1a251c] transition-all text-[#dbe6d8] cursor-pointer border border-[#1f2d21] group active:scale-[0.98]" onclick="alert('Sharing Registration Link to Telegram Channels...')">
          <i class="fa-brands fa-telegram text-[#96baff] text-lg group-hover:scale-110 transition-transform"></i>
          <span class="text-xs font-mono">Telegram</span>
        </button>
        <button class="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0f0a] hover:bg-[#1a251c] transition-all text-[#dbe6d8] cursor-pointer border border-[#1f2d21] group active:scale-[0.98]" onclick="alert('Sharing Registration Link to Messenger Contacts...')">
          <i class="fa-brands fa-facebook-messenger text-[#ffc77e] text-lg group-hover:scale-110 transition-transform"></i>
          <span class="text-xs font-mono">Messenger</span>
        </button>
        <button class="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#0a0f0a] hover:bg-[#1a251c] transition-all text-[#dbe6d8] cursor-pointer border border-[#1f2d21] group active:scale-[0.98]" onclick="alert('Copying Quick SMS Text To Clipboard...')">
          <i class="fa-solid fa-comment-sms text-[#bacbb8] text-lg group-hover:scale-110 transition-transform"></i>
          <span class="text-xs font-mono">Direct SMS</span>
        </button>
      </div>
    </div>

    <!-- Custom Tracked Link Creator Card -->
    <div class="bg-[#121c13] rounded-2xl p-6 shadow-md border border-[#233525] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[#00e470] text-[20px]">add_link</span>
          <h2 class="text-sm font-black text-[#dbe6d8] uppercase tracking-wider">Custom Campaign Builder</h2>
        </div>
        <span class="text-[10px] text-[#bacbb8] font-mono uppercase tracking-wider">Campaign Tracker</span>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="text-[10px] text-[#bacbb8] font-bold uppercase tracking-wider block mb-1.5 font-mono">Zone / Campaign Tag (e.g., Dhaka_Branch, Sylhet_Promo)</label>
          <input id="hub-campaign-name" type="text" class="w-full bg-[#0a0f0a] border border-[#233525] text-white text-xs px-4 py-3.5 rounded-xl outline-none focus:ring-1 focus:ring-[#00e470] focus:border-[#00e470] transition-all font-mono" placeholder="Enter campaign_tag" />
        </div>
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2">
            <input id="hub-sms-track" type="checkbox" checked class="w-4 h-4 accent-[#00e470] rounded cursor-pointer" />
            <label for="hub-sms-track" class="text-xs text-[#bacbb8] cursor-pointer select-none">Include Campaign Analytics Meta-Header</label>
          </div>
          <button id="hub-generate-campaign-btn" class="bg-[#00e470] hover:bg-[#00c962] text-[#002a11] px-5 py-3 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer">
            Generate Campaign URL
          </button>
        </div>
        
        <div id="hub-generated-result-block" class="hidden p-4 bg-[#0a0f0a] rounded-xl border border-[#00e470]/20 space-y-2 animate-scale-up">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-[#00e470] font-black font-mono tracking-wider">GENERATED URL FOR SELECTED LEADER:</span>
            <button id="hub-copy-campaign-btn" class="text-xs text-[#00e470] hover:text-[#b2ffbe] underline font-bold cursor-pointer transition-colors">Copy Link</button>
          </div>
          <p id="hub-custom-link-output" class="text-xs text-[#dbe6d8] font-mono break-all select-all leading-relaxed"></p>
        </div>
      </div>
    </div>

    <!-- Offline QR Code Generator Card -->
    <div class="bg-[#121c13] rounded-2xl p-6 shadow-md border border-[#233525] flex flex-col md:flex-row items-center justify-between gap-5">
      <div class="space-y-2">
        <h2 class="text-sm font-black text-[#dbe6d8] uppercase tracking-wider flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00e470]">qr_code_2</span>
          Offline Agent Registration Nodes
        </h2>
        <p class="text-xs text-[#bacbb8] leading-relaxed max-w-lg">
          Display a high-density, secure QR matrix for walk-up registrations. Candidates can scan directly with mobile cameras to connect without referral typing delays.
        </p>
        <button id="hub-open-qr-btn" class="mt-2 bg-[#1b281d] hover:bg-[#233525] text-[#00e470] px-5 py-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border border-[#2a3f2d] active:scale-95 cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">qr_code_2</span>
          <span>Generate QR Matrix</span>
        </button>
      </div>
      
      <div class="w-24 h-24 bg-[#0a0f0a] rounded-2xl flex items-center justify-center p-2.5 shadow-inner border border-[#233525] shrink-0">
        <svg class="w-full h-full fill-[#00e470]" viewBox="0 0 24 24">
          <path d="M2,2H10V10H2V2M4,4V8H8V4H4M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M18,14V18H22V14H18M14,18H16V22H14V18M18,20H22V24H18V20M12,2H14V6H12V2M12,8H14V12H12V8M6,12H8V14H6V12M12,14H14V18H12V14M16,12H18V14H16V12M2,12H4V14H2V12M20,12H22V14H20V12Z"></path>
        </svg>
      </div>
    </div>
  </div>

  <!-- SECTION 2: LIVE PENDING AGENT APPROVALS QUEUE -->
  <div class="flex flex-col gap-4 hidden animate-fade-in" id="hub-tab-content-approvals">
    
    <!-- Filter Bar -->
    <div class="flex items-center justify-between bg-[#121c13] p-4 rounded-xl border border-[#233525]">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[#00e470] text-[20px]">filter_list</span>
        <span class="text-xs text-[#dbe6d8] font-bold">Pending Live Candidates Zone: <strong class="text-[#00e470]">Active</strong></span>
      </div>
      <div class="flex items-center gap-1 text-[11px] font-mono text-[#bacbb8]">
        <span>REGISTRATION: REALTIME SECURE QUEUE</span>
      </div>
    </div>

    <!-- Approvals List Container -->
    <div class="flex flex-col gap-4" id="hub-approvals-list-container">
      <!-- Populated dynamically via admin.js -->
    </div>

    <!-- Empty Queue Placeholder State -->
    <div class="hidden flex-col items-center justify-center p-16 text-center bg-[#121c13] rounded-2xl border border-dashed border-[#233525]" id="hub-empty-queue-state">
      <div class="w-14 h-14 rounded-full bg-[#00e470]/10 border border-[#00e470]/20 flex items-center justify-center text-[#00e470] mb-4">
        <span class="material-symbols-outlined text-[28px]">task_alt</span>
      </div>
      <h3 class="text-sm font-black text-[#dbe6d8] tracking-wide">All Approvals Cleared</h3>
      <p class="text-xs text-[#bacbb8] mt-1.5 max-w-sm leading-relaxed">There are currently no active candidate registrations pending review in the system node.</p>
    </div>
  </div>

  <!-- Offline QR Modal Popup -->
  <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 hidden" id="hub-qr-modal">
    <div class="bg-[#121c13] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#233525] text-center relative animate-scale-up">
      <button id="hub-close-qr-modal-btn-top" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1b281d] flex items-center justify-center text-[#dbe6d8] hover:bg-[#233525] transition-all cursor-pointer">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
      <h3 class="text-sm font-black text-[#dbe6d8] uppercase tracking-wider mb-1">Offline Registration Matrix</h3>
      <p class="text-xs text-[#bacbb8] mb-5">Scan this node dynamically to connect sub-agent registration directly under <span id="hub-qr-leader-label" class="text-white font-bold font-mono">@leader</span>.</p>
      
      <div class="bg-white p-5 rounded-2xl inline-block shadow-xl mb-5 border border-slate-200">
        <!-- SVG QR code large -->
        <svg class="w-44 h-44 fill-[#0a0f0a]" viewBox="0 0 24 24">
          <path d="M2,2H10V10H2V2M4,4V8H8V4H4M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M18,14V18H22V14H18M14,18H16V22H14V18M18,20H22V24H18V20M12,2H14V6H12V2M12,8H14V12H12V8M6,12H8V14H6V12M12,14H14V18H12V14M16,12H18V14H16V12M2,12H4V14H2V12M20,12H22V14H20V12Z"></path>
        </svg>
      </div>
      
      <p id="hub-qr-badge-code" class="text-[10px] text-[#00e470] font-mono bg-[#00e470]/10 border border-[#00e470]/20 py-2 px-4 rounded-xl mb-5 uppercase tracking-widest font-bold">@LEADER-OFFLINE-NODE</p>
      <button id="hub-close-qr-modal-btn" class="w-full py-3 rounded-xl bg-[#00e470] text-[#002a11] text-xs font-black cursor-pointer active:scale-95 shadow-md transition-all">Done / সম্পন্ন</button>
    </div>
  </div>

</div>
