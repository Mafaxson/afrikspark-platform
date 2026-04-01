-- =========================================
-- UPDATE USER ROLES FOR COMMUNITY PLATFORM
-- =========================================
-- Add support for community_leader and member roles

-- Update the role constraint to include new roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'moderator', 'community_leader', 'member'));

-- Update RLS policies to handle new roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Ensure community leaders can manage members in their channels
-- (This will be expanded when we implement channel-specific permissions)