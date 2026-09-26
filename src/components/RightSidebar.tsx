import { useState, useEffect } from 'react'
import { Crown, Trophy, ArrowRight } from 'lucide-react'
import Link from '@/components/ui/Link'
import { getLeaderboard, INITIAL_LEADERBOARD } from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

export default function RightSidebar() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaderboard()
        if (data && data.length > 0) {
          setLeaderboardData(data.slice(0, 5))
        } else {
          setLeaderboardData(INITIAL_LEADERBOARD.slice(0, 5))
        }
      } catch (err) {
        console.error('Failed to load leaderboard in sidebar:', err)
        setLeaderboardData(INITIAL_LEADERBOARD.slice(0, 5))
      }
    }
    loadData()

    const handleUpdate = () => {
      loadData()
    }

    window.addEventListener('leaderboard_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('leaderboard_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return (
    <aside className="space-y-6">
      
      {/* 1. Leaderboard Table Widget */}
      <div id="leaderboard" className="kong-card bg-[#10131a] p-5 rounded-2xl border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-display text-xl font-bold text-white uppercase leading-none">
              Leaderboard
            </h3>
          </div>
          <Link href="#" className="text-[11px] font-bold text-gray-400 hover:text-white no-underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-white/5 font-semibold text-[10px] uppercase">
                <th className="pb-2">#</th>
                <th className="pb-2">Player</th>
                <th className="pb-2 text-center">Kills</th>
                <th className="pb-2 text-right">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {leaderboardData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500 text-black'
                          : idx === 1
                          ? 'bg-gray-300 text-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-[#181c28] text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20 bg-red-950 flex items-center justify-center">
                        {row.avatarUrl ? (
                          <img src={row.avatarUrl} alt={row.playerIgn} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-white">{row.playerIgn[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-white tracking-wide flex items-center gap-1">
                        <span className="font-bold text-[9px] text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">BD</span> {row.playerIgn}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center text-gray-300">{row.kills}</td>
                  <td className="py-2.5 text-right font-display text-sm font-black text-[#e50914]">
                    ৳{row.prizeWon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 2. Top Players Avatars Widget */}
      <div id="players" className="kong-card bg-[#10131a] p-5 rounded-2xl border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-xl font-bold text-white uppercase leading-none">
              Top Players
            </h3>
          </div>
          <Link href="#" className="text-[11px] font-bold text-gray-400 hover:text-white no-underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Player Avatars Row */}
        <div className="grid grid-cols-5 gap-2 text-center">
          {leaderboardData.map((player, idx) => (
            <div key={player.id || idx} className="flex flex-col items-center">
              <div className="relative mb-1">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 p-0.5 shadow-md bg-red-950 flex items-center justify-center">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={player.playerIgn} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-xs">{player.playerIgn[0]?.toUpperCase()}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold text-white truncate max-w-[50px]">
                {player.playerIgn}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">
                {player.kills} Kills
              </span>
            </div>
          ))}
        </div>

      </div>

    </aside>
  )
}
