import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client only if env vars are available (runtime)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type AuthUser = {
  id: string
  email: string
  role?: 'walker' | 'farmer'
}

export async function signUp(email: string, password: string, role: 'walker' | 'farmer') {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role
      }
    }
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || '',
    role: user.user_metadata?.role as 'walker' | 'farmer'
  }
}
