/**
 * Image optimization utilities for low-bandwidth networks
 */

export interface OptimizedImageProps {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
}

/**
 * Generate WebP version of image URL (if supported)
 */
export function getWebPUrl(url: string): string {
  if (!url) return "";
  // If already WebP, return as-is
  if (url.includes(".webp")) return url;
  // Convert to WebP format (assumes image service supports it)
  return url.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

/**
 * Generate low-quality placeholder from image URL
 */
export function getPlaceholderUrl(url: string): string {
  if (!url) return "";
  // Add placeholder parameter if using Supabase storage or similar
  if (url.includes("supabase")) {
    return url + "?width=10&height=10&quality=10";
  }
  return url;
}

/**
 * Generate responsive image srcset
 */
export function getImageSrcSet(url: string): string {
  if (!url) return "";
  return `${url}?width=320 320w, ${url}?width=640 640w, ${url}?width=1024 1024w`;
}

/**
 * Compress image URL for faster loading on mobile
 */
export function compressImageUrl(url: string, quality: number = 60, width?: number): string {
  if (!url) return "";
  
  let compressed = url;
  
  // Add quality parameter
  const separator = url.includes("?") ? "&" : "?";
  compressed += `${separator}quality=${quality}`;
  
  // Add width constraint if specified
  if (width) {
    compressed += `&width=${width}`;
  }
  
  return compressed;
}

/**
 * Check if WebP is supported
 */
export function supportsWebP(): boolean {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return canvas.toDataURL("image/webp").includes("image/webp");
}
