import { useState, ImgHTMLAttributes } from 'react'

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  priority?: boolean
  fill?: boolean
  fallbackSrc?: string
  placeholder?: 'blur' | 'empty'
}

export default function Image({
  src,
  alt,
  priority = false,
  fill = false,
  fallbackSrc = '/kongkaal_hero.jpg',
  placeholder = 'blur',
  className = '',
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    if (onError) onError(e)
  }

  const currentSrc = hasError ? fallbackSrc : src

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : 'inline-block'} ${className}`}>
      {/* Skeleton / Blur Loading Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-[#181c28] to-gray-900 animate-pulse z-0" />
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-ignore
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={`${fill ? 'w-full h-full object-cover' : ''} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  )
}
