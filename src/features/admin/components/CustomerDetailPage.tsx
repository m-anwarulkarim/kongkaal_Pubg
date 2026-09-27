import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { CustomerProfile, WalletTransaction } from '@/types/wallet'
import type { RegistrationRecord } from '@/lib/db'
import {
  getWalletTransactions,
  adminAdjustCustomerWallet,
  adminApproveTransaction,
  deleteWalletTransaction,
} from '@/lib/wallet'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Wallet,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  ShieldCheck,
  Mail,
  Smartphone,
  RefreshCw,
  Trophy,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  MessageSquare,
  Search,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'

interface CustomerDetailPageProps {
  customer: CustomerProfile
  registrations: RegistrationRecord[]
  onBack: () => void
  onRefreshCustomer: () => void
  onSelectUserMessage?: (userEmail: string) => void
}

function txTypeBadge(type: string) {
  switch (type) {
    case 'DEPOSIT':
      return { label: 'Deposit', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30', icon: <ArrowDownCircle className="w-4 h-4 text-emerald-400" /> }
    case 'WITHDRAW':
      return { label: 'Withdraw', color: 'text-red-400', bg: 'bg-red-950/40 border-red-500/30', icon: <ArrowUpCircle className="w-4 h-4 text-red-400" /> }
    case 'ENTRY_FEE':
      return { label: 'Entry Fee', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', icon: <Gamepad2 className="w-4 h-4 text-amber-400" /> }
    case 'WINNING_PRIZE':
      return { label: 'Prize Won', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-500/30', icon: <Trophy className="w-4 h-4 text-yellow-400" /> }
    case 'ADMIN_CREDIT':
      return { label: 'Admin Credit', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30', icon: <PlusCircle className="w-4 h-4 text-blue-400" /> }
    default:
      return { label: type, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', icon: <Clock className="w-4 h-4 text-gray-400" /> }
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED')
    return <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5">✅ APPROVED</Badge>
  if (status === 'REJECTED')
    return <Badge className="bg-red-950 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-0.5">❌ REJECTED</Badge>
  return <Badge className="bg-amber-950 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 animate-pulse">⏳ PENDING</Badge>
}

export default function CustomerDetailPage({
  customer,
  registrations,
  onBack,
  onRefreshCustomer,
  onSelectUserMessage,
}: CustomerDetailPageProps) {
  const [txs, setTxs] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [amount, setAmount] = useState('500')
  const [note, setNote] = useState('Match Winning Prize Bonus')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [txFilter, setTxFilter] = useState<string>('ALL')
  const [txSearch, setTxSearch] = useState<string>('')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} "${text}" to clipboard!`)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 1500)
  }

  const loadTxs = async () => {
    setLoading(true)
    const data = await getWalletTransactions(customer.email)
    setTxs(data)
    setLoading(false)
  }

  useEffect(() => {
    if (customer?.email) {
      loadTxs()
    }
  }, [customer?.email])

  const customerName = (customer?.name || '').toLowerCase().trim()
  const customerUid = (customer?.pubgUid || '').trim()
  const customerPhone = (customer?.whatsappNumber || '').trim()
  const customerEmail = (customer?.email || '').toLowerCase().trim()

  const customerRegistrations = (registrations || []).filter((r) => {
    if (!r) return false
    const rPhone = (r.whatsappNumber || '').trim()
    const rUid = (r.player1Uid || '').trim()
    const rName = (r.player1Name || '').toLowerCase().trim()
    const rEmail = (r.userEmail || '').toLowerCase().trim()

    return (
      (customerPhone && rPhone === customerPhone) ||
      (customerUid && rUid === customerUid) ||
      (customerName && rName && rName.includes(customerName)) ||
      (customerEmail && rEmail === customerEmail)
    )
  })

  const totalDeposited = (txs || []).filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const totalWithdrawn = (txs || []).filter(t => t.type === 'WITHDRAW' && t.status === 'APPROVED').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const totalPrizeWon = (txs || []).filter(t => t.type === 'WINNING_PRIZE').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const totalEntryFees = (txs || []).filter(t => t.type === 'ENTRY_FEE').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const pendingTxs = (txs || []).filter(t => t.status === 'PENDING')

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }
    setSubmitting(true)
    const isPrize = actionType === 'ADD' && note.toLowerCase().includes('prize')
    const txType = isPrize ? 'WINNING_PRIZE' : undefined
    const res = await adminAdjustCustomerWallet(customer.email, Number(amount), actionType, note, txType)
    setSubmitting(false)
    if (res.success) {
      toast.success(res.message)
      loadTxs()
      onRefreshCustomer()
    } else {
      toast.error(res.message)
    }
  }

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await adminApproveTransaction(id, status)
    if (res.success) {
      toast.success(status === 'APPROVED' ? '✅ Transaction Approved!' : '❌ Transaction Rejected!')
      loadTxs()
      onRefreshCustomer()
    } else {
      toast.error(res.message)
    }
  }

  const handleDeleteTx = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return
    setDeletingId(id)
    const res = await deleteWalletTransaction(id)
    setDeletingId(null)
    if (res.success) {
      toast.success('Transaction record deleted!')
      loadTxs()
      onRefreshCustomer()
    } else {
      toast.error(res.message)
    }
  }

  const filteredTxs = (txs || []).filter((t) => {
    if (!t) return false
    if (txFilter !== 'ALL' && t.type !== txFilter && t.status !== txFilter) return false
    if (txSearch) {
      const q = txSearch.toLowerCase()
      return (
        (t.type && t.type.toLowerCase().includes(q)) ||
        (t.trxId && t.trxId.toLowerCase().includes(q)) ||
        (t.accountNumber && t.accountNumber.includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101422] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" /> Back to Customer List
          </button>
          <div>
            <span className="text-gray-400 text-xs">Customer Profile Details</span>
            <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              {customer.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadTxs}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onSelectUserMessage && (
            <button
              onClick={() => onSelectUserMessage(customer.email)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white text-xs font-bold transition-all shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Open Support Chat
            </button>
          )}
        </div>
      </div>

      {/* ── Profile Info Banner ── */}
      <div className="bg-[#101422] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Profile Identifiers */}
          <div className="flex items-center gap-4">
            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.name}
                className="w-16 h-16 rounded-2xl border-2 border-blue-500/50 object-cover shadow-2xl"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                {customer.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black font-display text-white">{customer.name}</h2>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.name, 'Name')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-600 hover:text-white text-gray-300 transition-all shadow-md flex items-center justify-center"
                  title="Copy Name"
                >
                  {copiedText === customer.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] flex items-center gap-1 uppercase ml-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Google Account
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-2 font-mono">
                <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                  <Mail className="w-4 h-4 text-red-400" /> {customer.email}
                  <button onClick={() => handleCopy(customer.email, 'Email')} className="hover:text-blue-400 ml-1">
                    {copiedText === customer.email ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </span>
                {customer.whatsappNumber && (
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                    <Smartphone className="w-4 h-4" /> {customer.whatsappNumber}
                    <button onClick={() => handleCopy(customer.whatsappNumber, 'WhatsApp')} className="hover:text-emerald-300 ml-1">
                      {copiedText === customer.whatsappNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </button>
                  </span>
                )}
                {customer.pubgUid && (
                  <span className="flex items-center gap-1.5 text-blue-400 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                    <Gamepad2 className="w-4 h-4" /> UID: {customer.pubgUid}
                    <button onClick={() => handleCopy(customer.pubgUid, 'PUBG UID')} className="hover:text-blue-300 ml-1">
                      {copiedText === customer.pubgUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Wallet Balance Card */}
          <div className="w-full lg:w-auto bg-gradient-to-br from-emerald-950/80 via-[#0d1222] to-[#101422] border border-emerald-500/40 rounded-2xl p-4 px-6 flex items-center justify-between lg:justify-end gap-6 shadow-2xl shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Current Wallet Balance</span>
              <div className="font-display text-3xl font-black text-emerald-400 flex items-center gap-2 mt-0.5">
                <Wallet className="w-7 h-7" /> ৳{customer.walletBalance || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Activity Stats (4 Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#101422] border-white/10 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Deposited</span>
            <span className="font-display text-xl font-black text-emerald-400">৳{totalDeposited}</span>
          </div>
        </Card>

        <Card className="bg-[#101422] border-white/10 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Withdrawn</span>
            <span className="font-display text-xl font-black text-red-400">৳{totalWithdrawn}</span>
          </div>
        </Card>

        <Card className="bg-[#101422] border-white/10 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Prize Money Won</span>
            <span className="font-display text-xl font-black text-yellow-400">৳{totalPrizeWon}</span>
          </div>
        </Card>

        <Card className="bg-[#101422] border-white/10 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Matches & Entry Fees</span>
            <span className="font-display text-xl font-black text-amber-400">৳{totalEntryFees} <span className="text-xs text-gray-400">({customerRegistrations.length} Slots)</span></span>
          </div>
        </Card>
      </div>

      {/* ── Pending Alert Notification ── */}
      {pendingTxs.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-amber-300 text-sm">
                This customer has {pendingTxs.length} Pending Transaction Request(s)
              </h4>
              <p className="text-xs text-gray-400">
                নিচের ট্রানজেকশন হিস্ট্রি থেকে রিকোয়েস্টগুলো Approve বা Reject করুন।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Wallet Actions Form (Add / Deduct Money) ── */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-display text-lg font-black text-white uppercase flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" /> Admin Wallet Control & Adjustments
            </h3>
            <span className="text-xs text-gray-400">
              কাস্টমারের ব্যালেন্সে সরাসরি টাকা যোগ (Add Money) অথবা কর্তন (Deduct Money) করুন।
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Action Type Selection */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase block">Action Type</label>
            <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setActionType('ADD'); setNote('Match Winning Prize Bonus') }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                  actionType === 'ADD'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Add Money (➕)
              </button>
              <button
                type="button"
                onClick={() => { setActionType('DEDUCT'); setNote('Admin Deduction / Adjustment') }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                  actionType === 'DEDUCT'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Deduct Money (➖)
              </button>
            </div>
          </div>

          {/* Quick Preset Amount Buttons */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase block">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {['100', '200', '500', '1000', '2000', '5000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                    amount === val
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-black/30 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>
          </div>

          {/* Adjustment Form */}
          <form onSubmit={handleAdjust} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Amount (৳)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                  className="bg-black/50 border-white/10 text-white font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Reason / Note</label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-xs"
                  placeholder="e.g. Winner Prize"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider font-gaming transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                actionType === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Processing Adjustment...</span>
                </>
              ) : actionType === 'ADD' ? (
                `➕ Confirm Add ৳${amount} to ${customer.name}`
              ) : (
                `➖ Confirm Deduct ৳${amount} from ${customer.name}`
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Complete Wallet & Transaction History ── */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" /> Full Wallet & Transaction History
            </h3>
            <span className="text-xs text-gray-400">
              কাস্টমারের সকল ডিপোজিট, উইথড্র ও উইনিং প্রাইজ হিস্ট্রি।
            </span>
          </div>

          {/* Filter & Search Bar for Transactions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search TrxID..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500"
              />
            </div>
            <select
              value={txFilter}
              onChange={(e) => setTxFilter(e.target.value)}
              className="bg-black/40 border border-white/10 text-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposits Only</option>
              <option value="WITHDRAW">Withdrawals Only</option>
              <option value="WINNING_PRIZE">Prizes Only</option>
              <option value="ENTRY_FEE">Entry Fees Only</option>
              <option value="PENDING">Pending Requests</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-blue-400 font-gaming animate-pulse">
            LOADING TRANSACTIONS...
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No transactions found for filter "{txFilter}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Type & Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Account / TrxID</th>
                  <th className="p-3.5">Reason / Note</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredTxs.map((tx) => {
                  const { label, color, bg, icon } = txTypeBadge(tx.type)
                  const isPending = tx.status === 'PENDING'
                  const canApprove = isPending && (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW')

                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg border ${bg}`}>{icon}</div>
                          <div>
                            <span className={`font-bold ${color} block text-xs`}>{label}</span>
                            {tx.paymentMethod && (
                              <span className="text-[10px] text-gray-400 font-mono">{tx.paymentMethod}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-display text-base font-black ${color}`}>
                          {tx.type === 'WITHDRAW' || tx.type === 'ENTRY_FEE' ? '−' : '+'}৳{tx.amount}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-300">
                        {tx.accountNumber && (
                          <div className="text-emerald-400 font-bold">Acc: {tx.accountNumber}</div>
                        )}
                        {tx.trxId ? (
                          <div className="text-gray-400">TrxID: {tx.trxId}</div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-300 max-w-xs truncate">
                        {tx.note || '—'}
                      </td>
                      <td className="p-3.5 text-gray-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString('en-BD', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(tx.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleApprove(tx.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            disabled={deletingId === tx.id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Tournament Match Slot History ── */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-red-500" /> Tournament Match Participation History
            </h3>
            <span className="text-xs text-gray-400">
              এই কাস্টমারের বুককৃত সকল টুর্নামেন্ট টুর্নামেন্ট স্লট এবং ক্যারেক্টার আইডি।
            </span>
          </div>
          <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1">
            {customerRegistrations.length} Slots
          </Badge>
        </div>

        {customerRegistrations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No match slot registrations recorded for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Player IGN</th>
                  <th className="p-3.5">Team Name</th>
                  <th className="p-3.5">PUBG UID</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {customerRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/5">
                    <td className="p-3.5 font-bold text-white">{reg.player1Name}</td>
                    <td className="p-3.5 text-red-400 font-bold">{reg.teamName || '— (SOLO)'}</td>
                    <td className="p-3.5 text-gray-300 font-mono">{reg.player1Uid}</td>
                    <td className="p-3.5 text-emerald-400 font-mono">{reg.whatsappNumber}</td>
                    <td className="p-3.5">{reg.paymentMethod}</td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          reg.status === 'VERIFIED'
                            ? 'bg-emerald-950 text-emerald-400'
                            : reg.status === 'REJECTED'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-amber-950 text-amber-400'
                        }
                      >
                        {reg.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
