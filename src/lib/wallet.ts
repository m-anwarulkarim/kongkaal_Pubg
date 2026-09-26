import { supabase, isSupabaseConfigured } from './supabase'
import type { WalletTransaction, CustomerProfile } from '@/types/wallet'

const LOCAL_WALLET_KEY = 'kongkaal_customer_wallets'
const LOCAL_TX_KEY = 'kongkaal_wallet_transactions'

// Subscribe to Realtime DB events for wallets & transactions
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    supabase
      .channel('kongkaal_wallet_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_wallets' },
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('profile_updated'))
            window.dispatchEvent(new Event('wallet_updated'))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallet_transactions' },
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('wallet_updated'))
          }
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('[Wallet Service] Supabase realtime subscription error:', err)
  }
}

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
  window.dispatchEvent(new Event('profile_updated'))
  window.dispatchEvent(new Event('wallet_updated'))
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
  window.dispatchEvent(new Event('wallet_updated'))
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
export async function getCustomerProfile(email: string, name?: string, avatarUrl?: string): Promise<CustomerProfile> {
  const normEmail = email.trim().toLowerCase()
  const wallets = getLocalWallets()
  let profile = wallets[normEmail]

  if (!profile) {
    profile = {
      email: normEmail,
      name: name || normEmail.split('@')[0],
      pubgUid: '',
      whatsappNumber: '',
      walletBalance: 0,
      avatarUrl: avatarUrl || '',
    }
    wallets[normEmail] = profile
    saveLocalWallets(wallets)
  } else if (avatarUrl && !profile.avatarUrl) {
    profile.avatarUrl = avatarUrl
    wallets[normEmail] = profile
    saveLocalWallets(wallets)
  }

  // Sync with Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customer_wallets')
        .select('*')
        .ilike('email', normEmail)
        .maybeSingle()

      if (data) {
        profile.walletBalance = Number(data.balance !== undefined ? data.balance : profile.walletBalance)
        profile.name = data.name || profile.name
        profile.pubgUid = data.pubg_uid || profile.pubgUid
        profile.whatsappNumber = data.whatsapp_number || profile.whatsappNumber
        profile.avatarUrl = data.avatar_url || profile.avatarUrl
        wallets[normEmail] = profile
        saveLocalWallets(wallets)
      } else if (!error) {
        // Upsert new profile to Supabase if not present yet
        await supabase.from('customer_wallets').upsert(
          {
            email: normEmail,
            name: profile.name,
            pubg_uid: profile.pubgUid,
            whatsapp_number: profile.whatsappNumber,
            balance: profile.walletBalance,
            avatar_url: profile.avatarUrl,
          },
          { onConflict: 'email' }
        )
      }
    } catch (err) {
      console.log('Supabase customer wallet sync err:', err)
    }
  }

  return profile
}

// 2. Save / Update Customer Profile
export async function updateCustomerProfile(profile: CustomerProfile): Promise<boolean> {
  const normEmail = profile.email.trim().toLowerCase()
  const updatedProfile = { ...profile, email: normEmail }

  const wallets = getLocalWallets()
  wallets[normEmail] = updatedProfile
  saveLocalWallets(wallets)

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('customer_wallets').upsert(
        {
          email: normEmail,
          name: updatedProfile.name,
          pubg_uid: updatedProfile.pubgUid,
          whatsapp_number: updatedProfile.whatsappNumber,
          balance: updatedProfile.walletBalance,
          avatar_url: updatedProfile.avatarUrl,
        },
        { onConflict: 'email' }
      )
      if (error) {
        console.warn('Supabase profile upsert error:', error.message)
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wallet_updated'))
        window.dispatchEvent(new Event('profile_updated'))
      }
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
  const normEmail = data.userEmail.trim().toLowerCase()
  const tx: WalletTransaction = {
    id: 'tx-dep-' + Date.now(),
    userEmail: normEmail,
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').insert([
        {
          user_email: normEmail,
          user_name: data.userName,
          type: 'DEPOSIT',
          amount: data.amount,
          payment_method: data.paymentMethod,
          trx_id: data.trxId,
          status: 'PENDING',
          note: tx.note,
        },
      ])
    } catch (err) {
      console.warn('Supabase deposit insert warning:', err)
    }
  }

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
  const normEmail = data.userEmail.trim().toLowerCase()
  const profile = await getCustomerProfile(normEmail, data.userName)

  if (profile.walletBalance < data.amount) {
    return { success: false, message: 'Insufficient wallet balance!' }
  }

  // Deduct balance temporarily for pending withdraw
  profile.walletBalance -= data.amount
  await updateCustomerProfile(profile)

  const tx: WalletTransaction = {
    id: 'tx-wth-' + Date.now(),
    userEmail: normEmail,
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').insert([
        {
          user_email: normEmail,
          user_name: data.userName,
          type: 'WITHDRAW',
          amount: data.amount,
          payment_method: data.paymentMethod,
          account_number: data.accountNumber,
          status: 'PENDING',
          note: tx.note,
        },
      ])
    } catch (err) {
      console.warn('Supabase withdraw insert warning:', err)
    }
  }

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
  const normEmail = userEmail.trim().toLowerCase()
  const profile = await getCustomerProfile(normEmail, userName)

  if (profile.walletBalance < amount) {
    return { success: false, message: 'Insufficient wallet balance! Please add money first.' }
  }

  profile.walletBalance -= amount
  await updateCustomerProfile(profile)

  const tx: WalletTransaction = {
    id: 'tx-pay-' + Date.now(),
    userEmail: normEmail,
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').insert([
        {
          user_email: normEmail,
          user_name: userName,
          type: 'ENTRY_FEE',
          amount,
          payment_method: 'WALLET',
          status: 'APPROVED',
          note: tx.note,
        },
      ])
    } catch (err) {
      console.warn('Supabase pay entry fee insert warning:', err)
    }
  }

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
  const normEmail = userEmail.trim().toLowerCase()
  const profile = await getCustomerProfile(normEmail)

  if (action === 'DEDUCT' && profile.walletBalance < amount) {
    profile.walletBalance = 0
  } else if (action === 'DEDUCT') {
    profile.walletBalance -= amount
  } else {
    profile.walletBalance += amount
  }

  await updateCustomerProfile(profile)

  const txNote = note || (action === 'ADD' ? 'Added by Admin (+)' : 'Deducted by Admin (-)')
  const tx: WalletTransaction = {
    id: 'tx-admin-' + Date.now(),
    userEmail: normEmail,
    userName: profile.name,
    type: action === 'ADD' ? 'ADMIN_CREDIT' : 'WITHDRAW',
    amount,
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    note: txNote,
  }

  const txs = getLocalTxs()
  txs.unshift(tx)
  saveLocalTxs(txs)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').insert([
        {
          user_email: normEmail,
          user_name: profile.name,
          type: action === 'ADD' ? 'ADMIN_CREDIT' : 'WITHDRAW',
          amount,
          status: 'APPROVED',
          note: txNote,
        },
      ])
    } catch (err) {
      console.warn('Supabase admin credit insert error:', err)
    }
  }

  return {
    success: true,
    message: `${action === 'ADD' ? '+' : '-'}৳${amount} ${action === 'ADD' ? 'added to' : 'deducted from'} ${normEmail} successfully!`,
  }
}

// 7. Admin Approve / Reject Transaction
export async function adminApproveTransaction(
  id: string,
  status: 'APPROVED' | 'REJECTED'
): Promise<{ success: boolean; message: string }> {
  const txs = getLocalTxs()
  const tx = txs.find((t) => t.id === id)

  if (tx) {
    if (tx.status !== 'PENDING') {
      return { success: false, message: 'Transaction is already processed' }
    }
    tx.status = status

    const normEmail = tx.userEmail.trim().toLowerCase()
    // If Deposit is APPROVED, add to user balance
    if (tx.type === 'DEPOSIT' && status === 'APPROVED') {
      const profile = await getCustomerProfile(normEmail, tx.userName)
      profile.walletBalance += tx.amount
      await updateCustomerProfile(profile)
    }

    // If Withdraw is REJECTED, refund balance back to user
    if (tx.type === 'WITHDRAW' && status === 'REJECTED') {
      const profile = await getCustomerProfile(normEmail, tx.userName)
      profile.walletBalance += tx.amount
      await updateCustomerProfile(profile)
    }

    saveLocalTxs(txs)
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').update({ status }).eq('id', id)
      // If transaction was deposit approved or withdraw rejected in Supabase DB:
      if (tx) {
        const normEmail = tx.userEmail.trim().toLowerCase()
        if (tx.type === 'DEPOSIT' && status === 'APPROVED') {
          const { data: dbWallet } = await supabase.from('customer_wallets').select('balance').ilike('email', normEmail).maybeSingle()
          if (dbWallet) {
            await supabase.from('customer_wallets').update({ balance: Number(dbWallet.balance) + tx.amount }).ilike('email', normEmail)
          }
        } else if (tx.type === 'WITHDRAW' && status === 'REJECTED') {
          const { data: dbWallet } = await supabase.from('customer_wallets').select('balance').ilike('email', normEmail).maybeSingle()
          if (dbWallet) {
            await supabase.from('customer_wallets').update({ balance: Number(dbWallet.balance) + tx.amount }).ilike('email', normEmail)
          }
        }
      }
    } catch (err) {
      console.warn('Supabase update transaction error:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wallet_updated'))
    window.dispatchEvent(new Event('profile_updated'))
  }

  return { success: true, message: `Transaction status updated to ${status}` }
}

// 8. Get Transactions for User or Admin
export async function getWalletTransactions(userEmail?: string): Promise<WalletTransaction[]> {
  const normEmail = userEmail ? userEmail.trim().toLowerCase() : undefined
  const localTxs = getLocalTxs()
  let dbTxs: WalletTransaction[] = []

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false })
      if (normEmail) {
        query = query.ilike('user_email', normEmail)
      }
      const { data } = await query
      if (data && data.length > 0) {
        dbTxs = data.map((d: any) => ({
          id: d.id,
          userEmail: d.user_email,
          userName: d.user_name || d.user_email.split('@')[0],
          type: d.type,
          amount: Number(d.amount),
          paymentMethod: d.payment_method,
          trxId: d.trx_id,
          accountNumber: d.account_number,
          status: d.status,
          createdAt: d.created_at,
          note: d.note,
        }))
      }
    } catch (err) {
      console.log('Supabase getWalletTransactions err:', err)
    }
  }

  const txMap = new Map<string, WalletTransaction>()
  dbTxs.forEach((t) => txMap.set(t.id, t))

  const filteredLocal = normEmail ? localTxs.filter((t) => t.userEmail.toLowerCase() === normEmail) : localTxs
  filteredLocal.forEach((t) => {
    // Check if not already present in map by id or trxId
    const exists = Array.from(txMap.values()).some((dbT) => dbT.id === t.id || (t.trxId && dbT.trxId === t.trxId))
    if (!exists) {
      txMap.set(t.id, t)
    }
  })

  return Array.from(txMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 9. Get All Customer Profiles for Admin
export async function getAllCustomerProfiles(): Promise<CustomerProfile[]> {
  const localWallets = getLocalWallets()
  const map: Record<string, CustomerProfile> = {}

  Object.entries(localWallets).forEach(([key, val]) => {
    map[key.toLowerCase()] = { ...val, email: val.email.toLowerCase() }
  })

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('customer_wallets').select('*')
      if (data && data.length > 0) {
        data.forEach((d: any) => {
          const normKey = d.email.trim().toLowerCase()
          map[normKey] = {
            email: normKey,
            name: d.name || normKey.split('@')[0],
            pubgUid: d.pubg_uid || map[normKey]?.pubgUid || '',
            whatsappNumber: d.whatsapp_number || map[normKey]?.whatsappNumber || '',
            walletBalance: Number(d.balance !== undefined ? d.balance : (map[normKey]?.walletBalance || 0)),
            avatarUrl: d.avatar_url || map[normKey]?.avatarUrl || '',
          }
        })
      }
    } catch (err) {
      console.log('Supabase getAllCustomerProfiles err:', err)
    }
  }

  return Object.values(map)
}

