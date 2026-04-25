'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore, getDaysSince, MAP_CONFIG, isReportNearFarm } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'
import Header from './Header'
import Map from './Map'
import AdminUserManagement from './AdminUserManagement'
import WalkerDashboard from './WalkerDashboard'
import ProfileDrawer from './ProfileDrawer'
import CategoryImageUploader from './CategoryImageUploader'
import { inviteUser, getAllUsers, adminResetUserPassword, updateUserProfile, deleteUser as deleteUserFromSupabase, suspendUser as suspendUserInSupabase, activateUser as activateUserInSupabase } from '@/lib/unified-auth'
import { fetchAuditLogs, writeAuditLog } from '@/lib/audit'
import { fetchNotificationsForReport, approveReportScreening, updateReport as updateReportInDB, fetchReportComments, sendThankYouMessage, type ReportComment } from '@/lib/supabase-client'
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
    unclaimReportForFarmer,
    reassignReport,
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
    addAdminComment,
  } = useAppStore()

  const [currentView, setCurrentView] = useState<AdminView>('overview')
  const [showReportMode, setShowReportMode] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
  const [showReassignReportModal, setShowReassignReportModal] = useState<string | null>(null) // reportId
  const [showFarmDetailsModal, setShowFarmDetailsModal] = useState<string | null>(null) // farmId
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
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

  // Report filters, sorting, and pagination
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterArchive, setFilterArchive] = useState<FilterArchive>('active')
  const [filterFarmerId, setFilterFarmerId] = useState<string>('all')
  const [filterFarmId, setFilterFarmId] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [reportsPerPage, setReportsPerPage] = useState<number>(10)
  const [reportsPage, setReportsPage] = useState<number>(1)
  const [detailReportId, setDetailReportId] = useState<string | null>(null)
  const [detailNotifications, setDetailNotifications] = useState<any[]>([])
  const [detailAuditLogs, setDetailAuditLogs] = useState<any[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailComments, setDetailComments] = useState<ReportComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingDetailReport, setEditingDetailReport] = useState(false)
  const [detailEditFields, setDetailEditFields] = useState<{ description: string; sheepCount: number; conditions: string[]; photoUrls: string[] }>({ description: '', sheepCount: 1, conditions: [], photoUrls: [] })
  const [savingDetailEdit, setSavingDetailEdit] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  // Thank You modal (admin → walker on behalf of farmer)
  const [thankYouReportId, setThankYouReportId] = useState<string | null>(null)
  const [thankYouText, setThankYouText] = useState('')
  const [thankYouSenderId, setThankYouSenderId] = useState<string>('')
  const [sendingThankYou, setSendingThankYou] = useState(false)
  const [thankYouSent, setThankYouSent] = useState<Set<string>>(new Set())
  // Resolve-with-message modal
  const [resolveMessageReportId, setResolveMessageReportId] = useState<string | null>(null)
  const [resolveMessageText, setResolveMessageText] = useState('')
  const [sendingResolve, setSendingResolve] = useState(false)
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
  }, [reports, filterStatus, filterArchive, sortBy, filterFarmerId, filterFarmId, farms, filterDateFrom, filterDateTo, filterKeyword])

  // Reset to page 1 whenever filters change
  useEffect(() => { setReportsPage(1) }, [filterStatus, filterArchive, sortBy, filterFarmerId, filterFarmId, filterDateFrom, filterDateTo, filterKeyword])

  // Pagination
  const totalReportPages = reportsPerPage === 0 ? 1 : Math.max(1, Math.ceil(filteredReports.length / reportsPerPage))
  const paginatedReports = reportsPerPage === 0 ? filteredReports : filteredReports.slice((reportsPage - 1) * reportsPerPage, reportsPage * reportsPerPage)

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
      setDetailComments([])
      setNewComment('')
      const [logs, notifs, comments] = await Promise.all([
        fetchAuditLogs({ entityId: reportId }),
        fetchNotificationsForReport(reportId),
        fetchReportComments(reportId),
      ])
      setDetailAuditLogs(logs)
      setDetailNotifications(notifs)
      setDetailComments(comments)
    } catch {
      setDetailAuditLogs([])
      setDetailNotifications([])
      setDetailComments([])
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

  const handleAddComment = async (reportId: string) => {
    const body = newComment.trim()
    if (!body) return
    setSubmittingComment(true)
    try {
      await addAdminComment(reportId, body)
      setNewComment('')
      const updated = await fetchReportComments(reportId)
      setDetailComments(updated)
    } catch {
      // leave text in box on failure
    }
    setSubmittingComment(false)
  }

  const handleSelectAllReports = () => {
    const pageIds = paginatedReports.map(r => r.id)
    const allPageSelected = pageIds.every(id => selectedReports.includes(id))
    if (allPageSelected) {
      setSelectedReports(prev => prev.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedReports(prev => [...new Set([...prev, ...pageIds])])
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
    let colorClass = 'bg-[#9ED663]/20 text-[#614270]'
    if (days >= 7) colorClass = 'bg-[#FA9335]/10 text-[#FA9335]'
    else if (days >= 3) colorClass = 'bg-[#EADA69]/20 text-[#614270]'
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {days}d Unclaimed
      </span>
    )
  }

  const getSubscriptionBadge = (user: typeof users[0]) => {
    const status = user.subscriptionStatus
    if (!status) return <span className="px-2 py-1 rounded text-xs bg-[#D1D9C5] text-[#92998B]">No sub</span>
    const colors = {
      trial: 'bg-[#7D8DCC]/10 text-[#7D8DCC]',
      active: 'bg-[#9ED663]/20 text-[#614270]',
      cancelled: 'bg-[#FA9335]/10 text-[#FA9335]',
      expired: 'bg-[#D1D9C5] text-[#92998B]'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{status}</span>
  }

  // ── Export helpers ────────────────────────────────────────────────────────
  const loadScript = (src: string): Promise<void> =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
      const s = document.createElement('script')
      s.src = src; s.onload = () => resolve(); s.onerror = reject
      document.head.appendChild(s)
    })

  const generateMapCanvas = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const zoom = 15
      const n = Math.pow(2, zoom)
      const cx = Math.floor((lng + 180) / 360 * n)
      const latRad = lat * Math.PI / 180
      const cy = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
      const canvas = document.createElement('canvas')
      canvas.width = 512; canvas.height = 512
      const ctx = canvas.getContext('2d')!
      const subs = ['a', 'b', 'c']
      const tilePx = 256
      await Promise.all(
        [-1, 0, 1].flatMap(dy =>
          [-1, 0, 1].map(dx =>
            new Promise<void>(res => {
              const img = new Image(); img.crossOrigin = 'anonymous'
              img.onload = () => { ctx.drawImage(img, (dx + 1) * tilePx - tilePx / 2, (dy + 1) * tilePx - tilePx / 2, tilePx, tilePx); res() }
              img.onerror = () => res()
              img.src = `https://${subs[((cx + dx + cy + dy) % 3 + 3) % 3]}.tile.openstreetmap.org/${zoom}/${cx + dx}/${cy + dy}.png`
            })
          )
        )
      )
      ctx.beginPath(); ctx.arc(256, 256, 9, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
      return canvas.toDataURL('image/png')
    } catch { return null }
  }

  const reportsToExport = selectedReports.length > 0
    ? filteredReports.filter(r => selectedReports.includes(r.id))
    : filteredReports

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Category', 'Status', 'Lat', 'Lng', 'Count', 'Conditions', 'Description', 'Reporter', 'Map URL', 'Photo 1', 'Photo 2', 'Photo 3']
    const rows = reportsToExport.map(r => [
      r.id,
      new Date(r.timestamp).toISOString(),
      `${r.categoryEmoji || ''} ${r.categoryName || 'Sheep'}`.trim(),
      r.status,
      r.location.lat,
      r.location.lng,
      r.sheepCount,
      (r.conditions || []).join('; '),
      r.description || '',
      r.submittedByUserName || r.reporterContact || '',
      r.mapSnapshotUrl || `https://www.openstreetmap.org/?mlat=${r.location.lat}&mlon=${r.location.lng}&zoom=15`,
      r.photoUrls?.[0] || '',
      r.photoUrls?.[1] || '',
      r.photoUrls?.[2] || '',
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `lbp-reports-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleExportXLSX = async () => {
    setExportLoading(true)
    try {
      await loadScript('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js')
      const XLSX = (window as any).XLSX
      const data = reportsToExport.map(r => ({
        'ID': r.id,
        'Date': new Date(r.timestamp).toLocaleString(),
        'Category': `${r.categoryEmoji || ''} ${r.categoryName || 'Sheep'}`.trim(),
        'Status': r.status,
        'Latitude': r.location.lat,
        'Longitude': r.location.lng,
        'Count': r.sheepCount,
        'Conditions': (r.conditions || []).join(', '),
        'Description': r.description || '',
        'Reporter': r.submittedByUserName || r.reporterContact || '',
        'Map URL': r.mapSnapshotUrl || `https://www.openstreetmap.org/?mlat=${r.location.lat}&mlon=${r.location.lng}&zoom=15`,
        'Photo 1': r.photoUrls?.[0] || '',
        'Photo 2': r.photoUrls?.[1] || '',
        'Photo 3': r.photoUrls?.[2] || '',
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Reports')
      XLSX.writeFile(wb, `lbp-reports-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (e) {
      alert('Export failed — check your network connection and try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setExportLoading(true)
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')
      const { jsPDF } = (window as any).jspdf
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      doc.setFontSize(16)
      doc.text('Little Bo Peep — Report Export', 14, 14)
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleString()}  |  ${reportsToExport.length} reports`, 14, 21)
      ;(doc as any).autoTable({
        startY: 26,
        head: [['ID', 'Date', 'Category', 'Status', 'Count', 'Lat / Lng', 'Description']],
        body: reportsToExport.map(r => [
          r.id.slice(0, 8) + '…',
          new Date(r.timestamp).toLocaleDateString(),
          `${r.categoryEmoji || ''} ${r.categoryName || 'Sheep'}`.trim(),
          r.status,
          r.sheepCount,
          `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}`,
          (r.description || '').slice(0, 50),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [97, 66, 112] },
      })
      for (const r of reportsToExport.slice(0, 30)) {
        doc.addPage()
        let y = 14
        doc.setFontSize(11); doc.text(`Report ${r.id.slice(0, 12)}…`, 14, y); y += 7
        doc.setFontSize(8)
        const lines = [
          `Date: ${new Date(r.timestamp).toLocaleString()}`,
          `Category: ${r.categoryEmoji || ''} ${r.categoryName || 'Sheep'}  |  Status: ${r.status}  |  Count: ${r.sheepCount}`,
          `Location: ${r.location.lat.toFixed(5)}, ${r.location.lng.toFixed(5)}`,
          ...(r.conditions?.length ? [`Conditions: ${r.conditions.join(', ')}`] : []),
          ...(r.description ? [`Description: ${r.description}`] : []),
          ...(r.submittedByUserName || r.reporterContact ? [`Reporter: ${r.submittedByUserName || r.reporterContact}`] : []),
        ]
        lines.forEach(l => { doc.text(l, 14, y); y += 5 })
        y += 3
        const mapImg = await generateMapCanvas(r.location.lat, r.location.lng)
        if (mapImg) { doc.addImage(mapImg, 'PNG', 14, y, 80, 80) }
        let photoX = 100
        for (const photoUrl of (r.photoUrls || []).slice(0, 3)) {
          try {
            const resp = await fetch(photoUrl)
            const blob = await resp.blob()
            const dataUrl = await new Promise<string>(res => {
              const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.readAsDataURL(blob)
            })
            doc.addImage(dataUrl, 'JPEG', photoX, y, 60, 60)
            photoX += 65
          } catch { /* skip */ }
        }
      }
      doc.save(`lbp-reports-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      alert('Export failed — check your network connection and try again.')
    } finally {
      setExportLoading(false)
    }
  }
  // ── End export helpers ────────────────────────────────────────────────────

  const NavButton = ({ view, label, count }: { view: AdminView; label: string; count?: number }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        currentView === view ? 'bg-[#614270] text-white' : 'bg-white text-[#614270] hover:bg-[#D1D9C5]'
      }`}
    >
      {label} {count !== undefined && <span className="ml-1 text-sm opacity-70">({count})</span>}
    </button>
  )

  const allFieldPolygons = farms.flatMap(farm => 
    farm.fields.map(field => ({
      id: field.id,
      positions: field.fencePosts.map(p => [p.lat, p.lng] as [number, number]),
      color: '#9ED663'
    }))
  )

  return (
    <div className="min-h-screen bg-white">
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
                <h2 className="font-bold text-[#614270]">Report Detail</h2>
                <button onClick={() => { setDetailReportId(null); setEditingDetailReport(false); setDetailComments([]); setNewComment('') }} className="text-[#92998B] hover:text-[#614270] text-2xl leading-none">×</button>
              </div>
              <div className="p-4 space-y-5 flex-1">
                {loadingDetail ? (
                  <div className="text-center text-[#92998B] py-8">Loading…</div>
                ) : (
                  <>
                    {/* Identity */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Submitter</h3>
                      <div className="bg-[#D1D9C5] rounded-lg p-3 text-sm space-y-1">
                        <div><span className="text-[#92998B]">Name:</span> <span className="font-medium">{report.submittedByUserName || <span className="text-[#FA9335] italic">Unknown</span>}</span></div>
                        <div><span className="text-[#92998B]">Role:</span> <span className="font-medium capitalize">{report.roleOfSubmitter || '—'}</span></div>
                        <div><span className="text-[#92998B]">Reporter ID:</span> <span className="font-mono text-xs text-[#92998B]">{report.reporterId || '—'}</span></div>
                      </div>
                    </section>

                    {/* Category & Content */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Report</h3>
                      <div className="bg-[#D1D9C5] rounded-lg p-3 text-sm space-y-1">
                        <div><span className="text-[#92998B]">Report ID:</span> <span className="font-mono text-xs text-[#614270]">{report.id.length > 8 ? report.id.slice(0, 8).toUpperCase() : report.id}</span></div>
                        <div className="text-2xl">{report.categoryEmoji} <span className="text-base font-medium">{report.categoryName}</span></div>
                        <div><span className="text-[#92998B]">Count:</span> {report.sheepCount}</div>
                        <div><span className="text-[#92998B]">Condition:</span> {report.condition}</div>
                        <div><span className="text-[#92998B]">Status:</span> <span className={`font-medium ${report.status === 'reported' ? 'text-[#614270]' : report.status === 'claimed' ? 'text-[#7D8DCC]' : 'text-[#9ED663]'}`}>{{ reported: 'Reported', claimed: 'Claimed', resolved: 'Resolved', escalated: 'Escalated', complete: 'Complete' }[report.status] || report.status}</span></div>
                        <div><span className="text-[#92998B]">Submitted:</span> {new Date(report.timestamp).toLocaleString('en-GB')}</div>
                        {report.description && <div><span className="text-[#92998B]">Description:</span> {report.description}</div>}
                      </div>
                    </section>

                    {/* Claimants */}
                    {(report.claimedByFarmerIds?.length ?? 0) > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Claimed By ({report.claimedByFarmerIds!.length})</h3>
                        <div className="space-y-1">
                          {report.claimedByFarmerIds!.map(fid => {
                            const farmer = allUsers.find((u: any) => u.id === fid)
                            return (
                              <div key={fid} className="flex items-center justify-between bg-[#7D8DCC]/10 rounded-lg px-3 py-2 text-sm">
                                <span className="text-[#614270] font-medium">🧑‍🌾 {farmer?.full_name || farmer?.email || fid.slice(0, 8)}</span>
                                <button
                                  onClick={() => unclaimReportForFarmer(report.id, fid)}
                                  className="text-xs text-[#FA9335] hover:text-[#e07820] font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )}

                    {/* GPS Location */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">GPS Location</h3>
                      <div className="bg-[#D1D9C5] rounded-lg p-3 text-sm mb-2">
                        <div>{report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}</div>
                        {report.locationAccuracy && <div className="text-[#92998B] text-xs">Accuracy: ±{report.locationAccuracy}m</div>}
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
                        <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Photos</h3>
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
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Affected Farms ({affectedFarms.length})</h3>
                      {affectedFarms.length === 0 ? (
                        <div className="text-sm text-[#92998B] italic">No farms within alert range of this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {affectedFarms.map((farm: any) => {
                            const owner = allUsers.find((u: any) => u.id === farm.farmerId)
                            return (
                              <div key={farm.id} className="bg-[#EADA69]/20 rounded-lg p-3 text-sm">
                                <div className="font-medium">🏡 {farm.name}</div>
                                {owner && <div className="text-[#92998B] text-xs">Owner: {owner.full_name || owner.email}</div>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>

                    {/* Affected Farmers */}
                    {affectedFarmerUsers.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Notified Farmers</h3>
                        <div className="space-y-1">
                          {affectedFarmerUsers.map((u: any) => (
                            <div key={u.id} className="bg-[#9ED663]/10 rounded-lg p-3 text-sm">
                              <div className="font-medium">🧑‍🌾 {u.full_name || u.email}</div>
                              <div className="text-[#92998B] text-xs">{u.email}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Notification History */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Notification History ({detailNotifications.length})</h3>
                      {detailNotifications.length === 0 ? (
                        <div className="text-sm text-[#92998B] italic">No notifications sent for this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {detailNotifications.map((n: any) => {
                            const recipient = allUsers.find((u: any) => u.id === n.user_id)
                            return (
                              <div key={n.id} className="bg-[#D1D9C5] rounded-lg p-3 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${n.type === 'thank_you' ? 'text-[#614270]' : 'text-[#7D8DCC]'}`}>
                                    {n.type === 'thank_you' ? '💌 Thank You' : n.type === 'new_report' ? '🔔 New report alert' : n.type}
                                  </span>
                                  <span className="text-xs text-[#92998B]">{new Date(n.sent_at).toLocaleString('en-GB')}</span>
                                </div>
                                <div className="text-xs text-[#92998B] mt-0.5">
                                  To: {recipient?.full_name || recipient?.email || n.user_id}
                                  {n.read_at ? <span className="ml-2 text-[#9ED663]">✓ Read {new Date(n.read_at).toLocaleDateString('en-GB')}</span> : <span className="ml-2 text-[#92998B]">Unread</span>}
                                </div>
                                {n.message_text && <div className="text-xs text-[#614270] mt-1 italic">&ldquo;{n.message_text}&rdquo;</div>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>

                    {/* Action History */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Action History ({detailAuditLogs.length})</h3>
                      {detailAuditLogs.length === 0 ? (
                        <div className="text-sm text-[#92998B] italic">No audit log entries for this report.</div>
                      ) : (
                        <div className="space-y-1">
                          {detailAuditLogs.map((log: any) => (
                            <div key={log.id} className="bg-[#D1D9C5] rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-indigo-700 font-medium">{log.action}</span>
                                <span className="text-xs text-[#92998B]">{new Date(log.created_at).toLocaleString('en-GB')}</span>
                              </div>
                              <div className="text-[#92998B] text-xs mt-0.5">{log.actor_email || log.actor_id}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Comments */}
                    <section>
                      <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">Comments ({detailComments.length})</h3>
                      <div className="space-y-2 mb-3">
                        {detailComments.length === 0 && (
                          <div className="text-sm text-[#92998B] italic">No comments yet.</div>
                        )}
                        {detailComments.map((c) => (
                          <div key={c.id} className={`rounded-lg p-3 text-sm ${c.commentType === 'system' ? 'bg-[#D1D9C5] border-l-2 border-[#92998B]' : 'bg-[#7D8DCC]/10 border-l-2 border-[#7D8DCC]'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${c.commentType === 'system' ? 'text-[#92998B]' : 'text-[#7D8DCC]'}`}>
                                {c.commentType === 'system' ? '⚙️ System' : `💬 ${c.authorEmail || 'Admin'}`}
                              </span>
                              <span className="text-xs text-[#92998B]">{c.createdAt.toLocaleString('en-GB')}</span>
                            </div>
                            <p className="text-[#614270]">{c.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment…"
                          rows={2}
                          className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7D8DCC]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault()
                              if (detailReportId) handleAddComment(detailReportId)
                            }
                          }}
                        />
                        <button
                          onClick={() => detailReportId && handleAddComment(detailReportId)}
                          disabled={!newComment.trim() || submittingComment}
                          className="px-3 py-2 bg-[#614270] text-white rounded-lg text-sm hover:bg-[#4e3359] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submittingComment ? 'Saving…' : 'Add Comment'}
                        </button>
                      </div>
                    </section>

                    {/* Admin Edit Report */}
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-[#92998B] uppercase tracking-wide">Edit Report</h3>
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
                            className="text-xs px-3 py-1 bg-[#D1D9C5] text-[#614270] rounded-lg hover:bg-[#D1D9C5]"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                      {editingDetailReport && (
                        <div className="bg-[#D1D9C5] rounded-xl p-4 space-y-4 border border-[#D1D9C5]">
                          {report.reporterId && report.reporterId !== currentUserId && (
                            <div className="text-xs bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-lg p-2 text-[#614270]">
                              ⚠️ You are editing a report submitted by another user. Changes will be logged in the audit trail.
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">Quantity</label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setDetailEditFields(f => ({ ...f, sheepCount: Math.max(1, f.sheepCount - 1) }))}
                                className="w-9 h-9 rounded-lg bg-white border border-[#D1D9C5] font-bold text-lg flex items-center justify-center">−</button>
                              <input type="number" min="1" value={detailEditFields.sheepCount}
                                onChange={e => setDetailEditFields(f => ({ ...f, sheepCount: parseInt(e.target.value) || 1 }))}
                                className="w-16 text-center px-2 py-1 border border-[#D1D9C5] rounded-lg text-base font-semibold" />
                              <button type="button" onClick={() => setDetailEditFields(f => ({ ...f, sheepCount: f.sheepCount + 1 }))}
                                className="w-9 h-9 rounded-lg bg-white border border-[#D1D9C5] font-bold text-lg flex items-center justify-center">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">Conditions</label>
                            <div className="flex flex-wrap gap-2">
                              {(reportCategories.find(c => c.id === report.categoryId)?.conditions || ['Healthy','Injured','Dead','In road','Lost / straying','Not sure']).map(opt => {
                                const sel = detailEditFields.conditions.includes(opt)
                                return (
                                  <button key={opt} type="button"
                                    onClick={() => setDetailEditFields(f => ({
                                      ...f,
                                      conditions: sel ? f.conditions.filter(c => c !== opt) : [...f.conditions, opt]
                                    }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${sel ? 'bg-[#7D8DCC] text-white border-[#7D8DCC]' : 'bg-white text-[#614270] border-[#D1D9C5]'}`}
                                  >{opt}</button>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">Details</label>
                            <textarea value={detailEditFields.description}
                              onChange={e => setDetailEditFields(f => ({ ...f, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC]" />
                          </div>
                          {detailEditFields.photoUrls.length > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-[#614270] mb-1">Current Photos</label>
                              <div className="grid grid-cols-3 gap-2">
                                {detailEditFields.photoUrls.map((url, i) => (
                                  <div key={url} className="relative group">
                                    <img src={url} alt={`Photo ${i + 1}`} className="rounded-lg object-cover w-full h-24" />
                                    <button
                                      type="button"
                                      onClick={() => setDetailEditFields(f => ({ ...f, photoUrls: f.photoUrls.filter(u => u !== url) }))}
                                      className="absolute top-1 right-1 w-6 h-6 bg-[#FA9335] text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove photo"
                                    >×</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-[#614270] mb-1">Add Photos</label>
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
                                  const removedPhotos = (report.photoUrls || []).filter(u => !detailEditFields.photoUrls.includes(u))
                                  await updateReportInDB(report.id, {
                                    description: detailEditFields.description,
                                    sheepCount: detailEditFields.sheepCount,
                                    conditions,
                                    condition,
                                    photoUrls: detailEditFields.photoUrls,
                                  })
                                  const currentAdminEmail = allUsers.find((u: any) => u.id === currentUserId)?.email
                                  for (const url of removedPhotos) {
                                    await writeAuditLog({
                                      actorId: currentUserId,
                                      actorEmail: currentAdminEmail,
                                      action: 'report.photo_delete',
                                      entityType: 'report',
                                      entityId: report.id,
                                      detail: { photoUrl: url },
                                    })
                                  }
                                  await loadReports()
                                  setEditingDetailReport(false)
                                } finally {
                                  setSavingDetailEdit(false)
                                }
                              }}
                              disabled={savingDetailEdit}
                              className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-xl text-sm font-semibold hover:bg-[#6b7db3] disabled:opacity-50"
                            >
                              {savingDetailEdit ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              onClick={() => setEditingDetailReport(false)}
                              className="px-4 py-2 bg-[#D1D9C5] text-[#614270] rounded-xl text-sm hover:bg-[#D1D9C5]"
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
                        <div className="bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-lg p-3 mb-3 text-sm">
                          <div className="font-medium text-[#FA9335] mb-1">⚠️ Pending Screening Review</div>
                          <div className="text-[#FA9335] text-xs mb-2">This report was flagged for admin review before being visible to farmers.</div>
                          <button onClick={() => { approveReportScreening(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-[#63BD8F] text-white rounded-lg text-sm hover:bg-[#52a87d] font-medium">Approve &amp; Publish</button>
                        </div>
                      )}
                      {report.flaggedByFarmer && report.status !== 'complete' && (
                        <div className="bg-[#EADA69]/20 border border-[#EADA69]/40 rounded-lg p-3 mb-3 text-sm">
                          <div className="font-medium text-[#614270] mb-1">🚩 Flagged by Farmer</div>
                          {report.farmerFlagNote && <div className="text-[#614270] italic text-xs mb-1">&ldquo;{report.farmerFlagNote}&rdquo;</div>}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {!report.archived && report.status === 'reported' && !report.screeningRequired && (
                          <button onClick={() => setShowClaimReportModal(report.id)} className="px-3 py-2 bg-[#9ED663]/20 text-[#614270] rounded-lg text-sm hover:bg-[#9ED663]/30">Claim for Farmer</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => setShowClaimReportModal(report.id)} className="px-3 py-2 bg-[#9ED663]/20 text-[#614270] rounded-lg text-sm hover:bg-[#9ED663]/30">Add Farmer</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => setShowReassignReportModal(report.id)} className="px-3 py-2 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded-lg text-sm hover:bg-[#7D8DCC]/20">Reassign</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (report.claimedByFarmerIds?.length ?? 0) > 0 && (
                          <button
                            onClick={() => {
                              if (confirm('Remove all farmers from this report and set status back to Reported?')) {
                                report.claimedByFarmerIds!.forEach(fid => unclaimReportForFarmer(report.id, fid))
                              }
                            }}
                            className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20"
                          >Unclaim All</button>
                        )}
                        {report.reporterId && !['reported'].includes(report.status) && !report.archived && !thankYouSent.has(report.id) && (
                          <button
                            onClick={() => {
                              const firstClaimant = report.claimedByFarmerIds?.[0] ?? ''
                              setThankYouSenderId(firstClaimant)
                              setThankYouReportId(report.id)
                              setThankYouText('')
                            }}
                            className="px-3 py-2 bg-[#EADA69]/20 text-[#614270] rounded-lg text-sm hover:bg-[#EADA69]/40"
                          >💌 Thank Walker</button>
                        )}
                        {thankYouSent.has(report.id) && (
                          <span className="px-3 py-2 text-[#9ED663] text-sm font-medium">✓ Thanks Sent</span>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => { setResolveMessageReportId(report.id); setResolveMessageText('') }} className="px-3 py-2 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded-lg text-sm hover:bg-[#7D8DCC]/20">Resolve</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { escalateReport(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20">Escalate</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { setCompleteReportId(report.id); setCompleteNotes(''); setDetailReportId(null) }} className="px-3 py-2 bg-[#614270] text-white rounded-lg text-sm hover:bg-[#4e3359]">Mark Complete</button>
                        )}
                        {!report.archived && (
                          <button onClick={() => { archiveReport(report.id); setDetailReportId(null) }} className="px-3 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#D1D9C5]">Archive</button>
                        )}
                        <button onClick={() => { confirmDelete(report.id, 'report'); setDetailReportId(null) }} className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20">Delete</button>
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
              <h3 className="text-lg font-bold text-[#614270]">Mark Report Complete</h3>
              <p className="text-sm text-[#92998B] mt-1">Optionally add admin notes before closing this report.</p>
            </div>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Admin notes (optional)…"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#7D8DCC]"
            />
            <div className="space-y-3">
              <button
                onClick={() => { markReportComplete(completeReportId, completeNotes || undefined); setCompleteReportId(null); setCompleteNotes('') }}
                className="w-full py-3 bg-[#614270] text-white rounded-xl font-semibold hover:bg-[#4e3359]"
              >
                Mark Complete
              </button>
              <button onClick={() => { setCompleteReportId(null); setCompleteNotes('') }} className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Thank Walker Modal */}
      {thankYouReportId && (() => {
        const tyReport = reports.find(r => r.id === thankYouReportId)
        const claimants = (tyReport?.claimedByFarmerIds ?? [])
          .map(fid => allUsers.find((u: any) => u.id === fid))
          .filter(Boolean) as any[]
        const senderUser = thankYouSenderId
          ? allUsers.find((u: any) => u.id === thankYouSenderId)
          : null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-[#614270] mb-1">💌 Thank the Walker</h3>
              <p className="text-sm text-[#92998B] mb-3">Send a thank you message to the walker who filed this report.</p>
              {/* Sender selection */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-1">Send on behalf of</label>
                <select
                  value={thankYouSenderId}
                  onChange={e => setThankYouSenderId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D8DCC]"
                >
                  <option value="">Admin (me)</option>
                  {claimants.map((u: any) => (
                    <option key={u.id} value={u.id}>🧑‍🌾 {u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={thankYouText}
                onChange={(e) => setThankYouText(e.target.value)}
                placeholder="Thank you for reporting this — the animals have been safely recovered!"
                rows={4}
                className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#7D8DCC]"
              />
              <div className="space-y-3">
                <button
                  disabled={sendingThankYou}
                  onClick={async () => {
                    if (!tyReport?.reporterId) return
                    setSendingThankYou(true)
                    try {
                      const msg = thankYouText.trim() || 'Thank you for reporting this — the animals have been safely recovered!'
                      const senderId = thankYouSenderId || undefined
                      const senderName = senderId
                        ? (senderUser?.full_name || senderUser?.email || undefined)
                        : 'Admin'
                      await sendThankYouMessage(tyReport.reporterId, thankYouReportId, msg, senderId, senderName)
                      setThankYouSent(prev => new Set(prev).add(thankYouReportId))
                      setThankYouReportId(null)
                      setThankYouText('')
                      setThankYouSenderId('')
                    } catch {
                      alert('Failed to send message. Please try again.')
                    } finally {
                      setSendingThankYou(false)
                    }
                  }}
                  className="w-full py-3 bg-[#614270] text-white rounded-xl font-semibold hover:bg-[#4e3359] disabled:opacity-50"
                >
                  {sendingThankYou ? 'Sending…' : 'Send Thank You'}
                </button>
                <button onClick={() => { setThankYouReportId(null); setThankYouText(''); setThankYouSenderId('') }} className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-[#614270]">Confirm Delete</h3>
            </div>
            <p className="text-[#614270] text-center mb-6">
              Are you sure you want to delete this {deleteType}? This cannot be undone.
            </p>
            <div className="space-y-3">
              <button onClick={handleDelete} className="w-full py-3 bg-[#FA9335] text-white rounded-xl font-semibold hover:bg-[#e07d20]">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
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
        owner={allUsers.find((u: any) => u.id === farms.find(f => f.id === showFarmDetailsModal)?.farmerId)}
        onClose={() => setShowFarmDetailsModal(null)}
        onAddField={(farmId: string) => {
          setShowFarmDetailsModal(null)
          setShowCreateFieldModal(farmId)
        }}
        onEditField={(farmId: string, fieldId: string) => {
          setShowFarmDetailsModal(null)
          setShowEditFieldModal({ farmId, fieldId })
        }}
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
        onClose={() => {
          setShowFarmDetailsModal(showCreateFieldModal)
          setShowCreateFieldModal(null)
        }}
        onCreate={(farmId: string, field: any) => {
          addField(farmId, field)
          setShowFarmDetailsModal(farmId)
          setShowCreateFieldModal(null)
        }}
      />}

      {/* Edit Field Modal */}
      {showEditFieldModal && <EditFieldModal
        farmId={showEditFieldModal.farmId}
        field={farms.find(f => f.id === showEditFieldModal.farmId)?.fields.find(fi => fi.id === showEditFieldModal.fieldId)!}
        onClose={() => {
          setShowFarmDetailsModal(showEditFieldModal.farmId)
          setShowEditFieldModal(null)
        }}
        onSave={(farmId: string, fieldId: string, data: any) => {
          updateField(farmId, fieldId, data)
          setShowFarmDetailsModal(farmId)
          setShowEditFieldModal(null)
        }}
      />}

      {/* Resolve with optional message to walker */}
      {resolveMessageReportId && (() => {
        const rpt = reports.find(r => r.id === resolveMessageReportId)
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-[#614270] mb-1">Resolve Report</h3>
              {rpt && (
                <p className="text-sm text-[#92998B] mb-3">
                  #{rpt.id.slice(-6).toUpperCase()} · {rpt.categoryEmoji} {rpt.categoryName}
                </p>
              )}
              <label className="block text-sm font-medium text-[#614270] mb-1">
                Optional message to walker
              </label>
              <textarea
                value={resolveMessageText}
                onChange={e => setResolveMessageText(e.target.value)}
                rows={3}
                placeholder="e.g. Thanks for reporting — sheep safely returned!"
                className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC] mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setResolveMessageReportId(null)}
                  className="flex-1 py-2 border border-[#D1D9C5] text-[#614270] rounded-xl text-sm hover:bg-[#D1D9C5]/50"
                >Cancel</button>
                <button
                  disabled={sendingResolve}
                  onClick={async () => {
                    setSendingResolve(true)
                    const rid = resolveMessageReportId
                    resolveReport(rid)
                    if (resolveMessageText.trim() && rpt?.reporterId) {
                      await sendThankYouMessage(rpt.reporterId, rid, resolveMessageText.trim())
                    }
                    setSendingResolve(false)
                    setResolveMessageReportId(null)
                    setDetailReportId(null)
                  }}
                  className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-xl text-sm hover:bg-[#6b7bb8] disabled:opacity-50"
                >{sendingResolve ? 'Resolving…' : 'Resolve'}</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Claim / Add Farmer Modal */}
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

      {/* Reassign Modal */}
      {showReassignReportModal && <ClaimReportModal
        reportId={showReassignReportModal}
        report={reports.find(r => r.id === showReassignReportModal)!}
        farmers={[...farmers, ...admins]}
        title="Reassign to Farmer"
        description="Select a farmer to reassign this report to. All existing claimants will be replaced."
        actionLabel="Reassign"
        onClose={() => setShowReassignReportModal(null)}
        onClaim={(reportId: string, farmerId: string) => {
          reassignReport(reportId, farmerId)
          setShowReassignReportModal(null)
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
          onOpenReport={(reportId) => {
            setViewingUser(null)
            setCurrentView('reports')
            setDetailReportId(reportId)
          }}
          onViewAllReports={(userId) => {
            setCurrentView('reports')
            setFilterKeyword(userId)
          }}
        />
      )}

      {/* Walker Report Mode Overlay */}
      {showReportMode && (
        <div className="fixed inset-0 z-[100] bg-[#D1D9C5] overflow-auto">
          <WalkerDashboard onExitToAdmin={() => setShowReportMode(false)} />
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto">
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
                className="px-4 py-2 bg-[#7D8DCC] hover:bg-[#6b7db3] text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Report
              </button>
              <button
                onClick={() => setProfileOpen(true)}
                title="Account settings"
                className="p-2 rounded-lg bg-[#4e3359] hover:bg-[#614270] text-[#D1D9C5] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav — hamburger */}
          <div className="flex md:hidden items-center justify-between">
            <span className="font-semibold text-[#614270] capitalize">{currentView}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                title="Account settings"
                className="p-2 rounded-lg bg-[#4e3359] hover:bg-[#614270] text-[#D1D9C5] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={() => setShowMobileMenu(v => !v)}
                aria-label="Menu"
                className="p-2 rounded-lg bg-[#D1D9C5] hover:bg-[#D1D9C5] text-[#614270] transition-colors"
              >
                {showMobileMenu ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#D1D9C5] bg-white px-4 py-2 flex flex-col gap-1">
            {([
              { view: 'walkers' as AdminView, label: 'Walkers', count: walkers.length },
              { view: 'farmers' as AdminView, label: 'Farmers', count: farmers.length },
              { view: 'reports' as AdminView, label: 'Reports', count: reports.filter(r => !r.archived).length },
              { view: 'farms' as AdminView, label: 'Farms', count: farms.length },
              { view: 'billing' as AdminView, label: 'Billing' },
              { view: 'admins' as AdminView, label: 'Admin Users' },
              { view: 'categories' as AdminView, label: 'Categories', count: reportCategories.length },
            ] as { view: AdminView; label: string; count?: number }[]).map(({ view, label, count }) => (
              <button
                key={view}
                onClick={() => { setCurrentView(view); setShowMobileMenu(false) }}
                className={`w-full text-left px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  currentView === view ? 'bg-[#614270] text-white' : 'text-[#614270] hover:bg-[#D1D9C5]'
                }`}
              >
                {label}{count !== undefined && <span className="ml-1.5 text-sm opacity-60">({count})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile fixed Report button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#D1D9C5] px-4 py-3 safe-area-pb">
        <button
          onClick={() => setShowReportMode(true)}
          className="w-full py-4 bg-[#7D8DCC] hover:bg-[#6b7db3] text-white rounded-xl font-semibold transition-colors"
        >
          Report
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-6">
        {/* ===== OVERVIEW ===== */}
        {currentView === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button onClick={() => setCurrentView('walkers')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-[#614270]">{allUsers.length}</div>
                <div className="text-sm text-[#92998B]">Total Users</div>
                <div className="text-xs text-[#9ED663] mt-1">{activeUsers} active</div>
              </button>
              <button onClick={() => setCurrentView('walkers')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-[#9ED663]">{walkers.length}</div>
                <div className="text-sm text-[#92998B]">Walkers</div>
              </button>
              <button onClick={() => setCurrentView('farmers')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-[#7D8DCC]">{farmers.length}</div>
                <div className="text-sm text-[#92998B]">Farmers</div>
              </button>
              <button onClick={() => setCurrentView('farms')} className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-[#614270]">{farms.length}</div>
                <div className="text-sm text-[#92998B]">Farms ({totalFields} fields)</div>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <button onClick={() => setCurrentView('reports')} className="bg-[#EADA69]/20 rounded-xl p-4 border border-[#EADA69]/40 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#614270]">{reportedCount}</div>
                <div className="text-sm text-[#614270]">Reported</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-[#7D8DCC]/10 rounded-xl p-4 border border-[#7D8DCC]/30 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#7D8DCC]">{claimedCount}</div>
                <div className="text-sm text-[#7D8DCC]">Claimed</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-[#9ED663]/10 rounded-xl p-4 border border-[#D1D9C5] text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#614270]">{resolvedCount}</div>
                <div className="text-sm text-[#9ED663]">Resolved</div>
              </button>
              <button onClick={() => setCurrentView('reports')} className="bg-[#D1D9C5] rounded-xl p-4 border border-[#D1D9C5] text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#614270]">{archivedCount}</div>
                <div className="text-sm text-[#614270]">Archived</div>
              </button>
            </div>
            {/* Action-required queue cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button onClick={() => { setFilterStatus('needs_review'); setCurrentView('reports') }} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${needsReviewCount > 0 ? 'bg-[#FA9335]/10 border-[#FA9335]/40' : 'bg-[#D1D9C5] border-[#D1D9C5]'}`}>
                <div className={`text-2xl font-bold ${needsReviewCount > 0 ? 'text-[#FA9335]' : 'text-[#92998B]'}`}>{needsReviewCount}</div>
                <div className={`text-sm ${needsReviewCount > 0 ? 'text-[#FA9335] font-medium' : 'text-[#92998B]'}`}>⚠️ Needs Review</div>
              </button>
              <button onClick={() => { setFilterStatus('escalated'); setCurrentView('reports') }} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${escalatedCount > 0 ? 'bg-[#FA9335]/10 border-[#FA9335]/40' : 'bg-[#D1D9C5] border-[#D1D9C5]'}`}>
                <div className={`text-2xl font-bold ${escalatedCount > 0 ? 'text-[#FA9335]' : 'text-[#92998B]'}`}>{escalatedCount}</div>
                <div className={`text-sm ${escalatedCount > 0 ? 'text-[#FA9335] font-medium' : 'text-[#92998B]'}`}>🚨 Escalated</div>
              </button>
              <button onClick={() => { setFilterStatus('flagged'); setCurrentView('reports') }} className={`rounded-xl p-4 border text-left hover:shadow-md transition-shadow ${flaggedCount > 0 ? 'bg-[#EADA69]/20 border-[#EADA69]/40' : 'bg-[#D1D9C5] border-[#D1D9C5]'}`}>
                <div className={`text-2xl font-bold ${flaggedCount > 0 ? 'text-[#614270]' : 'text-[#92998B]'}`}>{flaggedCount}</div>
                <div className={`text-sm ${flaggedCount > 0 ? 'text-[#614270] font-medium' : 'text-[#92998B]'}`}>🚩 Flagged by Farmer</div>
              </button>
            </div>
            <div className="grid grid-cols-1 mb-6">
              <button onClick={() => setCurrentView('billing')} className="bg-[#614270]/10 rounded-xl p-4 border border-[#614270]/20 text-left hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#614270]">{activeSubs}</div>
                <div className="text-sm text-[#614270]">Paid Subs</div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow mb-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-[#614270]">Activity Map</h2>
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
                    ...reports.filter(r => !r.archived).map((r) => {
                      const cat = reportCategories.find(c => c.id === r.categoryId)
                      return {
                        id: r.id,
                        position: [r.location.lat, r.location.lng] as [number, number],
                        popup: `${cat?.emoji || r.categoryEmoji || '🐑'} ${r.sheepCount} ${cat?.name || r.categoryName || 'sheep'} - ${r.status}`,
                        type: 'sheep' as const,
                        status: r.status as 'reported' | 'claimed' | 'resolved',
                        emoji: cat?.emoji || r.categoryEmoji || '🐑',
                        imageUrl: cat?.imageUrl || r.categoryImageUrl,
                      }
                    })
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
              <h2 className="font-semibold text-[#614270]">Walkers ({walkers.length})</h2>
            </div>
            {walkers.length === 0 ? (
              <div className="p-8 text-center text-[#92998B]">
                <div className="text-4xl mb-2">🚶</div>No walkers registered yet
              </div>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#D1D9C5] border-b border-[#D1D9C5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Reports</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D9C5]">
                  {walkers.map((user: any) => {
                    const userReports = reports.filter(r => r.reporterId === user.id)
                    const displayName = user.full_name || user.name || '-'
                    const isActive = user.status !== 'suspended'
                    return (
                      <tr key={user.id} className={!isActive ? 'bg-[#D1D9C5] opacity-60' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button onClick={() => setViewingUser(user)} className="text-sm font-medium text-[#7D8DCC] hover:text-[#7D8DCC] hover:underline text-left">{user.email || '-'}</button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{displayName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{user.phone || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {user.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#9ED663]/20 text-[#614270]">Active</span>
                          ) : user.status === 'suspended' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FA9335]/10 text-[#FA9335]">Suspended</span>
                          ) : user.status === 'password_reset_required' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FA9335]/10 text-[#FA9335]">Reset Required</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#EADA69]/20 text-[#614270]">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{userReports.length}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingUser(user)} className="px-2 py-1 bg-[#D1D9C5] text-[#614270] rounded text-xs font-medium hover:bg-[#D1D9C5]">View</button>
                            {isActive ? (
                              <button onClick={() => handleSuspend(user.id)} className="px-2 py-1 bg-[#EADA69]/20 text-[#614270] rounded text-xs font-medium hover:bg-[#EADA69]/30">Suspend</button>
                            ) : (
                              <button onClick={() => handleActivate(user.id)} className="px-2 py-1 bg-[#9ED663]/20 text-[#614270] rounded text-xs font-medium hover:bg-[#9ED663]/30">Activate</button>
                            )}
                            {user.email && (
                              <button onClick={() => handleResetUserPassword(user.id, user.email)} className="px-2 py-1 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded text-xs font-medium hover:bg-[#7D8DCC]/20">Reset</button>
                            )}
                            <button onClick={() => confirmDelete(user.id, 'user')} className="px-2 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-xs font-medium hover:bg-[#FA9335]/20">Delete</button>
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
              <h2 className="font-semibold text-[#614270]">Farmers ({farmers.length})</h2>
              <button
                onClick={() => setShowCreateFarmerModal(true)}
                className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm font-medium hover:bg-[#6b7db3] flex items-center gap-2"
              >
                + Add Farmer
              </button>
            </div>
            {farmers.length === 0 ? (
              <div className="p-8 text-center text-[#92998B]">
                <div className="text-4xl mb-2">🧑‍🌾</div>No farmers registered yet
              </div>
            ) : (
              <table className="w-full min-w-[750px]">
                <thead className="bg-[#D1D9C5] border-b border-[#D1D9C5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Farms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#92998B] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D9C5]">
                  {farmers.map((user: any) => {
                    const userFarms = farms.filter(f => f.farmerId === user.id)
                    const displayName = user.full_name || user.name || '-'
                    const isActive = user.status !== 'suspended'
                    return (
                      <tr key={user.id} className={!isActive ? 'bg-[#D1D9C5] opacity-60' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button onClick={() => setViewingUser(user)} className="text-sm font-medium text-[#7D8DCC] hover:text-[#7D8DCC] hover:underline text-left">{user.email || '-'}</button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{displayName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{user.phone || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {user.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#9ED663]/20 text-[#614270]">Active</span>
                          ) : user.status === 'suspended' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FA9335]/10 text-[#FA9335]">Suspended</span>
                          ) : user.status === 'password_reset_required' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FA9335]/10 text-[#FA9335]">Reset Required</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#EADA69]/20 text-[#614270]">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#614270]">{userFarms.length}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingUser(user)} className="px-2 py-1 bg-[#D1D9C5] text-[#614270] rounded text-xs font-medium hover:bg-[#D1D9C5]">View</button>
                            {isActive ? (
                              <button onClick={() => handleSuspend(user.id)} className="px-2 py-1 bg-[#EADA69]/20 text-[#614270] rounded text-xs font-medium hover:bg-[#EADA69]/30">Suspend</button>
                            ) : (
                              <button onClick={() => handleActivate(user.id)} className="px-2 py-1 bg-[#9ED663]/20 text-[#614270] rounded text-xs font-medium hover:bg-[#9ED663]/30">Activate</button>
                            )}
                            {user.email && (
                              <button onClick={() => handleResetUserPassword(user.id, user.email)} className="px-2 py-1 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded text-xs font-medium hover:bg-[#7D8DCC]/20">Reset</button>
                            )}
                            <button onClick={() => confirmDelete(user.id, 'user')} className="px-2 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-xs font-medium hover:bg-[#FA9335]/20">Delete</button>
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
                    <option value="date">Latest first</option>
                    <option value="daysUnclaimed">Longest unclaimed</option>
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
                      className="px-3 py-2 text-sm text-[#7D8DCC] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {selectedReports.length > 0 && (
                    <>
                      <button onClick={handleBatchArchive} className="px-3 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#D1D9C5]">
                        Archive ({selectedReports.length})
                      </button>
                      <button onClick={handleBatchDelete} className="px-3 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20">
                        Delete ({selectedReports.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-[#614270]">Reports ({filteredReports.length})</h2>
                  <label className="flex items-center gap-2 text-sm text-[#614270]">
                    <input type="checkbox" checked={selectedReports.length === paginatedReports.length && paginatedReports.length > 0} onChange={handleSelectAllReports} className="rounded" />
                    Select all on page
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#92998B]">Per page:</span>
                    <select value={reportsPerPage} onChange={(e) => { setReportsPerPage(Number(e.target.value)); setReportsPage(1) }} className="px-2 py-1 border rounded-lg text-xs">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={0}>All</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#92998B]">
                      Export {selectedReports.length > 0 ? `${selectedReports.length} selected` : `all ${filteredReports.length}`}:
                    </span>
                    <button onClick={handleExportCSV} disabled={exportLoading} className="px-3 py-1.5 bg-[#D1D9C5] text-[#614270] rounded-lg text-xs font-medium hover:bg-[#D1D9C5] disabled:opacity-50">CSV</button>
                    <button onClick={handleExportXLSX} disabled={exportLoading} className="px-3 py-1.5 bg-[#9ED663]/20 text-[#614270] rounded-lg text-xs font-medium hover:bg-[#9ED663]/30 disabled:opacity-50">{exportLoading ? '…' : 'Excel'}</button>
                    <button onClick={handleExportPDF} disabled={exportLoading} className="px-3 py-1.5 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded-lg text-xs font-medium hover:bg-[#7D8DCC]/20 disabled:opacity-50">{exportLoading ? '…' : 'PDF'}</button>
                  </div>
                </div>
              </div>
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-[#92998B]">
                  <div className="text-4xl mb-2">🐑</div>No reports match filters
                </div>
              ) : (
                <div className="divide-y">
                  {paginatedReports.map((report) => {
                    const cat = reportCategories.find(c => c.id === report.categoryId)
                    const conditions = report.conditions?.length ? report.conditions : report.condition ? [report.condition] : []
                    const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors'
                    return (
                    <div key={report.id} className={`p-4 flex items-start gap-3 ${report.archived ? 'bg-[#D1D9C5]' : ''}`}>
                      <input type="checkbox" checked={selectedReports.includes(report.id)} onChange={() => handleSelectReport(report.id)} className="rounded mt-1 flex-shrink-0" />
                      {/* Clickable category icon */}
                      <button
                        onClick={() => openReportDetail(report.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-indigo-400 transition-all bg-[#EADA69]/20"
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
                          <div className="font-medium text-[#614270]">{report.sheepCount} {report.categoryName || 'Sheep'}</div>
                        </button>
                        <div className="text-xs text-[#92998B] mt-0.5">
                          <span className="font-mono text-[#92998B]">{report.id.length > 8 ? report.id.slice(0, 8).toUpperCase() : report.id}</span>
                          {' · '}{report.submittedByUserName || report.reporterContact || <span className="italic text-[#92998B]">Anonymous</span>}
                          {' · '}{new Date(report.timestamp).toLocaleString()}
                        </div>
                        {conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conditions.map(c => <span key={c} className="px-1.5 py-0.5 bg-[#D1D9C5] text-[#614270] rounded text-xs">{c}</span>)}
                          </div>
                        )}
                        {report.description && <div className="text-xs text-[#92998B] mt-1 truncate">{report.description}</div>}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end flex-shrink-0">
                        {getDaysUnclaimedBadge(report)}
                        {report.screeningRequired && !report.archived && (
                          <span className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[#FA9335]/10 text-[#FA9335]">⚠️ Review</span>
                        )}
                        {report.flaggedByFarmer && report.status !== 'complete' && (
                          <span className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[#EADA69]/20 text-[#614270]">🚩</span>
                        )}
                        <span className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                          report.status === 'complete' ? 'bg-[#D1D9C5] text-[#614270]' :
                          report.status === 'escalated' ? 'bg-[#FA9335]/10 text-[#FA9335]' :
                          report.status === 'resolved' ? 'bg-[#9ED663]/20 text-[#614270]' :
                          report.status === 'claimed' ? 'bg-[#7D8DCC]/10 text-[#7D8DCC]' :
                          'bg-[#EADA69]/20 text-[#614270]'
                        }`}>{{ reported: 'Reported', claimed: 'Claimed', resolved: 'Resolved', escalated: 'Escalated', complete: 'Complete' }[report.status] || report.status}</span>
                        {report.archived && <span className={`${btnBase} bg-[#D1D9C5] text-[#614270]`}>Archived</span>}
                        <button onClick={() => openReportDetail(report.id)} className={`${btnBase} bg-indigo-100 text-indigo-700 hover:bg-indigo-200`}>View</button>
                        {!report.archived && report.screeningRequired && (
                          <button onClick={() => approveReportScreening(report.id)} className={`${btnBase} bg-[#63BD8F]/20 text-[#614270] hover:bg-[#63BD8F]/30`}>Approve</button>
                        )}
                        {!report.archived && report.status === 'reported' && !report.screeningRequired && (
                          <button onClick={() => setShowClaimReportModal(report.id)} className={`${btnBase} bg-[#9ED663]/20 text-[#614270] hover:bg-[#9ED663]/30`}>Claim</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => { setResolveMessageReportId(report.id); setResolveMessageText('') }} className={`${btnBase} bg-[#7D8DCC]/10 text-[#7D8DCC] hover:bg-[#7D8DCC]/20`}>Resolve</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => escalateReport(report.id)} className={`${btnBase} bg-[#FA9335]/10 text-[#FA9335] hover:bg-[#FA9335]/20`}>Escalate</button>
                        )}
                        {!report.archived && (report.status === 'resolved' || report.status === 'escalated') && (
                          <button onClick={() => { setCompleteReportId(report.id); setCompleteNotes('') }} className={`${btnBase} bg-[#614270] text-white hover:bg-[#4e3359]`}>Complete</button>
                        )}
                        {!report.archived && (
                          <button onClick={() => archiveReport(report.id)} className={`${btnBase} bg-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5]`}>Archive</button>
                        )}
                        <button onClick={() => confirmDelete(report.id, 'report')} className={`${btnBase} bg-[#FA9335]/10 text-[#FA9335] hover:bg-[#FA9335]/20`}>Delete</button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
              {/* Pagination */}
              {reportsPerPage > 0 && filteredReports.length > reportsPerPage && (
                <div className="p-3 border-t flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-[#92998B]">
                    Showing {Math.min((reportsPage - 1) * reportsPerPage + 1, filteredReports.length)}–{Math.min(reportsPage * reportsPerPage, filteredReports.length)} of {filteredReports.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setReportsPage(1)} disabled={reportsPage === 1} className="px-2.5 py-1.5 rounded-lg text-xs border border-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5] disabled:opacity-40 disabled:cursor-not-allowed">First</button>
                    <button onClick={() => setReportsPage(p => Math.max(1, p - 1))} disabled={reportsPage === 1} className="px-2.5 py-1.5 rounded-lg text-xs border border-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5] disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                    <span className="px-3 py-1.5 text-xs text-[#614270] font-medium">Page {reportsPage} of {totalReportPages}</span>
                    <button onClick={() => setReportsPage(p => Math.min(totalReportPages, p + 1))} disabled={reportsPage === totalReportPages} className="px-2.5 py-1.5 rounded-lg text-xs border border-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5] disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                    <button onClick={() => setReportsPage(totalReportPages)} disabled={reportsPage === totalReportPages} className="px-2.5 py-1.5 rounded-lg text-xs border border-[#D1D9C5] text-[#614270] hover:bg-[#D1D9C5] disabled:opacity-40 disabled:cursor-not-allowed">Last</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== FARMS ===== */}
        {currentView === 'farms' && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-[#614270]">All Farms ({farms.length})</h2>
              <button
                onClick={() => setShowCreateFarmModal(true)}
                className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm font-medium hover:bg-[#6b7db3] flex items-center gap-2"
              >
                + Add Farm
              </button>
            </div>
            {farms.length === 0 ? (
              <div className="p-8 text-center text-[#92998B]">
                <div className="text-4xl mb-2">🏡</div>No farms registered yet
              </div>
            ) : (
              <div className="divide-y">
                {farms.map((farm) => {
                  const owner = allUsers.find((u: any) => u.id === farm.farmerId)
                  const isOrphaned = !farm.farmerId || !owner
                  return (
                    <div key={farm.id} className={`p-4 flex items-center justify-between ${isOrphaned ? 'bg-[#FA9335]/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOrphaned ? 'bg-[#FA9335]/10' : 'bg-[#EADA69]/20'}`}>🏡</div>
                        <div>
                          <div className="font-medium text-[#614270] flex items-center gap-2">
                            {farm.name}
                            {isOrphaned && <span className="text-xs bg-[#FA9335]/10 text-[#FA9335] px-2 py-0.5 rounded-full font-semibold">⚠️ No owner — click Edit to reassign</span>}
                          </div>
                          <div className="text-sm text-[#92998B]">{farm.fields.length} fields • Buffer: {farm.alertBufferMeters}m</div>
                          <div className="text-xs text-[#92998B]">Owner: {owner?.full_name || owner?.name || (isOrphaned ? 'Unassigned' : 'Unknown')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${farm.alertsEnabled ? 'bg-[#9ED663]/20 text-[#614270]' : 'bg-[#D1D9C5] text-[#92998B]'}`}>
                          {farm.alertsEnabled ? 'Alerts On' : 'Alerts Off'}
                        </span>
                        <button onClick={() => setShowFarmDetailsModal(farm.id)} className="px-3 py-1 bg-[#614270]/10 text-[#614270] rounded text-sm hover:bg-[#614270]/20">View Fields</button>
                        <button onClick={() => setShowEditFarmModal(farm.id)} className="px-3 py-1 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded text-sm hover:bg-[#7D8DCC]/20">Edit</button>
                        <button onClick={() => confirmDelete(farm.id, 'farm')} className="px-3 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-sm hover:bg-[#FA9335]/20">Delete</button>
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
              <div className="bg-[#7D8DCC]/10 rounded-xl p-4 border border-[#7D8DCC]/30">
                <div className="text-2xl font-bold text-[#7D8DCC]">{trialFarmers}</div>
                <div className="text-sm text-[#7D8DCC]">On Trial</div>
              </div>
              <div className="bg-[#9ED663]/10 rounded-xl p-4 border border-[#D1D9C5]">
                <div className="text-2xl font-bold text-[#614270]">{activeSubs}</div>
                <div className="text-sm text-[#9ED663]">Active Subscriptions</div>
              </div>
              <div className="bg-[#FA9335]/10 rounded-xl p-4 border border-[#FA9335]/30">
                <div className="text-2xl font-bold text-[#FA9335]">{cancelledSubs}</div>
                <div className="text-sm text-[#FA9335]">Cancelled</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <h3 className="font-semibold text-[#614270] mb-2">Revenue Estimate</h3>
              <div className="text-3xl font-bold text-[#9ED663]">£{(activeSubs * 29.99).toFixed(2)}<span className="text-sm font-normal text-[#92998B]">/month</span></div>
            </div>

            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-[#614270]">Farmer Subscriptions</h2>
              </div>
              <div className="divide-y">
                {farmers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#614270]">{user.name}</div>
                      <div className="text-sm text-[#92998B]">{user.email}</div>
                      {user.trialEndsAt && user.subscriptionStatus === 'trial' && (
                        <div className="text-xs text-[#7D8DCC]">Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubscriptionBadge(user)}
                      {user.subscriptionStatus === 'trial' && (
                        <button onClick={() => activateSubscription(user.id)} className="px-3 py-1 bg-[#9ED663]/20 text-[#614270] rounded text-sm hover:bg-[#9ED663]/30">Activate</button>
                      )}
                      {user.subscriptionStatus === 'active' && (
                        <button onClick={() => cancelSubscription(user.id)} className="px-3 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-sm hover:bg-[#FA9335]/20">Cancel</button>
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
              <h2 className="text-xl font-bold text-[#614270]">Report Categories</h2>
              <div className="flex gap-2">
                {reportCategories.length > 1 && (
                  <button
                    onClick={() => setShowReorderModal(true)}
                    className="px-4 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg font-medium hover:bg-[#D1D9C5]"
                  >
                    ⇅ Reorder
                  </button>
                )}
                <button
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="px-4 py-2 bg-[#7D8DCC] text-white rounded-lg font-medium hover:bg-[#6b7db3]"
                >
                  + Add Category
                </button>
              </div>
            </div>

            <div className="bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#7D8DCC]">
                <strong>🐑 Sheep</strong> is the built-in default category and cannot be removed. Add custom categories below for reporting other issues such as damaged property or other animals.
              </p>
            </div>

            <div className="space-y-3">
              {reportCategories.length === 0 && (
                <div className="bg-white rounded-xl p-8 shadow text-center text-[#92998B]">
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
                      <div className="font-semibold text-[#614270] flex items-center gap-2">
                        {cat.name}
                        {!cat.isActive && <span className="text-xs bg-[#D1D9C5] text-[#92998B] px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      {cat.description && <div className="text-sm text-[#92998B]">{cat.description}</div>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.conditions.map((c) => (
                          <span key={c} className="text-xs bg-[#9ED663]/20 text-[#614270] px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="px-3 py-1.5 text-sm bg-[#D1D9C5] hover:bg-[#D1D9C5] text-[#614270] rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
                          deleteReportCategory(cat.id)
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-[#FA9335]/10 hover:bg-[#FA9335]/20 text-[#FA9335] rounded-lg"
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

            {/* Reorder Categories Modal */}
            {showReorderModal && (
              <ReorderCategoriesModal
                categories={reportCategories}
                onClose={() => setShowReorderModal(false)}
                onSave={async (ordered) => {
                  await Promise.all(
                    ordered.map((c, i) => {
                      const newOrder = i + 1
                      if (c.sortOrder !== newOrder) return updateReportCategory(c.id, { sortOrder: newOrder })
                      return Promise.resolve()
                    })
                  )
                  setShowReorderModal(false)
                }}
              />
            )}
          </>
        )}

        {/* ===== AUDIT LOG ===== */}
        {currentView === 'audit' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#614270]">Audit Log</h2>
              <button
                onClick={async () => {
                  setLoadingAudit(true)
                  const logs = await fetchAuditLogs({ limit: 200 })
                  setAuditLogs(logs)
                  setLoadingAudit(false)
                }}
                className="px-4 py-2 bg-[#614270] text-white rounded-lg font-medium hover:bg-[#4e3359]"
              >
                Refresh
              </button>
            </div>
            {loadingAudit ? (
              <div className="text-center py-8 text-[#92998B]">Loading…</div>
            ) : auditLogs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow text-center text-[#92998B]">
                <div className="text-4xl mb-2">📋</div>
                No audit logs yet. Click Refresh to load.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow divide-y overflow-hidden">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 flex items-start gap-3 text-sm">
                    <div className="text-xs text-[#92998B] w-36 flex-shrink-0 pt-0.5">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#614270]">{log.action}</span>
                      {log.entity_type && (
                        <span className="ml-2 text-[#92998B]">· {log.entity_type} {log.entity_id ? `(${String(log.entity_id).slice(0, 8)}…)` : ''}</span>
                      )}
                      {log.detail && Object.keys(log.detail).length > 0 && (
                        <div className="text-xs text-[#92998B] mt-0.5 truncate">
                          {JSON.stringify(log.detail)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[#92998B] flex-shrink-0">
                      {log.actor_email || log.actor_id?.slice(0, 8) || 'system'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-6 bg-[#D1D9C5] rounded-xl p-4 text-sm text-[#614270]">
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
          <h3 className="text-xl font-bold text-[#614270]">Add New Farmer</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-lg">
            <p className="text-sm text-[#FA9335]">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-lg">
          <p className="text-xs text-[#7D8DCC]">
            <strong>Note:</strong> The farmer will receive an email invitation with a password reset link. They must set their password before they can log in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">
              Full Name <span className="text-[#FA9335]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="John Smith"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">
              Email <span className="text-[#FA9335]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="john@farm.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="07700 900123"
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-[#614270] mb-3">Billing Address (Optional)</h4>

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
              className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3] disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h3 className="text-xl font-bold text-[#614270]">Edit Farmer</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-[#614270] mb-3">Billing Address</h4>
            <div className="space-y-3">
              <input type="text" value={billingAddress.line1} onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Address Line 1" />
              <input type="text" value={billingAddress.line2 || ''} onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Address Line 2" />
              <input type="text" value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="City" />
              <input type="text" value={billingAddress.county} onChange={(e) => setBillingAddress({ ...billingAddress, county: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="County" />
              <input type="text" value={billingAddress.postcode} onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Postcode" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]">Save Changes</button>
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
          <h3 className="text-xl font-bold text-[#614270]">Add New Farm</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Farmer Owner *</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
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
            <label className="block text-sm font-medium text-[#614270] mb-1">Farm Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="Green Meadows Farm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Alert Buffer (meters)</label>
            <input
              type="number"
              value={alertBufferMeters}
              onChange={(e) => setAlertBufferMeters(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              min="0"
              step="50"
            />
            <p className="text-xs text-[#92998B] mt-1">Distance outside field boundaries to receive alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertsEnabled"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertsEnabled" className="text-sm font-medium text-[#614270]">
              Enable alerts for this farm
            </label>
          </div>

          <div className="bg-[#7D8DCC]/10 rounded-lg p-3 text-sm text-[#7D8DCC]">
            💡 You can add fields to this farm after creation
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]">Create Farm</button>
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
          <h3 className="text-xl font-bold text-[#614270]">Edit Farm</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        {!farm.farmerId && (
          <div className="mb-4 p-3 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-lg text-sm text-[#FA9335]">
            ⚠️ This farm has no owner. Assign a farmer below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Farm Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Farmer Owner</label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
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
            <label className="block text-sm font-medium text-[#614270] mb-1">Alert Buffer (meters)</label>
            <input
              type="number"
              value={alertBufferMeters}
              onChange={(e) => setAlertBufferMeters(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              min="0"
              step="50"
            />
            <p className="text-xs text-[#92998B] mt-1">Distance outside field boundaries to receive alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="alertsEnabledEdit"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="alertsEnabledEdit" className="text-sm font-medium text-[#614270]">
              Enable alerts for this farm
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FarmDetailsModal({ farm, owner, onClose, onAddField, onEditField, onDeleteField, categories, onUpdateSubscription }: any) {
  const activeCategories = (categories || []).filter((c: any) => c.isActive)
  const [notifPrefsOpen, setNotifPrefsOpen] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl my-8">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-6 pb-4 border-b border-[#D1D9C5] flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-[#614270]">{farm.name}</h3>
            <p className="text-sm text-[#614270]">Owner: {owner?.full_name || owner?.name || owner?.email || 'Unknown'}</p>
          </div>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>
        <div className="px-6 pb-6 pt-4">

        <div className="mb-6 p-4 bg-[#D1D9C5] rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Alert Buffer:</span> {farm.alertBufferMeters}m</div>
            <div><span className="font-medium">Alerts:</span> {farm.alertsEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><span className="font-medium">Fields:</span> {farm.fields.length}</div>
            <div><span className="font-medium">Created:</span> {new Date(farm.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Map preview of field boundaries */}
        {farm.fields.length > 0 && (
          <div className="mb-4 h-56 rounded-xl overflow-hidden shadow-sm">
            <Map
              center={farm.fields[0]?.fencePosts[0]
                ? [farm.fields[0].fencePosts[0].lat, farm.fields[0].fencePosts[0].lng]
                : [54.5, -2]}
              zoom={15}
              markers={farm.fields.flatMap((field: any) =>
                field.fencePosts.map((post: any, idx: number) => ({
                  position: [post.lat, post.lng] as [number, number],
                  type: 'fencepost' as const,
                  id: `${field.id}-${idx}`,
                }))
              )}
              polygons={farm.fields.map((field: any) => ({
                id: field.id,
                positions: field.fencePosts.map((p: any) => [p.lat, p.lng] as [number, number]),
                color: '#9ED663',
              }))}
            />
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <h4 className="font-semibold text-[#614270]">Fields ({farm.fields.length})</h4>
          <button
            onClick={() => onAddField(farm.id)}
            className="px-3 py-1 bg-[#7D8DCC] text-white rounded-lg text-sm font-medium hover:bg-[#6b7db3]"
          >
            + Add Field
          </button>
        </div>

        {farm.fields.length === 0 ? (
          <div className="p-8 text-center text-[#92998B] bg-[#D1D9C5] rounded-lg">
            <div className="text-4xl mb-2">📍</div>
            <p>No fields added yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {farm.fields.map((field: any) => (
              <div key={field.id} className="p-4 bg-[#D1D9C5] rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium text-[#614270]">{field.name}</div>
                  <div className="text-sm text-[#614270]">
                    {field.fencePosts.length} fence posts
                    {field.sheepCount && ` • ${field.sheepCount} sheep`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditField(farm.id, field.id)}
                    className="px-3 py-1 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded text-sm hover:bg-[#7D8DCC]/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteField(farm.id, field.id)}
                    className="px-3 py-1 bg-[#FA9335]/10 text-[#FA9335] rounded text-sm hover:bg-[#FA9335]/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#D1D9C5]">
            <button
              onClick={() => setNotifPrefsOpen(o => !o)}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <h4 className="font-semibold text-[#614270]">Notification Preferences</h4>
              <svg className={`w-4 h-4 text-[#92998B] transition-transform ${notifPrefsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {notifPrefsOpen && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#92998B] mb-2">Control which report types trigger alerts for this farm.</p>
                {activeCategories.map((cat: any) => {
                  const isCompulsory = cat.subscriptionMode === 'compulsory'
                  const effective = isCompulsory
                    ? true
                    : cat.subscriptionMode === 'default_on'
                      ? (farm.categorySubscriptions?.[cat.id] ?? true)
                      : (farm.categorySubscriptions?.[cat.id] ?? false)
                  return (
                    <div key={cat.id} className={`flex items-center justify-between p-3 rounded-lg ${isCompulsory ? 'bg-[#FA9335]/10 border border-[#FA9335]/20' : 'bg-[#D1D9C5] border border-[#D1D9C5]'}`}>
                      <div className="flex items-center gap-2">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0" />
                        ) : (
                          <span className="text-xl">{cat.emoji}</span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-[#614270]">{cat.name}</div>
                          <div className="text-xs text-[#92998B]">
                            {isCompulsory ? '🔒 Compulsory' : cat.subscriptionMode === 'default_on' ? 'Default on' : 'Optional'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => !isCompulsory && onUpdateSubscription(farm.id, cat.id, !effective)}
                        disabled={isCompulsory}
                        className={`relative w-11 h-6 rounded-full transition-colors ${effective ? 'bg-[#9ED663]' : 'bg-[#D1D9C5]'} ${isCompulsory ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${effective ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#D1D9C5]">
          <button onClick={onClose} className="w-full py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#92998B]/20">
            Close
          </button>
        </div>
        </div>{/* end scrollable body */}
      </div>
    </div>
  )
}

function CreateFieldModal({ farmId, farm, onClose, onCreate }: any) {
  const { reportCategories } = useAppStore()
  const [name, setName] = useState('')
  const [sheepCount, setSheepCount] = useState('')
  const [fencePosts, setFencePosts] = useState<{lat: number, lng: number}[]>([])
  const [categorySubscriptions, setCategorySubscriptions] = useState<Record<string, boolean>>({})

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
      color: '#9ED663',
      categorySubscriptions,
    })
  }

  const canSave = name.trim() && fencePosts.length >= 3

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#614270]">Add Field to {farm.name}</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Field Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="North Field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Sheep Count (Optional)</label>
            <input
              type="number"
              value={sheepCount}
              onChange={(e) => setSheepCount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              placeholder="150"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-2">
              Place Fence Posts ({fencePosts.length} placed, need 3+)
            </label>
            <p className="text-xs text-[#92998B] mb-2">Click on the map to place fence posts. The field boundary will be drawn automatically.</p>
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
                  color: '#9ED663'
                }] : []}
              />
            </div>
          </div>

          {fencePosts.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUndoPost}
                className="flex-1 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg text-sm hover:bg-[#D1D9C5]"
              >
                Undo Last Post
              </button>
              <button
                type="button"
                onClick={handleClearPosts}
                className="flex-1 py-2 bg-[#FA9335]/10 text-[#FA9335] rounded-lg text-sm hover:bg-[#FA9335]/20"
              >
                Clear All Posts
              </button>
            </div>
          )}

          {fencePosts.length > 0 && fencePosts.length < 3 && (
            <div className="bg-[#EADA69]/20 rounded-lg p-3 text-sm text-[#614270]">
              ⚠️ Place at least {3 - fencePosts.length} more post{3 - fencePosts.length > 1 ? 's' : ''} to create a field
            </div>
          )}

          {fencePosts.length >= 3 && (
            <div className="bg-[#9ED663]/10 rounded-lg p-3 text-sm text-[#614270]">
              ✓ Field boundary ready! You can add more posts or save now.
            </div>
          )}

          {reportCategories.filter(c => c.isActive).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">Alert Categories for this Field</label>
              <div className="flex flex-wrap gap-2">
                {reportCategories.filter(c => c.isActive).map(cat => {
                  const isCompulsory = cat.subscriptionMode === 'compulsory'
                  const enabled = isCompulsory || (categorySubscriptions[cat.id] ?? (cat.subscriptionMode === 'default_on'))
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isCompulsory}
                      onClick={() => !isCompulsory && setCategorySubscriptions(prev => ({ ...prev, [cat.id]: !enabled }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        enabled ? 'bg-[#614270] text-white border-[#614270]' : 'bg-white text-[#92998B] border-[#D1D9C5]'
                      } ${isCompulsory ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                      {isCompulsory && <span className="text-xs opacity-70">🔒</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3] disabled:bg-[#92998B] disabled:cursor-not-allowed"
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
  const { reportCategories } = useAppStore()
  const [name, setName] = useState(field.name)
  const [categorySubscriptions, setCategorySubscriptions] = useState<Record<string, boolean>>(field.categorySubscriptions || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter field name')
      return
    }

    onSave(farmId, field.id, {
      name: name.trim(),
      categorySubscriptions,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#614270]">Edit Field</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Field Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
              required
            />
          </div>

          {reportCategories.filter((c: any) => c.isActive).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-2">Alert Categories for this Field</label>
              <div className="flex flex-wrap gap-2">
                {reportCategories.filter((c: any) => c.isActive).map((cat: any) => {
                  const isCompulsory = cat.subscriptionMode === 'compulsory'
                  const enabled = isCompulsory || (categorySubscriptions[cat.id] ?? (cat.subscriptionMode === 'default_on'))
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isCompulsory}
                      onClick={() => !isCompulsory && setCategorySubscriptions((prev: Record<string, boolean>) => ({ ...prev, [cat.id]: !enabled }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        enabled ? 'bg-[#614270] text-white border-[#614270]' : 'bg-white text-[#92998B] border-[#D1D9C5]'
                      } ${isCompulsory ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                      {isCompulsory && <span className="text-xs opacity-70">🔒</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClaimReportModal({ reportId, report, farmers, onClose, onClaim, title, description, actionLabel }: any) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#614270]">{title || 'Claim Report for Farmer'}</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl">&times;</button>
        </div>

        <div className="mb-4 p-4 bg-[#EADA69]/20 rounded-lg">
          <div className="text-sm text-[#614270] space-y-1">
            <div>{report.categoryEmoji || '🐑'} {report.sheepCount} {report.categoryName || 'sheep'} ({report.condition})</div>
            <div>📅 {new Date(report.timestamp).toLocaleString()}</div>
            {report.description && <div>📝 {report.description}</div>}
          </div>
        </div>

        {description && (
          <p className="text-sm text-[#92998B] mb-4">{description}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Select Farmer *</label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D8DCC]"
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

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]">{actionLabel || 'Claim Report'}</button>
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
  const { languages } = useTranslation()
  const [name, setName] = useState(category?.name || '')
  const [nameTranslations, setNameTranslations] = useState<Record<string, string>>(category?.nameTranslations || {})
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
  const [descriptionTranslations, setDescriptionTranslations] = useState<Record<string, string>>(category?.descriptionTranslations || {})
  const [conditionTranslations, setConditionTranslations] = useState<Record<string, Record<string, string>>>(category?.conditionTranslations || {})
  const [showTranslations, setShowTranslations] = useState(false)
  // Other (non-English) languages for translation fields
  const otherLanguages = languages.filter(l => l.enabled && l.code !== 'en')

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
    onSave({
      name: name.trim(), emoji, description: description.trim(), conditions,
      showCount, countLabel, isActive, sortOrder: Number(sortOrder), subscriptionMode,
      imageUrl: imageUrl || undefined,
      nameTranslations: Object.keys(nameTranslations).length > 0 ? nameTranslations : undefined,
      descriptionTranslations: Object.keys(descriptionTranslations).length > 0 ? descriptionTranslations : undefined,
      conditionTranslations: Object.keys(conditionTranslations).length > 0 ? conditionTranslations : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#614270]">{category ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#614270] mb-2">Category Icon</label>
            <CategoryImageUploader
              currentImageUrl={imageUrl || undefined}
              onUploaded={(url) => setImageUrl(url)}
              onClear={() => setImageUrl('')}
            />
            {!imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-[#92998B] mb-1.5">Or use an emoji instead:</p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-16 px-2 py-2 border border-[#D1D9C5] rounded-lg text-center text-2xl"
                    maxLength={2}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {['🐑','🐄','🐖','🐎','🐏','🐐','🐓','🦆','🦅','🦉','🐇','🦊','🦡','🐿️','🌾','🌿','🍀','🌱','🌲','🌳','🌴','🪨','🪵','🪹','🏡','🏠','🏚️','🚜','🚛','🛻','⛏️','🔨','🪚','🪛','⚙️','🪜','🧱','🪟','🚪','🔒','🔓','🪝','🧲','🪤','🌄','🌅','🌦️','🌧️','⛅','🌫️','🛤️','🛣️','🏞️','⛰️','🌁','🌊','💧','🍂','🍁','🌸','🌼','🌻','🥕','🌽','🍄','🌰','⚠️','🔴','🟡'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`text-xl p-1 rounded hover:bg-[#D1D9C5] transition-colors ${emoji === e ? 'bg-[#9ED663]/20 ring-2 ring-[#9ED663]' : ''}`}
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
              <label className="block text-sm font-medium text-[#614270] mb-1">Name (English) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fence, Wall, Road"
                className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
              />
            </div>
          </div>

          {otherLanguages.length > 0 && (
            <div className="border border-[#D1D9C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTranslations(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#D1D9C5] hover:bg-[#D1D9C5] text-sm font-medium text-[#614270] transition-colors"
              >
                <span>🌐 Translations <span className="text-[#92998B] font-normal">(English is always the fallback)</span></span>
                <span className="text-[#92998B] text-lg leading-none">{showTranslations ? '−' : '+'}</span>
              </button>
              {showTranslations && (
                <div className="p-4 space-y-5">
                  {otherLanguages.map(lang => (
                    <div key={lang.code}>
                      <div className="text-xs font-semibold text-[#92998B] uppercase tracking-wide mb-2">{lang.flag_emoji} {lang.name_native} ({lang.code})</div>
                      {/* Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#92998B] w-20 flex-shrink-0">Name</span>
                        <input
                          type="text"
                          value={nameTranslations[lang.code] || ''}
                          onChange={(e) => setNameTranslations(prev => {
                            const next = { ...prev }
                            if (e.target.value.trim()) next[lang.code] = e.target.value
                            else delete next[lang.code]
                            return next
                          })}
                          placeholder={name || 'Translation…'}
                          className="flex-1 px-3 py-1.5 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                        />
                      </div>
                      {/* Description */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#92998B] w-20 flex-shrink-0">Description</span>
                        <input
                          type="text"
                          value={descriptionTranslations[lang.code] || ''}
                          onChange={(e) => setDescriptionTranslations(prev => {
                            const next = { ...prev }
                            if (e.target.value.trim()) next[lang.code] = e.target.value
                            else delete next[lang.code]
                            return next
                          })}
                          placeholder={description || 'Translation…'}
                          className="flex-1 px-3 py-1.5 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                        />
                      </div>
                      {/* Conditions */}
                      {conditions.length > 0 && (
                        <div>
                          <span className="text-xs text-[#92998B] block mb-1.5">Conditions</span>
                          <div className="space-y-1.5 pl-0">
                            {conditions.map(cond => (
                              <div key={cond} className="flex items-center gap-2">
                                <span className="text-xs text-[#92998B] w-20 flex-shrink-0 truncate" title={cond}>{cond}</span>
                                <input
                                  type="text"
                                  value={conditionTranslations[lang.code]?.[cond] || ''}
                                  onChange={(e) => setConditionTranslations(prev => {
                                    const next = { ...prev }
                                    if (!next[lang.code]) next[lang.code] = {}
                                    if (e.target.value.trim()) next[lang.code][cond] = e.target.value
                                    else {
                                      delete next[lang.code][cond]
                                      if (Object.keys(next[lang.code]).length === 0) delete next[lang.code]
                                    }
                                    return next
                                  })}
                                  placeholder={cond}
                                  className="flex-1 px-3 py-1.5 border border-[#D1D9C5] rounded-lg text-sm focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Description (optional, English)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for walkers"
              className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-1">Condition options *</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {conditions.map((c) => (
                <span key={c} className="flex items-center gap-1 bg-[#9ED663]/20 text-[#614270] text-sm px-2 py-1 rounded-full">
                  {c}
                  <button onClick={() => removeCondition(c)} className="text-[#9ED663] hover:text-[#614270] leading-none">×</button>
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
                className="flex-1 px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-2 bg-[#7D8DCC] text-white rounded-lg text-sm hover:bg-[#6b7db3]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showCount} onChange={(e) => setShowCount(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-[#614270]">Ask for quantity</span>
            </label>
          </div>

          {showCount && (
            <div>
              <label className="block text-sm font-medium text-[#614270] mb-1">Quantity label</label>
              <input
                type="text"
                value={countLabel}
                onChange={(e) => setCountLabel(e.target.value)}
                placeholder="e.g. Number of animals, Number of sections"
                className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-[#614270]">Active (visible to walkers)</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#614270]">Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-[#D1D9C5] rounded-lg text-sm"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#614270] mb-2">Farmer Notification Mode</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-[#D1D9C5] cursor-pointer hover:bg-[#D1D9C5]">
                <input type="radio" name="subscriptionMode" value="default_off" checked={subscriptionMode === 'default_off'} onChange={() => setSubscriptionMode('default_off')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-[#614270]">Optional</div>
                  <div className="text-xs text-[#92998B]">Walkers can log it. Farmers must actively opt in to receive alerts.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-[#7D8DCC]/30 bg-[#7D8DCC]/10 cursor-pointer hover:bg-[#7D8DCC]/20">
                <input type="radio" name="subscriptionMode" value="default_on" checked={subscriptionMode === 'default_on'} onChange={() => setSubscriptionMode('default_on')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-[#7D8DCC]">Default On</div>
                  <div className="text-xs text-[#7D8DCC]">All farmers are notified by default. They can choose to opt out.</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-[#FA9335]/30 bg-[#FA9335]/10 cursor-pointer hover:bg-[#FA9335]/20">
                <input type="radio" name="subscriptionMode" value="compulsory" checked={subscriptionMode === 'compulsory'} onChange={() => setSubscriptionMode('compulsory')} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-[#FA9335]">Compulsory</div>
                  <div className="text-xs text-[#FA9335]">All farmers receive alerts. Cannot be turned off.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3]"
          >
            {category ? 'Save Changes' : 'Create Category'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]"
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
function UserDetailModal({ user, reports, farms, onClose, onUpdate, onReset, onSuspend, onActivate, onNavigate, onOpenReport, onViewAllReports }: {
  user: any
  reports: any[]
  farms: any[]
  onClose: () => void
  onUpdate: (id: string, updates: any) => Promise<boolean>
  onReset: (id: string, email: string) => void
  onSuspend: (id: string) => void
  onActivate: (id: string) => void
  onNavigate: (view: 'reports' | 'farms') => void
  onOpenReport: (reportId: string) => void
  onViewAllReports: (userId: string) => void
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
            <h3 className="text-lg font-bold text-[#614270]">{user.full_name || user.email || 'User'}</h3>
            <p className="text-sm text-[#92998B]">{roleLabel[user.role] || user.role}</p>
          </div>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Details / Edit form */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#614270] mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#614270] mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full px-3 py-2 border border-[#D1D9C5] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-lg font-medium hover:bg-[#6b7db3] disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="flex-1 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg font-medium hover:bg-[#D1D9C5]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Email</p>
                  <p className="font-medium text-[#614270] break-all">{user.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Full Name</p>
                  <p className="font-medium text-[#614270]">{user.full_name || '—'}</p>
                </div>
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-medium text-[#614270]">{user.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Status</p>
                  <p className="font-medium text-[#614270] capitalize">{user.status?.replace(/_/g, ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Last Login</p>
                  <p className="font-medium text-[#614270]">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Member Since</p>
                  <p className="font-medium text-[#614270]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                </div>
                {(user.role === 'walker') && (
                  <div>
                    <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Reports Submitted</p>
                    <p className="font-medium text-[#614270]">{userReports.length}</p>
                  </div>
                )}
                {(user.role === 'farmer') && (
                  <div>
                    <p className="text-[#92998B] text-xs uppercase tracking-wide mb-0.5">Farms</p>
                    <p className="font-medium text-[#614270]">{userFarms.length}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full py-2 bg-[#D1D9C5] text-[#614270] rounded-lg font-medium hover:bg-[#D1D9C5] text-sm"
              >
                ✏️ Edit Details
              </button>
            </div>
          )}

          {/* Recent reports (walkers) */}
          {user.role === 'walker' && !editing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[#92998B] uppercase tracking-wide">
                  Reports ({userReports.length})
                </p>
                <button
                  onClick={() => { onClose(); onViewAllReports(user.id) }}
                  className="text-xs text-[#7D8DCC] hover:text-[#7D8DCC] font-medium"
                >
                  View all in Reports tab →
                </button>
              </div>
              {userReports.length === 0 ? (
                <p className="text-sm text-[#92998B] italic">No reports submitted yet</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {userReports.slice(0, 10).map((r: any) => (
                    <button
                      key={r.id}
                      onClick={() => { onClose(); onOpenReport(r.id) }}
                      className="w-full flex items-center justify-between text-sm bg-[#D1D9C5] hover:bg-[#7D8DCC]/10 rounded-lg px-3 py-2 transition-colors text-left group"
                    >
                      <span className="text-[#614270] group-hover:text-[#7D8DCC]">
                        {r.categoryEmoji || '🐑'} {r.sheepCount || 1} × {r.categoryName || 'Sheep'} — <span className="capitalize">{r.condition}</span>
                      </span>
                      <span className="text-[#92998B] text-xs group-hover:text-[#7D8DCC] flex items-center gap-1">
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
                <p className="text-xs font-medium text-[#92998B] uppercase tracking-wide">
                  Farms ({userFarms.length})
                </p>
                <button
                  onClick={() => onNavigate('farms')}
                  className="text-xs text-[#7D8DCC] hover:text-[#7D8DCC] font-medium"
                >
                  View all in Farms tab →
                </button>
              </div>
              {userFarms.length === 0 ? (
                <p className="text-sm text-[#92998B] italic">No farms registered yet</p>
              ) : (
                <div className="space-y-1">
                  {userFarms.map((f: any) => (
                    <button
                      key={f.id}
                      onClick={() => onNavigate('farms')}
                      className="w-full flex items-center justify-between text-sm bg-[#D1D9C5] hover:bg-[#7D8DCC]/10 rounded-lg px-3 py-2 transition-colors text-left group"
                    >
                      <span className="text-[#614270] group-hover:text-[#7D8DCC]">🏡 {f.name}</span>
                      <span className="text-[#92998B] text-xs group-hover:text-[#7D8DCC] flex items-center gap-1">
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
                <button onClick={() => onSuspend(user.id)} className="px-3 py-1.5 bg-[#EADA69]/20 text-[#614270] rounded-lg text-sm font-medium hover:bg-[#EADA69]/30">
                  Suspend Account
                </button>
              ) : (
                <button onClick={() => onActivate(user.id)} className="px-3 py-1.5 bg-[#9ED663]/20 text-[#614270] rounded-lg text-sm font-medium hover:bg-[#9ED663]/30">
                  Activate Account
                </button>
              )}
              {user.email && (
                <button onClick={() => onReset(user.id, user.email)} className="px-3 py-1.5 bg-[#7D8DCC]/10 text-[#7D8DCC] rounded-lg text-sm font-medium hover:bg-[#7D8DCC]/20">
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

function ReorderCategoriesModal({ categories, onClose, onSave }: {
  categories: import('@/store/appStore').ReportCategory[]
  onClose: () => void
  onSave: (ordered: import('@/store/appStore').ReportCategory[]) => Promise<void>
}) {
  const [list, setList] = useState<import('@/store/appStore').ReportCategory[]>(() =>
    [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const reordered = [...list]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(idx, 0, moved)
    setList(reordered)
    setDragIdx(idx)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#614270]">Reorder Categories</h3>
          <button onClick={onClose} className="text-[#92998B] hover:text-[#614270] text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-[#92998B] mb-4">Drag items to set the display order.</p>
        <div className="space-y-2 mb-5">
          {list.map((cat, idx) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => setDragIdx(null)}
              className={`flex items-center gap-3 p-3 bg-white border rounded-xl cursor-grab active:cursor-grabbing transition-shadow ${dragIdx === idx ? 'shadow-lg border-[#63BD8F] scale-[1.02]' : 'border-[#D1D9C5] hover:border-[#D1D9C5]'}`}
            >
              <span className="text-[#92998B] text-lg select-none">⠿</span>
              {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0" /> : <span className="text-xl">{cat.emoji}</span>}
              <span className="font-medium text-[#614270]">{cat.name}</span>
              <span className="ml-auto text-xs text-[#92998B]">#{idx + 1}</span>
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-[#92998B] text-center py-4">No categories to reorder.</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => { setSaving(true); await onSave(list); setSaving(false) }}
            disabled={saving}
            className="flex-1 py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7db3] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Order'}
          </button>
          <button onClick={onClose} className="flex-1 py-3 bg-[#D1D9C5] text-[#614270] rounded-xl font-semibold hover:bg-[#D1D9C5]">Cancel</button>
        </div>
      </div>
    </div>
  )
}
