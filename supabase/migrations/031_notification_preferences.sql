-- Migration 031: add structured notification_preferences JSONB to user_profiles
-- Stores per-type toggles alongside the existing email_alerts_enabled column.
-- email_alerts_enabled is kept as the primary email flag for backwards compat.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "email_alerts": false,
    "in_app_claimed": true,
    "in_app_resolved": true,
    "in_app_thankyou": true,
    "in_app_new_report": true
  }'::jsonb;

-- Back-fill: sync existing email_alerts_enabled into the new JSONB column
UPDATE user_profiles
SET notification_preferences = jsonb_set(
  notification_preferences,
  '{email_alerts}',
  to_jsonb(email_alerts_enabled)
)
WHERE TRUE;

COMMENT ON COLUMN user_profiles.notification_preferences IS
  'Per-type notification preferences. Keys: email_alerts, in_app_claimed, in_app_resolved, in_app_thankyou, in_app_new_report.';
