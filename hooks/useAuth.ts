'use client'

import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged, auth } from '@/lib/firebase/auth'
import { getUserProfile } from '@/lib/firebase/auth'
import { AppUser } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, profile, loading, role: profile?.role ?? null }
}