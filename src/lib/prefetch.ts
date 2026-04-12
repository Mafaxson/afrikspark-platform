/**
 * Critical resource prefetcher - loads essential data in background
 * Reduces perceived load time by prefetching before user navigates
 */

import { getCached, setCached } from "./cache";

interface PrefetchConfig {
  urls: string[];
  priority?: "high" | "low";
  timeout?: number;
}

// Track prefetch queue to avoid duplicate requests
const prefetchQueue = new Set<string>();

/**
 * Prefetch critical resources in background
 * High priority = preload immediately
 * Low priority = preload after 2 seconds (lower impact on initial load)
 */
export async function prefetchResources(config: PrefetchConfig): Promise<void> {
  const { urls, priority = "low", timeout = 5000 } = config;

  const delay = priority === "high" ? 0 : 2000;

  setTimeout(() => {
    urls.forEach((url) => {
      if (prefetchQueue.has(url)) return; // Already in queue
      prefetchQueue.add(url);

      prefetchUrl(url, timeout).catch((error) => {
        console.debug(`Prefetch failed for ${url}:`, error.message);
      });
    });
  }, delay);
}

/**
 * Fetch and cache a single URL
 */
async function prefetchUrl(url: string, timeout: number): Promise<void> {
  const cacheKey = `prefetch_${url}`;
  const cached = getCached(cacheKey);

  if (cached) return; // Already cached

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    if (!response.ok) return; // Skip caching on error

    const data = await response.json();
    setCached(cacheKey, data, 24 * 60 * 60 * 1000); // 24hr cache
  } catch (error) {
    // Silently fail on prefetch - doesn't affect user experience
    if (error instanceof Error && error.name !== "AbortError") {
      console.debug(`Prefetch error: ${error.message}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Prefetch images in background (lightweight)
 */
export function prefetchImages(urls: string[]): void {
  urls.forEach((url) => {
    if (prefetchQueue.has(url)) return;
    prefetchQueue.add(url);

    const img = new Image();
    img.src = url; // Browser handles prefetch automatically
  });
}

/**
 * Prefetch critical pages of the site
 */
export function prefetchCriticalPages(): void {
  prefetchResources({
    urls: [
      // Blog endpoint - fetch without full content
      "https://api.supabase.co/rest/v1/blog_posts?select=id,title,slug,excerpt,cover_image,media_type&limit=10",
      // Team members
      "https://api.supabase.co/rest/v1/team_members?select=id,name,role,photo_url",
    ],
    priority: "low",
  });
}

/**
 * Clear prefetch queue and cache
 */
export function clearPrefetchCache(): void {
  prefetchQueue.clear();
}

/**
 * Get current prefetch queue size
 */
export function getPrefetchQueueSize(): number {
  return prefetchQueue.size;
}
