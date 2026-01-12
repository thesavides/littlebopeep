'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/unified-auth'
import PasswordInput from './PasswordInput'

interface ChangePasswordModalProps {
  onClose: () => void
  onPasswordChanged: () => void
}

export default function ChangePasswordModal({
  onClose,
  onPasswordChanged
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)

    const { success, error: changeError } = await changePassword(newPassword)

    if (!success) {
      setError(changeError || 'Failed to change password')
      setLoading(false)
      return
    }

    setLoading(false)
    onPasswordChanged()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Change Password</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            helperText="Minimum 8 characters"
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter new password"
          />

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Security tip:</strong> Use a strong password with a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  )
}
