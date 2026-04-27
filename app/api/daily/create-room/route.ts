import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const DAILY_API_KEY = process.env.DAILY_API_KEY!
const DAILY_DOMAIN = process.env.DAILY_DOMAIN!

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated teacher
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminAuth.verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { sessionId } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  // Create a Daily.co room named after the session ID
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `edutrack-${sessionId}`,
      properties: {
        // Room auto-deletes 2 hours after creation
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
        // Only allow joining via a meeting token (teacher sets the owner token)
        enable_prejoin_ui: true,
        enable_chat: false,       // we use our own Firestore chat
        enable_knocking: true,    // students knock, teacher admits
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('Daily room creation failed:', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }

  const room = await res.json()
  // room.url is the full https://yoursubdomain.daily.co/room-name URL
  return NextResponse.json({ url: room.url, name: room.name })
}
