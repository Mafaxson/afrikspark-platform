-- =========================================
-- BLOG SYSTEM FIX: Use category_id instead of category name
-- =========================================

-- Add category_id column to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.blog_categories(id);

-- Update existing records to set category_id based on category name
UPDATE public.blog_posts
SET category_id = bc.id
FROM public.blog_categories bc
WHERE public.blog_posts.category = bc.category_name;

-- Drop the old category column
ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS category;

-- Update RLS policies to include category_id
DROP POLICY IF EXISTS "Blog posts viewable by everyone" ON public.blog_posts;
CREATE POLICY "Blog posts viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
