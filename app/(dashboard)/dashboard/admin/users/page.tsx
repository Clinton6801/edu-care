'use client'

import { useAuth } from '@/hooks/useAuth'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { AppUser } from '@/types'
import { useState, useEffect } from 'react'

type FilterRole = 'all' | 'teacher' | 'student' | 'admin'

export default function AdminUsersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterRole>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile?.schoolId) return
    async function load() {
      setLoading(true)
      const q = query(collection(db, 'users'), where('schoolId', '==', profile!.schoolId))
      const snap = await getDocs(q)
      setUsers(snap.docs.map(d => d.data() as AppUser))
      setLoading(false)
    }
    load()
  }, [profile?.schoolId])

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const counts = {
    all: users.length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  const roleBadge = (role: AppUser['role']) => {
    if (role === 'admin') return <Badge variant="danger">Admin</Badge>
    if (role === 'teacher') return <Badge variant="info">Teacher</Badge>
    return <Badge variant="default">Student</Badge>
  }

  return (
    <div>
      <Topbar title="Users" subtitle="All registered users in your school." />

      <div className="p-8 space-y-6">
        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {(['all', 'teacher', 'student', 'admin'] as FilterRole[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f} <span className="ml-1 text-xs opacity-60">({counts[f]})</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Table */}
        <Card padding={false}>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-zinc-800 rounded w-1/4 mb-1.5" />
                    <div className="h-3 bg-zinc-800 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-400 font-medium">No users found</p>
              <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {/* Header */}
              <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-5">User</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-4">Joined</div>
              </div>
              {filtered.map(u => (
                <div key={u.uid} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-zinc-800/40 transition">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-xs font-bold">{u.displayName[0]?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.displayName}</p>
                      <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3">{roleBadge(u.role)}</div>
                  <div className="col-span-4 text-xs text-zinc-500">
                    {u.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
