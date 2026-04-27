import { Timestamp } from 'firebase/firestore'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

export function toDate(ts: Timestamp | Date | undefined | null): Date | null {
  if (!ts) return null
  if (ts instanceof Date) return ts
  return ts.toDate()
}

export function formatDate(ts: Timestamp | Date | undefined | null, fmt = 'MMM d, yyyy'): string {
  const d = toDate(ts)
  if (!d) return '—'
  return format(d, fmt)
}

export function formatDateTime(ts: Timestamp | Date | undefined | null): string {
  return formatDate(ts, 'MMM d, yyyy · h:mm a')
}

export function timeAgo(ts: Timestamp | Date | undefined | null): string {
  const d = toDate(ts)
  if (!d) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function dueSoon(ts: Timestamp | Date | undefined | null): boolean {
  const d = toDate(ts)
  if (!d) return false
  return isToday(d) || isTomorrow(d)
}

export function isOverdue(ts: Timestamp | Date | undefined | null): boolean {
  const d = toDate(ts)
  if (!d) return false
  return isPast(d)
}
