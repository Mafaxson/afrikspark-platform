import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { VideoEmbed } from "@/components/blog/VideoEmbed";
import { KeyFocusAreas } from "@/components/blog/KeyFocusAreas";
import { BlogTags } from "@/components/blog/BlogTags";
import { SocialShare } from "@/components/blog/SocialShare";
import { formatContent, calculateReadingTime } from "@/lib/contentFormatter";
import { format } from "date-fns";

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
  key_focus_areas?: string[];
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  reading_time?: number;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

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

        if (postError) {
          if (postError.code === "PGRST116") {
            setNotFound(true);
          }
          throw postError;
        }

        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
        setNotFound(true);
        toast.error("Post not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Post Not Found</h1>
            <p className="text-gray-600 mb-8 max-w-md">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <a href="/blog">
              <Button size="lg">Back to Blog</Button>
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | AfrikSpark Blog</title>
        <meta name="description" content={post.excerpt || post.content.slice(0, 160)} />
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.excerpt || post.content.slice(0, 160)}
        />
        <meta property="og:type" content="article" />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="og:url" content={currentUrl} />
        <meta name="author" content={post.author || "AfrikSpark"} />
        <meta name="article:published_time" content={post.published_at || ""} />
      </Helmet>

      <Layout>
        <div className="bg-white">
          {/* Back Navigation - Top */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <a
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </a>
          </div>

          {/* VIDEO OR IMAGE - TOP HERO SECTION */}
          {post.media_type === "video" && post.media_url ? (
            <VideoEmbed
              media_type={post.media_type}
              media_url={post.media_url}
              video_url={post.video_url}
              cover_image={post.cover_image}
              title={post.title}
            />
          ) : post.cover_image ? (
            <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-12">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
                loading="lazy"
              />
            </figure>
          ) : null}

          {/* TITLE & META - BlogDetailHeader (MODIFIED ORDER) */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-10">
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">{post.author}</span>
                    </div>
                  )}

                  {post.published_at && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <time dateTime={post.published_at} className="font-medium">
                        {format(new Date(post.published_at), "MMMM dd, yyyy")}
                      </time>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {(post.reading_time || calculateReadingTime(post.content))} min read
                    </span>
                  </div>
                </div>
              </div>

              {/* EXCERPT */}
              {post.excerpt && (
                <div className="border-l-4 border-blue-500 pl-6 py-2">
                  <p className="text-xl text-gray-700 leading-relaxed font-light italic">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </header>
          </div>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Key Focus Areas */}
            {post.key_focus_areas && post.key_focus_areas.length > 0 && (
              <KeyFocusAreas areas={post.key_focus_areas} />
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {formatContent(post.content)}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && <BlogTags tags={post.tags} />}

            {/* Share Section */}
            <section className="my-12 border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Share this article
                  </h3>
                  <p className="text-gray-600">
                    Found this helpful? Share it with your network.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SocialShare title={post.title} url={currentUrl} />
                </div>
              </div>
            </section>

            {/* Back to Blog */}
            <div className="text-center">
              <a href="/blog">
                <Button variant="outline" size="lg">
                  Back to Blog
                </Button>
              </a>
            </div>
          </main>
        </div>
      </Layout>
    </>
  );
}
