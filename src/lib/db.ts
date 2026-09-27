import { supabase, isSupabaseConfigured } from './supabase'
import type { MatchItem, PlayerRegistration, LeaderboardItem } from '@/types/match'


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

function getLocalMatches(): MatchItem[] {
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
    }
  }
  matchesCache = null
}

let matchesCache: { data: MatchItem[]; timestamp: number } | null = null
const CACHE_TTL_MS = 10000 // 10 seconds SWR cache for 100k scale

export function clearMatchesCache() {
  matchesCache = null
}

// Subscribe to Realtime DB events for instant live updates across all devices & tabs
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    supabase
      .channel('kongkaal_realtime_db_changes')
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
      firstPrize: m.first_prize ? Number(m.first_prize) : Number(m.winner_prize),
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

    // Merge Supabase matches with local storage (Local user edits take precedence over stale DB reads)
    const local = getLocalMatches()
    const mergedMap = new Map<string, MatchItem>()
    sbMatches.forEach((m) => mergedMap.set(m.id, m))
    local.forEach((m) => {
      const existing = mergedMap.get(m.id)
      if (existing) {
        mergedMap.set(m.id, { ...existing, ...m })
      } else {
        mergedMap.set(m.id, m)
      }
    })

    const finalMatches = Array.from(mergedMap.values())
    matchesCache = { data: finalMatches, timestamp: Date.now() }
    saveLocalMatches(finalMatches, false)
    return finalMatches
  } catch (err) {
    console.error('[DB Service] Supabase query failed:', err)
    const local = getLocalMatches()
    matchesCache = { data: local, timestamp: Date.now() }
    return local
  }
}

// 2. Create / Add New Tournament Match
export async function createMatch(match: Omit<MatchItem, 'id'>): Promise<{ success: boolean; message: string; id?: string }> {
  const newMatch: MatchItem = {
    id: 'match-' + Date.now(),
    ...match,
    joinedSlots: match.joinedSlots || 0,
  }

  const local = getLocalMatches()
  const updated = [newMatch, ...local]
  saveLocalMatches(updated)

  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Match created successfully!', id: newMatch.id }
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          title: match.title,
          mode: match.mode,
          map: match.map,
          time: match.time,
          match_date: match.matchDate || null,
          entry_fee: match.entryFee,
          winner_prize: match.winnerPrize,
          first_prize: match.firstPrize || match.winnerPrize,
          second_prize: match.secondPrize || 0,
          third_prize: match.thirdPrize || 0,
          per_kill_prize: match.perKillPrize,
          joined_slots: match.joinedSlots || 0,
          max_slots: match.maxSlots || 100,
          image: match.image,
          status: match.status || 'OPEN',
          whatsapp_group_link: match.whatsappGroupLink || '',
        },
      ])
      .select()

    if (error) {
      console.warn('Supabase create match error:', error)
    }

    return { success: true, message: 'Match created successfully!', id: data?.[0]?.id || newMatch.id }
  } catch (err: any) {
    return { success: true, message: 'Match created successfully!', id: newMatch.id }
  }
}

// 3. Delete Match
export async function deleteMatch(id: string): Promise<{ success: boolean; message: string }> {
  const local = getLocalMatches()
  const updated = local.filter((m) => m.id !== id)
  saveLocalMatches(updated)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('matches').delete().eq('id', id)
    } catch (err: any) {
      console.warn('Supabase delete match error:', err)
    }
  }

  return { success: true, message: 'Match deleted successfully' }
}

// 3b. Update Existing Match (Title, Image Picture, Entry Fee, Prize, Time, Date, etc.)
export async function updateMatch(match: MatchItem): Promise<{ success: boolean; message: string }> {
  // 1. Invalidate cache
  clearMatchesCache()

  // 2. Save locally
  const local = getLocalMatches()
  const exists = local.some((m) => m.id === match.id)
  const updated = exists ? local.map((m) => (m.id === match.id ? match : m)) : [match, ...local]
  saveLocalMatches(updated, true)

  // 3. Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        title: match.title,
        mode: match.mode,
        map: match.map,
        time: match.time,
        match_date: match.matchDate || null,
        entry_fee: Number(match.entryFee) || 0,
        winner_prize: Number(match.winnerPrize) || 0,
        first_prize: Number(match.firstPrize) || Number(match.winnerPrize) || 0,
        second_prize: Number(match.secondPrize) || 0,
        third_prize: Number(match.thirdPrize) || 0,
        per_kill_prize: Number(match.perKillPrize) || 0,
        joined_slots: Number(match.joinedSlots) || 0,
        max_slots: Number(match.maxSlots) || 100,
        image: match.image,
        status: match.status || 'OPEN',
        whatsapp_group_link: match.whatsappGroupLink || '',
        room_id: match.roomId || '',
        room_password: match.roomPassword || '',
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(match.id)
      if (isUuid) {
        payload.id = match.id
        const { error } = await supabase.from('matches').upsert(payload)
        if (error) {
          console.warn('Supabase upsert match error:', error)
          await supabase.from('matches').update(payload).eq('title', match.title).eq('mode', match.mode)
        }
      } else {
        const { error } = await supabase.from('matches').update(payload).eq('title', match.title).eq('mode', match.mode)
        if (error) {
          console.warn('Supabase update match by title error, trying insert:', error)
          await supabase.from('matches').insert([payload])
        }
      }
    } catch (err: any) {
      console.warn('Supabase update match exception:', err)
    }
  }

  // 4. Dispatch instant UI update event across app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('matches_updated'))
  }

  return { success: true, message: 'Match updated successfully!' }
}


// 3.5 Increment Match Joined Slots Count
export async function incrementMatchSlots(matchId?: string | null, count = 1): Promise<void> {
  if (!matchId) return

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
  if (isSupabaseConfigured() && matchId && matchId.length > 20) {
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

// 4. Save Player Slot Registration & Payment TrxID
export async function saveRegistration(registration: PlayerRegistration): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('[DB Service] Saving slot registration:', registration)

  // Auto-increment slot count for this match
  if (registration.matchId) {
    await incrementMatchSlots(registration.matchId, 1)
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: 'Slot registration saved locally (Supabase unconfigured).',
      id: 'local-reg-' + Date.now(),
    }
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          match_id: registration.matchId && registration.matchId.length > 20 ? registration.matchId : null,
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
          status: 'PENDING',
        },
      ])
      .select()

    if (error) {
      console.warn('[DB Service] Supabase registration table error, falling back to local storage:', error.message)
      // Save locally as fallback so user is never blocked
      const localRec: RegistrationRecord = {
        id: 'reg-' + Date.now(),
        matchId: registration.matchId,
        teamName: registration.teamName || 'SOLO PLAYER',
        player1Name: registration.player1Name,
        player1Uid: registration.player1Uid,
        whatsappNumber: registration.whatsappNumber,
        userEmail: registration.userEmail,
        paymentMethod: registration.paymentMethod,
        trxId: registration.trxId,
        amount: registration.amount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      saveLocalRegistrationRecord(localRec)
      return {
        success: true,
        message: 'Slot registration saved successfully!',
        id: localRec.id,
      }
    }

    return {
      success: true,
      message: 'Registration saved to Supabase successfully!',
      id: data[0]?.id || 'reg-' + Date.now(),
    }
  } catch (err: any) {
    console.warn('[DB Service] Registration insert exception, saving locally:', err)
    const localRec: RegistrationRecord = {
      id: 'reg-' + Date.now(),
      matchId: registration.matchId,
      teamName: registration.teamName || 'SOLO PLAYER',
      player1Name: registration.player1Name,
      player1Uid: registration.player1Uid,
      whatsappNumber: registration.whatsappNumber,
      userEmail: registration.userEmail,
      paymentMethod: registration.paymentMethod,
      trxId: registration.trxId,
      amount: registration.amount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    saveLocalRegistrationRecord(localRec)
    return { success: true, message: 'Slot registration saved successfully!', id: localRec.id }
  }
}

const INITIAL_MOCK_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-001',
    matchId: 'solo-12sep',
    teamName: 'VAMPIRE SQUAD',
    player1Name: 'RIYAD_OP',
    player1Uid: '5123456789',
    whatsappNumber: '01700000000',
    userEmail: 'riyad.vampire@gmail.com',
    paymentMethod: 'bKash',
    trxId: 'BAX9021K9L',
    amount: 200,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reg-002',
    matchId: 'duo-13sep',
    teamName: 'DEADLY DUO',
    player1Name: 'SHAKIB_BD',
    player1Uid: '5987654321',
    whatsappNumber: '01800000000',
    userEmail: 'shakib.bd@gmail.com',
    paymentMethod: 'Nagad',
    trxId: 'NGD8821M0P',
    amount: 100,
    status: 'VERIFIED',
    createdAt: new Date().toISOString(),
  },
]

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
  if (merged.length === 0) {
    registrationsCache = { data: INITIAL_MOCK_REGISTRATIONS, timestamp: Date.now() }
    return INITIAL_MOCK_REGISTRATIONS
  }

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
  youtubeVideoUrl: 'https://www.youtube.com/watch?v=L6P3nI6VnlY',
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
    if (!parsed.youtubeVideoUrl) {
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
  duo: false, // Turned off by default per user request
  squad: false, // Turned off by default per user request
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

