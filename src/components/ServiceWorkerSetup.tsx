'use client'

import { useEffect } from 'react'

export default function ServiceWorkerSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[LBP] Service worker registered', reg.scope)

          // If a new SW is waiting, activate it immediately
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          })
        })
        .catch((err) => {
          // SW registration failure is non-fatal — app still works online
          console.warn('[LBP] Service worker registration failed', err)
        })
    }
  }, [])

  return null
}
