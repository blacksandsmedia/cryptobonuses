'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface OfferButtonProps {
  affiliateLink: string | null;
  casinoId: string;
  bonusId: string | undefined;
  size?: 'default' | 'small';
  isSticky?: boolean;
}

export default function OfferButton({ 
  affiliateLink, 
  casinoId, 
  bonusId,
  size = 'default',
  isSticky = false
}: OfferButtonProps) {
  // Add translation support with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch {
    // Not in translation context, return English fallbacks
    t = () => 'Get Bonus';
  }

  const trackOfferClick = async () => {
    if (!casinoId || !bonusId) return;
    
    try {
      const trackingData = JSON.stringify({
        casinoId,
        bonusId,
        actionType: 'offer_click',
      });
      
      // Use sendBeacon API if available for better reliability when page unloads
      if (navigator.sendBeacon) {
        const blob = new Blob([trackingData], { type: 'application/json' });
        const success = navigator.sendBeacon('/api/tracking', blob);
        
        if (success) return;
      }
      
      // Fall back to fetch if sendBeacon is not available or failed
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: trackingData,
      });
    } catch (error) {
      console.error("Error tracking offer click:", error);
    }
  };

  const handleClick = () => {
    if (casinoId && bonusId) {
      trackOfferClick();
    }
  };

  let buttonClasses = "";
  
  if (size === 'small') {
    buttonClasses = "bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-bold px-4 py-2 text-sm md:text-base rounded-lg transition-colors duration-300 text-center whitespace-nowrap";
  } else if (isSticky) {
    buttonClasses = "bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-bold px-4 sm:px-5 rounded-lg transition-colors duration-300 text-center text-xs sm:text-sm whitespace-nowrap h-[32px] sm:h-[38px] flex items-center justify-center";
  } else {
    buttonClasses = "bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-lg transition-colors duration-300 text-center text-base md:text-xl whitespace-nowrap";
  }

  return (
    <a
      href={affiliateLink || '#'}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={buttonClasses}
      onClick={handleClick}
    >
      {isSticky ? (
        <span className="flex items-center gap-1.5">
          <span>{t('casino.claimNow') || 'Claim Now'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : (
        t('casino.getBonus') || "Get Bonus"
      )}
    </a>
  );
} 