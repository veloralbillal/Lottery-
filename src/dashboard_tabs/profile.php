<!-- ================= TAB: PROFILE (PLAYER PROFILE & LOGOUT) ================= -->
<div id="tab-profile" class="hidden space-y-6">
  
  <!-- Avatar Identity Board -->
  <div class="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-6 rounded-3xl text-center space-y-5 shadow-2xl transition duration-500 hover:border-slate-700/60">
    <!-- Decorative soft atmospheric background glow effects -->
    <div class="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>
    <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none"></div>

    <!-- Advanced Avatar with Photo Upload & Picker triggers -->
    <div class="relative w-24 h-24 mx-auto group">
      <!-- Animated outer pulse border ring -->
      <div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500 via-rose-500 to-amber-500 opacity-60 group-hover:opacity-100 blur-[2px] animate-spin-slow transition duration-700"></div>
      
      <!-- Core avatar mask -->
      <div id="profile-avatar-container" class="relative w-24 h-24 bg-slate-950 border-2 border-slate-900 text-slate-300 rounded-full flex items-center justify-center text-4xl overflow-hidden shadow-inner font-sans">
        <i class="fa-solid fa-user-astronaut" id="profile-avatar-fallback"></i>
        <img id="profile-avatar-img" class="w-full h-full object-cover hidden" src="" alt="Avatar" referrerPolicy="no-referrer" />
      </div>
      
      <!-- Upload photo mini trigger button overlay -->
      <div class="absolute bottom-0 right-0 bg-gradient-to-r from-red-600 to-rose-600 border border-slate-950 w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] text-white cursor-pointer hover:scale-[1.15] transition-all shadow-lg shadow-black/40" title="Upload Custom Avatar Image">
        <label class="cursor-pointer">
          <i class="fa-solid fa-camera"></i>
          <input type="file" id="profile-local-upload-input" accept="image/*" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Dynamic Username and Badges Section -->
    <div class="space-y-1">
      <h3 class="text-lg font-black text-white font-display tracking-tight flex items-center justify-center gap-1">
        @<span class="curr-username"></span>
        <i class="fa-solid fa-circle-check text-sky-400 text-xs" title="Verified Live Player"></i>
      </h3>
      
      <p class="text-[9px] text-rose-500 font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
        <span class="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
        MEMBERSHIP STATUS: <span class="text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8px] tracking-normal font-sans font-black">ACTIVE VIP</span>
      </p>

      <!-- Dynamic badges collection showcase space -->
      <div id="profile-unlocked-badges" class="flex flex-wrap justify-center gap-1.5 pt-2 max-w-sm mx-auto">
        <!-- Dynamically assigned badges will go here -->
      </div>
    </div>

    <!-- Google Picker photo select options -->
    <button id="profile-google-photo-btn" type="button" class="w-full bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-amber-400 hover:text-amber-300 font-mono text-[9px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition max-w-[210px] mx-auto cursor-pointer shadow-sm">
      <i class="fa-brands fa-google-drive text-amber-500"></i>
      Sync Avatar from Google Photos
    </button>

    <!-- Stats grid metrics with custom glowing mini panels -->
    <div class="grid grid-cols-3 gap-2 pb-1 font-mono text-center">
      <div class="bg-slate-950 border border-slate-900 p-2.5 rounded-2xl relative shadow-md">
        <div class="absolute top-1 right-2"><i class="fa-solid fa-trophy text-[7px] text-amber-500"></i></div>
        <span class="text-[8px] text-slate-500 uppercase block scale-90">Lotteries Won</span>
        <span id="profile-wins" class="text-xs font-black text-amber-400 mt-1 block">0</span>
      </div>
      <div class="bg-slate-950 border border-slate-900 p-2.5 rounded-2xl relative shadow-md">
        <div class="absolute top-1 right-2"><i class="fa-solid fa-coins text-[7px] text-slate-500"></i></div>
        <span class="text-[8px] text-slate-500 uppercase block scale-90">Total Spent</span>
        <span id="profile-loss" class="text-xs font-bold text-slate-300 mt-1 block">0</span>
      </div>
      <div class="bg-slate-950 border border-slate-900 p-2.5 rounded-2xl relative shadow-md">
        <div class="absolute top-1 right-2"><i class="fa-solid fa-chart-line text-[7px] text-cyan-400"></i></div>
        <span class="text-[8px] text-slate-500 uppercase block scale-90">Net Profit</span>
        <span id="profile-profit" class="text-xs font-black text-cyan-400 mt-1 block">0</span>
      </div>
    </div>

    <!-- Spending vs Winnings Graphical Analytics Chart -->
    <div class="bg-slate-950/80 p-4 border border-rose-950/30 rounded-3xl space-y-2 mt-1 relative">
      <span class="text-[9px] uppercase font-bold text-slate-400 block text-center font-mono flex items-center justify-center gap-1">
        <i class="fa-solid fa-chart-pie text-[9px] text-rose-500"></i> Spending vs Earnings Breakdown
      </span>
      <div class="relative h-28 w-full flex justify-center">
        <canvas id="profile-chart" class="max-w-[180px]"></canvas>
      </div>
    </div>

    <!-- Profile Edit fields forms element -->
    <form id="profile-edit-form-spa" class="space-y-3.5 text-left pt-4 border-t border-slate-800/60 font-mono text-xs">
      <div class="space-y-1">
        <label class="block text-[8px] uppercase tracking-wider text-slate-500">Registered Email Address</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600"><i class="fa-regular fa-envelope"></i></span>
          <input id="profile-edit-email" type="email" required class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white outline-none transition" />
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="block text-[8px] uppercase tracking-wider text-slate-500">Phone Mobile Link</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600"><i class="fa-solid fa-mobile-screen"></i></span>
            <input id="profile-edit-phone" type="text" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white outline-none transition" placeholder="01712345678" />
          </div>
        </div>
        <div class="space-y-1">
          <label class="block text-[8px] uppercase tracking-wider text-slate-500">Date of Birth</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600"><i class="fa-regular fa-calendar"></i></span>
            <input id="profile-edit-dob" type="date" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white outline-none transition" />
          </div>
        </div>
      </div>
      <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.01] text-white font-black text-xs py-3 rounded-xl transition shadow-lg mt-2 cursor-pointer">
        <i class="fa-solid fa-circle-check mr-1 text-[11px]"></i> Update Profile Details
      </button>
    </form>

    <!-- Support OTP Security Action -->
    <div class="bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 rounded-2xl p-4 text-left space-y-3 shadow-md mt-4">
      <div class="flex items-start gap-3">
        <div class="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
          <i class="fa-solid fa-key text-sm"></i>
        </div>
        <div>
          <h4 class="text-xs font-black text-white flex items-center gap-1.5 font-display">
            Secure Cashout OTP Support
          </h4>
          <p class="text-[9.5px] text-slate-400 leading-relaxed font-sans mt-0.5">
            Generate secure 6-digit verification codes to authorize instant balance deductions at verified Agent Cashout Stations.
          </p>
        </div>
      </div>
      <a href="/otp.html" target="_blank" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] py-2.5 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/15">
        <i class="fa-solid fa-shield-halved"></i> Access OTP Generator Page
      </a>
    </div>

    <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1.5 text-left border-t border-slate-850/60">
      <span>Account Registration Date:</span>
      <span id="profile-join-date" class="text-slate-300 font-bold"></span>
    </div>
  </div>

  <!-- ================= USER ACCOUNT INBOX ================= -->
  <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex justify-between items-center border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-900 flex items-center justify-center">
          <i class="fa-solid fa-envelope-open text-cyan-400 text-xs text-[10px]"></i>
        </div>
        <div>
          <h4 class="text-xs font-black text-white uppercase tracking-tight font-mono">Personal Inbox</h4>
          <p class="text-[8px] text-slate-500 font-sans tracking-tight">Direct updates and bulk network broadcasts from the administration.</p>
        </div>
      </div>
      <span id="user-inbox-unread-badge" class="text-[9px] font-bold bg-pink-950/65 text-pink-400 border border-pink-900/45 px-2 py-0.5 rounded-lg">0 Unread</span>
    </div>

    <!-- Messages list -->
    <div id="user-inbox-list" class="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
      <!-- Dynamically populated or fallback -->
      <div class="p-6 text-center text-slate-500 font-mono text-[10px]">
        <i class="fa-solid fa-signature text-slate-700 text-lg block mb-1"></i>
        Your personal notification box is empty. No messages registered.
      </div>
    </div>
  </div>

  <!-- System utility logs buttons bar -->
  <div class="space-y-3">
    <!-- Refer & Earn Option -->
    <button id="profile-refer-entry-btn" class="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center">
          <i class="fa-solid fa-users text-cyan-400 text-xs animate-bounce"></i>
        </div>
        <div>
          <span class="text-xs font-bold text-white block">Refer & Earn Program</span>
          <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Share your code, level up, get money bonuses and premium badges!</span>
        </div>
      </div>
      <span class="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-900/40 px-2 py-0.5 rounded-lg">Open <i class="fa-solid fa-chevron-right text-[8px] pl-0.5"></i></span>
    </button>

    <!-- Badge Request Option -->
    <button id="profile-badge-request-entry-btn" class="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-amber-950/40 border border-amber-800/30 flex items-center justify-center">
          <i class="fa-solid fa-ribbon text-amber-400 text-xs animate-pulse"></i>
        </div>
        <div>
          <span class="text-xs font-bold text-white block">Request Premium Badge</span>
          <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Submit application request for VIP, Mod, or Star Member badges</span>
        </div>
      </div>
      <span class="text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-lg">Apply <i class="fa-solid fa-chevron-right text-[8px] pl-0.5"></i></span>
    </button>

    <a href="#" id="profile-support-link" class="flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center">
          <i class="fa-solid fa-headset text-cyan-400 text-xs"></i>
        </div>
        <div class="text-left">
          <span class="text-xs font-bold text-white block">Official Support Helpline</span>
          <span class="text-[9px] text-slate-500 block leading-tight mt-0.5" id="profile-support-subtitle">BD Hot Contact: 01700000000</span>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right text-slate-600 text-xs"></i>
    </a>

    <button id="profile-logout-btn" class="w-full bg-slate-900 border border-rose-950/60 hover:bg-rose-950/20 text-rose-400 font-bold text-xs py-3.5 rounded-2xl cursor-pointer transition">
      <i class="fa-solid fa-right-from-bracket mr-1 text-[11px] text-rose-500"></i> Sign Out of Current Session
    </button>
  </div>

</div>
