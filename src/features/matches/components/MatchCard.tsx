import type { MatchItem } from '@/types/match'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MatchCardProps {
  match: MatchItem
  onSelect: (match: MatchItem) => void
}

export default function MatchCard({ match, onSelect }: MatchCardProps) {
  const fillPercentage = Math.round((match.joinedSlots / match.maxSlots) * 100)

  return (
    <Card className="pubg-card overflow-hidden flex flex-col justify-between group border-amber-500/20 bg-[#0e1420]/90">
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={match.image}
          alt={match.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1420] via-transparent to-black/50" />

        {/* Mode Badge using Shadcn Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={`font-gaming text-xs font-black uppercase shadow-md ${
              match.mode === 'SOLO'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : match.mode === 'DUO'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {match.mode} MODE
          </Badge>
        </div>

        {/* Map Tag */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-md text-gray-200 text-xs font-bold uppercase">
          🗺️ {match.map}
        </div>

        {/* Status Indicators */}
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

      {/* Card Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between pt-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <span>⏰ {match.time}</span>
          </div>

          <h3 className="font-gaming text-xl font-bold text-white mb-4 line-clamp-2">
            {match.title}
          </h3>

          {/* Prize & Fee Breakdown */}
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

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-gray-400">SLOTS JOINED</span>
            <span className="text-amber-400">
              {match.joinedSlots} / {match.maxSlots} ({fillPercentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800 mb-4">
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
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={() => onSelect(match)}
          className="w-full pubg-btn-primary py-3 rounded-xl font-gaming text-sm font-extrabold flex items-center justify-center gap-2"
        >
          💳 PAY ৳{match.entryFee} & BOOK SLOT
        </Button>
      </CardFooter>
    </Card>
  )
}
