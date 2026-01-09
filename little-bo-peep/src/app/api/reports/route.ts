import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { encodeGeohash, findMatchingFarmers, checkDuplicateReport } from '@/lib/geo';
import type { Report, Farmer } from '@/types';

// In-memory storage for demo (would use Supabase in production)
const reports: Report[] = [];
const farmers: Farmer[] = [
  {
    id: 'demo-farmer-1',
    user_id: 'user-1',
    holding_name: 'Hillside Farm',
    alert_area: {
      type: 'Polygon',
      coordinates: [
        [
          [-2.6, 54.4],
          [-2.4, 54.4],
          [-2.4, 54.6],
          [-2.6, 54.6],
          [-2.6, 54.4],
        ],
      ],
    },
    alert_radius_km: null,
    center_lat: 54.5,
    center_lng: -2.5,
    subscription_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: 'farmer@example.com',
    phone: null,
    sms_alerts: false,
    email_alerts: true,
    push_alerts: true,
    muted_until: null,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walkerId = searchParams.get('walker_id');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

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

  const paginatedReports = filteredReports.slice(offset, offset + limit);

  return NextResponse.json({
    reports: paginatedReports,
    total: filteredReports.length,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, tags, photo_url, description, walker_id } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!tags || (tags.length < 2 && !photo_url)) {
      return NextResponse.json(
        { success: false, error: 'Photo or at least 2 tags required' },
        { status: 400 }
      );
    }

    const duplicate = checkDuplicateReport({ lat, lng }, reports);
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: 'A similar report was recently submitted nearby',
        duplicate_warning: true,
        existing_report_id: duplicate.id,
      });
    }

    const report: Report = {
      id: uuidv4(),
      walker_id: walker_id || 'anonymous',
      lat,
      lng,
      geohash: encodeGeohash(lat, lng),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags,
      photo_url: photo_url || null,
      description: description || null,
      status: 'pending',
      claimed_by: null,
      resolved_at: null,
    };

    reports.push(report);

    const matches = findMatchingFarmers({ lat, lng }, farmers);
    console.log('Found ' + matches.length + ' matching farmers for report ' + report.id);

    return NextResponse.json({
      success: true,
      report,
      farmers_notified: matches.length,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
