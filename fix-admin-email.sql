-- Fix email mismatch between auth.users and user_profiles
-- Auth user has: chris@ukuva.com
-- Profile has: admin@littlebopeep.com
-- Need to update profile to match auth

UPDATE user_profiles
SET email = 'chris@ukuva.com'
WHERE id = '66de4b16-7a81-4484-a460-35c2d2ac5a20';

-- Verify the update
SELECT id, email, full_name, role, status
FROM user_profiles
WHERE id = '66de4b16-7a81-4484-a460-35c2d2ac5a20';
