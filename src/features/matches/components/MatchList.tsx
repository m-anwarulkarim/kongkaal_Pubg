import { useState } from 'react'
import type { MatchItem } from '@/types/match'
import MatchCard from './MatchCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const MOCK_MATCHES: MatchItem[] = [
  {
    id: 'solo-101',
    title: 'PUBG Mobile Solo Erangel Showdown #101',
    mode: 'SOLO',
    map: 'Erangel',
    time: 'Tonight at 7:00 PM',
    entryFee: 50,
    winnerPrize: 1500,
    perKillPrize: 20,
    joinedSlots: 88,
    maxSlots: 100,
    image: '/solo_match.jpg',
    status: 'FILLING_FAST',
  },
  {
    id: 'duo-204',
    title: 'PUBG Mobile Duo Miramar Tactical Clash #204',
    mode: 'DUO',
    map: 'Miramar',
    time: 'Tonight at 8:15 PM',
    entryFee: 100,
    winnerPrize: 3000,
    perKillPrize: 40,
    joinedSlots: 38,
    maxSlots: 50,
    image: '/squad_match.jpg',
    status: 'OPEN',
  },
  {
    id: 'squad-309',
    title: 'PUBG Mobile Squad Grand Championship #309',
    mode: 'SQUAD',
    map: 'Erangel',
    time: 'Tonight at 9:00 PM',
    entryFee: 200,
    winnerPrize: 6000,
    perKillPrize: 80,
    joinedSlots: 18,
    maxSlots: 25,
    image: '/hero_banner.jpg',
    status: 'LIVE_SOON',
  },
  {
    id: 'solo-102',
    title: 'PUBG Mobile Solo Livik Quick Rush #102',
    mode: 'SOLO',
    map: 'Livik',
    time: 'Tomorrow at 4:30 PM',
    entryFee: 40,
    winnerPrize: 1000,
    perKillPrize: 15,
    joinedSlots: 45,
    maxSlots: 100,
    image: '/solo_match.jpg',
    status: 'OPEN',
  },
  {
    id: 'duo-205',
    title: 'PUBG Mobile Duo Sanhok Jungle Warfare #205',
    mode: 'DUO',
    map: 'Sanhok',
    time: 'Tomorrow at 6:30 PM',
    entryFee: 120,
    winnerPrize: 3500,
    perKillPrize: 50,
    joinedSlots: 22,
    maxSlots: 50,
    image: '/squad_match.jpg',
    status: 'OPEN',
  },
  {
    id: 'squad-310',
    title: 'PUBG Mobile Squad Pro League Season 4 #310',
    mode: 'SQUAD',
    map: 'Erangel',
    time: 'Tomorrow at 9:30 PM',
    entryFee: 250,
    winnerPrize: 8000,
    perKillPrize: 100,
    joinedSlots: 10,
    maxSlots: 25,
    image: '/hero_banner.jpg',
    status: 'OPEN',
  },
]

interface MatchListProps {
  onSelectMatch: (match: MatchItem) => void
}

export default function MatchList({ onSelectMatch }: MatchListProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const filteredMatches = MOCK_MATCHES.filter((m) => {
    if (activeTab === 'ALL') return true
    return m.mode === activeTab
  })

  return (
    <section id="matches" className="py-16 bg-[#080b10] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            UPCOMING CUSTOM ROOM MATCHES
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            SELECT YOUR <span className="text-amber-400">BATTLEGROUND</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            আপনার পছন্দের ম্যাচ এবং গেম মোড (Solo, Duo, Squad) বাছাই করে এখনই স্লট বুক করে রাখুন।
          </p>
        </div>

        {/* Shadcn UI Tabs Filter */}
        <div id="modes" className="flex justify-center mb-10">
          <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-[#0e1420] border border-amber-500/30 p-1 rounded-2xl h-auto">
              <TabsTrigger
                value="ALL"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-gaming font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase"
              >
                🔥 ALL MATCHES ({MOCK_MATCHES.length})
              </TabsTrigger>
              <TabsTrigger
                value="SOLO"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-gaming font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase"
              >
                👤 SOLO (1v1)
              </TabsTrigger>
              <TabsTrigger
                value="DUO"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-gaming font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase"
              >
                👥 DUO (2v2)
              </TabsTrigger>
              <TabsTrigger
                value="SQUAD"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-gaming font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase"
              >
                🛡️ SQUAD (4v4)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Match Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />
          ))}
        </div>

      </div>
    </section>
  )
}
