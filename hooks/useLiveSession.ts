'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { LiveSession } from '@/types'

export function useLiveSession(sessionId: string) {
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    const unsub = onSnapshot(doc(db, 'liveSessions', sessionId), snap => {
      if (snap.exists()) {
        setSession({ id: snap.id, ...snap.data() } as LiveSession)
      } else {
        setSession(null)
      }
      setLoading(false)
    })
    return unsub
  }, [sessionId])

  return { session, loading }
}
