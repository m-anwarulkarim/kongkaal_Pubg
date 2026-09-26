import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  User,
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import {
  getSupportMessages,
  replySupportMessage,
  deleteSupportMessage,
  type SupportMessage,
} from '@/lib/support'

export default function MessagesTab() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'REPLIED'>('ALL')

  // Reply Modal State
  const [replyingMessage, setReplyingMessage] = useState<SupportMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = () => {
    setLoading(true)
    try {
      const data = getSupportMessages()
      setMessages(data)
    } catch (err) {
      console.error('Failed to load support messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenReplyModal = (msg: SupportMessage) => {
    setReplyingMessage(msg)
    setReplyText(msg.adminReply || '')
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyingMessage || !replyText.trim()) return

    setSubmitting(true)
    const res = replySupportMessage(replyingMessage.id, replyText.trim())
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyingMessage.id
            ? {
                ...m,
                adminReply: replyText.trim(),
                repliedAt: new Date().toISOString(),
                status: 'REPLIED',
              }
            : m
        )
      )
      setReplyingMessage(null)
      setReplyText('')
    } else {
      alert('রেসপন্স পাঠানো ব্যর্থ হয়েছে!')
    }
    setSubmitting(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেসেজটি মুছে ফেলতে চান?')) return
    const res = deleteSupportMessage(id)
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id))
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
            Support Messages & Customer Inquiries
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            প্লেয়ারদের পাঠানো যাবতীয় সাপোর্ট মেসেজ দেখুন এবং এডমিন হিসেবে সরাসরি রিপ্লাই দিন।
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
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
        </div>

        <div
          onClick={() => setFilterStatus('PENDING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-[#101422] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">অপেক্ষারত (Pending)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-display">{pendingCount}</div>
        </div>

        <div
          onClick={() => setFilterStatus('REPLIED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'REPLIED'
              ? 'bg-green-500/15 border-green-500/50 shadow-lg shadow-green-500/10'
              : 'bg-[#101422] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase">রিপ্লাই দেওয়া শেষ</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-400 mt-1 font-display">{repliedCount}</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#101422] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Player Name, Email, Subject, or Message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Messages List / Table */}
      <div className="bg-[#101422] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-red-500 font-gaming animate-pulse">
            LOADING CUSTOMER MESSAGES...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm font-medium">কোনো সাপোর্ট মেসেজ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-5 hover:bg-white/[0.02] transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {msg.userAvatar ? (
                      <img
                        src={msg.userAvatar}
                        alt={msg.userName}
                        className="w-10 h-10 rounded-full border border-red-500/40 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm">{msg.userName}</h4>
                        <span className="text-xs text-gray-400 font-mono">({msg.userEmail})</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block">
                        {new Date(msg.createdAt).toLocaleString('bn-BD', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1.5 ${
                        msg.status === 'REPLIED'
                          ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                          : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {msg.status === 'REPLIED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Replied
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Pending Reply
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => handleOpenReplyModal(msg)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {msg.adminReply ? 'Edit Reply' : 'Reply'}
                    </button>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-1.5">
                  <div className="text-xs font-bold text-red-400 uppercase tracking-wide">
                    বিষয়: {msg.subject}
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                {/* Admin Reply Box if present */}
                {msg.adminReply && (
                  <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-4 space-y-1.5 ml-4 sm:ml-8">
                    <div className="flex items-center justify-between text-xs font-bold text-green-400">
                      <span className="flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" /> Admin Response
                      </span>
                      {msg.repliedAt && (
                        <span className="text-[10px] text-gray-400 font-mono font-normal">
                          {new Date(msg.repliedAt).toLocaleString('bn-BD', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-100 whitespace-pre-wrap">{msg.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101422] border border-red-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                  Reply to {replyingMessage.userName}
                </h3>
              </div>
              <button
                onClick={() => setReplyingMessage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Message Preview */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-1 text-xs">
              <span className="text-gray-400 font-bold block">
                User Question ({replyingMessage.subject}):
              </span>
              <p className="text-gray-300 italic">"{replyingMessage.message}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">
                  Admin Reply Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="প্লেয়ারের মেসেজের উত্তর লিখুন..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReplyingMessage(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
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
        </div>
      )}
    </div>
  )
}
