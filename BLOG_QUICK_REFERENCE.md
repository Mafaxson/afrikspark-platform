# Blog System Quick Reference

## Using the New Blog Components

### 1. Display a Blog Card
```jsx
import { BlogCard } from '@/components/blog';

<BlogCard
  id="post-id"
  title="My Blog Post"
  slug="my-blog-post"
  excerpt="This is a preview..."
  content="Full content here..."
  cover_image="https://..."
  media_type="video"
  media_url="https://youtube.com/watch?v=abc123"
  tags={["tutorial", "react"]}
  published_at="2024-01-15"
  reading_time={5}
/>
```

### 2. Format Blog Content
```jsx
import { formatContent } from '@/lib/contentFormatter';

const contentNodes = formatContent(plainTextContent);

<div>
  {contentNodes}
</div>
```

### 3. Display Video
```jsx
import { VideoEmbed } from '@/components/blog';

<VideoEmbed
  media_type="video"
  media_url="https://youtube.com/watch?v=abc123"
  title="Blog Post Title"
/>
```

### 4. Show Focus Areas
```jsx
import { KeyFocusAreas } from '@/components/blog';

<KeyFocusAreas
  areas={["Graphic Design", "Freelancing", "Video Editing"]}
/>
```

### 5. Display Tags
```jsx
import { BlogTags } from '@/components/blog';

<BlogTags tags={["react", "typescript", "tutorial"]} />
```

---

## Utility Functions

### Calculate Reading Time
```jsx
import { calculateReadingTime } from '@/lib/contentFormatter';

const minutes = calculateReadingTime(fullContent);
// Returns: 5 (5 minutes)
```

### YouTube URL Conversion
```jsx
import { getYouTubeEmbedUrl, extractYouTubeVideoId } from '@/lib/contentFormatter';

const embedUrl = getYouTubeEmbedUrl("https://youtube.com/watch?v=abc123");
// Returns: "https://www.youtube.com/embed/abc123?rel=0&modestbranding=1"

const videoId = extractYouTubeVideoId("https://youtu.be/abc123");
// Returns: "abc123"
```

---

## Database Fields Guide

### Required Fields
- `title` - Blog post title
- `slug` - URL-friendly identifier
- `content` - Main post content (plain text)
- `is_published` - Boolean visibility flag

### Optional Fields (Enhanced Features)
- `excerpt` - Preview text (displayed as intro)
- `cover_image` - Featured image URL
- `media_type` - "video", "image", "none"
- `media_url` - YouTube or video file URL
- `video_url` - Legacy video URL support
- `author` - Post author name
- `tags` - Array of tag strings
- `key_focus_areas` - Array of focus area strings
- `reading_time` - Manual reading time (auto-calculated if omitted)
- `published_at` - ISO timestamp

---

## Content Formatting Examples

### Input (Plain Text)
```
Introduction paragraph here.

Main topics:
- Topic one
- Topic two
- Topic three

Conclusion paragraph.
```

### Output (Formatted JSX)
```
<p>Introduction paragraph here.</p>
<p>Main topics:</p>
<ul>
  <li>Topic one</li>
  <li>Topic two</li>
  <li>Topic three</li>
</ul>
<p>Conclusion paragraph.</p>
```

---

## SEO Checklist

For maximum SEO performance:

- [ ] Write compelling title (60 chars max for preview)
- [ ] Create excerpt (155 chars sweet spot)
- [ ] Add cover image (1200x630px optimal)
- [ ] Include tags (3-5 relevant tags)
- [ ] Use YouTube embedded videos when possible
- [ ] Format content with sections and lists
- [ ] Set `is_published = true` only when ready
- [ ] Use slug in URL format (no uppercase, no special chars)

Example:
```
Title: "How to Build a React Blog in 2024"
Slug: "how-to-build-react-blog-2024"
Excerpt: "Learn to create a modern, SEO-friendly blog using React and Supabase with video support and professional styling."
```

---

## Troubleshooting

### YouTube Video Not Embedding
- Check URL format (supported: youtube.com/watch?v=ID, youtu.be/ID)
- Ensure `media_type = "video"`
- Try extracting video ID manually: `https://www.youtube.com/embed/{VIDEO_ID}`

### Content Not Formatting
- Ensure content is plain text, not HTML
- Use "-" or "•" for list items (one per line)
- Add blank lines between sections
- Check for extra whitespace

### Images Not Loading
- Verify image URL is publicly accessible
- Check CORS headers for external URLs
- Use HTTPS URLs when possible
- Ensure image dimensions are optimal (200px min width)

### SEO Tags Not Appearing
- Check Helmet wrapper in BlogPost.tsx
- Verify meta information is populated
- Test with Open Graph debugger tools
- Ensure published_at is valid ISO date

---

## Performance Tips

1. **Image Optimization**
   - Compress images before upload
   - Use modern formats (WebP)
   - Provide proper dimensions

2. **Content Length**
   - Keep excerpts under 160 characters
   - Break long content into sections
   - Use lists for clarity

3. **Video Handling**
   - Prefer YouTube for better caching
   - Use video with high-quality thumbnails
   - Test on slow connections

4. **SEO**
   - Write unique titles for each post
   - Use keywords naturally in content
   - Add structured tags
   - Include featured images

---

## API Integration Example

```jsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogCard } from '@/components/blog';

export function BlogListing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      setPosts(data || []);
    };

    fetchPosts();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-8">
      {posts.map(post => (
        <BlogCard key={post.id} {...post} />
      ))}
    </div>
  );
}
```

---

## Component API Reference

### BlogCard Props
```typescript
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
```

### VideoEmbed Props
```typescript
interface VideoEmbedProps {
  media_type?: string;
  media_url?: string;
  video_url?: string;
  cover_image?: string;
  title: string;
}
```

### BlogTags Props
```typescript
interface BlogTagsProps {
  tags?: string[];
  className?: string;
}
```

### KeyFocusAreas Props
```typescript
interface KeyFocusAreasProps {
  areas?: string[];
  className?: string;
}
```

