-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  interest TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor request" ON public.sponsors
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view sponsor requests" ON public.sponsors
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sponsors" ON public.sponsors
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sponsors" ON public.sponsors
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));