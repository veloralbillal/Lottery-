/**
 * PERFORMANCE OPTIMIZATION ENGINE
 * 
 * Implements:
 * 1. Lazy Tab & Component Loading
 * 2. Client-side caching with TTL & In-Flight Request Deduplication
 * 3. Exponential Backoff & Request Timeout Handlers
 * 4. Search Input Debouncing (300-500ms)
 * 5. Document Visibility Lifecycle Management (Pauses non-critical timers when tab is in background)
 * 6. Query / List Pagination Utilities (10-20 items per page)
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Promise<any>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  clear(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.memoryCache.clear();
      return;
    }
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Deduplicate GET or idempotent requests so simultaneous calls share one network promise
   */
  async deduplicatedFetch<T>(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 8000,
    ttlMs: number = 60 * 1000
  ): Promise<T> {
    const cacheKey = `fetch_${options.method || 'GET'}_${url}_${JSON.stringify(options.body || '')}`;
    
    // Check cache first for GET requests
    if (!options.method || options.method.toUpperCase() === 'GET') {
      const cached = this.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if an identical request is already flying
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const fetchPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful GET results
        if (!options.method || options.method.toUpperCase() === 'GET') {
          this.set(cacheKey, data, ttlMs);
        }

        return data as T;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Fetch with exponential backoff and timeout
   */
  async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 2,
    baseDelayMs: number = 500,
    timeoutMs: number = 7000
  ): Promise<T> {
    let attempt = 0;
    let delay = baseDelayMs;

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return (await res.json()) as T;
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries) {
          throw err;
        }
        // Exponential backoff with jitter
        const jitter = Math.random() * 150;
        await new Promise(r => setTimeout(r, delay + jitter));
        delay *= 2;
      }
    }
    throw new Error("Maximum retry attempts reached");
  }
}

export const GlobalCache = new CacheManager();

/**
 * Debounce helper to throttle typing and input searches
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number = 350
): (...args: Parameters<T>) => void {
  let timeoutId: any = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(this, args);
    }, waitMs);
  };
}

/**
 * Throttle helper to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number = 200
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * Helper to paginate arrays for Firestore/Client UI views
 */
export function paginate<T>(items: T[], page: number = 1, pageSize: number = 15): {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
} {
  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = safeItems.slice(startIndex, startIndex + pageSize);

  return {
    items: paginated,
    total,
    totalPages,
    currentPage,
    hasMore: currentPage < totalPages
  };
}

/**
 * Lazy Tab & Module Loader:
 * Tracks which tabs have their HTML injected and modules initialized,
 * injecting and initializing only when opened.
 */
export class LazyTabManager {
  private static loadedTabs = new Set<string>();
  private static initializedModules = new Set<string>();

  static isTabLoaded(tabId: string): boolean {
    return this.loadedTabs.has(tabId);
  }

  static markTabLoaded(tabId: string): void {
    this.loadedTabs.add(tabId);
  }

  static isModuleInitialized(moduleName: string): boolean {
    return this.initializedModules.has(moduleName);
  }

  static markModuleInitialized(moduleName: string): void {
    this.initializedModules.add(moduleName);
  }

  /**
   * Lazily loads HTML template for a single tab if not already loaded in DOM
   */
  static loadTabTemplate(tabId: string, bundledTabs: Record<string, string>): boolean {
    if (this.loadedTabs.has(tabId)) {
      return true;
    }

    const el = document.getElementById(tabId);
    if (!el) return false;

    // Check if element already has content
    if (el.innerHTML && el.innerHTML.trim().length > 30) {
      this.loadedTabs.add(tabId);
      return true;
    }

    const bundledHtml = bundledTabs[tabId];
    if (bundledHtml) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(bundledHtml, 'text/html');
        const content = doc.getElementById(tabId);
        const finalHTML = content ? content.innerHTML : bundledHtml;
        if (finalHTML && finalHTML.trim().length > 20) {
          el.innerHTML = finalHTML;
          this.loadedTabs.add(tabId);
          return true;
        }
      } catch (err) {
        console.warn(`[LazyLoader] Error parsing bundled template for ${tabId}:`, err);
      }
    }

    // Fallback: check localStorage cache
    const cacheKey = `tab_cache_${tabId}`;
    const cachedHTML = localStorage.getItem(cacheKey);
    if (cachedHTML && cachedHTML.trim().length > 30) {
      el.innerHTML = cachedHTML;
      this.loadedTabs.add(tabId);
      return true;
    }

    return false;
  }
}

/**
 * Visibility Lifecycle Handler:
 * Pauses background intervals and animations when the tab/browser is minimized or hidden.
 */
export class VisibilityLifecycle {
  private static pausedCallbacks: Set<() => void> = new Set();
  private static resumedCallbacks: Set<() => void> = new Set();
  private static isInitialized = false;

  static init(): void {
    if (this.isInitialized || typeof document === 'undefined') return;
    this.isInitialized = true;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pausedCallbacks.forEach(cb => {
          try { cb(); } catch (e) { console.warn("Visibility paused callback error:", e); }
        });
      } else {
        this.resumedCallbacks.forEach(cb => {
          try { cb(); } catch (e) { console.warn("Visibility resumed callback error:", e); }
        });
      }
    });
  }

  static onPause(cb: () => void): void {
    this.init();
    this.pausedCallbacks.add(cb);
  }

  static onResume(cb: () => void): void {
    this.init();
    this.resumedCallbacks.add(cb);
  }
}
