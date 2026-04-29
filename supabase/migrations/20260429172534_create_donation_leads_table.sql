-- Create donation_leads table for DSS donation inquiries
CREATE TABLE IF NOT EXISTS donation_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  country TEXT,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('Individual', 'Company', 'NGO', 'Foundation', 'Anonymous')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  purpose TEXT,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('Email', 'WhatsApp', 'Phone Call')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Completed')),
  note TEXT
);

-- Enable RLS
ALTER TABLE donation_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin access)
CREATE POLICY "Allow admin access to donation_leads" ON donation_leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for service role (for edge functions)
CREATE POLICY "Allow service role access to donation_leads" ON donation_leads
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON donation_leads TO authenticated;
GRANT ALL ON donation_leads TO service_role;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_donation_leads_created_at ON donation_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_leads_status ON donation_leads(status);
CREATE INDEX IF NOT EXISTS idx_donation_leads_email ON donation_leads(email);