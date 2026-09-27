<?php
/**
 * Decoupled PHP API - Wishlist Management Endpoint
 * Location: /backend/api/wishlist.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (empty($_GET['userId'])) {
            throw new Exception("Missing user parameter.");
        }
        $user_id = intval($_GET['userId']);

        $stmt = $conn->prepare("SELECT product_id FROM digital_wishlists WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $items = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            "success" => true,
            "data" => $items
        ]);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['userId']) || empty($data['productId'])) {
            throw new Exception("Malformed wishlist details.");
        }

        $user_id = intval($data['userId']);
        $product_id = $data['productId'];

        // Check if already in wishlist
        $stmt = $conn->prepare("SELECT COUNT(*) FROM digital_wishlists WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        $exists = $stmt->fetchColumn() > 0;

        if ($exists) {
            // Remove
            $stmt_del = $conn->prepare("DELETE FROM digital_wishlists WHERE user_id = ? AND product_id = ?");
            $stmt_del->execute([$user_id, $product_id]);
            $action = 'removed';
        } else {
            // Add
            $stmt_add = $conn->prepare("INSERT INTO digital_wishlists (user_id, product_id) VALUES (?, ?)");
            $stmt_add->execute([$user_id, $product_id]);
            $action = 'added';
        }

        echo json_encode([
            "success" => true,
            "action" => $action
        ]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
