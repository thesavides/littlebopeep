-- Farmer Dashboard Translation Keys
-- English translations for all farmer-specific UI text

INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Dashboard titles and navigation
  ('farmer.registrationStep', 'en', 'Registration (Step {{step}}/{{total}})', 'farmer', 'Registration progress title'),
  ('farmer.createFarm', 'en', 'Create Farm', 'farmer', 'Page title'),
  ('farmer.addField', 'en', 'Add Field', 'farmer', 'Page title'),
  ('farmer.subscription', 'en', 'Subscription', 'farmer', 'Page title'),
  ('farmer.farm', 'en', 'Farm', 'farmer', 'Default farm title'),

  -- Registration Step 1: Contact Details
  ('farmer.contactDetails', 'en', 'Contact Details', 'farmer', 'Step 1 heading'),
  ('farmer.farmNameLabel', 'en', 'Farm Name *', 'farmer', 'Form label'),
  ('farmer.farmNamePlaceholder', 'en', 'e.g., Green Valley Farm', 'farmer', 'Input placeholder'),
  ('farmer.yourNameLabel', 'en', 'Your Name *', 'farmer', 'Form label'),
  ('farmer.emailLabel', 'en', 'Email *', 'farmer', 'Form label'),
  ('farmer.phoneLabel', 'en', 'Phone', 'farmer', 'Form label'),
  ('farmer.continue', 'en', 'Continue', 'farmer', 'Button text'),

  -- Registration Step 2: Physical Location
  ('farmer.farmLocation', 'en', 'Farm Location', 'farmer', 'Step 2 heading'),
  ('farmer.farmLocationInstruction', 'en', 'Tap the map to mark your farm''s physical location.', 'farmer', 'Step 2 instruction'),
  ('farmer.locationSet', 'en', '📍 Location set', 'farmer', 'Confirmation message'),
  ('farmer.back', 'en', 'Back', 'farmer', 'Button text'),

  -- Registration Step 3: Billing Address
  ('farmer.billingAddress', 'en', 'Billing Address', 'farmer', 'Step 3 heading'),
  ('farmer.addressLine1Label', 'en', 'Address Line 1 *', 'farmer', 'Form label'),
  ('farmer.addressLine2Label', 'en', 'Address Line 2', 'farmer', 'Form label'),
  ('farmer.cityLabel', 'en', 'City *', 'farmer', 'Form label'),
  ('farmer.countyLabel', 'en', 'County', 'farmer', 'Form label'),
  ('farmer.postcodeLabel', 'en', 'Postcode *', 'farmer', 'Form label'),

  -- Registration Step 4: Payment Details
  ('farmer.paymentSetup', 'en', 'Payment Setup', 'farmer', 'Step 4 heading'),
  ('farmer.paymentInstruction', 'en', 'Your card will not be charged until after your 30-day free trial ends.', 'farmer', 'Payment instruction'),
  ('farmer.securePayment', 'en', '🔒 Secure payment powered by Stripe', 'farmer', 'Security badge'),
  ('farmer.cardholderNameLabel', 'en', 'Cardholder Name *', 'farmer', 'Form label'),
  ('farmer.cardholderNamePlaceholder', 'en', 'Name on card', 'farmer', 'Input placeholder'),
  ('farmer.cardNumberLabel', 'en', 'Card Number *', 'farmer', 'Form label'),
  ('farmer.cardNumberPlaceholder', 'en', '1234 5678 9012 3456', 'farmer', 'Input placeholder'),
  ('farmer.expiryLabel', 'en', 'Expiry *', 'farmer', 'Form label'),
  ('farmer.expiryPlaceholder', 'en', 'MM/YY', 'farmer', 'Input placeholder'),
  ('farmer.cvcLabel', 'en', 'CVC *', 'farmer', 'Form label'),
  ('farmer.cvcPlaceholder', 'en', '123', 'farmer', 'Input placeholder'),
  ('farmer.subscriptionDetailsHeading', 'en', 'Subscription Details:', 'farmer', 'Section heading'),
  ('farmer.trialStarting', 'en', '• 30-day free trial starting today', 'farmer', 'Subscription detail'),
  ('farmer.priceAfterTrial', 'en', '• £29.99/month after trial', 'farmer', 'Subscription detail'),
  ('farmer.cancelAnytime', 'en', '• Cancel anytime before trial ends', 'farmer', 'Subscription detail'),

  -- Registration Step 5: Review & Confirm
  ('farmer.reviewConfirm', 'en', 'Review & Confirm', 'farmer', 'Step 5 heading'),
  ('farmer.farmDetails', 'en', 'Farm Details', 'farmer', 'Section heading'),
  ('farmer.farmLabel', 'en', 'Farm:', 'farmer', 'Summary label'),
  ('farmer.contactLabel', 'en', 'Contact:', 'farmer', 'Summary label'),
  ('farmer.emailDisplayLabel', 'en', 'Email:', 'farmer', 'Summary label'),
  ('farmer.phoneDisplayLabel', 'en', 'Phone:', 'farmer', 'Summary label'),
  ('farmer.billingAddressHeading', 'en', 'Billing Address', 'farmer', 'Section heading'),
  ('farmer.paymentMethod', 'en', 'Payment Method', 'farmer', 'Section heading'),
  ('farmer.cardEnding', 'en', '💳 Card ending in {{last4}}', 'farmer', 'Payment summary'),
  ('farmer.expires', 'en', 'Expires {{expiry}}', 'farmer', 'Payment summary'),
  ('farmer.freeTrialHeading', 'en', '🎉 30-Day Free Trial', 'farmer', 'Trial banner heading'),
  ('farmer.trialStartsToday', 'en', '• Your trial starts today', 'farmer', 'Trial detail'),
  ('farmer.firstCharge', 'en', '• First charge: <strong>£29.99</strong> on <strong>{{date}}</strong>', 'farmer', 'Trial detail'),
  ('farmer.cancelFromDashboard', 'en', '• Cancel anytime from your dashboard', 'farmer', 'Trial detail'),
  ('farmer.startFreeTrial', 'en', 'Start Free Trial', 'farmer', 'Button text'),
  ('farmer.termsAgreement', 'en', 'By clicking "Start Free Trial", you agree to our Terms of Service and authorize us to charge your card £29.99/month after the trial period unless you cancel.', 'farmer', 'Terms agreement'),

  -- Dashboard: Subscription Banner
  ('farmer.freeTrialActive', 'en', 'Free Trial Active', 'farmer', 'Banner heading'),
  ('farmer.ends', 'en', 'Ends {{date}}', 'farmer', 'Trial end date'),
  ('farmer.manage', 'en', 'Manage', 'farmer', 'Button text'),

  -- Dashboard: No farms prompt
  ('farmer.addYourFarmFields', 'en', 'Add Your Farm Fields', 'farmer', 'Empty state heading'),
  ('farmer.drawFieldsInstruction', 'en', 'Draw your field boundaries to start receiving alerts.', 'farmer', 'Empty state instruction'),
  ('farmer.addFarm', 'en', 'Add Farm', 'farmer', 'Button text'),

  -- Dashboard: My Farms List
  ('farmer.myFarms', 'en', 'My Farms', 'farmer', 'Section heading'),
  ('farmer.addFarmButton', 'en', '+ Add Farm', 'farmer', 'Button text'),
  ('farmer.fieldCount', 'en', '{{count}} field(s) • Alert buffer: {{buffer}}m', 'farmer', 'Farm summary'),
  ('farmer.alertsOn', 'en', 'Alerts On', 'farmer', 'Status badge'),
  ('farmer.alertsOff', 'en', 'Off', 'farmer', 'Status badge'),

  -- Dashboard: Alerts Section
  ('farmer.reportedSheep', 'en', 'Reported Sheep ({{count}})', 'farmer', 'Section heading'),
  ('farmer.noNewReports', 'en', 'No new reports. All clear! 🎉', 'farmer', 'Empty state message'),
  ('farmer.sheepSpotted', 'en', '🐑 {{count}} sheep spotted', 'farmer', 'Alert title'),
  ('farmer.claim', 'en', 'Claim', 'farmer', 'Button text'),
  ('farmer.resolved', 'en', 'Resolved', 'farmer', 'Button text'),

  -- Dashboard: Claimed Alerts
  ('farmer.myClaimed', 'en', 'My Claimed ({{count}})', 'farmer', 'Section heading'),
  ('farmer.sheepCount', 'en', '🐑 {{count}} sheep', 'farmer', 'Alert title'),
  ('farmer.markResolved', 'en', 'Mark Resolved', 'farmer', 'Button text'),

  -- Create Farm View
  ('farmer.farmNameRequired', 'en', 'Farm Name *', 'farmer', 'Form label'),
  ('farmer.farmNameExample', 'en', 'e.g., North Field', 'farmer', 'Input placeholder'),
  ('farmer.alertBufferLabel', 'en', 'Alert Buffer Zone: {{buffer}}m', 'farmer', 'Form label'),
  ('farmer.alertBufferInstruction', 'en', 'You''ll be alerted when sheep are spotted within this distance OUTSIDE your field boundaries.', 'farmer', 'Instruction text'),
  ('farmer.createFarmButton', 'en', 'Create Farm', 'farmer', 'Button text'),

  -- View Farm: Farm Settings
  ('farmer.farmSettings', 'en', 'Farm Settings', 'farmer', 'Section heading'),
  ('farmer.alertsOnOff', 'en', 'Alerts {{status}}', 'farmer', 'Toggle button'),
  ('farmer.on', 'en', 'On', 'farmer', 'Status text'),
  ('farmer.off', 'en', 'Off', 'farmer', 'Status text'),
  ('farmer.alertBufferZoneLabel', 'en', 'Alert Buffer Zone: <span class="text-blue-600 font-semibold">{{buffer}}m</span>', 'farmer', 'Setting label with value'),
  ('farmer.alertBufferExplanation', 'en', 'You will also be alerted when sheep are spotted within this distance outside your field boundaries.', 'farmer', 'Setting explanation'),

  -- View Farm: Fields Section
  ('farmer.fieldsCount', 'en', 'Fields ({{count}})', 'farmer', 'Section heading'),
  ('farmer.addFieldButton', 'en', '+ Add Field', 'farmer', 'Button text'),
  ('farmer.noFieldsYet', 'en', 'No fields yet. Add fields by placing fence posts.', 'farmer', 'Empty state message'),
  ('farmer.fencePostsCount', 'en', '{{count}} fence posts', 'farmer', 'Field detail'),
  ('farmer.delete', 'en', 'Delete', 'farmer', 'Button text'),
  ('farmer.deleteFarmButton', 'en', 'Delete Farm', 'farmer', 'Button text'),
  ('farmer.deleteFarmConfirm', 'en', 'Delete this farm?', 'farmer', 'Confirmation prompt'),

  -- Add Field View
  ('farmer.fieldNameLabel', 'en', 'Field Name *', 'farmer', 'Form label'),
  ('farmer.fieldNamePlaceholder', 'en', 'e.g., North Paddock', 'farmer', 'Input placeholder'),
  ('farmer.placeFencePostsLabel', 'en', 'Place Fence Posts ({{placed}} placed, need 3+)', 'farmer', 'Form label'),
  ('farmer.postNumber', 'en', 'Post {{number}}', 'farmer', 'Marker popup'),
  ('farmer.undoButton', 'en', '↩️ Undo', 'farmer', 'Button text'),
  ('farmer.clearButton', 'en', '🗑️ Clear', 'farmer', 'Button text'),
  ('farmer.fencePostTip', 'en', '🪵 Tap on the map to place fence posts around your field boundary.', 'farmer', 'Instruction tip'),
  ('farmer.saveField', 'en', 'Save Field', 'farmer', 'Button text'),

  -- Subscription View
  ('farmer.yourSubscription', 'en', 'Your Subscription', 'farmer', 'Page heading'),
  ('farmer.currentStatus', 'en', 'Current Status', 'farmer', 'Section label'),
  ('farmer.statusTrialBadge', 'en', '30-Day Free Trial', 'farmer', 'Status badge'),
  ('farmer.statusActiveBadge', 'en', 'Active', 'farmer', 'Status badge'),
  ('farmer.statusCancelledBadge', 'en', 'Cancelled', 'farmer', 'Status badge'),
  ('farmer.statusNoneBadge', 'en', 'None', 'farmer', 'Status badge'),
  ('farmer.trialEnds', 'en', 'Trial ends: <strong>{{date}}</strong>', 'farmer', 'Trial info'),
  ('farmer.trialChargeWarning', 'en', 'Your card will be charged £29.99 on this date unless you cancel.', 'farmer', 'Trial warning'),
  ('farmer.nextBillingDate', 'en', 'Next billing date: <strong>{{date}}</strong>', 'farmer', 'Billing info'),
  ('farmer.amount', 'en', 'Amount: <strong>£29.99</strong>', 'farmer', 'Billing amount'),
  ('farmer.subscriptionCancelledMessage', 'en', 'Your subscription has been cancelled. You will not be charged.', 'farmer', 'Cancellation message'),
  ('farmer.basicPlanHeading', 'en', 'Basic Plan - £29.99/month', 'farmer', 'Plan heading'),
  ('farmer.planFeatureUnlimited', 'en', '✓ Unlimited zone alerts', 'farmer', 'Plan feature'),
  ('farmer.planFeatureNotifications', 'en', '✓ Email & SMS notifications', 'farmer', 'Plan feature'),
  ('farmer.planFeatureHistory', 'en', '✓ Report history & analytics', 'farmer', 'Plan feature'),
  ('farmer.planFeatureMultiZones', 'en', '✓ Multiple farm zones', 'farmer', 'Plan feature'),
  ('farmer.planFeatureSupport', 'en', '✓ Priority support', 'farmer', 'Plan feature'),
  ('farmer.cancelSubscriptionHeading', 'en', 'Cancel Subscription', 'farmer', 'Section heading'),
  ('farmer.cancelTrialWarning', 'en', 'Cancel now and you will not be charged. Your access will end immediately.', 'farmer', 'Cancellation warning for trial'),
  ('farmer.cancelActiveWarning', 'en', 'Cancel and your access will continue until the end of your billing period.', 'farmer', 'Cancellation warning for active'),
  ('farmer.cancelSubscriptionButton', 'en', 'Cancel Subscription', 'farmer', 'Button text'),
  ('farmer.cancelConfirm', 'en', 'Are you sure you want to cancel your subscription? You will stop receiving alerts for sheep sightings in your zones.', 'farmer', 'Confirmation prompt'),
  ('farmer.backToDashboard', 'en', 'Back to Dashboard', 'farmer', 'Button text')

ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
