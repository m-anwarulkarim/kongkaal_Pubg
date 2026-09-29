import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { MatchItem } from '@/types/match'
import { Shield, Clock, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react'
import Image from '@/components/ui/Image'
import PrizeBreakdownModal from '@/components/PrizeBreakdownModal'
import { getPrizeBreakdownSettings, isUserRegisteredForMatch } from '@/lib/db'
import { useCustomerAuth } from '@/lib/auth'

interface MatchCardProps {
  match: MatchItem
  onSelect: (match: MatchItem) => void
}

export default function MatchCard({ match, onSelect }: MatchCardProps) {
  const { user } = useCustomerAuth()
  const [prizeModalOpen, setPrizeModalOpen] = useState(false)
  const [globalBreakdownEnabled, setGlobalBreakdownEnabled] = useState(() => getPrizeBreakdownSettings().enableGlobalModal)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setGlobalBreakdownEnabled(getPrizeBreakdownSettings().enableGlobalModal)
    }
    window.addEventListener('prize_breakdown_settings_updated', handleUpdate)
    return () => window.removeEventListener('prize_breakdown_settings_updated', handleUpdate)
  }, [])

  useEffect(() => {
    const checkRegistration = () => {
      const email = user?.email || ''
      const uid = typeof window !== 'undefined' ? localStorage.getItem('pending_pubg_uid') || '' : ''
      setIsRegistered(isUserRegisteredForMatch(match.id, email, uid))
    }

    checkRegistration()
    window.addEventListener('registrations_updated', checkRegistration)
    return () => window.removeEventListener('registrations_updated', checkRegistration)
  }, [match.id, user])

  const isBreakdownAllowed = globalBreakdownEnabled && match.showPrizeBreakdown !== false


  // Dynamic Date formatting — prefers matchDate field, falls back to parsing time string
  let dayStr: string
  let monthStr: string

  if (match.matchDate) {
    const d = new Date(match.matchDate + 'T00:00:00') // parse YYYY-MM-DD without timezone shift
    dayStr = d.getDate().toString().padStart(2, '0')
    monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  } else {
    const dateMatch = match.time.match(/(\d{1,2})\s*([A-Za-z]{3})/i)
    const now = new Date()
    dayStr = dateMatch ? dateMatch[1] : now.getDate().toString()
    monthStr = dateMatch ? dateMatch[2].toUpperCase() : now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  }

  // Extract clean time portion (just "10:00 PM" even if time has date embedded)
  const cleanTime = match.time.includes(' at ') ? match.time.split(' at ')[1] : match.time

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

          {/* Date Badge Top Right & Status Badge Left */}
          {isRegistered && match.status !== 'COMPLETED' ? (
            <div className="absolute top-3 left-3 bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>REGISTERED ✅</span>
            </div>
          ) : match.status === 'COMPLETED' ? (
            <div className="absolute top-3 left-3 bg-emerald-700/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>COMPLETED ✅</span>
            </div>
          ) : match.status === 'CLOSED' || match.joinedSlots >= match.maxSlots ? (
            <div className="absolute top-3 left-3 bg-rose-900/90 text-rose-200 border border-rose-500/50 backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>SLOTS FULL / CLOSED 🛑</span>
            </div>
          ) : match.status === 'COMING_SOON' ? (
            <div className="absolute top-3 left-3 bg-amber-500/90 text-black backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>COMING SOON ⏳</span>
            </div>
          ) : match.status === 'FILLING_FAST' ? (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1 animate-pulse">
              <span>FILLING FAST 🔥</span>
            </div>
          ) : match.status === 'LIVE_SOON' ? (
            <div className="absolute top-3 left-3 bg-cyan-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>LIVE SOON ⚡</span>
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-emerald-500/90 text-black backdrop-blur-md px-2.5 py-1 rounded-xl font-gaming text-[10px] font-black uppercase tracking-wider z-20 shadow-lg flex items-center gap-1">
              <span>OPEN 🟢</span>
            </div>
          )}

          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-center border border-white/10 z-20">
            <span className="font-display text-lg font-black text-white block leading-none">
              {dayStr}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
              {monthStr}
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
                <Clock className="w-3.5 h-3.5 text-[#e50914]" /> Time: <strong className="text-gray-200">{cleanTime}</strong>
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
            {isBreakdownAllowed ? (
              <button
                onClick={() => setPrizeModalOpen(true)}
                className="w-full text-left group/prize focus:outline-none mb-4 cursor-pointer"
              >
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center bg-white/5 group-hover/prize:bg-amber-950/40 p-2 rounded-xl border border-white/10 group-hover/prize:border-amber-500/40 transition-all">
                  <div className="bg-amber-950/60 border border-amber-500/30 text-amber-300 py-1 px-1 rounded-lg">
                    🥇 1st: ৳{match.firstPrize !== undefined && match.firstPrize !== null ? match.firstPrize : match.winnerPrize}
                  </div>
                  <div className="bg-slate-900 border border-slate-400/30 text-slate-300 py-1 px-1 rounded-lg">
                    🥈 2nd: ৳{match.secondPrize || 0}
                  </div>
                  <div className="bg-amber-950/30 border border-amber-700/30 text-amber-500 py-1 px-1 rounded-lg">
                    🥉 3rd: ৳{match.thirdPrize || 0}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mt-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>View Full Prize Pool Breakdown (1st-9th Place) →</span>
                </div>
              </button>
            ) : (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="bg-amber-950/60 border border-amber-500/30 text-amber-300 py-1 px-1 rounded-lg">
                    🥇 1st: ৳{match.firstPrize !== undefined && match.firstPrize !== null ? match.firstPrize : match.winnerPrize}
                  </div>
                  <div className="bg-slate-900 border border-slate-400/30 text-slate-300 py-1 px-1 rounded-lg">
                    🥈 2nd: ৳{match.secondPrize || 0}
                  </div>
                  <div className="bg-amber-950/30 border border-amber-700/30 text-amber-500 py-1 px-1 rounded-lg">
                    🥉 3rd: ৳{match.thirdPrize || 0}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar & Status Action Button */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-gray-400">{match.joinedSlots}/{match.maxSlots} Slots</span>
              {match.status === 'COMING_SOON' && (
                <span className="text-amber-400 font-bold text-[11px]">Coming Soon ⏳</span>
              )}
              {match.status === 'FILLING_FAST' && (
                <span className="text-red-400 font-bold text-[11px] animate-pulse">Filling Fast 🔥</span>
              )}
              {match.status === 'LIVE_SOON' && (
                <span className="text-cyan-400 font-bold text-[11px]">Starting Soon ⚡</span>
              )}
              {match.status === 'COMPLETED' && (
                <span className="text-emerald-400 font-bold text-[11px]">Completed ✅</span>
              )}
              {(match.status === 'CLOSED' || match.joinedSlots >= match.maxSlots) && (
                <span className="text-rose-400 font-bold text-[11px]">Closed / Full 🛑</span>
              )}
              {match.status === 'OPEN' && match.joinedSlots < match.maxSlots && (
                <span className="text-emerald-400 font-bold text-[11px]">Open 🟢</span>
              )}
            </div>

            <div className="w-full h-2 bg-[#0b0d14] rounded-full overflow-hidden mb-4 border border-white/5">
              <div
                className={`h-full rounded-full ${
                  match.status === 'COMING_SOON'
                    ? 'bg-amber-500'
                    : match.status === 'FILLING_FAST'
                    ? 'bg-gradient-to-r from-red-600 to-amber-500'
                    : match.status === 'LIVE_SOON'
                    ? 'bg-cyan-500'
                    : match.status === 'COMPLETED'
                    ? 'bg-emerald-600'
                    : match.status === 'CLOSED' || match.joinedSlots >= match.maxSlots
                    ? 'bg-rose-600'
                    : progressBg
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            {isRegistered && match.status !== 'COMPLETED' ? (
              <button
                onClick={() => toast.info('আপনি ইতিমধ্যে এই টুর্নামেন্টে রেজিস্টার করেছেন! (Already Registered)')}
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:bg-emerald-900 transition-all cursor-pointer"
              >
                <span>ALREADY REGISTERED ✅</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            ) : match.status === 'COMPLETED' ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-lg cursor-not-allowed select-none opacity-80"
              >
                <span>MATCH COMPLETED ✅</span>
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : match.status === 'CLOSED' || match.joinedSlots >= match.maxSlots ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-rose-950/40 text-rose-300 border border-rose-500/30 shadow-lg cursor-not-allowed select-none opacity-80"
              >
                <span>REGISTRATION CLOSED 🛑</span>
              </button>
            ) : match.status === 'COMING_SOON' ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10 cursor-not-allowed select-none"
              >
                <span>COMING SOON</span>
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </button>
            ) : match.status === 'LIVE_SOON' ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 cursor-not-allowed select-none"
              >
                <span>MATCH STARTING SOON</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </button>
            ) : match.status === 'FILLING_FAST' ? (
              <button
                onClick={() => onSelect(match)}
                className="w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer animate-pulse"
              >
                <span>FILLING FAST - REGISTER NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onSelect(match)}
                className={`w-full py-2.5 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer ${btnBg}`}
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Prize Pool Poster Modal */}
      {isBreakdownAllowed && (
        <PrizeBreakdownModal
          match={match}
          open={prizeModalOpen}
          onClose={() => setPrizeModalOpen(false)}
          onJoinClick={() => onSelect(match)}
        />
      )}
    </>
  )
}

