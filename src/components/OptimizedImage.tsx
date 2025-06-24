'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: string;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
  isLogo?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallback,
  priority = false,
  quality = 90,
  onError,
  isLogo = false
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  // For logos, use higher quality and specific rendering
  const imageQuality = isLogo ? 100 : quality;
  const logoClassName = isLogo ? `${className} logo-crisp` : className;

  if (hasError) {
    if (fallback) {
      return (
        <Image
          src={fallback}
          alt={alt}
          width={width}
          height={height}
          className={logoClassName}
          priority={priority}
          quality={imageQuality}
        />
      );
    }
    return (
      <div className={`${className} flex items-center justify-center bg-gray-700 text-white text-xs`}>
        Failed to load
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={logoClassName}
      priority={priority}
      quality={imageQuality}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      unoptimized={false}
    />
  );
} 