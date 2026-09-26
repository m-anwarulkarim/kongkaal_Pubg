import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { MatchItem } from '@/types/match'
import { saveRegistration } from '@/lib/db'
import { useCustomerAuth } from '@/lib/auth'
import { payMatchWithWallet } from '@/lib/wallet'
import { slotRegistrationSchema, paymentTrxSchema, validateForm } from '@/lib/validations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  Heart,
  Flame,
  Rocket,
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
} from 'lucide-react'

interface SlotBookingModalProps {
  match: MatchItem | null
  open: boolean
  onClose: () => void
}

export default function SlotBookingModal({ match, open, onClose }: SlotBookingModalProps) {
  if (!match) return null

  const { user } = useCustomerAuth()

  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS')
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  // Player Details State
  const [teamName, setTeamName] = useState('')
  const [player1Name, setPlayer1Name] = useState('')
  const [player1Uid, setPlayer1Uid] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Auto pre-fill if customer logged in via Google
  useEffect(() => {
    if (user && !player1Name) {
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
      setPlayer1Name(googleName)
    }
  }, [user, open])

  // Teammates
  const [player2Name, setPlayer2Name] = useState('')
  const [player2Uid, setPlayer2Uid] = useState('')
  const [player3Name, setPlayer3Name] = useState('')
  const [player3Uid, _setPlayer3Uid] = useState('')
  const [player4Name, setPlayer4Name] = useState('')
  const [player4Uid, _setPlayer4Uid] = useState('')

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'WALLET'>('bKash')
  const [trxId, setTrxId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [_dbBookingId, setDbBookingId] = useState<string | null>(null)

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01812-345678',
    Rocket: '01912-345678',
  }

  const handleCopy = (num: string, type: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNumber(type)
    toast.success(`${type} Send Money নম্বর কপি হয়েছে!`)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateForm(slotRegistrationSchema, {
      player1Name,
      player1Uid,
      whatsappNumber,
      teamName: teamName || undefined,
      player2Name: player2Name || undefined,
      player2Uid: player2Uid || undefined,
      player3Name: player3Name || undefined,
      player3Uid: player3Uid || undefined,
      player4Name: player4Name || undefined,
      player4Uid: player4Uid || undefined,
    })

    if (!validation.success) return

    if (match.mode !== 'SOLO' && (!teamName || teamName.trim().length < 2)) {
      toast.error('দয়া করে আপনার টিম এর নাম (Team Name) কমপক্ষে ২ অক্ষরের দিন!')
      return
    }

    setStep('PAYMENT')
  }

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === 'WALLET') {
      if (!user?.email) {
        toast.error('ওয়ালেট দিয়ে পেমেন্ট করতে গুগলে লগইন থাকুন!')
        return
      }
      setIsSubmitting(true)

      const payRes = await payMatchWithWallet(user.email, player1Name, match.entryFee, match.title)
      if (!payRes.success) {
        setIsSubmitting(false)
        toast.error(payRes.message)
        return
      }

      // Save registration with WALLET
      const result = await saveRegistration({
        matchId: match.id,
        teamName: teamName || undefined,
        player1Name,
        player1Uid,
        whatsappNumber,
        player2Name: player2Name || undefined,
        player2Uid: player2Uid || undefined,
        player3Name: player3Name || undefined,
        player3Uid: player3Uid || undefined,
        player4Name: player4Name || undefined,
        player4Uid: player4Uid || undefined,
        paymentMethod: 'WALLET',
        trxId: 'WALLET-' + Date.now().toString().slice(-6),
        amount: match.entryFee,
      })

      setIsSubmitting(false)
      if (result.success) {
        if (result.id) setDbBookingId(result.id)
        toast.success('🎉 ধন্যবাদ! ওয়ালেট পেমেন্টে আপনার স্লট ভেরিফাইড হয়েছে!')
        setStep('SUCCESS')
      } else {
        toast.error(`Error saving slot: ${result.message}`)
      }
      return
    }

    const trxValidation = validateForm(paymentTrxSchema, { trxId })
    if (!trxValidation.success) return

    setIsSubmitting(true)

    // Send to Supabase Database Service
    const result = await saveRegistration({
      matchId: match.id,
      teamName: teamName || undefined,
      player1Name,
      player1Uid,
      whatsappNumber,
      player2Name: player2Name || undefined,
      player2Uid: player2Uid || undefined,
      player3Name: player3Name || undefined,
      player3Uid: player3Uid || undefined,
      player4Name: player4Name || undefined,
      player4Uid: player4Uid || undefined,
      paymentMethod,
      trxId,
      amount: match.entryFee,
    })

    setIsSubmitting(false)

    if (result.success) {
      if (result.id) setDbBookingId(result.id)
      toast.success('🎉 ধন্যবাদ! আপনার স্লট বুকিং সফলভাবে জমা হয়েছে!')
      setStep('SUCCESS')
    } else {
      toast.error(`Error saving registration: ${result.message}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="kong-card max-w-2xl bg-[#0e1420] text-gray-100 border-2 border-red-900/50 max-h-[90vh] overflow-y-auto p-0">
        
        {/* Modal Header */}
        <DialogHeader className="bg-gradient-to-r from-[#121826] via-[#1a2336] to-[#121826] px-6 py-4 border-b border-red-900/30">
          <Badge className="bg-red-600/20 text-red-500 font-gaming text-[10px] uppercase font-bold tracking-widest border border-red-600/30 w-fit mb-1">
            SLOT REGISTRATION & PAYMENT
          </Badge>
          <DialogTitle className="font-display text-2xl font-bold text-white uppercase leading-none">
            {match.title}
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6">

          {/* STEP 1: PLAYER & TEAM DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment}>
              {/* Match Summary Pill */}
              <div className="bg-[#0b0e14] border border-red-900/20 rounded-xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">SELECTED MODE</span>
                  <span className="font-gaming text-lg font-black text-red-500">{match.mode} (1v{match.mode === 'SOLO' ? '1' : match.mode === 'DUO' ? '2' : '4'})</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">ENTRY FEE</span>
                  <span className="font-display text-2xl font-black text-white">৳{match.entryFee}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">MATCH TIME</span>
                  <span className="text-xs font-bold text-green-400">{match.time}</span>
                </div>
              </div>

              <h4 className="font-gaming text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-red-500" />
                <span>১. খেলোয়াড় ও টিম সংক্রান্ত তথ্য পূরণ করুন</span>
              </h4>

              {match.mode !== 'SOLO' && (
                <div className="mb-4">
                  <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                    টিম এর নাম (TEAM NAME) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. VIP ESPORTS / VAMPIRE SQUAD"
                    className="bg-[#0b0e14] border-gray-700 text-white"
                  />
                </div>
              )}

              {/* Player 1 (Captain) */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                    {match.mode === 'SOLO' ? 'খেলোয়াড়ের IGN' : 'ক্যাপ্টেনের IGN'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="e.g. OP_DEADSHOT"
                    className="bg-[#0b0e14] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                    PUBG Character ID (UID) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={player1Uid}
                    onChange={(e) => setPlayer1Uid(e.target.value)}
                    placeholder="e.g. 5123456789 (10-digits)"
                    className="bg-[#0b0e14] border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* WhatsApp Contact Number */}
              <div className="mb-6">
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                  WhatsApp মোবাইল নাম্বার (Room ID পাঠানোর জন্য) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="bg-[#0b0e14] border-gray-700 text-white"
                />
              </div>

              {/* Duo Teammate */}
              {match.mode === 'DUO' && (
                <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                  <h5 className="text-xs font-bold text-red-400 uppercase mb-3">PLAYER 2 DETAILS</h5>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Player 2 IGN"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Player 2 Character UID"
                      value={player2Uid}
                      onChange={(e) => setPlayer2Uid(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Squad Teammates */}
              {match.mode === 'SQUAD' && (
                <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6 space-y-3">
                  <h5 className="text-xs font-bold text-red-400 uppercase mb-2">TEAM MEMBERS DETAILS</h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Player 2 IGN & UID"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white text-xs"
                    />
                    <Input
                      placeholder="Player 3 IGN & UID"
                      value={player3Name}
                      onChange={(e) => setPlayer3Name(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white text-xs"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Player 4 IGN & UID"
                      value={player4Name}
                      onChange={(e) => setPlayer4Name(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-kong-red py-3.5 rounded-xl font-gaming text-base font-extrabold flex items-center justify-center gap-2 group"
              >
                <span>পেমেন্ট ধাপে যান (PAYMENT STEP)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & TRANSACTION ID */}
          {step === 'PAYMENT' && (
            <form onSubmit={handleConfirmPayment}>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <h4 className="font-gaming text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  <span>২. বিকাশ / নগদ / রকেট এ পেমেন্ট সম্পন্ন করুন</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-xs font-bold text-red-400 underline hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>পরিবর্তন</span>
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'bKash'
                      ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-xs">bKash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'Nagad'
                      ? 'bg-orange-950/40 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-xs">Nagad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Rocket')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'Rocket'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Rocket className="w-5 h-5 text-purple-400" />
                  <span className="text-xs">Rocket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-[#0b0e14] border-emerald-500/30 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <Copy className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black">Pay Wallet</span>
                </button>
              </div>

              {/* WALLET PAYMENT INSTANT CHECKOUT */}
              {paymentMethod === 'WALLET' ? (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs text-emerald-300 font-bold">
                    <span>Pay with Account Wallet Balance:</span>
                    <span className="text-sm font-display text-white">Entry Fee: ৳{match.entryFee}</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    আপনার একাউন্ট ব্যালেন্স থেকে সাথে সাথে <strong>৳{match.entryFee}</strong> কেটে নেওয়া হবে এবং সাথে সাথে আপনার স্লট **ভেরিফাইড (VERIFIED)** হয়ে যাবে!
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-gaming text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    <span>1-CLICK WALLET PAY & JOIN MATCH</span>
                  </Button>
                </div>
              ) : (
                /* MANUAL BKASH/NAGAD TRXiD CHECKOUT */
                <>
                  <div className="bg-[#0b0e14] border border-red-900/30 rounded-xl p-5 mb-6">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
                      <div>
                        <span className="text-xs text-gray-400 font-bold block">SEND MONEY NUMBER ({paymentMethod})</span>
                        <span className="font-display text-2xl font-black text-red-500 tracking-wider">
                          {paymentNumbers[paymentMethod as keyof typeof paymentNumbers] || '01712-345678'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleCopy(paymentNumbers[paymentMethod as keyof typeof paymentNumbers] || '01712-345678', paymentMethod)}
                        className="btn-kong-outline px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1"
                      >
                        {copiedNumber === paymentMethod ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY NUMBER</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-300 space-y-2 font-medium">
                      <p>১. আপনার <strong>{paymentMethod}</strong> অ্যাপ এ গিয়ে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                      <p>২. সেন্ড মানি করুন মোট <strong>৳{match.entryFee}</strong> টাকা।</p>
                      <p>৩. পেমেন্ট সম্পন্ন হলে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> টি কপি করে নিচে বসান।</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label className="text-xs font-bold text-red-400 uppercase mb-1 block">
                      TRANSACTION ID (TrxID) দিন <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. BAX8912K9L"
                      className="bg-[#0b0e14] border-2 border-red-600/60 text-lg font-mono font-bold text-red-400 text-center tracking-widest uppercase"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-gaming text-base font-extrabold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>SAVING TO DATABASE...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>SUBMIT & SAVE TO DATABASE</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION & WHATSAPP MATCH GROUP LINK */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600/30 to-green-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <Badge className="bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {paymentMethod === 'WALLET' ? '✓ INSTANTLY VERIFIED VIA WALLET' : '⏳ RESERVED (PENDING ADMIN VERIFICATION)'}
                </Badge>

                <h3 className="font-display text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-emerald-400 uppercase tracking-wide pt-2">
                  THANK YOU FOR REGISTERING! 🎉
                </h3>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  ধন্যবাদ! আপনার টুর্নামেন্ট স্লট বুকিং সফলভাবে জমা হয়েছে।
                </p>
              </div>

              {/* Registration Summary Card */}
              <div className="bg-[#0b0e16] border border-white/10 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 font-bold">MATCH:</span>
                  <span className="text-white font-bold">{match.title} ({match.mode})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 font-bold">PLAYER IGN & UID:</span>
                  <span className="text-amber-400 font-mono font-bold">{player1Name} ({player1Uid})</span>
                </div>
                {teamName && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400 font-bold">TEAM NAME:</span>
                    <span className="text-white font-bold">{teamName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">PAYMENT METHOD:</span>
                  <span className="text-emerald-400 font-bold font-mono">{paymentMethod} {trxId ? `(TrxID: ${trxId})` : ''}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                ম্যাচ শুরুর ১৫ মিনিট আগে আপনার ড্যাশবোর্ডে **Room ID & Password** অপশন দেখতে পাবেন।
              </p>

              {/* Tournament WhatsApp Group Link Button */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-2 max-w-lg mx-auto">
                <span className="text-xs text-emerald-400 font-bold block">
                  📢 টুর্নামেন্ট রুম কোডের জন্য অফিশিয়াল ওয়াটসঅ্যাপ চ্যানেলে জয়েন করুন:
                </span>
                <a
                  href={match.whatsappGroupLink || 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs inline-flex items-center justify-center gap-2 no-underline shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>JOIN OFFICIAL WHATSAPP CHANNEL FOR ROOM CODE</span>
                </a>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <a
                  href="/dashboard"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-white/20 no-underline transition-colors"
                >
                  View My Dashboard
                </a>
                <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer">
                  Close Window
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
