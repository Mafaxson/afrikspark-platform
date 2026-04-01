-- =========================================
-- COMPLETE DATABASE SETUP FOR AFRIKSPARK FRONTEND
-- Paste this entire SQL into your Supabase SQL Editor
-- =========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =========================================
-- 1. USER MANAGEMENT TABLES
-- =========================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name text,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  email text
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =========================================
-- 2. PROJECTS TABLE (FOR FRONTEND DISPLAY)
-- =========================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  logo_url text,
  project_link text,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 3. NEWSLETTER SUBSCRIBERS
-- =========================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- 4. ENABLE RLS ON ALL TABLES
-- =========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 5. STORAGE BUCKETS
-- =========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-logos', 'project-logos', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 6. RLS POLICIES
-- =========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create a profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- User roles policies (allow all for now to avoid circular references)
CREATE POLICY "Allow all operations on user_roles" ON public.user_roles
  FOR ALL USING (true);

-- Projects policies (public read access for frontend display)
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Storage policies
CREATE POLICY "Anyone can view project logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-logos');

CREATE POLICY "Admins can upload project logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete project logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- =========================================
-- 7. INITIAL PROJECT DATA (FOR FRONTEND DISPLAY)
-- =========================================

INSERT INTO public.projects (name, project_link) VALUES
  ('Green Beam Connect', NULL),
  ('Citizens Voice', 'https://citizensvoice.app'),
  ('Digital Skill Scholarship', '/dss')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- 8. FUNCTIONS
-- =========================================

-- Function to grant admin role
CREATE OR REPLACE FUNCTION public.grant_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- =========================================
-- SETUP COMPLETE!
-- =========================================

-- Next steps:
-- 1. Find your user UUID from auth.users table
-- 2. Run: INSERT INTO public.user_roles (user_id, role) VALUES ('your-uuid', 'admin');
-- 3. Your frontend should now display projects and admin panel should work