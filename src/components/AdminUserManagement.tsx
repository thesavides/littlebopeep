'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, getAllUsers, inviteUser, suspendUser, activateUser, adminResetUserPassword, UserProfile } from '@/lib/unified-auth'
import ChangePasswordModal from './ChangePasswordModal'
import PasswordInput from './PasswordInput'
import { useTranslation } from '@/contexts/TranslationContext'

export default function AdminUserManagement() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin' | 'farmer' | 'walker',
  })

  useEffect(() => {
    loadUsers()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { success, users: userList, error: loadError } = await getAllUsers()
      if (success && userList) {
        // Filter to show only admins and super_admins
        setUsers(userList.filter(u => u.role === 'admin' || u.role === 'super_admin'))
      } else {
        setError(loadError || 'Failed to load users')
      }
    } catch (err: any) {
      setError('Failed to load admin users')
      console.error('Load users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentUser) {
      setError('You must be logged in as an admin')
      return
    }

    if (currentUser.role !== 'super_admin') {
      setError('Only super admins can create new admin users')
      return
    }

    try {
      const { success: inviteSuccess, user, error: inviteError } = await inviteUser(
        formData.email,
        formData.fullName,
        formData.role,
        formData.phone
      )

      if (!inviteSuccess) {
        setError(inviteError || 'Failed to invite user')
        return
      }

      setSuccess(`User "${formData.email}" invited successfully. They will receive an email with setup instructions.`)
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        role: 'admin',
      })
      setShowCreateModal(false)
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to invite user')
      console.error('Invite user error:', err)
    }
  }

  const handleSuspendUser = async (userId: string, email: string) => {
    if (!currentUser?.role || currentUser.role !== 'super_admin') {
      setError('Only super admins can suspend users')
      return
    }

    if (!confirm(`Are you sure you want to suspend "${email}"?`)) {
      return
    }

    try {
      const { success: suspendSuccess, error: suspendError } = await suspendUser(userId)
      if (suspendSuccess) {
        setSuccess(`User "${email}" suspended`)
        loadUsers()
      } else {
        setError(suspendError || 'Failed to suspend user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user')
      console.error('Suspend user error:', err)
    }
  }

  const handleActivateUser = async (userId: string, email: string) => {
    if (!currentUser?.role || currentUser.role !== 'super_admin') {
      setError('Only super admins can activate users')
      return
    }

    try {
      const { success: activateSuccess, error: activateError } = await activateUser(userId)
      if (activateSuccess) {
        setSuccess(`User "${email}" activated`)
        loadUsers()
      } else {
        setError(activateError || 'Failed to activate user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate user')
      console.error('Activate user error:', err)
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    if (!currentUser?.role || currentUser.role !== 'super_admin') {
      setError('Only super admins can reset passwords')
      return
    }

    if (!confirm(`Send password reset email to "${email}"?`)) {
      return
    }

    try {
      const { success: resetSuccess, error: resetError } = await adminResetUserPassword(userId, email)
      if (resetSuccess) {
        setSuccess(`Password reset email sent to "${email}"`)
      } else {
        setError(resetError || 'Failed to send password reset')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
      console.error('Reset password error:', err)
    }
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center">
        <p className="text-slate-600">You must be logged in as an admin to view this page</p>
      </div>
    )
  }

  const isSuperAdmin = currentUser.role === 'super_admin'

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin User Management</h2>
            <p className="text-slate-600">Manage admin accounts and permissions</p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              + Invite User
            </button>
          )}
        </div>

        {/* Current Admin Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-800">
            <strong>Logged in as:</strong> {currentUser.email}
            {isSuperAdmin && ' (Super Admin)'}
          </p>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Change Password
          </button>
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
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No admin users found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className={user.status !== 'active' ? 'bg-slate-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{user.full_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'super_admin' ? (
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
                    {user.status === 'active' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : user.status === 'suspended' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : user.status === 'pending_verification' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Password Reset Required
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {isSuperAdmin && user.id !== currentUser.id && (
                        <>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleSuspendUser(user.id, user.email)}
                              className="text-amber-600 hover:text-amber-800 font-medium"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id, user.email)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleResetPassword(user.id, user.email)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Reset Password
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Invite New User</h3>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07700 900123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="walker">Walker</option>
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.role === 'super_admin' && 'Can create and manage all users'}
                  {formData.role === 'admin' && 'Can manage walkers and farmers'}
                  {formData.role === 'farmer' && 'Can manage farms and claim reports'}
                  {formData.role === 'walker' && 'Can report sheep sightings'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> User will receive an email invitation with a password reset link. They must set their password before they can log in.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      email: '',
                      fullName: '',
                      phone: '',
                      role: 'admin',
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChanged={() => {
            setSuccess('Password changed successfully')
            setShowChangePasswordModal(false)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}
    </div>
  )
}
