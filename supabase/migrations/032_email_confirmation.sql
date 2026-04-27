-- Migration 032: Email confirmation tracking
-- Adds email_confirmed_at to user_profiles and updates status for new signups

-- Add email_confirmed_at column
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ DEFAULT NULL;

-- Back-fill: existing active users are considered confirmed
-- (they signed up before email verification was enforced)
UPDATE user_profiles
  SET email_confirmed_at = updated_at
  WHERE status = 'active'
    AND email_confirmed_at IS NULL;

-- Index for admin queries filtering by pending verification
CREATE INDEX IF NOT EXISTS idx_user_profiles_pending_verification
  ON user_profiles (status)
  WHERE status = 'pending_verification';
