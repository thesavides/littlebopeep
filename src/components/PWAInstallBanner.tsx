'use client'

import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { installState, triggerInstall, dismiss } = usePWAInstall()
  const [showIOSSteps, setShowIOSSteps] = useState(false)

  // Don't show if installed, not available, or dismissed
  if (installState === 'installed' || installState === 'not-available' || installState === 'dismissed') {
    return null
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm overflow-hidden">
      {/* Beta badge */}
      <div className="flex items-center gap-2 bg-green-600 px-4 py-1.5">
        <span className="text-xs font-bold text-white uppercase tracking-widest">🧪 Beta Feature</span>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">📴</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-green-900 text-sm leading-snug">
              Use Little Bo Peep without signal
            </h3>
            <p className="text-green-800 text-xs mt-1 leading-relaxed">
              Install to your home screen and capture sightings even deep in the hills —
              no app store, no download, no signal needed.
            </p>

            {installState === 'available' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={triggerInstall}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Install now — it's free
                </button>
                <button
                  onClick={dismiss}
                  className="px-3 py-2 text-green-700 text-xs hover:text-green-900 transition-colors"
                >
                  Later
                </button>
              </div>
            )}

            {installState === 'ios-manual' && (
              <>
                <button
                  onClick={() => setShowIOSSteps(!showIOSSteps)}
                  className="mt-3 w-full py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  How to install on iPhone / iPad
                  <span className="text-xs">{showIOSSteps ? '▲' : '▼'}</span>
                </button>

                {showIOSSteps && (
                  <div className="mt-3 space-y-2 bg-white rounded-xl p-3 border border-green-100">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Add to Home Screen:</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                      <span>Tap the <strong>Share</strong> button at the bottom of Safari <span className="text-base">⎋</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                      <span>Tap <strong>Add</strong> — done! Open from your home screen to use offline.</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                      Must be opened in Safari for this to work
                    </p>
                  </div>
                )}

                <button
                  onClick={dismiss}
                  className="mt-2 w-full text-center text-xs text-green-700 hover:text-green-900 py-1"
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
