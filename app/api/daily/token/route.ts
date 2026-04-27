import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const DAILY_API_KEY = process.env.DAILY_API_KEY!

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let decodedToken
  try {
    decodedToken = await adminAuth.verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { roomName, isOwner, userName } = await req.json()
  if (!roomName) {
    return NextResponse.json({ error: 'roomName is required' }, { status: 400 })
  }

  // Create a meeting token for this participant
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName ?? decodedToken.name ?? 'Participant',
        // Teachers are owners — they can mute/remove participants
        is_owner: isOwner ?? false,
        // Token expires in 3 hours
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('Daily token creation failed:', err)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ token: data.token })
}
