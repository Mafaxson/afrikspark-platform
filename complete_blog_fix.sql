-- Complete fix for blog post creation issues
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reading_time integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update existing records with default values
UPDATE public.blog_posts
SET
  excerpt = CASE
    WHEN content IS NOT NULL AND length(content) > 200
    THEN substring(content, 1, 200) || '...'
    WHEN content IS NOT NULL
    THEN content
    ELSE 'No excerpt available'
  END,
  tags = COALESCE(tags, '{}'),
  reading_time = COALESCE(reading_time, 1),
  author = COALESCE(author, 'AfrikSpark Team')
WHERE excerpt IS NULL OR tags IS NULL OR reading_time IS NULL;

-- 3. Check and grant admin role to user
INSERT INTO user_roles (user_id, role)
VALUES ('7afaf1b1-0fdc-4346-854e-98934c5ddb10', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verify admin role
SELECT 'User roles:' as info, * FROM user_roles WHERE user_id = '7afaf1b1-0fdc-4346-854e-98934c5ddb10';

-- 5. Check blog_posts table policies
SELECT 'Blog policies:' as info, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'blog_posts';

-- 6. Verify table structure
SELECT 'Table columns:' as info, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND table_schema = 'public'
ORDER BY ordinal_position;