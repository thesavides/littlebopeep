import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import type { AlertWithReport, Report } from '@/types';

// GET /api/matches - Get matches/alerts for a farmer
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const farmerId = searchParams.get('farmer_id');
  const status = searchParams.get('status');

  if (!farmerId) {
    return NextResponse.json(
      { error: 'Farmer ID is required' },
      { status: 400 }
    );
  }

  // Generate demo alerts
  const statuses: ('pending' | 'claimed' | 'resolved')[] = ['pending', 'pending', 'claimed', 'resolved'];
  const tags: Report['tags'][] = [
    ['alone', 'near_road'],
    ['in_town', 'looks_distressed'],
    ['multiple_sheep', 'near_road'],
    ['alone', 'injured'],
  ];

  const alerts: AlertWithReport[] = statuses.map((s, i) => ({
    id: generateId(),
    report_id: generateId(),
    farmer_id: farmerId,
    action: s === 'pending' ? null : s === 'claimed' ? 'mine' : 'resolved',
    notified_at: new Date(Date.now() - i * 3600000).toISOString(),
    viewed_at: i > 0 ? new Date(Date.now() - i * 1800000).toISOString() : null,
    action_at: s !== 'pending' ? new Date(Date.now() - i * 600000).toISOString() : null,
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    report: {
      id: generateId(),
      walker_id: generateId(),
      lat: 54.5 + (Math.random() - 0.5) * 0.1,
      lng: -2.5 + (Math.random() - 0.5) * 0.1,
      geohash: 'gcw2',
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 3600000).toISOString(),
      tags: tags[i],
      photo_url: i % 2 === 0 ? 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&h=300&fit=crop' : null,
      description: i === 0 ? 'Spotted near the old barn, seemed to be wandering alone.' : null,
      status: s,
      claimed_by: s !== 'pending' ? farmerId : null,
      resolved_at: s === 'resolved' ? new Date().toISOString() : null,
    },
    distance_km: 0.5 + i * 1.2,
  }));

  // Filter by status if provided
  const filteredAlerts = status
    ? alerts.filter((a) => a.report.status === status)
    : alerts;

  return NextResponse.json({
    alerts: filteredAlerts,
    total: filteredAlerts.length,
    pending_count: alerts.filter((a) => a.report.status === 'pending').length,
  });
}

// PATCH /api/matches - Update a match (claim, dismiss, resolve)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, action, farmer_id } = body;

    if (!match_id || !action) {
      return NextResponse.json(
        { error: 'Match ID and action are required' },
        { status: 400 }
      );
    }

    if (!['mine', 'not_mine', 'resolved'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // In production:
    // 1. Update the match record
    // 2. Update the report status
    // 3. Lock the report if action is 'mine'
    // 4. Send notifications to other farmers if needed

    const statusMap: Record<string, string> = {
      mine: 'claimed',
      not_mine: 'dismissed',
      resolved: 'resolved',
    };

    return NextResponse.json({
      success: true,
      match_id,
      new_status: statusMap[action],
      action,
      farmer_id,
      action_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
