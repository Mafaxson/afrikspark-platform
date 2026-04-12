import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { calculateReadingTime } from "@/lib/contentFormatter";

interface BlogDetailHeaderProps {
  title: string;
  excerpt?: string;
  author?: string;
  published_at?: string;
  reading_time?: number;
  content: string;
  cover_image?: string;
}

export function BlogDetailHeader({
  title,
  excerpt,
  author,
  published_at,
  reading_time,
  content,
  cover_image,
}: BlogDetailHeaderProps) {
  const displayReadingTime = reading_time || calculateReadingTime(content);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <a
        href="/blog"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 font-medium transition"
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

      {/* Main Header */}
      <header className="mb-10">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            {author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{author}</span>
              </div>
            )}

            {published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={published_at} className="font-medium">
                  {format(new Date(published_at), "MMMM dd, yyyy")}
                </time>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{displayReadingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <p className="text-xl text-gray-700 leading-relaxed font-light italic">
              {excerpt}
            </p>
          </div>
        )}
      </header>

      {/* Featured Image */}
      {cover_image && (
        <figure className="mb-10">
          <img
            src={cover_image}
            alt={title}
            className="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
            loading="lazy"
          />
        </figure>
      )}
    </article>
  );
}
