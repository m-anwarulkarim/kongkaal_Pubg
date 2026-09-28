import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const userMutedRef = useRef<boolean>(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.05
    audio.muted = false

    const removeListeners = () => {
      const events = ['mousemove', 'touchstart', 'pointerdown', 'scroll', 'click', 'keydown']
      events.forEach((evt) => window.removeEventListener(evt, handleEvents))
    }

    const playAudio = () => {
      if (!audio || userMutedRef.current) return
      audio.volume = 0.05
      audio.muted = false
      const promise = audio.play()
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true)
            setIsMuted(false)
            removeListeners()
          })
          .catch(() => {
            // Autoplay blocked by browser on initial frame, waiting for user gesture
          })
      }
    }

    const handleEvents = (e: Event) => {
      if (userMutedRef.current) return
      const target = e.target as HTMLElement | null
      if (target && target.closest('.bg-music-toggle-btn')) {
        return
      }
      playAudio()
    }

    // Try playing immediately as page opens
    playAudio()

    const events = ['mousemove', 'touchstart', 'pointerdown', 'scroll', 'click', 'keydown']
    events.forEach((evt) => window.addEventListener(evt, handleEvents, { passive: true }))

    return () => {
      removeListeners()
    }
  }, [])

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && !isMuted) {
      userMutedRef.current = true
      audio.pause()
      setIsPlaying(false)
      setIsMuted(true)
    } else {
      userMutedRef.current = false
      audio.volume = 0.05
      audio.muted = false
      audio.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
      }).catch((err) => {
        console.warn('[BackgroundMusic] Play error:', err)
      })
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/The_Final_Circle.mp3"
        loop
        autoPlay
        playsInline
        preload="auto"
      />

      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
        <button
          onClick={toggleMusic}
          aria-label={isPlaying && !isMuted ? 'Mute Background Music' : 'Play Background Music'}
          className={`bg-music-toggle-btn relative group p-3 rounded-full border shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isPlaying && !isMuted
              ? 'bg-red-600/90 hover:bg-red-600 border-red-400/50 text-white shadow-red-600/40 animate-pulse'
              : 'bg-[#101422]/90 hover:bg-[#181d30] border-white/20 text-gray-300 shadow-black/60'
          }`}
          title={isPlaying && !isMuted ? 'Click to Mute Music' : 'Click to Play Music'}
        >
          {isPlaying && !isMuted ? (
            <Volume2 className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}

          {isPlaying && !isMuted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#07080b]/90 border border-white/10 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 backdrop-blur-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <Music className="w-3.5 h-3.5 text-red-500" />
          <span>The Final Circle BGM {isPlaying && !isMuted ? '(Playing 5%)' : '(Muted)'}</span>
        </div>
      </div>
    </>
  )
}
