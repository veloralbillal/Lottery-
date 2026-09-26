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
    const pathname = window.location.pathname;
    // Common GitHub Pages pattern: /project-name/ or /project-name/index.html
    // If the first segment is NOT index.html and there's more than one segment, it might be a project name.
    // However, since we don't know the project name for sure, we use Vite's BASE_URL if available,
    // or infer it from index.html location.
    
    // Vite injects BASE_URL during build.
    // @ts-ignore
    const viteBase = import.meta.env.BASE_URL;
    if (viteBase && viteBase !== './' && viteBase !== '/') {
      return viteBase;
    }

    // Fallback: Infer from current script or known structure
    // Most robust for this setup is to use relative paths where possible,
    // but for absolute URL generation (OG tags, etc.), we need a full origin.
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
