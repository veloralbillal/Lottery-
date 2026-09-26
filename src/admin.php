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
    <link rel="stylesheet" href="admin_tabs/admin.css">
</head>
<body class="text-slate-100 antialiased font-sans min-h-screen flex flex-col justify-between">

    <!-- Admin header strip -->
    <div class="w-full">
        <!-- Renders automatically from dependency admin_header.php -->
    </div>

    <!-- MAIN DASHBOARD COMPONENT PORTAL -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
        <!-- Welcome Alert banner info & counters -->
        <?php require_once __DIR__ . '/admin_tabs/overview.php'; ?>

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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- LEFT COLUMN: LOTTERIES CRUD LIST & CREATOR -->
            <div class="lg:col-span-2 space-y-8">
                
                <!-- Dynamic Draw Pools Display -->
                <?php require_once __DIR__ . '/admin_tabs/pools.php'; ?>

                <!-- Launch New Lottery Form -->
                <?php require_once __DIR__ . '/admin_tabs/create_pool.php'; ?>

                <!-- Deposit Approvals Ledger -->
                <?php require_once __DIR__ . '/admin_tabs/deposits.php'; ?>

                <!-- Withdrawals Release Ledger -->
                <?php require_once __DIR__ . '/admin_tabs/withdrawals.php'; ?>

            </div>

            <!-- RIGHT COLUMN: PLAYERS MANAGEMENT & GATEWAY DETAILS -->
            <div class="space-y-8">
                
                <!-- Registered Players management -->
                <?php require_once __DIR__ . '/admin_tabs/players.php'; ?>

                <!-- Payment gateways sync shortcuts -->
                <?php require_once __DIR__ . '/admin_tabs/gateways.php'; ?>

            </div>

        </div>

    </main>

    <!-- Admin footer identity -->
    <footer class="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-600">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Executive Operations Control System.</p>
    </footer>

    <!-- Modular Admin panel JS script interactions -->
    <script src="admin_tabs/admin.js"></script>

</body>
</html>
