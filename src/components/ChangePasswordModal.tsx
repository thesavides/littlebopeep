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
          <h3 className="text-xl font-semibold text-[#614270]">Change Password</h3>
          <button
            onClick={onClose}
            className="text-[#92998B] hover:text-[#614270] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-lg">
            <p className="text-sm text-[#a0522d]">{error}</p>
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
              className="flex-1 py-2 bg-[#7D8DCC] text-white rounded-lg font-semibold hover:bg-[#6b7bb8] disabled:bg-[#D1D9C5] disabled:text-[#92998B] disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 bg-[#D1D9C5] text-[#614270] rounded-lg font-semibold hover:bg-[#c5cdb9] disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-[#EADA69]/10 border border-[#EADA69]/40 rounded-lg">
          <p className="text-xs text-[#614270]">
            <strong>Security tip:</strong> Use a strong password with a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  )
}
