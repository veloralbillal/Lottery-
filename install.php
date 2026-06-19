<?php
/**
 * Lottery Winner - Premium Mobile Web Portal
 * Database Installation Wizard (install.php)
 * 
 * This installer establishes connection with the MySQL database,
 * creates users, lottery pools, tickets, deposits, withdrawals, and settings tables,
 * and sets up the default administrator user.
 */

// Error reporting settings
error_reporting(E_ALL);
ini_set('display_errors', 1);

$installation_success = false;
$installation_error = null;
$logs = [];

// Handle database installation form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'install') {
    $db_host = isset($_POST['db_host']) ? trim($_POST['db_host']) : 'localhost';
    $db_port = isset($_POST['db_port']) ? trim($_POST['db_port']) : '3306';
    $db_name = isset($_POST['db_name']) ? trim($_POST['db_name']) : '';
    $db_user = isset($_POST['db_user']) ? trim($_POST['db_user']) : '';
    $db_pass = isset($_POST['db_pass']) ? $_POST['db_pass'] : '';

    if (empty($db_name) || empty($db_user)) {
        $installation_error = 'Database Name and Username are required fields.';
    } else {
        try {
            // Establish PDO Database Connection
            $dsn = "mysql:host=$db_host;port=$db_port;charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            $logs[] = ['status' => 'success', 'msg' => 'Successfully connected to database engine.'];

            // Create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$db_name`");
            $logs[] = ['status' => 'success', 'msg' => "Database `$db_name` verified/created successfully."];

            // Define table schemas
            $tables = [
                'users' => "CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(50) PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(150) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    phone VARCHAR(30) NULL,
                    dob DATE NULL,
                    balance DECIMAL(15, 2) DEFAULT 100.00,
                    totDeposit DECIMAL(15, 2) DEFAULT 0.00,
                    totWithdraw DECIMAL(15, 2) DEFAULT 0.00,
                    wins INT DEFAULT 0,
                    loss INT DEFAULT 0,
                    profit DECIMAL(15, 2) DEFAULT 0.00,
                    joinDate DATE DEFAULT CURRENT_DATE(),
                    status VARCHAR(30) DEFAULT 'active',
                    blockedUntil DATETIME NULL
                ) ENGINE=InnoDB;",

                'lotteries' => "CREATE TABLE IF NOT EXISTS lotteries (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    details TEXT NULL,
                    entryFee DECIMAL(15, 2) NOT NULL,
                    totalTickets INT NOT NULL,
                    soldTickets INT DEFAULT 0,
                    category VARCHAR(50) NOT NULL,
                    drawTime DATETIME NOT NULL,
                    status VARCHAR(30) DEFAULT 'active',
                    prizeAmount DECIMAL(15, 2) NOT NULL,
                    drawMode VARCHAR(50) DEFAULT 'manual',
                    drawDuration INT DEFAULT 10
                ) ENGINE=InnoDB;",

                'tickets' => "CREATE TABLE IF NOT EXISTS tickets (
                    id VARCHAR(50) PRIMARY KEY,
                    userId VARCHAR(50) NOT NULL,
                    lotteryId VARCHAR(50) NOT NULL,
                    code VARCHAR(50) NOT NULL,
                    purchaseDate DATETIME NOT NULL,
                    status VARCHAR(30) DEFAULT 'pending',
                    prizeAmount DECIMAL(15, 2) DEFAULT 0.00,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (lotteryId) REFERENCES lotteries(id) ON DELETE CASCADE
                ) ENGINE=InnoDB;",

                'deposits' => "CREATE TABLE IF NOT EXISTS deposits (
                    id VARCHAR(50) PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    amount DECIMAL(15, 2) NOT NULL,
                    method VARCHAR(50) NOT NULL,
                    trxId VARCHAR(100) NOT NULL,
                    status VARCHAR(30) DEFAULT 'pending',
                    date DATETIME NOT NULL
                ) ENGINE=InnoDB;",

                'withdrawals' => "CREATE TABLE IF NOT EXISTS withdrawals (
                    id VARCHAR(50) PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    amount DECIMAL(15, 2) NOT NULL,
                    method VARCHAR(50) NOT NULL,
                    targetAccount VARCHAR(100) NOT NULL,
                    status VARCHAR(30) DEFAULT 'pending',
                    date DATETIME NOT NULL
                ) ENGINE=InnoDB;",

                'settings' => "CREATE TABLE IF NOT EXISTS settings (
                    setting_key VARCHAR(100) PRIMARY KEY,
                    setting_value TEXT NULL
                ) ENGINE=InnoDB;"
            ];

            // Run schemas
            foreach ($tables as $name => $sql) {
                $pdo->exec($sql);
                $logs[] = ['status' => 'success', 'msg' => "Table structures verified/created: `$name`."];
            }

            // Create admin password hash
            $admin_username = 'Admin';
            $admin_password_raw = 'Admin123';
            $admin_password_hash = password_hash($admin_password_raw, PASSWORD_BCRYPT);

            // Insert admin user if not exists
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?)");
            $stmt->execute([$admin_username]);
            if ($stmt->fetchColumn() == 0) {
                $admin_id = 'u_admin_' . bin2hex(random_bytes(4));
                $stmt_insert = $pdo->prepare("INSERT INTO users (id, username, email, password, balance, status) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt_insert->execute([
                    $admin_id,
                    $admin_username,
                    'admin@lotterywinner.app',
                    $admin_password_hash,
                    55000.00,
                    'active'
                ]);
                $logs[] = ['status' => 'success', 'msg' => "Default Admin registered: User: `$admin_username` | Pass: `$admin_password_raw`"];
            } else {
                $logs[] = ['status' => 'info', 'msg' => 'Admin user already exists in table database rows.'];
            }

            // Create default lottery pools if table is empty
            $stmt_lots = $pdo->query("SELECT COUNT(*) FROM lotteries");
            if ($stmt_lots->fetchColumn() == 0) {
                $default_pools = [
                    [
                        'id' => 'l1',
                        'name' => '⚡ 10-Taka Fast Cash Daily',
                        'details' => 'Buy tickets for only 10 Taka and win massive rewards instantly! Grand Prize is 500 Taka.',
                        'entryFee' => 10.00,
                        'totalTickets' => 1000,
                        'soldTickets' => 684,
                        'category' => '10 Taka Banner',
                        'drawTime' => date('Y-m-d H:i:s', strtotime('+45 minutes')),
                        'status' => 'active',
                        'prizeAmount' => 500.00
                    ],
                    [
                        'id' => 'l2',
                        'name' => '💎 20-Taka Premium Super Pool',
                        'details' => 'Exclusive 20 Taka lottery with active multipliers. First place gets an incredible 1200 Taka!',
                        'entryFee' => 20.00,
                        'totalTickets' => 500,
                        'soldTickets' => 412,
                        'category' => '20 Taka Banner',
                        'drawTime' => date('Y-m-d H:i:s', strtotime('+2 hours')),
                        'status' => 'active',
                        'prizeAmount' => 1200.00
                    ],
                    [
                        'id' => 'l3',
                        'name' => '👑 50-Taka Mega Event Jackpot',
                        'details' => 'A legendary pool for highest payouts! Ticket price is 50 Taka. Prize is 5000 Taka.',
                        'entryFee' => 50.00,
                        'totalTickets' => 200,
                        'soldTickets' => 85,
                        'category' => 'Mega Jackpot',
                        'drawTime' => date('Y-m-d H:i:s', strtotime('+1 day')),
                        'status' => 'active',
                        'prizeAmount' => 5000.00
                    ]
                ];

                $stmt_ins_lot = $pdo->prepare("INSERT INTO lotteries (id, name, details, entryFee, totalTickets, soldTickets, category, drawTime, status, prizeAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($default_pools as $p) {
                    $stmt_ins_lot->execute([
                        $p['id'], $p['name'], $p['details'], $p['entryFee'], $p['totalTickets'], $p['soldTickets'], $p['category'], $p['drawTime'], $p['status'], $p['prizeAmount']
                    ]);
                }
                $logs[] = ['status' => 'success', 'msg' => 'Seeded active lottery pool structures dynamically.'];
            }

            // Create default settings if table empty
            $stmt_sets = $pdo->query("SELECT COUNT(*) FROM settings");
            if ($stmt_sets->fetchColumn() == 0) {
                $default_settings = [
                    'mobileAgentBkash' => '01799228833',
                    'mobileAgentNagad' => '01855221144',
                    'mobileAgentRocket' => '01688554422',
                    'mobileAgentUpay' => '01922334455',
                    'dbblDetails' => 'Rocket Wallet Agent route system. Input account numbers directly.',
                    'cryptoAddress' => 'TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X',
                    'maintenanceMode' => '0',
                    'maintenanceMessage' => 'Internal server hardware upgrade and database syncing in progress. Please try again soon.',
                    'appVersion' => '5.2.0',
                    'forceUpdateLink' => 'https://example.com/download/LotteryWinner_v5.2.apk',
                    'adminPass' => 'Admin123'
                ];

                $stmt_ins_set = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)");
                foreach ($default_settings as $key => $val) {
                    $stmt_ins_set->execute([$key, $val]);
                }
                $logs[] = ['status' => 'success', 'msg' => 'Committed basic core maintenance configurations.'];
            }

            // Create config.php file with database options in same folder for easy usage
            $config_content = "<?php\n" .
                "// Database Configuration Parameters\n" .
                "define('DB_HOST', " . var_export($db_host, true) . ");\n" .
                "define('DB_PORT', " . var_export($db_port, true) . ");\n" .
                "define('DB_NAME', " . var_export($db_name, true) . ");\n" .
                "define('DB_USER', " . var_export($db_user, true) . ");\n" .
                "define('DB_PASS', " . var_export($db_pass, true) . ");\n\n" .
                "try {\n" .
                "    \$conn = new PDO('mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [\n" .
                "        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n" .
                "        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC\n" .
                "    ]);\n" .
                "} catch (PDOException \$e) {\n" .
                "    die('Database Connection Failed: ' . \$e->getMessage());\n" .
                "}\n";

            @file_put_contents(__DIR__ . '/config.php', $config_content);
            $logs[] = ['status' => 'success', 'msg' => 'Generated standalone connection bundle config: `config.php` successfully!'];

            $installation_success = true;

        } catch (PDOException $e) {
            $installation_error = 'PDO Connection Failed: ' . $e->getMessage();
            $logs[] = ['status' => 'error', 'msg' => 'Process halted at SQL error exception.'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup Wizard - Lottery Winner</title>
    <!-- Outfit & Inter Fonts plus Tailwind -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #030712;
        }
    </style>
</head>
<body class="text-slate-100 antialiased min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
    <!-- Ambient backdrops -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-4">
        <div class="inline-flex w-14 h-14 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-2xl items-center justify-center shadow-xl ring-1 ring-white/10">
            <i class="fa-solid fa-database text-white text-2xl"></i>
        </div>
        <h2 class="text-xl font-black font-display uppercase tracking-wide text-white">Database Installation Wizard</h2>
        <p class="text-xs text-slate-400 font-mono">Lottery Winner - Mobile Live Portal Core Engine</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            
            <?php if ($installation_success): ?>
                <!-- SUCCESS STATE -->
                <div class="space-y-6">
                    <div class="text-center space-y-2">
                        <div class="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-2">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 class="text-lg font-bold text-white uppercase tracking-tight font-display">Setup Successful!</h3>
                        <p class="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">The SQL structures have been configured successfully. All tables are generated correctly with starting parameters.</p>
                    </div>

                    <!-- Database Schema Log -->
                    <div class="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 space-y-2 max-h-48 overflow-y-auto scrollbar-none font-mono text-[11px] text-slate-400">
                        <span class="text-[10px] text-slate-600 uppercase font-bold block pb-1 border-b border-slate-900">Execution Log Logs</span>
                        <?php foreach ($logs as $log): ?>
                            <div class="flex items-start gap-2">
                                <span class="<?php echo $log['status'] === 'success' ? 'text-emerald-400' : 'text-cyan-400'; ?> font-bold">●</span>
                                <span><?php echo htmlspecialchars($log['msg']); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Administrator Credentials Card -->
                    <div class="bg-gradient-to-r from-red-950/20 to-rose-950/20 border border-red-500/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
                        <div class="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Default Administrator Profile</div>
                        <div class="grid grid-cols-2 gap-2 border-t border-red-900/10 pt-2.5">
                            <div>
                                <span class="text-slate-500 block text-[10px]">Admin Username:</span>
                                <span class="text-white font-bold block mt-0.5">Admin</span>
                            </div>
                            <div>
                                <span class="text-slate-500 block text-[10px]">Admin Password:</span>
                                <span class="text-emerald-400 font-bold block mt-0.5">Admin123</span>
                            </div>
                        </div>
                    </div>

                    <div class="text-center pt-2">
                        <span class="text-[9px] text-slate-600 block mb-3 font-mono">* Please delete this install.php script file from host root to guard directories.</span>
                        <a href="index.html" class="inline-flex w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs py-3.5 rounded-xl items-center justify-center gap-2 transition hover:scale-[1.01] active:opacity-90">
                            Enter Portal Frontside
                        </a>
                    </div>
                </div>

            <?php else: ?>
                <!-- FORM STATE -->
                <form action="install.php" method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="install">

                    <?php if ($installation_error): ?>
                        <div class="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-xs text-rose-400 leading-normal">
                            <i class="fa-solid fa-triangle-exclamation text-rose-400 text-base shrink-0"></i>
                            <div><?php echo htmlspecialchars($installation_error); ?></div>
                        </div>
                    <?php endif; ?>

                    <div class="grid grid-cols-3 gap-3 text-xs">
                        <div class="col-span-2 space-y-1.5">
                            <label class="block uppercase font-mono text-slate-500">MySQL DB Host / IP Address</label>
                            <input type="text" name="db_host" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono placeholder-slate-700" placeholder="127.0.0.1" value="localhost">
                        </div>
                        <div class="space-y-1.5">
                            <label class="block uppercase font-mono text-slate-500">Port</label>
                            <input type="text" name="db_port" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono" placeholder="3306" value="3306">
                        </div>
                    </div>

                    <div class="space-y-1.5 text-xs">
                        <label class="block uppercase font-mono text-slate-500">Database Engine Name</label>
                        <input type="text" name="db_name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono placeholder-slate-700" placeholder="lottery_winner_db" value="lottery_winner_db">
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div class="space-y-1.5">
                            <label class="block uppercase font-mono text-slate-500">Database User</label>
                            <input type="text" name="db_user" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono placeholder-slate-700" placeholder="root" value="root">
                        </div>
                        <div class="space-y-1.5">
                            <label class="block uppercase font-mono text-slate-500">User Passphrase</label>
                            <input type="password" name="db_pass" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono placeholder-slate-700" placeholder="••••••••">
                        </div>
                    </div>

                    <div class="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/40 text-[10px] text-slate-500 leading-normal space-y-1 font-mono">
                        <div><strong class="text-slate-400">Database Verification Mode:</strong> Attempts to auto-create standard database if absent from schema targets.</div>
                        <div><strong class="text-rose-400">Admin Initialization:</strong> Sets up login ID <span class="text-white font-bold">Admin</span> with password <span class="text-white font-bold">Admin123</span> automatically.</div>
                    </div>

                    <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.01] text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition active:opacity-90">
                        Setup SQL Database Structures
                    </button>
                </form>
            <?php endif; ?>

        </div>
    </div>

    <!-- Footer copyright info -->
    <div class="mt-8 text-center text-[10px] text-slate-600 font-mono leading-relaxed z-10">
        <p>© 2026 Lottery Winner Mobile Ltd.</p>
        <p class="text-slate-700">All data tables are verified on transaction safe InnoDB architectures.</p>
    </div>
</body>
</html>
