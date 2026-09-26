/**
 * Utility to convert any uploaded image File (PNG, JPG, JPEG, GIF, BMP) into WebP Data URL format
 * Automatically resizes and compresses image to stay below 100 KB (or target maxSizeBytes).
 */
export async function convertFileToWebP(
  file: File,
  quality = 0.75,
  maxWidth = 800,
  maxSizeBytes = 100 * 1024
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

        if (width > currentMaxWidth) {
          height = Math.round((height * currentMaxWidth) / width)
          width = currentMaxWidth
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(img.src)
          return
        }

        let currentQuality = quality
        let resultDataUrl = ''

        // Iterative compression to ensure file size <= 100 KB
        for (let attempt = 0; attempt < 5; attempt++) {
          canvas.width = width
          canvas.height = height
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          resultDataUrl = canvas.toDataURL('image/webp', currentQuality)

          // Approximate base64 string length to byte size (base64 overhead ~33%)
          const estimatedBytes = Math.round((resultDataUrl.length * 3) / 4)
          if (estimatedBytes <= maxSizeBytes || currentQuality <= 0.35) {
            break
          }

          // Reduce quality and scale slightly for next iteration
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
export async function convertUrlToWebP(url: string, quality = 0.85): Promise<string> {
  if (url.startsWith('data:image/webp')) return url

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(url)
        return
      }

      ctx.drawImage(img, 0, 0)
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
