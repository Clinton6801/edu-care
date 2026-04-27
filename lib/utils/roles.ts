import type { Role } from '@/types'

export function isAdmin(role: Role | null) {
  return role === 'admin'
}

export function isTeacher(role: Role | null) {
  return role === 'teacher'
}

export function isStudent(role: Role | null) {
  return role === 'student'
}

export function canManageClasses(role: Role | null) {
  return role === 'teacher' || role === 'admin'
}

export function dashboardPath(role: Role | null): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin'
    case 'teacher':
      return '/dashboard/teacher'
    case 'student':
    default:
      return '/dashboard/student'
  }
}
