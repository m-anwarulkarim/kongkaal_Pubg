import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { CustomerProfile } from '@/types/wallet'
import type { WalletTransaction } from '@/types/wallet'
import {
  getWalletTransactions,
  adminAdjustCustomerWallet,
  adminApproveTransaction,
  deleteWalletTransaction,
} from '@/lib/wallet'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  X, Wallet, PlusCircle, MinusCircle, CheckCircle2, XCircle, Trash2,
  Clock, TrendingUp, TrendingDown, Gamepad2, ShieldCheck, Mail,
  Smartphone, RefreshCw, Trophy, ArrowDownCircle, ArrowUpCircle, AlertTriangle,
} from 'lucide-react'

interface CustomerDetailDrawerProps {
  customer: CustomerProfile | null
  onClose: () => void
  onRefresh: () => void
}

function txTypeLabel(type: string) {
  switch (type) {
    case 'DEPOSIT': return { label: 'Deposit', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30', icon: <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" /> }
    case 'WITHDRAW': return { label: 'Withdraw', color: 'text-red-400', bg: 'bg-red-950/40 border-red-500/30', icon: <ArrowUpCircle className="w-3.5 h-3.5 text-red-400" /> }
    case 'ENTRY_FEE': return { label: 'Entry Fee', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', icon: <Gamepad2 className="w-3.5 h-3.5 text-amber-400" /> }
    case 'WINNING_PRIZE': return { label: 'Prize Won', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-500/30', icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> }
    case 'ADMIN_CREDIT': return { label: 'Admin Credit', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30', icon: <PlusCircle className="w-3.5 h-3.5 text-blue-400" /> }
    default: return { label: type, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', icon: <Clock className="w-3.5 h-3.5 text-gray-400" /> }
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <Badge className="bg-emerald-950 text-emerald-400 border-emerald-500/30 text-[10px]">✅ APPROVED</Badge>
  if (status === 'REJECTED') return <Badge className="bg-red-950 text-red-400 border-red-500/30 text-[10px]">❌ REJECTED</Badge>
  return <Badge className="bg-amber-950 text-amber-400 border-amber-500/30 text-[10px] animate-pulse">⏳ PENDING</Badge>
}

export default function CustomerDetailDrawer({ customer, onClose, onRefresh }: CustomerDetailDrawerProps) {
  const [txs, setTxs] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [amount, setAmount] = useState('500')
  const [note, setNote] = useState('Match Winning Prize Bonus')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadTxs = async () => {
    if (!customer) return
    setLoading(true)
    const data = await getWalletTransactions(customer.email)
    setTxs(data)
    setLoading(false)
  }

  useEffect(() => {
    if (customer) { setTxs([]); loadTxs() }
  }, [customer?.email])

  if (!customer) return null

  const totalDeposited = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((s, t) => s + t.amount, 0)
  const totalWithdrawn = txs.filter(t => t.type === 'WITHDRAW' && t.status === 'APPROVED').reduce((s, t) => s + t.amount, 0)
  const totalPrizeWon = txs.filter(t => t.type === 'WINNING_PRIZE').reduce((s, t) => s + t.amount, 0)
  const totalEntryFees = txs.filter(t => t.type === 'ENTRY_FEE').reduce((s, t) => s + t.amount, 0)
  const pendingTxs = txs.filter(t => t.status === 'PENDING')

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    setSubmitting(true)
    const res = await adminAdjustCustomerWallet(customer.email, Number(amount), actionType, note)
    setSubmitting(false)
    if (res.success) {
      toast.success(res.message)
      loadTxs()
      onRefresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await adminApproveTransaction(id, status)
    if (res.success) {
      toast.success(status === 'APPROVED' ? '✅ Approved!' : '❌ Rejected!')
      loadTxs()
      onRefresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleDeleteTx = async (id: string) => {
    setDeletingId(id)
    const res = await deleteWalletTransaction(id)
    setDeletingId(null)
    if (res.success) {
      toast.success('Transaction deleted!')
      loadTxs()
      onRefresh()
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-in Panel */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-[#080b14] border-l border-white/10 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in slide-in-from-right duration-300">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0d1120] shrink-0">
          <div className="flex items-center gap-3">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt={customer.name} className="w-12 h-12 rounded-full border-2 border-blue-500/50 object-cover shadow-lg" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {customer.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-black text-white text-xl leading-tight">{customer.name}</h2>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> VERIFIED GOOGLE USER
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadTxs} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Profile Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#101422] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Gmail Email</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-200 font-mono">
                <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            </div>
            <div className="bg-[#101422] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">WhatsApp Number</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                {customer.whatsappNumber || <span className="text-gray-500">Not set</span>}
              </div>
            </div>
            <div className="bg-[#101422] border border-white/10 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">PUBG UID</span>
              <span className="text-xs text-white font-mono font-bold">
                {customer.pubgUid || <span className="text-gray-500">Not set</span>}
              </span>
            </div>
            <div className="bg-gradient-to-br from-emerald-950/60 to-[#101422] border border-emerald-500/40 rounded-xl p-3">
              <span className="text-[10px] text-emerald-500 uppercase font-bold block mb-1">Current Wallet Balance</span>
              <div className="flex items-center gap-1.5 font-display text-2xl font-black text-emerald-400">
                <Wallet className="w-5 h-5 shrink-0" /> ৳{customer.walletBalance || 0}
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Deposited', val: totalDeposited, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />, color: 'text-emerald-400' },
              { label: 'Withdrawn', val: totalWithdrawn, icon: <TrendingDown className="w-3.5 h-3.5 text-red-400" />, color: 'text-red-400' },
              { label: 'Prize Won', val: totalPrizeWon, icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" />, color: 'text-yellow-400' },
              { label: 'Entry Fees', val: totalEntryFees, icon: <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />, color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0d1120] border border-white/10 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center mb-1">{stat.icon}</div>
                <div className={`font-display text-base font-black ${stat.color}`}>৳{stat.val}</div>
                <div className="text-[9px] text-gray-500 uppercase font-bold leading-tight mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Pending Alert */}
          {pendingTxs.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-300 font-bold">
                {pendingTxs.length} Pending Request(s) — নিচে Approve/Reject করুন
              </span>
            </div>
          )}

          {/* ── Admin Wallet Actions ── */}
          <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" /> Admin Wallet Actions
            </h3>

            <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setActionType('ADD'); setNote('Match Winning Prize Bonus') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  actionType === 'ADD' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Money
              </button>
              <button
                type="button"
                onClick={() => { setActionType('DEDUCT'); setNote('Admin Deduction') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  actionType === 'DEDUCT' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" /> Deduct Money
              </button>
            </div>

            <form onSubmit={handleAdjust} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Amount (৳)</label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" required className="bg-black/40 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Note / Reason</label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} className="bg-black/40 border-white/10 text-white" placeholder="e.g. Tournament Prize" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className={`w-full py-2.5 rounded-xl font-bold text-sm font-gaming ${
                  actionType === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {submitting
                  ? 'Processing...'
                  : actionType === 'ADD'
                  ? `➕ Add ৳${amount} to ${customer.name}`
                  : `➖ Deduct ৳${amount} from ${customer.name}`}
              </Button>
            </form>
          </div>

          {/* ── Transaction History ── */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Full Transaction History
              <Badge className="bg-purple-950 text-purple-400 border-purple-500/30 text-[10px]">{txs.length} Total</Badge>
            </h3>

            {loading ? (
              <div className="p-8 text-center text-blue-400 font-gaming text-xs animate-pulse">LOADING HISTORY...</div>
            ) : txs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No transactions found.</div>
            ) : (
              <div className="space-y-2">
                {txs.map((tx) => {
                  const { label, color, bg, icon } = txTypeLabel(tx.type)
                  const isPending = tx.status === 'PENDING'
                  const canApprove = isPending && (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW')

                  return (
                    <div key={tx.id} className={`rounded-xl border p-3 ${bg} space-y-2`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {icon}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${color}`}>{label}</span>
                              <StatusBadge status={tx.status} />
                            </div>
                            {tx.note && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{tx.note}</p>}
                            {tx.trxId && <p className="text-[10px] text-gray-500 font-mono">TrxID: {tx.trxId}</p>}
                            {tx.accountNumber && <p className="text-[10px] text-gray-500 font-mono">Account: {tx.accountNumber}</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-display text-base font-black ${color}`}>
                            {tx.type === 'WITHDRAW' || tx.type === 'ENTRY_FEE' ? '−' : '+'}৳{tx.amount}
                          </span>
                          <p className="text-[10px] font-bold text-amber-400 mt-0.5 font-mono">
                            {formatRelativeTime(tx.createdAt).full}
                          </p>
                        </div>
                      </div>

                      {canApprove && (
                        <div className="flex gap-2 pt-0.5">
                          <button
                            onClick={() => handleApprove(tx.id, 'APPROVED')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleApprove(tx.id, 'REJECTED')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          disabled={deletingId === tx.id}
                          className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors py-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deletingId === tx.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
