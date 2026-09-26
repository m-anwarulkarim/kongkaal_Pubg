export type GameMode = 'SOLO' | 'DUO' | 'SQUAD'

export type MapName = 'Erangel' | 'Miramar' | 'Sanhok' | 'Livik'

export type MatchStatus = 'OPEN' | 'FILLING_FAST' | 'LIVE_SOON' | 'COMING_SOON' | 'COMPLETED'

export interface RankPrize {
  rank: string
  amount: number
}

export interface MatchItem {
  id: string
  title: string
  mode: GameMode
  map: MapName
  time: string
  entryFee: number
  winnerPrize: number
  firstPrize?: number
  secondPrize?: number
  thirdPrize?: number
  perKillPrize: number
  rankPrizes?: RankPrize[]
  joinedSlots: number
  maxSlots: number
  image: string
  status: MatchStatus
  whatsappGroupLink?: string
}

export interface PlayerRegistration {
  matchId: string
  teamName?: string
  player1Name: string
  player1Uid: string
  whatsappNumber: string
  player2Name?: string
  player2Uid?: string
  player3Name?: string
  player3Uid?: string
  player4Name?: string
  player4Uid?: string
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'WALLET'
  trxId: string
  amount: number
}

export interface LeaderboardItem {
  id: string
  matchTitle: string
  teamName: string
  playerIgn: string
  pubgUid?: string
  avatarUrl?: string
  rank?: string
  kills: number
  prizeWon: number
  status: 'VERIFIED PAYOUT' | 'PENDING'
  isPinned?: boolean
  pinnedPosition?: number
}
