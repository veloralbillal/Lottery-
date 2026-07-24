<!-- ================= TAB: USER SETTINGS & SECURITY ================= -->
<div id="tab-settings" class="hidden space-y-6 relative font-sans">

  <!-- Navigation Bar / Header -->
  <div class="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md">
    <div class="flex items-center gap-3">
      <button type="button" id="settings-back-btn" class="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/80 hover:bg-slate-900 flex items-center justify-center text-slate-300 hover:text-rose-400 transition cursor-pointer shadow-inner">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div>
        <h2 class="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-gear text-cyan-400 animate-spin-slow"></i> User Settings
        </h2>
        <p class="text-[10px] text-slate-400 font-mono">Manage account, security PIN & profile appearance</p>
      </div>
    </div>
    
    <div class="hidden sm:flex items-center gap-2">
      <span class="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> SECURE SESSION
      </span>
    </div>
  </div>

  <!-- User Identity Summary Banner -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
    <div class="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
    
    <div class="relative w-16 h-16 shrink-0 flex items-center justify-center">
      <div id="settings-frame-overlay" class="absolute -inset-1 pointer-events-none z-10 flex items-center justify-center"></div>
      <div id="settings-avatar-container" class="w-16 h-16 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center text-2xl overflow-hidden shadow-inner text-slate-400">
        <i class="fa-solid fa-user-astronaut" id="settings-avatar-fallback"></i>
        <img id="settings-avatar-img" class="absolute inset-0 w-full h-full object-cover rounded-full hidden" src="" alt="Avatar" referrerPolicy="no-referrer" />
      </div>
    </div>

    <div class="text-center sm:text-left flex-1 min-w-0 space-y-1">
      <h3 class="text-base font-black text-white font-display tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
        @<span id="settings-summary-username">Player</span>
        <i class="fa-solid fa-circle-check text-sky-400 text-xs" title="Verified Player"></i>
      </h3>
      <p class="text-xs text-slate-400 font-mono truncate" id="settings-summary-email">user@example.com</p>
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-[9px]">
        <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
          Level: <strong class="text-amber-400" id="settings-summary-level">1</strong>
        </span>
        <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
          Role: <strong class="text-cyan-400 uppercase" id="settings-summary-role">Player</strong>
        </span>
      </div>
    </div>
  </div>

  <!-- Settings Grid Layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <!-- 1. PERSONAL INFORMATION CARD -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
          <i class="fa-solid fa-id-card text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Personal Details</h3>
          <p class="text-[9px] text-slate-500 font-sans">Update name, contact & address information</p>
        </div>
      </div>

      <form id="settings-personal-form" class="space-y-3 font-sans text-xs">
        <div class="space-y-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Username / Display Name</label>
          <div class="relative">
            <i class="fa-solid fa-user absolute left-3 top-2.5 text-slate-500 text-xs"></i>
            <input type="text" id="settings-input-username" required class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none transition" placeholder="Username" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Email Address</label>
          <div class="relative">
            <i class="fa-solid fa-envelope absolute left-3 top-2.5 text-slate-500 text-xs"></i>
            <input type="email" id="settings-input-email" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none transition" placeholder="user@domain.com" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Phone Number</label>
            <div class="relative">
              <i class="fa-solid fa-phone absolute left-3 top-2.5 text-slate-500 text-xs"></i>
              <input type="tel" id="settings-input-phone" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none transition" placeholder="01700000000" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Date of Birth</label>
            <div class="relative">
              <i class="fa-solid fa-calendar absolute left-3 top-2.5 text-slate-500 text-xs"></i>
              <input type="date" id="settings-input-dob" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none transition text-slate-300" />
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Address / City</label>
          <div class="relative">
            <i class="fa-solid fa-location-dot absolute left-3 top-2.5 text-slate-500 text-xs"></i>
            <input type="text" id="settings-input-address" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none transition" placeholder="Dhaka, Bangladesh" />
          </div>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5 mt-2 font-mono">
          <i class="fa-solid fa-floppy-disk text-xs"></i> Save Personal Info
        </button>
      </form>
    </div>

    <!-- 2. PROFILE APPEARANCE & CUSTOMIZATION CARD -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
          <i class="fa-solid fa-palette text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Appearance & Decor</h3>
          <p class="text-[9px] text-slate-500 font-sans">Avatar frames, glow auras & profile photos</p>
        </div>
      </div>

      <form id="settings-appearance-form" class="space-y-3.5 font-sans text-xs">
        <!-- Photo Upload & Google Photos -->
        <div class="space-y-1.5">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Avatar Photo Sync</label>
          <div class="flex items-center gap-2">
            <label class="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[9px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm">
              <i class="fa-solid fa-cloud-arrow-up text-rose-500"></i>
              Upload File
              <input type="file" id="settings-upload-input" accept="image/*" class="hidden" />
            </label>
            <button type="button" id="settings-google-photo-btn" class="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-amber-400 font-mono text-[9px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm">
              <i class="fa-brands fa-google-drive text-amber-500"></i>
              Google Photos
            </button>
          </div>
        </div>

        <!-- Frame Selector -->
        <div class="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl space-y-2 text-center relative overflow-hidden">
          <span class="text-[9px] uppercase font-bold text-slate-400 block font-mono flex items-center justify-center gap-1">
            <i class="fa-solid fa-wand-magic-sparkles text-amber-450 animate-pulse"></i> Select Avatar Frame Effect
          </span>
          <div class="flex justify-start items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" id="settings-frame-selector">
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-slate-700 text-slate-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="none">
              <span class="w-4 h-4 rounded-full border border-dashed border-slate-600 flex items-center justify-center"><i class="fa-solid fa-ban text-[8px]"></i></span>
              None
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-amber-500/60 text-amber-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="royal">
              <span class="w-4 h-4 rounded-full border border-amber-500/80 bg-amber-950/30 flex items-center justify-center text-amber-400"><i class="fa-solid fa-crown text-[8px]"></i></span>
              Royal
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-cyan-500/60 text-cyan-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="neon">
              <span class="w-4 h-4 rounded-full border border-cyan-400 bg-cyan-950/30 flex items-center justify-center text-cyan-400"><i class="fa-solid fa-bolt text-[8px]"></i></span>
              Neon
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-rose-500/60 text-rose-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="ruby">
              <span class="w-4 h-4 rounded-full border border-rose-500 bg-rose-950/30 flex items-center justify-center text-rose-400"><i class="fa-solid fa-fire text-[8px]"></i></span>
              Ruby
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-purple-500/60 text-purple-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="cosmic">
              <span class="w-4 h-4 rounded-full border border-purple-500 bg-purple-950/30 flex items-center justify-center text-purple-400"><i class="fa-solid fa-star text-[8px]"></i></span>
              Cosmic
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-orange-500/60 text-orange-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="phoenix">
              <span class="w-4 h-4 rounded-full border border-orange-500 bg-orange-950/30 flex items-center justify-center text-orange-400"><i class="fa-solid fa-fire-flame-simple text-[8px]"></i></span>
              Phoenix
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-emerald-500/60 text-emerald-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="dragon">
              <span class="w-4 h-4 rounded-full border border-emerald-500 bg-emerald-950/30 flex items-center justify-center text-emerald-400"><i class="fa-solid fa-dragon text-[8px]"></i></span>
              Dragon
            </button>
            <button type="button" class="settings-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-pink-500/60 text-pink-400 cursor-pointer flex flex-col items-center gap-1 border-slate-800" data-frame="love">
              <span class="w-4 h-4 rounded-full border border-pink-500 bg-pink-950/30 flex items-center justify-center text-pink-400"><i class="fa-solid fa-heart text-[8px]"></i></span>
              Love
            </button>
          </div>
        </div>

        <!-- Ambient Glow Aura -->
        <div class="space-y-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Profile Board Ambient Glow</label>
          <select id="settings-select-glow" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/80 rounded-xl py-2 px-3 text-xs text-white outline-none transition font-sans">
            <option value="none">None (Standard Dark Canvas)</option>
            <option value="pulse">❤️ Radiant Rose Aura (Pulsing Glow)</option>
            <option value="cyber">💙 Electric Cyan Spark (Tech Lightning)</option>
            <option value="gold">💛 Amber VIP Royalty (Shining Crowns)</option>
            <option value="rainbow">🌈 Rainbow Quantum Wave (Slow Smooth Cycle)</option>
          </select>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5 mt-2 font-mono">
          <i class="fa-solid fa-sparkles text-xs"></i> Save Appearance Decor
        </button>
      </form>
    </div>

    <!-- 3. ACCOUNT SECURITY & PIN CARD -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
          <i class="fa-solid fa-shield-halved text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Security PIN & Password</h3>
          <p class="text-[9px] text-slate-500 font-sans">Cashout PIN verification & password security</p>
        </div>
      </div>

      <form id="settings-security-form" class="space-y-3 font-sans text-xs">
        <!-- Security PIN -->
        <div class="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
              <i class="fa-solid fa-key text-emerald-400"></i> 4-Digit Cashout Security PIN
            </span>
            <span id="settings-pin-status-badge" class="text-[8px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 text-slate-400">
              Not Set
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <input type="password" id="settings-new-pin" maxlength="4" pattern="[0-9]*" class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white text-center font-mono outline-none tracking-widest" placeholder="New PIN" />
            </div>
            <div>
              <input type="password" id="settings-confirm-pin" maxlength="4" pattern="[0-9]*" class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white text-center font-mono outline-none tracking-widest" placeholder="Confirm" />
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="space-y-2 pt-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Change Password</label>
          <input type="password" id="settings-old-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="Current Password" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="password" id="settings-new-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="New Password" />
            <input type="password" id="settings-confirm-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="Confirm Password" />
          </div>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5 mt-2 font-mono">
          <i class="fa-solid fa-lock text-xs"></i> Update Security Credentials
        </button>
      </form>
    </div>

    <!-- 4. APP PREFERENCES & DEVICE INFO CARD -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
          <i class="fa-solid fa-sliders text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Preferences & System</h3>
          <p class="text-[9px] text-slate-500 font-sans">System sound effects, privacy & device links</p>
        </div>
      </div>

      <div class="space-y-3 text-xs">
        <!-- Sound FX Toggle -->
        <div class="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-850">
          <div class="space-y-0.5">
            <span class="font-bold text-white block">Sound Effects</span>
            <span class="text-[9px] text-slate-500 block leading-tight">Interactive audio for clicks & draw wins</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="settings-toggle-sound" class="sr-only peer" checked />
            <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <!-- Community Leaderboard Consent -->
        <div class="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-850">
          <div class="space-y-0.5">
            <span class="font-bold text-white block">Community Visibility</span>
            <span class="text-[9px] text-slate-500 block leading-tight">Display username on public winner boards</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="settings-toggle-community" class="sr-only peer" checked />
            <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <!-- Device Info Display -->
        <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-850/80 space-y-1.5 font-mono text-[9px]">
          <div class="flex justify-between items-center text-slate-400">
            <span>Device Fingerprint:</span>
            <span id="settings-device-fingerprint" class="text-slate-200 font-bold"></span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>IP Connection:</span>
            <span id="settings-device-ip" class="text-cyan-400 font-bold">Connected</span>
          </div>
        </div>
      </div>
    </div>

  </div>

</div>
