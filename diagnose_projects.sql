-- =========================================
-- DIAGNOSTIC QUERIES
-- =========================================

-- Check if projects table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'projects'
) as table_exists;

-- Check projects table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
ORDER BY ordinal_position;

-- Check current projects data
SELECT id, name, description, tag, logo_url, project_link, created_at
FROM public.projects
ORDER BY created_at;