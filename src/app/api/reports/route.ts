import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { encodeGeohash, checkDuplicateReport } from '@/lib/geo';
import type { Report, CreateReportRequest, CreateReportResponse } from '@/types';

// In-memory store for demo (would use Supabase in production)
const reports: Report[] = [];

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

export async function POST(request: NextRequest) {
  try {
    const body: CreateReportRequest = await request.json();
    const { lat, lng, tags, description } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!tags || tags.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one tag is required' },
        { status: 400 }
      );
    }

    const duplicate = checkDuplicateReport({ lat, lng }, reports);
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: 'A similar report already exists nearby',
        duplicate_warning: true,
      } as CreateReportResponse);
    }

    const now = new Date().toISOString();
    const report: Report = {
      id: uuidv4(),
      walker_id: 'demo-walker',
      lat,
      lng,
      geohash: encodeGeohash(lat, lng),
      created_at: now,
      updated_at: now,
      tags,
      photo_url: null,
      description: description || null,
      status: 'pending',
      claimed_by: null,
      resolved_at: null,
    };

    reports.push(report);

    return NextResponse.json({
      success: true,
      report,
    } as CreateReportResponse);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
