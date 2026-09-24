import type { AdminTabType, NewMatchFormData } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from '@/components/ui/Link'
import { ChevronRight, Search, RefreshCw, Plus, Gamepad2, Globe } from 'lucide-react'

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
}: AdminHeaderProps) {
  return (
    <header className="bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40 flex items-center justify-between gap-4">
      {/* Active Section Title / Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Admin Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-sm font-extrabold text-white uppercase font-gaming">
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

              <div className="grid grid-cols-3 gap-3">
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
                  <Label className="text-xs font-bold text-gray-300">Winner Prize (৳)</Label>
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
                <div>
                  <Label className="text-xs font-bold text-gray-300">Per Kill (৳)</Label>
                  <Input
                    type="number"
                    value={newMatchForm.perKillPrize}
                    onChange={(e) =>
                      setNewMatchForm((prev) => ({ ...prev, perKillPrize: Number(e.target.value) }))
                    }
                    required
                    className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                  />
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

              <Button type="submit" className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold">
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
