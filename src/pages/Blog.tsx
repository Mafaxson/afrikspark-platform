import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  media_type: string;
  media_url: string;
  video_url: string;
  author: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.range((page - 1) * postsPerPage, page * postsPerPage - 1);
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

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");

  return (
    <Layout>
      <Section>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3">Blog</p>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Insights from AfrikSpark</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Explore thoughtful articles on technology, careers, and community impact from our team.
            </p>
          </div>

          <div className="mb-10 flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
                No posts found.
              </div>
            ) : (
              posts.map((post) => {
                const summary = stripHtml(post.excerpt || post.content).slice(0, 140);
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-44 overflow-hidden bg-slate-100">
                      <img
                        src={post.cover_image || post.media_url || "/logo.png"}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <Card className="border-none bg-transparent shadow-none">
                      <CardContent className="p-6 flex h-full flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src="/logo.png"
                            alt="AfrikSpark"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-muted-foreground">AfrikSpark</span>
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-xl font-semibold leading-snug transition group-hover:text-primary">
                            {post.title}
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {summary}
                            {summary.length === 140 ? "..." : ""}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.published_at ? format(new Date(post.published_at), "MMM dd, yyyy") : "Draft"}</span>
                          {post.tags && post.tags.length > 0 && (
                            <Badge variant="secondary" className="text-[11px] uppercase">
                              {post.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {posts.length >= postsPerPage && (
            <div className="text-center mt-10">
              <Button onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
                {loading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
