import { supabase, isSupabaseConfigured } from './supabase'
import type { WalletTransaction, CustomerProfile } from '@/types/wallet'

const LOCAL_WALLET_KEY = 'kongkaal_customer_wallets'
const LOCAL_TX_KEY = 'kongkaal_wallet_transactions'

// Helper to get local mock storage
function getLocalWallets(): Record<string, CustomerProfile> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LOCAL_WALLET_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalWallets(wallets: Record<string, CustomerProfile>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(wallets))
}

function getLocalTxs(): WalletTransaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalTxs(txs: WalletTransaction[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs))
}

// Initial Mock Seed
if (typeof window !== 'undefined' && getLocalTxs().length === 0) {
  saveLocalTxs([
    {
      id: 'tx-101',
      userEmail: 'player1@gmail.com',
      userName: 'RIYAD_OP',
      type: 'DEPOSIT',
      amount: 500,
      paymentMethod: 'bKash',
      trxId: 'BAX9021K9L',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      note: 'Initial deposit via bKash',
    },
    {
      id: 'tx-102',
      userEmail: 'player1@gmail.com',
      userName: 'RIYAD_OP',
      type: 'WINNING_PRIZE',
      amount: 2000,
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      note: '1st Place Prize - Solo Battle Tournament',
    },
  ])

  saveLocalWallets({
    'player1@gmail.com': {
      email: 'player1@gmail.com',
      name: 'RIYAD_OP',
      pubgUid: '5123456789',
      whatsappNumber: '01700000000',
      walletBalance: 2500,
    },
  })
}

// 1. Get or Create Customer Profile
export async function getCustomerProfile(email: string, name?: string): Promise<CustomerProfile> {
  const wallets = getLocalWallets()
  let profile = wallets[email]

  if (!profile) {
    profile = {
      email,
      name: name || email.split('@')[0],
      pubgUid: '',
      whatsappNumber: '',
      walletBalance: 0,
    }
    wallets[email] = profile
    saveLocalWallets(wallets)
  }

  // If Supabase is available, sync balance
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('customer_wallets')
        .select('*')
        .eq('email', email)
        .single()

      if (data) {
        profile.walletBalance = Number(data.balance)
        profile.pubgUid = data.pubg_uid || profile.pubgUid
        profile.whatsappNumber = data.whatsapp_number || profile.whatsappNumber
      }
    } catch (err) {
      console.log('Supabase customer wallet sync err:', err)
    }
  }

  return profile
}

// 2. Save / Update Customer Profile
export async function updateCustomerProfile(profile: CustomerProfile): Promise<boolean> {
  const wallets = getLocalWallets()
  wallets[profile.email] = profile
  saveLocalWallets(wallets)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('customer_wallets').upsert({
        email: profile.email,
        name: profile.name,
        pubg_uid: profile.pubgUid,
        whatsapp_number: profile.whatsappNumber,
        balance: profile.walletBalance,
      })
    } catch (err) {
      console.error('Supabase profile update error:', err)
    }
  }
  return true
}

// 3. Customer Add Money (Deposit Request)
export async function requestDeposit(data: {
  userEmail: string
  userName: string
  amount: number
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket'
  trxId: string
}): Promise<{ success: boolean; message: string }> {
  const tx: WalletTransaction = {
    id: 'tx-dep-' + Date.now(),
    userEmail: data.userEmail,
    userName: data.userName,
    type: 'DEPOSIT',
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    trxId: data.trxId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    note: `Deposit via ${data.paymentMethod} (TrxID: ${data.trxId})`,
  }

  const txs = getLocalTxs()
  txs.unshift(tx)
  saveLocalTxs(txs)

  return {
    success: true,
    message: 'Deposit request submitted successfully! Admin will verify your TrxID shortly.',
  }
}

// 4. Customer Withdraw Request
export async function requestWithdraw(data: {
  userEmail: string
  userName: string
  amount: number
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket'
  accountNumber: string
}): Promise<{ success: boolean; message: string }> {
  const profile = await getCustomerProfile(data.userEmail, data.userName)

  if (profile.walletBalance < data.amount) {
    return { success: false, message: 'Insufficient wallet balance!' }
  }

  // Deduct balance temporarily for pending withdraw
  profile.walletBalance -= data.amount
  await updateCustomerProfile(profile)

  const tx: WalletTransaction = {
    id: 'tx-wth-' + Date.now(),
    userEmail: data.userEmail,
    userName: data.userName,
    type: 'WITHDRAW',
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    accountNumber: data.accountNumber,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    note: `Withdraw request to ${data.paymentMethod} (${data.accountNumber})`,
  }

  const txs = getLocalTxs()
  txs.unshift(tx)
  saveLocalTxs(txs)

  return {
    success: true,
    message: 'Withdrawal request submitted! Amount deducted from balance.',
  }
}

// 5. Pay Match Slot using Wallet Balance
export async function payMatchWithWallet(
  userEmail: string,
  userName: string,
  amount: number,
  matchTitle: string
): Promise<{ success: boolean; message: string }> {
  const profile = await getCustomerProfile(userEmail, userName)

  if (profile.walletBalance < amount) {
    return { success: false, message: 'Insufficient wallet balance! Please add money first.' }
  }

  profile.walletBalance -= amount
  await updateCustomerProfile(profile)

  const tx: WalletTransaction = {
    id: 'tx-pay-' + Date.now(),
    userEmail,
    userName,
    type: 'ENTRY_FEE',
    amount,
    paymentMethod: 'WALLET',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    note: `Paid entry fee for ${matchTitle}`,
  }

  const txs = getLocalTxs()
  txs.unshift(tx)
  saveLocalTxs(txs)

  return {
    success: true,
    message: 'Entry fee paid using wallet balance successfully!',
  }
}

// 6. Admin Credit / Deduct Money to/from Customer
export async function adminAdjustCustomerWallet(
  userEmail: string,
  amount: number,
  action: 'ADD' | 'DEDUCT',
  note?: string
): Promise<{ success: boolean; message: string }> {
  const profile = await getCustomerProfile(userEmail)

  if (action === 'DEDUCT' && profile.walletBalance < amount) {
    profile.walletBalance = 0
  } else if (action === 'DEDUCT') {
    profile.walletBalance -= amount
  } else {
    profile.walletBalance += amount
  }

  await updateCustomerProfile(profile)

  const tx: WalletTransaction = {
    id: 'tx-admin-' + Date.now(),
    userEmail,
    userName: profile.name,
    type: action === 'ADD' ? 'ADMIN_CREDIT' : 'WITHDRAW',
    amount,
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    note: note || (action === 'ADD' ? 'Added by Admin (+)' : 'Deducted by Admin (-)'),
  }

  const txs = getLocalTxs()
  txs.unshift(tx)
  saveLocalTxs(txs)

  return {
    success: true,
    message: `${action === 'ADD' ? '+' : '-'}৳${amount} ${action === 'ADD' ? 'added to' : 'deducted from'} ${userEmail} successfully!`,
  }
}

// 7. Admin Approve / Reject Transaction
export async function adminApproveTransaction(
  id: string,
  status: 'APPROVED' | 'REJECTED'
): Promise<{ success: boolean; message: string }> {
  const txs = getLocalTxs()
  const tx = txs.find((t) => t.id === id)

  if (!tx) return { success: false, message: 'Transaction not found' }

  if (tx.status !== 'PENDING') {
    return { success: false, message: 'Transaction is already processed' }
  }

  tx.status = status

  // If Deposit is APPROVED, add to user balance
  if (tx.type === 'DEPOSIT' && status === 'APPROVED') {
    const profile = await getCustomerProfile(tx.userEmail, tx.userName)
    profile.walletBalance += tx.amount
    await updateCustomerProfile(profile)
  }

  // If Withdraw is REJECTED, refund balance back to user
  if (tx.type === 'WITHDRAW' && status === 'REJECTED') {
    const profile = await getCustomerProfile(tx.userEmail, tx.userName)
    profile.walletBalance += tx.amount
    await updateCustomerProfile(profile)
  }

  saveLocalTxs(txs)
  return { success: true, message: `Transaction status updated to ${status}` }
}

// 8. Get Transactions for User or Admin
export async function getWalletTransactions(userEmail?: string): Promise<WalletTransaction[]> {
  const txs = getLocalTxs()
  if (userEmail) {
    return txs.filter((t) => t.userEmail.toLowerCase() === userEmail.toLowerCase())
  }
  return txs
}

// 9. Get All Customer Profiles for Admin
export async function getAllCustomerProfiles(): Promise<CustomerProfile[]> {
  const wallets = getLocalWallets()
  return Object.values(wallets)
}
