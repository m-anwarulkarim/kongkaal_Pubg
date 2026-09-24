import { useState, useEffect } from 'react'

interface HeroSectionProps {
  onExploreMatches: () => void
  onBookClick: () => void
}

export default function HeroSection({ onExploreMatches, onBookClick }: HeroSectionProps) {
  // Live Countdown Timer state (e.g. 02 hrs : 45 mins : 18 secs)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 3, minutes: 0, seconds: 0 } // Reset loop for demo
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#080b10] pt-8 pb-16 border-b border-amber-500/20">
      {/* Background Banner with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_banner.jpg"
          alt="PUBG Mobile Esports Tournament Banner"
          className="h-full w-full object-cover object-center opacity-30 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-[#080b10]/70 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#080b10]/50 to-[#080b10]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center pt-4">
          
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md mb-6 shadow-lg shadow-amber-500/10">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>BANGLADESH'S #1 PUBG MOBILE CUSTOM TOURNAMENT</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-4 uppercase drop-shadow-md">
              WINNER WINNER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500">
                CHICKEN DINNER!
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-gray-300 font-medium mb-8 mx-auto lg:mx-0 leading-relaxed">
              আপনার পছন্দের গেম মোড <strong>Solo (১v১)</strong>, <strong>Duo (২v২)</strong> অথবা <strong>Squad (৪v৪)</strong> বেছে নিয়ে বিকাশ বা নগদ পেমেন্ট করে সরাসরি স্লট বুক করুন। প্রতি কিলের জন্য আকর্ষণীয় ক্যাশ রিওয়ার্ড ও চ্যাম্পিয়ন প্রাইজ মানি! 🏆
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
              <button
                onClick={onBookClick}
                className="pubg-btn-primary px-8 py-4 rounded-xl text-lg flex items-center gap-3 shadow-2xl group"
              >
                <span>🔥</span>
                <span>REGISTER & BOOK SLOT NOW</span>
                <svg className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                onClick={onExploreMatches}
                className="pubg-btn-secondary px-6 py-4 rounded-xl text-base flex items-center gap-2"
              >
                <span>🎯 VIEW ALL MATCHES</span>
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 border-t border-amber-500/20 pt-6 max-w-xl mx-auto lg:mx-0">
              <div>
                <p className="font-display text-3xl font-extrabold text-amber-400 mb-0">৳৫০,০০০+</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Payout Paid</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-amber-400 mb-0">১,৫০০+</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Gamers</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-amber-400 mb-0">১০০%</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Instant Payment</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Match Box & Countdown Card */}
          <div className="lg:col-span-5">
            <div className="pubg-card p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-600 to-amber-500 text-black font-display font-extrabold px-4 py-1 text-xs tracking-widest uppercase rounded-bl-xl shadow-md">
                NEXT MATCH IS UPCOMING
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-gaming text-xs font-bold uppercase">
                  ERANGEL SQUAD #309
                </span>
                <span className="text-gray-400 text-xs font-bold">MAP: ERANGEL</span>
              </div>

              <h3 className="font-gaming text-2xl font-extrabold text-white mb-2">
                GRAND SQUAD SHOWDOWN #309
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Starts Tonight at 9:00 PM | Room ID & Password via WhatsApp 15m before match.
              </p>

              {/* Countdown Display */}
              <div className="mb-6">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 text-center">
                  ⏳ MATCH REGISTRATION CLOSING IN:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#0b0e14] border border-amber-500/30 rounded-lg p-3">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-white block leading-none">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">HOURS</span>
                  </div>
                  <div className="bg-[#0b0e14] border border-amber-500/30 rounded-lg p-3">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-white block leading-none">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">MINUTES</span>
                  </div>
                  <div className="bg-[#0b0e14] border border-amber-500/30 rounded-lg p-3">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-400 block leading-none">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">SECONDS</span>
                  </div>
                </div>
              </div>

              {/* Prize Pool Breakdown Card */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-gray-300">🏆 1st Winner (Chicken Dinner)</span>
                  <span className="font-display text-xl font-bold text-amber-400">৳৬,০০০</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-gray-300">⚔️ Per Kill Reward</span>
                  <span className="font-display text-xl font-bold text-green-400">৳৮০ / kill</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-300">🎟️ Squad Entry Fee</span>
                  <span className="font-display text-xl font-bold text-white">৳২০০ (৳৫০/প্লেয়ার)</span>
                </div>
              </div>

              {/* Slot Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-400">JOINED SLOTS</span>
                  <span className="text-gray-300">18 / 25 SQUADS (72% FULL)</span>
                </div>
                <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <button
                onClick={onBookClick}
                className="w-full pubg-btn-primary py-3.5 rounded-xl font-gaming text-base font-extrabold shadow-lg flex items-center justify-center gap-2"
              >
                <span>⚡ BOOK SQUAD SLOT (৳২০০)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
