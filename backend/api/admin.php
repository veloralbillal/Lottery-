<?php
/**
 * Decoupled PHP API - Administration Operations Management
 * Location: /backend/api/admin.php
 * 
 * Hardened to verify server-side session authentication / admin privileges,
 * eliminating broken object-level authorization vulnerabilities.
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

// Start session if not already active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];

    // 1. Strict Server-Side Admin Authorization Check
    $is_authorized_admin = false;
    $admin_actor = 'UNKNOWN';

    // Check active session credentials
    if (!empty($_SESSION['user_id'])) {
        $sess_user_id = $_SESSION['user_id'];
        $stmt_admin = $conn->prepare("SELECT id, role, username, status FROM users WHERE id = ?");
        $stmt_admin->execute([$sess_user_id]);
        $user = $stmt_admin->fetch();

        if ($user && $user['status'] !== 'blocked') {
            if (strtolower($user['username']) === 'admin' || strtolower($user['role'] ?? '') === 'admin') {
                $is_authorized_admin = true;
                $admin_actor = $user['username'];
            }
        }
    }

    // Check Bearer / Secret API Token for server-to-server calls
    if (!$is_authorized_admin) {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = '';
        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            $token = trim($matches[1]);
        }
        $secret_key = getenv('ADMIN_API_SECRET') ?: 'Billal50598326';
        if (!empty($token) && hash_equals($secret_key, $token)) {
            $is_authorized_admin = true;
            $admin_actor = 'API_TOKEN_CLIENT';
        }
    }

    if (!$is_authorized_admin) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access Denied. Administrative session authentication is strictly required."
        ]);
        exit();
    }

    $action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

    if (empty($action)) {
        throw new Exception("Missing administration action parameter.");
    }

    // 1. Fetch sales aggregate metrics
    if ($action === 'view_sales') {
        $orders_stmt = $conn->query("SELECT COUNT(*) as total_orders, COALESCE(SUM(amount), 0) as total_revenue FROM digital_orders");
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
            isset($data['filePath']) ? basename(trim($data['filePath'])) : 'asset.zip'
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
