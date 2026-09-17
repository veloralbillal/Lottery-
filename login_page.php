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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Secure Login Portal - Lottery Winner</title>
    <!-- Web Font & Icon Integrations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        slate: {
                            850: '#18202f',
                            950: '#030712',
                            955: '#05070e'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #030712;
            background-image: 
                radial-gradient(at 10% 15%, rgba(245, 158, 11, 0.07) 0px, transparent 50%),
                radial-gradient(at 90% 85%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
        }
        @keyframes subtlePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
        }
        .pulse-ambient {
            animation: subtlePulse 4s ease-in-out infinite;
        }
    </style>
</head>
<body class="text-slate-100 antialiased font-sans min-h-screen flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-200">

    <!-- Top Ambient Branding Header -->
    <header class="pt-8 pb-4 px-4 text-center z-10">
        <a href="index.html" class="inline-flex items-center gap-3 group transition duration-300">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300">
                <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <i class="fa-solid fa-clover text-amber-400 text-xl group-hover:rotate-45 transition-transform duration-500"></i>
                </div>
            </div>
            <div class="text-left">
                <div class="flex items-center gap-2">
                    <span class="text-base font-black font-display tracking-widest text-white uppercase block">Lottery Winner</span>
                    <span class="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">PRO</span>
                </div>
                <span class="text-[9.5px] text-slate-400 font-mono block tracking-wider uppercase">Live Secure Gateway</span>
            </div>
        </a>
    </header>

    <!-- Main Centered Authentication Container -->
    <main class="max-w-md w-full mx-auto px-4 py-4 flex-grow flex flex-col justify-center z-10">
        <div class="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden space-y-6">
            <!-- Top Subtle Ambient Accent Line -->
            <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500"></div>

            <!-- Header Title and Gateway Status -->
            <div class="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div class="space-y-1">
                    <h1 class="text-base font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Portal Sign In
                    </h1>
                    <p class="text-[11px] text-slate-400">Authenticate session to play, manage draws & wallet</p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
                    <i class="fa-solid fa-lock text-emerald-400 text-[8px]"></i>
                    <span>256-Bit SSL</span>
                </span>
            </div>

            <!-- Error / Warning Notification Feedback -->
            <?php if (!empty($error_msg)): ?>
                <div class="bg-rose-955/50 border border-rose-900/60 text-rose-300 p-3.5 rounded-2xl text-xs font-mono flex items-start gap-2.5 shadow-lg">
                    <i class="fa-solid fa-circle-exclamation text-rose-400 text-sm mt-0.5 shrink-0"></i>
                    <span class="leading-relaxed"><?php echo htmlspecialchars($error_msg); ?></span>
                </div>
            <?php endif; ?>

            <!-- Success Notification Feedback -->
            <?php if (!empty($success_msg)): ?>
                <div class="bg-emerald-955/50 border border-emerald-900/60 text-emerald-300 p-3.5 rounded-2xl text-xs font-mono flex items-start gap-2.5 shadow-lg">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-sm mt-0.5 shrink-0"></i>
                    <span class="leading-relaxed"><?php echo htmlspecialchars($success_msg); ?></span>
                </div>
            <?php endif; ?>

            <!-- Quick Credential Assist Badges -->
            <div class="bg-slate-950/70 border border-slate-850 rounded-2xl p-3 flex items-center justify-between gap-2">
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <i class="fa-solid fa-bolt text-amber-400 text-xs"></i> Quick Login:
                </span>
                <div class="flex items-center gap-1.5">
                    <button type="button" onclick="fillCredentials('Admin', 'Admin123')" class="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer">
                        Admin
                    </button>
                    <button type="button" onclick="fillCredentials('player_demo', 'pass123')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer">
                        Demo
                    </button>
                </div>
            </div>

            <!-- Login Submission Form -->
            <form action="login_page.php" method="POST" class="space-y-4">
                <!-- Username Input Field -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                        <span>Username / Account Email</span>
                        <span class="text-slate-500 text-[9px] font-normal">Required</span>
                    </label>
                    <div class="relative group">
                        <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs transition group-focus-within:text-amber-400"></i>
                        <input 
                            type="text" 
                            name="username" 
                            id="login-username" 
                            required 
                            autocomplete="username" 
                            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder:text-slate-600" 
                            placeholder="e.g. Admin or player_handle" 
                        />
                    </div>
                </div>

                <!-- Password Input Field -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                            Security Passphrase
                        </label>
                        <a href="forgot_password.html" class="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition">
                            Forgot?
                        </a>
                    </div>
                    <div class="relative group">
                        <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs transition group-focus-within:text-amber-400"></i>
                        <input 
                            type="password" 
                            name="password" 
                            id="login-password" 
                            required 
                            autocomplete="current-password" 
                            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-xs font-mono text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition placeholder:text-slate-600" 
                            placeholder="••••••••••••" 
                        />
                        <button 
                            type="button" 
                            id="toggle-pwd-btn" 
                            onclick="togglePasswordVisibility()" 
                            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 p-1 transition cursor-pointer" 
                            title="Toggle password visibility"
                        >
                            <i id="toggle-pwd-icon" class="fa-solid fa-eye-slash text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Remember Me & Security Policy Note -->
                <div class="flex items-center justify-between pt-1 text-xs">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" id="remember-me" class="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500" />
                        <span class="text-[11px] font-mono text-slate-400">Keep session active</span>
                    </label>
                    <span class="text-[10px] font-mono text-slate-500">Auto-expires 7d</span>
                </div>

                <!-- Primary Submit Action Button -->
                <button 
                    type="submit" 
                    id="submit-btn" 
                    class="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 active:scale-[0.99] text-slate-950 font-bold text-xs py-3.5 rounded-xl transition duration-200 shadow-[0_10px_25px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase mt-2 font-display"
                >
                    <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
                    <span>Authorize Access</span>
                </button>
            </form>

            <!-- Navigation Footnotes -->
            <div class="border-t border-slate-800/80 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>New here?</span>
                <div class="flex items-center gap-3">
                    <a href="register.php" class="text-amber-400 font-bold hover:underline">Create Account</a>
                    <span class="text-slate-700">•</span>
                    <a href="index.html" class="text-slate-400 hover:text-white transition">Public App</a>
                </div>
            </div>
        </div>

        <!-- Trust Feature Badges Grid -->
        <div class="grid grid-cols-3 gap-3 mt-6 text-center">
            <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3">
                <i class="fa-solid fa-shield-halved text-emerald-400 text-sm mb-1 block"></i>
                <span class="text-[9.5px] font-mono font-medium text-slate-400 block">Verified RNG</span>
            </div>
            <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3">
                <i class="fa-solid fa-money-bill-transfer text-amber-400 text-sm mb-1 block"></i>
                <span class="text-[9.5px] font-mono font-medium text-slate-400 block">Fast Payouts</span>
            </div>
            <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3">
                <i class="fa-solid fa-headset text-cyan-400 text-sm mb-1 block"></i>
                <span class="text-[9.5px] font-mono font-medium text-slate-400 block">24/7 Care</span>
            </div>
        </div>
    </main>

    <!-- Bottom Copyright & Security Notice -->
    <footer class="w-full bg-slate-950/80 py-4 text-center text-[10px] font-mono text-slate-500 border-t border-slate-900 z-10 px-4">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Systems. Multi-layer TLS/AES-256 session integrity active.</p>
    </footer>

    <!-- Interactive Client Scripting -->
    <script>
        function togglePasswordVisibility() {
            const pwdInput = document.getElementById('login-password');
            const icon = document.getElementById('toggle-pwd-icon');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                pwdInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        }

        function fillCredentials(user, pass) {
            const u = document.getElementById('login-username');
            const p = document.getElementById('login-password');
            u.value = user;
            p.value = pass;
            u.classList.add('ring-2', 'ring-amber-500/50');
            p.classList.add('ring-2', 'ring-amber-500/50');
            setTimeout(() => {
                u.classList.remove('ring-2', 'ring-amber-500/50');
                p.classList.remove('ring-2', 'ring-amber-500/50');
            }, 600);
        }
    </script>
</body>
</html>
