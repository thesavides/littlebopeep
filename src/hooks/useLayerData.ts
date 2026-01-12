/**
 * Custom hook for fetching and managing map layer data
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchFootpaths,
  fetchBridleways,
  fetchTrails,
  osmToGeoJSON,
  type LatLngBounds,
  type OSMResponse,
} from '@/lib/osm-overpass'

export type LayerType = 'footpaths' | 'bridleways' | 'trails' | 'contours'

interface LayerData {
  footpaths: GeoJSON.FeatureCollection | null
  bridleways: GeoJSON.FeatureCollection | null
  trails: GeoJSON.FeatureCollection | null
  contours: GeoJSON.FeatureCollection | null
}

interface LayerLoadingState {
  footpaths: boolean
  bridleways: boolean
  trails: boolean
  contours: boolean
}

interface LayerErrorState {
  footpaths: string | null
  bridleways: string | null
  trails: string | null
  contours: string | null
}

// Helper to check if bounds have changed significantly (> 0.01 degrees ~1km)
function boundsChanged(prev: LatLngBounds | null, next: LatLngBounds | null): boolean {
  if (!prev || !next) return true
  const threshold = 0.01
  return (
    Math.abs(prev.north - next.north) > threshold ||
    Math.abs(prev.south - next.south) > threshold ||
    Math.abs(prev.east - next.east) > threshold ||
    Math.abs(prev.west - next.west) > threshold
  )
}

export function useLayerData(bounds: LatLngBounds | null, enabled: Record<LayerType, boolean>) {
  const [data, setData] = useState<LayerData>({
    footpaths: null,
    bridleways: null,
    trails: null,
    contours: null,
  })

  const [loading, setLoading] = useState<LayerLoadingState>({
    footpaths: false,
    bridleways: false,
    trails: false,
    contours: false,
  })

  const [errors, setErrors] = useState<LayerErrorState>({
    footpaths: null,
    bridleways: null,
    trails: null,
    contours: null,
  })

  // Track last bounds to reload when they change significantly
  const lastBounds = useRef<LatLngBounds | null>(null)

  const loadFootpaths = useCallback(async (bounds: LatLngBounds) => {
    console.log('🥾 Fetching footpaths for bounds:', bounds)
    setLoading(prev => ({ ...prev, footpaths: true }))
    setErrors(prev => ({ ...prev, footpaths: null }))

    try {
      const osmData = await fetchFootpaths(bounds)
      console.log('🥾 Received footpaths:', osmData.elements?.length || 0, 'ways')
      const geoJSON = osmToGeoJSON(osmData)
      console.log('🥾 Converted to GeoJSON:', geoJSON.features.length, 'features')
      setData(prev => ({ ...prev, footpaths: geoJSON }))
    } catch (error) {
      console.error('❌ Error loading footpaths:', error)
      setErrors(prev => ({
        ...prev,
        footpaths: error instanceof Error ? error.message : 'Failed to load footpaths'
      }))
    } finally {
      setLoading(prev => ({ ...prev, footpaths: false }))
    }
  }, [])

  const loadBridleways = useCallback(async (bounds: LatLngBounds) => {
    console.log('🐴 Fetching bridleways for bounds:', bounds)
    setLoading(prev => ({ ...prev, bridleways: true }))
    setErrors(prev => ({ ...prev, bridleways: null }))

    try {
      const osmData = await fetchBridleways(bounds)
      console.log('🐴 Received bridleways:', osmData.elements?.length || 0, 'ways')
      const geoJSON = osmToGeoJSON(osmData)
      console.log('🐴 Converted to GeoJSON:', geoJSON.features.length, 'features')
      setData(prev => ({ ...prev, bridleways: geoJSON }))
    } catch (error) {
      console.error('❌ Error loading bridleways:', error)
      setErrors(prev => ({
        ...prev,
        bridleways: error instanceof Error ? error.message : 'Failed to load bridleways'
      }))
    } finally {
      setLoading(prev => ({ ...prev, bridleways: false }))
    }
  }, [])

  const loadTrails = useCallback(async (bounds: LatLngBounds) => {
    console.log('🚶 Fetching trails for bounds:', bounds)
    setLoading(prev => ({ ...prev, trails: true }))
    setErrors(prev => ({ ...prev, trails: null }))

    try {
      const osmData = await fetchTrails(bounds)
      console.log('🚶 Received trails:', osmData.elements?.length || 0, 'ways')
      const geoJSON = osmToGeoJSON(osmData)
      console.log('🚶 Converted to GeoJSON:', geoJSON.features.length, 'features')
      setData(prev => ({ ...prev, trails: geoJSON }))
    } catch (error) {
      console.error('❌ Error loading trails:', error)
      setErrors(prev => ({
        ...prev,
        trails: error instanceof Error ? error.message : 'Failed to load trails'
      }))
    } finally {
      setLoading(prev => ({ ...prev, trails: false }))
    }
  }, [])

  // Load layers when enabled and bounds change
  useEffect(() => {
    if (!bounds) return

    // Check if bounds changed significantly
    const shouldReload = boundsChanged(lastBounds.current, bounds)

    if (shouldReload) {
      console.log('📍 Bounds changed, reloading enabled layers')
      lastBounds.current = bounds
    }

    // Load footpaths if enabled and (no data OR bounds changed)
    if (enabled.footpaths && !loading.footpaths && (shouldReload || !data.footpaths)) {
      loadFootpaths(bounds)
    }

    // Load bridleways if enabled and (no data OR bounds changed)
    if (enabled.bridleways && !loading.bridleways && (shouldReload || !data.bridleways)) {
      loadBridleways(bounds)
    }

    // Load trails if enabled and (no data OR bounds changed)
    if (enabled.trails && !loading.trails && (shouldReload || !data.trails)) {
      loadTrails(bounds)
    }

    // Contours would require a different data source (SRTM, etc.)
    // For now, we'll skip contours implementation
  }, [bounds, enabled, data.footpaths, data.bridleways, data.trails, loading, loadFootpaths, loadBridleways, loadTrails])

  // Clear data when layers are disabled
  useEffect(() => {
    if (!enabled.footpaths && data.footpaths) {
      console.log('🥾 Clearing footpaths (disabled)')
      setData(prev => ({ ...prev, footpaths: null }))
    }
    if (!enabled.bridleways && data.bridleways) {
      console.log('🐴 Clearing bridleways (disabled)')
      setData(prev => ({ ...prev, bridleways: null }))
    }
    if (!enabled.trails && data.trails) {
      console.log('🚶 Clearing trails (disabled)')
      setData(prev => ({ ...prev, trails: null }))
    }
  }, [enabled, data])

  return {
    data,
    loading,
    errors,
    refresh: useCallback(() => {
      if (!bounds) return

      console.log('🔄 Manual refresh requested')
      if (enabled.footpaths) loadFootpaths(bounds)
      if (enabled.bridleways) loadBridleways(bounds)
      if (enabled.trails) loadTrails(bounds)
    }, [bounds, enabled, loadFootpaths, loadBridleways, loadTrails]),
  }
}
