'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudentClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { JoinClassForm } from '@/components/classes/JoinClassForm'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function StudentClassesPage() {
  const { profile } = useAuth()
  const { classes, loading } = useStudentClasses(profile?.uid)

  return (
    <div>
      <Topbar title="My Classes" subtitle="All your enrolled classes in one place." />

      <div className="p-8 space-y-8">
        {/* Join class */}
        <Card>
          <h2 className="text-sm font-bold text-white mb-4">Join a Class</h2>
          <JoinClassForm studentUid={profile?.uid ?? ''} />
        </Card>

        {/* Classes grid */}
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
          <div className="text-center py-16">
            <p className="text-zinc-400 font-medium">No classes yet</p>
            <p className="text-zinc-500 text-sm mt-1">Use the join form above to enroll in a class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Link key={cls.id} href={`/dashboard/student/classes/${cls.id}`}>
                <div className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group cursor-pointer h-full">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                    <span className="text-indigo-400 font-bold text-sm">{cls.subject[0]}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">{cls.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{cls.subject}</p>
                  <p className="text-xs text-zinc-600 mt-3">Teacher: {cls.teacherName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
