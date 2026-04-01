-- Update blog_posts table with missing columns
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS reading_time integer,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default blog categories
INSERT INTO public.blog_categories (category_name, slug, description) VALUES
  ('Digital Skills', 'digital-skills', 'Posts about digital literacy and technical skills'),
  ('Technology & Innovation', 'technology-innovation', 'Latest in tech and innovation'),
  ('Scholarships & Opportunities', 'scholarships-opportunities', 'Educational and career opportunities'),
  ('Career Development', 'career-development', 'Professional growth and career advice'),
  ('Community Stories', 'community-stories', 'Success stories from our community'),
  ('Program Updates', 'program-updates', 'Updates about our programs and initiatives')
ON CONFLICT (category_name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view published blog comments"
  ON public.blog_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.blog_posts 
    WHERE blog_posts.id = blog_comments.blog_id 
    AND blog_posts.status = 'published'
  ));

CREATE POLICY "Authenticated users can create comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete comments"
  ON public.blog_comments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own comments"
  ON public.blog_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for blog_categories
CREATE POLICY "Categories viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Subscribers can unsubscribe"
  ON public.newsletter_subscribers FOR UPDATE
  USING (true);

-- Update existing blog_posts policies to check for published status
DROP POLICY IF EXISTS "Blog posts viewable by everyone" ON public.blog_posts;

CREATE POLICY "Published blog posts viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text text)
RETURNS integer AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN GREATEST(1, CEIL(array_length(regexp_split_to_array(content_text, '\s+'), 1) / 200.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;