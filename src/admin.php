<?php
/**
 * Lottery Winner - Interactive Administration Control Room (admin.php)
 * 
 * Provides dynamic systems configuration, dynamic lottery creation/deletion,
 * player details tweaking, deposit verification ledger, and withdrawal release.
 * Hardened with CSRF validation, cryptographically secure RNG for draws,
 * atomic transactions with row locks, and comprehensive security audit logging.
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
    $admin_actor_id = $_SESSION['user_id'] ?? 'u_admin_system';
    $admin_actor_username = $_SESSION['username'] ?? 'Admin';

    // Verify CSRF token on all administrative state changes
    if (!verify_csrf_token()) {
        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'ADMIN_CSRF_REJECTED', [
            'action' => $action,
            'ip' => get_client_ip()
        ]);
        $error_msg = "Security session validation token expired or invalid. Please refresh the page.";
    } else {

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
                    
                    record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'LOTTERY_CREATED', [
                        'id' => $id,
                        'name' => $name,
                        'fee' => $fee,
                        'prize' => $prize,
                        'tickets' => $tickets
                    ]);

                    $success_msg = "Successfully activated new \"" . htmlspecialchars($name) . "\" lottery pool!";
                } catch (PDOException $e) {
                    error_log("Failed to launch lottery: " . $e->getMessage());
                    $error_msg = "Failed to launch lottery. Please verify parameters.";
                }
            } else {
                $error_msg = "Please verify all lottery input configuration constraints.";
            }
        }

        // 2. DELETE LOTTERY POOL
        else if ($action === 'delete_lottery') {
            $id = trim($_POST['id'] ?? '');
            if (!empty($id)) {
                try {
                    $conn->beginTransaction();
                    
                    // First delete all linked tickets
                    $stmt_tickets = $conn->prepare("DELETE FROM tickets WHERE lotteryId = ?");
                    $stmt_tickets->execute([$id]);

                    // Delete the lottery
                    $stmt_lot = $conn->prepare("DELETE FROM lotteries WHERE id = ?");
                    $stmt_lot->execute([$id]);

                    $conn->commit();

                    record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'LOTTERY_DELETED', ['id' => $id]);

                    $success_msg = "Successfully deleted lottery pool \"" . htmlspecialchars($id) . "\" and associated ticket entries.";
                } catch (PDOException $e) {
                    if ($conn->inTransaction()) {
                        $conn->rollBack();
                    }
                    error_log("Failed to delete lottery pool: " . $e->getMessage());
                    $error_msg = "Failed to delete lottery pool.";
                }
            }
        }

        // 3. FORCE MANUAL DRAW WINNER
        else if ($action === 'force_draw') {
            $lottery_id = trim($_POST['lottery_id'] ?? '');
            try {
                // Find lottery with row lock
                $stmt_l = $conn->prepare("SELECT * FROM lotteries WHERE id = ? AND status = 'active' FOR UPDATE");
                $stmt_l->execute([$lottery_id]);
                $lot = $stmt_l->fetch();

                if ($lot) {
                    // Find all active tickets bought in this lottery
                    $stmt_t = $conn->prepare("SELECT * FROM tickets WHERE lotteryId = ? AND status = 'pending' FOR UPDATE");
                    $stmt_t->execute([$lottery_id]);
                    $tickets = $stmt_t->fetchAll();

                    if (count($tickets) > 0) {
                        $conn->beginTransaction();

                        // Choose cryptographically secure random winning ticket
                        $winner_idx = secure_random_int(0, count($tickets) - 1);
                        $winning_ticket = $tickets[$winner_idx];
                        
                        // Mark winner ticket
                        $up_win = $conn->prepare("UPDATE tickets SET status = 'won', prizeAmount = ? WHERE id = ?");
                        $up_win->execute([$lot['prizeAmount'], $winning_ticket['id']]);

                        // Mark other tickets as lost for this lottery
                        $up_lost = $conn->prepare("UPDATE tickets SET status = 'lost', prizeAmount = 0.00 WHERE lotteryId = ? AND id != ?");
                        $up_lost->execute([$lottery_id, $winning_ticket['id']]);

                        // Add prize amount to winner user balance with row lock
                        $up_user = $conn->prepare("UPDATE users SET balance = balance + ?, wins = wins + 1, profit = profit + ? WHERE id = ?");
                        $up_user->execute([$lot['prizeAmount'], $lot['prizeAmount'], $winning_ticket['userId']]);

                        // Update lottery status
                        $up_lot = $conn->prepare("UPDATE lotteries SET status = 'drawn' WHERE id = ?");
                        $up_lot->execute([$lottery_id]);

                        $conn->commit();

                        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'LOTTERY_MANUAL_DRAW', [
                            'lotteryId' => $lottery_id,
                            'winningTicketId' => $winning_ticket['id'],
                            'winningTicketCode' => $winning_ticket['code'],
                            'winnerUserId' => $winning_ticket['userId'],
                            'prize' => $lot['prizeAmount']
                        ]);

                        $success_msg = "Draw Complete! Winning ticket code is \"" . htmlspecialchars($winning_ticket['code']) . "\"! User reward dispatched.";
                    } else {
                        $error_msg = "Draw failed. No players bought tickets inside this pool yet!";
                    }
                } else {
                    $error_msg = "Lottery pool is either expired, drawn already, or does not exist.";
                }
            } catch (PDOException $e) {
                if ($conn->inTransaction()) {
                    $conn->rollBack();
                }
                error_log("Winner selection crash: " . $e->getMessage());
                $error_msg = "Winner selection sequence failed. Transaction rolled back safely.";
            }
        }

        // 4. VERIFY DEPOSIT REQUEST
        else if ($action === 'verify_deposit') {
            $dep_id = trim($_POST['id'] ?? '');
            $status_decision = trim($_POST['status'] ?? ''); // 'approved' or 'declined'

            if (!empty($dep_id) && in_array($status_decision, ['approved', 'declined'])) {
                try {
                    $conn->beginTransaction();

                    // Fetch deposit with row lock to prevent race conditions
                    $stmt_d = $conn->prepare("SELECT * FROM deposits WHERE id = ? AND status = 'pending' FOR UPDATE");
                    $stmt_d->execute([$dep_id]);
                    $dep = $stmt_d->fetch();

                    if ($dep) {
                        // Update deposit status
                        $stmt_up = $conn->prepare("UPDATE deposits SET status = ? WHERE id = ?");
                        $stmt_up->execute([$status_decision, $dep_id]);

                        if ($status_decision === 'approved') {
                            // Increase user's balance and totDeposit atomically
                            $stmt_usr = $conn->prepare("UPDATE users SET balance = balance + ?, totDeposit = totDeposit + ? WHERE username = ?");
                            $stmt_usr->execute([$dep['amount'], $dep['amount'], $dep['username']]);
                        }

                        $conn->commit();

                        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'DEPOSIT_' . strtoupper($status_decision), [
                            'depositId' => $dep_id,
                            'username' => $dep['username'],
                            'amount' => $dep['amount'],
                            'trxId' => $dep['trxId']
                        ]);

                        $success_msg = "Deposit entry of ৳" . number_format($dep['amount'], 2) . " for @" . htmlspecialchars($dep['username']) . " was " . strtoupper($status_decision) . ".";
                    } else {
                        $conn->rollBack();
                        $error_msg = "Deposit record is already resolved or missing.";
                    }
                } catch (PDOException $e) {
                    if ($conn->inTransaction()) {
                        $conn->rollBack();
                    }
                    error_log("Failed to update deposit ledger: " . $e->getMessage());
                    $error_msg = "Failed to update deposit ledger.";
                }
            }
        }

        // 5. SECURE WITHDRAWAL DESPATCH RELEASE
        else if ($action === 'verify_withdrawal') {
            $wd_id = trim($_POST['id'] ?? '');
            $status_decision = trim($_POST['status'] ?? ''); // 'approved' or 'declined'

            if (!empty($wd_id) && in_array($status_decision, ['approved', 'declined'])) {
                try {
                    $conn->beginTransaction();

                    // Fetch withdrawal details with row lock
                    $stmt_w = $conn->prepare("SELECT * FROM withdrawals WHERE id = ? AND status = 'pending' FOR UPDATE");
                    $stmt_w->execute([$wd_id]);
                    $wd = $stmt_w->fetch();

                    if ($wd) {
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

                        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'WITHDRAWAL_' . strtoupper($status_decision), [
                            'withdrawalId' => $wd_id,
                            'username' => $wd['username'],
                            'amount' => $wd['amount'],
                            'targetAccount' => $wd['targetAccount']
                        ]);

                        $success_msg = "Withdrawal request of ৳" . number_format($wd['amount'], 2) . " for @" . htmlspecialchars($wd['username']) . " was " . strtoupper($status_decision) . ".";
                    } else {
                        $conn->rollBack();
                        $error_msg = "Withdrawal record is already processed or missing.";
                    }
                } catch (PDOException $e) {
                    if ($conn->inTransaction()) {
                        $conn->rollBack();
                    }
                    error_log("Issue finishing withdrawal: " . $e->getMessage());
                    $error_msg = "Technical issue processing withdrawal.";
                }
            }
        }

        // 6. EDIT USER METRICS / PRIVILEGES
        else if ($action === 'update_user') {
            $u_id = trim($_POST['id'] ?? '');
            $new_bal = (float)($_POST['balance'] ?? 0.00);
            $new_status = trim($_POST['status'] ?? 'active');

            if (!empty($u_id) && in_array($new_status, ['active', 'blocked'])) {
                try {
                    $stmt = $conn->prepare("UPDATE users SET balance = ?, status = ? WHERE id = ?");
                    $stmt->execute([$new_bal, $new_status, $u_id]);

                    record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'USER_METRICS_UPDATED', [
                        'targetUserId' => $u_id,
                        'newBalance' => $new_bal,
                        'newStatus' => $new_status
                    ]);

                    $success_msg = "Player profile \"" . htmlspecialchars($u_id) . "\" metrics updated successfully!";
                } catch (PDOException $e) {
                    error_log("Failed to update user parameters: " . $e->getMessage());
                    $error_msg = "Failed to update user parameters.";
                }
            }
        }

        // 7. CHANGE ADMIN PASSWORD
        else if ($action === 'change_admin_password') {
            $curr_pass = (string)($_POST['current_password'] ?? '');
            $new_pass  = (string)($_POST['new_password'] ?? '');
            $conf_pass = (string)($_POST['confirm_password'] ?? '');

            if (empty($curr_pass) || empty($new_pass)) {
                $error_msg = "Current password and new password are required.";
            } elseif ($new_pass !== $conf_pass) {
                $error_msg = "New password and confirmation password do not match.";
            } elseif (strlen($new_pass) < 8) {
                $error_msg = "New password must be at least 8 characters in length.";
            } else {
                try {
                    $admin_stmt = $conn->prepare("SELECT id, password FROM users WHERE LOWER(username) = 'admin'");
                    $admin_stmt->execute();
                    $admin_row = $admin_stmt->fetch();
                    $verified = false;

                    if ($admin_row) {
                        if (password_verify($curr_pass, $admin_row['password']) || $curr_pass === $admin_row['password']) {
                            $verified = true;
                        }
                    } else {
                        $set_stmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'adminPass'");
                        $set_stmt->execute();
                        $set_row = $set_stmt->fetch();
                        if ($set_row && (password_verify($curr_pass, $set_row['setting_value']) || $curr_pass === $set_row['setting_value'])) {
                            $verified = true;
                        }
                    }

                    if ($verified) {
                        $hash_algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
                        $hashed_pass = password_hash($new_pass, $hash_algo);

                        if ($admin_row) {
                            $up_usr = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                            $up_usr->execute([$hashed_pass, $admin_row['id']]);
                        }
                        
                        $up_set = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('adminPass', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
                        $up_set->execute([$hashed_pass, $hashed_pass]);

                        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'ADMIN_PASSWORD_CHANGED', [
                            'ip' => get_client_ip()
                        ]);

                        $success_msg = "Administrator password passphrase updated and securely hashed!";
                    } else {
                        record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'ADMIN_PASSWORD_CHANGE_FAILED', [
                            'ip' => get_client_ip(),
                            'reason' => 'Incorrect current password'
                        ]);
                        $error_msg = "Current administrator password provided is incorrect.";
                    }
                } catch (PDOException $e) {
                    error_log("Password update error: " . $e->getMessage());
                    $error_msg = "Failed to update administrator password.";
                }
            }
        }

        // 8. CLEAR / RESET RATE LIMITS
        else if ($action === 'clear_rate_limits') {
            try {
                $conn->exec("DELETE FROM rate_limits");
                record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'RATE_LIMITS_CLEARED', [
                    'ip' => get_client_ip()
                ]);
                $success_msg = "All brute-force rate limit counters have been cleared and all keys unlocked.";
            } catch (PDOException $e) {
                error_log("Rate limit clear error: " . $e->getMessage());
                $error_msg = "Failed to reset rate limits.";
            }
        }

        // 9. PRUNE AUDIT LOGS
        else if ($action === 'prune_audit_logs') {
            try {
                $conn->exec("DELETE FROM security_audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
                record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'AUDIT_LOGS_PRUNED', [
                    'ip' => get_client_ip()
                ]);
                $success_msg = "Security audit logs older than 30 days were pruned successfully.";
            } catch (PDOException $e) {
                error_log("Audit log prune error: " . $e->getMessage());
                $error_msg = "Failed to prune audit logs.";
            }
        }

        // 10. SAVE 2FA SECURITY POLICY
        else if ($action === 'save_2fa_policy') {
            $enabled = !empty($_POST['two_factor_enabled']) ? 1 : 0;
            $pin = trim($_POST['two_factor_pin'] ?? '829401');
            $enforce_login = !empty($_POST['enforce_login']) ? 1 : 0;
            $enforce_withdraw = !empty($_POST['enforce_withdraw']) ? 1 : 0;
            $enforce_credentials = !empty($_POST['enforce_credentials']) ? 1 : 0;
            $enforce_finance = !empty($_POST['enforce_finance']) ? 1 : 0;

            if (strlen($pin) !== 6 || !ctype_digit($pin)) {
                $error_msg = "Security Master PIN must be exactly 6 numeric digits.";
            } else {
                $_SESSION['two_factor_auth'] = [
                    'enabled' => $enabled,
                    'pin' => $pin,
                    'enforce_login' => $enforce_login,
                    'enforce_withdraw' => $enforce_withdraw,
                    'enforce_credentials' => $enforce_credentials,
                    'enforce_finance' => $enforce_finance
                ];
                record_audit_log($conn, $admin_actor_id, $admin_actor_username, '2FA_POLICY_SAVED', [
                    'enabled' => $enabled,
                    'ip' => get_client_ip()
                ]);
                $success_msg = $enabled ? "Two-Factor Authentication (2FA) policy activated and armed!" : "2FA policy updated.";
            }
        }

        // 11. SAVE RATE LIMIT POLICY
        else if ($action === 'save_rate_policy') {
            $max_attempts = (int)($_POST['max_attempts'] ?? 5);
            $decay_mins = (int)($_POST['decay_mins'] ?? 15);
            $sens_req = (int)($_POST['sensitive_per_min'] ?? 10);

            $_SESSION['rate_limit_policy'] = [
                'max_attempts' => $max_attempts,
                'decay_mins' => $decay_mins,
                'sensitive_per_min' => $sens_req
            ];
            record_audit_log($conn, $admin_actor_id, $admin_actor_username, 'RATE_LIMIT_POLICY_SAVED', [
                'max_attempts' => $max_attempts,
                'decay_mins' => $decay_mins,
                'ip' => get_client_ip()
            ]);
            $success_msg = "Rate Limiting and Brute-Force threshold parameters saved successfully.";
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
    $deposits_list = $conn->query("SELECT * FROM deposits ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, date DESC LIMIT 40")->fetchAll();
    $withdrawals_list = $conn->query("SELECT * FROM withdrawals ORDER BY CASE WHEN status = 'pending' THEN 1 ELSE 2 END, date DESC LIMIT 40")->fetchAll();
} catch (PDOException $e) {
    error_log("Admin data fetch error: " . $e->getMessage());
    $users_list = $lotteries_list = $deposits_list = $withdrawals_list = [];
}

function uppercase($str) {
    return strtoupper((string)$str);
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

    <!-- Admin header strip renders automatically from dependency admin_header.php -->

    <!-- MAIN DASHBOARD COMPONENT PORTAL -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
        <!-- Welcome Alert banner info & counters -->
        <?php require_once __DIR__ . '/admin_tabs/overview.php'; ?>

        <!-- Feedback messaging -->
        <?php if (!empty($success_msg)): ?>
            <div class="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i data-lucide="circle-check" class="text-emerald-500 text-base animate-pulse"></i>
                <div>
                    <strong>SUCCESS STATE:</strong> <?php echo htmlspecialchars($success_msg); ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="bg-rose-950/40 border border-rose-900/40 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i data-lucide="alert-triangle" class="text-rose-500 text-base"></i>
                <div>
                    <strong>ADMIN ALERT:</strong> <?php echo htmlspecialchars($error_msg); ?>
                </div>
            </div>
        <?php endif; ?>

        <?php
        $active_tab = isset($_GET['tab']) ? trim($_GET['tab']) : 'dashboard';
        $sec_alert_count = 0;
        try {
            $sec_alert_count = (int)$conn->query("SELECT COUNT(*) FROM security_audit_logs WHERE action LIKE '%FAILED%' OR action LIKE '%RATE_LIMITED%'")->fetchColumn();
        } catch(PDOException $e) {}
        ?>

        <!-- Admin Operations Nav Tabs Bar -->
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs overflow-x-auto scrollbar-none">
            <a href="admin.php?tab=dashboard" class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 <?php echo $active_tab !== 'security' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-950/40' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'; ?>">
                <i data-lucide="layout-dashboard"></i> Operations Dashboard
            </a>
            <a href="admin.php?tab=security" class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 <?php echo $active_tab === 'security' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40' : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'; ?>">
                <i data-lucide="shield" class="text-emerald-400"></i> Security Room
                <?php if ($sec_alert_count > 0): ?>
                    <span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded text-[9px]"><?php echo $sec_alert_count; ?></span>
                <?php endif; ?>
            </a>
            <a href="payment.php" class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 bg-slate-900 text-slate-400 hover:text-cyan-400 border border-slate-800">
                <i data-lucide="file-text" class="text-cyan-400"></i> Payment Gateways
            </a>
        </div>

        <?php if ($active_tab === 'security'): ?>
            <!-- Dedicated Security Operations Room -->
            <?php require_once __DIR__ . '/admin_tabs/security.php'; ?>
        <?php else: ?>

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

                <!-- Open Graph Configuration -->
                <?php require_once __DIR__ . '/admin_tabs/og_config.php'; ?>

                <!-- Payment gateways sync shortcuts -->
                <?php require_once __DIR__ . '/admin_tabs/gateways.php'; ?>

                <!-- Security Room Quick Hub Tile -->
                <section class="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-900/40 rounded-3xl p-6 text-center space-y-4">
                    <div class="w-12 h-12 bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 text-xl flex items-center justify-center mx-auto rounded-2xl shadow-lg">
                        <i data-lucide="shield"></i>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase font-mono">Security Operations Center</h4>
                        <p class="text-[10px] text-slate-500 font-mono mt-1">Audit logs, brute-force rate limiter records, CSRF token status & admin credential management.</p>
                    </div>
                    <a href="admin.php?tab=security" class="block w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold py-2.5 rounded-xl transition">
                        Open Security Room &rarr;
                    </a>
                </section>

            </div>

        </div>
        <?php endif; ?>

    </main>

    <!-- Admin footer identity -->
    <footer class="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-600">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Executive Operations Control System.</p>
    </footer>

    <!-- Modular Admin panel JS script interactions -->
    <script src="admin_tabs/admin.js"></script>

    <!-- Global CSRF Form Injector -->
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const csrfToken = <?php echo json_encode(csrf_token()); ?>;
            document.querySelectorAll("form").forEach(function(form) {
                if ((form.method || "").toUpperCase() === "POST" && !form.querySelector("input[name='csrf_token']")) {
                    const tokenField = document.createElement("input");
                    tokenField.type = "hidden";
                    tokenField.name = "csrf_token";
                    tokenField.value = csrfToken;
                    form.appendChild(tokenField);
                }
            });
        });
    </script>

</body>
</html>
