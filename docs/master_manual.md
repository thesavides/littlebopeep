# Little Bo Peep — Master Operational Manual

**Complete Platform Reference for Super Admins, QA, and Engineering**
**Version: April 2026**

---

## Contents

1. [System Overview](#section-1--system-overview)
2. [Role and Permission Model](#section-2--role-and-permission-model)
3. [Core Object Model](#section-3--core-object-model)
4. [Full User Flows](#section-4--full-user-flows)
5. [Report Lifecycle](#section-5--report-lifecycle)
6. [Notification Logic](#section-6--notification-logic)
7. [Offline Mode](#section-7--offline-mode)
8. [Admin Control](#section-8--admin-control)
9. [Edge Cases](#section-9--edge-cases)
10. [Test Plan](#section-10--test-plan)
11. [Mobile vs Web](#section-11--mobile-vs-web)
12. [FAQ — Step-by-Step Guides](#section-12--faq--step-by-step-guides)
13. [AI Help Chatbot](#section-13--ai-help-chatbot)

---

## SECTION 1 — SYSTEM OVERVIEW

### 1.1 Purpose

Little Bo Peep is a real-time countryside reporting platform that connects walkers (members of the public) with farmers so that issues on or near farmland — injured animals, damaged fences, stray livestock, blocked paths — can be reported, claimed, and resolved efficiently.

### 1.2 Core Flow

The platform follows a linear lifecycle: **Report → Notify → Claim → Resolve → Archive**

Standard flow:

1. A walker spots an issue on their walk
2. Walker opens the app (web or PWA), pins the location on a map, selects a category and conditions, optionally adds photos, and submits
3. Submission triggers geo-computation: the system identifies all farm fields and their alert buffers that contain or overlap the report location
4. Affected farmers receive an in-app notification and an email alert
5. Any qualifying farmer claims the report (acknowledges responsibility)
6. Farmer investigates and resolves the report with a reason
7. Admin reviews and marks the report complete
8. Report is archived or deleted

### 1.3 Alternate Flows

- **Admin override:** Admin can claim, resolve, escalate, reassign, or delete any report at any stage
- **Escalation path:** Admin (and in future, AI) can flag a report as escalated before marking it complete. Farmers do not see this status
- **Offline reporting:** Walker submits while offline. Report is saved to IndexedDB locally. When connectivity returns the app automatically syncs pending reports to Supabase
- **Screening queue:** Reports that fail metadata checks appear in a "Needs Review" admin queue and are invisible to farmers until an admin approves them
- **Duplicate detection:** System flags reports within ~50m of another unclaimed/unresolved report submitted in the same hour. Admin decides how to handle

### 1.4 System States (Report)

| State | Visible to | Meaning |
|---|---|---|
| `reported` | Walker (own reports), farmers (if not `screening_required`), admin | Submitted and awaiting a farmer |
| `claimed` | Walker (own reports), farmers, admin | At least one farmer has acknowledged |
| `resolved` | Walker (own reports), farmers, admin | Farmer marked resolved with a reason |
| `escalated` | Admin only | Admin or AI flagged for further review (farmers see last farmer-level status) |
| `complete` | All roles | Admin closed the report; farmers cannot reopen |
| `archived` | Admin only (archived view) | Soft-deleted; hidden from active views |
| `deleted` | N/A (removed) | Hard delete; gone from all views |

### 1.5 System States (User)

| State | Meaning |
|---|---|
| `active` | Can sign in and use the system |
| `suspended` | Cannot sign in; account frozen |
| `pending_verification` | Self-registered, email confirmation not yet received. **Login is not blocked** — user can sign in immediately. Status upgrades to `active` automatically when the user clicks the confirmation link. |
| `password_reset_required` | Must change password on next login |
| `invited` | Admin-sent invite; user has not yet accepted |

### 1.6 Platform

- **Production URL:** https://littlebopeep.app
- **Hosting:** Cloudflare Workers (worker name: `littlebopeep`)
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage bucket `sheep-report-photos`
- **Email:** Resend (from: `hello@littlebopeep.app`)
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, Leaflet, PWA

---

## SECTION 2 — ROLE AND PERMISSION MODEL

### 2.1 Roles

There are four roles: `walker`, `farmer`, `admin`, `super_admin`

Role hierarchy (each level inherits all lower permissions):

```
super_admin > admin > farmer > walker
```

### 2.2 Walker

**Can see:**
- Public landing page
- The reporting flow (map, category picker, conditions, photo upload)
- Their own submitted reports only (status, conditions, photos, description)
- Notifications sent to them: `report_claimed`, `report_resolved`, `report_complete`, `thank_you`
- Their notification inbox (all types) and email alert toggle

**Can do:**
- Submit reports (logged-in or guest with name/email/phone)
- Edit their own reports if status is `reported` or `claimed` (edit: description, count, conditions, add photos)
- View own report status (`reported` / `claimed` / `resolved` / `complete`) — cannot see `escalated`
- Receive and read notifications
- Toggle email alerts on/off
- Toggle per-type in-app notification preferences (email_alerts, in_app_claimed, in_app_resolved, in_app_thankyou) via `NotificationPrefsPanel`
- Access map with optional OS layers (footpaths, bridleways, contours, trails)
- Change preferred language (en, cy, ga, gd)
- Change password via profile drawer
- Install the PWA

**Cannot do:**
- See other walkers' reports
- See any farmer identity or which farmer claimed their report
- See `escalated` status
- Claim, resolve, or complete reports
- Access any admin, farmer, or farm data

### 2.3 Farmer

**Can see:**
- All reports within their farm's field polygons or alert buffer zones AND not `screening_required`
- Report details for those reports: category, conditions, count, photos, description, status, timestamp
- Their own farms and fields on the map
- Their notification inbox: `new_report` alerts, `thank_you` confirmations
- The map (fields drawn as polygons, report pins)

**Can do:**
- Register as a farmer (5-step registration flow: name/contact → billing address → physical address → farm creation → subscription/trial)
- Create farms (name, alert buffer distance)
- Create fields (polygon drawing on map via fence posts, name, sheep count, per-field category subscriptions)
- Edit farm name and alert buffer
- Edit field name, boundary, and category subscriptions
- Delete farm (all fields removed)
- Delete field
- Claim a report (if within their farm's proximity)
- Unclaim a report they previously claimed
- Resolve a report with a reason (4 options — see Section 5)
- Reopen a resolved report (returns to `claimed` status)
- Flag a report to admin with a free-text note
- Send a Thank You message to the walker on a claimed report
- Claim with a message (optional note to the walker on claim action)
- Resolve with a message (optional note to the walker on resolve action)
- Toggle email alerts on/off
- Toggle per-type in-app notification preferences (email_alerts, in_app_new_report) via `NotificationPrefsPanel`
- Subscribe/unsubscribe to categories at farm level and field level
- Change password via profile drawer

**Cannot do:**
- See who submitted a report (submitter identity is admin-only)
- See `screening_required` reports
- See the `escalated` status (they see `claimed` or `resolved`, whichever was last set by a farmer)
- Access admin panels
- Mark a report complete (admin-only)
- Delete any report
- See other farmers' activity on a report

### 2.4 Admin

**Can see:**
- All reports in all statuses including `escalated`, `archived`, `needs_review` (`screening_required`)
- Full report detail: submitter name and role (admin-only fields), GPS location, photos + EXIF metadata, affected farms/farmers list, notification history, audit log for the report
- All users (walkers, farmers, other admins)
- All farms and fields
- All categories
- Audit log (system-wide)
- Screening queue (reports with `screening_required = true`)
- Flagged reports (reports where a farmer has flagged to admin)
- Duplicate badge on reports flagged as potential duplicates

**Can do:**
- Everything a farmer can do, plus:
- Edit any report field (description, conditions, count, status, notes)
- Delete photos from a report (removes URL from `report_images` table and `photo_urls` array)
- Mark a report escalated
- Mark a report complete (with optional admin notes)
- Revert a complete report to `reported` (to allow farmer to re-engage)
- Assign or reassign a report to any specific farmer
- Unclaim a report from a specific farmer
- Approve a report from the screening queue (`screening_required → false`)
- Delete any report
- Archive/unarchive reports
- Bulk archive reports (select multiple → archive all)
- Bulk delete reports (select multiple → delete all)
- Add manual comments to reports
- View audit log history per report and system-wide
- Invite new users (walker, farmer, admin) by email — sends branded invite email via Resend
- Suspend and reactivate users
- Reset user passwords (sends reset email)
- Delete users (farms deleted, reports retained with denormalised name)
- Manage farms: create, edit, delete, assign to farmer
- Manage fields: create, edit, delete within a farm
- Manage categories: create, edit, reorder, delete, set default, upload image
- Filter reports by: status, archive state, farmer, farm, reporter/walker, date range (from/to), keyword/report ID
- Sort reports by: date (newest first) or days unclaimed

**Cannot do:**
- Change their own role (only super_admin can do this)
- Access Supabase directly
- Run database migrations

### 2.5 Super Admin

All admin permissions, plus:
- Invite users with any role including `admin` and `super_admin`
- Change any user's role
- Access to all system configuration
- Responsible for Supabase project, Cloudflare deployment, and Resend API management

---

## SECTION 3 — CORE OBJECT MODEL

### 3.1 Report (`SheepReport`)

#### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Pre-assigned at draft start |
| `location` | `{lat, lng}` | GPS coordinates from device |
| `timestamp` | Date | Submission time |
| `description` | string | Free-text additional detail |
| `photoUrl` | string (legacy) | Single photo (old) |
| `photoUrls` | string[] | Up to 3 photos (current) |
| `sheepCount` | number | Count of animals or items |
| `condition` | string | Primary condition (backward-compat) |
| `conditions` | string[] | All selected conditions (multi-select) |
| `categoryId` | string | References `report_categories` |
| `categoryName` | string | Denormalised at submit |
| `categoryEmoji` | string | Denormalised at submit |
| `categoryImageUrl` | string (opt) | URL if category has image |
| `reporterContact` | string (opt) | Guest contact info |
| `reporterId` | string (opt) | Auth user ID (null for guest reports) |
| `status` | enum | `reported` / `claimed` / `resolved` / `escalated` / `complete` |
| `claimedByFarmerId` | string (opt) | Primary claimant (legacy compat) |
| `claimedByFarmerIds` | string[] | All current claimants |
| `claimedAt` | Date (opt) | First claim timestamp |
| `resolvedAt` | Date (opt) | Resolution timestamp |
| `thankedAt` | Date (opt) | Thank you sent timestamp |
| `archived` | boolean | Soft-delete flag |
| `submittedByUserName` | string (opt) | **Admin-only:** submitter's name |
| `roleOfSubmitter` | string (opt) | **Admin-only:** submitter's role |
| `affectedFarmIds` | string[] | Computed at submit (geo-query) |
| `affectedFarmerIds` | string[] | Computed at submit (geo-query) |
| `locationAccuracy` | number (opt) | GPS accuracy in metres |
| `deviceType` | string (opt) | Device info |
| `appVersion` | string (opt) | App version at submit |
| `resolutionReason` | string (opt) | Farmer's reason on resolve |
| `adminNotes` | string (opt) | Admin notes when marking complete |
| `completedBy` | string (opt) | Admin user ID |
| `completedAt` | Date (opt) | Completion timestamp |
| `escalatedBy` | string (opt) | Admin user ID |
| `escalatedAt` | Date (opt) | Escalation timestamp |
| `farmerFlagNote` | string (opt) | Farmer's flag note |
| `flaggedByFarmer` | string (opt) | Farmer user ID |
| `flaggedAt` | Date (opt) | Flag timestamp |
| `screeningRequired` | boolean (opt) | `true` = invisible to farmers until cleared |
| `metadataCompletenessScore` | number (opt) | 0–1 score |
| `mapSnapshotUrl` | string (opt) | OSM link at report location |

#### Editable Fields by Role

| Field | Walker (own) | Farmer | Admin |
|---|---|---|---|
| `description` | ✓ (if `reported`/`claimed`) | ✗ | ✓ |
| `sheepCount` | ✓ (if `reported`/`claimed`) | ✗ | ✓ |
| `conditions` | ✓ (if `reported`/`claimed`) | ✗ | ✓ |
| `photoUrls` | ✓ add (if `reported`/`claimed`) | ✗ | ✓ add/delete |
| `status` | ✗ | claim/unclaim/resolve/reopen | all transitions |
| `adminNotes` | ✗ | ✗ | ✓ |
| `resolutionReason` | ✗ | ✓ on resolve | ✓ |
| `archived` | ✗ | ✗ | ✓ |

#### State Transitions

```
reported   → claimed   (farmer claims, admin assigns)
claimed    → reported  (all farmers unclaim)
claimed    → resolved  (farmer or admin resolves)
resolved   → claimed   (farmer reopens)
any        → escalated (admin only)
escalated  → complete  (admin marks complete)
resolved   → complete  (admin marks complete)
complete   → reported  (admin reverts to allow re-engagement)
any active → archived  (admin)
archived   → active    (admin unarchive)
any        → deleted   (admin hard delete)
```

#### Edge Cases

- A report can have multiple claimants simultaneously (multi-farm proximity)
- If the last claimant unclaims, status reverts to `reported`
- Farmers can only reopen reports in `resolved` status; `complete` is locked to farmers
- If admin reverts `complete → reported`, the report loses its `completedBy` and `completedAt`
- Guest reports (no `reporterId`) cannot receive walker notifications

---

### 3.2 Farm

#### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Supabase-generated |
| `farmerId` | string | Owner's user ID |
| `name` | string | Farm display name |
| `address` | string (opt) | Human-readable address |
| `fields` | `FarmField[]` | Polygon fields |
| `alertBufferMeters` | number | Metres outside field boundaries that trigger alerts |
| `alertsEnabled` | boolean | Master alert on/off |
| `createdAt` | Date | Creation timestamp |
| `categorySubscriptions` | `Record<string, boolean>` | Per-category alert overrides (`default_on` / `default_off` categories) |

#### Alert Logic

- A report is near a farm if the report location is **inside any field polygon** OR **within `alertBufferMeters` of any field edge**
- Alert buffer is set by the farmer (slider, 100m–10,000m, default 500m)
- `compulsory` categories always trigger alerts regardless of subscription settings
- `default_on` categories trigger unless the farmer explicitly opts out
- `default_off` categories only trigger if the farmer explicitly opts in
- Field-level subscriptions override farm-level subscriptions for that field only

#### Editing and Deletion

- Any admin can create, edit, or delete any farm
- Farmers can create and manage their own farms only
- Deleting a farm deletes all associated fields (cascade)
- Deleting a farm does NOT delete reports — `affectedFarmIds` references are denormalised

---

### 3.3 Field (`FarmField`)

#### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Supabase-generated |
| `name` | string | Field/paddock name |
| `fencePosts` | `{lat, lng}[]` | Polygon vertices (minimum 3 required) |
| `sheepCount` | number (opt) | Farmer's current head count |
| `color` | string (opt) | Map display colour |
| `categorySubscriptions` | `Record<string, boolean>` | Per-category overrides at field level |

#### Geometry and Boundaries

- Fields are drawn as polygons by placing fence posts on the map
- Fence posts can be dragged after placement
- Minimum 3 fence posts required to form a valid polygon
- The polygon is closed automatically (last post connects to first)
- Point-in-polygon tested using ray-casting algorithm
- Buffer zone tested by measuring distance from point to each polygon edge (closest point on segment)
- Distance calculation uses the Haversine formula (Earth radius 6,371,000m)

#### Alert Logic

- A report triggers a field if: inside the polygon OR within `farm.alertBufferMeters` of the polygon edge
- Field-level category subscription overrides farm-level for that field

---

### 3.4 Category (`ReportCategory`)

#### Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Supabase-generated |
| `name` | string | English display name (e.g. Sheep, Fence, Road) |
| `emoji` | string | Display emoji |
| `description` | string (opt) | Helper text shown in picker |
| `conditions` | string[] | Selectable condition options |
| `showCount` | boolean | Whether to ask "how many?" |
| `countLabel` | string | Label for the count field |
| `isActive` | boolean | Whether visible in reporting flow |
| `sortOrder` | number | Display order |
| `subscriptionMode` | enum | `compulsory` / `default_on` / `default_off` |
| `imageUrl` | string (opt) | Overrides emoji on map pin when set |
| `nameTranslations` | `Record<lang, string>` | cy, ga, gd translations of name |
| `descriptionTranslations` | `Record<lang, string>` | Translations of description |
| `conditionTranslations` | `Record<lang, Record<string, string>>` | Per-language condition label translations |
| `createdAt` | Date | Creation timestamp |

#### Subscription Modes

- **`compulsory`:** All farmers always receive alerts for this category; cannot be toggled off
- **`default_on`:** Farmers receive alerts by default; can opt out per farm or field
- **`default_off`:** Farmers do not receive alerts by default; can opt in per farm or field

#### Default Category Logic

`getDefaultCategory()` resolves in this order:
1. User's personal default (set in walker settings, stored in `user_profiles.default_category_id`)
2. System default (`is_system_default = true` on `report_categories`)
3. Hard-coded fallback: Sheep

#### Translations

- Supported languages: `en` (English), `cy` (Welsh), `ga` (Irish), `gd` (Scottish Gaelic)
- Translation cache version: `v16` (bump in `src/lib/i18n.ts` when DB translations updated)
- Cache key pattern: `translations_v{N}_{lang}` in localStorage, 24-hour TTL
- Translations seeded via Node.js scripts using Anthropic Haiku for cy/ga/gd auto-translation

---

### 3.5 User

#### Roles

| Role | Description |
|---|---|
| `walker` | Member of the public who submits reports |
| `farmer` | Landowner who receives alerts and manages reports |
| `admin` | Platform operator with full report/user/farm management |
| `super_admin` | System owner; all admin powers plus role management and system config |

#### Status States

| Status | Meaning |
|---|---|
| `active` | Normal — can sign in |
| `suspended` | Frozen — cannot sign in |
| `pending_verification` | Awaiting email confirmation |
| `password_reset_required` | Forced password change on next login |
| `invited` | Invite sent, user has not yet signed up |

#### User Lifecycle

**Self-registration (walker or farmer):**
1. User completes signup form at `/auth?mode=signup`
2. Account created with `status = pending_verification`; Supabase sends a confirmation email
3. User can sign in immediately — login is **not** blocked by unverified status
4. User clicks confirmation link in email → lands on `/auth/email-confirmed` → code exchanged → `POST /api/auth/confirm-email` → `status → active`, `email_confirmed_at` stamped
5. Admin can see `✉️ Email Pending` badge on users whose status is still `pending_verification` and can use the **Resend ✉️** button to trigger a new confirmation email

**Admin-invited user:**
1. Super admin or admin invites user by email → Resend sends branded invite email
2. User clicks invite link → lands on `/auth?mode=signup` with role pre-populated
3. User sets password and completes profile
4. Account becomes `active` (no email verification step for admin-invited users)

**Ongoing:**
5. Admin can suspend, reactivate, reset password, change role, or delete
6. Deletion: removes from auth and `user_profiles`; farms deleted; reports retained with denormalised `submitted_by_user_name`

#### Privacy

- `submitted_by_user_name` is gated behind `includePrivateFields` — only `admin`/`super_admin` roles receive this field
- Walkers cannot see which farmer claimed their report
- Farmers cannot see who submitted a report

---

## SECTION 4 — FULL USER FLOWS

### 4.1 Walker Flows

#### 4.1.1 Online Reporting Flow (logged-in)

1. Walker taps the **+** FAB button (bottom centre of WalkerDashboard) or the "Report" primary button
2. **Step 1 — Location:** Map opens. Walker taps "Use my location" or pins location manually. GPS accuracy shown. Walker taps "Confirm location"
3. **Step 2 — Category and Conditions:** Category picker shown (categories from DB, defaulting to user/system default). Walker selects category. Conditions for that category shown as multi-select chips. Walker selects all applicable conditions. If `showCount = true` for the category, count input shown as a **+/− stepper** with a numeric input field (direct input supported)
4. **Step 3 — Details:** Free-text description field. Photo upload section: Walker can take a photo (Camera button, uses `capture="environment"`) or choose from library (Library button). Up to 3 photos. Submit button disabled while upload in progress. Guest fields (name, email, phone) shown only if not signed in
5. Walker taps "Submit Report"
6. Report saved optimistically to local Zustand store immediately
7. `createReportInSupabase()` called; on success, local record replaced with canonical Supabase record
8. Geo-query computed: `affectedFarmIds` and `affectedFarmerIds` populated
9. `createNotificationsForFarmers()` creates in-app notification rows for each affected farmer
10. `emailFarmerNotifications()` fires `POST /api/send-notification-email` for each affected farmer
11. Success banner shown. Walker returns to dashboard

#### 4.1.2 Online Reporting Flow (guest)

Same as above except:
- Step 3 shows Name, Email, Phone fields (optional but recommended)
- `reporterId` is null
- Walker cannot edit their report after submission
- Walker cannot receive walker notifications (no user to target)

#### 4.1.3 Offline Reporting Flow

1. Device has no internet connection
2. `OfflineSyncBanner` shown at top of screen indicating offline mode
3. Walker taps **+** FAB → `OfflineCapture` form opens
4. Walker fills in: category, conditions, count, description, and optional photos (stored as base64 data URLs in IndexedDB)
5. Walker taps "Save for later"
6. Report saved to IndexedDB (`lbp-offline` database, `pending-reports` store) with `synced: false`
7. Walker sees "1 pending report" badge on the sync banner

#### 4.1.4 Offline Sync

1. Device comes back online (detected by `useOnlineStatus` hook)
2. `OfflineSyncBanner` shows "Sync now" button with pending count
3. Walker taps "Sync now"
4. `getPendingReports()` reads all unsynced records from IndexedDB
5. For each pending report: `createReportInSupabase()` called
6. On success: `markReportSynced(id)` in IndexedDB; report added to Zustand store
7. On failure: report stays in IndexedDB with `synced: false`; banner shows error count
8. Additionally, on `loadReports()` at app startup: orphaned local-store reports (those without a Supabase UUID) are retroactively synced

#### 4.1.5 Viewing My Reports

1. Walker switches to "Mine" tab (bottom tab bar, right icon)
2. My Reports view shows all reports submitted by `currentUserId`
3. Each card shows: category emoji, timestamp, status badge, count, conditions, description, photos
4. Reports in `reported` or `claimed` status have an "Edit" button
5. Walker taps Edit: inline edit form opens below the card with editable description, count, conditions, and photo upload
6. Walker saves: `editOwnReport()` called optimistically then synced to Supabase

#### 4.1.6 Notification Inbox (Alerts tab)

1. Walker taps the **🔔 Alerts** tab in the bottom nav (badge count shown when unread items exist)
2. All notifications auto-marked read on tab open
3. Inbox shows all notifications: `thank_you`, `report_claimed`, `report_resolved`, `report_complete`, `sync_complete`
4. Each card shows: icon, type label, sender name (if known), date, message text, and associated report category
5. Unread items have an amber highlight and a yellow dot indicator
6. Empty state shown when no notifications have been received yet
7. Notification preferences panel (email toggle, per-type toggles) shown above the list on the same screen

**Note:** The bottom nav **🔔 Alerts** tab is only shown to signed-in walkers. Guest walkers see the Map / My Reports / Profile tabs only.

---

### 4.2 Farmer Flows

#### 4.2.1 Farmer Registration (first-time)

1. Farmer signs up via `/auth?mode=signup&role=farmer` or is invited by admin
2. Farmer lands on FarmerDashboard in registration mode (steps 1–5)
3. **Step 1:** Contact details (name, email, phone — pre-populated from Supabase profile if invited)
4. **Step 2:** Billing address (line1, line2, city, county, postcode)
5. **Step 3:** Physical location (map pin for farm location)
6. **Step 4:** Farm creation (farm name, alert buffer slider)
7. **Step 5:** Subscription / trial (30-day free trial started automatically via `startTrial()`)
8. After registration: farmer lands in dashboard with their farm visible

#### 4.2.2 Creating a Farm

1. Farmer taps "Add Farm"
2. Farm name entered; alert buffer set via slider (default 500m)
3. `createFarmInSupabase()` called; farm added to Zustand store
4. Audit log entry written: `farm.create`

#### 4.2.3 Creating a Field

1. Farmer opens their farm → taps "Add Field"
2. Map opens in fence-post drawing mode
3. Farmer taps points on map to place fence posts (minimum 3)
4. Fence posts can be dragged to adjust position
5. Farmer names the field and optionally sets sheep count
6. Farmer optionally configures per-field category subscriptions
7. Farmer taps "Save Field" → `addFieldToFarm()` called
8. Audit log entry written: `field.create`

#### 4.2.4 Claiming a Report

1. Farmer views report list — shows all reports within their farms' proximity
2. Farmer taps a report card → report detail opens
3. Farmer taps "Claim" (or "Claim with Message" to include a note)
4. `claimReport()` called: status → `claimed`; farmer added to `claimedByFarmerIds`
5. Walker notification sent: `report_claimed` (in-app + email if enabled)
6. Audit log: `report.claim`

#### 4.2.5 Resolving a Report

1. Farmer views a claimed report they are a claimant on
2. Farmer taps "Resolve"
3. Reason dropdown shown (four options):
   - Resolved
   - Resolved — Nothing to do
   - Resolved — Insufficient information
   - Resolved — Invalid report
4. Optional: "Resolve with message" adds a note sent to the walker
5. `resolveReport()` called: status → `resolved`; `resolutionReason` stored
6. Walker notification sent: `report_resolved`
7. Audit log: `report.resolve`

#### 4.2.6 Reopening a Report

1. Farmer views a report they claimed that is in `resolved` status
2. Farmer taps "Reopen"
3. `reopenReport()` called: status → `claimed`
4. Note: farmers cannot reopen `complete` reports

#### 4.2.7 Flagging a Report to Admin

1. Farmer views an active report
2. Farmer taps "Flag to Admin"
3. Free-text note modal opens
4. Farmer submits note → `flagReportToAdmin()` called
5. Report appears highlighted in admin list
6. Audit log: `report.flag`

#### 4.2.8 Sending a Thank You

Available on both **claimed** and **resolved** reports.

1. Farmer views a claimed or resolved report that has a known reporter (`report.reporterId` is set)
2. Farmer taps "💌 Thank You" button
3. Thank you message text field opens with a placeholder default message
4. Farmer edits the message (optional) and submits → `sendThankYouMessage()` called
5. Walker receives `thank_you` notification (in-app and email if enabled)
6. `thankedAt` timestamp recorded; button replaced with "✓ Sent" label for that session

#### 4.2.9 Managing Category Subscriptions

1. Farmer opens farm settings
2. Farm-level subscriptions shown for all `default_on` and `default_off` categories
3. Farmer toggles categories on/off → `updateFarmCategorySubscription()` persisted to Supabase
4. Farmer opens a field → field-level overrides available per category
5. Field-level overrides take precedence over farm-level for that field

---

### 4.3 Admin Flows

#### 4.3.1 Admin Dashboard Overview

Admin logs in → `AdminDashboard` renders

Navigation tabs: **Overview | Reports | Farms | Walkers | Farmers | Admins | Categories | Audit Log**

Overview tab shows:
- Total reports, reports by status, unresolved count
- Reports needing review (`screening_required`) with badge
- Flagged reports
- Map with all report pins and farm fields

#### 4.3.2 Managing Reports

1. Admin opens Reports tab
2. Filters available: status, archive state, farmer, farm, reporter/walker (dropdown of all walker accounts), date range (from/to), keyword/report ID
3. Sort by: date (newest first) or days unclaimed
4. Pagination: configurable per page (10/25/50)
5. Admin taps a report → report detail panel opens
6. Detail panel shows: all report fields, submitter identity (admin-only), GPS location, photos with EXIF metadata, affected farms/farmers list, notification history, audit log for this report, comments
7. Admin can: edit any field, add comment, escalate, mark complete (with notes), reassign, unclaim specific farmer, archive, delete, approve from screening queue

#### 4.3.3 Bulk Operations

1. Admin selects reports via checkboxes
2. **"Archive selected"** → `batchArchiveReports()` — sets `archived = true` for all selected; persisted to Supabase
3. **"Delete selected"** → `batchDeleteReports()` — hard deletes all selected from Supabase and local store

#### 4.3.4 Inviting Users

1. Admin opens Walkers, Farmers, or Admins tab
2. Taps "Invite User"
3. Enters email and selects role
4. `POST /api/admin/invite-user` → Supabase creates auth user; Resend sends branded invite email
5. User appears in list with status: `invited`
6. Admin can resend invite or reset password at any time
7. Audit log: `user.invite`

#### 4.3.5 Managing Users

- **Suspend:** `suspendUserInSupabase()`; status → `suspended`; user cannot sign in
- **Activate:** `activateUserInSupabase()`; status → `active`
- **Reset password:** `POST /api/admin/reset-password`; sends reset email via Resend
- **Delete:** `POST /api/admin/delete-user`; removes from auth and `user_profiles`; farms deleted; reports retained
- All actions write audit log entries

#### 4.3.6 Managing Categories

1. Admin opens Categories tab
2. Existing categories listed with emoji, name, subscription mode, active/inactive badge
3. Admin can create new category: name, emoji, description, conditions (comma-separated), `showCount`, `countLabel`, `subscriptionMode`, image upload
4. Admin can edit any category
5. Admin can drag-reorder categories (`sortOrder` updated)
6. Admin can set a category as system default (`is_system_default`)
7. Admin can upload a category image (overrides emoji on map)
8. Admin can delete a category (farmers lose subscriptions to that category)

#### 4.3.7 Viewing Audit Log

1. Admin opens Audit Log tab
2. Chronological list of all `audit_logs` entries
3. Each entry: actor ID, action, entity type, entity ID, timestamp, detail JSON, IP address, user agent
4. Admin can also view per-report audit history in the report detail panel

---

### 4.4 Super Admin Flows

#### 4.4.1 Inviting Admin Users

Same as admin invite flow, but with ability to select `admin` or `super_admin` role.

#### 4.4.2 Changing User Roles

1. Super admin opens any user's detail in `AdminUserManagement`
2. Role dropdown available (`walker` / `farmer` / `admin` / `super_admin`)
3. Change saved via `updateUserProfile()` → updates `user_profiles.role` in Supabase
4. User's access changes on next page load

#### 4.4.3 System Overrides

- Can revert `complete` reports to `reported` (reopens for farmer re-engagement)
- Can approve screening queue reports
- Can delete any entity
- Direct access to Supabase project and Cloudflare Workers (outside app)

---

## SECTION 5 — REPORT LIFECYCLE

### 5.1 State: `reported`

**Trigger:** Walker submits report (`submitReport()` called)

**Actions at this point:**
- Report created in Supabase with `status = reported`
- `affectedFarmIds` and `affectedFarmerIds` computed from geo-query
- In-app notifications created for all affected farmers
- Email alerts sent to affected farmers (if alerts enabled)
- `screeningRequired` evaluated (see Section 8)
- Audit log: `report.create`

**Who can see:** Walker (own report), farmers (if not `screeningRequired`), admin

**Next states:** `claimed` (farmer claims), `archived` (admin), `deleted` (admin)

---

### 5.2 State: `claimed`

**Trigger:** `claimReport()` or `claimReportForFarmer()` called

**Actions at this point:**
- `claimedByFarmerIds` array updated to include new claimant
- `claimedAt` set on first claim
- Walker notified: `report_claimed` (in-app + email)
- System comment written to report
- Audit log: `report.claim`

**Multiple claimants:** Multiple farmers can claim the same report if their farm zones overlap.

**Unclaim:** Farmer can remove themselves via `unclaimReport()`. If last claimant removed, status reverts to `reported`.

**Who can see:** Walker (status only), farmers, admin

**Next states:** `reported` (all unclaim), `resolved` (farmer/admin resolves), `escalated` (admin), `archived` (admin), `deleted` (admin)

---

### 5.3 State: `resolved`

**Trigger:** `resolveReport()` called by farmer or admin

**Actions at this point:**
- `resolutionReason` stored
- `resolvedAt` set
- Walker notified: `report_resolved`
- Audit log: `report.resolve`

**Resolution reasons:**
- `resolved` — Issue dealt with
- `resolved_nothing_to_do` — Investigated; no action needed
- `resolved_insufficient_information` — Report lacked enough detail to act
- `resolved_invalid` — Report not valid or duplicate

**Farmer reopen:** Farmer can reopen a resolved report back to `claimed` via `reopenReport()`. Not available once admin marks `complete`.

**Who can see:** Walker (status only), farmers, admin

**Next states:** `claimed` (farmer reopens), `complete` (admin marks complete), `escalated` (admin), `archived` (admin), `deleted` (admin)

---

### 5.4 State: `escalated`

**Trigger:** `escalateReport()` called by admin

**Actions at this point:**
- `status → escalated`
- `escalatedBy` and `escalatedAt` recorded
- Farmers do NOT see this status — their view still shows `claimed` or `resolved` (last farmer-level status)
- Audit log: `report.escalate`

**Who can see:** Admin only

**Next states:** `complete` (admin marks complete), `archived` (admin), `deleted` (admin)

---

### 5.5 State: `complete`

**Trigger:** `markReportComplete()` called by admin

**Actions at this point:**
- `adminNotes` stored
- `completedBy` and `completedAt` recorded
- Walker notified: `report_complete`
- Audit log: `report.complete`

**Farmer lock:** Farmers cannot reopen a `complete` report. They see the completed status and can send a message to admin requesting reopen.

**Admin revert:** Admin can set status back to `reported` to allow re-engagement. This clears `completedBy` and `completedAt`.

**Who can see:** All roles

**Next states:** `reported` (admin reverts), `archived` (admin), `deleted` (admin)

---

### 5.6 State: `archived`

**Trigger:** `archiveReport()` or `batchArchiveReports()` called by admin

**Actions at this point:**
- `archived = true` set
- Report hidden from all active views
- Audit log: `report.archive`

**Who can see:** Admin only (archived filter in reports view)

**Next states:** active (admin unarchive), `deleted` (admin)

---

### 5.7 State: `deleted`

**Trigger:** `deleteReport()` or `batchDeleteReports()` called by admin

**Actions at this point:**
- Hard delete from Supabase
- Removed from local Zustand store
- Audit log: `report.delete`

**This action is irreversible.**

---

## SECTION 6 — NOTIFICATION LOGIC

### 6.1 Farmer Notifications (new report)

- Triggered on report submit
- Targets: all farmer user IDs in `affectedFarmerIds[]`
- In-app: `createNotificationsForFarmers()` inserts rows into `notifications` table
- Email: `POST /api/send-notification-email` with `type = new_report` for each farmer
- Email sent only if `user_profiles.email_alerts_enabled = true` for that farmer
- In-app badge shown in FarmerDashboard notification bell
- Notification read tracking via `read_at` timestamp

### 6.2 Walker Notifications (status changes)

Walker notifications sent by `notifyWalker()` on three events:
- `report_claimed`: when a farmer claims the report
- `report_resolved`: when a farmer or admin resolves the report
- `report_complete`: when admin marks the report complete

Each event:
- Inserts row into `notifications` table for the walker's user ID
- Fires `POST /api/send-notification-email` (email sent only if walker has `email_alerts_enabled = true`)
- Walker sees notification in their inbox

### 6.3 Thank You Notifications

- Triggered when farmer taps "Thank You" on a claimed report
- `sendThankYouMessage()` called with optional message text
- Inserts `thank_you` notification row for the walker
- Walker sees it in their "Messages" section

### 6.4 Proximity Logic

- `affectedFarmIds` computed client-side at report submit time
- `isReportNearFarm()` checks each farm: iterates all fields; tests if point is inside polygon or within `alertBufferMeters` of any polygon edge
- Haversine formula used for distance calculation (Earth radius 6,371,000m)
- Ray-casting algorithm for point-in-polygon test
- Only farms with at least one field are included in the proximity check

### 6.5 Per-Type Notification Preferences

Users control which notification types they receive via `NotificationPrefsPanel`. Preferences are stored in `user_profiles.notification_preferences` (JSONB, migration 031) with the following structure:

```json
{
  "email_alerts": false,
  "in_app_claimed": true,
  "in_app_resolved": true,
  "in_app_thankyou": true,
  "in_app_new_report": true
}
```

**Walker preferences:**
| Toggle | Key | Description |
|---|---|---|
| Email alerts | `email_alerts` | Receives email on claim/resolve/complete |
| Report claimed | `in_app_claimed` | In-app notification when farmer claims |
| Report resolved | `in_app_resolved` | In-app notification on resolve |
| Thank you messages | `in_app_thankyou` | In-app notification on thank-you |

**Farmer preferences:**
| Toggle | Key | Description |
|---|---|---|
| Email alerts | `email_alerts` | Receives email on new nearby report |
| New reports nearby | `in_app_new_report` | In-app badge/alert on new nearby report |

Preferences are saved immediately on toggle (no Save button required). "✓ Saved" confirmation shown for 2 seconds.

`fetchNotificationPreferences(userId)` merges the JSONB column with `DEFAULT_NOTIFICATION_PREFS` defaults — missing keys always fall back safely.

---

### 6.6 Category Subscription Rules

`getEffectiveSubscription(category, farm)` logic:

1. If `category.subscriptionMode === 'compulsory'`: always `true`
2. If `farm.categorySubscriptions[category.id]` is explicitly set: use that boolean
3. Otherwise: return `true` if `default_on`, `false` if `default_off`

Field-level subscriptions override farm-level for that specific field's reports.

---

## SECTION 7 — OFFLINE MODE

### 7.1 Offline Capabilities

When the device has no internet connection:
- Walker can still create and save reports
- All data entry available: category, conditions, count, description, photos
- Photos stored as base64 data URLs (not uploaded to Supabase Storage)
- Report saved to IndexedDB (browser local database)
- Map may not load tiles (depends on cached tiles from previous sessions)
- Cannot submit to Supabase; cannot receive notifications

### 7.2 Local Storage

- IndexedDB database name: `lbp-offline`
- Object store: `pending-reports`
- Key path: `id`
- Schema: `OfflineReport` interface (`id`, `latitude`, `longitude`, `timestamp`, `categoryId`, `categoryName`, `categoryEmoji`, `condition`, `sheepCount`, `description`, `photoDataUrls[]`, `synced`, `createdAt`)
- Functions: `saveOfflineReport()`, `getPendingReports()`, `markReportSynced()`, `deleteOfflineReport()`, `getPendingCount()`

### 7.3 Sync Logic

Sync is triggered in two ways:

**Manual sync** — Walker taps "Upload now" or "Retry" on the `OfflineSyncBanner`:
- Session is refreshed via `supabase.auth.refreshSession()` first (see Section 7.4)
- `getPendingReports()` returns all records with `synced = false`
- For each: `createReportInSupabase()` called with location, category, conditions, count, and description
- On success: `markReportSynced(id)` in IndexedDB; report added to Zustand store
- **Note:** Photos are stored as base64 data URLs in IndexedDB and are NOT uploaded to Supabase Storage on sync (known limitation — photos appear as empty `[]` in the synced report)

**Automatic on startup** (`loadReports()`):
- `fetchAllReports()` from Supabase
- Any local Zustand store reports with non-UUID IDs (pre-Supabase records) are detected as orphaned
- Each orphaned record: `createReportInSupabase()` called
- After sync, full report list re-fetched and set in store

### 7.4 Failure Handling

**Auth token expiry (most common failure cause):**
- Supabase JWTs are valid for 1 hour. If the device is offline longer than 1 hour, the token expires
- When back online, `autoRefreshToken` is async — there is a race condition where the sync fires before the token refreshes, causing 401 errors
- **Fix implemented:** `handleSync` in `OfflineSyncBanner` calls `supabase.auth.getSession()` then `supabase.auth.refreshSession()` before any INSERT attempts. If refresh fails, sync bails immediately with a clear error: "Session expired — please reload the app and try again"
- This error is shown in the banner UI as a specific string (`sync.authError`) rather than a generic count

**Other failures:**
- If Supabase write fails for any other reason: report stays in IndexedDB with `synced = false`
- The actual error message is captured from the Supabase error object and shown in monospace below the retry button (for diagnostics)
- On next manual or startup sync: retry attempted automatically
- No maximum retry limit (retried every time sync runs)
- Sync failures do not block the UI — each report failure is caught individually
- `OfflineSyncBanner` shows pending count and a separate failed count if sync partially succeeds

---

## SECTION 8 — ADMIN CONTROL

### 8.1 Screening Queue (`screening_required`)

`screening_required = true` is automatically set when **any** of these conditions are true:

1. `metadataCompletenessScore < 0.4` (insufficient metadata to trust the report)
2. `has_image = true AND has_exif_location = false` (image present but GPS stripped — possible tampering)
3. Report GPS location is NOT within any farm's alert buffer (`affectedFarmIds[]` is empty — report filed far from all registered farms)

**When `screening_required = true`:**
- Report is **invisible to farmers** (enforced at RLS level, not just UI)
- Report appears in admin dashboard "Needs Review" queue with a badge count
- Admin can: Approve (`screening_required → false`; farmers can now see it), Edit/annotate, or Delete
- Each action is written to `audit_logs`

### 8.2 Editable vs Locked Fields

| Field | Admin editable | Notes |
|---|---|---|
| `description` | Yes | |
| `conditions` | Yes | |
| `sheepCount` | Yes | |
| `status` | Yes | Any transition |
| `adminNotes` | Yes | |
| `resolutionReason` | Yes | |
| `photoUrls` | Yes (delete) | Cannot re-upload for other users |
| `screeningRequired` | Yes (approve only) | Set `false` via `approveReportScreening()` |
| `location` | No | Fixed at submit time |
| `timestamp` | No | Fixed at submit time |
| `submittedByUserName` | No | Immutable audit record |
| `reporterId` | No | Immutable audit record |
| `id` | No | |

### 8.3 Bulk Operations

- Select reports via checkboxes in the reports list
- **"Archive selected":** `batchArchiveReports(ids)` — sets `archived = true` for all; persisted to Supabase
- **"Delete selected":** `batchDeleteReports(ids)` — hard deletes all from Supabase and store
- No undo for bulk delete

### 8.4 Admin Image Management

- Admin/super_admin can delete individual photos from a report
- Deletion removes the URL from `report_images` table and `photo_urls[]` array
- Action logged in `audit_logs`: `report.photo_delete`

### 8.5 Duplicate Detection

- System flags reports as potential duplicates if: same location (within ~50m) + unclaimed/unresolved + submitted within the same hour
- Flagged with a "Duplicate?" badge in admin and farmer views
- Does NOT auto-merge or auto-delete — admin decides
- Admin can delete the duplicate or archive it

### 8.6 Audit Log

All significant actions write to `audit_logs`:
- Actor ID, action name, entity type, entity ID, timestamp, detail JSON
- Extended fields (migration 029): `ip_address`, `user_agent`, `request_path`
- **Client-side writes:** `writeAuditLog()` in `src/lib/audit.ts` → POSTs to `/api/audit` (validates `actorId` matches session)
- **Server-side writes:** `writeAuditLogServer()` in API routes (direct service role write)
- All writes are fire-and-forget (non-blocking)
- **Error logging:** `writeErrorLog()` in `src/lib/error-log.ts` → POSTs to `/api/errors`

---

## SECTION 9 — EDGE CASES

### 9.1 Duplicate Reports

- System flags but does not auto-resolve
- Admin decides: delete duplicate, archive, or merge manually
- Duplicate badge shown in both admin and farmer views
- Duplicate detection window: same location within ~50m, same hour, unclaimed/unresolved status

### 9.2 Multiple Claims

- Multiple farmers can claim the same report simultaneously
- Each farmer sees only their own activity and the original report content
- Other farmers' activity (comments, messages) is hidden between farmers
- If one farmer resolves, the report moves to `resolved` for all parties
- Any claiming farmer can reopen a resolved report (returns to `claimed` for all)

### 9.3 Unclaimed Reports

- Reports remain in `reported` status indefinitely if unclaimed
- No automatic expiry or reminder currently implemented
- Admin can manually archive old unclaimed reports
- `sortBy = daysUnclaimed` in admin view helps surface stale reports

### 9.4 Admin Overrides

- Admin can change any report status directly regardless of current state
- Admin can reassign a report from one farmer to another
- Admin can unilaterally resolve or complete without farmer involvement
- Admin can revert `complete` back to `reported` to re-engage a farmer

### 9.5 Missing Data

- Guest reports (no `reporterId`): cannot receive walker notifications; cannot be edited
- Reports with no photos: no screening penalty for missing photos; only triggered if `has_image = true` but no GPS
- Reports with no `affectedFarmIds`: appear in screening queue (no farms nearby)
- Offline reports synced without photos: photos stored as base64 in IndexedDB; converted on sync

### 9.6 Sync Failures

- Supabase write fails on report submit: report stays in local Zustand store; retry on next `loadReports()`
- Batch operation partial failure: error logged to `error_logs`; already-persisted items remain persisted
- Farm/field CRUD failures: optimistic update already shown; `console.error` logged; Supabase may be out of sync until next page load

### 9.7 User Deletion with Active Reports

- Deleting a user removes their auth record and `user_profiles` row
- `submitted_by_user_name` is denormalised on the report row — report history is preserved
- `reporterId` foreign key is not enforced at DB level for reports — orphaned references are benign
- Farms belonging to deleted farmer are deleted (cascade via `deleteFarmInSupabase`)

### 9.8 Farmer Accessing a Complete Report

- Farmer can view a `complete` report
- Farmer cannot reopen it
- Farmer sees a "Request Reopen" option that sends a message to admin
- Admin can revert to `reported` via the report detail panel

---

## SECTION 10 — TEST PLAN

### 10.1 Walker Tests

| ID | Category | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| W01 | Reporting | Online report with location | Open app as walker; tap + FAB; use my location; select Sheep; select Healthy; count 3; add description; submit | Report created in Supabase; success banner shown; appears in My Reports with status `reported` |
| W02 | Reporting | Guest report (not signed in) | Open app without signing in; complete report flow; enter guest name/email; submit | Report saved with null `reporterId`; no walker notification sent |
| W03 | Reporting | Photo upload (camera) | Step 3 of reporting; tap Camera button; take photo; confirm | Photo uploaded to Supabase Storage; URL added to `photoUrls`; submit button stays disabled until upload complete |
| W04 | Reporting | Photo upload (gallery) | Step 3 of reporting; tap Library button; select existing photo | Same as W03 |
| W05 | Reporting | Duplicate warning | Submit report near an existing unclaimed report (within 50m, within 1 hour) | Duplicate warning shown; walker can proceed or cancel |
| W06 | Edit report | Edit own reported report | Navigate to My Reports; tap Edit on a `reported` report; change description; save | Changes saved in Supabase; card updates immediately |
| W07 | Edit report | Edit own claimed report | Same as W06 but report is in `claimed` status | Edit allowed; changes saved |
| W08 | Edit report | Edit blocked on complete | Navigate to My Reports; open a `complete` report | No Edit button shown |
| W09 | Offline | Save offline report | Turn off wifi/mobile; open app; tap + FAB; fill report; save | Report saved to IndexedDB; offline banner shows 1 pending |
| W10 | Offline | Sync pending report | Save offline report; turn wifi back on; tap Sync now | Report submitted to Supabase; pending count returns to 0 |
| W11 | Notifications | Receive claimed notification | Submit report; have a farmer claim it | In-app notification appears in walker inbox; badge count shows 1 |
| W12 | Notifications | Receive resolved notification | Have farmer resolve a claimed report | Notification shown with resolved status |
| W13 | Notifications | Email alert toggle | Open notifications view; toggle email alerts off; have a farmer claim a report | No email received |
| W14 | Category | Default category | Set a personal default category in settings; open reporting flow | Category picker starts on selected default |
| W15 | PWA | Install prompt | Open site on mobile; wait for install banner | PWA install banner appears; can be installed to home screen |
| W16 | Notification prefs | Toggle in-app claimed off | Open notification settings; disable "Report claimed" toggle | Toggle state saved immediately; "✓ Saved" flash shown; preference persists on next load |
| W17 | Notification prefs | Toggle email alerts off | Open notification settings; disable "Email alerts" | `email_alerts: false` in `notification_preferences` JSONB; no email sent on next claim |
| W18 | Offline sync | Sync after JWT expiry | Save offline report; wait >1h (or simulate); return online; tap Retry | Session refreshed automatically; report uploads; pending count returns to 0 |
| W19 | Offline i18n | Offline Capture in Welsh | Switch language to Welsh; tap + (offline); open OfflineCapture | All strings shown in Welsh (header, step labels, buttons, error messages) |

### 10.2 Farmer Tests

| ID | Category | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| F01 | Registration | Complete 5-step registration | Sign up as farmer; complete all 5 steps | Farm created; farmer on dashboard |
| F02 | Farm | Create farm | Tap Add Farm; enter name; set buffer 500m; save | Farm appears in list; fields view opens |
| F03 | Field | Draw field polygon | Open farm; Add Field; tap 4 points on map; name field; save | Field polygon drawn; saved to Supabase |
| F04 | Field | Drag fence post | Open existing field; drag a fence post to new position | Polygon updates; saved on Save |
| F05 | Claim | Claim in-proximity report | Report exists within farm alert zone; open report; tap Claim | Report status → `claimed`; walker notified |
| F06 | Claim | Cannot claim out-of-zone report | Report exists far outside farm alert zone | Claim button not shown or disabled |
| F07 | Unclaim | Unclaim own claim | Claim a report; tap Unclaim | Farmer removed from `claimedByFarmerIds`; if last claimant, status → `reported` |
| F08 | Resolve | Resolve with reason | Claim a report; tap Resolve; select reason; confirm | Status → `resolved`; reason stored; walker notified |
| F09 | Reopen | Reopen resolved report | Resolve a report; tap Reopen | Status → `claimed` |
| F10 | Reopen | Cannot reopen complete | Admin marks report complete; farmer views it | No Reopen button; Request Reopen option shown |
| F11 | Flag | Flag to admin | Open claimed report; tap Flag; enter note; submit | `farmerFlagNote` saved; report highlighted in admin |
| F12 | Thank You | Send thank you | Open claimed report; tap Thank You; enter message; send | Walker receives `thank_you` notification |
| F13 | Subscriptions | Opt out of category | Open farm settings; toggle off a `default_on` category | Farm no longer receives alerts for that category |
| F14 | Screening | Cannot see screened report | Report is submitted with no nearby farms | Report does not appear in farmer's list |
| F15 | Notification prefs | Disable in_app_new_report | Open notification settings; disable "New reports nearby" | Toggle saved; `in_app_new_report: false` in JSONB |
| F16 | Notification prefs | Email alerts persists | Toggle email alerts on; reload page | Email alerts toggle still on; reads from DB |
| F17 | Thank You on resolved | Send thank you from resolved report | Resolve a report; view it in resolved section; tap Thank You; send message | Walker receives `thank_you` notification; "✓ Sent" label appears |

### 10.3 Admin Tests

| ID | Category | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| A01 | Overview | Screening queue badge | Submit report with no nearby farms | "Needs Review" badge shows in admin overview |
| A02 | Screening | Approve screened report | Open screening queue; select report; tap Approve | `screening_required → false`; report appears in farmer list |
| A03 | Reports | Filter by status | Open Reports tab; set status filter to `escalated` | Only escalated reports shown |
| A04 | Reports | Filter by date range | Set date from/to filter | Only reports within date range shown |
| A05 | Reports | Filter by keyword | Enter a report ID or description keyword | Matching reports shown |
| A06 | Reports | Sort by days unclaimed | Set sort to `daysUnclaimed` | Reports sorted oldest unclaimed first |
| A07 | Report detail | View submitter identity | Open report detail | `submitted_by_user_name` and `roleOfSubmitter` visible |
| A08 | Report detail | Add admin comment | Open report; type comment; submit | Comment saved; appears in comments list |
| A09 | Report detail | Escalate | Open report; tap Escalate | Status → `escalated`; farmer does not see change |
| A10 | Report detail | Mark complete | Open escalated/resolved report; tap Complete; add notes | Status → `complete`; `adminNotes` saved; walker notified |
| A11 | Report detail | Revert complete | Open complete report; tap Revert to Reported | Status → `reported`; `completedBy` cleared |
| A12 | Report detail | Reassign to farmer | Open report; tap Reassign; select farmer | `claimedByFarmerIds` updated; walker notified |
| A13 | Bulk | Archive multiple | Select 5 reports; tap Archive selected | All 5 archived; hidden from active view |
| A14 | Bulk | Delete multiple | Select 3 reports; tap Delete selected | All 3 hard-deleted from Supabase |
| A15 | Invite | Invite walker | Open Walkers tab; tap Invite; enter email; send | Invite email sent; user appears with `invited` status |
| A16 | Invite | Invite farmer | Open Farmers tab; tap Invite; enter email; send | Same as A15 |
| A17 | User | Suspend user | Open user detail; tap Suspend | User status → `suspended`; cannot sign in |
| A18 | User | Delete user | Open user detail; tap Delete; confirm | User removed from auth and `user_profiles`; farms deleted; reports retained |
| A19 | Category | Create category | Open Categories; tap Create; fill fields; save | Category appears in list; available in reporting flow |
| A20 | Category | Set system default | Open category; tap Set as Default | `is_system_default` set; walker reporting flow uses this category by default |
| A21 | Audit | View audit log | Open Audit Log tab | All system actions shown in chronological order |
| A22 | Photos | Delete photo | Open report; tap × on a photo | Photo URL removed from report; storage file deleted |
| A23 | Filter | Reporter/walker dropdown | Open Reports tab; select a specific walker from "All Reporters" dropdown | Only reports submitted by that walker shown |
| A24 | Filter | Clear all filters | Set status, date, keyword, and reporter filters; tap Clear | All filters reset; full unfiltered report list shown |
| A25 | Report detail | GPS mini-map in panel | Open any report detail panel | Mini-map renders centred on report GPS coordinates with a marker |
| A26 | Report detail | Notification history | Open report detail panel; scroll to Notification History | All `notifications` table rows for this report shown with recipient, type, sent time, and read status |
| A27 | Report detail | Audit trail | Open report detail panel; scroll to Action History | All `audit_logs` entries for this report shown in chronological order |

### 10.4 System Tests

| ID | Category | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| S01 | Auth | Persistent login | Sign in; close tab; reopen | Still signed in (session restored from `lbp-auth` localStorage) |
| S02 | Auth | Forgot password | Tap Forgot password; enter email; submit | Reset email sent; `/auth/reset-password` flow works |
| S03 | Translation | Language switch | Switch language to Welsh (cy) | Category names, conditions, UI strings shown in Welsh |
| S04 | Translation | Cache invalidation | Bump translation cache to `v9`; reload | Browser fetches fresh translations from Supabase |
| S05 | RLS | Walker cannot see other's reports | Sign in as walkerA; check if walkerB's reports are visible | walkerB's reports not returned |
| S06 | RLS | Farmer cannot see screened report | Submit screened report; sign in as farmer | Screened report not in farmer's list |
| S07 | RLS | `submittedByUserName` hidden | Sign in as farmer; fetch report | `submittedByUserName` not included in response |
| S08 | Geo | Alert buffer computed correctly | Submit report exactly at field boundary | Report matches the farm if within `alertBufferMeters` |
| S09 | Geo | Report outside all farms | Submit report in open countryside | `affectedFarmIds = []`; `screening_required = true` |
| S10 | Notifications | Email alert on new report | Submit report near farmer with `email_alerts_enabled = true` | Farmer receives email within 30 seconds |
| S11 | PWA | Service worker | Install PWA; go offline; reopen | App shell loads from cache; map tiles may be stale |
| S12 | Offline | IndexedDB persistence | Save offline report; close browser; reopen | Pending report still in IndexedDB; pending count shown |
| S13 | Offline | Offline Capture fully translated | Switch to Welsh; go offline; open OfflineCapture overlay | All 4 steps (location, photo, details, saved) rendered in Welsh |
| S14 | Offline sync | Auth error on expired JWT | Save offline report; simulate expired JWT (clear session); tap Retry | "Session expired — please reload the app and try again" message shown in banner |
| S15 | Notification prefs | Migration 031 column exists | Check `user_profiles` table in Supabase | `notification_preferences` JSONB column present with default `{"email_alerts":false,"in_app_claimed":true,...}` |
| S16 | Translation | Cache version | Hard-refresh browser; check localStorage | Keys prefixed `translations_v16_en` etc.; no stale v13/v14/v15 keys |

---

## SECTION 11 — MOBILE VS WEB

### 11.1 Layout Differences

| Feature | Mobile | Web/Desktop |
|---|---|---|
| Walker navigation | Bottom tab bar (Map / + FAB / Mine) | Same bottom tab bar |
| Admin navigation | Top nav tabs + hamburger menu | Horizontal top tabs |
| Farmer navigation | Static full-width button layout (not yet bottom-tab-bar) | Same |
| Map | Full-width, touch gestures | Full-width, mouse gestures |
| Report flow | Full-screen modal per step | Full-screen modal per step |
| Category picker | Scrollable vertical list | Scrollable vertical list |
| Photo upload | Two explicit buttons: Camera (`capture=environment`) and Library | Library only on desktop (no camera) |

### 11.2 Behaviour Differences

| Feature | Mobile | Web/Desktop |
|---|---|---|
| GPS accuracy | Device GPS (often 3–15m accuracy) | IP/WiFi geolocation (often 100–1,000m) |
| Camera access | Native camera via `input capture=environment` | Not applicable |
| PWA install | Home screen install via browser prompt | Desktop app install via browser |
| Offline mode | Full IndexedDB support | Full IndexedDB support |
| Service worker | Network-first with cache fallback | Same |
| Touch map | Touch drag and pinch-zoom | Mouse drag and scroll-zoom |
| Fence post dragging | Touch drag on fence posts | Mouse drag on fence posts |
| Keyboard | Mobile keyboard auto-opens on text inputs | Desktop keyboard |
| Safe area | `pb-24` bottom padding for tab bar | Not required |

### 11.3 Current Limitations

- **Farmer dashboard mobile menu** (PPAP Req 11): FarmerDashboard uses static full-width button layout with a BottomNav for Dashboard / Farms / Alerts / Profile; full bottom-tab-bar UX matching WalkerDashboard not yet implemented
- **Video upload** (PPAP Req 12 — deferred): Not supported. Would require: Supabase Storage policy update (increase file size limit), `video/mp4` MIME type in PhotoUpload validator, thumbnail generation (server-side or client canvas), and a VideoPlayer component alongside PhotoGallery
- **Offline photo sync** (known limitation): Photos taken during offline capture are stored as base64 data URLs in IndexedDB but are NOT uploaded to Supabase Storage when the report syncs. Synced reports appear with `photoUrls = []`
- **Thank-you sent state** (known limitation): The "✓ Sent" indicator on thank-you messages is local React state only — it resets on page reload. No DB query is made to check if a thank-you was already sent on mount

**Completed since initial spec:**
- ~~Admin report detail panel (WS5)~~ — GPS mini-map, notification history, audit trail all complete
- ~~Admin report filters (WS6)~~ — Date range, keyword, and reporter/walker dropdown all complete
- ~~Farmer→Walker Thank You (WS7)~~ — Available on both claimed and resolved reports
- ~~Notification preferences UI (PPAP Req 5)~~ — Per-type toggles (NotificationPrefsPanel) for both roles, backed by `notification_preferences JSONB` (migration 031)

---

## SECTION 12 — FAQ — STEP-BY-STEP GUIDES

The FAQ is available at `/faq` and is accessible from the landing page footer. It is an accordion-style page structured into two sections: For Walkers and For Farmers. Every question uses `t()` with English fallbacks — Welsh, Irish, and Scottish Gaelic translations can be seeded to the `translations` table using the `faq.*` namespace keys.

---

### 12.1 For Walkers

#### How do I submit a report?
1. Open the app.
2. Tap the **+** button at the bottom of the screen.
3. Tap **Use my location** (or pin the spot manually on the map). Tap **Confirm location**.
4. Choose a category (e.g. Sheep, Fence, Road).
5. Tick any conditions that apply, and enter a count if asked.
6. Add a short description.
7. (Optional) Tap **Camera** to take a photo, or **Library** to add an existing one. Up to 3 photos.
8. Tap **Submit Report**.

#### How do I submit without an account (guest)?
Follow the steps above without signing in. On the last step, fill in your name, email, and phone number. Tap **Submit Report**.
> As a guest you cannot edit your report or receive status updates.

#### How do I submit when I have no signal?
1. Open the app — you will see an **Offline mode** banner at the top.
2. Tap the **+** button.
3. Fill in the report as normal, including photos.
4. Tap **Save for later**. The report is saved on your device.
5. When you have signal again, open the app.
6. Tap **Sync now** on the banner. Your report is sent.

#### How do I edit a report I already submitted?
1. Tap the **Mine** tab at the bottom of the screen.
2. Find the report you want to change.
3. Tap **Edit** on the report card. (No Edit button = report is resolved or completed and cannot be changed.)
4. Update the description, count, conditions, or add photos.
5. Tap **Save**.

#### How do I check the status of my report?
Tap the **Mine** tab. Each report shows a status badge: **Reported** (waiting), **Claimed** (a farmer has it), **Resolved** (farmer dealt with it), or **Complete** (closed by admin).

#### How do I read messages from farmers?
Tap the **bell** icon at the top. Your inbox shows all updates: claims, resolutions, and thank-you notes.

#### How do I turn off email alerts?
Tap the bell icon → tap the **Email alerts** toggle to switch it off. You will still see in-app notifications.

#### How do I change the language?
Open your profile menu → tap **Language** → choose English, Welsh (Cymraeg), Irish (Gaeilge), or Scottish Gaelic (Gàidhlig).

#### How do I install the app on my phone?
Open the website on your phone's browser. Wait for the **Install** prompt (or tap the browser's **Add to Home Screen** option). Tap **Install**.

---

### 12.2 For Farmers

#### How do I sign up as a farmer?
1. Go to the sign-up page and choose **Farmer**.
2. Step 1: Enter your name, email, and phone number.
3. Step 2: Enter your billing address.
4. Step 3: Pin your farm's main location on the map.
5. Step 4: Create your first farm — give it a name and set the alert buffer.
6. Step 5: Set up your subscription. Your 30-day free trial starts immediately.

#### How do I add another farm?
Open your dashboard → tap **Add Farm** → enter the farm name → set the alert buffer using the slider (default 500m) → tap **Save**.

#### How do I draw a field?
1. Open the farm → tap **Add Field**.
2. Tap points on the map to place fence posts (minimum 3).
3. To adjust, drag any fence post to a new spot.
4. Enter the field name and (optional) sheep count.
5. Tap **Save Field**.

#### How do I change my alert buffer?
Open your farm settings → drag the **Alert buffer** slider (100m–10km) → tap **Save**.
> A wider buffer catches more reports but also more reports from outside your land.

#### How do I claim a report?
Open the report from your dashboard → tap **Claim** (or **Claim with message** to add a note for the walker). The walker is automatically notified.

#### How do I resolve a report?
1. Open the claimed report → tap **Resolve**.
2. Choose a reason: Resolved / Resolved — Nothing to do / Resolved — Insufficient information / Resolved — Invalid report.
3. (Optional) Add a message for the walker.
4. Tap **Confirm**.

#### How do I unclaim a report?
Open the report → tap **Unclaim**. If no other farmer has claimed it, the report goes back to **Reported**.

#### How do I reopen a resolved report?
Open the resolved report → tap **Reopen**. The report goes back to **Claimed**.
> If the report has been marked **Complete** by an admin, you cannot reopen it yourself — tap **Request Reopen** to message the admin.

#### How do I send a thank-you to the walker?
Open a claimed report → tap **Thank You** → type a short message → tap **Send**.

#### How do I flag a report to admin?
Open the report → tap **Flag to Admin** → type a note → tap **Submit**.

#### How do I turn off alerts for a category?
- **At farm level:** open farm settings → find the category → tap the toggle.
- **At field level (overrides farm setting):** open the field → tap **Category subscriptions** → toggle each category on or off for that field only.
> Some categories marked **Compulsory** cannot be turned off.

#### How do I turn off email alerts?
Open your profile menu → tap **Notification settings** → toggle **Email alerts** off.

#### How do I cancel my subscription?
Open your profile menu → tap **Subscription** → tap **Cancel subscription** → confirm.

#### How do I delete a field?
Open the field → tap **Delete field** → confirm.

#### How do I delete a farm?
Open the farm → tap **Delete farm** → confirm. All fields under that farm are also deleted.

---

### 12.3 Translation Keys (namespace: `faq`)

The FAQ page uses the following translation key pattern. All keys fall back to English if no DB translation exists.

| Key pattern | Example |
|---|---|
| `faq.section.walkers` | "For Walkers" |
| `faq.section.farmers` | "For Farmers" |
| `faq.walker.submit.q` | Question text |
| `faq.walker.submit.s1` … `s8` | Step text |
| `faq.walker.{topic}.note` | Optional note text |
| `faq.farmer.{topic}.q` | Question text |
| `faq.farmer.{topic}.s1` … `sN` | Step text |
| `faq.farmer.{topic}.note` | Optional note text |
| `faq.title`, `faq.subtitle`, `faq.eyebrow` | Page header |
| `faq.chat.title`, `faq.chat.subtitle` | Chat CTA block |

Seed these keys to the `translations` table using the standard Python seed script to enable Welsh, Irish, and Gaelic translations.

---

## SECTION 13 — AI HELP CHATBOT

### 13.1 Overview

A floating AI chat assistant is embedded on every page of the app (landing page, FAQ, all dashboards). It answers questions about the platform in any language the user writes in — English, Welsh, Irish, Scottish Gaelic, or any other language.

- **Widget:** bottom-right floating button (purple circle, sheep icon)
- **Opens:** a 340px chat panel above the button
- **Model:** `claude-haiku-4-5-20251001` (fast, low-cost)
- **API route:** `POST /api/chat-help`
- **Component:** `src/components/HelpChatbot.tsx`

### 13.2 Language Behaviour

The chatbot automatically responds in the same language the user writes in. No configuration required. If a user writes in Welsh, it responds in Welsh. If they write in Irish, it responds in Irish.

### 13.3 Knowledge Base

The chatbot's system prompt includes:
- Full platform overview (roles, lifecycle, states)
- Full FAQ content for walkers and farmers (all questions and steps)
- Report visibility rules
- Contact email: `info@littlebopeep.app`

The system prompt uses **prompt caching** (`cache_control: ephemeral`) to reduce latency and cost on repeat queries.

### 13.4 Infrastructure Requirements

The `ANTHROPIC_API_KEY` secret must be set in Cloudflare Workers:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

This is a one-time setup. The key is never committed to the repo.

### 13.5 Limits and Behaviour

| Property | Value |
|---|---|
| Max input length | 1,000 characters |
| Max response tokens | 600 |
| Conversation history passed | Last 10 messages |
| Streaming | Yes (text streams token by token) |
| Rate limiting | None (add if abuse observed) |
| Fallback on error | Shows "Sorry, something went wrong. Please try again." |

### 13.6 What It Will Not Do

- Access live report data (no database connection)
- Take actions (cannot submit reports, claim, resolve etc.)
- Access user account information
- Provide legal, veterinary, or official advice

For anything beyond FAQ help, the bot directs users to `info@littlebopeep.app`.

### 13.7 Translation Keys (namespace: `chat`)

| Key | English fallback |
|---|---|
| `chat.greeting` | "Hi! I'm the Little Bo Peep help assistant. Ask me anything about using the app — I can answer in any language." |
| `chat.title` | "Help Assistant" |
| `chat.subtitle` | "Ask anything, any language" |
| `chat.placeholder` | "Ask a question…" |
| `chat.send` | "Send" |
| `chat.open` | "Open help chat" |
| `chat.close` | "Close help chat" |
| `chat.error` | "Sorry, something went wrong. Please try again." |
| `chat.poweredBy` | "Powered by AI · Not a substitute for official advice" |

---

---

## SECTION 14 — RECENT CHANGES LOG

| Date | Change | Details |
|---|---|---|
| 26 Apr 2026 | WS5 confirmed complete | Admin report detail panel: GPS mini-map, notification history, and audit trail all verified present |
| 26 Apr 2026 | WS6 complete | Admin report filter: reporter/walker dropdown added (filters by `reporterId`). Date range and keyword were already implemented |
| 26 Apr 2026 | WS7 complete | Farmer Thank You button and compose form added to resolved reports section (was claimed-only previously) |
| 26 Apr 2026 | PPAP Req 5 complete | `NotificationPrefsPanel` component: per-type toggles for walker (email, claimed, resolved, thankyou) and farmer (email, new_report). `notification_preferences JSONB` column added via migration 031 |
| 26 Apr 2026 | Offline sync auth fix | `OfflineSyncBanner.handleSync` now calls `supabase.auth.refreshSession()` before any inserts. Clear "Session expired" error shown if refresh fails |
| 26 Apr 2026 | OfflineCapture fully i18n'd | All 33 user-visible strings in the offline capture overlay wrapped in `t()`. 132 keys seeded (33 × en/cy/ga/gd). Cache version bumped to v16 |
| 26 Apr 2026 | Translation cache v16 | Includes: notifPrefs.* (15 keys), farmer.thankYou* (11 keys), sync.authError (1 key), offline.* (33 keys) across all 4 languages |
| 27 Apr 2026 | Email verification flow | New signups get `status = pending_verification`. Confirmation email sent by Supabase. Clicking link → `/auth/email-confirmed` → `POST /api/auth/confirm-email` → `status → active` + `email_confirmed_at` stamped. Audit events: `user.email_verification_sent` and `user.email_verified`. Migration 032 adds `email_confirmed_at TIMESTAMPTZ` to `user_profiles`. |
| 27 Apr 2026 | Admin email verification UI | `✉️ Email Pending` badge on walker and farmer rows for `pending_verification` users. **Resend ✉️** button triggers `POST /api/admin/resend-verification` (uses Supabase Admin API `generateLink`). Loading state per user. |
| 27 Apr 2026 | Auth callback updated | `/auth/callback` now detects `type=signup` or `type=email` and redirects to `/auth/email-confirmed` instead of `/auth/reset-password`. |
| 27 Apr 2026 | Walker Alerts tab | Dedicated **🔔 Alerts** tab added to walker bottom nav (logged-in only). Badge shows unread count. Auto-marks all read on open. `NotificationPrefsPanel` shown above the notification list. Matches farmer Alerts tab experience. |
| 27 Apr 2026 | Generic countryside copy | Removed sheep-specific language from reporting UI: tips now generic, map legend changed to "Recent reports (last 12h)", photo caption updated, description placeholder updated. DB translations updated (migration 033 / direct upsert). |
| 27 Apr 2026 | Quantity input simplified | Removed 1–10 quick-pick button grid from the report form. Only the +/− stepper + numeric input remains. |
| 27 Apr 2026 | Offline photo upload on sync | `dataUrlToFile()` + `uploadPhotoFromDataUrl()` added to `photo-upload.ts`. `OfflineSyncBanner` now uploads base64 photos to Supabase Storage before creating the report. |
| 27 Apr 2026 | cy/ga/gd translations | 8 missing keys (sync.signIn*, offline.notSignedIn, walker.nav.alerts, walker.alerts, walker.notif.*, home.landing.aboutUs) translated into Welsh, Irish, and Scottish Gaelic via `scripts/seed-missing-translations.mjs`. |
| 27 Apr 2026 | Outstanding features audit | Verified WS5 (admin detail panel), WS6 (admin filters), WS7 (thank-you messaging), PPAP Req 5 (notification prefs), PPAP Req 11 (farmer bottom nav) all fully implemented. Section 15 updated to show completed status. |
| 28 Apr 2026 | PWA app icon badge + Web Push (#4) | Badge API: `useAppBadge` hook syncs unread count to installed PWA home screen icon (Android Chrome 81+, iOS 16.4+, macOS Safari 17+). Web Push: `push-sender.ts` implements RFC 8291 aesgcm encryption + RFC 8292 VAPID JWT using pure Web Crypto API (Cloudflare Workers compatible). `PushPermissionBanner` shown in Alerts tab for opt-in. `createWalkerNotification` and `sendThankYouMessage` fire push via `/api/push/send`. Service worker handles `push` event and `notificationclick`. Push subscriptions stored in `push_subscriptions` table (migration 034). VAPID keys: P-256 pair, private key stored as Cloudflare Worker secret. |
| 28 Apr 2026 | Bug fixes: home logout, chat z-index, offline sync null ID | Header logo tap no longer clears user role — logged-in users land on home page with "Report" (primary) + "Go to dashboard →" (secondary) CTAs. Chat FAB lifted above BottomNav on mobile (`bottom-24` / `sm:bottom-6`). Offline sync now generates `crypto.randomUUID()` client-side before INSERT, fixing `null value in column "id"` constraint error. |
| 28 Apr 2026 | Offline capture metadata (migration 035) | `captured_offline BOOLEAN`, `device_id TEXT`, `user_agent TEXT` added to `sheep_reports`. Device UUID generated once in `localStorage` (`lbp-device-id`) and persisted across sessions. `navigator.userAgent` and device type captured at field save time (not sync time). Admin list shows `📡 Offline` badge; detail panel shows split "Captured in field" / "Uploaded" timestamps plus full Device & Submission section. Walker My Reports view shows `📡` badge on synced offline reports. SQL: migration 035 run 28 Apr 2026. |

---

## SECTION 15 — OUTSTANDING FEATURES

Features that have been specced, discussed, or partially built but not yet complete as of the dates shown.

### ✅ Completed (previously listed as outstanding)

| # | Item | Completed | Detail |
|---|---|---|---|
| 1 | **Migration 032 applied** | 27 Apr 2026 | `email_confirmed_at TIMESTAMPTZ` added to `user_profiles`. Back-fill applied. Partial index created. |
| 2 | **Supabase Auth "Confirm email" disabled** | 27 Apr 2026 | Users can sign in immediately. Confirmation email is cosmetic / trust signal only. |
| 5 | **Offline photo upload on sync** | 27 Apr 2026 | `dataUrlToFile()` + `uploadPhotoFromDataUrl()` in `photo-upload.ts`. `OfflineSyncBanner.handleSync` uploads base64 photos to Supabase Storage before `createReport()`. |
| 7 | **cy/ga/gd translations for new keys** | 27 Apr 2026 | 8 keys × 3 languages seeded via `scripts/seed-missing-translations.mjs --translate`. |
| WS5 | **Admin report detail panel** | Apr 2026 | GPS mini-map (Leaflet, report coordinates), notification history (all notifications for the report with read status), audit trail (all `report.*` events), photos, affected farms/farmers, edit controls, comments. |
| WS6 | **Admin report filter improvements** | Apr 2026 | Date range picker (from/to), reporter/walker dropdown, keyword/report ID text search, Clear button. All filter logic in `filteredReports` useMemo. |
| WS7 | **Farmer → Walker Thank You messaging** | Apr 2026 | Farmer sends from claimed/resolved report cards. Admin can send on behalf of any farmer from detail panel. Walker receives in Alerts tab with icon, sender name, message text, and report context. |
| PPAP 5 | **Notification preferences UI** | Apr 2026 | `NotificationPrefsPanel` shown in Alerts tab for both walker and farmer. Toggles: email_alerts, in_app_claimed, in_app_resolved, in_app_thankyou (walker); email_alerts, in_app_new_report (farmer). Persisted via `notification_preferences` JSONB column. |
| PPAP 11 | **Farmer dashboard mobile menu** | Apr 2026 | `BottomNav` with 4 tabs: 🏠 Dashboard, 🏡 Farms, 🔔 Alerts (with unread badge), 👤 Profile. Hidden during registration flow. |
| 4 | **PWA app icon badge + Web Push** | 28 Apr 2026 | `useAppBadge` hook syncs unread count to installed PWA home screen icon via Badge API (Android Chrome 81+, iOS 16.4+, macOS Safari 17+). `push-sender.ts` implements RFC 8291 aesgcm encryption + RFC 8292 VAPID JWT using pure Web Crypto API (Cloudflare Workers compatible, no npm deps). `PushPermissionBanner` shown in Alerts tab for opt-in. `createWalkerNotification` and `sendThankYouMessage` fire background push via `/api/push/send` edge route. Service worker handles `push` event (shows notification), `notificationclick` (focuses open tab or opens new window), and `SET_BADGE`/`CLEAR_BADGE` messages. Push subscriptions stored in `push_subscriptions` table (migration 034). VAPID keys: P-256 pair; private key stored as Cloudflare Worker secret (`wrangler secret put VAPID_PRIVATE_KEY`); public key in `wrangler.toml [vars]` and `.env.local`. |

### 🟡 Infrastructure / Integration Gaps

| # | Item | Detail |
|---|---|---|
| 3 | **Stripe billing integration** | `cancelSubscription()` is a local Zustand stub only — no real Stripe checkout, webhook, or billing portal. UI shows "Powered by Stripe" but no payments process. Full integration requires Stripe account, `stripe` npm package, webhook endpoint, and price ID configuration. |
| 6 | **SMS notifications** | Subscription feature comparison mentions "SMS notifications" but this is not built. Email alerts exist; SMS does not. Would require a provider (e.g. Twilio or AWS SNS). |

### ⚪ Explicitly Deferred

| # | Item | Detail |
|---|---|---|
| 8 | **Video support (PPAP Req 12)** | Spec decision: do not implement. If ever needed: Supabase Storage policy increase, `video/mp4` MIME type in PhotoUpload, thumbnail generation, VideoPlayer component alongside PhotoGallery. |
| 9 | **Guest offline capture** | Offline mode requires a signed-in session. Anonymous/guest offline reporting is not supported by design — a session is needed to upload the report on sync. |

---

*Document last updated: 28 April 2026 (evening). Engineering changes after this date should be reflected by updating the relevant sections.*
