-- =========================================
-- COMPLETE ADMIN SYSTEM FIX
-- =========================================

-- 1. ENSURE ADMIN USER HAS PROPER ROLE
-- Replace 'ismealkamara20@gmail.com' with the actual admin email
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID for the admin email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'ismealkamara20@gmail.com';

    -- If user exists, ensure they have admin role
    IF admin_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user
        DELETE FROM public.user_roles WHERE user_id = admin_user_id;

        -- Add admin role
        INSERT INTO public.user_roles (user_id, role) VALUES (admin_user_id, 'admin');

        -- Ensure profile exists and is approved
        INSERT INTO public.profiles (user_id, display_name, approved)
        VALUES (admin_user_id, 'Admin User', true)
        ON CONFLICT (user_id) DO UPDATE SET
            approved = true,
            updated_at = now();
    END IF;
END $$;

-- 2. DROP EXISTING PROBLEMATIC POLICIES
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage project reviews" ON public.project_reviews;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can view service inquiries" ON public.service_inquiries;
DROP POLICY IF EXISTS "Admins can manage partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Admins can manage venture projects" ON public.venture_studio_projects;
DROP POLICY IF EXISTS "Admins can view venture applications" ON public.venture_applications;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;

-- 3. CREATE CORRECT RLS POLICIES USING has_role() FUNCTION

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies (admins can manage all, users manage own)
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Community posts policies
CREATE POLICY "Anyone can view published community posts" ON public.community_posts
  FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create community posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own community posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all community posts" ON public.community_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Blog comments policies
CREATE POLICY "Anyone can view approved blog comments" ON public.blog_comments
  FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create blog comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own blog comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage blog comments" ON public.blog_comments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Projects policies
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Project reviews policies
CREATE POLICY "Anyone can view project reviews" ON public.project_reviews
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage project reviews" ON public.project_reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials policies
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
  FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own testimonials" ON public.testimonials
  FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Service inquiries policies
CREATE POLICY "Admins can view service inquiries" ON public.service_inquiries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create service inquiries" ON public.service_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage service inquiries" ON public.service_inquiries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Partnerships policies
CREATE POLICY "Anyone can view active partnerships" ON public.partnerships
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage partnerships" ON public.partnerships
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Venture studio projects policies
CREATE POLICY "Anyone can view active venture projects" ON public.venture_studio_projects
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage venture projects" ON public.venture_studio_projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Venture applications policies
CREATE POLICY "Admins can view venture applications" ON public.venture_applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create venture applications" ON public.venture_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage venture applications" ON public.venture_applications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Contact messages policies
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages" ON public.contact_messages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Application settings policies
CREATE POLICY "Anyone can read application settings" ON public.application_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage application settings" ON public.application_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- DSS projects policies
CREATE POLICY "Admins can view DSS projects" ON public.dss_projects
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create DSS projects" ON public.dss_projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage DSS projects" ON public.dss_projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- DSS reports policies
CREATE POLICY "Admins can view DSS reports" ON public.dss_reports
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage DSS reports" ON public.dss_reports
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Media files policies
CREATE POLICY "Anyone can view public media files" ON public.media_files
  FOR SELECT USING (is_public = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can upload media files" ON public.media_files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own media files" ON public.media_files
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all media files" ON public.media_files
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Site settings policies
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- 4. STORAGE BUCKET POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public access to public buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'community-media', 'blog-media', 'project-media', 'testimonial-media', 'service-media', 'partnership-logos', 'venture-media', 'videos', 'audio-files'));

CREATE POLICY "Authenticated users can upload to user buckets" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('avatars', 'community-media', 'blog-media', 'project-media', 'testimonial-media', 'service-media', 'partnership-logos', 'venture-media', 'contact-attachments', 'user-uploads', 'videos', 'audio-files')
  );

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1] OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all files" ON storage.objects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. CREATE HELPER FUNCTIONS

-- Function to check if user is admin (for use in policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), action_type, resource_type, resource_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_partnerships_active ON public.partnerships(is_active);
CREATE INDEX IF NOT EXISTS idx_venture_projects_active ON public.venture_studio_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_media_files_public ON public.media_files(is_public);

-- 7. GRANT NECESSARY PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. ENSURE ADMIN HAS ALL NECESSARY PERMISSIONS
-- This will be run after the admin user is confirmed to exist