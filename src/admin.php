<?php
/**
 * Lottery Winner - Interactive Administration Control Room (admin.php)
 * 
 * Provides dynamic systems configuration, dynamic lottery creation/deletion,
 * player details tweaking, deposit verification ledger, and withdrawal release.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/admin_header.php';

$success_msg = "";
$error_msg = "";

// ----------------------------------------
// PROCESS ADMIN POST ACTIONS (FORM SUBMISSIONS)
// ----------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    // 1. CREATE LOTTERY POOL
    if ($action === 'create_lottery') {
        $name = trim($_POST['name'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $fee = (float)($_POST['entryFee'] ?? 10);
        $prize = (float)($_POST['prizeAmount'] ?? 200);
        $tickets = (int)($_POST['totalTickets'] ?? 100);
        $details = trim($_POST['details'] ?? '');
        $drawMode = trim($_POST['drawMode'] ?? 'manual');
        $drawDuration = (int)($_POST['drawDuration'] ?? 10);
        $exactDrawTime = trim($_POST['exactDrawTime'] ?? '');

        if (!empty($name) && !empty($category) && $fee > 0 && $prize > 0 && $tickets > 0) {
            try {
                $id = 'l_' . bin2hex(random_bytes(5));
                $dbDrawMode = ($drawMode === 'manual') ? 'manual' : 'auto';
                if ($drawMode === 'auto') {
                    $drawTime = date('Y-m-d H:i:s', strtotime("+$drawDuration minutes"));
                } elseif ($drawMode === 'auto_datetime' && !empty($exactDrawTime)) {
                    $drawTime = date('Y-m-d H:i:s', strtotime($exactDrawTime));
                } else {
                    $drawTime = date('Y-m-d H:i:s', strtotime('+1 day'));
                }
                
                $stmt = $conn->prepare("
                    INSERT INTO lotteries (id, name, details, entryFee, totalTickets, soldTickets, category, drawTime, status, prizeAmount, drawMode, drawDuration) 
                    VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'active', ?, ?, ?)
                ");
                $stmt->execute([$id, $name, $details ? $details : "Exclusive $fee Taka draw event.", $fee, $tickets, $category, $drawTime, $prize, $dbDrawMode, $drawDuration]);
                $success_msg = "Successfully activated new \"$name\" lottery pool!";
            } catch (PDOException $e) {
                $error_msg = "Failed to launch lottery: " . $e->getMessage();
            }
        } else {
            $error_msg = "Please verify all lottery input configuration constraints.";
        }
    }

    // 2. DELETE LOTTERY POOL (THE USER'S MAIN REQUISITE FIX FOR THE BACKEND)
    else if ($action === 'delete_lottery') {
        $id = trim($_POST['id'] ?? '');
        if (!empty($id)) {
            try {
                $conn->exec("SET FOREIGN_KEY_CHECKS=0");
                
                // First delete all linked tickets
                $stmt_tickets = $conn->prepare("DELETE FROM tickets WHERE lotteryId = ?");
                $stmt_tickets->execute([$id]);

                // Delete the lottery
                $stmt_lot = $conn->prepare("DELETE FROM lotteries WHERE id = ?");
                $stmt_lot->execute([$id]);

                $conn->exec("SET FOREIGN_KEY_CHECKS=1");
                $success_msg = "Successfully deleted lottery pool \"$id\" and associated ticket entries.";
            } catch (PDOException $e) {
                try { $conn->exec("SET FOREIGN_KEY_CHECKS=1"); } catch(Exception $ex) {}
                $error_msg = "Failed to delete lottery pool: " . $e->getMessage();
            }
        }
    }

    // 3. FORCE MANUAL DRAW WINNER
    else if ($action === 'force_draw') {
        $lottery_id = trim($_POST['lottery_id'] ?? '');
        try {
            // Find lottery
            $stmt_l = $conn->prepare("SELECT * FROM lotteries WHERE id = ? AND status = 'active'");
            $stmt_l->execute([$lottery_id]);
            $lot = $stmt_l->fetch();

            if ($lot) {
                // Find all active tickets bought in this lottery
                $stmt_t = $conn->prepare("SELECT * FROM tickets WHERE lotteryId = ? AND status = 'pending'");
                $stmt_t->execute([$lottery_id]);
                $tickets = $stmt_t->fetchAll();

                if (count($tickets) > 0) {
                    $conn->beginTransaction();

                    // Choose random winning ticket index
                    $winning_ticket = $tickets[array_rand($tickets)];
                    
                    // Mark winner ticket
                    $up_win = $conn->prepare("UPDATE tickets SET status = 'won', prizeAmount = ? WHERE id = ?");
                    $up_win->execute([$lot['prizeAmount'], $winning_ticket['id']]);

                    // Mark other tickets as lost for this lottery
                    $up_lost = $conn->prepare("UPDATE tickets SET status = 'lost', prizeAmount = 0.00 WHERE lotteryId = ? AND id != ?");
                    $up_lost->execute([$lottery_id, $winning_ticket['id']]);

                    // Add prize amount to winner user balance
                    $up_user = $conn->prepare("UPDATE users SET balance = balance + ?, wins = wins + 1, profit = profit + ? WHERE id = ?");
                    $up_user->execute([$lot['prizeAmount'], $lot['prizeAmount'], $winning_ticket['userId']]);

                    // Update lottery status
                    $up_lot = $conn->prepare("UPDATE lotteries SET status = 'drawn' WHERE id = ?");
                    $up_lot->execute([$lottery_id]);

                    $conn->commit();
                    $success_msg = "Draw Complete! Winning ticket code is \"" . $winning_ticket['code'] . "\"! User reward dispatched.";
                } else {
                    $error_msg = "Draw failed. No players bought tickets inside this pool yet!";
                }
            } else {
                $error_msg = "Lottery pool is either expired, drawn already, or does not exist.";
            }
        } catch (PDOException $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            $error_msg = "Winner selection sequence crash: " . $e->getMessage();
        }
    }

    // 4. VERIFY DEPOSIT REQUEST
    else if ($action === 'verify_deposit') {
        $dep_id = trim($_POST['id'] ?? '');
        $status_decision = trim($_POST['status'] ?? ''); // 'approved' or 'declined'

        if (!empty($dep_id) && in_array($status_decision, ['approved', 'declined'])) {
            try {
                // Fetch deposit content
                $stmt_d = $conn->prepare("SELECT * FROM deposits WHERE id = ? AND status = 'pending'");
                $stmt_d->execute([$dep_id]);
                $dep = $stmt_d->fetch();

                if ($dep) {
                    $conn->beginTransaction();

                    // Update deposit status
                    $stmt_up = $conn->prepare("UPDATE deposits SET status = ? WHERE id = ?");
                    $stmt_up->execute([$status_decision, $dep_id]);

                    if ($status_decision === 'approved') {
                        // Increase user's balance and totDeposit
                        $stmt_usr = $conn->prepare("UPDATE users SET balance = balance + ?, totDeposit = totDeposit + ? WHERE username = ?");
                        $stmt_usr->execute([$dep['amount'], $dep['amount'], $dep['username']]);
                    }

                    $conn->commit();
                    $success_msg = "Deposit entry of ৳" . $dep['amount'] . " for @" . $dep['username'] . " was " . uppercase($status_decision) . ".";
                } else {
                    $error_msg = "Deposit record is already resolved or missing.";
                }
            } catch (PDOException $e) {
                $conn->rollBack();
                $error_msg = "Failed to update deposit ledger: " . $e->getMessage();
            }
        }
    }

    // 5. SECURE WITHDRAWAL DESPATCH RELEASE
    else if ($action === 'verify_withdrawal') {
        $wd_id = trim($_POST['id'] ?? '');
        $status_decision = trim($_POST['status'] ?? ''); // 'approved' or 'declined'

        if (!empty($wd_id) && in_array($status_decision, ['approved', 'declined'])) {
            try {
                // Fetch withdrawal details
                $stmt_w = $conn->prepare("SELECT * FROM withdrawals WHERE id = ? AND status = 'pending'");
                $stmt_w->execute([$wd_id]);
                $wd = $stmt_w->fetch();

                if ($wd) {
                    $conn->beginTransaction();

                    // Update withdrawal ledger entry status
                    $stmt_up = $conn->prepare("UPDATE withdrawals SET status = ? WHERE id = ?");
                    $stmt_up->execute([$status_decision, $wd_id]);

                    if ($status_decision === 'approved') {
                        // Increase user's cumulative withdrawals counter
                        $stmt_usr = $conn->prepare("UPDATE users SET totWithdraw = totWithdraw + ? WHERE username = ?");
                        $stmt_usr->execute([$wd['amount'], $wd['username']]);
                    } else if ($status_decision === 'declined') {
                        // Refund user's balance because payment was refused
                        $stmt_usr = $conn->prepare("UPDATE users SET balance = balance + ?, profit = profit + ? WHERE username = ?");
                        $stmt_usr->execute([$wd['amount'], $wd['amount'], $wd['username']]);
                    }

                    $conn->commit();
                    $success_msg = "Withdrawal request of ৳" . $wd['amount'] . " for @" . $wd['username'] . " was " . uppercase($status_decision) . ".";
                } else {
                    $error_msg = "Withdrawal record is already processed or missing.";
                }
            } catch (PDOException $e) {
                $conn->rollBack();
                $error_msg = "Technical issue finishing withdrawal: " . $e->getMessage();
            }
        }
    }

    // 6. EDIT USER METRICS / PRIVILEGES
    else if ($action === 'update_user') {
        $u_id = trim($_POST['id'] ?? '');
        $new_bal = (float)($_POST['balance'] ?? 0.00);
        $new_status = trim($_POST['status'] ?? 'active');

        if (!empty($u_id)) {
            try {
                $stmt = $conn->prepare("UPDATE users SET balance = ?, status = ? WHERE id = ?");
                $stmt->execute([$new_bal, $new_status, $u_id]);
                $success_msg = "Player profile \"$u_id\" metrics updated successfully!";
            } catch (PDOException $e) {
                $error_msg = "Failed to update user parameters: " . $e->getMessage();
            }
        }
    }
}

// ----------------------------------------
// DATASHEET FETCHING FOR DISPLAY SORTS
// ----------------------------------------
try {
    // A. FETCH STATS COUNTERS
    $members_cnt = (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $active_lots = (int)$conn->query("SELECT COUNT(*) FROM lotteries WHERE status = 'active'")->fetchColumn();
    $completed_lots = (int)$conn->query("SELECT COUNT(*) FROM lotteries WHERE status = 'drawn'")->fetchColumn();
    $pending_deps = (int)$conn->query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'")->fetchColumn();
    $pending_wds = (int)$conn->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'")->fetchColumn();

    // B. FETCH LIST COLLECTIONS
    $users_list = $conn->query("SELECT * FROM users ORDER BY joinDate DESC LIMIT 50")->fetchAll();
    $lotteries_list = $conn->query("SELECT * FROM lotteries ORDER BY CASE WHEN status = 'active' THEN 1 ELSE 2 END, drawTime ASC")->fetchAll();
    $deposits_ledger = $conn->query("SELECT * FROM deposits ORDER BY status DESC, date DESC LIMIT 40")->fetch();
    $deposits_list = is_array($deposits_ledger) ? [$deposits_ledger] : $conn->query("SELECT * FROM deposits ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, date DESC LIMIT 40")->fetchAll();
    $withdrawals_list = $conn->query("SELECT * FROM withdrawals ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, date DESC LIMIT 40")->fetchAll();
} catch (PDOException $e) {
    // Failback
    $users_list = $lotteries_list = $deposits_list = $withdrawals_list = [];
}

function uppercase($str) {
    return strtoupper($str);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration Control Room - Lottery Winner</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Buttons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <!-- Tailwind Play -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #020617;
        }
    </style>
</head>
<body class="text-slate-100 antialiased font-sans min-h-screen flex flex-col justify-between">

    <!-- Admin header strip -->
    <div class="w-full">
        <!-- Renders automatically from dependency admin_header.php -->
    </div>

    <!-- MAIN DASHBOARD COMPONENT PORTAL -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
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

        <!-- Feedback messaging -->
        <?php if (!empty($success_msg)): ?>
            <div class="bg-emerald-950/40 border border-emerald-990/40 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i class="fa-solid fa-circle-check text-emerald-500 text-base animate-pulse"></i>
                <div>
                    <strong>SUCCESS STATE:</strong> <?php echo htmlspecialchars($success_msg); ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="bg-rose-950/40 border border-rose-990/40 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i class="fa-solid fa-triangle-exclamation text-rose-500 text-base"></i>
                <div>
                    <strong>ADMIN ALERT:</strong> <?php echo htmlspecialchars($error_msg); ?>
                </div>
            </div>
        <?php endif; ?>

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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- LEFT COLUMN: LOTTERIES CRUD LIST & CREATOR -->
            <div class="lg:col-span-2 space-y-8">
                
                <!-- Dynamic Pools list panel -->
                <section id="admin-pools-section" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-ticket text-rose-500 text-sm"></i>
                            <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Dynamic Draw Pools</h3>
                        </div>
                        <span class="text-[10px] font-mono text-slate-500">Live MySQL Datastore</span>
                    </div>

                    <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
                        <?php if (count($lotteries_list) === 0): ?>
                            <div class="text-center py-8 text-xs text-slate-600 font-mono">0 ACTIVE DRAW POOLS DETECTED. CHOOSE CREATE OPTIONS BELOW.</div>
                        <?php else: ?>
                            <?php foreach ($lotteries_list as $lot): ?>
                                <div class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-700 transition">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <span class="text-[9px] bg-cyan-950 text-cyan-400 font-mono tracking-widest px-2 py-0.5 rounded-full border border-cyan-800/40 block">
                                                <?php echo htmlspecialchars($lot['category']); ?>
                                            </span>
                                            <?php if ($lot['status'] === 'drawn'): ?>
                                                <span class="text-[9px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded-full block border border-slate-800">🏆 DRAWN OVER</span>
                                            <?php else: ?>
                                                <span class="text-[9px] bg-red-950 text-rose-400 font-mono px-2 py-0.5 rounded-full block border border-rose-900/40 animate-pulse">⏳ ACTIVE</span>
                                            <?php endif; ?>
                                        </div>
                                        <h4 class="text-xs font-bold text-white"><?php echo htmlspecialchars($lot['name']); ?></h4>
                                        <p class="text-[10px] text-slate-500 font-mono">ID: <?php echo $lot['id']; ?> | Prize Amount: ৳<?php echo number_format($lot['prizeAmount'], 2); ?></p>
                                    </div>

                                    <div class="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                                        <div class="text-right flex flex-col justify-center gap-0.5 pr-2 border-r border-slate-800 uppercase text-[10px]">
                                            <span class="text-slate-400 font-bold">Fee: ৳<?php echo $lot['entryFee']; ?></span>
                                            <span class="text-slate-500"><?php echo $lot['soldTickets']; ?> / <?php echo $lot['totalTickets']; ?> Sold</span>
                                        </div>

                                        <div class="flex items-center gap-1.5">
                                            <!-- Force Draw Winner Action -->
                                            <?php if ($lot['status'] === 'active'): ?>
                                                <form action="admin.php" method="POST" onsubmit="return confirm('Initiate manual winner picker drawing for this pool?')">
                                                    <input type="hidden" name="action" value="force_draw">
                                                    <input type="hidden" name="lottery_id" value="<?php echo $lot['id']; ?>">
                                                    <button type="submit" class="bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-95 text-[10px] text-white font-bold py-1.5 px-3 rounded-lg transition shadow-md shrink-0">
                                                        Force Draw
                                                    </button>
                                                </form>
                                            <?php endif; ?>

                                            <!-- DELETE LOTTERY FORM (CRITICAL RESOLUTION POINT) -->
                                            <form action="admin.php" method="POST" onsubmit="return confirm('STRICT ALERTS: Are you completely sure you want to permanently delete this lottery draw pool? This deletes all purchased tickets!')">
                                                <input type="hidden" name="action" value="delete_lottery">
                                                <input type="hidden" name="id" value="<?php echo $lot['id']; ?>">
                                                <button type="submit" class="bg-rose-950/80 hover:bg-rose-900 border border-rose-900/30 text-rose-400 text-[10px] font-bold py-1.5 px-2.5 rounded-lg transition flex items-center justify-center">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </section>

                <!-- Launch Draw pool creator -->
                <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                        <i class="fa-solid fa-calendar-plus text-rose-500 text-sm"></i>
                        <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Launch New Lottery Draw Pool</h3>
                    </div>

                    <form action="admin.php" method="POST" class="space-y-4 text-xs font-mono">
                        <input type="hidden" name="action" value="create_lottery">

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Lottery / Event Name</label>
                                <input type="text" name="name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10-Taka Fast Cash Daily" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Category / Banner Label</label>
                                <input type="text" name="category" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10 Taka Banner" />
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Entry Ticket (৳)</label>
                                <input type="number" step="0.5" min="1" name="entryFee" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Prize Reward (৳)</label>
                                <input type="number" step="1" min="1" name="prizeAmount" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 500" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Total Tickets Capacity</label>
                                <input type="number" min="1" name="totalTickets" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 1000" />
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-slate-500">Detailed Rules Description (Optional)</label>
                            <textarea name="details" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-rose-500 font-sans" placeholder="Describe eligibility and bonus patterns..."></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-500">Draw Mode Select</label>
                                <select id="admin-draw-mode-select" name="drawMode" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 cursor-pointer">
                                    <option value="manual">Manual Draw</option>
                                    <option value="auto">Auto Draw (Timer - Min)</option>
                                    <option value="auto_datetime">Auto Draw (Exact Date & Time)</option>
                                </select>
                            </div>
                            <div id="admin-timer-container" class="space-y-1.5 hidden">
                                <label class="block text-slate-500">Timer (In Minutes)</label>
                                <input type="number" min="1" max="1440" name="drawDuration" value="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" />
                            </div>
                            <div id="admin-datetime-container" class="space-y-1.5 hidden">
                                <label class="block text-slate-500">Exact Date & Time</label>
                                <input type="datetime-local" name="exactDrawTime" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" />
                            </div>
                        </div>

                        <script>
                            document.getElementById("admin-draw-mode-select").addEventListener("change", function(e) {
                                const mode = e.target.value;
                                const timerContainer = document.getElementById("admin-timer-container");
                                const datetimeContainer = document.getElementById("admin-datetime-container");
                                if (mode === "auto") {
                                    timerContainer.classList.remove("hidden");
                                    datetimeContainer.classList.add("hidden");
                                } else if (mode === "auto_datetime") {
                                    timerContainer.classList.add("hidden");
                                    datetimeContainer.classList.remove("hidden");
                                } else {
                                    timerContainer.classList.add("hidden");
                                    datetimeContainer.classList.add("hidden");
                                }
                            });
                        </script>

                        <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98]">
                            Publish Live Draw Event
                        </button>
                    </form>
                </section>

                <!-- DEPOSIT APPROVAL LEDGER -->
                <section id="admin-deposits-section" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-800/60">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-piggy-bank text-emerald-500 text-sm"></i>
                            <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Deposit Approvals Ledger</h3>
                        </div>
                        <span class="text-[10px] font-mono text-slate-500">Verify Receipts</span>
                    </div>

                    <div class="space-y-3 max-h-[400px] overflow-y-auto scrollbar-none pr-1">
                        <?php if (count($deposits_list) === 0): ?>
                            <div class="text-center py-6 text-xs text-slate-600 font-mono">0 DEPOSIT SUBMISSIONS LOGGED PREVIOUSLY.</div>
                        <?php else: ?>
                            <?php foreach ($deposits_list as $dep): ?>
                                <div class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex justify-between items-center gap-4">
                                    <div class="space-y-1 text-xs font-mono">
                                        <div class="font-bold text-white">@<?php echo htmlspecialchars($dep['username']); ?></div>
                                        <div class="text-[10px] text-slate-400">Method: <?php echo htmlspecialchars($dep['method']); ?> | TrxID: <?php echo htmlspecialchars($dep['trxId']); ?></div>
                                        <div class="text-[9px] text-slate-600"><?php echo htmlspecialchars($dep['date']); ?></div>
                                    </div>
                                    
                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-emerald-400 font-mono">৳<?php echo htmlspecialchars($dep['amount']); ?></span>
                                        
                                        <?php if ($dep['status'] === 'pending'): ?>
                                            <div class="flex gap-1">
                                                <form action="admin.php" method="POST">
                                                    <input type="hidden" name="action" value="verify_deposit">
                                                    <input type="hidden" name="id" value="<?php echo $dep['id']; ?>">
                                                    <input type="hidden" name="status" value="approved">
                                                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] transition">Approve</button>
                                                </form>
                                                <form action="admin.php" method="POST">
                                                    <input type="hidden" name="action" value="verify_deposit">
                                                    <input type="hidden" name="id" value="<?php echo $dep['id']; ?>">
                                                    <input type="hidden" name="status" value="declined">
                                                    <button type="submit" class="bg-rose-950 text-rose-400 hover:bg-rose-900 font-bold py-1 px-2.5 rounded-lg text-[9px] transition border border-rose-900/30">Decline</button>
                                                </form>
                                            </div>
                                        <?php else: ?>
                                            <span class="uppercase font-mono font-bold text-[9px] <?php echo $dep['status'] === 'approved' ? 'text-emerald-400' : 'text-rose-500'; ?>"><?php echo $dep['status']; ?></span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </section>

                <!-- WITHDRAWAL RELEASES LEDGER -->
                <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-800/60">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-money-bill-transfer text-amber-500 text-sm"></i>
                            <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Withdrawals Release Ledger</h3>
                        </div>
                        <span class="text-[10px] font-mono text-slate-500">Security Checks</span>
                    </div>

                    <div class="space-y-3 max-h-[400px] overflow-y-auto scrollbar-none pr-1">
                        <?php if (count($withdrawals_list) === 0): ?>
                            <div class="text-center py-6 text-xs text-slate-600 font-mono">0 WITHDRAWAL DISPATCH LOGS.</div>
                        <?php else: ?>
                            <?php foreach ($withdrawals_list as $wd): ?>
                                <div class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex justify-between items-center gap-4">
                                    <div class="space-y-1 text-xs font-mono">
                                        <div class="font-bold text-white">@<?php echo htmlspecialchars($wd['username']); ?></div>
                                        <div class="text-[10px] text-slate-400">Account: <?php echo htmlspecialchars($wd['targetAccount']); ?> | Method: <?php echo htmlspecialchars($wd['method']); ?></div>
                                        <div class="text-[9px] text-slate-600"><?php echo htmlspecialchars($wd['date']); ?></div>
                                    </div>

                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-rose-400 font-mono">৳<?php echo htmlspecialchars($wd['amount']); ?></span>

                                        <?php if ($wd['status'] === 'pending'): ?>
                                            <div class="flex gap-1">
                                                <form action="admin.php" method="POST">
                                                    <input type="hidden" name="action" value="verify_withdrawal">
                                                    <input type="hidden" name="id" value="<?php echo $wd['id']; ?>">
                                                    <input type="hidden" name="status" value="approved">
                                                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] transition">Approve</button>
                                                </form>
                                                <form action="admin.php" method="POST">
                                                    <input type="hidden" name="action" value="verify_withdrawal">
                                                    <input type="hidden" name="id" value="<?php echo $wd['id']; ?>">
                                                    <input type="hidden" name="status" value="declined">
                                                    <button type="submit" class="bg-rose-950 text-rose-400 hover:bg-rose-900 font-bold py-1 px-2.5 rounded-lg text-[9px] transition border border-rose-900/30">Decline/Ref</button>
                                                </form>
                                            </div>
                                        <?php else: ?>
                                            <span class="uppercase font-mono font-bold text-[9px] <?php echo $wd['status'] === 'approved' ? 'text-emerald-400' : 'text-rose-500'; ?>"><?php echo $wd['status']; ?></span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </section>

            </div>

            <!-- RIGHT COLUMN: PLAYERS MANAGEMENT & GATEWAY DETAILS -->
            <div class="space-y-8">
                
                <!-- Players Tweak panel -->
                <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                        <i class="fa-solid fa-users text-cyan-400 text-sm"></i>
                        <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Registered Players</h3>
                    </div>

                    <div class="space-y-3 max-h-[600px] overflow-y-auto scrollbar-none pr-1">
                        <?php foreach ($users_list as $usr): ?>
                            <div class="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl space-y-3">
                                <div class="flex justify-between items-start gap-2">
                                    <div class="text-xs font-mono">
                                        <span class="font-bold text-white block">@<?php echo htmlspecialchars($usr['username']); ?></span>
                                        <span class="text-[9px] text-slate-500 block truncate max-w-[150px]"><?php echo htmlspecialchars($usr['email']); ?></span>
                                    </div>
                                    <span class="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950/30 border border-cyan-800/20 text-cyan-400 uppercase">
                                        <?php echo $usr['status']; ?>
                                    </span>
                                </div>

                                <form action="admin.php" method="POST" class="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    <input type="hidden" name="action" value="update_user">
                                    <input type="hidden" name="id" value="<?php echo $usr['id']; ?>">
                                    
                                    <div class="space-y-1">
                                        <span class="text-[8px] text-slate-500 block">BALANCE (৳)</span>
                                        <input type="number" step="0.5" name="balance" value="<?php echo $usr['balance']; ?>" class="w-full bg-slate-900 border border-slate-800/80 rounded-lg py-1 px-2 text-white outline-none" />
                                    </div>

                                    <div class="space-y-1">
                                        <span class="text-[8px] text-slate-500 block">STATUS PRIVILEGES</span>
                                        <select name="status" class="w-full bg-slate-900 border border-slate-800/80 rounded-lg py-1 px-2 text-white outline-none cursor-pointer">
                                            <option value="active" <?php echo $usr['status'] === 'active' ? 'selected' : ''; ?>>Active</option>
                                            <option value="blocked" <?php echo $usr['status'] === 'blocked' ? 'selected' : ''; ?>>Block / Audit</option>
                                            <option value="permanently_banned" <?php echo $usr['status'] === 'permanently_banned' ? 'selected' : ''; ?>>Permanently Ban</option>
                                        </select>
                                    </div>

                                    <button type="submit" class="col-span-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 hover:text-white font-bold py-1.5 rounded-lg transition mt-1 uppercase">
                                        Commit Changes
                                    </button>
                                </form>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </section>

                <!-- Gateways and Channels Shortcut quick widget -->
                <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                    <div class="w-12 h-12 bg-teal-950/50 border border-teal-900/30 text-teal-400 text-xl flex items-center justify-center mx-auto rounded-2xl">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase font-mono">Synchronize Payment Channels</h4>
                        <p class="text-[10px] text-slate-500 font-mono mt-1">Configure live Mobile Banking accounts, detailed bank transfers, and TRC-20 USDT wallet addresses safely.</p>
                    </div>
                    <a href="payment.php" class="block w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold py-2.5 rounded-xl transition">
                        Manage Gateways & Accounts
                    </a>
                </section>

            </div>

        </div>

    </main>

    <!-- Admin footer identity -->
    <footer class="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-600">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Executive Operations Control System.</p>
    </footer>

</body>
</html>
