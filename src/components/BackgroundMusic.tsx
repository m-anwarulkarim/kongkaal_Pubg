import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.05
    const savedMute = typeof window !== 'undefined' && localStorage.getItem('kongkaal_bg_music_muted') === 'true'

    if (savedMute) {
      setIsMuted(true)
      return
    }

    const startPlay = () => {
      audio.volume = 0.05
      audio.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
      }).catch(() => {})
    }

    startPlay()

    const handleInteraction = () => {
      startPlay()
      removeListeners()
    }

    const removeListeners = () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    window.addEventListener('pointerdown', handleInteraction)
    window.addEventListener('scroll', handleInteraction)

    return () => removeListeners()
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && !isMuted) {
      audio.pause()
      setIsPlaying(false)
      setIsMuted(true)
      localStorage.setItem('kongkaal_bg_music_muted', 'true')
    } else {
      audio.volume = 0.05
      audio.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
        localStorage.setItem('kongkaal_bg_music_muted', 'false')
      }).catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/The_Final_Circle.mp3" loop autoPlay preload="auto" />

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
          <span>The Final Circle BGM {isPlaying && !isMuted ? '(5%)' : '(Muted)'}</span>
        </div>
      </div>
    </>
  )
}
