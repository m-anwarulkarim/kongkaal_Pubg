import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { MatchItem } from '@/types/match'
import {
  type RegistrationRecord,
  updateRegistrationRoomCredentials,
  updateRegistrationStatus,
  deleteRegistrationRecord,
  updateMatch,
} from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Users,
  Trophy,
  Copy,
  Check,
  Key,
  Gamepad2,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Smartphone,
  Share2,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Award,
} from 'lucide-react'

interface MatchDetailPageProps {
  match: MatchItem
  registrations: RegistrationRecord[]
  onBack: () => void
  onRefreshMatch: () => void
  onSelectCustomer?: (email: string) => void
}

export default function MatchDetailPage({
  match,
  registrations,
  onBack,
  onRefreshMatch,
  onSelectCustomer,
}: MatchDetailPageProps) {
  // Filter registrations specifically for this match
  const matchRegs = registrations.filter(
    (r) =>
      r.matchId === match.id ||
      (r.matchTitle && r.matchTitle.toLowerCase() === match.title.toLowerCase())
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Room Credentials Form State
  const [roomIdInput, setRoomIdInput] = useState(match.roomId || '')
  const [roomPasswordInput, setRoomPasswordInput] = useState(match.roomPassword || '')
  const [whatsappLinkInput, setWhatsappLinkInput] = useState(match.whatsappGroupLink || '')
  const [savingRoom, setSavingRoom] = useState(false)

  // Match Status Manager State
  const [currentMatchStatus, setCurrentMatchStatus] = useState(match.status || 'OPEN')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Action Modals State
  const [confirmModalItem, setConfirmModalItem] = useState<{
    id: string
    name: string
    amount: number
    trxId: string
  } | null>(null)

  const [deleteModalReg, setDeleteModalReg] = useState<{
    id: string
    name: string
    trxId: string
  } | null>(null)

  useEffect(() => {
    // Sync default room credentials from first registration if match itself doesn't have it set
    const regWithRoom = matchRegs.find((r) => r.roomId)
    if (regWithRoom && (!roomIdInput || !roomPasswordInput)) {
      if (!roomIdInput) setRoomIdInput(regWithRoom.roomId || '')
      if (!roomPasswordInput) setRoomPasswordInput(regWithRoom.roomPassword || '')
    }
  }, [matchRegs])

  const handleCopyField = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} "${text}" to clipboard!`)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 1500)
  }

  // Copy Room Credentials for Players
  const handleCopyRoomCredentials = () => {
    const text = `🎮 PUBG MATCH ROOM CREDENTIALS\nMatch: ${match.title}\nRoom ID: ${roomIdInput || 'Not set'}\nPassword: ${roomPasswordInput || 'Not set'}\nMap: ${match.map} | Time: ${match.time}\n\nPlease join 10 minutes before the match start time!`
    navigator.clipboard.writeText(text)
    toast.success('Room ID & Password copied to clipboard!')
  }

  // Copy Formatted Slot List for Room Host
  const handleCopyHostSlotList = () => {
    const verifiedRegs = matchRegs.filter((r) => r.status === 'VERIFIED')
    const listLines = verifiedRegs.map((r, i) => {
      const slot = r.slotNumber || i + 1
      const team = r.teamName ? `[${r.teamName}] ` : ''
      const p1 = `${r.player1Name} (UID: ${r.player1Uid})`
      const p2 = r.player2Name ? `, P2: ${r.player2Name} (${r.player2Uid || ''})` : ''
      const p3 = r.player3Name ? `, P3: ${r.player3Name} (${r.player3Uid || ''})` : ''
      const p4 = r.player4Name ? `, P4: ${r.player4Name} (${r.player4Uid || ''})` : ''
      return `Slot #${slot}: ${team}${p1}${p2}${p3}${p4}`
    })

    const fullText = `🏆 [${match.title.toUpperCase()}] - ROOM SLOT LIST (${verifiedRegs.length} Teams Registered)\nMap: ${match.map} | Time: ${match.time}\nRoom ID: ${roomIdInput || 'TBD'} | Pass: ${roomPasswordInput || 'TBD'}\n----------------------------------------\n${listLines.join('\n') || 'No verified players yet.'}`

    navigator.clipboard.writeText(fullText)
    toast.success('Formatted PUBG Slot List copied for Room Host!')
  }

  // Save Room Credentials & Broadcast to all registered match players
  const handleSaveRoomCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRoom(true)
    try {
      // 1. Update Match record
      await updateMatch({
        ...match,
        roomId: roomIdInput.trim(),
        roomPassword: roomPasswordInput.trim(),
        whatsappGroupLink: whatsappLinkInput.trim(),
      })

      // 2. Broadcast/update all registrations for this match
      for (const reg of matchRegs) {
        await updateRegistrationRoomCredentials(reg.id, roomIdInput.trim(), roomPasswordInput.trim())
      }

      toast.success('Room ID & Password broadcasted to all registered players!')
      onRefreshMatch()
    } catch (err: any) {
      toast.error(`Failed to update room credentials: ${err.message || err}`)
    } finally {
      setSavingRoom(false)
    }
  }

  // Update Match Status (e.g. OPEN -> LIVE_SOON -> COMPLETED)
  const handleChangeMatchStatus = async (newStatus: any) => {
    setUpdatingStatus(true)
    setCurrentMatchStatus(newStatus)
    const res = await updateMatch({
      ...match,
      status: newStatus,
    })
    setUpdatingStatus(false)
    if (res.success) {
      toast.success(`Match status updated to ${newStatus}`)
      onRefreshMatch()
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  // Registration Status Handlers
  const handleApproveRegistration = async (id: string) => {
    const res = await updateRegistrationStatus(id, 'VERIFIED')
    if (res.success) {
      toast.success('পেমেন্ট ভেরিফাইড (VERIFIED) করা হয়েছে!')
      onRefreshMatch()
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  const handleRejectRegistration = async (id: string) => {
    const res = await updateRegistrationStatus(id, 'REJECTED')
    if (res.success) {
      toast.error('পেমেন্ট রিজেক্ট করা হয়েছে!')
      onRefreshMatch()
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  const handleDeleteRegistration = async (id: string) => {
    const res = await deleteRegistrationRecord(id)
    if (res.success) {
      toast.success('রেজিস্ট্রেশন রেকর্ড মুছে ফেলা হয়েছে!')
      onRefreshMatch()
    } else {
      toast.error(`Error: ${res.message}`)
    }
  }

  // Filtered registrations
  const filteredRegs = matchRegs.filter((r) => {
    const matchSearch =
      r.player1Name.toLowerCase().includes(search.toLowerCase()) ||
      r.player1Uid.includes(search) ||
      (r.teamName && r.teamName.toLowerCase().includes(search.toLowerCase())) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (r.whatsappNumber && r.whatsappNumber.includes(search)) ||
      (r.trxId && r.trxId.toLowerCase().includes(search.toLowerCase())) ||
      (r.slotNumber && r.slotNumber.toString().includes(search))

    if (statusFilter === 'ALL') return matchSearch
    return matchSearch && r.status === statusFilter
  })

  // Stats
  const verifiedCount = matchRegs.filter((r) => r.status === 'VERIFIED').length
  const pendingCount = matchRegs.filter((r) => r.status === 'PENDING').length
  const totalCollected = matchRegs
    .filter((r) => r.status === 'VERIFIED' || r.status === 'PENDING')
    .reduce((sum, r) => sum + (r.amount || match.entryFee || 0), 0)

  const slotsPercentage = Math.min(100, Math.round((match.joinedSlots / match.maxSlots) * 100))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101422] border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Matches
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold">
                {match.mode} • {match.map}
              </Badge>
              <Badge
                className={
                  currentMatchStatus === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold'
                    : currentMatchStatus === 'LIVE_SOON'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30 animate-pulse font-bold'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/30 font-bold'
                }
              >
                STATUS: {currentMatchStatus}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-tight mt-0.5 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-red-500" /> {match.title}
            </h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyRoomCredentials}
            size="sm"
            className="bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            title="Copy Room ID & Password text for players"
          >
            <Key className="w-3.5 h-3.5" /> Copy Room Credentials
          </Button>

          <Button
            onClick={handleCopyHostSlotList}
            size="sm"
            className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            title="Copy Formatted Slot List for PUBG Room Host"
          >
            <Share2 className="w-3.5 h-3.5" /> Copy Host Slot List
          </Button>

          <Button
            onClick={onRefreshMatch}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl p-2 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Slot Capacity */}
        <Card className="bg-[#101422] border-white/10 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Joined Slots
              </span>
              <h3 className="text-2xl font-black text-white font-display mt-0.5">
                {match.joinedSlots} / <span className="text-gray-400 text-lg">{match.maxSlots}</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${slotsPercentage}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block font-mono">{slotsPercentage}% Capacity Filled</span>
        </Card>

        {/* Card 2: Total Revenue Collected */}
        <Card className="bg-[#101422] border-white/10 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Collection
              </span>
              <h3 className="text-2xl font-black text-emerald-400 font-display mt-0.5">
                ৳{totalCollected.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 mt-3 block font-bold">
            Entry Fee: ৳{match.entryFee} per player/team
          </span>
        </Card>

        {/* Card 3: Prize Pool Breakdown */}
        <Card className="bg-[#101422] border-white/10 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Winner Prize Pool
              </span>
              <h3 className="text-2xl font-black text-amber-400 font-display mt-0.5">
                ৳{match.winnerPrize.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-gray-400 mt-3 block font-bold">
            Per Kill: <span className="text-white">৳{match.perKillPrize}</span>
          </span>
        </Card>

        {/* Card 4: Room ID & Password Status */}
        <Card className="bg-[#101422] border-white/10 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Room Credentials
              </span>
              <div className="mt-1 font-mono text-xs space-y-0.5">
                <p className="text-white font-bold">
                  ID: <span className="text-amber-400">{roomIdInput || 'Not set'}</span>
                </p>
                <p className="text-white font-bold">
                  Pass: <span className="text-cyan-400">{roomPasswordInput || 'Not set'}</span>
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={handleCopyRoomCredentials}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold mt-2 inline-flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" /> Quick Copy Room Text
          </button>
        </Card>
      </div>

      {/* Main Grid: Left Broadcaster & Status Manager, Right Matches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (1 col): Room ID Manager & Match Status Control */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Broadcast / Set Room ID & Password */}
          <Card className="bg-[#101422] border-purple-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Key className="w-5 h-5 text-purple-400" />
              <h3 className="font-display text-lg font-black text-white uppercase">
                Room ID & Password Broadcast
              </h3>
            </div>

            <p className="text-xs text-gray-400">
              ম্যাচের **Room ID** ও **Password** এখানে সেট করে সেভ করলে টুর্নামেন্টে যুক্ত হওয়া সকল প্লেয়ারের ড্যাশবোর্ডে সাথে সাথে রুম তথ্য আপডেট হয়ে যাবে।
            </p>

            <form onSubmit={handleSaveRoomCredentials} className="space-y-3 text-xs">
              <div>
                <Label className="text-gray-300 font-bold mb-1 block">PUBG Room ID</Label>
                <Input
                  type="text"
                  placeholder="e.g. 8492041"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  className="bg-[#080a12] border-white/10 text-white font-mono text-sm font-bold"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 font-bold mb-1 block">PUBG Room Password</Label>
                <Input
                  type="text"
                  placeholder="e.g. 7788"
                  value={roomPasswordInput}
                  onChange={(e) => setRoomPasswordInput(e.target.value)}
                  className="bg-[#080a12] border-white/10 text-white font-mono text-sm font-bold"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 font-bold mb-1 block">WhatsApp Group Link</Label>
                <Input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={whatsappLinkInput}
                  onChange={(e) => setWhatsappLinkInput(e.target.value)}
                  className="bg-[#080a12] border-white/10 text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={savingRoom}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>{savingRoom ? 'Broadcasting...' : 'Save & Broadcast Room ID'}</span>
              </Button>
            </form>
          </Card>

          {/* Card 2: Match Status Switcher */}
          <Card className="bg-[#101422] border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-display text-lg font-black text-white uppercase">
                Match Status Switcher
              </h3>
            </div>

            <p className="text-xs text-gray-400">
              ম্যাচ লাইভ বা কমপ্লিট হলে স্ট্যাটাস পরিবর্তন করুন:
            </p>

            <div className="space-y-2">
              {[
                { status: 'OPEN', label: 'OPEN (নতুন প্লেয়ার বুকিং নিচ্ছে)', color: 'bg-green-600/20 text-green-400 border-green-500/40' },
                { status: 'FILLING_FAST', label: 'FILLING FAST (খুব দ্রুত স্লট ফুল হচ্ছে)', color: 'bg-red-600/20 text-red-400 border-red-500/40' },
                { status: 'LIVE_SOON', label: 'LIVE SOON (রুম খুলে দেওয়া হয়েছে)', color: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40' },
                { status: 'COMING_SOON', label: 'COMING SOON (শিগগিরই শুরু হবে)', color: 'bg-amber-600/20 text-amber-400 border-amber-500/40' },
                { status: 'COMPLETED', label: 'COMPLETED (ম্যাচ শেষ হয়েছে)', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' },
              ].map((st) => (
                <button
                  key={st.status}
                  disabled={updatingStatus}
                  onClick={() => handleChangeMatchStatus(st.status as any)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    currentMatchStatus === st.status
                      ? `${st.color} border-2 ring-2 ring-white/20 shadow-md`
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{st.label}</span>
                  {currentMatchStatus === st.status && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (2 cols): Registered Players & Teams Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#101422] border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
            
            {/* Header + Search + Status Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Joined Players & Slots ({matchRegs.length})
                </h3>
                <p className="text-xs text-gray-400">
                  {verifiedCount} Verified • {pendingCount} Pending Approval • {matchRegs.length} Total Registered
                </p>
              </div>

              {/* Status Tabs (ALL, VERIFIED, PENDING, REJECTED) */}
              <div className="flex items-center gap-1 bg-[#080a12] p-1 rounded-xl border border-white/10">
                {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by Player IGN, PUBG UID, Team Name, Email, WhatsApp or Slot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#080a12] border-white/10 text-white text-xs rounded-xl"
              />
            </div>

            {/* Registered Slots Table */}
            {filteredRegs.length === 0 ? (
              <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5 space-y-2">
                <Users className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-400">No registered slots found for this filter.</p>
                <p className="text-xs text-gray-500">নতুন কাস্টমাররা অ্যাপ্লাই করলে এখানে দেখতে পাবেন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070910] text-gray-400 uppercase tracking-wider text-[10px] font-gaming">
                    <tr>
                      <th className="p-3">Slot & Team</th>
                      <th className="p-3">Players & PUBG UIDs</th>
                      <th className="p-3">WhatsApp / Contact</th>
                      <th className="p-3">Payment Info</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredRegs.map((reg, idx) => {
                      const slotNum = reg.slotNumber || idx + 1
                      return (
                        <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                          
                          {/* Slot # & Team Name */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs shrink-0">
                                #{slotNum}
                              </span>
                              <div>
                                <span className="font-bold text-white block text-xs">
                                  {reg.teamName || `Slot ${slotNum}`}
                                </span>
                                {reg.userEmail && (
                                  <span className="text-[10px] text-gray-400 font-mono block">
                                    {reg.userEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Players & PUBG UIDs */}
                          <td className="p-3 space-y-1">
                            {/* Player 1 (Leader / Primary) */}
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                P1
                              </span>
                              <span className="font-bold text-white text-xs">{reg.player1Name}</span>
                              <span className="font-mono text-gray-400 text-[11px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                {reg.player1Uid}
                                <button
                                  type="button"
                                  onClick={() => handleCopyField(reg.player1Uid, 'PUBG UID')}
                                  className="hover:text-white text-gray-400"
                                  title="Copy UID"
                                >
                                  {copiedText === reg.player1Uid ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </span>
                            </div>

                            {/* Additional Players for DUO/SQUAD */}
                            {reg.player2Name && (
                              <div className="text-[11px] text-gray-300 flex items-center gap-1.5 pl-1">
                                <span className="text-gray-400 text-[10px]">P2:</span>
                                <span className="font-medium text-gray-200">{reg.player2Name}</span>
                                <span className="font-mono text-gray-400 text-[10px]">({reg.player2Uid || 'N/A'})</span>
                              </div>
                            )}
                            {reg.player3Name && (
                              <div className="text-[11px] text-gray-300 flex items-center gap-1.5 pl-1">
                                <span className="text-gray-400 text-[10px]">P3:</span>
                                <span className="font-medium text-gray-200">{reg.player3Name}</span>
                                <span className="font-mono text-gray-400 text-[10px]">({reg.player3Uid || 'N/A'})</span>
                              </div>
                            )}
                            {reg.player4Name && (
                              <div className="text-[11px] text-gray-300 flex items-center gap-1.5 pl-1">
                                <span className="text-gray-400 text-[10px]">P4:</span>
                                <span className="font-medium text-gray-200">{reg.player4Name}</span>
                                <span className="font-mono text-gray-400 text-[10px]">({reg.player4Uid || 'N/A'})</span>
                              </div>
                            )}
                          </td>

                          {/* WhatsApp / Contact */}
                          <td className="p-3">
                            {reg.whatsappNumber ? (
                              <div className="flex items-center gap-1.5 font-mono text-emerald-400 text-xs">
                                <Smartphone className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                <span>{reg.whatsappNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyField(reg.whatsappNumber, 'WhatsApp Number')}
                                  className="p-1 rounded bg-white/5 hover:bg-emerald-600/30 text-gray-400 hover:text-white"
                                  title="Copy WhatsApp Number"
                                >
                                  {copiedText === reg.whatsappNumber ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <a
                                  href={`https://wa.me/${reg.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white"
                                  title="Open WhatsApp Chat"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>

                          {/* Payment Info */}
                          <td className="p-3 font-mono">
                            <span className="font-bold text-white block">
                              {reg.paymentMethod} — ৳{reg.amount || match.entryFee}
                            </span>
                            {reg.trxId && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                                <span>Trx: {reg.trxId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyField(reg.trxId, 'TrxID')}
                                  className="p-0.5 text-gray-400 hover:text-white"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <Badge
                              className={
                                reg.status === 'VERIFIED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : reg.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-400 border border-red-500/30'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                              }
                            >
                              {reg.status}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right space-x-1.5">
                            {/* Icon-only Customer Details Button */}
                            {reg.userEmail && (
                              <Button
                                onClick={() => onSelectCustomer?.(reg.userEmail!)}
                                size="sm"
                                className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
                                title={`View Customer Profile of ${reg.player1Name}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {reg.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() =>
                                    setConfirmModalItem({
                                      id: reg.id,
                                      name: reg.player1Name,
                                      amount: reg.amount || match.entryFee,
                                      trxId: reg.trxId,
                                    })
                                  }
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1 shadow-md cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </Button>

                                <Button
                                  onClick={() => handleRejectRegistration(reg.id)}
                                  size="sm"
                                  className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-[11px] font-bold py-1 px-2 h-auto cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </Button>
                              </>
                            )}

                            <Button
                              onClick={() =>
                                setDeleteModalReg({
                                  id: reg.id,
                                  name: reg.player1Name,
                                  trxId: reg.trxId,
                                })
                              }
                              size="sm"
                              className="bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* CONFIRMATION POPUP MODAL FOR APPROVING REGISTRATION */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Approve Tournament Slot</h3>
              </div>
              <button onClick={() => setConfirmModalItem(null)} className="text-gray-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="bg-[#161a29] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Player Name:</span>
                <strong className="text-white">{confirmModalItem.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>TrxID:</span>
                <strong className="text-amber-400 font-mono">{confirmModalItem.trxId || 'N/A'}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Amount:</span>
                <strong className="text-emerald-400 font-display">৳{confirmModalItem.amount}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              আপনি কি নিশ্চিত যে **{confirmModalItem.name}** এর এই টুর্নামেন্ট রেজিস্ট্রেশন ভেরিফাইড (VERIFIED) করবেন?
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleApproveRegistration(confirmModalItem.id)
                  setConfirmModalItem(null)
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, Confirm Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR DELETING REGISTRATION */}
      {deleteModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f121d] border border-red-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Delete Slot Registration</h3>
              </div>
              <button onClick={() => setDeleteModalReg(null)} className="text-gray-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              আপনি কি নিশ্চিত যে **{deleteModalReg.name}** এর এই স্লট রেকর্ডটি চিরতরে মুছে ফেলতে চান?
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDeleteModalReg(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleDeleteRegistration(deleteModalReg.id)
                  setDeleteModalReg(null)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
