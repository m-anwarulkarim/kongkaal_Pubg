import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check local storage for mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('kongkaal_bg_music_muted')
      if (savedMute === 'true') {
        setIsMuted(true)
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set initial volume low (15%) for subtle background music
    audio.volume = 0.15

    const handleFirstInteraction = () => {
      if (hasInteracted) return
      setHasInteracted(true)

      const savedMute = localStorage.getItem('kongkaal_bg_music_muted')
      if (savedMute !== 'true') {
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch((err) => {
          console.warn('[BackgroundMusic] Auto-play prevented by browser:', err)
        })
      }

      // Cleanup listener after first interaction
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [hasInteracted])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && !isMuted) {
      audio.pause()
      setIsPlaying(false)
      setIsMuted(true)
      localStorage.setItem('kongkaal_bg_music_muted', 'true')
    } else {
      audio.volume = 0.15
      audio.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
        localStorage.setItem('kongkaal_bg_music_muted', 'false')
      }).catch((err) => {
        console.warn('[BackgroundMusic] Play failed:', err)
      })
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/The_Final_Circle.mp3"
        loop
        preload="auto"
      />

      {/* Floating Audio Control Button */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
        <button
          onClick={toggleMusic}
          aria-label={isPlaying && !isMuted ? 'Mute Background Music' : 'Play Background Music'}
          className={`relative group p-3 rounded-full border shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isPlaying && !isMuted
              ? 'bg-red-600/90 hover:bg-red-600 border-red-400/50 text-white shadow-red-600/40 animate-pulse'
              : 'bg-[#101422]/90 hover:bg-[#181d30] border-white/20 text-gray-300 shadow-black/60'
          }`}
          title={isPlaying && !isMuted ? 'Mute Background Music (The Final Circle)' : 'Play Background Music'}
        >
          {isPlaying && !isMuted ? (
            <Volume2 className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}

          {/* Equalizer Bars Effect when playing */}
          {isPlaying && !isMuted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>

        {/* Tooltip / Label */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#07080b]/90 border border-white/10 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-300 backdrop-blur-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <Music className="w-3.5 h-3.5 text-red-500" />
          <span>The Final Circle BGM {isPlaying && !isMuted ? '(Playing 15%)' : '(Muted)'}</span>
        </div>
      </div>
    </>
  )
}
