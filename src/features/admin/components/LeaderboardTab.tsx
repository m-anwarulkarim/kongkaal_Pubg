import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { convertFileToWebP } from '@/lib/imageUtils'
import {
  Trophy,
  Swords,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Search,
  RefreshCw,
  Sparkles,
  X,
  Upload,
  Pin,
} from 'lucide-react'
import {
  getLeaderboard,
  createLeaderboardItem,
  updateLeaderboardItem,
  deleteLeaderboardItem,
} from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=PubgHero&backgroundColor=e50914',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SkullKing&backgroundColor=101422',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SniperPro&backgroundColor=059669',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowNinja&backgroundColor=d97706',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior&backgroundColor=2563eb',
]

export default function LeaderboardTab() {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    matchTitle: '',
    teamName: '',
    playerIgn: '',
    pubgUid: '',
    avatarUrl: '',
    rank: '1ST PLACE',
    kills: 10,
    prizeWon: 1000,
    status: 'VERIFIED PAYOUT' as 'VERIFIED PAYOUT' | 'PENDING',
    isPinned: false,
    pinnedPosition: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard()
      setItems(data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAddModal = () => {
    setEditingId(null)
    setFormData({
      matchTitle: '',
      teamName: '',
      playerIgn: '',
      pubgUid: '',
      avatarUrl: PRESET_AVATARS[0],
      rank: '1ST PLACE',
      kills: 10,
      prizeWon: 1000,
      status: 'VERIFIED PAYOUT',
      isPinned: false,
      pinnedPosition: 0,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: LeaderboardItem) => {
    setEditingId(item.id)
    setFormData({
      matchTitle: item.matchTitle,
      teamName: item.teamName,
      playerIgn: item.playerIgn,
      pubgUid: item.pubgUid || '',
      avatarUrl: item.avatarUrl || '',
      rank: item.rank || '1ST PLACE',
      kills: item.kills,
      prizeWon: item.prizeWon,
      status: item.status,
      isPinned: Boolean(item.isPinned),
      pinnedPosition: item.pinnedPosition || (item.isPinned ? 1 : 0),
    })
    setIsModalOpen(true)
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ছবি ৫ MB এর ছোট হতে হবে!')
        return
      }
      try {
        const webpDataUrl = await convertFileToWebP(file, 0.85)
        setFormData((prev) => ({ ...prev, avatarUrl: webpDataUrl }))
        toast.success('ছবি অটোমেটিক WebP ফরম্যাটে কনভার্ট হয়েছে!')
      } catch (err) {
        toast.error('ছবি কনভার্ট করতে ব্যর্থ হয়েছে!')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.matchTitle || !formData.teamName || !formData.playerIgn) {
      alert('Please fill in all required fields!')
      return
    }

    setSubmitting(true)
    const payload = {
      ...formData,
      isPinned: formData.pinnedPosition > 0,
      pinnedPosition: formData.pinnedPosition > 0 ? formData.pinnedPosition : undefined,
    }

    if (editingId) {
      const res = await updateLeaderboardItem(editingId, payload)
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        )
        setIsModalOpen(false)
      } else {
        alert(`Failed to update: ${res.message}`)
      }
    } else {
      const res = await createLeaderboardItem(payload)
      if (res.success) {
        if (res.newItem) {
          setItems((prev) => [res.newItem!, ...prev])
        } else {
          await loadData()
        }
        setIsModalOpen(false)
      } else {
        alert(`Failed to add: ${res.message}`)
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string, matchTitle: string) => {
    if (!confirm(`Are you sure you want to remove ${matchTitle} from Leaderboard?`)) return
    const res = await deleteLeaderboardItem(id)
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      alert(`Failed to delete: ${res.message}`)
    }
  }

  const handleSetPinPosition = async (item: LeaderboardItem, targetPos: number) => {
    const isPinned = targetPos > 0
    const pinnedPosition = isPinned ? targetPos : undefined
    const res = await updateLeaderboardItem(item.id, { isPinned, pinnedPosition })
    if (res.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPinned, pinnedPosition } : i))
      )
    } else {
      alert(`Failed to update position: ${res.message}`)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.matchTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.teamName.toLowerCase().includes(search.toLowerCase()) ||
      item.playerIgn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#101422] to-black border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-gaming text-[10px] font-bold tracking-widest uppercase">
              Hall of Fame Manager
            </span>
            <span className="text-gray-400 text-xs">Total Entries: {items.length}</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400 animate-pulse" />
            Leaderboard & Top Players Management
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            ওয়েবসাইটের Winner/Leaderboard সেকশনে ১ থেকে ৫ নম্বর স্থানে পিন করে বিজয়ী প্লেয়ারদের সেট করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-amber-400 hover:bg-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add New Champion
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-4 bg-[#101422] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Match Title, Team Name, or Player IGN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-[#101422] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-amber-400 font-gaming animate-pulse">
            LOADING LEADERBOARD ENTRIES...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm font-medium">No leaderboard champions found.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs"
            >
              Add First Winner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#090b12] font-gaming text-xs uppercase tracking-wider text-amber-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">PLAYER PROFILE</th>
                  <th className="px-6 py-4">MATCH TITLE</th>
                  <th className="px-6 py-4">TEAM / RANK</th>
                  <th className="px-6 py-4">TOTAL KILLS</th>
                  <th className="px-6 py-4">CASH PRIZE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">PIN POSITION / ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredItems.map((item) => {
                  const pos = item.pinnedPosition || (item.isPinned ? 1 : 0)

                  return (
                    <tr key={item.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0 w-10 h-10 min-w-[40px] min-h-[40px]">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.playerIgn}
                                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-amber-500/40 object-cover shadow-md shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                                {item.playerIgn[0]?.toUpperCase()}
                              </div>
                            )}
                            {pos > 0 && (
                              <span className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow" title={`Pinned #${pos}`}>
                                <Pin className="w-3 h-3 fill-black" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-bold block leading-none">{item.playerIgn}</span>
                              {pos === 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black">👑 PINNED #1</span>
                              )}
                              {pos === 2 && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-400/20 text-slate-300 border border-slate-400/40 text-[9px] font-black">🥈 PINNED #2</span>
                              )}
                              {pos === 3 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-700/40 text-[9px] font-black">🥉 PINNED #3</span>
                              )}
                              {pos === 4 && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-black">🏅 PINNED #4</span>
                              )}
                              {pos === 5 && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[9px] font-black">🏅 PINNED #5</span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">UID: {item.pubgUid || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-bold">{item.matchTitle}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-400 block">{item.teamName}</span>
                        <span className="text-[10px] text-amber-500/80 uppercase font-mono">{item.rank || 'CHAMPION'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-white font-bold text-xs inline-flex items-center gap-1.5">
                          <Swords className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.kills} KILLS</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-display text-base font-bold text-green-400">
                        ৳{item.prizeWon.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1.5 ${
                            item.status === 'VERIFIED PAYOUT'
                              ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                              : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Pin Position Dropdown */}
                        <div className="inline-block relative">
                          <select
                            value={pos}
                            onChange={(e) => handleSetPinPosition(item, Number(e.target.value))}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${
                              pos > 0
                                ? 'bg-amber-500 text-black border-amber-500 shadow font-black'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 border-white/10'
                            }`}
                            title="Set Rank Position (#1 to #5)"
                          >
                            <option value={0} className="bg-[#101422] text-gray-300">📌 Pin None (Unpinned)</option>
                            <option value={1} className="bg-[#101422] text-amber-400 font-bold">👑 #1 Rank (1st Place)</option>
                            <option value={2} className="bg-[#101422] text-slate-300 font-bold">🥈 #2 Rank (2nd Place)</option>
                            <option value={3} className="bg-[#101422] text-amber-600 font-bold">🥉 #3 Rank (3rd Place)</option>
                            <option value={4} className="bg-[#101422] text-blue-400 font-bold">🏅 #4 Rank (4th Place)</option>
                            <option value={5} className="bg-[#101422] text-purple-400 font-bold">🏅 #5 Rank (5th Place)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-400 transition-colors border border-white/10"
                          title="Edit Entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.matchTitle)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Champion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101422] border border-amber-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                  {editingId ? 'Edit Champion Record' : 'Add New Champion Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Winner Profile Picture Selector */}
              <div className="bg-[#161a29] border border-white/10 rounded-xl p-4 text-center space-y-3">
                <label className="block text-xs font-bold text-gray-300 uppercase text-left">
                  Player Profile Picture / Avatar
                </label>
                
                <div className="relative inline-block mx-auto">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Winner Avatar"
                      className="w-16 h-16 rounded-full border-2 border-amber-500 shadow-md object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 text-xl font-bold mx-auto">
                      {formData.playerIgn[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <label className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" /> Upload Device Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Gamer Presets */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Select Preset PUBG Avatar:</span>
                  <div className="flex justify-center gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, avatarUrl: url })}
                        className={`rounded-full p-0.5 border-2 transition-transform ${
                          formData.avatarUrl === url ? 'border-amber-500 scale-110' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-8 h-8 rounded-full bg-[#0a0c14]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Or enter image URL (https://...)"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Match Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Erangel Squad Championship #309"
                  value={formData.matchTitle}
                  onChange={(e) => setFormData({ ...formData, matchTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Winner / Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP ESPORTS"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Player IGN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP_SHADOW"
                    value={formData.playerIgn}
                    onChange={(e) => setFormData({ ...formData, playerIgn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    PUBG Character ID (UID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5123456789"
                    value={formData.pubgUid}
                    onChange={(e) => setFormData({ ...formData, pubgUid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Rank / Badge Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1ST PLACE / CHAMPION"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Total Kills
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.kills}
                    onChange={(e) => setFormData({ ...formData, kills: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    Prize Won (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prizeWon}
                    onChange={(e) =>
                      setFormData({ ...formData, prizeWon: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  Payout Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'VERIFIED PAYOUT' | 'PENDING',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="VERIFIED PAYOUT">VERIFIED PAYOUT (Paid via bKash/Nagad)</option>
                  <option value="PENDING">PENDING (Processing)</option>
                </select>
              </div>

              {/* Pin Position Selector */}
              <div className="bg-[#161a29] border border-white/10 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 fill-amber-400" /> Featured Rank Position (📌 Top 5 Pin)
                </label>
                <select
                  value={formData.pinnedPosition}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setFormData({
                      ...formData,
                      pinnedPosition: val,
                      isPinned: val > 0,
                    })
                  }}
                  className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value={0} className="bg-[#101422] text-gray-400">📌 Unpinned (Auto Rank by Kills/Prize)</option>
                  <option value={1} className="bg-[#101422] text-amber-400 font-bold">👑 #1 Position (1st Place Gold Crown)</option>
                  <option value={2} className="bg-[#101422] text-slate-300 font-bold">🥈 #2 Position (2nd Place Silver)</option>
                  <option value={3} className="bg-[#101422] text-amber-600 font-bold">🥉 #3 Position (3rd Place Bronze)</option>
                  <option value={4} className="bg-[#101422] text-blue-400 font-bold">🏅 #4 Position (4th Place)</option>
                  <option value={5} className="bg-[#101422] text-purple-400 font-bold">🏅 #5 Position (5th Place)</option>
                </select>
                <p className="text-[11px] text-gray-400">
                  শীর্ষ ৫ জন বিজয়ী প্লেয়ারের মধ্যে কতো নম্বর স্থানে একে দেখাবে সিলেক্ট করুন।
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  {submitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Champion'
                    : 'Save Champion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
