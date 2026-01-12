-- Create user profile for super admin
-- This user already exists in auth.users, we just need the profile

INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  password_reset_required,
  created_at,
  updated_at
) VALUES (
  '66de4b16-7a81-4484-a460-35c2d2ac5a20',
  'chris@ukuva.com',
  'Chris Savides',
  'super_admin',
  'active',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
