export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'ADMIN_CREDIT' | 'ENTRY_FEE' | 'WINNING_PRIZE' | 'REFERRAL_BONUS'
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface WalletTransaction {
  id: string
  userEmail: string
  userName: string
  type: TransactionType
  amount: number
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'WALLET' | 'REFERRAL'
  trxId?: string
  accountNumber?: string
  status: TransactionStatus
  createdAt: string
  note?: string
  userIp?: string
}

export interface ReferredFriendRecord {
  friendEmail: string
  friendName: string
  date: string
  bonusAmount: number
  tournamentTitle?: string
}

export interface CustomerProfile {
  email: string
  name: string
  pubgUid: string
  whatsappNumber: string
  walletBalance: number
  avatarUrl?: string
  referralCode?: string
  referredBy?: string
  userIp?: string
  totalReferredFriends?: number
  totalReferralEarnings?: number
  referredFriends?: ReferredFriendRecord[]
}
