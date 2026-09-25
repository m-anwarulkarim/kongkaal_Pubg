import { useState } from 'react'
import type { MatchItem } from '@/types/match'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateMatch } from '@/lib/db'
import { Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react'

interface MatchesTabProps {
  matches: MatchItem[]
  setNewMatchOpen: (open: boolean) => void
  handleDeleteMatch: (id: string) => void
  onRefreshMatches?: () => void
}

export default function MatchesTab({
  matches,
  setNewMatchOpen,
  handleDeleteMatch,
  onRefreshMatches,
}: MatchesTabProps) {
  const [editingMatch, setEditingMatch] = useState<MatchItem | null>(null)
  const [saving, setSaving] = useState(false)

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMatch) return

    setSaving(true)
    const res = await updateMatch(editingMatch)
    setSaving(false)

    if (res.success) {
      setEditingMatch(null)
      if (onRefreshMatches) onRefreshMatches()
    } else {
      alert(`Error updating match: ${res.message}`)
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
              <th className="p-3.5">Slots</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3.5">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-3.5 font-bold text-white text-sm">{m.title}</td>
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
                <td className="p-3.5 text-amber-400 font-bold">
                  {m.joinedSlots}/{m.maxSlots}
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <Button
                    onClick={() => setEditingMatch(m)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Match
                  </Button>
                  <Button
                    onClick={() => handleDeleteMatch(m.id)}
                    size="sm"
                    variant="outline"
                    className="bg-red-950 text-red-400 border-red-800 hover:bg-red-900 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
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
                    { label: 'Solo', url: '/solo_battle.jpg' },
                    { label: 'Duo', url: '/duo_battle.jpg' },
                    { label: 'Squad', url: '/squad_showdown.jpg' },
                    { label: 'Banner', url: '/hero_banner.jpg' },
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
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            if (reader.result) {
                              setEditingMatch({ ...editingMatch, image: reader.result as string })
                            }
                          }
                          reader.readAsDataURL(file)
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

              <div className="grid grid-cols-3 gap-3">
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
                  <Label className="text-gray-300 font-bold block mb-1">Prize (৳)</Label>
                  <Input
                    type="number"
                    value={editingMatch.winnerPrize}
                    onChange={(e) => setEditingMatch({ ...editingMatch, winnerPrize: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Per Kill (৳)</Label>
                  <Input
                    type="number"
                    value={editingMatch.perKillPrize}
                    onChange={(e) => setEditingMatch({ ...editingMatch, perKillPrize: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Match Time</Label>
                  <Input
                    value={editingMatch.time}
                    onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold block mb-1">Max Slots</Label>
                  <Input
                    type="number"
                    value={editingMatch.maxSlots}
                    onChange={(e) => setEditingMatch({ ...editingMatch, maxSlots: Number(e.target.value) })}
                    className="bg-[#07080b] border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold"
              >
                {saving ? 'Updating Match...' : 'Save Match Changes'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
