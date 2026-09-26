import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { getCustomerProfile } from './wallet'
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
      if (user?.email) {
        getCustomerProfile(
          user.email,
          user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
        )
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u?.email) {
        getCustomerProfile(
          u.email,
          u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
          u.user_metadata?.avatar_url || u.user_metadata?.picture || ''
        )
      }
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
