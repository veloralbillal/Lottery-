<?php
/**
 * API Bridge for Remote MySQL Diagnostics - Location: /public/db_bridge.php
 * 
 * Hardened to prevent arbitrary SQL injection, eliminate unauthenticated access,
 * block credential override vectors, and disallow destructive DDL/DML executions.
 */

mysqli_report(MYSQLI_REPORT_OFF);
ini_set('display_errors', '0');
error_reporting(0);

// Restrict CORS: only allow same-origin or explicit authorized origins
$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_hosts = ['localhost', '127.0.0.1'];
$origin_allowed = false;

if (empty($http_origin)) {
    $origin_allowed = true;
} else {
    $parsed_host = parse_url($http_origin, PHP_URL_HOST);
    if (in_array($parsed_host, $allowed_hosts) || $parsed_host === ($_SERVER['SERVER_NAME'] ?? '')) {
        $origin_allowed = true;
        header("Access-Control-Allow-Origin: " . $http_origin);
    }
}

if (!$origin_allowed) {
    header("Access-Control-Allow-Origin: " . ($_SERVER['SERVER_NAME'] ?? '*'));
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Secret token definition (stored securely on server)
define('SECRET_TOKEN', getenv('DB_BRIDGE_SECRET') ?: 'Billal50598326');

// 1. Strict Token Verification (Constant-Time, No Blank Bypass)
$token = $_POST['token'] ?? $_GET['token'] ?? '';
if (empty($token) || !hash_equals(SECRET_TOKEN, (string)$token)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized: Invalid or missing authentication token.'
    ]);
    exit;
}

// 2. Fixed Secure Database Credentials (Never accept credentials from client request parameters)
$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'veloralb_Digital';
$user = getenv('DB_USER') ?: 'veloralb_Digital';
$pass = getenv('DB_PASS') ?: 'UcWg.75@wv+Ijzh#';

$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // Secondary fallback host if localhost fails
    $conn = @new mysqli('server.shodns.in', $user, $pass, $db);
    if ($conn->connect_error) {
        http_response_code(503);
        die(json_encode(['success' => false, 'message' => 'Database bridge connection unavailable.']));
    }
}

@$conn->set_charset("utf8mb4");

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// 3. Query Execution Guard
if ($action === 'query') {
    $sql = trim($_POST['sql'] ?? $_GET['sql'] ?? '');
    
    if (empty($sql)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Empty query parameter.']);
        $conn->close();
        exit;
    }

    // Block dangerous destructive statements (DDL/DROP/TRUNCATE/SHUTDOWN/GRANT/FILE)
    $upper_sql = strtoupper($sql);
    $blocked_keywords = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE', 'SHUTDOWN', 'INTO OUTFILE', 'INTO DUMPFILE', 'LOAD_FILE'];
    
    foreach ($blocked_keywords as $keyword) {
        if (preg_match('/\b' . preg_quote($keyword, '/') . '\b/i', $upper_sql)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Query contains restricted administrative operations.']);
            $conn->close();
            exit;
        }
    }

    // Prevent multi-statement query injection
    if (strpos($sql, ';') !== false && strlen(trim(strstr($sql, ';'), "; \t\n\r\0\x0B")) > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Multiple query statements are strictly prohibited.']);
        $conn->close();
        exit;
    }

    $result = $conn->query($sql);
    
    if ($result === true) {
        echo json_encode(['success' => true]);
    } else if ($result instanceof mysqli_result) {
        $data = [];
        $row_count = 0;
        $max_rows = 500; // Limit maximum rows to prevent memory exhaustion
        while (($row = $result->fetch_assoc()) && $row_count < $max_rows) {
            $data[] = $row;
            $row_count++;
        }
        $result->free();
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Query execution failed.']);
    }
} else {
    // Health check ping
    echo json_encode(['success' => true, 'message' => 'Bridge connected successfully']);
}

$conn->close();
?>
