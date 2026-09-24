import { useState } from 'react'
import ModeSelector from './ModeSelector'
import MatchCard from '@/features/matches/components/MatchCard'
import RightSidebar from './RightSidebar'
import type { MatchItem } from '@/types/match'

export const KONGKAAL_MATCHES: MatchItem[] = [
  {
    id: 'solo-12sep',
    title: 'SOLO BATTLE',
    mode: 'SOLO',
    map: 'Erangel',
    time: '10:00 PM',
    entryFee: 50,
    winnerPrize: 2000,
    perKillPrize: 10,
    joinedSlots: 24,
    maxSlots: 100,
    image: '/solo_battle.jpg',
    status: 'OPEN',
  },
  {
    id: 'duo-13sep',
    title: 'DUO BATTLE',
    mode: 'DUO',
    map: 'Erangel',
    time: '10:00 PM',
    entryFee: 100,
    winnerPrize: 5000,
    perKillPrize: 20,
    joinedSlots: 18,
    maxSlots: 50,
    image: '/duo_battle.jpg',
    status: 'OPEN',
  },
  {
    id: 'squad-14sep',
    title: 'SQUAD SHOWDOWN',
    mode: 'SQUAD',
    map: 'Livik',
    time: '09:00 PM',
    entryFee: 200,
    winnerPrize: 10000,
    perKillPrize: 30,
    joinedSlots: 12,
    maxSlots: 50,
    image: '/squad_showdown.jpg',
    status: 'OPEN',
  },
]

interface TournamentGridSectionProps {
  onSelectMatch: (match: MatchItem) => void
}

export default function TournamentGridSection({ onSelectMatch }: TournamentGridSectionProps) {
  const [selectedMode, setSelectedMode] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SOLO')

  const filteredMatches = KONGKAAL_MATCHES.filter((m) => {
    return m.mode === selectedMode || selectedMode === 'SOLO'
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
                <span className="text-red-500 text-lg">🏆</span>
                <h3 className="font-display text-2xl font-bold text-white uppercase leading-none">
                  Upcoming Tournaments
                </h3>
              </div>
              <a href="#" className="text-xs font-bold text-gray-400 hover:text-white no-underline">
                View All ➔
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />
              ))}
            </div>
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
