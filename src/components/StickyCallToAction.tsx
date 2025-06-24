'use client';

import StickyCopyCodeButton from '@/components/StickyCopyCodeButton';
import OfferButton from '@/components/OfferButton';
import Image from 'next/image';

interface StickyCallToActionProps {
  casinoName: string;
  casinoId: string;
  bonusId?: string;
  bonusTitle: string;
  bonusCode: string | null;
  affiliateLink: string | null;
  logo?: string | null;
}

export default function StickyCallToAction({
  casinoName,
  casinoId,
  bonusId,
  bonusTitle,
  bonusCode,
  affiliateLink,
  logo
}: StickyCallToActionProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 relative z-10 bg-gradient-to-r from-[#2c2f3a]/90 to-[#343541]/90 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
      {/* Casino Logo */}
      {logo && (
        <div className="flex-shrink-0">
          <Image
            src={logo}
            alt={`${casinoName} logo`}
            width={48}
            height={48}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-contain border-2 border-[#68D08B] shadow-lg shadow-[#68D08B]/20"
          />
        </div>
      )}
      
      {/* Casino Name and Offer */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-bold text-white truncate drop-shadow-lg">
          {casinoName}
        </h3>
        <p className="text-base sm:text-lg text-[#b0b0b0] truncate drop-shadow-md">
          {bonusTitle}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {bonusCode ? (
          <StickyCopyCodeButton 
            code={bonusCode} 
            casinoId={casinoId}
            bonusId={bonusId}
            affiliateLink={affiliateLink}
            isSticky={true}
          />
        ) : null}
        <OfferButton 
          affiliateLink={affiliateLink}
          casinoId={casinoId}
          bonusId={bonusId}
          size="default"
          isSticky={true}
        />
      </div>
    </div>
  );
} 