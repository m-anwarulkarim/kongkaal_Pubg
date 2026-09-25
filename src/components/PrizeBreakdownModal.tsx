import type { MatchItem } from '@/types/match'
import { Trophy, Skull, Flame, ArrowRight } from 'lucide-react'

interface PrizeBreakdownModalProps {
  match: MatchItem | null
  open: boolean
  onClose: () => void
  onJoinClick?: () => void
}

export default function PrizeBreakdownModal({
  match,
  open,
  onClose,
  onJoinClick,
}: PrizeBreakdownModalProps) {
  if (!open || !match) return null

  const firstPrize = match.firstPrize || match.winnerPrize || 500
  const secondPrize = match.secondPrize || Math.round(firstPrize * 0.4) || 200
  const thirdPrize = match.thirdPrize || Math.round(firstPrize * 0.2) || 100
  const defaultFourthToNinth = Math.round(firstPrize * 0.05) || 25

  const rankPrizesList = match.rankPrizes && match.rankPrizes.length > 0
    ? match.rankPrizes
    : [
        { rank: '4th Place', amount: defaultFourthToNinth },
        { rank: '5th Place', amount: defaultFourthToNinth },
        { rank: '6th Place', amount: defaultFourthToNinth },
        { rank: '7th Place', amount: defaultFourthToNinth },
        { rank: '8th Place', amount: defaultFourthToNinth },
        { rank: '9th Place', amount: defaultFourthToNinth },
      ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0c13] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.25)]">
        
        {/* Top Header Banner matching the Poster */}
        <div className="relative p-6 bg-gradient-to-b from-red-950 via-[#18111e] to-[#0a0c13] border-b border-amber-500/30 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>

          {/* KongKaaL Crown Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-red-500 uppercase mb-1">
            <Flame className="w-4 h-4 text-red-500" />
            <span>KONGKAAL GAMING OFFICIAL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-wider text-amber-400 uppercase drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
            {match.title}
          </h2>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">
            <span>ONE PLAYER</span>
            <span>•</span>
            <span>ONE DREAM</span>
            <span>•</span>
            <span className="text-amber-400">CHICKEN DINNER 🐔</span>
          </div>

          {/* Entry Fee Red Banner Badge */}
          <div className="mt-4 inline-flex items-center justify-center bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white font-black px-6 py-2 rounded-2xl shadow-lg border border-red-500/50">
            <span className="text-xs tracking-wider uppercase font-gaming mr-2">ENTRY FEE:</span>
            <span className="font-display text-2xl text-amber-300 drop-shadow">{match.entryFee} ৳</span>
          </div>
        </div>

        {/* Prize Pool Breakdown Box (Poster Style) */}
        <div className="p-6 space-y-4">
          
          <div className="flex items-center justify-center gap-2 text-center">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-display text-xl font-black text-amber-400 uppercase tracking-widest">
              PRIZE POOL BREAKDOWN
            </span>
          </div>

          {/* Golden Bordered Table */}
          <div className="bg-[#0e111a] border-2 border-amber-500/40 rounded-2xl p-3 space-y-1.5 font-sans shadow-inner">
            
            {/* Per Kill */}
            <div className="flex justify-between items-center bg-black/60 px-4 py-2.5 rounded-xl border border-white/5 text-xs font-bold text-white">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-500" />
                <span>Per Kill</span>
              </div>
              <span className="font-display text-base text-amber-400 font-black">{match.perKillPrize} টাকা</span>
            </div>

            {/* 1st Place Chicken */}
            <div className="flex justify-between items-center bg-gradient-to-r from-amber-950/60 to-black px-4 py-2.5 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-300 shadow-md">
              <div className="flex items-center gap-2">
                <Trophy className="w-4.5 h-4.5 text-amber-400" />
                <span>1st Place Chicken 🐔</span>
              </div>
              <span className="font-display text-lg text-amber-400 font-black">{firstPrize} টাকা</span>
            </div>

            {/* 2nd Place */}
            <div className="flex justify-between items-center bg-black/60 px-4 py-2 rounded-xl border border-white/5 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-black">🥈</span>
                <span>2nd Place</span>
              </div>
              <span className="font-display text-base text-slate-300 font-black">{secondPrize} টাকা</span>
            </div>

            {/* 3rd Place */}
            <div className="flex justify-between items-center bg-black/60 px-4 py-2 rounded-xl border border-white/5 text-xs font-bold text-amber-600">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-black">🥉</span>
                <span>3rd Place</span>
              </div>
              <span className="font-display text-base text-amber-500 font-black">{thirdPrize} টাকা</span>
            </div>

            {/* 4th - 9th Place Ranks */}
            {rankPrizesList.map((rp) => (
              <div key={rp.rank} className="flex justify-between items-center bg-black/40 px-4 py-1.5 rounded-lg text-[11px] text-gray-400 font-semibold border border-white/5">
                <span>{rp.rank}</span>
                <span className="font-display text-xs text-amber-400 font-bold">{rp.amount} টাকা</span>
              </div>
            ))}

          </div>

          {/* Action Join Button */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                onClose()
                if (onJoinClick) onJoinClick()
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase font-gaming flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <span>JOIN TOURNAMENT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
