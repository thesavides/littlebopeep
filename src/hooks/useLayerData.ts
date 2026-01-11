/**
 * Custom hook for fetching and managing map layer data
 */

import { useState, useEffect, useCallback } from 'react'
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

  const loadFootpaths = useCallback(async (bounds: LatLngBounds) => {
    setLoading(prev => ({ ...prev, footpaths: true }))
    setErrors(prev => ({ ...prev, footpaths: null }))

    try {
      const osmData = await fetchFootpaths(bounds)
      const geoJSON = osmToGeoJSON(osmData)
      setData(prev => ({ ...prev, footpaths: geoJSON }))
    } catch (error) {
      console.error('Error loading footpaths:', error)
      setErrors(prev => ({
        ...prev,
        footpaths: error instanceof Error ? error.message : 'Failed to load footpaths'
      }))
    } finally {
      setLoading(prev => ({ ...prev, footpaths: false }))
    }
  }, [])

  const loadBridleways = useCallback(async (bounds: LatLngBounds) => {
    setLoading(prev => ({ ...prev, bridleways: true }))
    setErrors(prev => ({ ...prev, bridleways: null }))

    try {
      const osmData = await fetchBridleways(bounds)
      const geoJSON = osmToGeoJSON(osmData)
      setData(prev => ({ ...prev, bridleways: geoJSON }))
    } catch (error) {
      console.error('Error loading bridleways:', error)
      setErrors(prev => ({
        ...prev,
        bridleways: error instanceof Error ? error.message : 'Failed to load bridleways'
      }))
    } finally {
      setLoading(prev => ({ ...prev, bridleways: false }))
    }
  }, [])

  const loadTrails = useCallback(async (bounds: LatLngBounds) => {
    setLoading(prev => ({ ...prev, trails: true }))
    setErrors(prev => ({ ...prev, trails: null }))

    try {
      const osmData = await fetchTrails(bounds)
      const geoJSON = osmToGeoJSON(osmData)
      setData(prev => ({ ...prev, trails: geoJSON }))
    } catch (error) {
      console.error('Error loading trails:', error)
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

    if (enabled.footpaths && !data.footpaths && !loading.footpaths) {
      loadFootpaths(bounds)
    }

    if (enabled.bridleways && !data.bridleways && !loading.bridleways) {
      loadBridleways(bounds)
    }

    if (enabled.trails && !data.trails && !loading.trails) {
      loadTrails(bounds)
    }

    // Contours would require a different data source (SRTM, etc.)
    // For now, we'll skip contours implementation
  }, [bounds, enabled, data, loading, loadFootpaths, loadBridleways, loadTrails])

  // Clear data when layers are disabled
  useEffect(() => {
    if (!enabled.footpaths && data.footpaths) {
      setData(prev => ({ ...prev, footpaths: null }))
    }
    if (!enabled.bridleways && data.bridleways) {
      setData(prev => ({ ...prev, bridleways: null }))
    }
    if (!enabled.trails && data.trails) {
      setData(prev => ({ ...prev, trails: null }))
    }
  }, [enabled, data])

  return {
    data,
    loading,
    errors,
    refresh: useCallback(() => {
      if (!bounds) return

      if (enabled.footpaths) loadFootpaths(bounds)
      if (enabled.bridleways) loadBridleways(bounds)
      if (enabled.trails) loadTrails(bounds)
    }, [bounds, enabled, loadFootpaths, loadBridleways, loadTrails]),
  }
}
