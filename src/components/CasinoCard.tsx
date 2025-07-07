'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CopyCodeButton from './CopyCodeButton';
import { normalizeImagePath } from '@/lib/image-utils';

// Define the correct interface based on how the component is actually used
interface CasinoCardBonus {
  id: string;
  casinoName: string;
  bonusType: string;
  bonusTypes?: string[];
  bonusValue: number;
  bonusText: string;
  logoUrl: string;
  promoCode?: string | null;
  affiliateLink: string;
  isActive: boolean;
  casinoId?: string;
  bonusId?: string;
  codeTermLabel?: string;
  slug?: string;
}

interface CasinoCardProps {
  bonus: CasinoCardBonus;
}

export default function CasinoCard({ bonus }: CasinoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imagePath, setImagePath] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Memoize tracking functions to prevent unnecessary re-renders
  const trackOfferClick = useCallback(async (casinoId: string, bonusId: string) => {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casinoId,
          bonusId,
          actionType: 'offer_click',
        }),
      });
    } catch (error) {
      console.error("Error tracking offer click:", error);
    }
  }, []);

  // Memoized functions
  const getInitials = useCallback((name: string) => {
    return name.substring(0, 2).toUpperCase();
  }, []);

  const getAlternativeLogoPaths = useCallback((casinoName: string, originalPath: string) => {
    const cleanName = casinoName.replace(/[^a-zA-Z0-9]/g, '');
    return [
      `/images/${casinoName} Logo.png`,
      `/images/${casinoName.replace(/\s+/g, '')} Logo.png`,
      `/images/${cleanName} Logo.png`,
      `/images/${cleanName}Logo.png`,
      '/images/Simplified Logo.png'
    ];
  }, []);

  // Optimized image error handling
  const handleImageError = useCallback(() => {
    const alternativePaths = getAlternativeLogoPaths(bonus.casinoName, imagePath);
    const currentIndex = alternativePaths.indexOf(imagePath);
    
    if (currentIndex < alternativePaths.length - 1) {
      const nextPath = alternativePaths[currentIndex + 1];
      setImageLoading(true);
      setImagePath(nextPath);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [bonus.casinoName, imagePath, getAlternativeLogoPaths]);

  // Optimized image load handling
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  // Mobile detection with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 640);
      }, 100);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Initialize image path
  useEffect(() => {
    try {
      const normalizedPath = normalizeImagePath(bonus.logoUrl);
      setImagePath(normalizedPath);
      setImageError(false);
      setImageLoading(true);
    } catch (error) {
      console.error(`Error setting image path for ${bonus.casinoName}:`, error);
      setImageError(true);
      setImageLoading(false);
    }
  }, [bonus.logoUrl, bonus.casinoName]);

  // Dynamic code term label
  const codeTermLabel = bonus.codeTermLabel || 'bonus code';
  const codeTypeCapitalized = codeTermLabel.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Handle card click
  const handleCardClick = () => {
    if (bonus.casinoId && bonus.bonusId) {
      trackOfferClick(bonus.casinoId, bonus.bonusId);
    }
  };

  return (
    <div className="bg-[#3e4050] rounded-xl border border-[#404055] p-4 sm:p-6 hover:border-[#68D08B] transition-all duration-300 group shadow-sm hover:shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Top Section - Logo and Casino Info */}
        <Link href={`/${bonus.slug || bonus.casinoName.toLowerCase().replace(/[^a-z0-9]/g, '')}`} onClick={handleCardClick}>
          <div className="flex items-start gap-3 sm:gap-4 cursor-pointer">
            {/* Optimized Logo Container */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#2c2f3a] flex-shrink-0">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center text-center font-semibold px-1 text-sm">
                  {getInitials(bonus.casinoName)}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-center font-semibold px-1 text-sm bg-[#2c2f3a] z-10">
                      {getInitials(bonus.casinoName)}
                    </div>
                  )}
                  <Image
                    src={imagePath}
                    alt={`${bonus.casinoName} ${codeTypeCapitalized}`}
                    width={64}
                    height={64}
                    sizes="(max-width: 640px) 56px, 64px"
                    className={`object-cover w-full h-full transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                    quality={75}
                  />
                </div>
              )}
            </div>
            
            {/* Casino Info */}
            <div className="min-w-0 flex-1">
              <h2 className={`font-bold truncate ${bonus.promoCode ? 'pr-16 sm:pr-20' : 'pr-4'} text-lg sm:text-xl`}>
                {bonus.casinoName}
              </h2>
              <p className="text-[#68D08B] font-medium mt-1 text-base sm:text-lg">
                {bonus.bonusText}
              </p>
            </div>
          </div>
        </Link>

        {/* Code Section */}
        {bonus.promoCode && (
          <div className="bg-[#292932] rounded-lg p-3 border border-[#404055]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[#a7a9b4] text-sm mb-1">{codeTypeCapitalized}:</p>
                <code className="text-[#68D08B] font-mono text-sm sm:text-base font-semibold">
                  {bonus.promoCode}
                </code>
              </div>
              <CopyCodeButton 
                code={bonus.promoCode}
                casinoId={bonus.casinoId}
                bonusId={bonus.bonusId}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <a
          href={bonus.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCardClick}
          className="bg-[#68D08B] hover:bg-[#5bc47d] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
        >
          CLAIM BONUS
        </a>
      </div>
    </div>
  );
} 