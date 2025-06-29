'use client';

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per session to avoid duplicate entries
    if (hasTracked.current) return;
    
    const trackVisitor = async () => {
      try {
        // Get basic visitor info
        const visitorData = {
          actionType: 'page_visit',
          path: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || null,
          // Create a simple session ID based on browser fingerprint
          sessionId: generateSessionId()
        };

        console.log('[Visitor Tracker] Recording page visit:', {
          path: visitorData.path,
          sessionId: visitorData.sessionId
        });

        const response = await fetch('/api/visitor-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visitorData)
        });

        if (response.ok) {
          console.log('[Visitor Tracker] ✅ Page visit recorded');
          hasTracked.current = true;
        } else {
          console.warn('[Visitor Tracker] ⚠️ Failed to record visit:', response.status);
        }
      } catch (error) {
        console.error('[Visitor Tracker] Error tracking visitor:', error);
      }
    };

    // Track after a short delay to ensure page is loaded
    const timer = setTimeout(trackVisitor, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component renders nothing
  return null;
}

// Generate a simple session ID based on browser characteristics
function generateSessionId(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('CryptoBonuses visitor tracking', 2, 2);
  }
  
  const canvasData = canvas.toDataURL();
  const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezoneData = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const languageData = navigator.language;
  
  const fingerprint = `${canvasData}_${screenData}_${timezoneData}_${languageData}`;
  
  // Create a hash of the fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `visitor_${Math.abs(hash)}_${Date.now()}`;
} 