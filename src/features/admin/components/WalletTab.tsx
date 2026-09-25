import { useState, useEffect } from 'react'
import {
  getWalletTransactions,
  getAllCustomerProfiles,
  adminCreditCustomerWallet,
  adminApproveTransaction,
} from '@/lib/wallet'
import type { WalletTransaction, CustomerProfile } from '@/types/wallet'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle2, XCircle, Search, RefreshCw } from 'lucide-react'

export default function WalletTab() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])

  // Send Money Modal / Form State
  const [sendEmail, setSendEmail] = useState('')
  const [sendAmount, setSendAmount] = useState('500')
  const [sendNote, setSendNote] = useState('Match Winning Prize Bonus')
  const [sendMsg, setSendMsg] = useState('')
  const [sending, setSending] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const loadWalletData = async () => {
    const custs = await getAllCustomerProfiles()
    const txs = await getWalletTransactions()
    setCustomers(custs)
    setTransactions(txs)
  }

  useEffect(() => {
    loadWalletData()
  }, [])

  const handleSendMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendEmail || !sendAmount) return
    setSending(true)
    setSendMsg('')

    const res = await adminCreditCustomerWallet(sendEmail.trim(), Number(sendAmount), sendNote)
    setSending(false)

    if (res.success) {
      setSendMsg(`SUCCESS: ৳${sendAmount} transferred to ${sendEmail}!`)
      setSendAmount('500')
      loadWalletData()
      setTimeout(() => setSendMsg(''), 4000)
    } else {
      setSendMsg(`ERROR: ${res.message}`)
    }
  }

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await adminApproveTransaction(id, status)
    if (res.success) {
      loadWalletData()
    } else {
      alert(`Error: ${res.message}`)
    }
  }

  const filteredTx = transactions.filter(
    (t) =>
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.trxId && t.trxId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Send Money Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Send Money Form (Admin Credit to Customer) */}
        <Card className="lg:col-span-1 bg-[#101422] border-red-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Send className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-lg font-black text-white uppercase">
              Send Money to Customer
            </h3>
          </div>

          <p className="text-xs text-gray-400">
            কাস্টমারের ওয়ালেটে সরাসরি টাকা পাঠান (প্রাইজ মানি, রিফান্ড বা বোনাস হিসেবে)।
          </p>

          {sendMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${sendMsg.startsWith('SUCCESS') ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-red-950 text-red-300 border border-red-500/40'}`}>
              {sendMsg}
            </div>
          )}

          <form onSubmit={handleSendMoneySubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Customer Email / ID</label>
              <Input
                type="email"
                placeholder="e.g. player1@gmail.com"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Transfer Amount (৳ BDT)</label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Note / Reason</label>
              <Input
                type="text"
                placeholder="e.g. 1st Prize Winner Solo Battle"
                value={sendNote}
                onChange={(e) => setSendNote(e.target.value)}
                className="bg-[#080a12] border-white/10 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-[#e50914] hover:bg-red-600 text-white font-bold py-2.5 text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Processing Transfer...' : 'Send Money to Customer Wallet'}</span>
            </Button>
          </form>
        </Card>

        {/* Customer Wallet Balances Directory */}
        <Card className="lg:col-span-2 bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase">
                Customer Wallet Balances ({customers.length})
              </h3>
              <p className="text-xs text-gray-400">All registered customer wallet balances</p>
            </div>
            <Button
              onClick={loadWalletData}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>

          <div className="overflow-x-auto max-h-[280px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">PUBG UID</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {customers.map((c) => (
                  <tr key={c.email} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3 text-gray-300">{c.email}</td>
                    <td className="p-3 text-red-400 font-mono">{c.pubgUid || '—'}</td>
                    <td className="p-3 font-display font-bold text-emerald-400 text-sm">৳{c.walletBalance}</td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => {
                          setSendEmail(c.email)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        size="sm"
                        className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] py-1 px-2.5 h-auto"
                      >
                        Credit Money
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Wallet Deposit & Withdrawal Requests Table */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-white uppercase">
              Deposit & Withdraw Requests ({pendingCount} Pending)
            </h3>
            <p className="text-xs text-gray-400">
              Approve customer Add Money (Deposits) or Cash-out (Withdrawal) requests
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Input
              type="text"
              placeholder="Search by Email or TrxID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080a12] border-white/10 text-xs text-white pl-8"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-bold">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070910] text-gray-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Method & TrxID / Account</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{tx.userName}</span>
                      <span className="text-[11px] text-gray-400">{tx.userEmail}</span>
                    </td>
                    <td className="p-3.5 font-bold">
                      <Badge
                        className={
                          tx.type === 'DEPOSIT'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                            : tx.type === 'WITHDRAW'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-gray-200 block">{tx.paymentMethod || 'SYSTEM'}</span>
                      {tx.trxId && <span className="font-mono text-amber-400 text-xs">TrxID: {tx.trxId}</span>}
                      {tx.accountNumber && <span className="font-mono text-emerald-400 text-xs">Acc: {tx.accountNumber}</span>}
                    </td>
                    <td className="p-3.5 font-display text-base font-bold text-white">৳{tx.amount}</td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          tx.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'REJECTED'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {tx.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => handleAction(tx.id, 'APPROVED')}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1 shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            onClick={() => handleAction(tx.id, 'REJECTED')}
                            size="sm"
                            className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-400 text-xs font-bold py-1.5 px-3 h-auto inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
