-- Run this SQL in your Supabase SQL Editor to create the team_members table
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create team_members table for team management
-- This table stores team member information for the About page

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read team members
CREATE POLICY "Anyone can view team members" ON public.team_members
  FOR SELECT USING (true);

-- Allow admins to do everything
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON public.team_members(created_at);

-- Insert mock data
INSERT INTO public.team_members (name, role, bio, image_url)
VALUES
('Ishmeal Kamara', 'Founder & CEO', 'Visionary leader driving youth empowerment.', ''),
('Fatmata Conteh', 'Program Manager', 'Leads DSS programs and training.', ''),
('Mohamed Sesay', 'Lead Developer', 'Builds platforms and systems.', ''),
('Hawa Kamara', 'Community Manager', 'Supports student growth.', ''),
('Abdul Koroma', 'Creative Director', 'Leads design and branding.');