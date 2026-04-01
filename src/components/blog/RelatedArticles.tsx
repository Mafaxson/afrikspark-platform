import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { AnimateOnScroll } from "@/components/SectionComponents";

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  reading_time: number;
}

interface RelatedArticlesProps {
  currentPostId: string;
  category: string;
}

export function RelatedArticles({ currentPostId, category }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, image_url, category, reading_time")
        .eq("status", "published")
        .eq("category", category)
        .neq("id", currentPostId)
        .order("published_at", { ascending: false })
        .limit(3);

      if (data) setArticles(data);
    };

    fetchRelatedArticles();
  }, [currentPostId, category]);

  if (articles.length === 0) return null;

  return (
    <AnimateOnScroll>
      <div className="my-12 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/blog/${article.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <Badge className="mb-2">{article.category}</Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{article.reading_time} min read</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AnimateOnScroll>
  );
}
