import { useState, useEffect } from 'react'
import { Trophy, Shield, Zap, ArrowRight, Eye, Gamepad2, Calendar, Crown, Clock, Play, Film, X } from 'lucide-react'
import Image from '@/components/ui/Image'
import { getHeroBannerSettings, getMatches, type HeroBannerSettings } from '@/lib/db'

interface HeroSectionProps {
  onJoinClick: () => void
  onViewAllClick: () => void
}

export default function HeroSection({ onJoinClick, onViewAllClick }: HeroSectionProps) {
  const [heroSettings, setHeroSettings] = useState<HeroBannerSettings>(() => getHeroBannerSettings())
  const [upcomingMatchInfo, setUpcomingMatchInfo] = useState<{ time: string; map: string } | null>(null)
  const [liveMatchInfo, setLiveMatchInfo] = useState<{ count: number } | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [isVideoBackground, setIsVideoBackground] = useState(false)

  useEffect(() => {
    const loadBannerData = async () => {
      setHeroSettings(getHeroBannerSettings())

      try {
        const matches = await getMatches()
        const upcoming = matches.find((m) => m.status === 'OPEN' || m.status === 'FILLING_FAST' || m.status === 'LIVE_SOON')
        const activeMatches = matches.filter((m) => m.status !== 'COMPLETED')

        if (upcoming) {
          setUpcomingMatchInfo({
            time: upcoming.time || 'Today • 10:00 PM',
            map: `${upcoming.map} / ${upcoming.mode || 'Asia'}`,
          })
        }

        if (activeMatches.length > 0) {
          const totalJoined = activeMatches.reduce((acc, curr) => acc + (curr.joinedSlots || 0), 0)
          setLiveMatchInfo({ count: totalJoined > 0 ? totalJoined : 128 })
        }
      } catch (err) {
        console.warn('Could not load dynamic matches for hero:', err)
      }
    }

    loadBannerData()

    const handleUpdate = () => {
      loadBannerData()
    }

    window.addEventListener('hero_settings_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('hero_settings_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const displayNextTime = upcomingMatchInfo?.time || heroSettings.nextMatchTime
  const displayNextMap = upcomingMatchInfo?.map || heroSettings.nextMatchMap
  const displayLiveCount = liveMatchInfo?.count || heroSettings.activePlayersCount
  const videoUrl = heroSettings.heroVideoUrl || 'https://www.youtube.com/embed/uCd6tbLv6XY?autoplay=1'

  return (
    <section className="relative overflow-hidden bg-[#07080b] py-8 border-b border-white/5">
      
      {/* Hero Banner Box */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#0c0e14] border border-red-900/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
          
          {/* Background Image / Video & Red Smoke Flare Overlay */}
          <div className="absolute inset-0 z-0">
            {isVideoBackground && videoUrl ? (
              <iframe
                src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&controls=0`}
                title="PUBG Gaming Video Background"
                className="w-full h-full object-cover scale-125 pointer-events-none opacity-60"
                allow="autoplay; encrypted-media"
              />
            ) : (
              <Image
                src="/kongkaal_hero.webp"
                alt="KongKaaL Gaming PUBG Warrior"
                priority
                fill
                className="object-cover object-[80%_center] sm:object-right opacity-75 sm:opacity-60 transition-opacity"
              />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080b]/95 via-[#07080b]/60 to-[#07080b]/20 sm:via-[#07080b]/90 sm:to-transparent w-full lg:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-black/40" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column Text & Buttons */}
            <div className="lg:col-span-8">
              
              {/* Welcome Badge & Media Switcher */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-[#e50914]" />
                  <span className="text-xs font-bold tracking-widest text-[#e50914] uppercase">
                    WELCOME TO
                  </span>
                </div>

                {/* Video / Image Mode Toggle Pill */}
                <div className="flex items-center bg-black/60 border border-white/15 p-1 rounded-xl backdrop-blur-md">
                  <button
                    onClick={() => setIsVideoBackground(false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      !isVideoBackground ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Image View
                  </button>
                  <button
                    onClick={() => setIsVideoBackground(true)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isVideoBackground ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    Video View
                  </button>
                </div>
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
              <div className="flex flex-wrap items-center gap-3">
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

                {/* Watch Video Trailer Button */}
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-white border border-red-500/40 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-red-600/20 group"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Watch Gameplay Video</span>
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
                    <span className="text-xs font-bold text-white">{heroSettings.liveStatusText}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" /> {displayLiveCount} Players Active
                  </span>
                </div>
                <div className="p-2 bg-red-600/10 border border-red-600/20 rounded-lg text-red-500">
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </div>

              {/* Widget 2: Interactive PUBG Esports Gameplay Video Card */}
              <div
                onClick={() => setVideoModalOpen(true)}
                className="relative overflow-hidden bg-gradient-to-r from-[#121624] to-[#1a0f1d] border border-red-500/30 hover:border-red-500 rounded-xl p-3.5 transition-all duration-300 shadow-lg hover:shadow-red-600/30 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                    <Image
                      src="/kongkaal_hero.webp"
                      alt="PUBG Trailer Thumbnail"
                      fill
                      className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
                      <Film className="w-3 h-3 text-red-500" />
                      <span>Esports Trailer</span>
                    </div>
                    <div className="text-xs font-extrabold text-white truncate group-hover:text-red-400 transition-colors">
                      Watch PUBG Mobile Gameplay
                    </div>
                    <span className="text-[10px] text-gray-400 block font-mono mt-0.5">
                      Click to Play Trailer Video 🎬
                    </span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Next Match Timer (Animated Glowing Card) */}
              <div
                onClick={onJoinClick}
                className="relative overflow-hidden bg-gradient-to-r from-[#121624] via-[#161c2e] to-[#121624] backdrop-blur-md border border-red-500/30 hover:border-red-500 rounded-xl p-4 transition-all duration-300 shadow-[0_0_20px_rgba(229,9,20,0.15)] hover:shadow-[0_0_30px_rgba(229,9,20,0.35)] hover:-translate-y-0.5 cursor-pointer group"
              >
                {/* Glowing Radar Light Pulse in Corner */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-600/20 rounded-full blur-xl pointer-events-none group-hover:bg-red-500/35 transition-all duration-500" />
                
                {/* Animated Light Sheen Effect */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    {/* Header with Pulsing Live Radar Badge */}
                    <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span className="uppercase tracking-wider">Next Match</span>
                    </div>

                    {/* Time Display with Neon Glow Text */}
                    <div className="font-display text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{displayNextTime}</span>
                    </div>

                    {/* Map & Mode with Shield Badge */}
                    <div className="text-[11px] text-gray-300 font-bold flex items-center gap-1.5 uppercase font-mono">
                      <Shield className="w-3.5 h-3.5 text-red-500 fill-red-500/20 shrink-0" />
                      <span>{displayNextMap}</span>
                    </div>
                  </div>

                  {/* Right Animated Arrow Badge */}
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-red-400 transition-all duration-300 shrink-0 shadow-md">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Widget 4: Play Compete Win Script Box */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-red-900/40 rounded-xl p-4 text-center relative overflow-hidden">
                <div className="text-[10px] font-extrabold tracking-widest text-gray-300 uppercase mb-0.5">
                  PLAY • COMPETE • WIN
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-[#e50914] italic uppercase tracking-wide flex items-center justify-center gap-2">
                  <span>BE THE NEXT CHAMPION</span>
                  <Crown className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* VIDEO POPUP MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative bg-[#0c0e14] border border-red-500/40 rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl space-y-3">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121624]">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                  KongKaaL Gaming • Official PUBG Trailer & Gameplay
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {videoUrl ? (
                <iframe
                  src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1`}
                  title="KongKaaL Gaming PUBG Trailer"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <Film className="w-12 h-12 text-red-500 mb-2" />
                  <p className="text-sm font-bold text-white">No Video Link Configured</p>
                  <span className="text-xs text-gray-400 mt-1">
                    Admin can add a video URL in Admin Panel Settings.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0a0c12] border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">
                🔥 Join Bangladesh's Biggest PUBG Mobile Tournaments!
              </span>
              <button
                onClick={() => {
                  setVideoModalOpen(false)
                  onJoinClick()
                }}
                className="btn-kong-red px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  )
}
