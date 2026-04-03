'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import HomePage from '@/components/HomePage'
import WalkerDashboard from '@/components/WalkerDashboard'
import FarmerDashboard from '@/components/FarmerDashboard'
import AdminDashboard from '@/components/AdminDashboard'

export default function Page() {
  const router = useRouter()
  const { currentRole, showHomePage, isAdmin } = useAppStore()

  // Supabase sometimes lands the user on / instead of /auth/reset-password
  // when the redirect_to param is missing. Detect the recovery token here and redirect.
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    if (
      (hash && hash.includes('type=recovery')) ||
      params.get('type') === 'recovery'
    ) {
      router.replace('/auth/reset-password' + window.location.hash + window.location.search)
      return
    }
  }, [])

  if (showHomePage || !currentRole) {
    return <HomePage />
  }

  if (isAdmin || currentRole === 'admin' || currentRole === 'super_admin') {
    return <AdminDashboard />
  }

  if (currentRole === 'walker') {
    return <WalkerDashboard />
  }

  if (currentRole === 'farmer') {
    return <FarmerDashboard />
  }

  return <HomePage />
}
