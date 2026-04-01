-- Add performance indexes for optimized queries
-- This migration adds indexes for frequently queried fields

-- Index for profiles.cohort_id (foreign key, should already exist but ensuring)
CREATE INDEX IF NOT EXISTS idx_profiles_cohort_id ON public.profiles(cohort_id);

-- Index for profiles.approved (already exists from previous migration, but ensuring)
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);

-- GIN index for profiles.skills array (for array contains operations)
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);

-- Index for profiles.location (district field)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);

-- Additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Indexes for community tables
CREATE INDEX IF NOT EXISTS idx_community_projects_status ON public.community_projects(status);
CREATE INDEX IF NOT EXISTS idx_community_projects_created_by ON public.community_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_posted_by ON public.resources(posted_by);