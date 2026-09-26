/**
 * Utility to convert any uploaded image File (PNG, JPG, JPEG, GIF, BMP) into WebP Data URL format
 */
export async function convertFileToWebP(file: File, quality = 0.85, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Downscale proportionally if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(img.src) // Fallback
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const webpDataUrl = canvas.toDataURL('image/webp', quality)
        resolve(webpDataUrl)
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
