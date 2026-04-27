'use client'

import { useEffect, useState } from 'react'
import { where } from 'firebase/firestore'
import { subscribeToClasses } from '@/lib/firebase/firestore'
import type { Class } from '@/types'

export function useTeacherClasses(teacherUid: string | undefined) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teacherUid) return
    const unsub = subscribeToClasses(
      [where('teacherUid', '==', teacherUid)],
      data => {
        setClasses(data)
        setLoading(false)
      }
    )
    return unsub
  }, [teacherUid])

  return { classes, loading }
}

export function useStudentClasses(studentUid: string | undefined) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentUid) return
    const unsub = subscribeToClasses(
      [where('studentUids', 'array-contains', studentUid)],
      data => {
        setClasses(data)
        setLoading(false)
      }
    )
    return unsub
  }, [studentUid])

  return { classes, loading }
}
