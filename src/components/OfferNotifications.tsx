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
const DEMO_INTERVAL = 45000; // Show demo notification every 45 seconds
const API_TIMEOUT = 300000; // 5 minutes before considering API completely down

export default function OfferNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSuccessfulApiCall, setLastSuccessfulApiCall] = useState<Date>(new Date());
  const [hasEverReceivedApiData, setHasEverReceivedApiData] = useState<boolean>(false);
  const [apiWorking, setApiWorking] = useState<boolean>(true);
  
  // Use a more robust tracking system - store claim IDs that have been shown as notifications
  const shownNotificationsRef = useRef<Set<string>>(new Set());
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
    // Check if we've already shown a notification for this claim ID
    if (shownNotificationsRef.current.has(claim.id)) {
      console.log('[Notifications] ⏭️ Skipping duplicate notification for claim:', claim.id, claim.casinoName);
      return;
    }

    // Rate limiting - prevent notifications too close together
    const now = Date.now();
    if (now - lastNotificationTimeRef.current < 2000) { // 2 seconds between notifications
      console.log('[Notifications] ⏳ Rate limited, skipping notification for:', claim.casinoName);
      return;
    }
    lastNotificationTimeRef.current = now;

    // Mark this claim as shown
    shownNotificationsRef.current.add(claim.id);

    const notification: Notification = {
      ...claim,
      notificationId: `${claim.id}-${Date.now()}-${Math.random()}`,
      isVisible: true,
      showTime: Date.now(),
      isDemo,
    };
    
    console.log('[Notifications] ✅ Adding NEW notification:', {
      notificationId: notification.notificationId,
      claimId: claim.id,
      casinoName: notification.casinoName,
      type: isDemo ? 'DEMO' : 'REAL',
      totalShown: shownNotificationsRef.current.size
    });
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after exactly 10 seconds as requested
    setTimeout(() => {
      console.log('[Notifications] ⏰ Auto-removing notification after 10s:', notification.notificationId);
      removeNotification(notification.notificationId);
    }, 10000);
  }, [removeNotification]);
      
  // Show demo notification - only when API is completely unavailable
  const showDemoNotification = useCallback(() => {
    const timeSinceLastSuccess = Date.now() - lastSuccessfulApiCall.getTime();
    
    // Only show demo if API hasn't worked for more than 5 minutes
    if (!apiWorking && timeSinceLastSuccess > API_TIMEOUT && (!hasEverReceivedApiData || timeSinceLastSuccess > 600000)) {
      const demo = DEMO_NOTIFICATIONS[demoIndex % DEMO_NOTIFICATIONS.length];
      console.log('[Notifications] 🤖 API down, showing demo notification:', demo.casinoName);
      
      addNotification({
        ...demo,
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }, true);
      
      demoIndex++;
    }
  }, [apiWorking, lastSuccessfulApiCall, hasEverReceivedApiData, addNotification]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    console.log('[Notifications] 🖱️ Notification clicked:', notification.casinoSlug);
    router.push(`/${notification.casinoSlug}`);
    removeNotification(notification.notificationId);
  }, [router, removeNotification]);

  const fetchRecentClaims = useCallback(async () => {
      try {
      console.log('[Notifications] 🔍 Fetching recent claims...');
      
      const response = await fetch('/api/recent-claims', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
          const data = await response.json();
          const recentClaims: OfferClaim[] = data.claims || [];
          
      console.log('[Notifications] 📥 API returned', recentClaims.length, 'claims');
      
      // API is working if we get a successful response
      setApiWorking(true);
      setLastSuccessfulApiCall(new Date());
      
      if (recentClaims.length > 0) {
        setHasEverReceivedApiData(true);
        
        // Only show notifications for claims we haven't shown before
        const newClaims = recentClaims.filter(claim => {
          const claimTime = new Date(claim.createdAt);
          const isVeryRecent = claimTime > new Date(Date.now() - 600000); // 10 minutes window for instant notifications
          const notShownBefore = !shownNotificationsRef.current.has(claim.id);
          
          console.log('[Notifications] 🔍 Evaluating claim:', {
            id: claim.id,
            casinoName: claim.casinoName,
            claimTime: claimTime.toISOString(),
            ageInMinutes: Math.floor((Date.now() - claimTime.getTime()) / 60000),
            isVeryRecent,
            notShownBefore,
            shouldShow: isVeryRecent && notShownBefore
          });
          
          return isVeryRecent && notShownBefore;
        });
        
        console.log('[Notifications] 🎯 Found', newClaims.length, 'NEW claims to show');
        
        // Show only the most recent new claim to avoid spam
        if (newClaims.length > 0) {
          const claimToShow = newClaims[0]; // Only show the newest one
          console.log('[Notifications] 🚀 Showing notification for:', claimToShow.casinoName);
          addNotification(claimToShow, false);
        } else {
          console.log('[Notifications] 💤 No new claims to show (all previously shown or too old)');
            }
      } else {
        console.log('[Notifications] 📭 No claims returned from API');
      }
      
      } catch (error) {
      console.error('[Notifications] ❌ Error fetching recent claims:', error);
      
      const timeSinceLastSuccess = Date.now() - lastSuccessfulApiCall.getTime();
      if (timeSinceLastSuccess > 120000) { // 2 minutes of failures
        console.log('[Notifications] 🔴 Setting API as not working due to consecutive failures');
      setApiWorking(false);
      }
    }
  }, [lastSuccessfulApiCall, addNotification]);

  // Initialize and mark ALL existing claims as already shown to prevent initial spam
  useEffect(() => {
    const initializeShownClaims = async () => {
      try {
        console.log('[Notifications] 🔧 Initializing, marking existing claims as shown...');
        const response = await fetch('/api/recent-claims');
        if (response.ok) {
          const data = await response.json();
          const existingClaims: OfferClaim[] = data.claims || [];
          
          // Mark ALL existing claims as already shown to prevent spam on page load
          existingClaims.forEach(claim => {
            shownNotificationsRef.current.add(claim.id);
          });
          
          console.log('[Notifications] ✅ Marked', existingClaims.length, 'existing claims as already shown');
          
          if (existingClaims.length > 0) {
            setHasEverReceivedApiData(true);
            setApiWorking(true);
            setLastSuccessfulApiCall(new Date());
          }
        }
      } catch (error) {
        console.error('[Notifications] ❌ Error initializing:', error);
      }
    };

    initializeShownClaims();
  }, []);

  // Poll for new claims every 5 seconds for instant notifications
  useEffect(() => {
    const pollInterval = setInterval(fetchRecentClaims, 5000);
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
          {apiWorking ? '🟢 API' : '🔴 Down'} | 
          Shown: {shownNotificationsRef.current.size} | 
          Active: {notifications.length}
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
                    // Try fallback to /uploads/ path if /images/ fails
                    if (target.src.includes('/images/') && !target.src.includes('CryptoBonuses')) {
                      const filename = target.src.split('/').pop()?.split('?')[0];
                      target.src = `/uploads/${filename}?v=${Date.now()}`;
                    } else if (!target.src.includes('CryptoBonuses')) {
                      // Final fallback to site logo
                    target.src = '/images/CryptoBonuses Logo.png';
                    }
                  }}
                  onLoad={() => {
                    // Force refresh after a successful load to ensure we have the latest image
                    console.log('[Notifications] 🖼️ Logo loaded for:', notification.casinoName);
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