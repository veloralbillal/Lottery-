export const template = `<!-- ================= TAB: PROFILE (ORGANIZED ROOM STYLE) ================= -->
<div id="tab-profile" class="hidden space-y-5 pb-24 relative animate-fade-in">

 <!-- 1. HEADER: PLAYER IDENTITY ROOM -->
 <div id="profile-identity-board-container" class="relative overflow-hidden bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800/80 p-6 rounded-[2.5rem] text-center shadow-2xl transition duration-500">
  <!-- Banner Overlay -->
  <div id="profile-banner-overlay" class="absolute inset-0 opacity-20 pointer-events-none z-0"></div>
  
  <!-- 3D Accents -->
  <div class="absolute -right-16 -top-16 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
  <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

  <div class="relative z-10 space-y-4">
   <!-- Avatar Section -->
   <div class="relative w-28 h-28 mx-auto flex items-center justify-center" id="profile-avatar-outer-wrapper">
    <div id="profile-anim-overlay" class="absolute -inset-4 pointer-events-none z-20 flex items-center justify-center"></div>
    <div id="profile-frame-overlay" class="absolute -inset-2 pointer-events-none z-10 flex items-center justify-center"></div>
    <div id="profile-avatar-container" class="relative w-24 h-24 bg-slate-950 border-2 border-slate-900 rounded-full flex items-center justify-center overflow-hidden shadow-inner z-0">
     <i data-lucide="user" class="w-12 h-12 text-slate-700 absolute" id="profile-avatar-fallback"></i>
     <img id="profile-avatar-img" class="absolute inset-0 w-full h-full object-cover rounded-full hidden" src="" alt="Avatar" />
    </div>
   </div>

   <!-- User Info -->
   <div class="space-y-1">
    <h3 class="text-xl font-black text-white font-display tracking-tight flex items-center justify-center gap-1.5">
     @<span class="curr-username">Player</span>
     <i data-lucide="check-circle" class="w-4 h-4 text-sky-400" title="Verified"></i>
    </h3>
    <div id="profile-unlocked-badges" class="flex flex-wrap justify-center gap-1.5 pt-1"></div>
   </div>

   <!-- Level & XP (Compact) -->
   <div class="max-w-xs mx-auto space-y-1.5 bg-slate-950/80 border border-white/5 p-3 rounded-2xl">
    <div class="flex justify-between items-center text-[10px] font-mono">
     <span class="text-slate-400 font-bold uppercase">Level <span id="profile-level-num" class="text-amber-400 font-black">1</span></span>
     <span class="text-slate-500"><span id="profile-xp-curr">0</span> / <span id="profile-xp-needed">100</span> XP</span>
    </div>
    <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
     <div id="profile-xp-bar" class="h-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500 rounded-full transition-all duration-500" style="width: 0%"></div>
    </div>
   </div>
   
   <!-- Vibe Status -->
   <div class="flex items-center justify-center gap-2 group cursor-pointer" id="profile-edit-vibe-btn">
    <span id="profile-vibe-status" class="text-slate-400 italic font-sans text-xs">"🍀 Feeling Lucky"</span>
    <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition"></i>
   </div>
   
   <!-- Inline Vibe Editor (Hidden) -->
   <div id="profile-vibe-editor-panel" class="hidden max-w-xs mx-auto space-y-2 p-3 bg-slate-950/90 border border-slate-800 rounded-2xl animate-fade-in text-left">
    <div class="flex flex-wrap gap-1">
     <button type="button" class="com-vibe-preset px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[9px] text-slate-300 hover:border-rose-500/60" data-vibe="🔥 Hot Streak">🔥 Hot Streak</button>
     <button type="button" class="com-vibe-preset px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[9px] text-slate-300 hover:border-rose-500/60" data-vibe="🍀 Feeling Lucky">🍀 Feeling Lucky</button>
     <button type="button" class="com-vibe-preset px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[9px] text-slate-300 hover:border-rose-500/60" data-vibe="🎯 Jackpot">🎯 Jackpot</button>
    </div>
    <div class="flex gap-2">
     <input type="text" id="profile-custom-vibe-input" maxlength="24" placeholder="Status..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-rose-500/80" />
     <button type="button" id="profile-save-vibe-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition">Save</button>
    </div>
   </div>
  </div>
 </div>

 <!-- 2. STATS GRID: THE PROFIT ROOM -->
 <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
  <div class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl text-center space-y-1">
   <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Wins</span>
   <div class="text-lg font-black text-emerald-400 font-mono" id="profile-wins">0</div>
  </div>
  <div class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl text-center space-y-1">
   <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Loss</span>
   <div class="text-lg font-black text-rose-400 font-mono" id="profile-loss">0</div>
  </div>
  <div class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl text-center space-y-1">
   <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Net Profit</span>
   <div class="text-lg font-black text-cyan-400 font-mono">৳<span id="profile-profit">0.00</span></div>
  </div>
  <div class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl text-center space-y-1">
   <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Join Date</span>
   <div class="text-[10px] font-black text-slate-300 font-mono mt-1" id="profile-join-date">N/A</div>
  </div>
 </div>

 <!-- 3. MAIN DASHBOARD: ORGANIZED CATEGORIES -->
 
 <!-- Category: Wallet & Transactions -->
 <div class="space-y-3">
  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
   <i data-lucide="wallet" class="w-4 h-4 text-amber-500"></i> Wallet & Finance <span class="text-[8px] lowercase font-mono opacity-60">(ওয়ালেট এবং অর্থ)</span>
  </h4>
  <div class="grid grid-cols-2 gap-3">
   <button type="button" onclick="app.navigateTo('wallet')" class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-left hover:bg-slate-800/40 transition group">
    <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition">
     <i data-lucide="vault" class="w-5 h-5 text-emerald-400"></i>
    </div>
    <span class="text-xs font-bold text-white block">Main Wallet</span>
    <span class="text-[9px] text-slate-500">Balance & History</span>
   </button>
   <button type="button" onclick="app.navigateTo('deposit')" class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-left hover:bg-slate-800/40 transition group">
    <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition">
     <i data-lucide="plus" class="w-5 h-5 text-cyan-400"></i>
    </div>
    <span class="text-xs font-bold text-white block">Add Money</span>
    <span class="text-[9px] text-slate-500">Deposit Funds</span>
   </button>
  </div>
 </div>

 <!-- Category: Daily Rewards -->
 <div class="space-y-3">
  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
   <i data-lucide="gift" class="w-4 h-4 text-rose-500"></i> Daily Perks <span class="text-[8px] lowercase font-mono opacity-60">(প্রতিদিনের বোনাস)</span>
  </h4>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
   <!-- Daily Claim -->
   <div class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
     <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
      <i data-lucide="calendar-check" class="w-5 h-5 text-emerald-400"></i>
     </div>
     <div>
      <span class="text-xs font-bold text-white block">Daily Grant</span>
      <div id="profile-daily-claim-status" class="text-[9px] text-slate-500">Check status...</div>
     </div>
    </div>
    <button type="button" id="profile-claim-daily-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition shadow-lg shadow-emerald-950/50">Claim</button>
   </div>
   <!-- Lucky Predictor -->
   <div class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
     <div class="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
      <i data-lucide="dice-5" class="w-5 h-5 text-rose-400 animate-spin-slow"></i>
     </div>
     <div>
      <span class="text-xs font-bold text-white block">Lucky Predictor</span>
      <div id="profile-lucky-num-result" class="text-[9px] text-slate-500">Generate today...</div>
     </div>
    </div>
    <button type="button" id="profile-lucky-num-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-rose-400 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap">Predict</button>
   </div>
  </div>
 </div>

 <!-- Category: Security & Verification -->
 <div class="space-y-3">
  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
   <i data-lucide="shield" class="w-4 h-4 text-cyan-500"></i> Security & Access <span class="text-[8px] lowercase font-mono opacity-60">(নিরাপত্তা ও এক্সেস)</span>
  </h4>
  <div class="space-y-2">
   <button type="button" id="profile-toggle-pin-setup" class="w-full flex items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-3xl hover:bg-slate-800/40 transition">
    <div class="flex items-center gap-3">
     <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
      <i data-lucide="lock" class="w-5 h-5 text-cyan-400"></i>
     </div>
     <div class="text-left">
      <span class="text-xs font-bold text-white block">Cashout PIN Lock</span>
      <span id="profile-security-pin-badge" class="text-[9px] font-bold"></span>
     </div>
    </div>
    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
   </button>

   <!-- PIN Panel (Inline) -->
   <div id="profile-pin-setup-panel" class="hidden bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-4 animate-fade-in">
    <div class="grid grid-cols-2 gap-3">
     <div class="space-y-1">
      <label class="text-[8px] text-slate-500 uppercase font-bold block">New PIN</label>
      <input type="password" id="profile-new-pin" maxlength="4" placeholder="••••" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-center text-white tracking-widest outline-none focus:border-cyan-500/50" />
     </div>
     <div class="space-y-1">
      <label class="text-[8px] text-slate-500 uppercase font-bold block">Confirm</label>
      <input type="password" id="profile-confirm-pin" maxlength="4" placeholder="••••" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-center text-white tracking-widest outline-none focus:border-cyan-500/50" />
     </div>
    </div>
    <button type="button" id="profile-save-pin-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-2xl transition text-xs shadow-lg shadow-cyan-950/50">Update Security PIN</button>
   </div>

   <button type="button" id="profile-access-otp-btn" onclick="app.navigateTo('otp')" class="w-full flex items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-3xl hover:bg-slate-800/40 transition cursor-pointer">
    <div class="flex items-center gap-3">
     <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
      <i data-lucide="key" class="w-5 h-5 text-indigo-400"></i>
     </div>
     <div class="text-left">
      <span class="text-xs font-bold text-white block">OTP Generator</span>
      <span class="text-[9px] text-slate-500">Secure agent cashout codes</span>
     </div>
    </div>
    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
   </button>
  </div>
 </div>

 <!-- Category: Community & Growth -->
 <div class="space-y-3">
  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
   <i data-lucide="users" class="w-4 h-4 text-purple-500"></i> Community & Growth <span class="text-[8px] lowercase font-mono opacity-60">(কমিউনিটি এবং ইনকাম)</span>
  </h4>
  <div class="grid grid-cols-2 gap-3">
   <button type="button" id="profile-refer-entry-btn" onclick="app.navigateTo('refer')" class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-left hover:bg-slate-800/40 transition cursor-pointer">
    <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
     <i data-lucide="share-2" class="w-5 h-5 text-amber-400"></i>
    </div>
    <span class="text-xs font-bold text-white block">Refer & Earn</span>
    <span class="text-[9px] text-slate-500">Get lifetime bonus</span>
   </button>
   <button type="button" id="profile-video-bounty-entry-btn" onclick="app.navigateTo('video-bounty')" class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-left hover:bg-slate-800/40 transition cursor-pointer">
    <div class="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
     <i data-lucide="video" class="w-5 h-5 text-rose-400"></i>
    </div>
    <span class="text-xs font-bold text-white block">Video Bounty</span>
    <span class="text-[9px] text-slate-500">Make reviews, earn</span>
   </button>
  </div>
  <div class="grid grid-cols-2 gap-3">
   <button type="button" id="profile-badge-request-entry-btn" onclick="app.navigateTo('badge-request')" class="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-left hover:bg-slate-800/40 transition cursor-pointer">
    <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-3">
     <i data-lucide="ribbon" class="w-5 h-5 text-cyan-400"></i>
    </div>
    <span class="text-xs font-bold text-white block">Badge Request</span>
    <span class="text-[9px] text-slate-500">Apply for VIP/Mod</span>
   </button>
   <button type="button" onclick="app.shareOnWhatsAppViral()" class="bg-emerald-600/10 border border-emerald-500/30 p-4 rounded-3xl text-left hover:bg-emerald-600/20 transition group cursor-pointer">
    <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg shadow-emerald-500/30">
     <i data-lucide="message-square" class="w-5 h-5 text-white"></i>
    </div>
    <span class="text-xs font-bold text-white block">Viral Share</span>
    <span class="text-[9px] text-emerald-500">Invite on WhatsApp</span>
   </button>
  </div>
 </div>

 <!-- 4. NOTIFICATIONS: INBOX ROOM -->
 <div class="space-y-3">
  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
   <i data-lucide="inbox" class="w-4 h-4 text-blue-500"></i> Inbox & Updates
  </h4>
  <div class="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
   <div class="flex justify-between items-center border-b border-slate-800/60 pb-3 mb-3">
    <span class="text-[10px] font-bold text-slate-400 font-mono">Personal Notifications</span>
    <span id="user-inbox-unread-badge" class="text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full">0 Unread</span>
   </div>
   <div id="user-inbox-list" class="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
    <div class="p-6 text-center text-slate-600 font-mono text-[10px]">
     <i data-lucide="mail-open" class="w-7 h-7 text-slate-600 block mb-2 mx-auto"></i>
     Your inbox is clean. No new messages.
    </div>
   </div>
  </div>
 </div>

 <!-- 5. ACCOUNT UTILITIES: THE EXIT DOOR -->
 <div class="space-y-3 pt-4">
  <button type="button" id="profile-open-edit-modal-btn" onclick="app.navigateTo('edit-profile')" class="w-full flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-3xl hover:bg-white/10 transition cursor-pointer">
   <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center">
     <i data-lucide="user-cog" class="w-5 h-5 text-slate-300"></i>
    </div>
    <div class="text-left">
     <span class="text-xs font-bold text-white block">Edit Royal Profile</span>
     <span class="text-[9px] text-slate-500">Name, Email, Phone & Frames</span>
    </div>
   </div>
   <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
  </button>

  <button type="button" id="profile-recovery-entry-btn" onclick="app.navigateTo('recovery')" class="w-full flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-3xl hover:bg-white/10 transition cursor-pointer">
   <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center">
     <i data-lucide="shield-alert" class="w-5 h-5 text-slate-300"></i>
    </div>
    <div class="text-left">
     <span class="text-xs font-bold text-white block">Account Recovery</span>
     <span class="text-[9px] text-slate-500">Restore access keys</span>
    </div>
   </div>
   <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
  </button>

  <div class="grid grid-cols-2 gap-3">
   <a href="#" id="profile-support-link" class="flex items-center gap-3 bg-cyan-600/10 border border-cyan-500/30 p-4 rounded-3xl hover:bg-cyan-600/20 transition cursor-pointer">
    <i data-lucide="headset" class="w-5 h-5 text-cyan-400"></i>
    <span class="text-xs font-bold text-white">Support</span>
   </a>
   <button type="button" id="profile-logout-btn" onclick="if(window.appInstance&&window.appInstance.logout){window.appInstance.logout()}else if(window.app&&window.app.logout){window.app.logout()}else if(window.handleLogout){window.handleLogout()}" class="flex items-center gap-3 bg-rose-600/10 border border-rose-500/30 p-4 rounded-3xl hover:bg-rose-600/20 transition text-rose-400 cursor-pointer">
    <i data-lucide="log-out" class="w-5 h-5 text-rose-400"></i>
    <span class="text-xs font-bold">Logout</span>
   </button>
  </div>
 </div>

 <!-- Footnote -->
 <div class="text-center space-y-1 pt-4 opacity-40">
  <div class="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Device Fingerprint</div>
  <div id="profile-device-fingerprint" class="text-[8px] font-mono text-slate-500 select-all"></div>
  <div id="profile-device-ip" class="text-[8px] font-mono text-cyan-500 font-bold"></div>
 </div>

 <!-- 6. MODAL: EDIT PROFILE OVERLAY -->
 <div id="profile-edit-modal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 hidden">
  <div class="relative bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-none text-left animate-in zoom-in-95 duration-200">
   <div class="flex justify-between items-center border-b border-white/5 pb-4">
    <h4 class="text-sm font-black text-white uppercase tracking-wider font-mono">Profile Settings</h4>
    <button type="button" id="profile-close-edit-modal-btn" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition">
     <i data-lucide="x" class="w-4 h-4 text-slate-400"></i>
    </button>
   </div>

   <!-- Live Preview -->
   <div class="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/5">
    <div class="relative w-28 h-28 flex items-center justify-center" id="profile-edit-avatar-outer-wrapper">
     <div id="profile-edit-frame-overlay" class="absolute -inset-2 pointer-events-none z-10 flex items-center justify-center"></div>
     <div id="profile-edit-avatar-container" class="relative w-24 h-24 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center overflow-hidden z-0">
      <i data-lucide="user" class="w-10 h-10 text-slate-700" id="profile-edit-avatar-fallback"></i>
      <img id="profile-edit-avatar-img" class="w-full h-full object-cover hidden" src="" alt="Avatar" />
     </div>
    </div>
    <span class="text-[10px] text-slate-500 font-mono uppercase tracking-widest" id="profile-edit-live-frame-name">Frame: None</span>
   </div>

   <!-- Form -->
   <form id="profile-edit-modal-form" class="space-y-4 font-sans text-sm">
    <div class="grid grid-cols-1 gap-4">
     <div class="space-y-1.5">
      <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Username</label>
      <input id="profile-edit-modal-username" type="text" required class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition" />
     </div>
     <div class="space-y-1.5">
      <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Email</label>
      <input id="profile-edit-modal-email" type="email" required class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition" />
     </div>
     <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
       <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Phone</label>
       <input id="profile-edit-modal-phone" type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition" />
      </div>
      <div class="space-y-1.5">
       <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Birthday</label>
       <input id="profile-edit-modal-dob" type="date" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition" />
      </div>
     </div>
     <div class="space-y-1.5">
      <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Location</label>
      <input id="profile-edit-modal-address" type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition" />
     </div>
    </div>

    <!-- Photo Actions -->
    <div class="flex gap-3 pt-2">
     <label class="flex-1 bg-slate-800 border border-white/5 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-700 transition text-xs">
      <i data-lucide="upload" class="w-4 h-4"></i> Upload
      <input type="file" id="profile-modal-upload-input" accept="image/*" class="hidden" />
     </label>
     <button type="button" id="profile-modal-google-photo-btn" class="flex-1 bg-amber-600/10 border border-amber-500/30 text-amber-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600/20 transition text-xs">
      <i data-lucide="globe" class="w-4 h-4"></i> Google
     </button>
    </div>

    <!-- Frames -->
    <div class="space-y-2 pt-2">
     <label class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Premium Frame</label>
     <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="profile-modal-frame-selector">
      <button type="button" class="profile-modal-frame-btn shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500" data-frame="none"><i data-lucide="ban" class="w-4 h-4"></i></button>
      <button type="button" class="profile-modal-frame-btn shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400" data-frame="royal"><i data-lucide="crown" class="w-4 h-4"></i></button>
      <button type="button" class="profile-modal-frame-btn shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400" data-frame="neon"><i data-lucide="zap" class="w-4 h-4"></i></button>
      <button type="button" class="profile-modal-frame-btn shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-500" data-frame="ruby"><i data-lucide="flame" class="w-4 h-4"></i></button>
      <button type="button" class="profile-modal-frame-btn shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400" data-frame="cosmic"><i data-lucide="star" class="w-4 h-4"></i></button>
     </div>
    </div>

    <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-900/40 hover:scale-[1.02] transition active:scale-95">Save Changes</button>
   </form>
  </div>
 </div>

</div>
`;
