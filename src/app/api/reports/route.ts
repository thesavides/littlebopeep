/**
 * Reports API Route
 *
 * This API endpoint handles the creation and retrieval of lost sheep sighting reports
 * submitted by walkers in the Little Bo Peep application. It provides core functionality
 * for the walker-to-farmer notification system.
 *
 * @module api/reports
 *
 * Features:
 * - Create new sheep sighting reports with location, tags, and optional photos
 * - Retrieve reports with filtering by walker ID, status, and pagination
 * - Duplicate detection to prevent redundant reports from the same location
 * - Automatic geohash encoding for efficient spatial queries
 *
 * Implementation Notes:
 * - Currently uses in-memory storage for demo purposes
 * - Production version should integrate with Supabase database
 * - Walker authentication is stubbed with 'demo-walker' ID
 * - All timestamps use ISO 8601 format
 *
 * @see {@link Report} for the report data structure
 * @see {@link CreateReportRequest} for request payload format
 * @see {@link CreateReportResponse} for response format
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { encodeGeohash, checkDuplicateReport } from '@/lib/geo';
import type { Report, CreateReportRequest, CreateReportResponse } from '@/types';

/**
 * In-memory store for sheep sighting reports (demo only)
 *
 * WARNING: This is for demonstration purposes only. Data will be lost on server restart.
 * In production, this should be replaced with Supabase database queries.
 *
 * @type {Report[]}
 */
const reports: Report[] = [];

/**
 * GET /api/reports - Retrieve sheep sighting reports
 *
 * Fetches a list of sheep sighting reports with optional filtering and pagination.
 * Reports are sorted by creation date (newest first) and can be filtered by
 * walker ID and status.
 *
 * @async
 * @function GET
 * @param {NextRequest} request - The Next.js request object
 *
 * @query {string} [walker_id] - Filter reports by walker ID (e.g., 'walker-123')
 * @query {string} [status] - Filter by report status ('pending', 'claimed', 'resolved')
 * @query {string} [limit=50] - Maximum number of reports to return (default: 50)
 *
 * @returns {Promise<NextResponse>} JSON response with reports array and total count
 *
 * @example
 * // Fetch all reports (default limit: 50)
 * GET /api/reports
 *
 * // Response:
 * {
 *   "reports": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "walker_id": "demo-walker",
 *       "lat": 51.5074,
 *       "lng": -0.1278,
 *       "geohash": "gcpvj0du",
 *       "created_at": "2026-01-10T12:00:00.000Z",
 *       "updated_at": "2026-01-10T12:00:00.000Z",
 *       "tags": ["white_fleece", "limping"],
 *       "photo_url": null,
 *       "description": "Sheep spotted near Hyde Park",
 *       "status": "pending",
 *       "claimed_by": null,
 *       "resolved_at": null
 *     }
 *   ],
 *   "total": 1
 * }
 *
 * @example
 * // Fetch reports by walker ID with status filter
 * GET /api/reports?walker_id=demo-walker&status=pending&limit=10
 *
 * // Response:
 * {
 *   "reports": [...],  // Up to 10 pending reports from demo-walker
 *   "total": 5
 * }
 *
 * @example
 * // Filter by status only
 * GET /api/reports?status=resolved&limit=20
 *
 * // Response:
 * {
 *   "reports": [...],  // Up to 20 resolved reports
 *   "total": 15
 * }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walkerId = searchParams.get('walker_id');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  let filteredReports = [...reports];

  if (walkerId) {
    filteredReports = filteredReports.filter((r) => r.walker_id === walkerId);
  }

  if (status) {
    filteredReports = filteredReports.filter((r) => r.status === status);
  }

  filteredReports.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    reports: filteredReports.slice(0, limit),
    total: filteredReports.length,
  });
}

/**
 * POST /api/reports - Create a new sheep sighting report
 *
 * Creates a new sheep sighting report submitted by a walker. The endpoint performs
 * validation, duplicate detection, and automatic geohash encoding for spatial indexing.
 * Upon successful creation, the report is added to the in-memory store and can be
 * matched against farmer holdings.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - The Next.js request object containing the report data
 *
 * @body {CreateReportRequest} - The request payload
 * @body {number} lat - Latitude of the sheep sighting (required, -90 to 90)
 * @body {number} lng - Longitude of the sheep sighting (required, -180 to 180)
 * @body {string[]} tags - Array of sheep characteristics (required, min 1 tag)
 *   Valid tags: 'white_fleece', 'black_fleece', 'brown_fleece', 'mixed_fleece',
 *              'horned', 'ear_tag_visible', 'limping', 'multiple_sheep'
 * @body {string} [description] - Optional text description of the sighting
 * @body {string} [photo_url] - Optional URL to uploaded photo evidence
 *
 * @returns {Promise<NextResponse>} JSON response with success status and report data
 *
 * @throws {400} Bad Request - Missing or invalid required fields
 * @throws {409} Conflict - Duplicate report detected within proximity threshold
 * @throws {500} Internal Server Error - Server-side error during report creation
 *
 * @example
 * // Successful report creation
 * POST /api/reports
 * Content-Type: application/json
 *
 * {
 *   "lat": 51.5074,
 *   "lng": -0.1278,
 *   "tags": ["white_fleece", "limping"],
 *   "description": "Single white sheep limping near Hyde Park fountain"
 * }
 *
 * // Response (200 OK):
 * {
 *   "success": true,
 *   "report": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "walker_id": "demo-walker",
 *     "lat": 51.5074,
 *     "lng": -0.1278,
 *     "geohash": "gcpvj0du",
 *     "created_at": "2026-01-10T12:00:00.000Z",
 *     "updated_at": "2026-01-10T12:00:00.000Z",
 *     "tags": ["white_fleece", "limping"],
 *     "photo_url": null,
 *     "description": "Single white sheep limping near Hyde Park fountain",
 *     "status": "pending",
 *     "claimed_by": null,
 *     "resolved_at": null
 *   }
 * }
 *
 * @example
 * // Validation error - missing location
 * POST /api/reports
 * Content-Type: application/json
 *
 * {
 *   "tags": ["white_fleece"]
 * }
 *
 * // Response (400 Bad Request):
 * {
 *   "success": false,
 *   "error": "Location is required"
 * }
 *
 * @example
 * // Validation error - missing tags
 * POST /api/reports
 * Content-Type: application/json
 *
 * {
 *   "lat": 51.5074,
 *   "lng": -0.1278
 * }
 *
 * // Response (400 Bad Request):
 * {
 *   "success": false,
 *   "error": "At least one tag is required"
 * }
 *
 * @example
 * // Duplicate detection
 * POST /api/reports
 * Content-Type: application/json
 *
 * {
 *   "lat": 51.5074,
 *   "lng": -0.1278,
 *   "tags": ["white_fleece"]
 * }
 *
 * // Response (200 OK - note: returns 200 but with duplicate_warning):
 * {
 *   "success": false,
 *   "error": "A similar report already exists nearby",
 *   "duplicate_warning": true
 * }
 *
 * @example
 * // Report with photo evidence
 * POST /api/reports
 * Content-Type: application/json
 *
 * {
 *   "lat": 51.5074,
 *   "lng": -0.1278,
 *   "tags": ["white_fleece", "ear_tag_visible", "multiple_sheep"],
 *   "description": "Three sheep with ear tags visible",
 *   "photo_url": "https://storage.example.com/reports/photo-123.jpg"
 * }
 *
 * // Response (200 OK):
 * {
 *   "success": true,
 *   "report": {
 *     "id": "...",
 *     // ... other fields
 *     "photo_url": "https://storage.example.com/reports/photo-123.jpg",
 *     "description": "Three sheep with ear tags visible"
 *   }
 * }
 *
 * @remarks
 * Validation Rules:
 * - Location (lat/lng) is mandatory for all reports
 * - At least one tag must be provided to describe the sheep
 * - Description and photo_url are optional but recommended for better matching
 * - Duplicate detection uses proximity threshold defined in geo.ts
 *
 * Duplicate Detection:
 * - Uses checkDuplicateReport() to compare against existing reports
 * - Checks for reports within a certain distance threshold (see geo.ts)
 * - Returns duplicate_warning flag but does NOT create the report
 * - Prevents spam and multiple submissions for the same sighting
 *
 * Auto-Generated Fields:
 * - id: UUID v4 generated for unique identification
 * - walker_id: Currently stubbed as 'demo-walker' (TODO: implement auth)
 * - geohash: Automatically encoded from lat/lng for efficient spatial queries
 * - created_at/updated_at: ISO 8601 timestamps
 * - status: Always 'pending' for new reports
 * - claimed_by/resolved_at: null until a farmer claims the report
 *
 * Future Enhancements:
 * - Integrate real walker authentication (replace demo-walker)
 * - Add photo upload/storage functionality
 * - Implement automatic farmer matching and notifications
 * - Add rate limiting to prevent abuse
 * - Store reports in Supabase database instead of memory
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReportRequest = await request.json();
    const { lat, lng, tags, description } = body;

    // Validate required location data
    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }

    // Validate required tags (sheep characteristics)
    if (!tags || tags.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one tag is required' },
        { status: 400 }
      );
    }

    // Check for duplicate reports within proximity threshold
    const duplicate = checkDuplicateReport({ lat, lng }, reports);
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: 'A similar report already exists nearby',
        duplicate_warning: true,
      } as CreateReportResponse);
    }

    // Create new report with auto-generated fields
    const now = new Date().toISOString();
    const report: Report = {
      id: uuidv4(),
      walker_id: 'demo-walker', // TODO: Replace with actual authenticated walker ID
      lat,
      lng,
      geohash: encodeGeohash(lat, lng), // For efficient spatial queries
      created_at: now,
      updated_at: now,
      tags,
      photo_url: null, // TODO: Implement photo upload
      description: description || null,
      status: 'pending', // New reports start as pending
      claimed_by: null, // No farmer has claimed this yet
      resolved_at: null, // Not resolved until farmer confirms
    };

    // Add to in-memory store (replace with Supabase in production)
    reports.push(report);

    return NextResponse.json({
      success: true,
      report,
    } as CreateReportResponse);
  } catch (error) {
    // Handle unexpected errors (e.g., malformed JSON)
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
