/**
 * API optimization service for reduced data consumption
 * Caches responses, reduces payload size, and batches requests
 */

import { getCached, setCached } from "@/lib/cache";
import { isOffline } from "@/lib/networkDetection";

const API_TIMEOUT = 5000; // 5 second timeout for slow networks

/**
 * Optimized API call with caching and error handling
 */
export async function fetchOptimized<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTTL?: number
): Promise<T | null> {
  // Check cache first
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  // If offline, return cached data or null
  if (isOffline()) {
    if (cacheKey) {
      const cached = getCached<T>(cacheKey);
      return cached;
    }
    return null;
  }

  try {
    // Add timeout to request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful response
    if (cacheKey) {
      setCached(cacheKey, data, cacheTTL);
    }

    return data;
  } catch (error) {
    console.error("API error:", error);

    // Return cached data as fallback
    if (cacheKey) {
      const cached = getCached<T>(cacheKey);
      if (cached) return cached;
    }

    return null;
  }
}

/**
 * Fetch blog posts with minimal fields for list view
 */
export async function fetchBlogPostsOptimized(limit: number = 6, offset: number = 0) {
  const cacheKey = `blog_posts_${limit}_${offset}`;

  return fetchOptimized(
    `https://YOUR_SUPABASE_URL/rest/v1/blog_posts?limit=${limit}&offset=${offset}&select=id,title,slug,excerpt,cover_image,media_type,media_url,published_at,reading_time`,
    {
      headers: {
        "Content-Type": "application/json",
        "apikey": "YOUR_SUPABASE_KEY",
      },
    },
    cacheKey,
    24 * 60 * 60 * 1000 // 24 hours
  );
}

/**
 * Fetch single blog post with full content
 */
export async function fetchBlogPostOptimized(slug: string) {
  const cacheKey = `blog_post_${slug}`;

  return fetchOptimized(
    `https://YOUR_SUPABASE_URL/rest/v1/blog_posts?slug=eq.${slug}&select=*`,
    {
      headers: {
        "Content-Type": "application/json",
        "apikey": "YOUR_SUPABASE_KEY",
      },
    },
    cacheKey,
    24 * 60 * 60 * 1000 // 24 hours
  );
}

/**
 * Fetch team members with minimal fields
 */
export async function fetchTeamOptimized() {
  const cacheKey = "team_members";

  return fetchOptimized(
    `https://YOUR_SUPABASE_URL/rest/v1/team?select=id,name,role,photo_url,bio`,
    {
      headers: {
        "Content-Type": "application/json",
        "apikey": "YOUR_SUPABASE_KEY",
      },
    },
    cacheKey,
    24 * 60 * 60 * 1000 // 24 hours
  );
}

/**
 * Batch API requests to reduce number of calls
 */
export async function fetchBatch<T>(requests: Array<{ url: string; cacheKey?: string }>) {
  const results = await Promise.all(
    requests.map((req) => fetchOptimized<T>(req.url, {}, req.cacheKey))
  );
  return results;
}

/**
 * Prefetch data for faster navigation
 */
export function prefetchData(urls: Array<{ url: string; cacheKey?: string }>) {
  // Load in background without blocking UI
  setTimeout(() => {
    urls.forEach(({ url, cacheKey }) => {
      fetchOptimized(url, {}, cacheKey).catch(() => {
        // Silent fail for prefetch
      });
    });
  }, 2000); // Wait 2s before prefetching
}
