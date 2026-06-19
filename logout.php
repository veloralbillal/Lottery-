<?php
/**
 * Lottery Winner - Secure Session Termination (logout.php)
 * 
 * Safely clears active login tokens, releases all memory associated
 * with the current user or administrator session, and redirects to the portal.
 */

// Load centralized configurations
require_once __DIR__ . '/config.php';

// Unset all session variables representing user logins or admins
$_SESSION = array();

// If it's desired to kill the session cookie, destroy it completely
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
session_destroy();

// Redirect back to main page or a landing login portal with logout success context
header("Location: login_page.php?success=logged_out");
exit;
?>
