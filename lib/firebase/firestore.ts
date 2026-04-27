import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './client'
import type { Class, Assignment, Submission, LiveSession, School, AppUser } from '@/types'

// ─── Schools ────────────────────────────────────────────────────────────────

export async function getSchool(schoolId: string): Promise<School | null> {
  const snap = await getDoc(doc(db, 'schools', schoolId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as School
}

export async function createSchool(data: Omit<School, 'id' | 'createdAt'>) {
  const ref = doc(collection(db, 'schools'))
  await setDoc(ref, { ...data, createdAt: serverTimestamp() })
  return ref.id
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export async function getClassesBySchool(schoolId: string): Promise<Class[]> {
  const q = query(collection(db, 'classes'), where('schoolId', '==', schoolId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Class))
}

export async function getClassesByTeacher(teacherUid: string): Promise<Class[]> {
  const q = query(collection(db, 'classes'), where('teacherUid', '==', teacherUid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Class))
}

export async function getClassesByStudent(studentUid: string): Promise<Class[]> {
  const q = query(collection(db, 'classes'), where('studentUids', 'array-contains', studentUid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Class))
}

export async function getClass(classId: string): Promise<Class | null> {
  const snap = await getDoc(doc(db, 'classes', classId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Class
}

export async function createClass(data: Omit<Class, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'classes'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function joinClassByCode(
  joinCode: string,
  studentUid: string
): Promise<{ success: boolean; classId?: string; error?: string }> {
  const q = query(collection(db, 'classes'), where('joinCode', '==', joinCode))
  const snap = await getDocs(q)
  if (snap.empty) return { success: false, error: 'Invalid join code.' }
  const classDoc = snap.docs[0]
  const classData = classDoc.data() as Class
  if (classData.studentUids.includes(studentUid)) {
    return { success: false, error: 'You are already in this class.' }
  }
  await updateDoc(doc(db, 'classes', classDoc.id), {
    studentUids: [...classData.studentUids, studentUid],
  })
  return { success: true, classId: classDoc.id }
}

// ─── Assignments ─────────────────────────────────────────────────────────────

export async function getAssignmentsByClass(classId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'assignments'),
    where('classId', '==', classId)
  )
  const snap = await getDocs(q)
  const assignments = snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment))
  // Sort client-side to avoid requiring a composite Firestore index
  return assignments.sort((a, b) => a.dueAt.toMillis() - b.dueAt.toMillis())
}

export async function createAssignment(data: Omit<Assignment, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'assignments'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  const snap = await getDoc(doc(db, 'assignments', assignmentId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Assignment
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission))
}

export async function getSubmissionByStudent(
  assignmentId: string,
  studentUid: string
): Promise<Submission | null> {
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    where('studentUid', '==', studentUid)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Submission
}

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt'>) {
  const ref = await addDoc(collection(db, 'submissions'), {
    ...data,
    submittedAt: serverTimestamp(),
  })
  return ref.id
}

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string
) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    score,
    feedback,
    gradedAt: serverTimestamp(),
  })
}

// ─── Live Sessions ────────────────────────────────────────────────────────────

export async function getLiveSessionsByClass(classId: string): Promise<LiveSession[]> {
  const q = query(
    collection(db, 'liveSessions'),
    where('classId', '==', classId)
  )
  const snap = await getDocs(q)
  const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession))
  // Sort client-side to avoid requiring a composite Firestore index
  return sessions.sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis())
}

export async function getLiveSession(sessionId: string): Promise<LiveSession | null> {
  const snap = await getDoc(doc(db, 'liveSessions', sessionId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as LiveSession
}

export async function createLiveSession(data: Omit<LiveSession, 'id'>) {
  const ref = await addDoc(collection(db, 'liveSessions'), data)
  return ref.id
}

export async function updateLiveSession(sessionId: string, data: Partial<LiveSession>) {
  await updateDoc(doc(db, 'liveSessions', sessionId), data)
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

export function subscribeToClasses(
  constraints: QueryConstraint[],
  callback: (classes: Class[]) => void
) {
  const q = query(collection(db, 'classes'), ...constraints)
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Class)))
  })
}

export function subscribeToLiveSessions(
  classId: string,
  callback: (sessions: LiveSession[]) => void
) {
  const q = query(
    collection(db, 'liveSessions'),
    where('classId', '==', classId)
  )
  return onSnapshot(q, snap => {
    const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession))
    // Sort client-side to avoid requiring a composite Firestore index
    callback(sessions.sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis()))
  })
}
