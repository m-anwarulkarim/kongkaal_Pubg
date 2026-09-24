import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getMatches, getAllRegistrations, updateRegistrationStatus, createMatch, deleteMatch, type RegistrationRecord } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { MatchItem } from '@/types/match'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
} from 'lucide-react'

export const Route = createFileRoute('/admin')({ component: AdminDashboard })

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('kongkaal2026@gmail.com')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Admin Data State
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [loading, setLoading] = useState(true)

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

    // 1. Direct Credential Check (kongkaal2026@gmail.com / kongkaal2026)
    if (email.trim().toLowerCase() === 'kongkaal2026@gmail.com' && password === 'kongkaal2026') {
      setIsAuthenticated(true)
      localStorage.setItem('kongkaal_admin_authed', 'true')
      return
    }

    // 2. Fallback to Supabase Auth login if configured
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

  // 1. Email & Password Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#10131a] border-2 border-red-900/50 text-gray-100 p-6 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 mx-auto mb-2">
              <Crown className="w-6 h-6" />
            </div>
            <CardTitle className="font-display text-3xl font-black text-white uppercase">
              KONGKAAL ADMIN LOGIN
            </CardTitle>
            <p className="text-xs text-gray-400 font-medium">Enter Admin Email & Password to manage platform</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">ADMIN EMAIL</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kongkaal2026@gmail.com"
                  className="bg-[#07080b] border-gray-700 text-white font-medium text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">PASSWORD</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="bg-[#07080b] border-gray-700 text-white font-medium text-sm"
                />
              </div>

              {errorMsg && <p className="text-xs font-bold text-red-500 text-center">{errorMsg}</p>}

              <Button type="submit" className="w-full btn-kong-red py-3 rounded-xl font-gaming text-sm font-extrabold uppercase">
                Login to Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 2. Admin Dashboard Main Interface
  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200">
      
      {/* Admin Top Header */}
      <header className="bg-[#0b0d14] border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-7 h-7 text-red-500 shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-black text-white uppercase leading-none">
                KONGKAAL <span className="text-red-500 italic">ADMIN DASHBOARD</span>
              </h1>
              <span className="text-[10px] text-gray-400 font-bold uppercase">LOGGED IN: kongkaal2026@gmail.com</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="btn-kong-outline px-3.5 py-1.5 rounded-lg text-xs font-bold no-underline flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>View Main Website</span>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 text-xs font-bold">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-8 space-y-8">

        {/* Overview Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#10131a] border-white/10 p-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">TOTAL REGISTRATIONS</span>
            <div className="font-display text-3xl font-black text-white">{registrations.length}</div>
          </Card>

          <Card className="bg-[#10131a] border-amber-500/30 p-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">PENDING APPROVALS</span>
            <div className="font-display text-3xl font-black text-amber-400">{pendingCount}</div>
          </Card>

          <Card className="bg-[#10131a] border-emerald-500/30 p-4">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">VERIFIED REVENUE</span>
            <div className="font-display text-3xl font-black text-emerald-400">৳{totalRevenue}</div>
          </Card>

          <Card className="bg-[#10131a] border-red-500/30 p-4">
            <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">ACTIVE MATCHES</span>
            <div className="font-display text-3xl font-black text-red-500">{matches.length}</div>
          </Card>
        </div>

        {/* Tabs for Admin Management */}
        <Tabs defaultValue="PAYMENTS" className="w-full">
          <TabsList className="bg-[#10131a] border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="PAYMENTS" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white font-gaming font-extrabold text-xs uppercase px-4 py-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Payment Approvals ({pendingCount} Pending)</span>
            </TabsTrigger>
            <TabsTrigger value="MATCHES" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white font-gaming font-extrabold text-xs uppercase px-4 py-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Manage Matches ({matches.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PAYMENT APPROVALS (TrxID Verification) */}
          <TabsContent value="PAYMENTS">
            <Card className="bg-[#10131a] border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-2xl font-black text-white uppercase">Slot Booking Payments</h3>
                <Button onClick={loadAdminData} size="sm" className="btn-kong-outline text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </Button>
              </div>

              {loading ? (
                <p className="text-center py-8 text-gray-400 font-bold">Loading registrations from Supabase...</p>
              ) : registrations.length === 0 ? (
                <p className="text-center py-8 text-gray-400 font-bold">No registrations found in database.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b0d14] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Player / Team</th>
                        <th className="p-3">PUBG UID</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">TrxID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {registrations.map((reg) => {
                        const whatsappMsg = encodeURIComponent(
                          `Hello ${reg.player1Name}! Your slot booking for PUBG Match is VERIFIED!\nRoom ID: 1234567\nPassword: 8899\nMatch Starts in 15 mins. Good luck!`
                        )

                        return (
                          <tr key={reg.id} className="hover:bg-white/5">
                            <td className="p-3">
                              <span className="font-bold text-white block">{reg.player1Name}</span>
                              {reg.teamName && <span className="text-[10px] text-red-400 block font-bold">Team: {reg.teamName}</span>}
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                {reg.whatsappNumber}
                              </span>
                            </td>
                            <td className="p-3 text-gray-300 font-mono">{reg.player1Uid}</td>
                            <td className="p-3">
                              <Badge className={reg.paymentMethod === 'bKash' ? 'bg-pink-950 text-pink-400' : 'bg-orange-950 text-orange-400'}>
                                {reg.paymentMethod}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-400">{reg.trxId}</td>
                            <td className="p-3 font-display text-base font-bold text-white">৳{reg.amount}</td>
                            <td className="p-3">
                              <Badge
                                className={
                                  reg.status === 'VERIFIED'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : reg.status === 'REJECTED'
                                    ? 'bg-red-950 text-red-400'
                                    : 'bg-amber-950 text-amber-400 animate-pulse'
                                }
                              >
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {reg.status === 'PENDING' && (
                                <>
                                  <Button
                                    onClick={() => handleStatusUpdate(reg.id, 'VERIFIED')}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                                    size="sm"
                                    className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </Button>
                                </>
                              )}

                              {reg.status === 'VERIFIED' && (
                                <Link
                                  href={`https://wa.me/${reg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-2.5 rounded-md inline-flex items-center gap-1 no-underline"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Send Room ID</span>
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
          </TabsContent>

          {/* TAB 2: MANAGE MATCHES */}
          <TabsContent value="MATCHES">
            <Card className="bg-[#10131a] border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl font-black text-white uppercase">Active Tournament Matches</h3>
                
                {/* Create Match Modal */}
                <Dialog open={newMatchOpen} onOpenChange={setNewMatchOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-kong-red font-gaming text-xs font-bold flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Create New Match</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#10131a] text-white border-2 border-red-900/50 max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl font-bold uppercase text-white">Create New Match</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateMatch} className="space-y-4 pt-2">
                      <div>
                        <Label className="text-xs font-bold text-gray-300">Match Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-[#07080b] border-gray-700 text-white" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Game Mode</Label>
                          <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                            <SelectTrigger className="bg-[#07080b] border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#10131a] text-white">
                              <SelectItem value="SOLO">SOLO (1v1)</SelectItem>
                              <SelectItem value="DUO">DUO (2v2)</SelectItem>
                              <SelectItem value="SQUAD">SQUAD (4v4)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Map</Label>
                          <Select value={map} onValueChange={(v: any) => setMap(v)}>
                            <SelectTrigger className="bg-[#07080b] border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#10131a] text-white">
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
                          <Input type="number" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))} required className="bg-[#07080b] border-gray-700 text-white" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Winner Prize (৳)</Label>
                          <Input type="number" value={winnerPrize} onChange={(e) => setWinnerPrize(Number(e.target.value))} required className="bg-[#07080b] border-gray-700 text-white" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Per Kill (৳)</Label>
                          <Input type="number" value={perKillPrize} onChange={(e) => setPerKillPrize(Number(e.target.value))} required className="bg-[#07080b] border-gray-700 text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Match Time</Label>
                          <Input value={time} onChange={(e) => setTime(e.target.value)} required placeholder="e.g. 10:00 PM" className="bg-[#07080b] border-gray-700 text-white" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-gray-300">Max Slots</Label>
                          <Input type="number" value={maxSlots} onChange={(e) => setMaxSlots(Number(e.target.value))} required className="bg-[#07080b] border-gray-700 text-white" />
                        </div>
                      </div>

                      <Button type="submit" className="w-full btn-kong-red py-3 text-sm font-bold">
                        Save Match to Supabase
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

              </div>

              {/* Match List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b0d14] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Map</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Entry</th>
                      <th className="p-3">Winner Prize</th>
                      <th className="p-3">Slots</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{m.title}</td>
                        <td className="p-3">
                          <Badge className={m.mode === 'SOLO' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'}>{m.mode}</Badge>
                        </td>
                        <td className="p-3 text-gray-300">{m.map}</td>
                        <td className="p-3 text-gray-300">{m.time}</td>
                        <td className="p-3 font-bold text-white">৳{m.entryFee}</td>
                        <td className="p-3 font-bold text-emerald-400">৳{m.winnerPrize}</td>
                        <td className="p-3 text-amber-400 font-bold">{m.joinedSlots}/{m.maxSlots}</td>
                        <td className="p-3 text-right">
                          <Button onClick={() => handleDeleteMatch(m.id)} size="sm" variant="outline" className="bg-red-950 text-red-400 border-red-800 text-xs font-bold py-1 px-2.5 h-auto inline-flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </Card>
          </TabsContent>

        </Tabs>

      </main>

    </div>
  )
}
