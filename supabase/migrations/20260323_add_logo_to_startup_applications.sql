-- Add logo_url column to startup_applications table
ALTER TABLE public.startup_applications
ADD COLUMN IF NOT EXISTS logo_url TEXT;
