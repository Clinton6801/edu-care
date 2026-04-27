'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTeacherClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useState } from 'react'
import { CreateClassModal } from '@/components/classes/CreateClassModal'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.uid)
  const [showCreate, setShowCreate] = useState(false)

  const firstName = profile?.displayName?.split(' ')[0] ?? 'Teacher'
  const totalStudents = classes.reduce((sum, c) => sum + c.studentUids.length, 0)

  return (
    <div>
      <Topbar
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Manage your classes and track student progress."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Class
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            label="Active Classes"
            value={loading ? '—' : classes.length}
            color="indigo"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatsCard
            label="Total Students"
            value={loading ? '—' : totalStudents}
            color="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatsCard
            label="Pending Grading"
            value="—"
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
        </div>

        {/* Classes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Your Classes</h2>
            <Link href="/dashboard/teacher/classes" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
              <p className="text-zinc-400 font-medium mb-1">No classes yet</p>
              <p className="text-zinc-500 text-sm mb-4">Create your first class to get started.</p>
              <Button onClick={() => setShowCreate(true)} size="sm">
                Create a class
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(cls => (
                <Link key={cls.id} href={`/dashboard/teacher/classes/${cls.id}`}>
                  <div className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                        <span className="text-indigo-400 font-bold text-sm">{cls.subject[0]}</span>
                      </div>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-lg">
                        {cls.studentUids.length} students
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">{cls.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{cls.subject}</p>
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-600 font-mono">Code: {cls.joinCode}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          teacherUid={profile?.uid ?? ''}
          teacherName={profile?.displayName ?? ''}
          schoolId={profile?.schoolId ?? ''}
        />
      )}
    </div>
  )
}
