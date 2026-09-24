import type { MatchItem } from '@/types/match'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'

interface MatchesTabProps {
  matches: MatchItem[]
  setNewMatchOpen: (open: boolean) => void
  handleDeleteMatch: (id: string) => void
}

export default function MatchesTab({
  matches,
  setNewMatchOpen,
  handleDeleteMatch,
}: MatchesTabProps) {
  return (
    <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Tournament Matches
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Create, edit and manage PUBG Mobile Solo, Duo & Squad matches
          </span>
        </div>
        <Button
          onClick={() => setNewMatchOpen(true)}
          className="btn-kong-red font-gaming text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Match
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5">Map</th>
              <th className="p-3.5">Time</th>
              <th className="p-3.5">Entry Fee</th>
              <th className="p-3.5">Prize Pool</th>
              <th className="p-3.5">Per Kill</th>
              <th className="p-3.5">Slots</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3.5 font-bold text-white text-sm">{m.title}</td>
                <td className="p-3.5">
                  <Badge className={m.mode === 'SOLO' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'}>
                    {m.mode}
                  </Badge>
                </td>
                <td className="p-3.5 text-gray-300">{m.map}</td>
                <td className="p-3.5 text-gray-300 font-bold">{m.time}</td>
                <td className="p-3.5 font-bold text-white">৳{m.entryFee}</td>
                <td className="p-3.5 font-bold text-emerald-400">৳{m.winnerPrize}</td>
                <td className="p-3.5 font-bold text-gray-300">৳{m.perKillPrize}</td>
                <td className="p-3.5 text-amber-400 font-bold">
                  {m.joinedSlots}/{m.maxSlots}
                </td>
                <td className="p-3.5 text-right">
                  <Button
                    onClick={() => handleDeleteMatch(m.id)}
                    size="sm"
                    variant="outline"
                    className="bg-red-950 text-red-400 border-red-800 hover:bg-red-900 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
