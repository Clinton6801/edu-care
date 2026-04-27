'use client'

import { useAuth } from '@/hooks/useAuth'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  getClass,
  getAssignmentsByClass,
  createAssignment,
  getLiveSessionsByClass,
  createLiveSession,
  updateLiveSession,
} from '@/lib/firebase/firestore'
import { Class, Assignment, LiveSession } from '@/types'
import { useState, useEffect, use } from 'react'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'

type Tab = 'overview' | 'assignments' | 'sessions'

export default function TeacherClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params)
  const { profile } = useAuth()
  const [cls, setCls] = useState<Class | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  // Assignment form
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [aTitle, setATitle] = useState('')
  const [aDesc, setADesc] = useState('')
  const [aDue, setADue] = useState('')
  const [aMax, setAMax] = useState('100')
  const [aType, setAType] = useState<Assignment['type']>('essay')
  const [savingAssignment, setSavingAssignment] = useState(false)

  // Session form
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sTitle, setSTitle] = useState('')
  const [sScheduled, setSScheduled] = useState('')
  const [savingSession, setSavingSession] = useState(false)
  const [startingSession, setStartingSession] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [classData, asgns, sess] = await Promise.all([
        getClass(classId),
        getAssignmentsByClass(classId),
        getLiveSessionsByClass(classId),
      ])
      setCls(classData)
      setAssignments(asgns)
      setSessions(sess)
      setLoading(false)
    }
    load()
  }, [classId])

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!cls) return
    setSavingAssignment(true)
    const newA = await createAssignment({
      classId: cls.id,
      title: aTitle,
      description: aDesc,
      type: aType,
      dueAt: Timestamp.fromDate(new Date(aDue)),
      maxScore: parseInt(aMax),
    })
    setAssignments(prev => [...prev, {
      id: newA,
      classId: cls.id,
      title: aTitle,
      description: aDesc,
      type: aType,
      dueAt: Timestamp.fromDate(new Date(aDue)),
      maxScore: parseInt(aMax),
      createdAt: Timestamp.now(),
    }])
    setATitle(''); setADesc(''); setADue(''); setAMax('100')
    setShowAssignmentForm(false)
    setSavingAssignment(false)
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault()
    if (!cls || !profile) return
    setSavingSession(true)
    const newId = await createLiveSession({
      classId: cls.id,
      teacherUid: profile.uid,
      title: sTitle,
      dailyRoomUrl: '',
      scheduledAt: Timestamp.fromDate(new Date(sScheduled)),
      status: 'scheduled',
      attendees: [],
    })
    setSessions(prev => [...prev, {
      id: newId,
      classId: cls.id,
      teacherUid: profile.uid,
      title: sTitle,
      dailyRoomUrl: '',
      scheduledAt: Timestamp.fromDate(new Date(sScheduled)),
      status: 'scheduled',
      attendees: [],
    }])
    setSTitle(''); setSScheduled('')
    setShowSessionForm(false)
    setSavingSession(false)
  }

  async function handleGoLive(session: LiveSession) {
    setStartingSession(session.id)
    await updateLiveSession(session.id, { status: 'live' })
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'live' } : s))
    setStartingSession(null)
  }

  async function handleEndSession(session: LiveSession) {
    await updateLiveSession(session.id, { status: 'ended' })
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'ended' } : s))
  }

  if (loading) {
    return (
      <div>
        <div className="h-20 bg-zinc-900 border-b border-zinc-800 animate-pulse" />
        <div className="p-8 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Class not found.</p>
        <Link href="/dashboard/teacher/classes" className="text-indigo-400 text-sm mt-2 inline-block">← Back to classes</Link>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title={cls.name}
        subtitle={`${cls.subject} · ${cls.studentUids.length} students · Code: ${cls.joinCode}`}
        actions={
          <Link href="/dashboard/teacher/classes">
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['overview', 'assignments', 'sessions'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-zinc-500 mb-1">Students</p>
              <p className="text-3xl font-black text-white">{cls.studentUids.length}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500 mb-1">Assignments</p>
              <p className="text-3xl font-black text-white">{assignments.length}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500 mb-1">Live Sessions</p>
              <p className="text-3xl font-black text-white">{sessions.length}</p>
            </Card>
          </div>
        )}

        {/* Assignments */}
        {tab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Assignments ({assignments.length})</h2>
              <Button size="sm" onClick={() => setShowAssignmentForm(!showAssignmentForm)}>
                {showAssignmentForm ? 'Cancel' : '+ New Assignment'}
              </Button>
            </div>

            {showAssignmentForm && (
              <Card>
                <h3 className="text-sm font-bold text-white mb-4">Create Assignment</h3>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <Input label="Title" value={aTitle} onChange={e => setATitle(e.target.value)} required placeholder="e.g. Chapter 3 Essay" />
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Description</label>
                    <textarea
                      value={aDesc}
                      onChange={e => setADesc(e.target.value)}
                      placeholder="Assignment instructions..."
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Type</label>
                      <select
                        value={aType}
                        onChange={e => setAType(e.target.value as Assignment['type'])}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="essay">Essay</option>
                        <option value="mcq">MCQ</option>
                        <option value="file-upload">File Upload</option>
                      </select>
                    </div>
                    <Input label="Max Score" type="number" value={aMax} onChange={e => setAMax(e.target.value)} required />
                  </div>
                  <Input label="Due Date" type="datetime-local" value={aDue} onChange={e => setADue(e.target.value)} required />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setShowAssignmentForm(false)}>Cancel</Button>
                    <Button type="submit" loading={savingAssignment}>Create Assignment</Button>
                  </div>
                </form>
              </Card>
            )}

            {assignments.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-zinc-400 font-medium">No assignments yet</p>
                <p className="text-zinc-500 text-sm mt-1">Create your first assignment above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map(a => (
                  <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">{a.title}</h3>
                        <Badge variant="default">{a.type}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Due {a.dueAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Max {a.maxScore} pts
                      </p>
                      {a.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{a.description}</p>}
                    </div>
                    <Link href={`/dashboard/teacher/grade`}>
                      <Button size="sm" variant="secondary">Grade</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Sessions */}
        {tab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Live Sessions ({sessions.length})</h2>
              <Button size="sm" onClick={() => setShowSessionForm(!showSessionForm)}>
                {showSessionForm ? 'Cancel' : '+ Schedule Session'}
              </Button>
            </div>

            {showSessionForm && (
              <Card>
                <h3 className="text-sm font-bold text-white mb-4">Schedule Live Session</h3>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <Input label="Session Title" value={sTitle} onChange={e => setSTitle(e.target.value)} required placeholder="e.g. Week 3 Lecture" />
                  <Input label="Scheduled At" type="datetime-local" value={sScheduled} onChange={e => setSScheduled(e.target.value)} required />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setShowSessionForm(false)}>Cancel</Button>
                    <Button type="submit" loading={savingSession}>Schedule</Button>
                  </div>
                </form>
              </Card>
            )}

            {sessions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-zinc-400 font-medium">No sessions yet</p>
                <p className="text-zinc-500 text-sm mt-1">Schedule your first live session above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">{s.title}</h3>
                        {s.status === 'live' && <Badge variant="live">LIVE</Badge>}
                        {s.status === 'scheduled' && <Badge variant="warning">Scheduled</Badge>}
                        {s.status === 'ended' && <Badge variant="default">Ended</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {s.scheduledAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {s.attendees.length > 0 && ` · ${s.attendees.length} attended`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {s.status === 'scheduled' && (
                        <Button
                          size="sm"
                          loading={startingSession === s.id}
                          onClick={() => handleGoLive(s)}
                        >
                          Go Live
                        </Button>
                      )}
                      {s.status === 'live' && (
                        <>
                          <Link href={`/live/${s.id}`}>
                            <Button size="sm">Join Room</Button>
                          </Link>
                          <Button size="sm" variant="danger" onClick={() => handleEndSession(s)}>
                            End
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
