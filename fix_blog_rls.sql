-- Complete fix for blog_posts RLS policies
-- Run this in Supabase SQL Editor

-- 1. First, drop all existing conflicting policies
DROP POLICY IF EXISTS "Blog posts viewable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

-- 2. Create clean, working policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Ensure user has admin role
INSERT INTO user_roles (user_id, role)
VALUES ('7afaf1b1-0fdc-4346-854e-98934c5ddb10', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verify user role
SELECT 'User has admin role:' as check, COUNT(*) > 0 as has_admin
FROM user_roles
WHERE user_id = '7afaf1b1-0fdc-4346-854e-98934c5ddb10' AND role = 'admin';

-- 5. Test the policy by checking what auth.uid() returns for our user
-- This will help debug if the policy is working
SELECT 'Current auth.uid() would be checked against user_roles' as note;

-- 6. Show all current policies
SELECT 'Current policies:' as info, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'blog_posts';