import { useState } from 'react'
import {
  MessageCircle,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Headphones,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Clock,
  ExternalLink,
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
    <section id="contact" className="py-20 bg-[#07090e] border-t border-b border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-gaming text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-red-500" />
            24/7 SUPPORT & HELP CENTER
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            GET IN TOUCH WITH <span className="text-[#e50914]">KONGKAAL</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            ম্যাচ এন্ট্রি, রুম আইডি ও পাসওয়ার্ড প্রাপ্তি, ক্যাশআউট বা অন্য যেকোনো জিজ্ঞাসায় আমাদের এক্সপার্ট কাস্টমার সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        {/* Top 3 Quick Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: WhatsApp Support */}
          <div className="bg-[#0e121d] border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Instant Chat
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase mb-1">
              WhatsApp Support
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              যেকোনো দ্রুত সাহায্যের জন্য আমাদের অফিসিয়াল হোয়াটসঅ্যাপে মেসেজ বা কল দিন।
            </p>
            <div className="space-y-1 mb-5 text-xs text-gray-300 font-semibold font-mono">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>+880 1602-867954</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active 24 Hours / 7 Days</span>
              </div>
            </div>
            <a
              href="https://wa.me/8801602867954?text=Hello%20KongKaaL%20Support!%20I%20need%20help%20with%20tournament%20match."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 no-underline shadow-lg shadow-emerald-600/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Card 2: Email & Official Helpdesk */}
          <div className="bg-[#0e121d] border border-red-500/30 hover:border-red-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                Official Mail
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase mb-1">
              Email Helpdesk
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              স্পনসরশিপ, টুর্নামেন্ট পার্টনারশিপ বা বিজনেস সংক্রান্ত বিষয়ে ইমেইল করুন।
            </p>
            <div className="space-y-1 mb-5 text-xs text-gray-300 font-semibold font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span>kongkaal2026@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>support@kongkaalgaming.com</span>
              </div>
            </div>
            <a
              href="mailto:kongkaal2026@gmail.com?subject=KongKaaL%20Esports%20Inquiry"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 no-underline shadow-lg shadow-red-600/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </a>
          </div>

          {/* Card 3: Community & Office Hub */}
          <div className="bg-[#0e121d] border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                Dhaka, BD
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase mb-1">
              Esports Gaming Hub
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              কংকাল গেইমিং অফিসিয়াল হেডকোয়ার্টার এবং ডিসকর্ড কমিউনিটি হাব।
            </p>
            <div className="space-y-1 mb-5 text-xs text-gray-300 font-semibold font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Discord Room & Pass Channel</span>
              </div>
            </div>
            <a
              href="https://wa.me/8801602867954"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 no-underline shadow-lg shadow-amber-500/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Community
            </a>
          </div>
        </div>

        {/* Main Support Form & Direct Message Box */}
        <div className="bg-[#0b0e15] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-gaming text-[11px] font-bold uppercase tracking-widest inline-block">
                Direct Message Form
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-black text-white uppercase leading-tight">
                HAVE A QUESTION? <br />
                <span className="text-red-500">SEND US A MESSAGE</span>
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                আপনার যেকোনো সমস্যা বা তথ্যের জন্য নিচের ফর্মটি পূরণ করুন। আমাদের টুর্নামেন্ট টিম সরাসরি আপনার হোয়াটসঅ্যাপে রিপ্লাই প্রদান করবে।
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Room ID Notice</h4>
                    <p className="text-[11px] text-gray-400">ম্যাচ শুরু হওয়ার ১৫ মিনিট আগে রুম পাস পাবেন।</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
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
            <div className="lg:col-span-7 bg-[#121622] border border-white/10 rounded-2xl p-6 sm:p-8">
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
    </section>
  )
}
