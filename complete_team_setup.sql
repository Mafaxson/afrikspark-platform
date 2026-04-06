-- =========================================
-- AFRIKSPARK TEAM MANAGEMENT SYSTEM SETUP
-- Complete SQL setup for team_members table and storage bucket
-- Run this in your Supabase SQL Editor
-- =========================================

-- =========================================
-- 1. CREATE TEAM_MEMBERS TABLE
-- =========================================

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read team members (for public website viewing)
CREATE POLICY "Anyone can view team members" ON public.team_members
  FOR SELECT USING (true);

-- Allow admins to manage team members (CRUD operations)
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON public.team_members(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_name ON public.team_members(name);

-- =========================================
-- 2. CREATE STORAGE BUCKET FOR TEAM IMAGES
-- =========================================

-- Create storage bucket for team member images
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-members', 'team-members', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 3. STORAGE POLICIES FOR TEAM IMAGES
-- =========================================

-- Allow anyone to view team member images (public bucket)
CREATE POLICY "Team member images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-members');

-- Allow authenticated users to upload team member images
CREATE POLICY "Users can upload team member images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'team-members'
    AND auth.role() = 'authenticated'
  );

-- Allow admins to update/delete team member images
CREATE POLICY "Admins can update team member images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'team-members'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete team member images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'team-members'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =========================================
-- 4. INSERT INITIAL TEAM MEMBERS
-- =========================================

-- Insert initial team members (will be skipped if they already exist due to ON CONFLICT)
INSERT INTO public.team_members (name, role, bio, image_url) VALUES
('Ishmeal Kamara', 'Founder & CEO', 'Visionary leader driving youth empowerment through digital skills and innovation.', ''),
('Fatmata Conteh', 'Program Manager', 'Leads DSS programs and training initiatives across Sierra Leone.', ''),
('Mohamed Sesay', 'Lead Developer', 'Builds platforms and systems for digital transformation.', ''),
('Hawa Kamara', 'Community Manager', 'Supports student growth and community engagement.', ''),
('Abdul Koroma', 'Creative Director', 'Leads design and branding for impactful solutions.', '')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- SETUP COMPLETE
-- =========================================

-- Verify setup by running these queries after execution:
-- SELECT * FROM public.team_members;
-- SELECT * FROM storage.buckets WHERE id = 'team-members';