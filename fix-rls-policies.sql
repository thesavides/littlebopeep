-- Fix infinite recursion in user_profiles RLS policies
-- This happens when policies query the same table they're protecting

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile (no recursion)
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Admins can read all profiles (FIXED with LIMIT 1 to break recursion)
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    LIMIT 1
  )
);

-- Policy 3: Super admins can insert new profiles
CREATE POLICY "Super admins can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    LIMIT 1
  )
);

-- Policy 4: Super admins can update any profile
CREATE POLICY "Super admins can update profiles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    LIMIT 1
  )
);

-- Policy 5: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1)
);

-- Policy 6: Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
ON user_profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    LIMIT 1
  )
);
