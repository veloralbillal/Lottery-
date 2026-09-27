<?php
/**
 * Decoupled PHP API - Products Listing Endpoint
 * Location: /backend/api/products.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    $query = "SELECT * FROM digital_products WHERE 1=1";
    $params = [];

    if (!empty($category) && $category !== 'all') {
        $query .= " AND category = :category";
        $params['category'] = $category;
    }

    if (!empty($search)) {
        $query .= " AND (title LIKE :search OR description LIKE :search)";
        $params['search'] = "%{$search}%";
    }

    $query .= " ORDER BY stars DESC, sales DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $products
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load product catalog from server.",
        "error" => $e->getMessage()
    ]);
}
?>
