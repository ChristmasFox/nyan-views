import type { DailyProgress, SrsCardState, StreakState } from '@/lib/study/types'

const DB_NAME = 'nyan-study-v1'
const DB_VERSION = 1
const STORE_SRS = 'srs'
const STORE_META = 'meta'

function isBrowser(): boolean {
  return typeof indexedDB !== 'undefined'
}

export function openStudyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_SRS)) {
        db.createObjectStore(STORE_SRS, { keyPath: 'vocabId' })
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }
  })
}

export async function getSrsState(vocabId: string): Promise<SrsCardState | undefined> {
  if (!isBrowser()) return undefined
  const db = await openStudyDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SRS, 'readonly')
    const req = tx.objectStore(STORE_SRS).get(vocabId)
    req.onsuccess = () => resolve(req.result as SrsCardState | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function putSrsState(state: SrsCardState): Promise<void> {
  if (!isBrowser()) return
  const db = await openStudyDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SRS, 'readwrite')
    tx.objectStore(STORE_SRS).put(state)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllSrsStates(): Promise<SrsCardState[]> {
  if (!isBrowser()) return []
  const db = await openStudyDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SRS, 'readonly')
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read transaction failed'))
    tx.onabort = () => reject(new Error('IndexedDB transaction aborted'))
    const req = tx.objectStore(STORE_SRS).getAll()
    req.onsuccess = () => resolve((req.result as SrsCardState[]) ?? [])
    req.onerror = () => reject(req.error)
  })
}

type MetaRow =
  | { key: 'daily'; value: DailyProgress }
  | { key: 'streak'; value: StreakState }

export async function getMeta(
  key: 'daily'
): Promise<DailyProgress | undefined>
export async function getMeta(
  key: 'streak'
): Promise<StreakState | undefined>
export async function getMeta(
  key: MetaRow['key']
): Promise<DailyProgress | StreakState | undefined> {
  if (!isBrowser()) return undefined
  const db = await openStudyDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly')
    const req = tx.objectStore(STORE_META).get(key)
    req.onsuccess = () => {
      const row = req.result as { key: string; value: unknown } | undefined
      resolve(row?.value as DailyProgress | StreakState | undefined)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function putMeta<K extends MetaRow['key']>(
  key: K,
  value: K extends 'daily' ? DailyProgress : StreakState
): Promise<void> {
  if (!isBrowser()) return
  const db = await openStudyDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readwrite')
    tx.objectStore(STORE_META).put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
