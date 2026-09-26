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
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: AdminTabType
  setActiveTab: (tab: AdminTabType) => void
  pendingCount: number
  pendingWalletCount?: number
  pendingSupportCount?: number
  matchesCount: number
  handleLogout: () => void
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  pendingCount,
  pendingWalletCount = 0,
  pendingSupportCount = 0,
  matchesCount,
  handleLogout,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'OVERVIEW' as const,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-red-500',
    },
    {
      id: 'PAYMENTS' as const,
      label: 'Payment Approvals',
      icon: CreditCard,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-black font-black animate-pulse shadow-md shadow-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      id: 'WALLET' as const,
      label: 'Wallet & Money',
      icon: Wallet,
      badge: pendingWalletCount > 0 ? pendingWalletCount : null,
      badgeColor: 'bg-amber-500 text-black font-black animate-pulse shadow-md shadow-amber-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'MATCHES' as const,
      label: 'Manage Matches',
      icon: Gamepad2,
      badge: matchesCount,
      badgeColor: 'bg-white/10 text-gray-300',
      iconColor: 'text-indigo-400',
    },
    {
      id: 'PLAYERS' as const,
      label: 'Players & Teams',
      icon: Users,
      iconColor: 'text-blue-400',
    },
    {
      id: 'LEADERBOARD' as const,
      label: 'Leaderboard & Winners',
      icon: Trophy,
      iconColor: 'text-amber-400',
    },
    {
      id: 'MESSAGES' as const,
      label: 'Support Messages',
      icon: MessageSquare,
      badge: pendingSupportCount > 0 ? pendingSupportCount : null,
      badgeColor: 'bg-red-500 text-white font-black animate-pulse shadow-md shadow-red-500/20',
      iconColor: 'text-sky-400',
    },
    {
      id: 'SETTINGS' as const,
      label: 'System Settings',
      icon: Settings,
      iconColor: 'text-gray-400',
    },
  ]

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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0c0f17] border-r border-white/10 transition-all duration-300 flex flex-col justify-between overflow-x-hidden ${
          sidebarOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Top Brand Logo Area */}
        <div>
          <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen ? 'w-full justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
                <Crown className="w-6 h-6" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col leading-none overflow-hidden">
                  <span className="font-display text-lg font-black tracking-wider text-white uppercase truncate">
                    KONGKAAL
                  </span>
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> PRO ADMIN
                  </span>
                </div>
              )}
            </div>

            {/* Show Close Button ONLY when expanded */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                title="Collapse Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setSidebarOpen(false)
                    }
                  }}
                  title={item.label}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'
                  } py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 relative">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
                    {!sidebarOpen && item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`absolute -top-1.5 -right-2 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                          item.badgeColor || 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>

                  {sidebarOpen && item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-3 border-t border-white/10">
          <div className="bg-[#121622] p-2.5 rounded-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-xs">
                  AD
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-[#0c0f17]" />
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <span className="text-xs font-bold text-white block leading-none truncate">
                    Administrator
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                    ONLINE
                  </span>
                </div>
              )}
            </div>

            {sidebarOpen && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
