<?php
/**
 * Lottery Winner - Secure Profile Management Portal (profile.php)
 * 
 * Permits registered users to securely edit their demographic records,
 * and upload custom profile photo avatars both locally or via Google Picker.
 */

require_once __DIR__ . '/config.php';

// Assert user is logged in
if (!is_user_logged_in()) {
    header("Location: login_page.php?error=auth_required");
    exit;
}

$user_id = $_SESSION['user_id'];
$success_msg = '';
$error_msg = '';

// Dynamically run a quick schema migration ensuring "photo" and "google_file_id" exist on our users table
try {
    // Check if column photo exists
    $check_col = $conn->query("SHOW COLUMNS FROM users LIKE 'photo'");
    if ($check_col->rowCount() === 0) {
        $conn->exec("ALTER TABLE users ADD COLUMN photo VARCHAR(255) NULL AFTER dob");
    }
} catch (PDOException $ex) {
    // In case SHOW COLUMNS is not supported, or sqlite/other adapter fallback
}

// Fetch active user details
try {
    $stmt = $conn->prepare("SELECT id, username, email, phone, dob, balance, photo, joinDate, wins, loss, profit FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    die("Data fetching failure: " . $e->getMessage());
}

if (!$user) {
    session_destroy();
    header("Location: login_page.php");
    exit;
}

// Process update actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $dob = trim($_POST['dob'] ?? '');
    
    // Support image uploading
    $photo_path = $user['photo'];
    
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $temp_path = $_FILES['photo']['tmp_name'];
        $orig_name = $_FILES['photo']['name'];
        $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
        
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array($ext, $allowed)) {
            // Ensure target uploads folder exists
            $uploads_dir = __DIR__ . '/uploads';
            if (!is_dir($uploads_dir)) {
                mkdir($uploads_dir, 0755, true);
            }
            
            $file_name = 'avatar_' . $user_id . '_' . time() . '.' . $ext;
            $dest_path = $uploads_dir . '/' . $file_name;
            
            if (move_uploaded_file($temp_path, $dest_path)) {
                $photo_path = 'uploads/' . $file_name;
            } else {
                $error_msg = "Failed to copy uploaded photo to uploads folder.";
            }
        } else {
            $error_msg = "Invalid file format. Upload only PNG, JPG, WEBP or GIF.";
        }
    }
    
    // Direct Google Picker photo save
    if (isset($_POST['google_photo_url']) && !empty($_POST['google_photo_url'])) {
        $photo_path = trim($_POST['google_photo_url']);
    }

    if (empty($error_msg)) {
        try {
            $update_stmt = $conn->prepare("UPDATE users SET email = ?, phone = ?, dob = ?, photo = ? WHERE id = ?");
            $update_stmt->execute([$email, $phone, $dob ? $dob : null, $photo_path, $user_id]);
            
            $success_msg = "Your profile was securely synchronized.";
            // Refresh user row
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
        } catch (PDOException $e) {
            $error_msg = "Failed to update profile record: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profile - Lottery Winner</title>
    <!-- Tailwind css link -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chart.js CDN for visual player metrics breakdown charts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: #020617;
            font-family: 'Inter', system-ui, sans-serif;
        }
    </style>
</head>
<body class="text-slate-100 flex flex-col justify-between min-h-screen">

    <?php require_once __DIR__ . '/header.php'; ?>

    <!-- Main Container -->
    <main class="max-w-md w-full mx-auto p-4 flex-grow my-6 space-y-6">
        
        <!-- Header Page Bar -->
        <div class="flex items-center gap-3">
            <a href="index.html" class="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition shadow-lg">
                <i class="fa-solid fa-arrow-left text-xs"></i>
            </a>
            <div>
                <h1 class="text-sm font-black text-white uppercase tracking-wider">Member Profile Space</h1>
                <p class="text-[10px] text-slate-500 font-mono -mt-0.5">Edit credentials & select avatar</p>
            </div>
        </div>

        <!-- Alert messages dynamic -->
        <?php if (!empty($success_msg)): ?>
            <div class="bg-emerald-950/80 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-300 shadow-xl">
                <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                <p><?php echo htmlspecialchars($success_msg); ?></p>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="bg-rose-950/80 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-rose-300 shadow-xl">
                <i class="fa-solid fa-circle-exmark text-rose-400 text-lg"></i>
                <p><?php echo htmlspecialchars($error_msg); ?></p>
            </div>
        <?php endif; ?>

        <!-- Active Player Profile Sheet card -->
        <div class="bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800/80 p-6 rounded-3xl text-center space-y-5 shadow-2xl relative overflow-hidden">
            
            <!-- Glow background effect -->
            <div class="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <!-- Profile Avatar Picture container -->
            <div class="relative w-24 h-24 mx-auto group">
                <div class="w-24 h-24 rounded-full bg-slate-950 border-2 border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
                    <?php if (!empty($user['photo'])): ?>
                        <img src="<?php echo htmlspecialchars($user['photo']); ?>" alt="Profile avatar" referrerPolicy="no-referrer" class="w-full h-full object-cover" id="avatar-image-ref" />
                    <?php else: ?>
                        <div class="text-cyan-500 text-4xl" id="avatar-icon-placeholder"><i class="fa-solid fa-user-astronaut"></i></div>
                    <?php endif; ?>
                </div>
                
                <!-- Small status dot -->
                <div class="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
            </div>

            <!-- Profile labels -->
            <div class="space-y-0.5">
                <h3 class="text-base font-black text-white font-display">@<?php echo htmlspecialchars($user['username']); ?></h3>
                <p class="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Verified Taka Competitor</p>
            </div>

            <!-- Statistics Grid Metrics -->
            <div class="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/50 font-mono text-center">
                <div>
                    <span class="text-[9px] text-slate-500 block leading-tight">Wins count</span>
                    <span class="text-xs font-bold text-emerald-400 mt-1 block"><?php echo (int)$user['wins']; ?></span>
                </div>
                <div>
                    <span class="text-[9px] text-slate-500 block leading-tight">Loss ledger</span>
                    <span class="text-xs font-bold text-white mt-1 block"><?php echo (int)$user['loss']; ?></span>
                </div>
                <div>
                    <span class="text-[9px] text-slate-500 block leading-tight">Net Profit</span>
                    <span class="text-xs font-bold text-cyan-400 mt-1 block">৳<?php echo number_format((float)$user['profit'], 2); ?></span>
                </div>
            </div>

            <!-- Interactive Earnings Breakdown Chart -->
            <div class="mt-4 bg-slate-950/40 p-4 border border-slate-800/60 rounded-3xl space-y-2">
                <span class="text-[9px] uppercase font-bold text-slate-400 font-mono block text-center">Spending vs Winnings Breakdown</span>
                <div class="relative h-28 w-full flex justify-center">
                    <canvas id="profile-chart" class="max-w-[180px]"></canvas>
                </div>
            </div>

            <!-- Edit Registration details Form -->
            <form action="profile.php" method="POST" enctype="multipart/form-data" id="profile-edit-form" class="text-left space-y-4 pt-2">
                
                <!-- Hidden inputs for photo setting from google Picker -->
                <input type="hidden" name="google_photo_url" id="google-photo-url-field" value="" />

                <!-- Upload Photo picker row -->
                <div class="space-y-2">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Avatar Image Selection</label>
                    <div class="grid grid-cols-2 gap-2">
                        <label class="bg-slate-950 border border-slate-800/80 hover:border-slate-700 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition text-[10px] text-slate-400 font-mono">
                            <i class="fa-solid fa-upload text-cyan-400"></i>
                            <span>Local Upload</span>
                            <input type="file" name="photo" accept="image/*" class="hidden" onchange="this.form.submit();" />
                        </label>
                        
                        <button type="button" id="google-picker-avatar-btn" class="bg-slate-950 border border-slate-800/80 hover:border-slate-700 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition text-[10px] text-amber-400 font-mono">
                            <i class="fa-brands fa-google-drive text-amber-500"></i>
                            <span>Google Drive</span>
                        </button>
                    </div>
                </div>

                <!-- Email Input -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Email Address</label>
                    <input type="email" name="email" required value="<?php echo htmlspecialchars($user['email']); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="you@domain.com" />
                </div>

                <!-- Mobile phone Input -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Mobile Phone link</label>
                    <input type="text" name="phone" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" placeholder="e.g. 01712345678" />
                </div>

                <!-- Date of Birth Input -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] uppercase font-mono text-slate-500">Date of Birth</label>
                    <input type="date" name="dob" value="<?php echo htmlspecialchars($user['dob'] ?? ''); ?>" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-cyan-500 transition" />
                </div>

                <!-- Button action -->
                <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.01] text-white font-black text-xs py-3 rounded-xl shadow-lg transition active:opacity-90">
                    Sync Profile Details
                </button>
            </form>

        </div>

    </main>

    <!-- Footer of Page -->
    <footer class="text-center text-[10px] text-slate-600 font-mono leading-relaxed p-4 border-t border-slate-900">
        <p>© 2026 Lottery Winner Mobile Ltd.</p>
    </footer>

    <!-- Google login / picker tools -->
    <script src="https://apis.google.com/js/api.js"></script>
    <script src="https://accounts.google.com/gsi/client"></script>

    <script>
        // Set up client side picker for user photo from Google Drive
        let developerKey = ''; // Optional API Key
        let clientId = '537748328831-dev.apps.googleusercontent.com'; // Extracted client ID
        let scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';
        
        let oauthToken;

        function loadPicker() {
            gapi.load('auth', {'callback': onAuthApiLoad});
            gapi.load('picker', {'callback': onPickerApiLoad});
        }

        function onAuthApiLoad() {
            // Prepared to authorize
        }

        function onPickerApiLoad() {
            // Loading complete
        }

        document.getElementById('google-picker-avatar-btn').addEventListener('click', () => {
            // Trigger authentic Google Identity service token request
            const client = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: scope,
                callback: (response) => {
                    if (response.error !== undefined) {
                        alert("Google auth failed. Please try again.");
                        return;
                    }
                    oauthToken = response.access_token;
                    createPicker();
                },
            });
            client.requestAccessToken();
        });

        function createPicker() {
            if (oauthToken) {
                // Open real images only picker from Drive
                const view = new google.picker.View(google.picker.ViewId.DOCS);
                view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");
                
                const picker = new google.picker.PickerBuilder()
                    .addView(view)
                    .setOAuthToken(oauthToken)
                    .setDeveloperKey(developerKey)
                    .setCallback(pickerCallback)
                    .build();
                picker.setVisible(true);
            }
        }

        function pickerCallback(data) {
            if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                const doc = data[google.picker.Response.DOCUMENTS][0];
                const fileId = doc[google.picker.Document.ID];
                const name = doc[google.picker.Document.NAME];
                
                // Construct beautiful direct static view link using Google Drive access token
                const directUrl = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media&access_token=" + oauthToken;
                
                document.getElementById('google-photo-url-field').value = directUrl;
                
                // Show instant client image change feedback
                const avatarImg = document.getElementById('avatar-image-ref');
                if (avatarImg) {
                    avatarImg.src = directUrl;
                } else {
                    const avatarPlaceholder = document.getElementById('avatar-icon-placeholder');
                    if (avatarPlaceholder) {
                        avatarPlaceholder.innerHTML = '<img src="' + directUrl + '" class="w-full h-full object-cover" id="avatar-image-ref" />';
                    }
                }
                
                // Auto submit profile edit form to commit changes dynamically
                document.getElementById('profile-edit-form').submit();
            }
        }

        // Render visual player spending profile statistics breakdown
        document.addEventListener('DOMContentLoaded', () => {
            const ctx = document.getElementById('profile-chart');
            if (!ctx) return;

            const spent = parseFloat("<?php echo (float)$user['loss']; ?>") || 0;
            const profit = parseFloat("<?php echo (float)$user['profit']; ?>") || 0;
            const winnings = Math.max(0, spent + profit);

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Spent', 'Winnings'],
                    datasets: [{
                        data: [spent, winnings],
                        backgroundColor: ['#f43f5e', '#10b981'],
                        borderWidth: 1,
                        borderColor: '#0f172a'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                font: {
                                    size: 9,
                                    family: 'JetBrains Mono'
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        });

        window.addEventListener('load', loadPicker);
    </script>
</body>
</html>
