<?php
/**
 * Decoupled PHP API - Customer Helpdesk Tickets Endpoint
 * Location: /backend/api/support.php
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

        $stmt = $conn->prepare("SELECT * FROM digital_support WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $tickets = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "data" => $tickets
        ]);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['userId']) || empty($data['subject']) || empty($data['message'])) {
            throw new Exception("Subject and ticket description message details are required.");
        }

        $user_id = intval($data['userId']);
        $subject = trim($data['subject']);
        $message = trim($data['message']);

        // Insert ticket
        $stmt = $conn->prepare("INSERT INTO digital_support (user_id, subject, message) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $subject, $message]);

        echo json_encode([
            "success" => true,
            "message" => "Support request received. Customer agents will review."
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
