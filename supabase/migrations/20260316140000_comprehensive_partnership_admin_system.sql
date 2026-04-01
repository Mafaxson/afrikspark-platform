-- =========================================
-- COMPREHENSIVE PARTNERSHIP & ADMIN SYSTEM MIGRATION
-- =========================================
-- This migration creates:
-- 1. partnership_applications table
-- 2. venture_applications table
-- 3. partner-logos storage bucket
-- 4. RLS policies
-- 5. Email notification functions
-- 6. Admin role management

-- =========================================
-- 1. CREATE PARTNERSHIP APPLICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.partnership_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text,
  website text,
  partnership_type text NOT NULL CHECK (partnership_type IN ('partner', 'sponsor')),
  interest_area text[] NOT NULL, -- Array of selected areas
  message text,
  logo_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =========================================
-- 2. CREATE VENTURE APPLICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.venture_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_name text NOT NULL,
  founder_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  industry text,
  stage text CHECK (stage IN ('idea', 'mvp', 'early', 'growth', 'mature')),
  team_size integer,
  funding_needed numeric,
  funding_stage text,
  summary text NOT NULL,
  problem text,
  solution text,
  market_opportunity text,
  competitive_advantage text,
  business_model text,
  traction text,
  website text,
  linkedin text,
  pitch_deck_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =========================================
-- 3. UPDATE CONTACT MESSAGES TABLE
-- =========================================

-- Ensure contact_messages table exists with proper structure
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =========================================
-- 4. CREATE STORAGE BUCKET FOR PARTNER LOGOS
-- =========================================

-- Create the partner-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 5. ENABLE RLS ON ALL TABLES
-- =========================================

ALTER TABLE public.partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 6. RLS POLICIES FOR PARTNERSHIP APPLICATIONS
-- =========================================

-- Anyone can submit partnership applications
CREATE POLICY "Anyone can submit partnership applications"
  ON public.partnership_applications FOR INSERT
  WITH CHECK (true);

-- Anyone can view approved partnerships (for public display)
CREATE POLICY "Anyone can view approved partnerships"
  ON public.partnership_applications FOR SELECT
  USING (status = 'approved');

-- Admins can view all partnership applications
CREATE POLICY "Admins can view all partnership applications"
  ON public.partnership_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update partnership applications (approve/reject)
CREATE POLICY "Admins can update partnership applications"
  ON public.partnership_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 7. RLS POLICIES FOR VENTURE APPLICATIONS
-- =========================================

-- Anyone can submit venture applications
CREATE POLICY "Anyone can submit venture applications"
  ON public.venture_applications FOR INSERT
  WITH CHECK (true);

-- Admins can view all venture applications
CREATE POLICY "Admins can view all venture applications"
  ON public.venture_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update venture applications
CREATE POLICY "Admins can update venture applications"
  ON public.venture_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 8. RLS POLICIES FOR CONTACT MESSAGES
-- =========================================

-- Anyone can submit contact messages
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can view all contact messages
CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update contact messages (mark as read/replied)
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 9. STORAGE POLICIES FOR PARTNER LOGOS
-- =========================================

-- Anyone can view partner logos (public bucket)
CREATE POLICY "Anyone can view partner logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-logos');

-- Anyone can upload partner logos (for application submissions)
CREATE POLICY "Anyone can upload partner logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partner-logos');

-- Admins can delete partner logos
CREATE POLICY "Admins can delete partner logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'partner-logos' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 10. EMAIL NOTIFICATION FUNCTIONS
-- =========================================

-- Function to send email notifications (requires Supabase Edge Functions)
-- Note: This would need to be implemented as an Edge Function for actual email sending

-- Create a function to log notifications (for admin dashboard)
CREATE OR REPLACE FUNCTION public.log_admin_notification(
  notification_type text,
  title text,
  message text,
  related_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into a notifications table (create this table if needed)
  INSERT INTO public.admin_notifications (
    type, title, message, related_id, created_at
  ) VALUES (
    notification_type, title, message, related_id, now()
  );
END;
$$;

-- =========================================
-- 11. AUTO-ADMIN FUNCTION FOR SPECIFIC EMAIL
-- =========================================

-- Function to automatically grant admin role to specific email
CREATE OR REPLACE FUNCTION public.auto_grant_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the user signing up has the admin email, grant admin role
  IF NEW.email = 'ismealkamara20@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-grant admin role on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin_role();

-- =========================================
-- 12. UPDATE TRIGGERS FOR UPDATED_AT
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_partnership_applications_updated_at
  BEFORE UPDATE ON public.partnership_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venture_applications_updated_at
  BEFORE UPDATE ON public.venture_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 13. ADMIN NOTIFICATIONS TABLE (OPTIONAL)
-- =========================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 14. GRANT PERMISSIONS
-- =========================================

-- Grant necessary permissions
GRANT ALL ON public.partnership_applications TO authenticated;
GRANT ALL ON public.venture_applications TO authenticated;
GRANT ALL ON public.contact_messages TO authenticated;
GRANT ALL ON public.admin_notifications TO authenticated;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

DO $$
BEGIN
  RAISE NOTICE 'Comprehensive partnership and admin system migration completed successfully';
  RAISE NOTICE 'Created tables: partnership_applications, venture_applications, contact_messages, admin_notifications';
  RAISE NOTICE 'Created storage bucket: partner-logos';
  RAISE NOTICE 'Set up RLS policies and admin auto-grant system';
  RAISE NOTICE 'Email: ismealkamara20@gmail.com will be automatically granted admin role';
END $$;