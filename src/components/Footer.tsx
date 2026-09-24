import Link from '@/components/ui/Link'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#050608] border-t border-white/5 py-8 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 fill-current" viewBox="0 0 24 24">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
            <span className="font-display text-xl font-black text-white uppercase tracking-wider">
              KONGKAAL <span className="text-[#e50914] italic font-extrabold">GAMING</span>
            </span>
            <span className="hidden sm:inline text-xs text-gray-600 font-semibold border-l border-gray-800 pl-3">
              Play • Compete • Win | KongKaaL Gaming
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="#" className="hover:text-red-500 transition-colors no-underline">Facebook</Link>
            <Link href="#" className="hover:text-red-500 transition-colors no-underline">YouTube</Link>
            <Link href="#" className="hover:text-red-500 transition-colors no-underline">Discord</Link>
            <Link href="#" className="hover:text-red-500 transition-colors no-underline">TikTok</Link>
            <Link href="https://wa.me/8801700000000" className="hover:text-emerald-400 transition-colors no-underline">WhatsApp</Link>
          </div>

          {/* Copyright */}
          <div className="text-[11px] font-medium text-gray-500">
            © 2025 KongKaaL Gaming. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  )
}
