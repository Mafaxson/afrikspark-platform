
-- Enhance profiles with professional fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS skills text[],
  ADD COLUMN IF NOT EXISTS institution text,
  ADD COLUMN IF NOT EXISTS career_interest text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id);

-- Enhance channels with type and cohort association
ALTER TABLE public.channels 
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id),
  ADD COLUMN IF NOT EXISTS is_admin_only boolean NOT NULL DEFAULT false;

-- Channel admins (class admins)
CREATE TABLE public.channel_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);
ALTER TABLE public.channel_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view channel admins" ON public.channel_admins FOR SELECT USING (true);
CREATE POLICY "Super admin can manage channel admins" ON public.channel_admins FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Super admin can delete channel admins" ON public.channel_admins FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Channel members for class-based channels
CREATE TABLE public.channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view channel members" ON public.channel_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Approved users can request to join" ON public.channel_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Channel or super admins can update members" ON public.channel_members FOR UPDATE 
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    EXISTS (SELECT 1 FROM channel_admins WHERE channel_admins.channel_id = channel_members.channel_id AND channel_admins.user_id = auth.uid())
  );

-- Add reply_to for threaded replies on messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.messages(id);

-- Connections / friend system
CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Approved users can send connection requests" ON public.connections FOR INSERT 
  WITH CHECK (auth.uid() = requester_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Users can update their received requests" ON public.connections FOR UPDATE 
  USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete their connections" ON public.connections FOR DELETE 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Resources library
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_url text,
  link text,
  posted_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view resources" ON public.resources FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Approved users can post resources" ON public.resources FOR INSERT 
  WITH CHECK (auth.uid() = posted_by AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = posted_by);
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = posted_by);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'webinar',
  date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  recording_url text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view events" ON public.events FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Admins can create events" ON public.events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Event registrations
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Approved users can register" ON public.event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Users can unregister" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all registrations" ON public.event_registrations FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Projects collaboration
CREATE TABLE public.community_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  skills_needed text[],
  status text NOT NULL DEFAULT 'open',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.community_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view projects" ON public.community_projects FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Approved users can create projects" ON public.community_projects FOR INSERT 
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Owners can update projects" ON public.community_projects FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Owners or admins can delete projects" ON public.community_projects FOR DELETE 
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Project members
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.community_projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view project members" ON public.project_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Approved users can request to join" ON public.project_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.approved = true));
CREATE POLICY "Project owners can update members" ON public.project_members FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM community_projects WHERE community_projects.id = project_members.project_id AND community_projects.created_by = auth.uid()));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
