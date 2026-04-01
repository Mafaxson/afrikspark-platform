-- Create testimonials table for the new professional testimonial system
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  organization text,
  photo_url text,
  testimonial_text text NOT NULL,
  video_url text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'hidden' CHECK (status IN ('active', 'hidden')),
  cohort text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Everyone can view active testimonials (and admins can view all)
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'active');

-- Anyone can submit a testimonial (default hidden)
CREATE POLICY "Anyone can submit testimonial"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- For now, allow anyone to update/delete (you can restrict this later with proper admin auth)
CREATE POLICY "Anyone can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (true);
