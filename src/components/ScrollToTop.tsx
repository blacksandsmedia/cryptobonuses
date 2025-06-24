'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    // Also ensure document element is at top (for some mobile browsers)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
} 