import { useState } from 'react'
import type { MatchItem } from '@/types/match'
import { saveRegistration } from '@/lib/db'
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
  Gamepad2,
  MessageCircle,
} from 'lucide-react'

interface SlotBookingModalProps {
  match: MatchItem | null
  open: boolean
  onClose: () => void
}

export default function SlotBookingModal({ match, open, onClose }: SlotBookingModalProps) {
  if (!match) return null

  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS')
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  // Player Details State
  const [teamName, setTeamName] = useState('')
  const [player1Name, setPlayer1Name] = useState('')
  const [player1Uid, setPlayer1Uid] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Teammates
  const [player2Name, setPlayer2Name] = useState('')
  const [player2Uid, setPlayer2Uid] = useState('')
  const [player3Name, setPlayer3Name] = useState('')
  const [player3Uid, _setPlayer3Uid] = useState('')
  const [player4Name, setPlayer4Name] = useState('')
  const [player4Uid, _setPlayer4Uid] = useState('')

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash')
  const [trxId, setTrxId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbBookingId, setDbBookingId] = useState<string | null>(null)

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01812-345678',
    Rocket: '01912-345678',
  }

  const handleCopy = (num: string, type: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNumber(type)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1Name || !player1Uid || !whatsappNumber) {
      alert('দয়া করে আপনার In-Game Name, PUBG Character ID এবং WhatsApp নাম্বার দিন!')
      return
    }
    setStep('PAYMENT')
  }

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trxId || trxId.length < 6) {
      alert('দয়া করে সঠিক Transaction ID (TrxID) লিখুন!')
      return
    }

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
      setStep('SUCCESS')
    } else {
      alert(`Error saving registration: ${result.message}`)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Admin! I have paid for PUBG Match: ${match.title}.\nMode: ${match.mode}\nIn-Game Name: ${player1Name}\nPUBG UID: ${player1Uid}\nTrxID: ${trxId}\nAmount: ৳${match.entryFee}\nPlease confirm my slot!`
  )

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
              <div className="grid grid-cols-3 gap-3 mb-6">
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
                  <span className="text-sm">bKash</span>
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
                  <span className="text-sm">Nagad</span>
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
                  <span className="text-sm">Rocket</span>
                </button>
              </div>

              {/* Instructions Box */}
              <div className="bg-[#0b0e14] border border-red-900/30 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">SEND MONEY NUMBER ({paymentMethod})</span>
                    <span className="font-display text-2xl font-black text-red-500 tracking-wider">
                      {paymentNumbers[paymentMethod]}
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleCopy(paymentNumbers[paymentMethod], paymentMethod)}
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

              {/* Transaction ID Input */}
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
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <Badge className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold uppercase mb-2">
                SAVED TO DATABASE • PENDING ADMIN VERIFICATION
              </Badge>

              <h3 className="font-display text-3xl font-black text-white uppercase mb-2 flex items-center justify-center gap-2">
                <span>SLOT RESERVED SUCCESSFULLY!</span>
                <Gamepad2 className="w-7 h-7 text-red-500" />
              </h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                আপনার স্লট বুকিং ও ট্রানজেকশন তথ্য সুপাবেস (Supabase) ডাটাবেজে সংরক্ষণ করা হয়েছে। এডমিন ভেরিফাই করার পর আপনার WhatsApp নাম্বারে গেম শুরুর ১৫ মিনিট আগে <strong>Room ID & Password</strong> পাঠাবেন।
              </p>

              {dbBookingId && (
                <div className="mb-4 text-xs font-mono text-gray-400">
                  BOOKING DB ID: <span className="text-red-400">{dbBookingId}</span>
                </div>
              )}

              <a
                href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-gaming text-sm font-extrabold inline-flex items-center gap-2 no-underline shadow-lg mb-3"
              >
                <MessageCircle className="w-4 h-4" />
                <span>INSTANT CONFIRM ON WHATSAPP</span>
              </a>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
