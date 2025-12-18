-- =========================================================================
-- TEAMS RLS POLICY: Public SELECT, President-only UPDATE
-- =========================================================================

-- First, create a helper function to check if the current user is a president
CREATE OR REPLACE FUNCTION is_president()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND LOWER(r.name) = 'president'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Exclusive roles can manage teams" ON teams;

-- New Policy 1: Anyone authenticated can SELECT (view) teams
CREATE POLICY "Teams are viewable by everyone" 
ON teams 
FOR SELECT 
TO authenticated 
USING (true);

-- New Policy 2: Only president can INSERT teams
CREATE POLICY "Only president can create teams" 
ON teams 
FOR INSERT 
TO authenticated 
WITH CHECK (is_president());

-- New Policy 3: Only president can UPDATE teams
CREATE POLICY "Only president can update teams" 
ON teams 
FOR UPDATE 
TO authenticated 
USING (is_president())
WITH CHECK (is_president());

-- New Policy 4: Only president can DELETE teams
CREATE POLICY "Only president can delete teams" 
ON teams 
FOR DELETE 
TO authenticated 
USING (is_president());
