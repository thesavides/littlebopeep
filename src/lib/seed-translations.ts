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
    key: 'walker.conditionUnknown',
    value: 'Unknown',
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
    value: 'Thank you for helping reunite lost sheep!',
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
    key: 'farmer.addField',
    value: 'Add Field',
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
    key: 'farmer.resolveReport',
    value: 'Mark as Resolved',
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
]
