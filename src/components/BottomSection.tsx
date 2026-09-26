import { useState, useEffect } from 'react'
import { Users, Trophy, Coins, Shield, Medal, MessageCircle, ArrowRight } from 'lucide-react'
import Link from '@/components/ui/Link'
import { getLeaderboard } from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

export default function BottomSection() {
  const [latestWinner, setLatestWinner] = useState<LeaderboardItem | null>(null)

  useEffect(() => {
    async function fetchWinner() {
      try {
        const winners = await getLeaderboard()
        if (winners && winners.length > 0) {
          setLatestWinner(winners[0])
        }
      } catch (err) {
        console.error('Failed to fetch latest winner:', err)
      }
    }
    fetchWinner()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. Left Stats Bar (4 columns on lg) */}
        <div className="md:col-span-2 lg:col-span-4 bg-[#10131a] p-4 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center items-center shadow-lg">
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">1,248+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Players</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">86+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Tournaments</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Coins className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">৳2,48,750+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Prize Pool</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">99%</div>
            <div className="text-[10px] text-gray-400 font-medium">Fair Play Rate</div>
          </div>
        </div>

        {/* 2. Middle Recent Winner Box (4 columns on lg) */}
        <div className="md:col-span-1 lg:col-span-4 bg-[#10131a] p-4 rounded-2xl border border-white/10 flex flex-col justify-between overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Trophy className="w-4 h-4 text-[#e50914]" /> Recent Winners
            </div>
            <a href="#leaderboard" className="text-[10px] font-bold text-gray-400 hover:text-white no-underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-[#0b0d14] p-3 rounded-xl border border-white/5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-red-500 shrink-0 bg-red-950 flex items-center justify-center shadow-md">
                {latestWinner?.avatarUrl ? (
                  <img src={latestWinner.avatarUrl} alt={latestWinner.playerIgn} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xs">{latestWinner?.playerIgn[0]?.toUpperCase() || 'W'}</span>
                )}
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-none truncate">
                    {latestWinner?.playerIgn || 'RIYAD_OP'}
                  </span>
                  <span className="font-bold text-[8px] text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30 shrink-0">
                    BD
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-1 truncate">
                  {latestWinner?.matchTitle || 'Solo Tournament'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 border-l sm:border-l border-white/10 pl-3 sm:pl-3 pt-0 sm:pt-0 w-auto">
              <span className="text-[10px] font-bold text-amber-400 flex items-center justify-end gap-1">
                <Medal className="w-3.5 h-3.5" /> {latestWinner?.kills || 8} KILLS
              </span>
              <span className="font-display text-base font-black text-red-500 block leading-tight">৳{latestWinner?.prizeWon || 500}</span>
            </div>
          </div>
        </div>

        {/* 3. Right WhatsApp Channel Banner (4 columns on lg) */}
        <div className="md:col-span-1 lg:col-span-4 bg-gradient-to-r from-[#e50914]/20 via-[#10131a] to-[#10131a] p-4 rounded-2xl border border-red-900/40 relative overflow-hidden flex items-center justify-between shadow-lg">
          
          <div className="relative z-10 max-w-[220px]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
              FOLLOW OUR
            </span>
            <h4 className="font-display text-lg font-black text-white uppercase leading-none mb-1">
              WhatsApp Channel
            </h4>
            <p className="text-[10px] text-gray-400 mb-3">
              Get latest updates, slots, results & more!
            </p>
            <Link
              href="https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K"
              className="btn-kong-red px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 no-underline shadow-md group"
            >
              <span>Join Now</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* WhatsApp Logo Backdrop */}
          <div className="w-14 h-14 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>

        </div>

      </div>
    </div>
  )
}

