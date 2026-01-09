'use client';

import { useEffect } from 'react';
import { Map } from '@/components/map/Map';
import { Button } from '@/components/ui';
import { MapPin, Navigation } from 'lucide-react';
import { useReportFormStore } from '@/store';
import type { Coordinates } from '@/types';

export function LocationStep() {
  const { location, locationConfirmed, setLocation, confirmLocation } = useReportFormStore();

  useEffect(() => {
    // Try to get user location on mount
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to UK center if geolocation fails
          setLocation({ lat: 54.5, lng: -2.5 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [location, setLocation]);

  const handleDragEnd = (coords: Coordinates) => {
    setLocation(coords);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900">Where did you see the sheep?</h2>
        <p className="text-stone-500 mt-1">Drag the pin to the exact location</p>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          center={location || { lat: 54.5, lng: -2.5 }}
          zoom={location ? 15 : 6}
          showUserLocation
          draggableMarker
          onDragEnd={handleDragEnd}
          className="h-full"
        />

        {/* Accuracy hint */}
        <div className="absolute top-4 left-4 right-16 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg">
          <Navigation className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm text-stone-600">
            Position the pin as accurately as possible
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 bg-white border-t border-stone-100">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-stone-50">
          <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-stone-700">Selected location: </span>
            {location ? (
              <span className="text-stone-500 font-mono">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-stone-400">Getting your location...</span>
            )}
          </div>
        </div>

        <Button
          onClick={confirmLocation}
          disabled={!location}
          className="w-full"
          size="lg"
          rightIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
