import { supabase, isSupabaseConfigured } from './supabase'
import type { MatchItem, PlayerRegistration, LeaderboardItem } from '@/types/match'
import { processReferralRewardOnTournamentJoin } from './wallet'


export interface RegistrationRecord extends PlayerRegistration {
  id: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt: string
  roomId?: string
  roomPassword?: string
}

export const DEFAULT_MATCHES: MatchItem[] = [
  {
    id: 'solo-12sep',
    title: 'SOLO BATTLE',
    mode: 'SOLO',
    map: 'Erangel',
    time: '10:00 PM',
    entryFee: 50,
    winnerPrize: 2000,
    firstPrize: 1000,
    secondPrize: 500,
    thirdPrize: 300,
    perKillPrize: 10,
    joinedSlots: 24,
    maxSlots: 100,
    image: '/solo_battle.webp',
    status: 'OPEN',
    whatsappGroupLink: 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K',
  },
  {
    id: 'duo-13sep',
    title: 'DUO BATTLE',
    mode: 'DUO',
    map: 'Erangel',
    time: '10:00 PM',
    entryFee: 100,
    winnerPrize: 5000,
    firstPrize: 2500,
    secondPrize: 1500,
    thirdPrize: 1000,
    perKillPrize: 20,
    joinedSlots: 18,
    maxSlots: 50,
    image: '/duo_battle.webp',
    status: 'OPEN',
    whatsappGroupLink: 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K',
  },
  {
    id: 'squad-14sep',
    title: 'SQUAD SHOWDOWN',
    mode: 'SQUAD',
    map: 'Livik',
    time: '09:00 PM',
    entryFee: 200,
    winnerPrize: 10000,
    firstPrize: 5000,
    secondPrize: 3000,
    thirdPrize: 2000,
    perKillPrize: 30,
    joinedSlots: 12,
    maxSlots: 50,
    image: '/squad_showdown.webp',
    status: 'OPEN',
    whatsappGroupLink: 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K',
  },
]

export function getLocalMatches(): MatchItem[] {
  if (typeof window === 'undefined') return DEFAULT_MATCHES
  const stored = localStorage.getItem('kongkaal_matches')
  if (!stored) {
    localStorage.setItem('kongkaal_matches', JSON.stringify(DEFAULT_MATCHES))
    return DEFAULT_MATCHES
  }
  try {
    return JSON.parse(stored)
  } catch {
    return DEFAULT_MATCHES
  }
}

function saveLocalMatches(matches: MatchItem[], notify = true) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_matches', JSON.stringify(matches))
    if (notify) {
      window.dispatchEvent(new Event('matches_updated'))
      dbBroadcastChannel?.postMessage('matches_updated')
    }
  }
  matchesCache = { data: matches, timestamp: Date.now() }
}

let matchesCache: { data: MatchItem[]; timestamp: number } | null = null
const CACHE_TTL_MS = 10000 // 10 seconds SWR cache for 100k scale

export function clearMatchesCache() {
  matchesCache = null
}

// Subscribe to Realtime DB events for instant live updates across all devices & tabs
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    const channelName = 'kongkaal_realtime_db_changes'
    const existing = supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`)
    if (existing) {
      supabase.removeChannel(existing)
    }
    supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          clearMatchesCache()
          window.dispatchEvent(new Event('matches_updated'))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboards' },
        () => {
          window.dispatchEvent(new Event('leaderboard_updated'))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          window.dispatchEvent(new Event('registrations_updated'))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          window.dispatchEvent(new Event('hero_settings_updated'))
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('[DB Service] Supabase realtime subscription error:', err)
  }
}

// Cross-tab BroadcastChannel sync for registrations & matches across browser tabs
let dbBroadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    dbBroadcastChannel = new BroadcastChannel('kongkaal_db_channel')
    dbBroadcastChannel.onmessage = (event) => {
      if (event.data === 'registrations_updated') {
        window.dispatchEvent(new Event('registrations_updated'))
      } else if (event.data === 'matches_updated') {
        clearMatchesCache()
        window.dispatchEvent(new Event('matches_updated'))
      }
    }
  } catch (err) {
    console.warn('[DB Service] BroadcastChannel init error:', err)
  }
}

export function notifyRegistrationsUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('registrations_updated'))
    dbBroadcastChannel?.postMessage('registrations_updated')
  }
}

// 1. Fetch Active Tournament Matches (Ultra-fast cached response with forceFetch support)
export async function getMatches(forceFetch = false): Promise<MatchItem[]> {
  if (forceFetch) {
    matchesCache = null
  }

  if (matchesCache && Date.now() - matchesCache.timestamp < CACHE_TTL_MS) {
    return matchesCache.data
  }

  if (!isSupabaseConfigured()) {
    const local = getLocalMatches()
    matchesCache = { data: local, timestamp: Date.now() }
    return local
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      const local = getLocalMatches()
      matchesCache = { data: local, timestamp: Date.now() }
      return local
    }

    const sbMatches: MatchItem[] = data.map((m) => ({
      id: m.id,
      title: m.title,
      mode: m.mode,
      map: m.map,
      time: m.time,
      matchDate: m.match_date || undefined,
      entryFee: Number(m.entry_fee),
      winnerPrize: Number(m.winner_prize),
      firstPrize: m.first_prize !== null && m.first_prize !== undefined ? Number(m.first_prize) : Number(m.winner_prize),
      secondPrize: m.second_prize ? Number(m.second_prize) : 0,
      thirdPrize: m.third_prize ? Number(m.third_prize) : 0,
      perKillPrize: Number(m.per_kill_prize),
      joinedSlots: m.joined_slots,
      maxSlots: m.max_slots,
      image: m.image,
      status: m.status,
      whatsappGroupLink: m.whatsapp_group_link,
      roomId: m.room_id,
      roomPassword: m.room_password,
    }))

    matchesCache = { data: sbMatches, timestamp: Date.now() }
    saveLocalMatches(sbMatches, false)
    return sbMatches
  } catch (err) {
    console.error('[DB Service] Supabase query failed:', err)
    const local = getLocalMatches()
    matchesCache = { data: local, timestamp: Date.now() }
    return local
  }
}

// 2. Create / Add New Tournament Match
export async function createMatch(match: Omit<MatchItem, 'id'>): Promise<{ success: boolean; message: string; id?: string }> {
  let cleanDate = match.matchDate ? match.matchDate.trim().split('T')[0] : ''
  if (!cleanDate) {
    cleanDate = new Date().toISOString().split('T')[0]
  }

  const generatedId = 'match-' + Date.now()
  let newMatch: MatchItem = {
    id: generatedId,
    ...match,
    matchDate: cleanDate,
    joinedSlots: match.joinedSlots || 0,
    maxSlots: match.maxSlots || 100,
    status: match.status || 'OPEN',
    image: match.image || '/squad_showdown.webp',
  }

  // 1. Save locally first & update memory cache
  const local = getLocalMatches()
  let updated = [newMatch, ...local]
  saveLocalMatches(updated, true)

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        id: generatedId,
        title: newMatch.title,
        mode: newMatch.mode,
        map: newMatch.map,
        time: newMatch.time,
        entry_fee: Number(newMatch.entryFee) || 0,
        winner_prize: Number(newMatch.winnerPrize) || 0,
        first_prize: newMatch.firstPrize !== undefined ? Number(newMatch.firstPrize) : (Number(newMatch.winnerPrize) || 0),
        second_prize: Number(newMatch.secondPrize) || 0,
        third_prize: Number(newMatch.thirdPrize) || 0,
        per_kill_prize: Number(newMatch.perKillPrize) || 0,
        joined_slots: Number(newMatch.joinedSlots) || 0,
        max_slots: Number(newMatch.maxSlots) || 100,
        image: newMatch.image,
        status: newMatch.status || 'OPEN',
        whatsapp_group_link: newMatch.whatsappGroupLink || '',
        room_id: newMatch.roomId || '',
        room_password: newMatch.roomPassword || '',
      }

      const { data, error } = await supabase
        .from('matches')
        .insert([payload])
        .select()

      if (!error && data && data.length > 0) {
        if (data[0].id && data[0].id !== generatedId) {
          newMatch = { ...newMatch, id: data[0].id }
          updated = [newMatch, ...local]
          saveLocalMatches(updated, true)
        }
      } else if (error) {
        console.warn('Supabase create match error:', error)
      }
    } catch (err: any) {
      console.warn('Supabase create match exception:', err)
    }
  }

  // Lock newly created match in cache so immediate getMatches(true) returns it
  matchesCache = { data: updated, timestamp: Date.now() }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('matches_updated'))
    dbBroadcastChannel?.postMessage('matches_updated')
  }

  return { success: true, message: 'Match created successfully!', id: newMatch.id }
}

// 3. Delete Match
export async function deleteMatch(id: string): Promise<{ success: boolean; message: string }> {
  const local = getLocalMatches()
  const updated = local.filter((m) => m.id !== id)
  saveLocalMatches(updated, true)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('matches').delete().eq('id', id)
    } catch (err: any) {
      console.warn('Supabase delete match error:', err)
    }
  }

  matchesCache = { data: updated, timestamp: Date.now() }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('matches_updated'))
    dbBroadcastChannel?.postMessage('matches_updated')
  }

  return { success: true, message: 'Match deleted successfully' }
}

// 3b. Update Existing Match (Title, Image Picture, Entry Fee, Prize, Time, Date, etc.)
export async function updateMatch(match: MatchItem): Promise<{ success: boolean; message: string }> {
  // Ensure matchDate is formatted cleanly (YYYY-MM-DD)
  let cleanDate = match.matchDate ? match.matchDate.trim().split('T')[0] : ''
  if (!cleanDate) {
    cleanDate = new Date().toISOString().split('T')[0]
  }

  const updatedMatch: MatchItem = {
    ...match,
    matchDate: cleanDate,
  }

  // 1. Save locally and update cache immediately
  const local = getLocalMatches()
  const exists = local.some((m) => m.id === updatedMatch.id)
  const updated = exists ? local.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)) : [updatedMatch, ...local]
  saveLocalMatches(updated, true)

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        title: updatedMatch.title,
        mode: updatedMatch.mode,
        map: updatedMatch.map,
        time: updatedMatch.time,
        entry_fee: Number(updatedMatch.entryFee) || 0,
        winner_prize: Number(updatedMatch.winnerPrize) || 0,
        first_prize: updatedMatch.firstPrize !== undefined ? Number(updatedMatch.firstPrize) : (Number(updatedMatch.winnerPrize) || 0),
        second_prize: Number(updatedMatch.secondPrize) || 0,
        third_prize: Number(updatedMatch.thirdPrize) || 0,
        per_kill_prize: Number(updatedMatch.perKillPrize) || 0,
        joined_slots: Number(updatedMatch.joinedSlots) || 0,
        max_slots: Number(updatedMatch.maxSlots) || 100,
        image: updatedMatch.image,
        status: updatedMatch.status || 'OPEN',
        whatsapp_group_link: updatedMatch.whatsappGroupLink || '',
        room_id: updatedMatch.roomId || '',
        room_password: updatedMatch.roomPassword || '',
      }

      let isUpdated = false

      // First attempt: update by id
      const { data: byIdData, error: byIdErr } = await supabase
        .from('matches')
        .update(payload)
        .eq('id', updatedMatch.id)
        .select()

      if (!byIdErr && byIdData && byIdData.length > 0) {
        isUpdated = true
      }

      // Second attempt: update by title and mode
      if (!isUpdated) {
        const { data: byTitleData, error: byTitleErr } = await supabase
          .from('matches')
          .update(payload)
          .eq('title', updatedMatch.title)
          .eq('mode', updatedMatch.mode)
          .select()

        if (!byTitleErr && byTitleData && byTitleData.length > 0) {
          isUpdated = true
        }
      }

      // Third attempt: upsert record if not found
      if (!isUpdated) {
        payload.id = updatedMatch.id
        const { error: insErr } = await supabase.from('matches').upsert([payload])
        if (insErr) {
          console.error('Supabase update/insert match error:', insErr)
          // If error is not fatal or schema constraint, log and continue as local storage succeeded
        }
      }
    } catch (err: any) {
      console.error('Supabase update match exception:', err)
    }
  }

  // 3. Ensure memory cache preserves the newly updated matches list
  matchesCache = { data: updated, timestamp: Date.now() }

  // 4. Dispatch instant UI update event across app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('matches_updated'))
    dbBroadcastChannel?.postMessage('matches_updated')
  }

  return { success: true, message: 'Match updated successfully!' }
}


// 3.5 Increment Match Joined Slots Count
export async function incrementMatchSlots(matchId?: string | null, count = 1): Promise<void> {
  if (!matchId) return

  clearMatchesCache()

  // Update local storage
  const local = getLocalMatches()
  const updated = local.map((m) => {
    if (m.id === matchId) {
      const newJoined = Math.min(m.maxSlots || 100, (m.joinedSlots || 0) + count)
      const newStatus = newJoined >= (m.maxSlots || 100) ? 'FILLING_FAST' : m.status
      return { ...m, joinedSlots: newJoined, status: newStatus }
    }
    return m
  })
  saveLocalMatches(updated)

  // Update Supabase if configured
  if (isSupabaseConfigured() && matchId) {
    try {
      const { data: current } = await supabase.from('matches').select('joined_slots, max_slots').eq('id', matchId).single()
      if (current) {
        const nextJoined = Math.min(current.max_slots || 100, (current.joined_slots || 0) + count)
        await supabase.from('matches').update({ joined_slots: nextJoined }).eq('id', matchId)
      }
    } catch (err) {
      console.warn('Could not increment match slots in Supabase:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('matches_updated'))
    dbBroadcastChannel?.postMessage('matches_updated')
  }
}

// Helper to manage local registration records
export function getLocalRegistrationRecords(): RegistrationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('kongkaal_registrations')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalRegistrationRecord(record: RegistrationRecord) {
  if (typeof window === 'undefined') return
  const current = getLocalRegistrationRecords()
  localStorage.setItem('kongkaal_registrations', JSON.stringify([record, ...current]))
  notifyRegistrationsUpdate()
}

export function isUserRegisteredForMatch(
  matchId: string,
  userEmail?: string,
  pubgUid?: string
): boolean {
  if (!matchId || typeof window === 'undefined') return false

  const cleanEmail = (userEmail || '').trim().toLowerCase()
  const cleanUid = (pubgUid || '').trim()

  if (!cleanEmail && !cleanUid) return false

  const allRegs = getLocalRegistrationRecords()
  return allRegs.some((r) => {
    if (r.matchId !== matchId || r.status === 'REJECTED') return false

    const rEmail = (r.userEmail || '').trim().toLowerCase()
    const rUid = (r.player1Uid || '').trim()

    if (cleanEmail && rEmail && rEmail === cleanEmail) return true
    if (cleanUid && rUid && rUid === cleanUid) return true
    return false
  })
}

export function getUserRegisteredMatchIds(
  userEmail?: string,
  pubgUid?: string
): string[] {
  if (typeof window === 'undefined') return []

  const cleanEmail = (userEmail || '').trim().toLowerCase()
  const cleanUid = (pubgUid || '').trim()

  if (!cleanEmail && !cleanUid) return []

  const allRegs = getLocalRegistrationRecords()
  const registeredIds = new Set<string>()

  allRegs.forEach((r) => {
    if (r.status === 'REJECTED') return
    const rEmail = (r.userEmail || '').trim().toLowerCase()
    const rUid = (r.player1Uid || '').trim()

    if ((cleanEmail && rEmail && rEmail === cleanEmail) || (cleanUid && rUid && rUid === cleanUid)) {
      if (r.matchId) registeredIds.add(r.matchId)
    }
  })

  return Array.from(registeredIds)
}

// 4. Save Player Slot Registration & Payment TrxID
export async function saveRegistration(registration: PlayerRegistration): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('[DB Service] Saving slot registration:', registration)

  // Validate target match status & max slots limit
  if (registration.matchId) {
    const matches = getLocalMatches()
    const targetMatch = matches.find((m) => m.id === registration.matchId)
    if (targetMatch) {
      if (
        targetMatch.status === 'COMPLETED' ||
        targetMatch.status === 'CLOSED' ||
        targetMatch.status === 'LIVE_SOON' ||
        targetMatch.status === 'COMING_SOON'
      ) {
        return {
          success: false,
          message: 'এই টুর্নামেন্টের রেজিস্ট্রেশন বন্ধ হয়ে গেছে বা টুর্নামেন্টটি সম্পন্ন হয়েছে!',
        }
      }
      if ((targetMatch.joinedSlots || 0) >= (targetMatch.maxSlots || 100)) {
        return {
          success: false,
          message: 'এই টুর্নামেন্টের সকল স্লট পূর্ণ হয়ে গেছে! আর কোনো প্লেয়ার যুক্ত হতে পারবে না।',
        }
      }
    }
  }

  // Prevent duplicate registration for the same match
  if (
    registration.matchId &&
    isUserRegisteredForMatch(registration.matchId, registration.userEmail, registration.player1Uid)
  ) {
    return {
      success: false,
      message: 'আপনি ইতিমধ্যে এই টুর্নামেন্টে রেজিস্টার করেছেন!',
    }
  }

  // Auto-increment slot count for this match
  if (registration.matchId) {
    await incrementMatchSlots(registration.matchId, 1)
  }

  const initialStatus = registration.paymentMethod === 'WALLET' ? 'VERIFIED' : 'PENDING'

  const localRec: RegistrationRecord = {
    id: 'reg-' + Date.now(),
    matchId: registration.matchId,
    teamName: registration.teamName || 'SOLO PLAYER',
    player1Name: registration.player1Name,
    player1Uid: registration.player1Uid,
    whatsappNumber: registration.whatsappNumber,
    userEmail: registration.userEmail,
    player2Name: registration.player2Name,
    player2Uid: registration.player2Uid,
    player3Name: registration.player3Name,
    player3Uid: registration.player3Uid,
    player4Name: registration.player4Name,
    player4Uid: registration.player4Uid,
    paymentMethod: registration.paymentMethod,
    trxId: registration.trxId,
    amount: registration.amount,
    status: initialStatus,
    createdAt: new Date().toISOString(),
  }

  // Always store locally as fallback / instant cache and clear stale SWR cache
  saveLocalRegistrationRecord(localRec)
  clearRegistrationsCache()

  if (!isSupabaseConfigured()) {
    try {
      const friendIdentifier = registration.userEmail || registration.player1Name
      await processReferralRewardOnTournamentJoin(friendIdentifier, registration.player1Name, registration.matchId || 'Tournament')
    } catch (refErr) {
      console.warn('[DB Service] Referral bonus processing error:', refErr)
    }
    notifyRegistrationsUpdate()
    return {
      success: true,
      message: 'Slot registration saved locally (Supabase unconfigured).',
      id: localRec.id,
    }
  }

  try {
    const payload: any = {
      match_id: registration.matchId || null,
      team_name: registration.teamName || null,
      player1_name: registration.player1Name,
      player1_uid: registration.player1Uid,
      whatsapp_number: registration.whatsappNumber,
      user_email: registration.userEmail || null,
      player2_name: registration.player2Name || null,
      player2_uid: registration.player2Uid || null,
      player3_name: registration.player3Name || null,
      player3_uid: registration.player3Uid || null,
      player4_name: registration.player4Name || null,
      player4_uid: registration.player4Uid || null,
      payment_method: registration.paymentMethod,
      trx_id: registration.trxId,
      amount: registration.amount,
      status: initialStatus,
    }

    let { data, error } = await supabase
      .from('registrations')
      .insert([payload])
      .select()

    // If payload failed due to column missing (e.g. user_email), retry without user_email
    if (error && error.message?.includes('user_email')) {
      delete payload.user_email
      const retry = await supabase
        .from('registrations')
        .insert([payload])
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.warn('[DB Service] Supabase registration table error, falling back to local storage:', error.message)
      notifyRegistrationsUpdate()
      return {
        success: true,
        message: 'Slot registration saved successfully!',
        id: localRec.id,
      }
    }

    clearRegistrationsCache()
    notifyRegistrationsUpdate()

    // Process referral reward (+25 BDT) if registered via referral code
    try {
      const friendIdentifier = registration.userEmail || registration.player1Name
      await processReferralRewardOnTournamentJoin(friendIdentifier, registration.player1Name, registration.matchId || 'Tournament')
    } catch (refErr) {
      console.warn('[DB Service] Referral bonus processing error:', refErr)
    }

    return {
      success: true,
      message: 'Registration saved to Supabase successfully!',
      id: data?.[0]?.id || localRec.id,
    }
  } catch (err: any) {
    console.warn('[DB Service] Registration insert exception, saving locally:', err)
    
    // Process referral reward (+25 BDT) fallback for local registration
    try {
      const friendIdentifier = registration.userEmail || registration.player1Name
      await processReferralRewardOnTournamentJoin(friendIdentifier, registration.player1Name, registration.matchId || 'Tournament')
    } catch (refErr) {
      console.warn('[DB Service] Referral bonus processing error:', refErr)
    }

    notifyRegistrationsUpdate()
    return { success: true, message: 'Slot registration saved successfully!', id: localRec.id }
  }
}

// SWR In-Memory Cache for registrations (30s TTL for high-traffic scale)
let registrationsCache: { data: RegistrationRecord[]; timestamp: number } | null = null
const REG_CACHE_TTL_MS = 30_000

export function clearRegistrationsCache() {
  registrationsCache = null
}

// 5. Fetch All Registrations for Admin Dashboard
export async function getAllRegistrations(forceFetch = false): Promise<RegistrationRecord[]> {
  if (forceFetch) registrationsCache = null

  // Return cached data if fresh
  if (registrationsCache && Date.now() - registrationsCache.timestamp < REG_CACHE_TTL_MS) {
    return registrationsCache.data
  }

  const localRegs = getLocalRegistrationRecords()
  let dbRegs: RegistrationRecord[] = []

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        dbRegs = data.map((r) => ({
          id: r.id,
          matchId: r.match_id || 'general',
          teamName: r.team_name,
          player1Name: r.player1_name,
          player1Uid: r.player1_uid,
          whatsappNumber: r.whatsapp_number,
          userEmail: r.user_email || r.email || '',
          player2Name: r.player2_name,
          player2Uid: r.player2_uid,
          player3Name: r.player3_name,
          player3Uid: r.player3_uid,
          player4Name: r.player4_name,
          player4Uid: r.player4_uid,
          paymentMethod: r.payment_method,
          trxId: r.trx_id,
          amount: Number(r.amount),
          status: r.status,
          createdAt: r.created_at,
          roomId: r.room_id || '',
          roomPassword: r.room_password || '',
        }))
      }
    } catch (err) {
      console.error('[DB Service] Exception fetching registrations:', err)
    }
  }

  // Merge dbRegs and localRegs avoiding duplicate IDs
  const map = new Map<string, RegistrationRecord>()
  dbRegs.forEach((r) => map.set(r.id, r))
  localRegs.forEach((r) => {
    if (!map.has(r.id)) map.set(r.id, r)
  })

  const merged = Array.from(map.values())

  // Cache the merged result
  registrationsCache = { data: merged, timestamp: Date.now() }
  return merged
}

// 6. Update Registration Status (Approve/Reject)
export async function updateRegistrationStatus(id: string, status: 'VERIFIED' | 'REJECTED'): Promise<{ success: boolean; message: string }> {
  // Update local storage record if present
  if (typeof window !== 'undefined') {
    const current = getLocalRegistrationRecords()
    const updated = current.map(r => r.id === id ? { ...r, status } : r)
    localStorage.setItem('kongkaal_registrations', JSON.stringify(updated))
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id)

      if (error) {
        console.warn('Supabase update registration status error:', error.message)
      }
    } catch (err: any) {
      console.warn('Supabase update registration status exception:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('registrations_updated'))
  }

  return { success: true, message: `Status updated to ${status} successfully!` }
}

// 6b. Update Registration Room Credentials (Set Room ID & Password)
export async function updateRegistrationRoomCredentials(
  id: string,
  roomId: string,
  roomPassword: string
): Promise<{ success: boolean; message: string }> {
  if (typeof window !== 'undefined') {
    const current = getLocalRegistrationRecords()
    const updated = current.map((r) => (r.id === id ? { ...r, roomId, roomPassword } : r))
    localStorage.setItem('kongkaal_registrations', JSON.stringify(updated))
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('registrations')
        .update({ room_id: roomId, room_password: roomPassword })
        .eq('id', id)
    } catch (err: any) {
      console.warn('Supabase update room credentials exception:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('registrations_updated'))
  }

  return { success: true, message: 'Room ID and Password updated successfully!' }
}

// 6c. Delete Registration Record
export async function deleteRegistrationRecord(id: string): Promise<{ success: boolean; message: string }> {
  if (typeof window !== 'undefined') {
    const current = getLocalRegistrationRecords()
    const updated = current.filter((r) => r.id !== id)
    localStorage.setItem('kongkaal_registrations', JSON.stringify(updated))
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('registrations').delete().eq('id', id)
    } catch (err: any) {
      console.warn('Supabase delete registration exception:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('registrations_updated'))
  }

  return { success: true, message: 'Registration record deleted successfully!' }
}

// Initial default leaderboard entries
export const INITIAL_LEADERBOARD: LeaderboardItem[] = [
  {
    id: 'lb-1',
    matchTitle: 'Erangel Squad Championship #308',
    teamName: 'VIP ESPORTS',
    playerIgn: 'VIP_SHADOW',
    pubgUid: '5123456789',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PubgHero&backgroundColor=e50914',
    rank: '1ST PLACE',
    kills: 18,
    prizeWon: 6440,
    status: 'VERIFIED PAYOUT',
    isPinned: true,
  },
  {
    id: 'lb-2',
    matchTitle: 'Squad Sanhok War #307',
    teamName: 'DARK HUNTERS',
    playerIgn: 'HUNTER_X',
    pubgUid: '5678901234',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowNinja&backgroundColor=d97706',
    rank: '1ST PLACE',
    kills: 21,
    prizeWon: 7680,
    status: 'VERIFIED PAYOUT',
  },
  {
    id: 'lb-3',
    matchTitle: 'Duo Miramar Tactical #203',
    teamName: 'DEADLY DUO',
    playerIgn: 'RAKIB_OP',
    pubgUid: '5432167890',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SniperPro&backgroundColor=059669',
    rank: 'CHAMPION',
    kills: 14,
    prizeWon: 3560,
    status: 'VERIFIED PAYOUT',
  },
  {
    id: 'lb-4',
    matchTitle: 'Solo Erangel Rush #100',
    teamName: 'SOLO PLAYER',
    playerIgn: 'CYCLONE_99',
    pubgUid: '5987654321',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SkullKing&backgroundColor=101422',
    rank: '1ST PLACE',
    kills: 11,
    prizeWon: 1720,
    status: 'VERIFIED PAYOUT',
  },
]

// Local Storage Helper for Leaderboard
function getLocalLeaderboard(): LeaderboardItem[] {
  if (typeof window === 'undefined') return INITIAL_LEADERBOARD
  const stored = localStorage.getItem('kongkaal_leaderboard')
  if (!stored) {
    localStorage.setItem('kongkaal_leaderboard', JSON.stringify(INITIAL_LEADERBOARD))
    return INITIAL_LEADERBOARD
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_LEADERBOARD
  }
}

function saveLocalLeaderboard(items: LeaderboardItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_leaderboard', JSON.stringify(items))
    window.dispatchEvent(new Event('leaderboard_updated'))
  }
}

// 7. Get Leaderboard Items
export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  if (!isSupabaseConfigured()) {
    return getLocalLeaderboard()
  }

  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return getLocalLeaderboard()
    }

    return data.map((d: any) => ({
      id: d.id,
      matchTitle: d.match_title,
      teamName: d.team_name,
      playerIgn: d.player_ign,
      pubgUid: d.pubg_uid || '',
      avatarUrl: d.avatar_url || '',
      rank: d.rank || 'CHAMPION',
      kills: Number(d.kills),
      prizeWon: Number(d.prize_won),
      status: d.status || 'VERIFIED PAYOUT',
      isPinned: Boolean(d.is_pinned),
      pinnedPosition: d.pinned_position ? Number(d.pinned_position) : undefined,
    }))
  } catch {
    return getLocalLeaderboard()
  }
}

// 8. Create Leaderboard Item
export async function createLeaderboardItem(
  item: Omit<LeaderboardItem, 'id'>
): Promise<{ success: boolean; message: string; newItem?: LeaderboardItem }> {
  const newItem: LeaderboardItem = {
    id: 'lb-' + Date.now(),
    ...item,
  }

  // Always update local storage
  const current = getLocalLeaderboard()
  const updated = [newItem, ...current]
  saveLocalLeaderboard(updated)

  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Leaderboard champion added!', newItem }
  }

  try {
    const { error } = await supabase.from('leaderboards').insert([
      {
        match_title: item.matchTitle,
        team_name: item.teamName,
        player_ign: item.playerIgn,
        pubg_uid: item.pubgUid || '',
        avatar_url: item.avatarUrl || '',
        rank: item.rank || 'CHAMPION',
        kills: item.kills,
        prize_won: item.prizeWon,
        status: item.status,
        is_pinned: item.isPinned || false,
        pinned_position: item.pinnedPosition || null,
      },
    ])
    if (error) {
      console.warn('Supabase insert failed, stored in localStorage:', error)
    }
  } catch (err) {
    console.warn('Supabase insert exception:', err)
  }

  return { success: true, message: 'Leaderboard champion added successfully!', newItem }
}

// 9. Update Leaderboard Item
export async function updateLeaderboardItem(
  id: string,
  updates: Partial<LeaderboardItem>
): Promise<{ success: boolean; message: string }> {
  const current = getLocalLeaderboard()
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item))
  saveLocalLeaderboard(updated)

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('leaderboards')
        .update({
          match_title: updates.matchTitle,
          team_name: updates.teamName,
          player_ign: updates.playerIgn,
          pubg_uid: updates.pubgUid,
          avatar_url: updates.avatarUrl,
          rank: updates.rank,
          kills: updates.kills,
          prize_won: updates.prizeWon,
          status: updates.status,
          is_pinned: updates.isPinned,
          pinned_position: updates.pinnedPosition,
        })
        .eq('id', id)
    } catch (err) {
      console.warn('Supabase update failed:', err)
    }
  }

  return { success: true, message: 'Leaderboard entry updated successfully!' }
}

// 10. Delete Leaderboard Item
export async function deleteLeaderboardItem(id: string): Promise<{ success: boolean; message: string }> {
  const current = getLocalLeaderboard()
  const updated = current.filter((item) => item.id !== id)
  saveLocalLeaderboard(updated)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('leaderboards').delete().eq('id', id)
    } catch (err) {
      console.warn('Supabase delete failed:', err)
    }
  }

  return { success: true, message: 'Leaderboard entry deleted successfully!' }
}

// 11. Hero Banner Widget Settings Management
export interface HeroBannerSettings {
  nextMatchTime: string
  nextMatchMap: string
  liveStatusText: string
  activePlayersCount: number
  heroVideoUrl?: string
  youtubeVideoUrl?: string
}

export const DEFAULT_HERO_SETTINGS: HeroBannerSettings = {
  nextMatchTime: 'Today • 10:00 PM',
  nextMatchMap: 'Erangel / Asia',
  liveStatusText: 'Tournament Ongoing',
  activePlayersCount: 128,
  heroVideoUrl: '/hero_bg.mp4',
  youtubeVideoUrl: 'https://www.youtube.com/watch?v=7rgCNNz6MWY',
}

export function getHeroBannerSettings(): HeroBannerSettings {
  if (typeof window === 'undefined') return DEFAULT_HERO_SETTINGS
  const stored = localStorage.getItem('kongkaal_hero_settings')
  if (!stored) return DEFAULT_HERO_SETTINGS
  try {
    const parsed = JSON.parse(stored)
    if (!parsed.heroVideoUrl || parsed.heroVideoUrl.includes('mixkit') || parsed.heroVideoUrl.includes('uCd6tbLv6XY')) {
      parsed.heroVideoUrl = '/hero_bg.mp4'
    }
    if (!parsed.youtubeVideoUrl || parsed.youtubeVideoUrl === 'https://www.youtube.com/watch?v=L6P3nI6VnlY') {
      parsed.youtubeVideoUrl = DEFAULT_HERO_SETTINGS.youtubeVideoUrl
    }
    return { ...DEFAULT_HERO_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_HERO_SETTINGS
  }
}

export function saveHeroBannerSettings(settings: HeroBannerSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_hero_settings', JSON.stringify(settings))
    window.dispatchEvent(new Event('hero_settings_updated'))
  }
}

// 12. Match Mode Settings Management (SOLO, DUO, SQUAD Control)
export interface MatchModeSettings {
  solo: boolean
  duo: boolean
  squad: boolean
}

export const DEFAULT_MODE_SETTINGS: MatchModeSettings = {
  solo: true,
  duo: true,
  squad: true,
}

export function getMatchModeSettings(): MatchModeSettings {
  if (typeof window === 'undefined') return DEFAULT_MODE_SETTINGS
  const stored = localStorage.getItem('kongkaal_mode_settings')
  if (!stored) return DEFAULT_MODE_SETTINGS
  try {
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_MODE_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_MODE_SETTINGS
  }
}

export function saveMatchModeSettings(settings: MatchModeSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_mode_settings', JSON.stringify(settings))
    window.dispatchEvent(new Event('mode_settings_updated'))
  }
}

// 13. Prize Breakdown Modal Settings Management (Global Control)
export interface PrizeBreakdownSettings {
  enableGlobalModal: boolean
}

export const DEFAULT_PRIZE_BREAKDOWN_SETTINGS: PrizeBreakdownSettings = {
  enableGlobalModal: true,
}

export function getPrizeBreakdownSettings(): PrizeBreakdownSettings {
  if (typeof window === 'undefined') return DEFAULT_PRIZE_BREAKDOWN_SETTINGS
  const stored = localStorage.getItem('kongkaal_prize_breakdown_settings')
  if (!stored) return DEFAULT_PRIZE_BREAKDOWN_SETTINGS
  try {
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_PRIZE_BREAKDOWN_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_PRIZE_BREAKDOWN_SETTINGS
  }
}

export function savePrizeBreakdownSettings(settings: PrizeBreakdownSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_prize_breakdown_settings', JSON.stringify(settings))
    window.dispatchEvent(new Event('prize_breakdown_settings_updated'))
  }
}

// 14. Website Visitor Tracking & Counter Management (Date-Wise History)
export interface VisitorStats {
  totalVisits: number
  todayVisits: number
  lastDate: string // YYYY-MM-DD
  dailyHistory: Record<string, number> // e.g. { "2026-09-27": 18, "2026-09-26": 24 }
}

const todayDefault = new Date().toISOString().split('T')[0]

const DEFAULT_VISITOR_STATS: VisitorStats = {
  totalVisits: 142,
  todayVisits: 18,
  lastDate: todayDefault,
  dailyHistory: {
    [todayDefault]: 18,
  },
}

export async function syncVisitorStatsWithDB(stats: VisitorStats) {
  if (!isSupabaseConfigured()) return
  try {
    await supabase.from('site_settings').upsert({
      key: 'visitor_stats',
      value: JSON.stringify(stats),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })
  } catch (err) {
    // Silently continue with local stats if table not set up
  }
}

export function getVisitorStats(): VisitorStats {
  if (typeof window === 'undefined') return DEFAULT_VISITOR_STATS
  const stored = localStorage.getItem('kongkaal_visitor_stats')
  const todayStr = new Date().toISOString().split('T')[0]

  if (!stored) {
    const initial = {
      ...DEFAULT_VISITOR_STATS,
      lastDate: todayStr,
      dailyHistory: { [todayStr]: 18 },
    }
    localStorage.setItem('kongkaal_visitor_stats', JSON.stringify(initial))
    return initial
  }

  try {
    const parsed: VisitorStats = JSON.parse(stored)
    if (!parsed.dailyHistory) parsed.dailyHistory = {}

    if (parsed.lastDate !== todayStr) {
      parsed.todayVisits = parsed.dailyHistory[todayStr] || 0
      parsed.lastDate = todayStr
      localStorage.setItem('kongkaal_visitor_stats', JSON.stringify(parsed))
    }
    return parsed
  } catch {
    return DEFAULT_VISITOR_STATS
  }
}

export async function fetchVisitorStatsFromDB(): Promise<VisitorStats> {
  const localStats = getVisitorStats()
  if (!isSupabaseConfigured()) return localStats

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'visitor_stats')
      .maybeSingle()

    if (data && data.value) {
      const parsed: VisitorStats = JSON.parse(data.value)
      const merged: VisitorStats = {
        totalVisits: Math.max(parsed.totalVisits || 0, localStats.totalVisits || 0),
        todayVisits: Math.max(parsed.todayVisits || 0, localStats.todayVisits || 0),
        lastDate: localStats.lastDate,
        dailyHistory: { ...(parsed.dailyHistory || {}), ...(localStats.dailyHistory || {}) },
      }
      localStorage.setItem('kongkaal_visitor_stats', JSON.stringify(merged))
      return merged
    }
  } catch (err) {
    // Ignore error
  }
  return localStats
}

export function trackVisitor(): VisitorStats {
  if (typeof window === 'undefined') return DEFAULT_VISITOR_STATS

  const todayStr = new Date().toISOString().split('T')[0]
  const sessionVisited = sessionStorage.getItem('kongkaal_visited_session')
  const current = getVisitorStats()

  if (!sessionVisited) {
    sessionStorage.setItem('kongkaal_visited_session', 'true')
    const currentTodayCount = current.dailyHistory[todayStr] || (current.lastDate === todayStr ? current.todayVisits : 0) || 0
    const newTodayCount = currentTodayCount + 1
    const newTotal = (current.totalVisits || 0) + 1

    const updated: VisitorStats = {
      totalVisits: newTotal,
      todayVisits: newTodayCount,
      lastDate: todayStr,
      dailyHistory: {
        ...(current.dailyHistory || {}),
        [todayStr]: newTodayCount,
      },
    }
    localStorage.setItem('kongkaal_visitor_stats', JSON.stringify(updated))
    window.dispatchEvent(new Event('visitor_stats_updated'))
    
    // Background async sync to Supabase database for real global visitor tracking
    syncVisitorStatsWithDB(updated)

    return updated
  }

  return current
}





