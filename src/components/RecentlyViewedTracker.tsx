'use client';

import { useEffect } from 'react';
import { addToRecentlyViewed } from '@/utils/recentlyViewed';

interface RecentlyViewedTrackerProps {
  casino: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    bonusTitle: string;
    bonusCode?: string;
    affiliateLink: string;
  };
}

export default function RecentlyViewedTracker({ casino }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    // Add to recently viewed on client side only
    addToRecentlyViewed({
      id: casino.id,
      name: casino.name,
      slug: casino.slug,
      logo: casino.logo,
      bonusTitle: casino.bonusTitle,
      bonusCode: casino.bonusCode || '',
      affiliateLink: casino.affiliateLink || ''
    });
  }, [casino]);

  // This component doesn't render anything visible
  return null;
} 