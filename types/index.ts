import { Timestamp } from 'firebase/firestore'

export type Role = 'admin' | 'teacher' | 'student'

export interface School {
  id: string
  name: string
  inviteCode: string
  adminUid: string
  logoUrl?: string
  createdAt: Timestamp
}

export interface AppUser {
  uid: string
  displayName: string
  email: string
  role: Role
  schoolId: string
  photoUrl?: string
  createdAt: Timestamp
}

export interface Class {
  id: string
  name: string
  subject: string
  teacherUid: string
  teacherName: string
  schoolId: string
  studentUids: string[]
  joinCode: string
  createdAt: Timestamp
}

export interface LiveSession {
  id: string
  classId: string
  teacherUid: string
  title: string
  dailyRoomUrl: string
  scheduledAt: Timestamp
  status: 'scheduled' | 'live' | 'ended'
  recordingUrl?: string
  attendees: string[]
}

export interface Assignment {
  id: string
  classId: string
  title: string
  description: string
  type: 'essay' | 'mcq' | 'file-upload'
  dueAt: Timestamp
  maxScore: number
  questions?: MCQQuestion[]
  createdAt: Timestamp
}

export interface MCQQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export interface Submission {
  id: string
  assignmentId: string
  studentUid: string
  studentName: string
  classId: string
  content?: string
  fileUrls?: string[]
  answers?: number[]
  score?: number | null
  feedback?: string
  submittedAt: Timestamp
  gradedAt?: Timestamp
}

export interface Message {
  id: string
  senderUid: string
  senderName: string
  text: string
  type: 'chat' | 'raise-hand' | 'system'
  sentAt: Timestamp
}

export interface Announcement {
  id: string
  schoolId: string
  title: string
  body: string
  authorUid: string
  authorName: string
  createdAt: Timestamp
}
