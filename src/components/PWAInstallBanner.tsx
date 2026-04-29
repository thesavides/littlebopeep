'use client'

import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { installState, triggerInstall, dismiss } = usePWAInstall()
  const [showIOSSteps, setShowIOSSteps] = useState(false)

  if (installState === 'installed' || installState === 'not-available' || installState === 'dismissed') {
    return null
  }

  if (installState === 'available') {
    return (
      <div className="bg-[#614270] text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">📴</span>
          <p className="text-sm font-medium leading-snug">Install for offline reporting</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={triggerInstall}
            className="bg-white text-[#614270] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 active:scale-95 transition-all"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            className="text-white/70 hover:text-white text-lg leading-none transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  if (installState === 'ios-manual') {
    return (
      <div className="bg-[#614270] text-white px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">📴</span>
            <p className="text-sm font-medium leading-snug">Install for offline reporting</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowIOSSteps(!showIOSSteps)}
              className="bg-white text-[#614270] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 active:scale-95 transition-all"
            >
              How to install
            </button>
            <button
              onClick={dismiss}
              className="text-white/70 hover:text-white text-lg leading-none transition-colors"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>

        {showIOSSteps && (
          <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold mb-1">Add to Home Screen in Safari:</p>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
              <span>Tap the <strong>Share</strong> button ⎋ at the bottom</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
              <span>Tap <strong>"Add to Home Screen"</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
              <span>Tap <strong>Add</strong> — open from home screen to use offline</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
