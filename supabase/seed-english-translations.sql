-- Seed English Translations
-- Run this in Supabase SQL Editor after running 001_translations_schema.sql
-- This inserts all base English translations

-- Insert English translations
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- COMMON
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

  -- HEADER / NAVIGATION
  ('header.appName', 'en', 'Little Bo Peep', 'navigation', 'Application title - do not translate this brand name'),
  ('header.logout', 'en', 'Logout', 'navigation', NULL),
  ('header.switchToFarmer', 'en', 'Switch to Farmer', 'navigation', NULL),
  ('header.switchToWalker', 'en', 'Switch to Walker', 'navigation', NULL),
  ('header.adminAccess', 'en', 'Admin Access', 'navigation', NULL),

  -- AUTHENTICATION
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

  -- HOME PAGE
  ('home.welcomeWalker', 'en', 'I''m a Walker', 'home', NULL),
  ('home.welcomeFarmer', 'en', 'I''m a Farmer', 'home', NULL),
  ('home.tagline', 'en', 'Connecting countryside walkers with farmers to reunite lost sheep', 'home', NULL),

  -- WALKER DASHBOARD
  ('walker.reportSheep', 'en', 'Report Sheep', 'walker', NULL),
  ('walker.myReports', 'en', 'My Reports', 'walker', NULL),
  ('walker.recentAlerts', 'en', 'Recent Alerts', 'walker', NULL),
  ('walker.step1Title', 'en', 'Where did you see the sheep?', 'walker', NULL),
  ('walker.step2Title', 'en', 'How many sheep?', 'walker', NULL),
  ('walker.step3Title', 'en', 'Condition & Details', 'walker', NULL),
  ('walker.step4Title', 'en', 'Contact Information', 'walker', NULL),
  ('walker.clickMap', 'en', 'Click on the map to mark the location', 'walker', NULL),
  ('walker.useMyLocation', 'en', 'Use my current location', 'walker', NULL),
  ('walker.sheepCount', 'en', 'Number of sheep', 'walker', NULL),
  ('walker.condition', 'en', 'Condition', 'walker', NULL),
  ('walker.conditionHealthy', 'en', 'Healthy', 'walker', NULL),
  ('walker.conditionInjured', 'en', 'Injured', 'walker', NULL),
  ('walker.conditionUnknown', 'en', 'Unknown', 'walker', NULL),
  ('walker.description', 'en', 'Description (optional)', 'walker', NULL),
  ('walker.contactEmail', 'en', 'Contact Email', 'walker', NULL),
  ('walker.contactPhone', 'en', 'Contact Phone (optional)', 'walker', NULL),
  ('walker.reportSubmitted', 'en', 'Report Submitted Successfully', 'walker', NULL),
  ('walker.thankYou', 'en', 'Thank you for helping reunite lost sheep!', 'walker', NULL),

  -- FARMER DASHBOARD
  ('farmer.dashboard', 'en', 'Dashboard', 'farmer', NULL),
  ('farmer.myFarms', 'en', 'My Farms', 'farmer', NULL),
  ('farmer.addFarm', 'en', 'Add Farm', 'farmer', NULL),
  ('farmer.addField', 'en', 'Add Field', 'farmer', NULL),
  ('farmer.farmName', 'en', 'Farm Name', 'farmer', NULL),
  ('farmer.fieldName', 'en', 'Field Name', 'farmer', NULL),
  ('farmer.alertBuffer', 'en', 'Alert Buffer (meters)', 'farmer', NULL),
  ('farmer.reports', 'en', 'Reports', 'farmer', NULL),
  ('farmer.claimReport', 'en', 'Claim Report', 'farmer', NULL),
  ('farmer.resolveReport', 'en', 'Mark as Resolved', 'farmer', NULL),
  ('farmer.reportClaimed', 'en', 'Report Claimed', 'farmer', NULL),
  ('farmer.reportResolved', 'en', 'Report Resolved', 'farmer', NULL),
  ('farmer.sheepReunited', 'en', 'Sheep Reunited!', 'farmer', NULL),

  -- MAP
  ('map.layers', 'en', 'Layers', 'map', NULL),
  ('map.footpaths', 'en', 'Footpaths', 'map', NULL),
  ('map.bridleways', 'en', 'Bridleways', 'map', NULL),
  ('map.trails', 'en', 'Trails', 'map', NULL),
  ('map.contours', 'en', 'Contours', 'map', NULL),
  ('map.viewDisclaimer', 'en', 'View disclaimer', 'map', NULL),
  ('map.disclaimerTitle', 'en', 'Rights of Way Disclaimer', 'map', NULL),
  ('map.disclaimerText1', 'en', 'Rights of way data is provided for reference only.', 'map', NULL),
  ('map.disclaimerText2', 'en', 'Always verify access rights with local authorities. Data may be incomplete or inaccurate.', 'map', NULL),
  ('map.disclaimerText3', 'en', 'Users are responsible for ensuring lawful access to all areas.', 'map', NULL),
  ('map.iUnderstand', 'en', 'I Understand', 'map', NULL),
  ('map.loadingLayers', 'en', 'Loading layers...', 'map', NULL),

  -- ADMIN
  ('admin.dashboard', 'en', 'Admin Dashboard', 'admin', NULL),
  ('admin.users', 'en', 'Users', 'admin', NULL),
  ('admin.allReports', 'en', 'All Reports', 'admin', NULL),
  ('admin.statistics', 'en', 'Statistics', 'admin', NULL),
  ('admin.archiveReport', 'en', 'Archive Report', 'admin', NULL),

  -- REPORT STATUS
  ('status.reported', 'en', 'Reported', 'reports', NULL),
  ('status.claimed', 'en', 'Claimed', 'reports', NULL),
  ('status.resolved', 'en', 'Resolved', 'reports', NULL),
  ('reports.sheepCount', 'en', '{count} sheep', 'reports', '{count} is a number placeholder'),
  ('reports.timestamp', 'en', 'Reported {time}', 'reports', '{time} is a relative time like "2 hours ago"'),

  -- ERRORS
  ('error.generic', 'en', 'Something went wrong. Please try again.', 'errors', NULL),
  ('error.network', 'en', 'Network error. Please check your connection.', 'errors', NULL),
  ('error.unauthorized', 'en', 'You are not authorized to perform this action.', 'errors', NULL),
  ('error.notFound', 'en', 'The requested resource was not found.', 'errors', NULL)

ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  namespace = EXCLUDED.namespace,
  context = EXCLUDED.context,
  updated_at = NOW();

-- Verify the insert
SELECT
  language_code,
  COUNT(*) as translation_count,
  COUNT(DISTINCT namespace) as namespace_count
FROM translations
GROUP BY language_code;

-- Show sample translations
SELECT key, value, namespace
FROM translations
WHERE language_code = 'en'
ORDER BY namespace, key
LIMIT 20;
