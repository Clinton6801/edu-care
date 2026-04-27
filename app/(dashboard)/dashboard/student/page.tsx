'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudentClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { DeadlineList } from '@/components/dashboard/DeadlineList'
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses'
import Link from 'next/link'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const { classes, loading } = useStudentClasses(profile?.uid)

  const firstName = profile?.displayName?.split(' ')[0] ?? 'Student'

  return (
    <div>
      <Topbar
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here's what's happening in your classes today."
      />

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            label="Enrolled Classes"
            value={loading ? '—' : classes.length}
            color="indigo"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatsCard
            label="Pending Assignments"
            value="—"
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatsCard
            label="Live Now"
            value="—"
            color="red"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Classes grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">My Classes</h2>
            <Link href="/dashboard/student/classes" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
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
            <Card>
              <div className="text-center py-8">
                <p className="text-zinc-400 font-medium mb-1">No classes yet</p>
                <p className="text-zinc-500 text-sm">Ask your teacher for a join code to get started.</p>
                <Link
                  href="/dashboard/student/classes"
                  className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
                >
                  Join a class →
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.slice(0, 6).map(cls => (
                <Link key={cls.id} href={`/dashboard/student/classes/${cls.id}`}>
                  <div className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                      <span className="text-indigo-400 font-bold text-sm">{cls.subject[0]}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">{cls.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{cls.subject}</p>
                    <p className="text-xs text-zinc-600 mt-3">{cls.teacherName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <DeadlineList assignments={[]} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Live Sessions</CardTitle>
            </CardHeader>
            <UpcomingClasses sessions={[]} />
          </Card>
        </div>
      </div>
    </div>
  )
}
