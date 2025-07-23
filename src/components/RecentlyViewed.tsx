'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/contexts/TranslationContext';
import { getRecentlyViewed, type RecentlyViewedCasino } from '@/utils/recentlyViewed';
import { normalizeImagePath } from '@/lib/image-utils';

interface RecentlyViewedProps {
  currentCasinoSlug?: string;
}

export default function RecentlyViewed({ currentCasinoSlug }: RecentlyViewedProps) {
  const [recentCasinos, setRecentCasinos] = useState<RecentlyViewedCasino[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return English fallbacks
    const englishTranslations: Record<string, string> = {
      'common.recentlyViewed': 'Recently Viewed'
    };
    t = (key: string) => englishTranslations[key] || key;
  }

  useEffect(() => {
    // Only run on client side
    const recent = getRecentlyViewed();
    // Filter out the current casino if provided, then limit to last 3
    const filteredRecent = recent
      .filter(casino => !currentCasinoSlug || casino.slug !== currentCasinoSlug)
      .slice(0, 3);
    
    setRecentCasinos(filteredRecent);
    setIsLoaded(true);
  }, [currentCasinoSlug]);

  // Don't render anything on server side or if no recently viewed items
  if (!isLoaded || recentCasinos.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">{t('common.recentlyViewed') || 'Recently Viewed'}</h2>
      <div className={`grid gap-4 ${
        recentCasinos.length === 1 ? 'grid-cols-1' :
        recentCasinos.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {recentCasinos.map((casino) => (
          <Link 
            href={`/${casino.slug}`} 
            key={casino.id} 
            className="bg-[#2c2f3a] rounded-lg p-4 hover:bg-[#343750] transition-all duration-200 border border-[#404055] hover:border-[#68D08B]/30 block group"
          >
            <div className="flex items-center gap-3">
              {/* Casino Logo */}
              <div className="w-12 h-12 rounded-md overflow-hidden bg-[#404055] flex-shrink-0">
                <Image
                  src={normalizeImagePath(casino.logo)}
                  alt={`${casino.name} logo`}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Casino Name */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm">{casino.name}</h3>
              </div>

              {/* Arrow Icon */}
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-[#a4a5b0] group-hover:text-[#68D08B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 