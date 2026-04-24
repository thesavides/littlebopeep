-- Allow admins (not just super_admins) to update user profiles
-- Migration 005 dropped this policy and didn't replace it for regular admins
CREATE POLICY IF NOT EXISTS "Admins can update non-admin profiles"
ON user_profiles FOR UPDATE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
)
WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);
