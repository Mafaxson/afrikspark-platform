-- Add missing columns to blog_posts table for full functionality
-- Run this in Supabase SQL Editor

-- Add missing columns
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reading_time integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing records with default values
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

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND table_schema = 'public'
ORDER BY ordinal_position;