'use client'

import { useState, useEffect } from 'react'
import { useAppStore, getDistanceMeters, MAP_CONFIG } from '@/store/appStore'
import { fetchUserNotifications, markAllNotificationsRead } from '@/lib/supabase-client'
import type { ReportCategory } from '@/store/appStore'
import Header from './Header'
import Map from './Map'
import LocationButton from './LocationButton'
import PhotoUpload from './PhotoUpload'
import PhotoGallery from './PhotoGallery'
import { useTranslation } from '@/contexts/TranslationContext'

type ViewState = 'dashboard' | 'reporting' | 'my-reports'

interface WalkerDashboardProps {
  onExitToAdmin?: () => void
}

export default function WalkerDashboard({ onExitToAdmin }: WalkerDashboardProps = {}) {
  const { t } = useTranslation()
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
  } = useAppStore()
  
  const [viewState, setViewState] = useState<ViewState>('dashboard')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [nearbyReports, setNearbyReports] = useState<typeof reports>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ReportCategory | null>(null)

  // Guest contact info (for walkers without accounts)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  // Get my reports
  const myReports = currentUserId ? getReportsByUserId(currentUserId) : []
  
  // Get unread notifications (thank you messages)
  const unreadNotifications = currentUserId ? getUnreadNotifications(currentUserId) : []

  // Thank You messages from Supabase
  const [thankYouMessages, setThankYouMessages] = useState<any[]>([])

  // Load reports and thank-you messages from Supabase on mount
  useEffect(() => {
    loadReports()
    if (currentUserId) {
      fetchUserNotifications(currentUserId).then(notifs => {
        setThankYouMessages(notifs.filter(n => n.type === 'thank_you'))
      }).catch(() => {})
    }
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
        setCurrentReportStep(currentReportStep - 1)
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
    
    // Check for nearby reports at clicked location
    const nearby = getNearbyReports(lat, lng, 100, 12)
    setNearbyReports(nearby)
  }

  const handleNextStep = async () => {
    // On step 1, check for duplicates before proceeding
    if (currentReportStep === 1 && draftReport.location) {
      const nearby = getNearbyReports(draftReport.location.lat, draftReport.location.lng, 100, 12)
      if (nearby.length > 0) {
        setNearbyReports(nearby)
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
      setCurrentReportStep(currentReportStep + 1)
    } else {
      try {
        await submitReport()
        // Reset guest info
        setGuestName('')
        setGuestEmail('')
        setGuestPhone('')
        setViewState('dashboard')
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

  const getTitle = () => {
    if (viewState === 'reporting') {
      const catName = activeCategory ? activeCategory.name : 'Sheep'
      return `Report ${catName} (Step ${currentReportStep}/4)`
    }
    if (viewState === 'my-reports') return t('walker.myReports', {}, 'My Reports')
    return ''
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">{t('walker.statusReported', {}, 'Reported')}</span>
      case 'claimed':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">{t('walker.statusClaimed', {}, 'Claimed')}</span>
      case 'resolved':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">{t('walker.statusResolved', {}, 'Resolved')}</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin reporting mode banner */}
      {onExitToAdmin && (
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60]">
          <span className="text-sm">🛡️ Admin — reporting as walker</span>
          <button
            onClick={onExitToAdmin}
            className="text-sm text-slate-300 hover:text-white font-medium flex items-center gap-1"
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
      />

      {/* Thank You Notification Banner */}
      {showNotification && unreadNotifications.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-medium text-green-800">{t('walker.thankYou', {}, 'Thank You!')}</p>
                <p className="text-sm text-green-600">{unreadNotifications[0].message}</p>
              </div>
            </div>
            <button onClick={handleDismissNotification} className="text-green-600 hover:text-green-800 text-xl">×</button>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-slate-800">{t('walker.existingReportNearby', {}, 'Existing Report Nearby')}</h3>
            </div>
            <p className="text-slate-600 text-center mb-6">
              {t('walker.duplicateWarning', {}, 'A report for a missing sheep was reported in this vicinity within the past 12 hours. Do you still want to proceed?')}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleProceedAnyway}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                {t('walker.yesSubmitReport', {}, 'Yes, Submit New Report')}
              </button>
              <button
                onClick={() => setShowDuplicateWarning(false)}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
              >
                {t('walker.cancel', {}, 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar for reporting */}
      {viewState === 'reporting' && (
        <div className="h-1 bg-slate-200">
          <div 
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(currentReportStep / 4) * 100}%` }}
          />
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* ===== DASHBOARD VIEW ===== */}
        {viewState === 'dashboard' && (
          <>
            {/* Nearby reports warning */}
            {recentNearbyReports.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-amber-800 mb-1">📍 {t('walker.reportsNearYou', {}, 'Reports Near You')}</h3>
                <p className="text-amber-700 text-sm">
                  {t('walker.nearbyReportsWarning', { count: recentNearbyReports.length }, `${recentNearbyReports.length} sheep report(s) within 100m in the last 12 hours. Check if these match what you've seen before submitting a new report.`)}
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
                  ...getRecentAlerts().map((r) => ({
                    id: r.id,
                    position: [r.location.lat, r.location.lng] as [number, number],
                    popup: `${r.categoryEmoji || '🐑'} ${r.sheepCount} ${r.categoryName || 'sheep'} - ${r.status}`,
                    type: 'sheep' as const,
                    status: r.status as 'reported' | 'claimed' | 'resolved',
                    emoji: r.categoryEmoji || '🐑',
                  }))
                ]}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-6 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <span>📍</span> {t('walker.yourLocation', {}, 'Your location')}
              </div>
              <div className="flex items-center gap-1">
                <span>🐑</span> {t('walker.reportedSheep12h', {}, 'Reported sheep (last 12h)')}
              </div>
            </div>

            {/* Category Picker Modal */}
            {showCategoryPicker && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">What are you reporting?</h3>
                    <button onClick={() => setShowCategoryPicker(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {reportCategories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleStartReportWithCategory(cat)}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-400 rounded-xl transition-colors"
                      >
                        <span className="text-3xl">{cat.emoji}</span>
                        <span className="text-sm font-medium text-slate-700 text-center leading-tight">{cat.name}</span>
                      </button>
                    ))}
                    {reportCategories.filter(c => c.isActive).length === 0 && (
                      <p className="col-span-2 text-center text-slate-500 text-sm py-4">No additional categories available yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleStartReportWithCategory(null)}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="text-xl">🐑</span>
                {t('walker.reportASheep', {}, 'Report a Sheep')}
              </button>

              <button
                onClick={() => setShowCategoryPicker(true)}
                className="w-full py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📋</span>
                Report Other
              </button>

              <button
                onClick={() => setViewState('my-reports')}
                className="w-full py-4 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-colors border border-slate-200"
              >
                {t('walker.myReportsWithCount', { count: myReports.length }, `My Reports (${myReports.length})`)}
              </button>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-2">{t('walker.tipsForReporting', {}, 'Tips for reporting')}</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• {t('walker.tip1', {}, 'Check the map for recent reports before submitting')}</li>
                <li>• {t('walker.tip2', {}, 'Be as accurate as possible with the location')}</li>
                <li>• {t('walker.tip3', {}, 'Note any markings or ear tags if visible')}</li>
                <li>• {t('walker.tip4', {}, 'Report injured sheep as priority')}</li>
                <li>• {t('walker.tip5', {}, "Don't approach aggressive animals")}</li>
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
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Where did you spot the {activeCategory ? activeCategory.name.toLowerCase() : 'sheep'}?
                </h2>
                <p className="text-slate-600 mb-4">
                  Tap on the map to mark the location. Recent reports (last 12 hours) are shown as {activeCategory ? activeCategory.emoji : '🐑'} markers.
                </p>
                
                {/* Location Button */}
                <LocationButton 
                  onLocationFound={(lat, lng) => {
                    handleMapClick(lat, lng)
                  }}
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
                      ...getRecentAlerts().map(r => ({
                        id: r.id,
                        position: [r.location.lat, r.location.lng] as [number, number],
                        popup: `${r.categoryEmoji || '🐑'} ${r.sheepCount} ${r.categoryName || 'sheep'} reported ${new Date(r.timestamp).toLocaleTimeString()}`,
                        type: 'sheep' as const,
                        status: r.status as 'reported' | 'claimed' | 'resolved',
                        emoji: r.categoryEmoji || '🐑',
                      })),
                      // Show selected location with category emoji
                      ...(draftReport.location ? [{
                        id: 'selected',
                        position: [draftReport.location.lat, draftReport.location.lng] as [number, number],
                        popup: 'Your report location',
                        type: 'selected' as const,
                        emoji: activeCategory?.emoji || '🐑',
                      }] : [])
                    ]}
                  />
                </div>
                {draftReport.location && (
                  <p className="text-sm text-green-600 mb-2">
                    📍 {t('walker.locationSelected', {}, 'Location selected')}
                  </p>
                )}
                {nearbyReports.length > 0 && draftReport.location && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-amber-800 text-sm">
                      ⚠️ {t('walker.nearbyReportsExist', { count: nearbyReports.length }, `${nearbyReports.length} report(s) already exist within 100m of this location in the last 12 hours.`)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {currentReportStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Tell us about the {activeCategory ? activeCategory.name.toLowerCase() : 'sheep'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {activeCategory ? (activeCategory.countLabel || 'Quantity') : t('walker.sheepCount', {}, 'Number of sheep')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={draftReport.sheepCount || 1}
                      onChange={(e) => updateDraftReport({ sheepCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('walker.condition', {}, 'Condition')}
                    </label>
                    <select
                      value={draftReport.condition || ''}
                      onChange={(e) => updateDraftReport({ condition: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {activeCategory ? (
                        <>
                          <option value="">Select condition...</option>
                          {activeCategory.conditions.map((cond) => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value="healthy">{t('walker.conditionHealthy', {}, 'Healthy - looks fine')}</option>
                          <option value="injured">{t('walker.conditionInjured', {}, 'Injured - needs attention')}</option>
                          <option value="dead">{t('walker.conditionDead', {}, 'Dead - needs collection')}</option>
                          <option value="unknown">{t('walker.conditionUnknown', {}, 'Not sure')}</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('walker.additionalDetails', {}, 'Additional details (optional)')}
                    </label>
                    <textarea
                      value={draftReport.description || ''}
                      onChange={(e) => updateDraftReport({ description: e.target.value })}
                      placeholder={t('walker.detailsPlaceholder', {}, 'e.g., Near the old stone wall, white sheep with black face, ear tag visible...')}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('walker.photos', {}, 'Photos (optional)')}
                    </label>
                    <PhotoUpload
                      reportId={draftReport.id || 'temp'}
                      onPhotosUploaded={(urls) => updateDraftReport({ photoUrls: urls })}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {t('walker.photoHelp', {}, 'Photos help farmers identify the sheep. Max 3 photos.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact (optional for guests, shows notification benefit) */}
            {currentReportStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  {t('walker.wantNotified', {}, 'Want to be notified? 🔔')}
                </h2>
                <p className="text-slate-600 mb-4">
                  {currentUserId
                    ? t('walker.contactInstructionLoggedIn', {}, 'The farmer may want to reach out for more details about the location.')
                    : t('walker.contactInstructionGuest', {}, 'Leave your contact details to be notified when the sheep is successfully returned to the farmer!')
                  }
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {currentUserId ? t('walker.name', {}, 'Name') : t('walker.nameOptional', {}, 'Name (optional)')}
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={t('walker.namePlaceholder', {}, 'Your name')}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('walker.email', {}, 'Email (for thank you notification)')}
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder={t('walker.emailPlaceholder', {}, 'your@email.com')}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('walker.phone', {}, 'Phone (optional)')}
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder={t('walker.phonePlaceholder', {}, '+44 7700 900000')}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-green-800 text-sm">
                    💌 {t('walker.thankYouMessage', {}, "We'll send you a thank you message when the farmer claims your report and recovers the sheep!")}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  {t('walker.privacyNote', {}, 'Your contact info will only be used for notifications and may be shared with farmers in the area. Leave blank to report anonymously.')}
                </p>
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentReportStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  {t('walker.confirmReport', {}, 'Confirm your report')}
                </h2>
                <div className="bg-white rounded-xl p-4 shadow space-y-3 border border-slate-200">
                  {activeCategory && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Category</span>
                      <span className="text-slate-800 font-medium">{activeCategory.emoji} {activeCategory.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{t('walker.location', {}, 'Location')}</span>
                    <span className="text-slate-800 font-medium">
                      {draftReport.location?.lat.toFixed(5)}, {draftReport.location?.lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      {activeCategory ? (activeCategory.countLabel || 'Quantity') : t('walker.sheepCount', {}, 'Sheep count')}
                    </span>
                    <span className="text-slate-800 font-medium">{draftReport.sheepCount || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{t('walker.condition', {}, 'Condition')}</span>
                    <span className="text-slate-800 font-medium capitalize">{draftReport.condition || 'Unknown'}</span>
                  </div>
                  {draftReport.description && (
                    <div>
                      <span className="text-sm text-slate-500">{t('walker.details', {}, 'Details')}</span>
                      <p className="text-slate-800 mt-1">{draftReport.description}</p>
                    </div>
                  )}
                  {draftReport.reporterContact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">{t('walker.contact', {}, 'Contact')}</span>
                      <span className="text-slate-800 font-medium">{draftReport.reporterContact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleNextStep}
                disabled={currentReportStep === 1 && !draftReport.location}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {currentReportStep === 4 ? t('walker.submitReport', {}, '✓ Submit Report') : t('walker.continue', {}, 'Continue →')}
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                {currentReportStep === 1 ? t('walker.cancel', {}, 'Cancel') : t('walker.back', {}, '← Back')}
              </button>
            </div>
          </>
        )}

        {/* ===== MY REPORTS VIEW ===== */}
        {viewState === 'my-reports' && (
          <>
            {/* Thank You messages from farmers */}
            {thankYouMessages.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-amber-800">💌 Messages from Farmers ({thankYouMessages.length})</h3>
                  {thankYouMessages.some(m => !m.read_at) && (
                    <button
                      onClick={async () => {
                        if (currentUserId) {
                          await markAllNotificationsRead(currentUserId)
                          setThankYouMessages(prev => prev.map(m => ({ ...m, read_at: m.read_at || new Date().toISOString() })))
                        }
                      }}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {thankYouMessages.map(msg => {
                    const report = myReports.find(r => r.id === msg.report_id)
                    const isUnread = !msg.read_at
                    return (
                      <div key={msg.id} className={`rounded-lg p-3 text-sm ${isUnread ? 'bg-white border border-amber-300 shadow-sm' : 'bg-amber-50/60'}`}>
                        {isUnread && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2" />}
                        <p className="text-slate-700 italic">&ldquo;{msg.message_text || 'Thank you!'}&rdquo;</p>
                        {report && (
                          <p className="text-xs text-slate-400 mt-1">
                            Re: {report.categoryEmoji} {report.categoryName} · {new Date(msg.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {myReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐑</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('walker.noReportsYet', {}, 'No reports yet')}</h3>
                <p className="text-slate-600 mb-6">
                  {t('walker.noReportsMessage', {}, 'Spot some sheep and submit a report to help farmers!')}
                </p>
                <button
                  onClick={handleStartReport}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                  {t('walker.reportASheep', {}, 'Report a Sheep')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl p-4 shadow border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          🐑 {t('walker.sheepSpotted', { count: report.sheepCount }, `${report.sheepCount} sheep spotted`)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(report.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    {report.description && (
                      <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                    )}
                    {report.photoUrls && report.photoUrls.length > 0 && (
                      <div className="mt-3">
                        <PhotoGallery photos={report.photoUrls} className="max-w-xs" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
