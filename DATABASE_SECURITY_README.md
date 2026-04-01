# Database Security Migration Instructions

## Overview
This migration secures your Supabase database by implementing proper access controls for user profiles. The migration includes:

1. **Private Schema**: Creates a `private` schema for sensitive data
2. **Secure Views**: Moves `users_with_profile` view to private schema
3. **Security Definer Functions**: Creates safe functions for data access
4. **RLS Policies**: Updates Row-Level Security policies
5. **Access Revocation**: Removes public access to sensitive data

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `20260316120000_secure_user_profiles.sql`
4. Run the migration

### Option 2: Using Supabase CLI
1. Login to Supabase: `supabase login`
2. Link your project: `supabase link --project-ref flrnlsceusewzphbyugq`
3. Push the migration: `supabase db push`

### Option 3: Using Supabase CLI (Local Development)
1. Ensure Docker Desktop is running
2. Start local Supabase: `supabase start`
3. Push migrations: `supabase db push`

## What This Migration Does

### Security Improvements
- **Revokes public access** to `auth.users` data through views
- **Creates private schema** only accessible to service role
- **Implements SECURITY DEFINER functions** for safe data access
- **Updates RLS policies** for granular access control

### New Functions Available
- `public.get_current_user_profile()` - Get current user's profile
- `public.get_user_profile(uuid)` - Get specific user's profile (with access control)
- `private.get_all_user_profiles()` - Admin function to get all profiles

### Access Control Rules
- Users can view their own profile
- Users can view approved profiles of others
- Admins can view and manage all profiles
- Direct access to `auth.users` is blocked

## Frontend Code Updates Required

After applying the migration, update your frontend queries to use the new secure functions instead of direct table access.

### Before (Insecure)
```typescript
// Direct table access - NO LONGER ALLOWED
const { data: profiles } = await supabase
  .from('profiles')
  .select('*');
```

### After (Secure)
```typescript
// Use secure functions
const { data: myProfile } = await supabase
  .rpc('get_current_user_profile');

const { data: userProfile } = await supabase
  .rpc('get_user_profile', { target_user_id: userId });
```

## Testing the Migration

1. **Test User Access**: Verify users can only see their own and approved profiles
2. **Test Admin Access**: Confirm admins can see all profiles
3. **Test Function Calls**: Ensure the new RPC functions work correctly
4. **Check RLS**: Verify Row-Level Security is properly enforced

## Rollback Plan

If you need to rollback:
1. The migration is additive - it doesn't delete existing data
2. To revert policies, you can manually adjust RLS policies in the dashboard
3. The private schema can be dropped if needed: `DROP SCHEMA private CASCADE;`

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify the migration ran without errors
3. Test with a single user account first
4. Ensure your service role key is properly configured for admin functions