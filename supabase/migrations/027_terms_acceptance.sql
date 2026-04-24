-- Add terms & conditions acceptance tracking to user_profiles
alter table user_profiles
  add column if not exists terms_accepted_at  timestamptz,
  add column if not exists terms_accepted_meta jsonb;

comment on column user_profiles.terms_accepted_at  is 'UTC timestamp when user accepted Terms & Conditions';
comment on column user_profiles.terms_accepted_meta is 'Device metadata captured at acceptance: user_agent, language, screen, timezone, platform';
