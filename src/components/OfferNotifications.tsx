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
}

// Real-time notifications powered by Server-Sent Events

export default function OfferNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);
  const seenClaimsRef = useRef<Set<string>>(new Set());
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

  const addNotification = useCallback((claim: OfferClaim) => {
    // Don't show notification for claims we've already seen
    if (seenClaimsRef.current.has(claim.id)) {
      return;
    }
    
    seenClaimsRef.current.add(claim.id);
    
    const notification: Notification = {
      ...claim,
      notificationId: `${claim.id}-${Date.now()}-${Math.random()}`,
      isVisible: true,
      showTime: Date.now(),
    };
    
    console.log('[SSE Notifications] Adding real-time notification:', notification.casinoName, notification.bonusTitle);
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      removeNotification(notification.notificationId);
    }, 8000);
  }, [removeNotification]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    console.log('[SSE Notifications] Notification clicked:', notification.casinoSlug);
    router.push(`/${notification.casinoSlug}`);
    removeNotification(notification.notificationId);
  }, [router, removeNotification]);

  // Set up Server-Sent Events connection
  useEffect(() => {
    console.log('[SSE Notifications] Setting up real-time notification stream...');
    
    const connectToSSE = () => {
      try {
        const eventSource = new EventSource('/api/notifications/stream');
        eventSourceRef.current = eventSource;
        
        eventSource.onopen = () => {
          console.log('[SSE Notifications] Connected to real-time stream');
          setConnectionStatus('connected');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              console.log('[SSE Notifications] Stream connection confirmed');
            } else if (data.type === 'heartbeat') {
              // Keep connection alive
            } else if (data.casinoName && data.bonusTitle) {
              // This is a real notification
              console.log('[SSE Notifications] Received real-time notification:', data);
              addNotification(data);
            }
          } catch (error) {
            console.error('[SSE Notifications] Error parsing SSE data:', error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('[SSE Notifications] SSE connection error:', error);
          setConnectionStatus('disconnected');
          
          // Reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              console.log('[SSE Notifications] Attempting to reconnect...');
              setConnectionStatus('connecting');
              connectToSSE();
            }
          }, 5000);
        };
        
      } catch (error) {
        console.error('[SSE Notifications] Failed to create SSE connection:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    connectToSSE();
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE Notifications] Closing SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [addNotification]);

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
          <span className={`mr-2 ${
            connectionStatus === 'connected' ? 'text-green-400' : 
            connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {connectionStatus === 'connected' ? '🟢' : 
             connectionStatus === 'connecting' ? '🟡' : '🔴'}
          </span>
          SSE {connectionStatus} | {notifications.length} active
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
                  src={notification.casinoLogo} 
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