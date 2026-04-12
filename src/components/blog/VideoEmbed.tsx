import { getYouTubeId, getYouTubeThumbnail } from "@/lib/contentFormatter";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  media_type?: string;
  media_url?: string;
  video_url?: string;
  cover_image?: string;
  title: string;
}

export function VideoEmbed({
  media_type,
  media_url,
  video_url,
  cover_image,
  title,
}: VideoEmbedProps) {
  const videoUrl = media_url || video_url;
  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;
  const thumbnail = videoUrl ? getYouTubeThumbnail(videoUrl) : null;

  // YouTube Video Card (Clickable Preview)
  if (videoId && thumbnail) {
    return (
      <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-12">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block group cursor-pointer"
        >
          <div className="relative rounded-lg shadow-lg overflow-hidden bg-black aspect-video">
            {/* Thumbnail Image */}
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-200"
              loading="lazy"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-200">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 group-hover:bg-white transition-all duration-200 shadow-lg">
                <Play className="h-8 w-8 text-gray-900 fill-gray-900 ml-1" />
              </div>
            </div>

            {/* "Watch on YouTube" Badge */}
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-full text-xs font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
              YouTube
            </div>
          </div>
        </a>
        <figcaption className="text-center text-gray-600 text-sm mt-3 font-medium">
          {title} → Click to watch on YouTube
        </figcaption>
      </figure>
    );
  }

  // Local video file with HTML5 player
  if (media_type === "video" && videoUrl && !videoId) {
    return (
      <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-lg shadow-lg overflow-hidden bg-black">
          <video
            src={videoUrl}
            controls
            poster={cover_image}
            className="w-full h-auto"
            preload="metadata"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <figcaption className="text-center text-gray-600 text-sm mt-3">
          {title}
        </figcaption>
      </figure>
    );
  }

  // Fallback to cover image
  if (cover_image) {
    return (
      <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-12">
        <img
          src={cover_image}
          alt={title}
          className="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
          loading="lazy"
        />
      </figure>
    );
  }

  return null;
}
