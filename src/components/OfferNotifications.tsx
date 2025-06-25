'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/NotificationContext';

interface OfferClaim {
  id: string;
  casinoName: string;
  casinoLogo: string;
  casinoSlug: string;
  bonusTitle: string;
  bonusCode?: string;
  createdAt: string;
}

interface Notification extends OfferClaim {
  notificationId: string;
  isVisible: boolean;
  isEntering: boolean;
}

export default function OfferNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const seenClaimsRef = useRef<Set<string>>(new Set());
  const router = useRouter();
  const { setHasActiveNotifications } = useNotifications();

  const addNotification = useCallback((claim: OfferClaim) => {
    const notification: Notification = {
      ...claim,
      notificationId: `${claim.id}-${Date.now()}`,
      isVisible: true, // Show immediately without delay
      isEntering: false,
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.notificationId === notification.notificationId 
            ? { ...n, isVisible: false }
            : n
        )
      );
      
      // Remove from array after animation completes
      setTimeout(() => {
        setNotifications(prev => 
          prev.filter(n => n.notificationId !== notification.notificationId)
        );
      }, 300);
    }, 10000);
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    router.push(`/${notification.casinoSlug}`);
  }, [router]);

  useEffect(() => {
    const fetchRecentClaims = async () => {
      try {
        console.log('[NotificationsDebug] Fetching recent claims...');
        const response = await fetch('/api/recent-claims');
        if (response.ok) {
          const data = await response.json();
          const recentClaims: OfferClaim[] = data.claims || [];
          
          console.log('[NotificationsDebug] Received', recentClaims.length, 'claims from API');
          console.log('[NotificationsDebug] Seen claims count:', seenClaimsRef.current.size);
          
          // Add new notifications for claims we haven't seen yet
          recentClaims.forEach(claim => {
            if (!seenClaimsRef.current.has(claim.id)) {
              console.log('[NotificationsDebug] Adding new notification for claim:', claim.id, claim.casinoName);
              seenClaimsRef.current.add(claim.id);
              addNotification(claim);
            } else {
              console.log('[NotificationsDebug] Skipping already seen claim:', claim.id);
            }
          });
        } else {
          console.error('[NotificationsDebug] API response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[NotificationsDebug] Error fetching recent claims:', error);
      }
    };

    // Initial fetch to populate seen claims (don't show notifications for initial load)
    const fetchInitial = async () => {
      try {
        const response = await fetch('/api/recent-claims');
        if (response.ok) {
          const data = await response.json();
          const recentClaims: OfferClaim[] = data.claims || [];
          recentClaims.forEach(claim => {
            seenClaimsRef.current.add(claim.id);
          });
        }
      } catch (error) {
        console.error('Error fetching initial claims:', error);
      }
    };

    fetchInitial();

    // Poll for recent offer claims every 10 seconds
    const pollInterval = setInterval(fetchRecentClaims, 10000);

    return () => clearInterval(pollInterval);
  }, [addNotification]);

  // Update global notification state when notifications change
  useEffect(() => {
    setHasActiveNotifications(notifications.length > 0);
  }, [notifications, setHasActiveNotifications]);

  const formatMessage = (notification: Notification) => {
    const codeText = notification.bonusCode ? (
      <span> with code <span className="text-[#68D08B] font-semibold">{notification.bonusCode}</span></span>
    ) : '';
    return (
      <span>
        Someone just claimed <span className="text-[#68D08B] font-semibold">{notification.bonusTitle}</span> on {notification.casinoName}{codeText}
      </span>
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 md:left-4 transform -translate-x-1/2 md:translate-x-0 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.notificationId} className="relative">
          {/* Blur effect around the notification (light blur focus) */}
          <div 
            className="absolute inset-0 pointer-events-none z-40 rounded-xl p-6"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.08) 30%, rgba(0, 0, 0, 0.04) 60%, transparent 100%)',
              boxShadow: '0 0 20px 8px rgba(0, 0, 0, 0.1)',
              filter: 'blur(12px)'
            }}
          />
          
          {/* Notification content */}
          <div
            onClick={() => handleNotificationClick(notification)}
            className={`
              relative z-50 bg-[#2c2f3a]/95 rounded-xl p-6 md:p-8 shadow-2xl 
              w-[calc(100vw-2rem)] max-w-[480px] md:w-[480px] lg:w-[520px]
              border border-[#444654] hover:border-[#68D08B]/50
              backdrop-blur-md pointer-events-auto cursor-pointer
              transform transition-all duration-300 ease-out
              hover:shadow-2xl
              ${notification.isVisible 
                ? 'translate-y-0 opacity-100 scale-100' 
                : 'translate-y-full opacity-0 scale-95'
              }
            `}
          >
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Casino logo */}
              <div className="flex-shrink-0">
                <img 
                  src={notification.casinoLogo} 
                  alt={`${notification.casinoName} logo`}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shadow-lg"
                  onError={(e) => {
                    // Fallback to gift icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback gift icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-[#68D08B]/10 border-2 border-[#444654] flex items-center justify-center hidden shadow-lg">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-[#68D08B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.2c.6-.8 1.2-1.7 1.2-3 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .4.1.8.2 1.2-.1-.1-.2-.1-.3-.2-.4-.4-.9-.6-1.4-.6s-1 .2-1.4.6c-.1.1-.2.1-.3.2.1-.4.2-.8.2-1.2 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 1.3.6 2.2 1.2 3H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm6 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-5 3h4v2H10V6zM6 20V12h5v8H6zm7 0V12h5v8h-5zm5-10H6V8h12v2z"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pr-2 md:pr-6">
                <p className="text-sm md:text-base text-white leading-relaxed font-medium text-left">
                  {formatMessage(notification)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 