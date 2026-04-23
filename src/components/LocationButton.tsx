'use client'

import { useState, useEffect } from 'react'

interface LocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void
  className?: string
  /** If true, fire geolocation as soon as component mounts */
  autoLocate?: boolean
  /** Show as full-width prominent button (default false = compact pill) */
  prominent?: boolean
}

export default function LocationButton({
  onLocationFound,
  className = '',
  autoLocate = false,
  prominent = false,
}: LocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        setDone(true)
        onLocationFound(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setLoading(false)
        setError(err.code === 1 ? 'Location permission denied — tap the map instead' : 'Could not get location')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    if (autoLocate) locate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (prominent) {
    return (
      <div className={className}>
        <button
          onClick={locate}
          disabled={loading || done}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors shadow-sm
            ${done
              ? 'bg-[#9ED663]/20 text-[#2a5200] cursor-default'
              : loading
                ? 'bg-[#7D8DCC]/20 text-[#614270] cursor-wait'
                : 'bg-[#7D8DCC] text-white hover:bg-[#6b7bb8] active:scale-[0.98]'
            }`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Getting your location…
            </>
          ) : done ? (
            <>✓ Location found — adjust on map if needed</>
          ) : (
            <>
              <span>📍</span> Use My Location
            </>
          )}
        </button>
        {error && <p className="text-xs text-[#FA9335] mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        onClick={locate}
        disabled={loading || done}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm
          ${done
            ? 'bg-[#9ED663]/20 text-[#2a5200] cursor-default text-sm'
            : 'bg-[#7D8DCC] text-white hover:bg-[#6b7bb8] disabled:bg-[#7D8DCC]/50 disabled:cursor-not-allowed'
          }`}
      >
        {loading ? (
          <><span className="animate-spin">⌛</span> Locating…</>
        ) : done ? (
          <>✓ Location found</>
        ) : (
          <><span>📍</span> Use My Location</>
        )}
      </button>
      {error && <p className="text-xs text-[#FA9335] mt-1">{error}</p>}
    </div>
  )
}
