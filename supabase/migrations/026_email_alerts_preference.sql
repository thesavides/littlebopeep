-- Add email alert opt-in preference to user_profiles
-- Default false — users must explicitly opt in on sign-up or in settings
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email_alerts_enabled BOOLEAN NOT NULL DEFAULT false;
