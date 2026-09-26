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
    // Check for explicit base path injection from index.html (Primary source)
    // @ts-ignore
    if (window.APP_BASE) return window.APP_BASE;

    // Fallback detection logic
    const l = window.location;
    const isGitHub = l.hostname.includes('github.io');
    const segments = l.pathname.split('/').filter(Boolean);
    
    if (isGitHub && segments.length > 0 && !segments[0].includes('.') && segments[0] !== 'index.html') {
      return '/' + segments[0] + '/';
    }

    // Vite fallback
    // @ts-ignore
    const viteBase = import.meta.env.BASE_URL;
    if (viteBase && viteBase !== './' && viteBase !== '/') {
      return viteBase;
    }

    return '/';
  },

  /**
   * Resolves a path to an absolute URL (with origin) relative to the app root.
   * Useful for social sharing tags and canonical URLs.
   */
  resolveUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    
    // Construct the full absolute URL
    try {
      return new URL(cleanPath, window.location.origin + fullBase).href;
    } catch (e) {
      console.warn("PathHelper: Failed to resolve absolute URL for", path);
      return fullBase + cleanPath;
    }
  },

  /**
   * Resolves a path to a root-relative path (without origin).
   * Useful for internal link generation.
   */
  resolvePath(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    return fullBase + cleanPath;
  },

  /**
   * Get the current origin + base for sharing/API purposes
   */
  getAppOrigin(): string {
    const base = this.getBasePath();
    const fullBase = base.endsWith('/') ? base : `${base}/`;
    return window.location.origin + fullBase;
  }
};
