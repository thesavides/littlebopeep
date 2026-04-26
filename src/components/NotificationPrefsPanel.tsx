'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/lib/supabase-client'

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  saving?: boolean
}

function ToggleRow({ label, description, checked, onChange, saving }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#614270]">{label}</p>
        {description && <p className="text-xs text-[#92998B] mt-0.5 leading-snug">{description}</p>}
      </div>
      <button
        disabled={saving}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-[#7D8DCC]' : 'bg-[#D1D9C5]'
        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

interface NotificationPrefsPanelProps {
  userId: string
  role: 'walker' | 'farmer'
}

export default function NotificationPrefsPanel({ userId, role }: NotificationPrefsPanelProps) {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchNotificationPreferences(userId).then(setPrefs)
  }, [userId])

  const handleChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setSaving(true)
    setSaved(false)
    await updateNotificationPreferences(userId, next)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!prefs) {
    return (
      <div className="py-4 text-center text-sm text-[#92998B]">
        {t('notifPrefs.loading', {}, 'Loading preferences…')}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[#614270] text-sm">
          🔔 {t('notifPrefs.title', {}, 'Notification preferences')}
        </h3>
        {saved && (
          <span className="text-xs text-[#9ED663] font-medium">
            ✓ {t('notifPrefs.saved', {}, 'Saved')}
          </span>
        )}
      </div>

      <div className="divide-y divide-[#D1D9C5]">
        {/* Email alerts — both roles */}
        <ToggleRow
          label={`📧 ${t('notifPrefs.emailAlerts', {}, 'Email alerts')}`}
          description={
            role === 'farmer'
              ? t('notifPrefs.emailAlertsDescFarmer', {}, 'Get an email when new reports are spotted near your farm')
              : t('notifPrefs.emailAlertsDescWalker', {}, 'Get an email when your reports are claimed or resolved')
          }
          checked={prefs.email_alerts}
          onChange={(v) => handleChange('email_alerts', v)}
          saving={saving}
        />

        {/* Walker-specific in-app prefs */}
        {role === 'walker' && (
          <>
            <ToggleRow
              label={`🙋 ${t('notifPrefs.inAppClaimed', {}, 'Report claimed')}`}
              description={t('notifPrefs.inAppClaimedDesc', {}, 'Notify me when a farmer claims my report')}
              checked={prefs.in_app_claimed}
              onChange={(v) => handleChange('in_app_claimed', v)}
              saving={saving}
            />
            <ToggleRow
              label={`✅ ${t('notifPrefs.inAppResolved', {}, 'Report resolved')}`}
              description={t('notifPrefs.inAppResolvedDesc', {}, 'Notify me when a farmer marks my report as resolved')}
              checked={prefs.in_app_resolved}
              onChange={(v) => handleChange('in_app_resolved', v)}
              saving={saving}
            />
            <ToggleRow
              label={`💌 ${t('notifPrefs.inAppThankyou', {}, 'Thank you messages')}`}
              description={t('notifPrefs.inAppThankyouDesc', {}, 'Notify me when a farmer sends me a thank you message')}
              checked={prefs.in_app_thankyou}
              onChange={(v) => handleChange('in_app_thankyou', v)}
              saving={saving}
            />
          </>
        )}

        {/* Farmer-specific in-app prefs */}
        {role === 'farmer' && (
          <ToggleRow
            label={`📍 ${t('notifPrefs.inAppNewReport', {}, 'New reports nearby')}`}
            description={t('notifPrefs.inAppNewReportDesc', {}, 'Notify me in-app when new reports appear near my farm')}
            checked={prefs.in_app_new_report}
            onChange={(v) => handleChange('in_app_new_report', v)}
            saving={saving}
          />
        )}
      </div>

      <p className="text-xs text-[#92998B] pt-2">
        {t('notifPrefs.categoryTip', {}, 'To manage per-category alerts, open a farm and edit any field.')}
      </p>
    </div>
  )
}
