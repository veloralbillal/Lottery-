<?php
/**
 * Decoupled PHP API - Secure Expiring File Streaming Service
 * Location: /backend/api/download.php
 */

require_once __DIR__ . '/../config/database.php';

try {
    if (empty($_GET['token'])) {
        throw new Exception("Access Denied. Secure download token is missing.");
    }

    $token = $_GET['token'];

    // 1. Look up purchase in digital_orders matching this token
    $stmt = $conn->prepare("SELECT * FROM digital_orders WHERE download_token = ? LIMIT 1");
    $stmt->execute([$token]);
    $order = $stmt->fetch();

    if (!$order) {
        throw new Exception("Unauthorized. The requested download token is invalid or has been revoked.");
    }

    // 2. Verify token expiration
    $expires = strtotime($order['expires_at']);
    if ($expires < time()) {
        throw new Exception("Access Expired. This download key expired on " . $order['expires_at']);
    }

    // 3. Verify download limit
    if ($order['download_count'] >= $order['max_downloads']) {
        throw new Exception("Limit Exceeded. You have reached the maximum allowed downloads ({$order['max_downloads']} pulls) for this purchase.");
    }

    // 4. Resolve file path inside non-public private storage directory
    $product_id = $order['product_id'];
    
    // Fetch product details to resolve secure filename
    $stmt_p = $conn->prepare("SELECT file_path FROM digital_products WHERE id = ?");
    $stmt_p->execute([$product_id]);
    $product = $stmt_p->fetch();
    
    $filename = $product ? $product['file_path'] : "digital_asset.zip";
    
    // Private storage root path
    $private_dir = pathinfo(__DIR__, PATHINFO_DIRNAME) . "/../private_storage/products/";
    if (!fs_mkdir_recursive($private_dir)) {
        throw new Exception("File system workspace permission restricted.");
    }

    $full_path = $private_dir . $filename;

    // 5. Increment download count securely
    $stmt_inc = $conn->prepare("UPDATE digital_orders SET download_count = download_count + 1 WHERE download_token = ?");
    $stmt_inc->execute([$token]);

    // 6. Check if file actually exists on disk, fallback to a secure text manifest stream for developer testing
    if (file_exists($full_path)) {
        // Stream official file securely
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($full_path) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($full_path));
        
        // Clean output buffers to prevent corruption
        if (ob_get_level()) {
            ob_end_clean();
        }
        flush();
        readfile($full_path);
        exit();
    } else {
        // High-fidelity Developer Demonstration/Testing stream fallback
        header('Content-Type: text/plain; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . str_replace(['.zip', '.xlsx', '.pdf'], '', $filename) . '_MANIFEST.txt"');
        
        echo "===============================================================\n";
        echo "LOTTERY WINNER ELITE DIGITAL PRODUCT HUB - SECURE STREAMING KEY\n";
        echo "===============================================================\n\n";
        echo "ORDER REFERENCE : " . $order['id'] . "\n";
        echo "PRODUCT ID      : " . $product_id . "\n";
        echo "PRODUCT TITLE   : " . $order['title'] . "\n";
        echo "DOWNLOAD SEED   : " . $order['download_token'] . "\n";
        echo "LIMIT COUNT     : " . ($order['download_count'] + 1) . " / " . $order['max_downloads'] . " pulls\n";
        echo "VALID UNTIL     : " . $order['expires_at'] . "\n\n";
        echo "---------------------------------------------------------------\n";
        echo "DEVELOPER TESTING MANIFEST NOTICE:\n";
        echo "This text file simulates your secure download payload.\n";
        echo "To serve physical zip/pdf attachments, place your files inside:\n";
        echo "{$private_dir}{$filename}\n";
        echo "---------------------------------------------------------------\n\n";
        echo "Thank you for purchasing! Secure digital transaction validated.\n";
        exit();
    }

} catch (Exception $e) {
    // Elegant user-facing HTML error panel for downloads instead of JSON
    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <title>Secure Digital Download Error</title>
        <script src='https://cdn.tailwindcss.com'></script>
    </head>
    <body class='bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6 font-sans'>
        <div class='max-w-md w-full bg-[#0f1424] border border-red-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl'>
            <div class='w-16 h-16 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center text-red-400 text-2xl mx-auto'>
                <i class='fa-solid fa-triangle-exclamation'></i>
            </div>
            <h1 class='text-lg font-black tracking-tight text-white uppercase'>Download Security Alert</h1>
            <p class='text-xs text-slate-400 leading-relaxed'>" . htmlspecialchars($e->getMessage()) . "</p>
            <div class='pt-2'>
                <button onclick='window.close();' class='bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-95'>Close Window</button>
            </div>
        </div>
        <script src='https://kit.fontawesome.com/b13a778ef2.js' crossorigin='anonymous'></script>
    </body>
    </html>";
}

/**
 * Helper to recursively create directories
 */
function fs_mkdir_recursive($path) {
    if (is_dir($path)) return true;
    return mkdir($path, 0755, true);
}
?>
