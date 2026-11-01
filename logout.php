<?php
/**
 * Lottery Winner - Secure Session Termination (logout.php)
 * 
 * Safely clears active login tokens, audits the sign-out event, releases all memory associated
 * with the current user or administrator session, destroys the session cookie, and redirects to portal.
 */

// Load centralized configurations
require_once __DIR__ . '/config.php';

if (isset($_SESSION['user_id'])) {
    $actor_id = $_SESSION['user_id'];
    $actor_username = $_SESSION['username'] ?? 'User';
    record_audit_log($conn, $actor_id, $actor_username, 'LOGOUT', ['ip' => get_client_ip()]);
}

// Unset all session variables
$_SESSION = [];

// Destroy the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy session entirely on the host
if (session_status() === PHP_SESSION_ACTIVE) {
    @session_destroy();
}

// Redirect back to landing login portal with logout success context
header("Location: login_page.php?success=logged_out");
exit;
?>
