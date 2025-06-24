'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical API endpoints
    const preloadEndpoints = [
      '/api/settings',
    ];

    preloadEndpoints.forEach(endpoint => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = endpoint;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Monitor performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Log Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              console.log('CLS:', clsEntry.value);
            }
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        console.log('Performance observer not fully supported');
      }
    }

    // Cleanup function
    return () => {
      // Remove preload links if needed
    };
  }, []);

  return (
    <>
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//api.coingecko.com" />
      <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
      
      {/* Service Worker for caching (in production) */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      )}
    </>
  );
} 