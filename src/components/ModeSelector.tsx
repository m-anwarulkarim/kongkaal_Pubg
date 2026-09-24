interface ModeSelectorProps {
  selectedMode: 'SOLO' | 'DUO' | 'SQUAD'
  onSelectMode: (mode: 'SOLO' | 'DUO' | 'SQUAD') => void
}

export default function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Solo Card */}
        <button
          onClick={() => onSelectMode('SOLO')}
          className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
            selectedMode === 'SOLO'
              ? 'bg-gradient-to-r from-[#e50914]/20 via-[#10131a] to-[#10131a] border-[#e50914] shadow-lg shadow-red-600/20'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              selectedMode === 'SOLO' ? 'bg-[#e50914] text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            👤
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-none mb-1">
              Solo
            </h3>
            <span className="text-xs text-gray-400 font-semibold block">1 Player</span>
          </div>
        </button>

        {/* Duo Card */}
        <button
          onClick={() => onSelectMode('DUO')}
          className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
            selectedMode === 'DUO'
              ? 'bg-gradient-to-r from-blue-950/40 via-[#10131a] to-[#10131a] border-blue-500 shadow-lg shadow-blue-500/20'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              selectedMode === 'DUO' ? 'bg-blue-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            👥
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-none mb-1">
              Duo
            </h3>
            <span className="text-xs text-gray-400 font-semibold block">2 Players</span>
          </div>
        </button>

        {/* Squad Card */}
        <button
          onClick={() => onSelectMode('SQUAD')}
          className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
            selectedMode === 'SQUAD'
              ? 'bg-gradient-to-r from-purple-950/40 via-[#10131a] to-[#10131a] border-purple-500 shadow-lg shadow-purple-500/20'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              selectedMode === 'SQUAD' ? 'bg-purple-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            🛡️
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-none mb-1">
              Squad
            </h3>
            <span className="text-xs text-gray-400 font-semibold block">4 Players</span>
          </div>
        </button>

      </div>
    </div>
  )
}
