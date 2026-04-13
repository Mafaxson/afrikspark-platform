-- ============================================
-- COMPLETE TESTIMONIALS FIX - COPY & PASTE
-- ============================================
-- This SQL fixes all RLS policies and activates testimonials
-- to make them appear on the frontend immediately

-- ============================================
-- STEP 1: DROP EXISTING BROKEN POLICIES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can delete testimonials" ON public.testimonials;

-- ============================================
-- STEP 2: CREATE NEW WORKING RLS POLICIES
-- ============================================

-- POLICY 1: Admins can see ALL testimonials (for approval workflow)
CREATE POLICY "Admins can view all testimonials"
  ON public.testimonials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 2: Public can see ONLY active testimonials (security)
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'active');

-- POLICY 3: Anyone (no auth required) can submit testimonials
CREATE POLICY "Anyone can submit testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- POLICY 4: Only admins can update (for approval & management)
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 5: Only admins can delete
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON public.testimonials TO authenticated, anon;
GRANT INSERT ON public.testimonials TO authenticated, anon;
GRANT UPDATE ON public.testimonials TO authenticated;
GRANT DELETE ON public.testimonials TO authenticated;
GRANT SELECT ON public.profiles TO authenticated, anon;

-- ============================================
-- STEP 4: ACTIVATE ALL EXISTING TESTIMONIALS
-- ============================================
-- This makes all currently hidden testimonials visible on frontend
UPDATE public.testimonials
SET status = 'active'
WHERE status = 'hidden';

-- ============================================
-- STEP 5: VERIFY THE FIX
-- ============================================
-- Run this to check how many testimonials are now active:
-- SELECT COUNT(*) as total_testimonials, 
--        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
--        SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) as hidden
-- FROM public.testimonials;

-- Expected result after fix:
-- total_testimonials | active | hidden
-- ------------------|--------|--------
--        X           |   X    |   0
-- (All testimonials should be active now)
