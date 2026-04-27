'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { saveOfflineReport, OfflineReport } from '@/lib/offline-db'
import { useTranslation } from '@/contexts/TranslationContext'

interface OfflineCaptureProps {
  onSaved: () => void
  onCancel: () => void
}

type Step = 'location' | 'photo' | 'details' | 'saved'

export default function OfflineCapture({ onSaved, onCancel }: OfflineCaptureProps) {
  const { t } = useTranslation()
  const { reportCategories, currentUserId } = useAppStore()
  const activeCategories = reportCategories.filter(
    (c) => c.isActive && c.id !== 'sheep' && c.name.toLowerCase() !== 'sheep'
  )

  // Restore step/location from sessionStorage so iOS camera re-focus doesn't reset state
  const SESSION_KEY = 'lbp-offline-capture'

  const [step, setStep] = useState<Step>(() => {
    try { return (sessionStorage.getItem(SESSION_KEY + '.step') as Step) || 'location' } catch { return 'location' }
  })
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [latitude, setLatitude] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem(SESSION_KEY + '.lat'); return v ? parseFloat(v) : null } catch { return null }
  })
  const [longitude, setLongitude] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem(SESSION_KEY + '.lng'); return v ? parseFloat(v) : null } catch { return null }
  })
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const [photoDataUrls, setPhotoDataUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [categoryId, setCategoryId] = useState('sheep')
  const [categoryName, setCategoryName] = useState('Sheep')
  const [categoryEmoji, setCategoryEmoji] = useState('🐑')
  const [condition, setCondition] = useState('')
  const [sheepCount, setSheepCount] = useState(1)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Persist step and location to sessionStorage so iOS camera focus/unfocus doesn't reset state
  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY + '.step', step) } catch {}
  }, [step])

  useEffect(() => {
    try {
      if (latitude !== null) sessionStorage.setItem(SESSION_KEY + '.lat', String(latitude))
      if (longitude !== null) sessionStorage.setItem(SESSION_KEY + '.lng', String(longitude))
    } catch {}
  }, [latitude, longitude])

  // Clear session state when the component unmounts after a successful save
  const clearSession = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY + '.step')
      sessionStorage.removeItem(SESSION_KEY + '.lat')
      sessionStorage.removeItem(SESSION_KEY + '.lng')
    } catch {}
  }

  // Auto-locate on mount (only if location not already restored from session)
  useEffect(() => {
    if (latitude === null || longitude === null) getLocation()
  }, [])

  const getLocation = () => {
    setLocating(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError(t('offline.loc.unsupported', {}, 'Geolocation is not supported by your device'))
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setAccuracy(Math.round(pos.coords.accuracy))
        setLocating(false)
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? t('offline.loc.denied', {}, 'Location permission denied — please allow location access in your device settings')
            : t('offline.loc.failed', {}, 'Could not get your location. Try again.')
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setPhotoDataUrls((prev) => [...prev, dataUrl].slice(0, 3))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCategoryChange = (id: string) => {
    if (id === 'sheep') {
      setCategoryId('sheep')
      setCategoryName('Sheep')
      setCategoryEmoji('🐑')
      setCondition('')
    } else {
      const cat = activeCategories.find((c) => c.id === id)
      if (cat) {
        setCategoryId(cat.id)
        setCategoryName(cat.name)
        setCategoryEmoji(cat.emoji)
        setCondition('')
      }
    }
  }

  const selectedCategory = categoryId === 'sheep'
    ? { id: 'sheep', name: 'Sheep', emoji: '🐑', conditions: ['Healthy', 'Injured', 'Dead', 'Unknown'], showCount: true, countLabel: 'Number of sheep' }
    : activeCategories.find((c) => c.id === categoryId)

  const handleSave = async () => {
    setSaveError('')

    // Location may have been lost if iOS re-focused after camera — re-prompt
    if (latitude === null || longitude === null) {
      setSaveError(t('offline.details.locationLost', {}, 'Location data was lost. Please go back and re-confirm your location.'))
      return
    }

    setSaving(true)

    const report: OfflineReport = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      categoryId,
      categoryName,
      categoryEmoji,
      condition: condition || 'Unknown',
      sheepCount,
      description,
      photoDataUrls,
      synced: false,
      createdAt: new Date().toISOString(),
    }

    try {
      await saveOfflineReport(report)
      clearSession()
      setStep('saved')
      setTimeout(onSaved, 2000)
    } catch (err) {
      console.error('Failed to save offline report', err)
      setSaveError(t('offline.details.saveFailed', {}, 'Failed to save to device. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1a1025] z-[60] flex flex-col">
      {/* Header */}
      <div className="bg-[#614270] px-4 py-3 flex items-center gap-3">
        <button onClick={() => { clearSession(); onCancel() }} className="text-[#D1D9C5] hover:text-white text-xl leading-none">
          ←
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">📴 {t('offline.title', {}, 'Offline Capture')}</p>
          <p className="text-[#D1D9C5] text-xs opacity-70">{t('offline.subtitle', {}, "Saved to device — syncs when you're back in signal")}</p>
        </div>
        <div className="flex gap-1">
          {(['location', 'photo', 'details'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-[#9ED663]' : step === 'saved' || ['location', 'photo', 'details'].indexOf(step) > i ? 'bg-[#7D8DCC]' : 'bg-[#614270]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Not signed in — warn that report won't auto-upload */}
      {!currentUserId && step !== 'saved' && (
        <div className="bg-[#FA9335]/20 border-b border-[#FA9335]/30 px-4 py-2 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <p className="text-[#FA9335] text-xs">
            {t('offline.notSignedIn', {}, "You're not signed in — sign in before syncing so your report uploads")}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">

        {/* ── Step: Location ── */}
        {step === 'location' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="text-6xl">📍</div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">{t('offline.loc.heading', {}, 'Capturing your location')}</h2>
              <p className="text-[#D1D9C5] text-sm opacity-70">
                {t('offline.loc.desc', {}, 'GPS works without internet — your phone satellite position is being recorded')}
              </p>
            </div>

            {locating && (
              <div className="flex items-center gap-3 text-[#D1D9C5]">
                <div className="w-5 h-5 border-2 border-[#9ED663] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">{t('offline.loc.getting', {}, 'Getting GPS fix...')}</span>
              </div>
            )}

            {latitude && longitude && (
              <div className="bg-[#2d1f3a] rounded-2xl p-4 w-full">
                <div className="text-[#9ED663] text-2xl mb-2">✓</div>
                <p className="text-white font-mono text-sm">
                  {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° W
                </p>
                {accuracy && (
                  <p className="text-[#D1D9C5] text-xs mt-1 opacity-70">
                    {t('offline.loc.accuracy', { accuracy }, 'Accuracy: ±{accuracy}m')}
                    {accuracy > 50 && ` — ${t('offline.loc.accuracyHint', {}, 'move to open ground for better accuracy')}`}
                  </p>
                )}
              </div>
            )}

            {locationError && (
              <div className="bg-[#FA9335]/20 border border-[#FA9335]/40 rounded-xl p-4 w-full text-left">
                <p className="text-[#FA9335] text-sm">{locationError}</p>
                <button
                  onClick={getLocation}
                  className="mt-2 text-[#FA9335] text-xs underline opacity-80"
                >
                  {t('offline.loc.tryAgain', {}, 'Try again')}
                </button>
              </div>
            )}

            <button
              onClick={() => setStep('photo')}
              disabled={!latitude || !longitude}
              className="w-full py-4 bg-[#7D8DCC] text-white rounded-2xl font-semibold disabled:bg-[#2d1f3a] disabled:text-[#D1D9C5]/40 transition-colors"
            >
              {latitude ? t('offline.loc.next', {}, 'Location saved — next') : t('offline.loc.waiting', {}, 'Waiting for GPS...')}
            </button>
          </div>
        )}

        {/* ── Step: Photo ── */}
        {step === 'photo' && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <div className="text-5xl mb-2">📸</div>
              <h2 className="text-white text-xl font-bold">{t('offline.photo.heading', {}, 'Take a photo')}</h2>
              <p className="text-[#D1D9C5] text-sm mt-1 opacity-70">{t('offline.photo.desc', {}, 'Optional but really helpful — up to 3 photos')}</p>
            </div>

            {/* Camera input — single shot, no multiple (Android compatible) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            {/* Gallery input — multiple, no capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {photoDataUrls.length === 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 h-36 border-2 border-dashed border-[#614270] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#D1D9C5] hover:border-[#7D8DCC] hover:text-[#7D8DCC] transition-colors"
                >
                  <span className="text-3xl">📷</span>
                  <span className="text-xs">{t('offline.photo.takePhoto', {}, 'Take photo')}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-36 border-2 border-dashed border-[#614270] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#D1D9C5] hover:border-[#7D8DCC] hover:text-[#7D8DCC] transition-colors"
                >
                  <span className="text-3xl">🖼️</span>
                  <span className="text-xs">{t('offline.photo.fromGallery', {}, 'From gallery')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photoDataUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoDataUrls((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photoDataUrls.length < 3 && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#614270] flex flex-col items-center justify-center text-[#D1D9C5] hover:border-[#7D8DCC] transition-colors gap-1"
                  >
                    <span className="text-xl">📷</span>
                    <span className="text-[10px]">{t('offline.photo.add', {}, 'Add')}</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-4 bg-[#7D8DCC] text-white rounded-2xl font-semibold hover:bg-[#6b7bb8] transition-colors"
              >
                {photoDataUrls.length > 0 ? t('offline.photo.next', {}, 'Photos added — next') : t('offline.photo.skip', {}, 'Skip photos')}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Details ── */}
        {step === 'details' && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="text-5xl mb-2">📝</div>
              <h2 className="text-white text-xl font-bold">{t('offline.details.heading', {}, 'What did you see?')}</h2>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[#D1D9C5] text-xs uppercase tracking-wider mb-2 opacity-70">{t('offline.details.category', {}, 'Category')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCategoryChange('sheep')}
                  className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    categoryId === 'sheep' ? 'bg-[#7D8DCC] text-white' : 'bg-[#2d1f3a] text-[#D1D9C5]'
                  }`}
                >
                  🐑 Sheep
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      categoryId === cat.id ? 'bg-[#7D8DCC] text-white' : 'bg-[#2d1f3a] text-[#D1D9C5]'
                    }`}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            {selectedCategory && selectedCategory.conditions.length > 0 && (
              <div>
                <label className="block text-[#D1D9C5] text-xs uppercase tracking-wider mb-2 opacity-70">{t('offline.details.condition', {}, 'Condition')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCategory.conditions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        condition === c ? 'bg-[#7D8DCC] text-white' : 'bg-[#2d1f3a] text-[#D1D9C5]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Count */}
            {selectedCategory?.showCount !== false && (
              <div>
                <label className="block text-[#D1D9C5] text-xs uppercase tracking-wider mb-2 opacity-70">
                  {selectedCategory?.countLabel || t('offline.details.quantity', {}, 'Quantity')}
                </label>
                <div className="flex items-center gap-4 bg-[#2d1f3a] rounded-xl px-4 py-3">
                  <button
                    onClick={() => setSheepCount(Math.max(1, sheepCount - 1))}
                    className="w-8 h-8 rounded-full bg-[#614270] text-white flex items-center justify-center text-lg hover:bg-[#4e3359]"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-white text-xl font-bold">{sheepCount}</span>
                  <button
                    onClick={() => setSheepCount(sheepCount + 1)}
                    className="w-8 h-8 rounded-full bg-[#614270] text-white flex items-center justify-center text-lg hover:bg-[#4e3359]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-[#D1D9C5] text-xs uppercase tracking-wider mb-2 opacity-70">{t('offline.details.notes', {}, 'Notes (optional)')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('offline.details.placeholder', {}, 'Any extra details...')}
                rows={3}
                className="w-full bg-[#2d1f3a] text-white rounded-xl px-4 py-3 text-sm placeholder-[#92998B] border border-[#614270]/50 focus:border-[#7D8DCC] focus:outline-none resize-none"
              />
            </div>

            {saveError && (
              <div className="bg-[#FA9335]/20 border border-[#FA9335]/40 rounded-xl p-3 text-sm text-[#FA9335]">
                {saveError}
                {(latitude === null || longitude === null) && (
                  <button
                    onClick={() => { setSaveError(''); setStep('location') }}
                    className="mt-2 block text-xs underline opacity-80"
                  >
                    {t('offline.details.goBack', {}, '← Go back and re-confirm location')}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-[#7D8DCC] text-white rounded-2xl font-bold text-lg hover:bg-[#6b7bb8] disabled:bg-[#2d1f3a] disabled:text-[#D1D9C5]/40 transition-colors mt-2"
            >
              {saving ? t('offline.details.saving', {}, 'Saving...') : t('offline.details.save', {}, 'Save to device')}
            </button>
          </div>
        )}

        {/* ── Step: Saved ── */}
        {step === 'saved' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#9ED663] flex items-center justify-center text-4xl animate-bounce">
              ✓
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">{t('offline.saved.heading', {}, 'Saved!')}</h2>
              <p className="text-[#D1D9C5] text-sm leading-relaxed opacity-70">
                {t('offline.saved.desc', {}, 'Your sighting is stored on this device. It will upload automatically when you get back to signal.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
