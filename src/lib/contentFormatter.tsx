/**
 * Utility functions for formatting blog content
 */

export interface FormattedContentBlock {
  type: 'paragraph' | 'list' | 'heading' | 'break';
  content: string[];
}

/**
 * Format plain text content into structured blocks
 */
export function formatContent(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if it's a list item
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const cleanItem = trimmed.replace(/^[-•]\s*/, '');
      currentListItems.push(cleanItem);
      continue;
    }

    // If we were collecting list items and now we're not, flush the list
    if (currentListItems.length > 0 && trimmed !== '') {
      result.push(
        <ul key={`list-${i}`} className="list-disc list-inside my-4 space-y-2">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-gray-700 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }

    // Empty line creates a break
    if (trimmed === '') {
      if (currentListItems.length === 0) {
        result.push(<br key={`br-${i}`} />);
      }
      continue;
    }

    // Regular paragraph
    if (currentListItems.length === 0) {
      result.push(
        <p key={`para-${i}`} className="text-gray-700 leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }
  }

  // Don't forget the last list if it exists
  if (currentListItems.length > 0) {
    result.push(
      <ul key="list-end" className="list-disc list-inside my-4 space-y-2">
        {currentListItems.map((item, idx) => (
          <li key={idx} className="text-gray-700 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return result;
}

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime);
}

/**
 * Get YouTube video ID from various URL formats
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Try v= parameter first (most common)
  const vMatch = url.split("v=")[1];
  if (vMatch) {
    return vMatch.split("&")[0];
  }
  
  // Try youtu.be format
  if (url.includes("youtu.be/")) {
    const parts = url.split("/");
    return parts[parts.length - 1]?.split("?")[0] || null;
  }
  
  // Try direct ID (11 characters, alphanumeric + - _)
  const directId = url.split("/").pop();
  if (directId && /^[a-zA-Z0-9_-]{11}$/.test(directId)) {
    return directId;
  }
  
  return null;
}

/**
 * Get YouTube thumbnail URL (maxresdefault quality)
 */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/**
 * Extract YouTube video ID from various URL formats (legacy)
 */
export function extractYouTubeVideoId(url: string): string | null {
  return getYouTubeId(url);
}

/**
 * Generate YouTube embed URL from video URL or ID
 */
export function getYouTubeEmbedUrl(urlOrId: string): string | null {
  const videoId = getYouTubeId(urlOrId);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Get YouTube embed URL (simplified syntax)
 * Extracts video ID and returns embed URL
 */
export function getYouTubeEmbed(url: string): string {
  const videoId = getYouTubeId(url);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}`;
}
