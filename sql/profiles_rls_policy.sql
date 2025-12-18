-- =========================================================================
-- PROFILES RLS POLICY: Self-edit with restrictions + President privileges
-- =========================================================================

-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Presidents can update specific fields" ON profiles;

-- Policy 1: All authenticated users can view all profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy 2: Users can update their own profile (except role_id, cotisation_status, is_validated, points)
-- This policy allows users to update personal information like fullname, email, phone, avatar_url, etc.
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Ensure they're not trying to change restricted fields
  -- Note: In practice, you'd handle this in application logic or use a trigger
  -- RLS can't directly prevent specific column updates, so this is enforced at app level
);

-- Policy 3: Presidents can update role_id, cotisation_status, is_validated, and points for any profile
CREATE POLICY "Presidents can update administrative fields" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND LOWER(r.name) = 'president'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND LOWER(r.name) = 'president'
  )
);

-- =========================================================================
-- IMPORTANT NOTES:
-- =========================================================================
-- RLS policies control WHO can update rows, but not WHICH COLUMNS.
-- To enforce column-level restrictions, you need to use one of these approaches:
--
-- 1. Application-level validation (recommended for your case)
-- 2. Database triggers
-- 3. Separate tables for different permission levels
--
-- For your requirements, I recommend handling this in your application code:
-- - When a regular user updates their profile, exclude role_id, cotisation_status, 
--   is_validated, and points from the update payload
-- - When a president updates a profile, only allow role_id, cotisation_status, 
--   is_validated, and points in the update payload
-- =========================================================================
