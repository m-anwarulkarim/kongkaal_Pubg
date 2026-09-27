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
            // Clear SWR caches so next request fetches fresh data
            profilesCache = null
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
            allTxsCache = null // Clear tx cache
            window.dispatchEvent(new Event('wallet_updated'))
          }
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('[Wallet Service] Supabase realtime subscription error:', err)
  }
}

// Cross-tab BroadcastChannel sync for local browser multi-tab testing
let walletBroadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    walletBroadcastChannel = new BroadcastChannel('kongkaal_wallet_channel')
    walletBroadcastChannel.onmessage = (event) => {
      if (event.data === 'wallet_updated') {
        window.dispatchEvent(new Event('wallet_updated'))
        window.dispatchEvent(new Event('profile_updated'))
      }
    }
  } catch (err) {
    console.warn('[Wallet Service] BroadcastChannel init error:', err)
  }
}

export function notifyWalletUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wallet_updated'))
    window.dispatchEvent(new Event('profile_updated'))
    walletBroadcastChannel?.postMessage('wallet_updated')
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
  notifyWalletUpdate()
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
  notifyWalletUpdate()
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

  let pendingIgn = ''
  let pendingPhone = ''
  if (typeof window !== 'undefined') {
    pendingIgn = (localStorage.getItem('pending_pubg_ign') || '').trim()
    pendingPhone = (localStorage.getItem('pending_whatsapp') || '').trim()
  }

  if (!profile) {
    profile = {
      email: normEmail,
      name: pendingIgn || name || normEmail.split('@')[0],
      pubgUid: '',
      whatsappNumber: pendingPhone || '',
      walletBalance: 0,
      avatarUrl: avatarUrl || '',
    }
    wallets[normEmail] = profile
    saveLocalWallets(wallets)
  } else {
    let updated = false
    if (pendingIgn && profile.name !== pendingIgn) {
      profile.name = pendingIgn
      updated = true
    }
    if (pendingPhone && profile.whatsappNumber !== pendingPhone) {
      profile.whatsappNumber = pendingPhone
      updated = true
    }
    if (avatarUrl && !profile.avatarUrl) {
      profile.avatarUrl = avatarUrl
      updated = true
    }
    if (updated) {
      wallets[normEmail] = profile
      saveLocalWallets(wallets)
    }
  }

  // Clear pending items from storage
  if (typeof window !== 'undefined' && (pendingIgn || pendingPhone)) {
    localStorage.removeItem('pending_pubg_ign')
    localStorage.removeItem('pending_whatsapp')
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
        profile.name = pendingIgn || profile.name || data.name || ''
        profile.pubgUid = profile.pubgUid || data.pubg_uid || ''
        profile.whatsappNumber = profile.whatsappNumber || pendingPhone || data.whatsapp_number || ''
        profile.avatarUrl = profile.avatarUrl || data.avatar_url || ''
        wallets[normEmail] = profile
        saveLocalWallets(wallets)

        if (pendingIgn || pendingPhone) {
          await supabase.from('customer_wallets').upsert({
            email: normEmail,
            name: profile.name,
            pubg_uid: profile.pubgUid,
            whatsapp_number: profile.whatsappNumber,
            balance: profile.walletBalance,
            avatar_url: profile.avatarUrl,
          }, { onConflict: 'email' })
        }
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
          pubg_uid: updatedProfile.pubgUid || '',
          whatsapp_number: updatedProfile.whatsappNumber || '',
          balance: updatedProfile.walletBalance || 0,
          avatar_url: updatedProfile.avatarUrl || '',
        },
        { onConflict: 'email' }
      )
      if (error) console.warn('Supabase profile update error:', error.message)
    } catch (err) {
      console.error('Supabase profile update error:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wallet_updated'))
    window.dispatchEvent(new Event('profile_updated'))
  }

  return true
}

// 2.5 Deposit Cooldown Management
const DEPOSIT_COOLDOWN_KEY = 'kongkaal_deposit_cooldown_mins'

export function getDepositCooldownMinutes(): number {
  if (typeof window === 'undefined') return 5
  const val = localStorage.getItem(DEPOSIT_COOLDOWN_KEY)
  const parsed = val ? parseInt(val, 10) : 5
  return isNaN(parsed) || parsed < 0 ? 5 : parsed
}

export function saveDepositCooldownMinutes(mins: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEPOSIT_COOLDOWN_KEY, String(mins))
  window.dispatchEvent(new Event('storage'))
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
  const cleanTrxId = data.trxId.trim().toUpperCase()
  const txs = getLocalTxs()

  // 1. Duplicate TrxID Check
  const isDuplicateTrx = txs.some(
    (t) => t.trxId && t.trxId.trim().toUpperCase() === cleanTrxId
  )
  if (isDuplicateTrx) {
    return {
      success: false,
      message: 'এই Transaction ID (TrxID) দিয়ে ইতোমধ্যে একটি অনুরোধ জমা দেওয়া হয়েছে!',
    }
  }

  // 2. Cooldown Time Check
  const cooldownMins = getDepositCooldownMinutes()
  if (cooldownMins > 0) {
    const lastUserDep = txs.find(
      (t) => t.userEmail.toLowerCase() === normEmail && t.type === 'DEPOSIT'
    )
    if (lastUserDep && lastUserDep.createdAt) {
      const lastTime = new Date(lastUserDep.createdAt).getTime()
      const diffMs = Date.now() - lastTime
      const diffMins = diffMs / (1000 * 60)
      if (diffMins < cooldownMins) {
        const remainingSecs = Math.ceil(cooldownMins * 60 - diffMs / 1000)
        const minsLeft = Math.floor(remainingSecs / 60)
        const secsLeft = remainingSecs % 60
        const timeStr = minsLeft > 0 ? `${minsLeft} মিনিট ${secsLeft} সেকেন্ড` : `${secsLeft} সেকেন্ড`
        return {
          success: false,
          message: `আপনি মাত্র কিছুক্ষন আগে রিকোয়েস্ট পাঠিয়েছেন! পুনঃরায় অনুরোধ পাঠাতে আরও ${timeStr} অপেক্ষা করুন।`,
        }
      }
    }
  }

  const tx: WalletTransaction = {
    id: 'tx-dep-' + Date.now(),
    userEmail: normEmail,
    userName: data.userName,
    type: 'DEPOSIT',
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    trxId: cleanTrxId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    note: `Deposit via ${data.paymentMethod} (TrxID: ${cleanTrxId})`,
  }

  txs.unshift(tx)
  saveLocalTxs(txs)

  if (isSupabaseConfigured()) {
    try {
      const { data: dbData, error } = await supabase
        .from('wallet_transactions')
        .insert([
          {
            user_email: normEmail,
            user_name: data.userName,
            type: 'DEPOSIT',
            amount: data.amount,
            payment_method: data.paymentMethod,
            trx_id: cleanTrxId,
            status: 'PENDING',
            note: tx.note,
          },
        ])
        .select()
      if (dbData && dbData.length > 0 && dbData[0].id) {
        const allTxs = getLocalTxs()
        const idx = allTxs.findIndex((t) => t.id === tx.id)
        if (idx !== -1) {
          allTxs[idx].id = dbData[0].id
          saveLocalTxs(allTxs)
        }
      }
      if (error) {
        console.warn('[Wallet Service] Supabase deposit insert error:', error.message)
      }
    } catch (err) {
      console.warn('Supabase deposit insert warning:', err)
    }
  }

  clearTxsCache()
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
      const { data: dbData } = await supabase
        .from('wallet_transactions')
        .insert([
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
        .select()
      if (dbData && dbData.length > 0 && dbData[0].id) {
        const allTxs = getLocalTxs()
        const idx = allTxs.findIndex((t) => t.id === tx.id)
        if (idx !== -1) {
          allTxs[idx].id = dbData[0].id
          saveLocalTxs(allTxs)
        }
      }
    } catch (err) {
      console.warn('Supabase withdraw insert warning:', err)
    }
  }

  clearTxsCache()
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
      const { data: dbData } = await supabase
        .from('wallet_transactions')
        .insert([
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
        .select()
      if (dbData && dbData.length > 0 && dbData[0].id) {
        const allTxs = getLocalTxs()
        const idx = allTxs.findIndex((t) => t.id === tx.id)
        if (idx !== -1) {
          allTxs[idx].id = dbData[0].id
          saveLocalTxs(allTxs)
        }
      }
    } catch (err) {
      console.warn('Supabase pay entry fee insert warning:', err)
    }
  }

  clearTxsCache()
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
      const { data: dbData, error } = await supabase
        .from('wallet_transactions')
        .insert([
          {
            user_email: normEmail,
            user_name: profile.name,
            type: action === 'ADD' ? 'ADMIN_CREDIT' : 'WITHDRAW',
            amount,
            status: 'APPROVED',
            note: txNote,
          },
        ])
        .select()
      if (dbData && dbData.length > 0 && dbData[0].id) {
        const allTxs = getLocalTxs()
        const idx = allTxs.findIndex((t) => t.id === tx.id)
        if (idx !== -1) {
          allTxs[idx].id = dbData[0].id
          saveLocalTxs(allTxs)
        }
      }
      if (error) console.warn('[Wallet Service] Supabase admin credit insert error:', error.message)
    } catch (err) {
      console.warn('Supabase admin credit insert error:', err)
    }
  }

  clearTxsCache()
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
  const localTxs = getLocalTxs()
  let tx = localTxs.find((t) => t.id === id)
  let userEmail = tx?.userEmail
  let amount = tx?.amount || 0
  let type = tx?.type

  if (tx) {
    if (tx.status !== 'PENDING') {
      return { success: false, message: 'Transaction is already processed' }
    }
    tx.status = status
    saveLocalTxs(localTxs)

    const normEmail = tx.userEmail.trim().toLowerCase()
    if (tx.type === 'DEPOSIT' && status === 'APPROVED') {
      const profile = await getCustomerProfile(normEmail, tx.userName)
      profile.walletBalance += tx.amount
      await updateCustomerProfile(profile)
    } else if (tx.type === 'WITHDRAW' && status === 'REJECTED') {
      const profile = await getCustomerProfile(normEmail, tx.userName)
      profile.walletBalance += tx.amount
      await updateCustomerProfile(profile)
    }
  }

  if (isSupabaseConfigured()) {
    try {
      // If not found locally, fetch details from Supabase DB
      if (!userEmail || !type || !amount) {
        const { data: dbTx } = await supabase.from('wallet_transactions').select('*').eq('id', id).maybeSingle()
        if (dbTx) {
          userEmail = dbTx.user_email
          amount = Number(dbTx.amount)
          type = dbTx.type
        }
      }

      await supabase.from('wallet_transactions').update({ status }).eq('id', id)

      if (userEmail && amount > 0) {
        const normEmail = userEmail.trim().toLowerCase()
        if (type === 'DEPOSIT' && status === 'APPROVED') {
          const { data: dbWallet } = await supabase.from('customer_wallets').select('balance').ilike('email', normEmail).maybeSingle()
          const currentBal = dbWallet ? Number(dbWallet.balance || 0) : 0
          const newBal = currentBal + amount

          if (dbWallet) {
            await supabase.from('customer_wallets').update({ balance: newBal }).ilike('email', normEmail)
          } else {
            await supabase.from('customer_wallets').insert([{ email: normEmail, balance: newBal }])
          }

          const profile = await getCustomerProfile(normEmail)
          profile.walletBalance = newBal
          saveLocalWallets({ ...getLocalWallets(), [normEmail]: profile })
        } else if (type === 'WITHDRAW' && status === 'REJECTED') {
          const { data: dbWallet } = await supabase.from('customer_wallets').select('balance').ilike('email', normEmail).maybeSingle()
          const currentBal = dbWallet ? Number(dbWallet.balance || 0) : 0
          const newBal = currentBal + amount

          if (dbWallet) {
            await supabase.from('customer_wallets').update({ balance: newBal }).ilike('email', normEmail)
          } else {
            await supabase.from('customer_wallets').insert([{ email: normEmail, balance: newBal }])
          }

          const profile = await getCustomerProfile(normEmail)
          profile.walletBalance = newBal
          saveLocalWallets({ ...getLocalWallets(), [normEmail]: profile })
        }
      }
    } catch (err) {
      console.warn('Supabase update transaction exception:', err)
    }
  }

  clearTxsCache()
  notifyWalletUpdate()
  return { success: true, message: `Transaction status updated to ${status}` }
}

// SWR In-Memory Cache for admin all-transactions (30s TTL — user queries skip cache)
let allTxsCache: { data: WalletTransaction[]; timestamp: number } | null = null
const TX_CACHE_TTL_MS = 30_000

export function clearTxsCache() {
  allTxsCache = null
}

// 8. Get Transactions for User or Admin
export async function getWalletTransactions(userEmail?: string): Promise<WalletTransaction[]> {
  const normEmail = userEmail ? userEmail.trim().toLowerCase() : undefined
  const localTxs = getLocalTxs()
  let dbTxs: WalletTransaction[] = []

  // Admin all-txns: use cache to avoid hammering Supabase on every tab switch
  if (!normEmail && allTxsCache && Date.now() - allTxsCache.timestamp < TX_CACHE_TTL_MS) {
    return allTxsCache.data
  }

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
  let localModified = false
  filteredLocal.forEach((t) => {
    const existingDbT = Array.from(txMap.values()).find((dbT) => {
      if (dbT.id === t.id) return true
      if (t.trxId && dbT.trxId && t.trxId.trim().toLowerCase() === dbT.trxId.trim().toLowerCase()) return true
      const sameEmail = dbT.userEmail.toLowerCase() === t.userEmail.toLowerCase()
      const sameAmount = Number(dbT.amount) === Number(t.amount)
      const sameType = dbT.type === t.type
      const sameNote = (dbT.note || '') === (t.note || '')
      const timeDiff = Math.abs(new Date(dbT.createdAt).getTime() - new Date(t.createdAt).getTime())
      return sameEmail && sameAmount && sameType && sameNote && timeDiff < 120_000
    })

    if (!existingDbT) {
      txMap.set(t.id, t)
    } else if (t.id !== existingDbT.id && t.id.startsWith('tx-')) {
      t.id = existingDbT.id
      localModified = true
    }
  })

  if (localModified) {
    saveLocalTxs(localTxs)
  }

  const result = Array.from(txMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Cache only admin (all) queries
  if (!normEmail) {
    allTxsCache = { data: result, timestamp: Date.now() }
  }

  return result
}

// SWR In-Memory Cache for customer profiles (30s TTL)
let profilesCache: { data: CustomerProfile[]; timestamp: number } | null = null
const PROFILES_CACHE_TTL_MS = 30_000

export function clearProfilesCache() {
  profilesCache = null
}

// 9. Get All Customer Profiles for Admin
export async function getAllCustomerProfiles(): Promise<CustomerProfile[]> {
  // Return cached if fresh
  if (profilesCache && Date.now() - profilesCache.timestamp < PROFILES_CACHE_TTL_MS) {
    return profilesCache.data
  }

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

  const result = Object.values(map)
  profilesCache = { data: result, timestamp: Date.now() }
  return result
}

// 10. Delete Wallet Transaction
export async function deleteWalletTransaction(id: string): Promise<{ success: boolean; message: string }> {
  if (typeof window !== 'undefined') {
    const current = getLocalTxs()
    const updated = current.filter((t) => t.id !== id)
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updated))
    notifyWalletUpdate()
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').delete().eq('id', id)
    } catch (err: any) {
      console.warn('Supabase delete transaction exception:', err)
    }
  }

  return { success: true, message: 'Transaction deleted successfully!' }
}

// 11. Delete Customer Profile / Wallet
export async function deleteCustomerProfile(email: string): Promise<{ success: boolean; message: string }> {
  const normEmail = email.trim().toLowerCase()

  if (typeof window !== 'undefined') {
    const localWallets = getLocalWallets()
    delete localWallets[normEmail]
    localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(localWallets))

    // Remove customer profile storage
    const profileKey = `kongkaal_customer_profile_${normEmail}`
    localStorage.removeItem(profileKey)

    notifyWalletUpdate()
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('customer_wallets').delete().eq('email', normEmail)
    } catch (err: any) {
      console.warn('Supabase delete customer wallet exception:', err)
    }
  }

  return { success: true, message: 'Customer profile deleted successfully!' }
}

