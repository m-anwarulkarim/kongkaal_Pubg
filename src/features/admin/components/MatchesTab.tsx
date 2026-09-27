import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { MatchItem } from '@/types/match'
import type { RegistrationRecord } from '@/lib/db'
import MatchDetailPage from './MatchDetailPage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateMatch } from '@/lib/db'
import { convertFileToWebP } from '@/lib/imageUtils'
import { Plus, Trash2, Edit3, Image as ImageIcon, Eye, Loader2 } from 'lucide-react'

// Ordinal suffix helper: 4 -> "4th", 5 -> "5th" etc.
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

interface MatchesTabProps {
  matches: MatchItem[]
  registrations?: RegistrationRecord[]
  setNewMatchOpen: (open: boolean) => void
  handleDeleteMatch: (id: string) => void
  onRefreshMatches?: () => void
  onSelectCustomer?: (email: string) => void
}

export default function MatchesTab({
  matches,
  registrations = [],
  setNewMatchOpen,
  handleDeleteMatch,
  onRefreshMatches,
  onSelectCustomer,
}: MatchesTabProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null)
  const [editingMatch, setEditingMatch] = useState<MatchItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Sync active match from URL search param if present (?matchId=...)
  useEffect(() => {
    if (typeof window !== 'undefined' && matches.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const matchIdFromUrl = params.get('matchId')
      if (matchIdFromUrl) {
        const matched = matches.find((m) => m.id === matchIdFromUrl)
        if (matched) setSelectedMatch(matched)
      }
    }
  }, [matches])

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const matchIdFromUrl = params.get('matchId')
        if (matchIdFromUrl && matches.length > 0) {
          const matched = matches.find((m) => m.id === matchIdFromUrl)
          setSelectedMatch(matched || null)
        } else {
          setSelectedMatch(null)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [matches])

  const handleOpenMatchDetail = (match: MatchItem) => {
    setSelectedMatch(match)
    if (typeof window !== 'undefined') {
      const newUrl = `/admin/matches?matchId=${encodeURIComponent(match.id)}`
      window.history.pushState({}, '', newUrl)
    }
  }

  const handleBackToList = () => {
    setSelectedMatch(null)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin/matches')
    }
  }

  // If a match is selected, render the dedicated FULL-PAGE Match Details view!
  if (selectedMatch) {
    return (
      <MatchDetailPage
        match={selectedMatch}
        registrations={registrations}
        onBack={handleBackToList}
        onRefreshMatch={onRefreshMatches || (() => {})}
        onSelectCustomer={onSelectCustomer}
      />
    )
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMatch) return

    setSaving(true)
    const res = await updateMatch(editingMatch)
    setSaving(false)

    if (res.success) {
      toast.success('ম্যাচ তথ্য সফলভাবে আপডেট হয়েছে!')
      setEditingMatch(null)
      if (onRefreshMatches) onRefreshMatches()
    } else {
      toast.error(`Error updating match: ${res.message}`)
    }
  }

  return (
    <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Tournament Matches
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Create, edit pictures, prizes and manage PUBG Mobile Solo, Duo & Squad matches
          </span>
        </div>
        <Button
          onClick={() => setNewMatchOpen(true)}
          className="btn-kong-red font-gaming text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Match
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Picture</th>
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5">Map</th>
              <th className="p-3.5">Time</th>
              <th className="p-3.5">Entry Fee</th>
              <th className="p-3.5">Prize Pool</th>
              <th className="p-3.5">Per Kill</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Slots</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3.5">
                  <div
                    onClick={() => handleOpenMatchDetail(m)}
                    className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40 cursor-pointer hover:opacity-80 transition-opacity"
                    title={`View match details for ${m.title}`}
                  >
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-3.5 font-bold text-white text-sm">
                  <span
                    onClick={() => handleOpenMatchDetail(m)}
                    className="hover:text-purple-400 cursor-pointer transition-colors"
                  >
                    {m.title}
                  </span>
                </td>
                <td className="p-3.5">
                  <Badge className={m.mode === 'SOLO' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'}>
                    {m.mode}
                  </Badge>
                </td>
                <td className="p-3.5 text-gray-300">{m.map}</td>
                <td className="p-3.5 text-gray-300 font-bold">{m.time}</td>
                <td className="p-3.5 font-bold text-white">৳{m.entryFee}</td>
                <td className="p-3.5 font-bold text-emerald-400">৳{m.winnerPrize}</td>
                <td className="p-3.5 font-bold text-gray-300">৳{m.perKillPrize}</td>
                <td className="p-3.5">
                  <Badge className={
                    m.status === 'COMING_SOON' ? 'bg-amber-950 text-amber-400 border-amber-500/30' :
                    m.status === 'FILLING_FAST' ? 'bg-red-950 text-red-400 border-red-500/30' :
                    m.status === 'LIVE_SOON' ? 'bg-cyan-950 text-cyan-400 border-cyan-500/30' :
                    m.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                    'bg-green-950 text-green-400 border-green-500/30'
                  }>
                    {m.status || 'OPEN'}
                  </Badge>
                </td>
                <td className="p-3.5 text-amber-400 font-bold">
                  {m.joinedSlots}/{m.maxSlots}
                </td>
                <td className="p-3.5 text-right space-x-1.5">
                  <Button
                    onClick={() => handleOpenMatchDetail(m)}
                    size="sm"
                    className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
                    title={`View match details and slot list for ${m.title}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => setEditingMatch(m)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteMatch(m.id)}
                    size="sm"
                    variant="outline"
                    className="bg-red-950 text-red-400 border-red-800 hover:bg-red-900 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MATCH MODAL */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e111a] border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-500" />
                Edit Match Details & Picture
              </h3>
              <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <Label className="text-gray-300 font-bold block mb-1">Match Title</Label>
                <Input
                  value={editingMatch.title}
                  onChange={(e) => setEditingMatch({ ...editingMatch, title: e.target.value })}
                  className="bg-[#07080b] border-gray-700 text-white"
                  required
                />
              </div>

              {/* Match Picture / Image Selector */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Label className="text-gray-300 font-bold block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  Change Match Picture / Image
                </Label>

                {/* Picture Preview */}
                <div className="w-full h-28 rounded-xl overflow-hidden border border-white/20 relative bg-black">
                  <img src={editingMatch.image} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    Current Banner Preview
                  </span>
                </div>

                {/* Preset Banner Selector */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Solo', url: '/solo_battle.webp' },
                    { label: 'Duo', url: '/duo_battle.webp' },
                    { label: 'Squad', url: '/squad_showdown.webp' },
                    { label: 'Banner', url: '/kongkaal_hero.webp' },
                  ].map((img) => (
                    <button
                      type="button"
                      key={img.url}
                      onClick={() => setEditingMatch({ ...editingMatch, image: img.url })}
                      className={`relative rounded-xl overflow-hidden border-2 h-12 transition-all ${
                        editingMatch.image === img.url ? 'border-red-500 scale-105 shadow-md shadow-red-500/50' : 'border-white/10 opacity-70'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Custom URL or File Upload */}
                <div className="flex gap-2 items-center pt-1">
                  <Input
                    type="text"
                    placeholder="Or paste Image URL (https://...)"
                    value={editingMatch.image}
                    onChange={(e) => setEditingMatch({ ...editingMatch, image: e.target.value })}
                    className="bg-[#07080b] border-gray-700 text-white text-xs flex-1"
                  />

                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl border border-white/20 shrink-0">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const webpUrl = await convertFileToWebP(file)
                          setEditingMatch({ ...editingMatch, image: webpUrl })
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Game Mode</Label>
                  <Select
                    value={editingMatch.mode}
                    onValueChange={(v: any) => setEditingMatch({ ...editingMatch, mode: v })}
                  >
                    <SelectTrigger className="bg-[#07080b] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#101420] text-white">
                      <SelectItem value="SOLO">SOLO (1v1)</SelectItem>
                      <SelectItem value="DUO">DUO (2v2)</SelectItem>
                      <SelectItem value="SQUAD">SQUAD (4v4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Map</Label>
                  <Select
                    value={editingMatch.map}
                    onValueChange={(v: any) => setEditingMatch({ ...editingMatch, map: v })}
                  >
                    <SelectTrigger className="bg-[#07080b] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#101420] text-white">
                      <SelectItem value="Erangel">Erangel</SelectItem>
                      <SelectItem value="Miramar">Miramar</SelectItem>
                      <SelectItem value="Sanhok">Sanhok</SelectItem>
                      <SelectItem value="Livik">Livik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Entry Fee (৳)</Label>
                  <Input
                    type="number"
                    value={editingMatch.entryFee}
                    onChange={(e) => setEditingMatch({ ...editingMatch, entryFee: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Total Prize Pool (৳)</Label>
                  <Input
                    type="number"
                    value={editingMatch.winnerPrize}
                    onChange={(e) => setEditingMatch({ ...editingMatch, winnerPrize: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* 1st, 2nd, 3rd Prize Breakdown Inputs */}
              <div className="bg-[#07080b] p-3 rounded-xl border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">🏆 Prize Pool Breakdown (1st, 2nd, 3rd Place)</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥇 1st Prize</Label>
                    <Input
                      type="number"
                      value={editingMatch.firstPrize !== undefined ? editingMatch.firstPrize : editingMatch.winnerPrize}
                      onChange={(e) => setEditingMatch({ ...editingMatch, firstPrize: Number(e.target.value) })}
                      className="bg-[#101420] border-gray-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥈 2nd Prize</Label>
                    <Input
                      type="number"
                      value={editingMatch.secondPrize || 0}
                      onChange={(e) => setEditingMatch({ ...editingMatch, secondPrize: Number(e.target.value) })}
                      className="bg-[#101420] border-gray-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥉 3rd Prize</Label>
                    <Input
                      type="number"
                      value={editingMatch.thirdPrize || 0}
                      onChange={(e) => setEditingMatch({ ...editingMatch, thirdPrize: Number(e.target.value) })}
                      className="bg-[#101420] border-gray-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">💥 Per Kill</Label>
                    <Input
                      type="number"
                      value={editingMatch.perKillPrize}
                      onChange={(e) => setEditingMatch({ ...editingMatch, perKillPrize: Number(e.target.value) })}
                      className="bg-[#101420] border-gray-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] font-semibold text-gray-300">
                    🏆 Enable Prize Breakdown Modal Popup for this match
                  </span>
                  <input
                    type="checkbox"
                    checked={editingMatch.showPrizeBreakdown !== false}
                    onChange={(e) => setEditingMatch({ ...editingMatch, showPrizeBreakdown: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Extra Prize Places Controller (4th, 5th, 6th ... any positions) */}
              <div className="bg-[#07080b] p-3 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase">🎯 Extra Prize Places (4th, 5th, 6th...)</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const current = editingMatch.rankPrizes || []
                      const nextRank = current.length + 4 // starts from 4th
                      setEditingMatch({
                        ...editingMatch,
                        rankPrizes: [...current, { rank: `${ordinal(nextRank)} Place`, amount: 25 }]
                      })
                    }}
                    className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white text-[10px] py-1 px-2 h-auto rounded-lg"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Place
                  </Button>
                </div>

                {(!editingMatch.rankPrizes || editingMatch.rankPrizes.length === 0) && (
                  <p className="text-[11px] text-gray-500 italic py-1">
                    No extra places set. "Add Place" করলে 4th Place থেকে যোগ হবে — Prize Breakdown Modal-এ দেখাবে।
                  </p>
                )}

                {(editingMatch.rankPrizes || []).map((rp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={rp.rank}
                      onChange={(e) => {
                        const updated = [...(editingMatch.rankPrizes || [])]
                        updated[idx] = { ...updated[idx], rank: e.target.value }
                        setEditingMatch({ ...editingMatch, rankPrizes: updated })
                      }}
                      placeholder="e.g. 4th Place"
                      className="bg-[#101420] border-gray-700 text-white text-xs flex-1"
                    />
                    <Input
                      type="number"
                      value={rp.amount}
                      onChange={(e) => {
                        const updated = [...(editingMatch.rankPrizes || [])]
                        updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                        setEditingMatch({ ...editingMatch, rankPrizes: updated })
                      }}
                      placeholder="Amount ৳"
                      className="bg-[#101420] border-gray-700 text-white text-xs w-24"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingMatch.rankPrizes || []).filter((_, i) => i !== idx)
                        setEditingMatch({ ...editingMatch, rankPrizes: updated })
                      }}
                      className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-950 transition-colors"
                      title="Remove this place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">📅 Match Date</Label>
                  <Input
                    type="date"
                    value={editingMatch.matchDate || ''}
                    onChange={(e) => setEditingMatch({ ...editingMatch, matchDate: e.target.value })}
                    className="bg-[#07080b] border-gray-700 text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">⏰ Match Time</Label>
                  <Input
                    type="text"
                    value={editingMatch.time}
                    onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    placeholder="e.g. 10:00 PM"
                    className="bg-[#07080b] border-gray-700 text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Max Slots</Label>
                  <Input
                    type="number"
                    value={editingMatch.maxSlots}
                    onChange={(e) => setEditingMatch({ ...editingMatch, maxSlots: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 font-bold block mb-1">Status / Button</Label>
                <Select
                  value={editingMatch.status || 'OPEN'}
                  onValueChange={(v: any) => setEditingMatch({ ...editingMatch, status: v })}
                >
                  <SelectTrigger className="bg-[#07080b] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#101420] text-white">
                    <SelectItem value="OPEN">🟢 OPEN (Register Now)</SelectItem>
                    <SelectItem value="COMING_SOON">⏳ COMING SOON</SelectItem>
                    <SelectItem value="FILLING_FAST">🔥 FILLING FAST</SelectItem>
                    <SelectItem value="LIVE_SOON">⚡ LIVE SOON</SelectItem>
                    <SelectItem value="COMPLETED">✅ COMPLETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>UPDATING MATCH...</span>
                  </>
                ) : (
                  <span>Save Match Changes</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
