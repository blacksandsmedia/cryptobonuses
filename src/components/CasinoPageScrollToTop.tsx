'use client';

import { useEffect, useLayoutEffect } from 'react';

export default function CasinoPageScrollToTop() {
  // Use useLayoutEffect for immediate scroll before paint
  useLayoutEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    // Additional scroll handling after component mounts
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll
    scrollToTop();
    
    // Multiple attempts to handle different browser behaviors
    const timeouts = [10, 50, 100, 200, 500];
    const timeoutIds = timeouts.map(delay => 
      setTimeout(scrollToTop, delay)
    );

    // Also handle when the page becomes visible (mobile browser tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(scrollToTop, 50);
      }
    };

    // Handle focus events (when user returns to tab)
    const handleFocus = () => {
      setTimeout(scrollToTop, 50);
    };

    // Handle resize events (mobile orientation change)
    const handleResize = () => {
      setTimeout(scrollToTop, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
} 