import { supabase, isSupabaseConfigured } from './supabase'

export interface BlockedUserRecord {
  id: string
  type: 'EMAIL' | 'IP'
  value: string
  reason: string
  blockedAt: string
  blockedBy?: string
}

const BLACKLIST_STORAGE_KEY = 'kongkaal_blacklist'

/**
 * Get all blocked users (Emails & IPs)
 */
export async function getBlockedUsers(): Promise<BlockedUserRecord[]> {
  let local: BlockedUserRecord[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(BLACKLIST_STORAGE_KEY)
      local = raw ? JSON.parse(raw) : []
    } catch {
      local = []
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('blocked_users').select('*').order('blocked_at', { ascending: false })
      if (!error && data) {
        const supa: BlockedUserRecord[] = data.map((b: any) => ({
          id: b.id,
          type: b.type,
          value: b.value,
          reason: b.reason || 'No reason provided',
          blockedAt: b.blocked_at || b.created_at || new Date().toISOString(),
          blockedBy: b.blocked_by || 'Admin',
        }))
        // Merge with local
        const map = new Map<string, BlockedUserRecord>()
        supa.forEach(item => map.set(item.value.toLowerCase(), item))
        local.forEach(item => {
          if (!map.has(item.value.toLowerCase())) {
            map.set(item.value.toLowerCase(), item)
          }
        })
        return Array.from(map.values())
      }
    } catch (err) {
      console.warn('Supabase fetch blocked users exception:', err)
    }
  }

  return local
}

/**
 * Block a Gmail or IP address
 */
export async function blockUser(
  type: 'EMAIL' | 'IP',
  value: string,
  reason: string = 'Violated terms / Suspicious activity'
): Promise<{ success: boolean; message: string }> {
  const cleanVal = value.trim()
  if (!cleanVal) {
    return { success: false, message: 'Invalid target value to block!' }
  }

  const record: BlockedUserRecord = {
    id: 'blk-' + Date.now(),
    type,
    value: type === 'EMAIL' ? cleanVal.toLowerCase() : cleanVal,
    reason,
    blockedAt: new Date().toISOString(),
    blockedBy: 'Admin',
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    const current = await getBlockedUsers()
    const exists = current.some(b => b.value.toLowerCase() === record.value.toLowerCase())
    if (!exists) {
      const updated = [record, ...current]
      localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updated))
    }
  }

  // Update Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('blocked_users').upsert([
        {
          id: record.id,
          type: record.type,
          value: record.value,
          reason: record.reason,
          blocked_at: record.blockedAt,
          blocked_by: record.blockedBy,
        }
      ], { onConflict: 'value' })
    } catch (err: any) {
      console.warn('Supabase block user error:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('blacklist_updated'))
  }

  return { success: true, message: `Successfully blocked ${type} "${cleanVal}"!` }
}

/**
 * Unblock a Gmail or IP address
 */
export async function unblockUser(targetValue: string): Promise<{ success: boolean; message: string }> {
  const cleanVal = targetValue.trim().toLowerCase()

  if (typeof window !== 'undefined') {
    const current = await getBlockedUsers()
    const updated = current.filter(b => b.value.toLowerCase() !== cleanVal && b.id !== targetValue)
    localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(updated))
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('blocked_users').delete().or(`value.ilike.${cleanVal},id.eq.${targetValue}`)
    } catch (err) {
      console.warn('Supabase unblock user error:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('blacklist_updated'))
  }

  return { success: true, message: `Unblocked "${targetValue}" successfully!` }
}

/**
 * Check if a given Email or IP is currently blocked
 */
export async function isUserBlocked(
  email?: string,
  ip?: string
): Promise<{ blocked: boolean; reason?: string; type?: 'EMAIL' | 'IP'; value?: string }> {
  const list = await getBlockedUsers()

  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanIp = (ip || '').trim().toLowerCase()

  if (cleanEmail) {
    const match = list.find(b => b.type === 'EMAIL' && b.value.toLowerCase() === cleanEmail)
    if (match) {
      return { blocked: true, reason: match.reason, type: 'EMAIL', value: match.value }
    }
  }

  if (cleanIp) {
    const match = list.find(b => b.type === 'IP' && b.value.toLowerCase() === cleanIp)
    if (match) {
      return { blocked: true, reason: match.reason, type: 'IP', value: match.value }
    }
  }

  return { blocked: false }
}

/**
 * Helper to fetch public IP address of current browser client
 */
let cachedClientIp: string | null = null
export async function getClientIp(): Promise<string> {
  if (cachedClientIp) return cachedClientIp
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
    const data = await res.json()
    if (data?.ip) {
      cachedClientIp = data.ip
      return data.ip
    }
  } catch {
    // Fallback if network blocked
  }
  return '103.205.132.1' // Fallback simulated client IP
}
