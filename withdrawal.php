<?php
/**
 * Lottery Winner - Secure Withdrawal Transaction Handler (withdrawal.php)
 * 
 * Manages user balance withdrawals within an atomic database transaction.
 * Performs real-time balance checks with row-level locks (FOR UPDATE) to prevent
 * overdraft or race-condition double-spend exploits, and verifies user status.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// 1. Check user login session
if (!is_user_logged_in()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to execute withdrawal requests.']);
    exit;
}

// 2. Assert POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only POST request method allowed.']);
    exit;
}

// Support JSON inputs alongside standard forms
$input = json_decode(file_get_contents('php://input'), true);
$amount_val = (float)($input['amount'] ?? $_POST['amount'] ?? 0.00);
$method_val = trim($input['method'] ?? $_POST['method'] ?? '');
$target_account_val = trim($input['targetAccount'] ?? $_POST['targetAccount'] ?? $_POST['target_account'] ?? '');

$active_user_id = $_SESSION['user_id'];
$active_username = $_SESSION['username'];
$client_ip = get_client_ip();

// 3. Rate Limiting Protection (Max 5 withdrawal requests per 10 minutes)
$rate = check_rate_limit($conn, 'withdraw_req', $active_user_id, 5, 600);
if (!$rate['allowed']) {
    record_audit_log($conn, $active_user_id, $active_username, 'WITHDRAWAL_RATE_LIMITED', ['ip' => $client_ip]);
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'Too many withdrawal attempts. Please wait before submitting another request.'
    ]);
    exit;
}

// 4. Validate Amount and Channel
if ($amount_val <= 0.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Withdrawal amount must be a positive number greater than zero.']);
    exit;
}

if (empty($method_val) || empty($target_account_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Target payment channel and transfer account number are required.']);
    exit;
}

// Minimum limit configuration
if ($amount_val < 50.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Minimum withdrawal limit per transaction is ৳50.00 Taka.']);
    exit;
}

if ($amount_val > 500000.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Maximum withdrawal limit per transaction is ৳500,000.00 Taka.']);
    exit;
}

// Target account sanitization
if (strlen($target_account_val) < 4 || strlen($target_account_val) > 100 || !preg_match('/^[a-zA-Z0-9_\-\.\s]+$/', $target_account_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Target account contains invalid characters or structure.']);
    exit;
}

try {
    $with_id = 'w_' . bin2hex(random_bytes(8));
    $pending_status = 'pending';

    // Start database transaction block
    $conn->beginTransaction();

    // Query active balance and status with row lock (FOR UPDATE) to prevent concurrent double spends
    $stmt_balance = $conn->prepare("SELECT balance, status FROM users WHERE id = ? FOR UPDATE");
    $stmt_balance->execute([$active_user_id]);
    $user_row = $stmt_balance->fetch();

    if (!$user_row) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User account identifier was not found in active listings.']);
        exit;
    }

    if ($user_row['status'] === 'blocked') {
        $conn->rollBack();
        record_audit_log($conn, $active_user_id, $active_username, 'WITHDRAWAL_BLOCKED_ACCOUNT_ATTEMPT', ['ip' => $client_ip]);
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Account is restricted from processing withdrawals. Contact support.']);
        exit;
    }

    $current_balance = (float)$user_row['balance'];

    // Screen for insufficient cash reserves
    if ($current_balance < $amount_val) {
        $conn->rollBack();
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => sprintf('Insufficient balance. Your active wallet contains ৳%s Taka, but you requested ৳%s Taka.', number_format($current_balance, 2), number_format($amount_val, 2))
        ]);
        exit;
    }

    // 1. Deduct balance from user entry safely
    $stmt_deduct = $conn->prepare("UPDATE users SET balance = balance - ?, totWithdraw = totWithdraw + ? WHERE id = ?");
    $stmt_deduct->execute([$amount_val, $amount_val, $active_user_id]);

    // 2. Commit payout entry listing with prepared arguments
    $stmt_log = $conn->prepare("
        INSERT INTO withdrawals (id, username, amount, method, targetAccount, status, date) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
    ");
    $stmt_log->execute([
        $with_id,
        $active_username,
        $amount_val,
        $method_val,
        $target_account_val,
        $pending_status
    ]);

    // Commit changes safely to storage
    $conn->commit();

    record_audit_log($conn, $active_user_id, $active_username, 'WITHDRAWAL_SUBMITTED', [
        'withdrawalId' => $with_id,
        'amount' => $amount_val,
        'method' => $method_val,
        'targetAccount' => $target_account_val,
        'remainingBalance' => ($current_balance - $amount_val),
        'ip' => $client_ip
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Withdrawal request compiled successfully! Funds have been deducted and are waiting for administrative release.',
        'withdrawalId' => $with_id,
        'amountField' => $amount_val,
        'remainingBalance' => ($current_balance - $amount_val),
        'status' => 'pending'
    ]);
    exit;

} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("Withdrawal ledger compilation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Unable to record withdrawal request. Please try again later.']);
    exit;
}
?>
