<?php
/**
 * Decoupled PHP Backend - Central Database Connection Configuration
 * 
 * Securely initializes PDO connection resources.
 * Sensitive credentials can be loaded from environment variables or local secure configurations.
 */

// Enable CORS securely for the designated frontend subdomain
$allowed_origin = "https://digital.yourdomain.com"; // Customized subdomain
$http_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Allow localhost for dev workflows
if (empty($http_origin) || strpos($http_origin, 'localhost') !== false || strpos($http_origin, '127.0.0.1') !== false) {
    header("Access-Control-Allow-Origin: " . ($http_origin ?: "*"));
} else {
    header("Access-Control-Allow-Origin: " . $allowed_origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Respond immediately to preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection constants
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'veloralb_Digital';
$db_user = getenv('DB_USER') ?: 'veloralb_Digital';
$db_pass = getenv('DB_PASS') ?: ''; // Set the password in secure production environment config

try {
    $conn = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    // Dynamic database auto-bootstrap (creates tables if missing)
    bootstrap_database($conn);

} catch (PDOException $e) {
    // Elegant JSON error response for robust client interpretation
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Secure Database Connectivity Error. Please verify server environment keys.",
        "technical" => $e->getMessage()
    ]);
    exit();
}

/**
 * Automates the creation of Digital Store database tables if they do not exist
 */
function bootstrap_database($conn) {
    try {
        // 1. Digital Categories table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            label VARCHAR(100) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 2. Digital Products table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_products (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            image VARCHAR(255),
            category VARCHAR(50),
            file_path VARCHAR(255),
            stars DECIMAL(2,1) DEFAULT 5.0,
            sales INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 3. Digital Orders table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_orders (
            id VARCHAR(50) NOT NULL,
            user_id INT NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            download_token VARCHAR(255) NOT NULL,
            download_count INT DEFAULT 0,
            max_downloads INT DEFAULT 5,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 4. Digital Wishlists table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_wishlists (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 5. Digital Reviews table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 6. Digital Support tickets table
        $conn->exec("CREATE TABLE IF NOT EXISTS digital_support (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            admin_reply TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 7. Seed initial catalog categories & products if completely empty
        $stmt = $conn->query("SELECT COUNT(*) FROM digital_categories");
        if ($stmt->fetchColumn() == 0) {
            $conn->exec("INSERT INTO digital_categories (id, name, label) VALUES
                ('web-templates', 'web-templates', '🌐 Web Templates'),
                ('sheets-trackers', 'sheets-trackers', '📊 Excel & Sheets'),
                ('design-assets', 'design-assets', '🎨 Design Assets'),
                ('ebooks-guides', 'ebooks-guides', '📚 Ebooks & Guides');");

            $conn->exec("INSERT INTO digital_products (id, title, description, price, image, category, file_path, stars, sales) VALUES
                ('prod-1', 'Premium Admin Dashboard WordPress Theme', 'A fully premium, high-speed dashboard theme featuring custom charts, responsive widgets, lottery manager modules, and advanced user roles management.', 450.00, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', 'web-templates', 'premium_admin_theme_v2.zip', 4.9, 128),
                ('prod-2', 'Elite Excel Automated Accounting Ledger', 'Advanced accounting sheet for automated ledger inputs, double-entry tracking, real-time profit and loss calculations, and bKash/Nagad reconciliation.', 180.00, 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80', 'sheets-trackers', 'elite_accounting_ledger_2026.xlsx', 4.8, 342),
                ('prod-3', 'Digital Agency Canva Templates Pack', '150+ ultra-high fidelity social media templates, posters, promotional banners, and branding materials custom-made for digital agents and recruiters.', 250.00, 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80', 'design-assets', 'agency_canva_templates.pdf', 4.7, 215),
                ('prod-4', 'PHP 8.3 Advanced bKash & Nagad Payment API Kit', 'The complete, secure integration code package for official bKash tokenized checkout and Nagad merchant APIs. Supports instant auto-credits.', 550.00, 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=400&q=80', 'web-templates', 'bkash_nagad_payment_kit_v1.2.zip', 5.0, 94);");
        }

    } catch (PDOException $e) {
        // Silently capture errors during bootstraps in development
    }
}
?>
