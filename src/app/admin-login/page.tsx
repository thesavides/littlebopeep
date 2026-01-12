'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAdminCredentials, setAdminSession } from '@/lib/admin-auth'
import { useAppStore } from '@/store/appStore'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setRole, setCurrentUserId } = useAppStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await verifyAdminCredentials(username, password)

      if (result.success && result.admin) {
        // Set admin session
        setAdminSession(result.admin)

        // Update app store
        setCurrentUserId(result.admin.id)
        setRole('admin')

        // Redirect to home (will show admin dashboard)
        router.push('/')
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4 border-red-600">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-gray-500">
            Little Bo Peep Administration
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Default Credentials Info (Remove in production) */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center mb-2">
            <strong>Default Credentials (Demo):</strong>
          </p>
          <p className="text-xs text-yellow-700 text-center font-mono">
            Username: admin<br />
            Password: LittleBoP33p2026!
          </p>
          <p className="text-xs text-yellow-600 text-center mt-2">
            ⚠️ Change password after first login
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 All admin actions are logged and monitored
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
