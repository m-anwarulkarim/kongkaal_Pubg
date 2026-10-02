/**
 * Utility to convert any uploaded image File (PNG, JPG, JPEG, GIF, BMP) into WebP Data URL format.
 * Automatically resizes and compresses image to stay around 15-20 KB (and strictly under 100 KB).
 */
export async function convertFileToWebP(
  file: File,
  quality = 0.75,
  maxWidth = 300,
  maxSizeBytes = 20 * 1024 // 20 KB target max
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height
        let currentMaxWidth = maxWidth

        if (width > currentMaxWidth || height > currentMaxWidth) {
          if (width > height) {
            height = Math.round((height * currentMaxWidth) / width)
            width = currentMaxWidth
          } else {
            width = Math.round((width * currentMaxWidth) / height)
            height = currentMaxWidth
          }
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(img.src)
          return
        }

        let currentQuality = quality
        let resultDataUrl = ''

        // Iterative compression to ensure file size <= 20 KB (and max 100 KB)
        for (let attempt = 0; attempt < 6; attempt++) {
          canvas.width = width
          canvas.height = height
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          resultDataUrl = canvas.toDataURL('image/webp', currentQuality)

          // Approximate base64 string length to byte size (base64 overhead ~33%)
          const estimatedBytes = Math.round((resultDataUrl.length * 3) / 4)
          if (estimatedBytes <= maxSizeBytes || currentQuality <= 0.25) {
            break
          }

          // Reduce quality and dimensions slightly for next iteration
          currentQuality -= 0.1
          width = Math.round(width * 0.85)
          height = Math.round(height * 0.85)
        }

        resolve(resultDataUrl)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

/**
 * Utility to convert any image URL or Data URL to WebP Data URL format
 */
export async function convertUrlToWebP(url: string, quality = 0.75, maxWidth = 300): Promise<string> {
  if (!url) return ''
  if (url.startsWith('data:image/webp')) return url

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      let width = img.width
      let height = img.height
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(url)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      try {
        const webpDataUrl = canvas.toDataURL('image/webp', quality)
        resolve(webpDataUrl)
      } catch {
        resolve(url)
      }
    }
    img.onerror = () => resolve(url)
  })
}

/**
 * Default fallback avatars for PUBG gamers if original avatar is broken or missing
 */
export const DEFAULT_AVATARS = [
  '/solo_battle.webp',
  '/duo_battle.webp',
  '/squad_showdown.webp',
  'https://api.dicebear.com/7.x/bottts/svg?seed=PubgHero&backgroundColor=e50914',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowNinja&backgroundColor=d97706',
]

/**
 * Format any YouTube watch URL, shorts URL, or embed URL into a clean autoplaying embed URL
 */
export function formatYouTubeEmbedUrl(url: string, isMuted = true): string {
  if (!url) return ''
  if (url.endsWith('.mp4') || url.includes('.mp4?')) return url

  let videoId = ''
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0] || ''
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0] || ''
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || ''
  }

  if (videoId) {
    const muteParam = isMuted ? '&mute=1' : ''
    return `https://www.youtube.com/embed/${videoId}?autoplay=1${muteParam}&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`
  }

  return url
}
