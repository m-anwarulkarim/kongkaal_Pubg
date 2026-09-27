import { useState, useEffect } from 'react'
import { updateRegistrationRoomCredentials, deleteRegistrationRecord, getMatches, type RegistrationRecord } from '@/lib/db'
import type { MatchItem } from '@/types/match'
import { getAllCustomerProfiles, getWalletTransactions, adminApproveTransaction, adminAdjustCustomerWallet } from '@/lib/wallet'
import type { CustomerProfile, WalletTransaction } from '@/types/wallet'
import CustomerDetailPage from './CustomerDetailPage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  RefreshCw,
  Smartphone,
  CheckCircle2,
  XCircle,
  MessageSquare,
  X,
  AlertCircle,
  Key,
  Send,
  Mail,
  Trash2,
  Eye,
  Copy,
  Check,
  ArrowDownLeft,
} from 'lucide-react'

interface PaymentsTabProps {
  loading: boolean
  pendingCount: number
  filteredRegistrations: RegistrationRecord[]
  handleStatusUpdate: (id: string, newStatus: 'VERIFIED' | 'REJECTED') => void
  onSelectUserMessage?: (userEmail: string) => void
}

export default function PaymentsTab({
  loading,
  pendingCount,
  filteredRegistrations,
  handleStatusUpdate,
  onSelectUserMessage,
}: PaymentsTabProps) {
  const [limit, setLimit] = useState(25)
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([])
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [approvingTxId, setApprovingTxId] = useState<string | null>(null)

  const [confirmModalItem, setConfirmModalItem] = useState<{ id: string; name: string; amount: number; trxId: string } | null>(null)
  const [rejectModalItem, setRejectModalItem] = useState<RegistrationRecord | null>(null)
  const [deleteModalReg, setDeleteModalReg] = useState<{ id: string; name: string; amount: number; trxId: string } | null>(null)

  // Room ID & Password Modal State
  const [roomModalItem, setRoomModalItem] = useState<RegistrationRecord | null>(null)
  const [editRoomId, setEditRoomId] = useState('1234567')
  const [editRoomPassword, setEditRoomPassword] = useState('8899')
  const [savingRoom, setSavingRoom] = useState(false)

  const loadCustomers = async () => {
    try {
      const [custData, txData, matchData] = await Promise.all([
        getAllCustomerProfiles(),
        getWalletTransactions(),
        getMatches(),
      ])
      setCustomers(custData)
      setWalletTxs(txData)
      setMatches(matchData)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const emailFromUrl = params.get('email')
        if (emailFromUrl) {
          const matched = custData.find(c => c.email.toLowerCase() === emailFromUrl.toLowerCase())
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
    } catch (err) {
      console.error('Failed to load customers in PaymentsTab:', err)
    }
  }

  useEffect(() => {
    loadCustomers()
    const handleUpdate = () => loadCustomers()
    window.addEventListener('wallet_updated', handleUpdate)
    window.addEventListener('profile_updated', handleUpdate)
    return () => {
      window.removeEventListener('wallet_updated', handleUpdate)
      window.removeEventListener('profile_updated', handleUpdate)
    }
  }, [])

  const handleApproveDeposit = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setApprovingTxId(id)
    const res = await adminApproveTransaction(id, status)
    setApprovingTxId(null)
    if (res.success) {
      toast.success(status === 'APPROVED' ? 'টাকা জমার অনুরোধ সফলভাবে এপ্রুভ ও ওয়ালেটে যুক্ত করা হয়েছে! 🎉' : 'রিকোয়েস্ট রিজেক্ট করা হয়েছে!')
      loadCustomers()
    } else {
      toast.error(res.message)
    }
  }

  useEffect(() => {
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
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [customers])

  const handleOpenCustomerDetail = (email?: string, name?: string, uid?: string, phone?: string) => {
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
      window.history.pushState({}, '', `/admin/payments?email=${encodeURIComponent(cust.email)}`)
    }
  }

  const handleBackToList = () => {
    setSelectedCustomer(null)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin/payments')
    }
  }

  const handleCopyField = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} "${text}" to clipboard!`)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 1500)
  }

  const handleDeleteRegistration = async () => {
    if (!deleteModalReg) return
    const res = await deleteRegistrationRecord(deleteModalReg.id)
    if (res.success) {
      toast.success('রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে!')
    } else {
      toast.error(`Error: ${res.message}`)
    }
    setDeleteModalReg(null)
  }

  const handleConfirmApproval = () => {
    if (confirmModalItem) {
      handleStatusUpdate(confirmModalItem.id, 'VERIFIED')
      setConfirmModalItem(null)
    }
  }

  const handleRejectAction = async (reg: RegistrationRecord, refundAmount: number) => {
    if (refundAmount > 0 && reg.userEmail) {
      const res = await adminAdjustCustomerWallet(
        reg.userEmail,
        refundAmount,
        'ADD',
        `Refund for Rejected Slot Booking (${reg.matchId})`,
        'ADMIN_CREDIT'
      )
      if (res.success) {
        toast.success(`৳${refundAmount} refunded to Wallet!`)
      } else {
        toast.error(`Refund failed: ${res.message}`)
      }
    }
    handleStatusUpdate(reg.id, 'REJECTED')
    setRejectModalItem(null)
    loadCustomers()
  }

  const handleOpenRoomModal = (reg: RegistrationRecord) => {
    setRoomModalItem(reg)
    setEditRoomId(reg.roomId || '1234567')
    setEditRoomPassword(reg.roomPassword || '8899')
  }

  const handleSaveAndSendRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomModalItem) return

    setSavingRoom(true)
    const res = await updateRegistrationRoomCredentials(roomModalItem.id, editRoomId.trim(), editRoomPassword.trim())
    setSavingRoom(false)

    if (res.success) {
      toast.success('🎉 রুম আইডি এবং পাসওয়ার্ড ওয়েবসাইটে আপডেট করা হয়েছে! কাস্টমার ড্যাশবোর্ড থেকে দেখতে পাবেন।')
      
      // WhatsApp Redirect
      const whatsappMsg = encodeURIComponent(
        `Hello ${roomModalItem.player1Name}! Your slot booking for PUBG Match is VERIFIED!\nRoom ID: ${editRoomId.trim()}\nPassword: ${editRoomPassword.trim()}\nMatch Starts soon. Good luck!`
      )
      const cleanPhone = roomModalItem.whatsappNumber.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${cleanPhone}?text=${whatsappMsg}`, '_blank')
      
      setRoomModalItem(null)
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  const pendingDepositTxs = walletTxs.filter((t) => t.status === 'PENDING')

  // If a customer profile is selected, render the FULL-PAGE details view!
  if (selectedCustomer) {
    return (
      <CustomerDetailPage
        customer={selectedCustomer}
        registrations={filteredRegistrations}
        onBack={handleBackToList}
        onRefreshCustomer={loadCustomers}
        onSelectUserMessage={onSelectUserMessage}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Pending Wallet Deposit & Add Money Requests Card */}
      {pendingDepositTxs.length > 0 && (
        <Card className="bg-[#101422] border-emerald-500/40 p-6 rounded-2xl space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white uppercase flex items-center gap-2">
                  <span>Pending Add Money & Deposit Requests</span>
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  কাস্টমারদের টাকা জমার (Add Money) নতুন অনুরোধ এখানে জমাকৃত অবস্থায় রয়েছে।
                </span>
              </div>
            </div>

            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 animate-pulse">
              {pendingDepositTxs.length} New Requests
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">User Email / Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">TrxID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3 text-right">Approve / Reject Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {pendingDepositTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3 font-bold text-white">
                      <div>{tx.userName || 'Player'}</div>
                      <div className="text-[11px] text-gray-400 font-mono font-normal">{tx.userEmail}</div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-400">{tx.paymentMethod || 'bKash'}</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">
                      {tx.trxId || 'N/A'}
                    </td>
                    <td className="p-3 font-bold text-emerald-400 text-sm">
                      +৳{tx.amount} BDT
                    </td>
                    <td className="p-3 text-gray-400 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleApproveDeposit(tx.id, 'APPROVED')}
                        disabled={approvingTxId === tx.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{approvingTxId === tx.id ? 'Approving...' : 'Approve (+Add)'}</span>
                      </button>
                      <button
                        onClick={() => handleApproveDeposit(tx.id, 'REJECTED')}
                        disabled={approvingTxId === tx.id}
                        className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Slot Booking Payments Card */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-white uppercase">
              Slot Booking Payments & Approvals
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              প্লেয়ারের নামের বোতামে চাপলে তার ফুল ডিটেইলস পেজ ওপেন হবে এবং ১-ক্লিকে TrxID, নাম ও নাম্বার কপি করা যাবে।
            </span>
          </div>

          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-2 shrink-0">
            {pendingCount} Pending Approvals
          </Badge>
        </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" /> Loading payment records from database...
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-bold">
          No payment records matching search query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">PUBG Player Name & Profile</th>
                <th className="p-3.5">Match Info</th>
                <th className="p-3.5">Gmail Email</th>
                <th className="p-3.5">PUBG UID</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">TrxID & Copy</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredRegistrations.slice(0, limit).map((reg) => {
                return (
                  <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                    {/* Player Name Cell with Copy Button & View Details link */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => handleOpenCustomerDetail(reg.userEmail, reg.player1Name, reg.player1Uid, reg.whatsappNumber)}
                          className="font-bold text-white block text-sm hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {reg.player1Name}
                        </span>
                        {/* Copy Name Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyField(e, reg.player1Name, 'Player Name')}
                          className="p-1 rounded bg-white/10 hover:bg-blue-600 hover:text-white text-gray-300 transition-all shadow-sm flex items-center justify-center shrink-0"
                          title={`Copy name "${reg.player1Name}"`}
                        >
                          {copiedText === reg.player1Name ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {reg.teamName && reg.teamName !== 'SOLO PLAYER' && (
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold">
                            {reg.teamName}
                          </span>
                        )}
                      </div>

                      {/* WhatsApp with Copy */}
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 mt-1">
                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                        <span>{reg.whatsappNumber}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyField(e, reg.whatsappNumber, 'WhatsApp Number')}
                          className="p-0.5 hover:text-white text-gray-400 transition-all shrink-0 ml-1"
                          title={`Copy WhatsApp ${reg.whatsappNumber}`}
                        >
                          {copiedText === reg.whatsappNumber ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>
                    </td>

                    {/* Match Info Cell */}
                    <td className="p-3.5">
                      {(() => {
                        const m = matches.find(match => match.id === reg.matchId)
                        if (m) {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-amber-400 text-[11px] truncate max-w-[120px]">{m.title}</span>
                              <Badge className="bg-white/10 text-gray-300 border-white/20 text-[9px] w-fit font-bold">
                                {m.mode}
                              </Badge>
                            </div>
                          )
                        }
                        return <span className="text-gray-500 text-[10px] font-mono">{reg.matchId}</span>
                      })()}
                    </td>

                    {/* Email Cell with Copy */}
                    <td className="p-3.5 text-gray-300 font-mono">
                      {reg.userEmail ? (
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{reg.userEmail}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyField(e, reg.userEmail || '', 'Gmail Email')}
                            className="p-0.5 hover:text-white text-gray-400 transition-all shrink-0 ml-1"
                            title={`Copy email ${reg.userEmail}`}
                          >
                            {copiedText === reg.userEmail ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">No Email</span>
                      )}
                    </td>

                    {/* PUBG UID Cell with Copy */}
                    <td className="p-3.5 text-gray-300 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-md font-bold font-mono">
                        <span>{reg.player1Uid}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyField(e, reg.player1Uid, 'PUBG UID')}
                          className="hover:text-white text-amber-400 transition-all"
                          title={`Copy UID ${reg.player1Uid}`}
                        >
                          {copiedText === reg.player1Uid ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="p-3.5">
                      <Badge
                        className={
                          reg.paymentMethod === 'bKash'
                            ? 'bg-pink-950 text-pink-400 border border-pink-500/30'
                            : 'bg-orange-950 text-orange-400 border border-orange-500/30'
                        }
                      >
                        {reg.paymentMethod}
                      </Badge>
                    </td>

                    {/* TrxID Cell with Copy */}
                    <td className="p-3.5 font-mono font-black text-amber-400 text-sm tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <span>{reg.trxId}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyField(e, reg.trxId, 'TrxID')}
                          className="p-1 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 transition-all shrink-0"
                          title={`Copy TrxID ${reg.trxId}`}
                        >
                          {copiedText === reg.trxId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 font-display text-base font-bold text-white">৳{reg.amount}</td>

                    {/* Status */}
                    <td className="p-3.5">
                      <Badge
                        className={
                          reg.status === 'VERIFIED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : reg.status === 'REJECTED'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                        }
                      >
                        {reg.status}
                      </Badge>
                    </td>

                    {/* Actions & Details Page Button */}
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        onClick={() => handleOpenCustomerDetail(reg.userEmail, reg.player1Name, reg.player1Uid, reg.whatsappNumber)}
                        size="sm"
                        className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-400 hover:text-white p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shadow-md shrink-0"
                        title="View Full Customer Details Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {reg.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => setConfirmModalItem({ id: reg.id, name: reg.player1Name, amount: reg.amount, trxId: reg.trxId })}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            onClick={() => setRejectModalItem(reg)}
                            size="sm"
                            className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}

                      {reg.status === 'VERIFIED' && (
                        <Button
                          onClick={() => handleOpenRoomModal(reg)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Send / Set Room ID</span>
                        </Button>
                      )}

                      <Button
                        onClick={() => setDeleteModalReg({ id: reg.id, name: reg.player1Name, amount: reg.amount, trxId: reg.trxId })}
                        size="sm"
                        className="bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white text-xs font-bold py-1.5 px-2.5 h-auto inline-flex items-center gap-1 cursor-pointer transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredRegistrations.length > limit && (
        <div className="text-center pt-3 border-t border-white/10">
          <Button
            onClick={() => setLimit((prev) => prev + 25)}
            variant="outline"
            size="sm"
            className="bg-white/5 hover:bg-white/10 border-white/10 text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
          >
            More (আরও পেমেন্ট বুকিং দেখুন — {filteredRegistrations.length - limit} টি বাকি)
          </Button>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR APPROVAL */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Approval (পেমেন্ট নিশ্চিতকরণ)</h3>
              </div>
              <button onClick={() => setConfirmModalItem(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Player Name:</span>
                <strong className="text-white">{confirmModalItem.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>TrxID:</span>
                <strong className="text-amber-400 font-mono">{confirmModalItem.trxId}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-emerald-400 text-sm font-display">৳{confirmModalItem.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              আপনি কি নিশ্চিত যে এই প্লেয়ারের পেমেন্ট এবং স্লট বুকিং **Approve (এপ্রুভ)** করতে চান?
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel (বাতিল)
              </Button>
              <Button
                type="button"
                onClick={handleConfirmApproval}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, Confirm Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION POPUP MODAL */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Rejection</h3>
              </div>
              <button onClick={() => setRejectModalItem(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Player Name:</span>
                <strong className="text-white">{rejectModalItem.player1Name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Method:</span>
                <strong className="text-amber-400 font-mono">{rejectModalItem.paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-red-400 text-sm font-display">৳{rejectModalItem.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              আপনি কি এই স্লট বুকিংটি রিজেক্ট করতে চান?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={() => handleRejectAction(rejectModalItem, rejectModalItem.amount)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Reject & Refund (৳{rejectModalItem.amount})
              </Button>
              
              {rejectModalItem.paymentMethod !== 'WALLET' && (
                <Button
                  type="button"
                  onClick={() => handleRejectAction(rejectModalItem, 0)}
                  className="w-full bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject ONLY (No Refund)
                </Button>
              )}
              
              <Button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="w-full mt-1 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl border border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SET ROOM ID & PASSWORD & SEND WHATSAPP */}
      {roomModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Send Room ID & Password</h3>
                  <span className="text-[11px] text-gray-400">Player: {roomModalItem.player1Name}</span>
                </div>
              </div>
              <button onClick={() => setRoomModalItem(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndSendRoom} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-bold block mb-1">Room ID (ইন-গেম রুম আইডি)</label>
                <Input
                  type="text"
                  required
                  value={editRoomId}
                  onChange={(e) => setEditRoomId(e.target.value)}
                  placeholder="e.g. 1234567"
                  className="bg-[#161a29] border-white/10 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Room Password (ইন-গেম পাসওয়ার্ড)</label>
                <Input
                  type="text"
                  required
                  value={editRoomPassword}
                  onChange={(e) => setEditRoomPassword(e.target.value)}
                  placeholder="e.g. 8899"
                  className="bg-[#161a29] border-white/10 text-white font-mono text-sm"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
                ✓ এটি সেভ করলে কাস্টমার তার <strong>`/dashboard`</strong> এ তাৎক্ষণিক Room ID এবং Password দেখতে পাবেন।
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setRoomModalItem(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingRoom}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Save & Send WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR DELETING A REGISTRATION RECORD */}
      {deleteModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Confirm Delete (রেকর্ড মুছে ফেলুন)</h3>
              </div>
              <button onClick={() => setDeleteModalReg(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Player Name:</span>
                <strong className="text-white">{deleteModalReg.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>TrxID:</span>
                <strong className="text-amber-400 font-mono">{deleteModalReg.trxId}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-red-400 text-sm font-display">৳{deleteModalReg.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              আপনি কি সত্যি এই রেজিষ্ট্রেশন ও পেমেন্ট রেকর্ডটি স্থায়ীভাবে মুছতে চান? (এই অ্যাকশনটি বাতিল করা যাবে না)।
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDeleteModalReg(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel (বাতিল)
              </Button>
              <Button
                type="button"
                onClick={handleDeleteRegistration}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Yes, Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
    </div>
  )
}

