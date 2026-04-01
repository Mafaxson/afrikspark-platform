-- =========================================
-- SECURE USER PROFILES MIGRATION
-- =========================================
-- This migration secures user profile access by:
-- 1. Creating a private schema for sensitive data
-- 2. Moving user profile views to private schema
-- 3. Creating SECURITY DEFINER functions for safe access
-- 4. Updating RLS policies for better security
-- 5. Revoking public access to sensitive data

-- =========================================
-- 1. CREATE PRIVATE SCHEMA
-- =========================================

-- Create private schema only accessible to service role
CREATE SCHEMA IF NOT EXISTS private;

-- Grant usage to service role only (not to anon or authenticated roles)
-- Note: Replace 'service_role' with your actual service role if different
GRANT USAGE ON SCHEMA private TO service_role;

-- =========================================
-- 2. CREATE SECURE USER PROFILE VIEW
-- =========================================

-- Create the users_with_profile view in private schema
-- This combines auth.users with public.profiles for admin use only
CREATE OR REPLACE VIEW private.users_with_profile AS
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at as user_created_at,
  au.last_sign_in_at,
  au.raw_user_meta_data,
  p.user_id,
  p.display_name,
  p.approved,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at,
  -- Check if user has admin role
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = au.id AND ur.role = 'admin'
  ) as is_admin
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id;

-- Grant access to service role only
GRANT SELECT ON private.users_with_profile TO service_role;

-- =========================================
-- 3. CREATE SECURITY DEFINER FUNCTIONS
-- =========================================

-- Function to get current user's profile (safe for authenticated users)
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data for the authenticated user
  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.approved,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = auth.uid();

  -- If no profile exists, return empty result
  IF NOT FOUND AND auth.uid() IS NOT NULL THEN
    RETURN QUERY SELECT
      auth.uid()::UUID,
      NULL::TEXT,
      false,
      now(),
      now();
  END IF;
END;
$$;

-- Function to get user profile by ID (with proper access control)
CREATE OR REPLACE FUNCTION public.get_user_profile(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_current_user_admin BOOLEAN := FALSE;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = current_user_id AND role = 'admin'
  ) INTO is_current_user_admin;

  -- Allow access if:
  -- 1. User is viewing their own profile, OR
  -- 2. User is an admin, OR
  -- 3. Profile is approved (for public viewing)
  IF current_user_id = target_user_id OR is_current_user_admin THEN
    RETURN QUERY
    SELECT
      p.user_id,
      p.display_name,
      p.approved,
      p.created_at,
      p.updated_at,
      is_current_user_admin
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
  ELSE
    -- For non-admin users viewing others, only show approved profiles
    RETURN QUERY
    SELECT
      p.user_id,
      p.display_name,
      p.approved,
      p.created_at,
      p.updated_at,
      FALSE
    FROM public.profiles p
    WHERE p.user_id = target_user_id AND p.approved = true;
  END IF;
END;
$$;

-- Function for admins to get all user profiles (service role access)
CREATE OR REPLACE FUNCTION private.get_all_user_profiles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  approved BOOLEAN,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  -- Only allow service role access
  IF NOT (SELECT current_setting('role') = 'service_role') THEN
    RAISE EXCEPTION 'Access denied. Service role required.';
  END IF;

  RETURN QUERY
  SELECT
    uwp.id,
    uwp.email,
    uwp.display_name,
    uwp.approved,
    uwp.is_admin,
    uwp.profile_created_at,
    uwp.last_sign_in_at
  FROM private.users_with_profile uwp
  ORDER BY uwp.profile_created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_all_user_profiles() TO service_role;

-- =========================================
-- 4. UPDATE RLS POLICIES FOR PROFILES
-- =========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create new secure policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can view approved profiles of others (for community features)
CREATE POLICY "Users can view approved profiles" ON public.profiles
  FOR SELECT USING (approved = true);

-- Policy 3: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 6: Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 5. REVOKE PUBLIC ACCESS
-- =========================================

-- Revoke all permissions from anon and authenticated roles on the private schema
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

-- Ensure no public access to auth.users data through views
-- (This is already handled by Supabase's built-in restrictions)

-- =========================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =========================================

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

-- =========================================
-- 7. MIGRATION COMPLETE
-- =========================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Secure user profiles migration completed successfully';
  RAISE NOTICE 'Private schema created with restricted access';
  RAISE NOTICE 'Security definer functions created for safe data access';
  RAISE NOTICE 'RLS policies updated for better security';
END $$;