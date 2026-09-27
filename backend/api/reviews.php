<?php
/**
 * Decoupled PHP API - Customer Reviews Endpoint
 * Location: /backend/api/reviews.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (empty($_GET['productId'])) {
            throw new Exception("Missing product reference ID.");
        }
        $product_id = $_GET['productId'];

        $stmt = $conn->prepare("SELECT r.*, u.username FROM digital_reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
        $stmt->execute([$product_id]);
        $reviews = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "data" => $reviews
        ]);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['userId']) || empty($data['productId']) || empty($data['rating'])) {
            throw new Exception("Malformed review details submitted.");
        }

        $user_id = intval($data['userId']);
        $product_id = $data['productId'];
        $rating = intval($data['rating']);
        $comment = isset($data['comment']) ? trim($data['comment']) : '';

        // Insert review
        $stmt = $conn->prepare("INSERT INTO digital_reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $product_id, $rating, $comment]);

        // Recompute stars average on digital_products
        $stmt_avg = $conn->prepare("SELECT AVG(rating) FROM digital_reviews WHERE product_id = ?");
        $stmt_avg->execute([$product_id]);
        $avg = floatval($stmt_avg->fetchColumn());

        if ($avg > 0) {
            $stmt_up = $conn->prepare("UPDATE digital_products SET stars = ? WHERE id = ?");
            $stmt_up->execute([$avg, $product_id]);
        }

        echo json_encode([
            "success" => true,
            "message" => "Review and rating recorded successfully."
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
