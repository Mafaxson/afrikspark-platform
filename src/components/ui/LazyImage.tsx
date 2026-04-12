import { useState, useEffect, useRef } from "react";
import { compressImageUrl, getPlaceholderUrl } from "@/lib/imageOptimization";
import { getImageQuality, getMaxImageWidth } from "@/lib/networkDetection";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: "small" | "medium" | "large";
  width?: number;
  height?: number;
  onLoad?: () => void;
}

/**
 * Optimized lazy-loading image component for slow networks
 * Uses low-quality placeholder first, then loads full image
 */
export function LazyImage({
  src,
  alt,
  className = "",
  size = "medium",
  width,
  height,
  onLoad,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(getPlaceholderUrl(src));
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    // Get optimized image URL
    const quality = getImageQuality();
    const maxWidth = getMaxImageWidth();
    const optimizedUrl = compressImageUrl(src, quality, maxWidth);

    // Preload full image
    const img = new Image();

    img.onload = () => {
      setImageSrc(optimizedUrl);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      // If optimized fails, try original
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    // Start loading with slight delay to prioritize other content
    const timer = setTimeout(() => {
      img.src = optimizedUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, [src, onLoad]);

  const sizeClasses = {
    small: "h-20 w-20",
    medium: "h-40 w-full",
    large: "h-96 w-full",
  };

  return (
    <div className={`overflow-hidden bg-gray-100 ${sizeClasses[size]} ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-50"
        }`}
        width={width}
        height={height}
      />
    </div>
  );
}

/**
 * Ultra-lightweight image for critical path (homepage hero)
 */
export function CriticalImage({
  src,
  alt,
  className = "",
}: Omit<LazyImageProps, "loading">) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
