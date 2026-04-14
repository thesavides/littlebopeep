import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { writeAuditLog } from '@/lib/audit'
import {
  supabase,
  createReport as createReportInSupabase,
  fetchAllReports,
  fetchFarms,
  createFarmInSupabase,
  updateFarmInSupabase,
  deleteFarmInSupabase,
  addFieldToFarm,
  updateFieldInFarm,
  deleteFieldFromFarm,
  createNotificationsForFarmers,
  fetchReportCategories,
} from '@/lib/supabase-client'

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [54.5, -2] as [number, number],
  DEFAULT_ZOOM: 6,
  STANDARD_ZOOM_5KM: 13, // Approximately 5km view
}

// Ray-casting point-in-polygon for lat/lng coordinates
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  if (polygon.length < 3) return false
  let inside = false
  const { lat: px, lng: py } = point
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { lat: xi, lng: yi } = polygon[i]
    const { lat: xj, lng: yj } = polygon[j]
    const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// Returns true if a point is within bufferMeters of any edge of the polygon
export function isPointWithinBufferOfPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>,
  bufferMeters: number
): boolean {
  if (polygon.length === 0) return false
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    // Closest point on segment a→b to point
    const dist = distanceToSegmentMeters(point, a, b)
    if (dist <= bufferMeters) return true
  }
  return false
}

function distanceToSegmentMeters(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dx = b.lat - a.lat
  const dy = b.lng - a.lng
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return getDistanceMeters(p.lat, p.lng, a.lat, a.lng)
  const t = Math.max(0, Math.min(1, ((p.lat - a.lat) * dx + (p.lng - a.lng) * dy) / lenSq))
  return getDistanceMeters(p.lat, p.lng, a.lat + t * dx, a.lng + t * dy)
}

// Returns true if a report location is relevant to a farm:
// inside any field polygon OR within the farm's alert buffer of any field polygon
export function isReportNearFarm(
  report: { location: { lat: number; lng: number } },
  farm: { fields: Array<{ fencePosts: Array<{ lat: number; lng: number }> }>; alertBufferMeters: number }
): boolean {
  for (const field of farm.fields) {
    if (field.fencePosts.length < 3) continue
    if (isPointInPolygon(report.location, field.fencePosts)) return true
    if (isPointWithinBufferOfPolygon(report.location, field.fencePosts, farm.alertBufferMeters)) return true
  }
  return false
}

// Calculate distance between two points in meters using Haversine formula
export function getDistanceMeters(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate days since a date
export function getDaysSince(date: Date): number {
  const now = new Date()
  const diffTime = now.getTime() - new Date(date).getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export function getEffectiveSubscription(
  category: { id: string; subscriptionMode?: CategorySubscriptionMode },
  farm: { categorySubscriptions?: Record<string, boolean> }
): boolean {
  if (category.subscriptionMode === 'compulsory') return true
  const override = farm.categorySubscriptions?.[category.id]
  if (override !== undefined) return override
  return category.subscriptionMode === 'default_on'
}

export type UserRole = 'walker' | 'farmer' | 'admin' | 'super_admin' | null
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'
export type CategorySubscriptionMode = 'compulsory' | 'default_on' | 'default_off'

export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  role: 'walker' | 'farmer'
  status: 'active' | 'suspended'
  createdAt: Date
  lastActiveAt: Date
  preferred_language?: string
  // Farmer-specific billing info
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    county: string
    postcode: string
  }
  physicalAddress?: {
    lat: number
    lng: number
  }
  // Subscription info (farmers only)
  subscriptionStatus?: SubscriptionStatus
  subscriptionStartDate?: Date
  trialEndsAt?: Date
  stripeCustomerId?: string
}

export interface SheepReport {
  id: string
  location: { lat: number; lng: number }
  timestamp: Date
  description: string
  photoUrl?: string // Legacy single photo
  photoUrls?: string[] // New: multiple photos (max 3)
  sheepCount: number
  condition: string
  categoryId: string        // 'sheep' for default; custom category id otherwise
  categoryName: string      // 'Sheep' for default; custom category name otherwise
  categoryEmoji: string     // '🐑' for default; custom category emoji otherwise
  reporterContact?: string
  reporterId?: string
  status: 'reported' | 'claimed' | 'resolved' | 'escalated' | 'complete'
  claimedByFarmerId?: string
  claimedByFarmerIds?: string[]       // all current claimants (multi-claim)
  claimedAt?: Date
  resolvedAt?: Date
  thankedAt?: Date
  archived?: boolean
  // Attribution and metadata
  submittedByUserName?: string
  roleOfSubmitter?: string
  affectedFarmIds?: string[]
  affectedFarmerIds?: string[]
  locationAccuracy?: number
  deviceType?: string
  appVersion?: string
  // WS8: extended status model
  resolutionReason?: string           // farmer's reason on resolve
  adminNotes?: string                 // admin notes when marking complete
  completedBy?: string
  completedAt?: Date
  escalatedBy?: string
  escalatedAt?: Date
  farmerFlagNote?: string             // farmer's note when flagging to admin
  flaggedByFarmer?: string
  flaggedAt?: Date
  // WS14: screening
  screeningRequired?: boolean
  metadataCompletenessScore?: number
}

// A field/paddock within a farm - defined by fence posts (polygon)
export interface FarmField {
  id: string
  name: string
  fencePosts: Array<{ lat: number; lng: number }> // Polygon vertices
  sheepCount?: number
  color?: string
}

// The farmer's farm with fields and alert settings
export interface Farm {
  id: string
  farmerId: string
  name: string
  address?: string
  fields: FarmField[]
  alertBufferMeters: number // Alert zone distance OUTSIDE field boundaries
  alertsEnabled: boolean
  createdAt: Date
  categorySubscriptions?: Record<string, boolean>  // explicit per-farm overrides (only for default_on/default_off)
}

// Notification for walkers
export interface Notification {
  id: string
  userId: string
  type: 'thank_you' | 'claimed' | 'resolved'
  message: string
  reportId: string
  read: boolean
  createdAt: Date
}

export interface MapPreferences {
  layersEnabled: {
    footpaths: boolean
    bridleways: boolean
    trails: boolean
    contours: boolean
  }
  lastZoomLevel: number
  disclaimerAccepted: boolean
}

export interface ReportCategory {
  id: string
  name: string             // e.g. 'Fence', 'Wall', 'Road', 'Other Animal'
  emoji: string            // e.g. '🪵', '🧱', '🛣️', '🐄'
  description?: string     // optional helper text
  conditions: string[]     // e.g. ['Damaged', 'Collapsed', 'Hole', 'Needs repair']
  showCount: boolean       // whether to ask "how many?"
  countLabel: string       // e.g. 'Number of animals' or 'Number of sections'
  isActive: boolean
  sortOrder: number
  subscriptionMode: CategorySubscriptionMode  // 'compulsory' | 'default_on' | 'default_off'
  imageUrl?: string        // optional image URL (overrides emoji when set)
  createdAt: Date
}

interface AppState {
  // Session
  currentRole: UserRole
  showHomePage: boolean
  isAdmin: boolean
  currentUserId: string | null
  
  // Data
  users: User[]
  farms: Farm[]
  reports: SheepReport[]
  notifications: Notification[]
  
  // Map preferences
  mapPreferences: MapPreferences
  
  // Report draft state
  currentReportStep: number
  draftReport: Partial<SheepReport>
  
  // Session actions
  setRole: (role: UserRole) => void
  setShowHomePage: (show: boolean) => void
  setAdmin: (isAdmin: boolean) => void
  setCurrentUserId: (id: string | null) => void
  
  // User actions
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  suspendUser: (id: string) => void
  activateUser: (id: string) => void
  deleteUser: (id: string) => void
  
  // Farm actions
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => void
  updateFarm: (id: string, data: Partial<Farm>) => void
  deleteFarm: (id: string) => void
  
  // Field actions
  addField: (farmId: string, field: Omit<FarmField, 'id'>) => void
  updateField: (farmId: string, fieldId: string, data: Partial<FarmField>) => void
  deleteField: (farmId: string, fieldId: string) => void
  
  // Report actions
  setCurrentReportStep: (step: number) => void
  updateDraftReport: (data: Partial<SheepReport>) => void
  submitReport: () => Promise<void>
  resetDraft: () => void
  getNearbyReports: (lat: number, lng: number, radiusMeters: number, hoursAgo: number) => SheepReport[]
  claimReport: (reportId: string) => void
  claimReportForFarmer: (reportId: string, farmerId: string) => void
  unclaimReport: (reportId: string) => void
  resolveReport: (reportId: string, reason?: string) => void
  reopenReport: (reportId: string) => void
  markReportComplete: (reportId: string, notes?: string) => void
  escalateReport: (reportId: string) => void
  flagReportToAdmin: (reportId: string, note: string) => void
  deleteReport: (id: string) => void
  archiveReport: (id: string) => void
  batchArchiveReports: (ids: string[]) => void
  batchDeleteReports: (ids: string[]) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  getUnreadNotifications: (userId: string) => Notification[]
  
  // Subscription actions
  startTrial: (userId: string) => void
  activateSubscription: (userId: string) => void
  cancelSubscription: (userId: string) => void

  // Map preferences actions
  updateMapPreferences: (preferences: Partial<MapPreferences>) => void

  // Supabase sync
  loadReports: () => Promise<void>
  loadFarms: () => Promise<void>
  loadCategories: () => Promise<void>

  // Report category actions
  reportCategories: ReportCategory[]
  addReportCategory: (category: Omit<ReportCategory, 'id' | 'createdAt'>) => void
  updateReportCategory: (id: string, data: Partial<Omit<ReportCategory, 'id' | 'createdAt'>>) => void
  deleteReportCategory: (id: string) => void
  updateFarmCategorySubscription: (farmId: string, categoryId: string, subscribed: boolean) => void

  // Helpers
  getCurrentUser: () => User | undefined
  getFarmsByFarmerId: (farmerId: string) => Farm[]
  getReportsByUserId: (userId: string) => SheepReport[]

  // Role hierarchy helpers
  canAccessWalkerFeatures: () => boolean
  canAccessFarmerFeatures: () => boolean
  canAccessAdminFeatures: () => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      showHomePage: true,
      isAdmin: false,
      currentUserId: null,
      
      users: [],
      farms: [],
      reports: [],
      notifications: [],
      reportCategories: [],
      
      mapPreferences: {
        layersEnabled: {
          footpaths: false,
          bridleways: false,
          trails: false,
          contours: false
        },
        lastZoomLevel: MAP_CONFIG.STANDARD_ZOOM_5KM,
        disclaimerAccepted: false
      },
      
      currentReportStep: 1,
      draftReport: {},
      
      // Session actions
      setRole: (role) => set({ currentRole: role, showHomePage: false }),
      setShowHomePage: (show) => set({ showHomePage: show }),
      setAdmin: (isAdmin) => set({ isAdmin }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      
      // User actions
      addUser: (user) => set((state) => ({
        users: [...state.users, user]
      })),
      
      updateUser: (id, data) => set((state) => ({
        users: state.users.map((u) => 
          u.id === id ? { ...u, ...data, lastActiveAt: new Date() } : u
        )
      })),
      
      suspendUser: (id) => set((state) => ({
        users: state.users.map((u) => 
          u.id === id ? { ...u, status: 'suspended' } : u
        )
      })),
      
      activateUser: (id) => set((state) => ({
        users: state.users.map((u) => 
          u.id === id ? { ...u, status: 'active' } : u
        )
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        reports: state.reports.filter((r) => r.reporterId !== id),
        farms: state.farms.filter((f) => f.farmerId !== id)
      })),
      
      // Farm actions
      addFarm: (farm) => {
        const tempId = Date.now().toString()
        const { currentUserId } = get()
        set((state) => ({
          farms: [...state.farms, { ...farm, id: tempId, createdAt: new Date() }]
        }))
        createFarmInSupabase(farm).then((saved) => {
          set((state) => ({
            farms: state.farms.map((f) =>
              f.id === tempId ? { ...saved, fields: f.fields } : f
            )
          }))
          writeAuditLog({
            actorId: currentUserId,
            action: 'farm.create',
            entityType: 'farm',
            entityId: saved.id,
            detail: { name: farm.name, farmerId: farm.farmerId },
          })
        }).catch((err) => {
          console.error('Failed to save farm to Supabase:', err)
        })
      },

      updateFarm: (id, data) => {
        const { currentUserId, farms } = get()
        const existing = farms.find(f => f.id === id)
        set((state) => ({
          farms: state.farms.map((f) => (f.id === id ? { ...f, ...data } : f))
        }))
        updateFarmInSupabase(id, data).then(() => {
          const action = 'farmerId' in data ? 'farm.reassign' : 'farm.update'
          writeAuditLog({
            actorId: currentUserId,
            action,
            entityType: 'farm',
            entityId: id,
            detail: { before: { name: existing?.name, farmerId: existing?.farmerId }, after: data },
          })
        }).catch((err) => {
          console.error('Failed to update farm in Supabase:', err)
        })
      },

      deleteFarm: (id) => {
        const { currentUserId, farms } = get()
        const existing = farms.find(f => f.id === id)
        set((state) => ({ farms: state.farms.filter((f) => f.id !== id) }))
        deleteFarmInSupabase(id).then(() => {
          writeAuditLog({
            actorId: currentUserId,
            action: 'farm.delete',
            entityType: 'farm',
            entityId: id,
            detail: { name: existing?.name, farmerId: existing?.farmerId },
          })
        }).catch((err) => {
          console.error('Failed to delete farm from Supabase:', err)
        })
      },

      // Field actions
      addField: (farmId, field) => {
        const tempId = Date.now().toString()
        set((state) => ({
          farms: state.farms.map((f) =>
            f.id === farmId
              ? { ...f, fields: [...f.fields, { ...field, id: tempId }] }
              : f
          )
        }))
        addFieldToFarm(farmId, field).then((saved) => {
          set((state) => ({
            farms: state.farms.map((f) =>
              f.id === farmId
                ? { ...f, fields: f.fields.map((fld) => (fld.id === tempId ? saved : fld)) }
                : f
            )
          }))
        }).catch((err) => {
          console.error('Failed to save field to Supabase:', err)
        })
      },

      updateField: (farmId, fieldId, data) => {
        set((state) => ({
          farms: state.farms.map((f) =>
            f.id === farmId
              ? {
                  ...f,
                  fields: f.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...data } : field
                  ),
                }
              : f
          )
        }))
        updateFieldInFarm(fieldId, data).catch((err) => {
          console.error('Failed to update field in Supabase:', err)
        })
      },

      deleteField: (farmId, fieldId) => {
        set((state) => ({
          farms: state.farms.map((f) =>
            f.id === farmId
              ? { ...f, fields: f.fields.filter((field) => field.id !== fieldId) }
              : f
          )
        }))
        deleteFieldFromFarm(fieldId).catch((err) => {
          console.error('Failed to delete field from Supabase:', err)
        })
      },

      // Report actions
      setCurrentReportStep: (step) => set({ currentReportStep: step }),
      
      updateDraftReport: (data) => set((state) => ({ 
        draftReport: { ...state.draftReport, ...data } 
      })),
      
      submitReport: async () => {
        const { draftReport, reports, currentUserId, farms, currentRole } = get()

        // Fetch submitter name from Supabase profile (Workstream 2: fix attribution)
        let submittedByUserName: string | undefined
        let roleOfSubmitter: string | undefined = currentRole || undefined
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, role')
              .eq('id', user.id)
              .single()
            if (profile) {
              submittedByUserName = profile.full_name || undefined
              roleOfSubmitter = profile.role || roleOfSubmitter
            }
          }
        } catch {
          // Non-fatal — report submits without attribution if profile fetch fails
        }

        // Compute affected farms/farmers from geo-proximity (Workstream 3)
        const farmsWithFields = farms.filter(f => f.fields.length > 0)
        const reportLocation = draftReport.location || { lat: 51.5, lng: -0.1 }
        const nearbyFarms = farmsWithFields.filter(farm =>
          isReportNearFarm({ location: reportLocation }, farm)
        )
        const affectedFarmIds = nearbyFarms.map(f => f.id)
        const affectedFarmerIds = [...new Set(
          nearbyFarms.map(f => f.farmerId).filter(Boolean) as string[]
        )]

        const localReport: SheepReport = {
          id: Date.now().toString(),
          location: reportLocation,
          timestamp: new Date(),
          description: draftReport.description || '',
          sheepCount: draftReport.sheepCount || 1,
          condition: draftReport.condition || 'unknown',
          categoryId: draftReport.categoryId || 'sheep',
          categoryName: draftReport.categoryName || 'Sheep',
          categoryEmoji: draftReport.categoryEmoji || '🐑',
          reporterContact: draftReport.reporterContact,
          reporterId: currentUserId || undefined,
          status: 'reported',
          submittedByUserName,
          roleOfSubmitter,
          affectedFarmIds,
          affectedFarmerIds,
        }
        // Save to local store immediately (optimistic)
        set({
          reports: [...reports, localReport],
          draftReport: {},
          currentReportStep: 1,
        })
        // Persist to Supabase and replace local record with the canonical one
        try {
          const saved = await createReportInSupabase(localReport)
          if (saved) {
            set((state) => ({
              reports: state.reports.map((r) => r.id === localReport.id ? saved : r)
            }))
            // Notify affected farmers (Workstream 4)
            if (affectedFarmerIds.length > 0) {
              createNotificationsForFarmers(saved.id, affectedFarmerIds, 'new_report').catch(() => {})
            }
          }
        } catch (err) {
          console.error('Failed to save report to Supabase:', err)
          // Report stays in local store — offline sync will handle it later
        }
      },
      
      resetDraft: () => set({ draftReport: {}, currentReportStep: 1 }),
      
      getNearbyReports: (lat, lng, radiusMeters, hoursAgo) => {
        const { reports } = get()
        const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
        
        return reports.filter((report) => {
          const reportTime = new Date(report.timestamp)
          if (reportTime < cutoffTime) return false
          const distance = getDistanceMeters(lat, lng, report.location.lat, report.location.lng)
          return distance <= radiusMeters
        })
      },
      
      claimReport: (reportId) => {
        const { currentUserId, reports } = get()
        const report = reports.find(r => r.id === reportId)
        const existing = report?.claimedByFarmerIds || []
        const alreadyClaimed = currentUserId && existing.includes(currentUserId)
        if (alreadyClaimed) return

        const newClaimants = currentUserId ? [...existing, currentUserId] : existing
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: 'claimed', claimedByFarmerId: currentUserId || undefined, claimedByFarmerIds: newClaimants, claimedAt: r.claimedAt || new Date() }
              : r
          )
        }))
        // Persist to Supabase
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'claimed', claimedByFarmerId: currentUserId, claimedByFarmerIds: newClaimants, claimedAt: new Date() }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.claim',
          entityType: 'report',
          entityId: reportId,
          detail: { categoryName: report?.categoryName, location: report?.location },
        })
      },

      unclaimReport: (reportId) => {
        const { currentUserId, reports } = get()
        const report = reports.find(r => r.id === reportId)
        const remaining = (report?.claimedByFarmerIds || []).filter(id => id !== currentUserId)
        const newStatus = remaining.length > 0 ? 'claimed' : 'reported'
        const newPrimary = remaining[0] || null
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: newStatus as any, claimedByFarmerId: newPrimary || undefined, claimedByFarmerIds: remaining }
              : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: newStatus, claimedByFarmerId: newPrimary, claimedByFarmerIds: remaining }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.unclaim',
          entityType: 'report',
          entityId: reportId,
          detail: { remaining },
        })
      },

      claimReportForFarmer: (reportId, farmerId) => {
        const { currentUserId, reports } = get()
        const report = reports.find(r => r.id === reportId)
        const existing = report?.claimedByFarmerIds || []
        const newClaimants = existing.includes(farmerId) ? existing : [...existing, farmerId]
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: 'claimed', claimedByFarmerId: farmerId, claimedByFarmerIds: newClaimants, claimedAt: r.claimedAt || new Date() }
              : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'claimed', claimedByFarmerId: farmerId, claimedByFarmerIds: newClaimants, claimedAt: new Date() }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.claim',
          entityType: 'report',
          entityId: reportId,
          detail: { assignedTo: farmerId },
        })
      },

      resolveReport: (reportId, reason?) => {
        const { currentUserId, reports } = get()
        const report = reports.find(r => r.id === reportId)
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'resolved', resolvedAt: new Date(), resolutionReason: reason } : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'resolved', resolutionReason: reason }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.resolve',
          entityType: 'report',
          entityId: reportId,
          detail: { reason, categoryName: report?.categoryName },
        })
      },

      reopenReport: (reportId) => {
        const { currentUserId, reports } = get()
        const report = reports.find(r => r.id === reportId)
        if (report?.status === 'complete') return // Cannot reopen complete reports
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'claimed', resolvedAt: undefined, resolutionReason: undefined } : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'claimed', resolutionReason: null }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.reopen',
          entityType: 'report',
          entityId: reportId,
          detail: { previousStatus: report?.status },
        })
      },

      markReportComplete: (reportId, notes?) => {
        const { currentUserId } = get()
        const now = new Date()
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'complete', adminNotes: notes, completedBy: currentUserId || undefined, completedAt: now } : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'complete', adminNotes: notes, completedBy: currentUserId, completedAt: now }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.complete',
          entityType: 'report',
          entityId: reportId,
          detail: { notes },
        })
      },

      escalateReport: (reportId) => {
        const { currentUserId } = get()
        const now = new Date()
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'escalated', escalatedBy: currentUserId || undefined, escalatedAt: now } : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { status: 'escalated', escalatedBy: currentUserId, escalatedAt: now }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.escalate',
          entityType: 'report',
          entityId: reportId,
          detail: {},
        })
      },

      flagReportToAdmin: (reportId, note) => {
        const { currentUserId } = get()
        const now = new Date()
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, farmerFlagNote: note, flaggedByFarmer: currentUserId || undefined, flaggedAt: now } : r
          )
        }))
        import('@/lib/supabase-client').then(({ updateReport }) => {
          updateReport(reportId, { farmerFlagNote: note, flaggedByFarmer: currentUserId, flaggedAt: now }).catch(() => {})
        })
        writeAuditLog({
          actorId: currentUserId,
          action: 'report.flag',
          entityType: 'report',
          entityId: reportId,
          detail: { note },
        })
      },
      
      deleteReport: (id) => set((state) => ({
        reports: state.reports.filter((r) => r.id !== id)
      })),
      
      archiveReport: (id) => set((state) => ({
        reports: state.reports.map((r) => 
          r.id === id ? { ...r, archived: true } : r
        )
      })),
      
      batchArchiveReports: (ids) => set((state) => ({
        reports: state.reports.map((r) => 
          ids.includes(r.id) ? { ...r, archived: true } : r
        )
      })),
      
      batchDeleteReports: (ids) => set((state) => ({
        reports: state.reports.filter((r) => !ids.includes(r.id))
      })),
      
      // Notification actions
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date()
        }]
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      getUnreadNotifications: (userId) => {
        return get().notifications.filter(n => n.userId === userId && !n.read)
      },
      
      // Subscription actions
      startTrial: (userId) => set((state) => ({
        users: state.users.map((u) => 
          u.id === userId ? {
            ...u,
            subscriptionStatus: 'trial' as SubscriptionStatus,
            subscriptionStartDate: new Date(),
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          } : u
        )
      })),
      
      activateSubscription: (userId) => set((state) => ({
        users: state.users.map((u) => 
          u.id === userId ? { ...u, subscriptionStatus: 'active' as SubscriptionStatus } : u
        )
      })),
      
      cancelSubscription: (userId) => set((state) => ({
        users: state.users.map((u) => 
          u.id === userId ? { ...u, subscriptionStatus: 'cancelled' as SubscriptionStatus } : u
        )
      })),
      
      // Map preferences actions
      updateMapPreferences: (preferences) => set((state) => ({
        mapPreferences: { ...state.mapPreferences, ...preferences }
      })),

      loadReports: async () => {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        try {
          const supabaseReports = await fetchAllReports()
          const supabaseIds = new Set(supabaseReports.map((r: any) => r.id))

          // Sync any local-only reports (pre-Supabase reports with timestamp IDs)
          const { reports: localReports } = get()
          const orphaned = localReports.filter((r) => !supabaseIds.has(r.id))
          for (const report of orphaned) {
            try {
              // Strip old non-UUID id so Supabase generates a proper UUID
              const { id: _oldId, ...reportWithoutId } = report as any
              const idToUse = UUID_REGEX.test(report.id) ? report.id : undefined
              await createReportInSupabase(idToUse ? report : reportWithoutId)
            } catch {
              // leave in local store if sync fails
            }
          }

          // Re-fetch to get all (including just-synced orphans)
          const finalReports = orphaned.length > 0 ? await fetchAllReports() : supabaseReports
          if (finalReports.length > 0) {
            set({ reports: finalReports })
          }
        } catch (err) {
          console.error('Failed to load reports from Supabase:', err)
        }
      },

      loadFarms: async () => {
        try {
          const supabaseFarms = await fetchFarms()
          if (supabaseFarms.length > 0) {
            set({ farms: supabaseFarms })
          }
        } catch (err) {
          console.error('Failed to load farms from Supabase:', err)
        }
      },

      loadCategories: async () => {
        try {
          const categories = await fetchReportCategories()
          if (categories.length > 0) {
            set({ reportCategories: categories })
          }
        } catch (err) {
          console.error('Failed to load categories from Supabase:', err)
        }
      },

      // Helpers
      getCurrentUser: () => {
        const { currentUserId, users } = get()
        return users.find(u => u.id === currentUserId)
      },

      getFarmsByFarmerId: (farmerId) => {
        return get().farms.filter(f => f.farmerId === farmerId)
      },

      getReportsByUserId: (userId) => {
        return get().reports.filter(r => r.reporterId === userId)
      },

      // Role hierarchy helpers
      // Super admins and admins can access all features
      // Farmers can also act as walkers
      canAccessWalkerFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'walker' || currentRole === 'farmer'
      },

      canAccessFarmerFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'farmer'
      },

      canAccessAdminFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'super_admin' || currentRole === 'admin'
      },

      // Report category actions
      addReportCategory: (category) => set((state) => ({
        reportCategories: [...state.reportCategories, {
          ...category,
          id: Date.now().toString(),
          createdAt: new Date(),
        }]
      })),

      updateReportCategory: (id, data) => set((state) => ({
        reportCategories: state.reportCategories.map((c) =>
          c.id === id ? { ...c, ...data } : c
        )
      })),

      deleteReportCategory: (id) => set((state) => ({
        reportCategories: state.reportCategories.filter((c) => c.id !== id)
      })),

      updateFarmCategorySubscription: (farmId, categoryId, subscribed) => {
        set((state) => ({
          farms: state.farms.map((f) =>
            f.id === farmId
              ? { ...f, categorySubscriptions: { ...(f.categorySubscriptions || {}), [categoryId]: subscribed } }
              : f
          )
        }))
        const updatedFarm = get().farms.find(f => f.id === farmId)
        if (updatedFarm) {
          updateFarmInSupabase(farmId, { categorySubscriptions: updatedFarm.categorySubscriptions }).catch((err) => {
            console.error('Failed to update farm subscriptions in Supabase:', err)
          })
        }
      },
    }),
    {
      name: 'little-bo-peep-storage',
    }
  )
)
