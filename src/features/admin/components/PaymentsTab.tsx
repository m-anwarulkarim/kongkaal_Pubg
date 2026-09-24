import type { RegistrationRecord } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from '@/components/ui/Link'
import { RefreshCw, Smartphone, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'

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
  return (
    <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Slot Booking Payments
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Verify bKash / Nagad / Rocket Transaction IDs (TrxID) & Send WhatsApp Room ID
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
                const whatsappMsg = encodeURIComponent(
                  `Hello ${reg.player1Name}! Your slot booking for PUBG Match is VERIFIED!\nRoom ID: 1234567\nPassword: 8899\nMatch Starts in 15 mins. Good luck!`
                )

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
                            onClick={() => handleStatusUpdate(reg.id, 'VERIFIED')}
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
                        <Link
                          href={`https://wa.me/${reg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 no-underline shadow-md shadow-emerald-600/20"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Send Room ID
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
