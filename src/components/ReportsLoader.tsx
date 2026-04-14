'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

/**
 * ReportsLoader component
 * Loads all reports from Supabase when the app starts
 * and keeps them in sync with real-time updates
 */
export default function ReportsLoader() {
  const loadReports = useAppStore((state) => state.loadReports)
  const loadCategories = useAppStore((state) => state.loadCategories)

  useEffect(() => {
    // Load reports and categories on mount
    loadReports()
    loadCategories()

    // Reload reports every 30 seconds to stay fresh
    const interval = setInterval(() => {
      loadReports()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadReports, loadCategories])

  return null // This component doesn't render anything
}
