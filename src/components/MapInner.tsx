'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useAppStore } from '@/store/appStore'
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

// Sheep icon for reports - LARGE and VISIBLE with green border
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
    type?: 'default' | 'fencepost' | 'sheep' | 'existing' | 'selected'
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

function getMarkerIcon(type?: string) {
  switch (type) {
    case 'fencepost':
      return fencePostIcon
    case 'sheep':
    case 'existing':
    case 'selected': // User's selected location should also show sheep
      return sheepIcon
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
      
      {/* Rights of way layers from OpenStreetMap */}
      {mapPreferences.layersEnabled.footpaths && (
        <TileLayer
          url="https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_API_KEY"
          opacity={0.5}
        />
      )}
      
      <MapClickHandler onClick={onClick} />
      
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
          icon={getMarkerIcon(marker.type)}
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
