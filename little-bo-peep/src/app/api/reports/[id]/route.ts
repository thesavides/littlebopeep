import { NextRequest, NextResponse } from 'next/server';
import type { Report, ReportAction } from '@/types';

// This would be connected to the database in production
// For now, we reference the in-memory store from the parent route

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // In production, fetch from database
  return NextResponse.json({
    error: 'Report not found',
    id,
  }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { action, farmer_id } = body as { action: ReportAction; farmer_id: string };

    // Validate action
    if (!['mine', 'not_mine', 'resolved'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // In production:
    // 1. Update the report status
    // 2. Create/update match record
    // 3. Send notifications if needed

    const statusMap: Record<ReportAction, string> = {
      mine: 'claimed',
      not_mine: 'dismissed',
      resolved: 'resolved',
    };

    return NextResponse.json({
      success: true,
      report_id: id,
      new_status: statusMap[action],
      action,
      farmer_id,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // In production, only allow admins to delete reports
  return NextResponse.json({
    success: true,
    deleted_id: id,
  });
}
