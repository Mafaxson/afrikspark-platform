-- Grant the current authenticated user the admin role.
-- This function is intended to be called by a user who should become an admin.
-- It uses SECURITY DEFINER so it can bypass row-level security and insert into user_roles.

CREATE OR REPLACE FUNCTION public.grant_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  END IF;
END;
$$;
