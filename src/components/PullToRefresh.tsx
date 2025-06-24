'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const router = useRouter();

  const PULL_THRESHOLD = 80; // Distance needed to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate if we're at the top of the page
      if (window.scrollY === 0) {
        isAtTop = true;
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      touchCurrentY = e.touches[0].clientY;
      currentY.current = touchCurrentY;
      
      const pullDist = Math.max(0, touchCurrentY - touchStartY);
      
      if (pullDist > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        
        // Calculate pull distance with resistance
        const resistance = Math.min(pullDist * 0.6, MAX_PULL);
        setPullDistance(resistance);
        setIsPulling(resistance > 10);
      }
    };

    const handleTouchEnd = () => {
      if (!isAtTop || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        // Trigger refresh
        setIsRefreshing(true);
        
        // Refresh the page data
        setTimeout(() => {
          router.refresh();
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 1000);
      } else {
        // Reset without refreshing
        setPullDistance(0);
        setIsPulling(false);
      }
      
      isAtTop = false;
    };

    const handleScroll = () => {
      // Reset pull state if user scrolls down
      if (window.scrollY > 0) {
        isAtTop = false;
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pullDistance, isRefreshing, router]);

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-[#2c2f3a] border-b border-[#404040] transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(${pullDistance - 60}px)`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className="flex items-center justify-center py-4">
            {isRefreshing ? (
              <div className="flex items-center gap-2 text-[#00d4ff]">
                <div className="w-4 h-4 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#888]">
                <div className="transform transition-transform duration-200" style={{
                  transform: `rotate(${Math.min(pullDistance / PULL_THRESHOLD * 180, 180)}deg)`
                }}>
                  ↓
                </div>
                <span className="text-sm font-medium">
                  {pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${Math.min(pullDistance, MAX_PULL)}px)` : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
} 