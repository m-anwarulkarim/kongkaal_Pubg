import { supabase, isSupabaseConfigured } from './supabase'
import type { MatchItem, PlayerRegistration, LeaderboardItem } from '@/types/match'


export interface RegistrationRecord extends PlayerRegistration {
  id: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt: string
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
    image: '/solo_battle.jpg',
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
    image: '/duo_battle.jpg',
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
    image: '/squad_showdown.jpg',
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

function saveLocalMatches(matches: MatchItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_matches', JSON.stringify(matches))
  }
}

// 1. Fetch Active Tournament Matches
export async function getMatches(): Promise<MatchItem[]> {
  if (!isSupabaseConfigured()) {
    return getLocalMatches()
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return getLocalMatches()
    }

    return data.map((m) => ({
      id: m.id,
      title: m.title,
      mode: m.mode,
      map: m.map,
      time: m.time,
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
    }))
  } catch (err) {
    console.error('[DB Service] Supabase query failed:', err)
    return getLocalMatches()
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

// 3b. Update Existing Match (Title, Image Picture, Entry Fee, Prize, etc.)
export async function updateMatch(match: MatchItem): Promise<{ success: boolean; message: string }> {
  const local = getLocalMatches()
  const updated = local.map((m) => (m.id === match.id ? match : m))
  saveLocalMatches(updated)

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('matches')
        .update({
          title: match.title,
          mode: match.mode,
          map: match.map,
          time: match.time,
          entry_fee: match.entryFee,
          winner_prize: match.winnerPrize,
          first_prize: match.firstPrize,
          second_prize: match.secondPrize,
          third_prize: match.thirdPrize,
          per_kill_prize: match.perKillPrize,
          max_slots: match.maxSlots,
          image: match.image,
          status: match.status,
          whatsapp_group_link: match.whatsappGroupLink || '',
        })
        .eq('id', match.id)
    } catch (err: any) {
      console.warn('Supabase update match error:', err)
    }
  }

  return { success: true, message: 'Match updated successfully!' }
}


// 4. Save Player Slot Registration & Payment TrxID
export async function saveRegistration(registration: PlayerRegistration): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('[DB Service] Saving slot registration:', registration)

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
      console.error('[DB Service] Error inserting registration:', error)
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: 'Registration saved to Supabase successfully!',
      id: data[0]?.id,
    }
  } catch (err: any) {
    console.error('[DB Service] Registration insert exception:', err)
    return { success: false, message: err?.message || 'Unknown database error' }
  }
}

// 5. Fetch All Registrations for Admin Dashboard
export async function getAllRegistrations(): Promise<RegistrationRecord[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: 'reg-001',
        matchId: 'solo-12sep',
        teamName: 'VAMPIRE SQUAD',
        player1Name: 'RIYAD_OP',
        player1Uid: '5123456789',
        whatsappNumber: '01700000000',
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
        paymentMethod: 'Nagad',
        trxId: 'NGD8821M0P',
        amount: 100,
        status: 'VERIFIED',
        createdAt: new Date().toISOString(),
      },
    ]
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('[DB Service] Error fetching registrations:', error)
      return []
    }

    return data.map((r) => ({
      id: r.id,
      matchId: r.match_id || 'general',
      teamName: r.team_name,
      player1Name: r.player1_name,
      player1Uid: r.player1_uid,
      whatsappNumber: r.whatsapp_number,
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
    }))
  } catch (err) {
    console.error('[DB Service] Exception fetching registrations:', err)
    return []
  }
}

// 6. Update Registration Status (Approve/Reject)
export async function updateRegistrationStatus(id: string, status: 'VERIFIED' | 'REJECTED'): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: `Registration status updated to ${status} locally.` }
  }

  try {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: `Status updated to ${status} successfully!` }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update status' }
  }
}

// Initial default leaderboard entries
export const INITIAL_LEADERBOARD: LeaderboardItem[] = [
  {
    id: 'lb-1',
    matchTitle: 'Erangel Squad Championship #308',
    teamName: 'VIP ESPORTS',
    playerIgn: 'VIP_SHADOW',
    kills: 18,
    prizeWon: 6440,
    status: 'VERIFIED PAYOUT',
  },
  {
    id: 'lb-2',
    matchTitle: 'Solo Erangel Rush #100',
    teamName: 'SOLO PLAYER',
    playerIgn: 'CYCLONE_99',
    kills: 11,
    prizeWon: 1720,
    status: 'VERIFIED PAYOUT',
  },
  {
    id: 'lb-3',
    matchTitle: 'Duo Miramar Tactical #203',
    teamName: 'DEADLY DUO',
    playerIgn: 'RAKIB_OP',
    kills: 14,
    prizeWon: 3560,
    status: 'VERIFIED PAYOUT',
  },
  {
    id: 'lb-4',
    matchTitle: 'Squad Sanhok War #307',
    teamName: 'DARK HUNTERS',
    playerIgn: 'HUNTER_X',
    kills: 21,
    prizeWon: 7680,
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
      kills: Number(d.kills),
      prizeWon: Number(d.prize_won),
      status: d.status || 'VERIFIED PAYOUT',
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
        kills: item.kills,
        prize_won: item.prizeWon,
        status: item.status,
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
          kills: updates.kills,
          prize_won: updates.prizeWon,
          status: updates.status,
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

