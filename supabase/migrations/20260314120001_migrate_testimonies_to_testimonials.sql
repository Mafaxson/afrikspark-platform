-- Migration script to copy data from testimonies to testimonials table
-- Run this after creating the testimonials table

INSERT INTO public.testimonials (
  name,
  role,
  organization,
  photo_url,
  testimonial_text,
  video_url,
  is_featured,
  status,
  created_at
)
SELECT
  name,
  role,
  organization,
  image_url,
  testimony,
  video_url,
  featured,
  CASE
    WHEN approved = true THEN 'active'
    ELSE 'hidden'
  END as status,
  created_at
FROM public.testimonies
WHERE testimony IS NOT NULL AND testimony != '';

-- Optional: Drop the old table after migration (uncomment if you want to clean up)
-- DROP TABLE public.testimonies;