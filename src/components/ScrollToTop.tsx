'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  // Use useLayoutEffect for immediate scroll before paint
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll when route changes
    scrollToTop();
    
    // Additional attempts for different browser behaviors
    const timeoutId1 = setTimeout(scrollToTop, 10);
    const timeoutId2 = setTimeout(scrollToTop, 50);
    const timeoutId3 = setTimeout(scrollToTop, 100);
    const timeoutId4 = setTimeout(scrollToTop, 200);
    const timeoutId5 = setTimeout(scrollToTop, 500);

    // Special handling for casino pages (when navigating from homepage)
    if (pathname && pathname !== '/' && pathname.length > 1) {
      // Additional delays for casino page navigation
      const timeoutId6 = setTimeout(scrollToTop, 750);
      const timeoutId7 = setTimeout(scrollToTop, 1000);
      
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        clearTimeout(timeoutId4);
        clearTimeout(timeoutId5);
        clearTimeout(timeoutId6);
        clearTimeout(timeoutId7);
      };
    }

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(timeoutId4);
      clearTimeout(timeoutId5);
    };
  }, [pathname]);

  return null;
} 