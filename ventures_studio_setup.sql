-- Create startup_applications table
CREATE TABLE IF NOT EXISTS public.startup_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    startup_name TEXT NOT NULL,
    founder_name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create startups table for approved startups
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.startup_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Policies for startup_applications
CREATE POLICY "Anyone can submit startup applications" ON public.startup_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view startup applications" ON public.startup_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policies for startups
CREATE POLICY "Anyone can view approved startups" ON public.startups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage startups" ON public.startups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for startup logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('startup-logos', 'startup-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for startup-logos bucket
CREATE POLICY "Anyone can view startup logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'startup-logos');

CREATE POLICY "Authenticated users can upload startup logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'startup-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage startup logos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'startup-logos' AND
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for startup_applications
CREATE TRIGGER handle_startup_applications_updated_at
    BEFORE UPDATE ON public.startup_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();