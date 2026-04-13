-- Fix testimonials table schema
-- This migration recreates the testimonials table with the correct columns

-- 1. Drop the existing testimonials table (if it has wrong schema)
DROP TABLE IF EXISTS public.testimonials CASCADE;

-- 2. Create testimonials table with correct schema
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  organization text,
  photo_url text,
  testimonial_text text NOT NULL,
  video_url text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can delete testimonials" ON public.testimonials;

-- 5. Create new RLS policies
-- Public can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');

-- Anyone can submit a testimonial (defaults to pending)
CREATE POLICY "Anyone can submit testimonial"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admin) can update/manage
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users (admin) can delete
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (auth.role() = 'authenticated');

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at);

-- 7. Migrate data from testimonies table if it exists
INSERT INTO public.testimonials (name, role, organization, photo_url, testimonial_text, video_url, is_featured, status, created_at, updated_at)
SELECT 
  t.name,
  COALESCE(t.role, 'Student') as role,
  t.contact as organization,
  t.image_url as photo_url,
  t.testimony as testimonial_text,
  t.video_url,
  false as is_featured,
  CASE WHEN t.approved = true THEN 'approved' ELSE 'pending' END as status,
  t.created_at,
  now()
FROM public.testimonies t
WHERE t.testimony IS NOT NULL AND t.testimony != ''
ON CONFLICT DO NOTHING;

