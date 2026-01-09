import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Match, ReportAction } from '@/types';

// In-memory store for demo
const matches: Match[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id');
  const reportId = searchParams.get('report_id');

  let filteredMatches = [...matches];

  if (farmerId) {
    filteredMatches = filteredMatches.filter((m) => m.farmer_id === farmerId);
  }

  if (reportId) {
    filteredMatches = filteredMatches.filter((m) => m.report_id === reportId);
  }

  filteredMatches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ matches: filteredMatches });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report_id, farmer_id } = body;

    if (!report_id || !farmer_id) {
      return NextResponse.json(
        { error: 'Report ID and Farmer ID are required' },
        { status: 400 }
      );
    }

    const existing = matches.find(
      (m) => m.report_id === report_id && m.farmer_id === farmer_id
    );

    if (existing) {
      return NextResponse.json({ success: true, match: existing });
    }

    const now = new Date().toISOString();
    const match: Match = {
      id: uuidv4(),
      report_id,
      farmer_id,
      action: null,
      notified_at: now,
      viewed_at: null,
      action_at: null,
      created_at: now,
    };

    matches.push(match);

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');
    const body = await request.json();
    const { action } = body as { action: ReportAction };

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
    }

    const index = matches.findIndex((m) => m.id === matchId);
    if (index === -1) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    matches[index] = {
      ...matches[index],
      action,
      action_at: now,
      viewed_at: matches[index].viewed_at || now,
    };

    return NextResponse.json({ success: true, match: matches[index] });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
