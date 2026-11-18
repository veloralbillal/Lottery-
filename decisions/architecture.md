# Architectural Decisions

## 1. Architecture Pattern
- **CONFIRMED**: **Hybrid Single Page Application (SPA) with Multi-Entry Standalone Pages**:
  - The primary application shell is a client-side Single Page Application bundled with Vite (`index.html` -> `src/main.ts`).
  - Standalone dedicated HTML entry points exist to isolate heavy content management and moderation tasks from the main lottery portal without incurring monolithic bundle overhead (`blog.html`, `comments.html`, `admin-blog-editor.html`, `admin-categories.html`, `admin-category-editor.html`, `admin-articles.html`), configured as multi-page inputs in `vite.config.ts`.
- **CONFIRMED**: **Centralized Singleton State Management (`StateManager`)**:
  - Global client state is orchestrated via `StateManager` (now modularized in `src/state_suite/`). State includes user session data, active tabs, lottery pools, transaction history, notification queues, and wallet balances.
- **CONFIRMED**: **Multi-Tier Offline-First & Real-Time State Persistence**:
  - **Tier 1 (Local Storage)**: Primary runtime state is persisted locally in browser `localStorage` under the key `lottery_winner_db` (with backup keys `lw_lottery_db_v3` and `lottery_winner_db_backup`). Mutating actions trigger `app.saveDB()` for instant local durability.
  - **Tier 2 (BroadcastChannel API)**: Cross-tab / cross-window state synchronization is broadcasted in real time via the HTML5 `BroadcastChannel` (`lw_realtime_db_sync`), notifying open tabs to update immediately without full page reloads.
  - **Tier 3 (Storage Event Listener)**: Fallback cross-window listener `window.addEventListener("storage", ...)` detects modifications to database storage keys.
  - **Tier 4 (Cloud SQL Synchronization)**: Asynchronous background sync (`/api/sql/sync`, `/api/sql/db`) and external HTTP PHP bridge queries (`db_bridge.php`) synchronize records across MySQL tables.
  - **Tier 5 (Offline Action Queue)**: Offline mutations (ticket purchases, deposits, withdrawals) are captured by `OfflineQueueManager` (`src/js/syncQueue.js`) backed by browser IndexedDB and replayed once connectivity resumes.
- **CONFIRMED**: **Build-Time PHP Template Bundling**:
  - User dashboard screens (`src/dashboard_tabs/*.php`) and admin panels (`src/admin_tabs/*.php`) are authored in PHP/HTML markup.
  - A custom Vite build plugin (`serveAndCopyAssetsPlugin` in `vite.config.ts`) pre-bundles these templates into a static TypeScript string dictionary (`src/js/bundledTabs.ts`). They have also been split into individual module files in `src/state_suite/templates/` for improved maintainability.
- **INFERRED**: Direct DOM manipulation with template string interpolation was chosen over virtual DOM frameworks to preserve legacy PHP/HTML UI templates without rewriting entire screens into JSX components.

---

## 2. Frontend / Backend Separation
- **CONFIRMED**:
  - **Frontend Client**: Pure client-side TypeScript and JavaScript executing in the browser. Uses Vite for asset compilation, Tailwind CSS v4 (`@tailwindcss/vite`) for utility styling, Lucide (`lucide: ^1.63.0`) for local vector icons, FontAwesome 6 (CDN) for legacy icon classes, Chart.js (CDN) for financial data visualization, Three.js (`src/components/ThreeLotteryDrawScene.ts`) for 3D drawing canvas scenes, and GSAP/Canvas Confetti for celebration visual effects.
  - **Backend Server**: Node.js Express application (`server.ts`) listening on port 3000. Serves as a decoupled API gateway, SQL bridge executor, payment webhook receiver, plugin extractor, Web Push manager, and static asset server. In development, it integrates Vite development middleware via `vite.middlewares`. In production, it serves pre-compiled assets from `dist/` and falls back to `dist/index.html` for client-side routing.

---

## 3. Major Modules and Responsibilities
- **CONFIRMED**:
  - `src/main.ts`: Application kernel entry point; initializes the `StateManager` and routes to the modularized kernel in `src/state_suite/`.
  - `server.ts`: Backend API hub; exposes SQL bridge synchronization endpoints (`/api/sql/*`), payment gateway handlers (`/api/uddoktapay/*`, `/api/zinipay/*`), email dispatch (`/api/send-reset-email`), plugin archive upload and extraction (`/api/plugins/upload`), notifications, and push subscription storage (`/api/push/subscribe`).
  - `src/state_suite/`: **CONFIRMED**: Modularized rewrite of the massive application kernel (formerly monolithic `src/main.ts`). Responsibilities are segregated into `StateManager.ts`, `boot.ts`, `database.ts`, `navigation.ts`, `rendering.ts`, `security.ts`, and `session.ts`.
  - `src/agent_suite/`: **CONFIRMED**: Modularized rewrite of the Agent Suite. Contains specialized sub-modules for core logic (`AgentCore.ts`), navigation (`AgentNavigation.ts`), panel rendering (`AgentPanels.ts`), chat (`AgentChat.ts`), and polling (`AgentPolling.ts`).
  - `src/chat_profile/`: **CONFIRMED**: Modularized rewrite of the Chat & Profile system. Segregates responsibilities into `ChatSystem.ts`, `ProfileSystem.ts`, `CallSystem.ts`, `GiftSystem.ts`, and `UIRenderer.ts`.
  - `src/extra_games/`: **CONFIRMED**: Modularized rewrite of the Extra Games system. Contains `ExtraGamesCore.ts` and individual game logic files in `games/` (Aviator, Crash, Plinko, etc.).
  - `src/admin_suite/`: **CONFIRMED**: Modularized rewrite of the massive Admin Panel controller. Contains `AdminCore.ts` and specialized tab modules in `tabs/`.
  - `src/dashboard_tabs/`: User-facing modular tabs (Home, Wallet, Tickets, Deposit, Withdraw, Profile, Games Hub, Jackpot, Missions, Refer, Group Chat, Blog).
  - `src/admin_tabs/`: Administrative control panel modules for lottery pools, draws, transactions, player management, and site settings.
  - `src/js/syncCloud.ts` & `src/js/sqlBridgeClient.ts`: Client-side remote cloud synchronizer; executes direct HTTP SQL bridge queries and pushes database snapshots.
  - `src/js/performanceOptimizer.ts`: Performance infrastructure featuring `LazyTabManager`, `GlobalCache`, debounce, throttle, and tab lifecycle observers.
  - `src/components/ThreeLotteryDrawScene.ts`: Three.js WebGL canvas rendering 3D lottery spheres and particles.

---

## 4. Data Flow
- **CONFIRMED**:
  1. **User Interaction**: Event listeners invoke methods on `StateManager` or tab modules.
  2. **In-Memory State Mutation**: `StateManager` updates the in-memory database object (`this.db`).
  3. **Local Persistence**: State changes immediately invoke `this.saveDB()`, serializing to `localStorage`.
  4. **Cross-Tab Synchronization**: `BroadcastChannel` notifies other tabs to update state.
  5. **DOM Re-Rendering**: The active view is updated via dynamic template injection.
  6. **Remote SQL Synchronization**: Asynchronously sends state deltas to the SQL bridge (`server.ts` or `db_bridge.php`).
  7. **Offline Fallback**: `OfflineQueueManager` enqueues failed mutations and replays them when online.

---

## 5. API Communication
- **CONFIRMED**:
  - **Internal REST APIs**: Communication with Express backend over HTTP/JSON (`/api/*`).
  - **SQL Bridge Gateway**: Server queries remote MySQL via `mysql2/promise` or external PHP bridge (`db_bridge.php`).
  - **Fetch Interceptor**: `installUniversalSqlBridgeFetchInterceptor()` routes client queries through the active SQL bridge.
  - **Payment Webhooks**: Inbound endpoints for UddoktaPay and ZiniPay.
  - **Web Push Service**: Push notification subscription registration via `/api/push/subscribe`.

---

## 6. Authentication & Authorization Architecture
- **CONFIRMED**:
  - **Authentication**: Custom session-based authentication validated against MySQL / `localStorage`.
  - **Role-Based Access Control (RBAC)**: Tiers: `user`, `agent`, `subagent`, `moderator`, `admin`.
  - **Security PIN**: 4-digit PIN required for withdrawals.
  - **TOTP**: 6-digit rolling OTP for agent-assisted cashouts.
  - **Bot Mitigation**: Mathematical captcha integrated into auth forms.

---

## 7. Database Architecture
- **CONFIRMED**:
  - **Dual-Layer**: Client-side `localStorage` (JSON graph) and Remote Relational (MySQL 8.0).
  - **Relational Tables**: `users`, `lotteries`, `tickets`, `deposits`, `withdrawals`, `transactions`, `notifications`, `settings`, `blogs`, etc.
  - **Failover**: IndexedDB for offline mutation staging.

---

## 8. External Services & Integrations
- **CONFIRMED**:
  - **Payment Gateways**: UddoktaPay, ZiniPay.
  - **Communication**: Nodemailer (SMTP), Web Push (VAPID).
  - **Libraries**: FontAwesome 6 (CDN), Chart.js (CDN).

---

## 9. Deployment & Infrastructure Architecture
- **CONFIRMED**:
  - **Runtime**: Node.js (v20+).
  - **Dev Mode**: `tsx server.ts` (Express + Vite middleware).
  - **Production Build**: `vite build` (frontend) + `esbuild server.ts` (backend bundle).
  - **Hosting**: Designed for compatibility with both Node.js servers and static hosting (via SQL Bridge).

---

## 10. Important Architectural Trade-offs
- **CONFIRMED**:
  - **Client-Side Persistence**: Instant transitions but requires synchronization logic.
  - **Template Bundling**: Standardizes Node.js stack but precludes dynamic server-side PHP evaluation.
  - **SQL Bridge**: Enables shared hosting integration but adds request overhead.
  - **Modularization**: Resolves maintenance complexity of massive files but increases total file count.

---

## 11. Why the Current Architecture Appears to Have Been Chosen
- **INFERRED**:
  - The project evolved from a legacy PHP app; the current architecture preserves UI layouts while modernizing the frontend into a performant SPA/MPA hybrid.
  - The SQL Bridge was implemented to allow the app to operate on restrictive cPanel environments while benefiting from modern JavaScript build tools.

---

## 12. Evidence
- `package.json`, `vite.config.ts`, `server.ts`.
- `src/main.ts` (modular entry point).
- `src/state_suite/` (modular kernel).
- `src/dashboard_tabs/` and `src/admin_tabs/`.
- `index.html` (multi-page entry points).
