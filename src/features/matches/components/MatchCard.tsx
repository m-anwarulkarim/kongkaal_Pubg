import { useState } from 'react'
import type { MatchItem } from '@/types/match'
import { Shield, Clock, ArrowRight, Trophy } from 'lucide-react'
import Image from '@/components/ui/Image'
import PrizeBreakdownModal from '@/components/PrizeBreakdownModal'

interface MatchCardProps {
  match: MatchItem
  onSelect: (match: MatchItem) => void
}

export default function MatchCard({ match, onSelect }: MatchCardProps) {
  const [prizeModalOpen, setPrizeModalOpen] = useState(false)

  const fillPercentage = Math.round((match.joinedSlots / match.maxSlots) * 100)

  const isSolo = match.mode === 'SOLO'
  const isDuo = match.mode === 'DUO'

  const btnBg = isSolo
    ? 'bg-[#e50914] hover:bg-red-600 text-white shadow-red-600/30'
    : isDuo
    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'

  const progressBg = isSolo
    ? 'bg-[#e50914]'
    : isDuo
    ? 'bg-blue-600'
    : 'bg-purple-600'

  return (
    <>
      <div className="kong-card overflow-hidden flex flex-col justify-between group bg-[#10131a] border border-white/10 rounded-2xl">
        {/* Image Banner Header */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={match.image}
            alt={match.title}
            fill
            className="group-hover:scale-105 transition-transform duration-500 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-transparent to-black/40 z-10" />

          {/* Date Badge Top Right */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-center border border-white/10 z-20">
            <span className="font-display text-lg font-black text-white block leading-none">
              {match.time.includes('7:00') ? '12' : match.time.includes('8:15') ? '13' : '14'}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
              SEP
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Map & Time Row */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold mb-3">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-red-500" /> Map: <strong className="text-gray-200">{match.map} / Asia</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#e50914]" /> Time: <strong className="text-gray-200">{match.time.includes('at') ? match.time.split('at')[1] : '10:00 PM'}</strong>
              </span>
            </div>

            {/* Prize Stats Main Bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#0b0d14] rounded-xl p-3 mb-3 text-left border border-white/5">
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Entry Fee</span>
                <span className="font-display text-xl font-black text-white">৳{match.entryFee}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Total Prize</span>
                <span className="font-display text-xl font-black text-emerald-400">৳{match.winnerPrize}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Per Kill</span>
                <span className="font-display text-xl font-black text-amber-400">৳{match.perKillPrize}</span>
              </div>
            </div>

            {/* 1st, 2nd, 3rd Place Prize Breakdown Badges & View Full Breakdown Button */}
            <button
              onClick={() => setPrizeModalOpen(true)}
              className="w-full text-left group/prize focus:outline-none mb-4 cursor-pointer"
            >
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center bg-white/5 group-hover/prize:bg-amber-950/40 p-2 rounded-xl border border-white/10 group-hover/prize:border-amber-500/40 transition-all">
                <div className="bg-amber-950/60 border border-amber-500/30 text-amber-300 py-1 px-1 rounded-lg">
                  🥇 1st: ৳{match.firstPrize || match.winnerPrize}
                </div>
                <div className="bg-slate-900 border border-slate-400/30 text-slate-300 py-1 px-1 rounded-lg">
                  🥈 2nd: ৳{match.secondPrize || Math.round(match.winnerPrize * 0.4)}
                </div>
                <div className="bg-amber-950/30 border border-amber-700/30 text-amber-500 py-1 px-1 rounded-lg">
                  🥉 3rd: ৳{match.thirdPrize || Math.round(match.winnerPrize * 0.2)}
                </div>
              </div>
              <div className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mt-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>View Full Prize Pool Breakdown (1st-9th Place) →</span>
              </div>
            </button>
          </div>

          {/* Progress Bar & Register Button */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-gray-400">{match.joinedSlots}/{match.maxSlots} Slots</span>
            </div>

            <div className="w-full h-2 bg-[#0b0d14] rounded-full overflow-hidden mb-4 border border-white/5">
              <div
                className={`h-full rounded-full ${progressBg}`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            <button
              onClick={() => onSelect(match)}
              className={`w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer ${btnBg}`}
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Prize Pool Poster Modal */}
      <PrizeBreakdownModal
        match={match}
        open={prizeModalOpen}
        onClose={() => setPrizeModalOpen(false)}
        onJoinClick={() => onSelect(match)}
      />
    </>
  )
}
