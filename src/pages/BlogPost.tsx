import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AnimateOnScroll } from "@/components/SectionComponents";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { BlogComments } from "@/components/blog/BlogComments";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { NewsletterSubscription } from "@/components/blog/NewsletterSubscription";
import { SocialShare } from "@/components/blog/SocialShare";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  tags: string[];
  author_id: string;
  published_at: string;
  reading_time: number;
  seo_title: string;
  meta_description: string;
  views: number;
}

interface Author {
  display_name: string;
  avatar_url: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        // Fetch blog post
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (postError) throw postError;

        setPost(postData);

        // Increment view count
        await supabase
          .from("blog_posts")
          .update({ views: (postData.views || 0) + 1 })
          .eq("id", postData.id);

        // Fetch author info
        if (postData.author_id) {
          const { data: authorData } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", postData.author_id)
            .single();

          if (authorData) setAuthor(authorData);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-primary hover:underline">
            Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} | AfrikSpark Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:image" content={post.image_url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt} />
        <meta name="twitter:image" content={post.image_url} />
      </Helmet>

      <Layout>
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <AnimateOnScroll>
              {/* Header */}
              <div className="mb-8">
                <Badge className="mb-4">{post.category}</Badge>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                  {author && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.avatar_url} />
                        <AvatarFallback>{author.display_name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{author.display_name || "AfrikSpark Team"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.published_at), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views || 0} views</span>
                  </div>
                </div>

                {/* Social Share */}
                <SocialShare title={post.title} url={window.location.href} />
              </div>

              {/* Featured Image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-[400px] object-cover rounded-lg mb-8"
                  loading="lazy"
                />
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </AnimateOnScroll>

            {/* Related Articles */}
            <RelatedArticles currentPostId={post.id} category={post.category} />

            {/* Newsletter Subscription */}
            <NewsletterSubscription />

            {/* Comments Section */}
            <BlogComments blogId={post.id} />
          </div>
        </article>
      </Layout>
    </>
  );
}
