-- =========================================
-- POPULATE PROJECTS TABLE WITH EXISTING DATA
-- =========================================
-- This script safely inserts the existing project data into the projects table
-- Only inserts if the project doesn't already exist (to avoid duplicates)

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