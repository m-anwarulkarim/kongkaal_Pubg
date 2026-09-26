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
