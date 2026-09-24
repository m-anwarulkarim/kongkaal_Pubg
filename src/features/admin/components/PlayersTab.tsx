import type { RegistrationRecord } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PlayersTabProps {
  registrations: RegistrationRecord[]
  filteredRegistrations: RegistrationRecord[]
}

export default function PlayersTab({
  registrations,
  filteredRegistrations,
}: PlayersTabProps) {
  return (
    <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Registered Players Directory
          </h3>
          <span className="text-xs text-gray-400">All registered PUBG Mobile players & character IDs</span>
        </div>
        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1">
          {registrations.length} Players Registered
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Player IGN</th>
              <th className="p-3.5">Team Name</th>
              <th className="p-3.5">PUBG UID</th>
              <th className="p-3.5">WhatsApp Number</th>
              <th className="p-3.5">Payment Method</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {filteredRegistrations.map((reg) => (
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
    </Card>
  )
}
