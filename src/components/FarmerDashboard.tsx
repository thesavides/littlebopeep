'use client'

import { useState, useEffect } from 'react'
import { useAppStore, Farm, FarmField, MAP_CONFIG, isReportNearFarm } from '@/store/appStore'
import { supabase, fetchUserNotifications, markAllNotificationsRead, markReportNotificationsRead, NotificationDB, sendThankYouMessage } from '@/lib/supabase-client'
import { useTranslation } from '@/contexts/TranslationContext'
import Header from './Header'
import Map from './Map'
import BottomNav from './BottomNav'
import ProfileDrawer from './ProfileDrawer'
import Button from './Button'
import { btn, input, label as labelCls, card, badge as statusBadge } from '@/lib/ui'

type ViewState = 'dashboard' | 'register' | 'create-farm' | 'add-field' | 'view-farm' | 'subscription' | 'notifications'
type RegistrationStep = 1 | 2 | 3 | 4 | 5

export default function FarmerDashboard() {
  const { t } = useTranslation()
  const {
    currentUserId,
    farms,
    reports,
    users,
    addFarm,
    updateFarm,
    deleteFarm,
    addField,
    deleteField,
    claimReport,
    unclaimReport,
    resolveReport,
    reopenReport,
    flagReportToAdmin,
    getFarmsByFarmerId,
    getCurrentUser,
    updateUser,
    startTrial,
    cancelSubscription,
    reportCategories,
    updateFarmCategorySubscription,
    loadReports,
    loadFarms,
  } = useAppStore()

  // Supabase profile for the current user (pre-populates form fields correctly
  // for admin-invited farmers who aren't in the local Zustand users array)
  const [supabaseProfile, setSupabaseProfile] = useState<{
    full_name?: string; email?: string; phone?: string
  } | null>(null)
  const [farmsLoaded, setFarmsLoaded] = useState(false)
  const [farmerNotifications, setFarmerNotifications] = useState<NotificationDB[]>([])
  const unreadCount = farmerNotifications.filter(n => !n.read_at).length
  // Thank You message state — keyed by reportId
  const [thankYouOpen, setThankYouOpen] = useState<string | null>(null)
  const [thankYouText, setThankYouText] = useState('')
  const [thankYouSent, setThankYouSent] = useState<Set<string>>(new Set())
  const [sendingThankYou, setSendingThankYou] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Resolve reason state
  const [resolveOpen, setResolveOpen] = useState<string | null>(null)
  const [resolveReason, setResolveReason] = useState('resolved')
  // Flag-to-admin state
  const [flagOpen, setFlagOpen] = useState<string | null>(null)
  const [flagNote, setFlagNote] = useState('')
  // Message-admin-on-complete state
  const [messageAdminOpen, setMessageAdminOpen] = useState<string | null>(null)
  const [messageAdminText, setMessageAdminText] = useState('')

  const currentUser = getCurrentUser()

  // Always start at 'register' until we know the farmer's farm count
  const [viewState, setViewState] = useState<ViewState>('register')
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(1)

  // Registration form state (initially empty; filled once supabaseProfile loads)
  const [formData, setFormData] = useState({
    farmName: '',
    contactName: '',
    email: '',
    phone: '',
    billingLine1: '',
    billingLine2: '',
    billingCity: '',
    billingCounty: '',
    billingPostcode: '',
    physicalLat: 0,
    physicalLng: 0,
    // Payment fields
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  })
  
  // Farm creation state
  const [farmName, setFarmName] = useState('')
  const [alertBuffer, setAlertBuffer] = useState(500)
  
  // Field creation state
  const [fieldName, setFieldName] = useState('')
  const [fencePosts, setFencePosts] = useState<Array<{ lat: number; lng: number }>>([])
  
  const [farmerLocation, setFarmerLocation] = useState<[number, number] | null>(null)

  // Load farms from Supabase and fetch the current user's profile on mount
  useEffect(() => {
    const init = async () => {
      await loadReports()
      await loadFarms()
      setFarmsLoaded(true)

      // Fetch Supabase profile for pre-population (works for admin-invited farmers
      // who aren't in the local Zustand users mock array)
      if (currentUserId) {
        const { data } = await supabase
          .from('user_profiles')
          .select('full_name, email, phone')
          .eq('id', currentUserId)
          .single()
        if (data) {
          setSupabaseProfile(data)
          setFormData((prev) => ({
            ...prev,
            contactName: data.full_name || prev.contactName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }))
        }

        // Load notifications
        const notifs = await fetchUserNotifications(currentUserId)
        setFarmerNotifications(notifs)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFarmerLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      )
    }
  }, [])

  const myFarms = currentUserId ? getFarmsByFarmerId(currentUserId) : []
  const selectedFarm = myFarms.find(f => f.id === selectedFarmId)
  
  const allFieldPolygons = myFarms.flatMap(farm => 
    farm.fields.map(field => ({
      id: field.id,
      positions: field.fencePosts.map(p => [p.lat, p.lng] as [number, number]),
      color: '#9ED663'
    }))
  )

  // A farmer only sees reports near their defined fields.
  // If they have no fields on any farm, they see nothing (with a prompt to add fields).
  const farmsWithFields = myFarms.filter(f => f.fields.length > 0)
  const hasFields = farmsWithFields.length > 0

  const relevantReports = hasFields
    ? reports.filter(r =>
        !r.archived &&
        r.status !== 'escalated' && // escalated is admin-only; farmers see it as resolved
        farmsWithFields.some(farm => isReportNearFarm(r, farm))
      )
    : []

  const reportedAlerts = relevantReports.filter(r => r.status === 'reported')
  // Multi-claim: farmer sees report in claimed if they are in claimedByFarmerIds
  const claimedAlerts = relevantReports.filter(r =>
    r.status === 'claimed' &&
    (r.claimedByFarmerIds?.includes(currentUserId || '') || r.claimedByFarmerId === currentUserId)
  )
  const resolvedAlerts = relevantReports.filter(r =>
    r.status === 'resolved' &&
    (r.claimedByFarmerIds?.includes(currentUserId || '') || r.claimedByFarmerId === currentUserId)
  )
  const completeAlerts = relevantReports.filter(r =>
    r.status === 'complete' &&
    (r.claimedByFarmerIds?.includes(currentUserId || '') || r.claimedByFarmerId === currentUserId)
  )

  // Once farms are loaded from Supabase, decide whether to show the dashboard
  // or the registration flow.  Farmers with existing farms (assigned by admin
  // or created previously) go straight to the dashboard.
  useEffect(() => {
    if (!farmsLoaded) return
    const hasFarms = myFarms.length > 0
    const hasSubscription = !!currentUser?.subscriptionStatus
    if (hasFarms || hasSubscription) {
      setViewState('dashboard')
    }
    // If no farms and no subscription, stay in 'register' (the initial state)
  }, [farmsLoaded, farms])

  const handleBack = () => {
    if (viewState === 'add-field') {
      setViewState('view-farm')
      setFencePosts([])
      setFieldName('')
    } else if (viewState === 'view-farm') {
      setViewState('dashboard')
      setSelectedFarmId(null)
    } else if (viewState === 'register') {
      if (registrationStep > 1) {
        setRegistrationStep((registrationStep - 1) as RegistrationStep)
      }
    } else {
      setViewState('dashboard')
      setFencePosts([])
      setFieldName('')
      setFarmName('')
    }
  }

  const handleRegistrationNext = () => {
    if (registrationStep < 5) {
      setRegistrationStep((registrationStep + 1) as RegistrationStep)
    }
  }

  const handleCompleteRegistration = () => {
    if (currentUserId) {
      // Update user with billing info
      updateUser(currentUserId, {
        email: formData.email,
        phone: formData.phone,
        billingAddress: {
          line1: formData.billingLine1,
          line2: formData.billingLine2,
          city: formData.billingCity,
          county: formData.billingCounty,
          postcode: formData.billingPostcode
        },
        physicalAddress: formData.physicalLat ? {
          lat: formData.physicalLat,
          lng: formData.physicalLng
        } : undefined
      })
      
      // Start trial
      startTrial(currentUserId)
      
      // Create first farm if name provided
      if (formData.farmName) {
        addFarm({
          farmerId: currentUserId,
          name: formData.farmName,
          fields: [],
          alertBufferMeters: 500,
          alertsEnabled: true
        })
      }
      
      setViewState('dashboard')
    }
  }

  const handleCreateFarm = () => {
    if (farmName.trim() && currentUserId) {
      addFarm({
        farmerId: currentUserId,
        name: farmName.trim(),
        fields: [],
        alertBufferMeters: alertBuffer,
        alertsEnabled: true
      })
      setFarmName('')
      setAlertBuffer(500)
      setViewState('dashboard')
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (viewState === 'register' && registrationStep === 2) {
      setFormData({ ...formData, physicalLat: lat, physicalLng: lng })
    } else {
      setFencePosts([...fencePosts, { lat, lng }])
    }
  }

  const handleUndoPost = () => setFencePosts(fencePosts.slice(0, -1))
  const handleClearPosts = () => setFencePosts([])

  const handleSaveField = () => {
    if (selectedFarmId && fieldName.trim() && fencePosts.length >= 3) {
      addField(selectedFarmId, { name: fieldName.trim(), fencePosts })
      setFieldName('')
      setFencePosts([])
      setViewState('view-farm')
    }
  }

  const handleViewFarm = (farmId: string) => {
    setSelectedFarmId(farmId)
    setViewState('view-farm')
  }

  const getTitle = () => {
    switch (viewState) {
      case 'register': return t('farmer.registrationStep', { step: registrationStep, total: 5 }, `Registration (Step ${registrationStep}/5)`)
      case 'create-farm': return t('farmer.createFarm', {}, 'Create Farm')
      case 'add-field': return t('farmer.addField', {}, 'Add Field')
      case 'subscription': return t('farmer.subscription', {}, 'Subscription')
      case 'notifications': return t('farmer.notificationPreferences', {}, 'Notification Preferences')
      case 'view-farm': return selectedFarm?.name || t('farmer.farm', {}, 'Farm')
      default: return ''
    }
  }

  const canSaveField = fieldName.trim() && fencePosts.length >= 3

  const handleSendThankYou = async (reportId: string, reporterId: string | undefined) => {
    if (!reporterId) return
    setSendingThankYou(true)
    try {
      const msg = thankYouText.trim() || 'Thank you for reporting this — the animals have been safely recovered!'
      await sendThankYouMessage(reporterId, reportId, msg)
      setThankYouSent(prev => new Set(prev).add(reportId))
      setThankYouOpen(null)
      setThankYouText('')
    } catch {
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingThankYou(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#D1D9C5]">
      <Header 
        showBackButton={viewState !== 'dashboard' && !(viewState === 'register' && registrationStep === 1)} 
        onBack={handleBack}
        title={getTitle()}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {/* ===== REGISTRATION ===== */}
        {viewState === 'register' && (
          <div className="max-w-md mx-auto">
            {/* Progress bar */}
            <div className="h-2 bg-[#D1D9C5] rounded-full mb-6">
              <div className="h-full bg-[#7D8DCC] rounded-full transition-all" style={{ width: `${(registrationStep / 5) * 100}%` }} />
            </div>

            {/* Step 1: Contact Details */}
            {registrationStep === 1 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-[#614270] mb-4">{t('farmer.contactDetails', {}, 'Contact Details')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.farmNameLabel', {}, 'Farm Name *')}</label>
                    <input type="text" value={formData.farmName} onChange={(e) => setFormData({...formData, farmName: e.target.value})} placeholder={t('farmer.farmNamePlaceholder', {}, 'e.g., Green Valley Farm')} className={input} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.yourNameLabel', {}, 'Your Name *')}</label>
                    <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className={input} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.emailLabel', {}, 'Email *')}</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={input} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.phoneLabel', {}, 'Phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={input} />
                  </div>
                </div>
                <Button variant="secondary" onClick={handleRegistrationNext} disabled={!formData.farmName || !formData.email} className="mt-6">{t('farmer.continue', {}, 'Continue')}</Button>
                <button
                  onClick={() => setViewState('dashboard')}
                  className="w-full mt-3 py-2 text-sm text-[#92998B] hover:text-[#614270]"
                >
                  {t('farmer.skipForNow', {}, 'Skip for now — I\'ll add a farm later')}
                </button>
              </div>
            )}

            {/* Step 2: Physical Location */}
            {registrationStep === 2 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-[#614270] mb-2">{t('farmer.farmLocation', {}, 'Farm Location')}</h2>
                <p className="text-[#614270] text-sm mb-4">{t('farmer.farmLocationInstruction', {}, "Tap the map to mark your farm's physical location.")}</p>
                <div className="h-64 rounded-lg overflow-hidden mb-4">
                  <Map
                    center={formData.physicalLat ? [formData.physicalLat, formData.physicalLng] : MAP_CONFIG.DEFAULT_CENTER}
                    zoom={formData.physicalLat ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                    onClick={handleMapClick}
                    markers={formData.physicalLat ? [{
                      id: 'location',
                      position: [formData.physicalLat, formData.physicalLng] as [number, number],
                      popup: formData.farmName
                    }] : []}
                  />
                </div>
                {formData.physicalLat > 0 && <p className="text-sm text-[#9ED663] mb-4">{t('farmer.locationSet', {}, '📍 Location set')}</p>}
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl">{t('farmer.back', {}, 'Back')}</button>
                  <button onClick={handleRegistrationNext} className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold">{t('farmer.continue', {}, 'Continue')}</button>
                </div>
              </div>
            )}

            {/* Step 3: Billing Address */}
            {registrationStep === 3 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-[#614270] mb-4">{t('farmer.billingAddress', {}, 'Billing Address')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.addressLine1Label', {}, 'Address Line 1 *')}</label>
                    <input type="text" value={formData.billingLine1} onChange={(e) => setFormData({...formData, billingLine1: e.target.value})} className={input} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.addressLine2Label', {}, 'Address Line 2')}</label>
                    <input type="text" value={formData.billingLine2} onChange={(e) => setFormData({...formData, billingLine2: e.target.value})} className={input} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.cityLabel', {}, 'City *')}</label>
                      <input type="text" value={formData.billingCity} onChange={(e) => setFormData({...formData, billingCity: e.target.value})} className={input} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.countyLabel', {}, 'County')}</label>
                      <input type="text" value={formData.billingCounty} onChange={(e) => setFormData({...formData, billingCounty: e.target.value})} className={input} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.postcodeLabel', {}, 'Postcode *')}</label>
                    <input type="text" value={formData.billingPostcode} onChange={(e) => setFormData({...formData, billingPostcode: e.target.value})} className={input} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl">{t('farmer.back', {}, 'Back')}</button>
                  <button onClick={handleRegistrationNext} disabled={!formData.billingLine1 || !formData.billingCity || !formData.billingPostcode} className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold disabled:bg-[#D1D9C5]">{t('farmer.continue', {}, 'Continue')}</button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Details */}
            {registrationStep === 4 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-[#614270] mb-2">{t('farmer.paymentSetup', {}, 'Payment Setup')}</h2>
                <p className="text-[#614270] text-sm mb-4">{t('farmer.paymentInstruction', {}, 'Your card will not be charged until after your 30-day free trial ends.')}</p>

                <div className="bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-lg p-3 mb-6">
                  <p className="text-sm text-[#614270]">{t('farmer.securePayment', {}, '🔒 Secure payment powered by Stripe')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.cardholderNameLabel', {}, 'Cardholder Name *')}</label>
                    <input type="text" value={formData.cardName} onChange={(e) => setFormData({...formData, cardName: e.target.value})} placeholder={t('farmer.cardholderNamePlaceholder', {}, 'Name on card')} className={input} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.cardNumberLabel', {}, 'Card Number *')}</label>
                    <input type="text" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})} placeholder={t('farmer.cardNumberPlaceholder', {}, '1234 5678 9012 3456')} className={`${input} font-mono`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.expiryLabel', {}, 'Expiry *')}</label>
                      <input type="text" value={formData.cardExpiry} onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})} placeholder={t('farmer.expiryPlaceholder', {}, 'MM/YY')} className={input} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#614270] mb-1">{t('farmer.cvcLabel', {}, 'CVC *')}</label>
                      <input type="text" value={formData.cardCvc} onChange={(e) => setFormData({...formData, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4)})} placeholder={t('farmer.cvcPlaceholder', {}, '123')} className={input} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#D1D9C5] rounded-lg p-4 mt-6 text-sm text-[#614270]">
                  <p className="font-medium text-[#614270] mb-1">{t('farmer.subscriptionDetailsHeading', {}, 'Subscription Details:')}</p>
                  <p>{t('farmer.trialStarting', {}, '• 30-day free trial starting today')}</p>
                  <p>{t('farmer.priceAfterTrial', {}, '• £29.99/month after trial')}</p>
                  <p>{t('farmer.cancelAnytime', {}, '• Cancel anytime before trial ends')}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl">{t('farmer.back', {}, 'Back')}</button>
                  <button onClick={handleRegistrationNext} disabled={!formData.cardName || !formData.cardNumber || formData.cardNumber.length < 16 || !formData.cardExpiry || !formData.cardCvc} className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold disabled:bg-[#D1D9C5]">{t('farmer.continue', {}, 'Continue')}</button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Subscribe */}
            {registrationStep === 5 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-[#614270] mb-4">{t('farmer.reviewConfirm', {}, 'Review & Confirm')}</h2>

                <div className="space-y-4 mb-6">
                  <div className="bg-[#D1D9C5] rounded-lg p-4">
                    <h3 className="font-medium text-[#614270] mb-2">{t('farmer.farmDetails', {}, 'Farm Details')}</h3>
                    <div className="text-sm space-y-1 text-[#614270]">
                      <p><strong>{t('farmer.farmLabel', {}, 'Farm:')}</strong> {formData.farmName}</p>
                      <p><strong>{t('farmer.contactLabel', {}, 'Contact:')}</strong> {formData.contactName}</p>
                      <p><strong>{t('farmer.emailDisplayLabel', {}, 'Email:')}</strong> {formData.email}</p>
                      {formData.phone && <p><strong>{t('farmer.phoneDisplayLabel', {}, 'Phone:')}</strong> {formData.phone}</p>}
                    </div>
                  </div>

                  <div className="bg-[#D1D9C5] rounded-lg p-4">
                    <h3 className="font-medium text-[#614270] mb-2">{t('farmer.billingAddressHeading', {}, 'Billing Address')}</h3>
                    <div className="text-sm text-[#614270]">
                      <p>{formData.billingLine1}</p>
                      {formData.billingLine2 && <p>{formData.billingLine2}</p>}
                      <p>{formData.billingCity}, {formData.billingCounty} {formData.billingPostcode}</p>
                    </div>
                  </div>

                  <div className="bg-[#D1D9C5] rounded-lg p-4">
                    <h3 className="font-medium text-[#614270] mb-2">{t('farmer.paymentMethod', {}, 'Payment Method')}</h3>
                    <div className="text-sm text-[#614270]">
                      <p>{t('farmer.cardEnding', { last4: formData.cardNumber.slice(-4) }, `💳 Card ending in ${formData.cardNumber.slice(-4)}`)}</p>
                      <p>{t('farmer.expires', { expiry: formData.cardExpiry }, `Expires ${formData.cardExpiry}`)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#D1D9C5] border border-[#D1D9C5] rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-[#614270] mb-2">{t('farmer.freeTrialHeading', {}, '🎉 30-Day Free Trial')}</h3>
                  <div className="text-sm text-[#614270] space-y-1">
                    <p>{t('farmer.trialStartsToday', {}, '• Your trial starts today')}</p>
                    <p dangerouslySetInnerHTML={{ __html: t('farmer.firstCharge', { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() }, `• First charge: <strong>£29.99</strong> on <strong>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>`) }} />
                    <p>{t('farmer.cancelFromDashboard', {}, '• Cancel anytime from your dashboard')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl">{t('farmer.back', {}, 'Back')}</button>
                  <button onClick={handleCompleteRegistration} className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold">{t('farmer.startFreeTrial', {}, 'Start Free Trial')}</button>
                </div>

                <p className="text-xs text-[#92998B] text-center mt-4">
                  {t('farmer.termsAgreement', {}, 'By clicking "Start Free Trial", you agree to our Terms of Service and authorize us to charge your card £29.99/month after the trial period unless you cancel.')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {viewState === 'dashboard' && (
          <>
            {/* Subscription Banner */}
            {currentUser?.subscriptionStatus === 'trial' && currentUser.trialEndsAt && (
              <div className="bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-[#614270]">{t('farmer.freeTrialActive', {}, 'Free Trial Active')}</h3>
                    <p className="text-sm text-[#7D8DCC]">{t('farmer.ends', { date: new Date(currentUser.trialEndsAt).toLocaleDateString() }, `Ends ${new Date(currentUser.trialEndsAt).toLocaleDateString()}`)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewState('subscription')} className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm">{t('farmer.manage', {}, 'Manage')}</button>
                    <button onClick={async () => {
                      setViewState('notifications')
                      // Auto-clear unread new_report notifications on open (spec: cleared on open)
                      if (currentUserId && unreadCount > 0) {
                        await markAllNotificationsRead(currentUserId)
                        setFarmerNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString(), status: 'read' })))
                      }
                    }} className="relative px-4 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#92998B]/20">
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FA9335] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No farms prompt */}
            {myFarms.length === 0 && (
              <div className="bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-xl p-6 mb-6 text-center">
                <div className="text-5xl mb-3">🏡</div>
                <h3 className="font-semibold text-[#614270] mb-2">{t('farmer.addYourFarmFields', {}, 'Add Your Farm Fields')}</h3>
                <p className="text-[#614270] mb-4">{t('farmer.drawFieldsInstruction', {}, 'Draw your field boundaries to start receiving alerts.')}</p>
                <button onClick={() => setViewState('create-farm')} className="px-6 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold">{t('farmer.addFarm', {}, 'Add Farm')}</button>
              </div>
            )}

            {/* My Farms List */}
            {myFarms.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-[#614270]">{t('farmer.myFarms', {}, 'My Farms')}</h2>
                  <button onClick={() => setViewState('create-farm')} className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm">{t('farmer.addFarmButton', {}, '+ Add Farm')}</button>
                </div>
                <div className="space-y-3">
                  {myFarms.map((farm) => (
                    <button key={farm.id} onClick={() => handleViewFarm(farm.id)} className="w-full bg-white rounded-xl p-4 shadow border text-left hover:border-[#7D8DCC]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-[#614270]">{farm.name}</h3>
                          <p className="text-sm text-[#92998B]">{t('farmer.fieldCount', { count: farm.fields.length, buffer: farm.alertBufferMeters }, `${farm.fields.length} field(s) • Alert buffer: ${farm.alertBufferMeters}m`)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${farm.alertsEnabled ? 'bg-[#9ED663]/20 text-[#614270]' : 'bg-[#D1D9C5] text-[#92998B]'}`}>
                          {farm.alertsEnabled ? t('farmer.alertsOn', {}, 'Alerts On') : t('farmer.alertsOff', {}, 'Off')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map Overview */}
            {myFarms.length > 0 && (
              <div className="h-64 rounded-xl overflow-hidden shadow mb-6">
                <Map
                  center={farmerLocation ?? (myFarms[0]?.fields[0]?.fencePosts[0] ? [myFarms[0].fields[0].fencePosts[0].lat, myFarms[0].fields[0].fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER)}
                  zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                  markers={[
                    ...(farmerLocation ? [{
                      id: 'farmer-location',
                      position: farmerLocation,
                      popup: '📍 Your location',
                      type: 'farmer-location' as const,
                    }] : []),
                    ...relevantReports.map((r) => {
                      const cat = reportCategories.find(c => c.id === r.categoryId)
                      return {
                        id: r.id,
                        position: [r.location.lat, r.location.lng] as [number, number],
                        popup: `${cat?.emoji || r.categoryEmoji || '🐑'} ${r.sheepCount} ${cat?.name || r.categoryName || ''} - ${r.status}`,
                        type: 'sheep' as const,
                        status: r.status as 'reported' | 'claimed' | 'resolved',
                        emoji: cat?.emoji || r.categoryEmoji || '🐑',
                        imageUrl: cat?.imageUrl || r.categoryImageUrl,
                      }
                    })
                  ]}
                  polygons={allFieldPolygons}
                />
              </div>
            )}

            {/* No fields prompt */}
            {myFarms.length > 0 && !hasFields && (
              <div className="mb-6 bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-xl p-5">
                <h3 className="font-semibold text-[#614270] mb-1">📍 Add fields to see nearby reports</h3>
                <p className="text-sm text-[#614270] mb-3">
                  You have {myFarms.length} farm{myFarms.length > 1 ? 's' : ''} but no fields mapped yet. Reports are only shown when they fall within your field boundaries and alert buffer.
                </p>
                <button
                  onClick={() => { setSelectedFarmId(myFarms[0].id); setViewState('view-farm') }}
                  className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm font-semibold hover:bg-[#614270]"
                >
                  Map your fields →
                </button>
              </div>
            )}

            {/* Alerts */}
            <div className="mb-6">
              <h2 className="font-semibold text-[#614270] mb-3">{t('farmer.reportedSheep', { count: reportedAlerts.length }, `Reported Sheep (${reportedAlerts.length})`)}</h2>
              {reportedAlerts.length === 0 ? (
                <div className="bg-[#D1D9C5] rounded-xl p-4 text-center text-[#614270]">
                  {!hasFields ? t('farmer.noFieldsMapped', {}, 'Map your fields above to start receiving alerts.') : t('farmer.noNewReports', {}, 'No new reports. All clear! 🎉')}
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#614270]">{t('farmer.sheepSpotted', { count: report.sheepCount }, `🐑 ${report.sheepCount} sheep spotted`)}</h3>
                          <p className="text-sm text-[#92998B]">{new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      {report.description && <p className="text-sm text-[#614270] mb-3">{report.description}</p>}
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          claimReport(report.id)
                          // Auto-clear the notification for this report when farmer claims it
                          if (currentUserId) {
                            await markReportNotificationsRead(currentUserId, report.id)
                            setFarmerNotifications(prev => prev.map(n =>
                              n.report_id === report.id ? { ...n, read_at: n.read_at || new Date().toISOString(), status: 'read' } : n
                            ))
                          }
                        }} className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm">{t('farmer.claim', {}, 'Claim')}</button>
                        <button onClick={() => resolveReport(report.id)} className="flex-1 py-2 bg-[#9ED663] text-white rounded-lg text-sm">{t('farmer.resolved', {}, 'Resolved')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claimed */}
            {claimedAlerts.length > 0 && (
              <div>
                <h2 className="font-semibold text-[#614270] mb-3">{t('farmer.myClaimed', { count: claimedAlerts.length }, `My Claimed (${claimedAlerts.length})`)}</h2>
                <div className="space-y-3">
                  {claimedAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-[#7D8DCC]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#614270]">{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'}</h3>
                          <p className="text-sm text-[#92998B]">{new Date(report.timestamp).toLocaleString()}</p>
                          {report.description && <p className="text-xs text-[#92998B] mt-1">{report.description}</p>}
                          {(report.claimedByFarmerIds?.length || 0) > 1 && (
                            <p className="text-xs text-[#7D8DCC] mt-1">🤝 {report.claimedByFarmerIds!.length} farmers have claimed this report</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => { setResolveOpen(report.id); setResolveReason('resolved') }}
                          className="flex-1 py-2 bg-[#9ED663] text-white rounded-lg text-sm"
                        >
                          {t('farmer.markResolved', {}, 'Mark Resolved')}
                        </button>
                        <button
                          onClick={() => unclaimReport(report.id)}
                          className="px-3 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#92998B]/20"
                        >
                          Unclaim
                        </button>
                        <button
                          onClick={() => { setFlagOpen(report.id); setFlagNote('') }}
                          className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20"
                        >
                          🚩 Flag
                        </button>
                        {report.reporterId && !thankYouSent.has(report.id) && (
                          <button
                            onClick={() => { setThankYouOpen(report.id); setThankYouText('') }}
                            className="px-3 py-2 bg-[#EADA69]/20 text-[#614270] rounded-lg text-sm hover:bg-[#EADA69]/40"
                          >
                            💌 Thank You
                          </button>
                        )}
                        {thankYouSent.has(report.id) && (
                          <span className="px-3 py-2 text-[#9ED663] text-sm font-medium">✓ Sent</span>
                        )}
                      </div>

                      {/* Resolve with reason */}
                      {resolveOpen === report.id && (
                        <div className="mt-3 bg-[#D1D9C5] rounded-lg p-3 space-y-2">
                          <p className="text-xs text-[#614270] font-medium">Select a resolution reason:</p>
                          <select
                            value={resolveReason}
                            onChange={(e) => setResolveReason(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-[#D1D9C5] rounded-lg bg-white"
                          >
                            <option value="resolved">Resolved</option>
                            <option value="resolved_nothing">Resolved — Nothing to do</option>
                            <option value="resolved_insufficient">Resolved — Insufficient information</option>
                            <option value="resolved_invalid">Resolved — Invalid report</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { resolveReport(report.id, resolveReason); setResolveOpen(null) }}
                              className="px-4 py-2 bg-[#9ED663] text-white rounded-lg text-sm hover:bg-[#614270]"
                            >
                              Confirm
                            </button>
                            <button onClick={() => setResolveOpen(null)} className="px-4 py-2 bg-white text-[#614270] rounded-lg text-sm border">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Flag to admin */}
                      {flagOpen === report.id && (
                        <div className="mt-3 bg-[#FA9335]/10 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-[#FA9335] font-medium">Describe the issue for admin review:</p>
                          <textarea
                            value={flagNote}
                            onChange={(e) => setFlagNote(e.target.value)}
                            placeholder="e.g. Location appears incorrect, suspicious submission…"
                            className="w-full text-sm px-3 py-2 border border-[#FA9335]/30 rounded-lg resize-none h-16"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => { if (flagNote.trim()) { flagReportToAdmin(report.id, flagNote.trim()); setFlagOpen(null) } }}
                              disabled={!flagNote.trim()}
                              className="px-4 py-2 bg-[#FA9335] text-white rounded-lg text-sm hover:bg-[#614270] disabled:opacity-50"
                            >
                              Submit Flag
                            </button>
                            <button onClick={() => setFlagOpen(null)} className="px-4 py-2 bg-white text-[#614270] rounded-lg text-sm border">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Thank You compose */}
                      {thankYouOpen === report.id && (
                        <div className="mt-3 bg-[#EADA69]/20 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-[#614270] font-medium">Send an anonymous thank you to the walker who reported this:</p>
                          <textarea
                            value={thankYouText}
                            onChange={(e) => setThankYouText(e.target.value)}
                            placeholder="Thank you for reporting this — the animals have been safely recovered!"
                            className="w-full text-sm px-3 py-2 border border-[#EADA69]/40 rounded-lg resize-none h-20"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendThankYou(report.id, report.reporterId)}
                              disabled={sendingThankYou}
                              className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm hover:bg-[#614270] disabled:opacity-50"
                            >
                              {sendingThankYou ? 'Sending…' : 'Send'}
                            </button>
                            <button onClick={() => setThankYouOpen(null)} className="px-4 py-2 bg-white text-[#614270] rounded-lg text-sm border">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved — farmer can reopen */}
            {resolvedAlerts.length > 0 && (
              <div>
                <h2 className="font-semibold text-[#614270] mb-3">My Resolved ({resolvedAlerts.length})</h2>
                <div className="space-y-3">
                  {resolvedAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-[#9ED663]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#614270]">{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'}</h3>
                          <p className="text-sm text-[#92998B]">{new Date(report.timestamp).toLocaleString()}</p>
                          {report.resolutionReason && (
                            <p className="text-xs text-[#9ED663] mt-1">
                              {{
                                resolved: 'Resolved',
                                resolved_nothing: 'Resolved — Nothing to do',
                                resolved_insufficient: 'Resolved — Insufficient information',
                                resolved_invalid: 'Resolved — Invalid report',
                              }[report.resolutionReason] || report.resolutionReason}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-[#9ED663]/20 text-[#614270] font-medium">resolved</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => reopenReport(report.id)}
                          className="px-4 py-2 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded-lg text-sm hover:bg-[#7D8DCC]/20"
                        >
                          Reopen
                        </button>
                        <button
                          onClick={() => { setFlagOpen(report.id); setFlagNote('') }}
                          className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20"
                        >
                          🚩 Flag
                        </button>
                      </div>
                      {flagOpen === report.id && (
                        <div className="mt-3 bg-[#FA9335]/10 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-[#FA9335] font-medium">Describe the issue for admin review:</p>
                          <textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} className="w-full text-sm px-3 py-2 border border-[#FA9335]/30 rounded-lg resize-none h-16" />
                          <div className="flex gap-2">
                            <button onClick={() => { if (flagNote.trim()) { flagReportToAdmin(report.id, flagNote.trim()); setFlagOpen(null) } }} disabled={!flagNote.trim()} className="px-4 py-2 bg-[#FA9335] text-white rounded-lg text-sm disabled:opacity-50">Submit Flag</button>
                            <button onClick={() => setFlagOpen(null)} className="px-4 py-2 bg-white text-[#614270] rounded-lg text-sm border">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete — farmer can message admin requesting reopen */}
            {completeAlerts.length > 0 && (
              <div>
                <h2 className="font-semibold text-[#614270] mb-3">Completed ({completeAlerts.length})</h2>
                <div className="space-y-3">
                  {completeAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-[#92998B]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#614270]">{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'}</h3>
                          <p className="text-sm text-[#92998B]">{new Date(report.timestamp).toLocaleString()}</p>
                          {report.completedAt && <p className="text-xs text-[#92998B]">Completed {new Date(report.completedAt).toLocaleDateString('en-GB')}</p>}
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-[#D1D9C5] text-[#614270] font-medium">complete</span>
                      </div>
                      <button
                        onClick={() => { setMessageAdminOpen(report.id); setMessageAdminText('') }}
                        className="w-full py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#92998B]/20"
                      >
                        Request Reopen
                      </button>
                      {messageAdminOpen === report.id && (
                        <div className="mt-3 bg-[#D1D9C5] rounded-lg p-3 space-y-2">
                          <p className="text-xs text-[#614270] font-medium">Explain why this report should be reopened:</p>
                          <textarea
                            value={messageAdminText}
                            onChange={(e) => setMessageAdminText(e.target.value)}
                            placeholder="e.g. Animals were not recovered, additional animals found nearby…"
                            className="w-full text-sm px-3 py-2 border rounded-lg resize-none h-16"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!messageAdminText.trim() || !currentUserId) return
                                await sendThankYouMessage(currentUserId, report.id, `[Reopen request] ${messageAdminText.trim()}`)
                                setMessageAdminOpen(null)
                              }}
                              disabled={!messageAdminText.trim()}
                              className="px-4 py-2 bg-[#614270] text-white rounded-lg text-sm disabled:opacity-50"
                            >
                              Send to Admin
                            </button>
                            <button onClick={() => setMessageAdminOpen(null)} className="px-4 py-2 bg-white text-[#614270] rounded-lg text-sm border">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== CREATE FARM ===== */}
        {viewState === 'create-farm' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">{t('farmer.farmNameRequired', {}, 'Farm Name *')}</label>
              <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder={t('farmer.farmNameExample', {}, 'e.g., North Field')} className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">{t('farmer.alertBufferLabel', { buffer: alertBuffer }, `Alert Buffer Zone: ${alertBuffer}m`)}</label>
              <p className="text-sm text-[#92998B] mb-3">{t('farmer.alertBufferInstruction', {}, "You'll be alerted when sheep are spotted within this distance OUTSIDE your field boundaries.")}</p>
              <input type="range" min="100" max="2000" step="100" value={alertBuffer} onChange={(e) => setAlertBuffer(parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-[#92998B] mt-1"><span>100m</span><span>1km</span><span>2km</span></div>
            </div>
            <button onClick={handleCreateFarm} disabled={!farmName.trim()} className="w-full py-4 bg-[#7D8DCC] text-white rounded-xl font-semibold disabled:bg-[#D1D9C5]">{t('farmer.createFarmButton', {}, 'Create Farm')}</button>
          </div>
        )}

        {/* ===== VIEW FARM ===== */}
        {viewState === 'view-farm' && selectedFarm && (
          <div className="space-y-6">
            <div className="h-64 rounded-xl overflow-hidden shadow">
              <Map
                center={selectedFarm.fields[0]?.fencePosts[0] ? [selectedFarm.fields[0].fencePosts[0].lat, selectedFarm.fields[0].fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER}
                zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                markers={selectedFarm.fields.flatMap(field => field.fencePosts.map((post, idx) => ({
                  id: `${field.id}-${idx}`,
                  position: [post.lat, post.lng] as [number, number],
                  popup: `${field.name} - Post ${idx + 1}`,
                  type: 'fencepost' as const
                })))}
                polygons={selectedFarm.fields.map(field => ({
                  id: field.id,
                  positions: field.fencePosts.map(p => [p.lat, p.lng] as [number, number]),
                  color: '#9ED663'
                }))}
              />
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#614270]">{t('farmer.farmSettings', {}, 'Farm Settings')}</h3>
                <button onClick={() => updateFarm(selectedFarm.id, { alertsEnabled: !selectedFarm.alertsEnabled })} className={`px-3 py-1 rounded-lg text-sm ${selectedFarm.alertsEnabled ? 'bg-[#9ED663]/20 text-[#614270]' : 'bg-[#D1D9C5] text-[#92998B]'}`}>
                  {t('farmer.alertsOnOff', { status: selectedFarm.alertsEnabled ? t('farmer.on', {}, 'On') : t('farmer.off', {}, 'Off') }, `Alerts ${selectedFarm.alertsEnabled ? 'On' : 'Off'}`)}
                </button>
              </div>

              {/* Alert Buffer Slider */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-[#614270] mb-2" dangerouslySetInnerHTML={{ __html: t('farmer.alertBufferZoneLabel', { buffer: selectedFarm.alertBufferMeters }, `Alert Buffer Zone: <span class="text-[#7D8DCC] font-semibold">${selectedFarm.alertBufferMeters}m</span>`) }} />
                <p className="text-xs text-[#92998B] mb-3">
                  {t('farmer.alertBufferExplanation', {}, 'You will also be alerted when sheep are spotted within this distance outside your field boundaries.')}
                </p>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={selectedFarm.alertBufferMeters}
                  onChange={(e) => updateFarm(selectedFarm.id, { alertBufferMeters: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#D1D9C5] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#92998B] mt-1">
                  <span>100m</span>
                  <span>500m</span>
                  <span>1km</span>
                  <span>1.5km</span>
                  <span>2km</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[#614270]">{t('farmer.fieldsCount', { count: selectedFarm.fields.length }, `Fields (${selectedFarm.fields.length})`)}</h3>
                <button onClick={() => setViewState('add-field')} className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm">{t('farmer.addFieldButton', {}, '+ Add Field')}</button>
              </div>
              {selectedFarm.fields.length === 0 ? (
                <div className="bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-xl p-4 text-center text-[#614270]">{t('farmer.noFieldsYet', {}, 'No fields yet. Add fields by placing fence posts.')}</div>
              ) : (
                <div className="space-y-3">
                  {selectedFarm.fields.map((field) => (
                    <div key={field.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-[#614270]">{field.name}</h4>
                        <p className="text-sm text-[#92998B]">{t('farmer.fencePostsCount', { count: field.fencePosts.length }, `${field.fencePosts.length} fence posts`)}</p>
                      </div>
                      <button onClick={() => deleteField(selectedFarm.id, field.id)} className="px-3 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-sm">{t('farmer.delete', {}, 'Delete')}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { if (confirm(t('farmer.deleteFarmConfirm', {}, 'Delete this farm?'))) { deleteFarm(selectedFarm.id); setViewState('dashboard'); }}} className="w-full py-3 bg-[#FA9335]/10 text-[#FA9335] rounded-xl">{t('farmer.deleteFarmButton', {}, 'Delete Farm')}</button>
          </div>
        )}

        {/* ===== ADD FIELD ===== */}
        {viewState === 'add-field' && selectedFarm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">{t('farmer.fieldNameLabel', {}, 'Field Name *')}</label>
              <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder={t('farmer.fieldNamePlaceholder', {}, 'e.g., North Paddock')} className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">{t('farmer.placeFencePostsLabel', { placed: fencePosts.length }, `Place Fence Posts (${fencePosts.length} placed, need 3+)`)}</label>
              <div className="h-72 rounded-xl overflow-hidden shadow">
                <Map
                  center={fencePosts[0] ? [fencePosts[0].lat, fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER}
                  zoom={fencePosts.length > 0 ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                  onClick={handleMapClick}
                  markers={fencePosts.map((post, idx) => ({
                    id: `post-${idx}`,
                    position: [post.lat, post.lng] as [number, number],
                    popup: t('farmer.postNumber', { number: idx + 1 }, `Post ${idx + 1}`),
                    type: 'fencepost' as const
                  }))}
                  polygons={fencePosts.length >= 3 ? [{ id: 'new', positions: fencePosts.map(p => [p.lat, p.lng] as [number, number]), color: '#9ED663' }] : []}
                />
              </div>
            </div>
            {fencePosts.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleUndoPost} className="flex-1 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm">{t('farmer.undoButton', {}, '↩️ Undo')}</button>
                <button onClick={handleClearPosts} className="flex-1 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm">{t('farmer.clearButton', {}, '🗑️ Clear')}</button>
              </div>
            )}
            <div className="bg-[#D1D9C5] border border-[#D1D9C5] rounded-xl p-3 text-sm text-[#614270]">
              {t('farmer.fencePostTip', {}, '🪵 Tap on the map to place fence posts around your field boundary.')}
            </div>
            <button onClick={handleSaveField} disabled={!canSaveField} className="w-full py-4 bg-[#7D8DCC] text-white rounded-xl font-semibold disabled:bg-[#D1D9C5]">{t('farmer.saveField', {}, 'Save Field')}</button>
          </div>
        )}

        {/* ===== SUBSCRIPTION ===== */}
        {viewState === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold text-[#614270] mb-4">{t('farmer.yourSubscription', {}, 'Your Subscription')}</h2>

              <div className="bg-[#D1D9C5] rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{t('farmer.currentStatus', {}, 'Current Status')}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentUser?.subscriptionStatus === 'active' ? 'bg-[#9ED663]/20 text-[#614270]' :
                    currentUser?.subscriptionStatus === 'trial' ? 'bg-[#7D8DCC]/10 text-[#7D8DCC]' :
                    'bg-[#FA9335]/10 text-[#FA9335]'
                  }`}>
                    {currentUser?.subscriptionStatus === 'trial' ? t('farmer.statusTrialBadge', {}, '30-Day Free Trial') :
                     currentUser?.subscriptionStatus === 'active' ? t('farmer.statusActiveBadge', {}, 'Active') :
                     currentUser?.subscriptionStatus === 'cancelled' ? t('farmer.statusCancelledBadge', {}, 'Cancelled') : t('farmer.statusNoneBadge', {}, 'None')}
                  </span>
                </div>
                {currentUser?.subscriptionStatus === 'trial' && currentUser.trialEndsAt && (
                  <div className="text-sm text-[#614270] mt-2">
                    <p dangerouslySetInnerHTML={{ __html: t('farmer.trialEnds', { date: new Date(currentUser.trialEndsAt).toLocaleDateString() }, `Trial ends: <strong>${new Date(currentUser.trialEndsAt).toLocaleDateString()}</strong>`) }} />
                    <p className="text-[#EADA69] mt-1">{t('farmer.trialChargeWarning', {}, 'Your card will be charged £29.99 on this date unless you cancel.')}</p>
                  </div>
                )}
                {currentUser?.subscriptionStatus === 'active' && (
                  <div className="text-sm text-[#614270] mt-2">
                    <p dangerouslySetInnerHTML={{ __html: t('farmer.nextBillingDate', { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() }, `Next billing date: <strong>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>`) }} />
                    <p dangerouslySetInnerHTML={{ __html: t('farmer.amount', {}, 'Amount: <strong>£29.99</strong>') }} />
                  </div>
                )}
                {currentUser?.subscriptionStatus === 'cancelled' && (
                  <div className="text-sm text-[#FA9335] mt-2">
                    <p>{t('farmer.subscriptionCancelledMessage', {}, 'Your subscription has been cancelled. You will not be charged.')}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-[#614270] mb-2">{t('farmer.basicPlanHeading', {}, 'Basic Plan - £29.99/month')}</h3>
                <ul className="text-sm text-[#614270] space-y-1">
                  <li>{t('farmer.planFeatureUnlimited', {}, '✓ Unlimited zone alerts')}</li>
                  <li>{t('farmer.planFeatureNotifications', {}, '✓ Email & SMS notifications')}</li>
                  <li>{t('farmer.planFeatureHistory', {}, '✓ Report history & analytics')}</li>
                  <li>{t('farmer.planFeatureMultiZones', {}, '✓ Multiple farm zones')}</li>
                  <li>{t('farmer.planFeatureSupport', {}, '✓ Priority support')}</li>
                </ul>
              </div>

              {currentUser?.subscriptionStatus !== 'cancelled' && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-[#614270] mb-3">{t('farmer.cancelSubscriptionHeading', {}, 'Cancel Subscription')}</h3>
                  <p className="text-sm text-[#614270] mb-3">
                    {currentUser?.subscriptionStatus === 'trial'
                      ? t('farmer.cancelTrialWarning', {}, 'Cancel now and you will not be charged. Your access will end immediately.')
                      : t('farmer.cancelActiveWarning', {}, 'Cancel and your access will continue until the end of your billing period.')}
                  </p>
                  <button
                    onClick={() => {
                      if (confirm(t('farmer.cancelConfirm', {}, 'Are you sure you want to cancel your subscription? You will stop receiving alerts for sheep sightings in your zones.'))) {
                        cancelSubscription(currentUserId!)
                      }
                    }}
                    className="w-full py-3 bg-[#FA9335] text-white rounded-xl font-medium hover:bg-[#614270]"
                  >
                    {t('farmer.cancelSubscriptionButton', {}, 'Cancel Subscription')}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setViewState('dashboard')} className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl">{t('farmer.backToDashboard', {}, 'Back to Dashboard')}</button>
          </div>
        )}

        {viewState === 'notifications' && (
          <div className="space-y-4">
            {/* Incoming report notifications from Supabase */}
            {farmerNotifications.length > 0 && (
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#614270]">Recent Alerts</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        if (currentUserId) {
                          await markAllNotificationsRead(currentUserId)
                          setFarmerNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString(), status: 'read' })))
                        }
                      }}
                      className="text-xs text-[#7D8DCC] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {farmerNotifications.slice(0, 20).map(notif => {
                    const report = reports.find(r => r.id === notif.report_id)
                    const isUnread = !notif.read_at
                    return (
                      <div key={notif.id} className={`p-3 rounded-lg border text-sm ${isUnread ? 'bg-[#EADA69]/20 border-[#EADA69]/40' : 'bg-[#D1D9C5] border-[#D1D9C5]'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {isUnread && <span className="inline-block w-2 h-2 bg-[#EADA69] rounded-full mr-2 mt-1 flex-shrink-0" />}
                            <span className="font-medium text-[#614270]">
                              {notif.type === 'new_report' ? '🚨 New report near your farm' : notif.type}
                            </span>
                            {report && (
                              <div className="text-xs text-[#92998B] mt-0.5">
                                {report.categoryEmoji} {report.categoryName} · {new Date(notif.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <p className="text-sm text-[#92998B]">Choose which report types you want to be alerted about for your farms.</p>
            {myFarms.length === 0 ? (
              <div className="p-8 text-center text-[#92998B] bg-white rounded-xl shadow">
                <div className="text-4xl mb-2">🏡</div>
                <p>Add a farm first to manage notification preferences.</p>
              </div>
            ) : myFarms.map((farm) => {
              const activeCategories = reportCategories.filter((c) => c.isActive)
              return (
                <div key={farm.id} className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold text-[#614270] mb-3">🏡 {farm.name}</h3>
                  {activeCategories.length === 0 ? (
                    <p className="text-sm text-[#92998B]">No custom report categories configured yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeCategories.map((cat) => {
                        const isCompulsory = cat.subscriptionMode === 'compulsory'
                        const effective = isCompulsory
                          ? true
                          : cat.subscriptionMode === 'default_on'
                            ? (farm.categorySubscriptions?.[cat.id] ?? true)
                            : (farm.categorySubscriptions?.[cat.id] ?? false)
                        return (
                          <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg ${isCompulsory ? 'bg-[#FA9335]/10 border border-[#FA9335]/20' : 'bg-[#D1D9C5] border border-[#D1D9C5]'}`}>
                            <div className="flex items-center gap-2">
                              {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0 rounded" />
                              ) : (
                                <span className="text-xl">{cat.emoji}</span>
                              )}
                              <div>
                                <div className="text-sm font-medium text-[#614270]">{cat.name}</div>
                                <div className="text-xs text-[#92998B]">
                                  {isCompulsory ? '🔒 Required — cannot be disabled' : effective ? 'Receiving alerts' : 'Not receiving alerts'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => !isCompulsory && updateFarmCategorySubscription(farm.id, cat.id, !effective)}
                              disabled={isCompulsory}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                effective ? 'bg-[#63BD8F]' : 'bg-[#D1D9C5]'
                              } ${isCompulsory ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${effective ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation — hidden during registration flow */}
      {viewState !== 'register' && (
        <BottomNav
          items={[
            {
              id: 'dashboard',
              label: 'Dashboard',
              icon: '🏠',
              active: viewState === 'dashboard',
              onClick: () => setViewState('dashboard'),
            },
            {
              id: 'farms',
              label: 'Farms',
              icon: '🏡',
              active: viewState === 'view-farm' || viewState === 'create-farm' || viewState === 'add-field',
              onClick: () => {
                if (myFarms.length > 0) {
                  setSelectedFarmId(myFarms[0].id)
                  setViewState('view-farm')
                } else {
                  setViewState('create-farm')
                }
              },
            },
            {
              id: 'alerts',
              label: 'Alerts',
              icon: '🔔',
              active: viewState === 'notifications',
              badge: unreadCount,
              onClick: async () => {
                setViewState('notifications')
                if (currentUserId && unreadCount > 0) {
                  await markAllNotificationsRead(currentUserId)
                  setFarmerNotifications(prev =>
                    prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString(), status: 'read' }))
                  )
                }
              },
            },
            {
              id: 'profile',
              label: 'Profile',
              icon: '👤',
              onClick: () => setProfileOpen(true),
            },
          ]}
        />
      )}

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
