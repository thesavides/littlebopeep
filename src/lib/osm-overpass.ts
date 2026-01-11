/**
 * OpenStreetMap Overpass API Integration
 * Fetches footpaths, bridleways, trails, and other map features
 */

export interface LatLngBounds {
  south: number
  west: number
  north: number
  east: number
}

export interface OSMWay {
  type: string
  id: number
  nodes: number[]
  tags: Record<string, string>
  geometry: Array<{ lat: number; lon: number }>
}

export interface OSMResponse {
  version: number
  elements: OSMWay[]
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'

// Cache for API responses (key: bbox+type, value: {data, timestamp})
const cache = new Map<string, { data: OSMResponse; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Generate cache key from bounds and query type
 */
function getCacheKey(bounds: LatLngBounds, queryType: string): string {
  return `${queryType}_${bounds.south}_${bounds.west}_${bounds.north}_${bounds.east}`
}

/**
 * Check if cached data is still valid
 */
function getCachedData(key: string): OSMResponse | null {
  const cached = cache.get(key)
  if (!cached) return null

  const age = Date.now() - cached.timestamp
  if (age > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return cached.data
}

/**
 * Fetch data from Overpass API
 */
async function queryOverpass(query: string): Promise<OSMResponse> {
  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Build Overpass QL query for paths/ways
 */
function buildPathQuery(bounds: LatLngBounds, highwayType: string[]): string {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
  const typeFilters = highwayType.map(t => `["highway"="${t}"]`).join('')

  return `
    [out:json][timeout:25];
    (
      way${typeFilters}(${bbox});
    );
    out geom;
  `.trim()
}

/**
 * Fetch footpaths (public walking paths)
 */
export async function fetchFootpaths(bounds: LatLngBounds): Promise<OSMResponse> {
  const cacheKey = getCacheKey(bounds, 'footpaths')
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const query = buildPathQuery(bounds, ['footway', 'path', 'steps', 'pedestrian'])
  const data = await queryOverpass(query)

  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

/**
 * Fetch bridleways (horse riding paths)
 */
export async function fetchBridleways(bounds: LatLngBounds): Promise<OSMResponse> {
  const cacheKey = getCacheKey(bounds, 'bridleways')
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const query = buildPathQuery(bounds, ['bridleway'])
  const data = await queryOverpass(query)

  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

/**
 * Fetch trails (hiking trails, tracks)
 */
export async function fetchTrails(bounds: LatLngBounds): Promise<OSMResponse> {
  const cacheKey = getCacheKey(bounds, 'trails')
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const query = buildPathQuery(bounds, ['track', 'cycleway'])
  const data = await queryOverpass(query)

  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

/**
 * Convert OSM response to GeoJSON format for Leaflet
 */
export function osmToGeoJSON(osmData: OSMResponse): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: osmData.elements.map((element) => ({
      type: 'Feature',
      id: element.id,
      properties: {
        ...element.tags,
        osmType: element.type,
        osmId: element.id,
      },
      geometry: {
        type: 'LineString',
        coordinates: element.geometry.map((node) => [node.lon, node.lat]),
      },
    })),
  }
}

/**
 * Clear all cached data (useful for debugging)
 */
export function clearCache(): void {
  cache.clear()
}
