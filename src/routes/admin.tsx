import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  getMatches,
  getAllRegistrations,
  updateRegistrationStatus,
  createMatch,
  deleteMatch,
  type RegistrationRecord,
} from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { MatchItem } from '@/types/match'
import {
  type AdminTabType,
  type NewMatchFormData,
  AdminLogin,
  AdminSidebar,
  AdminHeader,
  OverviewTab,
  PaymentsTab,
  WalletTab,
  MatchesTab,
  PlayersTab,
  LeaderboardTab,
  SettingsTab,
} from '@/features/admin'

export const Route = createFileRoute('/admin')({ component: AdminDashboard })

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('kongkaal2026@gmail.com')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = useState<AdminTabType>('OVERVIEW')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Admin Data State
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // New Match Form State
  const [newMatchOpen, setNewMatchOpen] = useState(false)
  const [newMatchForm, setNewMatchForm] = useState<NewMatchFormData>({
    title: 'SOLO BATTLE',
    mode: 'SOLO',
    map: 'Erangel',
    time: '10:00 PM',
    entryFee: 50,
    winnerPrize: 2000,
    firstPrize: 1000,
    secondPrize: 500,
    thirdPrize: 300,
    perKillPrize: 10,
    maxSlots: 100,
    image: '/solo_battle.jpg',
  })

  // Check persistent session on mount
  useEffect(() => {
    const authed = localStorage.getItem('kongkaal_admin_authed')
    if (authed === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // Direct Credential Check (kongkaal2026@gmail.com / kongkaal2026)
    if (email.trim().toLowerCase() === 'kongkaal2026@gmail.com' && password === 'kongkaal2026') {
      setIsAuthenticated(true)
      localStorage.setItem('kongkaal_admin_authed', 'true')
      return
    }

    // Fallback to Supabase Auth login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (data?.session && !error) {
        setIsAuthenticated(true)
        localStorage.setItem('kongkaal_admin_authed', 'true')
        return
      }
    } catch (err) {
      console.log('Supabase auth attempt error:', err)
    }

    setErrorMsg('Invalid Admin Email or Password!')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('kongkaal_admin_authed')
    setPassword('')
  }

  const loadAdminData = async () => {
    setLoading(true)
    const [matchesData, regsData] = await Promise.all([getMatches(), getAllRegistrations()])
    setMatches(matchesData)
    setRegistrations(regsData)
    setLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData()
    }
  }, [isAuthenticated])

  const handleStatusUpdate = async (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    const res = await updateRegistrationStatus(id, newStatus)
    if (res.success) {
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
    } else {
      alert(`Error updating status: ${res.message}`)
    }
  }

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await createMatch({
      title: newMatchForm.title,
      mode: newMatchForm.mode,
      map: newMatchForm.map,
      time: newMatchForm.time,
      entryFee: newMatchForm.entryFee,
      winnerPrize: newMatchForm.winnerPrize,
      firstPrize: newMatchForm.firstPrize,
      secondPrize: newMatchForm.secondPrize,
      thirdPrize: newMatchForm.thirdPrize,
      perKillPrize: newMatchForm.perKillPrize,
      joinedSlots: 0,
      maxSlots: newMatchForm.maxSlots,
      image: newMatchForm.image,
      status: 'OPEN',
    })

    if (res.success) {
      setNewMatchOpen(false)
      loadAdminData()
    } else {
      alert(`Error creating match: ${res.message}`)
    }
  }

  const handleDeleteMatch = async (id: string) => {
    if (confirm('Are you sure you want to delete this match?')) {
      const res = await deleteMatch(id)
      if (res.success) {
        setMatches((prev) => prev.filter((m) => m.id !== id))
      } else {
        alert(`Error deleting match: ${res.message}`)
      }
    }
  }

  // Calculate Overview Stats
  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length
  const verifiedCount = registrations.filter((r) => r.status === 'VERIFIED').length
  const totalRevenue = registrations.reduce((sum, r) => (r.status === 'VERIFIED' ? sum + r.amount : sum), 0)

  // Filter Registrations by Search
  const filteredRegistrations = registrations.filter(
    (r) =>
      r.player1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.whatsappNumber.includes(searchQuery) ||
      r.player1Uid.includes(searchQuery)
  )

  // 1. Email & Password Login Screen (Isolated Auth View)
  if (!isAuthenticated) {
    return (
      <AdminLogin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        errorMsg={errorMsg}
        handleLogin={handleLogin}
      />
    )
  }

  // 2. Admin Premium Sidebar Dashboard Layout
  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 flex font-sans selection:bg-red-600/30 selection:text-red-200 overflow-x-hidden">
      {/* Left Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        matchesCount={matches.length}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loadAdminData={loadAdminData}
          loading={loading}
          newMatchOpen={newMatchOpen}
          setNewMatchOpen={setNewMatchOpen}
          newMatchForm={newMatchForm}
          setNewMatchForm={setNewMatchForm}
          handleCreateMatch={handleCreateMatch}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dashboard Main Content Body */}
        <main className="p-6 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <OverviewTab
              totalRevenue={totalRevenue}
              verifiedCount={verifiedCount}
              pendingCount={pendingCount}
              matches={matches}
              registrations={registrations}
              setActiveTab={setActiveTab}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}

          {activeTab === 'PAYMENTS' && (
            <PaymentsTab
              loading={loading}
              pendingCount={pendingCount}
              filteredRegistrations={filteredRegistrations}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}

          {activeTab === 'WALLET' && <WalletTab />}

          {activeTab === 'MATCHES' && (
            <MatchesTab
              matches={matches}
              setNewMatchOpen={setNewMatchOpen}
              handleDeleteMatch={handleDeleteMatch}
              onRefreshMatches={loadAdminData}
            />
          )}

          {activeTab === 'PLAYERS' && (
            <PlayersTab
              registrations={registrations}
              filteredRegistrations={filteredRegistrations}
            />
          )}

          {activeTab === 'LEADERBOARD' && <LeaderboardTab />}

          {activeTab === 'SETTINGS' && <SettingsTab />}
        </main>
      </div>
    </div>
  )
}
