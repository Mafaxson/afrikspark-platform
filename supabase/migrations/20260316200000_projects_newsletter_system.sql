-- =========================================
-- PROJECTS ENHANCEMENT & NEWSLETTER SYSTEM MIGRATION
-- =========================================
-- This migration adds:
-- 1. projects table for logo and link management
-- 2. project-logos storage bucket
-- 3. newsletter_subscribers table
-- 4. Email automation functions
-- 5. RLS policies for all new tables

-- =========================================
-- 1. CREATE PROJECTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  logo_url text,
  project_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =========================================
-- 2. CREATE NEWSLETTER SUBSCRIBERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =========================================
-- 3. CREATE STORAGE BUCKET FOR PROJECT LOGOS
-- =========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-logos', 'project-logos', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 4. ENABLE RLS ON NEW TABLES
-- =========================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 5. RLS POLICIES FOR PROJECTS
-- =========================================

-- Anyone can view projects (for public display)
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

-- Admins can manage projects
CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 6. RLS POLICIES FOR NEWSLETTER SUBSCRIBERS
-- =========================================

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view newsletter subscribers
CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 7. STORAGE POLICIES FOR PROJECT LOGOS
-- =========================================

-- Anyone can view project logos (public bucket)
CREATE POLICY "Anyone can view project logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-logos');

-- Admins can upload project logos
CREATE POLICY "Admins can upload project logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete project logos
CREATE POLICY "Admins can delete project logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 8. EMAIL AUTOMATION FUNCTIONS
-- =========================================

-- Function to send newsletter emails when blog posts are published
CREATE OR REPLACE FUNCTION public.send_blog_post_to_subscribers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscriber_record RECORD;
  blog_title TEXT;
  blog_content TEXT;
  blog_slug TEXT;
BEGIN
  -- Only send for published blog posts
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Get blog post details
    SELECT title, content, slug INTO blog_title, blog_content, blog_slug
    FROM public.blog_posts
    WHERE id = NEW.id;

    -- Send to all newsletter subscribers
    FOR subscriber_record IN
      SELECT email FROM public.newsletter_subscribers
    LOOP
      -- Call the notify-admin function with newsletter type
      PERFORM
        net.http_post(
          url := (SELECT url FROM supabase.functions WHERE name = 'notify-admin'),
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT value FROM supabase.secrets WHERE name = 'service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'newsletter',
            'data', jsonb_build_object(
              'email', subscriber_record.email,
              'blog_title', blog_title,
              'blog_content', blog_content,
              'blog_slug', blog_slug
            )
          )
        );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for blog post publishing
DROP TRIGGER IF EXISTS on_blog_post_published_send_newsletter ON public.blog_posts;
CREATE TRIGGER on_blog_post_published_send_newsletter
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.send_blog_post_to_subscribers();

-- =========================================
-- 9. UPDATE VENTURE APPLICATIONS TO USE CORRECT TABLE
-- =========================================

-- Ensure venture_applications table exists (from previous migration)
-- Update the Venture Studio form to use venture_applications instead of startups

-- =========================================
-- 10. INSERT INITIAL PROJECT DATA
-- =========================================

-- Insert the three projects (logos will be uploaded via admin dashboard)
INSERT INTO public.projects (name, project_link) VALUES
  ('Green Beam Connect', NULL),
  ('Citizens Voice', 'https://citizensvoice.app'),
  ('Digital Skill Scholarship', '/dss')
ON CONFLICT (name) DO NOTHING;