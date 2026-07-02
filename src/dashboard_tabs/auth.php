<!-- ================= SCREEN 1: MAINTENANCE LOCK SCREEN ================= -->
<div id="screen-maintenance" class="hidden fixed inset-0 bg-slate-950 flex flex-col justify-between p-6 z-50 overflow-y-auto">
  <div class="my-auto max-w-md w-full mx-auto text-center space-y-6">
    <div class="w-20 h-20 bg-rose-955/40 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-500 text-3xl animate-pulse">
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
    <span class="hover:text-slate-400 cursor-pointer select-none transition" id="exit-maintenance-backdoor" onclick="window.openBypass()">
      Developer Backlogin
    </span>
  </div>
</div>


<!-- ================= SCREEN 2: AUTHENTICATION (LOGIN & REGISTRATION) ================= -->
<div id="screen-auth" class="hidden min-h-screen bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden">
  <!-- Ambient light decorative backdrops -->
  <div class="absolute top-1/6 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Corporate Header branding -->
  <header class="z-10 text-center flex flex-col items-center mt-6">
    <div class="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-2xl flex items-center justify-center mb-3 shadow-xl ring-1 ring-white/10 secret-doorway-backdoor cursor-pointer" onclick="window.openBypass()">
      <i class="fa-solid fa-clover text-white text-2xl animate-bounce"></i>
    </div>
    <h1 class="text-xl font-black font-display tracking-wide uppercase text-white brand-site-name">Lottery Winner</h1>
    <p class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1 brand-site-info">Premium Mobile Play Portal</p>
    
    <!-- Cloud Sync status badge for Auth screen -->
    <div class="mt-3 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono flex items-center gap-2 shadow-lg cursor-pointer hover:bg-slate-900 transition active:scale-98 cloud-sync-debug-trigger" title="Check Cloud Sync Status">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 cloud-sync-dot shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
      <span class="text-slate-400">Database Connection:</span>
      <span class="font-black text-emerald-400 uppercase tracking-wide cloud-sync-text">Synced</span>
    </div>
  </header>

  <!-- 3D INTERACTIVE MEMBERSHIP CARD -->
  <div class="z-10 max-w-sm w-full mx-auto pt-3 flex justify-center bg-transparent select-none" style="perspective: 1200px;">
    <div id="auth-3d-vip-card" class="interactive-tilt-card w-[290px] h-44 bg-gradient-to-br from-red-650 via-rose-500 to-amber-500 rounded-[24px] p-0.5 shadow-[0_15px_35px_rgba(239,68,68,0.2)] relative overflow-hidden transition-all duration-300 transform-style-preserve-3d" style="transform: rotateX(8deg) rotateY(-8deg);">
      <!-- Reflective overlay shines -->
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
      
      <div class="w-full h-full bg-slate-950/95 rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden">
        <!-- Grid decorative backdrop -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30"></div>
        
        <div class="flex justify-between items-start relative z-10">
          <span class="font-mono text-[9px] text-red-400 font-extrabold uppercase bg-red-955/40 border border-red-900/30 px-2 py-0.5 rounded-full tracking-wider">
            VIP GATEWAY
          </span>
          <span class="text-amber-400 text-xs font-black"><i class="fa-solid fa-crown animate-pulse"></i></span>
        </div>

        <!-- Glowing serial identifier -->
        <div class="space-y-1 relative z-10" style="transform: translateZ(25px);">
          <span class="text-[8.5px] font-mono text-slate-500 block tracking-wider leading-none">VIP TICKET SERIAL HASH</span>
          <span class="text-sm font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-widest uppercase">777-WIN-SYS-99</span>
        </div>

        <div class="flex justify-between items-center relative z-10">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span class="font-display font-black text-[9.5px] text-slate-300 tracking-tight uppercase">SECURE SECRETS AUTHENTICATED</span>
          </div>
          <span class="text-[9.5px] font-mono text-slate-500 uppercase">SYS-B52</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Login Container block -->
  <div id="auth-login-box" class="z-10 max-w-sm w-full mx-auto my-auto py-8">
    <div class="interactive-tilt-card holo-glass-gradient border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Player Sign-In</h2>
        <button id="show-register-btn" class="text-[11px] font-black text-rose-500 font-mono hover:underline">Register Account</button>
      </div>

      <form id="auth-login-form" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Username handle</label>
          <div class="relative">
            <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
            <input id="auth-user" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition" placeholder="lottery_pro" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Account Passphrase</label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
            <input id="auth-pass" type="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition" placeholder="••••••••" />
          </div>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition active:opacity-90">
          Access Player Area
        </button>
      </form>
    </div>
  </div>

  <!-- Main Sign Up Container block -->
  <div id="auth-signup-box" class="hidden z-10 max-w-sm w-full mx-auto my-auto py-8">
    <div class="interactive-tilt-card holo-glass-gradient border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Register Account</h2>
        <button id="show-login-btn" class="text-[11px] font-black text-cyan-400 font-mono hover:underline">Sign In Instead</button>
      </div>

      <form id="auth-signup-form" class="space-y-3.5">
        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Username handle</label>
          <input id="reg-user" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="your_username" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-mono text-slate-500">Email Address</label>
            <input id="reg-email" type="email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="name@domain.com" />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-mono text-slate-500">Phone Number</label>
            <input id="reg-phone" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="01712xxxxxx" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Date of Birth</label>
          <input id="reg-dob" type="date" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Create Passphrase</label>
          <input id="reg-pass" type="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="••••••••" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-mono text-slate-500">My Town / Region</label>
            <select id="reg-region" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-mono text-white outline-none focus:border-cyan-500 transition cursor-pointer">
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-mono text-slate-500">Refer Code (Optional)</label>
            <input id="reg-refer-by" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="referrer_username" />
          </div>
        </div>

        <div class="text-[10px] text-slate-500 font-mono text-center">
          * Join today and claim free <span id="auth-signup-bonus-indicator" class="text-emerald-400 font-bold">৳100 Starter Wallet Balance</span> instantly!
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] text-white font-black text-xs py-3 rounded-xl shadow-lg transition active:opacity-90">
          Complete Sign-Up
        </button>
      </form>
    </div>
  </div>

  <!-- Secure app system lock disclaimer footer -->
  <footer class="z-10 text-center text-[10px] text-slate-600 font-mono leading-relaxed mt-4">
    <p id="sys-auth-footer-brand">© 2026 Lottery Winner Mobile Ltd.</p>
    <p id="sys-auth-footer-sub" class="text-slate-700">Right-click, text select, and page zoom restricted for secure transaction processes.</p>
  </footer>
</div>
