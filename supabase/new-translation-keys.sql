-- New translation keys for Auth, Walker, Farmer, and Admin pages
-- Run this in Supabase SQL Editor after the Context fix is deployed

-- AUTH PAGE KEYS (already added with fallbacks in code)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  ('auth.signIn', 'en', 'Sign In', 'auth', 'Login button'),
  ('auth.signUp', 'en', 'Sign Up', 'auth', 'Register button'),
  ('auth.iAmA', 'en', 'I am a:', 'auth', 'Role selection label'),
  ('auth.email', 'en', 'Email', 'auth', 'Email field label'),
  ('auth.password', 'en', 'Password', 'auth', 'Password field label'),
  ('auth.emailPlaceholder', 'en', 'you@example.com', 'auth', 'Email input placeholder'),
  ('auth.authenticationFailed', 'en', 'Authentication failed', 'auth', 'Error message'),
  ('common.pleaseWait', 'en', 'Please wait...', 'common', 'Loading state'),
  ('common.backToHome', 'en', 'Back to Home', 'common', 'Navigation link')
ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Note: Walker, Farmer, and Admin dashboard translations will be added in next phase
-- For now, they will use English fallback text from the t() function calls
