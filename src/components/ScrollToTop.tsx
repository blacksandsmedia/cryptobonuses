'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top immediately when route changes
    const scrollToTop = () => {
      // Use requestAnimationFrame to ensure this runs after the page renders
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        // Also ensure document elements are reset
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    };

    // Immediate scroll
    scrollToTop();
    
    // Additional scroll for stubborn browsers (especially mobile)
    const timeoutId = setTimeout(scrollToTop, 10);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
} 