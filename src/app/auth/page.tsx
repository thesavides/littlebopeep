'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/supabase-auth'
import { useAppStore } from '@/store/appStore'

export default function AuthPage() {
  const router = useRouter()
  const { setRole, setCurrentUserId } = useAppStore()
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRoleSelection] = useState<'walker' | 'farmer'>('walker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUp(email, password, role)
        if (signUpError) throw signUpError
        if (data.user) {
          setCurrentUserId(data.user.id)
          setRole(role)
          router.push('/')
        }
      } else {
        const { data, error: signInError } = await signIn(email, password)
        if (signInError) throw signInError
        if (data.user) {
          const userRole = data.user.user_metadata?.role as 'walker' | 'farmer'
          setCurrentUserId(data.user.id)
          setRole(userRole || 'walker')
          router.push('/')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Little Bo Peep
        </h1>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="walker"
                    checked={role === 'walker'}
                    onChange={(e) => setRoleSelection(e.target.value as 'walker')}
                    className="mr-2"
                  />
                  <span>Walker</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="farmer"
                    checked={role === 'farmer'}
                    onChange={(e) => setRoleSelection(e.target.value as 'farmer')}
                    className="mr-2"
                  />
                  <span>Farmer</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="you@example.com"
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
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            onClick={() => router.push('/')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
