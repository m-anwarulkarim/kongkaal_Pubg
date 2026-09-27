import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { RegistrationRecord } from '@/lib/db'
import { getAllCustomerProfiles } from '@/lib/wallet'
import type { CustomerProfile } from '@/types/wallet'
import { getSupportMessages, type SupportMessage } from '@/lib/support'
import CustomerDetailPage from './CustomerDetailPage'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Gamepad2, Search, Smartphone, Wallet, RefreshCw, Mail, ShieldCheck, MessageSquare, Eye, Copy, Check } from 'lucide-react'

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
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const [data, msgsData] = await Promise.all([
        getAllCustomerProfiles(),
        getSupportMessages(),
      ])
      setCustomers(data)
      setSupportMsgs(msgsData)

      // Sync active customer from URL search param if present (?email=...)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const emailFromUrl = params.get('email')
        if (emailFromUrl) {
          const matched = data.find(c => c.email.toLowerCase() === emailFromUrl.toLowerCase())
          if (matched) setSelectedCustomer(matched)
        } else if (selectedCustomer) {
          const updated = data.find(c => c.email.toLowerCase() === selectedCustomer.email.toLowerCase())
          if (updated) setSelectedCustomer(updated)
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const emailFromUrl = params.get('email')
        if (emailFromUrl && customers.length > 0) {
          const matched = customers.find(c => c.email.toLowerCase() === emailFromUrl.toLowerCase())
          setSelectedCustomer(matched || null)
        } else {
          setSelectedCustomer(null)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [customers])

  const handleSelectCustomer = (cust: CustomerProfile) => {
    setSelectedCustomer(cust)
    if (typeof window !== 'undefined') {
      const newUrl = `/admin/players?email=${encodeURIComponent(cust.email)}`
      window.history.pushState({}, '', newUrl)
    }
  }

  const handleBackToList = () => {
    setSelectedCustomer(null)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin/players')
    }
  }

  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopyField = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label} "${text}" to clipboard!`)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 1500)
  }

  // If a customer is selected, render the dedicated FULL-PAGE details view!
  if (selectedCustomer) {
    return (
      <CustomerDetailPage
        customer={selectedCustomer}
        registrations={registrations}
        onBack={handleBackToList}
        onRefreshCustomer={loadCustomers}
        onSelectUserMessage={onSelectUserMessage}
      />
    )
  }

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
            ওয়েবসাইটে গুগল লগইন করা সকল কাস্টমারের বিবরণ, নাম, ইমেইল ও হোয়াটসঅ্যাপ কপি বোতাম, ফুল ডিটেইলস পেজ ও ওয়ালেট এডজেস্টমেন্ট।
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

      {/* VIEW MODE 1: GMAIL CUSTOMERS DIRECTORY */}
      {viewMode === 'CUSTOMERS' && (
        <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          {/* Header & Direct Name Search Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
                Gmail Logged-in Customer Profiles
              </h3>
              <span className="text-xs text-gray-400">
                কাস্টমারের নাম, ইমেইল বা হোয়াটসঅ্যাপের পাশের <strong className="text-blue-400">Copy</strong> বোতামে চাপলে কপি হয়ে যাবে।
              </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Dedicated Name & Profile Search Bar */}
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="🔍 Search name, email, UID, or WhatsApp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/60 border border-blue-500/50 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-inner"
                />
              </div>

              <button
                onClick={loadCustomers}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-2 shrink-0">
                {filteredCustomers.length} Active Profiles
              </Badge>
            </div>
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
                    <th className="p-3.5 text-center">Customer Details Page</th>
                    <th className="p-3.5 text-right">Support Chat</th>
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
                                onClick={() => handleSelectCustomer(cust)}
                                className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-full border border-blue-500/40 object-cover shadow-md cursor-pointer hover:border-blue-400"
                              />
                            ) : (
                              <div
                                onClick={() => handleSelectCustomer(cust)}
                                className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-blue-500"
                              >
                                {cust.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  onClick={() => handleSelectCustomer(cust)}
                                  className="font-bold text-white text-sm block leading-tight hover:text-blue-400 cursor-pointer transition-colors"
                                >
                                  {cust.name}
                                </span>
                                {/* 1-Click Copy Name Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyField(e, cust.name, 'Name')}
                                  className="p-1 rounded bg-white/10 hover:bg-blue-600 hover:text-white text-gray-300 transition-all shadow-sm flex items-center justify-center shrink-0"
                                  title={`Copy name "${cust.name}"`}
                                >
                                  {copiedText === cust.name ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3" /> VERIFIED GOOGLE USER
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Gmail Email Cell with 1-Click Copy */}
                        <td className="p-3.5 text-gray-300 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{cust.email}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyField(e, cust.email, 'Gmail Email')}
                              className="p-1 rounded bg-white/5 hover:bg-red-600/30 hover:text-white text-gray-400 transition-all shrink-0"
                              title={`Copy email ${cust.email}`}
                            >
                              {copiedText === cust.email ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        </td>

                        {/* PUBG UID Cell with 1-Click Copy */}
                        <td className="p-3.5 text-gray-300 font-mono">
                          {cust.pubgUid ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded border border-white/10 text-white font-bold">
                              <span>{cust.pubgUid}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyField(e, cust.pubgUid, 'PUBG UID')}
                                className="p-0.5 rounded hover:bg-white/20 text-gray-400 hover:text-white transition-all shrink-0"
                                title={`Copy UID ${cust.pubgUid}`}
                              >
                                {copiedText === cust.pubgUid ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </td>

                        {/* WhatsApp Number Cell with 1-Click Copy */}
                        <td className="p-3.5 text-emerald-400 font-mono">
                          {cust.whatsappNumber ? (
                            <span className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 shrink-0" />
                              <span>{cust.whatsappNumber}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyField(e, cust.whatsappNumber, 'WhatsApp Number')}
                                className="p-1 rounded bg-white/5 hover:bg-emerald-600/30 hover:text-white text-gray-400 transition-all shrink-0"
                                title={`Copy WhatsApp ${cust.whatsappNumber}`}
                              >
                                {copiedText === cust.whatsappNumber ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
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
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleSelectCustomer(cust)}
                            className="p-1.5 h-7 w-7 rounded-lg inline-flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600 hover:text-white transition-all shadow-md shrink-0 cursor-pointer"
                            title={`View Full Profile Page of ${cust.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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


