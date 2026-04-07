-- Upgrade blog system to add media support and newsletter
-- Add media support and enhanced fields

-- Add new columns to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'none' CHECK (media_type IN ('image', 'video', 'link', 'none')),
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS author text;

-- Update existing records to set is_published based on status
UPDATE public.blog_posts
SET is_published = (status = 'published'),
    cover_image = featured_image_url,
    author = 'AfrikSpark Team'
WHERE is_published IS NULL;

-- Create blog-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter subscribers
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Storage policies for blog-media bucket
CREATE POLICY "Anyone can view blog media" ON storage.objects FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Admins can upload blog media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-media' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update blog media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'blog-media' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete blog media" ON storage.objects FOR DELETE USING (
  bucket_id = 'blog-media' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Update blog_posts RLS to include is_published
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);

-- Create function to send newsletter when post is published
CREATE OR REPLACE FUNCTION send_blog_newsletter()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send newsletter when post becomes published
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    -- Call the edge function asynchronously
    PERFORM
      net.http_post(
        url := (Deno.env.get('SUPABASE_URL') || '/functions/v1/send-newsletter'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', ('Bearer ' || Deno.env.get('SUPABASE_ANON_KEY'))
        ),
        body := jsonb_build_object('post_id', NEW.id)
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for newsletter sending
DROP TRIGGER IF EXISTS send_blog_newsletter_trigger ON public.blog_posts;
CREATE TRIGGER send_blog_newsletter_trigger
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION send_blog_newsletter();
