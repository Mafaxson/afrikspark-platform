-- =========================================
-- COMPLETE DATABASE SETUP FOR COHORT MANAGEMENT
-- =========================================

-- Add banner_url column to existing cohorts table
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create community_members table for student management
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  skill text,
  district text NOT NULL,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  avatar_url text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for community_members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved members
CREATE POLICY "Anyone can view approved community members" ON public.community_members
  FOR SELECT USING (approved = true);

-- Allow admins to do everything
CREATE POLICY "Admins can manage community members" ON public.community_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohorts_banner_url ON public.cohorts(banner_url);
CREATE INDEX IF NOT EXISTS idx_community_members_cohort_id ON public.community_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_community_members_approved ON public.community_members(approved);
CREATE INDEX IF NOT EXISTS idx_community_members_email ON public.community_members(email);

-- Add updated_at trigger for community_members
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_community_members_updated_at ON public.community_members;
CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();