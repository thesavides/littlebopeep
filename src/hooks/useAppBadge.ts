'use client'

import { useEffect } from 'react'

/**
 * Syncs an unread count to the PWA home screen icon badge.
 * Uses the App Badge API (navigator.setAppBadge) supported on:
 *   - Android Chrome 81+ (installed PWA)
 *   - iOS Safari 16.4+ (installed PWA / Add to Home Screen)
 *   - macOS Safari 17.0+ (installed PWA)
 *
 * Silently no-ops in unsupported browsers.
 */
export function useAppBadge(count: number): void {
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {})
    } else {
      navigator.clearAppBadge().catch(() => {})
    }
  }, [count])
}
