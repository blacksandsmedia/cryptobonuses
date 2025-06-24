'use client';

import { useEffect } from 'react';

export default function CasinoPageScrollToTop() {
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
    
    // Also ensure document element is at top (for some mobile browsers)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Additional mobile-specific handling
    if (typeof window !== 'undefined') {
      // Force scroll position reset for mobile Safari and Chrome
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
      
      // Additional timeout for stubborn mobile browsers
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, []); // Empty dependency array means this runs once on mount

  return null;
} 