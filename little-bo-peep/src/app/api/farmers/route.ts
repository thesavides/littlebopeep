import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Farmer } from '@/types';

// In-memory storage for demo
const farmers: Farmer[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (userId) {
    const farmer = farmers.find((f) => f.user_id === userId);
    if (farmer) {
      return NextResponse.json({ farmer });
    }
    return NextResponse.json({ farmer: null }, { status: 404 });
  }

  return NextResponse.json({ farmers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      holding_name,
      alert_area,
      alert_radius_km,
      center_lat,
      center_lng,
      email,
      phone,
    } = body;

    if (!user_id || !holding_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!alert_area && (!center_lat || !center_lng || !alert_radius_km)) {
      return NextResponse.json(
        { success: false, error: 'Alert area or center point with radius required' },
        { status: 400 }
      );
    }

    const farmer: Farmer = {
      id: uuidv4(),
      user_id,
      holding_name,
      alert_area: alert_area || { type: 'Polygon', coordinates: [] },
      alert_radius_km: alert_radius_km || null,
      center_lat: center_lat || null,
      center_lng: center_lng || null,
      subscription_status: 'trial',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email,
      phone: phone || null,
      sms_alerts: false,
      email_alerts: true,
      push_alerts: true,
      muted_until: null,
    };

    farmers.push(farmer);

    return NextResponse.json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error('Error creating farmer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create farmer profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const farmerIndex = farmers.findIndex((f) => f.id === id);
    if (farmerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      );
    }

    farmers[farmerIndex] = {
      ...farmers[farmerIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      farmer: farmers[farmerIndex],
    });
  } catch (error) {
    console.error('Error updating farmer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update farmer profile' },
      { status: 500 }
    );
  }
}
