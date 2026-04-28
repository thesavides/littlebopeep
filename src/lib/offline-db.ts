// IndexedDB wrapper for offline report storage
// Reports saved here are synced to Supabase when connectivity returns

const DB_NAME = 'lbp-offline'
const DB_VERSION = 1
const STORE = 'pending-reports'

export interface OfflineReport {
  id: string
  latitude: number
  longitude: number
  timestamp: string
  categoryId: string
  categoryName: string
  categoryEmoji: string
  condition: string
  sheepCount: number
  description: string
  photoDataUrls: string[] // base64 data URLs stored locally
  synced: boolean
  createdAt: string
  // Device metadata captured at the moment the report is saved offline
  deviceId?: string      // UUID from localStorage — stable per device/browser
  userAgent?: string     // navigator.userAgent at capture time
  deviceType?: string    // 'mobile' | 'desktop' derived from screen width
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineReport(report: OfflineReport): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(report)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingReports(): Promise<OfflineReport[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as OfflineReport[]).filter((r) => !r.synced))
    req.onerror = () => reject(req.error)
  })
}

export async function markReportSynced(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.get(id)
    req.onsuccess = () => {
      if (req.result) {
        store.put({ ...req.result, synced: true })
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteOfflineReport(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingCount(): Promise<number> {
  const reports = await getPendingReports()
  return reports.length
}
