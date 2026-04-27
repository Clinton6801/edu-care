'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Role } from '@/types'

interface RoleGuardProps {
  allowed: Role[]
  children: React.ReactNode
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role && !allowed.includes(role)) {
      router.replace(`/dashboard/${role}`)
    }
  }, [role, loading, allowed, router])

  if (loading) return null
  if (!role || !allowed.includes(role)) return null

  return <>{children}</>
}
