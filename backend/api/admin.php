<?php
/**
 * Decoupled PHP API - Administration Operations Management
 * Location: /backend/api/admin.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Authorization security check
    $user_id = isset($data['userId']) ? intval($data['userId']) : (isset($_GET['userId']) ? intval($_GET['userId']) : 0);
    
    if ($user_id <= 0) {
        throw new Exception("Access Denied. Admin identity validation failed.");
    }

    // Verify if username is Admin in the user table
    $stmt = $conn->prepare("SELECT role, username FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user || (strtolower($user['username']) !== 'admin' && strtolower($user['role']) !== 'admin')) {
        http_response_code(403);
        throw new Exception("Access Denied. Unauthorized administration operations.");
    }

    $action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

    if (empty($action)) {
        throw new Exception("Missing administration action parameter.");
    }

    // 1. Fetch sales aggregate metrics
    if ($action === 'view_sales') {
        $orders_stmt = $conn->query("SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM digital_orders");
        $orders_stats = $orders_stmt->fetch();

        $support_stmt = $conn->query("SELECT COUNT(*) FROM digital_support WHERE status = 'open'");
        $open_support = $support_stmt->fetchColumn();

        $products_stmt = $conn->query("SELECT COUNT(*) FROM digital_products");
        $total_prods = $products_stmt->fetchColumn();

        echo json_encode([
            "success" => true,
            "stats" => [
                "totalOrders" => intval($orders_stats['total_orders']),
                "totalRevenue" => floatval($orders_stats['total_revenue']),
                "openTickets" => intval($open_support),
                "totalProducts" => intval($total_prods)
            ]
        ]);
        exit();
    }

    // 2. Add product endpoint
    if ($action === 'add_product') {
        if (empty($data['id']) || empty($data['title']) || empty($data['category']) || !isset($data['price'])) {
            throw new Exception("Malformed product specifications.");
        }

        $stmt = $conn->prepare("INSERT INTO digital_products (id, title, description, price, image, category, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            trim($data['id']),
            trim($data['title']),
            isset($data['description']) ? trim($data['description']) : '',
            floatval($data['price']),
            isset($data['image']) ? trim($data['image']) : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
            trim($data['category']),
            isset($data['filePath']) ? trim($data['filePath']) : 'asset.zip'
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Digital asset logged to catalog database."
        ]);
        exit();
    }

    // 3. Delete product endpoint
    if ($action === 'delete_product') {
        if (empty($data['productId'])) {
            throw new Exception("Missing product reference ID.");
        }

        $stmt = $conn->prepare("DELETE FROM digital_products WHERE id = ?");
        $stmt->execute([$data['productId']]);

        echo json_encode([
            "success" => true,
            "message" => "Product removed from active catalog."
        ]);
        exit();
    }

    // 4. Support Ticket Admin response reply
    if ($action === 'reply_support') {
        if (empty($data['ticketId']) || empty($data['reply'])) {
            throw new Exception("Missing ticket reference or response body.");
        }

        $stmt = $conn->prepare("UPDATE digital_support SET admin_reply = ?, status = 'replied' WHERE id = ?");
        $stmt->execute([trim($data['reply']), intval($data['ticketId'])]);

        echo json_encode([
            "success" => true,
            "message" => "Support response recorded and status updated."
        ]);
        exit();
    }

    throw new Exception("Unknown administration workflow request.");

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
