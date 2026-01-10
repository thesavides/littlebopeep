'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

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

function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <div className="text-slate-500">Loading map...</div>
    </div>
  )
}

export default function Map(props: MapProps) {
  const MapComponent = useMemo(
    () =>
      dynamic(() => import('./MapInner'), {
        loading: MapPlaceholder,
        ssr: false,
      }),
    []
  )

  return <MapComponent {...props} />
}
