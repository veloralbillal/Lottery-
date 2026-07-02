<!-- ================= STUNNING 3D SPLASH SCREEN ================= -->
<div id="splash-screen" class="fixed inset-0 bg-slate-950 z-[2000] flex flex-col items-center justify-center p-6 select-none overflow-hidden transition-all duration-750 ease-out">
  <!-- Glow Background Elements -->
  <div class="absolute w-[500px] h-[500px] bg-red-650/15 rounded-full blur-[120px] -top-40 -left-40 animate-pulse"></div>
  <div class="absolute w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -bottom-40 -right-40 animate-pulse delay-700"></div>
  
  <!-- Center 3D Space Wrapper -->
  <div class="relative flex flex-col items-center max-w-md w-full text-center space-y-8" style="perspective: 1200px;">
    
    <!-- Interactive & Auto-Rotating 3D Ticket Asset / Holographic Card -->
    <div id="splash-3d-card" class="interactive-tilt-card w-64 h-40 bg-gradient-to-br from-rose-600 via-red-500 to-amber-500 rounded-3xl p-0.5 shadow-[0_20px_50px_rgba(239,68,68,0.25)] transition-all duration-300 relative overflow-hidden" style="transform-style: preserve-3d; transform: rotateY(15deg) rotateX(15deg);">
      <!-- Metallic Reflection Sheen Layer -->
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
      
      <!-- Realistic Inner Border & Design -->
      <div class="w-full h-full bg-slate-950 rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden">
        <!-- Grid lines overlay -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
        
        <!-- Golden chip inside -->
        <div class="flex justify-between items-start relative z-10">
          <div class="w-9 h-7 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-lg flex flex-col justify-between p-1.5 border border-amber-300/30 shadow-inner">
            <div class="h-px bg-slate-950/40 w-full"></div>
            <div class="h-px bg-slate-950/40 w-full"></div>
            <div class="h-px bg-slate-950/40 w-full"></div>
          </div>
          <div class="font-mono text-[8.5px] text-rose-500 font-extrabold uppercase bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-full tracking-wider">
            VIP GATEWAY
          </div>
        </div>

        <!-- Card Number and Details -->
        <div class="space-y-1 text-left relative z-10" style="transform: translateZ(30px);">
          <span class="text-[9px] font-mono text-slate-500 block tracking-widest">TICKET REF ID</span>
          <span class="text-sm font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-150 to-slate-300 tracking-wider">LW-777-999-3D</span>
        </div>

        <!-- Header and Bottom Bar -->
        <div class="flex justify-between items-center relative z-10">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 animate-pulse"></span>
            <span class="font-display font-black text-[10px] text-white tracking-tight uppercase">LOTTERY WINNER</span>
          </div>
          <span class="text-amber-500 text-xs font-black"><i class="fa-solid fa-crown animate-bounce"></i></span>
        </div>
        
        <!-- Holographic radial gradient glow -->
        <div class="absolute -right-12 -bottom-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>

    <!-- Sleek Rings Rotating behind the 3D element -->
    <div class="absolute -z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-80 h-80 border-4 border-dashed border-red-500/10 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none" style="transform: rotateX(75deg);"></div>
    <div class="absolute -z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-72 h-72 border border-rose-500/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" style="transform: rotateX(75deg);"></div>

    <!-- Name & Details of App -->
    <div class="space-y-3 pt-6 relative" style="transform: translateZ(20px);">
      <div class="inline-flex items-center gap-2 bg-gradient-to-r from-red-955/40 via-slate-900/60 to-slate-900 border border-red-900/30 px-3.5 py-1.5 rounded-full text-white tracking-widest uppercase font-mono text-[8.5px] shadow-lg">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> 
        <span>Secure Cloud Connection</span>
      </div>
      
      <h1 class="text-2xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 uppercase">
        LOTTERY WINNER
      </h1>
      <p class="text-[11px] text-slate-400 font-sans tracking-wide max-w-xs mx-auto">
        Establishing secure connection and sync status of bKash, Nagad, and Rocket wallet accounts...
      </p>
    </div>

    <!-- Futuristic HUD loading indicators -->
    <div class="w-full max-w-xs space-y-3 relative pt-4">
      <!-- Loading Progress bar -->
      <div class="h-1.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
        <div id="splash-progress" class="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full w-0 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(239,68,68,0.4)]"></div>
      </div>

      <div class="flex justify-between items-center text-[9.5px] font-mono text-slate-500">
        <span class="flex items-center gap-1.5">
          <i class="fa-solid fa-server animate-pulse text-red-500"></i> Local Engine v6.50
        </span>
        <span id="splash-percent">0%</span>
      </div>
    </div>
  </div>
</div>
