/**
 * Optimized pagination component for low-bandwidth blog loading
 * Loads only necessary posts, lazy-loads remaining content
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";

const POSTS_PER_PAGE = 6;

interface PaginationProps {
  onLoadMore: (offset: number) => Promise<any>;
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
}

export function BlogPagination({
  onLoadMore,
  children,
  hasMore,
  isLoading,
}: PaginationProps) {
  const [offset, setOffset] = useState(0);

  const handleLoadMore = async () => {
    const newOffset = offset + POSTS_PER_PAGE;
    await onLoadMore(newOffset);
    setOffset(newOffset);
  };

  return (
    <div className="space-y-8">
      {children}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            size="lg"
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More Posts"}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simple page-based pagination (lighter than infinite scroll)
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>

      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}
