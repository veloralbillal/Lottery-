# Rejected, Replaced & Abandoned Options

## 1. Firebase Integration (Firestore, Authentication & Storage)
- **Option**: Google Firebase Backend-as-a-Service (Firestore real-time database, Firebase Authentication, and Firebase Cloud Storage).
- **Decision**: Replaced / Abandoned
- **Evidence**:
  - `server.ts` line 3: Explicit comment: `// Firebase integration removed for pure SQL bridge architecture`.
  - `server.ts` lines 2035–2042: Database health check returns:
    ```json
    firebase: {
      connected: false,
      recordCount: 0,
      lastSuccessfulSync: null,
      pendingSync: 0,
      failedSync: 0,
      error: 'Firebase removed'
    }
    ```
  - `src/main.ts` line 6: `// Firebase removed per user request`.
  - `src/js/syncCloud.ts` line 1: `// Firebase removed per user request for SQL-only bridge architecture.`.
  - `src/js/syncVault.js` line 4: `// Firebase Firestore removed`.
  - `src/js/admin.js` line 5: `// Firebase Storage removed`.
  - `metadata.json`: Explicitly defines `"description": "Unified authentication system with SQL Bridge (MySQL) & local profiles. Pure SQL-based architecture..."`.
  - `vite.config.ts` line 59: `fallbackFirebaseConfig` is retained only as a null placeholder for bundle backwards compatibility.
- **Reason**: Transitioned from proprietary Google Cloud Firebase services to an open, self-hosted relational MySQL database architecture with a dedicated HTTP bridge and local browser state persistence.
- **Current Alternative**: MySQL 8.0 / MariaDB accessed via `mysql2/promise` and an HTTP PHP database bridge (`https://api.veloralbillal.top/db_bridge.php`), paired with client-side session management in `StateManager` (`src/main.ts`).
- **Impact**: Completely removed dependency on Firebase SDKs, eliminated external cloud BaaS vendor lock-in and pricing tiers, and unified data storage under standard SQL tables (`users`, `lotteries`, `tickets`, `deposits`, `withdrawals`).

---

## 2. Drizzle ORM with PostgreSQL / Cloud SQL
- **Option**: Drizzle ORM and a secondary relational PostgreSQL / Cloud SQL database.
- **Decision**: Replaced / Abandoned
- **Evidence**:
  - `app_knowledge.txt` line 51 lists: `Relational Server (Secondary/Legacy): PostgreSQL / Cloud SQL via Drizzle ORM.`
  - In `package.json`, neither `drizzle-orm`, `drizzle-kit`, `pg`, nor `@neondatabase/serverless` is installed or listed.
  - In `server.ts` lines 116–272, SQL queries are executed directly as raw parameterized SQL strings using `mysql2/promise` and the custom PHP bridge (`db_bridge.php`) targeting MySQL/MariaDB (`veloralb_Digital`), with no Drizzle schema definitions or PostgreSQL connection pools present in source code.
- **Reason**: The project avoided the complexity of maintaining schema migrations and dual ORM abstractions in favor of direct, lightweight SQL string execution routed over an HTTP bridge.
- **Current Alternative**: Parameterized raw SQL execution over the HTTP SQL Bridge (`db_bridge.php`) and `mysql2/promise` targeting MySQL 8.0.
- **Impact**: Avoids ORM build overhead, reduces bundle complexity, and eliminates the need for a dedicated PostgreSQL / Cloud SQL database instance.

---

## 3. Classic Server-Side PHP Runtime & Multi-Screen Architecture
- **Option**: Multi-page server-rendered PHP architecture running on Apache / PHP-FPM.
- **Decision**: Replaced / Re-architected into Vite Single Page Application (SPA)
- **Evidence**:
  - `app_knowledge.txt` line 7: States the app was originally `designed to run seamlessly both as a Single Page Application (SPA)... and as a classic PHP multi-screen platform.`
  - The repository contains legacy standalone PHP entry points in the project root (`index.php`, `login.php`, `deposit.php`, `withdrawal.php`, `profile.php`, `install.php`).
  - In `vite.config.ts` lines 6–78, a custom plugin (`serveAndCopyAssetsPlugin`) bundles all PHP dashboard and admin templates (`src/dashboard_tabs/*.php`, `src/admin_tabs/*.php`) into a TypeScript string map (`src/js/bundledTabs.ts`).
  - In `src/main.ts` line 743 and `src/js/performanceOptimizer.ts` line 246, `LazyTabManager.loadTabTemplate` dynamically injects the pre-bundled HTML template strings directly into the client-side DOM.
- **Reason**: The application was modernized into a unified, zero-reload Single Page Application running under Node.js and Vite to enable instant client-side tab transitions, offline caching, and hosting on modern JavaScript platforms without a PHP server runtime.
- **Current Alternative**: Single Page Application (SPA) with dynamic DOM template loading from `src/js/bundledTabs.ts` and API endpoints powered by Node.js Express (`server.ts`).
- **Impact**: Enables offline capability, rapid tab switching without page refreshes, and consistent bundling with Vite while reusing existing PHP/HTML markup.

---

No other verified rejected options were found in the current project.
