# Digital Store Architecture & Integration Plan

Comprehensive architectural blueprint to add a professional, high-performance Digital Store (SaaS, themes, codes, scripts, design templates) to the Lottery App. This solution achieves complete decoupling between a 100% static-ready HTML/TS frontend and a secure external PHP 8.2+ & MySQL backend.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> To ensure seamless operations and robust security across subdomains (`digital.yourdomain.com` for frontend and `api.yourdomain.com` for API), the following core architectural decisions have been integrated:

- **Frontend SPA Integration (Confirmed)**: The Digital Store will load as a dedicated responsive section (`tab-digital-store`) inside the existing SPA dashboard, maintaining design language parity.
- **Backend Architecture (Confirmed)**: A new isolated `/backend` directory will contain the entire PHP codebase (controllers, models, uploads, configuration) to be deployed onto PHP/MySQL hosting separately.
- **Cross-Domain Session Handling (Confirmed)**: Authentication will utilize secure HttpOnly, SameSite=None, Secure cookie state sharing to maintain user login seamlessly across the subdomains.
- **Zero PHP in Dist Output (Confirmed)**: The production build command (`npm run build`) will produce a pure static HTML/JS/CSS assets payload in the `/dist` directory. All local node or PHP-proxy structures are omitted from production files.

---

## 1. Overview & Core Concept

The **Digital Store** allows users to browse premium digital assets (scripts, software, templates, templates, guides), add items to an active cart, purchase them securely using bKash/Nagad/Rocket or their existing user balance, and immediately access high-speed secure download keys.

### Core Value & Features:
1. **Multi-Category Browsing**: Visual catalog with category filters, keyword search, price toggles, and sorting options.
2. **Interactive Cart & Drawer**: Persistent client-side cart managing quantities and items with real-time price totals.
3. **Cross-Subdomain Checkout**: Highly secure purchasing matching the user's logged-in session, with automated delivery.
4. **Protected File Streaming**: Highly-defensive PHP controller masking real zip storage paths, preventing hotlinking and verifying buyer privileges before streaming.
5. **User Engagement Loop**: Product ratings/reviews, interactive wishlist toggle, support ticketing for product complaints, and a detailed purchase history log.
6. **Unified Admin Panel**: Complete management interface embedded in the app's admin workflow to add/edit products, manage downloads, reply to customer support tickets, and view purchase ledgers.

---

## 2. User Experience & Visual Design

The design maintains the premium dark mode aesthetic of the Lottery App while elevating the shopping experience with editorial, high-performance layouts.

### A. Aesthetic & Layout Composition
- **Visual Palette**: Deep dark neutral canvas (Slate-950 background, Slate-900 surface cards), vibrant Emerald-500 (`#10b981`) & Neon Cyan (`#06b6d4`) accents for primary action buttons, pricing states, and download tags.
- **Zero-Pill Metadata**: No colored static capsules. Product metadata (e.g., categories, file sizes, version numbers, rating counts) will be rendered as clean, unboxed typography with elegant dot separators (`·`).
- **Layout Rhythm**:
  - **Shop Catalog**: Dynamic asymmetric grid. Features a prominent top promo banner, a Left Sidebar category filter (collapsible on mobile), and a 3-column bento-grid product display.
  - **Product View Modal**: Immersive full-page modal with clear description columns, interactive review submissions, and a prominent purchase/cart CTA block.
  - **Cart Drawer**: Clean side-sliding panel with routine touch targets $\ge 44\text{px}$.

### B. Micro-Interactions & Feedback
- **Add-to-Cart Trigger**: Fast, compositor-only floating scale effect with instant badge numeric updates.
- **Loading & Empty States**: Beautiful skeleton loaders for product card grids and a custom, clean illustration for empty cart states (avoiding generic text placeholders).
- **Secure Download Completion**: Instant toast notification upon completing purchases with direct access to downloads.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Authentication & Decoupled State Persistence
- **Approach**: Maintain credentials securely via HTTP-only cookies across subdomains.
- **Why**: Protects against cross-site scripting (XSS) token-stealing vectors while enabling simple, secure fetch requests with `credentials: 'include'`.
- **Trade-Off**: Requires proper CORS origin headers on the backend. The backend will explicitly echo `Access-Control-Allow-Origin: https://digital.yourdomain.com` (no `*` wildcard permitted for credentialed calls).

### Decision 2: Digital Asset Path Shielding
- **Approach**: Assets are stored inside a private, non-public directory `/backend/private_storage/products/`.
- **Why**: Direct zip file URL exposure allows piracy and bypasses user-entitlements validation.
- **Alternative considered**: Storing in the public folder. Rejected because of standard hotlinking vulnerabilities.
- **Implementation**: Frontend requests `api/download.php?token=TOKEN_VALUE`. PHP validates the token lifecycle, confirms active purchase state in the DB, and streams the file payload dynamically via headers (`Content-Type: application/zip`).

---

## 4. Technical Architecture & Data Strategy

### System System Layout & Flow
```
┌──────────────────────────────────────────────┐
│            STATIC FRONTEND HOSTING           │
│           (digital.yourdomain.com)           │
│                                              │
│  ┌───────────────────┐    ┌───────────────┐  │
│  │     SPA View      │◄───┤  Cart Store   │  │
│  │ (tab-digital-store)│   │ (LocalStorage)│  │
│  └─────────┬─────────┘    └───────────────┘  │
└────────────┼─────────────────────────────────┘
             │
             │ HTTPS API Requests (with credentials/HttpOnly Cookies)
             ▼
┌──────────────────────────────────────────────┐
│              PHP API BACKEND                 │
│             (api.yourdomain.com)             │
│                                              │
│  ┌───────────────────┐    ┌───────────────┐  │
│  │   Router / API    │◄───┤  Auth Cookie  │  │
│  │    Endpoints      │    │  Validation   │  │
│  └─────────┬─────────┘    └───────┬───────┘  │
│            │                      │          │
│            ▼                      ▼          │
│  ┌───────────────────┐    ┌───────────────┐  │
│  │   Database layer  │◄───┤Private Storage│  │
│  │   (MySQL PDO)     │    │(Zip Archives) │  │
│  └─────────┬─────────┘    └───────────────┘  │
└────────────┼─────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────┐
│            MySQL RELATIONAL DB               │
│             (veloralb_Digital)               │
└──────────────────────────────────────────────┘
```

### Relational Database Schema (`veloralb_Digital`)

```sql
-- 1. Products Catalog
CREATE TABLE IF NOT EXISTS store_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    file_size VARCHAR(50) DEFAULT '0 MB',
    image_url VARCHAR(500) DEFAULT NULL,
    file_path VARCHAR(500) NOT NULL, -- Non-public system storage path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Cart Cache or Persistent Orders
CREATE TABLE IF NOT EXISTS store_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    gateway VARCHAR(50) DEFAULT 'balance',
    transaction_id VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed, cancelled
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. High-Security Single-use Download Tokens
CREATE TABLE IF NOT EXISTS store_download_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    download_limit INT DEFAULT 3,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Wishlists
CREATE TABLE IF NOT EXISTS store_wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_product (user_id, product_id),
    FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Product Reviews & Ratings
CREATE TABLE IF NOT EXISTS store_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Store Support Tickets
CREATE TABLE IF NOT EXISTS store_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, pending, closed
    admin_response TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5. Incremental Execution Strategy

1. **Step 1: Set Up Backend Directory & Database Schemas**
   - Create `/backend/` directory tree.
   - Set up `/backend/config/db.php` connecting with provided credentials securely.
   - Create `/backend/database/schema.sql` detailing full schema structures.
   - Create initial seed data with 6 high-fidelity digital products (ZIP assets).

2. **Step 2: Implement PHP API Controller Endpoints**
   - Create auth checking controllers (`backend/api/auth.php`) compatible with the user credentials session.
   - Create product endpoints (`backend/api/products.php`) with search, filter, and sorting.
   - Create review submission endpoints (`backend/api/reviews.php`).
   - Create cart checkout & order processors (`backend/api/payments.php`) supporting direct balance pay and webhook hooks.
   - Implement download controller (`backend/api/download.php`) resolving file stream from private directories.
   - Implement store-specific support ticketing (`backend/api/support.php`) and wishlist logic.

3. **Step 3: Update Frontend SPA Architecture**
   - Create the central, modular API adapter (`src/js/apiClient.ts`) reading `VITE_API_BASE_URL`.
   - Implement the interactive Digital Store Template inside `src/dashboard_tabs/digital_store.php`.
   - Update `vite.config.ts` to include the digital store template in the pre-bundler.
   - Incorporate `tab-digital-store` inside `index.html` as a structural target container.
   - Extend `src/main.ts` with routing controllers, rendering state handlers for shopping, wishlist panels, order drawers, checkout dialogs, and reviews.

4. **Step 4: Build Admin Control Interface**
   - Incorporate admin controls directly into the store tab interface or as dedicated panels, enabling product creation, digital file uploads, and responding to client tickets.

5. **Step 5: Testing, Linting & Build Verification**
   - Execute dynamic compilation tests (`compile_applet`) and verify build outputs (`npm run build`).
   - Confirm all production Javascript assets in `dist/` remain clean of database secrets and point gracefully to environment endpoints.
