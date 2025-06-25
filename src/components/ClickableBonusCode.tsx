'use client';

import { useState } from 'react';

interface ClickableBonusCodeProps {
  code: string;
  affiliateLink?: string | null;
  casinoId?: string;
  bonusId?: string;
}

export default function ClickableBonusCode({ code, affiliateLink, casinoId, bonusId }: ClickableBonusCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
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
      } catch (error) {
        console.error('Failed to track offer:', error);
      }
    }

    navigator.clipboard.writeText(code);
    setCopied(true);
    
    // Open affiliate link with popup blocker resistance
    if (affiliateLink) {
      console.log('Code copied! Opening casino site in 3 seconds...');
      
      // Pre-open the window to avoid popup blockers
      const newWindow = window.open('', '_blank', 'noopener,noreferrer');
      
      setTimeout(() => {
        if (newWindow && !newWindow.closed) {
          newWindow.location.href = affiliateLink;
        } else {
          // Fallback: try direct open if pre-opened window failed
          window.open(affiliateLink, '_blank', 'noopener,noreferrer');
        }
      }, 3000);
    }
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <span 
      className="font-bold text-[#68D08B] bg-[#68D08B]/10 px-3 py-1 rounded-lg border border-[#68D08B]/30 cursor-pointer hover:bg-[#68D08B]/20 transition-colors select-none min-w-[80px] inline-block text-center uppercase"
      onClick={handleClick}
      title="Click to copy code"
    >
      {copied ? 'Copied!' : code}
    </span>
  );
} 