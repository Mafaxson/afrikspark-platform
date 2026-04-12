import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Play } from "lucide-react";
import { format } from "date-fns";
import { calculateReadingTime, getYouTubeId, getYouTubeThumbnail } from "@/lib/contentFormatter";

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  media_type?: string;
  media_url?: string;
  video_url?: string;
  tags?: string[];
  published_at?: string;
  reading_time?: number;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  content,
  cover_image,
  media_type,
  media_url,
  video_url,
  tags,
  published_at,
  reading_time,
}: BlogCardProps) {
  // Determine if this is a video post
  const isVideo = media_type === "video";
  
  // Get thumbnail image
  let thumbnailImage = cover_image || "/logo.png";
  
  if (isVideo) {
    const videoUrl = media_url || video_url;
    if (videoUrl) {
      const thumbnail = getYouTubeThumbnail(videoUrl);
      if (thumbnail) {
        thumbnailImage = thumbnail;
      }
    }
  }

  // Calculate reading time if not provided
  const displayReadingTime = reading_time || calculateReadingTime(content);

  // Get preview text
  const previewText = (excerpt || content)
    .replace(/<[^>]*>/g, "")
    .slice(0, 120);

  const hasVideo = (media_type === "video" || !!video_url) && !cover_image;

  return (
    <Link
      to={`/blog/${slug}`}
      className="group block h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={thumbnailImage}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Video Badge */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 group-hover:bg-white transition">
              <Play className="h-6 w-6 text-gray-800 fill-gray-800" />
            </div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-bold leading-snug transition group-hover:text-blue-600 line-clamp-2">
            {title}
          </h2>

          {/* Preview Text */}
          <p className="flex-grow text-sm text-gray-600 leading-relaxed line-clamp-2">
            {previewText}
            {previewText.length === 120 ? "..." : ""}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(published_at), "MMM dd")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {displayReadingTime} min
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
