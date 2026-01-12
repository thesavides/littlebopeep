'use client'

import { useState, useMemo } from 'react'
import { useAppStore, getDaysSince, MAP_CONFIG } from '@/store/appStore'
import Header from './Header'
import Map from './Map'
import AdminUserManagement from './AdminUserManagement'

type AdminView = 'overview' | 'walkers' | 'farmers' | 'reports' | 'farms' | 'billing' | 'admins'
type SortBy = 'date' | 'daysUnclaimed'
type FilterStatus = 'all' | 'reported' | 'claimed' | 'resolved'
type FilterArchive = 'active' | 'archived' | 'all'

export default function AdminDashboard() {
  const {
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
    resolveReport
  } = useAppStore()

  const [currentView, setCurrentView] = useState<AdminView>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'user' | 'report' | 'farm' | 'field'>('user')

  // Modal states for CRUD operations
  const [showCreateFarmerModal, setShowCreateFarmerModal] = useState(false)
  const [showEditFarmerModal, setShowEditFarmerModal] = useState<string | null>(null)
  const [showCreateFarmModal, setShowCreateFarmModal] = useState(false)
  const [showEditFarmModal, setShowEditFarmModal] = useState<string | null>(null)
  const [showCreateFieldModal, setShowCreateFieldModal] = useState<string | null>(null) // farmId
  const [showEditFieldModal, setShowEditFieldModal] = useState<{farmId: string, fieldId: string} | null>(null)
  const [showClaimReportModal, setShowClaimReportModal] = useState<string | null>(null) // reportId
  const [showFarmDetailsModal, setShowFarmDetailsModal] = useState<string | null>(null) // farmId
  
  // Report filters and sorting
  const [sortBy, setSortBy] = useState<SortBy>('daysUnclaimed')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterArchive, setFilterArchive] = useState<FilterArchive>('active')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [mapBounds, setMapBounds] = useState<{north: number, south: number, east: number, west: number} | null>(null)

  // Stats
  const walkers = users.filter(u => u.role === 'walker')
  const farmers = users.filter(u => u.role === 'farmer')
  const activeUsers = users.filter(u => u.status === 'active').length
  
  const reportedCount = reports.filter((r) => r.status === 'reported' && !r.archived).length
  const claimedCount = reports.filter((r) => r.status === 'claimed' && !r.archived).length
  const resolvedCount = reports.filter((r) => r.status === 'resolved' && !r.archived).length
  const archivedCount = reports.filter((r) => r.archived).length
  
  const totalFields = farms.reduce((sum, f) => sum + f.fields.length, 0)

  // Subscription stats
  const trialFarmers = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'trial').length
  const activeSubs = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'active').length
  const cancelledSubs = farmers.filter(f => users.find(u => u.id === f.id)?.subscriptionStatus === 'cancelled').length

  // Filtered and sorted reports
  const filteredReports = useMemo(() => {
    let result = [...reports]
    
    // Filter by archive status
    if (filterArchive === 'active') {
      result = result.filter(r => !r.archived)
    } else if (filterArchive === 'archived') {
      result = result.filter(r => r.archived)
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus)
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
  }, [reports, filterStatus, filterArchive, sortBy, mapBounds])

  const handleDelete = () => {
    if (!showDeleteConfirm) return
    if (deleteType === 'user') deleteUser(showDeleteConfirm)
    else if (deleteType === 'report') deleteReport(showDeleteConfirm)
    else if (deleteType === 'farm') deleteFarm(showDeleteConfirm)
    setShowDeleteConfirm(null)
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
      <Header title="Admin Dashboard" />

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
        farmers={farmers}
        onClose={() => setShowCreateFarmModal(false)}
        onCreate={(farm: any) => {
          addFarm(farm)
          setShowCreateFarmModal(false)
        }}
      />}

      {/* Edit Farm Modal */}
      {showEditFarmModal && <EditFarmModal
        farm={farms.find(f => f.id === showEditFarmModal)!}
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
        farmers={farmers}
        onClose={() => setShowClaimReportModal(null)}
        onClaim={(reportId: string, farmerId: string) => {
          claimReportForFarmer(reportId, farmerId)
          setShowClaimReportModal(null)
        }}
      />}

      {/* Navigation */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <NavButton view="overview" label="Overview" />
            <NavButton view="walkers" label="Walkers" count={walkers.length} />
            <NavButton view="farmers" label="Farmers" count={farmers.length} />
            <NavButton view="reports" label="Reports" count={reports.filter(r => !r.archived).length} />
            <NavButton view="farms" label="Farms" count={farms.length} />
            <NavButton view="billing" label="Billing" />
            <NavButton view="admins" label="Admin Users" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ===== OVERVIEW ===== */}
        {currentView === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-slate-800">{users.length}</div>
                <div className="text-sm text-slate-500">Total Users</div>
                <div className="text-xs text-green-600 mt-1">{activeUsers} active</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-green-600">{walkers.length}</div>
                <div className="text-sm text-slate-500">Walkers</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-blue-600">{farmers.length}</div>
                <div className="text-sm text-slate-500">Farmers</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-3xl font-bold text-amber-600">{farms.length}</div>
                <div className="text-sm text-slate-500">Farms ({totalFields} fields)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{reportedCount}</div>
                <div className="text-sm text-yellow-600">Reported</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{claimedCount}</div>
                <div className="text-sm text-blue-600">Claimed</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{resolvedCount}</div>
                <div className="text-sm text-green-600">Resolved</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl font-bold text-slate-700">{archivedCount}</div>
                <div className="text-sm text-slate-600">Archived</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{activeSubs}</div>
                <div className="text-sm text-purple-600">Paid Subs</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow mb-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-slate-800">Activity Map</h2>
              </div>
              <div className="h-80">
                <Map
                  center={[54.5, -2]}
                  zoom={MAP_CONFIG.STANDARD_ZOOM_5KM}
                  markers={reports.filter(r => !r.archived).map((r) => ({
                    id: r.id,
                    position: [r.location.lat, r.location.lng] as [number, number],
                    popup: `🐑 ${r.sheepCount} sheep - ${r.status}`,
                    type: 'sheep' as const
                  }))}
                  polygons={allFieldPolygons}
                />
              </div>
            </div>
          </>
        )}

        {/* ===== WALKERS ===== */}
        {currentView === 'walkers' && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">Walkers ({walkers.length})</h2>
            </div>
            {walkers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🚶</div>No walkers registered yet
              </div>
            ) : (
              <div className="divide-y">
                {walkers.map((user) => {
                  const userReports = reports.filter(r => r.reporterId === user.id)
                  return (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">🚶</div>
                        <div>
                          <div className="font-medium text-slate-800">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email || 'No email'}</div>
                          <div className="text-xs text-slate-400">{userReports.length} reports</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                        {user.status === 'active' ? (
                          <button onClick={() => suspendUser(user.id)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-sm hover:bg-amber-200">Suspend</button>
                        ) : (
                          <button onClick={() => activateUser(user.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Activate</button>
                        )}
                        <button onClick={() => confirmDelete(user.id, 'user')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== FARMERS ===== */}
        {currentView === 'farmers' && (
          <div className="bg-white rounded-xl shadow">
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
              <div className="divide-y">
                {farmers.map((user) => {
                  const userFarms = farms.filter(f => f.farmerId === user.id)
                  return (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">🧑‍🌾</div>
                        <div>
                          <div className="font-medium text-slate-800">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email || 'No email'}</div>
                          <div className="text-xs text-slate-400">{userFarms.length} farm(s)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSubscriptionBadge(user)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                        <button onClick={() => setShowEditFarmerModal(user.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">Edit</button>
                        {user.status === 'active' ? (
                          <button onClick={() => suspendUser(user.id)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-sm hover:bg-amber-200">Suspend</button>
                        ) : (
                          <button onClick={() => activateUser(user.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Activate</button>
                        )}
                        <button onClick={() => confirmDelete(user.id, 'user')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
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
                </div>
                <div className="flex gap-2">
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
                    popup: `🐑 ${r.sheepCount} - ${r.status}`,
                    type: 'sheep' as const
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
                  {filteredReports.map((report) => (
                    <div key={report.id} className={`p-4 flex items-center justify-between ${report.archived ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedReports.includes(report.id)} onChange={() => handleSelectReport(report.id)} className="rounded" />
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">🐑</div>
                        <div>
                          <div className="font-medium text-slate-800">{report.sheepCount} sheep • {report.condition}</div>
                          <div className="text-sm text-slate-500">{new Date(report.timestamp).toLocaleString()}</div>
                          {report.description && <div className="text-xs text-slate-400 truncate max-w-xs">{report.description}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDaysUnclaimedBadge(report)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          report.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{report.status}</span>
                        {report.archived && <span className="px-2 py-1 rounded text-xs bg-slate-200 text-slate-600">Archived</span>}
                        {!report.archived && report.status === 'reported' && (
                          <button onClick={() => setShowClaimReportModal(report.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Claim for Farmer</button>
                        )}
                        {!report.archived && report.status === 'claimed' && (
                          <button onClick={() => resolveReport(report.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">Resolve</button>
                        )}
                        {!report.archived && (
                          <button onClick={() => archiveReport(report.id)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200">Archive</button>
                        )}
                        <button onClick={() => confirmDelete(report.id, 'report')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  ))}
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
                  const owner = users.find(u => u.id === farm.farmerId)
                  return (
                    <div key={farm.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">🏡</div>
                        <div>
                          <div className="font-medium text-slate-800">{farm.name}</div>
                          <div className="text-sm text-slate-500">{farm.fields.length} fields • Buffer: {farm.alertBufferMeters}m</div>
                          <div className="text-xs text-slate-400">Owner: {owner?.name || 'Unknown'}</div>
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

        <div className="mt-6 bg-slate-200 rounded-xl p-4 text-sm text-slate-600">
          <p>Little Bo Peep Admin Panel • Version 3.0.0</p>
        </div>
      </main>
    </div>
  )
}

// ===== MODAL COMPONENTS =====

function CreateFarmerModal({ onClose, onCreate }: { onClose: () => void; onCreate: (farmer: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [billingAddress, setBillingAddress] = useState({
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

    onCreate({
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
          <h3 className="text-xl font-bold text-slate-800">Add New Farmer</h3>
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
              placeholder="John Smith"
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
              placeholder="john@farm.com"
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
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              Create Farmer
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
                  {farmer.name} ({farmer.email || 'No email'})
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

function EditFarmModal({ farm, onClose, onSave }: { farm: any; onClose: () => void; onSave: (id: string, data: any) => void }) {
  const [name, setName] = useState(farm.name)
  const [alertBufferMeters, setAlertBufferMeters] = useState(farm.alertBufferMeters)
  const [alertsEnabled, setAlertsEnabled] = useState(farm.alertsEnabled)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter farm name')
      return
    }

    onSave(farm.id, {
      name: name.trim(),
      alertBufferMeters,
      alertsEnabled
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Edit Farm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

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

function FarmDetailsModal({ farm, owner, onClose, onAddField, onEditField, onDeleteField }: any) {
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
          <div className="space-y-3 max-h-96 overflow-y-auto">
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
  const [fencePosts, setFencePosts] = useState<{lat: number, lng: number}[]>([
    { lat: 54.5, lng: -2 },
    { lat: 54.501, lng: -2 },
    { lat: 54.501, lng: -2.001 },
    { lat: 54.5, lng: -2.001 }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter field name')
      return
    }
    if (fencePosts.length < 3) {
      alert('Field must have at least 3 fence posts')
      return
    }

    onCreate(farmId, {
      name: name.trim(),
      fencePosts,
      sheepCount: sheepCount ? parseInt(sheepCount) : undefined,
      color: '#22c55e'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
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

          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
            ⚠️ Field boundary drawing not yet implemented. Default rectangle will be created.
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Create Field</button>
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
            <div>🐑 {report.sheepCount} sheep ({report.condition})</div>
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
                  {farmer.name} ({farmer.email || 'No email'})
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
