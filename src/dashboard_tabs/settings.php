<!-- ================= TAB: USER SETTINGS & ADVANCED CONTROL HUB ================= -->
<div id="tab-settings" class="hidden space-y-6 relative font-sans">

  <!-- Navigation Bar / Header -->
  <div class="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md">
    <div class="flex items-center gap-3">
      <button type="button" id="settings-back-btn" class="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/80 hover:bg-slate-900 flex items-center justify-center text-slate-300 hover:text-rose-400 transition cursor-pointer shadow-inner">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div>
        <h2 class="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-sliders text-cyan-400 animate-spin-slow"></i> Settings & Advanced Control Hub
        </h2>
        <p class="text-[10px] text-slate-400 font-mono">Performance engine, 2FA vault, webhooks, API tokens & system diagnostics</p>
      </div>
    </div>
    
    <div class="hidden sm:flex items-center gap-2">
      <span class="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> SECURE ADVANCED ENGINE
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
        <span class="bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded text-cyan-300">
          2FA: <strong class="text-emerald-400 uppercase" id="settings-summary-2fa">Disabled</strong>
        </span>
      </div>
    </div>
  </div>

  <!-- Advanced Settings Grid Layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <!-- 1. AI & SYSTEM PERFORMANCE ENGINE -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
          <i class="fa-solid fa-microchip text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">AI & System Performance Engine</h3>
          <p class="text-[9px] text-slate-500 font-sans">FPS rate, dynamic cache purge & real-time fraud monitoring</p>
        </div>
      </div>

      <div class="space-y-3.5 text-xs">
        <!-- Render Speed / FPS Selector -->
        <div class="space-y-1">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Graphics & Animation Frame Rate</label>
          <select id="settings-select-fps" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono">
            <option value="60">⚡ 60 FPS Smooth Balanced Mode</option>
            <option value="120">🚀 120 FPS High-Refresh Ultra Gaming Mode</option>
            <option value="30">🔋 30 FPS Power Saver & Low Bandwidth</option>
          </select>
        </div>

        <!-- AI Real-Time Risk & Fraud Monitor Toggle -->
        <div class="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-850">
          <div class="space-y-0.5 pr-2">
            <span class="font-bold text-white block">AI Fraud & IP Shift Monitor</span>
            <span class="text-[9px] text-slate-500 block leading-tight">Auto-lock cashouts if sudden geographic anomaly detected</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" id="settings-toggle-ai-risk" class="sr-only peer" checked />
            <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <!-- Cache Purge & Database Re-indexer -->
        <div class="bg-slate-950/80 border border-slate-850 p-3.5 rounded-2xl space-y-2">
          <div class="flex justify-between items-center font-mono text-[9.5px]">
            <span class="text-slate-400">Local Cache Storage:</span>
            <span id="settings-cache-size" class="text-cyan-400 font-bold">1.42 MB</span>
          </div>
          <button type="button" id="settings-btn-clear-cache" class="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 text-cyan-400 font-bold py-2 px-3 rounded-xl transition text-[10px] font-mono cursor-pointer flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-broom text-xs"></i> Purge Local Cache & Re-index Storage
          </button>
        </div>
      </div>
    </div>

    <!-- 2. ADVANCED SECURITY & 2FA VAULT -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
          <i class="fa-solid fa-shield-halved text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Advanced Security & 2FA Vault</h3>
          <p class="text-[9px] text-slate-500 font-sans">Two-Factor Authenticator, Cashout PIN & Active Sessions</p>
        </div>
      </div>

      <!-- 2FA Authenticator Button & Status -->
      <div class="bg-slate-950/90 border border-slate-850 p-3.5 rounded-2xl space-y-2.5">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1.5">
            <i class="fa-solid fa-key text-emerald-400"></i> Two-Factor Auth (2FA)
          </span>
          <span id="settings-2fa-status-badge" class="text-[8px] font-mono px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
            INACTIVE
          </span>
        </div>
        <p class="text-[9px] text-slate-400 font-sans leading-tight">
          Protect account cashouts with Google Authenticator or Authy App TOTP codes.
        </p>
        <button type="button" id="settings-btn-open-2fa-modal" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-3 rounded-xl transition text-[10px] font-mono cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
          <i class="fa-solid fa-qrcode text-xs"></i> Configure 2FA Authenticator
        </button>
      </div>

      <!-- Security PIN & Password Form -->
      <form id="settings-security-form" class="space-y-3 font-sans text-xs pt-1">
        <!-- Security PIN -->
        <div class="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
              <i class="fa-solid fa-lock text-emerald-400"></i> 4-Digit Cashout Security PIN
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
        <div class="space-y-2">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Change Password</label>
          <input type="password" id="settings-old-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="Current Password" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="password" id="settings-new-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="New Password" />
            <input type="password" id="settings-confirm-pass" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white outline-none" placeholder="Confirm Password" />
          </div>
        </div>

        <button type="submit" class="w-full bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-emerald-800/60 font-black text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-mono">
          <i class="fa-solid fa-lock text-xs"></i> Update Security Credentials
        </button>
      </form>

      <!-- Active Sessions Manager -->
      <div class="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[9.5px]">
        <div class="text-slate-400">
          <span>Active Device Sessions:</span>
          <strong class="text-white block font-sans text-xs">1 Active (Current Browser)</strong>
        </div>
        <button type="button" id="settings-btn-terminate-sessions" class="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 px-2.5 py-1.5 rounded-xl transition text-[9px] font-mono cursor-pointer">
          <i class="fa-solid fa-right-from-bracket"></i> Terminate Other Sessions
        </button>
      </div>
    </div>

    <!-- 3. WEBHOOK AUTOMATION & ALERT CHANNELS -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
          <i class="fa-solid fa-bell text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Webhook Automation & Alerts</h3>
          <p class="text-[9px] text-slate-500 font-sans">Discord/Telegram Webhooks & granular notification channels</p>
        </div>
      </div>

      <div class="space-y-3.5 text-xs">
        <!-- Discord / Telegram Webhook Input -->
        <div class="space-y-1.5">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Custom Webhook Alert Endpoint</label>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <i class="fa-solid fa-link absolute left-3 top-2.5 text-slate-500 text-xs"></i>
              <input type="url" id="settings-webhook-url" class="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/80 rounded-xl py-2 pl-8 pr-3 text-xs text-white outline-none font-mono" placeholder="https://discord.com/api/webhooks/..." />
            </div>
            <button type="button" id="settings-btn-save-webhook" class="bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer shrink-0">
              Save Webhook
            </button>
          </div>
          <button type="button" id="settings-btn-test-webhook" class="text-[9px] text-purple-400 hover:underline font-mono flex items-center gap-1">
            <i class="fa-solid fa-paper-plane"></i> Send Test Webhook Payload
          </button>
        </div>

        <!-- Notification Channels Toggles -->
        <div class="space-y-2">
          <span class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">System Alert Preferences</span>
          
          <div class="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span class="text-slate-300 text-[11px]">Jackpot Draw Countdown Alerts</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="settings-toggle-draw-alerts" class="sr-only peer" checked />
              <div class="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span class="text-slate-300 text-[11px]">Messenger Direct PM Alerts</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="settings-toggle-pm-alerts" class="sr-only peer" checked />
              <div class="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span class="text-slate-300 text-[11px]">Sound Effects & Audio Feedback</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="settings-toggle-sound" class="sr-only peer" checked />
              <div class="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. POWER USER API & DIAGNOSTIC HUB -->
    <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div class="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
          <i class="fa-solid fa-code text-xs"></i>
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase tracking-wider font-mono">Developer API & Diagnostics</h3>
          <p class="text-[9px] text-slate-500 font-sans">API Key token, account vault JSON export & network ping diagnostics</p>
        </div>
      </div>

      <div class="space-y-3.5 text-xs">
        <!-- Developer API Secret Key Token -->
        <div class="space-y-1.5">
          <label class="block text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">Personal API Bearer Token</label>
          <div class="flex items-center gap-2">
            <input type="password" id="settings-api-token" readonly value="lw_sec_token_9837a1f8021c" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-amber-300 font-mono outline-none" />
            <button type="button" id="settings-btn-copy-token" class="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-amber-400 font-mono text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
            <button type="button" id="settings-btn-regen-token" class="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-mono text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer" title="Regenerate Token">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </div>

        <!-- Export Account Vault Data -->
        <div class="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-2 font-mono text-[9.5px]">
          <div>
            <span class="text-white font-bold block">Account Ledger & Data Export</span>
            <span class="text-slate-500 text-[8.5px] block">Download full ledger, tickets & stats in structured JSON format</span>
          </div>
          <button type="button" id="settings-btn-export-json" class="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/40 px-3 py-2 rounded-xl transition text-[9.5px] font-mono cursor-pointer shrink-0 flex items-center gap-1.5">
            <i class="fa-solid fa-download"></i> Export JSON
          </button>
        </div>

        <!-- Network Diagnostic & Server Node Selector -->
        <div class="p-3 bg-slate-950 rounded-2xl border border-slate-850 space-y-2 font-mono text-[9px]">
          <div class="flex justify-between items-center text-slate-400">
            <span>Server Cluster Node:</span>
            <select id="settings-select-node" class="bg-slate-900 border border-slate-800 text-cyan-400 font-bold rounded-lg px-2 py-1 outline-none text-[9px]">
              <option value="bd">Asia-East (BD Dhaka Node)</option>
              <option value="sg">Singapore GCP Cloud Node</option>
              <option value="eu">Frankfurt High-Speed Node</option>
            </select>
          </div>

          <div class="flex justify-between items-center text-slate-400">
            <span>Network Round-Trip Latency:</span>
            <span id="settings-latency-ping" class="text-emerald-400 font-bold">24 ms (Optimal)</span>
          </div>

          <button type="button" id="settings-btn-run-ping" class="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-1.5 rounded-lg transition text-[9px] cursor-pointer flex items-center justify-center gap-1">
            <i class="fa-solid fa-network-wired text-cyan-400"></i> Run Latency Speed Diagnostic
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- 2FA SETUP MODAL -->
  <div id="settings-2fa-modal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
    <div class="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-center">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-shield-halved text-emerald-400"></i> Google Authenticator 2FA
        </h4>
        <button type="button" id="settings-close-2fa-modal-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      <div id="settings-2fa-active-banner" class="hidden bg-emerald-950/70 border border-emerald-800/80 p-2.5 rounded-2xl text-[10px] text-emerald-300 font-mono font-bold flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        Google Authenticator 2FA is ACTIVE
      </div>

      <p class="text-[10px] text-slate-400 font-sans leading-relaxed">
        Google Authenticator বা Authy অ্যাপ দিয়ে নিচের QR কোডটি স্ক্যান করুন অথবা Secret Key টি কপি করে অ্যাপে যুক্ত করুন।
      </p>

      <!-- Real QR Code Container -->
      <div id="settings-2fa-qr-container" class="w-40 h-40 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg border-2 border-emerald-500/80">
        <div class="text-slate-500 text-xs font-mono animate-pulse">Generating QR...</div>
      </div>

      <!-- Secret Key with Copy Button -->
      <div class="bg-slate-950 p-2.5 rounded-2xl border border-slate-850 space-y-1.5">
        <span class="text-slate-500 block text-[8px] font-mono font-bold uppercase tracking-wider">SECRET SEED KEY:</span>
        <div class="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <strong id="settings-2fa-seed" class="text-emerald-400 font-mono text-xs tracking-widest select-all">JBSWY3DPEHPK3PXP</strong>
          <button type="button" id="settings-2fa-copy-key-btn" class="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 text-[9px] font-mono font-bold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0">
            <i class="fa-solid fa-copy text-[10px]"></i> Copy Key
          </button>
        </div>
      </div>

      <div class="space-y-1.5 text-left">
        <label class="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Enter 6-Digit Code from Authenticator App</label>
        <input type="text" id="settings-2fa-code" maxlength="6" inputmode="numeric" pattern="[0-9]*" placeholder="123456" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-center text-white font-mono text-base tracking-widest outline-none" />
      </div>

      <div class="space-y-2">
        <button type="button" id="settings-btn-verify-2fa" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer font-mono flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-circle-check"></i> Verify & Activate 2FA
        </button>
        <button type="button" id="settings-btn-disable-2fa" class="hidden w-full bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs py-2 rounded-xl transition cursor-pointer font-mono flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-lock-open"></i> Disable 2FA
        </button>
      </div>
    </div>
  </div>

</div>
