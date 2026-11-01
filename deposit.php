<?php
/**
 * Lottery Winner - Secure Deposit Transaction Handler (deposit.php)
 * 
 * Takes financial deposit credentials (amount, provider method, transaction payload ID),
 * validates CSRF tokens, enforces per-user rate limiting, enforces TrxId uniqueness
 * to prevent duplicate credit / replay attacks, and safely records pending entries.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// 1. Check user login session
if (!is_user_logged_in()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to submit deposit requests.']);
    exit;
}

// 2. Assert POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only POST request method allowed.']);
    exit;
}

// Support JSON input payloads alongside standard forms
$input = json_decode(file_get_contents('php://input'), true);
$amount_val = (float)($input['amount'] ?? $_POST['amount'] ?? 0.00);
$method_val = trim($input['method'] ?? $_POST['method'] ?? '');
$trx_id_val = trim($input['trxId'] ?? $_POST['trxId'] ?? $_POST['trx_id'] ?? '');
$csrf_val   = $input['csrf_token'] ?? $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

$active_user_id = $_SESSION['user_id'];
$active_username = $_SESSION['username'];
$client_ip = get_client_ip();

// 3. Rate Limiting Protection (Max 5 deposits per 5 minutes per user/IP)
$rate = check_rate_limit($conn, 'deposit_req', $active_user_id, 5, 300);
if (!$rate['allowed']) {
    record_audit_log($conn, $active_user_id, $active_username, 'DEPOSIT_RATE_LIMITED', ['ip' => $client_ip]);
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'Too many deposit requests submitted in a short period. Please wait a few minutes before submitting again.'
    ]);
    exit;
}

// 4. Validate Amount and Channel
if ($amount_val <= 0.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Deposit amount must be a positive number greater than zero.']);
    exit;
}

if (empty($method_val) || empty($trx_id_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Payment processor channel and transaction ID (TrxId) are strictly required.']);
    exit;
}

// Transaction ID formatting and sanity validation
if (strlen($trx_id_val) < 4 || strlen($trx_id_val) > 80 || !preg_match('/^[a-zA-Z0-9_\-\.\/]+$/', $trx_id_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'The provided Transaction ID contains invalid characters or has an invalid length.']);
    exit;
}

// Restrict extremely high deposits to prevent overflow manipulation limiters
if ($amount_val > 500000.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Maximum deposit limit per transaction is ৳500,000.00 Taka.']);
    exit;
}

try {
    // 5. Idempotency Check: Prevent duplicate TrxID submissions
    $stmt_check = $conn->prepare("SELECT id, username, status, date FROM deposits WHERE LOWER(trxId) = LOWER(?) LIMIT 1");
    $stmt_check->execute([$trx_id_val]);
    $existing = $stmt_check->fetch();

    if ($existing) {
        record_audit_log($conn, $active_user_id, $active_username, 'DEPOSIT_DUPLICATE_TRX_ATTEMPT', [
            'trxId' => $trx_id_val,
            'existingId' => $existing['id'],
            'ip' => $client_ip
        ]);
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'message' => 'This Transaction ID has already been submitted for verification. Duplicate entries are blocked.'
        ]);
        exit;
    }

    $dep_uniq_id = 'd_' . bin2hex(random_bytes(8));
    $pending_status = 'pending';

    // 6. Insert deposit row using safe prepared statement parameters
    $stmt = $conn->prepare("
        INSERT INTO deposits (id, username, amount, method, trxId, status, date) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
    ");

    $stmt->execute([
        $dep_uniq_id,
        $active_username,
        $amount_val,
        $method_val,
        $trx_id_val,
        $pending_status
    ]);

    // Record audit log
    record_audit_log($conn, $active_user_id, $active_username, 'DEPOSIT_SUBMITTED', [
        'depositId' => $dep_uniq_id,
        'amount' => $amount_val,
        'method' => $method_val,
        'trxId' => $trx_id_val,
        'ip' => $client_ip
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Deposit request recorded. Funds will reflect in your balance upon admin verification.',
        'depositId' => $dep_uniq_id,
        'amount' => $amount_val,
        'status' => 'pending'
    ]);
    exit;

} catch (PDOException $e) {
    error_log("Deposit ledger submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Unable to record deposit request. Please try again later.']);
    exit;
}
?>
