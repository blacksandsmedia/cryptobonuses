'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';

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
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      if (fallback && currentSrc !== fallback) {
        setCurrentSrc(fallback);
        setHasError(false);
      } else if (onError) {
        onError();
      }
    }
  }, [hasError, fallback, currentSrc, onError]);

  // For logos, use higher quality and specific rendering
  const imageQuality = isLogo ? 100 : quality;
  const logoClassName = isLogo ? `${className} logo-crisp` : className;

  if (hasError && !fallback) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-700 text-white text-xs`}>
        Failed to load
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={logoClassName}
      priority={priority}
      quality={imageQuality}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      placeholder={isLogo ? 'empty' : 'blur'}
      blurDataURL={isLogo ? undefined : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="}
      sizes={isLogo ? `${width}px` : undefined}
      unoptimized={false}
    />
  );
} 