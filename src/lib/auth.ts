import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    alert('Supabase is not configured yet. Please check your .env variables.')
    return { error: new Error('Supabase not configured') }
  }

  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kongkaal.com'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  return { data, error }
}

export async function customerSignOut() {
  if (!isSupabaseConfigured()) return
  await supabase.auth.signOut()
}

export function useCustomerAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Get active user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    signInWithGoogle,
    signOut: customerSignOut,
  }
}
