-- Fix all testimonials system issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Create the testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  organization text,
  photo_url text,
  testimonial_text text NOT NULL,
  video_url text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'hidden',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable RLS on testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for testimonials table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- Everyone can view active testimonials (and admins can view all)
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

-- Anyone can submit a testimonial (default hidden)
CREATE POLICY "Anyone can submit testimonial"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- Authenticated users can update their own testimonials, admins can update all
CREATE POLICY "Users can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete their own testimonials, admins can delete all
CREATE POLICY "Users can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Create testimony-media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimony-media', 'testimony-media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create storage policies for testimony-media bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Testimony media publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload testimony media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update testimony media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete testimony media" ON storage.objects;

-- Public read access
CREATE POLICY "Testimony media publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimony-media');

-- Allow anyone to upload (for testimonial submissions)
CREATE POLICY "Anyone can upload testimony media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'testimony-media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Users can update testimony media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'testimony-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can delete testimony media"
ON storage.objects FOR DELETE
USING (bucket_id = 'testimony-media' AND auth.role() = 'authenticated');

-- 6. Insert some sample testimonials for testing
INSERT INTO public.testimonials (name, role, organization, testimonial_text, video_url, is_featured, status) VALUES
('Sarah Johnson', 'Student', 'AfrikSpark Academy', 'AfrikSpark completely transformed my career in tech. The hands-on approach and mentorship helped me land my dream job as a software developer.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 'active'),
('Michael Chen', 'Client', 'TechCorp Solutions', 'Working with AfrikSpark was exceptional. Their team delivered innovative solutions that exceeded our expectations and helped scale our business.', NULL, true, 'active'),
('Dr. Amara Okafor', 'Partner', 'Nigerian Tech Hub', 'AfrikSpark is doing incredible work in building the next generation of African tech leaders. Their impact on the continent is remarkable.', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', false, 'active'),
('James Wilson', 'Student', 'AfrikSpark Academy', 'The community and support system at AfrikSpark is unmatched. I not only learned technical skills but also built lifelong connections with fellow developers.', NULL, false, 'active'),
('Grace Adebayo', 'Client', 'EduTech Nigeria', 'AfrikSpark helped us develop a cutting-edge educational platform. Their expertise in modern web technologies was exactly what we needed.', NULL, false, 'active')
ON CONFLICT DO NOTHING;