-- Add new columns to testimonies table for enhanced testimonial system
ALTER TABLE public.testimonies 
ADD COLUMN email TEXT,
ADD COLUMN role TEXT,
ADD COLUMN cohort TEXT,
ADD COLUMN organization TEXT,
ADD COLUMN status TEXT DEFAULT 'pending',
ADD COLUMN featured BOOLEAN DEFAULT false;

-- Update existing records to have 'approved' status if they were previously approved
UPDATE public.testimonies 
SET status = CASE 
  WHEN approved = true THEN 'approved'
  ELSE 'pending'
END;

-- Create testimonial categories table
CREATE TABLE public.testimonial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on testimonial_categories
ALTER TABLE public.testimonial_categories ENABLE ROW LEVEL SECURITY;

-- Insert default categories
INSERT INTO public.testimonial_categories (category_name, description) VALUES
  ('Student', 'Current students in the Digital Skills Scholarship program'),
  ('Alumni', 'Graduates and former participants of the program'),
  ('Partner', 'Partner organizations and collaborators'),
  ('Mentor', 'Mentors and instructors in the program');

-- Create RLS policies for testimonial_categories
CREATE POLICY "Categories viewable by everyone"
  ON public.testimonial_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.testimonial_categories
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update testimonies RLS policy to consider status field
DROP POLICY IF EXISTS "Anyone can view approved testimonies" ON public.testimonies;

CREATE POLICY "Anyone can view approved testimonies"
  ON public.testimonies
  FOR SELECT
  USING (status = 'approved' OR has_role(auth.uid(), 'admin'::app_role));