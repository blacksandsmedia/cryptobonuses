'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Industry standard scroll-to-top with iOS Safari compatibility
    // Use setTimeout to ensure DOM is ready and avoid iOS scroll restoration issues
    const scrollToTop = () => {
      // Method 1: Standard scroll to top
      window.scrollTo(0, 0);
      
      // Method 2: iOS Safari fallback - set document scroll position
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // Method 3: Body scroll fallback for older browsers
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Immediate scroll
    scrollToTop();
    
    // iOS Safari sometimes needs a slight delay
    const timeoutId = setTimeout(scrollToTop, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
} 