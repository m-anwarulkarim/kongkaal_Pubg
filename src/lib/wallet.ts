import { supabase, isSupabaseConfigured } from './supabase'
import type { WalletTransaction, CustomerProfile, ReferredFriendRecord } from '@/types/wallet'

const LOCAL_WALLET_KEY = 'kongkaal_customer_wallets'
const LOCAL_TX_KEY = 'kongkaal_wallet_transactions'

// Subscribe to Realtime DB events for wallets & transactions
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    const channelName = 'kongkaal_wallet_realtime_changes'
    const existing = supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`)
    if (existing) {
      supabase.removeChannel(existing)
    }
    supabase
      .channel(channelName)
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

function saveLocalWallets(wallets: Record<string, CustomerProfile>, notify = true) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(wallets))
  if (notify) {
    notifyWalletUpdate()
  }
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

function saveLocalTxs(txs: WalletTransaction[], notify = true) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs))
  if (notify) {
    notifyWalletUpdate()
  }
}

// Auto-purge test user player1@gmail.com if present in local storage
if (typeof window !== 'undefined') {
  try {
    const rawWallets = localStorage.getItem(LOCAL_WALLET_KEY)
    if (rawWallets && rawWallets.includes('player1@gmail.com')) {
      const wallets = JSON.parse(rawWallets)
      delete wallets['player1@gmail.com']
      localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(wallets))
    }

    const rawTxs = localStorage.getItem(LOCAL_TX_KEY)
    if (rawTxs && rawTxs.includes('player1@gmail.com')) {
      const txs = JSON.parse(rawTxs).filter((t: any) => t.userEmail !== 'player1@gmail.com')
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs))
    }

    localStorage.removeItem('kongkaal_customer_profile_player1@gmail.com')
  } catch {
    // Silently continue
  }
}

// 1. Get or Create Customer Profile
export async function getCustomerProfile(email: string, name?: string, avatarUrl?: string): Promise<CustomerProfile> {
  const normEmail = email.trim().toLowerCase()
  const wallets = getLocalWallets()
  let profile = wallets[normEmail]

  let pendingIgn = ''
  let pendingUid = ''
  let pendingPhone = ''
  if (typeof window !== 'undefined') {
    pendingIgn = (localStorage.getItem('pending_pubg_ign') || '').trim()
    pendingUid = (localStorage.getItem('pending_pubg_uid') || '').trim()
    pendingPhone = (localStorage.getItem('pending_whatsapp') || '').trim()
  }

  if (!profile) {
    profile = {
      email: normEmail,
      name: pendingIgn || name || normEmail.split('@')[0],
      pubgUid: pendingUid || '',
      whatsappNumber: pendingPhone || '',
      walletBalance: 0,
      avatarUrl: avatarUrl || '',
    }
    wallets[normEmail] = profile
    saveLocalWallets(wallets, false)
  } else {
    let updated = false
    if (pendingIgn && (!profile.name || profile.name.trim() === '')) {
      profile.name = pendingIgn
      updated = true
    }
    if (pendingUid && (!profile.pubgUid || profile.pubgUid.trim() === '')) {
      profile.pubgUid = pendingUid
      updated = true
    }
    if (pendingPhone && (!profile.whatsappNumber || profile.whatsappNumber.trim() === '')) {
      profile.whatsappNumber = pendingPhone
      updated = true
    }
    if (avatarUrl && !profile.avatarUrl) {
      profile.avatarUrl = avatarUrl
      updated = true
    }
    if (updated) {
      wallets[normEmail] = profile
      saveLocalWallets(wallets, false)
    }
  }

  // Clear pending items from storage
  if (typeof window !== 'undefined' && (pendingIgn || pendingUid || pendingPhone)) {
    localStorage.removeItem('pending_pubg_ign')
    localStorage.removeItem('pending_pubg_uid')
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
        const emailPrefix = normEmail.split('@')[0]
        let bestName = profile.name || data.name || pendingIgn || name || emailPrefix
        if (profile.name && profile.name.trim().toLowerCase() !== emailPrefix.toLowerCase()) {
          bestName = profile.name
        } else if (data.name && data.name.trim().toLowerCase() !== emailPrefix.toLowerCase()) {
          bestName = data.name
        }

        profile.walletBalance = Number(data.balance !== undefined ? data.balance : profile.walletBalance)
        profile.name = bestName
        profile.pubgUid = data.pubg_uid || profile.pubgUid || pendingUid || ''
        profile.whatsappNumber = data.whatsapp_number || profile.whatsappNumber || pendingPhone || ''
        profile.avatarUrl = data.avatar_url || profile.avatarUrl || ''
        wallets[normEmail] = profile
        saveLocalWallets(wallets, false)

        await supabase.from('customer_wallets').upsert({
          email: normEmail,
          name: profile.name,
          pubg_uid: profile.pubgUid,
          whatsapp_number: profile.whatsappNumber,
          balance: profile.walletBalance,
          avatar_url: profile.avatarUrl,
        }, { onConflict: 'email' })
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

  if (!profile.referralCode) {
    profile.referralCode = generateReferralCode(normEmail, profile.name)
    wallets[normEmail] = profile
    saveLocalWallets(wallets, false)
  }

  return profile
}
export function generateReferralCode(email: string, name?: string): string {
  const cleanEmail = (email || '').trim().toLowerCase()
  const prefix = (name || cleanEmail.split('@')[0])
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'KONG'

  let hash = 0
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash << 5) - hash + cleanEmail.charCodeAt(i)
    hash |= 0
  }
  const codeNum = Math.abs(hash % 9000) + 1000
  return `${prefix}-${codeNum}`
}

export async function processReferralRewardOnTournamentJoin(
  friendEmail: string,
  friendName: string,
  tournamentTitle?: string
): Promise<{ rewarded: boolean; bonusAmount: number; referrerEmail?: string }> {
  if (typeof window === 'undefined') return { rewarded: false, bonusAmount: 0 }

  const cleanFriendEmail = (friendEmail || '').trim().toLowerCase()
  let refCode = (localStorage.getItem('pending_referral_code') || '').trim().toUpperCase()

  const wallets = getLocalWallets()

  if (!refCode && cleanFriendEmail) {
    const friendProf = wallets[cleanFriendEmail]
    if (friendProf && friendProf.referredBy) {
      refCode = friendProf.referredBy.trim().toUpperCase()
    }
  }

  if (!refCode) return { rewarded: false, bonusAmount: 0 }

  // Find referrer profile matching referralCode
  let foundReferrerEmail: string | null = null

  Object.keys(wallets).forEach((emailKey) => {
    const p = wallets[emailKey]
    if (p.referralCode && p.referralCode.trim().toUpperCase() === refCode) {
      foundReferrerEmail = emailKey
    }
  })

  if (!foundReferrerEmail) return { rewarded: false, bonusAmount: 0 }
  const referrerEmail: string = foundReferrerEmail

  if (referrerEmail.toLowerCase() === cleanFriendEmail) return { rewarded: false, bonusAmount: 0 }

  const referrerProfile = wallets[referrerEmail]
  if (!referrerProfile) return { rewarded: false, bonusAmount: 0 }

  // Check if friend has already been rewarded to this referrer
  const history = referrerProfile.referredFriends || []
  const alreadyRewarded = history.some(
    (h) => h.friendEmail.toLowerCase() === cleanFriendEmail
  )

  if (alreadyRewarded) {
    localStorage.removeItem('pending_referral_code')
    return { rewarded: false, bonusAmount: 0 }
  }

  const bonusAmount = 25

  // 1. Credit Referrer Wallet
  referrerProfile.walletBalance = (referrerProfile.walletBalance || 0) + bonusAmount
  referrerProfile.totalReferredFriends = (referrerProfile.totalReferredFriends || 0) + 1
  referrerProfile.totalReferralEarnings = (referrerProfile.totalReferralEarnings || 0) + bonusAmount

  const newRecord: ReferredFriendRecord = {
    friendEmail: cleanFriendEmail,
    friendName: friendName || cleanFriendEmail.split('@')[0],
    date: new Date().toISOString(),
    bonusAmount,
    tournamentTitle: tournamentTitle || 'PUBG Tournament',
  }

  referrerProfile.referredFriends = [newRecord, ...history]
  wallets[referrerEmail] = referrerProfile
  saveLocalWallets(wallets, false)

  // 2. Create Referral Bonus Transaction for Referrer
  const txs = getLocalTxs()
  const refTx: WalletTransaction = {
    id: 'tx-ref-' + Date.now(),
    userEmail: referrerEmail,
    userName: referrerProfile.name || referrerEmail.split('@')[0],
    type: 'REFERRAL_BONUS',
    amount: bonusAmount,
    paymentMethod: 'REFERRAL',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    note: `🎉 Refer & Earn Bonus: ${friendName || cleanFriendEmail} joined ${tournamentTitle || 'tournament'}!`,
  }
  saveLocalTxs([refTx, ...txs], true)

  // Clear pending referral code so bonus is granted once per friend join
  localStorage.removeItem('pending_referral_code')

  // Save friend profile referredBy attribute
  if (cleanFriendEmail && wallets[cleanFriendEmail]) {
    wallets[cleanFriendEmail].referredBy = refCode
    saveLocalWallets(wallets, false)
  }

  // Sync with Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('customer_wallets').upsert({
        email: referrerEmail,
        name: referrerProfile.name,
        balance: referrerProfile.walletBalance,
        referral_code: referrerProfile.referralCode,
        total_referred_friends: referrerProfile.totalReferredFriends,
        total_referral_earnings: referrerProfile.totalReferralEarnings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })

      await supabase.from('wallet_transactions').insert([{
        user_email: referrerEmail,
        user_name: referrerProfile.name,
        type: 'REFERRAL_BONUS',
        amount: bonusAmount,
        payment_method: 'REFERRAL',
        status: 'APPROVED',
        note: refTx.note,
      }])
    } catch (err) {
      console.warn('[Wallet Service] Supabase referral sync exception:', err)
    }
  }

  notifyWalletUpdate()
  return { rewarded: true, bonusAmount, referrerEmail }
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
  saveLocalTxs(txs, false)

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
          saveLocalTxs(allTxs, false)
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
  notifyWalletUpdate()
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
  saveLocalTxs(txs, false)

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
          saveLocalTxs(allTxs, false)
        }
      }
    } catch (err) {
      console.warn('Supabase withdraw insert warning:', err)
    }
  }

  clearTxsCache()
  notifyWalletUpdate()
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
  notifyWalletUpdate()
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
  note?: string,
  txType?: WalletTransaction['type']
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
  const typeToUse = txType || (action === 'ADD' ? 'ADMIN_CREDIT' : 'WITHDRAW')
  const tx: WalletTransaction = {
    id: 'tx-admin-' + Date.now(),
    userEmail: normEmail,
    userName: profile.name,
    type: typeToUse,
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
            type: typeToUse,
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
  notifyWalletUpdate()
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
  }

  if (isSupabaseConfigured()) {
    try {
      // If not found locally, fetch details from Supabase DB
      if (!userEmail || !type || !amount) {
        const { data: dbTx } = await supabase.from('wallet_transactions').select('*').eq('id', id).maybeSingle()
        if (dbTx) {
          if (dbTx.status !== 'PENDING') return { success: false, message: 'Transaction is already processed' }
          userEmail = dbTx.user_email
          amount = Number(dbTx.amount)
          type = dbTx.type
        }
      }

      await supabase.from('wallet_transactions').update({ status }).eq('id', id)
    } catch (err) {
      console.warn('Supabase update transaction exception:', err)
    }
  }

  if (userEmail && amount > 0) {
    const normEmail = userEmail.trim().toLowerCase()
    if (type === 'DEPOSIT' && status === 'APPROVED') {
      const profile = await getCustomerProfile(normEmail, tx?.userName)
      profile.walletBalance += amount
      await updateCustomerProfile(profile)
    } else if (type === 'WITHDRAW' && status === 'REJECTED') {
      const profile = await getCustomerProfile(normEmail, tx?.userName)
      profile.walletBalance += amount
      await updateCustomerProfile(profile)
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
          const localProfile = map[normKey]
          const emailPrefix = normKey.split('@')[0]

          let bestName = localProfile?.name || d.name || emailPrefix
          if (localProfile?.name && localProfile.name.trim().toLowerCase() !== emailPrefix.toLowerCase()) {
            bestName = localProfile.name
          } else if (d.name && d.name.trim().toLowerCase() !== emailPrefix.toLowerCase()) {
            bestName = d.name
          }

          map[normKey] = {
            email: normKey,
            name: bestName,
            pubgUid: d.pubg_uid || localProfile?.pubgUid || '',
            whatsappNumber: d.whatsapp_number || localProfile?.whatsappNumber || '',
            walletBalance: Number(d.balance !== undefined ? d.balance : (localProfile?.walletBalance || 0)),
            avatarUrl: d.avatar_url || localProfile?.avatarUrl || '',
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

