import { useState } from 'react'

interface HeaderProps {
  onBookClick: () => void
}

export default function Header({ onBookClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(245,166,35,0.2)] bg-[#0b0e14]/90 backdrop-blur-md">
      {/* Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-4 py-1 text-center text-xs font-bold text-black tracking-wide uppercase">
        <span className="inline-block animate-pulse mr-2">🔴 LIVE NOW:</span>
        PUBG Mobile Erangel Squad Match Tonight at 9:00 PM | Total Prize ৳5,000 | Limited Slots Remaining!
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 no-underline group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <svg className="h-7 w-7 text-black fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="block font-display text-2xl font-extrabold tracking-wider text-white leading-none">
              PUBG <span className="text-amber-400">TOURNAMENT</span>
            </span>
            <span className="block text-[10px] font-bold text-amber-500/80 tracking-widest uppercase">
              Official BD Esports Arena
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-gaming text-sm font-bold tracking-wider text-gray-300">
          <a href="#matches" className="hover:text-amber-400 transition-colors no-underline">
            MATCHES
          </a>
          <a href="#modes" className="hover:text-amber-400 transition-colors no-underline">
            SOLO / DUO / SQUAD
          </a>
          <a href="#payment-rules" className="hover:text-amber-400 transition-colors no-underline">
            HOW TO PAY
          </a>
          <a href="#rules" className="hover:text-amber-400 transition-colors no-underline">
            RULES
          </a>
          <a href="#leaderboard" className="hover:text-amber-400 transition-colors no-underline">
            WINNERS
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors no-underline">
            FAQ
          </a>
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBookClick}
            className="pubg-btn-primary px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
          >
            <span>🎮</span>
            <span>BOOK SLOT</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-500/20 bg-[#0c1017] px-4 py-4 font-gaming text-sm font-bold tracking-wider text-gray-200">
          <div className="flex flex-col gap-3">
            <a
              href="#matches"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              🎯 MATCHES & SLOTS
            </a>
            <a
              href="#modes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              ⚔️ SOLO / DUO / SQUAD MODES
            </a>
            <a
              href="#payment-rules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              💳 HOW TO PAY (bKash/Nagad)
            </a>
            <a
              href="#rules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              📜 TOURNAMENT RULES
            </a>
            <a
              href="#leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              🏆 RECENT WINNERS
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-amber-400 no-underline"
            >
              ❓ FREQUENTLY ASKED QUESTIONS
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
