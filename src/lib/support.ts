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

export function getSupportMessages(): SupportMessage[] {
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

export function saveSupportMessages(messages: SupportMessage[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kongkaal_support_messages', JSON.stringify(messages))
    window.dispatchEvent(new Event('support_updated'))
  }
}

export function getUserSupportMessages(userEmail: string): SupportMessage[] {
  const all = getSupportMessages()
  return all.filter((m) => m.userEmail.toLowerCase() === userEmail.toLowerCase())
}

export function sendSupportMessage(data: {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  subject: string
  message: string
}): SupportMessage {
  const messages = getSupportMessages()
  const newMessage: SupportMessage = {
    id: `msg-${Date.now()}`,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    userAvatar: data.userAvatar,
    subject: data.subject,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  }
  const updated = [newMessage, ...messages]
  saveSupportMessages(updated)
  return newMessage
}

export function replySupportMessage(id: string, adminReply: string): { success: boolean } {
  const messages = getSupportMessages()
  const updated = messages.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        adminReply,
        repliedAt: new Date().toISOString(),
        status: 'REPLIED' as const,
      }
    }
    return m
  })
  saveSupportMessages(updated)
  return { success: true }
}

export function deleteSupportMessage(id: string): { success: boolean } {
  const messages = getSupportMessages()
  const updated = messages.filter((m) => m.id !== id)
  saveSupportMessages(updated)
  return { success: true }
}
