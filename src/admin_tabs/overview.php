<?php
/**
 * Admin Panel - Overview & Welcome Banner
 */
?>
<!-- Welcome Alert banner info -->
<div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 pointer-events-none"></div>
    <div class="relative z-10 space-y-1">
        <span class="text-[9px] font-black tracking-widest text-rose-500 font-mono bg-rose-950/40 border border-rose-900/30 px-3 py-1 rounded-full uppercase">OPERATION ROOM</span>
        <h2 class="text-xl font-black font-display text-white uppercase tracking-wide">Central Command Dashboard</h2>
        <p class="text-xs text-slate-400">Review real-time dynamic charts, dispatch withdrawals, launch digital lotteries, and edit system modules.</p>
    </div>
    <!-- Dynamic quick nav link triggers -->
    <div class="flex flex-wrap items-center gap-2.5 relative z-10 font-sans">
        <a href="payment.php" class="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 border border-cyan-500/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-teal-500/10">
            <i class="fa-solid fa-file-invoice-dollar"></i> Gateways (Bkash, Bank, Crypto)
        </a>
        <a href="#admin-pools-section" class="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 font-mono">
            Lotteries (<?php echo $active_lots; ?>)
        </a>
        <a href="#admin-deposits-section" class="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 font-mono">
            Deposits (<?php echo $pending_deps; ?>)
        </a>
    </div>
</div>

<!-- GRID METRIC COUNTERS STRIPS -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    
    <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-1">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Lottery Pools</span>
        <span class="text-xl font-black text-rose-500 font-mono block"><?php echo $active_lots; ?> Active</span>
        <span class="text-[9px] text-slate-600 font-mono block">Drawn counters: <?php echo $completed_lots; ?> total</span>
    </div>

    <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-1">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">User Base</span>
        <span class="text-xl font-black text-cyan-400 font-mono block"><?php echo $members_cnt; ?> Players</span>
        <span class="text-[9px] text-slate-600 font-mono block">Registered members DB</span>
    </div>

    <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-1">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Action Deposits</span>
        <span class="text-xl font-black text-emerald-400 font-mono block"><?php echo $pending_deps; ?> Pending</span>
        <span class="text-[9px] text-slate-600 font-mono block">Waiting for approval verification</span>
    </div>

    <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-1">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Action Withdrawals</span>
        <span class="text-xl font-black text-amber-500 font-mono block"><?php echo $pending_wds; ?> Outbox</span>
        <span class="text-[9px] text-slate-600 font-mono block">Waiting for release clearance</span>
    </div>

</div>
