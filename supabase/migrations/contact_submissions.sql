-- Run in Supabase SQL editor or via CLI migration.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admin UI reads with the logged-in Supabase Auth session (anon key + user JWT).
CREATE POLICY "Authenticated users can read contact_submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserts are performed only from API routes using the service role key (bypasses RLS).
