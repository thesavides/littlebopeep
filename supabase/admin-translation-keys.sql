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
  ('admin.footerText', 'en', 'Little Bo Peep Admin Panel • Version 3.0.0', 'admin', 'Footer text')

ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
