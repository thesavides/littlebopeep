'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'

export default function MapLayerControl() {
  const { mapPreferences, updateMapPreferences } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const handleToggleLayer = (layer: 'footpaths' | 'bridleways' | 'trails' | 'contours') => {
    // Show disclaimer on first layer activation
    if (!mapPreferences.disclaimerAccepted && !mapPreferences.layersEnabled[layer]) {
      setShowDisclaimer(true)
      return
    }

    updateMapPreferences({
      layersEnabled: {
        ...mapPreferences.layersEnabled,
        [layer]: !mapPreferences.layersEnabled[layer]
      }
    })
  }

  const handleAcceptDisclaimer = () => {
    updateMapPreferences({ disclaimerAccepted: true })
    setShowDisclaimer(false)
  }

  return (
    <>
      {/* Layer Control Button */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 flex items-center gap-2 hover:bg-slate-50 rounded-lg"
        >
          <span>🗺️</span>
          <span className="text-sm font-medium">Layers</span>
          <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
        </button>

        {isOpen && (
          <div className="border-t border-slate-200 p-3 space-y-2 min-w-[180px]">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={mapPreferences.layersEnabled.footpaths}
                onChange={() => handleToggleLayer('footpaths')}
                className="w-4 h-4"
              />
              <span className="text-sm">🥾 Footpaths</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={mapPreferences.layersEnabled.bridleways}
                onChange={() => handleToggleLayer('bridleways')}
                className="w-4 h-4"
              />
              <span className="text-sm">🐴 Bridleways</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={mapPreferences.layersEnabled.trails}
                onChange={() => handleToggleLayer('trails')}
                className="w-4 h-4"
              />
              <span className="text-sm">🚶 Trails</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={mapPreferences.layersEnabled.contours}
                onChange={() => handleToggleLayer('contours')}
                className="w-4 h-4"
              />
              <span className="text-sm">📏 Contours</span>
            </label>

            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowDisclaimer(true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                View disclaimer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              ⚠️ Rights of Way Disclaimer
            </h3>
            <div className="text-sm text-slate-600 space-y-2 mb-4">
              <p>
                Rights of way data is provided for <strong>reference only</strong>.
              </p>
              <p>
                Always verify access rights with local authorities. Data may be incomplete or inaccurate.
              </p>
              <p className="font-medium text-slate-800">
                Users are responsible for ensuring lawful access to all areas.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptDisclaimer}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                I Understand
              </button>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
