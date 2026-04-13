'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { signOut, getCurrentUser } from '@/lib/unified-auth'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/TranslationContext'
import LanguageSelector from './LanguageSelector'
import ChangePasswordModal from './ChangePasswordModal'

interface ProfileDrawerProps {
  open: boolean
  onClose: () => void
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { currentRole, isAdmin, setShowHomePage, setRole, setAdmin, setCurrentUserId } = useAppStore()

  const [userEmail, setUserEmail] = useState('')
  const [userPrimaryRole, setUserPrimaryRole] = useState<'walker' | 'farmer' | 'admin' | 'super_admin' | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    if (!open) return
    getCurrentUser().then((user) => {
      if (user) {
        setUserEmail(user.email)
        setUserPrimaryRole(user.role)
      }
    })
  }, [open])

  const handleRoleSwitch = (role: 'walker' | 'farmer') => {
    setAdmin(false)
    setRole(role)
    onClose()
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentUserId(null)
    setRole(null)
    setAdmin(false)
    setShowHomePage(true)
    onClose()
    router.push('/')
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin'
    if (currentRole === 'walker') return t('auth.walker', {}, 'Walker')
    if (currentRole === 'farmer') return t('auth.farmer', {}, 'Farmer')
    return ''
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl safe-area-pb animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-5">
          {/* User info */}
          {userEmail && (
            <div className="flex items-center gap-3 py-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">
                {isAdmin ? '🛡️' : currentRole === 'farmer' ? '🧑‍🌾' : '🚶'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{userEmail}</p>
                <p className="text-xs text-slate-500">{getRoleLabel()}</p>
              </div>
            </div>
          )}

          {/* Language */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Language</span>
            <LanguageSelector />
          </div>

          {/* Role switcher (farmers only) */}
          {userPrimaryRole === 'farmer' && !isAdmin && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Switch Mode</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRoleSwitch('walker')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentRole === 'walker'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🚶 {t('header.walkerMode', {}, 'Walker Mode')}
                </button>
                <button
                  onClick={() => handleRoleSwitch('farmer')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentRole === 'farmer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🧑‍🌾 {t('header.farmerMode', {}, 'Farmer Mode')}
                </button>
              </div>
            </div>
          )}

          {/* Account actions */}
          <div className="space-y-1">
            <button
              onClick={() => { setShowChangePassword(true) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-lg">🔑</span>
              <span className="text-sm font-medium text-slate-700">
                {t('header.changePassword', {}, 'Change Password')}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm font-medium text-red-600">
                {t('header.logout', {}, 'Logout')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal (rendered outside the sheet so it stacks above) */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onPasswordChanged={() => {
            alert('Password changed successfully! Please log in again with your new password.')
            handleLogout()
          }}
        />
      )}
    </>
  )
}
