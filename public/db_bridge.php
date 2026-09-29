<?php
// API Bridge for remote MySQL access
// Set a secret token for security
define('SECRET_TOKEN', 'YOUR_VERY_SECRET_TOKEN_HERE');

// Database configuration (local to your server)
$host = 'localhost';
$db   = 'veloralb_Digital';
$user = 'veloralb_Digital';
$pass = 'YOUR_DB_PASSWORD_HERE';

if (!isset($_GET['token']) || $_GET['token'] !== SECRET_TOKEN) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$action = $_GET['action'] ?? '';

if ($action === 'query') {
    $sql = $_POST['sql'] ?? '';
    $result = $conn->query($sql);
    
    if ($result === true) {
        echo json_encode(['success' => true]);
    } else if ($result) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}

$conn->close();
?>
