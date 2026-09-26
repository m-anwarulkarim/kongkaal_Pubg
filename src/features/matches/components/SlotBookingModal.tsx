import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { MatchItem } from '@/types/match'
import { saveRegistration } from '@/lib/db'
import { useCustomerAuth, signInWithGoogle } from '@/lib/auth'
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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  const [authLoading, setAuthLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('গুগল লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setAuthLoading(false)
    }
  }

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
      <DialogContent className="kong-card w-[95vw] sm:w-full max-w-2xl bg-[#0e1420] text-gray-100 border-2 border-red-900/50 max-h-[92vh] overflow-y-auto p-0 rounded-2xl sm:rounded-3xl shadow-2xl">
        
        {/* Modal Header */}
        <DialogHeader className="bg-gradient-to-r from-[#121826] via-[#1a2336] to-[#121826] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-red-900/30 sticky top-0 z-20 backdrop-blur-md">
          <Badge className="bg-red-600/20 text-red-500 font-gaming text-[9px] sm:text-[10px] uppercase font-bold tracking-widest border border-red-600/30 w-fit mb-1">
            SLOT REGISTRATION & PAYMENT
          </Badge>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-white uppercase leading-none">
            {match.title}
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* STEP 1: PLAYER & TEAM DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 sm:space-y-5">
              {/* Google Auth Suggestion Banner for Unauthenticated Users */}
              {!user ? (
                <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-red-950/50 via-[#131726] to-[#0c0e18] border border-red-500/40 shadow-xl relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 shrink-0 mt-0.5 shadow-sm">
                        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                          <span>গুগল দিয়ে লগইন করার অনুরোধ!</span>
                          <span className="bg-[#e50914] text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                            Recommended
                          </span>
                        </h5>
                        <p className="text-[10px] sm:text-[11px] text-gray-300 mt-1 leading-normal">
                          গুগল দিয়ে লগইন থাকলে টুর্নামেন্টের <strong className="text-red-400 font-bold">Room ID & Password</strong> ড্যাশবোর্ডে পাবেন।
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 mt-1 sm:mt-0"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>{authLoading ? 'লগইন হচ্ছে...' : 'Login with Google'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-400">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">কানেক্টেড অ্যাকাউন্ট: <strong className="text-white">{user.user_metadata?.full_name || user.email}</strong></span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold shrink-0 flex items-center gap-1 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Auto Filled
                  </span>
                </div>
              )}

              {/* Match Summary Pill */}
              <div className="bg-[#0b0e14] border border-red-900/20 rounded-xl p-3 sm:p-4 grid grid-cols-3 gap-2 text-center shadow-inner">
                <div className="border-r border-white/5 pr-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">MODE</span>
                  <span className="font-gaming text-sm sm:text-lg font-black text-red-500 truncate block">{match.mode}</span>
                </div>
                <div className="border-r border-white/5 px-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">ENTRY FEE</span>
                  <span className="font-display text-base sm:text-2xl font-black text-white">৳{match.entryFee}</span>
                </div>
                <div className="pl-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">TIME</span>
                  <span className="text-[11px] sm:text-xs font-bold text-green-400 truncate block">{match.time}</span>
                </div>
              </div>

              <h4 className="font-gaming text-sm sm:text-base font-bold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                <span>১. খেলোয়াড় ও টিম সংক্রান্ত তথ্য পূরণ করুন</span>
              </h4>

              {match.mode !== 'SOLO' && (
                <div>
                  <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                    টিম এর নাম (TEAM NAME) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. VIP ESPORTS / VAMPIRE SQUAD"
                    className="bg-[#0b0e14] border-gray-700 text-white text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Player 1 (Captain) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                    {match.mode === 'SOLO' ? 'খেলোয়াড়ের IGN' : 'ক্যাপ্টেনের IGN'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="e.g. OP_DEADSHOT"
                    className="bg-[#0b0e14] border-gray-700 text-white text-xs sm:text-sm"
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
                    placeholder="e.g. 5123456789"
                    className="bg-[#0b0e14] border-gray-700 text-white text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Contact Number */}
              <div>
                <Label className="text-xs font-bold text-gray-300 uppercase mb-1 block">
                  WhatsApp নাম্বার (Room ID পাঠানোর জন্য) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="bg-[#0b0e14] border-gray-700 text-white text-xs sm:text-sm font-mono"
                />
              </div>

              {/* Duo Teammate */}
              {match.mode === 'DUO' && (
                <div className="bg-[#0b0e14] p-3.5 sm:p-4 rounded-xl border border-gray-800 space-y-3">
                  <h5 className="text-xs font-bold text-red-400 uppercase">PLAYER 2 DETAILS</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Player 2 IGN"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white text-xs sm:text-sm"
                    />
                    <Input
                      placeholder="Player 2 Character UID"
                      value={player2Uid}
                      onChange={(e) => setPlayer2Uid(e.target.value)}
                      className="bg-[#121826] border-gray-700 text-white text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Squad Teammates */}
              {match.mode === 'SQUAD' && (
                <div className="bg-[#0b0e14] p-3.5 sm:p-4 rounded-xl border border-gray-800 space-y-3">
                  <h5 className="text-xs font-bold text-red-400 uppercase">TEAM MEMBERS DETAILS</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full btn-kong-red py-3.5 rounded-xl font-gaming text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 group shadow-lg"
              >
                <span>পেমেন্ট ধাপে যান (PAYMENT STEP)</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & TRANSACTION ID */}
          {step === 'PAYMENT' && (
            <form onSubmit={handleConfirmPayment} className="space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="font-gaming text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                  <span>২. বিকাশ / নগদ / রকেট এ পেমেন্ট করুন</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-xs font-bold text-red-400 underline hover:text-white flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>পরিবর্তন</span>
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'bKash'
                      ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                  <span className="text-xs">bKash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'Nagad'
                      ? 'bg-orange-950/40 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="text-xs">Nagad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Rocket')}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'Rocket'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span className="text-xs">Rocket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-[#0b0e14] border-emerald-500/30 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span className="text-xs font-black">Pay Wallet</span>
                </button>
              </div>

              {/* WALLET PAYMENT INSTANT CHECKOUT */}
              {paymentMethod === 'WALLET' ? (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-gaming text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
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
                  <div className="bg-[#0b0e14] border border-red-900/30 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-3">
                      <div>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">SEND MONEY NUMBER ({paymentMethod})</span>
                        <span className="font-display text-xl sm:text-2xl font-black text-red-500 tracking-wider">
                          {paymentNumbers[paymentMethod as keyof typeof paymentNumbers] || '01712-345678'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleCopy(paymentNumbers[paymentMethod as keyof typeof paymentNumbers] || '01712-345678', paymentMethod)}
                        className="btn-kong-outline px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 w-full sm:w-auto justify-center"
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

                    <div className="text-[11px] sm:text-xs text-gray-300 space-y-1.5 font-medium">
                      <p>১. আপনার <strong>{paymentMethod}</strong> অ্যাপ এ গিয়ে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                      <p>২. সেন্ড মানি করুন মোট <strong>৳{match.entryFee}</strong> টাকা।</p>
                      <p>৩. পেমেন্ট সম্পন্ন হলে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> টি কপি করে নিচে বসান।</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-red-400 uppercase mb-1 block">
                      TRANSACTION ID (TrxID) দিন <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. BAX8912K9L"
                      className="bg-[#0b0e14] border-2 border-red-600/60 text-base sm:text-lg font-mono font-bold text-red-400 text-center tracking-widest uppercase py-2.5"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-gaming text-xs sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-lg"
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
            <div className="text-center py-4 sm:py-6 space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-emerald-600/30 to-green-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <Badge className="bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {paymentMethod === 'WALLET' ? '✓ INSTANTLY VERIFIED VIA WALLET' : '⏳ RESERVED (PENDING ADMIN VERIFICATION)'}
                </Badge>

                <h3 className="font-display text-xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-emerald-400 uppercase tracking-wide pt-2">
                  THANK YOU FOR REGISTERING! 🎉
                </h3>
                <p className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">
                  ধন্যবাদ! আপনার টুর্নামেন্ট স্লট বুকিং সফলভাবে জমা হয়েছে।
                </p>
              </div>

              {/* Registration Summary Card */}
              <div className="bg-[#0b0e16] border border-white/10 rounded-2xl p-3.5 sm:p-4 max-w-lg mx-auto text-left space-y-2 text-[11px] sm:text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400 font-bold">MATCH:</span>
                  <span className="text-white font-bold">{match.title} ({match.mode})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400 font-bold">PLAYER IGN & UID:</span>
                  <span className="text-amber-400 font-mono font-bold">{player1Name} ({player1Uid})</span>
                </div>
                {teamName && (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-gray-400 font-bold">TEAM NAME:</span>
                    <span className="text-white font-bold">{teamName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">PAYMENT METHOD:</span>
                  <span className="text-emerald-400 font-bold font-mono">{paymentMethod} {trxId ? `(TrxID: ${trxId})` : ''}</span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                ম্যাচ শুরুর ১৫ মিনিট আগে আপনার ড্যাশবোর্ডে **Room ID & Password** অপশন দেখতে পাবেন।
              </p>

              {/* Tournament WhatsApp Group Link Button */}
              <div className="p-3.5 sm:p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-2 max-w-lg mx-auto">
                <span className="text-[11px] sm:text-xs text-emerald-400 font-bold block">
                  📢 টুর্নামেন্ট রুম কোডের জন্য অফিশিয়াল ওয়াটসঅ্যাপ চ্যানেলে জয়েন করুন:
                </span>
                <a
                  href={match.whatsappGroupLink || 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs inline-flex items-center justify-center gap-2 no-underline shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>JOIN OFFICIAL WHATSAPP CHANNEL FOR ROOM CODE</span>
                </a>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <a
                  href="/dashboard"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 no-underline transition-colors"
                >
                  View My Dashboard
                </a>
                <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
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
