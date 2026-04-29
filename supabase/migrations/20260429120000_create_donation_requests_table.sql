-- Create donation requests table for DSS donors

CREATE TABLE public.donation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  amount numeric(10,2) NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'New',
  note text
);

ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit donation requests"
  ON public.donation_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view donation requests"
  ON public.donation_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update donation requests"
  ON public.donation_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
