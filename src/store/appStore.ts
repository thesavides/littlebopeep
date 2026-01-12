import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [54.5, -2] as [number, number],
  DEFAULT_ZOOM: 6,
  STANDARD_ZOOM_5KM: 13, // Approximately 5km view
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

export type UserRole = 'walker' | 'farmer' | 'admin' | 'super_admin' | null
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'

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
  condition: 'healthy' | 'injured' | 'unknown'
  reporterContact?: string
  reporterId?: string
  status: 'reported' | 'claimed' | 'resolved'
  claimedByFarmerId?: string
  claimedAt?: Date
  resolvedAt?: Date
  thankedAt?: Date // When walker was thanked
  archived?: boolean
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
  submitReport: () => void
  resetDraft: () => void
  getNearbyReports: (lat: number, lng: number, radiusMeters: number, hoursAgo: number) => SheepReport[]
  claimReport: (reportId: string) => void
  claimReportForFarmer: (reportId: string, farmerId: string) => void
  resolveReport: (reportId: string) => void
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

  // Supabase sync (stub for now)
  loadReports: () => void

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
      addFarm: (farm) => set((state) => ({
        farms: [...state.farms, {
          ...farm,
          id: Date.now().toString(),
          createdAt: new Date()
        }]
      })),
      
      updateFarm: (id, data) => set((state) => ({
        farms: state.farms.map((f) => 
          f.id === id ? { ...f, ...data } : f
        )
      })),
      
      deleteFarm: (id) => set((state) => ({
        farms: state.farms.filter((f) => f.id !== id)
      })),
      
      // Field actions
      addField: (farmId, field) => set((state) => ({
        farms: state.farms.map((f) => 
          f.id === farmId 
            ? { ...f, fields: [...f.fields, { ...field, id: Date.now().toString() }] }
            : f
        )
      })),
      
      updateField: (farmId, fieldId, data) => set((state) => ({
        farms: state.farms.map((f) => 
          f.id === farmId 
            ? { 
                ...f, 
                fields: f.fields.map(field => 
                  field.id === fieldId ? { ...field, ...data } : field
                ) 
              }
            : f
        )
      })),
      
      deleteField: (farmId, fieldId) => set((state) => ({
        farms: state.farms.map((f) => 
          f.id === farmId 
            ? { ...f, fields: f.fields.filter(field => field.id !== fieldId) }
            : f
        )
      })),
      
      // Report actions
      setCurrentReportStep: (step) => set({ currentReportStep: step }),
      
      updateDraftReport: (data) => set((state) => ({ 
        draftReport: { ...state.draftReport, ...data } 
      })),
      
      submitReport: () => {
        const { draftReport, reports, currentUserId } = get()
        const newReport: SheepReport = {
          id: Date.now().toString(),
          location: draftReport.location || { lat: 51.5, lng: -0.1 },
          timestamp: new Date(),
          description: draftReport.description || '',
          sheepCount: draftReport.sheepCount || 1,
          condition: draftReport.condition || 'unknown',
          reporterContact: draftReport.reporterContact,
          reporterId: currentUserId || undefined,
          status: 'reported',
        }
        set({ 
          reports: [...reports, newReport],
          draftReport: {},
          currentReportStep: 1,
        })
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
        const { currentUserId, reports, notifications } = get()
        const report = reports.find(r => r.id === reportId)

        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: 'claimed', claimedByFarmerId: currentUserId || undefined, claimedAt: new Date() }
              : r
          )
        }))

        // Send thank you notification to walker
        if (report?.reporterId) {
          const thankYouNotification: Notification = {
            id: Date.now().toString(),
            userId: report.reporterId,
            type: 'thank_you',
            message: 'Thank you for your sheep report! A farmer has claimed it and is on their way.',
            reportId: reportId,
            read: false,
            createdAt: new Date()
          }
          set((state) => ({
            notifications: [...state.notifications, thankYouNotification],
            reports: state.reports.map(r =>
              r.id === reportId ? { ...r, thankedAt: new Date() } : r
            )
          }))
        }
      },

      claimReportForFarmer: (reportId, farmerId) => {
        const { reports } = get()
        const report = reports.find(r => r.id === reportId)

        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, status: 'claimed', claimedByFarmerId: farmerId, claimedAt: new Date() }
              : r
          )
        }))

        // Send thank you notification to walker
        if (report?.reporterId) {
          const thankYouNotification: Notification = {
            id: Date.now().toString(),
            userId: report.reporterId,
            type: 'thank_you',
            message: 'Thank you for your sheep report! A farmer has claimed it and is on their way.',
            reportId: reportId,
            read: false,
            createdAt: new Date()
          }
          set((state) => ({
            notifications: [...state.notifications, thankYouNotification],
            reports: state.reports.map(r =>
              r.id === reportId ? { ...r, thankedAt: new Date() } : r
            )
          }))
        }
      },
      
      resolveReport: (reportId) => set((state) => ({
        reports: state.reports.map((r) => 
          r.id === reportId ? { ...r, status: 'resolved', resolvedAt: new Date() } : r
        )
      })),
      
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

      // Supabase sync (stub for now - using localStorage)
      loadReports: () => {
        // Stub function for ReportsLoader component compatibility
        // Reports are already loaded from localStorage via zustand persist
        console.log('loadReports called (localStorage mode)')
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
      // Admins and farmers can also act as walkers
      canAccessWalkerFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'admin' || currentRole === 'walker' || currentRole === 'farmer'
      },

      canAccessFarmerFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'admin' || currentRole === 'farmer'
      },

      canAccessAdminFeatures: () => {
        const { currentRole, isAdmin } = get()
        return isAdmin || currentRole === 'admin'
      },
    }),
    {
      name: 'little-bo-peep-storage',
    }
  )
)
