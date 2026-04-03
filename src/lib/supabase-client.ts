import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyfikxdowpekmcxszbqg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types matching our Supabase schema
export interface SheepReportDB {
  id: string
  location: { lat: number; lng: number }
  timestamp: string
  sheep_count: number
  condition: string
  description: string | null
  reporter_contact: string | null
  reporter_id: string | null
  status: 'reported' | 'claimed' | 'resolved'
  claimed_by_farmer_id: string | null
  claimed_at: string | null
  archived: boolean
  photo_urls: string[] | null
  category_id?: string
  category_name?: string
  category_emoji?: string
  created_at?: string
  updated_at?: string
  // Workstream 1: attribution + metadata
  submitted_by_user_name?: string | null
  role_of_submitter?: string | null
  affected_farm_ids?: string[] | null
  affected_farmer_ids?: string[] | null
  location_accuracy?: number | null
  device_type?: string | null
  app_version?: string | null
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
    photoUrls: dbReport.photo_urls || [],
    categoryId: dbReport.category_id || 'sheep',
    categoryName: dbReport.category_name || 'Sheep',
    categoryEmoji: dbReport.category_emoji || '🐑',
    submittedByUserName: dbReport.submitted_by_user_name || undefined,
    roleOfSubmitter: dbReport.role_of_submitter || undefined,
    affectedFarmIds: dbReport.affected_farm_ids || [],
    affectedFarmerIds: dbReport.affected_farmer_ids || [],
    locationAccuracy: dbReport.location_accuracy || undefined,
    deviceType: dbReport.device_type || undefined,
    appVersion: dbReport.app_version || undefined,
  }
}

// Convert App format to DB format
export function appToDbReport(appReport: any) {
  const result: any = {
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
    photo_urls: appReport.photoUrls || [],
    category_id: appReport.categoryId || 'sheep',
    category_name: appReport.categoryName || 'Sheep',
    category_emoji: appReport.categoryEmoji || '🐑',
    submitted_by_user_name: appReport.submittedByUserName || null,
    role_of_submitter: appReport.roleOfSubmitter || null,
    affected_farm_ids: appReport.affectedFarmIds || [],
    affected_farmer_ids: appReport.affectedFarmerIds || [],
    location_accuracy: appReport.locationAccuracy || null,
    device_type: appReport.deviceType || null,
    app_version: appReport.appVersion || null,
  }
  // Only include id if provided — omitting lets Supabase generate a UUID
  if (appReport.id !== undefined) {
    result.id = appReport.id
  }
  return result
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

// ============================================================
// Notifications (Workstream 4)
// ============================================================

export interface NotificationDB {
  id: string
  user_id: string
  report_id: string | null
  type: string
  sent_at: string
  read_at: string | null
  status: string
}

export async function createNotificationsForFarmers(
  reportId: string,
  farmerIds: string[],
  type: string = 'new_report'
): Promise<void> {
  if (farmerIds.length === 0) return
  const rows = farmerIds.map((userId) => ({
    user_id: userId,
    report_id: reportId,
    type,
    status: 'sent',
  }))
  const { error } = await supabase.from('notifications').insert(rows)
  if (error) {
    console.error('Error creating notifications:', error)
  }
}

export async function fetchUserNotifications(userId: string): Promise<NotificationDB[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  return data || []
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString(), status: 'read' })
    .eq('id', notificationId)
  if (error) {
    console.error('Error marking notification read:', error)
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString(), status: 'read' })
    .eq('user_id', userId)
    .is('read_at', null)
  if (error) {
    console.error('Error marking all notifications read:', error)
  }
}

// Report categories
export interface ReportCategoryDB {
  id: string
  name: string
  emoji: string
  description: string | null
  conditions: string[]
  show_count: boolean
  count_label: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export async function fetchReportCategories() {
  const { data, error } = await supabase
    .from('report_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching report categories:', error)
    return []
  }

  return (data || []).map((c: ReportCategoryDB) => ({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    description: c.description || undefined,
    conditions: c.conditions || [],
    showCount: c.show_count,
    countLabel: c.count_label,
    isActive: c.is_active,
    sortOrder: c.sort_order,
    createdAt: new Date(c.created_at),
  }))
}

export async function createReportCategory(category: Omit<import('@/store/appStore').ReportCategory, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('report_categories')
    .insert([{
      name: category.name,
      emoji: category.emoji,
      description: category.description || null,
      conditions: category.conditions,
      show_count: category.showCount,
      count_label: category.countLabel,
      is_active: category.isActive,
      sort_order: category.sortOrder,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating report category:', error)
    throw error
  }
  return data
}

export async function updateReportCategoryDB(id: string, updates: any) {
  const { data, error } = await supabase
    .from('report_categories')
    .update({
      name: updates.name,
      emoji: updates.emoji,
      description: updates.description || null,
      conditions: updates.conditions,
      show_count: updates.showCount,
      count_label: updates.countLabel,
      is_active: updates.isActive,
      sort_order: updates.sortOrder,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating report category:', error)
    throw error
  }
  return data
}

export async function deleteReportCategoryDB(id: string) {
  const { error } = await supabase
    .from('report_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting report category:', error)
    throw error
  }
}

// ==================== FARMS ====================

export interface FarmDB {
  id: string
  farmer_id: string
  name: string
  address: string | null
  alert_buffer_meters: number
  alerts_enabled: boolean
  category_subscriptions: Record<string, boolean> | null
  created_at: string
  updated_at: string
  farm_fields?: {
    id: string
    farm_id: string
    name: string
    fence_posts: Array<{ lat: number; lng: number }>
    created_at: string
  }[]
}

export function dbToAppFarm(dbFarm: FarmDB) {
  return {
    id: dbFarm.id,
    farmerId: dbFarm.farmer_id,
    name: dbFarm.name,
    address: dbFarm.address || undefined,
    alertBufferMeters: dbFarm.alert_buffer_meters,
    alertsEnabled: dbFarm.alerts_enabled,
    categorySubscriptions: dbFarm.category_subscriptions || {},
    createdAt: new Date(dbFarm.created_at),
    fields: (dbFarm.farm_fields || []).map(f => ({
      id: f.id,
      name: f.name,
      fencePosts: f.fence_posts,
    })),
  }
}

export async function fetchFarms() {
  const { data, error } = await supabase
    .from('farms')
    .select('*, farm_fields(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching farms:', error)
    return []
  }
  return (data || []).map(dbToAppFarm)
}

export async function createFarmInSupabase(farm: {
  farmerId: string
  name: string
  alertBufferMeters?: number
  alertsEnabled?: boolean
  categorySubscriptions?: Record<string, boolean>
  address?: string
}) {
  const { data, error } = await supabase
    .from('farms')
    .insert([{
      farmer_id: farm.farmerId,
      name: farm.name,
      address: farm.address || null,
      alert_buffer_meters: farm.alertBufferMeters ?? 500,
      alerts_enabled: farm.alertsEnabled !== false,
      category_subscriptions: farm.categorySubscriptions || {},
    }])
    .select('*, farm_fields(*)')
    .single()

  if (error) {
    console.error('Error creating farm:', error)
    throw error
  }
  return dbToAppFarm(data)
}

export async function updateFarmInSupabase(id: string, updates: {
  name?: string
  alertBufferMeters?: number
  alertsEnabled?: boolean
  categorySubscriptions?: Record<string, boolean>
  address?: string
  farmerId?: string | null
}) {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.alertBufferMeters !== undefined) dbUpdates.alert_buffer_meters = updates.alertBufferMeters
  if (updates.alertsEnabled !== undefined) dbUpdates.alerts_enabled = updates.alertsEnabled
  if (updates.categorySubscriptions !== undefined) dbUpdates.category_subscriptions = updates.categorySubscriptions
  if (updates.address !== undefined) dbUpdates.address = updates.address || null
  if ('farmerId' in updates) dbUpdates.farmer_id = updates.farmerId || null

  const { data, error } = await supabase
    .from('farms')
    .update(dbUpdates)
    .eq('id', id)
    .select('*, farm_fields(*)')
    .single()

  if (error) {
    console.error('Error updating farm:', error)
    throw error
  }
  return data ? dbToAppFarm(data) : null
}

export async function deleteFarmInSupabase(id: string) {
  const { error } = await supabase
    .from('farms')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting farm:', error)
    throw error
  }
}

export async function addFieldToFarm(farmId: string, field: {
  name: string
  fencePosts: Array<{ lat: number; lng: number }>
}) {
  const { data, error } = await supabase
    .from('farm_fields')
    .insert([{
      farm_id: farmId,
      name: field.name,
      fence_posts: field.fencePosts,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding field:', error)
    throw error
  }
  return { id: data.id, name: data.name, fencePosts: data.fence_posts as Array<{ lat: number; lng: number }> }
}

export async function updateFieldInFarm(fieldId: string, updates: {
  name?: string
  fencePosts?: Array<{ lat: number; lng: number }>
}) {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.fencePosts !== undefined) dbUpdates.fence_posts = updates.fencePosts

  const { data, error } = await supabase
    .from('farm_fields')
    .update(dbUpdates)
    .eq('id', fieldId)
    .select()
    .single()

  if (error) {
    console.error('Error updating field:', error)
    throw error
  }
  return data ? { id: data.id, name: data.name, fencePosts: data.fence_posts as Array<{ lat: number; lng: number }> } : null
}

export async function deleteFieldFromFarm(fieldId: string) {
  const { error } = await supabase
    .from('farm_fields')
    .delete()
    .eq('id', fieldId)

  if (error) {
    console.error('Error deleting field:', error)
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
