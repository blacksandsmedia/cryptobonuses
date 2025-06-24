'use client';

import { useState, useEffect } from 'react';
import StickyCallToAction from '@/components/StickyCallToAction';

interface CasinoData {
  id: string;
  name: string;
  bonusTitle: string;
  bonusCode: string | null;
  bonusId: string | undefined;
  affiliateLink: string | null;
  logo: string | null;
}

interface ClientStickyWrapperProps {
  casinoData: CasinoData;
}

export default function ClientStickyWrapper({ casinoData }: ClientStickyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show after scrolling 100px
      const shouldShow = scrollY > 100;
      
      // Hide when near bottom
      const isNearBottom = scrollY + windowHeight >= documentHeight - 50;
      
      setIsVisible(shouldShow && !isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100vw-4rem)] sm:w-full max-w-2xl">
      {/* Elliptical blur backdrop with smooth edges */}
      <div 
        className="absolute inset-0 -ml-20 -mr-20 -mb-20 -mt-1 sm:-ml-24 sm:-mr-24 sm:-mb-24 sm:-mt-2"
        style={{
          background: 'radial-gradient(ellipse 900px 400px at center 70%, rgba(0, 0, 0, 0.008) 0%, rgba(0, 0, 0, 0.006) 20%, rgba(0, 0, 0, 0.004) 35%, rgba(0, 0, 0, 0.003) 50%, rgba(0, 0, 0, 0.002) 65%, rgba(0, 0, 0, 0.001) 78%, rgba(0, 0, 0, 0.0005) 88%, rgba(0, 0, 0, 0.0001) 95%, transparent 100%)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          borderRadius: '50%/30%',
          zIndex: -1
        }}
      />
      
      {/* CTA Content */}
      <div 
        className="relative"
        style={{
          filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))'
        }}
      >
        <StickyCallToAction 
          casinoName={casinoData.name}
          casinoId={casinoData.id}
          bonusId={casinoData.bonusId}
          bonusTitle={casinoData.bonusTitle}
          bonusCode={casinoData.bonusCode}
          affiliateLink={casinoData.affiliateLink}
          logo={casinoData.logo}
        />
      </div>
    </div>
  );
} 