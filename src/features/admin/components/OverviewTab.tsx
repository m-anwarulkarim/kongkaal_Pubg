import type { RegistrationRecord } from '@/lib/db'
import type { MatchItem } from '@/types/match'
import type { AdminTabType } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Gamepad2,
  Users,
  CheckCircle2,
  Smartphone,
} from 'lucide-react'

interface OverviewTabProps {
  totalRevenue: number
  verifiedCount: number
  pendingCount: number
  matches: MatchItem[]
  registrations: RegistrationRecord[]
  setActiveTab: (tab: AdminTabType) => void
  handleStatusUpdate: (id: string, newStatus: 'VERIFIED' | 'REJECTED') => void
}

export default function OverviewTab({
  totalRevenue,
  verifiedCount,
  pendingCount,
  matches,
  registrations,
  setActiveTab,
  handleStatusUpdate,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-emerald-500/30 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">VERIFIED REVENUE</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-4xl font-black text-emerald-400 mb-1">
            ৳{totalRevenue}
          </div>
          <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {verifiedCount} Verified Payments
          </span>
        </Card>

        {/* Pending Approvals Card */}
        <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-amber-500/30 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase">PENDING APPROVALS</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-4xl font-black text-amber-400 mb-1">
            {pendingCount}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Needs Admin TrxID Verification
          </span>
        </Card>

        {/* Active Matches Card */}
        <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-red-500/30 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-500 uppercase">ACTIVE MATCHES</span>
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-4xl font-black text-red-500 mb-1">
            {matches.length}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Solo, Duo & Squad Tournaments
          </span>
        </Card>

        {/* Total Registrations Card */}
        <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-blue-500/30 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase">TOTAL REGISTRATIONS</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display text-4xl font-black text-white mb-1">
            {registrations.length}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Saved in Supabase Database
          </span>
        </Card>
      </div>

      {/* Quick Pending Approvals Preview */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-display text-xl font-bold text-white uppercase">
              Pending Approvals Queue
            </h3>
            <span className="text-xs text-gray-400">Verify Transaction ID (TrxID) and approve slot</span>
          </div>
          <Button
            onClick={() => setActiveTab('PAYMENTS')}
            size="sm"
            className="btn-kong-outline text-xs"
          >
            View All Approvals
          </Button>
        </div>

        {registrations.filter((r) => r.status === 'PENDING').length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>No pending approvals right now. All caught up!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Player / Team</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">TrxID</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {registrations
                  .filter((r) => r.status === 'PENDING')
                  .slice(0, 5)
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <span className="font-bold text-white block">{reg.player1Name}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                          {reg.whatsappNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={reg.paymentMethod === 'bKash' ? 'bg-pink-950 text-pink-400' : 'bg-orange-950 text-orange-400'}>
                          {reg.paymentMethod}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-400">{reg.trxId}</td>
                      <td className="p-3 font-display text-sm font-bold text-white">৳{reg.amount}</td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(reg.id, 'VERIFIED')}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
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
