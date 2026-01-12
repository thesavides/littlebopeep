'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main auth page
    // Admin users now log in using their email through the unified auth system
    router.replace('/auth')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4 border-red-600">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-slate-600 mb-4">
            Admin login has been unified with the main authentication system.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    </div>
  )
}
