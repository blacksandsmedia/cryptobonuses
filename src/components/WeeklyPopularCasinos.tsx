'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/image-utils';

interface PopularCasino {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  weeklyClaims: number;
  rank: number;
  bonus: {
    id: string;
    title: string;
    code: string | null;
  } | null;
}

interface WeeklyPopularCasinosProps {
  currentCasinoSlug?: string;
}

export default function WeeklyPopularCasinos({ currentCasinoSlug }: WeeklyPopularCasinosProps) {
  const [casinos, setCasinos] = useState<PopularCasino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularCasinos() {
      try {
        const response = await fetch('/api/casinos/weekly-popular');
        const data = await response.json();
        
        if (data.success) {
          // Don't filter out the current casino - show all casinos in the list
          setCasinos(data.data.slice(0, 10)); // Show top 10 regardless of current page
        } else {
          setError(data.error || 'Failed to fetch popular casinos');
        }
      } catch (err) {
        setError('Failed to fetch popular casinos');
        console.error('Error fetching popular casinos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularCasinos();
  }, [currentCasinoSlug]);

  if (loading) {
    return (
      <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Week's Most Popular Casinos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-[#2c2f3a] rounded-lg p-4 text-center animate-pulse">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#404055] rounded-lg"></div>
              <div className="h-4 bg-[#404055] rounded mb-2"></div>
              <div className="h-3 bg-[#404055] rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Fail silently to not break the page
  }

  if (casinos.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Most Popular Crypto Casinos</h2>
        <div className="bg-[#68D08B]/10 text-[#68D08B] text-xs px-2 py-1 rounded-md">
          Trending
        </div>
      </div>
      
      <p className="text-[#a7a9b4] mb-4 text-base">
        Discover the top crypto casinos that players are choosing this week, ranked by community activity.
      </p>

      <div className="space-y-2">
        {casinos.map((casino) => {
          // Create the title in the same format as recommendations and homepage cards
          const codeTypeCapitalized = 'Bonus Code'; // Default since we don't have casino-specific code terms in this context
          const bonusTitle = casino.bonus?.title || 'Exclusive Bonus';
          const casinoTitle = `${casino.name} ${codeTypeCapitalized} - ${bonusTitle} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
          
          return (
            <a 
              key={casino.id} 
              href={`/${casino.slug}`}
              className="bg-[#2c2f3a] rounded-lg p-4 hover:bg-[#343750] transition-all duration-200 border border-[#404055] hover:border-[#68D08B]/30 block"
              title={casinoTitle}
            >
              <div className="flex items-center gap-3">
                {/* Casino Logo with Rank Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-[#404055]">
                    <Image
                      src={normalizeImagePath(casino.logo || '')}
                      alt={`${casino.name} logo`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Rank Badge */}
                  {casino.rank <= 3 && (
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      casino.rank === 1 ? 'bg-yellow-500 text-black' :
                      casino.rank === 2 ? 'bg-gray-300 text-black' :
                      'bg-orange-600 text-white'
                    }`}>
                      {casino.rank}
                    </div>
                  )}
                </div>

                {/* Casino Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{casino.name}</h3>
                  {casino.bonus && (
                    <p className="text-[#68D08B] text-sm truncate">
                      {casino.bonus.title}
                    </p>
                  )}
                </div>

                {/* Claims Count */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-white">
                    {casino.weeklyClaims} claims
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-3 text-center">
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-[#68D08B] hover:text-[#7ee3a3] transition-colors text-sm font-medium"
        >
          View All Crypto Casinos
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l9.2-9.2M17 17V7H7"/>
          </svg>
        </a>
      </div>
    </section>
  );
} 