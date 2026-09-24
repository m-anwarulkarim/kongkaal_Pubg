import { useState } from 'react'

export type MatchItem = {
  id: string
  title: string
  mode: 'SOLO' | 'DUO' | 'SQUAD'
  map: 'Erangel' | 'Miramar' | 'Sanhok' | 'Livik'
  time: string
  entryFee: number
  winnerPrize: number
  perKillPrize: number
  joinedSlots: number
  maxSlots: number
  image: string
  status: 'OPEN' | 'FILLING_FAST' | 'LIVE_SOON'
}

export const MATCHES_DATA: MatchItem[] = [
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

interface MatchSelectionProps {
  onSelectMatch: (match: MatchItem) => void
}

export default function MatchSelection({ onSelectMatch }: MatchSelectionProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SOLO' | 'DUO' | 'SQUAD'>('ALL')

  const filteredMatches = MATCHES_DATA.filter((m) => {
    if (activeTab === 'ALL') return true
    return m.mode === activeTab
  })

  return (
    <section id="matches" className="py-16 bg-[#080b10] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
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

        {/* Tab Filters */}
        <div id="modes" className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0e1420] border border-amber-500/30 shadow-xl max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-5 py-2.5 rounded-xl font-gaming text-sm font-extrabold uppercase transition-all whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔥 ALL MATCHES ({MATCHES_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('SOLO')}
              className={`px-5 py-2.5 rounded-xl font-gaming text-sm font-extrabold uppercase transition-all whitespace-nowrap ${
                activeTab === 'SOLO'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👤 SOLO (1v1)
            </button>
            <button
              onClick={() => setActiveTab('DUO')}
              className={`px-5 py-2.5 rounded-xl font-gaming text-sm font-extrabold uppercase transition-all whitespace-nowrap ${
                activeTab === 'DUO'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👥 DUO (2v2)
            </button>
            <button
              onClick={() => setActiveTab('SQUAD')}
              className={`px-5 py-2.5 rounded-xl font-gaming text-sm font-extrabold uppercase transition-all whitespace-nowrap ${
                activeTab === 'SQUAD'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🛡️ SQUAD (4v4)
            </button>
          </div>
        </div>

        {/* Match Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const fillPercentage = Math.round((match.joinedSlots / match.maxSlots) * 100)

            return (
              <div
                key={match.id}
                className="pubg-card overflow-hidden flex flex-col justify-between group relative"
              >
                {/* Header Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={match.image}
                    alt={match.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1420] via-transparent to-black/40" />

                  {/* Mode Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-md font-gaming text-xs font-black tracking-wider uppercase shadow-md ${
                        match.mode === 'SOLO'
                          ? 'bg-blue-600 text-white'
                          : match.mode === 'DUO'
                          ? 'bg-purple-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {match.mode} MODE
                    </span>
                  </div>

                  {/* Map Tag */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-md text-gray-200 text-xs font-bold uppercase">
                    🗺️ {match.map}
                  </div>

                  {/* Status Indicator */}
                  {match.status === 'FILLING_FAST' && (
                    <div className="absolute bottom-3 left-3 bg-amber-500 text-black px-2.5 py-0.5 rounded text-[11px] font-black uppercase shadow-lg animate-pulse">
                      ⚡ FILLING FAST
                    </div>
                  )}
                  {match.status === 'LIVE_SOON' && (
                    <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded text-[11px] font-black uppercase shadow-lg">
                      🔴 STARTS SOON
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                      <span>⏰ {match.time}</span>
                    </div>

                    <h3 className="font-gaming text-xl font-bold text-white mb-4 line-clamp-2">
                      {match.title}
                    </h3>

                    {/* Prize & Fee Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[#0b0e14] border border-gray-800 rounded-xl p-3 mb-4 text-center">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">ENTRY FEE</span>
                        <span className="font-display text-lg font-bold text-white">৳{match.entryFee}</span>
                      </div>
                      <div className="border-x border-gray-800">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">CHICKEN DINNER</span>
                        <span className="font-display text-lg font-bold text-amber-400">৳{match.winnerPrize}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">PER KILL</span>
                        <span className="font-display text-lg font-bold text-green-400">৳{match.perKillPrize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Book Button */}
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400">SLOTS JOINED</span>
                        <span className="text-amber-400">
                          {match.joinedSlots} / {match.maxSlots} ({fillPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                        <div
                          className={`h-full rounded-full ${
                            fillPercentage > 80
                              ? 'bg-gradient-to-r from-orange-500 to-red-500'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectMatch(match)}
                      className="w-full pubg-btn-primary py-3 rounded-xl font-gaming text-sm font-extrabold flex items-center justify-center gap-2"
                    >
                      <span>💳 PAY ৳{match.entryFee} & BOOK SLOT</span>
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
