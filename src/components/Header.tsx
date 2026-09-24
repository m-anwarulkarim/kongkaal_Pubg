import { useState } from 'react'

interface HeaderProps {
  onRegisterClick?: () => void
}

export default function Header({ onRegisterClick }: HeaderProps) {
  const [activeTab, setActiveTab] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Tournaments', href: '#tournaments' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Players', href: '#players' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#07080b]/95 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* KongKaaL GAMING Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline group">
          <div className="relative flex items-center justify-center">
            {/* Crown Icon */}
            <svg className="w-8 h-8 text-red-600 fill-current drop-shadow-[0_0_10px_rgba(229,9,20,0.6)]" viewBox="0 0 24 24">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black tracking-wider text-white leading-none uppercase">
              KONGKAAL <span className="text-[#e50914] italic font-extrabold tracking-normal">GAMING</span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-sans text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeTab === item.label
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveTab(item.label)}
                className={`px-3.5 py-1.5 rounded-full transition-all no-underline ${
                  isActive
                    ? 'bg-[#e50914] text-white font-bold shadow-md shadow-red-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && <span className="mr-1">🏠</span>}
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Search Bar & Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Search Box */}
          <div className="hidden lg:flex items-center bg-[#12151e] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-gray-300 w-56 focus-within:border-red-500 transition-colors">
            <input
              type="text"
              placeholder="Search players, PUBG ID..."
              className="bg-transparent border-none outline-none w-full text-xs text-gray-200 placeholder-gray-500"
            />
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          {/* Login & Register Buttons */}
          <button
            onClick={onRegisterClick}
            className="px-4 py-1.5 rounded-full text-xs font-bold font-gaming border border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            Login
          </button>
          
          <button
            onClick={onRegisterClick}
            className="px-4 py-1.5 rounded-full text-xs font-bold font-gaming bg-[#e50914] text-white hover:bg-red-600 transition-colors shadow-md shadow-red-600/30"
          >
            Register
          </button>

          {/* BD Country Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#12151e] border border-white/10 rounded-full px-2.5 py-1 text-xs text-gray-300">
            <span className="text-sm">🇧🇩</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0c0e14] px-4 py-3 mt-2 font-sans text-xs font-semibold">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-gray-300 hover:text-red-500 no-underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
