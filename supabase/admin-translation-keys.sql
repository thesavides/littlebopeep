-- Admin Dashboard Translation Keys
-- English translations for all admin-specific UI text

INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Page title
  ('admin.dashboardTitle', 'en', 'Admin Dashboard', 'admin', 'Page title'),

  -- Delete Confirmation Modal
  ('admin.confirmDelete', 'en', 'Confirm Delete', 'admin', 'Modal heading'),
  ('admin.deleteWarning', 'en', 'Are you sure you want to delete this {{type}}? This cannot be undone.', 'admin', 'Deletion warning message'),
  ('admin.yesDelete', 'en', 'Yes, Delete', 'admin', 'Confirmation button'),
  ('admin.cancel', 'en', 'Cancel', 'admin', 'Cancel button'),

  -- Batch delete confirmation
  ('admin.batchDeleteConfirm', 'en', 'Delete {{count}} reports? This cannot be undone.', 'admin', 'Batch deletion confirmation'),

  -- Navigation tabs
  ('admin.overview', 'en', 'Overview', 'admin', 'Navigation tab'),
  ('admin.walkers', 'en', 'Walkers', 'admin', 'Navigation tab'),
  ('admin.farmers', 'en', 'Farmers', 'admin', 'Navigation tab'),
  ('admin.reports', 'en', 'Reports', 'admin', 'Navigation tab'),
  ('admin.farms', 'en', 'Farms', 'admin', 'Navigation tab'),
  ('admin.billing', 'en', 'Billing', 'admin', 'Navigation tab'),

  -- Overview: User Statistics
  ('admin.totalUsers', 'en', 'Total Users', 'admin', 'Stats label'),
  ('admin.active', 'en', 'active', 'admin', 'Status text'),
  ('admin.walkersLabel', 'en', 'Walkers', 'admin', 'Stats label'),
  ('admin.farmersLabel', 'en', 'Farmers', 'admin', 'Stats label'),
  ('admin.farmsLabel', 'en', 'Farms', 'admin', 'Stats label'),
  ('admin.fieldsLabel', 'en', 'fields', 'admin', 'Field count label'),
  ('admin.farmsWithFields', 'en', 'Farms ({{fields}} fields)', 'admin', 'Stats with field count'),

  -- Overview: Report Statistics
  ('admin.reported', 'en', 'Reported', 'admin', 'Report status label'),
  ('admin.claimed', 'en', 'Claimed', 'admin', 'Report status label'),
  ('admin.resolved', 'en', 'Resolved', 'admin', 'Report status label'),
  ('admin.archived', 'en', 'Archived', 'admin', 'Report status label'),
  ('admin.paidSubs', 'en', 'Paid Subs', 'admin', 'Subscription stats label'),

  -- Overview: Activity Map
  ('admin.activityMap', 'en', 'Activity Map', 'admin', 'Section heading'),
  ('admin.sheepPopup', 'en', '{{count}} sheep - {{status}}', 'admin', 'Map marker popup'),

  -- Walkers View
  ('admin.walkersTitle', 'en', 'Walkers ({{count}})', 'admin', 'Section heading with count'),
  ('admin.noWalkersYet', 'en', 'No walkers registered yet', 'admin', 'Empty state message'),
  ('admin.noEmail', 'en', 'No email', 'admin', 'Missing email placeholder'),
  ('admin.reportsCount', 'en', '{{count}} reports', 'admin', 'Report count for user'),
  ('admin.suspend', 'en', 'Suspend', 'admin', 'Button text'),
  ('admin.activate', 'en', 'Activate', 'admin', 'Button text'),
  ('admin.delete', 'en', 'Delete', 'admin', 'Button text'),

  -- Farmers View
  ('admin.farmersTitle', 'en', 'Farmers ({{count}})', 'admin', 'Section heading with count'),
  ('admin.noFarmersYet', 'en', 'No farmers registered yet', 'admin', 'Empty state message'),
  ('admin.farmsCount', 'en', '{{count}} farm(s)', 'admin', 'Farm count for user'),

  -- Reports View: Filters
  ('admin.allStatus', 'en', 'All Status', 'admin', 'Filter option'),
  ('admin.reportedFilter', 'en', 'Reported', 'admin', 'Filter option'),
  ('admin.claimedFilter', 'en', 'Claimed', 'admin', 'Filter option'),
  ('admin.resolvedFilter', 'en', 'Resolved', 'admin', 'Filter option'),
  ('admin.activeFilter', 'en', 'Active', 'admin', 'Archive filter option'),
  ('admin.archivedFilter', 'en', 'Archived', 'admin', 'Archive filter option'),
  ('admin.allFilter', 'en', 'All', 'admin', 'Archive filter option'),
  ('admin.sortDaysUnclaimed', 'en', 'Sort: Days Unclaimed', 'admin', 'Sort option'),
  ('admin.sortDate', 'en', 'Sort: Date', 'admin', 'Sort option'),

  -- Reports View: Batch Actions
  ('admin.archiveSelected', 'en', 'Archive ({{count}})', 'admin', 'Batch action button'),
  ('admin.deleteSelected', 'en', 'Delete ({{count}})', 'admin', 'Batch action button'),

  -- Reports View: Map Search
  ('admin.mapSearch', 'en', 'Map Search', 'admin', 'Section heading'),
  ('admin.clearFilter', 'en', 'Clear filter', 'admin', 'Button text'),
  ('admin.showingReports', 'en', 'Showing {{count}} reports', 'admin', 'Report count message'),
  ('admin.showingReportsInArea', 'en', 'Showing {{count}} reports in selected area', 'admin', 'Report count with filter'),

  -- Reports View: Reports List
  ('admin.reportsTitle', 'en', 'Reports ({{count}})', 'admin', 'Section heading with count'),
  ('admin.selectAll', 'en', 'Select All', 'admin', 'Checkbox label'),
  ('admin.noReportsMatch', 'en', 'No reports match filters', 'admin', 'Empty state message'),
  ('admin.sheepWithCondition', 'en', '{{count}} sheep • {{condition}}', 'admin', 'Report summary'),
  ('admin.daysUnclaimed', 'en', '{{days}}d unclaimed', 'admin', 'Days unclaimed badge'),
  ('admin.archive', 'en', 'Archive', 'admin', 'Button text'),
  ('admin.archivedBadge', 'en', 'Archived', 'admin', 'Status badge'),

  -- Farms View
  ('admin.allFarms', 'en', 'All Farms ({{count}})', 'admin', 'Section heading with count'),
  ('admin.noFarmsYet', 'en', 'No farms registered yet', 'admin', 'Empty state message'),
  ('admin.farmSummary', 'en', '{{fields}} fields • Buffer: {{buffer}}m', 'admin', 'Farm summary text'),
  ('admin.ownerLabel', 'en', 'Owner: {{name}}', 'admin', 'Owner info'),
  ('admin.ownerUnknown', 'en', 'Owner: Unknown', 'admin', 'Unknown owner placeholder'),
  ('admin.alertsOn', 'en', 'Alerts On', 'admin', 'Status badge'),
  ('admin.alertsOff', 'en', 'Alerts Off', 'admin', 'Status badge'),

  -- Billing View: Subscription Stats
  ('admin.onTrial', 'en', 'On Trial', 'admin', 'Subscription stats label'),
  ('admin.activeSubscriptions', 'en', 'Active Subscriptions', 'admin', 'Subscription stats label'),
  ('admin.cancelled', 'en', 'Cancelled', 'admin', 'Subscription stats label'),

  -- Billing View: Revenue
  ('admin.revenueEstimate', 'en', 'Revenue Estimate', 'admin', 'Section heading'),
  ('admin.perMonth', 'en', '/month', 'admin', 'Revenue period'),

  -- Billing View: Farmer Subscriptions
  ('admin.farmerSubscriptions', 'en', 'Farmer Subscriptions', 'admin', 'Section heading'),
  ('admin.trialEnds', 'en', 'Trial ends: {{date}}', 'admin', 'Trial end date'),
  ('admin.activateButton', 'en', 'Activate', 'admin', 'Button text'),
  ('admin.cancelButton', 'en', 'Cancel', 'admin', 'Button text'),

  -- Subscription Status Badges
  ('admin.noSub', 'en', 'No sub', 'admin', 'No subscription badge'),
  ('admin.trial', 'en', 'trial', 'admin', 'Trial badge text'),
  ('admin.activeSub', 'en', 'active', 'admin', 'Active subscription badge text'),
  ('admin.cancelledSub', 'en', 'cancelled', 'admin', 'Cancelled subscription badge text'),
  ('admin.expired', 'en', 'expired', 'admin', 'Expired subscription badge text'),

  -- User Status
  ('admin.activeStatus', 'en', 'active', 'admin', 'User active status'),
  ('admin.suspendedStatus', 'en', 'suspended', 'admin', 'User suspended status'),

  -- Report Status
  ('admin.reportedStatus', 'en', 'reported', 'admin', 'Report status'),
  ('admin.claimedStatus', 'en', 'claimed', 'admin', 'Report status'),
  ('admin.resolvedStatus', 'en', 'resolved', 'admin', 'Report status'),

  -- Delete Types
  ('admin.deleteTypeUser', 'en', 'user', 'admin', 'Delete type'),
  ('admin.deleteTypeReport', 'en', 'report', 'admin', 'Delete type'),
  ('admin.deleteTypeFarm', 'en', 'farm', 'admin', 'Delete type'),

  -- Footer
  ('admin.footerText', 'en', 'Little Bo Peep Admin Panel • Version 3.0.0', 'admin', 'Footer text'),

  -- Admin Login Page
  ('admin.loginTitle', 'en', 'Admin Access', 'admin', 'Title on admin login page'),
  ('admin.loginSubtitle', 'en', 'Little Bo Peep Administration', 'admin', 'Subtitle on admin login page'),
  ('admin.username', 'en', 'Username', 'admin', 'Username field label'),
  ('admin.password', 'en', 'Password', 'admin', 'Password field label'),
  ('admin.signIn', 'en', 'Sign In', 'admin', 'Login button text'),
  ('admin.authenticating', 'en', 'Authenticating...', 'admin', 'Login button text while loading'),
  ('admin.defaultCredentials', 'en', 'Default Credentials (Demo):', 'admin', 'Header for demo credentials'),
  ('admin.changePassword', 'en', 'Change password after first login', 'admin', 'Warning to change default password'),
  ('admin.securityNotice', 'en', 'All admin actions are logged and monitored', 'admin', 'Security notice at bottom of login'),
  ('admin.backToHome', 'en', 'Back to Home', 'admin', 'Link to return to homepage'),
  ('admin.invalidCredentials', 'en', 'Invalid credentials', 'admin', 'Error when login fails'),
  ('admin.authFailed', 'en', 'Authentication failed. Please try again.', 'admin', 'Generic auth error'),

  -- Admin User Management
  ('admin.userManagement', 'en', 'Admin User Management', 'admin', 'Admin users page title'),
  ('admin.manageAccounts', 'en', 'Manage admin accounts and permissions', 'admin', 'Admin users page description'),
  ('admin.createAdmin', 'en', 'Create Admin', 'admin', 'Button to create new admin'),
  ('admin.loggedInAs', 'en', 'Logged in as:', 'admin', 'Label showing current admin'),
  ('admin.superAdmin', 'en', 'Super Admin', 'admin', 'Badge for super admin role'),
  ('admin.adminRole', 'en', 'Admin', 'admin', 'Badge for regular admin role'),
  ('admin.inactive', 'en', 'Inactive', 'admin', 'Status badge for inactive admin'),
  ('admin.fullName', 'en', 'Full Name', 'admin', 'Table column and form field'),
  ('admin.email', 'en', 'Email', 'admin', 'Table column and form field'),
  ('admin.type', 'en', 'Type', 'admin', 'Table column for admin type'),
  ('admin.status', 'en', 'Status', 'admin', 'Table column for status'),
  ('admin.lastLogin', 'en', 'Last Login', 'admin', 'Table column for last login time'),
  ('admin.actions', 'en', 'Actions', 'admin', 'Table column for action buttons'),
  ('admin.deactivate', 'en', 'Deactivate', 'admin', 'Button to deactivate admin'),
  ('admin.createNewAdmin', 'en', 'Create New Admin', 'admin', 'Modal title'),
  ('admin.grantSuperAdmin', 'en', 'Grant Super Admin privileges (can create other admins)', 'admin', 'Checkbox label for super admin'),
  ('admin.minimumChars', 'en', 'Minimum 8 characters', 'admin', 'Password requirement text'),
  ('admin.required', 'en', 'required', 'admin', 'Field requirement indicator'),
  ('admin.adminCreated', 'en', 'Admin user "{{username}}" created successfully', 'admin', 'Success message after creating admin'),
  ('admin.adminDeactivated', 'en', 'Admin "{{username}}" deactivated', 'admin', 'Success message after deactivating'),
  ('admin.loadFailed', 'en', 'Failed to load admin users', 'admin', 'Error loading admin list'),
  ('admin.mustBeLoggedIn', 'en', 'You must be logged in as an admin', 'admin', 'Error when not authenticated'),
  ('admin.mustBeSuperAdmin', 'en', 'Only super admins can create new admin users', 'admin', 'Error when not super admin'),
  ('admin.createFailed', 'en', 'Failed to create admin user', 'admin', 'Generic create error'),
  ('admin.deactivateFailed', 'en', 'Failed to deactivate admin', 'admin', 'Generic deactivate error'),
  ('admin.deactivateConfirm', 'en', 'Are you sure you want to deactivate admin "{{username}}"?', 'admin', 'Confirmation dialog'),
  ('admin.noAdminsFound', 'en', 'No admin users found', 'admin', 'Empty state message'),
  ('admin.loadingAdmins', 'en', 'Loading admin users...', 'admin', 'Loading state message'),
  ('admin.mustBeLoggedInView', 'en', 'You must be logged in as an admin to view this page', 'admin', 'Access denied message'),
  ('admin.never', 'en', 'Never', 'admin', 'Text for never logged in'),
  ('admin.adminUsers', 'en', 'Admin Users', 'admin', 'Navigation tab for admin users page')

ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
