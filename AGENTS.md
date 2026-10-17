# AI Coding Rules & Constraints

## Tech Stack
- **Framework**: React SPA on Vite with TypeScript.
- **Styling**: Tailwind CSS (`@import "tailwindcss";` in global CSS). No inline styles or separate CSS files.
- **Backend / State**: Client-side state managed via `StateManager` in `src/main.ts` with local persistence (`localStorage` / offline queue).
- **Modules**: Modular dashboard tabs (`src/dashboard_tabs/`) and admin panels (`src/admin_tabs/`).

## Core Rules
1. **No Application Code Modification**: Do not modify application logic or code files while creating documentation.
2. **Accurate Inspection**: Always inspect existing code and file paths before documenting. Never invent file paths, database fields, or APIs.
3. **Concise Documentation**: Keep documentation minimal and direct to reduce token usage.
4. **Preserve Functionality**: Preserve existing design, authentication, and database schemas.
