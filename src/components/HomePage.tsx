'use client'

import { useState } from 'react'
import { useAppStore, User } from '@/store/appStore'

export default function HomePage() {
  const { setRole, setAdmin, setShowHomePage, addUser, setCurrentUserId, users } = useAppStore()
  
  const [showRegister, setShowRegister] = useState(false)
  const [registerRole, setRegisterRole] = useState<'walker' | 'farmer'>('walker')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleWalkerClick = () => {
    setRegisterRole('walker')
    setShowRegister(true)
  }

  const handleFarmerClick = () => {
    setRegisterRole('farmer')
    setShowRegister(true)
  }

  // OAuth handlers (would connect to real OAuth in production)
  const handleOAuthLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // In production, this would redirect to OAuth flow
    // For now, simulate successful OAuth login
    const newUser: User = {
      id: Date.now().toString(),
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `user@${provider}.com`,
      role: registerRole,
      status: 'active',
      createdAt: new Date(),
      lastActiveAt: new Date(),
    }
    addUser(newUser)
    setCurrentUserId(newUser.id)
    setRole(registerRole)
    setShowHomePage(false)
    setShowRegister(false)
  }

  // Walker continues as guest (no account, just goes to dashboard)
  const handleContinueAsGuest = () => {
    if (registerRole === 'walker') {
      setRole('walker')
      setShowHomePage(false)
      setShowRegister(false)
    }
  }

  // Create account with email/name
  const handleRegister = () => {
    if (registerRole === 'walker') {
      // Walkers only need a name to create account
      if (name.trim()) {
        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role: 'walker',
          status: 'active',
          createdAt: new Date(),
          lastActiveAt: new Date(),
        }
        addUser(newUser)
        setCurrentUserId(newUser.id)
        setRole('walker')
        setShowHomePage(false)
        setShowRegister(false)
        resetForm()
      }
    } else {
      // Farmers need name and email
      if (name.trim() && email.trim()) {
        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role: 'farmer',
          status: 'active',
          createdAt: new Date(),
          lastActiveAt: new Date(),
        }
        addUser(newUser)
        setCurrentUserId(newUser.id)
        setRole('farmer')
        setShowHomePage(false)
        setShowRegister(false)
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
  }

  const handleAdminClick = () => {
    setAdmin(true)
    setRole('admin')
    setShowHomePage(false)
  }

  const canSubmit = registerRole === 'walker' 
    ? name.trim() 
    : name.trim() && email.trim()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{registerRole === 'walker' ? '🚶' : '🧑‍🌾'}</div>
              <h3 className="text-xl font-bold text-slate-800">
                {registerRole === 'walker' ? 'Walker' : 'Farmer'} Sign In
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                {registerRole === 'walker' 
                  ? 'Sign in to track your reports and get notified when sheep are found'
                  : 'Sign in to set up your farm and receive alerts'
                }
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="w-full py-3 px-4 border border-slate-300 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={() => handleOAuthLogin('apple')}
                className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </button>
              
              <button
                onClick={() => handleOAuthLogin('facebook')}
                className="w-full py-3 px-4 bg-[#1877F2] text-white rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-[#166FE5] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            
            {/* Email Registration Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name {registerRole === 'farmer' && '*'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email {registerRole === 'farmer' ? '*' : '(for notifications)'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone {registerRole === 'walker' ? '(optional)' : ''}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {registerRole === 'walker' && (
                <p className="text-xs text-slate-500">
                  💡 Add your email or phone to be notified when a farmer claims sheep you&apos;ve reported
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRegister}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  registerRole === 'walker' 
                    ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300'
                }`}
              >
                {registerRole === 'farmer' ? 'Continue to Farm Setup' : 'Create Account'}
              </button>
              
              {/* Only walkers can continue as guest */}
              {registerRole === 'walker' && (
                <button
                  onClick={handleContinueAsGuest}
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                >
                  Continue as Guest
                </button>
              )}
              
              <button
                onClick={() => { setShowRegister(false); resetForm() }}
                className="w-full py-2 text-slate-500 text-sm hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐑</span>
              <h1 className="text-xl font-bold text-green-800">Little Bo Peep</h1>
            </div>
            {users.length > 0 && (
              <div className="text-sm text-slate-500">
                {users.length} registered user{users.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Helping sheep get home</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A simple way for countryside walkers to report lost sheep and help farmers recover their flock.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleWalkerClick}
            className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="text-5xl mb-4">🚶</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I&apos;m a Walker</h3>
            <p className="text-slate-600">Spotted some sheep that look lost? Report their location and help a farmer find them.</p>
            <div className="mt-4 text-green-600 font-semibold">Report a sheep →</div>
          </button>

          <button
            onClick={handleFarmerClick}
            className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">🧑‍🌾</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I&apos;m a Farmer</h3>
            <p className="text-slate-600">Set up your farm fields and receive alerts when sheep are spotted nearby.</p>
            <div className="mt-4 text-blue-600 font-semibold">Manage my farm →</div>
          </button>
        </div>

        {/* Admin Link */}
        <div className="text-center mb-12">
          <button onClick={handleAdminClick} className="text-slate-400 hover:text-slate-600 text-sm underline">
            Admin Access
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">How it works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Spot</h4>
              <p className="text-slate-600 text-sm">Walker spots sheep that appear lost or out of place</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Report</h4>
              <p className="text-slate-600 text-sm">Submit location and details through the app</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Reunite</h4>
              <p className="text-slate-600 text-sm">Farmer receives alert and recovers their sheep</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">33M</div>
            <div className="text-sm text-slate-600">Sheep in UK</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">£80M</div>
            <div className="text-sm text-slate-600">Annual losses</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">Free</div>
            <div className="text-sm text-slate-600">For walkers</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2024 Little Bo Peep. Helping sheep get home.</p>
        </div>
      </footer>
    </div>
  )
}
