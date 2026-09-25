import { useState, useEffect } from 'react'
import { Swords, CheckCircle2, Trophy } from 'lucide-react'
import { getLeaderboard } from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

export default function Leaderboard() {
  const [winners, setWinners] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaderboard()
        setWinners(data)
      } catch (err) {
        console.error('Failed to load leaderboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <section id="leaderboard" className="py-16 bg-[#0c1017] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            HALL OF FAME & PAYOUT HISTORY
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400" /> RECENT <span className="text-amber-400">CHAMPIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            আমাদের আগের ম্যাচগুলোর বিজয়ী এবং বিকাশ/নগদে ক্যাশ প্রাইজ বুঝে নেওয়া প্লেয়ারদের তালিকা।
          </p>
        </div>

        <div className="pubg-card overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-amber-400 font-gaming animate-pulse">
                LOADING CHAMPIONS DATA...
              </div>
            ) : winners.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No leaderboard entries found yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#0b0e14] font-gaming text-xs uppercase tracking-wider text-amber-400 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">MATCH TITLE</th>
                    <th className="px-6 py-4">WINNER / TEAM</th>
                    <th className="px-6 py-4">TOTAL KILLS</th>
                    <th className="px-6 py-4">CASH PRIZE WON</th>
                    <th className="px-6 py-4">PAYMENT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {winners.map((win) => (
                    <tr key={win.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-6 py-4 text-white font-bold">{win.matchTitle}</td>
                      <td className="px-6 py-4">
                        <span className="text-amber-400 font-bold block">{win.teamName}</span>
                        <span className="text-xs text-gray-400">IGN: {win.playerIgn}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-gray-800 text-white font-bold text-xs inline-flex items-center gap-1.5 border border-amber-500/20">
                          <Swords className="w-3.5 h-3.5 text-amber-400" />
                          <span>{win.kills} KILLS</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-display text-xl font-bold text-green-400">
                        ৳{win.prizeWon.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5 ${
                          win.status === 'VERIFIED PAYOUT'
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                            : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{win.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

