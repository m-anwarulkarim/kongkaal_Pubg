import { useState, useEffect } from 'react'
import { Trophy, Shield, Zap, ArrowRight, Eye, Gamepad2, Calendar, Crown, Clock, Play, Film, X } from 'lucide-react'
import Image from '@/components/ui/Image'
import { getHeroBannerSettings, getMatches, type HeroBannerSettings } from '@/lib/db'
import { formatYouTubeEmbedUrl } from '@/lib/imageUtils'

interface HeroSectionProps {
  onJoinClick: () => void
  onViewAllClick: () => void
}

export default function HeroSection({ onJoinClick, onViewAllClick }: HeroSectionProps) {
  const [heroSettings, setHeroSettings] = useState<HeroBannerSettings>(() => getHeroBannerSettings())
  const [upcomingMatchInfo, setUpcomingMatchInfo] = useState<{ time: string; map: string } | null>(null)
  const [liveMatchInfo, setLiveMatchInfo] = useState<{ count: number } | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

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
  const bgVideoUrl = heroSettings.heroVideoUrl || '/hero_bg.mp4'
  const rawYtUrl = heroSettings.youtubeVideoUrl || 'https://www.youtube.com/watch?v=L6P3nI6VnlY'
  const modalVideoUrl = formatYouTubeEmbedUrl(rawYtUrl, false)

  return (
    <section className="relative overflow-hidden bg-[#07080b] py-3 sm:py-8 border-b border-white/5">
      
      {/* Hero Banner Box */}
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#0c0e14] border border-red-900/30 p-4 sm:p-8 lg:p-12 shadow-2xl">
          
          {/* Background Layer: 2-Second Smooth Animation from Image to Video */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* 1. Original Base Hero Image (Always visible first for 2 seconds) */}
            <Image
              src="/kongkaal_hero.webp"
              alt="KongKaaL Gaming PUBG Warrior"
              priority
              fill
              className="object-cover object-[80%_center] sm:object-right opacity-75 sm:opacity-60 transition-opacity"
            />

            {/* 2. Instant Background Video Layer */}
            {bgVideoUrl && (
              <div className="absolute inset-0 opacity-80 sm:opacity-70">
                {!bgVideoUrl.includes('youtube.com') && !bgVideoUrl.includes('youtu.be') ? (
                  <video
                    src={bgVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <iframe
                    src={bgVideoUrl}
                    title="PUBG Gaming Video Background"
                    className="w-full h-full object-cover pointer-events-none scale-125"
                    allow="autoplay; encrypted-media"
                  />
                )}
              </div>
            )}

            {/* Gradient Overlays for Readability (Original Gradients) */}
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
              <h1 className="font-display text-3xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white uppercase leading-none mb-2 sm:mb-3">
                KONGKAAL <span className="text-[#e50914] italic font-extrabold tracking-normal">GAMING</span>
              </h1>

              {/* Subtitle */}
              <p className="text-[11px] sm:text-sm font-extrabold tracking-wider text-gray-300 uppercase mb-6 sm:mb-8">
                BANGLADESH'S PUBG MOBILE TOURNAMENT PLATFORM
              </p>

              {/* 3 Feature Cards (1 Single Row on Mobile & Desktop) */}
              <div className="grid grid-cols-3 gap-1 sm:gap-3 max-w-2xl mb-6 sm:mb-8">
                
                {/* Fair Play */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-3 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-white block leading-tight mb-0.5 truncate">Fair Play</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-400 block truncate">100% Fair</span>
                  </div>
                </div>

                {/* Secure Payment */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-3 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-white block leading-tight mb-0.5 truncate">Secure Pay</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-400 block truncate">bKash/Nagad</span>
                  </div>
                </div>

                {/* Fast Support */}
                <div className="bg-[#10131a]/80 backdrop-blur-md border border-white/10 rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-3 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-white block leading-tight mb-0.5 truncate">Fast Support</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-400 block truncate">Always Active</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                  onClick={onJoinClick}
                  className="btn-kong-red px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 group w-full sm:w-auto cursor-pointer"
                >
                  <span>Join Tournament</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onViewAllClick}
                  className="btn-kong-outline px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold w-full sm:w-auto text-center cursor-pointer"
                >
                  View All Tournaments
                </button>

                {/* Watch Video Trailer Button */}
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-white border border-red-500/40 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-600/20 group w-full sm:w-auto cursor-pointer"
                >
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
                  </span>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Watch Gameplay Video</span>
                </button>
              </div>

            </div>

            {/* Right Column Side Panel (2-Line Grid Layout: 2 Widgets per line) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 lg:mt-0">
              
              {/* Widget 1: LIVE Tournament Ongoing */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center justify-between min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-[#e50914] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider animate-pulse uppercase shrink-0">
                      LIVE
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate">{heroSettings.liveStatusText}</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium flex items-center gap-1 truncate">
                    <Eye className="w-3 h-3 text-gray-400 shrink-0" /> {displayLiveCount} Active
                  </span>
                </div>
                <div className="p-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-red-500 shrink-0">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              </div>

              {/* Widget 2: Interactive PUBG Esports Gameplay Video Card */}
              <div
                onClick={() => setVideoModalOpen(true)}
                className="relative overflow-hidden bg-gradient-to-r from-[#121624] to-[#1a0f1d] border border-red-500/30 hover:border-red-500 rounded-xl p-2.5 sm:p-3 transition-all duration-300 shadow-lg hover:shadow-red-600/30 cursor-pointer group flex items-center gap-2 min-w-0"
              >
                <div className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                  <Image
                    src="/kongkaal_hero.webp"
                    alt="PUBG Trailer Thumbnail"
                    fill
                    className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
                    <Film className="w-2.5 h-2.5 text-red-500 shrink-0" />
                    <span className="truncate">Esports Trailer</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-extrabold text-white truncate group-hover:text-red-400 transition-colors">
                    Watch Gameplay
                  </div>
                  <span className="text-[9px] text-gray-400 block font-mono truncate">
                    Play Trailer 🎬
                  </span>
                </div>
              </div>

              {/* Widget 3: Next Match Timer (Animated Glowing Card) */}
              <div
                onClick={onJoinClick}
                className="relative overflow-hidden bg-gradient-to-r from-[#121624] via-[#161c2e] to-[#121624] backdrop-blur-md border border-red-500/30 hover:border-red-500 rounded-xl p-3 transition-all duration-300 shadow-md cursor-pointer group"
              >
                <div className="relative z-10 flex items-center justify-between min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-400">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                      </span>
                      <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="uppercase tracking-wider truncate">Next Match</span>
                    </div>

                    <div className="font-display text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{displayNextTime}</span>
                    </div>

                    <div className="text-[10px] text-gray-300 font-bold flex items-center gap-1 uppercase font-mono truncate">
                      <Shield className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{displayNextMap}</span>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-red-400 transition-all shrink-0">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Widget 4: Play Compete Win Script Box */}
              <div className="bg-[#10131a]/90 backdrop-blur-md border border-red-900/40 rounded-xl p-3 text-center relative overflow-hidden flex flex-col items-center justify-center">
                <div className="text-[9px] font-extrabold tracking-widest text-gray-300 uppercase mb-0.5">
                  PLAY • COMPETE • WIN
                </div>
                <div className="font-display text-xs sm:text-sm font-black text-[#e50914] italic uppercase tracking-wide flex items-center justify-center gap-1">
                  <span className="truncate">BE THE CHAMPION</span>
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
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
              {modalVideoUrl ? (
                !modalVideoUrl.includes('youtube.com') && !modalVideoUrl.includes('youtu.be') ? (
                  <video
                    src={modalVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={modalVideoUrl}
                    title="KongKaaL Gaming PUBG Trailer"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
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
