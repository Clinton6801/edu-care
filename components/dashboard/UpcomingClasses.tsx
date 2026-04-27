import { LiveSession } from '@/types'
import { formatDateTime } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface UpcomingClassesProps {
  sessions: LiveSession[]
}

export function UpcomingClasses({ sessions }: UpcomingClassesProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 text-sm">No upcoming classes scheduled.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <div
          key={session.id}
          className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{session.title}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{formatDateTime(session.scheduledAt)}</p>
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            {session.status === 'live' ? (
              <Badge variant="live">LIVE</Badge>
            ) : session.status === 'scheduled' ? (
              <Badge variant="info">Scheduled</Badge>
            ) : (
              <Badge variant="default">Ended</Badge>
            )}
            {session.status === 'live' && (
              <Link
                href={`/live/${session.id}`}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Join →
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
