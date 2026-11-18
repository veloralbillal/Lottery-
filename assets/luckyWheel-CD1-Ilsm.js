var c=Object.defineProperty;var p=(o,e,t)=>e in o?c(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var i=(o,e,t)=>p(o,typeof e!="symbol"?e+"":e,t);import"./index-CptQLR6N.js";import{L as r}from"./luckyWheel-C2Wp9q9M.js";class b{constructor(){i(this,"db",{});i(this,"currentUser",null);this.loadState(),this.initSyncChannel()}initSyncChannel(){if(typeof BroadcastChannel<"u")try{const e=new BroadcastChannel("lw_realtime_db_sync");e.onmessage=t=>{t.data&&t.data.type==="database_updated"&&(this.loadState(),this.render())}}catch{}window.addEventListener("storage",e=>{(e.key==="lw_lottery_db_v3"||e.key==="lw_user_session")&&(this.loadState(),this.render())})}loadState(){try{const e=localStorage.getItem("lottery_winner_db")||localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.settings||(this.db.settings={}),this.db.transactions||(this.db.transactions=[]),this.db.spinHistory||(this.db.spinHistory=[]),this.db.deviceCheckins||(this.db.deviceCheckins=[]),this.db.deviceSpins||(this.db.deviceSpins=[]);try{const e=localStorage.getItem("lw_user_session");e&&(this.currentUser=JSON.parse(e))}catch{}}saveDB(){try{if(this.currentUser&&(localStorage.setItem("lw_user_session",JSON.stringify(this.currentUser)),this.db.users)){const t=this.db.users.find(a=>a.id===this.currentUser.id);t&&(t.balance=this.currentUser.balance,t.checkinStreak=this.currentUser.checkinStreak,t.lastCheckinDate=this.currentUser.lastCheckinDate,t.lastDailyTaskDate=this.currentUser.lastDailyTaskDate,t.spinTokens=this.currentUser.spinTokens,t.lastSpinTime=this.currentUser.lastSpinTime)}const e=JSON.stringify(this.db);if(localStorage.setItem("lottery_winner_db",e),localStorage.setItem("lw_lottery_db_v3",e),localStorage.setItem("lottery_winner_db_backup",e),typeof BroadcastChannel<"u")try{new BroadcastChannel("lw_realtime_db_sync").postMessage({type:"database_updated",timestamp:Date.now()})}catch{}}catch{}}showToast(e,t="info"){const a=document.getElementById("lw-toast-box");a&&a.remove();const s=document.createElement("div");s.id="lw-toast-box";const n={success:"border-emerald-500/50 bg-emerald-950/90 text-emerald-200 shadow-emerald-900/30",error:"border-rose-500/50 bg-rose-950/90 text-rose-200 shadow-rose-900/30",info:"border-cyan-500/50 bg-slate-900/95 text-cyan-200 shadow-cyan-900/30"};s.className=`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce ${n[t]||n.info}`,s.innerHTML=`<span>${e}</span>`,document.body.appendChild(s),setTimeout(()=>{s.style.opacity="0",setTimeout(()=>s.remove(),400)},2800)}showCongratsSplash(e,t,a){const s=document.getElementById("congrats-splash-modal");s&&s.remove();const n=document.createElement("div");n.id="congrats-splash-modal",n.className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",n.innerHTML=`
      <div class="bg-gradient-to-br from-slate-900 via-[#10152b] to-slate-950 border border-amber-500/50 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/40">
          <i class="fa-solid fa-crown"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-black text-amber-300 uppercase tracking-widest font-mono">${e}</h3>
          <p class="text-xs text-white font-black text-2xl font-mono py-1">${a}</p>
          <p class="text-[11px] text-slate-300 leading-normal">${t}</p>
        </div>
        <button id="close-congrats-modal-btn" class="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-lg shadow-amber-500/20">
          Awesome, Claimed! 🎉
        </button>
      </div>
    `,document.body.appendChild(n);const l=document.getElementById("close-congrats-modal-btn");l&&(l.onclick=()=>n.remove())}getVIPMultiplier(e){if(!e)return 1;const t=e.vipLevel||e.vipRank||"Bronze";return t==="Diamond"||t==="Platinum"?2:t==="Gold"?1.5:t==="Silver"?1.25:1}showTransitionLoader(e){window.location.href=e}render(){const e=document.getElementById("lucky-wheel-app-root");if(!e)return;const t=this.currentUser?(this.currentUser.balance||0).toFixed(2):"0.00",a=this.currentUser?this.currentUser.username:"Guest",s=this.currentUser?this.currentUser.vipLevel||this.currentUser.vipRank||"Bronze VIP":"Guest VIP";e.innerHTML=`
      <!-- Top Navigation Header -->
      <header class="bg-slate-900/85 border-b border-cyan-500/20 sticky top-0 z-40 backdrop-blur-2xl px-3 sm:px-6 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html" class="nav-back-link w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/20 flex items-center justify-center transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95" title="Back to Home Dashboard">
              <i class="fa-solid fa-arrow-left text-xs sm:text-sm"></i>
            </a>
            <div class="leading-tight">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
                <span class="text-[8.5px] uppercase font-mono font-black text-cyan-400 tracking-widest">VIP FORTUNE ARENA</span>
              </div>
              <h1 class="text-xs sm:text-base font-black text-white font-heading tracking-wide flex items-center gap-2">
                <span>Lucky Wheel & Check-In</span>
                <i class="fa-solid fa-crown text-amber-400 text-xs animate-bounce"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <div class="bg-slate-950/90 border border-cyan-500/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 font-mono text-xs shadow-inner">
              <span class="text-[9px] text-slate-400 hidden xs:inline font-bold">@${a}</span>
              <span class="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">${s}</span>
              <span class="font-black text-emerald-400 text-sm">৳${t}</span>
            </div>
            <a href="index.html" class="nav-back-link hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-300 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl transition shadow-md">
              <i class="fa-solid fa-house text-cyan-400"></i>
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-4xl mx-auto p-3 sm:p-6 w-full space-y-5 sm:space-y-8 pb-28 flex-1">
        
        <!-- Daily Check-In Section -->
        <div class="bg-gradient-to-br from-[#0f172a] via-[#0b0f19] to-[#141226] border border-emerald-500/40 p-4 sm:p-7 rounded-[2rem] shadow-[0_0_40px_rgba(16,185,129,0.12)] space-y-4 sm:space-y-5 relative overflow-hidden backdrop-blur-xl">
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div class="space-y-1">
              <span class="bg-emerald-500/15 text-emerald-300 text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 inline-block font-mono shadow-sm">
                📅 Daily Check-In Rewards (VIP Boosted)
              </span>
              <h2 class="text-sm sm:text-base font-black text-white font-heading">ধারাবাহিক লগইন ও ক্যাশ বোনাস (7-Day Streak)</h2>
              <p id="checkin-current-streak-val" class="text-[10px] text-cyan-400 font-mono font-bold">0 of 7 Consecutive Days Completed</p>
            </div>
            <span id="checkin-today-status-badge" class="text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-mono shadow-md">
              READY TO CLAIM
            </span>
          </div>

          <!-- 7-Day Grid Container -->
          <div id="checkin-grid-days-container" class="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3 text-center font-mono relative z-10">
            <!-- Dynamically populated -->
          </div>

          <!-- Sponsor Task Locker Panel -->
          <div id="checkin-task-locker-panel" class="hidden bg-slate-950/95 border border-amber-500/50 p-4 rounded-2xl space-y-2.5 text-center shadow-2xl relative z-10">
            <span class="text-[10px] font-mono text-amber-400 font-black block uppercase tracking-wider">🔒 Unlock Today's VIP Check-In Reward</span>
            <p id="checkin-sponsor-instruction-text" class="text-[11px] text-slate-300 font-sans">আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করুন।</p>
            <div class="flex items-center justify-center gap-2.5 pt-1">
              <a id="checkin-sponsor-task-btn" href="https://google.com" target="_blank" class="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-mono font-black text-[11px] py-3 px-4 rounded-xl text-center cursor-pointer transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> স্পন্সর লিংক ভিজিট করুন (5s)
              </a>
              <button id="checkin-verify-task-btn" class="bg-slate-900 border border-emerald-500/40 hover:bg-slate-850 text-emerald-400 font-mono font-black text-[11px] py-3 px-4 rounded-xl transition cursor-pointer shadow-md">
                Verify & Unlock ✓
              </button>
            </div>
          </div>

          <!-- Claim Action Button -->
          <button id="checkin-claim-action-btn" class="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm py-3.5 rounded-2xl transition cursor-pointer active:scale-[0.99] shadow-[0_0_25px_rgba(16,185,129,0.35)] border border-emerald-300/50 font-mono uppercase tracking-widest relative z-10">
            🎁 Claim Today's Check-In Bonus Now
          </button>
        </div>

        <!-- Wheel of Fortune Section -->
        <div class="bg-gradient-to-br from-[#10152b] via-[#0b0f1d] to-[#1e1333] border border-cyan-500/40 p-5 sm:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-6 relative overflow-hidden text-center backdrop-blur-xl">
          <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-2 max-w-lg mx-auto relative z-10">
            <span class="bg-cyan-500/15 text-cyan-300 text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 inline-block font-mono shadow-sm">
              🎡 VIP Lucky Wheel of Fortune
            </span>
            <h2 class="text-lg sm:text-2xl font-black text-white font-heading tracking-wide">ভাগ্য চাকা (Lucky Spin Studio)</h2>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">প্রতি ২৪ ঘন্টায় ১টি ফ্রি স্পিন অথবা রেফারেল টোকেন ব্যবহার করে জিতে নিন সর্বোচ্চ ৳৫০০ পর্যন্ত ক্যাশ প্রাইজ!</p>
          </div>

          <!-- Spinner Canvas Arena -->
          <div class="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center z-10">
            <!-- Neon LED Ambient Glow Ring -->
            <div class="absolute -inset-3 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 opacity-30 blur-xl animate-pulse"></div>

            <!-- Pointer Arrow on Top -->
            <div class="absolute -top-4 z-30 w-7 h-9 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 clip-polygon shadow-[0_0_15px_rgba(251,191,36,0.8)] border border-white/80 flex items-center justify-center">
              <i class="fa-solid fa-caret-down text-slate-950 text-sm"></i>
            </div>

            <!-- Rotating Disk Element -->
            <div id="lucky-spin-wheel-disk" class="w-full h-full rounded-full relative transition-transform duration-[4000ms] cubic-bezier(0.15, 0.85, 0.15, 1) shadow-[0_0_45px_rgba(6,182,212,0.4)] border-4 border-slate-900 overflow-hidden bg-slate-950">
              <canvas id="lucky-spin-canvas" width="320" height="320" class="w-full h-full"></canvas>
            </div>

            <!-- Central Trigger Button -->
            <button id="lucky-spin-trigger-btn" class="absolute z-20 w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 hover:from-amber-200 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm font-heading rounded-full flex flex-col items-center justify-center border-4 border-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.5)] cursor-pointer uppercase tracking-wider transition">
              <span>SPIN</span>
              <i class="fa-solid fa-play text-[9px] mt-0.5"></i>
            </button>
          </div>

          <!-- Timers & Tokens Status Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto font-mono text-xs relative z-10">
            <div class="bg-slate-950/90 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
              <span class="text-slate-400 text-[10px]">Free Spin Timer</span>
              <strong id="lucky-spin-timer-label" class="text-emerald-400 font-bold">READY NOW</strong>
            </div>
            <div class="bg-slate-950/90 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
              <span class="text-slate-400 text-[10px]">Referral Tokens</span>
              <strong id="lucky-spin-tokens-val" class="text-amber-400 font-extrabold">0 Available</strong>
            </div>
          </div>

          <!-- Spin History List -->
          <div class="space-y-3 max-w-md mx-auto text-left font-mono pt-2 relative z-10">
            <div class="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
              <span><i class="fa-solid fa-clock-rotate-left text-cyan-400"></i> Recent Spin Results</span>
              <span id="lucky-spin-history-count" class="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">0 plays</span>
            </div>
            <div id="lucky-spin-history-list" class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-800/80 bg-[#0b0f19] py-6 px-4 text-center space-y-2">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-400">LuckyBox VIP Portal</span>
            <span>•</span>
            <span>Secure Fortune & Reward Engine</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="index.html" class="nav-back-link text-cyan-400 hover:underline font-bold">← Back to Dashboard</a>
          </div>
        </div>
      </footer>
    `,this.bindEvents(),this.renderLuckyModules()}renderLuckyModules(){r.currentUser=this.currentUser,r.db=this.db,r.showToast=(e,t)=>this.showToast(e,t),r.showCongratsSplash=(e,t,a)=>this.showCongratsSplash(e,t,a),r.saveDB=()=>this.saveDB(),r.render=()=>this.render(),r.getVIPMultiplier=e=>this.getVIPMultiplier(e),r.renderDailyCheckinGrid(),r.renderLuckyWheel()}bindEvents(){document.querySelectorAll("a[href='index.html'], a[href*='index.html']").forEach(s=>{s.onclick=n=>{n.preventDefault(),n.stopPropagation(),this.showTransitionLoader("index.html")}});const e=document.getElementById("checkin-claim-action-btn");e&&(e.onclick=()=>{this.renderLuckyModules(),r.claimDailyCheckinReward()});const t=document.getElementById("checkin-verify-task-btn");t&&(t.onclick=()=>{if(!this.currentUser){this.showToast("Please login first!","error");return}const s=new Date().toISOString().split("T")[0];this.currentUser.lastDailyTaskDate=s,this.saveDB(),this.showToast("✅ Sponsor task verified! You can now claim your check-in reward!","success"),this.renderLuckyModules()});const a=document.getElementById("lucky-spin-trigger-btn");a&&(a.onclick=()=>{this.renderLuckyModules(),r.spinLuckyWheel()})}init(){this.render(),window.location.hash==="#checkin"&&setTimeout(()=>{const e=document.getElementById("checkin-grid-days-container");e&&e.scrollIntoView({behavior:"smooth",block:"center"})},300)}}const d=new b;document.readyState==="loading"?window.addEventListener("DOMContentLoaded",()=>d.init()):d.init();
