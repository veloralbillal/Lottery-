# Technology Decisions

## 1. Languages
- **TypeScript (`~5.8.2`)**:
  - *Purpose*: Primary programming language for the application frontend and backend server.
- **JavaScript (ES6+)**:
  - *Purpose*: Legacy execution language for browser scripts in `src/js/` and specialized game modules.
- **HTML5**:
  - *Purpose*: Document structuring for the primary SPA shell (`index.html`) and standalone pages.
- **PHP (Template Source Markup)**:
  - *Purpose*: Source templates in `src/dashboard_tabs/*.php` and `src/admin_tabs/*.php`, pre-bundled at build time into JavaScript string dictionaries.
- **CSS3 / PostCSS**:
  - *Purpose*: Utility-first styling via `@tailwindcss/vite` (`src/index.css`).

---

## 2. Frameworks & Core Runtimes
- **Express (`^4.21.2`)**:
  - *Purpose*: Backend HTTP framework for API endpoints, payment webhooks, and static serving.
- **Node.js (v20+ Runtime)**:
  - *Purpose*: Server execution environment.
- **React (`^19.0.1`) [DECLARED / UNUSED]**:
  - *Verification*: Declared in `package.json` but not used for UI rendering; the app uses vanilla TypeScript DOM manipulation.

---

## 3. Libraries & Packages
- **Tailwind CSS (`^4.3.1`)**: Utility-first styling engine.
- **Lucide (`^1.63.0`)**: Client-side SVG icon library with local bundling for offline use.
- **Three.js (`^0.186.1`)**: WebGL 3D graphics for lottery drawing scenes.
- **GSAP (`^3.15.0`)**: High-performance animation library.
- **Canvas Confetti (`^1.9.4`)**: Particle celebration effects.
- **MySQL2 (`^3.24.4`)**: MySQL database client for server-side SQL operations.
- **Web-Push (`^3.6.7`)**: Encrypted Web Push notification delivery.
- **JSZip (`^3.10.2`)**: In-memory ZIP decompression for plugin management.
- **Nodemailer (`^9.0.3`)**: SMTP transport for transactional emails.
- **FontAwesome 6 (CDN)**: Legacy vector icon support.
- **Chart.js (CDN)**: Financial metrics and activity charting.

---

## 4. Database & Storage
- **MySQL 8.0 / MariaDB**: Primary remote relational database.
- **Browser `localStorage`**: Primary client-side datastore for offline-first state.
- **Browser IndexedDB**: Offline mutation queue storage.

---

## 5. Authentication & Security
- **Custom Session State**: Authenticates against SQL records; stores session in `StateManager`.
- **Password Hashing**: Custom unique-salt hashing in `src/js/passwordSecurity.ts`.
- **Security PIN**: 4-digit barrier for financial withdrawals.
- **TOTP**: Dynamic 6-digit tokens for agent verification.
- **Math Captcha**: Bot mitigation for auth forms.

---

## 6. APIs & Third-Party Services
- **UddoktaPay & ZiniPay**: Bangladeshi mobile payment gateways.
- **Remote SQL HTTP Bridge**: Proxy for remote SQL operations on restrictive hosts.
- **Web Push Notifications**: Multi-device notification delivery.

---

## 7. Build & Development Tools
- **Vite (`^6.2.3`)**: Frontend build tool and dev server.
- **TSX (`^4.21.0`)**: TypeScript execution engine for development.
- **ESBuild (`^0.25.0`)**: Production server bundler.

---

## 8. Testing Tools
- **None Configured**: Automated testing is currently not implemented in the project.

---

## 9. Deployment / Platforms
- **Platform**: Node.js runtime.
- **Artifacts**: Static frontend assets and a CommonJS server bundle (`dist/server.cjs`).

---

## 10. Important Technology Trade-offs
- **Vanilla DOM vs. React**: Preserves existing HTML templates and minimizes bundle overhead but increases imperative code complexity.
- **HTTP SQL Bridge**: Enables integration with shared hosting but adds latency.
- **Local Icon Bundling**: Ensures offline reliability at the cost of slight bundle increase.
