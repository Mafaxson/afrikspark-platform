-- Add banner_url column to cohorts table
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add index for banner_url if needed
CREATE INDEX IF NOT EXISTS idx_cohorts_banner_url ON public.cohorts(banner_url);