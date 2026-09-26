import { User, Users, Shield, Grid } from 'lucide-react'

export type MatchFilterMode = 'ALL' | 'SOLO' | 'DUO' | 'SQUAD'

interface ModeSelectorProps {
  selectedMode: MatchFilterMode
  onSelectMode: (mode: MatchFilterMode) => void
}

export default function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* All Matches Button */}
        <button
          onClick={() => onSelectMode('ALL')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            selectedMode === 'ALL'
              ? 'bg-gradient-to-r from-red-600/30 via-[#10131a] to-[#10131a] border-red-500 shadow-lg shadow-red-600/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMode === 'ALL' ? 'bg-red-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase leading-none mb-0.5">
              All Matches
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold block">All Tournament Modes</span>
          </div>
        </button>

        {/* Solo Card */}
        <button
          onClick={() => onSelectMode(selectedMode === 'SOLO' ? 'ALL' : 'SOLO')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            selectedMode === 'SOLO'
              ? 'bg-gradient-to-r from-[#e50914]/30 via-[#10131a] to-[#10131a] border-[#e50914] shadow-lg shadow-red-600/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMode === 'SOLO' ? 'bg-[#e50914] text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase leading-none mb-0.5">
              Solo
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold block">1 Player (1v1)</span>
          </div>
        </button>

        {/* Duo Card */}
        <button
          onClick={() => onSelectMode(selectedMode === 'DUO' ? 'ALL' : 'DUO')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            selectedMode === 'DUO'
              ? 'bg-gradient-to-r from-blue-950/40 via-[#10131a] to-[#10131a] border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMode === 'DUO' ? 'bg-blue-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase leading-none mb-0.5">
              Duo
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold block">2 Players (2v2)</span>
          </div>
        </button>

        {/* Squad Card */}
        <button
          onClick={() => onSelectMode(selectedMode === 'SQUAD' ? 'ALL' : 'SQUAD')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            selectedMode === 'SQUAD'
              ? 'bg-gradient-to-r from-purple-950/40 via-[#10131a] to-[#10131a] border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMode === 'SQUAD' ? 'bg-purple-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase leading-none mb-0.5">
              Squad
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold block">4 Players (4v4)</span>
          </div>
        </button>
      </div>
    </div>
  )
}
