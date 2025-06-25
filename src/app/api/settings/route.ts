import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/auth-utils';

// Cache for settings to reduce database queries
let settingsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Helper function to clear cache
export function clearSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
}

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// GET /api/settings - Fetch site settings with caching
export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(settingsCache, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=60',
          'Vercel-CDN-Cache-Control': 'public, max-age=60'
        }
      });
    }

    // Find the first settings record or create one if it doesn't exist
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          faviconUrl: '/favicon.ico', // Default favicon
          codeTermLabel: 'bonus code', // Default code term
          searchDebounceTime: 2000,    // Default search debounce time
          searchInstantTrack: true,    // Default instant tracking enabled
          hideCryptoTicker: false,     // Default to showing ticker
          hideBuyCryptoButton: false,  // Default to showing buy crypto button
          cryptoTickerSelection: ['BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE']
        }
      });
    }
    
    // Update cache
    settingsCache = settings;
    cacheTimestamp = now;
    
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

// PUT /api/settings - Update site settings
export async function PUT(request: Request) {
  try {
    // First try JWT token authentication
    let isAuthorized = false;
    
    // Check JWT token in cookies
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('admin-token')?.value;
      
      if (token) {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
        }
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }
    
    // Also try NextAuth session as fallback
    if (!isAuthorized) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === "ADMIN") {
        isAuthorized = true;
      }
    }

    // Return 401 if not authorized
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Find existing settings
    const existingSettings = await prisma.settings.findFirst();
    
    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          faviconUrl: data.faviconUrl,
          codeTermLabel: data.codeTermLabel || 'bonus code',
          googleAnalyticsId: data.googleAnalyticsId,
          autoCheckEnabled: data.autoCheckEnabled !== undefined ? data.autoCheckEnabled : true,
          autoCheckFrequency: data.autoCheckFrequency || 'weekly',
          autoCheckUserId: data.autoCheckUserId,
          searchDebounceTime: data.searchDebounceTime !== undefined ? data.searchDebounceTime : 2000,
          searchInstantTrack: data.searchInstantTrack !== undefined ? data.searchInstantTrack : true,
          cryptoTickerSelection: data.cryptoTickerSelection || ['BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE'],
          hideCryptoTicker: data.hideCryptoTicker !== undefined ? data.hideCryptoTicker : false,
          hideBuyCryptoButton: data.hideBuyCryptoButton !== undefined ? data.hideBuyCryptoButton : false
        }
      });
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          faviconUrl: data.faviconUrl,
          codeTermLabel: data.codeTermLabel || 'bonus code',
          googleAnalyticsId: data.googleAnalyticsId,
          autoCheckEnabled: data.autoCheckEnabled !== undefined ? data.autoCheckEnabled : true,
          autoCheckFrequency: data.autoCheckFrequency || 'weekly',
          autoCheckUserId: data.autoCheckUserId,
          searchDebounceTime: data.searchDebounceTime !== undefined ? data.searchDebounceTime : 2000,
          searchInstantTrack: data.searchInstantTrack !== undefined ? data.searchInstantTrack : true,
          cryptoTickerSelection: data.cryptoTickerSelection || ['BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE'],
          hideCryptoTicker: data.hideCryptoTicker !== undefined ? data.hideCryptoTicker : false,
          hideBuyCryptoButton: data.hideBuyCryptoButton !== undefined ? data.hideBuyCryptoButton : false
        }
      });
    }
    
    // Clear the settings cache so the new values are used immediately
    clearSettingsCache();
    
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
} 