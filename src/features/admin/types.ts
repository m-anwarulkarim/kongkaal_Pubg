import type { MatchStatus } from '@/types/match'

export type AdminTabType = 'OVERVIEW' | 'PAYMENTS' | 'WALLET' | 'MATCHES' | 'PLAYERS' | 'LEADERBOARD' | 'MESSAGES' | 'SETTINGS'

export interface NewMatchFormData {
  title: string
  mode: 'SOLO' | 'DUO' | 'SQUAD'
  map: 'Erangel' | 'Miramar' | 'Sanhok' | 'Livik'
  time: string
  entryFee: number
  winnerPrize: number
  firstPrize: number
  secondPrize: number
  thirdPrize: number
  perKillPrize: number
  maxSlots: number
  image: string
  status?: MatchStatus
}

