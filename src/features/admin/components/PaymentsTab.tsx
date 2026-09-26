import { useState } from 'react'
import { updateRegistrationRoomCredentials, type RegistrationRecord } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RefreshCw, Smartphone, CheckCircle2, XCircle, MessageSquare, X, AlertCircle, Key, Send } from 'lucide-react'

interface PaymentsTabProps {
  loading: boolean
  pendingCount: number
  filteredRegistrations: RegistrationRecord[]
  handleStatusUpdate: (id: string, newStatus: 'VERIFIED' | 'REJECTED') => void
}

export default function PaymentsTab({
  loading,
  pendingCount,
  filteredRegistrations,
  handleStatusUpdate,
}: PaymentsTabProps) {
  const [confirmModalItem, setConfirmModalItem] = useState<{ id: string; name: string; amount: number; trxId: string } | null>(null)

  // Room ID & Password Modal State
  const [roomModalItem, setRoomModalItem] = useState<RegistrationRecord | null>(null)
  const [editRoomId, setEditRoomId] = useState('1234567')
  const [editRoomPassword, setEditRoomPassword] = useState('8899')
  const [savingRoom, setSavingRoom] = useState(false)

  const handleConfirmApproval = () => {
    if (confirmModalItem) {
      handleStatusUpdate(confirmModalItem.id, 'VERIFIED')
      setConfirmModalItem(null)
    }
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

  return (
    <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Slot Booking Payments
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Verify bKash / Nagad Transaction IDs (TrxID) & Send WhatsApp Room ID
          </span>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1">
          {pendingCount} Pending Approvals
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading registrations from Supabase...
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-bold">
          No registration records matching query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Player / Team</th>
                <th className="p-3.5">PUBG UID</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">TrxID</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredRegistrations.map((reg) => {
                return (
                  <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-white block text-sm">{reg.player1Name}</span>
                      {reg.teamName && (
                        <span className="text-[10px] text-red-400 font-bold block">
                          Team: {reg.teamName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3 text-emerald-400" />
                        {reg.whatsappNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-300 font-mono text-xs">{reg.player1Uid}</td>
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
                    <td className="p-3.5 font-mono font-black text-amber-400 text-sm tracking-wide">
                      {reg.trxId}
                    </td>
                    <td className="p-3.5 font-display text-base font-bold text-white">৳{reg.amount}</td>
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
                    <td className="p-3.5 text-right space-x-2">
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
                            onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
    </Card>
  )
}

