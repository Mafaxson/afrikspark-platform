/**
 * Font optimization - minimize layout shift and improve Web Vitals
 * Loads fonts asynchronously with fallback strategy
 */

/**
 * Font face descriptor with fallback weights
 */
interface FontConfig {
  family: string;
  weights: number[];
  fallback: string;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
}

const SYSTEM_FONTS = "ui-sans-serif, system-ui, -apple-system, sans-serif";
const SERIF_FONTS =
  "ui-serif, Georgia, 'Times New Roman', serif";

/**
 * Standard web-safe fonts with excellent fallbacks
 */
const defaultFonts: FontConfig[] = [
  {
    family: "'Inter', sans-serif",
    weights: [400, 500, 600, 700],
    fallback: SYSTEM_FONTS,
    display: "swap", // Show fallback immediately
  },
];

/**
 * Load custom fonts with optimal strategy
 * Uses font-display: swap to prevent FOIT (Flash of Invisible Text)
 */
export function optimizeFonts(): void {
  // For low-bandwidth networks, skip custom fonts
  if (isSlowNetwork()) {
    applySystemFonts();
    return;
  }

  // Standard font loading with Web Font Loader
  loadFontsOptimized(defaultFonts);
}

/**
 * Load fonts with optimized strategy
 */
function loadFontsOptimized(fonts: FontConfig[]): void {
  // Use CSS @import with preload for better performance
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "style";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

  document.head.appendChild(link);

  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  styleLink.media = "print";
  styleLink.addEventListener("load", function () {
    this.media = "all";
  });

  document.head.appendChild(styleLink);
}

/**
 * Apply system fonts (fastest, no network required)
 */
function applySystemFonts(): void {
  document.documentElement.style.fontFamily = SYSTEM_FONTS;
}

/**
 * Check if we should use lightweight fonts
 */
function isSlowNetwork(): boolean {
  // Check if effectiveType is 2g or 3g
  const connection = (navigator as any).connection;
  if (!connection) return false;

  return (
    connection.effectiveType === "2g" || connection.effectiveType === "3g"
  );
}

/**
 * Preload critical font weights
 * Use sparingly - only for above-the-fold text
 */
export function preloadCriticalFonts(): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

/**
 * Reduce font file sizes by subsetting
 * Only load specific character sets for target language
 */
export function loadSubsetFonts(language: string = "en"): void {
  const subsets: Record<string, string> = {
    en: "latin",
    fr: "latin-ext",
    de: "latin-ext",
    ar: "arabic",
    zh: "chinese-simplified",
  };

  const subset = subsets[language] || "latin";

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&subset=${subset}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Font loading monitoring - track when fonts load
 */
export function monitorFontLoading(): void {
  if (!("fonts" in document)) return; // Check for FontFace API

  const fontFace = (document as any).fonts;

  fontFace.ready.then(() => {
    console.debug("Web fonts loaded");
    // Mark performance checkpoint
    if (window.performance && window.performance.mark) {
      performance.mark("fonts-loaded");
    }
  });
}

/**
 * Reduce CSS / use system fonts for low-bandwidth mode
 */
export function optimizeCSSForNetwork(): void {
  if (!isSlowNetwork()) return;

  // Remove custom stylesheets
  const customLinks = document.querySelectorAll(
    'link[href*="fonts.googleapis"], link[href*="bootstrap"], link[href*="custom"]'
  );
  customLinks.forEach((link) => {
    if (link instanceof HTMLLinkElement && link.href.includes("fonts")) {
      link.media = "none"; // Disable custom fonts on slow networks
    }
  });

  // Apply minimal system styles
  const style = document.createElement("style");
  style.textContent = `
    * { font-family: ${SYSTEM_FONTS} !important; }
    body { line-height: 1.5; font-size: 16px; }
    h1, h2, h3, h4, h5, h6 { font-family: ${SYSTEM_FONTS} !important; }
  `;
  document.head.appendChild(style);
}

/**
 * CSS containment to improve rendering performance
 */
export function applyCSSOptimization(): void {
  const style = document.createElement("style");
  style.textContent = `
    /* Improve paint performance */
    .blog-card { will-change: transform; }
    img { will-change: auto; }
    
    /* Reduce layout shift */
    body { overflow-y: scroll; }
    
    /* Optimize text rendering */
    body { -webkit-font-smoothing: antialiased; font-smoothing: antialiased; }
  `;
  document.head.appendChild(style);
}
