import { Assignment } from '@/types'
import { formatDate, isOverdue, dueSoon } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/Badge'

interface DeadlineListProps {
  assignments: Assignment[]
}

export function DeadlineList({ assignments }: DeadlineListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 text-sm">No upcoming deadlines.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map(a => {
        const overdue = isOverdue(a.dueAt)
        const soon = dueSoon(a.dueAt)
        return (
          <div
            key={a.id}
            className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{a.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 capitalize">{a.type.replace('-', ' ')}</p>
            </div>
            <div className="ml-4 flex-shrink-0 text-right">
              {overdue ? (
                <Badge variant="danger">Overdue</Badge>
              ) : soon ? (
                <Badge variant="warning">Due soon</Badge>
              ) : (
                <span className="text-xs text-zinc-400">{formatDate(a.dueAt)}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
