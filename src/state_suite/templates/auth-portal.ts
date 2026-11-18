export const authPortalTemplate = `
    <!-- ================= SCREEN 2: AUTHENTICATION (LOGIN & REGISTRATION) ================= -->
    <div id="screen-auth" class="hidden min-h-[100dvh] bg-[#0b0e14] flex flex-col justify-center items-center p-3.5 sm:p-5 select-none relative overflow-x-hidden">
      <!-- Ambient light decorative backdrop glow -->
      <div class="absolute top-1/6 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
      <div class="absolute bottom-1/6 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style="animation-delay: 1.5s;"></div>

      <!-- Floating JS/CSS Animated Particles -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute top-[15%] left-[12%] w-2 h-2 rounded-full bg-amber-400/60 blur-[1px] animate-float-3d" style="animation-duration: 4s;"></div>
        <div class="absolute top-[25%] right-[15%] w-3 h-3 rounded-full bg-cyan-400/60 blur-[1px] animate-float-3d" style="animation-duration: 5.5s; animation-delay: 1s;"></div>
        <div class="absolute bottom-[20%] left-[20%] w-2.5 h-2.5 rounded-full bg-emerald-400/60 blur-[1px] animate-float-3d" style="animation-duration: 6s; animation-delay: 2s;"></div>
        <div class="absolute bottom-[30%] right-[18%] w-2 h-2 rounded-full bg-yellow-300/60 blur-[1px] animate-float-3d" style="animation-duration: 4.8s; animation-delay: 0.5s;"></div>
        <div class="absolute top-[45%] left-[8%] w-1.5 h-1.5 rounded-full bg-rose-400/60 blur-[1px] animate-float-3d" style="animation-duration: 5s; animation-delay: 2.5s;"></div>
        <div class="absolute top-[60%] right-[10%] w-2.5 h-2.5 rounded-full bg-purple-400/60 blur-[1px] animate-float-3d" style="animation-duration: 6.2s; animation-delay: 1.8s;"></div>
      </div>

      <div class="portal-card relative z-10 interactive-tilt-card transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]">
        <!-- Top Bonus Banner -->
        <div class="bonus-banner" id="auth-bonus-banner">
          🎁 REGISTER NOW &amp; GET $50 FREE BONUS
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button class="tab-btn active" id="signInTab" onclick="if(window.switchTab){window.switchTab('signin')}">Sign In</button>
          <button class="tab-btn" id="registerTab" onclick="if(window.switchTab){window.switchTab('register')}">Register</button>
        </div>

        <!-- Form Section -->
        <div class="forms-wrapper">
          <div class="form-container" id="formContainer">
            
            <!-- SIGN IN FORM -->
            <div class="form-box" id="auth-login-box">
              <form id="signInForm">
                <div class="input-group">
                  <label>Username or Email</label>
                  <input type="text" id="auth-user" class="input-field" placeholder="Enter username" required autocomplete="username">
                </div>
                
                <div class="input-group">
                  <div class="flex justify-between items-center mb-1">
                    <label class="!mb-0">Password</label>
                    <a href="forgot_password.html" class="text-[10px] text-amber-400 hover:text-amber-300 font-mono">Forgot?</a>
                  </div>
                  <input type="password" id="auth-pass" class="input-field" placeholder="••••••••" required autocomplete="current-password">
                </div>

                <div class="input-group">
                  <label>Security Math Captcha</label>
                  <div class="captcha-row">
                    <div class="captcha-badge" id="loginQuestion">0 + 0 =</div>
                    <input type="number" id="loginAnswer" class="input-field" placeholder="Answer" required>
                  </div>
                </div>

                <button type="submit" class="btn-submit">SIGN IN NOW</button>
              </form>

              <!-- Agent Portal Login Trigger -->
              <div class="pt-2">
                <button type="button" onclick="document.getElementById('auth-login-box').classList.add('hidden'); document.getElementById('auth-agent-login-box').classList.remove('hidden');" class="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs shadow">
                  <i data-lucide="user" class="w-4 h-4"></i>
                  <span>Agent / Dealer Portal Login (এজেন্ট লগইন)</span>
                </button>
              </div>
            </div>

            <!-- AGENT LOGIN FORM VIEW -->
            <div class="form-box hidden" id="auth-agent-login-box">
              <div class="text-center pb-3 flex flex-col items-center">
                <div class="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-1 ring-white/10">
                  <i class="fa-solid fa-user-tie text-white text-xl"></i>
                </div>
                <h3 class="text-xs font-black uppercase tracking-wider text-white font-display">Agent Portal Login</h3>
                <p class="text-[9px] font-mono text-cyan-400 leading-none mt-1">District Agent & Dealer Access</p>
              </div>

              <form id="auth-agent-login-form">
                <div class="input-group">
                  <label>Username, Gmail or Phone</label>
                  <input type="text" id="agent-login-user" class="input-field" placeholder="Enter username, email or phone" required autocomplete="username">
                </div>

                <div class="input-group">
                  <label>Agent Passphrase</label>
                  <input type="password" id="agent-login-pass" class="input-field" placeholder="••••••••" required autocomplete="current-password">
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition cursor-pointer uppercase font-display mt-2">
                  Access Agent Portal
                </button>

                <button type="button" onclick="document.getElementById('auth-agent-login-box').classList.add('hidden'); document.getElementById('auth-login-box').classList.remove('hidden');" class="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono py-2.5 rounded-xl transition cursor-pointer">
                  ← Back to Player Sign In
                </button>
              </form>
            </div>

            <!-- REGISTER FORM -->
            <div class="form-box" id="auth-signup-box">
              <!-- 1-Click Fast Registration Box -->
              <div class="one-click-box">
                <span id="auth-one-click-text">⚡ Instant Setup + $50 Bonus</span>
                <button class="btn-one-click" type="button" onclick="if(window.handleOneClickReg){window.handleOneClickReg()}">1-CLICK REGISTER</button>
              </div>

              <form id="registerForm">
                <div class="input-group">
                  <label>Full Name</label>
                  <input type="text" id="reg-fullname" class="input-field" placeholder="Enter full name" required>
                </div>

                <div class="input-group">
                  <label>Username</label>
                  <input type="text" id="reg-user" class="input-field" placeholder="Choose username" required autocomplete="off">
                </div>

                <div class="input-group">
                  <label>Password</label>
                  <input type="password" id="reg-pass" class="input-field" placeholder="••••••••" required>
                </div>

                <!-- Dynamic Agent Recruitment Header Banner -->
                <div id="reg-agent-apply-banner" class="hidden p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-sans space-y-1 mb-4">
                  <div class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                    <i data-lucide="shield" class="w-4 h-4 text-amber-400"></i>
                    <span>Sub-Agent Field Registration</span>
                  </div>
                  <p class="text-[11px] leading-relaxed">
                    You are registering an official agent portal account under recruitment leader <strong id="reg-agent-leader-name" class="text-white">@Leader</strong>. Complete the form to submit your application for administrator approval.
                  </p>
                </div>

                <!-- Fallback schema fields for backend compatibility -->
                <div id="reg-default-email-phone-block" class="space-y-4">
                  <input type="hidden" id="reg-email" value="">
                  <input type="hidden" id="reg-phone" value="">
                  <input type="hidden" id="reg-region" value="Dhaka">
                </div>

                <!-- Dynamic Visible Agent Recruitment Fields -->
                <div id="reg-agent-fields-block" class="hidden space-y-4 mb-4">
                  <div class="input-group">
                    <label>Agent Email Address</label>
                    <input type="email" id="reg-agent-email" class="input-field" placeholder="Enter valid email (e.g. agent@example.com)">
                  </div>
                  <div class="input-group">
                    <label>Agent Mobile Number</label>
                    <input type="text" id="reg-agent-phone" class="input-field" placeholder="Enter active mobile (e.g. 01712345678)">
                  </div>
                  <div class="input-group">
                    <label>District Office Region</label>
                    <select id="reg-agent-region" class="input-field w-full bg-[#182035] border border-slate-800 text-white rounded-xl py-3 px-3.5 outline-none">
                      <option value="Dhaka">Dhaka (ঢাকা)</option>
                      <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                      <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                      <option value="Sylhet">Sylhet (সিলেট)</option>
                      <option value="Khulna">Khulna (খুলনা)</option>
                      <option value="Barisal">Barisal (বরিশাল)</option>
                      <option value="Rangpur">Rangpur (রংপুর)</option>
                      <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                    </select>
                  </div>
                </div>

                <input type="hidden" id="reg-dob" value="2000-01-01">
                <div class="input-group">
                  <label class="flex items-center gap-1.5 text-amber-400 font-bold">
                    <i data-lucide="user-plus" class="w-4 h-4 text-amber-400"></i>
                    <span>Referral Code (Optional)</span>
                  </label>
                  <input type="text" id="reg-refer-by" class="input-field border-amber-500/30 focus:border-amber-500" placeholder="Enter recruiter username" autocomplete="off">
                  <span class="text-[9px] text-slate-500 mt-1 block">If you were invited by a friend, enter their username here.</span>
                </div>
                <input type="hidden" id="reg-is-agent-apply" value="false">
                <input type="hidden" id="reg-agent-comm-rate" value="5.0">

                <div class="input-group">
                  <label>Security Math Captcha</label>
                  <div class="captcha-row">
                    <div class="captcha-badge" id="regQuestion">0 + 0 =</div>
                    <input type="number" id="regAnswer" class="input-field" placeholder="Answer" required>
                  </div>
                </div>

                <div class="input-group !mb-4">
                  <label class="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300 font-sans select-none">
                    <input type="checkbox" id="reg-terms-checkbox" class="mt-0.5 rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500 w-4 h-4 shrink-0 cursor-pointer" required />
                    <span class="leading-snug">
                      I agree to the <a href="#terms" onclick="event.preventDefault(); if(window.LegalPoliciesManager){window.LegalPoliciesManager.renderPublicPolicy(window.appInstance || window.app, 'terms')}" class="text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer">Terms & Conditions</a> and <a href="#privacy" onclick="event.preventDefault(); if(window.LegalPoliciesManager){window.LegalPoliciesManager.renderPublicPolicy(window.appInstance || window.app, 'privacy')}" class="text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer">Privacy Policy</a>.
                    </span>
                  </label>
                  <p id="reg-terms-error" class="text-[10px] text-rose-500 font-mono mt-1 hidden">You must agree to the Terms & Conditions and Privacy Policy to create an account.</p>
                </div>

                <button type="submit" id="reg-submit-btn" class="btn-submit">CLAIM $50 &amp; REGISTER</button>
              </form>
            </div>

          </div>
        </div>
      </div>

      <!-- 1-Click Credentials & Bonus Modal -->
      <div class="modal" id="credModal">
        <div class="modal-content !max-w-[360px] !w-[92%] !p-5 !rounded-2xl !bg-[#0f1422] !border-amber-500/50 shadow-2xl">
          <h3 class="!text-amber-400 !font-black !text-base flex items-center justify-center gap-1.5">
            <span>🎉</span> Welcome Bonus Claimed!
          </h3>
          <div id="cred-modal-bonus-badge" class="bonus-alert !my-2.5 !py-2 !px-3 !rounded-xl !bg-emerald-950/70 !border-emerald-500/60 !text-emerald-400 !text-xs !font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span>💵</span> $50 FREE BONUS ADDED TO WALLET
          </div>
          <p class="text-[11px] text-slate-400 font-sans mb-2">Save your auto-generated login credentials:</p>
          
          <!-- Credentials Box with Individual Copy Options -->
          <div class="credentials-box !bg-slate-950 !border-slate-800 !rounded-xl !p-3 !space-y-2 !my-3 shadow-inner text-left">
            <!-- Username Row -->
            <div class="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 p-2 rounded-lg">
              <div class="min-w-0 flex-1">
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Username</span>
                <span id="genUser" class="font-mono font-bold text-xs text-amber-300 truncate block select-all"></span>
              </div>
              <button type="button" id="btn-copy-username" onclick="if(window.copyCredItem){window.copyCredItem('username')}" class="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer" title="Copy Username">
                <i data-lucide="clipboard" class="w-4 h-4"></i>
                <span id="copy-user-btn-text">Copy</span>
              </button>
            </div>

            <!-- Password Row -->
            <div class="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 p-2 rounded-lg">
              <div class="min-w-0 flex-1">
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Password</span>
                <span id="genPass" class="font-mono font-bold text-xs text-cyan-300 truncate block select-all"></span>
              </div>
              <button type="button" id="btn-copy-password" onclick="if(window.copyCredItem){window.copyCredItem('password')}" class="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer" title="Copy Password">
                <i class="fa-solid fa-copy text-[10px]"></i>
                <span id="copy-pass-btn-text">Copy</span>
              </button>
            </div>
          </div>

          <!-- Quick Action Buttons: Copy All & TXT Download -->
          <div class="grid grid-cols-2 gap-2 mb-3 font-mono">
            <button type="button" id="btn-copy-all" onclick="if(window.copyCredItem){window.copyCredItem('all')}" class="w-full py-2.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
              <i class="fa-solid fa-clone text-amber-400"></i>
              <span id="copy-all-btn-text">Copy Both</span>
            </button>
            <button type="button" id="btn-download-txt" onclick="if(window.downloadCredentialsTxt){window.downloadCredentialsTxt()}" class="w-full py-2.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/60">
              <i class="fa-solid fa-file-arrow-down text-yellow-300"></i>
              <span>Download .TXT</span>
            </button>
          </div>

          <!-- Primary Submit Button -->
          <button class="btn-submit !py-3 !rounded-xl !text-xs !font-black !tracking-wide flex items-center justify-center gap-2 cursor-pointer transition active:scale-98" type="button" onclick="if(window.closeModal){window.closeModal()}">
            <i data-lucide="zap" class="w-4 h-4"></i>
            <span>START PLAYING</span>
          </button>
        </div>
      </div>

    </div>
`;
