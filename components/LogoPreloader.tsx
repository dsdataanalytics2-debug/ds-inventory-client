import { useState } from 'react'
import Image from 'next/image'

interface LogoPreloaderProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

const LogoPreloader = ({ 
  src, 
  alt, 
  className = "", 
  width, 
  height, 
  priority = false,
  onLoad,
  onError 
}: LogoPreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-blue-100 rounded ${className}`}>
        <span className="text-blue-600 font-bold text-xs">AUTO</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-blue-100 animate-pulse rounded ${className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

export default LogoPreloader
