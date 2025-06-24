'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Simple scroll to top on route changes (for any remaining client-side navigation)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
} 