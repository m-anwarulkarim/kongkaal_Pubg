import { useState, useEffect, useRef } from 'react'
import ModeSelector, { type MatchFilterMode } from './ModeSelector'
import MatchCard from '@/features/matches/components/MatchCard'
import RightSidebar from './RightSidebar'
import type { MatchItem } from '@/types/match'
import { Trophy, Loader2, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { getMatches, DEFAULT_MATCHES } from '@/lib/db'

export const KONGKAAL_MATCHES: MatchItem[] = DEFAULT_MATCHES

interface TournamentGridSectionProps {
  onSelectMatch: (match: MatchItem) => void
}

export default function TournamentGridSection({ onSelectMatch }: TournamentGridSectionProps) {
  const [selectedMode, setSelectedMode] = useState<MatchFilterMode>('ALL')
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadTournamentMatches() {
      try {
        const data = await getMatches()
        setMatches(data)
      } catch (err) {
        console.error('Failed to load dynamic matches:', err)
        setMatches(DEFAULT_MATCHES)
      } finally {
        setLoading(false)
      }
    }
    loadTournamentMatches()
  }, [])

  const filteredMatches = selectedMode === 'ALL'
    ? matches
    : matches.filter((m) => m.mode === selectedMode)

  // Auto-Slide Timer Logic (3.5 seconds)
  useEffect(() => {
    if (loading || filteredMatches.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        // If near end, loop back to start
        if (scrollLeft + clientWidth >= scrollWidth - 30) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          sliderRef.current.scrollBy({ left: 310, behavior: 'smooth' })
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [loading, filteredMatches.length, isPaused])

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="tournaments" className="py-6">
      {/* 1. Solo / Duo / Squad / All Mode Selector */}
      <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

      {/* 2. Main Tournament Grid + Right Sidebar */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Upcoming Tournaments Auto Slider */}
          <div className="lg:col-span-8 min-w-0">
            {/* Header with Slider Navigation Controls & Auto Status */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-red-500" />
                <h3 className="font-display text-2xl font-bold text-white uppercase leading-none">
                  Upcoming Tournaments
                </h3>
                <span className="text-xs font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  {filteredMatches.length} Available
                </span>
              </div>

              {/* Slider Left/Right Scroll Arrows & Auto Indicator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-colors cursor-pointer ${
                    isPaused
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                  title={isPaused ? 'Resume Auto Slide' : 'Pause Auto Slide'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Paused</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span className="animate-pulse">Auto Slide</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => scrollSlider('left')}
                  className="p-2 rounded-xl bg-[#10131a] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Scroll Left"
                  aria-label="Previous tournaments"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  className="p-2 rounded-xl bg-[#10131a] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Scroll Right"
                  aria-label="Next tournaments"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-red-500 font-gaming flex items-center justify-center gap-2 bg-[#0e111a] rounded-2xl border border-white/10">
                <Loader2 className="w-5 h-5 animate-spin" />
                LOADING UPCOMING TOURNAMENTS...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-[#0e111a] rounded-2xl border border-white/10 space-y-2">
                <p className="font-bold text-white">No active {selectedMode === 'ALL' ? '' : selectedMode} tournaments found right now.</p>
                <p className="text-xs">Dashboard থেকে এডমিন নতুন ম্যাচ ক্রিয়েট করলে এখানে সরাসরি দেখতে পাবেন।</p>
              </div>
            ) : (
              /* Auto-Scrollable Slider Container (Pauses on mouse hover & touch) */
              <div
                ref={sliderRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                className="flex gap-4 overflow-x-auto scroll-smooth py-1 -mx-1 px-1 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredMatches.map((match) => (
                  <div key={match.id} className="w-[270px] sm:w-[290px] shrink-0">
                    <MatchCard match={match} onSelect={onSelectMatch} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Leaderboard & Top Players Sidebar */}
          <div className="lg:col-span-4 min-w-0">
            <RightSidebar />
          </div>

        </div>
      </div>
    </section>
  )
}
