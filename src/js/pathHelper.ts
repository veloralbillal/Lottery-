/**
 * Path Helper Utility
 * Ensures assets and routing work correctly on both GitHub Pages subpaths and custom domains.
 */

export const PathHelper = {
  /**
   * Gets the base URL of the application.
   * If on GitHub Pages, it returns the /project/ path.
   * If on a custom domain, it returns /.
   */
  getBasePath(): string {
    // Check for explicit base path injection from index.html
    // @ts-ignore
    if (window.__APP_BASE__) return window.__APP_BASE__;

    const l = window.location;
    const isGitHub = l.hostname.includes('github.io');
    const segments = l.pathname.split('/').filter(Boolean);
    
    if (isGitHub && segments.length > 0 && !segments[0].includes('.')) {
      return '/' + segments[0] + '/';
    }

    // Vite injects BASE_URL during build.
    // @ts-ignore
    const viteBase = import.meta.env.BASE_URL;
    if (viteBase && viteBase !== './' && viteBase !== '/') {
      return viteBase;
    }

    return '/';
  },

  /**
   * Resolves a path to an absolute URL relative to the app root.
   */
  resolveUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    return new URL(cleanPath, window.location.origin + fullBase).href;
  },

  /**
   * Resolves a path to a root-relative path.
   */
  resolvePath(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    return fullBase + cleanPath;
  },

  /**
   * Get the current origin + base for sharing
   */
  getAppOrigin(): string {
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    return window.location.origin + fullBase;
  }
};
