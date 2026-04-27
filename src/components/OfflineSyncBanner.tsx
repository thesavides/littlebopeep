'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getPendingReports, markReportSynced, OfflineReport } from '@/lib/offline-db'
import { createReport, supabase } from '@/lib/supabase-client'
import { uploadPhotoFromDataUrl } from '@/lib/photo-upload'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'

export default function OfflineSyncBanner() {
  const isOnline = useOnlineStatus()
  const { t } = useTranslation()
  const { currentUserId, addNotification } = useAppStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const checkPending = useCallback(async () => {
    try {
      const reports = await getPendingReports()
      setPendingCount(reports.length)
    } catch {
      // IndexedDB not available (e.g. SSR)
    }
  }, [])

  // Check for pending reports on mount and when coming back online
  useEffect(() => {
    checkPending()
  }, [checkPending])

  useEffect(() => {
    if (isOnline) {
      checkPending()
      setDismissed(false)
    }
  }, [isOnline, checkPending])

  // Listen for service worker sync messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_REPORTS') {
        checkPending()
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [checkPending])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)

    try {
      // Force-refresh the Supabase session before uploading.
      // When the device was offline the JWT may have expired; refreshing here
      // ensures we have a valid authenticated token before any INSERT.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (!session) {
        // Try an explicit refresh (covers the race condition where autoRefreshToken
        // hasn't completed yet after coming back online)
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          setSyncError('auth')
          setSyncing(false)
          return
        }
      }

      const reports = await getPendingReports()
      let synced = 0
      let failed = 0
      let lastError: any = null

      for (const report of reports) {
        try {
          // Upload any photos that were captured offline as base64 data URLs
          let uploadedPhotoUrls: string[] = []
          if (report.photoDataUrls && report.photoDataUrls.length > 0) {
            const uploadResults = await Promise.all(
              report.photoDataUrls.map((dataUrl, i) =>
                uploadPhotoFromDataUrl(dataUrl, report.id, i)
              )
            )
            uploadedPhotoUrls = uploadResults
              .filter(r => r.success && r.url)
              .map(r => r.url!)
          }

          await createReport({
            location: { lat: report.latitude, lng: report.longitude },
            timestamp: new Date(report.timestamp),
            sheepCount: report.sheepCount,
            condition: report.condition,
            description: report.description,
            reporterContact: undefined,
            reporterId: currentUserId || undefined,
            status: 'reported' as const,
            archived: false,
            photoUrls: uploadedPhotoUrls,
            categoryId: report.categoryId,
            categoryName: report.categoryName,
            categoryEmoji: report.categoryEmoji,
          })
          await markReportSynced(report.id)
          synced++
        } catch (err: any) {
          console.error('Failed to sync report', report.id, err)
          lastError = err
          failed++
        }
      }

      setSyncResult({ synced, failed })
      if (failed > 0 && lastError) {
        // Surface a human-readable hint from the Supabase error
        const msg = lastError?.message || lastError?.error_description || null
        if (msg?.toLowerCase().includes('jwt') || msg?.toLowerCase().includes('auth') || msg?.toLowerCase().includes('401') || lastError?.status === 401) {
          setSyncError('auth')
        } else {
          setSyncError(msg || 'unknown')
        }
      }
      await checkPending()

      // Push in-app notification so the bell badge updates
      if (synced > 0 && currentUserId) {
        addNotification({
          userId: currentUserId,
          type: 'sync_complete',
          message: `${synced} offline ${synced === 1 ? 'report' : 'reports'} uploaded successfully`,
          reportId: undefined,
          read: false,
        })
      }

      // Register background sync for any remaining failures
      if (failed > 0 && 'serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready
        await (reg as any).sync.register('sync-offline-reports')
      }
    } catch (err) {
      console.error('Sync error', err)
    } finally {
      setSyncing(false)
    }
  }

  // Nothing to show
  if (!isOnline || pendingCount === 0 || dismissed) return null

  // No session at all — user never signed in or explicitly signed out
  if (!currentUserId) {
    return (
      <div className="mx-4 mb-4 rounded-2xl border border-[#7D8DCC]/40 bg-[#7D8DCC]/10 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📡</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#614270] text-sm">
              {t('sync.pendingCount', { count: pendingCount }, `${pendingCount} offline ${pendingCount === 1 ? 'sighting' : 'sightings'} waiting to upload`)}
            </p>
            <p className="text-[#92998B] text-xs mt-0.5">
              {t('sync.signInToUpload', {}, 'Sign in to upload your saved reports')}
            </p>
            <a
              href="/auth"
              className="inline-block mt-3 px-4 py-2 bg-[#7D8DCC] text-white rounded-xl text-sm font-semibold hover:bg-[#6b7bb8] transition-colors"
            >
              {t('sync.signIn', {}, 'Sign in')}
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show success briefly then auto-dismiss
  if (syncResult && syncResult.failed === 0) {
    setTimeout(() => setDismissed(true), 3000)
    return (
      <div className="mx-4 mb-4 rounded-2xl bg-[#9ED663] p-4 flex items-center gap-3 shadow-lg">
        <span className="text-2xl">✓</span>
        <div>
          <p className="text-[#1a3a00] font-semibold text-sm">
            {t('sync.uploadedCount', { count: syncResult.synced }, `${syncResult.synced} offline ${syncResult.synced === 1 ? 'report' : 'reports'} uploaded!`)}
          </p>
          <p className="text-[#2a5200] text-xs">{t('sync.nowLive', {}, 'All your sightings are now live on the map')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-[#EADA69]/40 bg-[#EADA69]/10 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📡</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#614270] text-sm">
            {t('sync.pendingCount', { count: pendingCount }, `${pendingCount} offline ${pendingCount === 1 ? 'sighting' : 'sightings'} waiting to upload`)}
          </p>
          <p className="text-[#92998B] text-xs mt-0.5">
            {t('sync.backOnline', {}, "You're back online — your reports from the field are ready to sync")}
          </p>

          {syncResult?.failed && syncResult.failed > 0 && (
            <p className="text-[#FA9335] text-xs mt-1">
              {t('sync.failedCount', { count: syncResult.failed }, `${syncResult.failed} failed to upload — tap Retry to try again`)}
            </p>
          )}
          {syncError === 'auth' && (
            <p className="text-[#FA9335] text-xs mt-1">
              {t('sync.authError', {}, 'Session expired — please reload the app and try again')}
            </p>
          )}
          {syncError && syncError !== 'auth' && (
            <p className="text-[#FA9335] text-xs mt-1 font-mono break-all">
              {syncError}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-xl text-sm font-semibold hover:bg-[#6b7bb8] disabled:bg-[#7D8DCC]/50 transition-colors flex items-center justify-center gap-2"
            >
              {syncing ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('sync.syncing', {}, 'Syncing...')}
                </>
              ) : (
                syncResult?.failed ? t('sync.retry', {}, 'Retry') : t('sync.uploadNow', {}, 'Upload now')
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-[#614270] text-xs hover:opacity-70 transition-opacity"
            >
              {t('sync.later', {}, 'Later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
