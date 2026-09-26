import { Trophy, Shield, Zap, ArrowRight, Eye, Gamepad2, Calendar, Crown } from 'lucide-react'
import Image from '@/components/ui/Image'

interface HeroSectionProps {
  onJoinClick: () => void
  onViewAllClick: () => void
}

export default function HeroSection({ onJoinClick, onViewAllClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#07080b] py-8 border-b border-white/5">
      
      {/* Hero Banner Box */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#0c0e14] border border-red-900/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
          
          {/* Background Image & Red Smoke Flare Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/kongkaal_hero.jpg"
              alt="KongKaaL Gaming PUBG Warrior"
              priority
              fill
              className="object-cover object-[80%_center] sm:object-right opacity-75 sm:opacity-60 transition-opacity"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080b]/95 via-[#07080b]/60 to-[#07080b]/20 sm:via-[#07080b]/90 sm:to-transparent w-full lg:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-black/40" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column Text & Buttons */}
            <div className="lg:col-span-8">
              
              {/* Welcome Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-0.5 w-8 bg-[#e50914]" />
                <span className="text-xs font-bold tracking-widest text-[#e50914] uppercase">
                  WELCOME TO
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white uppercase leading-none mb-3">
                KONGKAAL <span className="text-[#e50914] italic font-extrabold tracking-normal">GAMING</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-300 uppercase mb-8">
                BANGLADESH'S PUBG MOBILE TOURNAMENT PLATFORM
              </p>

              {/* 3 Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mb-8">
                
                {/* Fair Play */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none mb-0.5">Fair Play</span>
                    <span className="text-[10px] text-gray-400 block">100% Fair Tournament</span>
                  </div>
                </div>

                {/* Secure Payment */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none mb-0.5">Secure Payment</span>
                    <span className="text-[10px] text-gray-400 block">bKash / Nagad</span>
                  </div>
                </div>

                {/* Fast Support */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none mb-0.5">Fast Support</span>
                    <span className="text-[10px] text-gray-400 block">Always With You</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onJoinClick}
                  className="btn-kong-red px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 group"
                >
                  <span>Join Tournament</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onViewAllClick}
                  className="btn-kong-outline px-6 py-3 rounded-xl text-sm font-bold"
                >
                  View All Tournaments
                </button>
              </div>

            </div>

            {/* Right Column Side Panel (Stacked Widgets) */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* Widget 1: LIVE Tournament Ongoing */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#e50914] text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider animate-pulse uppercase">
                      LIVE
                    </span>
                    <span className="text-xs font-bold text-white">Tournament Ongoing</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" /> 128 Players Active
                  </span>
                </div>
                <div className="p-2 bg-red-600/10 border border-red-600/20 rounded-lg text-red-500">
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </div>

              {/* Widget 2: Next Match Timer */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> <span>Next Match</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  Today • 10:00 PM
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-red-500" /> Erangel / Asia
                </div>
              </div>

              {/* Widget 3: Play Compete Win Script Box */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-red-900/40 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="text-xs font-extrabold tracking-widest text-gray-300 uppercase mb-1">
                  PLAY • COMPETE • WIN
                </div>
                <div className="font-display text-3xl font-black text-[#e50914] italic uppercase tracking-wide flex items-center justify-center gap-2">
                  <span>BE THE NEXT CHAMPION</span>
                  <Crown className="w-7 h-7 text-amber-400 fill-amber-400 shrink-0" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
