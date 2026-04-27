'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTeacherClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAssignmentsByClass, getSubmissionsByAssignment, gradeSubmission } from '@/lib/firebase/firestore'
import { Assignment, Submission } from '@/types'
import { useState, useEffect } from 'react'

export default function GradingPage() {
  const { profile } = useAuth()
  const { classes, loading: classesLoading } = useTeacherClasses(profile?.uid)
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [scoreInput, setScoreInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedClassId) { setAssignments([]); return }
    setLoadingAssignments(true)
    getAssignmentsByClass(selectedClassId).then(data => {
      setAssignments(data)
      setLoadingAssignments(false)
    })
  }, [selectedClassId])

  useEffect(() => {
    if (!selectedAssignment) { setSubmissions([]); return }
    setLoadingSubmissions(true)
    getSubmissionsByAssignment(selectedAssignment.id).then(data => {
      setSubmissions(data)
      setLoadingSubmissions(false)
    })
  }, [selectedAssignment])

  async function handleGrade(submissionId: string) {
    const score = parseFloat(scoreInput)
    if (isNaN(score)) return
    setSaving(true)
    await gradeSubmission(submissionId, score, feedbackInput)
    setSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, score, feedback: feedbackInput } : s)
    )
    setGradingId(null)
    setScoreInput('')
    setFeedbackInput('')
    setSaving(false)
  }

  return (
    <div>
      <Topbar title="Grading" subtitle="Review and grade student submissions." />

      <div className="p-8 space-y-6">
        {/* Class selector */}
        <Card>
          <h2 className="text-sm font-bold text-white mb-3">Select Class</h2>
          {classesLoading ? (
            <div className="h-10 bg-zinc-800 rounded-xl animate-pulse" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => { setSelectedClassId(cls.id); setSelectedAssignment(null) }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedClassId === cls.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
              {classes.length === 0 && (
                <p className="text-zinc-500 text-sm">No classes found.</p>
              )}
            </div>
          )}
        </Card>

        {/* Assignment selector */}
        {selectedClassId && (
          <Card>
            <h2 className="text-sm font-bold text-white mb-3">Select Assignment</h2>
            {loadingAssignments ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-10 bg-zinc-800 rounded-xl animate-pulse" />)}
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-zinc-500 text-sm">No assignments for this class yet.</p>
            ) : (
              <div className="space-y-2">
                {assignments.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAssignment(a)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                      selectedAssignment?.id === a.id
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <span className="font-semibold">{a.title}</span>
                    <span className="text-xs text-zinc-500">Max: {a.maxScore} pts</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Submissions */}
        {selectedAssignment && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Submissions — {selectedAssignment.title}
            </h2>
            {loadingSubmissions ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-zinc-400 font-medium">No submissions yet</p>
                <p className="text-zinc-500 text-sm mt-1">Students haven't submitted this assignment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map(sub => (
                  <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-400 text-xs font-bold">{sub.studentName[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{sub.studentName}</p>
                            <p className="text-xs text-zinc-500">
                              Submitted {sub.submittedAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                            </p>
                          </div>
                          {sub.score !== null && sub.score !== undefined ? (
                            <Badge variant="success">{sub.score}/{selectedAssignment.maxScore}</Badge>
                          ) : (
                            <Badge variant="warning">Ungraded</Badge>
                          )}
                        </div>
                        {sub.content && (
                          <div className="bg-zinc-800 rounded-xl p-3 mt-3">
                            <p className="text-xs text-zinc-300 whitespace-pre-wrap line-clamp-4">{sub.content}</p>
                          </div>
                        )}
                        {sub.feedback && (
                          <p className="text-xs text-zinc-500 mt-2 italic">Feedback: {sub.feedback}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {gradingId === sub.id ? (
                          <div className="flex flex-col gap-2 w-48">
                            <input
                              type="number"
                              value={scoreInput}
                              onChange={e => setScoreInput(e.target.value)}
                              placeholder={`Score / ${selectedAssignment.maxScore}`}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                            />
                            <textarea
                              value={feedbackInput}
                              onChange={e => setFeedbackInput(e.target.value)}
                              placeholder="Feedback (optional)"
                              rows={2}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" loading={saving} onClick={() => handleGrade(sub.id)} className="flex-1">
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setGradingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setGradingId(sub.id)
                              setScoreInput(sub.score?.toString() ?? '')
                              setFeedbackInput(sub.feedback ?? '')
                            }}
                          >
                            {sub.score !== null && sub.score !== undefined ? 'Re-grade' : 'Grade'}
                          </Button>
                        )}
                      </div>
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
