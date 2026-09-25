import { useState, useEffect } from 'react'
import ModeSelector from './ModeSelector'
import MatchCard from '@/features/matches/components/MatchCard'
import RightSidebar from './RightSidebar'
import type { MatchItem } from '@/types/match'
import { Trophy, ArrowRight, Loader2 } from 'lucide-react'
import Link from '@/components/ui/Link'
import { getMatches, DEFAULT_MATCHES } from '@/lib/db'

export const KONGKAAL_MATCHES: MatchItem[] = DEFAULT_MATCHES

interface TournamentGridSectionProps {
  onSelectMatch: (match: MatchItem) => void
}

export default function TournamentGridSection({ onSelectMatch }: TournamentGridSectionProps) {
  const [selectedMode, setSelectedMode] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SOLO')
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const filteredMatches = matches.filter((m) => {
    return m.mode === selectedMode
  })

  return (
    <section id="tournaments" className="py-6">
      {/* 1. Solo / Duo / Squad Mode Selector */}
      <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

      {/* 2. Main Tournament Grid + Right Sidebar */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Upcoming Tournaments */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-red-500" />
                <h3 className="font-display text-2xl font-bold text-white uppercase leading-none">
                  Upcoming Tournaments
                </h3>
              </div>
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-white no-underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-red-500 font-gaming flex items-center justify-center gap-2 bg-[#0e111a] rounded-2xl border border-white/10">
                <Loader2 className="w-5 h-5 animate-spin" />
                LOADING UPCOMING TOURNAMENTS...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-[#0e111a] rounded-2xl border border-white/10 space-y-2">
                <p className="font-bold text-white">No active {selectedMode} tournaments found right now.</p>
                <p className="text-xs">Dashboard থেকে এডমিন নতুন ম্যাচ ক্রিয়েট করলে এখানে সরাসরি দেখতে পাবেন।</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Leaderboard & Top Players Sidebar */}
          <div className="lg:col-span-4">
            <RightSidebar />
          </div>

        </div>
      </div>
    </section>
  )
}

