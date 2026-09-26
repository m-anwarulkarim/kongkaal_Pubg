import type { AdminTabType, NewMatchFormData } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from '@/components/ui/Link'
import { ChevronRight, Search, RefreshCw, Plus, Gamepad2, Globe, PanelLeft } from 'lucide-react'

interface AdminHeaderProps {
  activeTab: AdminTabType
  searchQuery: string
  setSearchQuery: (query: string) => void
  loadAdminData: () => void
  loading: boolean
  newMatchOpen: boolean
  setNewMatchOpen: (open: boolean) => void
  newMatchForm: NewMatchFormData
  setNewMatchForm: React.Dispatch<React.SetStateAction<NewMatchFormData>>
  handleCreateMatch: (e: React.FormEvent) => void
  onToggleSidebar?: () => void
}

export default function AdminHeader({
  activeTab,
  searchQuery,
  setSearchQuery,
  loadAdminData,
  loading,
  newMatchOpen,
  setNewMatchOpen,
  newMatchForm,
  setNewMatchForm,
  handleCreateMatch,
  onToggleSidebar,
}: AdminHeaderProps) {
  return (
    <header className="bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3">
      {/* Active Section Title / Breadcrumb + Menu Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center shadow-sm"
          title="Toggle Navigation Menu"
        >
          <PanelLeft className="w-4.5 h-4.5 text-red-500" />
        </button>

        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">Admin Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600 hidden sm:inline" />
        <span className="text-xs sm:text-sm font-extrabold text-white uppercase font-gaming">
          {activeTab}
        </span>
      </div>

      {/* Search & Actions Header Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player, TrxID, Phone..."
            className="bg-[#121622] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 w-64 focus:border-red-500 outline-none transition-colors"
          />
        </div>

        {/* Refresh Button */}
        <Button
          onClick={loadAdminData}
          size="sm"
          className="btn-kong-outline text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Create Match Quick Action */}
        <Dialog open={newMatchOpen} onOpenChange={setNewMatchOpen}>
          <DialogTrigger asChild>
            <Button className="btn-kong-red font-gaming text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Match</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#101420] text-white border-2 border-red-900/50 max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold uppercase text-white flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-red-500" />
                <span>Create New Match</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMatch} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-bold text-gray-300">Match Title</Label>
                <Input
                  value={newMatchForm.title}
                  onChange={(e) => setNewMatchForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-gray-300">Game Mode</Label>
                  <Select
                    value={newMatchForm.mode}
                    onValueChange={(v: any) => setNewMatchForm((prev) => ({ ...prev, mode: v }))}
                  >
                    <SelectTrigger className="bg-[#07080b] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#101420] text-white border-gray-700">
                      <SelectItem value="SOLO">SOLO (1v1)</SelectItem>
                      <SelectItem value="DUO">DUO (2v2)</SelectItem>
                      <SelectItem value="SQUAD">SQUAD (4v4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-300">Map</Label>
                  <Select
                    value={newMatchForm.map}
                    onValueChange={(v: any) => setNewMatchForm((prev) => ({ ...prev, map: v }))}
                  >
                    <SelectTrigger className="bg-[#07080b] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#101420] text-white border-gray-700">
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
                  <Label className="text-xs font-bold text-gray-300">Entry Fee (৳)</Label>
                  <Input
                    type="number"
                    value={newMatchForm.entryFee}
                    onChange={(e) =>
                      setNewMatchForm((prev) => ({ ...prev, entryFee: Number(e.target.value) }))
                    }
                    required
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-300">Total Prize Pool (৳)</Label>
                  <Input
                    type="number"
                    value={newMatchForm.winnerPrize}
                    onChange={(e) =>
                      setNewMatchForm((prev) => ({ ...prev, winnerPrize: Number(e.target.value) }))
                    }
                    required
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* 1st, 2nd, 3rd Prize Breakdown */}
              <div className="bg-[#07080b] p-3 rounded-xl border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">🏆 Prize Pool Breakdown (1st, 2nd, 3rd Place)</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥇 1st Prize</Label>
                    <Input
                      type="number"
                      value={newMatchForm.firstPrize}
                      onChange={(e) =>
                        setNewMatchForm((prev) => ({ ...prev, firstPrize: Number(e.target.value) }))
                      }
                      className="bg-[#101420] border-gray-700 text-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥈 2nd Prize</Label>
                    <Input
                      type="number"
                      value={newMatchForm.secondPrize}
                      onChange={(e) =>
                        setNewMatchForm((prev) => ({ ...prev, secondPrize: Number(e.target.value) }))
                      }
                      className="bg-[#101420] border-gray-700 text-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">🥉 3rd Prize</Label>
                    <Input
                      type="number"
                      value={newMatchForm.thirdPrize}
                      onChange={(e) =>
                        setNewMatchForm((prev) => ({ ...prev, thirdPrize: Number(e.target.value) }))
                      }
                      className="bg-[#101420] border-gray-700 text-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 block mb-0.5">💥 Per Kill</Label>
                    <Input
                      type="number"
                      value={newMatchForm.perKillPrize}
                      onChange={(e) =>
                        setNewMatchForm((prev) => ({ ...prev, perKillPrize: Number(e.target.value) }))
                      }
                      className="bg-[#101420] border-gray-700 text-white rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-gray-300">Match Time</Label>
                  <Input
                    value={newMatchForm.time}
                    onChange={(e) => setNewMatchForm((prev) => ({ ...prev, time: e.target.value }))}
                    required
                    placeholder="e.g. 10:00 PM"
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-300">Max Slots</Label>
                  <Input
                    type="number"
                    value={newMatchForm.maxSlots}
                    onChange={(e) =>
                      setNewMatchForm((prev) => ({ ...prev, maxSlots: Number(e.target.value) }))
                    }
                    required
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Match Picture / Banner Selection & Custom Upload */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Label className="text-xs font-bold text-gray-300 block">Match Picture / Banner Image</Label>
                
                {/* Preset Image Options */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Solo', url: '/solo_battle.jpg' },
                    { label: 'Duo', url: '/duo_battle.jpg' },
                    { label: 'Squad', url: '/squad_showdown.jpg' },
                    { label: 'Banner', url: '/hero_banner.jpg' },
                  ].map((img) => (
                    <button
                      type="button"
                      key={img.url}
                      onClick={() => setNewMatchForm((prev) => ({ ...prev, image: img.url }))}
                      className={`relative rounded-xl overflow-hidden border-2 h-14 transition-all ${
                        newMatchForm.image === img.url ? 'border-red-500 shadow-md shadow-red-500/40 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Image URL or Device File Upload */}
                <div className="flex gap-2 items-center pt-1">
                  <Input
                    type="text"
                    placeholder="Or paste Image URL (https://...)"
                    value={newMatchForm.image}
                    onChange={(e) => setNewMatchForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl text-xs flex-1"
                  />

                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl border border-white/20 shrink-0">
                    Upload Picture
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
                              setNewMatchForm((prev) => ({ ...prev, image: reader.result as string }))
                            }
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold mt-2">
                Save Match to Supabase
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Website External Link */}
        <Link
          href="/"
          className="btn-kong-outline px-3.5 py-1.5 rounded-xl text-xs font-bold no-underline flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Website</span>
        </Link>
      </div>
    </header>
  )
}
