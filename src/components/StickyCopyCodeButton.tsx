'use client';

import React, { useState, useEffect } from 'react';

interface StickyCopyCodeButtonProps {
  code: string;
  casinoId?: string;
  bonusId?: string;
  affiliateLink?: string | null;
  isSticky?: boolean;
}

export default function StickyCopyCodeButton({ 
  code, 
  casinoId, 
  bonusId,
  affiliateLink,
  isSticky = false
}: StickyCopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const displayCode = code.length > 8 ? `${code.slice(0, 8)}..` : code;

  // Fetch usage count when component mounts (keep for tracking but don't display)
  useEffect(() => {
    if (bonusId) {
      fetchUsageCount();
    }

    // Refresh count every minute
    const interval = setInterval(() => {
      if (bonusId) {
        fetchUsageCount();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [bonusId]);

  const fetchUsageCount = async () => {
    try {
      if (!bonusId) return;
      
      const response = await fetch(`/api/analytics/bonus-stats?bonusId=${bonusId}`);
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.timesClaimedToday || 0);
      }
    } catch (error) {
      console.error('Error fetching usage count:', error);
    }
  };

  const handleCopyCode = async () => {
    // Track the code copy action
    if (casinoId || bonusId) {
      try {
        await fetch('/api/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            casinoId,
            bonusId,
            actionType: 'code_copy'
          }),
        });
        
        // Refresh usage count after tracking
        if (bonusId) {
          setTimeout(() => fetchUsageCount(), 500);
        }
      } catch (error) {
        console.error('Failed to track offer:', error);
      }
    }

    navigator.clipboard.writeText(code);
    setCopied(true);
    
    // Automatically open affiliate link after 3 seconds if provided
    if (affiliateLink) {
      setTimeout(() => {
        window.open(affiliateLink, '_blank', 'noopener,noreferrer');
      }, 3000);
    }
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Adjust styling based on context
  const buttonClasses = isSticky
    ? "font-bold text-[#68D08B] bg-gradient-to-r from-[#68D08B]/10 to-[#68D08B]/15 px-3 py-1 rounded-lg border border-[#68D08B]/40 cursor-pointer hover:from-[#68D08B]/20 hover:to-[#68D08B]/25 hover:border-[#68D08B]/60 transition-all duration-300 select-none min-w-[80px] text-center uppercase h-[32px] sm:h-[38px] flex items-center justify-center text-xs sm:text-sm shadow-md hover:shadow-lg"
    : "font-bold text-[#68D08B] bg-[#68D08B]/10 px-3 py-1 rounded-lg border border-[#68D08B]/30 cursor-pointer hover:bg-[#68D08B]/20 transition-colors select-none min-w-[80px] text-center uppercase";

  return (
    <button
      onClick={handleCopyCode}
      className={buttonClasses}
      title={`Click to copy code: ${code}`}
    >
      {copied ? 'Copied!' : displayCode}
    </button>
  );
} 