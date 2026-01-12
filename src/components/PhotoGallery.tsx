'use client'

import { useState } from 'react'

interface PhotoGalleryProps {
  photos: string[]
  className?: string
}

export default function PhotoGallery({ photos, className = '' }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, 1fr)` }}>
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                {index + 1}/{photos.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
              <button
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  const currentIndex = photos.indexOf(selectedPhoto)
                  const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
                  setSelectedPhoto(photos[prevIndex])
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  const currentIndex = photos.indexOf(selectedPhoto)
                  const nextIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1
                  setSelectedPhoto(photos[nextIndex])
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
