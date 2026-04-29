-- Allow anonymous users to insert donation leads
CREATE POLICY "Allow anonymous inserts to donation_leads" ON donation_leads
FOR INSERT
TO anon
WITH CHECK (true);