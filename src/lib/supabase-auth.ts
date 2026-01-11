import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AuthUser = {
  id: string
  email: string
  role: 'walker' | 'farmer' // Primary role - cannot be changed
}

// Simple localStorage-based auth for testing (bypasses Supabase)
const AUTH_STORAGE_KEY = 'little-bo-peep-auth'

export async function signUp(email: string, password: string, role: 'walker' | 'farmer') {
  // Simple validation
  if (!email || !password) {
    return { data: null, error: new Error('Email and password required') }
  }
  
  // Check if user already exists
  const existingUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]')
  if (existingUsers.find((u: AuthUser) => u.email === email)) {
    return { data: null, error: new Error('User already exists') }
  }
  
  // Create new user
  const newUser: AuthUser = {
    id: `user_${Date.now()}`,
    email,
    role // Primary role is set at signup and cannot be changed
  }
  
  existingUsers.push(newUser)
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUsers))
  localStorage.setItem('current_user', JSON.stringify(newUser))
  
  return { data: { user: newUser }, error: null }
}

export async function signIn(email: string, password: string) {
  const existingUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]')
  const user = existingUsers.find((u: AuthUser) => u.email === email)
  
  if (!user) {
    return { data: null, error: new Error('Invalid email or password') }
  }
  
  localStorage.setItem('current_user', JSON.stringify(user))
  return { data: { user }, error: null }
}

export async function signOut() {
  localStorage.removeItem('current_user')
  return { error: null }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userStr = localStorage.getItem('current_user')
  if (!userStr) return null
  return JSON.parse(userStr)
}
