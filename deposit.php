<?php
/**
 * Lottery Winner - Secure Deposit transaction Handler (deposit.php)
 * 
 * Takes financial deposit credentials (amount, provider method, transaction payload ID)
 * and records safe pending entries within the deposits database schema.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// Check user login session
if (!is_user_logged_in()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please sign in to submit deposit requests.']);
    exit;
}

// Assert POST requests
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

if ($amount_val <= 0.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Deposit amount must be a positive number greater than zero.']);
    exit;
}

if (empty($method_val) || empty($trx_id_val)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Payment processor channel and raw TrxId are required.']);
    exit;
}

// Restrict extremely high deposits to prevent overflow manipulation limiters
if ($amount_val > 500000.0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Maximum deposit limit per transaction is ৳500,000.00 Taka.']);
    exit;
}

try {
    // Audit active user details to ensure session integrity
    $active_username = $_SESSION['username'];
    $dep_uniq_id = 'd_' . bin2hex(random_bytes(8));
    $pending_status = 'pending';

    // Insert deposit row using absolute safe prepared statement parameters
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

    echo json_encode([
        'status' => 'success',
        'message' => 'Deposit request recorded. Funds will reflect in your balance upon admin verification.',
        'depositId' => $dep_uniq_id,
        'amount' => $amount_val,
        'status' => 'pending'
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Deposit ledger submission failure: ' . $e->getMessage()]);
    exit;
}
?>
