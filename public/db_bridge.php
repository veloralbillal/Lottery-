<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// !!! Notun password / key boshao (purano gulo leak hoyeche) !!!
$ENV = [
    'DB_HOST'    => 'localhost',
    'DB_NAME'    => 'veloralb_lottery',
    'DB_USER'    => 'veloralb_billal',
    'DB_PASS'    => 'Z3[9T*x39URzna',
    'BRIDGE_KEY' => 'Billal2026@bd',
    // CORS: ['*'] mane jekono site theke call kora jabe (key lagbe).
    // Nirapod korte nijer panel domain dao: ['https://panel.yourdomain.com']
    'ALLOWED_ORIGINS' => ['*'],
];

function respond(int $code, array $data): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    // terminal "success" ar "ok" duita-i bujhte pare
    if (!isset($data['success'])) {
        $data['success'] = (bool) ($data['ok'] ?? false);
    }
    if (isset($data['error']) && !isset($data['message'])) {
        $data['message'] = $data['error'];
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function get_header_value(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (!empty($_SERVER[$key])) {
        return (string) $_SERVER[$key];
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp((string) $k, $name) === 0) {
                return (string) $v;
            }
        }
    }
    return '';
}

set_exception_handler(function (Throwable $e): void {
    error_log('[bridge] ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Internal server error']);
});

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header_remove('X-Powered-By');

// ---------- CORS ----------
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $ENV['ALLOWED_ORIGINS'];
if (in_array('*', $allowed, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin !== '' && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, X-Bridge-Key, Authorization');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Max-Age: 86400');

$method = $_SERVER['REQUEST_METHOD'] ?? '';

// Preflight
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// GET ?ping=1 (key lagbe na, kono data dey na)
if ($method === 'GET') {
    if (isset($_GET['ping'])) {
        respond(200, ['ok' => true, 'status' => 200, 'pong' => true, 'time' => date('c')]);
    }
    respond(405, ['ok' => false, 'error' => 'Use POST request with JSON body']);
}
if ($method !== 'POST') {
    header('Allow: POST, GET, OPTIONS');
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

// ---------- Body ----------
$raw = file_get_contents('php://input', false, null, 0, 262144);
$in  = json_decode((string) $raw, true);
if (!is_array($in)) {
    respond(400, ['ok' => false, 'error' => 'Invalid JSON']);
}

// ---------- Auth: header ba body token ----------
$provided = get_header_value('X-Bridge-Key');
if ($provided === '') {
    $auth = get_header_value('Authorization');
    if (stripos($auth, 'Bearer ') === 0) {
        $provided = trim(substr($auth, 7));
    }
}
if ($provided === '') {
    $provided = (string) ($in['token'] ?? '');
}
if ($provided === '' || !hash_equals($ENV['BRIDGE_KEY'], $provided)) {
    respond(401, ['ok' => false, 'error' => 'Unauthorized']);
}

$action = $in['action'] ?? '';

// data: {"data":{"sql":..}} ba top-level {"sql":..} duita-i cholbe
$data = is_array($in['data'] ?? null) ? $in['data'] : [];
foreach (['sql', 'params'] as $k) {
    if (!isset($data[$k]) && isset($in[$k])) {
        $data[$k] = $in[$k];
    }
}

if ($action === 'ping') {
    respond(200, ['ok' => true, 'pong' => true, 'time' => date('c')]);
}

// ---------- DB ----------
try {
    $pdo = new PDO(
        "mysql:host={$ENV['DB_HOST']};dbname={$ENV['DB_NAME']};charset=utf8mb4",
        $ENV['DB_USER'],
        $ENV['DB_PASS'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ]
    );
} catch (PDOException $e) {
    error_log('[bridge] DB connect: ' . $e->getMessage());
    respond(503, ['ok' => false, 'error' => 'Database connection failed']);
}

function first_keyword(string $sql): string
{
    $sql = ltrim($sql);
    return strtoupper(strtok($sql, " \t\r\n(") ?: '');
}

$actions = [
    // Read-only
    'query' => function (PDO $pdo, array $d): array {
        $sql = trim((string) ($d['sql'] ?? ''));
        $params = is_array($d['params'] ?? null) ? $d['params'] : [];
        if ($sql === '') {
            throw new InvalidArgumentException('Missing sql');
        }
        if (!in_array(first_keyword($sql), ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'], true)) {
            throw new InvalidArgumentException('Only SELECT/SHOW/DESCRIBE/EXPLAIN allowed in query');
        }
        $st = $pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    },

    // Write (DROP/TRUNCATE/ALTER block)
    'execute' => function (PDO $pdo, array $d): array {
        $sql = trim((string) ($d['sql'] ?? ''));
        $params = is_array($d['params'] ?? null) ? $d['params'] : [];
        if ($sql === '') {
            throw new InvalidArgumentException('Missing sql');
        }
        if (!in_array(first_keyword($sql), ['INSERT', 'UPDATE', 'DELETE', 'REPLACE'], true)) {
            throw new InvalidArgumentException('Only INSERT/UPDATE/DELETE allowed in execute');
        }
        $st = $pdo->prepare($sql);
        $st->execute($params);
        return ['affected_rows' => $st->rowCount(), 'last_insert_id' => $pdo->lastInsertId()];
    },
];

if (!is_string($action) || !isset($actions[$action])) {
    respond(400, ['ok' => false, 'error' => 'Unknown action']);
}

try {
    respond(200, ['ok' => true, 'data' => $actions[$action]($pdo, $data)]);
} catch (InvalidArgumentException $e) {
    respond(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    error_log('[bridge] SQL: ' . $e->getMessage());
    respond(400, ['ok' => false, 'error' => 'Query failed']);
}
