
-- Create testimonies table
CREATE TABLE public.testimonies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact text,
  image_url text,
  video_url text,
  testimony text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved testimonies
CREATE POLICY "Anyone can view approved testimonies"
  ON public.testimonies FOR SELECT
  USING (approved = true OR has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit a testimony
CREATE POLICY "Anyone can submit testimony"
  ON public.testimonies FOR INSERT
  WITH CHECK (true);

-- Admins can update testimonies
CREATE POLICY "Admins can update testimonies"
  ON public.testimonies FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete testimonies
CREATE POLICY "Admins can delete testimonies"
  ON public.testimonies FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create site_settings table for admin-managed settings like application link
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create testimony-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('testimony-media', 'testimony-media', true)
ON CONFLICT (id) DO NOTHING;
