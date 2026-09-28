import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  getWalletTransactions,
  getAllCustomerProfiles,
  adminAdjustCustomerWallet,
  adminApproveTransaction,
  deleteWalletTransaction,
  deleteCustomerProfile,
} from '@/lib/wallet'
import type { WalletTransaction, CustomerProfile } from '@/types/wallet'
import type { RegistrationRecord } from '@/lib/db'
import CustomerDetailPage from './CustomerDetailPage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { Send, CheckCircle2, XCircle, Search, RefreshCw, PlusCircle, MinusCircle, X, AlertCircle, Trash2, Eye, Loader2, Clock } from 'lucide-react'

interface WalletTabProps {
  registrations?: RegistrationRecord[]
  onSelectUserMessage?: (userEmail: string) => void
}

export default function WalletTab({ registrations = [], onSelectUserMessage }: WalletTabProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)

  // Pagination / Load More Limits (Default 25 each = 50 total initially)
  const [customerLimit, setCustomerLimit] = useState(25)
  const [txLimit, setTxLimit] = useState(25)

  // Send / Deduct Money Form State
  const [sendEmail, setSendEmail] = useState('')
  const [sendAmount, setSendAmount] = useState('500')
  const [actionType, setActionType] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [sendNote, setSendNote] = useState('Match Winning Prize Bonus')
  const [sendMsg, setSendMsg] = useState('')
  const [sending, setSending] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [confirmModalTx, setConfirmModalTx] = useState<{ id: string; name: string; amount: number; type: string } | null>(null)
  const [deleteModalTx, setDeleteModalTx] = useState<{ id: string; name: string; amount: number; type: string; trxId?: string } | null>(null)
  const [deleteCustomerModal, setDeleteCustomerModal] = useState<{ email: string; name: string; balance: number } | null>(null)

  const loadWalletData = async () => {
    const custs = await getAllCustomerProfiles()
    const txs = await getWalletTransactions()
    setCustomers(custs)
    setTransactions(txs)

    // Sync active customer from URL search param if present (?email=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const emailFromUrl = params.get('email')
      if (emailFromUrl) {
        const matched = custs.find(c => c.email.toLowerCase() === emailFromUrl.toLowerCase())
        if (matched) {
          setSelectedCustomer(matched)
        } else {
          setSelectedCustomer({
            email: emailFromUrl,
            name: emailFromUrl.split('@')[0],
            pubgUid: '',
            whatsappNumber: '',
            walletBalance: 0,
          })
        }
      }
    }
  }

  useEffect(() => {
    loadWalletData()

    const handleUpdate = () => {
      loadWalletData()
    }

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const emailFromUrl = params.get('email')
        if (emailFromUrl) {
          const matched = customers.find(c => c.email.toLowerCase() === emailFromUrl.toLowerCase())
          if (matched) setSelectedCustomer(matched)
        } else {
          setSelectedCustomer(null)
        }
      }
    }

    window.addEventListener('wallet_updated', handleUpdate)
    window.addEventListener('profile_updated', handleUpdate)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('wallet_updated', handleUpdate)
      window.removeEventListener('profile_updated', handleUpdate)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleOpenCustomerDetail = (email: string, name?: string, uid?: string, phone?: string) => {
    const targetEmail = email || (name ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : '')
    if (!targetEmail) return
    const matched = customers.find(c => c.email.toLowerCase() === targetEmail.toLowerCase())
    const cust: CustomerProfile = matched || {
      email: targetEmail,
      name: name || targetEmail.split('@')[0],
      pubgUid: uid || '',
      whatsappNumber: phone || '',
      walletBalance: 0,
    }
    setSelectedCustomer(cust)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/admin/wallet?email=${encodeURIComponent(cust.email)}`)
    }
  }

  const handleBackToList = () => {
    setSelectedCustomer(null)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin/wallet')
    }
  }

  // If a customer is selected, render the dedicated FULL-PAGE details view!
  if (selectedCustomer) {
    return (
      <CustomerDetailPage
        customer={selectedCustomer}
        registrations={registrations}
        onBack={handleBackToList}
        onRefreshCustomer={loadWalletData}
        onSelectUserMessage={onSelectUserMessage}
      />
    )
  }

  const handleDeleteTx = async () => {
    if (!deleteModalTx) return
    const res = await deleteWalletTransaction(deleteModalTx.id)
    if (res.success) {
      toast.success('রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে!')
      loadWalletData()
    } else {
      toast.error(`Error: ${res.message}`)
    }
    setDeleteModalTx(null)
  }

  const handleDeleteCustomer = async () => {
    if (!deleteCustomerModal) return
    const res = await deleteCustomerProfile(deleteCustomerModal.email)
    if (res.success) {
      toast.success('কাস্টমার প্রোফাইলটি সফলভাবে মুছে ফেলা হয়েছে!')
      loadWalletData()
    } else {
      toast.error(`Error: ${res.message}`)
    }
    setDeleteCustomerModal(null)
  }

  const handleSendMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendEmail || !sendAmount) return
    setSending(true)
    setSendMsg('')

    const res = await adminAdjustCustomerWallet(sendEmail.trim(), Number(sendAmount), actionType, sendNote)
    setSending(false)

    if (res.success) {
      setSendMsg(res.message)
      setSendAmount('500')
      loadWalletData()
      setTimeout(() => setSendMsg(''), 4000)
    } else {
      setSendMsg(`ERROR: ${res.message}`)
    }
  }

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await adminApproveTransaction(id, status)
    if (res.success) {
      toast.success(status === 'APPROVED' ? 'ট্রানজেকশন সফলভাবে এপ্রুভ (APPROVED) হয়েছে!' : 'ট্রানজেকশন রিজেক্ট করা হয়েছে!')
      loadWalletData()
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  const filteredTx = transactions.filter(
    (t) =>
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.trxId && t.trxId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Send/Deduct Money Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Send / Deduct Money Form (Admin Balance Adjustments) */}
        <Card className="lg:col-span-1 bg-[#101422] border-red-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Send className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-lg font-black text-white uppercase">
              Adjust Customer Balance (+ / -)
            </h3>
          </div>

          <p className="text-xs text-gray-400">
            কাস্টমারের ওয়ালেটে টাকা **যোগ (+)** বা **কাটতে (-)** পারবেন (প্রাইজ মানি, রিফান্ড বা পেনাল্টি হিসেবে)।
          </p>

          {sendMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${sendMsg.includes('ERROR') ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}`}>
              {sendMsg}
            </div>
          )}

          <form onSubmit={handleSendMoneySubmit} className="space-y-3 text-xs">
            {/* Action Selector (+ Add vs - Deduct) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionType('ADD')
                  setSendNote('Match Winning Prize Bonus (+)')
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  actionType === 'ADD'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-[#080a12] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Money</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionType('DEDUCT')
                  setSendNote('Balance Deduction / Penalty (-)')
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  actionType === 'DEDUCT'
                    ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30'
                    : 'bg-[#080a12] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>- Deduct Money</span>
              </button>
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Customer Email / ID</label>
              <Input
                type="email"
                placeholder="e.g. customer@gmail.com"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Amount (৳ BDT)</label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Note / Reason</label>
              <Input
                type="text"
                placeholder="e.g. 1st Prize Winner Solo Battle"
                value={sendNote}
                onChange={(e) => setSendNote(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className={`w-full font-bold py-2.5 text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                actionType === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {actionType === 'ADD'
                      ? 'Add Money (+) to Customer Wallet'
                      : 'Deduct Money (-) from Customer Wallet'}
                  </span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Customer Wallet Balances Directory */}
        <Card className="lg:col-span-2 bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase">
                Customer Wallet Balances ({customers.length})
              </h3>
              <p className="text-xs text-gray-400">All registered customer wallet balances</p>
            </div>
            <Button
              onClick={loadWalletData}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>

          <div className="overflow-x-auto max-h-[280px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">PUBG UID</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {customers.slice(0, customerLimit).map((c) => (
                  <tr key={c.email} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">
                      <span
                        onClick={() => handleOpenCustomerDetail(c.email, c.name, c.pubgUid, c.whatsappNumber)}
                        className="hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {c.name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{c.email}</td>
                    <td className="p-3 text-red-400 font-mono">{c.pubgUid || '—'}</td>
                    <td className="p-3 font-display font-bold text-emerald-400 text-sm">৳{c.walletBalance}</td>
                    <td className="p-3 text-right space-x-1.5">
                      <Button
                        onClick={() => handleOpenCustomerDetail(c.email, c.name, c.pubgUid, c.whatsappNumber)}
                        size="sm"
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
                        title={`View profile page of ${c.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSendEmail(c.email)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        size="sm"
                        className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] py-1 px-2.5 h-auto cursor-pointer"
                      >
                        Credit Money
                      </Button>
                      <Button
                        onClick={() => setDeleteCustomerModal({ email: c.email, name: c.name, balance: c.walletBalance })}
                        size="sm"
                        className="bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white text-[11px] py-1 px-2 h-auto inline-flex items-center gap-1 cursor-pointer transition-all"
                        title="Delete Customer Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length > customerLimit && (
            <div className="text-center pt-2 border-t border-white/10">
              <Button
                onClick={() => setCustomerLimit((prev) => prev + 25)}
                variant="outline"
                size="sm"
                className="bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                More (আরও দেখুন — {customers.length - customerLimit} জন বাকি)
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Wallet Deposit & Withdrawal Requests Table */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-white uppercase">
              Deposit & Withdraw Requests ({pendingCount} Pending)
            </h3>
            <p className="text-xs text-gray-400">
              Approve customer Add Money (Deposits) or Cash-out (Withdrawal) requests
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Input
              type="text"
              placeholder="Search by Email or TrxID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080a12] border-white/10 text-xs text-white pl-8"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-bold">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Method & TrxID / Account</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredTx.slice(0, txLimit).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      {(() => {
                        const timeInfo = formatRelativeTime(tx.createdAt)
                        return (
                          <div className="flex flex-col gap-0.5 min-w-[110px]">
                            <span className="font-bold text-amber-400 text-xs flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                              {timeInfo.relative}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {timeInfo.dateOnly} {timeInfo.timeOnly}
                            </span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="p-3.5">
                      <span
                        onClick={() => handleOpenCustomerDetail(tx.userEmail, tx.userName)}
                        className="font-bold text-white block hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {tx.userName}
                      </span>
                      <span className="text-[11px] text-gray-400">{tx.userEmail}</span>
                    </td>
                    <td className="p-3.5 font-bold">
                      <Badge
                        className={
                          tx.type === 'DEPOSIT'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                            : tx.type === 'WITHDRAW'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-gray-200 block">{tx.paymentMethod || 'SYSTEM'}</span>
                      {tx.trxId && <span className="font-mono text-amber-400 text-xs">TrxID: {tx.trxId}</span>}
                      {tx.accountNumber && <span className="font-mono text-emerald-400 text-xs">Acc: {tx.accountNumber}</span>}
                    </td>
                    <td className="p-3.5 font-display text-base font-bold text-white">৳{tx.amount}</td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          tx.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'REJECTED'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        onClick={() => handleOpenCustomerDetail(tx.userEmail, tx.userName)}
                        size="sm"
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
                        title={`View profile page of ${tx.userName || tx.userEmail}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {tx.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => setConfirmModalTx({ id: tx.id, name: tx.userName || tx.userEmail, amount: tx.amount, type: tx.type })}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1 shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            onClick={() => handleAction(tx.id, 'REJECTED')}
                            size="sm"
                            className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => setDeleteModalTx({ id: tx.id, name: tx.userName || tx.userEmail, amount: tx.amount, type: tx.type, trxId: tx.trxId })}
                        size="sm"
                        className="bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white text-xs font-bold py-1.5 px-2.5 h-auto inline-flex items-center gap-1 cursor-pointer transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTx.length > txLimit && (
          <div className="text-center pt-2 border-t border-white/10">
            <Button
              onClick={() => setTxLimit((prev) => prev + 25)}
              variant="outline"
              size="sm"
              className="bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
            >
              More (আরও ট্রানজেকশন দেখুন — {filteredTx.length - txLimit} টি বাকি)
            </Button>
          </div>
        )}
      </Card>

      {/* CONFIRMATION POPUP MODAL FOR TRANSACTION APPROVAL */}
      {confirmModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Approval (ওয়ালেট পেমেন্ট নিশ্চিতকরণ)</h3>
              </div>
              <button onClick={() => setConfirmModalTx(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Customer:</span>
                <strong className="text-white">{confirmModalTx.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Transaction Type:</span>
                <strong className="text-amber-400">{confirmModalTx.type}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-emerald-400 text-sm font-display">৳{confirmModalTx.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              আপনি কি নিশ্চিত যে এই ট্রানজেকশনটি **Approve (এপ্রুভ)** করতে চান? কাস্টমারের ওয়ালেট ব্যালেন্স যোগ হয়ে যাবে।
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setConfirmModalTx(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel (বাতিল)
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleAction(confirmModalTx.id, 'APPROVED')
                  setConfirmModalTx(null)
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, Confirm Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR DELETING A TRANSACTION RECORD */}
      {deleteModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Delete (রেকর্ড মুছে ফেলুন)</h3>
              </div>
              <button onClick={() => setDeleteModalTx(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Customer:</span>
                <strong className="text-white">{deleteModalTx.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Transaction Type:</span>
                <strong className="text-amber-400">{deleteModalTx.type}</strong>
              </div>
              {deleteModalTx.trxId && (
                <div className="flex justify-between text-gray-300">
                  <span>TrxID / Acc:</span>
                  <strong className="text-gray-200 font-mono">{deleteModalTx.trxId}</strong>
                </div>
              )}
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-red-400 text-sm font-display">৳{deleteModalTx.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              আপনি কি সত্যি এই <strong>{deleteModalTx.type}</strong> রেকর্ডটি স্থায়ীভাবে মুছতে চান? (এই অ্যাকশনটি বাতিল করা যাবে না)।
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDeleteModalTx(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel (বাতিল)
              </Button>
              <Button
                type="button"
                onClick={handleDeleteTx}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Yes, Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR DELETING A CUSTOMER PROFILE */}
      {deleteCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Delete (কাস্টমার মুছে ফেলুন)</h3>
              </div>
              <button onClick={() => setDeleteCustomerModal(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Customer Name:</span>
                <strong className="text-white">{deleteCustomerModal.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Email:</span>
                <strong className="text-amber-400 font-mono">{deleteCustomerModal.email}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Wallet Balance:</span>
                <strong className="text-emerald-400 text-sm font-display">৳{deleteCustomerModal.balance}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              আপনি কি সত্যি <strong>{deleteCustomerModal.name}</strong> ({deleteCustomerModal.email}) এর কাস্টমার প্রোফাইল ও ওয়ালেট স্থায়ীভাবে মুছতে চান? (এই অ্যাকশনটি বাতিল করা যাবে না)।
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDeleteCustomerModal(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel (বাতিল)
              </Button>
              <Button
                type="button"
                onClick={handleDeleteCustomer}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Yes, Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
