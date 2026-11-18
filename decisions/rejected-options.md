# Rejected, Replaced & Abandoned Options

## 1. Firebase Integration
- **Option**: Google Firebase (Firestore, Auth, Storage).
- **Decision**: Replaced / Abandoned.
- **Evidence**: `server.ts` line 3 explicitly states removal. Database health checks return "Firebase removed".
- **Reason**: Transitioned to a pure SQL-based architecture with a remote MySQL bridge to avoid vendor lock-in and pricing tiers.
- **Alternative**: MySQL/MariaDB with an HTTP PHP bridge.

---

## 2. Drizzle ORM with PostgreSQL
- **Option**: Drizzle ORM and PostgreSQL.
- **Decision**: Replaced / Abandoned.
- **Evidence**: Drizzle dependencies are absent from `package.json`. Queries are executed as raw SQL strings in `server.ts`.
- **Reason**: Avoided ORM complexity and schema migration overhead in favor of direct SQL execution.
- **Alternative**: Parameterized raw SQL over the bridge.

---

## 3. Classic Server-Side PHP Runtime
- **Option**: Multi-page PHP-rendered architecture.
- **Decision**: Re-architected into Vite SPA.
- **Evidence**: `vite.config.ts` bundles PHP templates into TS strings. Root PHP files are retained only for legacy/static compatibility.
- **Reason**: Modernized for offline capability, instant transitions, and Node.js runtime compatibility.
- **Alternative**: SPA with dynamic template injection from `src/state_suite/templates/`.

---

## 4. React Component Architecture
- **Option**: Full React/JSX reconstruction of UI.
- **Decision**: Avoided / Inert.
- **Evidence**: React is listed in `package.json` but `vite.config.ts` lacks the React plugin, and `src/` uses no JSX or hooks.
- **Reason**: Preserved existing HTML/PHP layout templates to avoid a massive rewrite.
- **Alternative**: Vanilla TypeScript state management and DOM manipulation.

---

## 5. Monolithic Controller Scripts
- **Option**: 100KB+ feature controllers (Agent Suite, Admin Panel, Main App Kernel).
- **Decision**: Refactored / Modularized.
- **Evidence**: `src/main.ts` reduced from ~490KB to <1KB. `src/state_suite/`, `src/admin_suite/`, `src/agent_suite/` contain the new modular logic. `src/js/bundledTabs.ts` has been split into `src/state_suite/templates/`.
- **Reason**: Massive files caused maintenance complexity and "file too large" errors during development.
- **Alternative**: Domain-separated TypeScript modules.

---

No other verified rejected options were found in the current project.
