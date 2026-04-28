'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'

interface Props {
  userId: string
}

async function subscribeToPush(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) return false

  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()

    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription: sub.toJSON() }),
    })
    return res.ok
  } catch (err) {
    console.error('Push subscribe error:', err)
    return false
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export default function PushPermissionBanner({ userId }: Props) {
  const { t } = useTranslation()
  const [state, setState] = useState<'idle' | 'prompted' | 'subscribing' | 'done' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    // Check browser support
    if (!('Notification' in window) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    // Already granted — silently re-register subscription (e.g. after reinstall)
    if (Notification.permission === 'granted') {
      subscribeToPush(userId).catch(() => {})
      setState('done')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    // Prompt state: show banner
    setState('prompted')
  }, [userId])

  const handleEnable = async () => {
    setState('subscribing')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setState('denied')
      return
    }
    const ok = await subscribeToPush(userId)
    setState(ok ? 'done' : 'denied')
  }

  const handleDismiss = () => setState('done')

  if (state !== 'prompted') return null

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-[#7D8DCC]/40 bg-[#7D8DCC]/10 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#614270] text-sm">
            {t('push.enableTitle', {}, 'Enable push notifications')}
          </p>
          <p className="text-[#92998B] text-xs mt-0.5">
            {t('push.enableDesc', {}, "Get notified even when the app isn't open — claims, thank-you messages, and nearby reports.")}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={state === 'subscribing'}
              className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-xl text-sm font-semibold hover:bg-[#6b7bb8] disabled:opacity-50 transition-colors"
            >
              {state === 'subscribing' ? t('common.saving', {}, 'Enabling…') : t('push.enableBtn', {}, 'Enable')}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-[#614270] text-xs hover:opacity-70 transition-opacity"
            >
              {t('push.notNow', {}, 'Not now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
