import { useState } from 'react'
import type { MatchItem } from './MatchSelection'

interface SlotBookingModalProps {
  match: MatchItem | null
  onClose: () => void
}

export default function SlotBookingModal({ match, onClose }: SlotBookingModalProps) {
  if (!match) return null

  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS')
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  // Player Details State
  const [teamName, setTeamName] = useState('')
  const [player1Name, setPlayer1Name] = useState('')
  const [player1Uid, setPlayer1Uid] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Teammates for Duo / Squad
  const [player2Name, setPlayer2Name] = useState('')
  const [player2Uid, setPlayer2Uid] = useState('')
  const [player3Name, setPlayer3Name] = useState('')
  const [player3Uid, setPlayer3Uid] = useState('')
  const [player4Name, setPlayer4Name] = useState('')
  const [player4Uid, setPlayer4Uid] = useState('')

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash')
  const [trxId, setTrxId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trxId || trxId.length < 6) {
      alert('দয়া করে সঠিক Transaction ID (TrxID) লিখুন!')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep('SUCCESS')
    }, 1200)
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Admin! I have paid for PUBG Match: ${match.title}.\nMode: ${match.mode}\nIn-Game Name: ${player1Name}\nPUBG UID: ${player1Uid}\nTrxID: ${trxId}\nAmount: ৳${match.entryFee}\nPlease confirm my slot!`
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
      <div className="pubg-card w-full max-w-2xl overflow-hidden my-8 relative animate-in fade-in zoom-in duration-200 border-2 border-amber-500/50">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#121826] via-[#1a2336] to-[#121826] px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest block">
              SLOT REGISTRATION & PAYMENT
            </span>
            <h3 className="font-display text-2xl font-bold text-white uppercase leading-none">
              {match.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">

          {/* STEP 1: PLAYER & TEAM DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment}>
              {/* Match Summary Pill */}
              <div className="bg-[#0b0e14] border border-amber-500/20 rounded-xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">SELECTED MODE</span>
                  <span className="font-gaming text-lg font-black text-amber-400">{match.mode} (1v{match.mode === 'SOLO' ? '1' : match.mode === 'DUO' ? '2' : '4'})</span>
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
                <span>📋</span> <span>১. খেলোয়াড় ও টিম সংক্রান্ত তথ্য পূরণ করুন</span>
              </h4>

              {match.mode !== 'SOLO' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    টিম এর নাম (TEAM NAME) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. VIP ESPORTS / VAMPIRE SQUAD"
                    className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Player 1 (Captain) */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    {match.mode === 'SOLO' ? 'খেলোয়াড়ের IGN (In-Game Name)' : 'ক্যাপ্টেনের IGN (In-Game Name)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="e.g. OP_DEADSHOT"
                    className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                    PUBG Character ID (UID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={player1Uid}
                    onChange={(e) => setPlayer1Uid(e.target.value)}
                    placeholder="e.g. 5123456789 (10-digits)"
                    className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* WhatsApp Contact Number */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  WhatsApp মোবাইল নাম্বার (Room ID ও পাসওয়ার্ড পাঠানোর জন্য) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Duo Extra Teammate */}
              {match.mode === 'DUO' && (
                <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                  <h5 className="text-xs font-bold text-amber-400 uppercase mb-3">PLAYER 2 DETAILS</h5>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Player 2 IGN"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="bg-[#121826] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Player 2 Character UID"
                      value={player2Uid}
                      onChange={(e) => setPlayer2Uid(e.target.value)}
                      className="bg-[#121826] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Squad Extra Teammates */}
              {match.mode === 'SQUAD' && (
                <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6 space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase mb-2">TEAM MEMBERS DETAILS</h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Player 2 IGN & UID"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="bg-[#121826] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Player 3 IGN & UID"
                      value={player3Name}
                      onChange={(e) => setPlayer3Name(e.target.value)}
                      className="bg-[#121826] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Player 4 IGN & UID"
                      value={player4Name}
                      onChange={(e) => setPlayer4Name(e.target.value)}
                      className="bg-[#121826] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full pubg-btn-primary py-3.5 rounded-xl font-gaming text-base font-extrabold flex items-center justify-center gap-2"
              >
                <span>পেমেন্ট ধাপে যান (PAYMENT STEP) ➔</span>
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & TRANSACTION ID */}
          {step === 'PAYMENT' && (
            <form onSubmit={handleConfirmPayment}>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <h4 className="font-gaming text-lg font-bold text-white flex items-center gap-2">
                  <span>💳</span> <span>২. বিকাশ / নগদ / রকেট এ পেমেন্ট সম্পন্ন করুন</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-xs font-bold text-amber-400 underline hover:text-white"
                >
                  ◀ ইনফরমেশন পরিবর্তন
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
                  <span className="text-xl">💖</span>
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
                  <span className="text-xl">🟠</span>
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
                  <span className="text-xl">🚀</span>
                  <span className="text-sm">Rocket</span>
                </button>
              </div>

              {/* Instructions Box */}
              <div className="bg-[#0b0e14] border border-amber-500/30 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">SEND MONEY NUMBER ({paymentMethod})</span>
                    <span className="font-display text-2xl font-black text-amber-400 tracking-wider">
                      {paymentNumbers[paymentMethod]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentNumbers[paymentMethod], paymentMethod)}
                    className="pubg-btn-secondary px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1"
                  >
                    {copiedNumber === paymentMethod ? '✅ COPIED!' : '📋 COPY NUMBER'}
                  </button>
                </div>

                <div className="text-xs text-gray-300 space-y-2 font-medium">
                  <p>১. আপনার <strong>{paymentMethod}</strong> অ্যাপ অথবা *247# ডায়াল করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                  <p>২. উপরের নাম্বারে মোট <strong>৳{match.entryFee}</strong> সেন্ড মানি করুন (রেফারেন্সে আপনার Name/IGN দিতে পারেন)।</p>
                  <p>৩. পেমেন্ট সম্পন্ন হওয়ার পর প্রাপ্ত ৮-১০ অক্ষরের <strong>Transaction ID (TrxID)</strong> টি কপি করে নিচের ঘরে লিখে জমা দিন।</p>
                </div>
              </div>

              {/* Transaction ID Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                  TRANSACTION ID (TrxID) দিন <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g. BAX8912K9L"
                  className="w-full bg-[#0b0e14] border-2 border-amber-500/60 rounded-xl px-4 py-3 text-lg font-mono font-bold text-amber-300 placeholder-gray-600 focus:outline-none focus:border-amber-400 tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full pubg-btn-green py-3.5 rounded-xl font-gaming text-base font-extrabold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>⏳ VERIFYING PAYMENT...</span>
                ) : (
                  <span>✅ SUBMIT & CONFIRM SLOT BOOKING</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS TICKET CONFIRMATION */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2">
                ORDER RECEIVED • PENDING VERIFICATION
              </span>

              <h3 className="font-display text-3xl font-black text-white uppercase mb-2">
                SLOT RESERVED SUCCESSFULLY! 🎮
              </h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                আপনার স্লট বুকিং এর অনুরোধ পেয়েছি। এডমিন TrxID মিলিয়ে পেমেন্ট ভেরিফাই করার পর আপনার WhatsApp নাম্বারে গেম শুরুর ১৫ মিনিট আগে <strong>Room ID & Password</strong> পাঠিয়ে দেওয়া হবে।
              </p>

              {/* Receipt Summary Card */}
              <div className="bg-[#0b0e14] border border-gray-800 rounded-xl p-4 text-left max-w-md mx-auto mb-6 text-xs space-y-2">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400 font-bold">MATCH:</span>
                  <span className="text-white font-bold">{match.title}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400 font-bold">PLAYER IGN:</span>
                  <span className="text-amber-400 font-bold">{player1Name} ({player1Uid})</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400 font-bold">AMOUNT PAID:</span>
                  <span className="text-green-400 font-bold">৳{match.entryFee} via {paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">TRANSACTION ID:</span>
                  <span className="text-amber-300 font-mono font-bold">{trxId}</span>
                </div>
              </div>

              {/* Direct WhatsApp Confirmation Button */}
              <a
                href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pubg-btn-green py-3.5 px-6 rounded-xl font-gaming text-sm font-extrabold inline-flex items-center gap-2 text-white no-underline shadow-lg mb-3"
              >
                <span>💬 INSTANT CONFIRM ON WHATSAPP</span>
              </a>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-white underline font-bold"
                >
                  CLOSE WINDOW
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
