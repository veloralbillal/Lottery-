<?php
/**
 * Lottery Winner - Secure User & Admin Login Controller (login.php)
 * 
 * Verifies login requests via prepared statements, enforces persistent brute-force
 * rate limiting, rotates session IDs, supports secure password verification (Argon2id/Bcrypt),
 * seamlessly upgrades legacy plain passwords, and records security audit logs.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// Assert POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only POST request method allowed.']);
    exit;
}

// Support receiving both application/json payload and form-urlencoded
$input = json_decode(file_get_contents('php://input'), true);
$username_val = trim($input['username'] ?? $_POST['username'] ?? '');
$password_val = (string)($input['password'] ?? $_POST['password'] ?? '');
$csrf_val     = $input['csrf_token'] ?? $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

if (empty($username_val) || empty($password_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All username and password fields are strictly required.']);
    exit;
}

// 1. Rate Limiting Protection (Max 5 attempts per 15 minutes per IP and per username)
$client_ip = get_client_ip();
$ip_rate = check_rate_limit($conn, 'login_ip', $client_ip, 10, 900);
$user_rate = check_rate_limit($conn, 'login_user', strtolower($username_val), 5, 900);

if (!$ip_rate['allowed'] || !$user_rate['allowed']) {
    $retry_after = max($ip_rate['retry_after'], $user_rate['retry_after']);
    record_audit_log($conn, null, $username_val, 'LOGIN_RATE_LIMITED', ['ip' => $client_ip, 'retry_after' => $retry_after]);
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'Too many failed login attempts. Please wait ' . ceil($retry_after / 60) . ' minutes before trying again.'
    ]);
    exit;
}

// Password hashing algorithm selection (Argon2id if supported, else DEFAULT)
$hash_algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;

try {
    // 2. Administrator Authentication
    if (strtolower($username_val) === 'admin') {
        $admin_authenticated = false;
        $admin_user_id = 'u_admin_system';
        $admin_stored_hash = null;

        // Check if Admin exists in `users` table
        $stmt_admin = $conn->prepare("SELECT id, username, password, status, role FROM users WHERE LOWER(username) = 'admin'");
        $stmt_admin->execute();
        $admin_row = $stmt_admin->fetch();

        if ($admin_row) {
            $admin_user_id = $admin_row['id'];
            $admin_stored_hash = $admin_row['password'];

            if (password_verify($password_val, $admin_stored_hash)) {
                $admin_authenticated = true;
                // Rehash if options or algorithms have upgraded
                if (password_needs_rehash($admin_stored_hash, $hash_algo)) {
                    $new_hash = password_hash($password_val, $hash_algo);
                    $up = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $up->execute([$new_hash, $admin_user_id]);
                }
            } elseif ($password_val === $admin_stored_hash) {
                // Seamlessly upgrade legacy plaintext password to secure hash
                $admin_authenticated = true;
                $new_hash = password_hash($password_val, $hash_algo);
                $up = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $up->execute([$new_hash, $admin_user_id]);
            }
        } else {
            // Check settings table for adminPass
            $stmt_set = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'adminPass'");
            $stmt_set->execute();
            $set_row = $stmt_set->fetch();
            $admin_pass_config = $set_row ? $set_row['setting_value'] : null;

            if ($admin_pass_config) {
                if (password_verify($password_val, $admin_pass_config)) {
                    $admin_authenticated = true;
                } elseif ($password_val === $admin_pass_config) {
                    $admin_authenticated = true;
                    // Hash and save back to settings
                    $new_hash = password_hash($password_val, $hash_algo);
                    $up = $conn->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = 'adminPass'");
                    $up->execute([$new_hash]);
                }
            }
        }

        if ($admin_authenticated) {
            // Reset rate limit counters on success
            reset_rate_limit($conn, 'login_ip', $client_ip);
            reset_rate_limit($conn, 'login_user', strtolower($username_val));

            // Rotate session ID to eliminate session fixation
            session_regenerate_id(true);

            $_SESSION['user_id'] = $admin_user_id;
            $_SESSION['username'] = 'Admin';
            $_SESSION['role'] = 'admin';
            $_SESSION['session_created_at'] = time();
            $_SESSION['last_activity'] = time();

            // Record security audit log
            record_audit_log($conn, $admin_user_id, 'Admin', 'LOGIN_SUCCESS_ADMIN', ['ip' => $client_ip]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Administrator credentials verified. Access granted.',
                'username' => 'Admin',
                'role' => 'admin',
                'csrf_token' => csrf_token()
            ]);
            exit;
        } else {
            // Log failed admin login attempt
            record_audit_log($conn, null, 'Admin', 'LOGIN_FAILED_ADMIN', ['ip' => $client_ip]);
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid username/email or password credentials.']);
            exit;
        }
    }

    // 3. Standard User Authentication via safe prepared statement
    $stmt = $conn->prepare("SELECT id, username, email, password, status, role FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)");
    $stmt->execute([$username_val, $username_val]);
    $user = $stmt->fetch();

    if ($user) {
        $password_match = false;

        // Secure password verification
        if (password_verify($password_val, $user['password'])) {
            $password_match = true;
            if (password_needs_rehash($user['password'], $hash_algo)) {
                $new_hash = password_hash($password_val, $hash_algo);
                $up = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $up->execute([$new_hash, $user['id']]);
            }
        } elseif ($password_val === $user['password']) {
            // Legacy plain-text upgrade on verified login
            $password_match = true;
            $new_hash = password_hash($password_val, $hash_algo);
            $up = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $up->execute([$new_hash, $user['id']]);
        }

        if ($password_match) {
            // Check account status
            if ($user['status'] === 'blocked') {
                record_audit_log($conn, $user['id'], $user['username'], 'LOGIN_BLOCKED_ATTEMPT', ['ip' => $client_ip]);
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'This account has been completely blocked by administrative actions.']);
                exit;
            }

            // Reset rate limit counters on success
            reset_rate_limit($conn, 'login_ip', $client_ip);
            reset_rate_limit($conn, 'login_user', strtolower($username_val));

            // Prevent session fixation
            session_regenerate_id(true);

            $role = (!empty($user['role']) && $user['role'] !== 'user') ? $user['role'] : 'member';

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $role;
            $_SESSION['session_created_at'] = time();
            $_SESSION['last_activity'] = time();

            // Record audit log
            record_audit_log($conn, $user['id'], $user['username'], 'LOGIN_SUCCESS', ['ip' => $client_ip, 'role' => $role]);

            echo json_encode([
                'status' => 'success',
                'message' => 'User login successful.',
                'userId' => $user['id'],
                'username' => $user['username'],
                'role' => $role,
                'csrf_token' => csrf_token()
            ]);
            exit;
        }
    }

    // Default uniform rejection: prevents username enumeration
    record_audit_log($conn, null, $username_val, 'LOGIN_FAILED', ['ip' => $client_ip]);
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid username/email or password credentials.']);
    exit;

} catch (PDOException $e) {
    error_log("Database Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Authentication service temporarily unavailable. Please try again later.']);
    exit;
}
?>
