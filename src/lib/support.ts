import { supabase, isSupabaseConfigured } from './supabase'

export interface SupportMessage {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  subject: string
  message: string
  createdAt: string
  status: 'PENDING' | 'REPLIED' | 'CLOSED'
  adminReply?: string
  repliedAt?: string
}

const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-1',
    userId: 'player1@gmail.com',
    userName: 'VIP_SHADOW',
    userEmail: 'player1@gmail.com',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PubgHero&backgroundColor=e50914',
    subject: 'টাকা জমা সংক্রান্ত সাপোর্ট (bKash Deposit)',
    message: 'আমার বিকাশ দিয়ে ৫০০ টাকা ডিপোজিট করেছি ট্রানজেকশন আইডি: 89X7Y2Z1A3। কিন্তু ব্যালেন্স অ্যাড হতে কিছুটা দেরি হচ্ছে। দয়া করে চেক করুন।',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'REPLIED',
    adminReply: 'ধন্যবাদ মেসেজের জন্য! আপনার বিকাশ ট্রানজেকশন সফলভাবে ভেরিফাই করে ৫০০ টাকা ওয়ালেটে জমা করে দেওয়া হয়েছে। হ্যাপি গেমিং!',
    repliedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-2',
    userId: 'sniper_king@gmail.com',
    userName: 'SNIPER_KING_BD',
    userEmail: 'sniper_king@gmail.com',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SniperPro&backgroundColor=059669',
    subject: 'রুম আইডি ও পাসওয়ার্ড কখন দেওয়া হবে?',
    message: 'আজকের স্কোয়াড টুর্নামেন্টের ফি পে করেছি। রুম আইডি কি কোয়াটসঅ্যাপে দেওয়া হবে নাকি ড্যাশবোর্ডে আসবে?',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    status: 'REPLIED',
    adminReply: 'ম্যাচ শুরু হওয়ার ঠিক ১০ মিনিট আগে ড্যাশবোর্ডে "My Joined Matches" এ এবং আপনার হোয়াটসঅ্যাপ নাম্বারে রুম আইডি ও পাসওয়ার্ড পাঠানো হবে।',
    repliedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
]

// Subscribe to Supabase Realtime events for support_messages
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    supabase
      .channel('kongkaal_support_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_messages' },
        () => {
          if (typeof window !== 'undefined') {
            notifySupportUpdate()
          }
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('[Support Service] Supabase realtime subscription error:', err)
  }
}

// BroadcastChannel for instant multi-tab sync
let supportBroadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    supportBroadcastChannel = new BroadcastChannel('kongkaal_support_channel')
    supportBroadcastChannel.onmessage = (event) => {
      if (event.data === 'support_updated') {
        window.dispatchEvent(new Event('support_updated'))
      }
    }
  } catch (err) {
    console.warn('[Support Service] BroadcastChannel init error:', err)
  }
}

export function notifySupportUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('support_updated'))
    supportBroadcastChannel?.postMessage('support_updated')
  }
}

function getLocalSupportMessages(): SupportMessage[] {
  if (typeof window === 'undefined') return INITIAL_SUPPORT_MESSAGES
  const stored = localStorage.getItem('kongkaal_support_messages')
  if (!stored) {
    localStorage.setItem('kongkaal_support_messages', JSON.stringify(INITIAL_SUPPORT_MESSAGES))
    return INITIAL_SUPPORT_MESSAGES
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_SUPPORT_MESSAGES
  }
}

function saveLocalSupportMessages(messages: SupportMessage[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_support_messages', JSON.stringify(messages))
    notifySupportUpdate()
  }
}

export async function getSupportMessages(): Promise<SupportMessage[]> {
  const localMsgs = getLocalSupportMessages()
  let dbMsgs: SupportMessage[] = []

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        dbMsgs = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || d.user_email,
          userName: d.user_name || d.user_email.split('@')[0],
          userEmail: d.user_email,
          userAvatar: d.user_avatar || '',
          subject: d.subject,
          message: d.message,
          createdAt: d.created_at,
          status: d.status || 'PENDING',
          adminReply: d.admin_reply || '',
          repliedAt: d.replied_at || '',
        }))
      }
    } catch (err) {
      console.warn('Supabase getSupportMessages error:', err)
    }
  }

  const map = new Map<string, SupportMessage>()
  dbMsgs.forEach((m) => map.set(m.id, m))
  localMsgs.forEach((m) => {
    if (!map.has(m.id)) map.set(m.id, m)
  })

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getUserSupportMessages(userEmail: string): Promise<SupportMessage[]> {
  const all = await getSupportMessages()
  return all.filter((m) => m.userEmail.toLowerCase() === userEmail.toLowerCase())
}

export async function sendSupportMessage(data: {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  subject: string
  message: string
}): Promise<SupportMessage> {
  const localMsgs = getLocalSupportMessages()
  const newMessage: SupportMessage = {
    id: `msg-${Date.now()}`,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail.trim().toLowerCase(),
    userAvatar: data.userAvatar || '',
    subject: data.subject,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  }

  const updated = [newMessage, ...localMsgs]
  saveLocalSupportMessages(updated)

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('support_messages').insert([
        {
          user_id: data.userId,
          user_name: data.userName,
          user_email: data.userEmail.trim().toLowerCase(),
          user_avatar: data.userAvatar || '',
          subject: data.subject,
          message: data.message,
          status: 'PENDING',
        },
      ])
      if (error) console.warn('Supabase sendSupportMessage error:', error.message)
    } catch (err) {
      console.warn('Supabase sendSupportMessage exception:', err)
    }
  }

  return newMessage
}

export async function replySupportMessage(id: string, adminReply: string): Promise<{ success: boolean }> {
  const localMsgs = getLocalSupportMessages()
  const repliedAt = new Date().toISOString()
  const updated = localMsgs.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        adminReply,
        repliedAt,
        status: 'REPLIED' as const,
      }
    }
    return m
  })
  saveLocalSupportMessages(updated)

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({
          admin_reply: adminReply,
          replied_at: repliedAt,
          status: 'REPLIED',
        })
        .eq('id', id)

      if (error) console.warn('Supabase replySupportMessage error:', error.message)
    } catch (err) {
      console.warn('Supabase replySupportMessage exception:', err)
    }
  }

  return { success: true }
}

export async function deleteSupportMessage(id: string): Promise<{ success: boolean }> {
  const localMsgs = getLocalSupportMessages()
  const updated = localMsgs.filter((m) => m.id !== id)
  saveLocalSupportMessages(updated)

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('support_messages').delete().eq('id', id)
    } catch (err) {
      console.warn('Supabase deleteSupportMessage exception:', err)
    }
  }

  return { success: true }
}
