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

      <!-- Level & XP Tracker -->
      <div class="mt-3.5 max-w-xs mx-auto space-y-1.5 bg-slate-950/65 border border-slate-900/60 p-3 rounded-2xl">
        <div class="flex justify-between items-center text-[9px] font-mono">
          <span class="text-slate-400 font-bold uppercase">Player Level <span id="profile-level-num" class="text-amber-400 font-black">1</span></span>
          <span class="text-slate-500 font-semibold"><span id="profile-xp-curr">0</span> / <span id="profile-xp-needed">100</span> XP</span>
        </div>
        <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div id="profile-xp-bar" class="h-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500 rounded-full transition-all duration-500" style="width: 0%"></div>
        </div>
      </div>

      <!-- Vibe / Custom Mood status -->
      <div class="max-w-xs mx-auto flex items-center justify-between gap-2 px-2 text-[10px] font-mono text-slate-400">
        <span class="text-slate-500">Vibe status:</span>
        <div class="flex items-center gap-1 min-w-0 flex-1 justify-end">
          <span id="profile-vibe-status" class="text-slate-200 truncate italic font-sans text-[11px]">"🍀 Feeling Lucky"</span>
          <button type="button" id="profile-edit-vibe-btn" class="w-5 h-5 rounded bg-slate-900 border border-slate-850 flex items-center justify-center text-[8px] text-slate-500 hover:text-white transition cursor-pointer">
            <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </div>

      <!-- Inline Vibe Editor Panel -->
      <div id="profile-vibe-editor-panel" class="hidden max-w-xs mx-auto space-y-2 p-3 bg-slate-950/65 border border-slate-900/60 rounded-2xl animate-fade-in text-left">
        <label class="text-[8px] text-slate-500 uppercase block tracking-wider font-mono font-bold">Select or type status vibe:</label>
        <div class="flex flex-wrap gap-1 text-[8px] font-mono">
          <button type="button" class="com-vibe-preset px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/60 transition" data-vibe="🔥 Hot Streak">🔥 Hot Streak</button>
          <button type="button" class="com-vibe-preset px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/60 transition" data-vibe="🍀 Feeling Lucky">🍀 Feeling Lucky</button>
          <button type="button" class="com-vibe-preset px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/60 transition" data-vibe="🎯 Jackpot Hunting">🎯 Jackpot Hunting</button>
          <button type="button" class="com-vibe-preset px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/60 transition" data-vibe="💎 VIP Mode">💎 VIP Mode</button>
        </div>
        <div class="flex gap-1.5 font-mono">
          <input type="text" id="profile-custom-vibe-input" maxlength="24" placeholder="Or write custom..." class="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-[10px] text-white outline-none focus:border-rose-500/80" />
          <button type="button" id="profile-save-vibe-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[9px] transition cursor-pointer">Save</button>
        </div>
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
      <button type="button" id="profile-access-otp-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] py-2.5 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/15">
        <i class="fa-solid fa-shield-halved"></i> Access OTP Generator Page
      </button>
    </div>

    <div class="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1.5 text-left border-t border-slate-850/60">
      <span>Account Registration Date:</span>
      <span id="profile-join-date" class="text-slate-300 font-bold"></span>
    </div>
  </div>

  <!-- ================= PLAY ZONE & PERKS ================= -->
  <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl text-xs font-mono">
    <div class="flex justify-between items-center border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-rose-950 border border-rose-900 flex items-center justify-center">
          <i class="fa-solid fa-wand-magic-sparkles text-rose-400 text-xs"></i>
        </div>
        <div>
          <h4 class="text-xs font-black text-white uppercase tracking-tight">Daily Play Zone & Perks</h4>
          <p class="text-[8px] text-slate-500 font-sans tracking-tight">Claim daily bonuses, predict lucky numbers, and set security keys.</p>
        </div>
      </div>
    </div>

    <!-- Daily Claim Perk Card -->
    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
      <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <div class="space-y-1 text-center sm:text-left">
        <h5 class="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center justify-center sm:justify-start gap-1">
          <i class="fa-solid fa-gift text-xs"></i> Daily Ticket Grant
        </h5>
        <p class="text-[9.5px] text-slate-400 leading-normal font-sans">
          Log in every 24 hours to claim a random <strong class="text-emerald-400">৳5 - ৳15 wallet bonus</strong>!
        </p>
        <div id="profile-daily-claim-status" class="text-[8px] text-slate-500 font-bold mt-1"></div>
      </div>
      <button type="button" id="profile-claim-daily-btn" class="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 px-5 rounded-xl transition duration-150 transform hover:scale-[1.02] cursor-pointer text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap shadow-lg shadow-emerald-950">
        <i class="fa-solid fa-circle-dollar-to-slot"></i> Claim Now
      </button>
    </div>

    <!-- Daily Lucky Prediction Picker Card -->
    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
      <div class="absolute right-0 bottom-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <div class="space-y-1 text-center sm:text-left flex-1 min-w-0">
        <h5 class="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center justify-center sm:justify-start gap-1">
          <i class="fa-solid fa-compass text-xs animate-spin-slow"></i> Lucky Number Of the Day
        </h5>
        <p class="text-[9.5px] text-slate-400 leading-normal font-sans">
          Let our predictive server generate your lucky double-digit of the day!
        </p>
        <div id="profile-lucky-num-result" class="text-[10px] text-slate-300 font-semibold mt-1 bg-slate-900/60 p-2 border border-slate-850/50 rounded-xl hidden">
          <!-- Filled dynamically -->
        </div>
      </div>
      <button type="button" id="profile-lucky-num-btn" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-rose-400 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap">
        <i class="fa-solid fa-dice"></i> Predict Luck
      </button>
    </div>

    <!-- Security Key PIN setup Card -->
    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 relative overflow-hidden">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="space-y-1 text-center sm:text-left">
          <h5 class="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center justify-center sm:justify-start gap-1">
            <i class="fa-solid fa-lock text-xs"></i> Cashout Security PIN Lock
          </h5>
          <p class="text-[9.5px] text-slate-400 leading-normal font-sans">
            Secure your wallet cashouts with a 4-digit numeric PIN password.
          </p>
          <div class="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <span id="profile-security-pin-badge" class="px-1.5 py-0.5 rounded text-[8px] font-bold"></span>
          </div>
        </div>
        <button type="button" id="profile-toggle-pin-setup" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-cyan-400 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap">
          <i class="fa-solid fa-key"></i> Setup PIN
        </button>
      </div>

      <!-- PIN configuration interface -->
      <div id="profile-pin-setup-panel" class="hidden bg-slate-900 border border-slate-850 p-3.5 rounded-xl space-y-3.5 mt-2 animate-fade-in">
        <h6 class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Configure Wallet Transaction PIN</h6>
        <div class="grid grid-cols-2 gap-3.5">
          <div class="space-y-1">
            <label class="text-[8px] text-slate-500 block">New 4-Digit PIN</label>
            <input type="password" id="profile-new-pin" maxlength="4" placeholder="••••" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-white font-mono tracking-widest text-xs outline-none focus:border-cyan-500/80" />
          </div>
          <div class="space-y-1">
            <label class="text-[8px] text-slate-500 block">Confirm PIN</label>
            <input type="password" id="profile-confirm-pin" maxlength="4" placeholder="••••" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-white font-mono tracking-widest text-xs outline-none focus:border-cyan-500/80" />
          </div>
        </div>
        <button type="button" id="profile-save-pin-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg transition text-[10px] cursor-pointer">
          Update Security PIN
        </button>
      </div>
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

    <!-- TikTok & Reels Video Bounty Option -->
    <button id="profile-video-bounty-entry-btn" class="w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-rose-950/40 border border-rose-800/30 flex items-center justify-center">
          <i class="fa-solid fa-video text-rose-400 text-xs animate-pulse"></i>
        </div>
        <div>
          <span class="text-xs font-bold text-white block">TikTok & Reels Video Bounty</span>
          <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Make video review, get ৳100 - ৳500 reward bonus</span>
        </div>
      </div>
      <span class="text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded-lg">Claim <i class="fa-solid fa-chevron-right text-[8px] pl-0.5"></i></span>
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
