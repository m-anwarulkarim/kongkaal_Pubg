import React, { useState, useEffect } from 'react'
import { X, Send, Sparkles, QrCode } from 'lucide-react'

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string
  defaultMessage?: string
  agentName?: string
}

export default function WhatsAppFloatingButton({
  phoneNumber = '8801980184366',
  defaultMessage = 'হ্যালো! আমি KongKaaL Gaming টুর্নামেন্ট সম্পর্কে জানতে চাই।',
  agentName = 'KongKaaL Support',
}: WhatsAppFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotificationBadge, setShowNotificationBadge] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showQr, setShowQr] = useState(false)

  // Auto pop-up suggestion bubble after 4 seconds if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true)
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [hasInteracted])

  const encodedMessage = encodeURIComponent(defaultMessage)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  const handleToggle = () => {
    setHasInteracted(true)
    setShowNotificationBadge(false)
    setIsOpen(!isOpen)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    setHasInteracted(true)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* 1. Interactive Chat Box / Tooltip Card */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-72 sm:w-80 rounded-2xl bg-[#0d1117] border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-lg font-gaming text-emerald-100 shadow-inner">
                  K
                </div>
                {/* Online indicator dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0d1117] rounded-full animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5 font-gaming tracking-wide">
                  {agentName}
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h4>
                <p className="text-xs text-emerald-100/90 flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  অনলাইন আছেন (২৪/৭ সাপোর্ট)
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
              title="বন্ধ করুন"
              aria-label="Close message popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#0a0d14]/90 space-y-3">
            {showQr ? (
              <div className="space-y-3 text-center animate-in fade-in zoom-in duration-200">
                <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/50 shadow-inner max-w-[200px] mx-auto overflow-hidden">
                  <img
                    src="/whatsapp_qr.png"
                    alt="KongKaaL WhatsApp QR Code"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-gray-300 font-medium leading-tight">
                  মোবাইল দিয়ে ক্যামেরা অন করে এই <strong className="text-emerald-400">QR Code</strong> স্ক্যান করুন এবং সরাসরি চ্যাট শুরু করুন!
                </p>
                <button
                  onClick={() => setShowQr(false)}
                  className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold transition-colors"
                >
                  ← Back to Options
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#141b26] p-3 rounded-2xl rounded-tl-none border border-emerald-500/10 text-xs text-gray-200 leading-relaxed shadow-sm">
                  <p className="font-medium text-emerald-400 mb-1">স্বাগতম KongKaaL Gaming এ! 👋</p>
                  <p>পেমেন্ট, রুম আইডি অথবা ম্যাচ আপডেট পেতে আমাদের অফিশিয়াল ওয়াটসঅ্যাপ চ্যানেলে যুক্ত থাকুন!</p>
                  <span className="block text-[10px] text-gray-400 mt-1.5 text-right">এখনই অনলাইন</span>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2">
                  <a
                    href="https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasInteracted(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold font-gaming text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 no-underline"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-950" />
                    Join WhatsApp Channel
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setHasInteracted(true)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold font-gaming text-[11px] tracking-wide rounded-xl border border-white/10 transition-all no-underline"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      Direct Chat
                    </a>

                    <button
                      onClick={() => setShowQr(true)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold font-gaming text-[11px] tracking-wide rounded-xl border border-emerald-500/30 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      Scan QR Code
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating Action Button Container */}
      <div className="relative pointer-events-auto group">
        {/* Animated outer ring ping */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/40 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse"></span>

        {/* Floating WhatsApp Button */}
        <button
          onClick={handleToggle}
          aria-label="Contact support on WhatsApp"
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white rounded-full shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/80 transition-all duration-300 hover:scale-110 active:scale-95 animate-wa-pulse focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          {/* Unread notification badge dot */}
          {showNotificationBadge && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">
                1
              </span>
            </span>
          )}

          {/* Icon state toggle */}
          {isOpen ? (
            <X className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-300 rotate-90" />
          ) : (
            /* Custom WhatsApp SVG Icon */
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-md transition-transform duration-300 group-hover:rotate-12"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
