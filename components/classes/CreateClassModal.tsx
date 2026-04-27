'use client'

import { useState } from 'react'
import { createClass } from '@/lib/firebase/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CreateClassModalProps {
  onClose: () => void
  teacherUid: string
  teacherName: string
  schoolId: string
}

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function CreateClassModal({ onClose, teacherUid, teacherName, schoolId }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createClass({
        name,
        subject,
        teacherUid,
        teacherName,
        schoolId,
        studentUids: [],
        joinCode: generateJoinCode(),
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create class.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create New Class</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1 rounded-lg hover:bg-zinc-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Mathematics 101"
            required
          />
          <Input
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Mathematics"
            required
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Class
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
