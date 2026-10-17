# System Architecture & Important File Paths

## Architecture Overview
The application is a React & TypeScript single-page application (SPA) bundled with Vite, featuring modular dashboard views, simulated lottery draw engines, real-time wallets, and administrative control suites.

## Important File Paths
- **Entry Point & State Manager**: `src/main.ts` (Core `StateManager` and global application logic)
- **HTML Layout**: `index.html` (Main DOM structure and containers)
- **Dashboard Tabs**: `src/dashboard_tabs/` (Home, Wallet, Withdraw, Deposit, Profile, Games, Group Chat, etc.)
- **Admin Panels**: `src/admin_tabs/` (Admin management interfaces)
- **Extensions & Modules**:
  - `src/dashboard_tabs/wallet_extensions.ts` (Wallet analytics, 24h limit tracking, Vault & withdrawal security)
  - `src/js/luckyWheel.js` (Lucky spin wheel and check-in reward engine)
  - `src/js/admin.js` (Admin settings and control modules)
  - `src/js/mirofishAgentSimulation.ts` (AI agent simulation and group chat integration)
