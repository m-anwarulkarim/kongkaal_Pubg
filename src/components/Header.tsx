import { useState, useEffect } from 'react'
import { Home, LogOut, User as UserIcon, ChevronDown, X, Menu, Trophy, Medal, Users, Info, PhoneCall } from 'lucide-react'
import Link from '@/components/ui/Link'
import { useCustomerAuth } from '@/lib/auth'
import CustomerAuthModal from '@/components/CustomerAuthModal'

interface HeaderProps {
  onRegisterClick?: () => void
}

export default function Header({ onRegisterClick: _onRegisterClick }: HeaderProps) {
  const [activeTab, setActiveTab] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Language & Flag Dropdown State
  const [selectedLang, setSelectedLang] = useState<'BN' | 'EN'>('BN')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kongkaal_lang')
      if (saved === 'EN' || saved === 'BN') {
        setSelectedLang(saved)
      }
    }
  }, [])

  const handleSelectLang = (lang: 'BN' | 'EN') => {
    setSelectedLang(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kongkaal_lang', lang)
    }
    setLangDropdownOpen(false)
  }

  const { user, signOut } = useCustomerAuth()

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tournaments', href: '/#tournaments', icon: Trophy },
    { label: 'Leaderboard', href: '/#leaderboard', icon: Medal },
    { label: 'Players', href: '/#players', icon: Users },
    { label: 'About', href: '/#about', icon: Info },
    { label: 'Contact', href: '/#contact', icon: PhoneCall },
  ]

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#07080b]/95 backdrop-blur-md border-b border-white/5 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          
          {/* KongKaaL GAMING Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 no-underline group shrink-0">
            <div className="relative flex items-center justify-center">
              {/* Crown Icon */}
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-red-600 fill-current drop-shadow-[0_0_10px_rgba(229,9,20,0.6)]" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-2xl font-black tracking-wider text-white leading-none uppercase">
                KONGKAAL <span className="text-[#e50914] italic font-extrabold tracking-normal">GAMING</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-sans text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = activeTab === item.label
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveTab(item.label)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full transition-all no-underline ${
                    isActive
                      ? 'bg-[#e50914] text-white font-bold shadow-md shadow-red-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Search Bar & Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
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

            {/* Auth Button or User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-[#12151e] border border-red-500/40 hover:bg-red-950/30 transition-all cursor-pointer"
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName || 'User'} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-red-500 object-cover" />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-gray-200 max-w-[100px] truncate">{userName}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0e101a] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-white/5 flex items-center gap-2 no-underline font-bold"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Dashboard & Wallet</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        setAuthModalOpen(true)
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false)
                        await signOut()
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 border-t border-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-gaming border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                {/* Small Google G Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Login</span>
              </button>
            )}

            {/* Flag & Language Selector Dropdown (Hidden on Mobile, Visible on Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 bg-[#12151e] hover:bg-[#1a1f2e] border border-white/10 rounded-full px-2.5 py-1 text-xs text-gray-300 transition-all cursor-pointer select-none"
                title="Select Language / ভাষা সিলেক্ট করুন"
              >
                {selectedLang === 'BN' ? (
                  <div className="flex items-center gap-1.5">
                    {/* Bangladesh Flag SVG */}
                    <svg className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0 shadow-sm border border-black/40" viewBox="0 0 20 12">
                      <rect width="20" height="12" fill="#006a4e" />
                      <circle cx="9" cy="6" r="3.6" fill="#f42a41" />
                    </svg>
                    <span className="font-bold text-[10px] text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">BD</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {/* US Flag SVG */}
                    <svg className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0 shadow-sm border border-black/40" viewBox="0 0 190 100">
                      <rect width="190" height="100" fill="#bb133e"/>
                      <rect y="15.38" width="190" height="15.38" fill="#fff"/>
                      <rect y="46.15" width="190" height="15.38" fill="#fff"/>
                      <rect y="76.92" width="190" height="15.38" fill="#fff"/>
                      <rect width="76" height="53.85" fill="#002147"/>
                    </svg>
                    <span className="font-bold text-[10px] text-blue-400 bg-blue-950/80 px-1 rounded border border-blue-500/30">US</span>
                  </div>
                )}
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu */}
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0e101a] border border-white/10 rounded-2xl shadow-2xl py-1 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Language / ভাষা
                  </div>

                  {/* Bangladesh Option */}
                  <button
                    onClick={() => handleSelectLang('BN')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                      selectedLang === 'BN' ? 'bg-emerald-950/40 text-emerald-400' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0 shadow-sm border border-black/40" viewBox="0 0 20 12">
                        <rect width="20" height="12" fill="#006a4e" />
                        <circle cx="9" cy="6" r="3.6" fill="#f42a41" />
                      </svg>
                      <span>বাংলা (BD)</span>
                    </div>
                    {selectedLang === 'BN' && <span className="text-emerald-400 font-black">✓</span>}
                  </button>

                  {/* United States Option */}
                  <button
                    onClick={() => handleSelectLang('EN')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                      selectedLang === 'EN' ? 'bg-blue-950/40 text-blue-400' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0 shadow-sm border border-black/40" viewBox="0 0 190 100">
                        <rect width="190" height="100" fill="#bb133e"/>
                        <rect y="15.38" width="190" height="15.38" fill="#fff"/>
                        <rect y="46.15" width="190" height="15.38" fill="#fff"/>
                        <rect y="76.92" width="190" height="15.38" fill="#fff"/>
                        <rect width="76" height="53.85" fill="#002147"/>
                      </svg>
                      <span>English (US)</span>
                    </div>
                    {selectedLang === 'EN' && <span className="text-blue-400 font-black">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Sidebar */}
          <div className="relative z-10 w-4/5 max-w-xs bg-[#0c0e18] border-l border-white/10 h-full flex flex-col justify-between p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <Link href="/" className="flex items-center gap-2 no-underline" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-7 h-7 text-red-600 fill-current drop-shadow-[0_0_10px_rgba(229,9,20,0.6)]" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                  </svg>
                  <span className="font-display text-lg font-black tracking-wider text-white leading-none uppercase">
                    KONGKAAL <span className="text-[#e50914] italic font-extrabold">GAMING</span>
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>

              {/* Sidebar Navigation Items */}
              <div className="space-y-1.5 font-sans">
                {navItems.map((item) => {
                  const isActive = activeTab === item.label
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        setActiveTab(item.label)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline text-sm font-bold ${
                        isActive
                          ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-red-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Sidebar Bottom Auth & Actions */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {/* Language Selector inside Mobile Drawer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-gray-300 font-bold">Language / ভাষা:</span>
                <div className="flex items-center gap-1 bg-[#12151e] p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => handleSelectLang('BN')}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      selectedLang === 'BN' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-2.5 rounded-[1px] overflow-hidden shrink-0" viewBox="0 0 20 12">
                      <rect width="20" height="12" fill="#006a4e" />
                      <circle cx="9" cy="6" r="3.6" fill="#f42a41" />
                    </svg>
                    <span>BD</span>
                  </button>
                  <button
                    onClick={() => handleSelectLang('EN')}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      selectedLang === 'EN' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-2.5 rounded-[1px] overflow-hidden shrink-0" viewBox="0 0 190 100">
                      <rect width="190" height="100" fill="#bb133e"/>
                      <rect y="15.38" width="190" height="15.38" fill="#fff"/>
                      <rect y="46.15" width="190" height="15.38" fill="#fff"/>
                      <rect y="76.92" width="190" height="15.38" fill="#fff"/>
                      <rect width="76" height="53.85" fill="#002147"/>
                    </svg>
                    <span>US</span>
                  </button>
                </div>
              </div>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName || 'User'} className="w-9 h-9 rounded-full border border-red-500 object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 no-underline transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span>My Dashboard & Wallet</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false)
                      await signOut()
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setAuthModalOpen(true)
                  }}
                  className="w-full py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
      />
    </>
  )
}

