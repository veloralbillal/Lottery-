<?php
/**
 * Lottery Winner - Database & Session Central Configuration
 * 
 * Centralizes connection credentials, handles PDO initialization,
 * enables secure cookie-based session parameters, and defends against
 * session hijacking.
 */

// Establish error handling levels (toggle display on for setup/checks)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prevent session hijacking via cookie parameters (only if headers not sent)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
    session_start();
}

// Database Connection constants (fallback inputs matching standard defaults)
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_PORT')) define('DB_PORT', '3306');
if (!defined('DB_NAME')) define('DB_NAME', 'lottery_winner_db');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');

try {
    // Shared global PDO connection resource ($conn)
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Turn off emulation for real prepared statements
        ]
    );

    // Apply database updates silently if missing columns
    try {
        $conn->exec("ALTER TABLE lotteries ADD COLUMN drawMode VARCHAR(50) DEFAULT 'manual'");
    } catch (PDOException $e) {}
    try {
        $conn->exec("ALTER TABLE lotteries ADD COLUMN drawDuration INT DEFAULT 10");
    } catch (PDOException $e) {}

    // Execute auto draw computations on page load triggers
    run_auto_draws_if_needed($conn);

} catch (PDOException $e) {
    // Handled gracefully rather than exposing sensitive stack traces in production
    die("Database Connection Lost. Technical details: " . htmlspecialchars($e->getMessage()));
}

/**
 * Automatically draws expired auto-mode lottery pools.
 */
function run_auto_draws_if_needed($conn) {
    try {
        // Fetch all active auto lotteries that are expired (drawTime <= NOW)
        $stmt_l = $conn->prepare("SELECT * FROM lotteries WHERE status = 'active' AND drawMode = 'auto' AND drawTime <= NOW()");
        $stmt_l->execute();
        $expired_lots = $stmt_l->fetchAll();

        foreach ($expired_lots as $lot) {
            $lottery_id = $lot['id'];

            // Find all pending tickets in this pool
            $stmt_t = $conn->prepare("SELECT * FROM tickets WHERE lotteryId = ? AND status = 'pending'");
            $stmt_t->execute([$lottery_id]);
            $tickets = $stmt_t->fetchAll();

            if (count($tickets) > 0) {
                $conn->beginTransaction();

                // Select a random winner
                $winning_ticket = $tickets[array_rand($tickets)];

                // Mark winning ticket
                $up_win = $conn->prepare("UPDATE tickets SET status = 'won', prizeAmount = ? WHERE id = ?");
                $up_win->execute([$lot['prizeAmount'], $winning_ticket['id']]);

                // Mark other tickets as lost
                $up_lost = $conn->prepare("UPDATE tickets SET status = 'lost', prizeAmount = 0.00 WHERE lotteryId = ? AND id != ?");
                $up_lost->execute([$lottery_id, $winning_ticket['id']]);

                // Credit the winner user balance, wins, and profit
                $up_user = $conn->prepare("UPDATE users SET balance = balance + ?, wins = wins + 1, profit = profit + ? WHERE id = ?");
                $up_user->execute([$lot['prizeAmount'], $lot['prizeAmount'], $winning_ticket['userId']]);

                // Set lottery status as drawn (completed)
                $up_lot = $conn->prepare("UPDATE lotteries SET status = 'drawn' WHERE id = ?");
                $up_lot->execute([$lottery_id]);

                $conn->commit();
            } else {
                // If drawTime expired but no tickets bought, mark as drawn to complete and terminate
                $up_lot = $conn->prepare("UPDATE lotteries SET status = 'drawn' WHERE id = ?");
                $up_lot->execute([$lottery_id]);
            }
        }
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
    }
}

/**
 * Checks if the logged-in user is an administrator.
 * 
 * @return bool True if session username is 'Admin', false otherwise.
 */
function is_admin_logged_in() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']) && strtolower($_SESSION['username']) === 'admin';
}

/**
 * Checks if a standard registered user is logged in.
 * 
 * @return bool True if logged in, false otherwise.
 */
function is_user_logged_in() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}
?>
