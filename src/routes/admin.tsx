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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from '@/components/ui/Link'
import {
  Crown,
  Globe,
  CreditCard,
  Gamepad2,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plus,
  Trash2,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Search,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Database,
  Lock,
} from 'lucide-react'

export const Route = createFileRoute('/admin')({ component: AdminDashboard })

type TabType = 'OVERVIEW' | 'PAYMENTS' | 'MATCHES' | 'PLAYERS' | 'SETTINGS'

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('kongkaal2026@gmail.com')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Admin Data State
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // New Match Form State
  const [newMatchOpen, setNewMatchOpen] = useState(false)
  const [title, setTitle] = useState('SOLO BATTLE')
  const [mode, setMode] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SOLO')
  const [map, setMap] = useState<'Erangel' | 'Miramar' | 'Sanhok' | 'Livik'>('Erangel')
  const [time, setTime] = useState('10:00 PM')
  const [entryFee, setEntryFee] = useState(50)
  const [winnerPrize, setWinnerPrize] = useState(2000)
  const [perKillPrize, setPerKillPrize] = useState(10)
  const [maxSlots, setMaxSlots] = useState(100)
  const [image, setImage] = useState('/solo_battle.jpg')

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
      title,
      mode,
      map,
      time,
      entryFee,
      winnerPrize,
      perKillPrize,
      joinedSlots: 0,
      maxSlots,
      image,
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

  // 1. Email & Password Login Screen (Isolated Premium Auth View)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glowing Flare Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <Card className="w-full max-w-md bg-[#0f131d]/90 backdrop-blur-xl border-2 border-red-900/50 text-gray-100 p-8 shadow-2xl rounded-2xl relative z-10">
          <CardHeader className="text-center pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-600/20">
              <Crown className="w-8 h-8 text-red-500" />
            </div>
            <Badge className="bg-red-600/20 text-red-400 border border-red-600/30 font-gaming text-[10px] uppercase font-bold tracking-widest mx-auto mb-2 px-3 py-1">
              KONGKAAL ADMIN PORTAL
            </Badge>
            <CardTitle className="font-display text-3xl font-black text-white uppercase tracking-wider">
              ADMIN LOGIN
            </CardTitle>
            <p className="text-xs text-gray-400 font-medium mt-1">Enter your credentials to access management dashboard</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-red-500" /> ADMIN EMAIL
                </Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kongkaal2026@gmail.com"
                  className="bg-[#07080b] border-gray-700 text-white font-medium text-sm rounded-xl py-2.5 focus:border-red-500"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-500" /> PASSWORD
                </Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-[#07080b] border-gray-700 text-white font-medium text-sm rounded-xl py-2.5 focus:border-red-500"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-950/80 border border-red-600/60 p-3 rounded-xl text-xs font-bold text-red-400 text-center flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-kong-red py-3.5 rounded-xl font-gaming text-sm font-black uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group"
              >
                <span>ENTER ADMIN DASHBOARD</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 2. Admin Premium Sidebar Dashboard Layout
  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 flex font-sans selection:bg-red-600/30 selection:text-red-200 overflow-x-hidden">
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0c0f17] border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Top Brand Logo Area */}
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
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
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 hidden lg:block"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            
            {/* Overview */}
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'OVERVIEW'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Overview Dashboard</span>}
            </button>

            {/* Payment Approvals */}
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PAYMENTS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>Payment Approvals</span>}
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Tournament Matches */}
            <button
              onClick={() => setActiveTab('MATCHES')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MATCHES'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>Manage Matches</span>}
              </div>
              {sidebarOpen && (
                <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {matches.length}
                </span>
              )}
            </button>

            {/* Players & Registrations */}
            <button
              onClick={() => setActiveTab('PLAYERS')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PLAYERS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Players & Teams</span>}
            </button>

            {/* System Settings */}
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>System Settings</span>}
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
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Top Header Bar */}
        <header className="bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40 flex items-center justify-between gap-4">
          
          {/* Active Section Title / Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-sm font-extrabold text-white uppercase font-gaming">
              {activeTab}
            </span>
          </div>

          {/* Search & Actions Header Controls */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Bar */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player, TrxID, Phone..."
                className="bg-[#121622] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 w-64 focus:border-red-500 outline-none transition-colors"
              />
            </div>

            {/* Refresh Button */}
            <Button
              onClick={loadAdminData}
              size="sm"
              className="btn-kong-outline text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Create Match Quick Action */}
            <Dialog open={newMatchOpen} onOpenChange={setNewMatchOpen}>
              <DialogTrigger asChild>
                <Button className="btn-kong-red font-gaming text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Match</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#101420] text-white border-2 border-red-900/50 max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-bold uppercase text-white flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-red-500" />
                    <span>Create New Match</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMatch} className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs font-bold text-gray-300">Match Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Game Mode</Label>
                      <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                        <SelectTrigger className="bg-[#07080b] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#101420] text-white border-gray-700">
                          <SelectItem value="SOLO">SOLO (1v1)</SelectItem>
                          <SelectItem value="DUO">DUO (2v2)</SelectItem>
                          <SelectItem value="SQUAD">SQUAD (4v4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Map</Label>
                      <Select value={map} onValueChange={(v: any) => setMap(v)}>
                        <SelectTrigger className="bg-[#07080b] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#101420] text-white border-gray-700">
                          <SelectItem value="Erangel">Erangel</SelectItem>
                          <SelectItem value="Miramar">Miramar</SelectItem>
                          <SelectItem value="Sanhok">Sanhok</SelectItem>
                          <SelectItem value="Livik">Livik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Entry Fee (৳)</Label>
                      <Input
                        type="number"
                        value={entryFee}
                        onChange={(e) => setEntryFee(Number(e.target.value))}
                        required
                        className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Winner Prize (৳)</Label>
                      <Input
                        type="number"
                        value={winnerPrize}
                        onChange={(e) => setWinnerPrize(Number(e.target.value))}
                        required
                        className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Per Kill (৳)</Label>
                      <Input
                        type="number"
                        value={perKillPrize}
                        onChange={(e) => setPerKillPrize(Number(e.target.value))}
                        required
                        className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Match Time</Label>
                      <Input
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        placeholder="e.g. 10:00 PM"
                        className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-300">Max Slots</Label>
                      <Input
                        type="number"
                        value={maxSlots}
                        onChange={(e) => setMaxSlots(Number(e.target.value))}
                        required
                        className="bg-[#07080b] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold">
                    Save Match to Supabase
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* View Website External Link */}
            <Link
              href="/"
              className="btn-kong-outline px-3.5 py-1.5 rounded-xl text-xs font-bold no-underline flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Website</span>
            </Link>

          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="p-6 space-y-6">

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Revenue Card */}
                <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-emerald-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">VERIFIED REVENUE</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="font-display text-4xl font-black text-emerald-400 mb-1">
                    ৳{totalRevenue}
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {verifiedCount} Verified Payments
                  </span>
                </Card>

                {/* Pending Approvals Card */}
                <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-amber-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">PENDING APPROVALS</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="font-display text-4xl font-black text-amber-400 mb-1">
                    {pendingCount}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Needs Admin TrxID Verification
                  </span>
                </Card>

                {/* Active Matches Card */}
                <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-red-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-500 uppercase">ACTIVE MATCHES</span>
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="font-display text-4xl font-black text-red-500 mb-1">
                    {matches.length}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Solo, Duo & Squad Tournaments
                  </span>
                </Card>

                {/* Total Registrations Card */}
                <Card className="bg-gradient-to-br from-[#101422] to-[#151b2e] border border-blue-500/30 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase">TOTAL REGISTRATIONS</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="font-display text-4xl font-black text-white mb-1">
                    {registrations.length}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Saved in Supabase Database
                  </span>
                </Card>

              </div>

              {/* Quick Pending Approvals Preview */}
              <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white uppercase">
                      Pending Approvals Queue
                    </h3>
                    <span className="text-xs text-gray-400">Verify Transaction ID (TrxID) and approve slot</span>
                  </div>
                  <Button
                    onClick={() => setActiveTab('PAYMENTS')}
                    size="sm"
                    className="btn-kong-outline text-xs"
                  >
                    View All Approvals
                  </Button>
                </div>

                {registrations.filter((r) => r.status === 'PENDING').length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>No pending approvals right now. All caught up!</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="p-3">Player / Team</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">TrxID</th>
                          <th className="p-3">Fee</th>
                          <th className="p-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {registrations
                          .filter((r) => r.status === 'PENDING')
                          .slice(0, 5)
                          .map((reg) => (
                            <tr key={reg.id} className="hover:bg-white/5">
                              <td className="p-3">
                                <span className="font-bold text-white block">{reg.player1Name}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Smartphone className="w-3 h-3 text-emerald-400" />
                                  {reg.whatsappNumber}
                                </span>
                              </td>
                              <td className="p-3">
                                <Badge className={reg.paymentMethod === 'bKash' ? 'bg-pink-950 text-pink-400' : 'bg-orange-950 text-orange-400'}>
                                  {reg.paymentMethod}
                                </Badge>
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-400">{reg.trxId}</td>
                              <td className="p-3 font-display text-sm font-bold text-white">৳{reg.amount}</td>
                              <td className="p-3 text-right space-x-2">
                                <Button
                                  onClick={() => handleStatusUpdate(reg.id, 'VERIFIED')}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

            </div>
          )}

          {/* ==================== TAB 2: PAYMENT APPROVALS ==================== */}
          {activeTab === 'PAYMENTS' && (
            <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-black text-white uppercase">
                    Slot Booking Payments
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">
                    Verify bKash / Nagad / Rocket Transaction IDs (TrxID) & Send WhatsApp Room ID
                  </span>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1">
                  {pendingCount} Pending Approvals
                </Badge>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400 font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> Loading registrations from Supabase...
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold">
                  No registration records matching query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">Player / Team</th>
                        <th className="p-3.5">PUBG UID</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">TrxID</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {filteredRegistrations.map((reg) => {
                        const whatsappMsg = encodeURIComponent(
                          `Hello ${reg.player1Name}! Your slot booking for PUBG Match is VERIFIED!\nRoom ID: 1234567\nPassword: 8899\nMatch Starts in 15 mins. Good luck!`
                        )

                        return (
                          <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-white block text-sm">{reg.player1Name}</span>
                              {reg.teamName && (
                                <span className="text-[10px] text-red-400 font-bold block">
                                  Team: {reg.teamName}
                                </span>
                              )}
                              <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Smartphone className="w-3 h-3 text-emerald-400" />
                                {reg.whatsappNumber}
                              </span>
                            </td>
                            <td className="p-3.5 text-gray-300 font-mono text-xs">{reg.player1Uid}</td>
                            <td className="p-3.5">
                              <Badge
                                className={
                                  reg.paymentMethod === 'bKash'
                                    ? 'bg-pink-950 text-pink-400 border border-pink-500/30'
                                    : 'bg-orange-950 text-orange-400 border border-orange-500/30'
                                }
                              >
                                {reg.paymentMethod}
                              </Badge>
                            </td>
                            <td className="p-3.5 font-mono font-black text-amber-400 text-sm tracking-wide">
                              {reg.trxId}
                            </td>
                            <td className="p-3.5 font-display text-base font-bold text-white">৳{reg.amount}</td>
                            <td className="p-3.5">
                              <Badge
                                className={
                                  reg.status === 'VERIFIED'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : reg.status === 'REJECTED'
                                    ? 'bg-red-950 text-red-400 border border-red-500/30'
                                    : 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                                }
                              >
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {reg.status === 'PENDING' && (
                                <>
                                  <Button
                                    onClick={() => handleStatusUpdate(reg.id, 'VERIFIED')}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                                    size="sm"
                                    className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </Button>
                                </>
                              )}

                              {reg.status === 'VERIFIED' && (
                                <Link
                                  href={`https://wa.me/${reg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 no-underline shadow-md shadow-emerald-600/20"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Send Room ID
                                </Link>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ==================== TAB 3: MANAGE MATCHES ==================== */}
          {activeTab === 'MATCHES' && (
            <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-black text-white uppercase">
                    Tournament Matches
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">
                    Create, edit and manage PUBG Mobile Solo, Duo & Squad matches
                  </span>
                </div>
                <Button
                  onClick={() => setNewMatchOpen(true)}
                  className="btn-kong-red font-gaming text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Match
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Mode</th>
                      <th className="p-3.5">Map</th>
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5">Entry Fee</th>
                      <th className="p-3.5">Prize Pool</th>
                      <th className="p-3.5">Per Kill</th>
                      <th className="p-3.5">Slots</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white text-sm">{m.title}</td>
                        <td className="p-3.5">
                          <Badge className={m.mode === 'SOLO' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'}>
                            {m.mode}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-gray-300">{m.map}</td>
                        <td className="p-3.5 text-gray-300 font-bold">{m.time}</td>
                        <td className="p-3.5 font-bold text-white">৳{m.entryFee}</td>
                        <td className="p-3.5 font-bold text-emerald-400">৳{m.winnerPrize}</td>
                        <td className="p-3.5 font-bold text-gray-300">৳{m.perKillPrize}</td>
                        <td className="p-3.5 text-amber-400 font-bold">
                          {m.joinedSlots}/{m.maxSlots}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            onClick={() => handleDeleteMatch(m.id)}
                            size="sm"
                            variant="outline"
                            className="bg-red-950 text-red-400 border-red-800 hover:bg-red-900 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ==================== TAB 4: PLAYERS & TEAMS ==================== */}
          {activeTab === 'PLAYERS' && (
            <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-black text-white uppercase">
                    Registered Players Directory
                  </h3>
                  <span className="text-xs text-gray-400">All registered PUBG Mobile players & character IDs</span>
                </div>
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1">
                  {registrations.length} Players Registered
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Player IGN</th>
                      <th className="p-3.5">Team Name</th>
                      <th className="p-3.5">PUBG UID</th>
                      <th className="p-3.5">WhatsApp Number</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-white/5">
                        <td className="p-3.5 font-bold text-white">{reg.player1Name}</td>
                        <td className="p-3.5 text-red-400 font-bold">{reg.teamName || '— (SOLO)'}</td>
                        <td className="p-3.5 text-gray-300 font-mono">{reg.player1Uid}</td>
                        <td className="p-3.5 text-emerald-400 font-mono">{reg.whatsappNumber}</td>
                        <td className="p-3.5">{reg.paymentMethod}</td>
                        <td className="p-3.5">
                          <Badge
                            className={
                              reg.status === 'VERIFIED'
                                ? 'bg-emerald-950 text-emerald-400'
                                : reg.status === 'REJECTED'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-amber-950 text-amber-400'
                            }
                          >
                            {reg.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ==================== TAB 5: SYSTEM SETTINGS ==================== */}
          {activeTab === 'SETTINGS' && (
            <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-2xl font-black text-white uppercase">
                  Platform & Security Settings
                </h3>
                <span className="text-xs text-gray-400">Database connection, admin credentials & server health</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Supabase Status Card */}
                <div className="bg-[#080b12] border border-emerald-500/30 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Supabase Database Connection</h4>
                      <span className="text-xs text-emerald-400 font-mono">CONNECTED & ACTIVE</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Live matches and registrations are automatically synchronized with Supabase PostgreSQL cloud database.
                  </p>
                </div>

                {/* Admin Auth Info Card */}
                <div className="bg-[#080b12] border border-red-900/40 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Admin Access Account</h4>
                      <span className="text-xs text-gray-300 font-mono">kongkaal2026@gmail.com</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Full administrator rights enabled. All payment approvals and match creations are logged.
                  </p>
                </div>

              </div>
            </Card>
          )}

        </main>
      </div>

    </div>
  )
}
