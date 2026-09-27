<?php
/**
 * Decoupled PHP API - Store Categories Listing Endpoint
 * Location: /backend/api/categories.php
 */

header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/database.php';

try {
    $stmt = $conn->query("SELECT * FROM digital_categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $categories
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load store categories.",
        "error" => $e->getMessage()
    ]);
}
?>
