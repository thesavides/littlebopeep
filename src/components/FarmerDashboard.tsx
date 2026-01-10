'use client'

import { useState, useEffect } from 'react'
import { useAppStore, Farm, FarmField, MAP_CONFIG } from '@/store/appStore'
import Header from './Header'
import Map from './Map'

type ViewState = 'dashboard' | 'register' | 'create-farm' | 'add-field' | 'view-farm' | 'subscription'
type RegistrationStep = 1 | 2 | 3 | 4 | 5

export default function FarmerDashboard() {
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
    resolveReport,
    getFarmsByFarmerId,
    getCurrentUser,
    updateUser,
    startTrial,
    cancelSubscription
  } = useAppStore()
  
  const currentUser = getCurrentUser()
  const [viewState, setViewState] = useState<ViewState>(currentUser?.subscriptionStatus ? 'dashboard' : 'register')
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(1)
  
  // Registration form state
  const [formData, setFormData] = useState({
    farmName: '',
    contactName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
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
  
  const myFarms = currentUserId ? getFarmsByFarmerId(currentUserId) : []
  const selectedFarm = myFarms.find(f => f.id === selectedFarmId)
  
  const allFieldPolygons = myFarms.flatMap(farm => 
    farm.fields.map(field => ({
      id: field.id,
      positions: field.fencePosts.map(p => [p.lat, p.lng] as [number, number]),
      color: '#22c55e'
    }))
  )
  
  const relevantReports = reports.filter(r => r.status !== 'resolved' && !r.archived)
  const reportedAlerts = relevantReports.filter(r => r.status === 'reported')
  const claimedAlerts = relevantReports.filter(r => r.status === 'claimed' && r.claimedByFarmerId === currentUserId)

  // Check if user needs to register
  useEffect(() => {
    if (currentUser && !currentUser.subscriptionStatus) {
      setViewState('register')
    }
  }, [currentUser])

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
      case 'register': return `Registration (Step ${registrationStep}/5)`
      case 'create-farm': return 'Create Farm'
      case 'add-field': return 'Add Field'
      case 'subscription': return 'Subscription'
      case 'view-farm': return selectedFarm?.name || 'Farm'
      default: return ''
    }
  }

  const canSaveField = fieldName.trim() && fencePosts.length >= 3

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        showBackButton={viewState !== 'dashboard' && !(viewState === 'register' && registrationStep === 1)} 
        onBack={handleBack}
        title={getTitle()}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* ===== REGISTRATION ===== */}
        {viewState === 'register' && (
          <div className="max-w-md mx-auto">
            {/* Progress bar */}
            <div className="h-2 bg-slate-200 rounded-full mb-6">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(registrationStep / 5) * 100}%` }} />
            </div>

            {/* Step 1: Contact Details */}
            {registrationStep === 1 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Farm Name *</label>
                    <input type="text" value={formData.farmName} onChange={(e) => setFormData({...formData, farmName: e.target.value})} placeholder="e.g., Green Valley Farm" className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                    <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>
                <button onClick={handleRegistrationNext} disabled={!formData.farmName || !formData.email} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-slate-300">Continue</button>
              </div>
            )}

            {/* Step 2: Physical Location */}
            {registrationStep === 2 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Farm Location</h2>
                <p className="text-slate-600 text-sm mb-4">Tap the map to mark your farm&apos;s physical location.</p>
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
                {formData.physicalLat > 0 && <p className="text-sm text-green-600 mb-4">📍 Location set</p>}
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl">Back</button>
                  <button onClick={handleRegistrationNext} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">Continue</button>
                </div>
              </div>
            )}

            {/* Step 3: Billing Address */}
            {registrationStep === 3 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Billing Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1 *</label>
                    <input type="text" value={formData.billingLine1} onChange={(e) => setFormData({...formData, billingLine1: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
                    <input type="text" value={formData.billingLine2} onChange={(e) => setFormData({...formData, billingLine2: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                      <input type="text" value={formData.billingCity} onChange={(e) => setFormData({...formData, billingCity: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">County</label>
                      <input type="text" value={formData.billingCounty} onChange={(e) => setFormData({...formData, billingCounty: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postcode *</label>
                    <input type="text" value={formData.billingPostcode} onChange={(e) => setFormData({...formData, billingPostcode: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl">Back</button>
                  <button onClick={handleRegistrationNext} disabled={!formData.billingLine1 || !formData.billingCity || !formData.billingPostcode} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-slate-300">Continue</button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Details */}
            {registrationStep === 4 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Setup</h2>
                <p className="text-slate-600 text-sm mb-4">Your card will not be charged until after your 30-day free trial ends.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">🔒 Secure payment powered by Stripe</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cardholder Name *</label>
                    <input type="text" value={formData.cardName} onChange={(e) => setFormData({...formData, cardName: e.target.value})} placeholder="Name on card" className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Card Number *</label>
                    <input type="text" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})} placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border rounded-lg font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Expiry *</label>
                      <input type="text" value={formData.cardExpiry} onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})} placeholder="MM/YY" className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CVC *</label>
                      <input type="text" value={formData.cardCvc} onChange={(e) => setFormData({...formData, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4)})} placeholder="123" className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mt-6 text-sm text-slate-600">
                  <p className="font-medium text-slate-800 mb-1">Subscription Details:</p>
                  <p>• 30-day free trial starting today</p>
                  <p>• £29.99/month after trial</p>
                  <p>• Cancel anytime before trial ends</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl">Back</button>
                  <button onClick={handleRegistrationNext} disabled={!formData.cardName || !formData.cardNumber || formData.cardNumber.length < 16 || !formData.cardExpiry || !formData.cardCvc} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-slate-300">Continue</button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Subscribe */}
            {registrationStep === 5 && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Review & Confirm</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-medium text-slate-800 mb-2">Farm Details</h3>
                    <div className="text-sm space-y-1 text-slate-600">
                      <p><strong>Farm:</strong> {formData.farmName}</p>
                      <p><strong>Contact:</strong> {formData.contactName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-medium text-slate-800 mb-2">Billing Address</h3>
                    <div className="text-sm text-slate-600">
                      <p>{formData.billingLine1}</p>
                      {formData.billingLine2 && <p>{formData.billingLine2}</p>}
                      <p>{formData.billingCity}, {formData.billingCounty} {formData.billingPostcode}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-medium text-slate-800 mb-2">Payment Method</h3>
                    <div className="text-sm text-slate-600">
                      <p>💳 Card ending in {formData.cardNumber.slice(-4)}</p>
                      <p>Expires {formData.cardExpiry}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 30-Day Free Trial</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• Your trial starts today</p>
                    <p>• First charge: <strong>£29.99</strong> on <strong>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong></p>
                    <p>• Cancel anytime from your dashboard</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl">Back</button>
                  <button onClick={handleCompleteRegistration} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold">Start Free Trial</button>
                </div>

                <p className="text-xs text-slate-500 text-center mt-4">
                  By clicking &quot;Start Free Trial&quot;, you agree to our Terms of Service and authorize us to charge your card £29.99/month after the trial period unless you cancel.
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
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-blue-800">Free Trial Active</h3>
                    <p className="text-sm text-blue-600">Ends {new Date(currentUser.trialEndsAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setViewState('subscription')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Manage</button>
                </div>
              </div>
            )}

            {/* No farms prompt */}
            {myFarms.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
                <div className="text-5xl mb-3">🏡</div>
                <h3 className="font-semibold text-amber-800 mb-2">Add Your Farm Fields</h3>
                <p className="text-amber-700 mb-4">Draw your field boundaries to start receiving alerts.</p>
                <button onClick={() => setViewState('create-farm')} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold">Add Farm</button>
              </div>
            )}

            {/* My Farms List */}
            {myFarms.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-slate-800">My Farms</h2>
                  <button onClick={() => setViewState('create-farm')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Add Farm</button>
                </div>
                <div className="space-y-3">
                  {myFarms.map((farm) => (
                    <button key={farm.id} onClick={() => handleViewFarm(farm.id)} className="w-full bg-white rounded-xl p-4 shadow border text-left hover:border-blue-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-800">{farm.name}</h3>
                          <p className="text-sm text-slate-500">{farm.fields.length} field(s) • Alert buffer: {farm.alertBufferMeters}m</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${farm.alertsEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {farm.alertsEnabled ? 'Alerts On' : 'Off'}
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
                  center={myFarms[0]?.fields[0]?.fencePosts[0] ? [myFarms[0].fields[0].fencePosts[0].lat, myFarms[0].fields[0].fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER}
                  zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                  markers={relevantReports.map((r) => ({
                    id: r.id,
                    position: [r.location.lat, r.location.lng] as [number, number],
                    popup: `🐑 ${r.sheepCount} - ${r.status}`,
                    type: 'sheep' as const
                  }))}
                  polygons={allFieldPolygons}
                />
              </div>
            )}

            {/* Alerts */}
            <div className="mb-6">
              <h2 className="font-semibold text-slate-800 mb-3">Reported Sheep ({reportedAlerts.length})</h2>
              {reportedAlerts.length === 0 ? (
                <div className="bg-green-50 rounded-xl p-4 text-center text-green-700">No new reports. All clear! 🎉</div>
              ) : (
                <div className="space-y-3">
                  {reportedAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">🐑 {report.sheepCount} sheep spotted</h3>
                          <p className="text-sm text-slate-500">{new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      {report.description && <p className="text-sm text-slate-600 mb-3">{report.description}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => claimReport(report.id)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Claim</button>
                        <button onClick={() => resolveReport(report.id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm">Resolved</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claimed */}
            {claimedAlerts.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-800 mb-3">My Claimed ({claimedAlerts.length})</h2>
                <div className="space-y-3">
                  {claimedAlerts.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">🐑 {report.sheepCount} sheep</h3>
                          <p className="text-sm text-slate-500">{new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => resolveReport(report.id)} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm">Mark Resolved</button>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Farm Name *</label>
              <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="e.g., North Field" className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alert Buffer Zone: {alertBuffer}m</label>
              <p className="text-sm text-slate-500 mb-3">You&apos;ll be alerted when sheep are spotted within this distance OUTSIDE your field boundaries.</p>
              <input type="range" min="100" max="2000" step="100" value={alertBuffer} onChange={(e) => setAlertBuffer(parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>100m</span><span>1km</span><span>2km</span></div>
            </div>
            <button onClick={handleCreateFarm} disabled={!farmName.trim()} className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-slate-300">Create Farm</button>
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
                  color: '#22c55e'
                }))}
              />
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Farm Settings</h3>
                <button onClick={() => updateFarm(selectedFarm.id, { alertsEnabled: !selectedFarm.alertsEnabled })} className={`px-3 py-1 rounded-lg text-sm ${selectedFarm.alertsEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  Alerts {selectedFarm.alertsEnabled ? 'On' : 'Off'}
                </button>
              </div>
              
              {/* Alert Buffer Slider */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alert Buffer Zone: <span className="text-blue-600 font-semibold">{selectedFarm.alertBufferMeters}m</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  You will also be alerted when sheep are spotted within this distance outside your field boundaries.
                </p>
                <input 
                  type="range" 
                  min="100" 
                  max="2000" 
                  step="100" 
                  value={selectedFarm.alertBufferMeters}
                  onChange={(e) => updateFarm(selectedFarm.id, { alertBufferMeters: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
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
                <h3 className="font-semibold text-slate-800">Fields ({selectedFarm.fields.length})</h3>
                <button onClick={() => setViewState('add-field')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">+ Add Field</button>
              </div>
              {selectedFarm.fields.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-amber-800">No fields yet. Add fields by placing fence posts.</div>
              ) : (
                <div className="space-y-3">
                  {selectedFarm.fields.map((field) => (
                    <div key={field.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-slate-800">{field.name}</h4>
                        <p className="text-sm text-slate-500">{field.fencePosts.length} fence posts</p>
                      </div>
                      <button onClick={() => deleteField(selectedFarm.id, field.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { if (confirm('Delete this farm?')) { deleteFarm(selectedFarm.id); setViewState('dashboard'); }}} className="w-full py-3 bg-red-100 text-red-700 rounded-xl">Delete Farm</button>
          </div>
        )}

        {/* ===== ADD FIELD ===== */}
        {viewState === 'add-field' && selectedFarm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Field Name *</label>
              <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="e.g., North Paddock" className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Place Fence Posts ({fencePosts.length} placed, need 3+)</label>
              <div className="h-72 rounded-xl overflow-hidden shadow">
                <Map
                  center={fencePosts[0] ? [fencePosts[0].lat, fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER}
                  zoom={fencePosts.length > 0 ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                  onClick={handleMapClick}
                  markers={fencePosts.map((post, idx) => ({
                    id: `post-${idx}`,
                    position: [post.lat, post.lng] as [number, number],
                    popup: `Post ${idx + 1}`,
                    type: 'fencepost' as const
                  }))}
                  polygons={fencePosts.length >= 3 ? [{ id: 'new', positions: fencePosts.map(p => [p.lat, p.lng] as [number, number]), color: '#22c55e' }] : []}
                />
              </div>
            </div>
            {fencePosts.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleUndoPost} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm">↩️ Undo</button>
                <button onClick={handleClearPosts} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm">🗑️ Clear</button>
              </div>
            )}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
              🪵 Tap on the map to place fence posts around your field boundary.
            </div>
            <button onClick={handleSaveField} disabled={!canSaveField} className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold disabled:bg-slate-300">Save Field</button>
          </div>
        )}

        {/* ===== SUBSCRIPTION ===== */}
        {viewState === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Your Subscription</h2>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Current Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentUser?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
                    currentUser?.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentUser?.subscriptionStatus === 'trial' ? '30-Day Free Trial' :
                     currentUser?.subscriptionStatus === 'active' ? 'Active' :
                     currentUser?.subscriptionStatus === 'cancelled' ? 'Cancelled' : 'None'}
                  </span>
                </div>
                {currentUser?.subscriptionStatus === 'trial' && currentUser.trialEndsAt && (
                  <div className="text-sm text-slate-600 mt-2">
                    <p>Trial ends: <strong>{new Date(currentUser.trialEndsAt).toLocaleDateString()}</strong></p>
                    <p className="text-amber-600 mt-1">Your card will be charged £29.99 on this date unless you cancel.</p>
                  </div>
                )}
                {currentUser?.subscriptionStatus === 'active' && (
                  <div className="text-sm text-slate-600 mt-2">
                    <p>Next billing date: <strong>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong></p>
                    <p>Amount: <strong>£29.99</strong></p>
                  </div>
                )}
                {currentUser?.subscriptionStatus === 'cancelled' && (
                  <div className="text-sm text-red-600 mt-2">
                    <p>Your subscription has been cancelled. You will not be charged.</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">Basic Plan - £29.99/month</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Unlimited zone alerts</li>
                  <li>✓ Email & SMS notifications</li>
                  <li>✓ Report history & analytics</li>
                  <li>✓ Multiple farm zones</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>

              {currentUser?.subscriptionStatus !== 'cancelled' && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-slate-800 mb-3">Cancel Subscription</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {currentUser?.subscriptionStatus === 'trial' 
                      ? 'Cancel now and you will not be charged. Your access will end immediately.'
                      : 'Cancel and your access will continue until the end of your billing period.'}
                  </p>
                  <button 
                    onClick={() => { 
                      if (confirm('Are you sure you want to cancel your subscription? You will stop receiving alerts for sheep sightings in your zones.')) {
                        cancelSubscription(currentUserId!)
                      }
                    }} 
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setViewState('dashboard')} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl">Back to Dashboard</button>
          </div>
        )}
      </main>
    </div>
  )
}
