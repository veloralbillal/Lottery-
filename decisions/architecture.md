# Architectural Decisions

## Architecture Pattern
- **CONFIRMED**: **Single Page Application (SPA) with Multi-Entry Build**: The frontend is a client-side TypeScript application bundled with Vite. It features a primary entry point (`index.html`) managing the main lottery portal and an isolated secondary entry point (`blog.html`) for the standalone blog reader (`vite.config.ts` Rollup input config).
- **CONFIRMED**: **Centralized Singleton State Management (`StateManager`)**: Global client state is orchestrated via `StateManager` in `src/main.ts`. State includes user session data, active tabs, lottery pools, transaction history, notification queues, and wallet balances.
- **CONFIRMED**: **Offline-First & Local Persistence**: Primary runtime state is persisted locally in browser `localStorage` under the key `lottery_winner_db`. Mutating actions trigger `app.saveDB()` for instant local durability. Offline tasks (ticket purchases, deposits, withdrawals) are captured by `OfflineQueueManager` (`src/js/syncQueue.js`) backed by IndexedDB and synchronized once connectivity resumes.
- **CONFIRMED**: **Build-Time Template Bundling**: User dashboard screens (`src/dashboard_tabs/*.php`) and admin panels (`src/admin_tabs/*.php`) are written in PHP/HTML markup. A custom Vite plugin (`serveAndCopyAssetsPlugin` in `vite.config.ts`) pre-bundles these templates into a static TypeScript map (`src/js/bundledTabs.ts`). They are lazily loaded into the DOM on-demand via `LazyTabManager.loadTabTemplate` (`src/js/performanceOptimizer.ts`), avoiding server-side PHP execution.
- **INFERRED**: Direct DOM manipulation with template string interpolation was chosen over a virtual DOM framework to provide fine-grained control over animations, dynamic DOM swaps, and legacy PHP UI markup without framework migration overhead.

---

## Frontend / Backend Separation
- **CONFIRMED**:
  - **Frontend Client**: Pure client-side TypeScript and JavaScript executing in the browser. Uses Vite for asset compilation, Tailwind CSS v4 (`@tailwindcss/vite`) for styling, FontAwesome 6 (CDN) for icons, Chart.js (CDN) for charts, Three.js (`src/components/ThreeLotteryDrawScene.ts`) for 3D drawing visuals, and GSAP/Canvas Confetti for celebration effects.
  - **Backend Server**: Node.js Express application (`server.ts`) listening on port 3000. Acts as a decoupled API gateway, SQL bridge executor, payment webhook receiver, plugin extractor, and static asset server. In development, it integrates Vite via `vite.middlewares`. In production, it serves pre-compiled assets from `dist/` and falls back to `dist/index.html`.

---

## Major Modules and Responsibilities
- **CONFIRMED**:
  - `src/main.ts`: Application kernel; houses `StateManager`, screen routing (`screen-dashboard`, `screen-auth`, `screen-maintenance`, `screen-blog`), authentication sessions, lottery ticket purchase pipeline, cart abandonment tracking, and global event delegation.
  - `server.ts`: Backend API hub; exposes SQL bridge synchronization endpoints (`/api/sql/*`), payment gateway handlers (`/api/uddoktapay/*`, `/api/zinipay/*`), email dispatch (`/api/send-reset-email`), plugin archive upload and extraction (`/api/plugins/upload`), notifications, and push subscription storage.
  - `src/dashboard_tabs/`: User-facing modular tabs including Home (`home.ts`/`home.php`), Wallet (`wallet.ts`/`user_balance.php`), Tickets (`tickets.ts`/`tickets.php`), Deposit (`deposit.php`), Withdraw (`withdraw.php`), Profile (`profile.ts`/`profile.php`), Games Hub (`games.php`), Jackpot (`jackpot.ts`/`jackpot.php`), Missions/Tasks (`missions.ts`/`missions.php`), Refer & Earn (`share_earn.ts`), Group Chat (`group_chat.php`), and Blog (`blog.ts`/`blog_tab.php`).
  - `src/admin_tabs/`: Comprehensive administrator control panel modules for lottery pools, manual draw triggers, transaction verification (deposits/withdrawals), player management, gateway toggles, agent hierarchies, and blog management (`blogManager.ts`/`blog_admin.php`).
  - `src/js/syncCloud.ts`: Client-side remote cloud synchronizer; executes direct HTTP SQL bridge queries (`executeDirectBridgeQuery`), pushes database snapshots, and handles conflict resolution.
  - `src/js/syncVault.js` & `src/js/syncQueue.js`: High-availability failover engine simulation, cluster node diagnostics, and offline action queuing.
  - `src/js/apiUddoktaPay.ts` & `src/js/apiZiniPay.ts`: Server-side instant payment checkout and verification adapters for Bangladeshi payment rails (bKash, Nagad, Rocket).
  - `src/js/apiEmailSender.ts`: Nodemailer transport for transactional password reset and OTP verification emails.
  - `src/js/performanceOptimizer.ts`: Performance infrastructure featuring `LazyTabManager`, `GlobalCache`, debounce, throttle, and tab lifecycle observers.
  - `src/store/`: In-app digital marketplace and plugin management subsystem (`StoreManager.ts`, `AdminStoreManager.ts`, `PluginManager`).
  - `src/components/ThreeLotteryDrawScene.ts`: Three.js WebGL canvas rendering 3D lottery spheres and particles.

---

## Data Flow
- **CONFIRMED**:
  1. **User Interaction**: User interacts with a UI control (e.g., purchasing a lottery ticket, submitting a deposit slip, changing profile avatar, or rolling dice).
  2. **In-Memory State Mutation**: Event listeners invoke methods on `StateManager` or tab modules, directly updating `this.db`.
  3. **Local Persistence**: State changes immediately invoke `this.saveDB()`, serializing the database tree to browser `localStorage` (`lottery_winner_db`).
  4. **DOM Re-Rendering**: The active view is updated via template re-rendering, class toggling, or dynamic innerHTML updates.
  5. **Remote SQL Synchronization**: Asynchronously or periodically, `SyncCloudModule.syncToCloud()` sends state deltas or full database payloads to `/api/sql/sync` or the remote PHP bridge (`db_bridge.php`), synchronizing records across MySQL tables.
  6. **Offline Fallback**: If an API or network operation fails while disconnected, `OfflineQueueManager` enqueues the transaction in IndexedDB and replays it upon the browser's `online` event.

---

## API Communication
- **CONFIRMED**:
  - **Internal REST APIs**: Frontend communicates with the Express backend over HTTP/JSON (`/api/*`).
  - **SQL Bridge Gateway**: Server queries remote MySQL either through direct `mysql2/promise` connection pooling or via HTTP POST requests to an external PHP bridge script (`https://api.veloralbillal.top/db_bridge.php`) authenticated with a security token (`Billal50598326`).
  - **Fetch Interceptor**: `installUniversalSqlBridgeFetchInterceptor()` (`src/js/sqlBridgeClient.ts`) intercepts client queries to route them through the active SQL bridge.
  - **Payment Webhooks**: Inbound asynchronous webhook endpoints (`/api/uddoktapay/webhook`, `/api/zinipay/webhook`) process payment confirmation signals.
  - **Push Notification Service**: Browser Web Push subscription registration via `/api/push/subscribe`.

---

## Authentication & Authorization Architecture
- **CONFIRMED**:
  - **Authentication Mechanism**: Custom session-based authentication managed client-side in `StateManager` and validated against MySQL / `localStorage` user records.
  - **Role-Based Access Control (RBAC)**: Distinct authorization tiers:
    - `user`: Standard player account (ticket purchases, deposits, withdrawals, profile customization).
    - `agent` / `subagent`: Payout distribution, referral tracking, and agent chat workspaces (`src/dashboard_tabs/agent.php`, `affiliate_agent_system.ts`).
    - `moderator`: Task verification, chat moderation, and community oversight.
    - `admin`: Full administrative access to the admin dashboard (`src/admin_tabs/`, `src/js/admin.js`, `src/admin_tabs/admin.ts`).
  - **Multi-Factor / Cashout Security PIN**: 4-digit security PIN lock enforced before withdrawal requests can be submitted (`src/dashboard_tabs/wallet_extensions.ts`).
  - **Time-Based One-Time Password (TOTP)**: Dynamic 6-digit rolling OTP algorithm with 30-second expiry cycles (`src/js/totp.ts`, `src/dashboard_tabs/otp.php`) for physical agent cashout verification.
  - **Bot Mitigation**: Client-side mathematical captcha challenge integrated into sign-in and registration forms.

---

## Database Architecture
- **CONFIRMED**:
  - **Dual-Layer Architecture**:
    1. **Client Storage**: Browser `localStorage` holding a JSON state graph (`lottery_winner_db`), enabling zero-latency reads and offline functionality.
    2. **Remote Relational Database**: MySQL 8.0 / MariaDB database (`veloralb_Digital`), managed via HTTP PHP bridge (`db_bridge.php`) or `mysql2/promise`.
  - **Relational Tables**:
    - `users`: User profiles, passwords, balances, vault balances, roles, security PINs, badges.
    - `lotteries`: Pool metadata, ticket prices, prize values, draw dates, status (`active`/`drawn`).
    - `tickets`: Purchased tickets, lucky numbers, user associations, draw outcomes (`pending`/`won`/`lost`).
    - `deposits`: Financial deposit records, MFS channels, transaction IDs, approval status.
    - `withdrawals`: Payout requests, beneficiary account details, fees, deduction logs.
    - `transactions`: General ledger entries (credits/debits).
    - `notifications`: Push and in-app user notifications.
    - `push_subscriptions`: Web Push endpoint subscriptions with encryption keys (`p256dh`, `auth`).
    - `settings`: Global site configuration, banner announcements, payment gateway keys.
    - Additional tables: `staff`, `agents`, `agentLedger`, `agentChats`, `categories`.
  - **Local Offline Failover**: IndexedDB instance managed via `OfflineQueueManager` for staging mutations during network dropouts.

---

## External Services & Integrations
- **CONFIRMED**:
  - **UddoktaPay**: Automated payment checkout gateway for Bangladeshi payment rails (`src/js/apiUddoktaPay.ts`).
  - **ZiniPay**: Secondary instant payment gateway provider (`src/js/apiZiniPay.ts`).
  - **Nodemailer (SMTP)**: Email delivery service for password resets and verification OTPs (`src/js/apiEmailSender.ts`).
  - **Remote PHP SQL Bridge**: External database bridge endpoint (`https://api.veloralbillal.top/db_bridge.php`).
  - **FontAwesome 6**: CDN-hosted vector icon library loaded in `index.html`.
  - **Chart.js**: CDN-hosted financial and activity charting library in `index.html`.

---

## Deployment & Infrastructure Architecture
- **CONFIRMED**:
  - **Runtime**: Node.js environment (v20+).
  - **Development Mode**: Launched via `npm run dev`, which runs `tsx server.ts`. Express boots on port 3000 and attaches Vite development middleware with HMR disabled (`hmr: false` in `vite.config.ts`).
  - **Production Build**: Executed via `npm run build`:
    1. `vite build`: Compiles `index.html` and `blog.html` into optimized static assets under `dist/`.
    2. `esbuild server.ts`: Bundles the Express backend into a single CommonJS file (`dist/server.cjs`) with externalized node_modules.
  - **Production Execution**: Started via `npm start` (`node dist/server.cjs`). Express serves static files from `dist/` and provides SPA routing fallback to `dist/index.html`.
- **UNKNOWN**:
  - Specific cloud hosting provider or container orchestrator for production deployment (e.g. Google Cloud Run, AWS EC2, VPS, or Docker container).

---

## Important Architectural Trade-offs
- **CONFIRMED**:
  - **Client-Side State Persistence vs. Pure Server-Authoritative API**:
    - *Advantage*: Near-instantaneous UI transitions, resilient offline operation, and reduced server load.
    - *Disadvantage*: Requires state synchronization and serialization queues (`server.ts` mutex) to avoid write collisions.
  - **Build-Time Template Bundling vs. Runtime PHP Server**:
    - *Advantage*: Entire app runs on a standardized Node.js/Vite stack without requiring PHP-FPM, Apache, or Nginx.
    - *Disadvantage*: Dynamic PHP server-side evaluation is unavailable; templates must be processed as static markup strings.
  - **HTTP SQL Bridge Tunnel vs. Direct TCP Database Pool**:
    - *Advantage*: Enables communication with shared hosting MySQL databases that do not allow external TCP port 3306 connections.
    - *Disadvantage*: Adds HTTP request overhead and relies on URL query token authorization.

---

## Why the Current Architecture Appears to Have Been Chosen
- **INFERRED**:
  - The project originated as a classic PHP/cPanel web application with multiple standalone screens (`index.php`, `login.php`, `deposit.php`, `src/dashboard_tabs/*.php`).
  - To modernize the user experience without rewriting all frontend markup, the architecture was converted to a Vite-powered Single Page Application (SPA).
  - Pre-bundling PHP files into TypeScript strings preserved the existing UI layouts while allowing client-side dynamic rendering.
  - Transitioning away from Firebase to a remote MySQL database bridge allowed the system to integrate directly with existing relational databases on cPanel hosting (`veloralb_Digital`), avoiding cloud BaaS subscription costs.

---

## Evidence
- `package.json`: Scripts (`dev`, `build`, `start`), core dependencies (`express`, `mysql2`, `vite`, `esbuild`, `tsx`).
- `vite.config.ts`: Multi-page build configuration, custom `serveAndCopyAssetsPlugin`, output paths.
- `server.ts`: Express API routes, SQL bridge executor, payment gateway webhooks, static serving.
- `src/main.ts`: `StateManager`, routing, authentication, ticket purchasing, and global event bindings.
- `src/dashboard_tabs/`: Modular tab views and business logic components.
- `src/admin_tabs/`: Administrative panel modules.
- `src/js/syncCloud.ts` & `src/js/sqlBridgeClient.ts`: Remote database synchronization mechanisms.
- `src/js/performanceOptimizer.ts`: Lazy tab loader and caching utilities.
- `src/components/ThreeLotteryDrawScene.ts`: Three.js 3D lottery drawing scene.
- `metadata.json`: "Unified authentication system with SQL Bridge (MySQL) & local profiles. Pure SQL-based architecture."
- `.env.example`: SQL bridge URL, MySQL database configuration, SMTP parameters.
- `DB_SCHEMA.md` & `API.md`: Database structure and client-side state API documentation.
