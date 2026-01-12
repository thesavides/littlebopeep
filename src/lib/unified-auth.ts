/**
 * Unified Authentication Library
 * Handles all authentication using Supabase Auth with user_profiles
 * Replaces both admin-auth.ts and supabase-auth.ts
 */

import { supabase } from './supabase-client'

export type UserRole = 'walker' | 'farmer' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'password_reset_required'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  status: UserStatus
  created_by?: string
  last_login_at?: string
  password_reset_required: boolean
  created_at: string
  updated_at: string
}

// ================================================
// AUTHENTICATION
// ================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{
  success: boolean
  user?: UserProfile
  error?: string
}> {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Login failed' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // Sign out if profile doesn't exist
      await supabase.auth.signOut()
      return { success: false, error: 'User profile not found' }
    }

    // Check if user is suspended
    if (profile.status === 'suspended') {
      await supabase.auth.signOut()
      return { success: false, error: 'Account suspended. Please contact support.' }
    }

    // Update last login
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id)

    return { success: true, user: profile }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Get current authenticated user and profile
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// ================================================
// PASSWORD MANAGEMENT
// ================================================

/**
 * Change password for current user
 */
export async function changePassword(newPassword: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Clear password reset flag if set
    const user = await getCurrentUser()
    if (user?.password_reset_required) {
      await supabase
        .from('user_profiles')
        .update({ password_reset_required: false })
        .eq('id', user.id)
    }

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Always use production URL for password reset emails
    const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Request password reset error:', error)
    return { success: false, error: 'Failed to send reset email' }
  }
}

/**
 * Reset password with token (from email link)
 */
export async function resetPassword(newPassword: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

// ================================================
// USER MANAGEMENT (Admin only)
// ================================================

/**
 * Get all users (admin/super_admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get all users error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Get all users error:', error)
    return []
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get users by role error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Get users by role error:', error)
    return []
  }
}

/**
 * Invite new user (admin/super_admin only)
 * Creates user in Supabase Auth and sends invitation email
 */
export async function inviteUser(
  email: string,
  fullName: string,
  role: UserRole,
  phone?: string
): Promise<{
  success: boolean
  user?: UserProfile
  error?: string
}> {
  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Call server-side API route that has access to service role key
    const response = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        email,
        fullName,
        role,
        phone
      })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Invite user error:', error)
    return { success: false, error: 'Failed to invite user' }
  }
}

/**
 * Update user profile (admin/super_admin only)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
): Promise<{
  success: boolean
  user?: UserProfile
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error('Update user profile error:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

/**
 * Suspend user account (admin/super_admin only)
 */
export async function suspendUser(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  return updateUserProfile(userId, { status: 'suspended' })
}

/**
 * Activate user account (admin/super_admin only)
 */
export async function activateUser(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  return updateUserProfile(userId, { status: 'active' })
}

/**
 * Reset user password (admin/super_admin only)
 * Sends password reset email and marks account as requiring password reset
 */
export async function adminResetUserPassword(userId: string, email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Always use production URL for password reset emails
    const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
    })

    if (resetError) {
      return { success: false, error: resetError.message }
    }

    // Mark account as requiring password reset
    await updateUserProfile(userId, {
      password_reset_required: true,
      status: 'password_reset_required'
    })

    return { success: true }
  } catch (error) {
    console.error('Admin reset password error:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

/**
 * Delete user (super_admin only)
 */
export async function deleteUser(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete from Auth (will cascade to user_profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete user error:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Generate a temporary password for new users
 */
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Check if user has specific role
 */
export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  if (!user) return false

  // Super admins have all roles
  if (user.role === 'super_admin') return true

  // Admins have farmer and walker roles
  if (user.role === 'admin' && ['farmer', 'walker'].includes(role)) return true

  // Farmers have walker role
  if (user.role === 'farmer' && role === 'walker') return true

  return user.role === role
}

/**
 * Check if user can access walker features
 */
export function canAccessWalkerFeatures(user: UserProfile | null): boolean {
  return hasRole(user, 'walker')
}

/**
 * Check if user can access farmer features
 */
export function canAccessFarmerFeatures(user: UserProfile | null): boolean {
  return user?.role && ['farmer', 'admin', 'super_admin'].includes(user.role) || false
}

/**
 * Check if user can access admin features
 */
export function canAccessAdminFeatures(user: UserProfile | null): boolean {
  return user?.role && ['admin', 'super_admin'].includes(user.role) || false
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: UserProfile | null): boolean {
  return user?.role === 'super_admin' || false
}
