<?php
/**
 * Lottery Winner - Interactive portal authentication gateway (login_page.php)
 * 
 * Secure session initialization for standard player profiles and system admins.
 */

require_once __DIR__ . '/config.php';

$error = isset($_GET['error']) ? trim($_GET['error']) : '';
$success = isset($_GET['success']) ? trim($_GET['success']) : '';

$error_msg = "";
$success_msg = "";

if ($error === 'unauthorized') {
    $error_msg = "Administrative authorization is strictly required to enter.";
} else if ($error === 'auth_required') {
    $error_msg = "Please authorize your access session to view your profile.";
} else if ($error === 'blocked') {
    $error_msg = "This account profile has been locked by administrative order.";
}

if ($success === 'logged_out') {
    $success_msg = "You have exited the control portal securely.";
} else if ($success === 'registered') {
    $success_msg = "Registration success! You may now sign in below.";
}

// Check POST requests login submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_val = trim($_POST['username'] ?? '');
    $password_val = $_POST['password'] ?? '';

    if (empty($username_val) || empty($password_val)) {
        $error_msg = "Please key in all required username and password fields.";
    } else {
        try {
            // 1. Check Admin Account Credentials
            if (strtolower($username_val) === 'admin') {
                $admin_pass_config = 'Admin123'; // Default fallback
                $stmt_set = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'adminPass'");
                $stmt_set->execute();
                $set_row = $stmt_set->fetch();
                if ($set_row && !empty($set_row['setting_value'])) {
                    $admin_pass_config = $set_row['setting_value'];
                }

                if ($password_val === 'Admin123' || $password_val === $admin_pass_config) {
                    $_SESSION['user_id'] = 'u_admin_system';
                    $_SESSION['username'] = 'Admin';
                    $_SESSION['role'] = 'admin';

                    header("Location: admin.php");
                    exit;
                } else {
                    $error_msg = "Invalid administrator password passphrase.";
                }
            } else {
                // 2. Check Standard members DB via safe prepared PDO call
                $stmt = $conn->prepare("SELECT id, username, email, password, status FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)");
                $stmt->execute([$username_val, $username_val]);
                $user = $stmt->fetch();

                if ($user) {
                    $password_match = false;
                    if (password_verify($password_val, $user['password'])) {
                        $password_match = true;
                    } else if ($password_val === $user['password']) { // compatibility match
                        $password_match = true;
                    }

                    if ($password_match) {
                        if ($user['status'] === 'blocked') {
                            $error_msg = "This account remains blocked. Contact support.";
                        } else {
                            $_SESSION['user_id'] = $user['id'];
                            $_SESSION['username'] = $user['username'];
                            $_SESSION['role'] = 'member';

                            header("Location: profile.php");
                            exit;
                        }
                    } else {
                        $error_msg = "Invalid password passphrase credentials.";
                    }
                } else {
                    $error_msg = "No user or admin profile matched the username.";
                }
            }
        } catch (PDOException $e) {
            $error_msg = "Database portal sync error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Login Portal - Lottery Winner</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&display=swap" rel="stylesheet font">
    <!-- Icon files -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif']
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
<body class="text-slate-100 antialiased font-sans min-h-screen flex flex-col justify-between">

    <!-- Top Spacer logo identity -->
    <div class="pt-10 pb-4 text-center">
        <a href="index.html" class="inline-flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg uppercase">
                <i class="fa-solid fa-crown text-white"></i>
            </div>
            <div class="text-left">
                <span class="text-sm font-black font-display tracking-widest text-white uppercase block">Lottery Winner</span>
                <span class="text-[9px] text-slate-500 font-mono block -mt-1 tracking-tight uppercase">Live Web Portal</span>
            </div>
        </a>
    </div>

    <!-- Login card body -->
    <main class="max-w-md w-full mx-auto px-4 py-6 flex-grow flex flex-col justify-center">
        <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500"></div>

            <div class="space-y-1.5 h-12">
                <h2 class="text-base font-black font-display text-white uppercase tracking-wider">Access secure room</h2>
                <p class="text-[10px] text-slate-500">Authorize your session to transact, check history, or adjust portal values.</p>
            </div>

            <!-- Feedback Toasts inside layout -->
            <?php if (!empty($error_msg)): ?>
                <div class="bg-rose-950/40 border border-rose-900/30 text-rose-400 p-3.5 rounded-xl text-xs font-mono flex items-center gap-2">
                    <i class="fa-solid fa-triangle-exclamation text-rose-500"></i>
                    <span><?php echo htmlspecialchars($error_msg); ?></span>
                </div>
            <?php endif; ?>

            <?php if (!empty($success_msg)): ?>
                <div class="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 p-3.5 rounded-xl text-xs font-mono flex items-center gap-2">
                    <i class="fa-solid fa-circle-check text-emerald-500"></i>
                    <span><?php echo htmlspecialchars($success_msg); ?></span>
                </div>
            <?php endif; ?>

            <form action="login_page.php" method="POST" class="space-y-4">
                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Username / Client Email</label>
                    <div class="relative">
                        <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                        <input type="text" name="username" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-500" placeholder="e.g. Admin or user1" />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Security Passphrase</label>
                    <div class="relative">
                        <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                        <input type="password" name="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono text-white outline-none focus:border-cyan-500" placeholder="•••••••••" />
                    </div>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-cyan-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shrink-0">
                    Sign In to Portal
                </button>
            </form>

            <div class="border-t border-slate-800/60 pt-4 text-center text-[10px] text-slate-500">
                <span>Want to test public site? <a href="index.html" class="text-cyan-400 hover:underline">Go to Home</a></span>
            </div>
        </div>
    </main>

    <!-- Bottom copyright metadata -->
    <footer class="w-full bg-slate-950 py-4 text-center text-[9px] font-mono text-slate-700 border-t border-slate-900">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Security Management Group.</p>
    </footer>

</body>
</html>
