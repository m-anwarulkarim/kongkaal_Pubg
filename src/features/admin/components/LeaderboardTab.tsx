import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import {
  getLeaderboard,
  createLeaderboardItem,
  updateLeaderboardItem,
  deleteLeaderboardItem,
} from '@/lib/db'
import type { LeaderboardItem } from '@/types/match'

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
    kills: 0,
    prizeWon: 0,
    status: 'VERIFIED PAYOUT' as 'VERIFIED PAYOUT' | 'PENDING',
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
      kills: 10,
      prizeWon: 1000,
      status: 'VERIFIED PAYOUT',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: LeaderboardItem) => {
    setEditingId(item.id)
    setFormData({
      matchTitle: item.matchTitle,
      teamName: item.teamName,
      playerIgn: item.playerIgn,
      kills: item.kills,
      prizeWon: item.prizeWon,
      status: item.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.matchTitle || !formData.teamName || !formData.playerIgn) {
      alert('Please fill in all required fields!')
      return
    }

    setSubmitting(true)
    if (editingId) {
      const res = await updateLeaderboardItem(editingId, formData)
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
        )
        setIsModalOpen(false)
      } else {
        alert(`Failed to update: ${res.message}`)
      }
    } else {
      const res = await createLeaderboardItem(formData)
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
            ওয়েবসাইটের Winner/Leaderboard সেকশনে সেরা বিজয়ী ও চ্যাম্পিয়ন প্লেয়ারদের যুক্ত এবং আপডেট করুন।
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
                  <th className="px-6 py-4">MATCH TITLE</th>
                  <th className="px-6 py-4">WINNER / TEAM</th>
                  <th className="px-6 py-4">PLAYER IGN</th>
                  <th className="px-6 py-4">TOTAL KILLS</th>
                  <th className="px-6 py-4">CASH PRIZE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-6 py-4 text-white font-bold">{item.matchTitle}</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{item.teamName}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">{item.playerIgn}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Champion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101422] border border-amber-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6 animate-in fade-in zoom-in duration-200">
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
