export default function Footer() {
  return (
    <footer className="bg-[#05070a] border-t border-amber-500/20 py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <svg className="h-6 w-6 text-black fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display text-2xl font-extrabold text-white">
                PUBG <span className="text-amber-400">ESPORTS BD</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md mb-4">
              বাংলাদেশের সবচাইতে নির্ভরযোগ্য ও জনপ্রিয় PUBG Mobile Custom Match প্লাটফর্ম। Solo, Duo এবং Squad ম্যাচের সঠিক টাইম, স্বচ্ছ পেমেন্ট এবং তাৎক্ষণিক প্রাইজ মানি পেআউট নিশ্চয়তা।
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="pubg-btn-green px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 no-underline"
              >
                <span>💬 WHATSAPP SUPPORT: 01700-000000</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-gaming text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              QUICK NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#matches" className="hover:text-amber-400 no-underline transition-colors">🔥 Upcoming Matches</a></li>
              <li><a href="#modes" className="hover:text-amber-400 no-underline transition-colors">⚔️ Solo / Duo / Squad Modes</a></li>
              <li><a href="#payment-rules" className="hover:text-amber-400 no-underline transition-colors">💳 Payment Guide (bKash/Nagad)</a></li>
              <li><a href="#rules" className="hover:text-amber-400 no-underline transition-colors">📜 Tournament Rules</a></li>
              <li><a href="#leaderboard" className="hover:text-amber-400 no-underline transition-colors">🏆 Winner Hall of Fame</a></li>
            </ul>
          </div>

          {/* Payment Partners */}
          <div className="md:col-span-4">
            <h4 className="font-gaming text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              ACCEPTED PAYMENT METHODS
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-lg bg-pink-950/40 border border-pink-500/50 text-pink-400 font-bold text-xs">
                💖 bKash Personal
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/50 text-orange-400 font-bold text-xs">
                🟠 Nagad Personal
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/50 text-purple-400 font-bold text-xs">
                🚀 Rocket Personal
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              *All match payments must be completed via Send Money before slot confirmation.
            </p>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} PUBG Mobile Esports BD. All Rights Reserved.</p>
          <p>This website is an independent tournament community and is not directly affiliated with Krafton or Tencent Games.</p>
        </div>
      </div>
    </footer>
  )
}
