/**
 * Network detection and resilience service for handling slow/offline networks
 */

export enum NetworkSpeed {
  OFFLINE = "offline",
  SLOW = "slow", // 2G/3G
  MODERATE = "moderate", // 4G
  FAST = "fast", // LTE/5G
}

interface NetworkInfo {
  speed: NetworkSpeed;
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

let networkInfo: NetworkInfo = {
  speed: NetworkSpeed.MODERATE,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
};

/**
 * Initialize network detection
 */
export function initNetworkDetection(): void {
  if (typeof window === "undefined") return;

  // Listen for online/offline events
  window.addEventListener("online", () => {
    networkInfo.isOnline = true;
    updateNetworkSpeed();
  });

  window.addEventListener("offline", () => {
    networkInfo.isOnline = false;
    networkInfo.speed = NetworkSpeed.OFFLINE;
  });

  // Get initial network info
  updateNetworkSpeed();
}

/**
 * Update network speed based on connection type
 */
function updateNetworkSpeed(): void {
  if (!networkInfo.isOnline) {
    networkInfo.speed = NetworkSpeed.OFFLINE;
    return;
  }

  // Use Navigation Timing API if available
  if ("connection" in navigator) {
    const conn = (navigator as any).connection;
    networkInfo.effectiveType = conn.effectiveType;
    networkInfo.downlink = conn.downlink;
    networkInfo.rtt = conn.rtt;

    // Map effective type to speed
    switch (conn.effectiveType) {
      case "4g":
        networkInfo.speed = NetworkSpeed.FAST;
        break;
      case "3g":
        networkInfo.speed = NetworkSpeed.SLOW;
        break;
      case "2g":
        networkInfo.speed = NetworkSpeed.SLOW;
        break;
      default:
        networkInfo.speed = NetworkSpeed.MODERATE;
    }
  } else {
    // Fallback to moderate speed
    networkInfo.speed = NetworkSpeed.MODERATE;
  }
}

/**
 * Get current network info
 */
export function getNetworkInfo(): NetworkInfo {
  return networkInfo;
}

/**
 * Check if network is slow
 */
export function isSlowNetwork(): boolean {
  return networkInfo.speed === NetworkSpeed.SLOW;
}

/**
 * Check if offline
 */
export function isOffline(): boolean {
  return networkInfo.speed === NetworkSpeed.OFFLINE || !networkInfo.isOnline;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return networkInfo.isOnline;
}

/**
 * Get image quality based on network
 */
export function getImageQuality(): number {
  switch (networkInfo.speed) {
    case NetworkSpeed.SLOW:
      return 40; // Very compressed
    case NetworkSpeed.MODERATE:
      return 60; // Medium compression
    case NetworkSpeed.FAST:
      return 80; // Light compression
    default:
      return 60;
  }
}

/**
 * Get max image width based on network
 */
export function getMaxImageWidth(): number {
  switch (networkInfo.speed) {
    case NetworkSpeed.SLOW:
      return 320; // Mobile size
    case NetworkSpeed.MODERATE:
      return 640; // Tablet size
    case NetworkSpeed.FAST:
      return 1024; // Desktop size
    default:
      return 640;
  }
}

/**
 * Should load high-quality images?
 */
export function shouldLoadHQImages(): boolean {
  return networkInfo.speed === NetworkSpeed.FAST;
}

/**
 * Should auto-load videos?
 */
export function shouldAutoLoadVideos(): boolean {
  return false; // Never auto-load videos to save data
}

/**
 * Should show heavy animations?
 */
export function shouldShowAnimations(): boolean {
  return networkInfo.speed !== NetworkSpeed.SLOW;
}
