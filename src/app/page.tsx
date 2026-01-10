'use client'

import { useAppStore } from '@/store/appStore'
import HomePage from '@/components/HomePage'
import WalkerDashboard from '@/components/WalkerDashboard'
import FarmerDashboard from '@/components/FarmerDashboard'
import AdminDashboard from '@/components/AdminDashboard'

export default function Page() {
  const { currentRole, showHomePage, isAdmin } = useAppStore()

  if (showHomePage || !currentRole) {
    return <HomePage />
  }

  if (isAdmin || currentRole === 'admin') {
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
