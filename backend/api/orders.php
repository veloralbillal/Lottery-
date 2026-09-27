<?php
/**
 * Decoupled PHP API - User Digital Purchases Ledger
 * Location: /backend/api/orders.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    if (empty($_GET['userId'])) {
        throw new Exception("Buyer identity verification failed. Missing user parameter.");
    }

    $user_id = intval($_GET['userId']);

    $stmt = $conn->prepare("SELECT * FROM digital_orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $orders
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
