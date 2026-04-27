'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudentClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getAssignmentsByClass, getSubmissionByStudent, createSubmission } from '@/lib/firebase/firestore'
import { Assignment, Submission } from '@/types'
import { useState, useEffect } from 'react'

interface AssignmentWithClass extends Assignment {
  className: string
  submission?: Submission | null
}

export default function StudentAssignmentsPage() {
  const { profile } = useAuth()
  const { classes } = useStudentClasses(profile?.uid)
  const [assignments, setAssignments] = useState<AssignmentWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [activeSubmit, setActiveSubmit] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all')

  useEffect(() => {
    if (!profile?.uid || classes.length === 0) { setLoading(false); return }
    async function load() {
      setLoading(true)
      const all: AssignmentWithClass[] = []
      for (const cls of classes) {
        const asgns = await getAssignmentsByClass(cls.id)
        for (const a of asgns) {
          const sub = await getSubmissionByStudent(a.id, profile!.uid)
          all.push({ ...a, className: cls.name, submission: sub })
        }
      }
      all.sort((a, b) => a.dueAt.toMillis() - b.dueAt.toMillis())
      setAssignments(all)
      setLoading(false)
    }
    load()
  }, [classes, profile?.uid])

  async function handleSubmit(assignment: AssignmentWithClass) {
    if (!profile) return
    setSubmitting(assignment.id)
    try {
      await createSubmission({
        assignmentId: assignment.id,
        studentUid: profile.uid,
        studentName: profile.displayName,
        classId: assignment.classId,
        content,
        score: null,
      })
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignment.id
            ? { ...a, submission: { id: 'temp', assignmentId: a.id, studentUid: profile.uid, studentName: profile.displayName, classId: a.classId, content, score: null, submittedAt: { toDate: () => new Date() } as any } }
            : a
        )
      )
      setActiveSubmit(null)
      setContent('')
    } finally {
      setSubmitting(null)
    }
  }

  const now = new Date()
  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.submission
    if (filter === 'submitted') return !!a.submission
    return true
  })

  function isOverdue(a: AssignmentWithClass) {
    return !a.submission && a.dueAt.toDate() < now
  }

  return (
    <div>
      <Topbar title="Assignments" subtitle="Track and submit your assignments." />

      <div className="p-8 space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'submitted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
            <p className="text-zinc-400 font-medium">No assignments found</p>
            <p className="text-zinc-500 text-sm mt-1">
              {filter === 'pending' ? 'You\'re all caught up!' : 'No assignments match this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-white">{a.title}</h3>
                        {a.submission ? (
                          a.submission.score !== null && a.submission.score !== undefined ? (
                            <Badge variant="success">Graded: {a.submission.score}/{a.maxScore}</Badge>
                          ) : (
                            <Badge variant="info">Submitted</Badge>
                          )
                        ) : isOverdue(a) ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{a.className} · Due {a.dueAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      {a.description && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{a.description}</p>
                      )}
                      {a.submission?.feedback && (
                        <div className="mt-3 bg-zinc-800 rounded-xl px-3 py-2">
                          <p className="text-xs text-zinc-400"><span className="text-zinc-300 font-semibold">Feedback:</span> {a.submission.feedback}</p>
                        </div>
                      )}
                    </div>
                    {!a.submission && (
                      <Button
                        size="sm"
                        onClick={() => setActiveSubmit(activeSubmit === a.id ? null : a.id)}
                        variant={activeSubmit === a.id ? 'secondary' : 'primary'}
                      >
                        {activeSubmit === a.id ? 'Cancel' : 'Submit'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Submission form */}
                {activeSubmit === a.id && (
                  <div className="border-t border-zinc-800 p-5 bg-zinc-950">
                    <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Your Answer</p>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write your answer here..."
                      rows={5}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        loading={submitting === a.id}
                        onClick={() => handleSubmit(a)}
                        disabled={!content.trim()}
                      >
                        Submit Assignment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
