<?php
require_once __DIR__ . '/src/config.php';
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>Lottery Winner - Premium Mobile Web Portal</title>
    <!-- Google Typography Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Vector Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Chart.js for data visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Styled CSS stylesheet compiled by Vite and Tailwind CSS v4 -->
    <link rel="stylesheet" href="/src/tailwind-built.css" />
    
    <!-- Tab CSS styles -->
    <link rel="stylesheet" href="/src/dashboard_tabs/home.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/tickets.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/wallet.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/history.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/profile.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/badge_request.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/share_earn.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/jackpot.css" />
    <link rel="stylesheet" href="/src/dashboard_tabs/missions.css" />
    
    <style>
      /* Smooth transitions and scrollbars */
      .scrollbar-none::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-none {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      body {
        background-color: #030712;
      }
    </style>
  </head>
  <body class="text-slate-100 antialiased font-sans select-none min-h-screen flex flex-col justify-between">

    <!-- ================= STUNNING 3D SPLASH SCREEN ================= -->
    <?php include_once __DIR__ . '/src/dashboard_tabs/splash.php'; ?>

    <!-- Global Floating Toasts Container -->
    <div id="toast-container" class="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"></div>

    <!-- Beautiful Immersive Full-Screen Offline Portal -->
    <?php include_once __DIR__ . '/src/dashboard_tabs/offline.php'; ?>

    <!-- ================= SCREEN 2: AUTHENTICATION GATEWAY ================= -->
    <?php include_once __DIR__ . '/src/dashboard_tabs/auth.php'; ?>

    <!-- ================= SCREEN 3: USER CENTRAL DASHBOARD PORTAL ================= -->
    <div id="screen-dashboard" class="hidden min-h-screen bg-slate-950 flex flex-col justify-between pb-24 relative overflow-x-hidden">
      
      <!-- Top fixed appbar banner -->
      <?php include_once __DIR__ . '/header.php'; ?>

      <!-- Main Tab Content Body area -->
      <main class="p-4 space-y-6 max-w-md w-full mx-auto flex-grow">
        <?php include_once __DIR__ . '/src/dashboard_tabs/home.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/jackpot.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/tickets.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/wallet.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/history.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/profile.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/badge_request.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/share_earn.php'; ?>
        <?php include_once __DIR__ . '/src/dashboard_tabs/missions.php'; ?>
      </main>

      <!-- FLOATING CONNECTION DIAGNOSTICS STRIP -->
      <?php include_once __DIR__ . '/src/dashboard_tabs/diagnostics.php'; ?>

      <!-- Bottom System Navigation tab bar -->
      <?php include_once __DIR__ . '/src/dashboard_tabs/navigation.php'; ?>

    </div>

    <!-- Modals and Sub-dialogs -->
    <?php include_once __DIR__ . '/src/dashboard_tabs/modals.php'; ?>

    <!-- Google Platform APIs & Identity Services for Picker and Drive -->
    <script src="https://apis.google.com/js/api.js"></script>
    <script src="https://accounts.google.com/gsi/client"></script>

    <!-- Tab ES6 Scripts -->
    <script type="module" src="/src/dashboard_tabs/home.js"></script>
    <script type="module" src="/src/dashboard_tabs/jackpot.js"></script>
    <script type="module" src="/src/dashboard_tabs/tickets.js"></script>
    <script type="module" src="/src/dashboard_tabs/wallet.js"></script>
    <script type="module" src="/src/dashboard_tabs/history.js"></script>
    <script type="module" src="/src/dashboard_tabs/profile.js"></script>
    <script type="module" src="/src/dashboard_tabs/badge_request.js"></script>
    <script type="module" src="/src/dashboard_tabs/share_earn.js"></script>
    <script type="module" src="/src/dashboard_tabs/missions.js"></script>

    <!-- Application script bundle -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
