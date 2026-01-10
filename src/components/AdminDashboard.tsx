'use client'

import { useState, useMemo } from 'react'
import { useAppStore, getDaysSince, MAP_CONFIG } from '@/store/appStore'
import Header from './Header'
import Map from './Map'

type AdminView = 'overview' | 'walkers' | 'farmers' | 'reports' | 'farms' | 'billing'
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
    activateSubscription
  } = useAppStore()

  const [currentView, setCurrentView] = useState<AdminView>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'user' | 'report' | 'farm'>('user')
  
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
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">Farmers ({farmers.length})</h2>
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
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">All Farms ({farms.length})</h2>
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

        <div className="mt-6 bg-slate-200 rounded-xl p-4 text-sm text-slate-600">
          <p>Little Bo Peep Admin Panel • Version 3.0.0</p>
        </div>
      </main>
    </div>
  )
}
