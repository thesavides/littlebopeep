-- Walker Dashboard Translation Keys
-- English translations for all walker-specific UI text

INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Dashboard titles and navigation
  ('walker.reportSheepStep', 'en', 'Report Sheep (Step {{step}}/{{total}})', 'walker', 'Report progress title'),
  ('walker.myReports', 'en', 'My Reports', 'walker', 'Page title'),

  -- Status badges
  ('walker.statusReported', 'en', 'Reported', 'walker', 'Report status'),
  ('walker.statusClaimed', 'en', 'Claimed', 'walker', 'Report status'),
  ('walker.statusResolved', 'en', 'Resolved', 'walker', 'Report status'),

  -- Notifications
  ('walker.thankYou', 'en', 'Thank You!', 'walker', 'Notification heading'),

  -- Duplicate warning modal
  ('walker.existingReportNearby', 'en', 'Existing Report Nearby', 'walker', 'Modal heading'),
  ('walker.duplicateWarning', 'en', 'A report for a missing sheep was reported in this vicinity within the past 12 hours. Do you still want to proceed?', 'walker', 'Warning message'),
  ('walker.yesSubmitReport', 'en', 'Yes, Submit New Report', 'walker', 'Confirmation button'),

  -- Dashboard view
  ('walker.reportsNearYou', 'en', 'Reports Near You', 'walker', 'Alert heading'),
  ('walker.nearbyReportsWarning', 'en', '{{count}} sheep report(s) within 100m in the last 12 hours. Check if these match what you''ve seen before submitting a new report.', 'walker', 'Alert message'),
  ('walker.yourLocation', 'en', 'Your location', 'walker', 'Map legend'),
  ('walker.reportedSheep12h', 'en', 'Reported sheep (last 12h)', 'walker', 'Map legend'),
  ('walker.reportASheep', 'en', 'Report a Sheep', 'walker', 'Button text'),
  ('walker.myReportsWithCount', 'en', 'My Reports ({{count}})', 'walker', 'Button text with count'),

  -- Tips section
  ('walker.tipsForReporting', 'en', 'Tips for reporting', 'walker', 'Section heading'),
  ('walker.tip1', 'en', 'Check the map for recent reports before submitting', 'walker', 'Tip text'),
  ('walker.tip2', 'en', 'Be as accurate as possible with the location', 'walker', 'Tip text'),
  ('walker.tip3', 'en', 'Note any markings or ear tags if visible', 'walker', 'Tip text'),
  ('walker.tip4', 'en', 'Report injured sheep as priority', 'walker', 'Tip text'),
  ('walker.tip5', 'en', 'Don''t approach aggressive animals', 'walker', 'Tip text'),

  -- Reporting Step 1: Location
  ('walker.whereSpotSheep', 'en', 'Where did you spot the sheep?', 'walker', 'Step 1 heading'),
  ('walker.tapMapInstruction', 'en', 'Tap on the map to mark the location. Recent reports (last 12 hours) are shown as 🐑 markers.', 'walker', 'Step 1 instruction'),
  ('walker.locationSelected', 'en', 'Location selected', 'walker', 'Confirmation message'),
  ('walker.nearbyReportsExist', 'en', '{{count}} report(s) already exist within 100m of this location in the last 12 hours.', 'walker', 'Warning message'),

  -- Reporting Step 2: Details
  ('walker.tellAboutSheep', 'en', 'Tell us about the sheep', 'walker', 'Step 2 heading'),
  ('walker.howManySheep', 'en', 'How many sheep?', 'walker', 'Form label'),
  ('walker.condition', 'en', 'Condition', 'walker', 'Form label'),
  ('walker.conditionHealthy', 'en', 'Healthy - looks fine', 'walker', 'Select option'),
  ('walker.conditionInjured', 'en', 'Injured - needs attention', 'walker', 'Select option'),
  ('walker.conditionUnknown', 'en', 'Not sure', 'walker', 'Select option'),
  ('walker.additionalDetails', 'en', 'Additional details (optional)', 'walker', 'Form label'),
  ('walker.detailsPlaceholder', 'en', 'e.g., Near the old stone wall, white sheep with black face, ear tag visible...', 'walker', 'Input placeholder'),

  -- Reporting Step 3: Contact
  ('walker.wantNotified', 'en', 'Want to be notified? 🔔', 'walker', 'Step 3 heading'),
  ('walker.contactInstructionLoggedIn', 'en', 'The farmer may want to reach out for more details about the location.', 'walker', 'Instruction for logged in users'),
  ('walker.contactInstructionGuest', 'en', 'Leave your contact details to be notified when the sheep is successfully returned to the farmer!', 'walker', 'Instruction for guests'),
  ('walker.name', 'en', 'Name', 'walker', 'Form label'),
  ('walker.nameOptional', 'en', 'Name (optional)', 'walker', 'Form label'),
  ('walker.email', 'en', 'Email (for thank you notification)', 'walker', 'Form label'),
  ('walker.phone', 'en', 'Phone (optional)', 'walker', 'Form label'),
  ('walker.namePlaceholder', 'en', 'Your name', 'walker', 'Input placeholder'),
  ('walker.emailPlaceholder', 'en', 'your@email.com', 'walker', 'Input placeholder'),
  ('walker.phonePlaceholder', 'en', '+44 7700 900000', 'walker', 'Input placeholder'),
  ('walker.thankYouMessage', 'en', 'We''ll send you a thank you message when the farmer claims your report and recovers the sheep!', 'walker', 'Info message'),
  ('walker.privacyNote', 'en', 'Your contact info will only be used for notifications and may be shared with farmers in the area. Leave blank to report anonymously.', 'walker', 'Privacy disclaimer'),

  -- Reporting Step 4: Confirm
  ('walker.confirmReport', 'en', 'Confirm your report', 'walker', 'Step 4 heading'),
  ('walker.location', 'en', 'Location', 'walker', 'Summary label'),
  ('walker.sheepCount', 'en', 'Sheep count', 'walker', 'Summary label'),
  ('walker.details', 'en', 'Details', 'walker', 'Summary label'),
  ('walker.contact', 'en', 'Contact', 'walker', 'Summary label'),

  -- Navigation buttons
  ('walker.submitReport', 'en', '✓ Submit Report', 'walker', 'Button text'),
  ('walker.continue', 'en', 'Continue →', 'walker', 'Button text'),
  ('walker.back', 'en', '← Back', 'walker', 'Button text'),
  ('walker.cancel', 'en', 'Cancel', 'walker', 'Button text'),

  -- My Reports view
  ('walker.noReportsYet', 'en', 'No reports yet', 'walker', 'Empty state heading'),
  ('walker.noReportsMessage', 'en', 'Spot some sheep and submit a report to help farmers!', 'walker', 'Empty state message'),
  ('walker.sheepSpotted', 'en', '{{count}} sheep spotted', 'walker', 'Report card title')

ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
