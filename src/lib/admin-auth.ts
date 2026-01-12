/**
 * Admin Authentication Library
 * Handles admin login, password verification, and admin user management
 */

import { supabase } from './supabase-client'

export interface AdminCredential {
  id: string
  username: string
  email?: string
  full_name?: string
  is_super_admin: boolean
  created_at: string
  last_login_at?: string
  is_active: boolean
}

/**
 * Hash password using bcrypt
 * NOTE: In production, this should be done server-side
 * For now, we'll use a simple client-side hash (NOT SECURE FOR PRODUCTION)
 */
async function hashPassword(password: string): Promise<string> {
  // Simple SHA-256 hash for demo purposes
  // TODO: Replace with proper bcrypt server-side hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; admin?: AdminCredential; error?: string }> {
  try {
    // For demo: accept the default password
    const isDefaultPassword = username === 'admin' && password === 'LittleBoP33p2026!'

    if (isDefaultPassword) {
      // Return mock admin for default credentials
      const mockAdmin: AdminCredential = {
        id: 'default-admin-id',
        username: 'admin',
        email: 'admin@littlebopeep.com',
        full_name: 'Super Administrator',
        is_super_admin: true,
        created_at: new Date().toISOString(),
        is_active: true
      }

      // Update last login
      await updateAdminLastLogin('default-admin-id')

      return { success: true, admin: mockAdmin }
    }

    // Hash the provided password
    const passwordHash = await hashPassword(password)

    // Query admin_credentials table
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('username', username)
      .eq('password_hash', passwordHash)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login timestamp
    await updateAdminLastLogin(data.id)

    return { success: true, admin: data }
  } catch (error) {
    console.error('Admin auth error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Update admin last login timestamp
 */
async function updateAdminLastLogin(adminId: string): Promise<void> {
  try {
    await supabase
      .from('admin_credentials')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminId)
  } catch (error) {
    console.error('Failed to update last login:', error)
  }
}

/**
 * Get all admins (for super admins only)
 */
export async function getAllAdmins(): Promise<AdminCredential[]> {
  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id, username, email, full_name, is_super_admin, created_at, last_login_at, is_active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admins:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to get admins:', error)
    return []
  }
}

/**
 * Create new admin user (super admin only)
 */
export async function createAdminUser(
  username: string,
  password: string,
  email: string,
  fullName: string,
  isSuperAdmin: boolean = false,
  createdBy: string
): Promise<{ success: boolean; error?: string; admin?: AdminCredential }> {
  try {
    // Validate input
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' }
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert new admin
    const { data, error } = await supabase
      .from('admin_credentials')
      .insert([
        {
          username,
          password_hash: passwordHash,
          email,
          full_name: fullName,
          is_super_admin: isSuperAdmin,
          created_by: createdBy,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return { success: false, error: 'Username already exists' }
      }
      return { success: false, error: error.message }
    }

    return { success: true, admin: data }
  } catch (error) {
    console.error('Failed to create admin:', error)
    return { success: false, error: 'Failed to create admin user' }
  }
}

/**
 * Deactivate admin user (super admin only)
 */
export async function deactivateAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_credentials')
      .update({ is_active: false })
      .eq('id', adminId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to deactivate admin:', error)
    return { success: false, error: 'Failed to deactivate admin' }
  }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  adminId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' }
    }

    // Verify old password first
    const { data: admin } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .eq('id', adminId)
      .single()

    if (!admin) {
      return { success: false, error: 'Admin not found' }
    }

    const oldPasswordHash = await hashPassword(oldPassword)
    if (admin.password_hash !== oldPasswordHash) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword)
    const { error } = await supabase
      .from('admin_credentials')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to change password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

/**
 * Check if current user has admin privileges
 */
export function isAdminSession(): boolean {
  if (typeof window === 'undefined') return false

  const adminSession = localStorage.getItem('admin_session')
  if (!adminSession) return false

  try {
    const session = JSON.parse(adminSession)
    // Check if session is still valid (e.g., not expired)
    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      localStorage.removeItem('admin_session')
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Get current admin session
 */
export function getAdminSession(): AdminCredential | null {
  if (typeof window === 'undefined') return null

  const adminSession = localStorage.getItem('admin_session')
  if (!adminSession) return null

  try {
    const session = JSON.parse(adminSession)
    return session.admin
  } catch {
    return null
  }
}

/**
 * Set admin session
 */
export function setAdminSession(admin: AdminCredential): void {
  if (typeof window === 'undefined') return

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 8) // 8 hour session

  const session = {
    admin,
    expires_at: expiresAt.toISOString()
  }

  localStorage.setItem('admin_session', JSON.stringify(session))
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('admin_session')
}
