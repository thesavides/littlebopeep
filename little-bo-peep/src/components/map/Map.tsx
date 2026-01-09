'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Locate, Plus, Minus, Layers } from 'lucide-react';
import type { Coordinates } from '@/types';

interface MapProps {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (coords: Coordinates) => void;
  onMarkerClick?: (markerId: string) => void;
  showUserLocation?: boolean;
  draggableMarker?: boolean;
  onDragEnd?: (coords: Coordinates) => void;
  className?: string;
  children?: React.ReactNode;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type?: 'report' | 'user' | 'pin';
  status?: 'pending' | 'claimed' | 'resolved';
}

// Simplified map component using OpenStreetMap tiles
// In production, this would integrate with Mapbox GL JS
export function Map({
  center = { lat: 54.5, lng: -2.5 },
  zoom = 10,
  markers = [],
  onMapClick,
  onMarkerClick,
  showUserLocation = false,
  draggableMarker = false,
  onDragEnd,
  className,
  children,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [pinPosition, setPinPosition] = useState(center);
  const [isDragging, setIsDragging] = useState(false);

  // Get user location
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setCurrentCenter(loc);
        setPinPosition(loc);
        setIsLocating(false);
        if (onDragEnd) onDragEnd(loc);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onDragEnd]);

  useEffect(() => {
    if (showUserLocation) {
      locateUser();
    }
  }, [showUserLocation, locateUser]);

  // Tile calculation for OpenStreetMap
  const getTileCoords = (lat: number, lng: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    return { x, y };
  };

  const tile = getTileCoords(currentCenter.lat, currentCenter.lng, currentZoom);

  // Map interaction handlers
  const handleZoomIn = () => {
    setCurrentZoom((z) => Math.min(z + 1, 18));
  };

  const handleZoomOut = () => {
    setCurrentZoom((z) => Math.max(z - 1, 4));
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !onMapClick) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel position to lat/lng (simplified)
    const lng = currentCenter.lng + ((x - rect.width / 2) / rect.width) * (360 / Math.pow(2, currentZoom));
    const lat = currentCenter.lat - ((y - rect.height / 2) / rect.height) * (180 / Math.pow(2, currentZoom));
    
    onMapClick({ lat, lng });
    if (draggableMarker) {
      setPinPosition({ lat, lng });
      if (onDragEnd) onDragEnd({ lat, lng });
    }
  };

  // Marker color based on status
  const getMarkerColor = (marker: MapMarker) => {
    if (marker.type === 'user') return 'bg-sky-500';
    switch (marker.status) {
      case 'pending':
        return 'bg-amber-500';
      case 'claimed':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-emerald-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-stone-100', className)}>
      {/* Map tiles */}
      <div
        ref={mapRef}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: `url(https://tile.openstreetmap.org/${currentZoom}/${tile.x}/${tile.y}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Tile grid for better coverage */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {[-1, 0, 1].map((dx) =>
            [-1, 0, 1].map((dy) => (
              <div
                key={`${dx}-${dy}`}
                className="w-full h-full"
                style={{
                  backgroundImage: `url(https://tile.openstreetmap.org/${currentZoom}/${tile.x + dx}/${tile.y + dy}.png)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))
          )}
        </div>

        {/* Markers */}
        {markers.map((marker) => (
          <button
            key={marker.id}
            onClick={(e) => {
              e.stopPropagation();
              if (onMarkerClick) onMarkerClick(marker.id);
            }}
            className={cn(
              'absolute w-8 h-8 -ml-4 -mt-4 rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 z-10',
              getMarkerColor(marker)
            )}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(
                ${((marker.lng - currentCenter.lng) * Math.pow(2, currentZoom) * 256) / 360}px,
                ${((currentCenter.lat - marker.lat) * Math.pow(2, currentZoom) * 256) / 180}px
              )`,
            }}
          >
            <span className="sr-only">Marker at {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
          </button>
        ))}

        {/* User location marker */}
        {userLocation && showUserLocation && (
          <div
            className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-sky-500 border-2 border-white shadow-lg z-10"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-75" />
          </div>
        )}

        {/* Draggable pin */}
        {draggableMarker && (
          <div
            className={cn(
              'absolute left-1/2 top-1/2 -ml-4 -mt-8 z-20 transition-transform cursor-grab',
              isDragging && 'scale-110'
            )}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            <div className="relative">
              <svg
                width="32"
                height="40"
                viewBox="0 0 32 40"
                fill="none"
                className="drop-shadow-lg"
              >
                <path
                  d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24C32 7.164 24.836 0 16 0z"
                  fill="#059669"
                />
                <circle cx="16" cy="16" r="8" fill="white" />
              </svg>
              <div className="absolute bottom-0 left-1/2 -ml-2 w-4 h-4 bg-stone-900/20 rounded-full blur-sm -z-10" />
            </div>
          </div>
        )}
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={locateUser}
          disabled={isLocating}
          className={cn(
            'w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center transition-all',
            'hover:bg-stone-50 active:scale-95',
            isLocating && 'animate-pulse'
          )}
          title="Find my location"
        >
          <Locate className="w-5 h-5 text-stone-600" />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center hover:bg-stone-50 active:scale-95"
          title="Zoom in"
        >
          <Plus className="w-5 h-5 text-stone-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center hover:bg-stone-50 active:scale-95"
          title="Zoom out"
        >
          <Minus className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow text-xs text-stone-600 font-mono z-20">
        {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-white/80 text-xs text-stone-500 z-20">
        © OpenStreetMap
      </div>

      {children}
    </div>
  );
}

// Simple static map for thumbnails
interface StaticMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

export function StaticMap({ lat, lng, zoom = 14, className }: StaticMapProps) {
  const tile = {
    x: Math.floor(((lng + 180) / 360) * Math.pow(2, zoom)),
    y: Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    ),
  };

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl bg-stone-100', className)}
      style={{
        backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg" />
      </div>
    </div>
  );
}
