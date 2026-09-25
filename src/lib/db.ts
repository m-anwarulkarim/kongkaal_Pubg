import { supabase, isSupabaseConfigured } from './supabase'
import type { MatchItem, PlayerRegistration } from '@/types/match'
import { KONGKAAL_MATCHES } from '@/components/TournamentGridSection'

export interface RegistrationRecord extends PlayerRegistration {
  id: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt: string
}

// 1. Fetch Active Tournament Matches
export async function getMatches(): Promise<MatchItem[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DB Service] Supabase not configured. Using fallback local matches.')
    return KONGKAAL_MATCHES
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      console.warn('[DB Service] Error or empty data from Supabase matches. Fallback to local matches.', error)
      return KONGKAAL_MATCHES
    }

    return data.map((m) => ({
      id: m.id,
      title: m.title,
      mode: m.mode,
      map: m.map,
      time: m.time,
      entryFee: Number(m.entry_fee),
      winnerPrize: Number(m.winner_prize),
      perKillPrize: Number(m.per_kill_prize),
      joinedSlots: m.joined_slots,
      maxSlots: m.max_slots,
      image: m.image,
      status: m.status,
    }))
  } catch (err) {
    console.error('[DB Service] Supabase query failed:', err)
    return KONGKAAL_MATCHES
  }
}

// 2. Create / Add New Tournament Match
export async function createMatch(match: Omit<MatchItem, 'id'>): Promise<{ success: boolean; message: string; id?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Match created locally (Supabase unconfigured)', id: 'local-match-' + Date.now() }
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
          per_kill_prize: match.perKillPrize,
          joined_slots: match.joinedSlots || 0,
          max_slots: match.maxSlots || 100,
          image: match.image,
          status: match.status || 'OPEN',
        },
      ])
      .select()

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Match created in Supabase successfully!', id: data[0]?.id }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to create match' }
  }
}

// 3. Delete Match
export async function deleteMatch(id: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Match deleted locally' }
  }

  try {
    const { error } = await supabase.from('matches').delete().eq('id', id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Match deleted successfully' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to delete match' }
  }
}

// 3b. Update Existing Match (Title, Image Picture, Entry Fee, Prize, etc.)
export async function updateMatch(match: MatchItem): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Match updated locally' }
  }

  try {
    const { error } = await supabase
      .from('matches')
      .update({
        title: match.title,
        mode: match.mode,
        map: match.map,
        time: match.time,
        entry_fee: match.entryFee,
        winner_prize: match.winnerPrize,
        per_kill_prize: match.perKillPrize,
        max_slots: match.maxSlots,
        image: match.image,
        status: match.status,
      })
      .eq('id', match.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Match updated successfully in Supabase!' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update match' }
  }
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
