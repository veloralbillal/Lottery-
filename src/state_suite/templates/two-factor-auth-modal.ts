export const twoFactorAuthModalTemplate = `
    <!-- ================= TWO-FACTOR AUTHENTICATION (2FA) CHALLENGE MODAL ================= -->
    <div id="two-factor-auth-modal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative space-y-4">
        <!-- Close icon button -->
        <button id="btn-two-factor-close" type="button" class="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center cursor-pointer" onclick="if(window.closeModal){window.closeModal('two-factor-auth-modal')}">
          <i data-lucide="x" class="text-sm"></i>
        </button>

        <!-- Icon & Header -->
        <div class="text-center space-y-2 pt-2">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-lg animate-pulse">
            <i data-lucide="shield-check"></i>
          </div>
          <h3 id="two-factor-modal-title" class="text-base font-black text-white font-display uppercase tracking-wider">Two-Factor Security</h3>
          <p id="two-factor-modal-subtitle" class="text-xs text-slate-400 font-sans leading-relaxed">
            Enter your 6-digit security code or recovery backup code to authorize this action.
          </p>
        </div>

        <!-- Error alert banner -->
        <div id="two-factor-alert-box" class="hidden p-3 rounded-2xl bg-rose-955/60 border border-rose-850/60 text-rose-300 text-xs font-mono flex items-center gap-2">
          <i data-lucide="alert-triangle" class="text-rose-400 shrink-0"></i>
          <span id="two-factor-alert-text">Invalid code. Please try again.</span>
        </div>

        <!-- 2FA Challenge Form -->
        <form id="two-factor-challenge-form" class="space-y-4" onsubmit="event.preventDefault();">
          <div class="space-y-1.5 text-center">
            <label id="two-factor-input-label" class="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Enter 6-Digit Code
            </label>
            <input 
              id="two-factor-code-input" 
              type="text" 
              maxlength="10" 
              inputmode="numeric" 
              autocomplete="one-time-code" 
              placeholder="••••••" 
              required
              class="w-full text-center tracking-[0.4em] font-mono text-xl font-black py-3 px-4 bg-slate-950 border-2 border-slate-800 focus:border-emerald-400 rounded-2xl text-white outline-none transition placeholder:text-slate-700 shadow-inner"
            />
            <div class="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1 pt-0.5">
              <span id="two-factor-remaining-badge">3 attempts remaining</span>
              <button id="btn-toggle-backup-mode" type="button" class="text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
                Use Backup Code
              </button>
            </div>
          </div>

          <div class="space-y-2 pt-1">
            <button 
              id="btn-two-factor-submit" 
              type="submit" 
              class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="lock" class="text-xs"></i> Verify & Authorize
            </button>
            <button 
              id="btn-two-factor-cancel" 
              type="button" 
              class="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs rounded-2xl border border-slate-800 transition cursor-pointer"
              onclick="if(window.closeModal){window.closeModal('two-factor-auth-modal')}"
            >
              Cancel Operation
            </button>
          </div>
        </form>
      </div>
    </div>
`;
