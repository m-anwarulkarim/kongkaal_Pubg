import { useState } from 'react'
import {
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Headphones,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Clock,
  ExternalLink,
  QrCode,
  X,
  Zap,
} from 'lucide-react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    playerUid: '',
    phone: '',
    subject: 'Room ID & Password Issue',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.message) {
      alert('দয়া করে আপনার নাম, হোয়াটসঅ্যাপ নাম্বার এবং মেসেজ সঠিকভাবে লিখুন।')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#07090e] border-t border-b border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-gaming text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-red-500" />
            24/7 SUPPORT & HELP CENTER
          </span>
          <h2 className="font-display text-3xl sm:text-6xl font-black text-white uppercase tracking-tight">
            GET IN TOUCH WITH <span className="text-[#e50914]">KONGKAAL</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-base leading-relaxed px-2">
            ম্যাচ এন্ট্রি, রুম আইডি ও পাসওয়ার্ড প্রাপ্তি, ক্যাশআউট বা অন্য যেকোনো জিজ্ঞাসায় আমাদের এক্সপার্ট কাস্টমার সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        {/* 3 Quick Contact Info Cards:
            Mobile: Row 1 has 1 card (full width), Row 2 has 2 cards (side-by-side grid-cols-2)
            Desktop: 3 cards in 1 row (md:grid-cols-3) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          
          {/* Card 1: WhatsApp Support (Full Row on Mobile col-span-2) */}
          <div className="col-span-2 md:col-span-1 bg-gradient-to-b from-emerald-950/40 via-[#0d121c] to-[#080b12] border border-emerald-500/40 hover:border-emerald-500 rounded-3xl p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl shadow-emerald-950/30 group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  INSTANT CHAT
                </span>
              </div>

              <h3 className="font-display text-lg sm:text-2xl font-black text-white uppercase tracking-tight mb-1">
                WHATSAPP SUPPORT
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed">
                যেকোনো দ্রুত সাহায্যের জন্য আমাদের অফিসিয়াল হোয়াটসঅ্যাপে মেসেজ বা কল দিন।
              </p>

              <div className="space-y-1.5 mb-6 text-xs sm:text-sm text-emerald-300 font-bold font-mono bg-black/40 p-3 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>+880 1980-184366</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400 font-normal">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Active 24 Hours / 7 Days</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
              <a
                href="https://wa.me/8801980184366?text=Hello%20KongKaaL%20Support!%20I%20need%20help%20with%20tournament%20match."
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-gaming font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 no-underline shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>CHAT</span>
              </a>
              <button
                onClick={() => setQrModalOpen(true)}
                className="py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-gaming font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>SCAN QR</span>
              </button>
            </div>
          </div>

          {/* Card 2: Email Helpdesk (Half Row 1 on Mobile col-span-1) */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-b from-red-950/40 via-[#0d121c] to-[#080b12] border border-red-500/40 hover:border-red-500 rounded-3xl p-4 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl shadow-red-950/30 group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/20">
                  <Mail className="w-4 h-4 sm:w-7 sm:h-7" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] sm:text-xs font-black uppercase tracking-wider">
                  OFFICIAL MAIL
                </span>
              </div>

              <h3 className="font-display text-base sm:text-2xl font-black text-white uppercase tracking-tight mb-1">
                EMAIL HELPDESK
              </h3>
              <p className="text-[11px] sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">
                স্পনসরশিপ বা টুর্নামেন্ট পার্টনারশিপ বিষয়ে ইমেইল করুন।
              </p>

              <div className="space-y-1 mb-4 sm:mb-6 text-[10px] sm:text-xs text-red-300 font-semibold font-mono bg-black/40 p-2.5 sm:p-3 rounded-2xl border border-red-500/20 overflow-hidden">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">kongkaal2026@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 truncate text-gray-400 font-normal">
                  <Sparkles className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">support@kongkaal.com</span>
                </div>
              </div>
            </div>

            <a
              href="mailto:kongkaal2026@gmail.com?subject=KongKaaL%20Esports%20Inquiry"
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-gaming font-extrabold text-[11px] sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 no-underline shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>SEND EMAIL</span>
            </a>
          </div>

          {/* Card 3: WhatsApp Channel (Half Row 2 on Mobile col-span-1) */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-b from-teal-950/40 via-[#0d121c] to-[#080b12] border border-teal-500/40 hover:border-teal-500 rounded-3xl p-4 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl shadow-teal-950/30 group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-2xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/20">
                  <Zap className="w-4 h-4 sm:w-7 sm:h-7 text-amber-400" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[9px] sm:text-xs font-black uppercase tracking-wider">
                  OFFICIAL CHANNEL
                </span>
              </div>

              <h3 className="font-display text-base sm:text-2xl font-black text-white uppercase tracking-tight mb-1">
                WHATSAPP CHANNEL
              </h3>
              <p className="text-[11px] sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">
                হোয়াটসঅ্যাপ চ্যানেলে জয়েন করুন রুম আইডি ও পাসওয়ার্ড আপডেটের জন্য।
              </p>

              <div className="space-y-1 mb-4 sm:mb-6 text-[10px] sm:text-xs text-teal-300 font-semibold font-mono bg-black/40 p-2.5 sm:p-3 rounded-2xl border border-teal-500/20 overflow-hidden">
                <div className="flex items-center gap-1.5 truncate">
                  <MessageCircle className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">KongKaaL Gaming Official</span>
                </div>
                <div className="flex items-center gap-1.5 truncate text-gray-400 font-normal">
                  <HelpCircle className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">Instant Room ID & Notices</span>
                </div>
              </div>
            </div>

            <a
              href="https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-gaming font-extrabold text-[10px] sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 no-underline shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span className="truncate">JOIN CHANNEL</span>
            </a>
          </div>

        </div>

        {/* Main Support Form & Direct Message Box */}
        <div className="bg-[#0b0e15] border border-white/10 rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-gaming text-[11px] font-bold uppercase tracking-widest inline-block">
                Direct Message Form
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
                HAVE A QUESTION? <br />
                <span className="text-red-500">SEND US A MESSAGE</span>
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                আপনার যেকোনো সমস্যা বা তথ্যের জন্য নিচের ফর্মটি পূরণ করুন। আমাদের টুর্নামেন্ট টিম সরাসরি আপনার হোয়াটসঅ্যাপে রিপ্লাই প্রদান করবে।
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Room ID Notice</h4>
                    <p className="text-[11px] text-gray-400">ম্যাচ শুরু হওয়ার ১৫ মিনিট আগে রুম পাস পাবেন।</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Cashout Payout</h4>
                    <p className="text-[11px] text-gray-400">ম্যাচ শেষে বিকাশ বা নগদে সরাসরি টাকা পেয়ে যাবেন।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7 bg-[#121622] border border-white/10 rounded-2xl p-5 sm:p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-display text-2xl font-black text-white uppercase">
                    MESSAGE SENT SUCCESSFULLY!
                  </h4>
                  <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    ধন্যবাদ, <strong className="text-white">{formData.name}</strong>! আপনার মেসেজটি আমাদের সাপোর্ট প্যানেলে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার হোয়াটসঅ্যাপে ({formData.phone}) যোগাযোগ করবে।
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({
                        name: '',
                        playerUid: '',
                        phone: '',
                        subject: 'Room ID & Password Issue',
                        message: '',
                      })
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="আপনার নাম লিখুন"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                        PUBG Player UID / IGN
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5123456789 / VIP_SHADOW"
                        value={formData.playerUid}
                        onChange={(e) => setFormData({ ...formData, playerUid: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01700000000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                        Select Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="Room ID & Password Issue">Room ID & Password Issue</option>
                        <option value="Wallet Balance Add / Deduct">Wallet Balance Add / Deduct</option>
                        <option value="Match Prize Payout Request">Match Prize Payout Request</option>
                        <option value="Tournament Rules Inquiry">Tournament Rules Inquiry</option>
                        <option value="Other Technical Issue">Other Technical Issue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending Message...' : 'Send Message To Support'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e121d] border border-emerald-500/40 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h4 className="font-display font-bold text-white text-base uppercase">
                  KongKaaL WhatsApp QR
                </h4>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-600/10 border border-emerald-500/30 rounded-2xl">
              <div className="p-3 bg-white rounded-2xl max-w-[220px] mx-auto shadow-xl">
                <img
                  src="/whatsapp_qr.png"
                  alt="KongKaaL WhatsApp QR Code"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
              <p className="text-xs text-emerald-300 font-medium mt-3 leading-relaxed">
                মোবাইল ফোনের হোয়াটসঅ্যাপ ক্যামেরা দিয়ে সরাসরি এই **QR Code** স্ক্যান করে যুক্ত হন!
              </p>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
