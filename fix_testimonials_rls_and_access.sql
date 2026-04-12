-- ==========================================
-- FIX TESTIMONIALS RLS & DATA FLOW
-- ==========================================

-- Drop existing problematic RLS policies
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can delete testimonials" ON public.testimonials;

-- New RLS policies that actually work:

-- 1. Allow admins to view and manage ALL testimonials (active, hidden, featured)
CREATE POLICY "Admins can view all testimonials"
  ON public.testimonials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Allow public to view ONLY active testimonials
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'active');

-- 3. Allow anyone (no auth required) to submit testimonials
CREATE POLICY "Anyone can submit testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- 4. Allow admins to update testimonials (for approval, featuring, etc.)
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Allow admins to delete testimonials
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant proper access to authenticated users
GRANT SELECT ON public.testimonials TO authenticated;
GRANT INSERT ON public.testimonials TO authenticated;
GRANT UPDATE ON public.testimonials TO authenticated;
GRANT DELETE ON public.testimonials TO authenticated;
GRANT SELECT ON public.testimonials TO anon;
GRANT INSERT ON public.testimonials TO anon;

-- Ensure profiles table has proper access (for admin role checking in RLS)
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
