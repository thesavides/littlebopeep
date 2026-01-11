'use client'

import { useState } from 'react'

interface LocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void
  className?: string
}

export default function LocationButton({ onLocationFound, className = '' }: LocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false)
        onLocationFound(position.coords.latitude, position.coords.longitude)
      },
      (err) => {
        setLoading(false)
        setError(err.code === 1 ? 'Location permission denied' : 'Could not get location')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className={className}>
      <button
        onClick={handleLocate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {loading ? (
          <>
            <span className="animate-spin">⌛</span>
            <span>Locating...</span>
          </>
        ) : (
          <>
            <span>📍</span>
            <span>Use My Location</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
