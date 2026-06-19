<?php
/**
 * Lottery Winner - Secure Register Controller (register.php)
 * 
 * Manages user accounts initialization with detailed server side filters,
 * secure BCRYPT password hashing, and prepared statement checks.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// Assert POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only POST request method allowed.']);
    exit;
}

// Support JSON content types alongside standard posting bodies
$input = json_decode(file_get_contents('php://input'), true);
$username_val = trim($input['username'] ?? $_POST['username'] ?? '');
$email_val = trim($input['email'] ?? $_POST['email'] ?? '');
$password_val = $input['password'] ?? $_POST['password'] ?? '';
$phone_val = trim($input['phone'] ?? $_POST['phone'] ?? '');
$dob_val = trim($input['dob'] ?? $_POST['dob'] ?? '');

// Simple input sanitization rules
if (empty($username_val) || empty($email_val) || empty($password_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username, Email, and Password are required.']);
    exit;
}

// Length check criteria
if (strlen($username_val) < 3 || strlen($username_val) > 40) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username must be between 3 and 40 characters long.']);
    exit;
}

if (strlen($password_val) < 6) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters long for security protection.']);
    exit;
}

if (!filter_var($email_val, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'The provided email is structurally invalid.']);
    exit;
}

// Prevent spoofing "Admin" usernames
if (strtolower($username_val) === 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Registration with the username "Admin" is restricted.']);
    exit;
}

try {
    // Check if Username already registered (PDO prepared statement)
    $stmt_user = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?)");
    $stmt_user->execute([$username_val]);
    if ($stmt_user->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'This raw username is already occupied. Please select another.']);
        exit;
    }

    // Check if Email already registered (PDO prepared statement)
    $stmt_email = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)");
    $stmt_email->execute([$email_val]);
    if ($stmt_email->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'An account is already linked with this email address.']);
        exit;
    }

    // Hash user passwords safely using secure standard BCRYPT
    $hash_password = password_hash($password_val, PASSWORD_BCRYPT);
    $user_uniq_id = 'u_' . bin2hex(random_bytes(8)); // High entropy starting IDs

    // Commit User into persistent database safely using prepared statement parameters
    $insert_stmt = $conn->prepare("
        INSERT INTO users (id, username, email, password, phone, dob, balance, totDeposit, totWithdraw, wins, loss, profit, status, joinDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE())
    ");

    // Start users off with 100.00 Taka/credits as a sign-up incentive
    $start_balance = 100.00;
    $zero_val = 0.00;
    $zero_int = 0;
    $active_status = 'active';

    $insert_stmt->execute([
        $user_uniq_id,
        $username_val,
        $email_val,
        $hash_password,
        !empty($phone_val) ? $phone_val : null,
        !empty($dob_val) ? $dob_val : null,
        $start_balance,
        $zero_val, // totDeposit
        $zero_val, // totWithdraw
        $zero_int, // wins
        $zero_int, // loss
        $zero_val, // profit
        $active_status
    ]);

    // Establish immediate login sessions
    $_SESSION['user_id'] = $user_uniq_id;
    $_SESSION['username'] = $username_val;
    $_SESSION['role'] = 'member';

    echo json_encode([
        'status' => 'success',
        'message' => 'User account finalized and signed in.',
        'userId' => $user_uniq_id,
        'username' => $username_val
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registration database update failure: ' . $e->getMessage()]);
    exit;
}
?>
