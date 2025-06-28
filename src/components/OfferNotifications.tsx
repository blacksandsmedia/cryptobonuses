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
  showTime: number;
  isDemo?: boolean;
}

// Demo notifications - only used when absolutely no API data is available
const DEMO_NOTIFICATIONS: OfferClaim[] = [
  {
    id: 'demo-1',
    casinoName: 'BitStarz',
    casinoLogo: '/images/BitStarz Logo.png',
    casinoSlug: 'bitstarz.com',
    bonusTitle: '5 BTC + 180 FS',
    bonusCode: 'STARZ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2', 
    casinoName: 'Stake',
    casinoLogo: '/images/Stake Logo.png',
    casinoSlug: 'stake.com',
    bonusTitle: '$1000 Welcome Bonus',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    casinoName: 'Roobet',
    casinoLogo: '/images/Roobet Logo.png', 
    casinoSlug: 'roobet.com',
    bonusTitle: '1 BTC + 200 FS',
    bonusCode: 'ROOBET',
    createdAt: new Date().toISOString(),
  }
];

let demoIndex = 0;
const DEMO_INTERVAL = 45000; // Show demo notification every 45 seconds (less frequent)
const API_TIMEOUT = 300000; // 5 minutes before considering API completely down

export default function OfferNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSuccessfulApiCall, setLastSuccessfulApiCall] = useState<Date>(new Date());
  const [hasEverReceivedApiData, setHasEverReceivedApiData] = useState<boolean>(false);
  const [apiWorking, setApiWorking] = useState<boolean>(true);
  const seenClaimsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<number>(0);
  const router = useRouter();
  const { setHasActiveNotifications } = useNotifications();
  
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.notificationId === notificationId 
          ? { ...n, isVisible: false }
          : n
      )
    );
    
    // Remove from array after animation
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.notificationId !== notificationId)
      );
    }, 300);
  }, []);

  const addNotification = useCallback((claim: OfferClaim, isDemo: boolean = false) => {
    // Reduced rate limiting to allow more frequent notifications
    const now = Date.now();
    if (now - lastNotificationTimeRef.current < 3000) { // Reduced to 3 seconds between notifications
      return;
    }
    lastNotificationTimeRef.current = now;

    const notification: Notification = {
      ...claim,
      notificationId: `${claim.id}-${Date.now()}-${Math.random()}`,
      isVisible: true,
      showTime: Date.now(),
      isDemo,
    };
    
    console.log('[Notifications] Adding notification:', notification.notificationId, notification.casinoName, isDemo ? '(DEMO)' : '(REAL)');
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      removeNotification(notification.notificationId);
    }, 8000);
  }, [removeNotification]);
      
  // Show demo notification - only when API is completely unavailable
  const showDemoNotification = useCallback(() => {
    const timeSinceLastSuccess = Date.now() - lastSuccessfulApiCall.getTime();
    
    // Only show demo if:
    // 1. API hasn't worked for more than 5 minutes AND
    // 2. We've never received any API data OR API has been down for a very long time
    if (!apiWorking && timeSinceLastSuccess > API_TIMEOUT && (!hasEverReceivedApiData || timeSinceLastSuccess > 600000)) {
      const demo = DEMO_NOTIFICATIONS[demoIndex % DEMO_NOTIFICATIONS.length];
      console.log('[Notifications] API completely down, showing demo notification:', demo.casinoName);
      
      addNotification({
        ...demo,
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }, true);
      
      demoIndex++;
    }
  }, [apiWorking, lastSuccessfulApiCall, hasEverReceivedApiData, addNotification]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    console.log('[Notifications] Notification clicked:', notification.casinoSlug);
    router.push(`/${notification.casinoSlug}`);
    removeNotification(notification.notificationId);
  }, [router, removeNotification]);

  const fetchRecentClaims = useCallback(async () => {
    try {
      console.log('[Notifications] Fetching recent claims...', {
        environment: process.env.NODE_ENV,
        baseUrl: window.location.origin,
        timestamp: new Date().toISOString()
      });
      
      const response = await fetch('/api/recent-claims', {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log('[Notifications] API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const recentClaims: OfferClaim[] = data.claims || [];
      
      console.log('[Notifications] API returned', recentClaims.length, 'claims', {
        meta: data.meta,
        claims: recentClaims,
        seenClaimsCount: seenClaimsRef.current.size,
        seenClaimIds: Array.from(seenClaimsRef.current)
      });
      
      // API is working if we get a successful response (even if empty)
      setApiWorking(true);
      setLastSuccessfulApiCall(new Date());
      
      if (recentClaims.length > 0) {
        setHasEverReceivedApiData(true);
        
        // Show notifications for recent claims that we haven't seen before
        const newClaims = recentClaims.filter(claim => {
          const claimTime = new Date(claim.createdAt);
          const isRecent = claimTime > new Date(Date.now() - 3600000); // Extended to 1 hour window
          const isUnseen = !seenClaimsRef.current.has(claim.id);
          
          console.log('[Notifications] Evaluating claim:', {
            id: claim.id,
            casinoName: claim.casinoName,
            claimTime: claimTime.toISOString(),
            isRecent,
            isUnseen,
            ageInMinutes: Math.floor((Date.now() - claimTime.getTime()) / 60000)
          });
          
          if (isRecent && isUnseen) {
            seenClaimsRef.current.add(claim.id);
            console.log('[Notifications] ✅ New recent claim found:', claim.casinoName, claimTime.toISOString());
            return true;
          }
          
          return false;
        });
        
        console.log('[Notifications] Found', newClaims.length, 'new claims to show');
        
        // Show up to 2 notifications per API call instead of just 1
        if (newClaims.length > 0) {
          const claimsToShow = newClaims.slice(0, 2);
          console.log('[Notifications] Showing notifications for:', claimsToShow.map(c => c.casinoName));
          
          claimsToShow.forEach(claim => {
            // Add small delay between multiple notifications
            setTimeout(() => {
              console.log('[Notifications] Adding notification for:', claim.casinoName);
              addNotification(claim, false);
            }, claimsToShow.indexOf(claim) * 1000);
          });
        } else {
          console.log('[Notifications] No new claims to show (all filtered out)');
        }
      } else {
        console.log('[Notifications] No claims returned from API');
      }
      
    } catch (error) {
      console.error('[Notifications] Error fetching recent claims:', error);
      
      // Only set API as not working if we've had multiple consecutive failures
      const timeSinceLastSuccess = Date.now() - lastSuccessfulApiCall.getTime();
      console.log('[Notifications] Time since last success:', Math.floor(timeSinceLastSuccess / 1000), 'seconds');
      
      if (timeSinceLastSuccess > 120000) { // 2 minutes of failures
        console.log('[Notifications] Setting API as not working due to consecutive failures');
        setApiWorking(false);
      }
    }
  }, [lastSuccessfulApiCall, addNotification]);

  // Initialize seen claims on mount - but only mark very old claims as seen
  useEffect(() => {
    const initializeSeenClaims = async () => {
      try {
        const response = await fetch('/api/recent-claims');
        if (response.ok) {
          const data = await response.json();
          const existingClaims: OfferClaim[] = data.claims || [];
          
          // Only mark claims older than 10 minutes as seen, allow recent ones to show
          const tenMinutesAgo = new Date(Date.now() - 600000);
          existingClaims.forEach(claim => {
            const claimTime = new Date(claim.createdAt);
            if (claimTime < tenMinutesAgo) {
              seenClaimsRef.current.add(claim.id);
            }
          });
          
          console.log('[Notifications] Initialized, marked', 
            existingClaims.filter(c => new Date(c.createdAt) < tenMinutesAgo).length,
            'old claims as seen, leaving', 
            existingClaims.filter(c => new Date(c.createdAt) >= tenMinutesAgo).length,
            'recent claims available'
          );
          
          if (existingClaims.length > 0) {
            setHasEverReceivedApiData(true);
            setApiWorking(true);
            setLastSuccessfulApiCall(new Date());
          }
        }
      } catch (error) {
        console.error('[Notifications] Error initializing:', error);
      }
    };

    initializeSeenClaims();
  }, []);

  // More frequent polling - check for new claims every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(fetchRecentClaims, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchRecentClaims]);

  // Demo notification effect - only when API is completely down
  useEffect(() => {
    const demoInterval = setInterval(showDemoNotification, DEMO_INTERVAL);
    return () => clearInterval(demoInterval);
  }, [showDemoNotification]);

  // Update global notification state
  useEffect(() => {
    setHasActiveNotifications(notifications.length > 0);
  }, [notifications, setHasActiveNotifications]);

  const formatMessage = (notification: Notification) => {
    const timeAgo = Math.floor((Date.now() - notification.showTime) / 1000);
    const timeText = timeAgo < 60 ? 'just now' : `${Math.floor(timeAgo / 60)}m ago`;
    
    return (
      <div>
        <p className="text-white font-medium mb-1">
          Someone claimed <span className="text-[#68D08B]">{notification.bonusTitle}</span>
          {notification.bonusCode && (
            <span> with code <span className="text-[#68D08B] font-semibold">{notification.bonusCode}</span></span>
          )}
        </p>
        <p className="text-[#a4a5b0] text-xs">
          {notification.casinoName} • {timeText}
          {notification.isDemo && process.env.NODE_ENV === 'development' && (
            <span className="text-yellow-400 ml-2">(Demo)</span>
          )}
        </p>
      </div>
    );
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Debug indicator in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-1 rounded text-xs">
          {apiWorking ? '🟢 API Mode' : '🔴 API Down'} | 
          {hasEverReceivedApiData ? ' Has Data' : ' No Data'} | 
          {notifications.length} active
        </div>
      )}
      
      <div className="fixed bottom-4 left-1/2 md:left-4 transform -translate-x-1/2 md:translate-x-0 z-50 space-y-3 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.notificationId}
            onClick={() => handleNotificationClick(notification)}
            className={`
              bg-[#2c2f3a]/95 rounded-xl p-4 shadow-2xl 
              w-[calc(100vw-2rem)] max-w-[400px] md:w-[400px]
              border border-[#444654] hover:border-[#68D08B]/50
              backdrop-blur-md pointer-events-auto cursor-pointer
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              ${notification.isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <img 
                  src={notification.casinoLogo || '/images/CryptoBonuses Logo.png'} 
                  alt={`${notification.casinoName} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/CryptoBonuses Logo.png';
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                {formatMessage(notification)}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.notificationId);
                }}
                className="text-[#a4a5b0] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 