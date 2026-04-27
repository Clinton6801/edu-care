'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTeacherClasses } from '@/hooks/useClass'
import { Topbar } from '@/components/layout/Topbar'
import { CreateClassModal } from '@/components/classes/CreateClassModal'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useState } from 'react'

export default function TeacherClassesPage() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.uid)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      <Topbar
        title="My Classes"
        subtitle="Manage your classes, assignments, and students."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Class
          </Button>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-6" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-white font-bold mb-1">No classes yet</p>
            <p className="text-zinc-500 text-sm mb-6">Create your first class to start teaching.</p>
            <Button onClick={() => setShowCreate(true)}>Create a class</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Link key={cls.id} href={`/dashboard/teacher/classes/${cls.id}`}>
                <div className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                      <span className="text-indigo-400 font-black text-base">{cls.subject[0]}</span>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-lg font-medium">
                      {cls.studentUids.length} {cls.studentUids.length === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">{cls.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{cls.subject}</p>
                  <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-600 font-mono tracking-wider">Code: {cls.joinCode}</span>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
