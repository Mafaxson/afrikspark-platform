-- =========================================
-- MISSING TABLES FOR ADMIN DASHBOARD
-- =========================================

-- Update user_roles to support community roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'moderator', 'community_leader', 'member'));

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text,
  interest text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text,
  interest text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create venture_studio table
CREATE TABLE IF NOT EXISTS public.venture_studio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'funded', 'completed', 'paused')),
  funding_goal numeric,
  current_funding numeric DEFAULT 0,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create dss_program table
CREATE TABLE IF NOT EXISTS public.dss_program (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  duration text NOT NULL,
  curriculum text NOT NULL,
  requirements text NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  max_students integer,
  start_date date,
  application_deadline date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  alt_text text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('general', 'announcement', 'class')),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  is_admin_only boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create channel_admins table
CREATE TABLE IF NOT EXISTS public.channel_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'webinar' CHECK (type IN ('webinar', 'bootcamp', 'mentorship', 'workshop')),
  date timestamp with time zone NOT NULL,
  location text,
  recording_url text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  link text NOT NULL,
  posted_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_studio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dss_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Admins can manage everything)
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage venture_studio" ON public.venture_studio FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage dss_program" ON public.dss_program FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage media_assets" ON public.media_assets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage channel_admins" ON public.channel_admins FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Public read policies where appropriate
CREATE POLICY "Anyone can view venture_studio" ON public.venture_studio FOR SELECT USING (true);
CREATE POLICY "Anyone can view dss_program" ON public.dss_program FOR SELECT USING (true);
CREATE POLICY "Anyone can view media_assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);