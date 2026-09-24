import { supabase, isSupabaseConfigured } from './supabase'
import type { MatchItem, PlayerRegistration } from '@/types/match'
import type { StoreProduct } from '@/types/store'
import { KONGKAAL_MATCHES } from '@/components/TournamentGridSection'

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

// 2. Save Player Slot Registration & Payment TrxID
export async function saveRegistration(registration: PlayerRegistration): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('[DB Service] Saving slot registration:', registration)

  if (!isSupabaseConfigured()) {
    console.log('[DB Service] Supabase not configured. Simulating successful local booking.')
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
          match_id: registration.matchId.includes('-') && registration.matchId.length > 20 ? registration.matchId : null,
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
