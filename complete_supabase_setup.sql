-- =========================================
-- AFRIKSPARK TECH SOLUTIONS - COMPLETE SUPABASE SETUP
-- =========================================
-- Run this SQL in your Supabase SQL Editor to set up the complete backend
-- Project: https://flrnlsceusewzphbyugq.supabase.co

-- =========================================
-- 1. ENABLE NECESSARY EXTENSIONS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 2. AUTHENTICATION & USER MANAGEMENT TABLES
-- =========================================

-- Users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User roles and permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('member', 'moderator', 'admin')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =========================================
-- 3. COMMUNITY SECTION TABLES
-- =========================================

-- Community posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  media_urls text[], -- Array of media file URLs
  tags text[],
  category text DEFAULT 'general',
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Community comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE, -- For nested replies
  content text NOT NULL,
  media_url text, -- Single media attachment
  likes_count integer DEFAULT 0,
  is_edited boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Community likes
CREATE TABLE IF NOT EXISTS public.community_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- =========================================
-- 4. BLOG SYSTEM TABLES
-- =========================================

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  media_urls text[], -- Array of media file URLs
  tags text[],
  category text DEFAULT 'general',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  reading_time integer, -- Estimated reading time in minutes
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Blog comments
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  likes_count integer DEFAULT 0,
  is_approved boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Blog categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 5. PROJECTS & PORTFOLIO TABLES
-- =========================================

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  long_description text,
  client_name text,
  client_website text,
  project_url text,
  github_url text,
  featured_image_url text,
  media_urls text[], -- Array of media file URLs
  technologies text[],
  category text DEFAULT 'web-development',
  status text DEFAULT 'completed' CHECK (status IN ('planning', 'in-progress', 'completed', 'maintenance')),
  is_featured boolean DEFAULT false,
  start_date date,
  completion_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Project testimonials/reviews
CREATE TABLE IF NOT EXISTS public.project_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_role text,
  reviewer_company text,
  reviewer_avatar_url text,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 6. TESTIMONIALS SYSTEM
-- =========================================

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  organization text,
  photo_url text,
  testimonial_text text NOT NULL,
  video_url text,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'hidden' CHECK (status IN ('active', 'hidden', 'archived')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 7. SERVICES TABLES
-- =========================================

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  description text NOT NULL,
  icon_url text,
  featured_image_url text,
  media_urls text[],
  features text[],
  pricing jsonb, -- Flexible pricing structure
  category text DEFAULT 'consulting',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Service inquiries
CREATE TABLE IF NOT EXISTS public.service_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  project_description text NOT NULL,
  budget_range text,
  timeline text,
  additional_requirements text,
  attachments text[], -- Array of file URLs
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'accepted', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 8. PARTNERSHIPS & VENTURE STUDIO TABLES
-- =========================================

-- Partnerships
CREATE TABLE IF NOT EXISTS public.partnerships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name text NOT NULL,
  partner_website text,
  partner_logo_url text,
  partnership_type text DEFAULT 'strategic' CHECK (partnership_type IN ('strategic', 'technology', 'educational', 'community')),
  description text,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Venture Studio projects
CREATE TABLE IF NOT EXISTS public.venture_studio_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  long_description text,
  founder_name text,
  founder_email text,
  founder_linkedin text,
  project_stage text DEFAULT 'idea' CHECK (project_stage IN ('idea', 'mvp', 'beta', 'launched', 'scaling')),
  industry text,
  funding_needed numeric,
  funding_secured numeric DEFAULT 0,
  team_size integer DEFAULT 1,
  website_url text,
  demo_url text,
  pitch_deck_url text,
  logo_url text,
  media_urls text[],
  technologies text[],
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Venture Studio applications
CREATE TABLE IF NOT EXISTS public.venture_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.venture_studio_projects(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  applicant_linkedin text,
  applicant_bio text,
  motivation text NOT NULL,
  skills text[],
  availability text,
  attachments text[], -- Resume, portfolio, etc.
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 9. CONTACT & COMMUNICATION TABLES
-- =========================================

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'partnership', 'support', 'business', 'career')),
  attachments text[], -- Array of file URLs
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed')),
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  interests text[],
  is_active boolean DEFAULT true,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone
);

-- =========================================
-- 10. DSS (Data Science Solutions) TABLES
-- =========================================

-- DSS projects/consultations
CREATE TABLE IF NOT EXISTS public.dss_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  client_name text,
  client_email text,
  description text NOT NULL,
  requirements text,
  deliverables text[],
  technologies text[],
  budget_range text,
  timeline text,
  status text DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'analysis', 'development', 'testing', 'completed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attachments text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- DSS reports/documents
CREATE TABLE IF NOT EXISTS public.dss_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.dss_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  report_type text DEFAULT 'analysis' CHECK (report_type IN ('analysis', 'presentation', 'documentation', 'dataset')),
  file_url text NOT NULL,
  file_size integer,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 11. MEDIA MANAGEMENT TABLES
-- =========================================

-- Media files registry
CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  bucket_name text NOT NULL,
  file_type text NOT NULL, -- 'image', 'video', 'audio', 'document'
  mime_type text NOT NULL,
  file_size integer,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  related_to_table text, -- 'community_posts', 'blog_posts', etc.
  related_to_id uuid,
  alt_text text,
  caption text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 12. SITE MANAGEMENT TABLES
-- =========================================

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 13. STORAGE BUCKETS SETUP
-- =========================================

-- Create all storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('avatars', 'avatars', true),
('community-media', 'community-media', true),
('blog-media', 'blog-media', true),
('project-media', 'project-media', true),
('testimonial-media', 'testimonial-media', true),
('service-media', 'service-media', true),
('partnership-logos', 'partnership-logos', true),
('venture-media', 'venture-media', true),
('contact-attachments', 'contact-attachments', false),
('dss-files', 'dss-files', false),
('documents', 'documents', false),
('videos', 'videos', true),
('audio-files', 'audio-files', true),
('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dss_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 15. RLS POLICIES FOR PROFILES
-- =========================================

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 16. RLS POLICIES FOR COMMUNITY
-- =========================================

-- Community posts policies
CREATE POLICY "Anyone can view published community posts" ON public.community_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create community posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own community posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all community posts" ON public.community_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Community comments policies
CREATE POLICY "Anyone can view community comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Community likes policies
CREATE POLICY "Anyone can view likes" ON public.community_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage likes" ON public.community_likes
  FOR ALL USING (auth.role() = 'authenticated');

-- =========================================
-- 17. RLS POLICIES FOR BLOG
-- =========================================

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Blog comments policies
CREATE POLICY "Anyone can view approved blog comments" ON public.blog_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create blog comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage blog comments" ON public.blog_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- =========================================
-- 18. RLS POLICIES FOR PROJECTS
-- =========================================

-- Projects policies
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Project reviews policies
CREATE POLICY "Anyone can view project reviews" ON public.project_reviews
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage project reviews" ON public.project_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 19. RLS POLICIES FOR TESTIMONIALS
-- =========================================

-- Testimonials policies
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
  FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can submit testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 20. RLS POLICIES FOR SERVICES
-- =========================================

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service inquiries policies
CREATE POLICY "Admins can view service inquiries" ON public.service_inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create service inquiries" ON public.service_inquiries
  FOR INSERT WITH CHECK (true);

-- =========================================
-- 21. RLS POLICIES FOR PARTNERSHIPS & VENTURE STUDIO
-- =========================================

-- Partnerships policies
CREATE POLICY "Anyone can view active partnerships" ON public.partnerships
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage partnerships" ON public.partnerships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Venture studio projects policies
CREATE POLICY "Anyone can view active venture projects" ON public.venture_studio_projects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage venture projects" ON public.venture_studio_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Venture applications policies
CREATE POLICY "Admins can view venture applications" ON public.venture_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create venture applications" ON public.venture_applications
  FOR INSERT WITH CHECK (true);

-- =========================================
-- 22. RLS POLICIES FOR CONTACT & COMMUNICATION
-- =========================================

-- Contact messages policies
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Newsletter subscriptions policies
CREATE POLICY "Admins can view newsletter subscriptions" ON public.newsletter_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can manage own newsletter subscription" ON public.newsletter_subscriptions
  FOR ALL USING (auth.jwt() ->> 'email' = email);

-- =========================================
-- 23. RLS POLICIES FOR DSS
-- =========================================

-- DSS projects policies
CREATE POLICY "Admins can manage DSS projects" ON public.dss_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DSS reports policies
CREATE POLICY "Admins can manage DSS reports" ON public.dss_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view public DSS reports" ON public.dss_reports
  FOR SELECT USING (is_public = true);

-- =========================================
-- 24. RLS POLICIES FOR MEDIA & SITE MANAGEMENT
-- =========================================

-- Media files policies
CREATE POLICY "Anyone can view public media files" ON public.media_files
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can manage media files" ON public.media_files
  FOR ALL USING (auth.role() = 'authenticated');

-- Site settings policies
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 25. STORAGE BUCKET POLICIES
-- =========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Community media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community media" ON storage.objects;
DROP POLICY IF EXISTS "Blog media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload blog media" ON storage.objects;
DROP POLICY IF EXISTS "Project media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project media" ON storage.objects;
DROP POLICY IF EXISTS "Testimonial media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload testimonial media" ON storage.objects;
DROP POLICY IF EXISTS "Service media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload service media" ON storage.objects;
DROP POLICY IF EXISTS "Partnership logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload partnership logos" ON storage.objects;
DROP POLICY IF EXISTS "Venture media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload venture media" ON storage.objects;
DROP POLICY IF EXISTS "Contact attachments are private" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload contact attachments" ON storage.objects;
DROP POLICY IF EXISTS "DSS files are private" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage DSS files" ON storage.objects;
DROP POLICY IF EXISTS "Documents are private" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON storage.objects;
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "User uploads are private" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own uploads" ON storage.objects;

-- Avatar images
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Community media
CREATE POLICY "Community media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');

CREATE POLICY "Authenticated users can upload community media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own community media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own community media" ON storage.objects
  FOR DELETE USING (bucket_id = 'community-media' AND auth.role() = 'authenticated');

-- Blog media
CREATE POLICY "Blog media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-media');

CREATE POLICY "Admins can upload blog media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-media' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Admins can manage blog media" ON storage.objects
  FOR ALL USING (bucket_id = 'blog-media' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Project media
CREATE POLICY "Project media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-media');

CREATE POLICY "Admins can manage project media" ON storage.objects
  FOR ALL USING (bucket_id = 'project-media' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Testimonial media
CREATE POLICY "Testimonial media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'testimonial-media');

CREATE POLICY "Anyone can upload testimonial media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'testimonial-media');

CREATE POLICY "Authenticated users can manage testimonial media" ON storage.objects
  FOR ALL USING (bucket_id = 'testimonial-media' AND auth.role() = 'authenticated');

-- Service media
CREATE POLICY "Service media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-media');

CREATE POLICY "Admins can manage service media" ON storage.objects
  FOR ALL USING (bucket_id = 'service-media' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Partnership logos
CREATE POLICY "Partnership logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'partnership-logos');

CREATE POLICY "Admins can manage partnership logos" ON storage.objects
  FOR ALL USING (bucket_id = 'partnership-logos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Venture media
CREATE POLICY "Venture media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'venture-media');

CREATE POLICY "Authenticated users can upload venture media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'venture-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own venture media" ON storage.objects
  FOR ALL USING (bucket_id = 'venture-media' AND auth.role() = 'authenticated');

-- Contact attachments (private)
CREATE POLICY "Authenticated users can upload contact attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contact-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view contact attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'contact-attachments' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DSS files (private)
CREATE POLICY "Admins can manage DSS files" ON storage.objects
  FOR ALL USING (bucket_id = 'dss-files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Documents (private)
CREATE POLICY "Authenticated users can manage documents" ON storage.objects
  FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Videos
CREATE POLICY "Videos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own videos" ON storage.objects
  FOR ALL USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Audio files
CREATE POLICY "Audio files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-files');

CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own audio files" ON storage.objects
  FOR ALL USING (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

-- User uploads (private)
CREATE POLICY "Users can manage their own uploads" ON storage.objects
  FOR ALL USING (bucket_id = 'user-uploads' AND auth.role() = 'authenticated');

-- =========================================
-- 26. FUNCTIONS & TRIGGERS
-- =========================================

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venture_studio_projects_updated_at BEFORE UPDATE ON public.venture_studio_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 27. SAMPLE DATA INSERTION
-- =========================================

-- Insert sample admin user (you'll need to update this with actual user ID)
-- Note: This will be created when you sign up as admin

-- Insert sample blog categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech trends and innovations', '#3b82f6'),
('Community', 'community', 'Community news and updates', '#10b981'),
('Education', 'education', 'Learning resources and tutorials', '#f59e0b'),
('Business', 'business', 'Business insights and strategies', '#ef4444'),
('Innovation', 'innovation', 'Cutting-edge solutions and ideas', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample services
INSERT INTO public.services (title, slug, short_description, description, features, category, display_order) VALUES
('Web Development', 'web-development', 'Custom web applications built with modern technologies', 'Full-stack web development using React, Node.js, and cloud technologies. We build scalable, secure, and performant web applications tailored to your business needs.', ARRAY['Responsive Design', 'API Development', 'Database Design', 'Cloud Deployment', 'Security Implementation'], 'development', 1),
('Data Science Solutions', 'data-science-solutions', 'Transform your data into actionable insights', 'Advanced data analysis, machine learning models, and business intelligence solutions to help you make data-driven decisions.', ARRAY['Data Analysis', 'Machine Learning', 'Predictive Modeling', 'Data Visualization', 'ETL Processes'], 'consulting', 2),
('Digital Marketing', 'digital-marketing', 'Comprehensive digital marketing strategies', 'Complete digital marketing solutions including SEO, social media marketing, content creation, and campaign management.', ARRAY['SEO Optimization', 'Social Media Marketing', 'Content Creation', 'Email Marketing', 'Analytics & Reporting'], 'marketing', 3),
('UI/UX Design', 'ui-ux-design', 'Beautiful and intuitive user experiences', 'User-centered design approach to create engaging and effective user interfaces that drive conversion and user satisfaction.', ARRAY['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Design Systems'], 'design', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, organization, testimonial_text, video_url, is_featured, status) VALUES
('Sarah Johnson', 'Student', 'AfrikSpark Academy', 'AfrikSpark completely transformed my career in tech. The hands-on approach and mentorship helped me land my dream job as a software developer.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 'active'),
('Michael Chen', 'Client', 'TechCorp Solutions', 'Working with AfrikSpark was exceptional. Their team delivered innovative solutions that exceeded our expectations and helped scale our business.', NULL, true, 'active'),
('Dr. Amara Okafor', 'Partner', 'Nigerian Tech Hub', 'AfrikSpark is doing incredible work in building the next generation of African tech leaders. Their impact on the continent is remarkable.', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', false, 'active'),
('James Wilson', 'Student', 'AfrikSpark Academy', 'The community and support system at AfrikSpark is unmatched. I not only learned technical skills but also built lifelong connections with fellow developers.', NULL, false, 'active'),
('Grace Adebayo', 'Client', 'EduTech Nigeria', 'AfrikSpark helped us develop a cutting-edge educational platform. Their expertise in modern web technologies was exactly what we needed.', NULL, false, 'active')
ON CONFLICT DO NOTHING;

-- =========================================
-- SETUP COMPLETE
-- =========================================

-- Final message
DO $$
BEGIN
  RAISE NOTICE 'AfrikSpark Tech Solutions Supabase setup completed successfully!';
  RAISE NOTICE 'Database tables, storage buckets, and security policies have been configured.';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your environment variables with the correct Supabase URL and keys';
  RAISE NOTICE '2. Sign up as an admin user and update their role in the profiles table';
  RAISE NOTICE '3. Test the application functionality';
END $$;