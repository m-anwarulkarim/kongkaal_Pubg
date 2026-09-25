import type { AdminTabType } from '../types'
import {
  Crown,
  Sparkles,
  X,
  LayoutDashboard,
  CreditCard,
  Wallet,
  Gamepad2,
  Users,
  Trophy,
  Settings,
  LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: AdminTabType
  setActiveTab: (tab: AdminTabType) => void
  pendingCount: number
  matchesCount: number
  handleLogout: () => void
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  pendingCount,
  matchesCount,
  handleLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0c0f17] border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Top Brand Logo Area */}
        <div>
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
                <Crown className="w-6 h-6" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col leading-none">
                  <span className="font-display text-lg font-black tracking-wider text-white uppercase">
                    KONGKAAL
                  </span>
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> PRO ADMIN
                  </span>
                </div>
              )}
            </div>

            {/* Close Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {/* Overview */}
            <button
              onClick={() => {
                setActiveTab('OVERVIEW')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'OVERVIEW'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Overview Dashboard</span>
            </button>

            {/* Payment Approvals */}
            <button
              onClick={() => {
                setActiveTab('PAYMENTS')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PAYMENTS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 shrink-0" />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Payment Approvals</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Wallet & Money Management */}
            <button
              onClick={() => {
                setActiveTab('WALLET')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'WALLET'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Wallet & Money</span>
            </button>

            {/* Tournament Matches */}
            <button
              onClick={() => {
                setActiveTab('MATCHES')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MATCHES'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 shrink-0" />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Manage Matches</span>
              </div>
              {sidebarOpen && (
                <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {matchesCount}
                </span>
              )}
            </button>

            {/* Players & Registrations */}
            <button
              onClick={() => {
                setActiveTab('PLAYERS')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PLAYERS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Players & Teams</span>
            </button>

            {/* Leaderboard & Top Players */}
            <button
              onClick={() => {
                setActiveTab('LEADERBOARD')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0 text-amber-400" />
              <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Leaderboard & Winners</span>
            </button>


            {/* System Settings */}
            <button
              onClick={() => {
                setActiveTab('SETTINGS')
                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>System Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-3 border-t border-white/10">
          <div className="bg-[#121622] p-3 rounded-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-xs">
                  AD
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-[#0c0f17]" />
              </div>
              <div className={`truncate ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>
                <span className="text-xs font-bold text-white block leading-none truncate">
                  Administrator
                </span>
                <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                  ONLINE
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
