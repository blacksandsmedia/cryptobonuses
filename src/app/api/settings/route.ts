import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/auth-utils';
import { clearSettingsCache } from '@/lib/settings';

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// GET /api/settings - Fetch site settings
export async function GET() {
  try {
    // Find the first settings record or create one if it doesn't exist
    // Run prisma generate to update types after schema changes
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          faviconUrl: '/favicon.ico', // Default favicon
          codeTermLabel: 'bonus code', // Default code term
          searchDebounceTime: 2000,    // Default search debounce time
          searchInstantTrack: true,    // Default instant tracking enabled
          hideCryptoTicker: false,     // Default to showing ticker
          hideBuyCryptoButton: false   // Default to showing buy crypto button
        }
      });
    }
    
    const response = NextResponse.json(settings);
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
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
    
    // Find the first settings record or create one if it doesn't exist
    let settings = await prisma.settings.findFirst();
    
    if (settings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          faviconUrl: data.faviconUrl,
          codeTermLabel: data.codeTermLabel || 'bonus code',
          googleAnalyticsId: data.googleAnalyticsId,
          autoCheckEnabled: data.autoCheckEnabled !== undefined ? data.autoCheckEnabled : settings.autoCheckEnabled,
          autoCheckFrequency: data.autoCheckFrequency || settings.autoCheckFrequency,
          autoCheckUserId: data.autoCheckUserId || settings.autoCheckUserId,
          searchDebounceTime: data.searchDebounceTime !== undefined ? data.searchDebounceTime : settings.searchDebounceTime,
          searchInstantTrack: data.searchInstantTrack !== undefined ? data.searchInstantTrack : settings.searchInstantTrack,
          cryptoTickerSelection: data.cryptoTickerSelection !== undefined ? data.cryptoTickerSelection : settings.cryptoTickerSelection,
          hideCryptoTicker: data.hideCryptoTicker !== undefined ? data.hideCryptoTicker : settings.hideCryptoTicker,
          hideBuyCryptoButton: data.hideBuyCryptoButton !== undefined ? data.hideBuyCryptoButton : settings.hideBuyCryptoButton,
          updatedAt: new Date()
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
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 