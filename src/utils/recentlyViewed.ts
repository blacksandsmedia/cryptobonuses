export interface RecentlyViewedCasino {
  id: string;
  name: string;
  slug: string;
  logo: string;
  bonusTitle: string;
  bonusCode?: string;
  affiliateLink: string;
  viewedAt: number;
}

const STORAGE_KEY = 'recently_viewed_casinos';
const MAX_RECENT_ITEMS = 5;

export function addToRecentlyViewed(casino: Omit<RecentlyViewedCasino, 'viewedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getRecentlyViewed();
    
    // Remove if already exists
    const filtered = existing.filter(item => item.id !== casino.id);
    
    // Add to beginning with current timestamp
    const updated = [
      { ...casino, viewedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_RECENT_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to recently viewed:', error);
  }
}

export function getRecentlyViewed(): RecentlyViewedCasino[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Filter out items older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filtered = parsed.filter((item: RecentlyViewedCasino) => 
      item.viewedAt > thirtyDaysAgo
    );
    
    // Save filtered list back
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    
    return filtered;
  } catch (error) {
    console.error('Failed to get recently viewed:', error);
    return [];
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recently viewed:', error);
  }
} 