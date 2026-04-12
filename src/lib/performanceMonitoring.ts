/**
 * Performance monitoring - track Core Web Vitals and optimize
 * Monitors LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), FID (First Input Delay)
 */

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint (ms)
  cls?: number; // Cumulative Layout Shift (unitless)
  fid?: number; // First Input Delay (ms)
  ttfb?: number; // Time to First Byte (ms)
  loadTime?: number; // Total page load time (ms)
  networkType?: string;
  imageLoadTime?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  /**
   * Initialize all performance observations
   */
  init(): void {
    this.observeLCP();
    this.observeCLS();
    this.observeFID();
    this.measurePageLoad();
    this.getNetworkInfo();
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   * LCP target: < 2.5s
   */
  private observeLCP(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;

      console.debug(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);

      // Warn if LCP is poor
      if (lastEntry.startTime > 2500) {
        console.warn(
          "⚠️ LCP is slow. Consider optimizing images and lazy loading."
        );
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.set("lcp", observer);
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   * CLS target: < 0.1
   */
  private observeCLS(): void {
    if (!("PerformanceObserver" in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          console.debug(`CLS: ${clsValue.toFixed(4)}`);
        }
      }
    });

    observer.observe({ entryTypes: ["layout-shift"] });
    this.metrics.cls = clsValue;
    this.observers.set("cls", observer);
  }

  /**
   * Observe First Input Delay (FID)
   * FID target: < 100ms
   */
  private observeFID(): void {
    if (!("PerformanceObserver" in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fid = entries[0];
      this.metrics.fid = (fid as any).processingDuration;

      console.debug(
        `FID: ${(fid as any).processingDuration.toFixed(2)}ms`
      );

      if ((fid as any).processingDuration > 100) {
        console.warn("⚠️ FID is high. Consider reducing JavaScript.");
      }
    });

    observer.observe({ entryTypes: ["first-input"] });
    this.observers.set("fid", observer);
  }

  /**
   * Measure total page load time
   */
  private measurePageLoad(): void {
    window.addEventListener("load", () => {
      const navigationTiming = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (!navigationTiming) return;

      const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      const ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;

      this.metrics.loadTime = loadTime;
      this.metrics.ttfb = ttfb;

      console.debug(
        `Page Load: ${loadTime.toFixed(0)}ms | TTFB: ${ttfb.toFixed(0)}ms`
      );

      // Report metrics if slow
      if (loadTime > 2000) {
        console.warn(`⚠️ Page load slow: ${loadTime.toFixed(0)}ms`);
      }
    });
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): void {
    const nav = navigator as any;
    if (!nav.connection) return;

    this.metrics.networkType = nav.connection.effectiveType;
    console.debug(`Network: ${nav.connection.effectiveType}`);
  }

  /**
   * Measure image load performance
   */
  measureImageLoading(): void {
    const images = document.querySelectorAll("img[src]");

    let totalLoadTime = 0;
    let loadedCount = 0;

    images.forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        loadedCount++;
      } else {
        img.addEventListener("load", () => {
          if (performance.getEntriesByName((img as HTMLImageElement).src)) {
            const entry = performance.getEntriesByName(
              (img as HTMLImageElement).src
            )[0];
            totalLoadTime += entry.duration;
          }
          loadedCount++;
        });
      }
    });

    if (loadedCount > 0) {
      this.metrics.imageLoadTime = totalLoadTime / loadedCount;
      console.debug(`Avg Image Load: ${this.metrics.imageLoadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Report metrics to analytics service
   */
  reportMetrics(endpoint: string): void {
    if (!navigator.sendBeacon) return; // Fallback for older browsers

    const data = JSON.stringify({
      ...this.metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    navigator.sendBeacon(endpoint, data);
  }

  /**
   * Clean up observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
let monitor: PerformanceMonitor | null = null;

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (monitor) return;
  monitor = new PerformanceMonitor();
  monitor.init();
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  if (!monitor) {
    console.warn("Performance monitor not initialized");
    return {};
  }
  return monitor.getMetrics();
}

/**
 * Report metrics to backend
 */
export function reportPerformanceMetrics(endpoint: string): void {
  if (!monitor) return;
  monitor.reportMetrics(endpoint);
}

/**
 * Measure function execution time
 */
export function measureTime(fn: () => void, label: string): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  console.debug(`${label}: ${duration.toFixed(2)}ms`);
  return duration;
}

/**
 * Mark performance checkpoint
 */
export function markCheckpoint(label: string): void {
  if (performance.mark) {
    performance.mark(label);
  }
}

/**
 * Measure between two checkpoints
 */
export function measureBetween(startMark: string, endMark: string): number {
  if (!performance.measure) return 0;

  try {
    const measure = performance.measure(
      `measure-${startMark}-${endMark}`,
      startMark,
      endMark
    );
    return measure.duration;
  } catch (e) {
    console.debug(`Could not measure between ${startMark} and ${endMark}`);
    return 0;
  }
}
