import { NextRequest, NextResponse } from 'next/server'
import { pushToUser } from '@/lib/push-notify'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, badge, url, tag } = await req.json()
    if (!userId || !title) return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 })

    await pushToUser(userId, { title, body: body || '', badge, url, tag })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
