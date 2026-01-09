import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Farmer } from '@/types';

// In-memory store for demo
const farmers: Farmer[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('id');
  const userId = searchParams.get('user_id');

  if (farmerId) {
    const farmer = farmers.find((f) => f.id === farmerId);
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }
    return NextResponse.json({ farmer });
  }

  if (userId) {
    const farmer = farmers.find((f) => f.user_id === userId);
    return NextResponse.json({ farmer: farmer || null });
  }

  return NextResponse.json({ farmers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { holding_name, alert_area, center_lat, center_lng, alert_radius_km, email } = body;

    if (!holding_name || !email) {
      return NextResponse.json(
        { error: 'Holding name and email are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const farmer: Farmer = {
      id: uuidv4(),
      user_id: uuidv4(),
      holding_name,
      alert_area: alert_area || null,
      alert_radius_km: alert_radius_km || 2,
      center_lat: center_lat || null,
      center_lng: center_lng || null,
      subscription_status: 'trial',
      created_at: now,
      updated_at: now,
      email,
      phone: body.phone || null,
      sms_alerts: false,
      email_alerts: true,
      push_alerts: true,
      muted_until: null,
    };

    farmers.push(farmer);

    return NextResponse.json({ success: true, farmer });
  } catch (error) {
    console.error('Error creating farmer:', error);
    return NextResponse.json(
      { error: 'Failed to create farmer' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('id');
    const body = await request.json();

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer ID required' }, { status: 400 });
    }

    const index = farmers.findIndex((f) => f.id === farmerId);
    if (index === -1) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    farmers[index] = {
      ...farmers[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, farmer: farmers[index] });
  } catch (error) {
    console.error('Error updating farmer:', error);
    return NextResponse.json(
      { error: 'Failed to update farmer' },
      { status: 500 }
    );
  }
}
