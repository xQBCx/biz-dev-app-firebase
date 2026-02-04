-- Enable RLS on terms_versions table
ALTER TABLE terms_versions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read terms (they're public information)
CREATE POLICY "Anyone can view terms versions"
ON terms_versions
FOR SELECT
USING (true);