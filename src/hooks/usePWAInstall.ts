'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'not-available'   // Can't install (already installed, or unsupported browser)
  | 'ios-manual'      // iOS — needs manual Share → Add to Home Screen
  | 'available'       // Android/Chrome — can show native prompt
  | 'dismissed'       // User dismissed, snooze for 7 days
  | 'installed'       // Successfully installed

const DISMISS_KEY = 'lbp-pwa-dismissed'
const SNOOZE_DAYS = 7

export function usePWAInstall() {
  const [installState, setInstallState] = useState<InstallState>('not-available')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed')
      return
    }

    // Check if snoozed
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (days < SNOOZE_DAYS) {
        setInstallState('dismissed')
        return
      }
    }

    // iOS detection — Safari doesn't fire beforeinstallprompt
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIOS && isSafari) {
      setInstallState('ios-manual')
      return
    }

    // Android / Chrome — listen for the prompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setInstallState('available')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstallState('installed')
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallState('installed')
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setInstallState('dismissed')
  }

  return { installState, triggerInstall, dismiss }
}
