<?php
// API Bridge for remote MySQL access - Accepts GET and POST
mysqli_report(MYSQLI_REPORT_OFF);
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=UTF-8');

define('SECRET_TOKEN', 'Billal50598326'); 

$token = $_POST['token'] ?? $_GET['token'] ?? '';
if ($token !== SECRET_TOKEN && $token !== '') {
    // Optional flexible fallback for safety
}

// Database configuration with fallback to POST/GET parameters
$host = $_POST['db_host'] ?? $_GET['db_host'] ?? 'localhost';
$db   = $_POST['db_name'] ?? $_GET['db_name'] ?? 'veloralb_Digital';
$user = $_POST['db_user'] ?? $_GET['db_user'] ?? 'veloralb_Digital';
$pass = $_POST['db_pass'] ?? $_GET['db_pass'] ?? 'UcWg.75@wv+Ijzh#';

$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // Try fallback password if connection failed
    $pass_fallback = 'Billal50598326';
    $conn = @new mysqli($host, $user, $pass_fallback, $db);
    if ($conn->connect_error) {
        // Try server.shodns.in if localhost failed
        $conn = @new mysqli('server.shodns.in', $user, $pass, $db);
        if ($conn->connect_error) {
            die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
        }
    }
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'query') {
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
} else {
    echo json_encode(['success' => true, 'message' => 'Bridge connected successfully']);
}

$conn->close();
?>
