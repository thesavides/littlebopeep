'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore, getDaysSince, MAP_CONFIG, isReportNearFarm } from '@/store/appStore'
import Header from './Header'
import Map from './Map'
import AdminUserManagement from './AdminUserManagement'
import WalkerDashboard from './WalkerDashboard'
import ProfileDrawer from './ProfileDrawer'
import CategoryImageUploader from './CategoryImageUploader'
import { inviteUser, getAllUsers, adminResetUserPassword, updateUserProfile, deleteUser as deleteUserFromSupabase, suspendUser as suspendUserInSupabase, activateUser as activateUserInSupabase } from '@/lib/unified-auth'
import { fetchAuditLogs } from '@/lib/audit'
import { fetchNotificationsForReport, approveReportScreening, updateReport as updateReportInDB } from '@/lib/supabase-client'
import PhotoUpload from './PhotoUpload'

type AdminView = 'overview' | 'walkers' | 'farmers' | 'reports' | 'farms' | 'billing' | 'admins' | 'categories' | 'audit'
type SortBy = 'date' | 'daysUnclaimed'
type FilterStatus = 'all' | 'reported' | 'claimed' | 'resolved' | 'escalated' | 'complete' | 'needs_review' | 'flagged'
type FilterArchive = 'active' | 'archived' | 'all'

export default function AdminDashboard() {
  const {
    currentUserId,
    users,
    reports,
    farms,
    suspendUser,
    activateUser,
    deleteUser,
    deleteReport,
    deleteFarm,
    archiveReport,
    batchArchiveReports,
    batchDeleteReports,
    cancelSubscription,
    activateSubscription,
    addUser,
    updateUser,
    addFarm,
    updateFarm,
    addField,
    updateField,
    deleteField,
    claimReport,
    claimReportForFarmer,
    resolveReport,
    escalateReport,
    markReportComplete,
    reportCategories,
    addReportCategory,
    updateReportCategory,
    deleteReportCategory,
    updateFarmCategorySubscription,
    loadReports,
    loadFarms,
  } = useAppStore()

  const [currentView, setCurrentView] = useState<AdminView>('overview')
  const [showReportMode, setShowReportMode] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'user' | 'report' | 'farm' | 'field'>('user')
  const [realUsers, setRealUsers] = useState<any[]>([]) // Users from Supabase
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Modal states for CRUD operations
  const [showCreateFarmerModal, setShowCreateFarmerModal] = useState(false)
  const [showEditFarmerModal, setShowEditFarmerModal] = useState<string | null>(null)
  const [showCreateFarmModal, setShowCreateFarmModal] = useState(false)
  const [showEditFarmModal, setShowEditFarmModal] = useState<string | null>(null)
  const [showCreateFieldModal, setShowCreateFieldModal] = useState<string | null>(null) // farmId
  const [showEditFieldModal, setShowEditFieldModal] = useState<{farmId: string, fieldId: string} | null>(null)
  const [showClaimReportModal, setShowClaimReportModal] = useState<string | null>(null) // reportId
  const [showFarmDetailsModal, setShowFarmDetailsModal] = useState<string | null>(null) // farmId
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [viewingUser, setViewingUser] = useState<any | null>(null)

  // Admin map — user's geolocation
  const [adminMapCenter, setAdminMapCenter] = useState<[number, number]>([54.5, -2])
  const [adminLocationAcquired, setAdminLocationAcquired] = useState(false)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAdminMapCenter([pos.coords.latitude, pos.coords.longitude])
          setAdminLocationAcquired(true)
        },
        () => {} // silently fall back to UK default
      )
    }
  }, [])

  // Report filters and sorting
  const [sortBy, setSortBy] = useState<SortBy>('daysUnclaimed')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterArchive, setFilterArchive] = useState<FilterArchive>('active')
  const [filterFarmerId, setFilterFarmerId] = useState<string>('all')
  const [filterFarmId, setFilterFarmId] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [mapBounds, setMapBounds] = useState<{north: number, south: number, east: number, west: number} | null>(null)
  const [detailReportId, setDetailReportId] = useState<string | null>(null)
  const [detailNotifications, setDetailNotifications] = useState<any[]>([])
  const [detailAuditLogs, setDetailAuditLogs] = useState<any[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [editingDetailReport, setEditingDetailReport] = useState(false)
  const [detailEditFields, setDetailEditFields] = useState<{ description: string; sheepCount: number; conditions: string[]; photoUrls: string[] }>({ description: '', sheepCount: 1, conditions: [], photoUrls: [] })
  const [savingDetailEdit, setSavingDetailEdit] = useState(false)
  // Complete modal
  const [completeReportId, setCompleteReportId] = useState<string | null>(null)
  const [completeNotes, setCompleteNotes] = useState('')

  // Load real users and reports from Supabase on mount
  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true)
      const supabaseUsers = await getAllUsers()
      setRealUsers(supabaseUsers)
      setLoadingUsers(false)
    }
    loadUsers()
    loadReports()
    loadFarms()
  }, [])

  const handleResetUserPassword = async (userId: string, email: string) => {
    if (!confirm(`Send a password reset email to "${email}"?`)) return
    const { success, error } = await adminResetUserPassword(userId, email)
    if (success) {
      alert(`Password reset email sent to ${email}`)
    } else {
      alert(error || 'Failed to send password reset email')
    }
  }

  const handleUpdateUser = async (userId: string, updates: { full_name?: string; phone?: string; role?: string }) => {
    const { success, error } = await updateUserProfile(userId, updates as any)
    if (success) {
      // Refresh real users list
      const refreshed = await getAllUsers()
      setRealUsers(refreshed)
      // Update viewingUser in place so modal stays open with fresh data
      setViewingUser((prev: any) => prev ? { ...prev, ...updates } : prev)
    } else {
      alert(error || 'Failed to update user')
    }
    return success
  }

  const handleSuspend = async (userId: string) => {
    const { success, error } = await suspendUserInSupabase(userId)
    if (success) {
      const refreshed = await getAllUsers()
      setRealUsers(refreshed)
      setViewingUser((prev: any) => prev?.id === userId ? { ...prev, status: 'suspended' } : prev)
    } else {
      alert(error || 'Failed to suspend user')
    }
  }

  const handleActivate = async (userId: string) => {
    const { success, error } = await activateUserInSupabase(userId)
    if (success) {
      const refreshed = await getAllUsers()
      setRealUsers(refreshed)
      setViewingUser((prev: any) => prev?.id === userId ? { ...prev, status: 'active' } : prev)
    } else {
      alert(error || 'Failed to activate user')
    }
  }

  // Use real users from Supabase, fallback to mock users for backwards compatibility
  const allUsers = realUsers.length > 0 ? realUsers : users

  // Stats
  const walkers = allUsers.filter((u: any) => u.role === 'walker')
  const farmers = allUsers.filter((u: any) => u.role === 'farmer')
  const admins = allUsers.filter((u: any) => u.role === 'admin' || u.role === 'super_admin')
  const activeUsers = allUsers.filter((u: any) => u.status === 'active').length
  
  const reportedCount = reports.filter((r) => r.status === 'reported' && !r.archived && !r.screeningRequired).length
  const claimedCount = reports.filter((r) => r.status === 'claimed' && !r.archived).length
  const resolvedCount = reports.filter((r) => r.status === 'resolved' && !r.archived).length
  const escalatedCount = reports.filter((r) => r.status === 'escalated' && !r.archived).length
  const archivedCount = reports.filter((r) => r.archived).length
  const needsReviewCount = reports.filter((r) => r.screeningRequired && !r.archived).length
  const flaggedCount = reports.filter((r) => r.flaggedByFarmer && !r.archived && r.status !== 'complete').length
  
  const totalFields = farms.reduce((sum, f) => sum + f.fields.length, 0)

  // Subscription stats
  const trialFarmers = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'trial').length
  const activeSubs = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'active').length
  const cancelledSubs = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'cancelled').length

  // Filtered and sorted reports
  // Farms belonging to the selected farmer filter (for the farm dropdown)
  const farmerFilterFarms = useMemo(() => {
    if (filterFarmerId === 'all') return farms
    return farms.filter(f => f.farmerId === filterFarmerId)
  }, [farms, filterFarmerId])

  const filteredReports = useMemo(() => {
    let result = [...reports]

    // Filter by archive status
    if (filterArchive === 'active') {
      result = result.filter(r => !r.archived)
    } else if (filterArchive === 'archived') {
      result = result.filter(r => r.archived)
    }

    // Filter by status
    if (filterStatus === 'needs_review') {
      result = result.filter(r => r.screeningRequired)
    } else if (filterStatus === 'flagged') {
      result = result.filter(r => r.flaggedByFarmer && r.status !== 'complete')
    } else if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus)
    }

    // Filter by farm — only show reports near that specific farm's fields
    if (filterFarmId !== 'all') {
      const farm = farms.find(f => f.id === filterFarmId)
      if (farm && farm.fields.length > 0) {
        result = result.filter(r => isReportNearFarm(r, farm))
      }
    } else if (filterFarmerId !== 'all') {
      // Filter by farmer — show reports near any of their farms
      const farmerFarms = farms.filter(f => f.farmerId === filterFarmerId && f.fields.length > 0)
      if (farmerFarms.length > 0) {
        result = result.filter(r => farmerFarms.some(farm => isReportNearFarm(r, farm)))
      }
    }

    // Filter by date range (Workstream 6)
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime()
      result = result.filter(r => new Date(r.timestamp).getTime() >= from)
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo + 'T23:59:59').getTime()
      result = result.filter(r => new Date(r.timestamp).getTime() <= to)
    }

    // Filter by keyword or report ID (Workstream 6)
    if (filterKeyword.trim()) {
      const kw = filterKeyword.trim().toLowerCase()
      result = result.filter(r =>
        r.id.toLowerCase().includes(kw) ||
        r.description?.toLowerCase().includes(kw) ||
        r.categoryName?.toLowerCase().includes(kw) ||
        r.submittedByUserName?.toLowerCase().includes(kw) ||
        r.condition?.toLowerCase().includes(kw)
      )
    }

    // Filter by map bounds if set
    if (mapBounds) {
      result = result.filter(r =>
        r.location.lat >= mapBounds.south &&
        r.location.lat <= mapBounds.north &&
        r.location.lng >= mapBounds.west &&
        r.location.lng <= mapBounds.east
      )
    }

    // Sort
    if (sortBy === 'daysUnclaimed') {
      result.sort((a, b) => {
        if (a.status === 'reported' && b.status !== 'reported') return -1
        if (b.status === 'reported' && a.status !== 'reported') return 1
        return getDaysSince(b.timestamp) - getDaysSince(a.timestamp)
      })
    } else {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return result
  }, [reports, filterStatus, filterArchive, sortBy, mapBounds, filterFarmerId, filterFarmId, farms, filterDateFrom, filterDateTo, filterKeyword])

  const handleDelete = async () => {
    if (!showDeleteConfirm) return
    if (deleteType === 'user') {
      const { success, error } = await deleteUserFromSupabase(showDeleteConfirm)
      if (!success) {
        alert(error || 'Failed to delete user')
        setShowDeleteConfirm(null)
        return
      }
      // Refresh real users list from Supabase
      const refreshed = await getAllUsers()
      setRealUsers(refreshed)
    } else if (deleteType === 'report') {
      deleteReport(showDeleteConfirm)
    } else if (deleteType === 'farm') {
      deleteFarm(showDeleteConfirm)
    }
    setShowDeleteConfirm(null)
  }

  // Open report detail panel (Workstream 5)
  const openReportDetail = async (reportId: string) => {
    setDetailReportId(reportId)
    setLoadingDetail(true)
    try {
      const [logs, notifs] = await Promise.all([
        fetchAuditLogs({ entityId: reportId }),
        fetchNotificationsForReport(reportId),
      ])
      setDetailAuditLogs(logs)
      setDetailNotifications(notifs)
    } catch {
      setDetailAuditLogs([])
      setDetailNotifications([])
    }
    setLoadingDetail(false)
  }

  const confirmDelete = (id: string, type: 'user' | 'report' | 'farm') => {
    setDeleteType(type)
    setShowDeleteConfirm(id)
  }

  const handleSelectReport = (id: string) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const handleSelectAllReports = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(r => r.id))
    }
  }

  const handleBatchArchive = () => {
    batchArchiveReports(selectedReports)
    setSelectedReports([])
  }

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedReports.length} reports? This cannot be undone.`)) {
      batchDeleteReports(selectedReports)
      setSelectedReports([])
    }
  }

  const getDaysUnclaimedBadge = (report: typeof reports[0]) => {
    if (report.status !== 'reported') return null
    const days = getDaysSince(report.timestamp)
    let colorClass = 'bg-green-100 text-green-700'
    if (days >= 7) colorClass = 'bg-red-100 text-red-700'
    else if (days >= 3) colorClass = 'bg-yellow-100 text-yellow-700'
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {days}d unclaimed
      </span>
    )
  }

  const getSubscriptionBadge = (user: typeof users[0]) => {
    const status = user.subscriptionStatus
    if (!status) return <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-500">No sub</span>
    const colors = {
      trial: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-slate-100 text-slate-500'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{status}</span>
  }

  const NavButton = ({ view, label, count }: { view: AdminView; label: string; count?: number }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        currentView === view ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label} {count !== undefined && <span className="ml-1 text-sm opacity-70">({count})</span>}
    </button>
  )

  const allFieldPolygons = farms.flatMap(farm => 
    farm.fields.map(field => ({
      id: field.id,
      positions: field.fencePosts.map(p => [p.lat, p.lng] as [number, number]),
      color: '#22c55e'
    }))
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title="Admin Dashboard" onTitleClick={() => setCurrentView('overview')} />

      {/* Report Detail Panel — Workstream 5 */}
      {detailReportId && (() => {
        const report = reports.find(r => r.id === detailReportId)
        if (!report) return null
        const affectedFarms = (report.affectedFarmIds || []).map(id => farms.find(f => f.id === id)).filter(Boolean)
        const affectedFarmerUsers = (report.affectedFarmerIds || []).map(id => allUsers.find((u: any) => u.id === id)).filter(Boolean)
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-end z-50">
            <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-bold text-slate-800">Report Detail</h2>
                <button onClick={() => { setDetailReportId(null); setEditingDetailReport(false) }} className="text-slate-500 hover:text-slate-700 text-2xl leading-none">×</button>
              </div>
              <div className="p-4 space-y-5 flex-1">
                {loadingDetail ? (
                  <div className="text-center text-slate-400 py-8">Loading…</div>
                ) : (
                  <>
                    {/* Identity */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Submitter</h3>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                        <div><span className="text-slate-500">Name:</span> <span className="font-medium">{report.submittedByUserName || <span className="text-red-500 italic">Unknown</span>}</span></div>
                        <div><span className="text-slate-500">Role:</span> <span className="font-medium capitalize">{report.roleOfSubmitter || '—'}</span></div>
                        <div><span className="text-slate-500">Reporter ID:</span> <span className="font-mono text-xs text-slate-400">{report.reporterId || '—'}</span></div>
                      </div>
                    </section>

                    {/* Category & Content */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Report</h3>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                        <div className="text-2xl">{report.categoryEmoji} <span className="text-base font-medium">{report.categoryName}</span></div>
                        <div><span className="text-slate-500">Count:</span> {report.sheepCount}</div>
                        <div><span className="text-slate-500">Condition:</span> {report.condition}</div>
                        <div><span className="text-slate-500">Status:</span> <span className={`capitalize font-medium ${report.status === 'reported' ? 'text-yellow-600' : report.status === 'claimed' ? 'text-blue-600' : 'text-green-600'}`}>{report.status}</span></div>
                        <div><span className="text-slate-500">Submitted:</span> {new Date(report.timestamp).toLocaleString('en-GB')}</div>
                        {report.description && <div><span className="text-slate-500">Description:</span> {report.description}</div>}
                      </div>
                    </section>

                    {/* GPS Location */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">GPS Location</h3>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm mb-2">
                        <div>{report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}</div>
                        {report.locationAccuracy && <div className="text-slate-500 text-xs">Accuracy: ±{report.locationAccuracy}m</div>}
                      </div>
                      <div className="rounded-lg overflow-hidden h-40">
                        <Map
                          center={[report.location.lat, report.location.lng]}
                          zoom={15}
                          markers={[{
                            id: report.id,
                            position: [report.location.lat, report.location.lng],
                            popup: `${report.categoryEmoji} ${report.sheepCount} ${report.categoryName}`,
                            type: 'sheep' as const,
                            status: report.status as 'reported' | 'claimed' | 'resolved',
                            emoji: report.categoryEmoji,
                          }]}
                        />
                      </div>
                    </section>

                    {/* Photos */}
                    {(report.photoUrls || []).length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Photos</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(report.photoUrls || []).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`Photo ${i + 1}`} className="rounded-lg object-cover w-full h-24" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Affected Farms */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Affected Farms ({affectedFarms.length})</h3>
                      {affectedFarms.length === 0 ? (
                        <div className="text-sm text-slate-400 italic">No farms within alert range of this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {affectedFarms.map((farm: any) => {
                            const owner = allUsers.find((u: any) => u.id === farm.farmerId)
                            return (
                              <div key={farm.id} className="bg-amber-50 rounded-lg p-3 text-sm">
                                <div className="font-medium">🏡 {farm.name}</div>
                                {owner && <div className="text-slate-500 text-xs">Owner: {owner.full_name || owner.email}</div>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>

                    {/* Affected Farmers */}
                    {affectedFarmerUsers.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notified Farmers</h3>
                        <div className="space-y-1">
                          {affectedFarmerUsers.map((u: any) => (
                            <div key={u.id} className="bg-green-50 rounded-lg p-3 text-sm">
                              <div className="font-medium">🧑‍🌾 {u.full_name || u.email}</div>
                              <div className="text-slate-500 text-xs">{u.email}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Notification History */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notification History ({detailNotifications.length})</h3>
                      {detailNotifications.length === 0 ? (
                        <div className="text-sm text-slate-400 italic">No notifications sent for this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {detailNotifications.map((n: any) => {
                            const recipient = allUsers.find((u: any) => u.id === n.user_id)
                            return (
                              <div key={n.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${n.type === 'thank_you' ? 'text-amber-700' : 'text-blue-700'}`}>
                                    {n.type === 'thank_you' ? '💌 Thank You' : n.type === 'new_report' ? '🔔 New report alert' : n.type}
                                  </span>
                                  <span className="text-xs text-slate-400">{new Date(n.sent_at).toLocaleString('en-GB')}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  To: {recipient?.full_name || recipient?.email || n.user_id}
                                  {n.read_at ? <span className="ml-2 text-green-600">✓ Read {new Date(n.read_at).toLocaleDateString('en-GB')}</span> : <span className="ml-2 text-slate-400">Unread</span>}
                                </div>
                                {n.message_text && <div className="text-xs text-slate-600 mt-1 italic">&ldquo;{n.message_text}&rdquo;</div>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>

                    {/* Action History */}
                    <section>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Action History ({detailAuditLogs.length})</h3>
                      {detailAuditLogs.length === 0 ? (
                        <div className="text-sm text-slate-400 italic">No audit log entries for this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {detailAuditLogs.map((log: any) => (
                            <div key={log.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-indigo-700 font-medium">{log.action}</span>
                                <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString('en-GB')}</span>
                              </div>
                              <div className="text-slate-500 text-xs mt-0.5">{log.actor_email || log.actor_id}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Admin Edit Report */}
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Edit Report</h3>
                        {!editingDetailReport && (
                          <button
                            onClick={() => {
                              setEditingDetailReport(true)
                              setDetailEditFields({
                                description: report.description || '',
                                sheepCount: report.sheepCount,
                                conditions: report.conditions?.length ? report.conditions : report.condition ? [report.condition] : [],
                                photoUrls: report.photoUrls || [],
                              })
                            }}
                            className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                      {editingDetailReport && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-200">
                          {report.reporterId && report.reporterId !== currentUserId && (
                            <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700">
                              ⚠️ You are editing a report submitted by another user. Changes will be logged in the audit trail.
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setDetailEditFields(f => ({ ...f, sheepCount: Math.max(1, f.sheepCount - 1) }))}
                                className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-lg flex items-center justify-center">−</button>
                              <input type="number" min="1" value={detailEditFields.sheepCount}
                                onChange={e => setDetailEditFields(f => ({ ...f, sheepCount: parseInt(e.target.value) || 1 }))}
                                className="w-16 text-center px-2 py-1 border border-slate-300 rounded-lg text-base font-semibold" />
                              <button type="button" onClick={() => setDetailEditFields(f => ({ ...f, sheepCount: f.sheepCount + 1 }))}
                                className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-lg flex items-center justify-center">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Conditions</label>
                            <div className="flex flex-wrap gap-2">
                              {(reportCategories.find(c => c.id === report.categoryId)?.conditions || ['Healthy','Injured','Dead','In road','Lost / straying','Not sure']).map(opt => {
                                const sel = detailEditFields.conditions.includes(opt)
                                return (
                                  <button key={opt} type="button"
                                    onClick={() => setDetailEditFields(f => ({
                                      ...f,
                                      conditions: sel ? f.conditions.filter(c => c !== opt) : [...f.conditions, opt]
                                    }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${sel ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-300'}`}
                                  >{opt}</button>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Details</label>
                            <textarea value={detailEditFields.description}
                              onChange={e => setDetailEditFields(f => ({ ...f, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Add Photos</label>
                            <PhotoUpload
                              reportId={report.id}
                              onPhotosUploaded={(urls) => setDetailEditFields(f => ({ ...f, photoUrls: [...new Set([...f.photoUrls, ...urls])] }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setSavingDetailEdit(true)
                                try {
                                  const conditions = detailEditFields.conditions
                                  const condition = conditions[0] || ''
                                  await updateReportInDB(report.id, {
                                    description: detailEditFields.description,
                                    sheepCount: detailEditFields.sheepCount,
                                    conditions,
                                    condition,
                                    photoUrls: detailEditFields.photoUrls,
                                  })
                                  await loadReports()
                                  setEditingDetailReport(false)
                                } finally {
                                  setSavingDetailEdit(false)
                                }
                              }}
                              disabled={savingDetailEdit}
                              className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                            >
                              {savingDetailEdit ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              onClick={() => setEditingDetailReport(false)}
                              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Admin Actions */}
                    <section className="border-t pt-4">
                      {report.screeningRequired && !report.archived && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm">
                          <div className="font-medium text-red-700 mb-1">⚠️ Pending Screening Review</div>
                          <div className="text-red-600 text-xs mb-2">This report was flagged for admin review before being visible to farmers.</div>
                          <button onClick={() => { approveReportScreening(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 font-medium">Approve &amp; Publish</button>
                        </div>
                      )}
                      {report.flaggedByFarmer && report.status !== 'complete' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm">
                          <div className="font-medium text-amber-700 mb-1">🚩 Flagged by Farmer</div>
                          {report.farmerFlagNote && <div className="text-amber-800 italic text-xs mb-1">&ldquo;{report.farmerFlagNote}&rdquo;</div>}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {!report.archived && report.status === 'reported' && !report.screeningRequired && (
                          <button onClick={() => { setShowClaimReportModal(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Claim for Farmer</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => { resolveReport(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Resolve</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { escalateReport(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200">Escalate</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { setCompleteReportId(report.id); setCompleteNotes(''); setDetailReportId(null) }} className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800">Mark Complete</button>
                        )}
                        {!report.archived && (
                          <button onClick={() => { archiveReport(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200">Archive</button>
                        )}
                        <button onClick={() => { confirmDelete(report.id, 'report'); setDetailReportId(null) }} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete</button>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Mark Complete Modal */}
      {completeReportId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-bold text-slate-800">Mark Report Complete</h3>
              <p className="text-sm text-slate-500 mt-1">Optionally add admin notes before closing this report.</p>
            </div>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Admin notes (optional)…"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <div className="space-y-3">
              <button
                onClick={() => { markReportComplete(completeReportId, completeNotes || undefined); setCompleteReportId(null); setCompleteNotes('') }}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900"
              >
                Mark Complete
              </button>
              <button onClick={() => { setCompleteReportId(null); setCompleteNotes('') }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-slate-800">Confirm Delete</h3>
            </div>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to delete this {deleteType}? This cannot be undone.
            </p>
            <div className="space-y-3">
              <button onClick={handleDelete} className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Farmer Modal */}
      {showCreateFarmerModal && <CreateFarmerModal onClose={() => setShowCreateFarmerModal(false)} onCreate={(farmer: any) => {
        addUser({
          ...farmer,
          id: Date.now().toString(),
          role: 'farmer',
          status: 'active',
          createdAt: new Date(),
          lastActiveAt: new Date(),
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        })
        setShowCreateFarmerModal(false)
      }} />}

      {/* Edit Farmer Modal */}
      {showEditFarmerModal && <EditFarmerModal
        farmer={users.find(u => u.id === showEditFarmerModal)!}
        onClose={() => setShowEditFarmerModal(null)}
        onSave={(id: string, data: any) => {
          updateUser(id, data)
          setShowEditFarmerModal(null)
        }}
      />}

      {/* Create Farm Modal */}
      {showCreateFarmModal && <CreateFarmModal
        farmers={[...farmers, ...admins]}
        onClose={() => setShowCreateFarmModal(false)}
        onCreate={(farm: any) => {
          addFarm(farm)
          setShowCreateFarmModal(false)
        }}
      />}

      {/* Edit Farm Modal */}
      {showEditFarmModal && <EditFarmModal
        farm={farms.find(f => f.id === showEditFarmModal)!}
        allFarmers={[...farmers, ...admins]}
        onClose={() => setShowEditFarmModal(null)}
        onSave={(id: string, data: any) => {
          updateFarm(id, data)
          setShowEditFarmModal(null)
        }}
      />}

      {/* Farm Details Modal (with fields) */}
      {showFarmDetailsModal && <FarmDetailsModal
        farm={farms.find(f => f.id === showFarmDetailsModal)!}
        owner={users.find(u => u.id === farms.find(f => f.id === showFarmDetailsModal)?.farmerId)}
        onClose={() => setShowFarmDetailsModal(null)}
        onAddField={(farmId: string) => setShowCreateFieldModal(farmId)}
        onEditField={(farmId: string, fieldId: string) => setShowEditFieldModal({ farmId, fieldId })}
        onDeleteField={(farmId: string, fieldId: string) => {
          if (confirm('Delete this field? This cannot be undone.')) {
            deleteField(farmId, fieldId)
          }
        }}
        categories={reportCategories}
        onUpdateSubscription={updateFarmCategorySubscription}
      />}

      {/* Create Field Modal */}
      {showCreateFieldModal && <CreateFieldModal
        farmId={showCreateFieldModal}
        farm={farms.find(f => f.id === showCreateFieldModal)!}
        onClose={() => setShowCreateFieldModal(null)}
        onCreate={(farmId: string, field: any) => {
          addField(farmId, field)
          setShowCreateFieldModal(null)
        }}
      />}

      {/* Edit Field Modal */}
      {showEditFieldModal && <EditFieldModal
        farmId={showEditFieldModal.farmId}
        field={farms.find(f => f.id === showEditFieldModal.farmId)?.fields.find(fi => fi.id === showEditFieldModal.fieldId)!}
        onClose={() => setShowEditFieldModal(null)}
        onSave={(farmId: string, fieldId: string, data: any) => {
          updateField(farmId, fieldId, data)
          setShowEditFieldModal(null)
        }}
      />}

      {/* Claim Report Modal */}
      {showClaimReportModal && <ClaimReportModal
        reportId={showClaimReportModal}
        report={reports.find(r => r.id === showClaimReportModal)!}
        farmers={[...farmers, ...admins]}
        onClose={() => setShowClaimReportModal(null)}
        onClaim={(reportId: string, farmerId: string) => {
          claimReportForFarmer(reportId, farmerId)
          setShowClaimReportModal(null)
        }}
      />}

      {/* User Detail / Edit Modal */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          reports={reports}
          farms={farms}
          onClose={() => setViewingUser(null)}
          onUpdate={handleUpdateUser}
          onReset={handleResetUserPassword}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
          onNavigate={(view) => { setViewingUser(null); setCurrentView(view) }}
        />
      )}

      {/* Walker Report Mode Overlay */}
      {showReportMode && (
        <div className="fixed inset-0 z-[100] bg-slate-50 overflow-auto">
          <WalkerDashboard onExitToAdmin={() => setShowReportMode(false)} />
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <NavButton view="walkers" label="Walkers" count={walkers.length} />
            <NavButton view="farmers" label="Farmers" count={farmers.length} />
            <NavButton view="reports" label="Reports" count={reports.filter(r => !r.archived).length} />
            <NavButton view="farms" label="Farms" count={farms.length} />
            <NavButton view="billing" label="Billing" />
            <NavButton view="admins" label="Admin Users" />
            <NavButton view="categories" label="Categories" count={reportCategories.length} />
            <div className="ml-auto flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => setShowReportMode(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                🐑 Report
              </button>
              <button
                onClick={() => setProfileOpen(true)}
                title="Account settings"
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ===== OVERVIEW ===== */}
        {currentView === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button onClick={() => setCurrentView('admins')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-slate-800">{allUsers.length}</div>
                <div className="text-sm text-slate-500">Total Users</div>
                <div className="text-xs text-green-600 mt-1">{activeUsers} active</div>
              </button>
              <button onClick={() => setCurrentView('walkers')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-green-600">{walkers.length}</div>
                <div className="text-sm text-slate-500">Walkers</div>
              </button>
              <button onClick={() => setCurrentView('farmers')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-blue-600">{farmers.length}</div>
                <div className="text-sm text-slate-500">Farmers</div>
              </button>
              <button onClick={() => setCurrentView('farms')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-amber-600">{farms.length}</div>
                <div className="text-sm text-slate-500">Farms ({totalFields} fields)</div>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <button onClick={() => setCurrentView('reports')} className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-yellow-700">{reportedCount}</div>
                <div className="text-sm text-yellow-600">Reported</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-700">{claimedCount}</div>
                <div className="text-sm text-blue-600">Claimed</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-green-50 rounded-xl p-4 border border-green-200 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-700">{resolvedCount}</div>
                <div className="text-sm text-green-600">Resolved</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-slate-700">{archivedCount}</div>
                <div className="text-sm text-slate-600">Archived</div>
              </button>
            </div>
            {/* Action-required queue cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button onClick={() => setCurrentView('reports')} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${needsReviewCount > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-2xl font-bold ${needsReviewCount > 0 ? 'text-red-700' : 'text-slate-400'}`}>{needsReviewCount}</div>
                <div className={`text-sm ${needsReviewCount > 0 ? 'text-red-600 font-medium' : 'text-slate-500'}`}>⚠️ Needs Review</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${escalatedCount > 0 ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-2xl font-bold ${escalatedCount > 0 ? 'text-orange-700' : 'text-slate-400'}`}>{escalatedCount}</div>
                <div className={`text-sm ${escalatedCount > 0 ? 'text-orange-600 font-medium' : 'text-slate-500'}`}>🚨 Escalated</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${flaggedCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-2xl font-bold ${flaggedCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{flaggedCount}</div>
                <div className={`text-sm ${flaggedCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>🚩 Flagged by Farmer</div>
              </button>
            </div>
            <div className="grid grid-cols-1 mb-6">
              <button onClick={() => setCurrentView('billing')} className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-purple-700">{activeSubs}</div>
                <div className="text-sm text-purple-600">Paid Subs</div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow mb-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-slate-800">Activity Map</h2>
              </div>
              <div className="h-80">
                <Map
                  center={adminMapCenter}
                  zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                  markers={[
                    ...(adminLocationAcquired ? [{
                      id: 'admin-location',
                      position: adminMapCenter,
                      popup: '📍 Your location',
                      type: 'user-location' as const,
                    }] : []),
                    ...reports.filter(r => !r.archived).map((r) => ({
                      id: r.id,
                      position: [r.location.lat, r.location.lng] as [number, number],
                      popup: `${r.categoryEmoji || '🐑'} ${r.sheepCount} ${r.categoryName || 'sheep'} - ${r.status}`,
                      type: 'sheep' as const,
                      status: r.status as 'reported' | 'claimed' | 'resolved',
                      emoji: r.categoryEmoji || '🐑',
                    }))
                  ]}
                  polygons={allFieldPolygons}
                />
              </div>
            </div>
          </>
        )}

        {/* ===== WALKERS ===== */}
        {currentView === 'walkers' && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">Walkers ({walkers.length})</h2>
            </div>
            {walkers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🚶</div>No walkers registered yet
              </div>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reports</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {walkers.map((user: any) => {
                    const userReports = reports.filter(r => r.reporterId === user.id)
                    const displayName = user.full_name || user.name || '-'
                    const isActive = user.status !== 'suspended'
                    return (
                      <tr key={user.id} className={!isActive ? 'bg-slate-50 opacity-60' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button onClick={() => setViewingUser(user)} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left">{user.email || '-'}</button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{displayName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{user.phone || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {user.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                          ) : user.status === 'suspended' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>
                          ) : user.status === 'password_reset_required' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Reset Required</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{userReports.length}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingUser(user)} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200">View</button>
                            {isActive ? (
                              <button onClick={() => handleSuspend(user.id)} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium hover:bg-amber-200">Suspend</button>
                            ) : (
                              <button onClick={() => handleActivate(user.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Activate</button>
                            )}
                            {user.email && (
                              <button onClick={() => handleResetUserPassword(user.id, user.email)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">Reset</button>
                            )}
                            <button onClick={() => confirmDelete(user.id, 'user')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== FARMERS ===== */}
        {currentView === 'farmers' && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Farmers ({farmers.length})</h2>
              <button
                onClick={() => setShowCreateFarmerModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                + Add Farmer
              </button>
            </div>
            {farmers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🧑‍🌾</div>No farmers registered yet
              </div>
            ) : (
              <table className="w-full min-w-[750px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {farmers.map((user: any) => {
                    const userFarms = farms.filter(f => f.farmerId === user.id)
                    const displayName = user.full_name || user.name || '-'
                    const isActive = user.status !== 'suspended'
                    return (
                      <tr key={user.id} className={!isActive ? 'bg-slate-50 opacity-60' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button onClick={() => setViewingUser(user)} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left">{user.email || '-'}</button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{displayName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{user.phone || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {user.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                          ) : user.status === 'suspended' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>
                          ) : user.status === 'password_reset_required' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Reset Required</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{userFarms.length}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingUser(user)} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200">View</button>
                            {isActive ? (
                              <button onClick={() => handleSuspend(user.id)} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium hover:bg-amber-200">Suspend</button>
                            ) : (
                              <button onClick={() => handleActivate(user.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Activate</button>
                            )}
                            {user.email && (
                              <button onClick={() => handleResetUserPassword(user.id, user.email)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">Reset</button>
                            )}
                            <button onClick={() => confirmDelete(user.id, 'user')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== REPORTS ===== */}
        {currentView === 'reports' && (
          <>
            {/* Filters and Sort */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="all">All Status</option>
                    <option value="reported">Reported</option>
                    <option value="claimed">Claimed</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                    <option value="complete">Complete</option>
                    <option value="needs_review">⚠️ Needs Review</option>
                    <option value="flagged">🚩 Flagged by Farmer</option>
                  </select>
                  <select value={filterArchive} onChange={(e) => setFilterArchive(e.target.value as FilterArchive)} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="all">All</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="daysUnclaimed">Sort: Days Unclaimed</option>
                    <option value="date">Sort: Date</option>
                  </select>
                  <select
                    value={filterFarmerId}
                    onChange={(e) => { setFilterFarmerId(e.target.value); setFilterFarmId('all') }}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Farmers</option>
                    {[...farmers, ...admins].map((u: any) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.name || u.email}</option>
                    ))}
                  </select>
                  <select
                    value={filterFarmId}
                    onChange={(e) => setFilterFarmId(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Farms</option>
                    {farmerFilterFarms.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                {/* Workstream 6 — date range + keyword search */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t w-full">
                  <input
                    type="text"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    placeholder="Search ID, description, reporter…"
                    className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-48"
                  />
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    title="From date"
                  />
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    title="To date"
                  />
                  {(filterKeyword || filterDateFrom || filterDateTo) && (
                    <button
                      onClick={() => { setFilterKeyword(''); setFilterDateFrom(''); setFilterDateTo('') }}
                      className="px-3 py-2 text-sm text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {selectedReports.length > 0 && (
                    <>
                      <button onClick={handleBatchArchive} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">
                        Archive ({selectedReports.length})
                      </button>
                      <button onClick={handleBatchDelete} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        Delete ({selectedReports.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Map Search */}
            <div className="bg-white rounded-xl shadow mb-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-medium text-slate-800">Map Search</h3>
                {mapBounds && (
                  <button onClick={() => setMapBounds(null)} className="text-sm text-blue-600 hover:underline">Clear filter</button>
                )}
              </div>
              <div className="h-48">
                <Map
                  center={[54.5, -2]}
                  zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                  markers={filteredReports.map((r) => ({
                    id: r.id,
                    position: [r.location.lat, r.location.lng] as [number, number],
                    popup: `${r.categoryEmoji || '🐑'} ${r.sheepCount} ${r.categoryName || ''} - ${r.status}`,
                    type: 'sheep' as const,
                    status: r.status as 'reported' | 'claimed' | 'resolved',
                    emoji: r.categoryEmoji || '🐑',
                  }))}
                />
              </div>
              <div className="p-2 text-center text-xs text-slate-500">
                Showing {filteredReports.length} reports {mapBounds ? 'in selected area' : ''}
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-slate-800">Reports ({filteredReports.length})</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedReports.length === filteredReports.length && filteredReports.length > 0} onChange={handleSelectAllReports} className="rounded" />
                  Select All
                </label>
              </div>
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="text-4xl mb-2">🐑</div>No reports match filters
                </div>
              ) : (
                <div className="divide-y">
                  {filteredReports.map((report) => {
                    const cat = reportCategories.find(c => c.id === report.categoryId)
                    const conditions = report.conditions?.length ? report.conditions : report.condition ? [report.condition] : []
                    const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors'
                    return (
                    <div key={report.id} className={`p-4 flex items-start gap-3 ${report.archived ? 'bg-slate-50' : ''}`}>
                      <input type="checkbox" checked={selectedReports.includes(report.id)} onChange={() => handleSelectReport(report.id)} className="rounded mt-1 flex-shrink-0" />
                      {/* Clickable category icon */}
                      <button
                        onClick={() => openReportDetail(report.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-indigo-400 transition-all bg-yellow-100"
                        title="View report detail"
                      >
                        {cat?.imageUrl
                          ? <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 object-contain rounded-full" />
                          : <span className="text-xl">{report.categoryEmoji || '🐑'}</span>
                        }
                      </button>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <button onClick={() => openReportDetail(report.id)} className="text-left w-full hover:text-indigo-700 transition-colors">
                          <div className="font-medium text-slate-800">{report.sheepCount} {report.categoryName || 'Sheep'}</div>
                        </button>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {report.submittedByUserName || report.reporterContact || <span className="italic text-slate-400">Anonymous</span>}
                          {' · '}{new Date(report.timestamp).toLocaleString()}
                        </div>
                        {conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conditions.map(c => <span key={c} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{c}</span>)}
                          </div>
                        )}
                        {report.description && <div className="text-xs text-slate-400 mt-1 truncate">{report.description}</div>}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end flex-shrink-0">
                        {getDaysUnclaimedBadge(report)}
                        {report.screeningRequired && !report.archived && (
                          <span className="px-2 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700">⚠️ Review</span>
                        )}
                        {report.flaggedByFarmer && report.status !== 'complete' && (
                          <span className="px-2 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">🚩</span>
                        )}
                        <span className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                          report.status === 'complete' ? 'bg-slate-200 text-slate-700' :
                          report.status === 'escalated' ? 'bg-orange-100 text-orange-700' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          report.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{report.status}</span>
                        {report.archived && <span className={`${btnBase} bg-slate-200 text-slate-600`}>Archived</span>}
                        <button onClick={() => openReportDetail(report.id)} className={`${btnBase} bg-indigo-100 text-indigo-700 hover:bg-indigo-200`}>View</button>
                        {!report.archived && report.screeningRequired && (
                          <button onClick={() => approveReportScreening(report.id)} className={`${btnBase} bg-teal-100 text-teal-700 hover:bg-teal-200`}>Approve</button>
                        )}
                        {!report.archived && report.status === 'reported' && !report.screeningRequired && (
                          <button onClick={() => setShowClaimReportModal(report.id)} className={`${btnBase} bg-green-100 text-green-700 hover:bg-green-200`}>Claim</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => resolveReport(report.id)} className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}>Resolve</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => escalateReport(report.id)} className={`${btnBase} bg-orange-100 text-orange-700 hover:bg-orange-200`}>Escalate</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { setCompleteReportId(report.id); setCompleteNotes('') }} className={`${btnBase} bg-slate-700 text-white hover:bg-slate-800`}>Complete</button>
                        )}
                        {!report.archived && (
                          <button onClick={() => archiveReport(report.id)} className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}>Archive</button>
                        )}
                        <button onClick={() => confirmDelete(report.id, 'report')} className={`${btnBase} bg-red-100 text-red-700 hover:bg-red-200`}>Delete</button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== FARMS ===== */}
        {currentView === 'farms' && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">All Farms ({farms.length})</h2>
              <button
                onClick={() => setShowCreateFarmModal(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-2"
              >
                + Add Farm
              </button>
            </div>
            {farms.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🏡</div>No farms registered yet
              </div>
            ) : (
              <div className="divide-y">
                {farms.map((farm) => {
                  const owner = allUsers.find((u: any) => u.id === farm.farmerId)
                  const isOrphaned = !farm.farmerId || !owner
                  return (
                    <div key={farm.id} className={`p-4 flex items-center justify-between ${isOrphaned ? 'bg-red-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOrphaned ? 'bg-red-100' : 'bg-amber-100'}`}>🏡</div>
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-2">
                            {farm.name}
                            {isOrphaned && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">⚠️ No owner — click Edit to reassign</span>}
                          </div>
                          <div className="text-sm text-slate-500">{farm.fields.length} fields • Buffer: {farm.alertBufferMeters}m</div>
                          <div className="text-xs text-slate-400">Owner: {owner?.full_name || owner?.name || (isOrphaned ? 'Unassigned' : 'Unknown')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${farm.alertsEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {farm.alertsEnabled ? 'Alerts On' : 'Alerts Off'}
                        </span>
                        <button onClick={() => setShowFarmDetailsModal(farm.id)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">View Fields</button>
                        <button onClick={() => setShowEditFarmModal(farm.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">Edit</button>
                        <button onClick={() => confirmDelete(farm.id, 'farm')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== BILLING ===== */}
        {currentView === 'billing' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{trialFarmers}</div>
                <div className="text-sm text-blue-600">On Trial</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{activeSubs}</div>
                <div className="text-sm text-green-600">Active Subscriptions</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{cancelledSubs}</div>
                <div className="text-sm text-red-600">Cancelled</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <h3 className="font-semibold text-slate-800 mb-2">Revenue Estimate</h3>
              <div className="text-3xl font-bold text-green-600">£{(activeSubs * 29.99).toFixed(2)}<span className="text-sm font-normal text-slate-500">/month</span></div>
            </div>

            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-slate-800">Farmer Subscriptions</h2>
              </div>
              <div className="divide-y">
                {farmers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                      {user.trialEndsAt && user.subscriptionStatus === 'trial' && (
                        <div className="text-xs text-blue-600">Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubscriptionBadge(user)}
                      {user.subscriptionStatus === 'trial' && (
                        <button onClick={() => activateSubscription(user.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Activate</button>
                      )}
                      {user.subscriptionStatus === 'active' && (
                        <button onClick={() => cancelSubscription(user.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'admins' && (
          <AdminUserManagement />
        )}

        {/* ===== CATEGORIES ===== */}
        {currentView === 'categories' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Report Categories</h2>
              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                + Add Category
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>🐑 Sheep</strong> is the built-in default category and cannot be removed. Add custom categories below for reporting other issues such as damaged property or other animals.
              </p>
            </div>

            <div className="space-y-3">
              {reportCategories.length === 0 && (
                <div className="bg-white rounded-xl p-8 shadow text-center text-slate-500">
                  No custom categories yet. Click "+ Add Category" to create one.
                </div>
              )}
              {[...reportCategories].sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                <div key={cat.id} className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain rounded flex-shrink-0" />
                    ) : (
                      <span className="text-3xl">{cat.emoji}</span>
                    )}
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        {cat.name}
                        {!cat.isActive && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      {cat.description && <div className="text-sm text-slate-500">{cat.description}</div>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.conditions.map((c) => (
                          <span key={c} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
                          deleteReportCategory(cat.id)
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create / Edit Category Modal */}
            {(showCreateCategoryModal || editingCategory) && (
              <CategoryFormModal
                category={editingCategory}
                onClose={() => { setShowCreateCategoryModal(false); setEditingCategory(null) }}
                onSave={(data: any) => {
                  if (editingCategory) {
                    updateReportCategory(editingCategory.id, data)
                  } else {
                    addReportCategory(data)
                  }
                  setShowCreateCategoryModal(false)
                  setEditingCategory(null)
                }}
              />
            )}
          </>
        )}

        {/* ===== AUDIT LOG ===== */}
        {currentView === 'audit' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Audit Log</h2>
              <button
                onClick={async () => {
                  setLoadingAudit(true)
                  const logs = await fetchAuditLogs({ limit: 200 })
                  setAuditLogs(logs)
                  setLoadingAudit(false)
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
            {loadingAudit ? (
              <div className="text-center py-8 text-slate-500">Loading…</div>
            ) : auditLogs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow text-center text-slate-500">
                <div className="text-4xl mb-2">📋</div>
                No audit logs yet. Click Refresh to load.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow divide-y overflow-hidden">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 flex items-start gap-3 text-sm">
                    <div className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-800">{log.action}</span>
                      {log.entity_type && (
                        <span className="ml-2 text-slate-500">· {log.entity_type} {log.entity_id ? `(${String(log.entity_id).slice(0, 8)}…)` : ''}</span>
                      )}
                      {log.detail && Object.keys(log.detail).length > 0 && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {JSON.stringify(log.detail)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {log.actor_email || log.actor_id?.slice(0, 8) || 'system'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-6 bg-slate-200 rounded-xl p-4 text-sm text-slate-600">
          <p>Little Bo Peep Admin Panel • Version 3.0.0</p>
        </div>
      </main>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}

// ===== MODAL COMPONENTS =====

function CreateFarmerModal({ onClose, onCreate }: { onClose: () => void; onCreate: (farmer: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter farmer name')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Invite farmer using unified auth system
      const { success, user, error: inviteError } = await inviteUser(
        email.trim(),
        name.trim(),
        'farmer',
        phone.trim() || undefined
      )

      if (!success) {
        setError(inviteError || 'Failed to invite farmer')
        setLoading(false)
        return
      }

      // Success - farmer will receive invitation email
      alert(`Farmer "${name}" invited successfully! They will receive an email with setup instructions.`)
      onCreate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        billingAddress: billingAddress.line1 ? billingAddress : undefined
      })
    } catch (err: any) {
      setError(err.message || 'Failed to invite farmer')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Add New Farmer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> The farmer will receive an email invitation with a password reset link. They must set their password before they can log in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Smith"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="john@farm.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="07700 900123"
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-700 mb-3">Billing Address (Optional)</h4>

            <div className="space-y-3">
              <input
                type="text"
                value={billingAddress.line1}
                onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={billingAddress.line2}
                onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Address Line 2"
              />
              <input
                type="text"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="City"
              />
              <input
                type="text"
                value={billingAddress.county}
                onChange={(e) => setBillingAddress({ ...billingAddress, county: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="County"
              />
              <input
                type="text"
                value={billingAddress.postcode}
                onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Postcode"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Invitation...' : 'Invite Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFarmerModal({ farmer, onClose, onSave }: { farmer: any; onClose: () => void; onSave: (id: string, data: any) => void }) {
  const [name, setName] = useState(farmer.name)
  const [email, setEmail] = useState(farmer.email || '')
  const [phone, setPhone] = useState(farmer.phone || '')
  const [billingAddress, setBillingAddress] = useState(farmer.billingAddress || {
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter farmer name')
      return
    }
    if (email && !email.includes('@')) {
      alert('Please enter a valid email')
      return
    }

    onSave(farmer.id, {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      billingAddress: billingAddress.line1 ? billingAddress : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Edit Farmer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-700 mb-3">Billing Address</h4>
            <div className="space-y-3">
              <input type="text" value={billingAddress.line1} onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Address Line 1" />
              <input type="text" value={billingAddress.line2 || ''} onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Address Line 2" />
              <input type="text" value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="City" />
              <input type="text" value={billingAddress.county} onChange={(e) => setBillingAddress({ ...billingAddress, county: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="County" />
              <input type="text" value={billingAddress.postcode} onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Postcode" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateFarmModal({ farmers, onClose, onCreate }: { farmers: any[]; onClose: () => void; onCreate: (farm: any) => void }) {
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '')
  const [name, setName] = useState('')
  const [alertBufferMeters, setAlertBufferMeters] = useState(500)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmerId) {
      alert('Please select a farmer')
      return
    }
    if (!name.trim()) {
      alert('Please enter farm name')
      return
    }

    onCreate({
      farmerId,
      name: name.trim(),
      alertBufferMeters,
      alertsEnabled,
      fields: []
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Add New Farm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Farmer Owner *</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Select farmer...</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.full_name || farmer.name || farmer.email} ({farmer.email || 'No email'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Farm Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Green Meadows Farm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alert Buffer (meters)</label>
            <input
              type="number"
              value={alertBufferMeters}
              onChange={(e) => setAlertBufferMeters(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              min="0"
              step="50"
            />
            <p className="text-xs text-slate-500 mt-1">Distance outside field boundaries to receive alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertsEnabled"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertsEnabled" className="text-sm font-medium text-slate-700">
              Enable alerts for this farm
            </label>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            💡 You can add fields to this farm after creation
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700">Create Farm</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFarmModal({ farm, allFarmers, onClose, onSave }: {
  farm: any
  allFarmers: any[]
  onClose: () => void
  onSave: (id: string, data: any) => void
}) {
  const [name, setName] = useState(farm.name)
  const [alertBufferMeters, setAlertBufferMeters] = useState(farm.alertBufferMeters)
  const [alertsEnabled, setAlertsEnabled] = useState(farm.alertsEnabled)
  const [farmerId, setFarmerId] = useState(farm.farmerId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter farm name')
      return
    }
    onSave(farm.id, {
      name: name.trim(),
      alertBufferMeters,
      alertsEnabled,
      farmerId: farmerId || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Edit Farm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        {!farm.farmerId && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ This farm has no owner. Assign a farmer below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Farm Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Farmer Owner</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">— Unassigned —</option>
              {allFarmers.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.full_name || f.name || f.email} ({f.email || 'No email'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alert Buffer (meters)</label>
            <input
              type="number"
              value={alertBufferMeters}
              onChange={(e) => setAlertBufferMeters(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              min="0"
              step="50"
            />
            <p className="text-xs text-slate-500 mt-1">Distance outside field boundaries to receive alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertsEnabledEdit"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertsEnabledEdit" className="text-sm font-medium text-slate-700">
              Enable alerts for this farm
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FarmDetailsModal({ farm, owner, onClose, onAddField, onEditField, onDeleteField, categories, onUpdateSubscription }: any) {
  const activeCategories = (categories || []).filter((c: any) => c.isActive)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{farm.name}</h3>
            <p className="text-sm text-slate-600">Owner: {owner?.name || 'Unknown'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Alert Buffer:</span> {farm.alertBufferMeters}m</div>
            <div><span className="font-medium">Alerts:</span> {farm.alertsEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><span className="font-medium">Fields:</span> {farm.fields.length}</div>
            <div><span className="font-medium">Created:</span> {new Date(farm.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h4 className="font-semibold text-slate-800">Fields ({farm.fields.length})</h4>
          <button
            onClick={() => onAddField(farm.id)}
            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            + Add Field
          </button>
        </div>

        {farm.fields.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg">
            <div className="text-4xl mb-2">📍</div>
            <p>No fields added yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {farm.fields.map((field: any) => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-800">{field.name}</div>
                  <div className="text-sm text-slate-600">
                    {field.fencePosts.length} fence posts
                    {field.sheepCount && ` • ${field.sheepCount} sheep`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditField(farm.id, field.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteField(farm.id, field.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCategories.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold text-slate-800 mb-3">Notification Preferences</h4>
            <p className="text-xs text-slate-500 mb-3">Control which report types trigger alerts for this farm.</p>
            <div className="space-y-2">
              {activeCategories.map((cat: any) => {
                const isCompulsory = cat.subscriptionMode === 'compulsory'
                const effective = isCompulsory
                  ? true
                  : cat.subscriptionMode === 'default_on'
                    ? (farm.categorySubscriptions?.[cat.id] ?? true)
                    : (farm.categorySubscriptions?.[cat.id] ?? false)
                return (
                  <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg ${isCompulsory ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0" />
                      ) : (
                        <span className="text-xl">{cat.emoji}</span>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-700">{cat.name}</div>
                        <div className="text-xs text-slate-500">
                          {isCompulsory ? '🔒 Compulsory — cannot be disabled' : cat.subscriptionMode === 'default_on' ? 'Default on' : 'Optional'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => !isCompulsory && onUpdateSubscription(farm.id, cat.id, !effective)}
                      disabled={isCompulsory}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        effective ? 'bg-green-500' : 'bg-slate-300'
                      } ${isCompulsory ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={isCompulsory ? 'Compulsory — cannot be changed' : undefined}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${effective ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateFieldModal({ farmId, farm, onClose, onCreate }: any) {
  const [name, setName] = useState('')
  const [sheepCount, setSheepCount] = useState('')
  const [fencePosts, setFencePosts] = useState<{lat: number, lng: number}[]>([])

  const handleMapClick = (lat: number, lng: number) => {
    setFencePosts([...fencePosts, { lat, lng }])
  }

  const handleUndoPost = () => {
    setFencePosts(fencePosts.slice(0, -1))
  }

  const handleClearPosts = () => {
    setFencePosts([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter field name')
      return
    }
    if (fencePosts.length < 3) {
      alert('Field must have at least 3 fence posts. Click on the map to place posts.')
      return
    }

    onCreate(farmId, {
      name: name.trim(),
      fencePosts,
      sheepCount: sheepCount ? parseInt(sheepCount) : undefined,
      color: '#22c55e'
    })
  }

  const canSave = name.trim() && fencePosts.length >= 3

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Add Field to {farm.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Field Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="North Field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sheep Count (Optional)</label>
            <input
              type="number"
              value={sheepCount}
              onChange={(e) => setSheepCount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="150"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Place Fence Posts ({fencePosts.length} placed, need 3+)
            </label>
            <p className="text-xs text-slate-500 mb-2">Click on the map to place fence posts. The field boundary will be drawn automatically.</p>
            <div className="h-96 rounded-lg overflow-hidden shadow border">
              <Map
                center={fencePosts[0] ? [fencePosts[0].lat, fencePosts[0].lng] : MAP_CONFIG.DEFAULT_CENTER}
                zoom={fencePosts.length > 0 ? MAP_CONFIG.STANDARD_ZOOM_5KM : MAP_CONFIG.STANDARD_ZOOM_5KM}
                onClick={handleMapClick}
                markers={fencePosts.map((post, idx) => ({
                  id: `post-${idx}`,
                  position: [post.lat, post.lng] as [number, number],
                  popup: `Post ${idx + 1}`,
                  type: 'fencepost' as const
                }))}
                polygons={fencePosts.length >= 3 ? [{
                  id: 'new',
                  positions: fencePosts.map(p => [p.lat, p.lng] as [number, number]),
                  color: '#22c55e'
                }] : []}
              />
            </div>
          </div>

          {fencePosts.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUndoPost}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200"
              >
                Undo Last Post
              </button>
              <button
                type="button"
                onClick={handleClearPosts}
                className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
              >
                Clear All Posts
              </button>
            </div>
          )}

          {fencePosts.length > 0 && fencePosts.length < 3 && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
              ⚠️ Place at least {3 - fencePosts.length} more post{3 - fencePosts.length > 1 ? 's' : ''} to create a field
            </div>
          )}

          {fencePosts.length >= 3 && (
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
              ✓ Field boundary ready! You can add more posts or save now.
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Create Field
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFieldModal({ farmId, field, onClose, onSave }: any) {
  const [name, setName] = useState(field.name)
  const [sheepCount, setSheepCount] = useState(field.sheepCount?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter field name')
      return
    }

    onSave(farmId, field.id, {
      name: name.trim(),
      sheepCount: sheepCount ? parseInt(sheepCount) : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Edit Field</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Field Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sheep Count</label>
            <input
              type="number"
              value={sheepCount}
              onChange={(e) => setSheepCount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="150"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClaimReportModal({ reportId, report, farmers, onClose, onClaim }: any) {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmerId) {
      alert('Please select a farmer')
      return
    }
    onClaim(reportId, selectedFarmerId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Claim Report for Farmer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <div className="font-medium text-slate-800 mb-2">Report Details</div>
          <div className="text-sm text-slate-600 space-y-1">
            <div>{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'} ({report.condition})</div>
            <div>📅 {new Date(report.timestamp).toLocaleString()}</div>
            {report.description && <div>📝 {report.description}</div>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Farmer *</label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Choose farmer...</option>
              {farmers.map((farmer: any) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.full_name || farmer.name || farmer.email} ({farmer.email || 'No email'})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            💡 This will mark the report as "claimed" and notify the walker that a farmer is responding.
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Claim Report</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoryFormModal({ category, onClose, onSave }: {
  category?: any
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [emoji, setEmoji] = useState(category?.emoji || '📋')
  const [description, setDescription] = useState(category?.description || '')
  const [conditions, setConditions] = useState<string[]>(category?.conditions || [])
  const [newCondition, setNewCondition] = useState('')
  const [showCount, setShowCount] = useState(category?.showCount ?? true)
  const [countLabel, setCountLabel] = useState(category?.countLabel || 'Quantity')
  const [isActive, setIsActive] = useState(category?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0)
  const [subscriptionMode, setSubscriptionMode] = useState<'compulsory' | 'default_on' | 'default_off'>(category?.subscriptionMode || 'default_off')
  const [imageUrl, setImageUrl] = useState<string>(category?.imageUrl || '')

  const addCondition = () => {
    const trimmed = newCondition.trim()
    if (trimmed && !conditions.includes(trimmed)) {
      setConditions([...conditions, trimmed])
      setNewCondition('')
    }
  }

  const removeCondition = (c: string) => setConditions(conditions.filter(x => x !== c))

  const handleSave = () => {
    if (!name.trim()) { alert('Name is required'); return }
    if (conditions.length === 0) { alert('Add at least one condition option'); return }
    onSave({ name: name.trim(), emoji, description: description.trim(), conditions, showCount, countLabel, isActive, sortOrder: Number(sortOrder), subscriptionMode, imageUrl: imageUrl || undefined })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{category ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category Icon</label>
            <CategoryImageUploader
              currentImageUrl={imageUrl || undefined}
              onUploaded={(url) => setImageUrl(url)}
              onClear={() => setImageUrl('')}
            />
            {!imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1.5">Or use an emoji instead:</p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-center text-2xl"
                    maxLength={2}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {['🐑','🐄','🐖','🐎','🐏','🐐','🐓','🦆','🦅','🦉','🐇','🦊','🦡','🐿️','🌾','🌿','🍀','🌱','🌲','🌳','🌴','🪨','🪵','🪹','🏡','🏠','🏚️','🚜','🚛','🛻','⛏️','🔨','🪚','🪛','⚙️','🪜','🧱','🪟','🚪','🔒','🔓','🪝','🧲','🪤','🌄','🌅','🌦️','🌧️','⛅','🌫️','🛤️','🛣️','🏞️','⛰️','🌁','🌊','💧','🍂','🍁','🌸','🌼','🌻','🥕','🌽','🍄','🌰','⚠️','🔴','🟡'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`text-xl p-1 rounded hover:bg-slate-100 transition-colors ${emoji === e ? 'bg-green-100 ring-2 ring-green-400' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fence, Wall, Road"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for walkers"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Condition options *</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {conditions.map((c) => (
                <span key={c} className="flex items-center gap-1 bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full">
                  {c}
                  <button onClick={() => removeCondition(c)} className="text-green-500 hover:text-green-700 leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                placeholder="e.g. Damaged, Collapsed..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showCount} onChange={(e) => setShowCount(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Ask for quantity</span>
            </label>
          </div>

          {showCount && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity label</label>
              <input
                type="text"
                value={countLabel}
                onChange={(e) => setCountLabel(e.target.value)}
                placeholder="e.g. Number of animals, Number of sections"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Active (visible to walkers)</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Farmer Notification Mode</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input type="radio" name="subscriptionMode" value="default_off" checked={subscriptionMode === 'default_off'} onChange={() => setSubscriptionMode('default_off')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Optional</div>
                  <div className="text-xs text-slate-500">Walkers can log it. Farmers must actively opt in to receive alerts.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100">
                <input type="radio" name="subscriptionMode" value="default_on" checked={subscriptionMode === 'default_on'} onChange={() => setSubscriptionMode('default_on')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-700">Default On</div>
                  <div className="text-xs text-blue-600">All farmers are notified by default. They can choose to opt out.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 cursor-pointer hover:bg-red-100">
                <input type="radio" name="subscriptionMode" value="compulsory" checked={subscriptionMode === 'compulsory'} onChange={() => setSubscriptionMode('compulsory')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-700">Compulsory</div>
                  <div className="text-xs text-red-600">All farmers receive alerts. Cannot be turned off.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            {category ? 'Save Changes' : 'Create Category'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

// ─── User Detail / Edit Modal ───────────────────────────────────────────────
function UserDetailModal({ user, reports, farms, onClose, onUpdate, onReset, onSuspend, onActivate, onNavigate }: {
  user: any
  reports: any[]
  farms: any[]
  onClose: () => void
  onUpdate: (id: string, updates: any) => Promise<boolean>
  onReset: (id: string, email: string) => void
  onSuspend: (id: string) => void
  onActivate: (id: string) => void
  onNavigate: (view: 'reports' | 'farms') => void
}) {
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user.full_name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [saving, setSaving] = useState(false)

  const userReports = reports.filter((r: any) => r.reporterId === user.id)
  const userFarms = farms.filter((f: any) => f.farmerId === user.id)

  const roleLabel: Record<string, string> = {
    walker: '🚶 Walker',
    farmer: '🧑‍🌾 Farmer',
    admin: '🛡️ Admin',
    super_admin: '⭐ Super Admin',
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await onUpdate(user.id, { full_name: fullName || null, phone: phone || null })
    setSaving(false)
    if (ok) setEditing(false)
  }

  const handleCancel = () => {
    setFullName(user.full_name || '')
    setPhone(user.phone || '')
    setEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user.full_name || user.email || 'User'}</h3>
            <p className="text-sm text-slate-500">{roleLabel[user.role] || user.role}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Details / Edit form */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Email</p>
                  <p className="font-medium text-slate-800 break-all">{user.email || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Full Name</p>
                  <p className="font-medium text-slate-800">{user.full_name || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-medium text-slate-800">{user.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Status</p>
                  <p className="font-medium text-slate-800 capitalize">{user.status?.replace(/_/g, ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Last Login</p>
                  <p className="font-medium text-slate-800">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Member Since</p>
                  <p className="font-medium text-slate-800">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                </div>
                {(user.role === 'walker') && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Reports Submitted</p>
                    <p className="font-medium text-slate-800">{userReports.length}</p>
                  </div>
                )}
                {(user.role === 'farmer') && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Farms</p>
                    <p className="font-medium text-slate-800">{userFarms.length}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 text-sm"
              >
                ✏️ Edit Details
              </button>
            </div>
          )}

          {/* Recent reports (walkers) */}
          {user.role === 'walker' && !editing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Reports ({userReports.length})
                </p>
                <button
                  onClick={() => onNavigate('reports')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all in Reports tab →
                </button>
              </div>
              {userReports.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No reports submitted yet</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {userReports.slice(0, 10).map((r: any) => (
                    <button
                      key={r.id}
                      onClick={() => onNavigate('reports')}
                      className="w-full flex items-center justify-between text-sm bg-slate-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors text-left group"
                    >
                      <span className="text-slate-700 group-hover:text-blue-700">
                        {r.categoryEmoji || '🐑'} {r.sheepCount || 1} × {r.categoryName || 'Sheep'} — <span className="capitalize">{r.condition}</span>
                      </span>
                      <span className="text-slate-400 text-xs group-hover:text-blue-500 flex items-center gap-1">
                        {new Date(r.timestamp).toLocaleDateString()} <span>→</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Farms (farmers) */}
          {user.role === 'farmer' && !editing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Farms ({userFarms.length})
                </p>
                <button
                  onClick={() => onNavigate('farms')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all in Farms tab →
                </button>
              </div>
              {userFarms.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No farms registered yet</p>
              ) : (
                <div className="space-y-1">
                  {userFarms.map((f: any) => (
                    <button
                      key={f.id}
                      onClick={() => onNavigate('farms')}
                      className="w-full flex items-center justify-between text-sm bg-slate-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors text-left group"
                    >
                      <span className="text-slate-700 group-hover:text-blue-700">🏡 {f.name}</span>
                      <span className="text-slate-400 text-xs group-hover:text-blue-500 flex items-center gap-1">
                        {f.fields?.length || 0} field(s) <span>→</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          {!editing && (
            <div className="border-t pt-4 flex flex-wrap gap-2">
              {user.status === 'active' ? (
                <button onClick={() => onSuspend(user.id)} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200">
                  Suspend Account
                </button>
              ) : (
                <button onClick={() => onActivate(user.id)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                  Activate Account
                </button>
              )}
              {user.email && (
                <button onClick={() => onReset(user.id, user.email)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                  Send Password Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
