import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.15

    const tryPlay = () => {
      if (!audio) return
      audio.volume = 0.15
      const promise = audio.play()
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true)
            setIsMuted(false)
          })
          .catch((err) => {
            console.log('[BackgroundMusic] Autoplay waiting for interaction:', err)
          })
      }
    }

    // Attempt direct play immediately
    tryPlay()

    // Add multiple interaction triggers (click, touch, scroll, pointer, keydown)
    const handleUserGesture = () => {
      tryPlay()
    }

    window.addEventListener('click', handleUserGesture, { once: true })
    window.addEventListener('touchstart', handleUserGesture, { once: true })
    window.addEventListener('pointerdown', handleUserGesture, { once: true })
    window.addEventListener('scroll', handleUserGesture, { once: true })
    window.addEventListener('keydown', handleUserGesture, { once: true })

    return () => {
      window.removeEventListener('click', handleUserGesture)
      window.removeEventListener('touchstart', handleUserGesture)
      window.removeEventListener('pointerdown', handleUserGesture)
      window.removeEventListener('scroll', handleUserGesture)
      window.removeEventListener('keydown', handleUserGesture)
    }
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && !isMuted) {
      audio.pause()
      setIsPlaying(false)
      setIsMuted(true)
    } else {
      audio.volume = 0.15
      audio.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
      }).catch((err) => {
        console.warn('[BackgroundMusic] Toggle play error:', err)
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
          className={`relative group p-3 rounded-full border shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isPlaying && !isMuted
              ? 'bg-red-600/90 hover:bg-red-600 border-red-400/50 text-white shadow-red-600/40 animate-pulse'
              : 'bg-[#101422]/90 hover:bg-[#181d30] border-white/20 text-gray-300 shadow-black/60'
          }`}
          title={isPlaying && !isMuted ? 'Mute Background Music' : 'Play Background Music'}
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
          <span>The Final Circle BGM {isPlaying && !isMuted ? '(Playing)' : '(Muted)'}</span>
        </div>
      </div>
    </>
  )
}
