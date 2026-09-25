export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'ADMIN_CREDIT' | 'ENTRY_FEE' | 'WINNING_PRIZE'
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface WalletTransaction {
  id: string
  userEmail: string
  userName: string
  type: TransactionType
  amount: number
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'WALLET'
  trxId?: string
  accountNumber?: string
  status: TransactionStatus
  createdAt: string
  note?: string
}

export interface CustomerProfile {
  email: string
  name: string
  pubgUid: string
  whatsappNumber: string
  walletBalance: number
  avatarUrl?: string
}
