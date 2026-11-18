export const splashScreenTemplate = `
    <!-- ================= STUNNING VOICE CLUB + LOTTERY HYBRID SPLASH SCREEN ================= -->
    <div id="splash-screen" class="fixed inset-0 bg-[#060814] z-[2000] flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-y-auto transition-all duration-750 ease-out">
      <!-- Full-Screen Ambient Voice Club Glows & Lottery Rays -->
      <div class="absolute w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/25 via-purple-600/15 to-transparent rounded-full blur-[110px] pointer-events-none animate-pulse"></div>
      <div class="absolute w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[130px] -top-20 -left-20 animate-pulse delay-500 pointer-events-none"></div>
      <div class="absolute w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px] -bottom-20 -right-20 animate-pulse delay-1000 pointer-events-none"></div>

      <!-- Rotating Golden Casino Roulette Sunburst Beams -->
      <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
        <div class="w-[900px] h-[900px] border-[2px] border-dashed border-amber-400/40 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div class="absolute w-[700px] h-[700px] border border-pink-500/25 rounded-full animate-[spin_35s_linear_infinite_reverse]"></div>
        <div class="absolute w-[1100px] h-[1100px] bg-[conic-gradient(from_0deg,#fbbf24_0deg,transparent_60deg,#ec4899_120deg,transparent_180deg,#06b6d4_240deg,transparent_300deg,#fbbf24_360deg)] opacity-10 animate-[spin_80s_linear_infinite]"></div>
      </div>

      <!-- Floating Decorative Lottery Balls & Voice Club Mics -->
      <div class="absolute top-16 left-4 sm:left-12 hidden xs:flex flex-col items-center pointer-events-none lottery-float-1 z-10">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center text-slate-950 font-black text-sm sm:text-base font-mono">
          7️⃣
        </div>
        <span class="text-[8px] font-mono text-amber-300 font-bold uppercase tracking-wider mt-1 drop-shadow">Lucky 7</span>
      </div>

      <div class="absolute top-20 right-4 sm:right-12 hidden xs:flex flex-col items-center pointer-events-none lottery-float-2 z-10">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-400 border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.8)] flex items-center justify-center text-white font-black text-sm sm:text-base">
          🎱
        </div>
        <span class="text-[8px] font-mono text-pink-300 font-bold uppercase tracking-wider mt-1 drop-shadow">VIP Ball</span>
      </div>

      <!-- Skip / Dismiss Quick Button -->
      <button id="splash-skip-btn" type="button" class="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-400/50 text-amber-300 hover:text-white rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer z-40 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
        <span>Skip</span>
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>

      <div id="emergency-bypass" class="hidden absolute bottom-6 right-6 z-[3000]">
         <button onclick="document.getElementById('splash-screen').classList.add('hidden'); if(window.appInstance) { window.appInstance.render(); } else { alert('App script failed to load. Please check your internet or console for 404 errors.'); }" class="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl border-2 border-white/20 animate-pulse transition-all active:scale-95">
           SKIP SPLASH (EMERGENCY)
         </button>
      </div>

      <!-- TOP HEADER BRANDING: VOICE CLUB ROOM + LOTTERY JACKPOT -->
      <div class="relative pt-1 sm:pt-3 flex flex-col items-center gap-1.5 animate-fade-in z-20 text-center">
        <div class="flex items-center gap-2">
          <!-- Voice Room Live Indicator Badge -->
          <div class="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span class="bg-gradient-to-r from-amber-400 via-rose-300 to-cyan-300 bg-clip-text text-transparent font-black text-[9px] sm:text-[10px] font-mono tracking-wider uppercase">
              🎙️ VIP VOICE CLUB • 🎰 LOTTERY JACKPOT STAGE
            </span>
          </div>
        </div>

        <h1 id="splash-headline-text" class="text-xs sm:text-sm font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 tracking-widest font-mono drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] px-2">
          🏆 CONGRATULATIONS TO OUR TOP WINNER!
        </h1>
      </div>

      <!-- CENTER STAGE: VOICE CLUB MIC & LOTTERY JACKPOT SPOTLIGHT -->
      <div class="relative my-auto py-1 sm:py-3 flex flex-col items-center w-full max-w-[360px] sm:max-w-md text-center z-20 space-y-3">
        
        <!-- GRAND VOICE CLUB STAGE & WINNER SPOTLIGHT CARD -->
        <div id="splash-top-winner-card" class="w-full bg-gradient-to-b from-slate-900/95 via-purple-950/85 to-[#080b18]/95 border-2 border-amber-400/80 p-4 sm:p-5 rounded-3xl shadow-[0_15px_50px_rgba(251,191,36,0.35)] flex flex-col items-center gap-2.5 sm:gap-3 relative overflow-hidden backdrop-blur-xl">
          
          <!-- Ambient Background Light Flares -->
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/25 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-pink-500/10 to-transparent pointer-events-none"></div>

          <!-- TOP 1 SVIP FRAME WITH EXPANDING VOICE SOUNDWAVE RIPPLES -->
          <div id="splash-winner-avatar-frame-wrapper" class="relative w-28 h-28 sm:w-32 sm:h-32 my-1 sm:my-2 flex items-center justify-center select-none shrink-0">
            
            <!-- CONCENTRIC EXPANDING VOICE SOUNDWAVE RIPPLE AURA RINGS (Voice Club Signature Animation) -->
            <div class="absolute inset-0 rounded-full border-2 border-amber-400/70 voice-wave-1 pointer-events-none"></div>
            <div class="absolute inset-0 rounded-full border-2 border-rose-500/60 voice-wave-2 pointer-events-none"></div>
            <div class="absolute inset-0 rounded-full border-2 border-cyan-400/50 voice-wave-3 pointer-events-none"></div>
            <div class="absolute inset-0 rounded-full border border-yellow-300/40 voice-wave-4 pointer-events-none"></div>

            <!-- Floating Animated Golden Crown & 777 Jackpot Emblem -->
            <div class="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce" style="animation-duration: 2.2s;">
              <div class="relative">
                <i data-lucide="crown" class="w-8 h-8 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,1)]"></i>
                <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-black text-[7px] font-mono px-1 rounded-full border border-yellow-300">777</span>
              </div>
            </div>

            <!-- SVIP Golden Rotating Outer Aura Ring -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-yellow-300 p-[3px] animate-spin-slow shadow-[0_0_25px_rgba(251,191,36,0.9)] pointer-events-none">
              <div class="w-full h-full bg-[#0a0c1a] rounded-full"></div>
            </div>

            <!-- Double Pulsing Neon Rings -->
            <div class="absolute -inset-2 rounded-full border border-amber-400/60 animate-pulse pointer-events-none"></div>
            <div class="absolute -inset-1 rounded-full border border-pink-400/50 animate-ping opacity-25 pointer-events-none" style="animation-duration: 2.8s;"></div>

            <!-- SVIP Golden Side Wings (Angel VIP Tier) -->
            <div class="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <i data-lucide="feather" class="w-5 h-5 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,1)] transform -rotate-[35deg]"></i>
            </div>
            <div class="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <i data-lucide="feather" class="w-5 h-5 text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,1)] transform rotate-[35deg] scale-x-[-1]"></i>
            </div>

            <!-- User Profile Photo -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative z-10 border-2 border-amber-300/90 bg-slate-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <img id="splash-winner-photo" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250" class="w-full h-full object-cover" alt="Top Winner Profile" />
            </div>

            <!-- Voice Club Studio Mic Floating Badge -->
            <div class="absolute -bottom-1 -right-1 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 border-2 border-slate-950 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse">
              <i data-lucide="mic-2" class="w-4 h-4"></i>
            </div>

            <!-- Bottom SVIP Voice Room Tag Badge -->
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 text-slate-950 font-black text-[8.5px] sm:text-[9px] font-mono px-2.5 sm:px-3 py-0.5 rounded-full border border-amber-100 shadow-[0_4px_12px_rgba(251,191,36,0.7)] uppercase whitespace-nowrap tracking-wider flex items-center gap-1">
              <i class="fa-solid fa-microphone-lines text-[8px] text-white"></i> ON MIC • TOP 1 SVIP
            </div>
          </div>

          <!-- VOICE AUDIO FREQUENCY EQUALIZER BARS (Music / Voice Club Room Spectrum) -->
          <div class="flex flex-col items-center gap-1 w-full pt-1">
            <div class="flex items-center justify-center gap-1 sm:gap-1.5 h-6 select-none">
              <div class="w-1 rounded-full bg-amber-400 eq-bar" style="animation-delay: 0.1s;"></div>
              <div class="w-1 rounded-full bg-yellow-300 eq-bar" style="animation-delay: 0.4s;"></div>
              <div class="w-1 rounded-full bg-rose-500 eq-bar" style="animation-delay: 0.2s;"></div>
              <div class="w-1 rounded-full bg-pink-500 eq-bar" style="animation-delay: 0.6s;"></div>
              <div class="w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-rose-500 to-cyan-400 eq-bar shadow-[0_0_8px_rgba(245,158,11,0.8)]" style="animation-delay: 0.0s;"></div>
              <div class="w-1 rounded-full bg-pink-500 eq-bar" style="animation-delay: 0.5s;"></div>
              <div class="w-1 rounded-full bg-rose-500 eq-bar" style="animation-delay: 0.3s;"></div>
              <div class="w-1 rounded-full bg-yellow-300 eq-bar" style="animation-delay: 0.7s;"></div>
              <div class="w-1 rounded-full bg-amber-400 eq-bar" style="animation-delay: 0.2s;"></div>
            </div>
            <div class="flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[9px] font-mono text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="tracking-wider uppercase font-bold">LIVE STAGE VOICE AUDIO • 777 JACKPOT DRAW</span>
            </div>
          </div>

          <!-- WINNER DETAILS SECTION -->
          <div class="space-y-1 sm:space-y-1.5 text-center relative z-10 w-full pt-0.5">
            <div class="inline-flex items-center gap-1.5 bg-amber-950/90 border border-amber-600/60 px-3 py-0.5 sm:py-1 rounded-full text-amber-300 font-mono text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider shadow">
              <i data-lucide="trophy" class="w-3 h-3 text-amber-400"></i> TOP 1 LOTTERY CHAMPION
            </div>
            
            <h2 id="splash-winner-username" class="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 tracking-tight font-sans drop-shadow">
              @lottery_pro
            </h2>
            
            <div class="inline-block bg-slate-950/80 px-2.5 py-0.5 rounded-md border border-slate-800 text-[9.5px] sm:text-[10px] font-mono text-cyan-300">
              <span id="splash-winner-id">ID: #101</span>
            </div>
          </div>

          <!-- LOTTERY JACKPOT EARNINGS PRIZE HIGHLIGHT -->
          <div class="w-full bg-gradient-to-r from-slate-950 via-[#0d0f22] to-slate-950 border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-left relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/30 border border-amber-400/60 flex items-center justify-center text-amber-300 text-sm font-black shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.4)]">
                🎰
              </div>
              <div>
                <span class="block text-[8px] sm:text-[8.5px] font-mono text-slate-400 uppercase tracking-wider">Mega Jackpot Profit</span>
                <span class="text-[8.5px] sm:text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <i data-lucide="shield-check" class="w-3 h-3 text-emerald-400"></i> Official Winner Verified
                </span>
              </div>
            </div>

            <div class="text-right">
              <span id="splash-winner-prize" class="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 text-base sm:text-lg font-mono tracking-tight drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                ৳1,250,000
              </span>
            </div>
          </div>
        </div>

        <!-- HOLOGRAPHIC LOTTERY TICKET WITH NOTCHES & SCANNER -->
        <div id="splash-3d-card" class="interactive-tilt-card w-full h-auto min-h-[64px] sm:h-20 bg-gradient-to-br from-amber-500 via-pink-600 to-cyan-400 rounded-2xl p-[1px] shadow-[0_10px_30px_rgba(245,158,11,0.25)] transition-all duration-300 relative overflow-hidden shrink-0">
          <div class="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] z-20 animate-cyber-scan pointer-events-none"></div>
          
          <div class="w-full h-full bg-[#0a0c1a] rounded-[15px] p-2.5 sm:p-3 flex justify-between items-center relative overflow-hidden backdrop-blur-md">
            <!-- Ticket Left Notch Cutout -->
            <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#060814] border-r border-amber-500/40"></div>
            <!-- Ticket Right Notch Cutout -->
            <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#060814] border-l border-amber-500/40"></div>

            <div class="space-y-0.5 text-left z-10 pl-2">
              <span class="text-[8px] font-mono text-amber-400/80 block tracking-widest uppercase flex items-center gap-1">
                <i data-lucide="ticket" class="w-3 h-3 text-amber-400"></i> VIP LOTTERY PASS
              </span>
              <span class="text-[11px] sm:text-xs font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 tracking-wider">
                LUCKY-777-VOICE-VIP
              </span>
            </div>
            
            <div class="font-mono text-[8px] text-cyan-400 font-extrabold uppercase bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-lg tracking-wider animate-pulse z-10 flex items-center gap-1 mr-2">
              <i data-lucide="check-circle" class="w-3 h-3 text-cyan-300"></i> TICKET VERIFIED
            </div>
          </div>
        </div>

      </div>

      <!-- BOTTOM PROGRESS & AUTO-DISMISS CONTROLLER -->
      <div class="w-full max-w-[360px] sm:max-w-md space-y-2 relative pb-2 z-20 text-center">
        <!-- Progress Bar with Voice Club Sound Wave Styling -->
        <div class="h-[6px] w-full bg-slate-900/90 border border-slate-800 rounded-full overflow-hidden relative p-[0.5px]">
          <div id="splash-progress" class="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 rounded-full w-0 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(251,191,36,0.8)]"></div>
        </div>

        <div class="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span id="splash-timer-text" class="flex items-center gap-1.5 text-amber-300 font-bold">
            <i data-lucide="clock" class="w-4 h-4 text-amber-400 animate-spin"></i> Auto-closing in 2s
          </span>
          <span id="splash-percent" class="font-bold text-cyan-400">0%</span>
        </div>

        <!-- Prominent Enter App Action Button -->
        <button id="splash-enter-btn" type="button" class="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.5)] transition cursor-pointer active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2 mt-1 z-30">
          <i data-lucide="mic-2" class="w-4 h-4"></i>
          <span>ENTER LOTTERY APP NOW</span>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
        <p class="text-[9px] font-mono text-slate-500 pt-0.5">Tap anywhere on screen to enter immediately</p>
      </div>
    </div>
`;
