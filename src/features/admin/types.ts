export type AdminTabType = 'OVERVIEW' | 'PAYMENTS' | 'WALLET' | 'MATCHES' | 'PLAYERS' | 'SETTINGS'

export interface NewMatchFormData {
  title: string
  mode: 'SOLO' | 'DUO' | 'SQUAD'
  map: 'Erangel' | 'Miramar' | 'Sanhok' | 'Livik'
  time: string
  entryFee: number
  winnerPrize: number
  perKillPrize: number
  maxSlots: number
  image: string
}

