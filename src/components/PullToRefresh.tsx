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
  const router = useRouter();

  const PULL_THRESHOLD = 70; // Distance needed to trigger refresh
  const MAX_PULL = 100; // Maximum pull distance

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isAtTop = false;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate if we're at the very top of the page
      if (window.scrollY === 0) {
        isAtTop = true;
        startY = e.touches[0].clientY;
        isDragging = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const pullDist = currentY - startY;
      
      // Only consider it a pull if moving down
      if (pullDist > 5) {
        isDragging = true;
        // Prevent default scrolling only when actually pulling
        e.preventDefault();
        
        // Calculate pull distance with resistance
        const resistance = Math.min(pullDist * 0.5, MAX_PULL);
        setPullDistance(resistance);
        setIsPulling(resistance > 10);
      }
    };

    const handleTouchEnd = () => {
      if (!isAtTop || !isDragging) {
        // Reset everything if not a valid pull
        setPullDistance(0);
        setIsPulling(false);
        isAtTop = false;
        isDragging = false;
        return;
      }

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
      isDragging = false;
    };

    const handleScroll = () => {
      // Reset pull state if user scrolls down
      if (window.scrollY > 0) {
        isAtTop = false;
        setPullDistance(0);
        setIsPulling(false);
        isDragging = false;
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pullDistance, isRefreshing, router]);

  return (
    <>
      {/* Pull to refresh indicator - fixed position, doesn't affect content */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-[#2c2f3a] border-b border-[#404040] transition-all duration-200 ease-out"
          style={{
            transform: `translateY(${Math.min(pullDistance - 50, 50)}px)`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className="flex items-center justify-center py-3">
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
      
      {/* Main content - no transforms applied */}
      {children}
    </>
  );
} 