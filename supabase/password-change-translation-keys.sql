-- Translation keys for password change functionality
-- Namespace: common
-- Feature: Password change modal and settings
-- Date: January 12, 2026

INSERT INTO translations (key, language_code, value, namespace, context)
VALUES
  -- Password change modal
  ('common.changePassword', 'en', 'Change Password', 'common', 'Modal title and menu item'),
  ('common.currentPassword', 'en', 'Current Password', 'common', 'Form field label'),
  ('common.newPassword', 'en', 'New Password', 'common', 'Form field label'),
  ('common.confirmPassword', 'en', 'Confirm New Password', 'common', 'Form field label'),
  ('common.changing', 'en', 'Changing...', 'common', 'Button text while processing'),
  ('common.passwordMinLength', 'en', 'Minimum 8 characters', 'common', 'Password requirement'),
  ('common.enterCurrentPassword', 'en', 'Enter current password', 'common', 'Input placeholder'),
  ('common.enterNewPassword', 'en', 'Minimum 8 characters', 'common', 'Input placeholder'),
  ('common.reenterPassword', 'en', 'Re-enter new password', 'common', 'Input placeholder'),
  
  -- Success/Error messages
  ('common.passwordChanged', 'en', 'Password changed successfully', 'common', 'Success message'),
  ('common.passwordChangedRelogin', 'en', 'Password changed successfully! Please log in again with your new password.', 'common', 'Success message with logout'),
  ('common.passwordTooShort', 'en', 'New password must be at least 8 characters', 'common', 'Validation error'),
  ('common.passwordsNoMatch', 'en', 'New passwords do not match', 'common', 'Validation error'),
  ('common.currentPasswordIncorrect', 'en', 'Current password is incorrect', 'common', 'Error message'),
  ('common.passwordChangeFailed', 'en', 'Failed to change password. Please try again.', 'common', 'Generic error'),
  
  -- Security tips
  ('common.securityTip', 'en', 'Security tip:', 'common', 'Security notice label'),
  ('common.strongPasswordTip', 'en', 'Use a strong password with a mix of letters, numbers, and symbols.', 'common', 'Password security advice'),
  
  -- Header menu items
  ('header.changePassword', 'en', 'Change Password', 'header', 'Dropdown menu item')

ON CONFLICT (key, language_code)
DO UPDATE SET
  value = EXCLUDED.value,
  context = EXCLUDED.context,
  updated_at = CURRENT_TIMESTAMP;
