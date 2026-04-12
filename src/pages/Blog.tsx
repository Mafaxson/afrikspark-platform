import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { BlogCard } from "@/components/blog/BlogCard";
import { Helmet } from "react-helmet-async";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  media_type?: string;
  media_url?: string;
  video_url?: string;
  author?: string;
  tags?: string[];
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  reading_time?: number;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 12;

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.range(
        (page - 1) * postsPerPage,
        page * postsPerPage - 1
      );
      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <Helmet>
        <title>Blog | AfrikSpark Tech Solutions</title>
        <meta
          name="description"
          content="Explore insights on technology, careers, and community impact from AfrikSpark."
        />
        <meta property="og:title" content="AfrikSpark Blog" />
        <meta
          property="og:description"
          content="Insights from AfrikSpark Tech Solutions"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <Layout>
        <Section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-3 font-medium">
                Blog
              </p>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900">
                Insights from AfrikSpark
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Explore thoughtful articles on technology, careers, and community
                impact from our team.
              </p>
            </div>

            {/* Search Box */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-12 h-12 rounded-lg border-gray-300 text-base"
                />
              </div>
            </div>

            {/* Blog Posts Grid */}
            {posts.length === 0 && !loading ? (
              <div className="col-span-full rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
                <p className="text-lg">No posts found. Try a different search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  // Skeleton Loading
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse"
                    >
                      <div className="h-52 bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-5 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="pt-2 border-t border-gray-100" />
                        <div className="h-3 bg-gray-200 rounded w-40" />
                      </div>
                    </div>
                  ))
                ) : (
                  posts.map((post) => (
                    <BlogCard key={post.id} {...post} />
                  ))
                )}
              </div>
            )}

            {/* Load More Button */}
            {posts.length >= postsPerPage && !loading && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setPage((prev) => prev + 1)}
                  size="lg"
                  variant="outline"
                >
                  Load More Posts
                </Button>
              </div>
            )}
          </div>
        </Section>
      </Layout>
    </>
  );
}
