/**
 * Lightweight caching service for offline support and reduced API calls
 * Uses localStorage for small data, IndexedDB for larger data
 */

const CACHE_PREFIX = "afrikspark_cache_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * Get value from localStorage cache
 */
export function getCached<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();

    // Check if expired
    if (now - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

/**
 * Store value in localStorage cache
 */
export function setCached<T>(key: string, data: T, ttl: number = CACHE_EXPIRY): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: 1,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Clear all cache error:", error);
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSize(): number {
  try {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length * 2; // UTF-16 encoding
        }
      }
    });
    return size;
  } catch (error) {
    console.error("Cache size error:", error);
    return 0;
  }
}

/**
 * Check if cache is available (localStorage accessible)
 */
export function isCacheAvailable(): boolean {
  try {
    const test = "__cache_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
