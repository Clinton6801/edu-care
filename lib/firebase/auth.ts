import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './client'
import { AppUser, Role } from '@/types'

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: Role,
  schoolId: string
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName,
    email,
    role,
    schoolId,
    createdAt: serverTimestamp(),
  })

  return user
}

export async function loginUser(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as AppUser
}

export { onAuthStateChanged, auth }