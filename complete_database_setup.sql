-- =========================================
-- COMPLETE AFRIKSPARK DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- =========================================

-- =========================================
-- 1. ENABLE NECESSARY EXTENSIONS
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =========================================
-- 2. CREATE USER PROFILES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name text,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  email text
);

-- =========================================
-- 3. CREATE USER ROLES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =========================================
-- 4. CREATE APPLICATION SETTINGS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.application_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_link text,
  is_open boolean DEFAULT false NOT NULL,
  note text,
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 5. CREATE COHORTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  year integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 6. CREATE STUDENTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  skill text NOT NULL,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 7. CREATE BLOG POSTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 8. CREATE CONTACT MESSAGES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 9. CREATE TESTIMONIALS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  company text,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 10. CREATE PARTNERSHIPS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.partnerships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  interest text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 11. CREATE SPONSORS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  interest text NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 12. CREATE VENTURE APPLICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.venture_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  website text,
  industry text NOT NULL,
  stage text NOT NULL,
  funding_needed numeric,
  team_size integer,
  problem text NOT NULL,
  solution text NOT NULL,
  market_opportunity text,
  competitive_advantage text,
  business_model text,
  traction text,
  challenges text,
  support_needed text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 13. CREATE CHANNELS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  type text NOT NULL CHECK (type IN ('general', 'announcement', 'class')),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  is_admin_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 14. CREATE CHANNEL ADMINS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.channel_admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- =========================================
-- 15. CREATE EVENTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('webinar', 'bootcamp', 'mentorship', 'workshop')),
  date timestamp with time zone NOT NULL,
  location text,
  recording_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 16. CREATE RESOURCES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  link text NOT NULL,
  posted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 17. CREATE SITE SETTINGS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 18. CREATE PROJECTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  logo_url text,
  project_link text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 19. CREATE NEWSLETTER SUBSCRIBERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 20. CREATE VENTURE STUDIO TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.venture_studio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'funded', 'completed', 'paused')),
  funding_goal numeric,
  current_funding numeric DEFAULT 0,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 21. CREATE DSS PROGRAM TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.dss_program (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  duration text NOT NULL,
  curriculum text NOT NULL,
  requirements text NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  max_students integer,
  start_date date,
  application_deadline date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 22. CREATE SERVICES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon_url text,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 23. CREATE MEDIA ASSETS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document', 'audio')),
  url text NOT NULL,
  alt_text text,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 24. ENABLE RLS ON ALL TABLES
-- =========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_studio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dss_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 25. CREATE STORAGE BUCKETS
-- =========================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-logos', 'project-logos', true),
  ('partner-logos', 'partner-logos', true),
  ('sponsor-logos', 'sponsor-logos', true),
  ('venture-images', 'venture-images', true),
  ('service-icons', 'service-icons', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 26. RLS POLICIES
-- =========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create a profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Application settings policies
CREATE POLICY "Anyone can read application settings" ON public.application_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage application settings" ON public.application_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Cohorts policies
CREATE POLICY "Anyone can view cohorts" ON public.cohorts FOR SELECT USING (true);
CREATE POLICY "Admins can manage cohorts" ON public.cohorts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Students policies
CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Testimonials policies
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Partnerships policies
CREATE POLICY "Anyone can submit partnerships" ON public.partnerships FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage partnerships" ON public.partnerships FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Sponsors policies
CREATE POLICY "Anyone can submit sponsors" ON public.sponsors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Venture applications policies
CREATE POLICY "Anyone can submit venture applications" ON public.venture_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view venture applications" ON public.venture_applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Channels policies
CREATE POLICY "Approved users can view channels" ON public.channels FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true));
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Resources policies
CREATE POLICY "Approved users can view resources" ON public.resources FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true));
CREATE POLICY "Approved users can create resources" ON public.resources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true));
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Site settings policies
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Projects policies
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Newsletter subscribers policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Venture studio policies
CREATE POLICY "Anyone can view venture studio" ON public.venture_studio FOR SELECT USING (true);
CREATE POLICY "Admins can manage venture studio" ON public.venture_studio FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- DSS program policies
CREATE POLICY "Anyone can view DSS programs" ON public.dss_program FOR SELECT USING (true);
CREATE POLICY "Admins can manage DSS programs" ON public.dss_program FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Services policies
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Media assets policies
CREATE POLICY "Anyone can view media assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Admins can manage media assets" ON public.media_assets FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- =========================================
-- 27. STORAGE POLICIES
-- =========================================

-- Project logos
CREATE POLICY "Anyone can view project logos" ON storage.objects FOR SELECT USING (bucket_id = 'project-logos');
CREATE POLICY "Admins can upload project logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete project logos" ON storage.objects FOR DELETE USING (bucket_id = 'project-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Partner logos
CREATE POLICY "Anyone can view partner logos" ON storage.objects FOR SELECT USING (bucket_id = 'partner-logos');
CREATE POLICY "Admins can manage partner logos" ON storage.objects FOR ALL USING (bucket_id = 'partner-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Other storage buckets
CREATE POLICY "Anyone can view sponsor logos" ON storage.objects FOR SELECT USING (bucket_id = 'sponsor-logos');
CREATE POLICY "Admins can manage sponsor logos" ON storage.objects FOR ALL USING (bucket_id = 'sponsor-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view venture images" ON storage.objects FOR SELECT USING (bucket_id = 'venture-images');
CREATE POLICY "Admins can manage venture images" ON storage.objects FOR ALL USING (bucket_id = 'venture-images' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view service icons" ON storage.objects FOR SELECT USING (bucket_id = 'service-icons');
CREATE POLICY "Admins can manage service icons" ON storage.objects FOR ALL USING (bucket_id = 'service-icons' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins can manage media files" ON storage.objects FOR ALL USING (bucket_id = 'media' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- =========================================
-- 28. FUNCTIONS
-- =========================================

-- Function to grant admin role
CREATE OR REPLACE FUNCTION public.grant_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can grant admin role';
  END IF;

  -- Insert the admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

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

-- =========================================
-- 29. TRIGGERS
-- =========================================

-- Create trigger for blog post publishing
DROP TRIGGER IF EXISTS on_blog_post_published_send_newsletter ON public.blog_posts;
CREATE TRIGGER on_blog_post_published_send_newsletter
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.send_blog_post_to_subscribers();

-- =========================================
-- 30. INITIAL DATA
-- =========================================

-- Insert initial projects
INSERT INTO public.projects (name, project_link) VALUES
  ('Green Beam Connect', NULL),
  ('Citizens Voice', 'https://citizensvoice.app'),
  ('Digital Skill Scholarship', '/dss')
ON CONFLICT (name) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('dss_application_link', 'https://forms.google.com/your-dss-form-link')
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- SETUP COMPLETE
-- =========================================

-- Your database is now fully set up with all tables, policies, and functions!
-- Next steps:
-- 1. Create an admin user account
-- 2. Grant admin role to your user
-- 3. Configure email settings in Supabase Edge Functions
-- 4. Upload project logos via the admin dashboard