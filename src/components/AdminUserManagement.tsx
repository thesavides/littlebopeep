'use client'

import { useState, useEffect } from 'react'
import { getAdminSession, createAdminUser, getAllAdmins, deactivateAdmin, AdminCredential } from '@/lib/admin-auth'

export default function AdminUserManagement() {
  const [admins, setAdmins] = useState<AdminCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    isSuperAdmin: false,
  })

  const currentAdmin = getAdminSession()

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const adminList = await getAllAdmins()
      setAdmins(adminList)
    } catch (err: any) {
      setError('Failed to load admin users')
      console.error('Load admins error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentAdmin) {
      setError('You must be logged in as an admin')
      return
    }

    if (!currentAdmin.is_super_admin) {
      setError('Only super admins can create new admin users')
      return
    }

    try {
      await createAdminUser(
        formData.username,
        formData.password,
        formData.email,
        formData.fullName,
        formData.isSuperAdmin,
        currentAdmin.id
      )

      setSuccess(`Admin user "${formData.username}" created successfully`)
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        isSuperAdmin: false,
      })
      setShowCreateModal(false)
      loadAdmins()
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user')
      console.error('Create admin error:', err)
    }
  }

  const handleDeactivate = async (adminId: string, username: string) => {
    if (!currentAdmin?.is_super_admin) {
      setError('Only super admins can deactivate admin users')
      return
    }

    if (!confirm(`Are you sure you want to deactivate admin "${username}"?`)) {
      return
    }

    try {
      await deactivateAdmin(adminId)
      setSuccess(`Admin "${username}" deactivated`)
      loadAdmins()
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate admin')
      console.error('Deactivate admin error:', err)
    }
  }

  if (!currentAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center">
        <p className="text-slate-600">You must be logged in as an admin to view this page</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin User Management</h2>
            <p className="text-slate-600">Manage admin accounts and permissions</p>
          </div>
          {currentAdmin.is_super_admin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              + Create Admin
            </button>
          )}
        </div>

        {/* Current Admin Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Logged in as:</strong> {currentAdmin.username}
            {currentAdmin.is_super_admin && ' (Super Admin)'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading admin users...</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No admin users found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {admins.map((admin) => (
                <tr key={admin.id} className={!admin.is_active ? 'bg-slate-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{admin.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{admin.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{admin.full_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_super_admin ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Super Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {currentAdmin.is_super_admin && admin.is_active && admin.id !== currentAdmin.id && (
                      <button
                        onClick={() => handleDeactivate(admin.id, admin.username)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Admin</h3>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin_username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSuperAdmin"
                  checked={formData.isSuperAdmin}
                  onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isSuperAdmin" className="ml-2 text-sm text-slate-700">
                  Grant Super Admin privileges (can create other admins)
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      username: '',
                      password: '',
                      email: '',
                      fullName: '',
                      isSuperAdmin: false,
                    })
                  }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
