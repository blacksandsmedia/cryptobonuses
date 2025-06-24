import { prisma } from '@/lib/prisma';

// Cache settings to avoid frequent database calls
let settingsCache: { 
  codeTermLabel: string; 
  faviconUrl: string | null;
  lastFetch: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSettings() {
  // Return cached settings if they're still fresh
  if (settingsCache && Date.now() - settingsCache.lastFetch < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          faviconUrl: '/favicon.ico',
          codeTermLabel: 'bonus code'
        }
      });
    }

    // Update cache
    settingsCache = {
      codeTermLabel: settings.codeTermLabel || 'bonus code',
      faviconUrl: settings.faviconUrl,
      lastFetch: Date.now()
    };

    return settingsCache;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults if database fails
    return {
      codeTermLabel: 'bonus code',
      faviconUrl: '/favicon.ico',
      lastFetch: Date.now()
    };
  }
}

export async function getCodeTermLabel(): Promise<string> {
  const settings = await getSettings();
  return settings.codeTermLabel;
}

// Function to clear the cache (useful after settings updates)
export function clearSettingsCache() {
  settingsCache = null;
} 