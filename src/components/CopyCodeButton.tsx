'use client';

import React, { useState, useEffect } from 'react';

interface CopyCodeButtonProps {
  code: string;
  size?: 'default' | 'large';
  casinoId?: string;
  bonusId?: string;
  showUsageCount?: boolean;
  isSticky?: boolean;
  affiliateLink?: string | null;
}

export default function CopyCodeButton({ 
  code, 
  size = 'default', 
  casinoId, 
  bonusId,
  showUsageCount = false,
  isSticky = false,
  affiliateLink
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const displayCode = size === 'large' ? code : (code.length > 10 ? `${code.slice(0, 10)}..` : code);

  // Fetch usage count if needed
  useEffect(() => {
    if (showUsageCount && bonusId) {
      fetchUsageCount();
    }
  }, [showUsageCount, bonusId]);

  const fetchUsageCount = async () => {
    try {
      const response = await fetch(`/api/tracking?bonusId=${bonusId}`);
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.usageCount);
      }
    } catch (error) {
      console.error('Error fetching usage count:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // Track the copy action if casinoId and bonusId are provided
      if (casinoId && bonusId) {
        trackCopyCode();
      }
      
      // Affiliate link opening removed per user request
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const trackCopyCode = async () => {
    try {
      const trackingData = JSON.stringify({
        casinoId,
        bonusId,
        actionType: 'code_copy',
      });
      
      // Use sendBeacon API if available for better reliability when page unloads
      if (navigator.sendBeacon) {
        const blob = new Blob([trackingData], { type: 'application/json' });
        const success = navigator.sendBeacon('/api/tracking', blob);
        
        if (success) return;
      }
      
      // Fall back to fetch if sendBeacon is not available or failed
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: trackingData,
      });
    } catch (error) {
      console.error("Error tracking code copy:", error);
    }
  };

  // Use different background color for sticky CTA only
  const bgColor = isSticky ? "bg-[#3e4050]" : "bg-[#2c2f3a]";
  const hoverBgColor = isSticky ? "hover:bg-[#4a4c5c]" : "hover:bg-[#343747]";

  // Different button classes based on size and sticky status
  const buttonClasses = size === 'large'
    ? `${bgColor} text-white rounded-lg ${hoverBgColor} hover:shadow-lg border border-transparent hover:border-[#68D08B] transition-all duration-200 px-4 py-3 w-full flex items-center justify-center relative group`
    : `${bgColor} text-white rounded-lg ${hoverBgColor} hover:shadow-lg border border-transparent hover:border-[#68D08B] transition-all duration-200 ${isSticky ? 'px-4 py-2 md:py-2.5 w-full md:w-auto' : 'px-3 py-2'} flex items-center justify-between relative ${isSticky ? 'min-w-[130px] h-[38px] md:h-[44px]' : 'min-w-[100px]'} group`;

  return (
    <div className="relative w-full">
      <button
        onClick={handleCopy}
        className={buttonClasses}
        title={code}
      >
        <div className={`text-center ${size !== 'large' ? 'flex-1 mr-2' : ''}`}>
          <span className={size === 'large' 
            ? 'text-xl md:text-2xl font-medium text-white' 
            : `text-sm md:text-base font-medium text-white ${isSticky ? 'text-base md:text-lg' : ''}`}>
            {copied ? 'Copied!' : displayCode}
          </span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${size === 'large' ? 'w-6 h-6 absolute right-4' : 'w-5 h-5 flex-shrink-0'} opacity-80 group-hover:text-[#68D08B] group-hover:opacity-100`}>
          <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
          <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
        </svg>
      </button>
      {showUsageCount && usageCount !== null && (
        <div className="text-white/70 text-xs mt-1 text-center">
          Used {usageCount} {usageCount === 1 ? 'time' : 'times'} today
        </div>
      )}
    </div>
  );
} 