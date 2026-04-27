'use client'

import { useAuth } from '@/hooks/useAuth'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { getClassesBySchool } from '@/lib/firebase/firestore'
import { Class } from '@/types'
import { useState, useEffect } from 'react'

export default function AdminClassesPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile?.schoolId) return
    getClassesBySchool(profile.schoolId).then(data => {
      setClasses(data)
      setLoading(false)
    })
  }, [profile?.schoolId])

  const filtered = classes.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <Topbar title="All Classes" subtitle="Overview of every class in your school." />

      <div className="p-8 space-y-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by class name, subject, or teacher..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />

        {/* Classes */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
            <p className="text-zinc-400 font-medium">No classes found</p>
            <p className="text-zinc-500 text-sm mt-1">
              {search ? 'Try a different search term.' : 'No classes have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cls => (
              <div key={cls.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-black text-base">{cls.subject[0]}</span>
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-lg font-medium">
                    {cls.studentUids.length} {cls.studentUids.length === 1 ? 'student' : 'students'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white truncate">{cls.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{cls.subject}</p>
                <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Teacher</p>
                    <p className="text-xs text-zinc-300 font-medium">{cls.teacherName}</p>
                  </div>
                  <span className="text-xs text-zinc-600 font-mono tracking-wider">Code: {cls.joinCode}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <p className="text-xs text-zinc-600 text-right">
            Showing {filtered.length} of {classes.length} classes
          </p>
        )}
      </div>
    </div>
  )
}
