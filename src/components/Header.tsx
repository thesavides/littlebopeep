'use client'

import { useAppStore } from '@/store/appStore'
import { signOut, getCurrentUser } from '@/lib/supabase-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
  title?: string
}

export default function Header({ showBackButton = false, onBack, title }: HeaderProps) {
  const router = useRouter()
  const { currentRole, isAdmin, setShowHomePage, setRole, setAdmin, setCurrentUserId } = useAppStore()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPrimaryRole, setUserPrimaryRole] = useState<'walker' | 'farmer' | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserEmail(user.email)
        setUserPrimaryRole(user.role)
        // Set current role to user's primary role if not set
        if (!currentRole) {
          setRole(user.role)
        }
      }
    }
    loadUser()
  }, [currentRole])

  const handleLogoClick = () => {
    setAdmin(false)
    setRole(null)
    setShowHomePage(true)
  }

  const handleRoleSwitch = (role: 'walker' | 'farmer') => {
    // Only allow role switching for farmers (farmers can access walker mode)
    if (userPrimaryRole === 'farmer') {
      setAdmin(false)
      setRole(role)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentUserId(null)
    setRole(null)
    setAdmin(false)
    setShowHomePage(true)
    setUserEmail('')
    setUserPrimaryRole(null)
    router.push('/')
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin'
    if (currentRole === 'walker') return 'Walker'
    if (currentRole === 'farmer') return 'Farmer'
    return ''
  }

  const getRoleEmoji = () => {
    if (isAdmin) return '🛡️'
    if (currentRole === 'walker') return '🚶'
    if (currentRole === 'farmer') return '🧑‍🌾'
    return '🐑'
  }

  return (
    <header className={`shadow-sm sticky top-0 z-50 ${isAdmin ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and back button */}
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button 
                onClick={onBack} 
                className={`${isAdmin ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'}`}
              >
                ←
              </button>
            )}
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🐑</span>
              <span className={`font-bold ${isAdmin ? 'text-white' : 'text-green-800'}`}>
                Little Bo Peep
              </span>
            </button>
            {title && (
              <>
                <span className={`${isAdmin ? 'text-slate-500' : 'text-slate-300'}`}>|</span>
                <span className={`font-medium ${isAdmin ? 'text-white' : 'text-slate-700'}`}>
                  {title}
                </span>
              </>
            )}
          </div>

          {/* Right side - User info and controls */}
          <div className="flex items-center gap-3">
            {/* User email (if logged in) */}
            {userEmail && (
              <span className={`text-sm ${isAdmin ? 'text-slate-300' : 'text-slate-600'}`}>
                {userEmail}
              </span>
            )}

            {/* Current role badge */}
            {currentRole && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? 'bg-slate-700 text-slate-200' 
                  : currentRole === 'walker' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {getRoleEmoji()} {getRoleLabel()}
              </span>
            )}

            {/* Role switcher dropdown (only for farmers - they can access both roles) */}
            {!isAdmin && currentRole && userPrimaryRole === 'farmer' && (
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                  <div className="p-2">
                    <button
                      onClick={() => handleRoleSwitch('walker')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                        currentRole === 'walker' ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>🚶</span> Walker Mode
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('farmer')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                        currentRole === 'farmer' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>🧑‍🌾</span> Farmer Mode
                    </button>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 text-red-600"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout button for walkers (no role switching allowed) */}
            {!isAdmin && currentRole && userPrimaryRole === 'walker' && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Logout
              </button>
            )}

            {/* Admin logout button */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-sm hover:bg-slate-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
