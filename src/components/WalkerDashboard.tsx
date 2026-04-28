'use client'

import { useState, useEffect } from 'react'
import { useAppStore, getDistanceMeters, MAP_CONFIG } from '@/store/appStore'
import { supabase, fetchUserNotifications, markAllNotificationsRead, subscribeToUserNotifications, updateEmailAlertPreference } from '@/lib/supabase-client'
import NotificationPrefsPanel from './NotificationPrefsPanel'
import type { ReportCategory } from '@/store/appStore'
import Header from './Header'
import Map from './Map'
import LocationButton from './LocationButton'
import PhotoUpload from './PhotoUpload'
import PhotoGallery from './PhotoGallery'
import BottomNav from './BottomNav'
import ProfileDrawer from './ProfileDrawer'
import Button from './Button'
import OfflineSyncBanner from './OfflineSyncBanner'
import OfflineCapture from './OfflineCapture'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAppBadge } from '@/hooks/useAppBadge'
import { btn, input, label, card, text, badge as statusBadge } from '@/lib/ui'
import { useTranslation } from '@/contexts/TranslationContext'
import PushPermissionBanner from './PushPermissionBanner'

type ViewState = 'dashboard' | 'reporting' | 'my-reports' | 'notifications'

interface WalkerDashboardProps {
  onExitToAdmin?: () => void
}

export default function WalkerDashboard({ onExitToAdmin }: WalkerDashboardProps = {}) {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const {
    currentUserId,
    currentReportStep,
    setCurrentReportStep,
    draftReport,
    updateDraftReport,
    submitReport,
    resetDraft,
    reports,
    getNearbyReports,
    getReportsByUserId,
    getUnreadNotifications,
    markNotificationRead,
    reportCategories,
    loadReports,
    editOwnReport,
  } = useAppStore()
  
  const [viewState, setViewState] = useState<ViewState>('dashboard')
  const [showOfflineCapture, setShowOfflineCapture] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [nearbyReports, setNearbyReports] = useState<typeof reports>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ReportCategory | null>(null)
  const [preferredCategoryId, setPreferredCategoryId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('lbp-preferred-category')
    return null
  })

  // Guest contact info (for walkers without accounts)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  // Get my reports
  const myReports = currentUserId ? getReportsByUserId(currentUserId) : []
  
  // Get unread notifications (thank you messages)
  const unreadNotifications = currentUserId ? getUnreadNotifications(currentUserId) : []

  // All notifications from Supabase (thank_you + report_claimed + report_resolved + report_complete)
  const [allNotifications, setAllNotifications] = useState<any[]>([])
  // Thank You messages subset (kept for compat)
  const [thankYouMessages, setThankYouMessages] = useState<any[]>([])
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false)
  const [savingEmailPref, setSavingEmailPref] = useState(false)
  const [loginBannerDismissed, setLoginBannerDismissed] = useState(false)

  const walkerUnreadCount = allNotifications.filter(n => !n.read_at).length

  // Sync unread count to PWA home screen icon badge
  useAppBadge(walkerUnreadCount)

  const [profileOpen, setProfileOpen] = useState(false)
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false)
  const [editingReportId, setEditingReportId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<{ description: string; sheepCount: number; conditions: string[]; photoUrls: string[] }>({ description: '', sheepCount: 1, conditions: [], photoUrls: [] })
  const [savingEdit, setSavingEdit] = useState(false)

  // Load reports and notifications from Supabase on mount; subscribe to real-time updates
  useEffect(() => {
    loadReports()
    if (!currentUserId) return

    fetchUserNotifications(currentUserId).then(notifs => {
      setAllNotifications(notifs)
      setThankYouMessages(notifs.filter(n => n.type === 'thank_you'))
    }).catch(() => {})

    supabase
      .from('user_profiles')
      .select('email_alerts_enabled')
      .eq('id', currentUserId)
      .single()
      .then(({ data }) => {
        if (data) setEmailAlertsEnabled(data.email_alerts_enabled ?? false)
      })

    const unsubscribe = subscribeToUserNotifications(currentUserId, (notif) => {
      setAllNotifications(prev => [notif, ...prev])
      if (notif.type === 'thank_you') {
        setThankYouMessages(prev => [notif, ...prev])
      }
    })

    return unsubscribe
  }, [])

  // Show notification banner if there are unread notifications
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      setShowNotification(true)
    }
  }, [unreadNotifications.length])

  const handleDismissNotification = () => {
    unreadNotifications.forEach(n => markNotificationRead(n.id))
    setShowNotification(false)
  }

  // Detect device type for submission metadata
  const getDeviceType = (): string => {
    if (typeof navigator === 'undefined') return 'web'
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) return 'mobile'
    return 'desktop'
  }

  // Get user's location on mount — also stores accuracy for submission metadata
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Pre-populate submission metadata in draft report
          updateDraftReport({
            locationAccuracy: position.coords.accuracy ?? undefined,
            deviceType: getDeviceType(),
            appVersion: '1.0.0',
          })
        },
        (error) => {
          console.log('Could not get location:', error)
          // Still set device metadata even without GPS
          updateDraftReport({
            deviceType: getDeviceType(),
            appVersion: '1.0.0',
          })
        }
      )
    }
  }, [])

  // Get recent reports within 100m of user's location (last 12 hours)
  const recentNearbyReports = userLocation 
    ? getNearbyReports(userLocation.lat, userLocation.lng, 100, 12)
    : []

  // Filter for last 12 hours
  const getRecentAlerts = () => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
    return reports.filter(r => new Date(r.timestamp) > twelveHoursAgo)
  }

  const handleBack = () => {
    if (viewState === 'reporting') {
      if (currentReportStep > 1) {
        // Skip step 3 backwards for logged-in users
        const prevStep = currentReportStep === 4 && currentUserId ? 2 : currentReportStep - 1
        setCurrentReportStep(prevStep)
      } else {
        setViewState('dashboard')
        resetDraft()
        setActiveCategory(null)
      }
    } else {
      setViewState('dashboard')
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    updateDraftReport({ location: { lat, lng } })

    // Check for nearby reports of the same category at clicked location
    const allNearby = getNearbyReports(lat, lng, 100, 12)
    const sameCategoryNearby = allNearby.filter(r => r.categoryId === (draftReport.categoryId || 'sheep'))
    setNearbyReports(sameCategoryNearby)
  }

  const handleNextStep = async () => {
    // On step 1 completion, store a map reference URL with the report
    if (currentReportStep === 1 && draftReport.location) {
      const { lat, lng } = draftReport.location
      updateDraftReport({
        mapSnapshotUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`,
      })
    }

    // On step 1, check for same-category duplicates before proceeding
    if (currentReportStep === 1 && draftReport.location) {
      const allNearby = getNearbyReports(draftReport.location.lat, draftReport.location.lng, 100, 12)
      const sameCategoryNearby = allNearby.filter(r => r.categoryId === (draftReport.categoryId || 'sheep'))
      if (sameCategoryNearby.length > 0) {
        setNearbyReports(sameCategoryNearby)
        setShowDuplicateWarning(true)
        return
      }
    }

    // On step 3, save guest contact info to draft
    if (currentReportStep === 3) {
      const contactInfo = [guestName, guestEmail, guestPhone].filter(Boolean).join(' | ')
      if (contactInfo) {
        updateDraftReport({ reporterContact: contactInfo })
      }
    }

    if (currentReportStep < 4) {
      // Skip step 3 (contact info) for logged-in users — their identity is known
      const nextStep = currentReportStep === 2 && currentUserId ? 4 : currentReportStep + 1
      setCurrentReportStep(nextStep)
    } else {
      try {
        await submitReport()
        // Reset guest info
        setGuestName('')
        setGuestEmail('')
        setGuestPhone('')
        setViewState('dashboard')
        setShowSubmitSuccess(true)
        setTimeout(() => setShowSubmitSuccess(false), 3000)
      } catch (error) {
        console.error('Failed to submit report:', error)
        alert('Failed to submit report. Please try again.')
      }
    }
  }

  const handleProceedAnyway = () => {
    setShowDuplicateWarning(false)
    setCurrentReportStep(currentReportStep + 1)
  }

  const handleStartReport = () => {
    resetDraft()
    setActiveCategory(null)
    setCurrentReportStep(1)
    setViewState('reporting')
  }

  const handleStartReportWithCategory = (category: ReportCategory | null) => {
    resetDraft()
    setActiveCategory(category)
    if (category) {
      updateDraftReport({
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
        categoryImageUrl: category.imageUrl || undefined,
      })
    } else {
      updateDraftReport({
        categoryId: 'sheep',
        categoryName: 'Sheep',
        categoryEmoji: '🐑',
      })
    }
    setCurrentReportStep(1)
    setViewState('reporting')
    setShowCategoryPicker(false)
  }

  const setDefaultCategory = (categoryId: string | null) => {
    setPreferredCategoryId(categoryId)
    if (categoryId) localStorage.setItem('lbp-preferred-category', categoryId)
    else localStorage.removeItem('lbp-preferred-category')
  }

  const preferredCategory = preferredCategoryId
    ? reportCategories.find(c => c.id === preferredCategoryId) ?? null
    : null

  const getTitle = () => {
    if (viewState === 'reporting') {
      const catName = activeCategory ? activeCategory.name : 'Sheep'
      const totalSteps = currentUserId ? 3 : 4
      const displayStep = currentUserId && currentReportStep === 4 ? 3 : currentReportStep
      return `Report ${catName} (${displayStep}/${totalSteps})`
    }
    if (viewState === 'my-reports') return t('walker.myReports', {}, 'My Reports')
    if (viewState === 'notifications') return t('walker.alerts', {}, 'Alerts')
    return ''
  }

  const getStatusBadge = (status: string) => {
    const cls = statusBadge[status as keyof typeof statusBadge]
    if (!cls) return null
    const labels: Record<string, string> = {
      reported: t('walker.statusReported', {}, 'Reported'),
      claimed:  t('walker.statusClaimed',  {}, 'Claimed'),
      resolved: t('walker.statusResolved', {}, 'Resolved'),
      complete: t('walker.statusComplete', {}, 'Complete'),
      escalated: t('walker.statusEscalated', {}, 'Escalated'),
    }
    return <span className={cls}>{labels[status] ?? status}</span>
  }

  return (
    <div className="min-h-screen bg-[#D1D9C5]">
      {/* Admin reporting mode banner */}
      {onExitToAdmin && (
        <div className="bg-[#614270] text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60]">
          <span className="text-sm">🛡️ Admin — reporting as walker</span>
          <button
            onClick={onExitToAdmin}
            className="text-sm text-[#D1D9C5] hover:text-white font-medium flex items-center gap-1"
          >
            ← Back to Admin
          </button>
        </div>
      )}

      {/* Persistent Header */}
      <Header
        showBackButton={viewState !== 'dashboard'}
        onBack={handleBack}
        title={getTitle()}
        rightSlot={!currentUserId && viewState !== 'reporting' ? (
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Profile"
            className="w-9 h-9 rounded-full bg-[#D1D9C5] hover:bg-[#92998B]/30 flex items-center justify-center text-[#614270] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        ) : undefined}
      />

      {/* Login banner — unread notifications on mount */}
      {!loginBannerDismissed && allNotifications.some(n => !n.read_at) && (
        <div className="sticky top-0 z-50 bg-[#614270] text-white px-4 py-2.5 flex items-center justify-between shadow-md">
          <span className="text-sm font-medium">
            🔔 {allNotifications.filter(n => !n.read_at).length} new update{allNotifications.filter(n => !n.read_at).length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewState('notifications'); setLoginBannerDismissed(true) }}
              className="text-sm underline text-[#EADA69] hover:text-white"
            >
              View
            </button>
            <button
              onClick={() => setLoginBannerDismissed(true)}
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Submit Success Overlay */}
      {showSubmitSuccess && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/95 pointer-events-none">
          <div className="flex flex-col items-center gap-4 animate-pulse-once">
            <div className="w-20 h-20 rounded-full bg-[#9ED663]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#9ED663]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#614270]">{t('walker.reportSubmitted', {}, 'Report Submitted!')}</h2>
            <p className="text-[#92998B] text-sm">{t('walker.thankYouFarmers', {}, 'Thank you for helping local farmers.')}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-[#614270]">{t('walker.existingReportNearby', {}, 'Existing Report Nearby')}</h3>
            </div>
            <p className="text-[#614270] text-center mb-6">
              {nearbyReports.length === 1
                ? t('walker.duplicateOne', { name: nearbyReports[0].categoryName || 'report' }, `A ${nearbyReports[0].categoryName || 'report'} has already been submitted within 100m of this location in the past 12 hours. Do you still want to submit a new one?`)
                : t('walker.duplicateMany', { count: nearbyReports.length }, `${nearbyReports.length} reports of this type have already been submitted within 100m of this location in the past 12 hours. Do you still want to submit a new one?`)
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={handleProceedAnyway}
                className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#7D8DCC]/90"
              >
                {t('walker.yesSubmitReport', {}, 'Yes, Submit New Report')}
              </button>
              <button
                onClick={() => setShowDuplicateWarning(false)}
                className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]/70"
              >
                {t('walker.cancel', {}, 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar for reporting */}
      {viewState === 'reporting' && (() => {
        // Logged-in users skip step 3, so progress is over 3 steps not 4
        const totalSteps = currentUserId ? 3 : 4
        const displayStep = currentUserId && currentReportStep === 4 ? 3 : currentReportStep
        return (
          <div className="h-1 bg-[#D1D9C5]">
            <div
              className="h-full bg-[#7D8DCC] transition-all"
              style={{ width: `${(displayStep / totalSteps) * 100}%` }}
            />
          </div>
        )
      })()}

      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {/* ===== DASHBOARD VIEW ===== */}
        {/* Offline capture — self-contained fixed overlay, no wrapper needed */}
        {showOfflineCapture && (
          <OfflineCapture
            onSaved={() => setShowOfflineCapture(false)}
            onCancel={() => setShowOfflineCapture(false)}
          />
        )}

        {viewState === 'dashboard' && (
          <>
            {/* Offline sync banner — shown when back online with pending reports */}
            <OfflineSyncBanner />

            {/* Offline mode notice */}
            {!isOnline && (
              <div className="mb-4 rounded-2xl bg-[#EADA69]/20 border border-[#EADA69]/40 p-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📡</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#614270] text-sm">{t('walker.offlineMode', {}, 'Offline mode')}</p>
                  <p className="text-[#92998B] text-xs mt-0.5">{t('walker.offlineModeDesc', {}, 'No connection detected. You can still save a report and upload it when you\'re back online.')}</p>
                  <button
                    onClick={() => setShowOfflineCapture(true)}
                    className="mt-2 px-4 py-2 bg-[#614270] text-white rounded-xl text-sm font-semibold hover:bg-[#614270]/90"
                  >
                    {t('walker.saveForLater', {}, 'Save for later')}
                  </button>
                </div>
              </div>
            )}

            {/* Nearby reports warning */}
            {recentNearbyReports.length > 0 && (
              <div className="bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-[#614270] mb-1">📍 {t('walker.reportsNearYou', {}, 'Reports Near You')}</h3>
                <p className="text-[#614270] text-sm">
                  {t('walker.nearbyReportsDesc', { count: recentNearbyReports.length }, `${recentNearbyReports.length} ${recentNearbyReports.length === 1 ? 'report has' : 'reports have'} been submitted within 100m of your location in the last 12 hours. Check the map to see if they already cover what you've spotted.`)}
                </p>
              </div>
            )}

            {/* Map showing recent reports */}
            <div className="h-72 rounded-xl overflow-hidden shadow mb-6">
              <Map
                center={userLocation ? [userLocation.lat, userLocation.lng] : [54.5, -2]}
                zoom={userLocation ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                markers={[
                  // User's current location
                  ...(userLocation ? [{
                    id: 'user-location',
                    position: [userLocation.lat, userLocation.lng] as [number, number],
                    popup: '📍 Your location',
                    type: 'walker-location' as const
                  }] : []),
                  // Recent reports
                  ...getRecentAlerts().map((r) => {
                    const cat = reportCategories.find(c => c.id === r.categoryId)
                    return {
                      id: r.id,
                      position: [r.location.lat, r.location.lng] as [number, number],
                      popup: `${cat?.emoji || r.categoryEmoji || '🐑'} ${r.sheepCount} ${cat?.name || r.categoryName || 'sheep'} - ${r.status}`,
                      type: 'sheep' as const,
                      status: r.status as 'reported' | 'claimed' | 'resolved',
                      emoji: cat?.emoji || r.categoryEmoji || '🐑',
                      imageUrl: cat?.imageUrl || r.categoryImageUrl,
                    }
                  })
                ]}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-6 text-sm text-[#614270]">
              <div className="flex items-center gap-1">
                <span>📍</span> {t('walker.yourLocation', {}, 'Your location')}
              </div>
              <div className="flex items-center gap-1">
                <span>📌</span> {t('walker.reportedSheep12h', {}, 'Recent reports (last 12h)')}
              </div>
            </div>

            {/* Category Picker Modal */}
            {showCategoryPicker && (
              <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4" onClick={() => setShowCategoryPicker(false)}>
                <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl animate-slide-up sm:animate-none" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#D1D9C5]">
                    <h3 className="text-lg font-bold text-[#614270]">{t('walker.categoryPickerTitle', {}, 'What are you reporting?')}</h3>
                    <button onClick={() => setShowCategoryPicker(false)} className="text-[#92998B] hover:text-[#614270] text-2xl leading-none">×</button>
                  </div>
                  <div className="p-4 space-y-2 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto safe-area-pb">
                    {/* Sheep — always first */}
                    {(() => {
                      const isSheepDefault = !preferredCategoryId
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#D1D9C5] bg-[#D1D9C5]/50">
                          <button
                            className="flex items-center gap-3 flex-1 text-left"
                            onClick={() => handleStartReportWithCategory(null)}
                          >
                            <span className="text-3xl w-10 text-center flex-shrink-0">🐑</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[#614270]">Sheep</div>
                              <div className="text-xs text-[#92998B]">Stray or loose sheep</div>
                            </div>
                          </button>
                          <button
                            onClick={() => setDefaultCategory(isSheepDefault ? null : null)}
                            className={`text-lg flex-shrink-0 ${isSheepDefault ? 'text-[#EADA69]' : 'text-[#92998B] hover:text-[#EADA69]'}`}
                            title={isSheepDefault ? 'Your default' : 'Set as default'}
                          >
                            ★
                          </button>
                        </div>
                      )
                    })()}
                    {/* Other active categories — exclude built-in 'sheep' (shown above, matched by id or name) */}
                    {reportCategories.filter(c => c.isActive && c.id !== 'sheep' && c.name.toLowerCase() !== 'sheep').sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => {
                      const isDefault = preferredCategoryId === cat.id
                      return (
                        <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${isDefault ? 'border-[#D1D9C5] bg-[#D1D9C5]/50' : 'border-[#D1D9C5] bg-[#D1D9C5]/20 hover:border-[#92998B] hover:bg-white'}`}>
                          <button
                            className="flex items-center gap-3 flex-1 text-left"
                            onClick={() => handleStartReportWithCategory(cat)}
                          >
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain flex-shrink-0 rounded" />
                            ) : (
                              <span className="text-3xl w-10 text-center flex-shrink-0">{cat.emoji}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[#614270]">{cat.name}</div>
                              {cat.description && <div className="text-xs text-[#92998B] truncate">{cat.description}</div>}
                            </div>
                          </button>
                          <button
                            onClick={() => setDefaultCategory(isDefault ? null : cat.id)}
                            className={`text-lg flex-shrink-0 ${isDefault ? 'text-[#EADA69]' : 'text-[#92998B] hover:text-[#EADA69]'}`}
                            title={isDefault ? 'Your default' : 'Set as default'}
                          >
                            ★
                          </button>
                        </div>
                      )
                    })}
                    {reportCategories.filter(c => c.isActive && c.id !== 'sheep' && c.name.toLowerCase() !== 'sheep').length === 0 && (
                      <p className="text-center text-[#92998B] text-sm py-4">Only sheep reporting is available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Tips */}
            <div className="mt-8 bg-[#D1D9C5] rounded-xl p-4">
              <h3 className="font-semibold text-[#614270] mb-2">{t('walker.tipsForReporting', {}, 'Tips for reporting')}</h3>
              <ul className="text-sm text-[#614270] space-y-1">
                <li>• {t('walker.tip1', {}, 'Check the map for recent reports before submitting')}</li>
                <li>• {t('walker.tip2', {}, 'Be as accurate as possible with the location')}</li>
                <li>• {t('walker.tip3', {}, 'Add a photo if it is safe to do so')}</li>
                <li>• {t('walker.tip4', {}, 'Report injured or at-risk animals as a priority')}</li>
                <li>• {t('walker.tip5', {}, "Keep a safe distance from any animals")}</li>
                <li>• {t('walker.tip6', {}, 'You can report any countryside issue — gates, fencing, fly-tipping, and more')}</li>
              </ul>
            </div>
          </>
        )}

        {/* ===== REPORTING VIEW ===== */}
        {viewState === 'reporting' && (
          <>
            {/* Step 1: Location */}
            {currentReportStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-[#614270] mb-2">
                  {t('walker.step1Title', { name: activeCategory ? activeCategory.name.toLowerCase() : 'sheep' }, `Where did you spot the ${activeCategory ? activeCategory.name.toLowerCase() : 'sheep'}?`)}
                </h2>
                <p className="text-[#614270] mb-4">
                  {t('walker.step1Desc', { emoji: activeCategory ? activeCategory.emoji : '🐑' }, `Tap on the map to mark the location. Recent reports (last 12 hours) are shown as ${activeCategory ? activeCategory.emoji : '🐑'} markers.`)}
                </p>
                
                {/* Location — prominent auto-locate; tap map to refine */}
                <LocationButton
                  prominent
                  autoLocate={!draftReport.location}
                  onLocationFound={handleMapClick}
                  className="mb-4"
                />
                
                <div className="h-80 rounded-xl overflow-hidden shadow mb-4">
                  <Map
                    center={draftReport.location ? [draftReport.location.lat, draftReport.location.lng] : userLocation ? [userLocation.lat, userLocation.lng] : [54.5, -2]}
                    zoom={draftReport.location ? MAP_CONFIG.STANDARD_ZOOM_5KM : userLocation ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                    onClick={handleMapClick}
                    markers={[
                      // User's current location
                      ...(userLocation && !draftReport.location ? [{
                        id: 'user-location',
                        position: [userLocation.lat, userLocation.lng] as [number, number],
                        popup: '📍 Your location',
                        type: 'walker-location' as const,
                      }] : []),
                      // Show existing recent reports
                      ...getRecentAlerts().map(r => {
                        const cat = reportCategories.find(c => c.id === r.categoryId)
                        return {
                          id: r.id,
                          position: [r.location.lat, r.location.lng] as [number, number],
                          popup: `${cat?.emoji || r.categoryEmoji || '🐑'} ${r.sheepCount} ${cat?.name || r.categoryName || 'sheep'} reported ${new Date(r.timestamp).toLocaleTimeString()}`,
                          type: 'sheep' as const,
                          status: r.status as 'reported' | 'claimed' | 'resolved',
                          emoji: cat?.emoji || r.categoryEmoji || '🐑',
                          imageUrl: cat?.imageUrl || r.categoryImageUrl,
                        }
                      }),
                      // Show selected location with category image or emoji
                      ...(draftReport.location ? [{
                        id: 'selected',
                        position: [draftReport.location.lat, draftReport.location.lng] as [number, number],
                        popup: 'Your report location',
                        type: 'selected' as const,
                        emoji: draftReport.categoryEmoji || activeCategory?.emoji || '🐑',
                        imageUrl: draftReport.categoryImageUrl || activeCategory?.imageUrl,
                      }] : [])
                    ]}
                  />
                </div>
                {draftReport.location && (
                  <p className="text-sm text-[#63BD8F] mb-2">
                    📍 {t('walker.locationSelected', {}, 'Location selected')}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {currentReportStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-[#614270] mb-4">
                  {t('walker.step2Title', { name: activeCategory ? activeCategory.name.toLowerCase() : 'sheep' }, `Tell us about the ${activeCategory ? activeCategory.name.toLowerCase() : 'sheep'}`)}
                </h2>
                <div className="space-y-4">
                  {/* Quantity — +/- stepper */}
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-2">
                      {activeCategory ? (activeCategory.countLabel || 'Quantity') : t('walker.quantity', {}, 'Quantity')}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateDraftReport({ sheepCount: Math.max(1, (draftReport.sheepCount || 1) - 1) })}
                        className="w-11 h-11 rounded-lg bg-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5]/70 font-bold text-xl flex items-center justify-center active:bg-[#92998B]/30"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={draftReport.sheepCount || 1}
                        onChange={(e) => updateDraftReport({ sheepCount: parseInt(e.target.value) || 1 })}
                        className="w-20 text-center px-2 py-2 border border-[#D1D9C5] rounded-lg text-lg font-semibold focus:ring-2 focus:ring-[#7D8DCC]"
                      />
                      <button
                        type="button"
                        onClick={() => updateDraftReport({ sheepCount: (draftReport.sheepCount || 1) + 1 })}
                        className="w-11 h-11 rounded-lg bg-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5]/70 font-bold text-xl flex items-center justify-center active:bg-[#92998B]/30"
                      >+</button>
                    </div>
                  </div>
                  {/* Conditions — multi-select chips */}
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-2">
                      {t('walker.condition', {}, 'Condition')} <span className="text-[#92998B] font-normal text-xs">— {t('walker.selectAllThatApply', {}, 'select all that apply')}</span>
                    </label>
                    {(() => {
                      const opts = activeCategory?.conditions?.length
                        ? activeCategory.conditions
                        : [
                            t('walker.conditionHealthy', {}, 'Healthy'),
                            t('walker.conditionInjured', {}, 'Injured'),
                            t('walker.conditionDead', {}, 'Dead'),
                            t('walker.conditionInRoad', {}, 'In road'),
                            t('walker.conditionLost', {}, 'Lost / straying'),
                            t('walker.conditionUnknown', {}, 'Not sure'),
                          ]
                      const selected: string[] = draftReport.conditions?.length
                        ? draftReport.conditions
                        : draftReport.condition ? [draftReport.condition] : []
                      return (
                        <div className="flex flex-wrap gap-2">
                          {opts.map(opt => {
                            const isSelected = selected.includes(opt)
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const next = isSelected
                                    ? selected.filter(c => c !== opt)
                                    : [...selected, opt]
                                  updateDraftReport({ conditions: next, condition: next[0] || '' })
                                }}
                                className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                                  isSelected
                                    ? 'bg-[#7D8DCC] text-white border-[#7D8DCC]'
                                    : 'bg-white text-[#614270] border-[#D1D9C5] hover:border-[#7D8DCC] active:bg-[#D1D9C5]/30'
                                }`}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">
                      {t('walker.additionalDetails', {}, 'Additional details (optional)')}
                    </label>
                    <textarea
                      value={draftReport.description || ''}
                      onChange={(e) => updateDraftReport({ description: e.target.value })}
                      placeholder={t('walker.detailsPlaceholder', {}, 'e.g., Near the old stone wall, white sheep with black face, ear tag visible...')}
                      rows={3}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-2">
                      {t('walker.photos', {}, 'Photos (optional)')}
                    </label>
                    <PhotoUpload
                      reportId={draftReport.id || 'temp'}
                      onPhotosUploaded={(urls) => updateDraftReport({ photoUrls: urls })}
                    />
                    <p className="text-xs text-[#92998B] mt-2">
                      {t('walker.photoHelp', {}, 'Photos help farmers identify the issue. Max 3 photos.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact (optional for guests, shows notification benefit) */}
            {currentReportStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-[#614270] mb-2">
                  {t('walker.wantNotified', {}, 'Want to be notified? 🔔')}
                </h2>
                <p className="text-[#614270] mb-4">
                  {currentUserId
                    ? t('walker.contactInstructionLoggedIn', {}, 'The farmer may want to reach out for more details about the location.')
                    : t('walker.contactInstructionGuest', {}, 'Leave your contact details to be notified when the sheep is successfully returned to the farmer!')
                  }
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">
                      {currentUserId ? t('walker.name', {}, 'Name') : t('walker.nameOptional', {}, 'Name (optional)')}
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={t('walker.namePlaceholder', {}, 'Your name')}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">
                      {t('walker.email', {}, 'Email (for thank you notification)')}
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder={t('walker.emailPlaceholder', {}, 'your@email.com')}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">
                      {t('walker.phone', {}, 'Phone (optional)')}
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder={t('walker.phonePlaceholder', {}, '+44 7700 900000')}
                      className={input}
                    />
                  </div>
                </div>
                <div className="mt-4 bg-[#D1D9C5] border border-[#D1D9C5] rounded-xl p-3">
                  <p className="text-[#614270] text-sm">
                    💌 {t('walker.thankYouMessage', {}, "We'll send you a thank you message when the farmer claims your report and recovers the sheep!")}
                  </p>
                </div>
                <p className="text-xs text-[#92998B] mt-3">
                  {t('walker.privacyNote', {}, 'Your contact info will only be used for notifications and may be shared with farmers in the area. Leave blank to report anonymously.')}
                </p>
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentReportStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-[#614270] mb-4">
                  {t('walker.confirmReport', {}, 'Confirm your report')}
                </h2>
                <div className="bg-white rounded-xl p-4 shadow space-y-3 border border-[#D1D9C5]">
                  {activeCategory && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[#92998B]">{t('walker.category', {}, 'Category')}</span>
                      <span className="text-[#614270] font-medium">{activeCategory.emoji} {activeCategory.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-[#92998B]">{t('walker.location', {}, 'Location')}</span>
                    <span className="text-[#614270] font-medium">
                      {draftReport.location?.lat.toFixed(5)}, {draftReport.location?.lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#92998B]">
                      {activeCategory ? (activeCategory.countLabel || 'Quantity') : t('walker.sheepCount', {}, 'Sheep count')}
                    </span>
                    <span className="text-[#614270] font-medium">{draftReport.sheepCount || 1}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-[#92998B] flex-shrink-0">{t('walker.condition', {}, 'Condition')}</span>
                    <span className="text-[#614270] font-medium capitalize text-right">
                      {draftReport.conditions?.length
                        ? draftReport.conditions.join(', ')
                        : draftReport.condition || t('walker.conditionUnknown', {}, 'Not sure')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-[#92998B]">{t('walker.details', {}, 'Details')}</span>
                    <p className="text-[#614270] mt-1">{draftReport.description || '—'}</p>
                  </div>
                  {draftReport.reporterContact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[#92998B]">{t('walker.contact', {}, 'Contact')}</span>
                      <span className="text-[#614270] font-medium">{draftReport.reporterContact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation — always anchored to bottom of screen */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D1D9C5] px-4 py-3 flex gap-3 z-40 safe-area-pb">
              <Button variant="ghost" onClick={handleBack} className="flex-1">
                {currentReportStep === 1 ? t('walker.cancel', {}, 'Cancel') : t('walker.back', {}, '← Back')}
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={currentReportStep === 1 && !draftReport.location}
                className="flex-1"
              >
                {currentReportStep === 4 ? t('walker.submitReport', {}, '✓ Submit Report') : t('walker.continue', {}, 'Continue →')}
              </Button>
            </div>
          </>
        )}

        {/* ===== NOTIFICATIONS VIEW ===== */}
        {viewState === 'notifications' && currentUserId && (
          <div className="space-y-4">
            <PushPermissionBanner userId={currentUserId} />
            <NotificationPrefsPanel userId={currentUserId} role="walker" />

            {allNotifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-[#614270] font-medium mb-1">{t('walker.notif.empty', {}, 'No updates yet')}</p>
                <p className="text-[#92998B] text-sm">{t('walker.notif.emptyHint', {}, "You'll see claim, resolve, and thank-you messages here")}</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#614270]">
                    {t('walker.updates', { count: allNotifications.length }, `Updates (${allNotifications.length})`)}
                  </h3>
                </div>
                <div className="space-y-2">
                  {allNotifications.map(notif => {
                    const report = myReports.find(r => r.id === notif.report_id)
                    const isUnread = !notif.read_at
                    const typeConfig: Record<string, { icon: string; label: string }> = {
                      thank_you:       { icon: '💌', label: notif.sender_name ? `🧑‍🌾 ${notif.sender_name}` : t('walker.notif.aFarmer', {}, 'A farmer') },
                      report_claimed:  { icon: '🙋', label: notif.sender_name ? t('walker.notif.claimedBy', { name: notif.sender_name }, `Claimed by ${notif.sender_name}`) : t('walker.notif.reportClaimed', {}, 'Your report was claimed') },
                      report_resolved: { icon: '✅', label: notif.sender_name ? t('walker.notif.resolvedBy', { name: notif.sender_name }, `Resolved by ${notif.sender_name}`) : t('walker.notif.reportResolved', {}, 'Your report was resolved') },
                      report_complete: { icon: '🎉', label: t('walker.notif.reportComplete', {}, 'Report marked complete') },
                      new_report:      { icon: '📍', label: t('walker.notif.newReport', {}, 'New report') },
                      sync_complete:   { icon: '📡', label: t('walker.notif.syncComplete', {}, 'Offline reports uploaded') },
                    }
                    const cfg = typeConfig[notif.type] ?? { icon: '🔔', label: t('walker.notif.update', {}, 'Update') }
                    return (
                      <div key={notif.id} className={`rounded-lg p-3 text-sm ${isUnread ? 'bg-[#EADA69]/20 border border-[#EADA69]/40' : 'bg-[#D1D9C5]/40'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isUnread && <span className="inline-block w-2 h-2 bg-[#EADA69] rounded-full flex-shrink-0" />}
                          <span className="text-xs font-semibold text-[#614270]">{cfg.icon} {cfg.label}</span>
                          <span className="text-xs text-[#92998B] ml-auto">{new Date(notif.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        {notif.message_text && (
                          <p className="text-[#614270] italic">&ldquo;{notif.message_text}&rdquo;</p>
                        )}
                        {report && (
                          <p className="text-xs text-[#92998B] mt-1">
                            Re: {report.categoryEmoji} {report.categoryName}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MY REPORTS VIEW ===== */}
        {viewState === 'my-reports' && (
          <>
            {myReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐑</div>
                <h3 className="text-lg font-semibold text-[#614270] mb-2">{t('walker.noReportsYet', {}, 'No reports yet')}</h3>
                <p className="text-[#614270] mb-6">
                  {t('walker.noReportsMessage', {}, 'Spot some sheep and submit a report to help farmers!')}
                </p>
                <button
                  onClick={handleStartReport}
                  className="px-6 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#7D8DCC]/90"
                >
                  {t('walker.reportASheep', {}, 'Report a Sheep')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myReports.map((report) => {
                  const isEditing = editingReportId === report.id
                  const displayConditions = report.conditions?.length
                    ? report.conditions
                    : report.condition ? [report.condition] : []
                  return (
                    <div key={report.id} className="bg-white rounded-xl shadow border border-[#D1D9C5] overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-semibold text-[#614270]">
                              {(report.status === 'reported' || report.status === 'claimed') ? (
                                <button
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingReportId(null)
                                    } else {
                                      setEditingReportId(report.id)
                                      setEditFields({
                                        description: report.description || '',
                                        sheepCount: report.sheepCount,
                                        conditions: report.conditions?.length ? report.conditions : report.condition ? [report.condition] : [],
                                        photoUrls: report.photoUrls || [],
                                      })
                                    }
                                  }}
                                  className="text-left hover:opacity-70 active:opacity-50"
                                >
                                  {report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'}
                                </button>
                              ) : (
                                <>{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'}</>
                              )}
                            </div>
                            <div className="text-sm text-[#92998B]">
                              <span className="font-mono text-[#92998B] mr-1">#{report.id.slice(-6).toUpperCase()}</span>
                              · {new Date(report.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(report.status)}
                            {(report.status === 'reported' || report.status === 'claimed') && (
                              <button
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingReportId(null)
                                  } else {
                                    setEditingReportId(report.id)
                                    setEditFields({
                                      description: report.description || '',
                                      sheepCount: report.sheepCount,
                                      conditions: report.conditions?.length ? report.conditions : report.condition ? [report.condition] : [],
                                      photoUrls: report.photoUrls || [],
                                    })
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-[#D1D9C5] text-[#614270] rounded-lg hover:bg-[#D1D9C5]/70"
                              >
                                {isEditing ? t('common.cancel', {}, 'Cancel') : t('common.edit', {}, 'Edit')}
                              </button>
                            )}
                          </div>
                        </div>
                        {displayConditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {displayConditions.map(c => (
                              <span key={c} className="px-2 py-0.5 bg-[#D1D9C5] text-[#614270] rounded-full text-xs">{c}</span>
                            ))}
                          </div>
                        )}
                        {report.description && (
                          <p className="text-sm text-[#614270] mt-2">{report.description}</p>
                        )}
                        {report.photoUrls && report.photoUrls.length > 0 && (
                          <div className="mt-3">
                            <PhotoGallery photos={report.photoUrls} className="max-w-xs" />
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="border-t border-[#D1D9C5] bg-[#D1D9C5]/20 p-4 space-y-4">
                          <h4 className="font-semibold text-[#614270] text-sm">{t('walker.editReport', {}, 'Edit Report')}</h4>

                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">{t('walker.quantity', {}, 'Quantity')}</label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setEditFields(f => ({ ...f, sheepCount: Math.max(1, f.sheepCount - 1) }))}
                                className="w-9 h-9 rounded-lg bg-white border border-[#D1D9C5] font-bold text-lg flex items-center justify-center">−</button>
                              <input type="number" min="1" value={editFields.sheepCount}
                                onChange={e => setEditFields(f => ({ ...f, sheepCount: parseInt(e.target.value) || 1 }))}
                                className="w-16 text-center px-2 py-1 border border-[#D1D9C5] rounded-lg text-base font-semibold" />
                              <button type="button" onClick={() => setEditFields(f => ({ ...f, sheepCount: f.sheepCount + 1 }))}
                                className="w-9 h-9 rounded-lg bg-white border border-[#D1D9C5] font-bold text-lg flex items-center justify-center">+</button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">{t('walker.condition', {}, 'Condition')}</label>
                            <div className="flex flex-wrap gap-2">
                              {[t('walker.conditionHealthy',{},'Healthy'),t('walker.conditionInjured',{},'Injured'),t('walker.conditionDead',{},'Dead'),t('walker.conditionInRoad',{},'In road'),t('walker.conditionLost',{},'Lost / straying'),t('walker.conditionUnknown',{},'Not sure')].map(opt => {
                                const sel = editFields.conditions.includes(opt)
                                return (
                                  <button key={opt} type="button"
                                    onClick={() => setEditFields(f => ({
                                      ...f,
                                      conditions: sel ? f.conditions.filter(c => c !== opt) : [...f.conditions, opt]
                                    }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${sel ? 'bg-[#7D8DCC] text-white border-[#7D8DCC]' : 'bg-white text-[#614270] border-[#D1D9C5]'}`}
                                  >{opt}</button>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">{t('walker.details', {}, 'Details')}</label>
                            <textarea value={editFields.description}
                              onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC]" />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">{t('walker.photos', {}, 'Photos (optional)')}</label>
                            <PhotoUpload
                              reportId={report.id}
                              onPhotosUploaded={(urls) => setEditFields(f => ({ ...f, photoUrls: [...new Set([...f.photoUrls, ...urls])] }))}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              setSavingEdit(true)
                              await editOwnReport(report.id, editFields)
                              setSavingEdit(false)
                              setEditingReportId(null)
                            }}
                            disabled={savingEdit}
                            className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#7D8DCC]/90 disabled:opacity-50"
                          >
                            {savingEdit ? t('common.saving', {}, 'Saving…') : t('farmer.editField.saveChanges', {}, 'Save Changes')}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation — hidden during active report flow */}
      {viewState !== 'reporting' && (
        <BottomNav
          items={[
            {
              id: 'map',
              label: t('walker.nav.map', {}, 'Map'),
              icon: '🗺️',
              active: viewState === 'dashboard',
              onClick: () => setViewState('dashboard'),
            },
            {
              id: 'reports',
              label: t('walker.nav.myReports', {}, 'My Reports'),
              icon: '📋',
              active: viewState === 'my-reports',
              onClick: () => setViewState('my-reports'),
            },
            ...(currentUserId ? [{
              id: 'alerts',
              label: t('walker.nav.alerts', {}, 'Alerts'),
              icon: '🔔',
              active: viewState === 'notifications',
              badge: allNotifications.filter(n => !n.read_at).length,
              onClick: async () => {
                setViewState('notifications')
                setLoginBannerDismissed(true)
                if (currentUserId && allNotifications.some(n => !n.read_at)) {
                  await markAllNotificationsRead(currentUserId)
                  setAllNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
                  setThankYouMessages(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
                }
              },
            }] : []),
            {
              id: 'profile',
              label: t('walker.nav.profile', {}, 'Profile'),
              icon: '👤',
              active: false,
              onClick: () => setProfileOpen(true),
            },
          ]}
          fab={{
            label: isOnline ? t('walker.nav.report', {}, 'Report') : t('walker.nav.saveOffline', {}, 'Save offline'),
            icon: isOnline
              ? (preferredCategory?.imageUrl
                ? <img src={preferredCategory.imageUrl} alt={preferredCategory.name} className="w-7 h-7 object-contain" />
                : <span className="text-2xl">{preferredCategory?.emoji ?? '🐑'}</span>)
              : <span className="text-2xl">📴</span>,
            onClick: () => isOnline ? setShowCategoryPicker(true) : setShowOfflineCapture(true),
          }}
        />
      )}

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
