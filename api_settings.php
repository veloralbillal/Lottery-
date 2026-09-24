<?php
header('Content-Type: application/json');
require_once __DIR__ . '/src/config.php';
$php_settings = [];
try {
    $stmt_s = $conn->query("SELECT setting_key, setting_value FROM settings");
    while ($r = $stmt_s->fetch()) {
        $php_settings[$r['setting_key']] = $r['setting_value'];
    }
} catch (Exception $e) {}
echo json_encode($php_settings);
