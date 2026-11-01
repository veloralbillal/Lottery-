# PHP & MySQL Security Audit & Hardening Report

## Executive Summary
A comprehensive security audit of the PHP + MySQL web application and administration panel was conducted. Critical vulnerabilities across authentication, broken object-level authorization, arbitrary SQL execution, session management, CSRF, insecure randomness in lottery draws, and potential file upload execution were identified, mitigated, and verified.

All fixes were implemented while **strictly preserving** the existing visual design, Tailwind CSS styling, 390px mobile responsiveness, database schema, route compatibility, and business logic.

---

## 1. Vulnerability Assessment & Severity Matrix

| ID | Component / Endpoint | Vulnerability Description | Severity (CVSS) | Status |
|---|---|---|---|---|
| **VULN-01** | `public/db_bridge.php` | Remote Arbitrary SQL Execution / Remote DB Takeover via unauthenticated API bridge allowing blank tokens and arbitrary queries. | **CRITICAL (9.8)** | **RESOLVED** |
| **VULN-02** | `backend/api/admin.php` | Broken Object Level Authorization: Admin operations trusted client-supplied `userId` without validating session authentication. | **CRITICAL (9.1)** | **RESOLVED** |
| **VULN-03** | `login.php` & `login_page.php` | Hardcoded Admin Password Backdoor (`Admin123`), plain-text password fallback without upgrade, and missing session ID rotation (`session_regenerate_id`). | **HIGH (8.5)** | **RESOLVED** |
| **VULN-04** | `src/admin.php` & `payment.php` | Missing CSRF token validation on critical state-changing POST actions (pool deletion, lottery creation, deposit/withdrawal decisions). | **HIGH (8.3)** | **RESOLVED** |
| **VULN-05** | `deposit.php` | Missing Idempotency / Duplicate TrxID prevention allowing replay attacks, lack of rate limiting, and technical error disclosure. | **HIGH (8.1)** | **RESOLVED** |
| **VULN-06** | `backend/api/checkout.php` | Missing session ownership validation on balance deductions and missing `FOR UPDATE` row-level locks on wallet balances. | **HIGH (8.1)** | **RESOLVED** |
| **VULN-07** | `src/config.php` & `src/admin.php` | Insecure pseudo-random number generator (`array_rand()`) used for lottery winner selection instead of cryptographically secure RNG. | **HIGH (7.8)** | **RESOLVED** |
| **VULN-08** | `login.php` & `login_page.php` | Missing brute-force protection and account enumeration via distinct error messages. | **HIGH (7.5)** | **RESOLVED** |
| **VULN-09** | `profile.php` | Missing image magic byte/MIME type validation and file size check on user avatar uploads; missing CSRF protection. | **MEDIUM (6.8)** | **RESOLVED** |
| **VULN-10** | `backend/api/download.php` | Path traversal risk on download file paths (`../` manipulation). | **MEDIUM (6.5)** | **RESOLVED** |
| **VULN-11** | `src/config.php` & `backend/config/database.php` | Production information disclosure: `display_errors = 1` and raw `$e->getMessage()` leaked database credentials and internal queries. | **MEDIUM (6.2)** | **RESOLVED** |
| **VULN-12** | Apache Shared Hosting / Web Root | Missing `.htaccess` security headers, lack of directory listing protection, and unrestricted executable script execution in `/uploads/`. | **MEDIUM (6.0)** | **RESOLVED** |

---

## 2. File-by-File Security Hardening Overview

### A. Central Configuration & Security Architecture (`src/config.php` & `config.php`)
- **Error Concealment**: Disabled `display_errors` (`ini_set('display_errors', 0)`); enabled server-side error logging (`ini_set('log_errors', 1)`).
- **HTTP Security Headers**: Sent `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`.
- **Session Hardening**: Enforced `HttpOnly`, `SameSite=Lax`, and `Secure` (dynamic HTTPS detection) cookie flags.
- **Session Timeout Engine**: Implemented 30-minute idle session timeout and 8-hour absolute session expiration.
- **CSRF Token Engine**: Centralized constant-time verification functions `csrf_token()` and `verify_csrf_token()`.
- **Persistent Rate Limiter**: Implemented `check_rate_limit()` and `reset_rate_limit()` backed by `rate_limits` table with session fallback.
- **Security Audit Logger**: Centralized `record_audit_log()` recording actor IDs, usernames, actions, client IP (with Cloudflare/proxy support), and user agent.
- **Cryptographic Randomness**: Integrated `secure_random_int()` replacing `array_rand()` in lottery draws.
- **Shared Hosting Root Proxy**: Created root `config.php` wrapper pointing to `src/config.php` for seamless hosting compatibility.

### B. Authentication Security (`login.php` & `login_page.php`)
- **Backdoor Removal**: Eliminated hardcoded `Admin123` bypass; admin password is now verified against database hash.
- **Seamless Password Migration**: Verifies passwords using `password_verify()`. If legacy plaintext matches on first login, it is immediately upgraded to Argon2id/PASSWORD_DEFAULT and re-hashed in the database.
- **Session Fixation Defense**: Calls `session_regenerate_id(true)` immediately upon successful login.
- **Brute-Force Defense**: Added rate limiting (max 5 failed attempts per 15 minutes per user/IP).
- **Anti-Enumeration**: Standardized error messages to "Invalid username or password credentials".
- **CSRF Protection**: Form in `login_page.php` now includes and verifies CSRF tokens.

### C. Administrative Control Room (`src/admin.php`, `admin_header.php`, `payment.php`)
- **Strict Role Validation**: Enforced `is_admin_logged_in()` check on all admin endpoints.
- **CSRF Protection**: Injected CSRF tokens into all forms (`create_lottery`, `delete_lottery`, `force_draw`, `verify_deposit`, `verify_withdrawal`, `update_user`, and `update_gateways`) and verified on every POST.
- **RNG Upgrade**: Lottery draw winner selection now uses `secure_random_int(0, count($tickets) - 1)` for provably fair selection.
- **Row Locking**: Financial approvals (`verify_deposit`, `verify_withdrawal`) use `FOR UPDATE` row locks inside database transactions.
- **Audit Logging**: Recorded all administrative actions with actor metadata.

### D. Wallet & Financial Endpoints (`deposit.php` & `withdrawal.php`)
- **Deposit Idempotency**: Added `SELECT id FROM deposits WHERE LOWER(trxId) = LOWER(?)` check to prevent duplicate credits or replay attacks.
- **Withdrawal Atomicity**: Enforced `FOR UPDATE` row locks on user balances during withdrawals inside transactional blocks.
- **Account State Verification**: Blocked accounts are immediately denied withdrawal execution.
- **Rate Limiting**: Throttled deposit (max 5 per 5 mins) and withdrawal submissions.

### E. Remote API & Bridge Protection (`public/db_bridge.php`, `backend/api/admin.php`, `backend/api/checkout.php`, `backend/api/download.php`)
- **Eliminated Arbitrary SQL**: `public/db_bridge.php` now strictly validates the secret token using `hash_equals()`, removes blank-token bypasses, rejects client credential overrides, and blocks destructive DDL/DML and multi-statement queries.
- **Session-Authenticated Admin API**: `backend/api/admin.php` requires a valid authenticated admin session or Bearer secret token instead of trusting client-supplied `userId`.
- **Checkout Session Ownership**: `backend/api/checkout.php` checks that the active session matches `userId` before deducting balances with `FOR UPDATE` locks.
- **Path Traversal Defense**: `backend/api/download.php` wraps filenames with `basename()` to prevent directory traversal.

### F. Apache Shared Hosting Hardening (`.htaccess` & `/uploads/.htaccess`)
- Disabled directory indexing (`Options -Indexes`).
- Blocked public access to hidden files (`.git`, `.env*`) and sensitive extensions (`.json`, `.sql`, `.md`, `.log`, `.lock`).
- Configured security headers via Apache `mod_headers`.
- Placed an `.htaccess` in `/uploads/` to deny execution of `.php`, `.phtml`, `.cgi`, or script files.

---

## 3. List of Modified & Created Files

### Modified Files:
1. `/src/config.php`
2. `/login.php`
3. `/login_page.php`
4. `/logout.php`
5. `/register.php`
6. `/header.php`
7. `/src/admin.php`
8. `/payment.php`
9. `/deposit.php`
10. `/withdrawal.php`
11. `/profile.php`
12. `/public/db_bridge.php`
13. `/backend/api/admin.php`
14. `/backend/api/checkout.php`
15. `/backend/api/download.php`
16. `/backend/config/database.php`
17. `/src/admin_tabs/create_pool.php`
18. `/src/admin_tabs/pools.php`
19. `/src/admin_tabs/deposits.php`
20. `/src/admin_tabs/withdrawals.php`
21. `/src/admin_tabs/players.php`

### Created Files:
1. `/config.php` (Root configuration loader proxy)
2. `/admin_header.php` (Root admin header guard)
3. `/src/admin_header.php` (Proxy header loader)
4. `/admin.php` (Root admin portal proxy)
5. `/.htaccess` (Root Apache shared hosting security configuration)
6. `/uploads/.htaccess` (Uploads script execution barrier)

---

## 4. Testing Results

| Test Scenario | Verification Procedure | Result |
|---|---|---|
| **Unauthenticated Admin Access** | Attempted access to `/admin.php` without session credentials. | **PASSED** (Redirected to `login_page.php?error=unauthorized`) |
| **CSRF Validation** | Sent POST requests to administrative actions without valid CSRF token. | **PASSED** (Request rejected with 400/403 security warning) |
| **Login Brute-Force Rate Limiting** | Repeated failed login attempts beyond threshold. | **PASSED** (Rate limit triggered, 429 response emitted) |
| **Session Fixation Defense** | Inspected session IDs across login and logout cycles. | **PASSED** (`session_regenerate_id(true)` executed) |
| **Arbitrary SQL Bridge Guard** | Tested `public/db_bridge.php` with missing token and DDL queries. | **PASSED** (401 Unauthorized / destructive queries blocked) |
| **Duplicate Deposit Prevention** | Submitted existing `trxId` to `deposit.php`. | **PASSED** (409 Conflict returned, duplicate credit prevented) |
| **Wallet Concurrency & Overdraft** | Tested withdrawal requests exceeding wallet balance. | **PASSED** (Rejected with 400 Insufficient Balance, atomic rollback) |
| **Avatar Upload MIME/Size Check** | Validated file size (>5MB) and non-image extension rejection. | **PASSED** (Restricted to safe image formats with magic byte checks) |
| **Path Traversal Defense** | Tested `download.php` with traversal payloads in filename. | **PASSED** (`basename()` sanitized path, traversal blocked) |
| **Compilation & Bundle Integrity** | Ran `compile_applet` Vite build. | **PASSED** (0 build errors, clean bundle) |

---

## 5. Shared Hosting Deployment Checklist

When deploying to cPanel / Apache shared hosting:
1. **File Upload**: Upload all project files to `public_html` (or your subdomain document root).
2. **Hidden Files**: Ensure `.htaccess` and `uploads/.htaccess` are uploaded (enable "Show Hidden Files" in cPanel File Manager).
3. **Database Credentials**: Configure `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` in `src/config.php` or through cPanel Environment Variables.
4. **Permissions**: Set directories to `0755` and files to `0644`. Ensure `/uploads` is writable (`0755` or `0775`).
5. **Installer Protection**: After verifying the database installation, either delete `install.php` or uncomment the deny rule in `/.htaccess`.
6. **HTTPS Enforcement**: Ensure your SSL certificate (AutoSSL / Let's Encrypt) is active. The hardened cookie parameters will automatically enforce `Secure` flags over HTTPS.

---

## 6. Rollback Instructions

If a rollback is ever needed on shared hosting:
1. Restore original PHP controllers from your backup directory or version control.
2. The newly created database tables (`security_audit_logs` and `rate_limits`) do not interfere with existing tables; they can remain or be dropped without impacting user data:
   ```sql
   DROP TABLE IF EXISTS rate_limits;
   DROP TABLE IF EXISTS security_audit_logs;
   ```
3. Remove `/.htaccess` and `/uploads/.htaccess` if your host requires legacy directives.

---

## 7. Security Tab, 2-Factor Authentication (2FA) & Rate Limiting Integration

### A. Dedicated Security Control Room (`#admin-tab-security` & `src/admin_tabs/security.php`)
- **Real-Time Security Metrics**: Displays live counters for Security Audits Recorded, Failed Login Attempts, and Active Throttled Keys.
- **Audit Logs Telemetry**: Live tabular audit log with timestamp, actor, event badge, source IP, and sanitized payload details. Features "Prune Old Logs" to maintain clean storage.
- **Throttled Keys & Rate Limiting Table**: Live monitor of throttled IP keys, attempt counts, and lockout countdowns with one-click "Unlock All Keys" action.
- **Admin Passcode Modification**: Secure form to update administrative passcode with minimum 8 characters, confirmation verification, and mandatory 2FA challenge when enabled.

### B. 2-Factor Authentication (2FA) Policy Engine
- **Master 2FA Toggle**: Allows administrators to toggle two-factor authentication requirement globally.
- **Customizable 6-Digit PIN**: Stores administrator 6-digit verification code (`829401` default / customizable).
- **Emergency Recovery Backup Codes**: Generates 5 one-time recovery backup codes (`LW-9821`, `LW-4412`, `LW-7729`, `LW-3184`, `LW-5590`) for recovery without lockout.
- **Granular Enforcement Checkpoints**:
  1. **Login Page (`enforceOnLogin`)**: Intercepts user and administrator sign-in upon password validation and displays the `#two-factor-auth-modal`. Access is only granted after inputting the 6-digit PIN or a valid emergency backup code.
  2. **Wallet Withdrawals (`enforceOnWithdraw`)**: Protects player and agent fund payouts. Submitting a withdrawal requires 2FA confirmation before debiting user balances.
  3. **Credential Changes (`enforceOnCredentials`)**: Intercepts passcode changes in the admin panel and requires 2FA verification before updating stored hashes.
  4. **Financial Adjustments (`enforceOnFinance`)**: Guards balance adjustments and manual payout approvals with mandatory 2FA challenge.

### C. Rate Limiting & Brute-Force Policy Configurator
- **Max Login Attempts**: Configurable threshold (default: 5 failed attempts) before temporary lockout.
- **Lockout Duration**: Configurable decay window (default: 15 minutes) with live countdown remaining.
- **Sensitive Request Throttling**: Limits critical API calls (default: 10 req/min) to prevent automated credential stuffing and payment replay.
- **Persistent Storage**: Saved in `settings.rateLimitPolicy` and verified server-side with audit logging on every policy modification.
