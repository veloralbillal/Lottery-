# System Architecture & Development Reference

> **Token Reduction Guide**: Consult this file to understand the application structure, standalone pages, database schema, and sync flow without reading large monolithic source files. Keep this document updated on every structural change.

---

## 1. Tech Stack & Environment
- **Core Runtime**: Vite + TypeScript (SPA + Multi-Page Architecture).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`).
- **Dev Port**: `3000` (strict requirement).
- **State Management**: Offline-first client database via `localStorage` with dual-tier backup and cloud SQL synchronization.

---

## 2. Dedicated Standalone Screens & Page Routing

To eliminate latency and prevent heavy monolithic DOM re-renders in `index.html`, blog and content management features operate on **dedicated, standalone HTML pages**:

| Screen / Feature | HTML Entry Point | TypeScript Source File | Description |
| :--- | :--- | :--- | :--- |
| **Main Portal & Admin** | `/index.html` | `/src/main.ts` & `/src/js/admin.js` | Main lottery app, wallet, draws, admin dashboard |
| **Article Editor & Publisher** | `/admin-blog-editor.html` | `/src/admin-blog-editor.ts` | Dedicated article compose/edit screen (WYSIWYG + HTML source, SEO preview, image upload). Accepts `?edit=<id>` or `?id=<id>` |
| **Published Articles List** | `/admin-articles.html` | `/src/admin-articles.ts` | Standalone manager to view, search, edit (links to editor), or delete published posts |
| **Category Taxonomy** | `/admin-categories.html` | `/src/admin-categories.ts` | Standalone category creator & slug manager with article cascading |
| **Comment Moderation** | `/comments.html` | `/src/comments.ts` | Standalone moderation desk to approve, reject, or delete user comments |
| **Public Community Blog** | `/blog.html` | `/src/blog.ts` | Standalone public article reader, search, filtering, and comment submission |

### Dedicated Routing Rule:
- Clicking **"Add Article"** anywhere in the app MUST directly open or link to `admin-blog-editor.html`.
- Clicking **"Edit Article"** on any post MUST directly navigate to `admin-blog-editor.html?edit=${id}`.
- NEVER render an inline modal or popup inside `index.html` for blog editing; always use the dedicated screen.

---

## 3. Database Schema & Storage Keys

### Primary LocalStorage Keys:
- **`lw_lottery_db_v3`**: Primary application database object.
- **`lottery_winner_db_backup`**: Failover backup snapshot in localStorage.
- **`lw_user_session`**: Active user auth session.
- **`lw_admin_session`**: Active admin auth session.

### Blog & Content Object Schema:
```typescript
interface Database {
  // Articles
  blogs: Array<{
    id: string;               // e.g. "blog-1718901234567"
    title: string;            // Article title
    slug?: string;            // URL-friendly permalink
    category: string;         // Category name, e.g. "Lottery Tips"
    categorySlug?: string;     // URL-friendly category slug
    author: string;           // Author name
    authorAvatar?: string;    // Author avatar URL
    date: string;             // Display date (e.g. "2026-06-20" or "Jun 20, 2026")
    createdAt?: string;       // ISO timestamp
    updatedAt?: string;       // ISO timestamp
    readTime?: string;        // e.g. "4 min read"
    views?: number;           // View count
    likes?: number;           // Upvote count
    image?: string;           // Primary cover image URL or Base64 data
    coverImage?: string;      // Normalized alias for cover image
    excerpt?: string;         // 1-2 sentence search & card snippet
    content: string;          // Rich HTML or Markdown content
    tags?: string[];          // Array of topic keywords
    published?: boolean;      // Live visibility flag
    featured?: boolean;       // Spotlight banner flag
  }>;

  // Categories
  blogCategories: Array<{
    id: string;               // e.g. "bcat-1"
    name: string;             // Category name
    slug: string;             // Unique URL slug
    description?: string;     // Purpose & guidelines
  }>;

  // Comments
  blogComments: Array<{
    id: string;               // e.g. "bcomment-1718901234567"
    blogId: string;           // Target article ID
    username: string;         // Commenter username
    text: string;             // Comment text (sanitized, 3-500 chars)
    createdAt: string;        // ISO timestamp
    status: "pending" | "approved" | "rejected";
  }>;
}
```

---

## 4. Multi-Tier Real-Time Synchronization Flow

All standalone pages and the main portal stay 100% in sync across browser tabs and cloud storage:

1. **Tier 1 - Local Storage (`lw_lottery_db_v3`)**:
   - Immediate write on every create, edit, or delete action.
2. **Tier 2 - HTML5 BroadcastChannel (`lw_realtime_db_sync`)**:
   - Message payload: `{ type: "database_updated", timestamp: Date.now() }`.
   - All open tabs/windows listen and reload their state instantly without page reloads.
3. **Tier 3 - Cross-Window Storage Event Listener**:
   - `window.addEventListener("storage", (e) => { if (e.key === "lw_lottery_db_v3") reload(); })`.
4. **Tier 4 - Cloud Server Sync (`/api/sql/sync` & `/api/sql/db`)**:
   - Background `fetch("/api/sql/sync", { method: "POST", body: JSON.stringify({ db }) })` guarantees persistence across devices.

---

## 5. Performance Best Practices
- **CSS Import**: In standalone TypeScript files, always `import "./index.css";` to let Vite's `@tailwindcss/vite` process and deliver lightweight, tree-shaken CSS instantly instead of transferring heavy static stylesheets.
- **Fast Navigation**: Anchor tags (`<a href="...">`) or direct `window.location.href` navigation load standalone pages under 150ms without blocking the main event thread.
