import { useState, useEffect } from 'react'
import { Swords, CheckCircle2, Trophy, Crown, Flame, Coins, Pin } from 'lucide-react'
import { getLeaderboard } from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

export default function Leaderboard() {
  const [winners, setWinners] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'ALL' | 'MOST_KILLS' | 'TOP_PRIZE'>('ALL')

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

  const displayWinners = [...winners].sort((a, b) => {
    if (sortBy === 'MOST_KILLS') {
      return b.kills - a.kills
    }
    if (sortBy === 'TOP_PRIZE') {
      return b.prizeWon - a.prizeWon
    }
    const posA = a.pinnedPosition || (a.isPinned ? 1 : 999)
    const posB = b.pinnedPosition || (b.isPinned ? 1 : 999)
    if (posA !== posB) {
      return posA - posB
    }
    return b.kills - a.kills
  })

  return (
    <section id="leaderboard" className="py-16 bg-[#0c1017] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block">
            HALL OF FAME & PAYOUT HISTORY
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400" /> TOP <span className="text-amber-400">PLAYERS & CHAMPIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            আমাদের আগের টুর্নামেন্টগুলোর সর্বোচ্চ কিলদাতা ও ক্যাশ প্রাইজ বিজয়ী সেরা প্লেয়ারদের রিয়েল-টাইম তালিকা।
          </p>
        </div>

        {/* Filter & Sort Mode Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setSortBy('ALL')}
            className={`px-5 py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              sortBy === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-[#101422] border border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> All Champions (সকল বিজয়ী)
          </button>

          <button
            onClick={() => setSortBy('MOST_KILLS')}
            className={`px-5 py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              sortBy === 'MOST_KILLS'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-105'
                : 'bg-[#101422] border border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-red-400" /> সবচেয়ে বেশি কিল (Most Kills)
          </button>

          <button
            onClick={() => setSortBy('TOP_PRIZE')}
            className={`px-5 py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              sortBy === 'TOP_PRIZE'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'bg-[#101422] border border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" /> সর্বোচ্চ প্রাইজ (Highest Prize)
          </button>
        </div>

        {/* Leaderboard Table Card */}
        <div className="pubg-card overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-amber-400 font-gaming animate-pulse">
                LOADING CHAMPIONS DATA...
              </div>
            ) : displayWinners.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No leaderboard entries found yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#0b0e14] font-gaming text-xs uppercase tracking-wider text-amber-400 border-b border-gray-800">
                  <tr>
                    <th className="px-5 py-4 text-center">RANK</th>
                    <th className="px-6 py-4">CHAMPION PROFILE</th>
                    <th className="px-6 py-4">MATCH TITLE</th>
                    <th className="px-6 py-4">TEAM / TITLE</th>
                    <th className="px-6 py-4">TOTAL KILLS</th>
                    <th className="px-6 py-4">CASH PRIZE WON</th>
                    <th className="px-6 py-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {displayWinners.map((win, idx) => {
                    const rankNum = idx + 1
                    return (
                      <tr
                        key={win.id}
                        className={`transition-colors ${
                          rankNum === 1
                            ? 'bg-amber-500/10 hover:bg-amber-500/15'
                            : rankNum === 2
                            ? 'bg-slate-400/5 hover:bg-slate-400/10'
                            : rankNum === 3
                            ? 'bg-amber-900/10 hover:bg-amber-900/15'
                            : 'hover:bg-amber-500/5'
                        }`}
                      >
                        {/* Numerical Rank Badge */}
                        <td className="px-5 py-4 text-center">
                          {rankNum === 1 ? (
                            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-amber-500/40 ring-2 ring-amber-300">
                              <Crown className="w-5 h-5 fill-black" />
                            </span>
                          ) : rankNum === 2 ? (
                            <span className="w-8 h-8 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center mx-auto shadow border border-white/40">
                              #2
                            </span>
                          ) : rankNum === 3 ? (
                            <span className="w-8 h-8 rounded-full bg-amber-800 text-amber-100 font-black text-xs flex items-center justify-center mx-auto shadow border border-amber-600">
                              #3
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-black/40 border border-white/10 text-gray-400 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* Player Profile Picture & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0 w-11 h-11 min-w-[44px] min-h-[44px]">
                              {win.avatarUrl ? (
                                <img
                                  src={win.avatarUrl}
                                  alt={win.playerIgn}
                                  className={`w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 rounded-full object-cover shadow-md ${
                                    rankNum === 1 ? 'border-2 border-amber-400 shadow-amber-500/30 ring-2 ring-amber-500/20' : 'border border-amber-500/40'
                                  }`}
                                />
                              ) : (
                                <div className="w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-lg">
                                  {win.playerIgn[0]?.toUpperCase()}
                                </div>
                              )}

                              {win.isPinned && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow" title="Pinned Featured Winner">
                                  <Pin className="w-2.5 h-2.5 fill-black" />
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="text-white font-bold text-base block leading-snug">{win.playerIgn}</span>
                              {win.pubgUid && (
                                <span className="text-xs text-gray-400 font-mono block">UID: {win.pubgUid}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-white font-bold">{win.matchTitle}</td>
                        <td className="px-6 py-4">
                          <span className="text-amber-400 font-bold block">{win.teamName}</span>
                          <span className="text-[10px] text-amber-500/80 font-mono uppercase">{win.rank || 'CHAMPION'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded bg-black/50 text-white font-bold text-xs inline-flex items-center gap-1.5 border border-amber-500/30">
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
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

