import Image from 'next/image';
import { useState } from 'react';
import { getImageServiceConfig } from '@/lib/railway-image-config';

interface OptimizedCasinoImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export default function OptimizedCasinoImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes,
}: OptimizedCasinoImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a Railway Image Service URL
  const isRailwayImageServiceUrl = (url: string) => {
    const config = getImageServiceConfig();
    return url.startsWith(config.baseUrl);
  };

  // Generate optimized URL for Railway Image Service
  const getOptimizedRailwayUrl = (url: string, width: number, height: number, quality: number) => {
    const config = getImageServiceConfig();
    
    if (!isRailwayImageServiceUrl(url)) {
      return url;
    }

    // Extract the blob key from the URL
    const blobKey = url.replace(`${config.baseUrl}/blob/`, '');
    
    // Create optimized URL with transformations
    // Format: /serve/{width}x{height}/blob/{key}
    const transformations = `${width}x${height}`;
    const optimizedUrl = `${config.baseUrl}/serve/${transformations}/blob/${blobKey}`;
    
    return optimizedUrl;
  };

  // Get the appropriate image source
  const getImageSrc = () => {
    if (imageError) {
      return '/images/placeholder-casino.svg'; // Fallback image
    }

    if (isRailwayImageServiceUrl(src)) {
      return getOptimizedRailwayUrl(src, width, height, quality);
    }

    // For local images, use as-is (Next.js will handle optimization)
    return src;
  };

  // Handle image load error
  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      <Image
        src={getImageSrc()}
        alt={alt}
        width={width}
        height={height}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          objectFit: 'cover',
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  );
} 