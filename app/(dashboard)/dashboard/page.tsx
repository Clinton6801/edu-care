'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRedirect() {
  const { role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role) {
      router.replace(`/dashboard/${role}`)
    }
  }, [role, loading, router])

  return null
}
