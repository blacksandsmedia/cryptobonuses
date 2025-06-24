// Utility function for tracking search actions with configurable debouncing
let searchTimeoutId: NodeJS.Timeout | null = null;
let searchSettings: { debounceTime: number; instantTrack: boolean } | null = null;

// Fetch search settings from API (cached)
const getSearchSettings = async (): Promise<{ debounceTime: number; instantTrack: boolean }> => {
  if (!searchSettings) {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        searchSettings = {
          debounceTime: settings.searchDebounceTime || 2000,
          instantTrack: settings.searchInstantTrack !== false
        };
      } else {
        // Fallback to default values
        searchSettings = { debounceTime: 2000, instantTrack: true };
      }
    } catch (error) {
      console.error('Failed to fetch search settings:', error);
      searchSettings = { debounceTime: 2000, instantTrack: true };
    }
  }
  return searchSettings;
};

export const trackSearch = async (searchTerm: string, customDebounceMs?: number) => {
  // Clear existing timeout
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }
  
  // Only track non-empty search terms
  if (!searchTerm.trim()) {
    return;
  }
  
  // Get search settings
  const settings = await getSearchSettings();
  const debounceMs = customDebounceMs || settings.debounceTime;
  
  // Set new timeout for debounced tracking
  searchTimeoutId = setTimeout(async () => {
    await performSearchTracking(searchTerm);
  }, debounceMs);
};

export const trackSearchInstant = async (searchTerm: string) => {
  // Only track non-empty search terms
  if (!searchTerm.trim()) {
    return;
  }
  
  // Get search settings to check if instant tracking is enabled
  const settings = await getSearchSettings();
  if (!settings.instantTrack) {
    return; // Instant tracking is disabled
  }
  
  await performSearchTracking(searchTerm);
};

// Helper function to perform the actual tracking
const performSearchTracking = async (searchTerm: string) => {
  try {
    const trackingData = JSON.stringify({
      searchTerm: searchTerm.trim(),
      actionType: 'search',
    });
    
    // Use sendBeacon API if available for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([trackingData], { type: 'application/json' });
      const success = navigator.sendBeacon('/api/tracking', blob);
      
      if (!success) {
        // Fallback to fetch if sendBeacon fails
        await fetch('/api/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: trackingData,
        });
      }
    } else {
      // Fallback to fetch for browsers that don't support sendBeacon
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: trackingData,
      });
    }
  } catch (error) {
    // Silently fail - tracking shouldn't break user experience
    console.error('Search tracking failed:', error);
  }
}; 