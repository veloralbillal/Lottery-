<?php
/**
 * Lottery Winner - Interactive Web Navigation Header (header.php)
 * 
 * Verifies user or administrator login sessions and displays a premium navigation bar.
 */
require_once __DIR__ . '/config.php';

// Fetch current user details from database if sessions match
$nav_user_balance = 0.00;
$nav_username = '';
$is_logged_in = is_user_logged_in();
$is_admin = is_admin_logged_in();

if ($is_logged_in) {
    try {
        $stmt = $conn->prepare("SELECT username, balance, status FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user_row = $stmt->fetch();
        if ($user_row) {
            if ($user_row['status'] === 'blocked') {
                // If blocked, instantly destroy session
                session_unset();
                session_destroy();
                header("Location: login.php?error=blocked");
                exit;
            }
            $nav_username = htmlspecialchars($user_row['username']);
            $nav_user_balance = (float)$user_row['balance'];
        } else {
            $is_logged_in = false;
        }
    } catch (PDOException $e) {
        // Safe failback
        $nav_username = htmlspecialchars($_SESSION['username']);
    }
}
?>
<!-- Navigation Header Component -->
<header id="app-header" class="w-full bg-slate-950 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            
            <!-- Logo Brand -->
            <div class="flex items-center gap-3">
                <a href="index.html" class="flex items-center gap-2 transition hover:opacity-90">
                    <div class="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
                        <i class="fa-solid fa-crown text-white text-sm"></i>
                    </div>
                    <div>
                        <span class="text-sm font-black font-display text-white uppercase tracking-wider block">Lottery Winner</span>
                        <span class="text-[9px] text-slate-500 font-mono tracking-tight block -mt-1 uppercase">Live Mobile Portal</span>
                    </div>
                </a>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
                <a href="index.html" class="hover:text-white transition">Home</a>
                <a href="index.html#pools" class="hover:text-white transition">Lottery Pools</a>
                <a href="install.php" class="hover:text-white text-cyan-400 transition" target="_blank"><i class="fa-solid fa-server mr-1"></i>DB Installer</a>
            </nav>

            <!-- Authenticated Actions / Guest controls -->
            <div class="flex items-center gap-4">
                <?php if ($is_logged_in): ?>
                    <!-- WALLET PILL -->
                    <div class="flex items-center bg-slate-900 border border-slate-800/80 rounded-full py-1.5 pl-3 pr-4 shadow-inner">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-wallet text-emerald-400 text-xs"></i>
                            <span class="text-[10px] text-slate-400 font-mono font-medium">Balance</span>
                        </div>
                        <span class="text-xs font-bold font-mono text-emerald-400 ml-2">৳<?php echo number_format($nav_user_balance, 2); ?></span>
                    </div>

                    <!-- USER DROPDOWN / LOGGED IN -->
                    <div class="relative group">
                        <button class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl px-3 py-1.5 transition text-xs font-semibold text-slate-200">
                            <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span>Hi, <?php echo $nav_username; ?></span>
                            <i class="fa-solid fa-chevron-down text-[10px] text-slate-500"></i>
                        </button>
                        
                        <!-- Dropdown panel -->
                        <div class="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1.5 z-50">
                            <?php if ($is_admin): ?>
                                <a href="admin.php" class="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 transition font-bold">
                                    <i class="fa-solid fa-gauge-high text-[11px]"></i>
                                    Admin Control Panel
                                </a>
                                <div class="h-px bg-slate-800/60 my-1"></div>
                            <?php endif; ?>
                            <a href="index.html#deposits" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition">
                                <i class="fa-solid fa-circle-down text-slate-400"></i>
                                Deposit Funds
                            </a>
                            <a href="index.html#withdraws" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition">
                                <i class="fa-solid fa-circle-up text-slate-400"></i>
                                Withdraw Fast
                            </a>
                            <div class="h-px bg-slate-800/60 my-1"></div>
                            <a href="logout.php" id="logout-btn-header" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400 transition font-medium">
                                <i class="fa-solid fa-right-from-bracket text-[11px]"></i>
                                Sign Out
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <!-- GUEST CONTROLS -->
                    <div class="flex items-center gap-2.5">
                        <a href="login_page.php" class="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-2">
                            Sign In
                        </a>
                        <a href="register_page.php" class="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg hover:scale-[1.01] active:opacity-90 transition">
                            Register Free
                        </a>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</header>
