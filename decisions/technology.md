# Technology Decisions

## 1. Languages
- **TypeScript (`~5.8.2`)**:
  - *Purpose*: Primary programming language for the application frontend (`src/**/*.ts`) and backend server (`server.ts`). Provides static typing for state managers, database entity interfaces, and API request/response payloads.
- **JavaScript (ES6+)**:
  - *Purpose*: Core execution language for browser runtime scripts in `src/js/` (e.g. `admin.js`, `luckyWheel.js`, `syncVault.js`, `notificationEngine.js`) and game modules (`src/games/`).
- **HTML5**:
  - *Purpose*: Document structuring for the primary SPA shell (`index.html`), standalone blog viewer (`blog.html`), and auxiliary dialogs/templates (`forgot_password.html`, `otp.html`, `404.html`).
- **PHP (Template Source Markup)**:
  - *Purpose*: Template markup in `src/dashboard_tabs/*.php` and `src/admin_tabs/*.php`. These files contain HTML/PHP template blocks that are read and packaged at build time by Vite into JavaScript string dictionaries (`src/js/bundledTabs.ts`). Also present as legacy root files (`index.php`, `login.php`, `deposit.php`, etc.).
- **CSS3 / PostCSS**:
  - *Purpose*: Visual layout and utility-first styling rules processed via `@tailwindcss/vite` and scoped stylesheets (`src/index.css`, `src/dashboard_tabs/*.css`).

---

## 2. Frameworks & Core Runtimes
- **Express (`^4.21.2`)**:
  - *Purpose*: Backend HTTP framework (`server.ts`). Handles API endpoints, payment webhooks, database bridge proxying, plugin file uploads, and static asset serving in production.
  - *Trade-off*: Lightweight and standard for Node.js, but requires manual routing and middleware architecture compared to full-stack opinionated frameworks like Next.js or NestJS.
- **Node.js (v20+ Runtime)**:
  - *Purpose*: Server execution environment for Express, TSX, and ESBuild.
- **React (`^19.0.1`, `react-dom`) [DECLARED / UNUSED IN RUNTIME]**:
  - *Verification*: Declared in `package.json`, but **not imported or used in the application codebase**. The frontend uses vanilla TypeScript DOM manipulation (`document.getElementById`, `innerHTML`, class toggles) and template string injection via `StateManager` in `src/main.ts`.

---

## 3. Libraries & Packages

### Actively Used in Codebase:
- **Tailwind CSS (`^4.3.1`, `@tailwindcss/vite`)**:
  - *Purpose*: Utility-first styling engine integrated directly into the Vite compilation pipeline (`@import "tailwindcss";` in `src/index.css`).
  - *Trade-off*: Eliminates custom CSS bloat and accelerates UI styling, but results in verbose HTML class attributes.
- **Three.js (`^0.186.1`, `@types/three`)**:
  - *Purpose*: WebGL 3D graphics rendering used in `src/components/ThreeLotteryDrawScene.ts` to create interactive 3D lottery balls, particle effects, and lottery drawing scenes.
- **GSAP (`^3.15.0`)**:
  - *Purpose*: High-performance timeline animation library loaded dynamically (`import("gsap")` in `src/main.ts`) for winner celebration overlays, drawer transitions, and smooth modal entrances.
- **Canvas Confetti (`^1.9.4`, `@types/canvas-confetti`)**:
  - *Purpose*: Particle celebration effects dynamically triggered upon ticket wins, daily check-in rewards, and lucky wheel jackpot spins (`src/main.ts`).
- **MySQL2 (`^3.24.4`)**:
  - *Purpose*: MySQL database client used in `server.ts` (`mysql2/promise`) for executing queries, connection testing, and cloud synchronization against MySQL 8.0 / MariaDB.
- **Multer (`^2.4.0`, `@types/multer`)**:
  - *Purpose*: Multipart form-data middleware used in `server.ts` (`/api/plugins/upload`) to handle memory-buffered zip file uploads for store plugins.
- **JSZip (`^3.10.2`, `@types/jszip`)**:
  - *Purpose*: In-memory ZIP archive decompression library used in `server.ts` to inspect and extract uploaded plugin packages into `public/plugins/`.
- **Nodemailer (`^9.0.3`, `@types/nodemailer`)**:
  - *Purpose*: SMTP transport client used in `src/js/apiEmailSender.ts` and `server.ts` (`/api/send-reset-email`) to dispatch transactional password reset tokens and verification emails.
- **Dotenv (`^17.2.3`)**:
  - *Purpose*: Loads environment configuration variables (`PORT`, `SQL_BRIDGE_URL`, `DB_NAME`, `DB_USER`, `DB_PASS`, `SMTP_*`) into `process.env`.
- **FontAwesome 6 (`6.4.0`, CDN via cdnjs)**:
  - *Purpose*: Vector icon system linked in `index.html` providing glyphs across the entire application interface (`<i class="fa-solid ...">`).
- **Chart.js (CDN via jsdelivr)**:
  - *Purpose*: Financial metrics, player activity, and deposit/withdrawal performance charts in `index.html`.

### Declared in `package.json` but Unused / Inert:
- **`@google/genai` (`^2.4.0`)**: Declared in `package.json` and `metadata.json` capability (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`), but has no active import statements in `src/` or `server.ts`.
- **`lucide-react` (`^0.546.0`)**: Declared in `package.json`; unused because the frontend is non-React and renders vector icons via FontAwesome CDN classes.
- **`motion` (`^12.23.24`)**: Declared in `package.json`; not imported in application source files.
- **`@vitejs/plugin-react` (`^5.0.4`)**: Declared in `package.json`; not registered in `vite.config.ts`.

---

## 4. Database & Storage
- **MySQL 8.0 / MariaDB (`veloralb_Digital`)**:
  - *Purpose*: Primary remote relational database holding server records (`users`, `lotteries`, `tickets`, `deposits`, `withdrawals`, `settings`, `notifications`, `push_subscriptions`).
  - *Access Method*: HTTP PHP Database Bridge (`https://api.veloralbillal.top/db_bridge.php`) authenticated via security token (`Billal50598326`) and fallback connection via `mysql2/promise`.
- **Browser `localStorage`**:
  - *Purpose*: Primary client-side datastore (`lottery_winner_db`). Stores full application state locally for instant reads and writes without network latency.
- **Browser IndexedDB**:
  - *Purpose*: Offline queue storage managed via `OfflineQueueManager` (`src/js/syncQueue.js`) to stage mutations when offline.
- **Server Local File System**:
  - *Purpose*: Storage directory (`public/plugins/`) for extracted store extensions and assets.

---

## 5. Authentication & Security
- **Custom Client/Server Session State**:
  - *Purpose*: Authenticates users by matching credentials against local and remote SQL database records; stores authenticated session in `db.currentUser`.
- **4-Digit Cashout Security PIN**:
  - *Purpose*: Required secondary security barrier before initiating withdrawal transactions (`src/dashboard_tabs/wallet_extensions.ts`).
- **TOTP (Time-Based One-Time Password)**:
  - *Purpose*: In-app 6-digit dynamic token generator with 30-second rotation cycles (`src/js/totp.ts`) for in-person cashout verification at authorized agent desks.
- **Math Captcha Engine**:
  - *Purpose*: Dynamic client-side arithmetic challenge (`window.generateMathCaptcha`) embedded in authentication modals to thwart automated bot spam.
- **SQL Bridge Secret Token**:
  - *Purpose*: Static token authentication (`Billal50598326`) protecting the HTTP database bridge endpoint against unauthorized external queries.

---

## 6. APIs & Third-Party Services
- **UddoktaPay Payment Gateway**:
  - *Endpoints*: `/api/uddoktapay/create-checkout`, `/api/uddoktapay/verify-payment`, `/api/uddoktapay/webhook`.
  - *Purpose*: Real-time automated mobile payment processing for bKash, Nagad, and Rocket in Bangladesh.
- **ZiniPay Payment Gateway**:
  - *Endpoints*: `/api/zinipay/create-checkout`, `/api/zinipay/verify-payment`, `/api/zinipay/webhook`.
  - *Purpose*: Alternative instant payment checkout and verification gateway.
- **Remote SQL HTTP Bridge (`db_bridge.php`)**:
  - *Host*: `https://api.veloralbillal.top/db_bridge.php`.
  - *Purpose*: HTTP-based database query proxy enabling remote SQL operations on shared hosting where external port 3306 is blocked.
- **Web Push Notifications API**:
  - *Endpoint*: `/api/push/subscribe`.
  - *Purpose*: Multi-device push notification subscription manager storing `p256dh` and `auth` credentials.

---

## 7. Build & Development Tools
- **Vite (`^6.2.3`)**:
  - *Purpose*: Frontend build tool and development server. Configured with a multi-page rollup entry (`index.html`, `blog.html`) and custom PHP template pre-bundling plugin.
- **TSX (`^4.21.0`)**:
  - *Purpose*: Zero-config TypeScript execution engine for Node.js development (`"dev": "tsx server.ts"`).
- **ESBuild (`^0.25.0`)**:
  - *Purpose*: High-speed bundler that compiles `server.ts` into a single standalone production file (`dist/server.cjs`) with externalized dependencies and source maps.
- **Autoprefixer (`^10.4.21`)**:
  - *Purpose*: PostCSS plugin ensuring cross-browser CSS prefix compatibility.

---

## 8. Testing Tools
- **None Configured**:
  - *Verification*: `package.json` contains `"lint": "echo 'No lint check needed'"`. There are no automated unit testing libraries (Vitest, Jest) or end-to-end testing frameworks (Playwright, Cypress) installed in the project.

---

## 9. Deployment / Platforms
- **Platform**: Node.js runtime environment.
- **Build Artifacts**:
  - Frontend: Static HTML, JS, CSS, and asset bundles emitted to `dist/`.
  - Backend: CommonJS server bundle emitted to `dist/server.cjs`.
- **Process Entry**: `npm start` -> `node dist/server.cjs`.

---

## 10. Important Technology Trade-offs
- **Vanilla DOM State Manager vs. React / Virtual DOM Framework**:
  - Direct manipulation in `StateManager` eliminates virtual DOM diffing overhead and keeps initial bundle sizes minimal, but increases code size and imperative complexity in files like `src/main.ts` (10,000+ lines).
- **HTTP SQL Bridge vs. Direct Database Connection**:
  - Enables seamless database integration with cPanel shared hosting servers without firewall reconfiguration, but adds HTTP serialization latency and reliance on a static token.
- **Dynamic Imports (`gsap`, `canvas-confetti`)**:
  - Reduces initial load time by deferring heavy animation libraries until a celebratory event actually occurs in the UI.
