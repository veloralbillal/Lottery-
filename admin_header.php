<?php
/**
 * Lottery Winner - Dedicated Admin Session Guard & Header (admin_header.php)
 * 
 * Guarantees that only authorized admin profiles can execute
 * administrative control commands. Standard users or guests are kicked back instantly.
 */
require_once __DIR__ . '/config.php';

// Assert Admin role authentication
if (!is_admin_logged_in()) {
    header("Location: login_page.php?error=unauthorized");
    exit;
}

// Fetch general system statistics to display in the header status strip
try {
    $total_users_stmt = $conn->query("SELECT COUNT(*) FROM users");
    $total_users = (int)$total_users_stmt->fetchColumn();

    $pending_deposits_stmt = $conn->query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'");
    $pending_deposits = (int)$pending_deposits_stmt->fetchColumn();

    $pending_withdrawals_stmt = $conn->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'");
    $pending_withdrawals = (int)$pending_withdrawals_stmt->fetchColumn();
} catch (PDOException $e) {
    $total_users = 0;
    $pending_deposits = 0;
    $pending_withdrawals = 0;
}
?>
<!-- Admin Control Area Header Strip -->
<div class="w-full bg-slate-950 border-b-2 border-red-950 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between py-3 gap-2">
            
            <!-- Left Brand Identity -->
            <div class="flex items-center gap-3">
                <a href="admin.php" class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-tr from-red-600 to-rose-700 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-red-500/20">
                        <i class="fa-solid fa-screwdriver-wrench text-white text-xs"></i>
                    </div>
                    <div>
                        <span class="text-xs font-black font-display text-rose-500 uppercase tracking-widest block">ADMIN CONTROL ROOM</span>
                        <span class="text-[9px] text-slate-500 font-mono tracking-wider block -mt-1">SECURE PORTAL SYSTEM</span>
                    </div>
                </a>
            </div>

            <!-- Middle Live Analytics Badges & Nav Menu -->
            <div class="flex flex-wrap items-center gap-3 font-mono text-[9px] font-bold text-slate-400">
                <a href="admin.php" class="hover:text-red-400 transition bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                    <i class="fa-solid fa-gauge text-slate-500"></i> Dashboard
                </a>
                <a href="payment.php" class="hover:text-cyan-400 transition bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                    <i class="fa-solid fa-file-invoice-dollar text-slate-500"></i> Payment Gateways
                </a>
                <div class="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/60 rounded-lg px-2.5 py-1">
                    <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                    <span>Members: <?php echo $total_users; ?></span>
                </div>
                
                <?php if ($pending_deposits > 0): ?>
                    <div class="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/30 rounded-lg px-2.5 py-1 text-emerald-400">
                        <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                        <span>Deposits: <?php echo $pending_deposits; ?></span>
                    </div>
                <?php endif; ?>

                <?php if ($pending_withdrawals > 0): ?>
                    <div class="flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/30 rounded-lg px-2.5 py-1 text-rose-400">
                        <span class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping"></span>
                        <span>Withdrawals: <?php echo $pending_withdrawals; ?></span>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Right Profile Link strip -->
            <div class="flex items-center gap-3">
                <span class="text-[10px] font-mono text-slate-400 font-bold bg-rose-950/20 border border-rose-900/10 rounded-md px-2 py-0.5">ROLE: ADMINISTRATOR</span>
                <a href="index.html" class="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                    <i class="fa-solid fa-house text-[9px]"></i> View Public site
                </a>
                <a href="logout.php" class="text-[10px] bg-red-950 hover:bg-red-900 border border-red-900 text-red-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                    <i class="fa-solid fa-right-from-bracket text-[9px]"></i> Exit Control Room
                </a>
            </div>

        </div>
    </div>
</div>
