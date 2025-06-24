'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToTop = () => {
      // Multiple approaches to ensure scroll to top works on all browsers
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Force scroll position for stubborn browsers
      if (window.pageYOffset !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    // Immediate scroll when route changes
    scrollToTop();
    
    // Additional attempts for mobile browsers that might delay rendering
    const timeoutId1 = setTimeout(scrollToTop, 10);
    const timeoutId2 = setTimeout(scrollToTop, 50);
    const timeoutId3 = setTimeout(scrollToTop, 100);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [pathname]);

  return null;
} 