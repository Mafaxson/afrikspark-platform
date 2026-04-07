import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { SocialShare } from "@/components/blog/SocialShare";
import { Helmet } from "react-helmet-async";
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
  reading_time?: number | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (postError) throw postError;
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Post not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const renderMedia = () => {
    if (!post) return null;

    if (post.media_type === "image" && post.media_url) {
      return (
        <div className="my-8 rounded-lg overflow-hidden">
          <img
            src={post.media_url}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      );
    }

    if (post.media_type === "video" && post.media_url) {
      return (
        <div className="my-8 rounded-lg overflow-hidden">
          <video
            src={post.media_url}
            controls
            className="w-full h-auto max-h-96"
            poster={post.cover_image || undefined}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (post.video_url) {
      const youtubeMatch = post.video_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeMatch) {
        return (
          <div className="my-8 rounded-lg overflow-hidden">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }

      return (
        <div className="my-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <ExternalLink className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">External Video</p>
              <a
                href={post.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Watch on external site
              </a>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | AfrikSpark Blog</title>
        <meta name="description" content={post.excerpt} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
      </Helmet>

      <Layout>
        <article className="max-w-4xl mx-auto px-4 py-8">
          <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <div className="mb-10 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <img
                src="/logo.png"
                alt="AfrikSpark"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">AfrikSpark Blog</p>
                <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.published_at ? format(new Date(post.published_at), "MMMM dd, yyyy") : ""}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.reading_time || 1} min read
                  </span>
                </div>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          {post.cover_image && !post.media_url && (
            <div className="mb-10 rounded-3xl overflow-hidden shadow-sm border border-border">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-72 md:h-[32rem] object-cover"
              />
            </div>
          )}

          {renderMedia()}

          {post.tags && post.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-3">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none mb-10" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-border pt-6">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Share this article</p>
            </div>
            <SocialShare title={post.title} url={currentUrl} />
          </div>
        </article>
      </Layout>
    </>
  );
}
