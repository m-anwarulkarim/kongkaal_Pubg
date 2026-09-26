import { useState, useEffect } from 'react'
import type { RegistrationRecord } from '@/lib/db'
import { getAllCustomerProfiles } from '@/lib/wallet'
import type { CustomerProfile } from '@/types/wallet'
import { getSupportMessages, type SupportMessage } from '@/lib/support'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Gamepad2, Search, Smartphone, Wallet, RefreshCw, Mail, ShieldCheck, MessageSquare } from 'lucide-react'

interface PlayersTabProps {
  registrations: RegistrationRecord[]
  filteredRegistrations: RegistrationRecord[]
  onSelectUserMessage?: (userEmail: string) => void
}

export default function PlayersTab({
  registrations,
  filteredRegistrations,
  onSelectUserMessage,
}: PlayersTabProps) {
  const [viewMode, setViewMode] = useState<'CUSTOMERS' | 'MATCH_SLOTS'>('CUSTOMERS')
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [supportMsgs, setSupportMsgs] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const [data, msgsData] = await Promise.all([
        getAllCustomerProfiles(),
        getSupportMessages(),
      ])
      setCustomers(data)
      setSupportMsgs(msgsData)
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.pubgUid && c.pubgUid.includes(search)) ||
      (c.whatsappNumber && c.whatsappNumber.includes(search))
  )

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-[#101422] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-gaming text-[10px] font-bold uppercase tracking-wider">
              Customer & Player Management
            </span>
            <span className="text-gray-400 text-xs">Total Customers: {customers.length}</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" /> All Gmail Logged-in Customers & Players
          </h2>
          <p className="text-xs text-gray-400">
            ওয়েবসাইটে জিমেইল (Google Login) দিয়ে লগইন করা সকল কাস্টমারের তথ্য এবং মেসেজ রিপ্লাই প্যানেল।
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 bg-[#080a12] p-1.5 rounded-xl border border-white/10 w-full md:w-auto">
          <button
            onClick={() => setViewMode('CUSTOMERS')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'CUSTOMERS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Gmail Customers ({customers.length})
          </button>
          <button
            onClick={() => setViewMode('MATCH_SLOTS')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'MATCH_SLOTS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> Slot Registrations ({registrations.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3 bg-[#101422] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              viewMode === 'CUSTOMERS'
                ? 'Search by Customer Name, Gmail Email, PUBG UID, or Phone...'
                : 'Search match slot registrations...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={loadCustomers}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* VIEW MODE 1: GMAIL CUSTOMERS DIRECTORY */}
      {viewMode === 'CUSTOMERS' && (
        <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
                Gmail Logged-in Customer Profiles
              </h3>
              <span className="text-xs text-gray-400">
                কাস্টমারের পাশে মেসেজ বোতামে চাপলে তার পাঠানো মেসেজ পেজে নিয়ে যাবে।
              </span>
            </div>
            <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1">
              {filteredCustomers.length} Active Profiles
            </Badge>
          </div>

          {loading ? (
            <div className="p-12 text-center text-blue-400 font-gaming animate-pulse">
              LOADING CUSTOMER PROFILES...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No customer profiles found matching "{search}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070910] text-gray-400 font-gaming uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Customer Profile</th>
                    <th className="p-3.5">Gmail Email</th>
                    <th className="p-3.5">PUBG UID</th>
                    <th className="p-3.5">WhatsApp Number</th>
                    <th className="p-3.5">Wallet Balance</th>
                    <th className="p-3.5 text-right">Support Message / Chat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredCustomers.map((cust) => {
                    const userMsgs = (supportMsgs || []).filter((m) => m.userEmail.toLowerCase() === cust.email.toLowerCase())
                    const pendingMsgs = userMsgs.filter((m) => m.status === 'PENDING')
                    const hasPending = pendingMsgs.length > 0

                    return (
                      <tr key={cust.email} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            {cust.avatarUrl ? (
                              <img
                                src={cust.avatarUrl}
                                alt={cust.name}
                                className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-full border border-blue-500/40 object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {cust.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-white text-sm block leading-tight">
                                {cust.name}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3" /> VERIFIED GOOGLE USER
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-300 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            {cust.email}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-300 font-mono">
                          {cust.pubgUid ? (
                            <span className="px-2 py-0.5 bg-black/40 rounded border border-white/10 text-white font-bold">
                              {cust.pubgUid}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-mono">
                          {cust.whatsappNumber ? (
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5" /> {cust.whatsappNumber}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="p-3.5 font-display text-sm font-bold text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5" /> ৳{cust.walletBalance || 0}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onSelectUserMessage?.(cust.email)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow transition-all ${
                              hasPending
                                ? 'bg-amber-500 text-black animate-pulse hover:bg-amber-400'
                                : userMsgs.length > 0
                                ? 'bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {hasPending
                              ? `New Message (${pendingMsgs.length})`
                              : userMsgs.length > 0
                              ? `Messages (${userMsgs.length})`
                              : 'Send Message'}
                          </button>
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

      {/* VIEW MODE 2: MATCH SLOT REGISTRATIONS */}
      {viewMode === 'MATCH_SLOTS' && (
        <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase">
                Tournament Match Slot Registrations
              </h3>
              <span className="text-xs text-gray-400">All registered PUBG Mobile players & character IDs</span>
            </div>
            <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1">
              {filteredRegistrations.length} Match Entries
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
    </div>
  )
}
