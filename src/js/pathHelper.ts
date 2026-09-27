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
  },

  /**
   * Get the central API Base URL for backend communications
   */
  getApiBaseUrl(): string {
    // @ts-ignore
    const envApi = import.meta.env.VITE_API_BASE_URL;
    if (envApi) {
      // Ensure trailing slash
      return envApi.endsWith('/') ? envApi : `${envApi}/`;
    }
    // Handle local development fallback
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:3000/api/`;
    }
    // Production relative fallback
    return '/api/';
  }
};
