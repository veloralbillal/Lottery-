<?php
// API Bridge for remote MySQL access - POST ONLY
// Set a secret token for security
define('SECRET_TOKEN', 'my_app_secret_!@#_987'); 

// Database configuration (local to your server)
$host = 'localhost';
$db   = 'veloralb_Digital';
$user = 'veloralb_Digital'; // cPanel-এর ইউজারনেম
$pass = 'YOUR_CPANEL_DB_PASSWORD'; // cPanel-এর ডাটাবেজ পাসওয়ার্ড

// শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করুন
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'message' => 'Only POST requests are allowed']));
}

// টোকেন যাচাই করুন
if (!isset($_POST['token']) || $_POST['token'] !== SECRET_TOKEN) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$action = $_POST['action'] ?? '';

if ($action === 'query') {
    $sql = $_POST['sql'] ?? '';
    
    if (empty($sql)) {
        echo json_encode(['success' => false, 'message' => 'Empty query']);
    } else {
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
}

$conn->close();
?>
