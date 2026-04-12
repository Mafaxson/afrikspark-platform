/**
 * Lightweight skeleton loaders for better perceived performance on slow networks
 */

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonText() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  );
}

export function SkeletonImage({ className = "h-40 w-full" }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export function SkeletonGrid({ columns = 3, count = 6 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
