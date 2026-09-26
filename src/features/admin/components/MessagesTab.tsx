import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import {
  getSupportMessages,
  replySupportMessage,
  deleteSupportMessage,
  type SupportMessage,
} from '@/lib/support'

interface MessagesTabProps {
  initialSearch?: string
}

export default function MessagesTab({ initialSearch = '' }: MessagesTabProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'REPLIED'>('ALL')

  // Selected message for viewing/replying
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = () => {
    setLoading(true)
    try {
      const data = getSupportMessages()
      // Sort messages: PENDING first, then by date descending (newest first)
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setMessages(sorted)
      if (sorted.length > 0 && !selectedMessage) {
        setSelectedMessage(sorted[0])
        setReplyText(sorted[0].adminReply || '')
      }
    } catch (err) {
      console.error('Failed to load support messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => {
      loadData()
    }

    window.addEventListener('support_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('support_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch)
    }
  }, [initialSearch])

  const handleSelectMessage = (msg: SupportMessage) => {
    setSelectedMessage(msg)
    setReplyText(msg.adminReply || '')
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !replyText.trim()) return

    setSubmitting(true)
    const res = replySupportMessage(selectedMessage.id, replyText.trim())
    if (res.success) {
      const updatedReply = replyText.trim()
      setMessages((prev) =>
        prev
          .map((m) =>
            m.id === selectedMessage.id
              ? {
                  ...m,
                  adminReply: updatedReply,
                  repliedAt: new Date().toISOString(),
                  status: 'REPLIED' as const,
                }
              : m
          )
          .sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
      )
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              adminReply: updatedReply,
              repliedAt: new Date().toISOString(),
              status: 'REPLIED',
            }
          : null
      )
      toast.success('এডমিন রিপ্লাই সফলভাবে পাঠানো হয়েছে!')
    } else {
      toast.error('রেসপন্স পাঠানো ব্যর্থ হয়েছে!')
    }
    setSubmitting(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেসেজটি মুছে ফেলতে চান?')) return
    const res = deleteSupportMessage(id)
    if (res.success) {
      setMessages((prev) => {
        const remaining = prev.filter((m) => m.id !== id)
        if (selectedMessage?.id === id) {
          setSelectedMessage(remaining[0] || null)
        }
        return remaining
      })
    }
  }

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.userName.toLowerCase().includes(search.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())

    if (filterStatus === 'PENDING') return matchesSearch && m.status === 'PENDING'
    if (filterStatus === 'REPLIED') return matchesSearch && m.status === 'REPLIED'
    return matchesSearch
  })

  const pendingCount = messages.filter((m) => m.status === 'PENDING').length
  const repliedCount = messages.filter((m) => m.status === 'REPLIED').length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#101422] to-black border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-gaming text-[10px] font-bold tracking-widest uppercase">
              Customer Support Center
            </span>
            <span className="text-gray-400 text-xs">Total Messages: {messages.length}</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-red-500 animate-pulse" />
            Support Messages & Customer Inbox
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            ইউজারদের পাঠানো সব মেসেজ উপরে পেন্ডিং ব্যাজ সহ ভেসে থাকবে। মেসেজে ক্লিক করে বিস্তারিত দেখে উত্তর দিন।
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'ALL'
              ? 'bg-red-500/15 border-red-500/50 shadow-lg shadow-red-500/10'
              : 'bg-[#101422] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">মোট মেসেজ</span>
            <MessageCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-display">{messages.length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-[#101422] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              নতুন মেসেজ (Pending)
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-display">{pendingCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus('REPLIED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'REPLIED'
              ? 'bg-green-500/15 border-green-500/50 shadow-lg shadow-green-500/10'
              : 'bg-[#101422] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase">উত্তর দেওয়া হয়েছে</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-400 mt-1 font-display">{repliedCount}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-4 bg-[#101422] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Player Name, Email, Subject, or Message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Split View Inbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Messages List (4 or 5 cols) */}
        <div className="lg:col-span-5 bg-[#101422] border border-white/10 rounded-2xl p-4 space-y-3 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Inbox Player Messages ({filteredMessages.length})
            </span>
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {pendingCount} New Message(s)
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-red-500 font-gaming animate-pulse text-xs">
              LOADING MESSAGES...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              কোনো সাপোর্ট মেসেজ পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id
                const isPending = msg.status === 'PENDING'

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 shadow-md'
                        : isPending
                        ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15'
                        : 'bg-[#141826] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {msg.userAvatar ? (
                          <img
                            src={msg.userAvatar}
                            alt={msg.userName}
                            className="w-7 h-7 rounded-full border border-red-500/40 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-600/30 border border-red-500/40 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {msg.userName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <span className="font-bold text-white text-xs block truncate leading-none">
                            {msg.userName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono truncate block mt-0.5">
                            {msg.userEmail}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[9px] uppercase animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" /> NEW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-bold">
                            REPLIED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-red-400 truncate mt-1">
                      {msg.subject}
                    </div>
                    <p className="text-[11px] text-gray-300 line-clamp-2 mt-0.5 leading-tight">
                      {msg.message}
                    </p>

                    <div className="text-[10px] text-gray-500 font-mono text-right mt-1">
                      {new Date(msg.createdAt).toLocaleString('bn-BD', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Message Details & Reply Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#101422] border border-white/10 rounded-2xl p-6 space-y-5">
          {!selectedMessage ? (
            <div className="text-center py-24 text-gray-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm">বামে তালিকা থেকে একটি প্লেয়ারের মেসেজ সিলেক্ট করুন।</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Message Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  {selectedMessage.userAvatar ? (
                    <img
                      src={selectedMessage.userAvatar}
                      alt={selectedMessage.userName}
                      className="w-12 h-12 rounded-full border-2 border-red-500/50 object-cover shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-600/30 border-2 border-red-500/50 flex items-center justify-center text-white font-bold text-lg">
                      {selectedMessage.userName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-base leading-none">
                      {selectedMessage.userName}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono block mt-1">
                      {selectedMessage.userEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5 ${
                      selectedMessage.status === 'REPLIED'
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                        : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {selectedMessage.status === 'REPLIED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> REPLIED
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> PENDING ADMIN REPLY
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Player Message Box */}
              <div className="bg-[#141826] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-red-400 uppercase tracking-wide">
                    বিষয়: {selectedMessage.subject}
                  </span>
                  <span className="text-gray-400 font-mono text-[11px]">
                    {new Date(selectedMessage.createdAt).toLocaleString('bn-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Existing Admin Reply Box */}
              {selectedMessage.adminReply && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Admin Reply Sent:
                    </span>
                    {selectedMessage.repliedAt && (
                      <span className="text-[10px] text-gray-400 font-mono font-normal">
                        {new Date(selectedMessage.repliedAt).toLocaleString('bn-BD', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-emerald-100 whitespace-pre-wrap">
                    {selectedMessage.adminReply}
                  </p>
                </div>
              )}

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-gray-300 uppercase">
                  {selectedMessage.adminReply ? 'Update Response' : 'Write Response to Player'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="প্লেয়ারের মেসেজের উত্তর লিখুন (ইউজার ড্যাশবোর্ডে সাথে সাথে দেখতে পাবে)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
                ></textarea>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
