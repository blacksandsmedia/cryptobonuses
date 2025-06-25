'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/image-utils';
import ClickableBonusCode from './ClickableBonusCode';

// Define the bonus type directly here to avoid import issues
interface Bonus {
  id: string;
  casinoName: string;
  bonusType: string;
  bonusTypes?: string[]; // New field for multiple bonus types
  bonusValue: number;
  bonusText: string;
  logoUrl: string;
  promoCode: string | null;
  affiliateLink: string;
  isActive: boolean;
  // Add the casinoId field for tracking
  casinoId?: string;
  // Add the bonusId field for tracking
  bonusId?: string;
  // Add the codeTermLabel field for casino-specific terminology
  codeTermLabel?: string;
}

interface CasinoCardProps {
  bonus: Bonus;
}

export default function CasinoCard({ bonus }: CasinoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleImageError = () => {
    setImageError(true);
  };

  const imagePath = normalizeImagePath(bonus.logoUrl);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopy = async (code: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      
      // Track copy event
      try {
        await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bonusId: bonus.id,
            actionType: 'code_copy',
            path: window.location.pathname
          }),
        });
      } catch (trackingError) {
        console.warn('Failed to track copy event:', trackingError);
      }
      
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleGetBonusClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    
    // Track click event
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bonusId: bonus.id,
          actionType: 'offer_click',
          path: window.location.pathname
        }),
      });
    } catch (error) {
      console.warn('Failed to track click event:', error);
    }
    
    // Open affiliate link
    if (bonus.affiliateLink) {
      window.open(bonus.affiliateLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine the code type for display
  const codeTypeCapitalized = bonus.promoCode ? 'Bonus Code' : 'Bonus';

  return (
    <div className="relative">
      {bonus.promoCode && (
        <button
          onClick={(e) => handleCopy(bonus.promoCode!, e)}
          className={`absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border-2 ${
            copiedCode === bonus.promoCode
              ? 'bg-[#68D08B] text-[#343541] border-[#68D08B]'
              : 'bg-[#2c2f3a] text-[#68D08B] border-[#68D08B] hover:bg-[#68D08B] hover:text-[#343541]'
          }`}
          title={`Copy ${codeTypeCapitalized}: ${bonus.promoCode}`}
        >
          {copiedCode === bonus.promoCode ? (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              COPIED
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {bonus.promoCode}
            </span>
          )}
        </button>
      )}

      <article 
        className="relative bg-gradient-to-br from-[#3e4050] to-[#373846] p-5 rounded-xl shadow-lg border-2 border-[#404055] card-hover group will-change-transform"
      >
        <a 
          href={`/${bonus.id}`} 
          className="block"
          title={`${bonus.casinoName} ${codeTypeCapitalized} - ${bonus.bonusText} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#2c2f3a] flex items-center justify-center casino-logo">
              {!imageError ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePath}
                    alt={`${bonus.casinoName} ${codeTypeCapitalized} - ${bonus.bonusText} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                    priority={true}
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center text-lg font-semibold px-1">
                  {getInitials(bonus.casinoName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl font-bold truncate ${bonus.promoCode ? 'pr-16 sm:pr-20' : 'pr-4'}`}>{bonus.casinoName}</h2>
              <p className="text-[#68D08B] text-lg font-medium mt-1">{bonus.bonusText}</p>
            </div>
          </div>
        </a>

        <a
          href={bonus.affiliateLink || '#'}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-full bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-bold py-3 px-4 rounded-lg text-center transition-colors duration-200 block optimized-hover"
          onClick={handleGetBonusClick}
        >
          Get Bonus
        </a>
      </article>
    </div>
  );
} 