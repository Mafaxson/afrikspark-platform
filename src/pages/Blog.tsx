import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Section, AnimateOnScroll } from "@/components/SectionComponents";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Calendar, Clock, TrendingUp, Star } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogPost {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  testimonial_text: string;
  photo_url: string | null;
  status: "active" | "hidden";
  is_featured: boolean;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("testimonials")
        .select("id, name, role, organization, testimonial_text, photo_url, is_featured, status, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,testimonial_text.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsWithData = (data || []).map(post => ({
        ...post,
        title: `${post.name} - ${post.role}`,
        slug: `testimonial-${post.id}`,
        excerpt: post.testimonial_text.length > 150 ? post.testimonial_text.substring(0, 150) + "..." : post.testimonial_text,
        category: post.organization || "Community",
        published_at: post.created_at,
        reading_time: Math.ceil(post.testimonial_text.split(' ').length / 200),
        views: Math.floor(Math.random() * 1000),
        image_url: post.photo_url || "/placeholder-avatar.jpg"
      }));

      // Set featured post (most recent)
      if (postsWithData.length > 0) {
        setFeaturedPost(postsWithData[0]);
        setPosts(postsWithData.slice(1));
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPopularPosts = () => {
    return [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  };

  const paginatedPosts = posts.slice(0, page * postsPerPage);
  const hasMore = paginatedPosts.length < posts.length;

  const BlogCard = ({ post }: { post: BlogPost }) => (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={post.image_url || "/placeholder-avatar.jpg"}
            alt={post.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <Badge className="absolute top-4 left-4">{post.organization || "Community"}</Badge>
          {post.is_featured && (
            <div className="absolute top-4 right-4">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.name} - {post.role}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.photo_url || undefined} />
              <AvatarFallback>{post.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              {post.name}
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(post.created_at), "MMM dd")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.reading_time} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Community Stories
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Testimonials & Stories
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mb-8">
              Hear from our community members about their experiences with AfrikSpark.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <div className="container mx-auto px-4">
          <Tabs defaultValue="latest" className="mb-12">
            <TabsList>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="latest" className="mt-8">
              {/* Featured Testimonial */}
              {featuredPost && (
                <AnimateOnScroll>
                  <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-[400px] overflow-hidden">
                        <img
                          src={featuredPost.image_url || "/placeholder-avatar.jpg"}
                          alt={featuredPost.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 left-4">Featured</Badge>
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-4">{featuredPost.organization || "Community"}</Badge>
                        <h2 className="font-display text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                          {featuredPost.name} - {featuredPost.role}
                        </h2>
                        <p className="text-muted-foreground mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={featuredPost.photo_url || undefined} />
                              <AvatarFallback>
                                {featuredPost.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{featuredPost.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(featuredPost.created_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{featuredPost.reading_time} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimateOnScroll>
              )}

              {/* Latest Testimonials Grid */}
              {loading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-[400px] animate-pulse">
                      <div className="h-56 bg-muted" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : paginatedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No testimonials found</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {paginatedPosts.map((post) => (
                      <AnimateOnScroll key={post.id}>
                        <BlogCard post={post} />
                      </AnimateOnScroll>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center">
                      <Button onClick={() => setPage(page + 1)} variant="outline" size="lg">
                        Load More Stories
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="featured" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {posts.filter(post => post.is_featured).map((post) => (
                  <AnimateOnScroll key={post.id}>
                    <div className="relative">
                      <Star className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 fill-current" />
                      <BlogCard post={post} />
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </Layout>
  );
}
