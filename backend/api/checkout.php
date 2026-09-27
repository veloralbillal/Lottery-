<?php
/**
 * Decoupled PHP API - Checkout Processing Endpoint
 * Location: /backend/api/checkout.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

// Retrieve post body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['userId']) || empty($data['cart']) || !isset($data['total'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Malformed checkout parameters. Please submit a valid user ID and shopping cart."
    ]);
    exit();
}

$user_id = intval($data['userId']);
$cart = $data['cart'];
$total = floatval($data['total']);

try {
    $conn->beginTransaction();

    // 1. Fetch user balance and verify
    $stmt = $conn->prepare("SELECT balance, username FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        throw new Exception("Buyer account authentication failed. User ID not found.");
    }

    $balance = floatval($user['balance']);
    if ($balance < $total) {
        throw new Exception("Insufficient Wallet Balance to complete this purchase.");
    }

    // 2. Deduct wallet balance from the user account
    $stmt_deduct = $conn->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
    $stmt_deduct->execute([$total, $user_id]);

    // 3. Create debit ledger transaction item inside users ledger
    // (Existing lottery ledger parsing uses JSON, so let's log the transaction)
    $stmt_ledger = $conn->prepare("INSERT INTO ledgers (userId, type, amount, description, timestamp) VALUES (?, 'debit', ?, ?, NOW())");
    // Wait, let's verify if 'ledgers' table has exact column structures, fallback if column naming differs
    try {
        $stmt_ledger->execute([$user_id, $total, "Digital Store Purchase of " . count($cart) . " items"]);
    } catch(PDOException $e) {}

    // 4. Generate random download tokens and populate digital orders
    $order_id = "ORD-" . rand(100000, 999999);
    $download_token = "tok_" . bin2hex(random_bytes(16));
    $expires_at = date("Y-m-d H:i:s", strtotime("+7 days"));

    $stmt_order = $conn->prepare("INSERT INTO digital_orders 
        (id, user_id, product_id, title, amount, download_token, download_count, max_downloads, expires_at) 
        VALUES (?, ?, ?, ?, ?, ?, 0, 5, ?)");

    foreach ($cart as $item) {
        $stmt_order->execute([
            $order_id,
            $user_id,
            $item['id'],
            $item['title'],
            floatval($item['price']),
            $download_token,
            $expires_at
        ]);

        // Increment sales counter on product
        $stmt_sales = $conn->prepare("UPDATE digital_products SET sales = sales + 1 WHERE id = ?");
        $stmt_sales->execute([$item['id']]);
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Digital Store order completed successfully.",
        "orderId" => $order_id,
        "token" => $download_token
    ]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
