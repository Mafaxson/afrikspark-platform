-- =========================================
-- SAFE PROJECTS TABLE CREATION AND DATA INSERTION
-- =========================================

-- First, ensure the projects table exists with correct structure
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  tag text,
  logo_url text,
  project_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (for safety)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS tag text;

-- Now insert the data safely
INSERT INTO public.projects (name, description, tag)
VALUES
  ('Green Beam Connect',
   'A climate innovation project improving waste management in Sierra Leone through technology-driven solutions and community engagement.',
   'Climate Tech'),
  ('Citizens Voice',
   'A civic-tech platform ensuring citizen participation and inclusive governance by amplifying community voices through digital tools.',
   'Civic Tech'),
  ('Digital Skill Scholarship',
   'A comprehensive scholarship program providing free digital skills training to underprivileged youth across Sierra Leone.',
   'Education')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tag = EXCLUDED.tag
WHERE projects.description IS NULL OR projects.tag IS NULL;

-- =========================================
-- VERIFY THE DATA WAS INSERTED
-- =========================================
SELECT name, description, tag FROM public.projects ORDER BY created_at;