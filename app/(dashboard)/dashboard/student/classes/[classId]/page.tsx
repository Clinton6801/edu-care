'use client'

import { useAuth } from '@/hooks/useAuth'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  getClass,
  getAssignmentsByClass,
  getSubmissionByStudent,
  getLiveSessionsByClass,
} from '@/lib/firebase/firestore'
import { Class, Assignment, Submission, LiveSession } from '@/types'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

type Tab = 'overview' | 'assignments' | 'sessions'

interface AssignmentWithSub extends Assignment {
  submission?: Submission | null
}

export default function StudentClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params)
  const { profile } = useAuth()
  const [cls, setCls] = useState<Class | null>(null)
  const [assignments, setAssignments] = useState<AssignmentWithSub[]>([])
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!profile?.uid) return
    async function load() {
      const [classData, asgns, sess] = await Promise.all([
        getClass(classId),
        getAssignmentsByClass(classId),
        getLiveSessionsByClass(classId),
      ])
      setCls(classData)
      setSessions(sess)

      // Fetch submissions for each assignment
      const withSubs = await Promise.all(
        asgns.map(async a => ({
          ...a,
          submission: await getSubmissionByStudent(a.id, profile!.uid),
        }))
      )
      setAssignments(withSubs)
      setLoading(false)
    }
    load()
  }, [classId, profile?.uid])

  const now = new Date()
  const pending = assignments.filter(a => !a.submission).length
  const submitted = assignments.filter(a => !!a.submission).length
  const liveSessions = sessions.filter(s => s.status === 'live')

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
        <Link href="/dashboard/student/classes" className="text-indigo-400 text-sm mt-2 inline-block">← Back to classes</Link>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title={cls.name}
        subtitle={`${cls.subject} · Teacher: ${cls.teacherName}`}
        actions={
          <Link href="/dashboard/student/classes">
            <Button variant="secondary" size="sm">← Back</Button>
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        {/* Live session banner */}
        {liveSessions.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white">Class is Live Now!</p>
                <p className="text-xs text-zinc-400">{liveSessions[0].title}</p>
              </div>
            </div>
            <Link href={`/live/${liveSessions[0].id}`}>
              <Button size="sm">Join Now</Button>
            </Link>
          </div>
        )}

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
              <p className="text-xs text-zinc-500 mb-1">Pending</p>
              <p className="text-3xl font-black text-amber-400">{pending}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500 mb-1">Submitted</p>
              <p className="text-3xl font-black text-emerald-400">{submitted}</p>
            </Card>
            <Card>
              <p className="text-xs text-zinc-500 mb-1">Sessions</p>
              <p className="text-3xl font-black text-white">{sessions.length}</p>
            </Card>
          </div>
        )}

        {/* Assignments */}
        {tab === 'assignments' && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-zinc-400 font-medium">No assignments yet</p>
                <p className="text-zinc-500 text-sm mt-1">Your teacher hasn't posted any assignments.</p>
              </div>
            ) : (
              assignments.map(a => {
                const overdue = !a.submission && a.dueAt.toDate() < now
                return (
                  <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-white">{a.title}</h3>
                        {a.submission ? (
                          a.submission.score !== null && a.submission.score !== undefined
                            ? <Badge variant="success">Graded: {a.submission.score}/{a.maxScore}</Badge>
                            : <Badge variant="info">Submitted</Badge>
                        ) : overdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        Due {a.dueAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Max {a.maxScore} pts
                      </p>
                      {a.submission?.feedback && (
                        <p className="text-xs text-zinc-400 mt-2 italic">Feedback: {a.submission.feedback}</p>
                      )}
                    </div>
                    {!a.submission && (
                      <Link href="/dashboard/student/assignments">
                        <Button size="sm">Submit</Button>
                      </Link>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Sessions */}
        {tab === 'sessions' && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-zinc-400 font-medium">No sessions scheduled</p>
                <p className="text-zinc-500 text-sm mt-1">Your teacher hasn't scheduled any live sessions yet.</p>
              </div>
            ) : (
              sessions.map(s => (
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
                    </p>
                  </div>
                  {s.status === 'live' && (
                    <Link href={`/live/${s.id}`}>
                      <Button size="sm">Join</Button>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
