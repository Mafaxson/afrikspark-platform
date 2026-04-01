-- =========================================
-- ADD DESCRIPTION AND TAG COLUMNS TO PROJECTS TABLE
-- =========================================
-- This migration safely adds description and tag columns to the existing projects table
-- without deleting any existing data

-- Add description column (nullable to preserve existing data)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS description text;

-- Add tag column (nullable to preserve existing data)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS tag text;

-- =========================================
-- UPDATE RLS POLICIES (if needed)
-- =========================================
-- Policies should already exist from previous migration, but ensuring they're correct

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

-- Recreate policies
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- CREATE PROJECT LOGOS STORAGE BUCKET (if not exists)
-- =========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('projects_logos', 'projects_logos', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STORAGE POLICIES FOR PROJECT LOGOS
-- =========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view project logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project logos" ON storage.objects;

-- Recreate storage policies
CREATE POLICY "Anyone can view project logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects_logos');

CREATE POLICY "Admins can upload project logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'projects_logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update project logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'projects_logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete project logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'projects_logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );