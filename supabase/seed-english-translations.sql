-- Seed English Translations
-- Run this in Supabase SQL Editor to populate translations table
-- This will allow the app to display English text via the translation system

-- Insert English translations
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Common
  ('common.loading', 'en', 'Loading...', 'common', NULL),
  ('common.error', 'en', 'Error', 'common', NULL),
  ('common.success', 'en', 'Success', 'common', NULL),
  ('common.save', 'en', 'Save', 'common', NULL),
  ('common.cancel', 'en', 'Cancel', 'common', NULL),
  ('common.delete', 'en', 'Delete', 'common', NULL),
  ('common.edit', 'en', 'Edit', 'common', NULL),
  ('common.close', 'en', 'Close', 'common', NULL),
  ('common.confirm', 'en', 'Confirm', 'common', NULL),
  ('common.back', 'en', 'Back', 'common', NULL),
  ('common.next', 'en', 'Next', 'common', NULL),
  ('common.submit', 'en', 'Submit', 'common', NULL),

  -- Header / Navigation
  ('header.appName', 'en', 'Little Bo Peep', 'navigation', 'Application title - do not translate this brand name'),
  ('header.logout', 'en', 'Logout', 'navigation', NULL),
  ('header.switchToFarmer', 'en', 'Switch to Farmer', 'navigation', NULL),
  ('header.switchToWalker', 'en', 'Switch to Walker', 'navigation', NULL),
  ('header.adminAccess', 'en', 'Admin Access', 'navigation', NULL),
  ('header.admin', 'en', 'Admin', 'navigation', NULL),
  ('header.walkerMode', 'en', 'Walker Mode', 'navigation', NULL),
  ('header.farmerMode', 'en', 'Farmer Mode', 'navigation', NULL),

  -- Authentication
  ('auth.signIn', 'en', 'Sign In', 'auth', NULL),
  ('auth.signUp', 'en', 'Sign Up', 'auth', NULL),
  ('auth.email', 'en', 'Email', 'auth', NULL),
  ('auth.password', 'en', 'Password', 'auth', NULL),
  ('auth.confirmPassword', 'en', 'Confirm Password', 'auth', NULL),
  ('auth.name', 'en', 'Name', 'auth', NULL),
  ('auth.role', 'en', 'I am a...', 'auth', NULL),
  ('auth.walker', 'en', 'Walker', 'auth', NULL),
  ('auth.farmer', 'en', 'Farmer', 'auth', NULL),
  ('auth.alreadyHaveAccount', 'en', 'Already have an account?', 'auth', NULL),
  ('auth.dontHaveAccount', 'en', 'Don''t have an account?', 'auth', NULL),
  ('auth.createAccount', 'en', 'Create Account', 'auth', NULL),

  -- Home Page
  ('home.welcomeWalker', 'en', 'I''m a Walker', 'home', NULL),
  ('home.welcomeFarmer', 'en', 'I''m a Farmer', 'home', NULL),
  ('home.tagline', 'en', 'Helping sheep get home', 'home', NULL),
  ('home.description', 'en', 'A simple way for countryside walkers to report lost sheep and help farmers recover their flock.', 'home', NULL),
  ('home.registeredUsers', 'en', '{count} registered users', 'home', '{count} is a number placeholder'),
  ('home.walkerDescription', 'en', 'Spotted some sheep that look lost? Report their location and help a farmer find them.', 'home', NULL),
  ('home.farmerDescription', 'en', 'Set up your farm fields and receive alerts when sheep are spotted nearby.', 'home', NULL),
  ('home.reportSheepCta', 'en', 'Report a sheep →', 'home', NULL),
  ('home.manageFarmCta', 'en', 'Manage my farm →', 'home', NULL),
  ('home.adminPasswordPrompt', 'en', 'Enter admin password:', 'home', NULL),
  ('home.incorrectPassword', 'en', 'Incorrect password', 'home', NULL),
  ('home.howItWorks', 'en', 'How it works', 'home', NULL),
  ('home.step1Title', 'en', 'Spot', 'home', NULL),
  ('home.step1Description', 'en', 'Walker spots sheep that appear lost or out of place', 'home', NULL),
  ('home.step2Title', 'en', 'Report', 'home', NULL),
  ('home.step2Description', 'en', 'Submit location and details through the app', 'home', NULL),
  ('home.step3Title', 'en', 'Reunite', 'home', NULL),
  ('home.step3Description', 'en', 'Farmer receives alert and recovers their sheep', 'home', NULL),
  ('home.stat1', 'en', 'Sheep in UK', 'home', NULL),
  ('home.stat2', 'en', 'Annual losses', 'home', NULL),
  ('home.stat3Value', 'en', 'Free', 'home', NULL),
  ('home.stat3Label', 'en', '30-day trial', 'home', NULL)
ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  namespace = EXCLUDED.namespace,
  context = EXCLUDED.context,
  updated_at = NOW();

-- Verify insertion
SELECT
  language_code,
  COUNT(*) as translation_count,
  COUNT(DISTINCT namespace) as namespace_count
FROM translations
GROUP BY language_code
ORDER BY language_code;
