<?php
// API Bridge for remote MySQL access - Accepts GET and POST
// Set a secret token for security
define('SECRET_TOKEN', 'Billal50598326'); 

// Database configuration
$host = 'server.shodns.in';
$db   = 'veloralb_Digital';
$user = 'veloralb_Digital';
$pass = 'Billal50598326';

// টোকেন যাচাই করুন (GET বা POST উভয় থেকেই নেয়া যাবে)
$token = $_POST['token'] ?? $_GET['token'] ?? '';
if ($token !== SECRET_TOKEN) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// অ্যাকশন (GET বা POST থেকে)
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'query') {
    // এসকিউএল কুয়েরি (GET বা POST থেকে)
    $sql = $_POST['sql'] ?? $_GET['sql'] ?? '';
    
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
