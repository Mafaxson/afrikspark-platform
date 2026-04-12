/**
 * Optimized blog list page with lazy loading and pagination
 * Uses fetchOptimized to minimize data transfer
 */

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { BlogCard } from "@/components/blog/BlogCard";
import { SimplePagination } from "@/components/blog/Pagination";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebounce";

const POSTS_PER_PAGE = 6;

export default function BlogListOptimized() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Load all posts once (cached after first load)
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            "id,title,slug,excerpt,cover_image,media_type,media_url,published_at,reading_time,content,tags"
          )
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(50); // Cache up to 50 posts

        if (error) throw error;
        setPosts(data || []);
        setFilteredPosts(data || []);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filter posts on search (client-side for instant results)
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredPosts(posts);
      setCurrentPage(1);
    } else {
      const query = debouncedSearch.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          (post.content?.toLowerCase().includes(query) || false) ||
          (post.tags?.some((tag: string) =>
            tag.toLowerCase().includes(query)
          ) || false)
      );
      setFilteredPosts(filtered);
      setCurrentPage(1);
    }
  }, [debouncedSearch, posts]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIdx,
    startIdx + POSTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Blog - AfrikSpark Tech Solutions</title>
        <meta
          name="description"
          content="Latest insights and updates from our team"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Blog - AfrikSpark Tech Solutions"
        />
        <meta
          property="og:description"
          content="Latest insights and updates from our team"
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600">
              Insights, updates, and stories from the AfrikSpark team
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <Input
              type="search"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-2xl"
            />
            {debouncedSearch && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} matching "{debouncedSearch}"
              </p>
            )}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? "No posts match your search"
                  : "No posts available yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <SimplePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
