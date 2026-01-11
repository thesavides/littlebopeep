import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyflkxdowpekmcxszbqg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types matching our Supabase schema
export interface SheepReportDB {
  id: string
  location: { lat: number; lng: number }
  timestamp: string
  sheep_count: number
  condition: 'healthy' | 'injured' | 'unknown'
  description: string | null
  reporter_contact: string | null
  reporter_id: string | null
  status: 'reported' | 'claimed' | 'resolved'
  claimed_by_farmer_id: string | null
  claimed_at: string | null
  archived: boolean
  created_at?: string
  updated_at?: string
}

// Convert DB format to App format
export function dbToAppReport(dbReport: SheepReportDB) {
  return {
    id: dbReport.id,
    location: dbReport.location,
    timestamp: new Date(dbReport.timestamp),
    sheepCount: dbReport.sheep_count,
    condition: dbReport.condition,
    description: dbReport.description || '',
    reporterContact: dbReport.reporter_contact || undefined,
    reporterId: dbReport.reporter_id || undefined,
    status: dbReport.status,
    claimedByFarmerId: dbReport.claimed_by_farmer_id || undefined,
    claimedAt: dbReport.claimed_at ? new Date(dbReport.claimed_at) : undefined,
    archived: dbReport.archived || false,
  }
}

// Convert App format to DB format
export function appToDbReport(appReport: any) {
  return {
    id: appReport.id,
    location: appReport.location,
    timestamp: appReport.timestamp instanceof Date ? appReport.timestamp.toISOString() : appReport.timestamp,
    sheep_count: appReport.sheepCount,
    condition: appReport.condition,
    description: appReport.description || null,
    reporter_contact: appReport.reporterContact || null,
    reporter_id: appReport.reporterId || null,
    status: appReport.status,
    claimed_by_farmer_id: appReport.claimedByFarmerId || null,
    claimed_at: appReport.claimedAt ? (appReport.claimedAt instanceof Date ? appReport.claimedAt.toISOString() : appReport.claimedAt) : null,
    archived: appReport.archived || false,
  }
}

// Fetch all recent reports (not archived, within time range)
export async function fetchRecentReports(hoursAgo: number = 24) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('sheep_reports')
    .select('*')
    .eq('archived', false)
    .gte('timestamp', cutoffTime)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching reports:', error)
    return []
  }

  return (data || []).map(dbToAppReport)
}

// Fetch all reports (for farmers/admin)
export async function fetchAllReports() {
  const { data, error } = await supabase
    .from('sheep_reports')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching all reports:', error)
    return []
  }

  return (data || []).map(dbToAppReport)
}

// Create a new report
export async function createReport(report: any) {
  const dbReport = appToDbReport(report)

  console.log('Attempting to create report in Supabase:', dbReport)

  const { data, error } = await supabase
    .from('sheep_reports')
    .insert([dbReport])
    .select()
    .single()

  if (error) {
    console.error('Error creating report:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    console.error('Report data attempted:', JSON.stringify(dbReport, null, 2))
    throw error
  }

  console.log('Report created successfully:', data)
  return data ? dbToAppReport(data) : null
}

// Update a report (for claiming, resolving, archiving)
export async function updateReport(reportId: string, updates: Partial<any>) {
  const dbUpdates = appToDbReport({ id: reportId, ...updates })

  const { data, error } = await supabase
    .from('sheep_reports')
    .update(dbUpdates)
    .eq('id', reportId)
    .select()
    .single()

  if (error) {
    console.error('Error updating report:', error)
    throw error
  }

  return data ? dbToAppReport(data) : null
}

// Delete a report
export async function deleteReport(reportId: string) {
  const { error } = await supabase
    .from('sheep_reports')
    .delete()
    .eq('id', reportId)

  if (error) {
    console.error('Error deleting report:', error)
    throw error
  }
}

// Subscribe to real-time changes
export function subscribeToReports(callback: (report: any) => void) {
  const channel = supabase
    .channel('sheep_reports_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sheep_reports',
      },
      (payload) => {
        if (payload.new) {
          callback(dbToAppReport(payload.new as SheepReportDB))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
