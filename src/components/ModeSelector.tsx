import { useState, useEffect } from 'react'
import { User, Users, Shield, Grid } from 'lucide-react'
import { getMatchModeSettings, type MatchModeSettings } from '@/lib/db'
import { toast } from 'sonner'

export type MatchFilterMode = 'ALL' | 'SOLO' | 'DUO' | 'SQUAD'

interface ModeSelectorProps {
  selectedMode: MatchFilterMode
  onSelectMode: (mode: MatchFilterMode) => void
}

export default function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  const [modes, setModes] = useState<MatchModeSettings>(() => getMatchModeSettings())

  useEffect(() => {
    const handleUpdate = () => {
      setModes(getMatchModeSettings())
    }
    setModes(getMatchModeSettings())
    window.addEventListener('mode_settings_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('mode_settings_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const handleModeClick = (targetMode: MatchFilterMode) => {
    if (targetMode === 'SOLO' && !modes.solo) {
      toast.error('SOLO মোড বর্তমানে এডমিন প্যানেল থেকে বন্ধ রাখা হয়েছে!')
      return
    }
    if (targetMode === 'DUO' && !modes.duo) {
      toast.error('DUO মোড বর্তমানে এডমিন প্যানেল থেকে বন্ধ রাখা হয়েছে!')
      return
    }
    if (targetMode === 'SQUAD' && !modes.squad) {
      toast.error('SQUAD মোড বর্তমানে এডমিন প্যানেল থেকে বন্ধ রাখা হয়েছে!')
      return
    }

    onSelectMode(selectedMode === targetMode ? 'ALL' : targetMode)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 mb-6">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        {/* All Matches Button */}
        <button
          onClick={() => onSelectMode('ALL')}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 transition-all cursor-pointer ${
            selectedMode === 'ALL'
              ? 'bg-gradient-to-r from-red-600/30 via-[#10131a] to-[#10131a] border-red-500 shadow-lg shadow-red-600/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedMode === 'ALL' ? 'bg-red-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden min-w-0">
            <h3 className="font-display text-xs sm:text-lg font-bold text-white uppercase leading-none mb-0.5 truncate">
              ALL
            </h3>
            <span className="text-[9px] sm:text-[11px] text-gray-400 font-semibold block truncate">All Modes</span>
          </div>
        </button>

        {/* Solo Card */}
        <button
          onClick={() => handleModeClick('SOLO')}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 transition-all cursor-pointer relative overflow-hidden ${
            !modes.solo
              ? 'bg-[#10131a]/60 border-white/5 opacity-50 cursor-not-allowed'
              : selectedMode === 'SOLO'
              ? 'bg-gradient-to-r from-[#e50914]/30 via-[#10131a] to-[#10131a] border-[#e50914] shadow-lg shadow-red-600/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              !modes.solo ? 'bg-gray-800 text-gray-500' : selectedMode === 'SOLO' ? 'bg-[#e50914] text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-display text-xs sm:text-lg font-bold text-white uppercase leading-none mb-0.5 truncate">
                Solo
              </h3>
              {!modes.solo && (
                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 shrink-0">OFF</span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] text-gray-400 font-semibold block truncate">1 Player</span>
          </div>
        </button>

        {/* Duo Card */}
        <button
          onClick={() => handleModeClick('DUO')}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 transition-all cursor-pointer relative overflow-hidden ${
            !modes.duo
              ? 'bg-[#10131a]/60 border-white/5 opacity-50 cursor-not-allowed'
              : selectedMode === 'DUO'
              ? 'bg-gradient-to-r from-blue-950/40 via-[#10131a] to-[#10131a] border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              !modes.duo ? 'bg-gray-800 text-gray-500' : selectedMode === 'DUO' ? 'bg-blue-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-display text-xs sm:text-lg font-bold text-white uppercase leading-none mb-0.5 truncate">
                Duo
              </h3>
              {!modes.duo && (
                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 shrink-0">OFF</span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] text-gray-400 font-semibold block truncate">2 Players</span>
          </div>
        </button>

        {/* Squad Card */}
        <button
          onClick={() => handleModeClick('SQUAD')}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 transition-all cursor-pointer relative overflow-hidden ${
            !modes.squad
              ? 'bg-[#10131a]/60 border-white/5 opacity-50 cursor-not-allowed'
              : selectedMode === 'SQUAD'
              ? 'bg-gradient-to-r from-purple-950/40 via-[#10131a] to-[#10131a] border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.01]'
              : 'bg-[#10131a] border-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              !modes.squad ? 'bg-gray-800 text-gray-500' : selectedMode === 'SQUAD' ? 'bg-purple-600 text-white' : 'bg-[#161a24] text-gray-400'
            }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-display text-xs sm:text-lg font-bold text-white uppercase leading-none mb-0.5 truncate">
                Squad
              </h3>
              {!modes.squad && (
                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 shrink-0">OFF</span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] text-gray-400 font-semibold block truncate">4 Players</span>
          </div>
        </button>
      </div>
    </div>
  )
}
