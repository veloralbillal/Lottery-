<?php
/**
 * Lottery Winner - Dedicated Payment Gateways and Routes Settings (payment.php)
 * 
 * Features secure management for Mobile Banking (Bkash, Nagad, Rocket, Upay),
 * Bank Accounts (DBBL Bank Name, Branch, Account details), and Cryptocurrency wallets (USDT TRC-20, BTC, ETH)
 * linked dynamically with the main admin control room.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/admin_header.php';

$success_msg = "";
$error_msg = "";

// Ensure required payment settings keys exist in the database or insert defaults safely
$required_keys = [
    'mobileAgentBkash' => '01799228833',
    'mobileTypeBkash' => 'personal',
    'mobileInstructionBkash' => 'Send money to our bKash Personal number, then enter your TrxID below for approval.',
    'mobileAgentNagad' => '01855221144',
    'mobileTypeNagad' => 'personal',
    'mobileInstructionNagad' => 'Send money to our Nagad Personal number, then enter your TrxID below for approval.',
    'mobileAgentRocket' => '01688554422',
    'mobileTypeRocket' => 'personal',
    'mobileInstructionRocket' => 'Send money to our Rocket Personal number, then enter your TrxID below for approval.',
    'mobileAgentUpay' => '01922334455',
    'mobileTypeUpay' => 'personal',
    'mobileInstructionUpay' => 'Send money to our Upay Personal number, then enter your TrxID below for approval.',
    'bankNameDBBL' => 'Dutch-Bangla Bank PLC',
    'bankAccountNameDBBL' => 'Lottery Winner LLC',
    'bankAccountNumberDBBL' => '120-105-0043819',
    'bankBranchDBBL' => 'Dhaka Motijheel Main Branch',
    'bankInstruction' => 'Transfer money to our bank account below. DBBL branch deposits clear in 2 hours.',
    'cryptoAddressUSDT' => 'TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X',
    'cryptoAddressBTC' => '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'cryptoAddressETH' => '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    'cryptoQRType' => 'auto',
    'cryptoQRUrlUSDT' => '',
    'cryptoQRUrlBTC' => '',
    'cryptoQRUrlETH' => '',
    'cryptoInstruction' => 'Scan the QR code or copy the wallet address below. Make sure to transfer TRC-20 protocol tokens.'
];

try {
    $stmt_insert = $conn->prepare("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)");
    foreach ($required_keys as $key => $val) {
        $stmt_insert->execute([$key, $val]);
    }
} catch (PDOException $e) {
    // Graceful check fallback
}

// Process update actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_gateways') {
    try {
        $conn->beginTransaction();
        
        $stmt_save = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        
        foreach ($required_keys as $key => $def_val) {
            $post_val = isset($_POST[$key]) ? trim($_POST[$key]) : '';
            $stmt_save->execute([$key, $post_val, $post_val]);
        }
        
        $conn->commit();
        $success_msg = "All payment gateways and channel routes were synchronized successfully!";
    } catch (PDOException $e) {
        $conn->rollBack();
        $error_msg = "Database update failure: " . $e->getMessage();
    }
}

// Fetch live values from DB
$settings = [];
try {
    $stmt_fetch = $conn->query("SELECT setting_key, setting_value FROM settings");
    while ($row = $stmt_fetch->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
} catch (PDOException $e) {
    // Dynamic empty state
}

// Apply fallbacks for display
foreach ($required_keys as $key => $def_val) {
    if (!isset($settings[$key])) {
        $settings[$key] = $def_val;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Payment Gateways - Admin Control Room</title>
    <!-- Google Typography -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Vector Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <!-- Tailwind CSS -->
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
            background-color: #020617;
        }
    </style>
</head>
<body class="text-slate-200 antialiased font-sans min-h-screen flex flex-col justify-between">

    <!-- Header Block -->
    <div class="w-full">
        <!-- Re-use standardized header -->
    </div>

    <main class="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">
        
        <!-- Breadcrumbs Navigation -->
        <div class="flex items-center gap-2 text-xs font-mono text-slate-500">
            <a href="admin.php" class="hover:text-cyan-400 transition">Control Room</a>
            <span>/</span>
            <span class="text-slate-300">Payment Gateways</span>
        </div>

        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-rose-600/5 pointer-events-none"></div>
            <div class="relative z-10">
                <span class="text-[9px] font-black tracking-widest text-cyan-400 font-mono bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded-full uppercase">Configurations</span>
                <h2 class="text-xl font-black font-display text-white mt-1.5 uppercase tracking-wide">Sync Live Channels</h2>
                <p class="text-xs text-slate-400 mt-0.5">Edit receivers, bank routing details, and deposit gateway address lines dynamically.</p>
            </div>
            <div class="flex items-center gap-2 relative z-10">
                <a href="admin.php" class="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-chevron-left"></i> Main Control
                </a>
            </div>
        </div>

        <!-- Feedback messaging -->
        <?php if (!empty($success_msg)): ?>
            <div class="bg-emerald-950/50 border border-emerald-900/60 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i class="fa-solid fa-circle-check text-emerald-500 text-base animate-bounce"></i>
                <div>
                    <strong>SUCCESS:</strong> <?php echo htmlspecialchars($success_msg); ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="bg-rose-950/50 border border-rose-900/60 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono">
                <i class="fa-solid fa-triangle-exclamation text-rose-500 text-base"></i>
                <div>
                    <strong>ARRANGEMENT ERROR:</strong> <?php echo htmlspecialchars($error_msg); ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Setup Form fields -->
        <form action="payment.php" method="POST" class="space-y-6">
            <input type="hidden" name="action" value="update_gateways">

            <!-- MOBILE BANKING ACCOUNTS CARD -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                    <div class="w-8 h-8 rounded-lg bg-pink-950/50 text-pink-500 flex items-center justify-center text-sm border border-pink-900/30">
                        <i class="fa-solid fa-mobile-screen"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Mobile Banking Gateways & Instructions</h3>
                        <p class="text-[10px] text-slate-500 font-mono">Accept deposits directly to bKash, Nagad, Rocket, or Upay personal/agent accounts with custom admin instructions.</p>
                    </div>
                </div>

                <div class="space-y-6 text-xs font-mono">
                    <!-- bKash Configuration Block -->
                    <div class="bg-slate-950/50 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-800/40 pb-2">
                            <span class="text-pink-400 font-black tracking-wide"><i class="fa-solid fa-circle-chevron-right text-[10px]"></i> bKash Channel</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">bKash Account Number</label>
                                <input type="text" name="mobileAgentBkash" value="<?php echo htmlspecialchars($settings['mobileAgentBkash']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. 017XXXXXXXX" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Account Type</label>
                                <select name="mobileTypeBkash" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="personal" <?php echo ($settings['mobileTypeBkash'] === 'personal') ? 'selected' : ''; ?>>Personal Account (Send Money)</option>
                                    <option value="agent" <?php echo ($settings['mobileTypeBkash'] === 'agent') ? 'selected' : ''; ?>>Agent Account (Cash Out)</option>
                                </select>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-slate-400">Custom Transaction Instructions</label>
                            <textarea name="mobileInstructionBkash" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Send Money to our Personal number, then submit TrxID."><?php echo htmlspecialchars($settings['mobileInstructionBkash']); ?></textarea>
                        </div>
                    </div>

                    <!-- Nagad Configuration Block -->
                    <div class="bg-slate-950/50 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-800/40 pb-2">
                            <span class="text-orange-400 font-black tracking-wide"><i class="fa-solid fa-circle-chevron-right text-[10px]"></i> Nagad Channel</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Nagad Account Number</label>
                                <input type="text" name="mobileAgentNagad" value="<?php echo htmlspecialchars($settings['mobileAgentNagad']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. 018XXXXXXXX" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Account Type</label>
                                <select name="mobileTypeNagad" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="personal" <?php echo ($settings['mobileTypeNagad'] === 'personal') ? 'selected' : ''; ?>>Personal Account (Send Money)</option>
                                    <option value="agent" <?php echo ($settings['mobileTypeNagad'] === 'agent') ? 'selected' : ''; ?>>Agent Account (Cash Out)</option>
                                </select>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-slate-400">Custom Transaction Instructions</label>
                            <textarea name="mobileInstructionNagad" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Send Money to our Personal number, then submit TrxID."><?php echo htmlspecialchars($settings['mobileInstructionNagad']); ?></textarea>
                        </div>
                    </div>

                    <!-- Rocket Configuration Block -->
                    <div class="bg-slate-950/50 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-800/40 pb-2">
                            <span class="text-violet-400 font-black tracking-wide"><i class="fa-solid fa-circle-chevron-right text-[10px]"></i> Rocket Channel</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Rocket Account Number</label>
                                <input type="text" name="mobileAgentRocket" value="<?php echo htmlspecialchars($settings['mobileAgentRocket']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. 016XXXXXXXX" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Account Type</label>
                                <select name="mobileTypeRocket" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="personal" <?php echo ($settings['mobileTypeRocket'] === 'personal') ? 'selected' : ''; ?>>Personal Account (Send Money)</option>
                                    <option value="agent" <?php echo ($settings['mobileTypeRocket'] === 'agent') ? 'selected' : ''; ?>>Agent Account (Cash Out)</option>
                                </select>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-slate-400">Custom Transaction Instructions</label>
                            <textarea name="mobileInstructionRocket" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Send Money to our Personal number, then submit TrxID."><?php echo htmlspecialchars($settings['mobileInstructionRocket']); ?></textarea>
                        </div>
                    </div>

                    <!-- Upay Configuration Block -->
                    <div class="bg-slate-950/50 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-800/40 pb-2">
                            <span class="text-yellow-400 font-black tracking-wide"><i class="fa-solid fa-circle-chevron-right text-[10px]"></i> Upay Channel</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Upay Account Number</label>
                                <input type="text" name="mobileAgentUpay" value="<?php echo htmlspecialchars($settings['mobileAgentUpay']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. 019XXXXXXXX" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">Account Type</label>
                                <select name="mobileTypeUpay" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="personal" <?php echo ($settings['mobileTypeUpay'] === 'personal') ? 'selected' : ''; ?>>Personal Account (Send Money)</option>
                                    <option value="agent" <?php echo ($settings['mobileTypeUpay'] === 'agent') ? 'selected' : ''; ?>>Agent Account (Cash Out)</option>
                                </select>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-slate-400">Custom Transaction Instructions</label>
                            <textarea name="mobileInstructionUpay" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Send Money to our Personal number, then submit TrxID."><?php echo htmlspecialchars($settings['mobileInstructionUpay']); ?></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- REGULAR BANK ACCOUNTS DETAIL CARD -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                    <div class="w-8 h-8 rounded-lg bg-emerald-950/50 text-emerald-500 flex items-center justify-center text-sm border border-emerald-900/30">
                        <i class="fa-solid fa-building-columns"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Traditional Bank Transfers (Dutch-Bangla DBBL)</h3>
                        <p class="text-[10px] text-slate-500 font-mono">Display details of official bank account routes for higher deposit thresholds.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div class="space-y-1.5">
                        <label class="block text-slate-400">Bank Name</label>
                        <input type="text" name="bankNameDBBL" value="<?php echo htmlspecialchars($settings['bankNameDBBL']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" />
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-slate-400">Account Holder Name</label>
                        <input type="text" name="bankAccountNameDBBL" value="<?php echo htmlspecialchars($settings['bankAccountNameDBBL']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" />
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-slate-400">Account Number / IBAN</label>
                        <input type="text" name="bankAccountNumberDBBL" value="<?php echo htmlspecialchars($settings['bankAccountNumberDBBL']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" />
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-slate-400">Branch Name & Details</label>
                        <input type="text" name="bankBranchDBBL" value="<?php echo htmlspecialchars($settings['bankBranchDBBL']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500" />
                    </div>
                </div>
                <div class="space-y-1.5 text-xs font-mono">
                    <label class="block text-slate-400">Bank Deposit Instructions</label>
                    <textarea name="bankInstruction" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="Traditional bank deposits instructions."><?php echo htmlspecialchars($settings['bankInstruction']); ?></textarea>
                </div>
            </div>

            <!-- CRYPTOCURRENCY ASSETS ADDRESS CARD -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                    <div class="w-8 h-8 rounded-lg bg-amber-950/50 text-amber-500 flex items-center justify-center text-sm border border-amber-900/30">
                        <i class="fa-brands fa-bitcoin"></i>
                    </div>
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Cryptocurrency Wallets & Auto QR Manager</h3>
                        <p class="text-[10px] text-slate-500 font-mono">Deploy crypto wallet targets and generate high-resolution scan codes in real-time.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                    <!-- Column 1: Addresses and custom QR overrides -->
                    <div class="md:col-span-2 space-y-4">
                        <div class="space-y-1.5">
                            <label class="block text-amber-400 font-bold">TRC-20 USDT Wallet Address</label>
                            <input type="text" id="cryptoAddressUSDT" name="cryptoAddressUSDT" value="<?php echo htmlspecialchars($settings['cryptoAddressUSDT']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono" placeholder="TRC20 Address" />
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-yellow-500 font-bold">Bitcoin BTC Wallet Address</label>
                            <input type="text" id="cryptoAddressBTC" name="cryptoAddressBTC" value="<?php echo htmlspecialchars($settings['cryptoAddressBTC']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono" placeholder="BTC Address" />
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-violet-400 font-bold">Ethereum ETH (ERC-20) Address</label>
                            <input type="text" id="cryptoAddressETH" name="cryptoAddressETH" value="<?php echo htmlspecialchars($settings['cryptoAddressETH']); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-mono" placeholder="ETH Address" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">QR Code Source Mode</label>
                                <select id="cryptoQRType" name="cryptoQRType" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="auto" <?php echo ($settings['cryptoQRType'] === 'auto') ? 'selected' : ''; ?>>Auto QR Code Generator (Recommended)</option>
                                    <option value="custom" <?php echo ($settings['cryptoQRType'] === 'custom') ? 'selected' : ''; ?>>Custom Image Overrides </option>
                                </select>
                            </div>
                        </div>

                        <!-- Custom Image Overrides inputs -->
                        <div id="custom-qr-inputs-block" class="<?php echo ($settings['cryptoQRType'] === 'custom') ? '' : 'hidden'; ?> space-y-4 pt-2">
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">USDT Custom QR Code Image URL</label>
                                <input type="text" id="cryptoQRUrlUSDT" name="cryptoQRUrlUSDT" value="<?php echo htmlspecialchars($settings['cryptoQRUrlUSDT']); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-cyan-500" placeholder="https://example.com/usdt_qr.png" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">BTC Custom QR Code Image URL</label>
                                <input type="text" id="cryptoQRUrlBTC" name="cryptoQRUrlBTC" value="<?php echo htmlspecialchars($settings['cryptoQRUrlBTC']); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-cyan-500" placeholder="https://example.com/btc_qr.png" />
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-slate-400">ETH Custom QR Code Image URL</label>
                                <input type="text" id="cryptoQRUrlETH" name="cryptoQRUrlETH" value="<?php echo htmlspecialchars($settings['cryptoQRUrlETH']); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-cyan-500" placeholder="https://example.com/eth_qr.png" />
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-slate-400">Global Crypto Instructions</label>
                            <textarea name="cryptoInstruction" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-cyan-500 font-sans" placeholder="Instructions shown above dynamic crypto wallets."><?php echo htmlspecialchars($settings['cryptoInstruction']); ?></textarea>
                        </div>
                    </div>

                    <!-- Column 2: Interactive Realtime QR Generator Preview -->
                    <div class="bg-slate-950 border border-slate-800/80 p-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                        <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block"><i class="fa-solid fa-qrcode"></i> REAL-TIME ACTIVE QR PREVIEW</span>
                        <div class="w-40 h-40 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                            <img id="active-qr-preview-img" class="w-full h-full object-contain" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X" alt="USDT QR" />
                        </div>
                        <div class="space-y-1 w-full text-center">
                            <select id="qr-preview-selector" class="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] text-white outline-none cursor-pointer">
                                <option value="usdt">Preview USDT QR Code</option>
                                <option value="btc">Preview BTC QR Code</option>
                                <option value="eth">Preview ETH QR Code</option>
                            </select>
                            <p class="text-[9px] text-slate-500 leading-normal mt-1">Real-time code matches the text address or custom override url instantly.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- JavaScript helper for active QR previewer and form toggle -->
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    const cryptoQRType = document.getElementById("cryptoQRType");
                    const customQrBlock = document.getElementById("custom-qr-inputs-block");
                    
                    if (cryptoQRType && customQrBlock) {
                        cryptoQRType.addEventListener("change", function(e) {
                            if (e.target.value === "custom") {
                                customQrBlock.classList.remove("hidden");
                            } else {
                                customQrBlock.classList.add("hidden");
                            }
                            updateActiveQR();
                        });
                    }

                    const qrPreviewSel = document.getElementById("qr-preview-selector");
                    const qrPreviewImg = document.getElementById("active-qr-preview-img");
                    
                    const addrUSDT = document.getElementById("cryptoAddressUSDT");
                    const addrBTC = document.getElementById("cryptoAddressBTC");
                    const addrETH = document.getElementById("cryptoAddressETH");
                    
                    const customUSDT = document.getElementById("cryptoQRUrlUSDT");
                    const customBTC = document.getElementById("cryptoQRUrlBTC");
                    const customETH = document.getElementById("cryptoQRUrlETH");

                    function updateActiveQR() {
                        if (!qrPreviewSel || !qrPreviewImg) return;
                        const asset = qrPreviewSel.value;
                        const srcMode = cryptoQRType.value;
                        let qrData = "";

                        if (asset === "usdt") {
                            if (srcMode === "custom" && customUSDT.value.trim() !== "") {
                                qrData = customUSDT.value.trim();
                            } else {
                                qrData = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(addrUSDT.value.trim());
                            }
                        } else if (asset === "btc") {
                            if (srcMode === "custom" && customBTC.value.trim() !== "") {
                                qrData = customBTC.value.trim();
                            } else {
                                qrData = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(addrBTC.value.trim());
                            }
                        } else {
                            if (srcMode === "custom" && customETH.value.trim() !== "") {
                                qrData = customETH.value.trim();
                            } else {
                                qrData = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(addrETH.value.trim());
                            }
                        }

                        // Set the src
                        if (qrData.startsWith("http")) {
                            qrPreviewImg.src = qrData;
                        } else {
                            qrPreviewImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(qrData || "none");
                        }
                    }

                    // Attach handlers
                    if (qrPreviewSel) qrPreviewSel.addEventListener("change", updateActiveQR);
                    [addrUSDT, addrBTC, addrETH, customUSDT, customBTC, customETH].forEach(inp => {
                        if (inp) inp.addEventListener("input", updateActiveQR);
                    });

                    // Trigger init
                    updateActiveQR();
                });
            </script>

            <!-- Submit action block -->
            <div class="flex justify-end gap-3 pt-2">
                <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 transition active:scale-95">
                    Save Synced Settings Channels
                </button>
            </div>
        </form>
    </main>

    <!-- Footer Identity Strip -->
    <footer class="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-600">
        <p>&copy; <?php echo date("Y"); ?> Lottery Winner Control Platform. Cryptographically protected session.</p>
    </footer>

</body>
</html>
