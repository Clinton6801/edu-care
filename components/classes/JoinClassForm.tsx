'use client'

import { useState } from 'react'
import { joinClassByCode } from '@/lib/firebase/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface JoinClassFormProps {
  studentUid: string
  onJoined?: (classId: string) => void
}

export function JoinClassForm({ studentUid, onJoined }: JoinClassFormProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const result = await joinClassByCode(code.trim().toUpperCase(), studentUid)
      if (result.success) {
        setSuccess('Successfully joined the class!')
        setCode('')
        onJoined?.(result.classId!)
      } else {
        setError(result.error ?? 'Failed to join class.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleJoin} className="flex gap-3">
      <Input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter join code (e.g. ABC123)"
        required
        className="flex-1"
      />
      <Button type="submit" loading={loading}>
        Join
      </Button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {success && <p className="text-emerald-400 text-xs mt-1">{success}</p>}
    </form>
  )
}
