-- =========================================
-- DEBUGGING SCRIPT: Check Database Setup
-- Run this in Supabase SQL Editor to diagnose issues
-- =========================================

-- 1. Check if all required tables exist
SELECT 'Checking tables...' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check user_roles table structure specifically
SELECT 'Checking user_roles structure...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Check if user_roles table has any data
SELECT 'Checking user_roles data...' as status;
SELECT COUNT(*) as user_roles_count FROM public.user_roles;

-- 4. Check profiles table structure
SELECT 'Checking profiles structure...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Check if profiles table has any data
SELECT 'Checking profiles data...' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- 6. Check storage buckets
SELECT 'Checking storage buckets...' as status;
SELECT id, name, public FROM storage.buckets ORDER BY id;

-- 7. Check RLS status on key tables
SELECT 'Checking RLS status...' as status;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_roles', 'profiles', 'projects', 'newsletter_subscribers')
ORDER BY tablename;

-- 8. Test basic insert (this should work if table exists)
SELECT 'Testing basic insert...' as status;
-- This will fail if table doesn't exist or has issues
DO $$
BEGIN
    -- Try to insert a test record (will be rolled back)
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('00000000-0000-0000-0000-000000000000', 'test')::uuid;
    RAISE NOTICE 'Insert test passed';
    -- Rollback the test insert
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert test failed: %', SQLERRM;
        -- No rollback needed since it failed
END $$;

-- 9. Check for any existing policies that might be causing issues
SELECT 'Checking existing policies...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;