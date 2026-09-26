import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
  const { user, loading: authLoading } = useCustomerAuth()
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
  const [depMethod, setDepMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash')
  const [depTrxId, setDepTrxId] = useState('')
  const [depMsg, setDepMsg] = useState('')

  // Withdraw Form State
  const [wthAmount, setWthAmount] = useState('200')
  const [wthMethod, setWthMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash')
  const [wthAccount, setWthAccount] = useState('')
  const [wthMsg, setWthMsg] = useState('')

  // Profile Edit State
  const [editUid, setEditUid] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01812-345678',
    Rocket: '01912-345678',
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
  }

  useEffect(() => {
    if (user?.email) {
      loadDashboardData()
    }
  }, [user])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(label)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('ছবি ৩ MB এর ছোট হতে হবে!')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatarUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const updated = {
      ...profile,
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
      setDepMsg('টাকা জমার অনুরোধ সফল হয়েছে! এডমিন TrxID চেক করে ব্যালেন্স যোগ করবেন।')
      setDepTrxId('')
      loadDashboardData()
      setTimeout(() => {
        setDepositOpen(false)
        setDepMsg('')
      }, 2500)
    }
  }

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !profile) return
    if (!wthAccount || wthAccount.length < 11) {
      setWthMsg('দয়া করে সঠিক ১১ ডিজিটের বিকাশ/নগদ নাম্বার দিন!')
      return
    }

    const res = await requestWithdraw({
      userEmail: user.email,
      userName: profile.name,
      amount: Number(wthAmount),
      paymentMethod: wthMethod,
      accountNumber: wthAccount,
    })

    if (res.success) {
      setWthMsg(res.message)
      loadDashboardData()
      setTimeout(() => {
        setWithdrawOpen(false)
        setWthMsg('')
      }, 2500)
    } else {
      setWthMsg(res.message)
    }
  }

  const userAvatar = profile?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = profile?.name || user?.user_metadata?.full_name || 'Player'

  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {!user ? (
          /* Not Logged In View */
          <div className="text-center py-20 bg-[#101422] border border-red-500/20 rounded-3xl p-8 max-w-xl mx-auto space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-display text-white uppercase">Customer Login Required</h2>
            <p className="text-sm text-gray-400">
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
            <div className="relative bg-gradient-to-r from-red-950/80 via-[#121524] to-[#0a0c14] border border-red-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-[0_0_30px_rgba(229,9,20,0.15)]">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div 
                    onClick={() => setEditProfileOpen(true)}
                    className="relative cursor-pointer group rounded-full"
                    title="Click to edit profile avatar"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500 shadow-md shadow-red-600/30 object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 border-2 border-red-500 flex items-center justify-center text-white text-2xl font-bold group-hover:bg-red-700 transition-colors">
                        {userName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-3xl font-black font-display tracking-wider text-white uppercase">
                        {userName}
                      </h1>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        VERIFIED PLAYER
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">{user.email}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-3">
                      <span className="bg-[#1a1f33] px-3 py-1 rounded-lg border border-white/10 font-mono flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5 text-red-500" />
                        PUBG UID: {profile?.pubgUid || 'Not set'}
                      </span>
                      <span className="bg-[#1a1f33] px-3 py-1 rounded-lg border border-white/10 font-mono flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp: {profile?.whatsappNumber || 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setEditProfileOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 text-xs rounded-xl px-4 py-2"
                >
                  Edit Profile Info
                </Button>
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
                          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between text-emerald-300 font-bold">
                              <span>Room ID: 1234567</span>
                              <span>Password: 8899</span>
                            </div>
                            <p className="text-[10px] text-emerald-400">Match starts soon! Please join in-game room on time.</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                            এডমিন পেমেন্ট ট্রানজেকশন আইডি ভেরিফাই করলে এখানে রুম আইডি এবং পাসওয়ার্ড দেখাবে।
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
          </>
        )}
      </main>

      {/* MODAL 1: ADD MONEY (DEPOSIT) */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f121d] border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white">Add Money to Wallet (টাকা জমা)</h3>
              <button onClick={() => setDepositOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

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
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
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
          </div>
        </div>
      )}

      {/* MODAL 2: WITHDRAW MONEY */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f121d] border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white">Withdraw Money (টাকা ক্যাশ আউট)</h3>
              <button onClick={() => setWithdrawOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {wthMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
                {wthMsg}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-bold block mb-1">Select Cash-out Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
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
                <label className="text-gray-300 font-bold block mb-1">Withdraw Amount (৳)</label>
                <Input
                  type="number"
                  value={wthAmount}
                  onChange={(e) => setWthAmount(e.target.value)}
                  className="bg-[#161a29] border-white/10 text-white"
                  required
                />
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

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-3 text-xs rounded-xl">
                Submit Cash Out Request
              </Button>
            </form>
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
                    placeholder="https://example.com/avatar.jpg"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="bg-[#0b0d16] border-white/10 text-white font-mono text-[11px] h-8"
                  />
                </div>
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

      <Footer />
    </div>
  )
}
