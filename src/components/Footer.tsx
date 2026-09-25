import Link from '@/components/ui/Link'
import { Heart, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#050608] border-t border-white/5 pt-10 pb-8 text-gray-400 font-sans">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-white/5 pb-8">
          
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 text-red-600 fill-current drop-shadow-[0_0_10px_rgba(229,9,20,0.6)]" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
              <span className="font-display text-2xl font-black text-white uppercase tracking-wider">
                KONGKAAL <span className="text-[#e50914] italic font-extrabold">GAMING</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm">
              Empowering Next-Gen Esports Gamers with Instant Automated Tournaments, Fair Play & Lightning Fast Cash Payouts! 🎮⚡
            </p>
          </div>

          {/* Inspiring Message Badge */}
          <div className="bg-[#0c0f17] border border-amber-500/30 rounded-2xl p-4 text-center space-y-1 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PLAY • FIGHT • WIN</span>
            </div>
            <p className="text-xs text-gray-300 font-semibold italic">
              "Every champion was once a contender that refused to give up. Show your skill and dominate the battlefield!" 🏆🔥
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col md:items-end gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect With Us</span>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-300">
              <Link href="#" className="hover:text-red-500 transition-colors no-underline bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Facebook</Link>
              <Link href="#" className="hover:text-red-500 transition-colors no-underline bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">YouTube</Link>
              <Link href="#" className="hover:text-red-500 transition-colors no-underline bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Discord</Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & HaqPlus IT Developer Line */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© 2026 KongKaaL Gaming. All rights reserved.</span>
          </div>

          {/* HaqPlus IT Developer Credit */}
          <div className="flex items-center gap-2 bg-[#0e121d] px-4 py-2 rounded-full border border-emerald-500/30 shadow-md">
            <span className="text-gray-300 text-xs font-bold flex items-center gap-1">
              Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" /> by{' '}
              <strong className="text-white font-black">HaqPlus IT</strong>
            </span>

            <a
              href="https://wa.me/8801602867954?text=Hello%20HaqPlus%20IT!%20I%20saw%20KongKaaL%20Gaming%20website%20and%20want%20to%20build%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 no-underline transition-all shadow-sm"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp: 01602867954</span>
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}
