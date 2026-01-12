'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMapEvents, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useLayerData, type LayerType } from '@/hooks/useLayerData'
import type { LatLngBounds } from '@/lib/osm-overpass'
import MapLayerControl from './MapLayerControl'

// Fix Leaflet marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Fence post icon (simple wooden pole)
const fencePostIcon = L.divIcon({
  className: 'fence-post-marker',
  html: `<div style="
    width: 8px;
    height: 28px;
    background: linear-gradient(to right, #8B4513 0%, #A0522D 40%, #8B4513 100%);
    border: 1px solid #5D3A1A;
    border-radius: 1px;
    box-shadow: 2px 2px 3px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [8, 28],
  iconAnchor: [4, 28],
  popupAnchor: [0, -28],
})

// Sheep icon for reports - LARGE and VISIBLE with green border (reported status)
const sheepIcon = L.divIcon({
  className: 'sheep-marker',
  html: `<div style="
    font-size: 28px;
    width: 40px;
    height: 40px;
    background: white;
    border: 3px solid #22c55e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  ">🐑</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

// Claimed report icon - Yellow border
const sheepClaimedIcon = L.divIcon({
  className: 'sheep-marker-claimed',
  html: `<div style="
    font-size: 28px;
    width: 40px;
    height: 40px;
    background: white;
    border: 3px solid #eab308;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  ">🐑</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

// Resolved report icon - Gray border
const sheepResolvedIcon = L.divIcon({
  className: 'sheep-marker-resolved',
  html: `<div style="
    font-size: 28px;
    width: 40px;
    height: 40px;
    background: white;
    border: 3px solid #64748b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    opacity: 0.7;
  ">🐑</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

// User location icon - Blue pin
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

L.Marker.prototype.options.icon = defaultIcon

interface MapProps {
  center?: [number, number]
  zoom?: number
  onClick?: (lat: number, lng: number) => void
  markers?: Array<{
    id: string
    position: [number, number]
    popup?: string
    color?: 'red' | 'green' | 'blue'
    type?: 'default' | 'fencepost' | 'sheep' | 'existing' | 'selected' | 'user-location'
    status?: 'reported' | 'claimed' | 'resolved'
  }>
  circles?: Array<{
    center: [number, number]
    radius: number
    color?: string
  }>
  polygons?: Array<{
    id: string
    positions: Array<[number, number]>
    color?: string
  }>
  className?: string
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Component to track map bounds and load layers
function LayerRenderer() {
  const map = useMap()
  const { mapPreferences } = useAppStore()
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)

  useEffect(() => {
    const updateBounds = () => {
      const mapBounds = map.getBounds()
      setBounds({
        south: mapBounds.getSouth(),
        west: mapBounds.getWest(),
        north: mapBounds.getNorth(),
        east: mapBounds.getEast(),
      })
    }

    // Update bounds on initial load
    updateBounds()

    // Update bounds when map moves
    map.on('moveend', updateBounds)

    return () => {
      map.off('moveend', updateBounds)
    }
  }, [map])

  const { data, loading, errors } = useLayerData(bounds, mapPreferences.layersEnabled)

  // Style functions for different layer types
  const footpathStyle = (feature?: any) => ({
    color: '#FF6B6B',
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 5',
  })

  const bridlewayStyle = (feature?: any) => ({
    color: '#4ECDC4',
    weight: 3,
    opacity: 0.7,
  })

  const trailStyle = (feature?: any) => ({
    color: '#95E1D3',
    weight: 2,
    opacity: 0.6,
    dashArray: '3, 6',
  })

  const contourStyle = (feature?: any) => ({
    color: '#8B4513',
    weight: 1,
    opacity: 0.5,
  })

  return (
    <>
      {/* Footpaths layer */}
      {data.footpaths && (
        <GeoJSON
          data={data.footpaths}
          style={footpathStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(`
                <strong>🥾 Footpath</strong><br/>
                ${feature.properties.name || 'Unnamed path'}<br/>
                <small>Type: ${feature.properties.highway || 'N/A'}</small>
              `)
            }
          }}
        />
      )}

      {/* Bridleways layer */}
      {data.bridleways && (
        <GeoJSON
          data={data.bridleways}
          style={bridlewayStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(`
                <strong>🐴 Bridleway</strong><br/>
                ${feature.properties.name || 'Unnamed bridleway'}<br/>
                <small>Type: ${feature.properties.highway || 'N/A'}</small>
              `)
            }
          }}
        />
      )}

      {/* Trails layer */}
      {data.trails && (
        <GeoJSON
          data={data.trails}
          style={trailStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(`
                <strong>🚶 Trail</strong><br/>
                ${feature.properties.name || 'Unnamed trail'}<br/>
                <small>Type: ${feature.properties.highway || 'N/A'}</small>
              `)
            }
          }}
        />
      )}

      {/* Contours layer - Note: Currently not implemented in data fetching */}
      {data.contours && (
        <GeoJSON
          data={data.contours}
          style={contourStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(`
                <strong>📏 Contour</strong><br/>
                Elevation: ${feature.properties.ele || 'Unknown'}m<br/>
                <small>Every ${feature.properties.step || '10'}m</small>
              `)
            }
          }}
        />
      )}

      {/* Loading indicator */}
      {(loading.footpaths || loading.bridleways || loading.trails || loading.contours) && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600">Loading layers...</span>
        </div>
      )}

      {/* Error display */}
      {(errors.footpaths || errors.bridleways || errors.trails || errors.contours) && (
        <div className="absolute bottom-4 left-4 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <span className="text-sm text-red-600">
            {errors.footpaths || errors.bridleways || errors.trails || errors.contours}
          </span>
        </div>
      )}
    </>
  )
}

function getMarkerIcon(type?: string, status?: string) {
  switch (type) {
    case 'fencepost':
      return fencePostIcon
    case 'user-location':
      return userLocationIcon
    case 'sheep':
    case 'existing':
    case 'selected':
      // Return icon based on report status
      if (status === 'claimed') return sheepClaimedIcon
      if (status === 'resolved') return sheepResolvedIcon
      return sheepIcon // Default to reported (green)
    default:
      return defaultIcon
  }
}

export default function MapInner({
  center = [54.5, -2],
  zoom = 13, // Default to ~5km view
  onClick,
  markers = [],
  circles = [],
  polygons = [],
  className = '',
}: MapProps) {
  const { mapPreferences } = useAppStore()

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '300px' }}
    >
      {/* Base map layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onClick} />

      {/* Layer Renderer - handles OSM data layers */}
      <LayerRenderer />

      {/* Layer Control */}
      <MapLayerControl />
      
      {/* Render polygons (fence boundaries) */}
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.positions}
          pathOptions={{
            color: polygon.color || '#8B4513',
            fillColor: polygon.color || '#8B4513',
            fillOpacity: 0.15,
            weight: 3,
            dashArray: '10, 5', // Dashed line like fence wire
          }}
        />
      ))}
      
      {/* Render fence lines between posts */}
      {polygons.map((polygon) => (
        polygon.positions.length > 1 && (
          <Polyline
            key={`line-${polygon.id}`}
            positions={[...polygon.positions, polygon.positions[0]]} // Close the loop
            pathOptions={{
              color: '#5D3A1A',
              weight: 2,
              dashArray: '5, 10', // Wire pattern
            }}
          />
        )
      ))}
      
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={getMarkerIcon(marker.type, marker.status)}
        >
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
      
      {circles.map((circle, index) => (
        <Circle
          key={index}
          center={circle.center}
          radius={circle.radius}
          pathOptions={{
            color: circle.color || '#22c55e',
            fillColor: circle.color || '#22c55e',
            fillOpacity: 0.2,
          }}
        />
      ))}
    </MapContainer>
  )
}
