import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './client'

export async function uploadFile(
  path: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snapshot => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(Math.round(pct))
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      }
    )
  })
}

export async function deleteFile(path: string) {
  await deleteObject(ref(storage, path))
}
