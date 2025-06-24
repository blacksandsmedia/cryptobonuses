'use client';

import { useEffect } from 'react';

export default function CasinoPageScrollToTop() {
  useEffect(() => {
    const scrollToTop = () => {
      // Multiple approaches to ensure scroll to top works on all mobile browsers
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Force scroll position for stubborn browsers
      if (window.pageYOffset !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    // Immediate scroll
    scrollToTop();
    
    // Additional attempts with different timings for mobile browsers
    const timeouts = [10, 50, 100, 200];
    const timeoutIds = timeouts.map(delay => 
      setTimeout(scrollToTop, delay)
    );
    
    // Also listen for when the page becomes visible (helps with mobile browser switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scrollToTop();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array means this only runs once when component mounts

  return null;
} 