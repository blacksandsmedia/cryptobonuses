'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top immediately when route changes
    const scrollToTop = () => {
      // Multiple approaches to ensure scroll reset works
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Force all scrollable elements to top
      const scrollableElements = document.querySelectorAll('[data-scroll-to-top]');
      scrollableElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });
    };

    // Immediate scroll
    scrollToTop();
    
    // Use requestAnimationFrame to ensure this runs after the page renders
    requestAnimationFrame(() => {
      scrollToTop();
    });
    
    // Additional scroll for stubborn browsers (especially mobile)
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