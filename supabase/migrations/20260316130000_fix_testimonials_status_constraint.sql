-- Fix testimonials status constraint to allow 'public' status
-- This migration updates the check constraint to include 'public' as a valid status

-- First, drop the existing constraint
ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_status_check;

-- Add the new constraint that allows 'active', 'hidden', and 'public'
ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_status_check
  CHECK (status IN ('active', 'hidden', 'public'));

-- Update any existing testimonials that might have invalid status
UPDATE public.testimonials SET status = 'active' WHERE status NOT IN ('active', 'hidden', 'public');

-- Optional: Update testimonials that are currently 'hidden' to 'public' if they should be visible
-- Uncomment the line below if you want to make all hidden testimonials public
-- UPDATE public.testimonials SET status = 'public' WHERE status = 'hidden';