-- =========================================================================
-- COMPLAINTS RLS POLICY: Authenticated Users Only
-- =========================================================================

-- Enable Row Level Security on complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view complaints" ON complaints;
DROP POLICY IF EXISTS "Authenticated users can create complaints" ON complaints;
DROP POLICY IF EXISTS "Authenticated users can update their own complaints" ON complaints;
DROP POLICY IF EXISTS "Authenticated users can delete their own complaints" ON complaints;

-- Policy 1: Authenticated users can view all complaints
CREATE POLICY "Authenticated users can view complaints" 
ON complaints 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy 2: Authenticated users can create complaints
CREATE POLICY "Authenticated users can create complaints" 
ON complaints 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = member_id);

-- Policy 3: Users can update only their own complaints
CREATE POLICY "Authenticated users can update their own complaints" 
ON complaints 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = member_id)
WITH CHECK (auth.uid() = member_id);

-- Policy 4: Users can delete only their own complaints
CREATE POLICY "Authenticated users can delete their own complaints" 
ON complaints 
FOR DELETE 
TO authenticated 
USING (auth.uid() = member_id);
