# Implementation Plan - Custom Domain Asset Fix

The goal is to resolve asset loading issues on custom domains by dynamically prepending the correct base path (detected at runtime) to all local asset references in `index.html`.

## Proposed Changes

### 1. `index.html`
- **Dynamic Base Detection**: Refine the inline script to accurately detect `window.__APP_BASE__` for both GitHub Pages subpaths and custom domains.
- **Script-Based Asset Prepension**: Add a small script that runs before the app loads. This script will find specific elements (manifest, icons, logo) and update their `href` or `src` attributes by prepending `window.__APP_BASE__`.
- **Base Tag Removal/Verification**: Ensure that either the `<base>` tag or script-based prepending is used consistently to avoid mixed resolution strategies.

### 2. `src/js/pathHelper.ts`
- **Refinement**: Update the `PathHelper` to be the single source of truth for path resolution throughout the TypeScript codebase.
- **Absolute URLs**: Ensure it can generate full absolute URLs (origin + base + path) for SEO tags that require them.

### 3. `vite.config.ts`
- **Base Path**: Set `base: './'` to allow Vite-generated assets to be resolved relative to the current path, while our manual script handles the top-level `index.html` assets.

### 4. `sw.js` & `404.html`
- **Dynamic Routing**: Verify the 404 redirect logic and Service Worker registration use the dynamic base path to prevent breaks on page refresh.

## Verification Plan
1. **Local Build**: Run `npm run build` to ensure Vite correctly bundles assets with relative paths.
2. **Path Inspection**: Check the compiled `index.html` to see how the script handles the base path.
3. **Simulated Hosting**: Verify that assets would resolve correctly at both the root `/` (custom domain) and a subpath `/project/` (GitHub Pages).
