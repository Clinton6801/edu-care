'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { Message } from '@/types'

export function useMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!sessionId) return
    const q = query(
      collection(db, 'liveSessions', sessionId, 'messages'),
      orderBy('sentAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)))
    })
    return unsub
  }, [sessionId])

  return messages
}
