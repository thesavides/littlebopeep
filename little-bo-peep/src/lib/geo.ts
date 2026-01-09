import * as turf from '@turf/turf';
import type { Coordinates, GeoJSON, Farmer, Report } from '@/types';

// Geohash encoding for efficient spatial queries
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat: number, lng: number, precision: number = 7): string {
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;
  let hash = '';
  let bit = 0;
  let ch = 0;
  let isEven = true;

  while (hash.length < precision) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        minLng = mid;
      } else {
        maxLng = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        minLat = mid;
      } else {
        maxLat = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

// Calculate distance between two coordinates in kilometers
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const from = turf.point([coord1.lng, coord1.lat]);
  const to = turf.point([coord2.lng, coord2.lat]);
  return turf.distance(from, to, { units: 'kilometers' });
}

// Check if a point is within a polygon
export function isPointInPolygon(point: Coordinates, polygon: GeoJSON): boolean {
  if (polygon.type !== 'Polygon') return false;
  
  const turfPoint = turf.point([point.lng, point.lat]);
  const turfPolygon = turf.polygon(polygon.coordinates as number[][][]);
  
  return turf.booleanPointInPolygon(turfPoint, turfPolygon);
}

// Check if a point is within a radius of a center point
export function isPointInRadius(
  point: Coordinates, 
  center: Coordinates, 
  radiusKm: number
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
}

// Find farmers whose alert areas contain a given point
export function findMatchingFarmers(
  reportLocation: Coordinates,
  farmers: Farmer[]
): { farmer: Farmer; distance: number }[] {
  const matches: { farmer: Farmer; distance: number }[] = [];

  for (const farmer of farmers) {
    if (farmer.subscription_status !== 'active' && farmer.subscription_status !== 'trial') {
      continue;
    }

    // Check if farmer is muted
    if (farmer.muted_until && new Date(farmer.muted_until) > new Date()) {
      continue;
    }

    let isMatch = false;
    let distance = 0;

    // Check polygon-based alert area
    if (farmer.alert_area && farmer.alert_area.type === 'Polygon') {
      isMatch = isPointInPolygon(reportLocation, farmer.alert_area);
      if (isMatch) {
        // Calculate distance to centroid
        const centroid = turf.centroid(turf.polygon(farmer.alert_area.coordinates as number[][][]));
        distance = calculateDistance(reportLocation, {
          lat: centroid.geometry.coordinates[1],
          lng: centroid.geometry.coordinates[0]
        });
      }
    }

    // Check radius-based alert area
    if (!isMatch && farmer.center_lat && farmer.center_lng && farmer.alert_radius_km) {
      const center = { lat: farmer.center_lat, lng: farmer.center_lng };
      isMatch = isPointInRadius(reportLocation, center, farmer.alert_radius_km);
      if (isMatch) {
        distance = calculateDistance(reportLocation, center);
      }
    }

    if (isMatch) {
      matches.push({ farmer, distance });
    }
  }

  // Sort by distance (closest first)
  return matches.sort((a, b) => a.distance - b.distance);
}

// Check for duplicate reports (within 50m and 2 hours)
export function checkDuplicateReport(
  newReport: Coordinates,
  existingReports: Report[],
  maxDistanceKm: number = 0.05, // 50 meters
  maxAgeHours: number = 2
): Report | null {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - maxAgeHours * 60 * 60 * 1000);

  for (const report of existingReports) {
    const reportDate = new Date(report.created_at);
    if (reportDate < cutoffTime) continue;

    const distance = calculateDistance(newReport, { lat: report.lat, lng: report.lng });
    if (distance <= maxDistanceKm) {
      return report;
    }
  }

  return null;
}

// Create a circle polygon from center and radius
export function createCirclePolygon(center: Coordinates, radiusKm: number, steps: number = 64): GeoJSON {
  const circle = turf.circle([center.lng, center.lat], radiusKm, { steps, units: 'kilometers' });
  return {
    type: 'Polygon',
    coordinates: circle.geometry.coordinates
  };
}

// Validate polygon coordinates
export function isValidPolygon(polygon: GeoJSON): boolean {
  if (polygon.type !== 'Polygon') return false;
  
  try {
    const coords = polygon.coordinates as number[][][];
    if (!coords || coords.length === 0 || coords[0].length < 4) return false;
    
    // Check if polygon is closed (first and last points are the same)
    const ring = coords[0];
    const first = ring[0];
    const last = ring[ring.length - 1];
    
    return first[0] === last[0] && first[1] === last[1];
  } catch {
    return false;
  }
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Get bounding box for a set of coordinates
export function getBoundingBox(coordinates: Coordinates[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (coordinates.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;

  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
  }

  return { minLat, maxLat, minLng, maxLng };
}
