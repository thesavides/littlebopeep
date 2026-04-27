/**
 * Seed Translations - English Base
 * All UI strings extracted from components
 *
 * To add a new translation:
 * 1. Add it to the appropriate namespace below
 * 2. Run the seed script to insert into Supabase
 * 3. Run AI translation to generate other languages
 */

import type { TranslationEntry } from './ai-translator'

export const englishTranslations: TranslationEntry[] = [
  // ==================== COMMON ====================
  {
    key: 'common.loading',
    value: 'Loading...',
    namespace: 'common',
  },
  {
    key: 'common.error',
    value: 'Error',
    namespace: 'common',
  },
  {
    key: 'common.success',
    value: 'Success',
    namespace: 'common',
  },
  {
    key: 'common.save',
    value: 'Save',
    namespace: 'common',
  },
  {
    key: 'common.cancel',
    value: 'Cancel',
    namespace: 'common',
  },
  {
    key: 'common.delete',
    value: 'Delete',
    namespace: 'common',
  },
  {
    key: 'common.edit',
    value: 'Edit',
    namespace: 'common',
  },
  {
    key: 'common.close',
    value: 'Close',
    namespace: 'common',
  },
  {
    key: 'common.confirm',
    value: 'Confirm',
    namespace: 'common',
  },
  {
    key: 'common.back',
    value: 'Back',
    namespace: 'common',
  },
  {
    key: 'common.next',
    value: 'Next',
    namespace: 'common',
  },
  {
    key: 'common.submit',
    value: 'Submit',
    namespace: 'common',
  },

  // ==================== HEADER / NAVIGATION ====================
  {
    key: 'header.appName',
    value: 'Little Bo Peep',
    namespace: 'navigation',
    context: 'Application title - do not translate this brand name',
  },
  {
    key: 'header.logout',
    value: 'Logout',
    namespace: 'navigation',
  },
  {
    key: 'header.switchToFarmer',
    value: 'Switch to Farmer',
    namespace: 'navigation',
  },
  {
    key: 'header.switchToWalker',
    value: 'Switch to Walker',
    namespace: 'navigation',
  },
  {
    key: 'header.adminAccess',
    value: 'Admin Access',
    namespace: 'navigation',
  },
  {
    key: 'header.admin',
    value: 'Admin',
    namespace: 'navigation',
  },
  {
    key: 'header.walkerMode',
    value: 'Walker Mode',
    namespace: 'navigation',
  },
  {
    key: 'header.farmerMode',
    value: 'Farmer Mode',
    namespace: 'navigation',
  },
  {
    key: 'header.changePassword',
    value: 'Change Password',
    namespace: 'navigation',
  },

  // ==================== AUTHENTICATION ====================
  {
    key: 'auth.signIn',
    value: 'Sign In',
    namespace: 'auth',
  },
  {
    key: 'auth.signUp',
    value: 'Sign Up',
    namespace: 'auth',
  },
  {
    key: 'auth.email',
    value: 'Email',
    namespace: 'auth',
  },
  {
    key: 'auth.password',
    value: 'Password',
    namespace: 'auth',
  },
  {
    key: 'auth.confirmPassword',
    value: 'Confirm Password',
    namespace: 'auth',
  },
  {
    key: 'auth.name',
    value: 'Name',
    namespace: 'auth',
  },
  {
    key: 'auth.role',
    value: 'I am a...',
    namespace: 'auth',
  },
  {
    key: 'auth.walker',
    value: 'Walker',
    namespace: 'auth',
  },
  {
    key: 'auth.farmer',
    value: 'Farmer',
    namespace: 'auth',
  },
  {
    key: 'auth.alreadyHaveAccount',
    value: 'Already have an account?',
    namespace: 'auth',
  },
  {
    key: 'auth.dontHaveAccount',
    value: "Don't have an account?",
    namespace: 'auth',
  },
  {
    key: 'auth.createAccount',
    value: 'Create Account',
    namespace: 'auth',
  },

  // ==================== HOME PAGE ====================
  {
    key: 'home.welcomeWalker',
    value: "I'm a Walker",
    namespace: 'home',
  },
  {
    key: 'home.welcomeFarmer',
    value: "I'm a Farmer",
    namespace: 'home',
  },
  {
    key: 'home.tagline',
    value: 'Helping sheep get home',
    namespace: 'home',
  },
  {
    key: 'home.description',
    value: 'A simple way for countryside walkers to report lost sheep and help farmers recover their flock.',
    namespace: 'home',
  },
  {
    key: 'home.registeredUsers',
    value: '{count} registered users',
    namespace: 'home',
    context: '{count} is a number placeholder',
  },
  {
    key: 'home.walkerDescription',
    value: 'Spotted some sheep that look lost? Report their location and help a farmer find them.',
    namespace: 'home',
  },
  {
    key: 'home.farmerDescription',
    value: 'Set up your farm fields and receive alerts when sheep are spotted nearby.',
    namespace: 'home',
  },
  {
    key: 'home.reportSheepCta',
    value: 'Report a sheep →',
    namespace: 'home',
  },
  {
    key: 'home.manageFarmCta',
    value: 'Manage my farm →',
    namespace: 'home',
  },
  {
    key: 'home.adminPasswordPrompt',
    value: 'Enter admin password:',
    namespace: 'home',
  },
  {
    key: 'home.incorrectPassword',
    value: 'Incorrect password',
    namespace: 'home',
  },
  {
    key: 'home.howItWorks',
    value: 'How it works',
    namespace: 'home',
  },
  {
    key: 'home.step1Title',
    value: 'Spot',
    namespace: 'home',
  },
  {
    key: 'home.step1Description',
    value: 'Walker spots sheep that appear lost or out of place',
    namespace: 'home',
  },
  {
    key: 'home.step2Title',
    value: 'Report',
    namespace: 'home',
  },
  {
    key: 'home.step2Description',
    value: 'Submit location and details through the app',
    namespace: 'home',
  },
  {
    key: 'home.step3Title',
    value: 'Reunite',
    namespace: 'home',
  },
  {
    key: 'home.step3Description',
    value: 'Farmer receives alert and recovers their sheep',
    namespace: 'home',
  },
  {
    key: 'home.stat1',
    value: 'Sheep in UK',
    namespace: 'home',
  },
  {
    key: 'home.stat2',
    value: 'Annual losses',
    namespace: 'home',
  },
  {
    key: 'home.stat3Value',
    value: 'Free',
    namespace: 'home',
  },
  {
    key: 'home.stat3Label',
    value: '30-day trial',
    namespace: 'home',
  },

  // ==================== WALKER DASHBOARD ====================
  {
    key: 'walker.reportSheep',
    value: 'Report Sheep',
    namespace: 'walker',
  },
  {
    key: 'walker.myReports',
    value: 'My Reports',
    namespace: 'walker',
  },
  {
    key: 'walker.myReportsWithCount',
    value: 'My Reports ({count})',
    namespace: 'walker',
    context: '{count} is the number of reports',
  },
  {
    key: 'walker.recentAlerts',
    value: 'Recent Alerts',
    namespace: 'walker',
  },
  {
    key: 'walker.step1Title',
    value: 'Where did you see the sheep?',
    namespace: 'walker',
  },
  {
    key: 'walker.step2Title',
    value: 'How many sheep?',
    namespace: 'walker',
  },
  {
    key: 'walker.step3Title',
    value: 'Condition & Details',
    namespace: 'walker',
  },
  {
    key: 'walker.step4Title',
    value: 'Contact Information',
    namespace: 'walker',
  },
  {
    key: 'walker.clickMap',
    value: 'Click on the map to mark the location',
    namespace: 'walker',
  },
  {
    key: 'walker.useMyLocation',
    value: 'Use my current location',
    namespace: 'walker',
  },
  {
    key: 'walker.sheepCount',
    value: 'Number of sheep',
    namespace: 'walker',
  },
  {
    key: 'walker.condition',
    value: 'Condition',
    namespace: 'walker',
  },
  {
    key: 'walker.conditionHealthy',
    value: 'Healthy',
    namespace: 'walker',
  },
  {
    key: 'walker.conditionInjured',
    value: 'Injured',
    namespace: 'walker',
  },
  {
    key: 'walker.conditionDead',
    value: 'Dead',
    namespace: 'walker',
  },
  {
    key: 'walker.conditionUnknown',
    value: 'Not sure',
    namespace: 'walker',
  },
  {
    key: 'walker.description',
    value: 'Description (optional)',
    namespace: 'walker',
  },
  {
    key: 'walker.contactEmail',
    value: 'Contact Email',
    namespace: 'walker',
  },
  {
    key: 'walker.contactPhone',
    value: 'Contact Phone (optional)',
    namespace: 'walker',
  },
  {
    key: 'walker.reportSubmitted',
    value: 'Report Submitted Successfully',
    namespace: 'walker',
  },
  {
    key: 'walker.thankYou',
    value: 'Thank You!',
    namespace: 'walker',
  },
  {
    key: 'walker.thankYouMessage',
    value: "We'll send you a thank you message when the farmer claims your report and recovers the sheep!",
    namespace: 'walker',
  },
  {
    key: 'walker.additionalDetails',
    value: 'Additional details (optional)',
    namespace: 'walker',
  },
  {
    key: 'walker.back',
    value: '← Back',
    namespace: 'walker',
  },
  {
    key: 'walker.cancel',
    value: 'Cancel',
    namespace: 'walker',
  },
  {
    key: 'walker.continue',
    value: 'Continue →',
    namespace: 'walker',
  },
  {
    key: 'walker.submitReport',
    value: '✓ Submit Report',
    namespace: 'walker',
  },
  {
    key: 'walker.confirmReport',
    value: 'Confirm your report',
    namespace: 'walker',
  },
  {
    key: 'walker.contact',
    value: 'Contact',
    namespace: 'walker',
  },
  {
    key: 'walker.contactInstructionGuest',
    value: "Leave your contact details to be notified when the sheep is successfully returned to the farmer!",
    namespace: 'walker',
  },
  {
    key: 'walker.details',
    value: 'Details',
    namespace: 'walker',
  },
  {
    key: 'walker.detailsPlaceholder',
    value: 'e.g., Near the old stone wall, on the south side of the footpath...',
    namespace: 'walker',
  },
  {
    key: 'walker.duplicateWarning',
    value: 'A report for a missing sheep was reported in this vicinity within the past 12 hours. Do you still want to proceed?',
    namespace: 'walker',
  },
  {
    key: 'walker.email',
    value: 'Email',
    namespace: 'walker',
  },
  {
    key: 'walker.emailPlaceholder',
    value: 'your@email.com',
    namespace: 'walker',
  },
  {
    key: 'walker.existingReportNearby',
    value: 'Existing Report Nearby',
    namespace: 'walker',
  },
  {
    key: 'walker.location',
    value: 'Location',
    namespace: 'walker',
  },
  {
    key: 'walker.locationSelected',
    value: 'Location selected',
    namespace: 'walker',
  },
  {
    key: 'walker.name',
    value: 'Name',
    namespace: 'walker',
  },
  {
    key: 'walker.nameOptional',
    value: 'Name (optional)',
    namespace: 'walker',
  },
  {
    key: 'walker.namePlaceholder',
    value: 'Your name',
    namespace: 'walker',
  },
  {
    key: 'walker.nearbyReportsExist',
    value: '{count} report(s) already exist within 100m of this location in the last 12 hours.',
    namespace: 'walker',
    context: '{count} is the number of nearby reports',
  },
  {
    key: 'walker.nearbyReportsWarning',
    value: '{count} sheep report(s) within 100m in the last 12 hours. Check if these match what you\'ve seen before submitting a new report.',
    namespace: 'walker',
    context: '{count} is the number of nearby reports',
  },
  {
    key: 'walker.noReportsMessage',
    value: 'Spot some sheep and submit a report to help farmers!',
    namespace: 'walker',
  },
  {
    key: 'walker.noReportsYet',
    value: 'No reports yet',
    namespace: 'walker',
  },
  {
    key: 'walker.notifyConfirmLoggedIn',
    value: "We'll use your profile details to notify you when the farmer claims your report.",
    namespace: 'walker',
  },
  {
    key: 'walker.phone',
    value: 'Phone',
    namespace: 'walker',
  },
  {
    key: 'walker.phonePlaceholder',
    value: '+44 7700 900000',
    namespace: 'walker',
  },
  {
    key: 'walker.photoHelp',
    value: 'Photos help farmers identify the issue. Max 3 photos.',
    namespace: 'walker',
  },
  {
    key: 'walker.photos',
    value: 'Photos (optional)',
    namespace: 'walker',
  },
  {
    key: 'walker.privacyNote',
    value: 'Your contact info will only be used for notifications and may be shared with farmers in the area. Leave blank to report anonymously.',
    namespace: 'walker',
  },
  {
    key: 'walker.reportASheep',
    value: 'Report a Sheep',
    namespace: 'walker',
  },
  {
    key: 'walker.reportedSheep12h',
    value: 'Recent reports (last 12h)',
    namespace: 'walker',
  },
  {
    key: 'walker.reportsNearYou',
    value: 'Reports Near You',
    namespace: 'walker',
  },
  {
    key: 'walker.statusClaimed',
    value: 'Claimed',
    namespace: 'walker',
  },
  {
    key: 'walker.statusReported',
    value: 'Reported',
    namespace: 'walker',
  },
  {
    key: 'walker.statusResolved',
    value: 'Resolved',
    namespace: 'walker',
  },
  {
    key: 'walker.tipsForReporting',
    value: 'Tips for reporting',
    namespace: 'walker',
  },
  {
    key: 'walker.tip1',
    value: 'Check the map for recent reports before submitting',
    namespace: 'walker',
  },
  {
    key: 'walker.tip2',
    value: 'Be as accurate as possible with the location',
    namespace: 'walker',
  },
  {
    key: 'walker.tip3',
    value: 'Add a photo if it is safe to do so',
    namespace: 'walker',
  },
  {
    key: 'walker.tip4',
    value: 'Report injured or distressed animals as a priority',
    namespace: 'walker',
  },
  {
    key: 'walker.tip5',
    value: 'Keep a safe distance from any animals',
    namespace: 'walker',
  },
  {
    key: 'walker.tip6',
    value: 'You can report any countryside issue — gates, fencing, fly-tipping, and more',
    namespace: 'walker',
  },
  {
    key: 'walker.updateContactDetails',
    value: 'Update contact details',
    namespace: 'walker',
  },
  {
    key: 'walker.uploadingPhoto',
    value: '⏳ Uploading photo…',
    namespace: 'walker',
  },
  {
    key: 'walker.wantNotified',
    value: 'Want to be notified? 🔔',
    namespace: 'walker',
  },
  {
    key: 'walker.yesSubmitReport',
    value: 'Yes, Submit New Report',
    namespace: 'walker',
  },
  {
    key: 'walker.yourLocation',
    value: 'Your location',
    namespace: 'walker',
  },

  // ==================== FARMER DASHBOARD ====================
  {
    key: 'farmer.dashboard',
    value: 'Dashboard',
    namespace: 'farmer',
  },
  {
    key: 'farmer.myFarms',
    value: 'My Farms',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addFarm',
    value: 'Add Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addFarmButton',
    value: '+ Add Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addField',
    value: 'Add Field',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addFieldButton',
    value: '+ Add Field',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addYourFarmFields',
    value: 'Add Your Farm Fields',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmName',
    value: 'Farm Name',
    namespace: 'farmer',
  },
  {
    key: 'farmer.fieldName',
    value: 'Field Name',
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertBuffer',
    value: 'Alert Buffer (meters)',
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertBufferLabel',
    value: 'Alert Buffer Zone: {buffer}m',
    namespace: 'farmer',
    context: '{buffer} is the distance in metres',
  },
  {
    key: 'farmer.alertBufferZoneLabel',
    value: 'Alert Buffer Zone: {buffer}m',
    namespace: 'farmer',
    context: '{buffer} is the distance in metres',
  },
  {
    key: 'farmer.alertBufferInstruction',
    value: "You'll be alerted when sheep are spotted within this distance OUTSIDE your field boundaries.",
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertBufferExplanation',
    value: 'You will also be alerted when sheep are spotted within this distance outside your field boundaries.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.reports',
    value: 'Reports',
    namespace: 'farmer',
  },
  {
    key: 'farmer.claimReport',
    value: 'Claim Report',
    namespace: 'farmer',
  },
  {
    key: 'farmer.claim',
    value: 'Claim',
    namespace: 'farmer',
  },
  {
    key: 'farmer.resolveReport',
    value: 'Mark as Resolved',
    namespace: 'farmer',
  },
  {
    key: 'farmer.markResolved',
    value: 'Mark Resolved',
    namespace: 'farmer',
  },
  {
    key: 'farmer.reportClaimed',
    value: 'Report Claimed',
    namespace: 'farmer',
  },
  {
    key: 'farmer.reportResolved',
    value: 'Report Resolved',
    namespace: 'farmer',
  },
  {
    key: 'farmer.sheepReunited',
    value: 'Sheep Reunited!',
    namespace: 'farmer',
  },
  {
    key: 'farmer.back',
    value: 'Back',
    namespace: 'farmer',
  },
  {
    key: 'farmer.backToDashboard',
    value: 'Back to Dashboard',
    namespace: 'farmer',
  },
  {
    key: 'farmer.continue',
    value: 'Continue',
    namespace: 'farmer',
  },
  {
    key: 'farmer.manage',
    value: 'Manage',
    namespace: 'farmer',
  },
  {
    key: 'farmer.delete',
    value: 'Delete',
    namespace: 'farmer',
  },
  {
    key: 'farmer.on',
    value: 'On',
    namespace: 'farmer',
  },
  {
    key: 'farmer.off',
    value: 'Off',
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertsOn',
    value: 'Alerts On',
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertsOff',
    value: 'Off',
    namespace: 'farmer',
  },
  {
    key: 'farmer.alertsOnOff',
    value: 'On',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farm',
    value: 'Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmLabel',
    value: 'Farm:',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmDetails',
    value: 'Farm Details',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmSettings',
    value: 'Farm Settings',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmLocation',
    value: 'Farm Location',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmLocationInstruction',
    value: "Tap the map to mark your farm's physical location.",
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmNameLabel',
    value: 'Farm Name *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmNameRequired',
    value: 'Farm Name *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmNamePlaceholder',
    value: 'e.g., Green Valley Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.farmNameExample',
    value: 'e.g., North Field',
    namespace: 'farmer',
  },
  {
    key: 'farmer.fieldNameLabel',
    value: 'Field Name *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.fieldNamePlaceholder',
    value: 'e.g., North Paddock',
    namespace: 'farmer',
  },
  {
    key: 'farmer.fieldsCount',
    value: 'Fields ({count})',
    namespace: 'farmer',
    context: '{count} is the number of fields',
  },
  {
    key: 'farmer.fieldCount',
    value: '{fields} field(s) • Alert buffer: {buffer}m',
    namespace: 'farmer',
    context: '{fields} = number of fields, {buffer} = alert buffer in metres',
  },
  {
    key: 'farmer.fencePostTip',
    value: '🪵 Tap on the map to place fence posts around your field boundary.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.fencePostsCount',
    value: '{count} fence posts',
    namespace: 'farmer',
    context: '{count} is the number of fence posts placed',
  },
  {
    key: 'farmer.placeFencePostsLabel',
    value: 'Place Fence Posts ({count} placed, need {min}+)',
    namespace: 'farmer',
    context: '{count} = placed, {min} = minimum required',
  },
  {
    key: 'farmer.postNumber',
    value: 'Post {num}',
    namespace: 'farmer',
    context: '{num} is the post number',
  },
  {
    key: 'farmer.saveField',
    value: 'Save Field',
    namespace: 'farmer',
  },
  {
    key: 'farmer.createFarm',
    value: 'Create Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.createFarmButton',
    value: 'Create Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.deleteFarmButton',
    value: 'Delete Farm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.deleteFarmConfirm',
    value: 'Delete this farm?',
    namespace: 'farmer',
  },
  {
    key: 'farmer.drawFieldsInstruction',
    value: 'Draw your field boundaries to start receiving alerts.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.noFieldsYet',
    value: 'No fields yet. Add fields by placing fence posts.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.noFieldsMapped',
    value: 'Map your fields above to start receiving alerts.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.noNewReports',
    value: 'No new reports. All clear! 🎉',
    namespace: 'farmer',
  },
  {
    key: 'farmer.reportedSheep',
    value: 'Reported Sheep ({count})',
    namespace: 'farmer',
    context: '{count} is the number of reported sheep alerts',
  },
  {
    key: 'farmer.myClaimed',
    value: 'My Claimed ({count})',
    namespace: 'farmer',
    context: '{count} is the number of claimed reports',
  },
  {
    key: 'farmer.skipForNow',
    value: "Skip for now — I'll add a farm later",
    namespace: 'farmer',
  },
  {
    key: 'farmer.clearButton',
    value: '🗑️ Clear',
    namespace: 'farmer',
  },
  {
    key: 'farmer.undoButton',
    value: '↩️ Undo',
    namespace: 'farmer',
  },
  {
    key: 'farmer.locationSet',
    value: '📍 Location set',
    namespace: 'farmer',
  },
  {
    key: 'farmer.notificationPreferences',
    value: 'Notification Preferences',
    namespace: 'farmer',
  },
  {
    key: 'farmer.contactDetails',
    value: 'Contact Details',
    namespace: 'farmer',
  },
  {
    key: 'farmer.contactLabel',
    value: 'Contact:',
    namespace: 'farmer',
  },
  {
    key: 'farmer.emailDisplayLabel',
    value: 'Email:',
    namespace: 'farmer',
  },
  {
    key: 'farmer.phoneDisplayLabel',
    value: 'Phone:',
    namespace: 'farmer',
  },
  {
    key: 'farmer.currentStatus',
    value: 'Current Status',
    namespace: 'farmer',
  },
  {
    key: 'farmer.reviewConfirm',
    value: 'Review & Confirm',
    namespace: 'farmer',
  },
  {
    key: 'farmer.registrationStep',
    value: 'Registration (Step {step}/{total})',
    namespace: 'farmer',
    context: '{step} = current step, {total} = total steps',
  },

  // ==================== FARMER: SUBSCRIPTION ====================
  {
    key: 'farmer.subscription',
    value: 'Subscription',
    namespace: 'farmer',
  },
  {
    key: 'farmer.yourSubscription',
    value: 'Your Subscription',
    namespace: 'farmer',
  },
  {
    key: 'farmer.subscriptionDetailsHeading',
    value: 'Subscription Details:',
    namespace: 'farmer',
  },
  {
    key: 'farmer.freeTrialHeading',
    value: '🎉 30-Day Free Trial',
    namespace: 'farmer',
  },
  {
    key: 'farmer.freeTrialActive',
    value: 'Free Trial Active',
    namespace: 'farmer',
  },
  {
    key: 'farmer.startFreeTrial',
    value: 'Start Free Trial',
    namespace: 'farmer',
  },
  {
    key: 'farmer.trialStarting',
    value: '• 30-day free trial starting today',
    namespace: 'farmer',
  },
  {
    key: 'farmer.trialStartsToday',
    value: '• Your trial starts today',
    namespace: 'farmer',
  },
  {
    key: 'farmer.trialEnds',
    value: 'Trial ends: {date}',
    namespace: 'farmer',
    context: '{date} is a formatted date string',
  },
  {
    key: 'farmer.trialChargeWarning',
    value: 'Your card will be charged £29.99 on this date unless you cancel.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelAnytime',
    value: '• Cancel anytime before trial ends',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelFromDashboard',
    value: '• Cancel anytime from your dashboard',
    namespace: 'farmer',
  },
  {
    key: 'farmer.priceAfterTrial',
    value: '• £29.99/month after trial',
    namespace: 'farmer',
  },
  {
    key: 'farmer.firstCharge',
    value: '• First charge: £29.99 on {date}',
    namespace: 'farmer',
    context: '{date} is a formatted date string',
  },
  {
    key: 'farmer.nextBillingDate',
    value: 'Next billing date: {date}',
    namespace: 'farmer',
    context: '{date} is a formatted date string',
  },
  {
    key: 'farmer.basicPlanHeading',
    value: 'Basic Plan - £29.99/month',
    namespace: 'farmer',
  },
  {
    key: 'farmer.planFeatureUnlimited',
    value: '✓ Unlimited zone alerts',
    namespace: 'farmer',
  },
  {
    key: 'farmer.planFeatureMultiZones',
    value: '✓ Multiple farm zones',
    namespace: 'farmer',
  },
  {
    key: 'farmer.planFeatureNotifications',
    value: '✓ Email & SMS notifications',
    namespace: 'farmer',
  },
  {
    key: 'farmer.planFeatureHistory',
    value: '✓ Report history & analytics',
    namespace: 'farmer',
  },
  {
    key: 'farmer.planFeatureSupport',
    value: '✓ Priority support',
    namespace: 'farmer',
  },
  {
    key: 'farmer.statusActiveBadge',
    value: 'Active',
    namespace: 'farmer',
  },
  {
    key: 'farmer.statusTrialBadge',
    value: '30-Day Free Trial',
    namespace: 'farmer',
  },
  {
    key: 'farmer.statusCancelledBadge',
    value: 'Cancelled',
    namespace: 'farmer',
  },
  {
    key: 'farmer.statusNoneBadge',
    value: 'None',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelSubscriptionHeading',
    value: 'Cancel Subscription',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelSubscriptionButton',
    value: 'Cancel Subscription',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelConfirm',
    value: 'Are you sure you want to cancel your subscription? You will stop receiving alerts for sheep sightings in your zones.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelActiveWarning',
    value: 'Cancel and your access will continue until the end of your billing period.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cancelTrialWarning',
    value: 'Cancel now and you will not be charged. Your access will end immediately.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.subscriptionCancelledMessage',
    value: 'Your subscription has been cancelled. You will not be charged.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.ends',
    value: 'Ends {date}',
    namespace: 'farmer',
    context: '{date} is a formatted date string',
  },

  // ==================== FARMER: PAYMENT ====================
  {
    key: 'farmer.paymentSetup',
    value: 'Payment Setup',
    namespace: 'farmer',
  },
  {
    key: 'farmer.paymentMethod',
    value: 'Payment Method',
    namespace: 'farmer',
  },
  {
    key: 'farmer.paymentInstruction',
    value: 'Your card will not be charged until after your 30-day free trial ends.',
    namespace: 'farmer',
  },
  {
    key: 'farmer.securePayment',
    value: '🔒 Secure payment powered by Stripe',
    namespace: 'farmer',
  },
  {
    key: 'farmer.amount',
    value: 'Amount: £29.99',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cardholderNameLabel',
    value: 'Cardholder Name *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cardholderNamePlaceholder',
    value: 'Name on card',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cardNumberLabel',
    value: 'Card Number *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cardNumberPlaceholder',
    value: '1234 5678 9012 3456',
    namespace: 'farmer',
  },
  {
    key: 'farmer.expiryLabel',
    value: 'Expiry *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.expiryPlaceholder',
    value: 'MM/YY',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cvcLabel',
    value: 'CVC *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cvcPlaceholder',
    value: '123',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cardEnding',
    value: '💳 Card ending in {last4}',
    namespace: 'farmer',
    context: '{last4} is the last 4 digits of the card number',
  },
  {
    key: 'farmer.expires',
    value: 'Expires {expiry}',
    namespace: 'farmer',
    context: '{expiry} is the card expiry date e.g. 12/27',
  },

  // ==================== FARMER: REGISTRATION FORM ====================
  {
    key: 'farmer.yourNameLabel',
    value: 'Your Name *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.emailLabel',
    value: 'Email *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.phoneLabel',
    value: 'Phone',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addressLine1Label',
    value: 'Address Line 1 *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.addressLine2Label',
    value: 'Address Line 2',
    namespace: 'farmer',
  },
  {
    key: 'farmer.cityLabel',
    value: 'City *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.countyLabel',
    value: 'County',
    namespace: 'farmer',
  },
  {
    key: 'farmer.postcodeLabel',
    value: 'Postcode *',
    namespace: 'farmer',
  },
  {
    key: 'farmer.billingAddress',
    value: 'Billing Address',
    namespace: 'farmer',
  },
  {
    key: 'farmer.billingAddressHeading',
    value: 'Billing Address',
    namespace: 'farmer',
  },

  // ==================== MAP ====================
  {
    key: 'map.layers',
    value: 'Layers',
    namespace: 'map',
  },
  {
    key: 'map.footpaths',
    value: 'Footpaths',
    namespace: 'map',
  },
  {
    key: 'map.bridleways',
    value: 'Bridleways',
    namespace: 'map',
  },
  {
    key: 'map.trails',
    value: 'Trails',
    namespace: 'map',
  },
  {
    key: 'map.contours',
    value: 'Contours',
    namespace: 'map',
  },
  {
    key: 'map.viewDisclaimer',
    value: 'View disclaimer',
    namespace: 'map',
  },
  {
    key: 'map.disclaimerTitle',
    value: 'Rights of Way Disclaimer',
    namespace: 'map',
  },
  {
    key: 'map.disclaimerText1',
    value: 'Rights of way data is provided for reference only.',
    namespace: 'map',
  },
  {
    key: 'map.disclaimerText2',
    value: 'Always verify access rights with local authorities. Data may be incomplete or inaccurate.',
    namespace: 'map',
  },
  {
    key: 'map.disclaimerText3',
    value: 'Users are responsible for ensuring lawful access to all areas.',
    namespace: 'map',
  },
  {
    key: 'map.iUnderstand',
    value: 'I Understand',
    namespace: 'map',
  },
  {
    key: 'map.loadingLayers',
    value: 'Loading layers...',
    namespace: 'map',
  },

  // ==================== ADMIN ====================
  {
    key: 'admin.dashboard',
    value: 'Admin Dashboard',
    namespace: 'admin',
  },
  {
    key: 'admin.users',
    value: 'Users',
    namespace: 'admin',
  },
  {
    key: 'admin.allReports',
    value: 'All Reports',
    namespace: 'admin',
  },
  {
    key: 'admin.statistics',
    value: 'Statistics',
    namespace: 'admin',
  },
  {
    key: 'admin.archiveReport',
    value: 'Archive Report',
    namespace: 'admin',
  },

  // ==================== REPORT STATUS ====================
  {
    key: 'status.reported',
    value: 'Reported',
    namespace: 'reports',
  },
  {
    key: 'status.claimed',
    value: 'Claimed',
    namespace: 'reports',
  },
  {
    key: 'status.resolved',
    value: 'Resolved',
    namespace: 'reports',
  },
  {
    key: 'reports.sheepCount',
    value: '{count} sheep',
    namespace: 'reports',
    context: '{count} is a number placeholder',
  },
  {
    key: 'reports.timestamp',
    value: 'Reported {time}',
    namespace: 'reports',
    context: '{time} is a relative time like "2 hours ago"',
  },

  // ==================== ERRORS ====================
  {
    key: 'error.generic',
    value: 'Something went wrong. Please try again.',
    namespace: 'errors',
  },
  {
    key: 'error.network',
    value: 'Network error. Please check your connection.',
    namespace: 'errors',
  },
  {
    key: 'error.unauthorized',
    value: 'You are not authorized to perform this action.',
    namespace: 'errors',
  },
  {
    key: 'error.notFound',
    value: 'The requested resource was not found.',
    namespace: 'errors',
  },

  // ==================== FAQ ====================
  { key: 'faq.eyebrow', value: 'Help & Support', namespace: 'faq' },
  { key: 'faq.title', value: 'Frequently Asked Questions', namespace: 'faq' },
  { key: 'faq.subtitle', value: 'Step-by-step answers for walkers and farmers. Need help in your language? Use the chat assistant in the bottom-right corner.', namespace: 'faq' },
  { key: 'faq.section.walkers', value: 'For Walkers', namespace: 'faq' },
  { key: 'faq.section.farmers', value: 'For Farmers', namespace: 'faq' },
  { key: 'faq.chat.title', value: "Can't find what you're looking for?", namespace: 'faq' },
  { key: 'faq.chat.subtitle', value: 'Use the chat assistant (bottom-right) to ask a question in any language.', namespace: 'faq' },

  // Walker FAQ
  { key: 'faq.walker.submit.q', value: 'How do I submit a report?', namespace: 'faq' },
  { key: 'faq.walker.submit.s1', value: 'Open the app.', namespace: 'faq' },
  { key: 'faq.walker.submit.s2', value: 'Tap the + button at the bottom of the screen.', namespace: 'faq' },
  { key: 'faq.walker.submit.s3', value: 'Tap Use my location (or pin the spot manually on the map). Tap Confirm location.', namespace: 'faq' },
  { key: 'faq.walker.submit.s4', value: 'Choose a category (e.g. Sheep, Fence, Road).', namespace: 'faq' },
  { key: 'faq.walker.submit.s5', value: 'Tick any conditions that apply, and enter a count if asked.', namespace: 'faq' },
  { key: 'faq.walker.submit.s6', value: 'Add a short description.', namespace: 'faq' },
  { key: 'faq.walker.submit.s7', value: '(Optional) Tap Camera to take a photo, or Library to add an existing one. Up to 3 photos.', namespace: 'faq' },
  { key: 'faq.walker.submit.s8', value: 'Tap Submit Report.', namespace: 'faq' },

  { key: 'faq.walker.guest.q', value: 'How do I submit a report without an account?', namespace: 'faq' },
  { key: 'faq.walker.guest.s1', value: 'Follow the reporting steps above without signing in.', namespace: 'faq' },
  { key: 'faq.walker.guest.s2', value: 'On the last step, fill in your name, email, and phone number.', namespace: 'faq' },
  { key: 'faq.walker.guest.s3', value: 'Tap Submit Report.', namespace: 'faq' },
  { key: 'faq.walker.guest.note', value: 'As a guest you cannot edit your report or receive status updates.', namespace: 'faq' },

  { key: 'faq.walker.offline.q', value: 'How do I submit a report when I have no signal?', namespace: 'faq' },
  { key: 'faq.walker.offline.s1', value: 'Open the app — you will see an Offline mode banner at the top.', namespace: 'faq' },
  { key: 'faq.walker.offline.s2', value: 'Tap the + button.', namespace: 'faq' },
  { key: 'faq.walker.offline.s3', value: 'Fill in the report as normal, including photos.', namespace: 'faq' },
  { key: 'faq.walker.offline.s4', value: 'Tap Save for later. The report is saved on your device.', namespace: 'faq' },
  { key: 'faq.walker.offline.s5', value: 'When you have signal again, open the app.', namespace: 'faq' },
  { key: 'faq.walker.offline.s6', value: 'Tap Sync now on the banner. Your report is sent.', namespace: 'faq' },

  { key: 'faq.walker.edit.q', value: 'How do I edit a report I already submitted?', namespace: 'faq' },
  { key: 'faq.walker.edit.s1', value: 'Tap the Mine tab at the bottom of the screen.', namespace: 'faq' },
  { key: 'faq.walker.edit.s2', value: 'Find the report you want to change.', namespace: 'faq' },
  { key: 'faq.walker.edit.s3', value: 'Tap Edit on the report card. (If there is no Edit button, the report is already resolved or completed and cannot be changed.)', namespace: 'faq' },
  { key: 'faq.walker.edit.s4', value: 'Update the description, count, conditions, or add photos.', namespace: 'faq' },
  { key: 'faq.walker.edit.s5', value: 'Tap Save.', namespace: 'faq' },

  { key: 'faq.walker.status.q', value: 'How do I check the status of my report?', namespace: 'faq' },
  { key: 'faq.walker.status.s1', value: 'Tap the Mine tab.', namespace: 'faq' },
  { key: 'faq.walker.status.s2', value: 'Each report shows a status badge: Reported (waiting), Claimed (a farmer has it), Resolved (farmer has dealt with it), or Complete (closed by admin).', namespace: 'faq' },

  { key: 'faq.walker.notifications.q', value: 'How do I read messages from farmers?', namespace: 'faq' },
  { key: 'faq.walker.notifications.s1', value: 'Tap the bell icon at the top of the screen.', namespace: 'faq' },
  { key: 'faq.walker.notifications.s2', value: 'Your inbox shows all updates: claims, resolutions, and thank-you notes.', namespace: 'faq' },
  { key: 'faq.walker.notifications.s3', value: 'Tap a notification to see the full message.', namespace: 'faq' },

  { key: 'faq.walker.emailoff.q', value: 'How do I turn off email alerts?', namespace: 'faq' },
  { key: 'faq.walker.emailoff.s1', value: 'Tap the bell icon to open notifications.', namespace: 'faq' },
  { key: 'faq.walker.emailoff.s2', value: 'Tap the Email alerts toggle to switch it off. You will still see in-app notifications.', namespace: 'faq' },

  { key: 'faq.walker.language.q', value: 'How do I change the language?', namespace: 'faq' },
  { key: 'faq.walker.language.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.walker.language.s2', value: 'Tap Language.', namespace: 'faq' },
  { key: 'faq.walker.language.s3', value: 'Choose English, Welsh (Cymraeg), Irish (Gaeilge), or Scottish Gaelic (Gàidhlig).', namespace: 'faq' },

  { key: 'faq.walker.pwa.q', value: 'How do I install the app on my phone?', namespace: 'faq' },
  { key: 'faq.walker.pwa.s1', value: "Open the website on your phone's browser.", namespace: 'faq' },
  { key: 'faq.walker.pwa.s2', value: "Wait for the Install prompt to appear (or tap the browser's Add to Home Screen option).", namespace: 'faq' },
  { key: 'faq.walker.pwa.s3', value: 'Tap Install. The app is now on your home screen.', namespace: 'faq' },

  // Farmer FAQ
  { key: 'faq.farmer.signup.q', value: 'How do I sign up as a farmer?', namespace: 'faq' },
  { key: 'faq.farmer.signup.s1', value: 'Go to the sign-up page and choose Farmer.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s2', value: 'Step 1: Enter your name, email, and phone number.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s3', value: 'Step 2: Enter your billing address.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s4', value: "Step 3: Pin your farm's main location on the map.", namespace: 'faq' },
  { key: 'faq.farmer.signup.s5', value: 'Step 4: Create your first farm — give it a name and set the alert buffer.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s6', value: 'Step 5: Set up your subscription. Your 30-day free trial starts immediately.', namespace: 'faq' },

  { key: 'faq.farmer.addfarm.q', value: 'How do I add another farm?', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s1', value: 'Open your dashboard.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s2', value: 'Tap Add Farm.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s3', value: 'Enter the farm name.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s4', value: 'Set the alert buffer using the slider (default is 500m).', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s5', value: 'Tap Save.', namespace: 'faq' },

  { key: 'faq.farmer.drawfield.q', value: 'How do I draw a field?', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s1', value: 'Open the farm.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s2', value: 'Tap Add Field.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s3', value: 'Tap points on the map to place fence posts (minimum 3).', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s4', value: 'To adjust, drag any fence post to a new spot.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s5', value: 'Enter the field name and (optional) sheep count.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s6', value: 'Tap Save Field.', namespace: 'faq' },

  { key: 'faq.farmer.buffer.q', value: 'How do I change my alert buffer?', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s1', value: 'Open your farm settings.', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s2', value: 'Drag the Alert buffer slider (between 100m and 10km).', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s3', value: 'Tap Save.', namespace: 'faq' },
  { key: 'faq.farmer.buffer.note', value: 'A wider buffer catches more reports but also more reports from outside your land.', namespace: 'faq' },

  { key: 'faq.farmer.claim.q', value: 'How do I claim a report?', namespace: 'faq' },
  { key: 'faq.farmer.claim.s1', value: 'Open the report from your dashboard.', namespace: 'faq' },
  { key: 'faq.farmer.claim.s2', value: 'Tap Claim (or Claim with message to add a note for the walker).', namespace: 'faq' },
  { key: 'faq.farmer.claim.s3', value: 'The walker is automatically notified.', namespace: 'faq' },

  { key: 'faq.farmer.resolve.q', value: 'How do I resolve a report?', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s1', value: 'Open the claimed report.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s2', value: 'Tap Resolve.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s3', value: 'Choose a reason: Resolved / Resolved — Nothing to do / Resolved — Insufficient information / Resolved — Invalid report.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s4', value: '(Optional) Add a message for the walker.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s5', value: 'Tap Confirm.', namespace: 'faq' },

  { key: 'faq.farmer.unclaim.q', value: 'How do I unclaim a report?', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s1', value: 'Open a report you previously claimed.', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s2', value: 'Tap Unclaim.', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s3', value: 'If no other farmer has claimed it, the report goes back to Reported.', namespace: 'faq' },

  { key: 'faq.farmer.reopen.q', value: 'How do I reopen a resolved report?', namespace: 'faq' },
  { key: 'faq.farmer.reopen.s1', value: 'Open the resolved report.', namespace: 'faq' },
  { key: 'faq.farmer.reopen.s2', value: 'Tap Reopen. The report goes back to Claimed.', namespace: 'faq' },
  { key: 'faq.farmer.reopen.note', value: 'If the report has been marked Complete by an admin, you cannot reopen it yourself — tap Request Reopen to message the admin.', namespace: 'faq' },

  { key: 'faq.farmer.thankyou.q', value: 'How do I send a thank-you to the walker?', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s1', value: 'Open a claimed report.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s2', value: 'Tap Thank You.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s3', value: 'Type a short message.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s4', value: 'Tap Send.', namespace: 'faq' },

  { key: 'faq.farmer.flag.q', value: 'How do I flag a report as suspicious or wrong?', namespace: 'faq' },
  { key: 'faq.farmer.flag.s1', value: 'Open the report.', namespace: 'faq' },
  { key: 'faq.farmer.flag.s2', value: 'Tap Flag to Admin.', namespace: 'faq' },
  { key: 'faq.farmer.flag.s3', value: "Type a note explaining what's wrong.", namespace: 'faq' },
  { key: 'faq.farmer.flag.s4', value: 'Tap Submit.', namespace: 'faq' },

  { key: 'faq.farmer.subscriptions.q', value: "How do I turn off alerts for a category I don't need?", namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.s1', value: 'At farm level: open your farm settings, find the category, and tap the toggle to turn it off.', namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.s2', value: 'At field level (overrides farm setting): open the field, tap Category subscriptions, and toggle each category on or off for that field only.', namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.note', value: 'Some categories marked Compulsory cannot be turned off.', namespace: 'faq' },

  { key: 'faq.farmer.emailoff.q', value: 'How do I turn off email alerts?', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s2', value: 'Tap Notification settings.', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s3', value: 'Toggle Email alerts off. You will still see in-app alerts.', namespace: 'faq' },

  { key: 'faq.farmer.cancel.q', value: 'How do I cancel my subscription?', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s2', value: 'Tap Subscription.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s3', value: 'Tap Cancel subscription.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s4', value: 'Confirm. Your account stays active until the trial or billing period ends.', namespace: 'faq' },

  { key: 'faq.farmer.deletefield.q', value: 'How do I delete a field?', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s1', value: 'Open the field.', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s2', value: 'Tap Delete field.', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s3', value: 'Confirm.', namespace: 'faq' },

  { key: 'faq.farmer.deletefarm.q', value: 'How do I delete a farm?', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s1', value: 'Open the farm.', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s2', value: 'Tap Delete farm.', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s3', value: 'Confirm. All fields under that farm are also deleted.', namespace: 'faq' },

  // ==================== CHAT ====================
  { key: 'chat.greeting', value: "Hi! I'm the Little Bo Peep help assistant. Ask me anything about using the app — I can answer in any language.", namespace: 'chat' },
  { key: 'chat.title', value: 'Help Assistant', namespace: 'chat' },
  { key: 'chat.subtitle', value: 'Ask anything, any language', namespace: 'chat' },
  { key: 'chat.placeholder', value: 'Ask a question…', namespace: 'chat' },
  { key: 'chat.send', value: 'Send', namespace: 'chat' },
  { key: 'chat.close', value: 'Close', namespace: 'chat' },
  { key: 'chat.open', value: 'Open help chat', namespace: 'chat' },
  { key: 'chat.error', value: 'Sorry, something went wrong. Please try again.', namespace: 'chat' },
  { key: 'chat.poweredBy', value: 'Powered by AI · Not a substitute for official advice', namespace: 'chat' },
]
