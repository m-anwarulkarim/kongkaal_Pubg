import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { convertFileToWebP } from '@/lib/imageUtils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCustomerAuth } from '@/lib/auth'
import {
  getCustomerProfile,
  updateCustomerProfile,
  requestDeposit,
  requestWithdraw,
  getWalletTransactions,
} from '@/lib/wallet'
import { getAllRegistrations, type RegistrationRecord } from '@/lib/db'
import type { CustomerProfile, WalletTransaction } from '@/types/wallet'
import {
  getUserSupportMessages,
  sendSupportMessage,
  type SupportMessage,
} from '@/lib/support'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Gamepad2,
  History,
  Smartphone,
  Copy,
  Lock,
  Camera,
  Upload,
  User,
  Trash2,
  Sparkles,
  MessageSquare,
  Send,
  Plus,
  MessageCircle,
  LogOut,
  CheckCircle2,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({ component: CustomerDashboardPage })

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=PubgHero&backgroundColor=e50914',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SkullKing&backgroundColor=101422',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SniperPro&backgroundColor=059669',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowNinja&backgroundColor=d97706',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior&backgroundColor=2563eb',
]

function CustomerDashboardPage() {
  const { user, loading: authLoading, signOut } = useCustomerAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [myMatches, setMyMatches] = useState<RegistrationRecord[]>([])

  // Modals state
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  // Deposit Form State
  const [depAmount, setDepAmount] = useState('100')
  const [depMethod, setDepMethod] = useState<'bKash' | 'Nagad'>('bKash')
  const [depTrxId, setDepTrxId] = useState('')
  const [depMsg, setDepMsg] = useState('')
  const [depSuccess, setDepSuccess] = useState(false)

  // Withdraw Form State
  const [wthAmount, setWthAmount] = useState('200')
  const [wthMethod, setWthMethod] = useState<'bKash' | 'Nagad'>('bKash')
  const [wthAccount, setWthAccount] = useState('')
  const [wthMsg, setWthMsg] = useState('')
  const [wthSuccess, setWthSuccess] = useState(false)

  // Profile Edit State
  const [editName, setEditName] = useState('')
  const [editUid, setEditUid] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Support Messages State
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [newMsgOpen, setNewMsgOpen] = useState(false)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgContent, setMsgContent] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  const paymentNumbers = {
    bKash: '01930249023',
    Nagad: '01930249023',
  }

  useEffect(() => {
    if (!authLoading && !user) {
      // If not logged in, prompt user
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    if (!user?.email) return

    const userProfile = await getCustomerProfile(user.email, user.user_metadata?.full_name || user.email.split('@')[0])
    setProfile(userProfile)
    setEditName(userProfile.name)
    setEditUid(userProfile.pubgUid)
    setEditPhone(userProfile.whatsappNumber)
    setEditAvatarUrl(userProfile.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '')

    const txs = await getWalletTransactions(user.email)
    setTransactions(txs)

    const allRegs = await getAllRegistrations()
    const userRegs = allRegs.filter(
      (r) =>
        r.player1Name.toLowerCase().includes(userProfile.name.toLowerCase()) ||
        r.whatsappNumber.includes(userProfile.whatsappNumber) ||
        (userProfile.pubgUid && r.player1Uid.includes(userProfile.pubgUid))
    )
    setMyMatches(userRegs)

    const userMsgs = await getUserSupportMessages(user.email)
    setSupportMessages(userMsgs)
  }

  useEffect(() => {
    if (user?.email) {
      loadDashboardData()

      const handleUpdate = () => {
        loadDashboardData()
      }

      window.addEventListener('wallet_updated', handleUpdate)
      window.addEventListener('profile_updated', handleUpdate)
      window.addEventListener('registrations_updated', handleUpdate)
      window.addEventListener('matches_updated', handleUpdate)
      window.addEventListener('support_updated', handleUpdate)
      window.addEventListener('storage', handleUpdate)

      return () => {
        window.removeEventListener('wallet_updated', handleUpdate)
        window.removeEventListener('profile_updated', handleUpdate)
        window.removeEventListener('registrations_updated', handleUpdate)
        window.removeEventListener('matches_updated', handleUpdate)
        window.removeEventListener('support_updated', handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [user])

  const handleSendSupportMsg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !profile || !msgSubject.trim() || !msgContent.trim()) return

    setSendingMsg(true)
    await sendSupportMessage({
      userId: user.email,
      userName: profile.name,
      userEmail: user.email,
      userAvatar: profile.avatarUrl,
      subject: msgSubject.trim(),
      message: msgContent.trim(),
    })

    setMsgSubject('')
    setMsgContent('')
    setNewMsgOpen(false)
    setSendingMsg(false)

    const updatedMsgs = await getUserSupportMessages(user.email)
    setSupportMessages(updatedMsgs)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(label)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ছবি ৫ MB এর ছোট হতে হবে!')
        return
      }
      try {
        const webpDataUrl = await convertFileToWebP(file, 0.85)
        setEditAvatarUrl(webpDataUrl)
        toast.success('প্রোফাইল ছবি  WebP ফরম্যাটে কনভার্ট হয়েছে!')
      } catch (err) {
        toast.error('ছবি কনভার্ট করতে ব্যর্থ হয়েছে!')
      }
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      pubgUid: editUid,
      whatsappNumber: editPhone,
      avatarUrl: editAvatarUrl,
    }
    await updateCustomerProfile(updated)
    setProfile(updated)
    setEditProfileOpen(false)
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !profile) return
    if (!depTrxId || depTrxId.length < 6) {
      setDepMsg('দয়া করে সঠিক Transaction ID (TrxID) দিন!')
      return
    }

    const res = await requestDeposit({
      userEmail: user.email,
      userName: profile.name,
      amount: Number(depAmount),
      paymentMethod: depMethod,
      trxId: depTrxId,
    })

    if (res.success) {
      setDepSuccess(true)
      toast.success('টাকা জমার অনুরোধ সফলভাবে পাঠানো হয়েছে!')
      loadDashboardData()
    }
  }

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !profile) return

    const numAmount = Number(wthAmount)
    const currentBalance = profile.walletBalance ?? 0

    if (isNaN(numAmount) || numAmount <= 0) {
      const errMsg = 'দয়া করে সঠিক উইথড্র অ্যামাউন্ট লিখুন!'
      setWthMsg(errMsg)
      toast.error(errMsg)
      return
    }

    if (numAmount > currentBalance) {
      const errMsg = `আপনার ব্যালেন্সের (৳${currentBalance}) বেশি উইথড্র করা সম্ভব নয়!`
      setWthMsg(errMsg)
      toast.error(errMsg)
      return
    }

    if (!wthAccount || wthAccount.length < 11) {
      const errMsg = 'দয়া করে সঠিক ১১ ডিজিটের বিকাশ/নগদ নাম্বার দিন!'
      setWthMsg(errMsg)
      toast.error(errMsg)
      return
    }

    const res = await requestWithdraw({
      userEmail: user.email,
      userName: profile.name,
      amount: numAmount,
      paymentMethod: wthMethod,
      accountNumber: wthAccount,
    })

    if (res.success) {
      setWthSuccess(true)
      toast.success('ক্যাশ-আউট অনুরোধ সফলভাবে পাঠানো হয়েছে!')
      loadDashboardData()
    } else {
      setWthMsg(res.message)
      toast.error(res.message)
    }
  }

  const userAvatar = profile?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = profile?.name || user?.user_metadata?.full_name || 'Player'

  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {!user ? (
          /* Not Logged In View */
          <div className="text-center py-12 sm:py-20 bg-[#101422] border border-red-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-4 shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 mx-auto">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase">Customer Login Required</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              আপনার ওয়ালেট ব্যালেন্স দেখতে, টাকা জমা বা তুলতে এবং টুর্নামেন্ট হিস্ট্রি চেক করতে গুগল লগইন করুন।
            </p>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="bg-[#e50914] hover:bg-red-600 font-bold px-6 py-2.5 rounded-full text-xs"
            >
              Go to Homepage & Login
            </Button>
          </div>
        ) : (
          <>
            {/* 1. Player Profile Header Card */}
            <div className="relative bg-gradient-to-r from-red-950/80 via-[#121524] to-[#0a0c14] border border-red-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 overflow-hidden shadow-[0_0_30px_rgba(229,9,20,0.15)]">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full md:w-auto">
                  <div 
                    onClick={() => setEditProfileOpen(true)}
                    className="relative cursor-pointer group rounded-full shrink-0"
                    title="Click to edit profile avatar"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-red-500 shadow-md shadow-red-600/30 object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-600 border-2 border-red-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold group-hover:bg-red-700 transition-colors">
                        {userName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg sm:text-3xl font-black font-display tracking-wider text-white uppercase truncate">
                        {userName}
                      </h1>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold">
                        VERIFIED PLAYER
                      </Badge>
                    </div>

                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 truncate">{user.email}</p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-300 mt-2.5 sm:mt-3">
                      <span className="bg-[#1a1f33] px-2.5 py-1 rounded-lg border border-white/10 font-mono flex items-center gap-1 text-[11px] sm:text-xs">
                        <Gamepad2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        PUBG UID: {profile?.pubgUid || 'Not set'}
                      </span>
                      <span className="bg-[#1a1f33] px-2.5 py-1 rounded-lg border border-white/10 font-mono flex items-center gap-1 text-[11px] sm:text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        WhatsApp: {profile?.whatsappNumber || 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
                  <Button
                    onClick={() => setEditProfileOpen(true)}
                    className="flex-1 md:flex-none justify-center bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 text-xs rounded-xl px-3.5 py-2"
                  >
                    Edit Profile Info
                  </Button>

                  <Button
                    onClick={async () => {
                      await signOut()
                      navigate({ to: '/' })
                    }}
                    className="flex-1 md:flex-none justify-center bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-bold border border-red-500/40 text-xs rounded-xl px-3.5 py-2 flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" /> Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Customer Wallet Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Balance Card */}
              <Card className="bg-gradient-to-br from-[#121626] to-[#0c0f1a] border-white/10 p-6 rounded-3xl space-y-4 relative overflow-hidden shadow-xl">
                <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Current Wallet Balance</span>
                  <Wallet className="w-5 h-5 text-red-500" />
                </div>
                <div className="font-display text-4xl sm:text-5xl font-black text-white">
                  ৳{profile?.walletBalance || 0}
                </div>
                <div className="pt-2 flex gap-3">
                  <Button
                    onClick={() => setDepositOpen(true)}
                    className="flex-1 bg-[#e50914] hover:bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Add Money (জমা)
                  </Button>
                  <Button
                    onClick={() => setWithdrawOpen(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Withdraw (তোলা)
                  </Button>
                </div>
              </Card>

              {/* Tournament Summary Card */}
              <Card className="bg-[#121626] border-white/10 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Joined Matches</span>
                  <Gamepad2 className="w-5 h-5 text-amber-400" />
                </div>
                <div className="font-display text-4xl font-black text-white">{myMatches.length}</div>
                <p className="text-xs text-gray-400">
                  {myMatches.filter((m) => m.status === 'VERIFIED').length} verified slot registrations
                </p>
              </Card>

              {/* Transactions Summary Card */}
              <Card className="bg-[#121626] border-white/10 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Total Transactions</span>
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div className="font-display text-4xl font-black text-white">{transactions.length}</div>
                <p className="text-xs text-gray-400">Deposits, Withdrawals & Prizes</p>
              </Card>
            </div>

            {/* 3. My Matches & Room Passwords Section */}
            <Card className="bg-[#101422] border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase">
                    My Joined Matches & Room Access
                  </h3>
                  <p className="text-xs text-gray-400">View room ID & password once verified by Admin</p>
                </div>
                <Badge className="bg-red-600/20 text-red-400 border border-red-500/30 font-bold px-3 py-1">
                  {myMatches.length} Registrations
                </Badge>
              </div>

              {myMatches.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm font-medium">
                  আপনি এখনো কোন টুর্নামেন্টে যোগ দেননি। হোমপেজ থেকে টুর্নামেন্ট এন্ট্রি নিন!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myMatches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-[#0b0d16] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                            {match.matchId}
                          </span>
                          <h4 className="font-bold text-white text-base">{match.teamName || match.player1Name}</h4>
                        </div>
                        <Badge
                          className={
                            match.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : match.status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border border-red-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }
                        >
                          {match.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-400 space-y-1 font-mono">
                        <div>PUBG UID: {match.player1Uid}</div>
                        <div>Payment: {match.paymentMethod} (TrxID: {match.trxId})</div>
                        <div>Amount: ৳{match.amount}</div>
                      </div>

                      {/* Room ID & Password Display */}
                      <div className="pt-3 border-t border-white/10">
                        {match.status === 'VERIFIED' ? (
                          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-emerald-300 font-bold font-mono">
                              <span>Room ID: <strong className="text-white text-sm font-black">{match.roomId || '1234567'}</strong></span>
                              <span>Password: <strong className="text-amber-400 text-sm font-black">{match.roomPassword || '8899'}</strong></span>
                            </div>
                            <div className="flex flex-wrap justify-between items-center gap-1.5 text-[10px] text-emerald-400 border-t border-emerald-500/20 pt-1.5">
                              <span>ম্যাচ শুরু হওয়ার ১৫ মিনিট আগে ইন-গেম রুমে জয়েন করুন।</span>
                              <Button
                                onClick={() => handleCopy(`Room ID: ${match.roomId || '1234567'}, Password: ${match.roomPassword || '8899'}`, match.id)}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2.5 py-1 h-auto font-mono font-bold rounded-lg shrink-0"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                {copiedId === match.id ? 'Copied!' : 'Copy Code'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                            এডমিন পেমেন্ট ট্রানজেকশন আইডি ভেরিফাই করলে এখানে ইন-গেম রুম আইডি এবং পাসওয়ার্ড দেখাবে।
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 4. Wallet Transaction History */}
            <Card className="bg-[#101422] border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase">
                    Wallet Statement & History
                  </h3>
                  <p className="text-xs text-gray-400">Complete record of deposits, withdrawals & prizes</p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">No transactions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080a12] text-gray-400 uppercase tracking-wider font-mono">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Details / TrxID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                          <td className="p-3 text-gray-400 font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-bold text-white">
                            <Badge
                              className={
                                tx.type === 'DEPOSIT'
                                  ? 'bg-blue-950 text-blue-400'
                                  : tx.type === 'WINNING_PRIZE' || tx.type === 'ADMIN_CREDIT'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-red-950 text-red-400'
                              }
                            >
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-300">{tx.note || tx.trxId || '—'}</td>
                          <td className="p-3 font-display font-bold text-base text-white">
                            {tx.type === 'WITHDRAW' || tx.type === 'ENTRY_FEE' ? '-' : '+'}৳{tx.amount}
                          </td>
                          <td className="p-3 text-right">
                            <Badge
                              className={
                                tx.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : tx.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-400'
                                  : 'bg-amber-950 text-amber-400'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* 5. Support Messages & Admin Replies */}
            <Card className="bg-[#101422] border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-red-500" />
                    Support Messages & Admin Replies
                  </h3>
                  <p className="text-xs text-gray-400">এডমিনকে মেসেজ পাঠান এবং আপনার প্রশ্নের এডমিন রিপ্লাই দেখুন</p>
                </div>
                <Button
                  onClick={() => setNewMsgOpen(true)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-lg shadow-red-600/20"
                >
                  <Plus className="w-4 h-4" /> Send New Message
                </Button>
              </div>

              {supportMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs space-y-2">
                  <MessageCircle className="w-8 h-8 text-gray-600 mx-auto" />
                  <p>আপনি কোনো সাপোর্ট মেসেজ পাঠাননি। যেকোনো সহায়তার জন্য উপরের বোতামে ক্লিক করুন।</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportMessages.map((msg) => (
                    <div key={msg.id} className="bg-[#161a29] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-red-400">{msg.subject}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({new Date(msg.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })})
                          </span>
                        </div>
                        <Badge
                          className={
                            msg.status === 'REPLIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }
                        >
                          {msg.status === 'REPLIED' ? 'REPLIED BY ADMIN' : 'PENDING REPLY'}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-200 whitespace-pre-wrap">{msg.message}</p>

                      {msg.adminReply && (
                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-1 mt-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Admin Response:
                            </span>
                            {msg.repliedAt && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date(msg.repliedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-100 whitespace-pre-wrap">{msg.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </main>

      {/* MODAL 1: ADD MONEY (DEPOSIT) */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white">Add Money to Wallet (টাকা জমা)</h3>
              <button
                onClick={() => {
                  setDepositOpen(false)
                  setDepSuccess(false)
                  setDepMsg('')
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {depSuccess ? (
              <div className="text-center py-4 px-1 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase">
                    🎉 ধন্যবাদ! আপনার রিকোয়েস্ট সফলভাবে জমা হয়েছে
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold">
                    আপনার টাকা জমা (Add Money) রিকোয়েস্ট অ্যাডমিন প্যানেলে জমা হয়েছে।
                  </p>
                </div>

                <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300 pb-2 border-b border-white/10">
                    <span>ডিপোজিট পরিমাণ:</span>
                    <strong className="text-white font-mono text-sm">৳{depAmount} BDT</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>পেমেন্ট গেটওয়ে:</span>
                    <strong className="text-pink-400 font-mono">{depMethod}</strong>
                  </div>

                  <div className="pt-2 text-[11px] text-amber-300 leading-relaxed font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mt-2">
                    ⏱️ <strong>ভেরিফিকেশন সময়:</strong> অনুগ্রহ করে <strong>১ থেকে ১২ ঘণ্টার</strong> মধ্যে অপেক্ষা করুন। অ্যাডমিন ম্যানুয়ালি TrxID চেক করে আপনার ওয়ালেটে টাকা যোগ করে দেবেন।
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`https://wa.me/8801980184366?text=${encodeURIComponent(`Hello Admin! I submitted a Deposit request of ৳${depAmount} via ${depMethod} (TrxID: ${depTrxId}). Please verify!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all no-underline"
                  >
                    <Send className="w-4 h-4" />
                    <span>জরুরি প্রশ্ন থাকলে সরাসরি WhatsApp-এ মেসেজ দিন</span>
                  </a>

                  <Button
                    type="button"
                    onClick={() => {
                      setDepositOpen(false)
                      setDepSuccess(false)
                      setDepTrxId('')
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
                  >
                    ঠিক আছে, বুঝতে পেরেছি (Close)
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {depMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
                    {depMsg}
                  </div>
                )}

                {/* Payment Number Copy */}
                <div className="bg-[#161a29] p-4 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-xs text-gray-400 font-bold block">Send Money to Send Number:</span>
                  <div className="flex justify-between items-center font-mono font-bold text-emerald-400 text-base">
                    <span>{paymentNumbers[depMethod]} ({depMethod})</span>
                    <Button
                      onClick={() => handleCopy(paymentNumbers[depMethod], depMethod)}
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 h-auto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId === depMethod ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-300 font-bold block mb-1">Select Gateway</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['bKash', 'Nagad'] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setDepMethod(m)}
                          className={`py-2 rounded-xl border font-bold ${
                            depMethod === m
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-[#161a29] border-white/10 text-gray-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 font-bold block mb-1">Deposit Amount (৳)</label>
                    <Input
                      type="number"
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      className="bg-[#161a29] border-white/10 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 font-bold block mb-1">Transaction ID (TrxID)</label>
                    <Input
                      type="text"
                      placeholder="e.g. BAX9021K9L"
                      value={depTrxId}
                      onChange={(e) => setDepTrxId(e.target.value)}
                      className="bg-[#161a29] border-white/10 text-white uppercase font-mono"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#e50914] hover:bg-red-600 font-bold py-3 text-xs rounded-xl">
                    Submit Deposit Request
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: WITHDRAW MONEY */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">Withdraw Money (টাকা ক্যাশ আউট)</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  বর্তমান ব্যালেন্স: ৳{profile?.walletBalance ?? 0}
                </p>
              </div>
              <button
                onClick={() => {
                  setWithdrawOpen(false)
                  setWthSuccess(false)
                  setWthMsg('')
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {wthSuccess ? (
              <div className="text-center py-4 px-1 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase">
                    🎉 ধন্যবাদ! আপনার ক্যাশ-আউট রিকোয়েস্ট সফল হয়েছে
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold">
                    আপনার টাকা তোলার (Withdraw) আবেদন সফলভাবে জমা হয়েছে।
                  </p>
                </div>

                <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300 pb-2 border-b border-white/10">
                    <span>উইথড্র পরিমাণ:</span>
                    <strong className="text-white font-mono text-sm">৳{wthAmount} BDT</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>অ্যাকাউন্ট ও মেথড:</span>
                    <strong className="text-emerald-400 font-mono">{wthMethod} ({wthAccount})</strong>
                  </div>

                  <div className="pt-2 text-[11px] text-amber-300 leading-relaxed font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mt-2">
                    ⏱️ <strong>ক্যাশ-আউট সময়:</strong> অনুগ্রহ করে <strong>১ থেকে ১২ ঘণ্টার</strong> মধ্যে অপেক্ষা করুন। অ্যাডমিন ম্যানুয়ালি চেক করে আপনার পার্সোনাল অ্যাকাউন্টে টাকা পাঠিয়ে দেবেন।
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`https://wa.me/8801980184366?text=${encodeURIComponent(`Hello Admin! I submitted a Withdraw request of ৳${wthAmount} to my ${wthMethod} account (${wthAccount}). Please check!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all no-underline"
                  >
                    <Send className="w-4 h-4" />
                    <span>জরুরি সহায়তা বা আপডেটের জন্য WhatsApp-এ মেসেজ দিন</span>
                  </a>

                  <Button
                    type="button"
                    onClick={() => {
                      setWithdrawOpen(false)
                      setWthSuccess(false)
                      setWthAccount('')
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
                  >
                    ঠিক আছে, বুঝতে পেরেছি (Close)
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {wthMsg && (
                  <div
                    className={`p-3 border rounded-xl text-xs ${
                      Number(wthAmount) > (profile?.walletBalance ?? 0)
                        ? 'bg-red-950/50 border-red-500/40 text-red-300'
                        : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {wthMsg}
                  </div>
                )}

                <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-300 font-bold block mb-1">Select Cash-out Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['bKash', 'Nagad'] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setWthMethod(m)}
                          className={`py-2 rounded-xl border font-bold ${
                            wthMethod === m
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-[#161a29] border-white/10 text-gray-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-gray-300 font-bold block">Withdraw Amount (৳)</label>
                      <span className="text-[11px] text-gray-400 font-medium">
                        সর্বোচ্চ: <strong className="text-emerald-400 font-bold">৳{profile?.walletBalance ?? 0}</strong>
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={profile?.walletBalance ?? 0}
                      placeholder="উইথড্র অ্যামাউন্ট লিখুন"
                      value={wthAmount}
                      onChange={(e) => setWthAmount(e.target.value)}
                      className={`bg-[#161a29] text-white transition-all ${
                        Number(wthAmount) > (profile?.walletBalance ?? 0)
                          ? 'border-red-500/80 focus-visible:ring-red-500 text-red-300'
                          : 'border-white/10'
                      }`}
                      required
                    />
                    {Number(wthAmount) > (profile?.walletBalance ?? 0) && (
                      <p className="text-red-400 text-[11px] mt-1.5 font-semibold flex items-center gap-1">
                        ⚠️ ব্যালেন্সের বেশি উইথড্র করা সম্ভব নয়! (আপনার ব্যালেন্স: ৳{profile?.walletBalance ?? 0})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 font-bold block mb-1">bKash/Nagad Personal Number</label>
                    <Input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={wthAccount}
                      onChange={(e) => setWthAccount(e.target.value)}
                      className="bg-[#161a29] border-white/10 text-white font-mono"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={Number(wthAmount) > (profile?.walletBalance ?? 0) || Number(wthAmount) <= 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 text-xs rounded-xl transition-all"
                  >
                    Submit Cash Out Request
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PROFILE */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f121d] border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" /> Edit Profile & Photo
              </h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Profile Avatar Selector & Preview */}
              <div className="bg-[#151929] border border-white/10 rounded-2xl p-4 text-center space-y-3">
                <span className="text-gray-300 font-bold block text-left">Profile Picture / Avatar</span>
                
                <div className="relative inline-block mx-auto">
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-full border-2 border-red-500 shadow-lg object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {userName[0]?.toUpperCase()}
                    </div>
                  )}

                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarUrl('')}
                      className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow"
                      title="Remove custom photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex justify-center gap-2 pt-1">
                  <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20">
                    <Upload className="w-3.5 h-3.5" /> Upload from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2">
                  <span className="text-[11px] text-gray-400 block mb-2 font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Or pick PUBG Gamer Preset:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setEditAvatarUrl(url)}
                        className={`relative rounded-full p-0.5 border-2 transition-transform hover:scale-110 ${
                          editAvatarUrl === url ? 'border-red-500 scale-105 shadow-md shadow-red-500/50' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-9 h-9 rounded-full bg-[#0a0c14]" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL Input Option */}
                <div className="pt-2">
                  <label className="text-[11px] text-gray-400 block text-left mb-1">Image URL (Optional):</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.webp"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="bg-[#0b0d16] border-white/10 text-white font-mono text-[11px] h-8"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Full Name / Display Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Shakib Al Hasan"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#161a29] border-white/10 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">PUBG Character ID (UID)</label>
                <Input
                  type="text"
                  placeholder="e.g. 5123456789"
                  value={editUid}
                  onChange={(e) => setEditUid(e.target.value)}
                  className="bg-[#161a29] border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">WhatsApp Phone Number</label>
                <Input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-[#161a29] border-white/10 text-white font-mono"
                />
              </div>

              <Button type="submit" className="w-full bg-[#e50914] hover:bg-red-600 font-bold py-3 text-xs rounded-xl shadow-lg shadow-red-600/30">
                Save Profile Changes
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND SUPPORT MESSAGE */}
      {newMsgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f121d] border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" /> Send Message to Admin
              </h3>
              <button onClick={() => setNewMsgOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSupportMsg} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Subject / বিষয় <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="যেমন: টাকা জমা বা ডিপোজিট সমস্যা"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="bg-[#161a29] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Your Message / বার্তা <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="আপনার বিস্তারিত প্রশ্ন বা বার্তা এখানে লিখুন..."
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161a29] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={sendingMsg}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendingMsg ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
