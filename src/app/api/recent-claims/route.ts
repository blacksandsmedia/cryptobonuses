import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Log environment info
    console.log('[Recent Claims] Environment:', process.env.NODE_ENV);
    console.log('[Recent Claims] Starting API call at:', new Date().toISOString());
    
    // Get offer trackings from the last 2 hours for better coverage  
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    console.log('[Notifications] Querying for real claims since:', twoHoursAgo.toISOString());
    
    const recentTrackings = await prisma.offerTracking.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo
        },
        // Only include trackings that actually represent claims
        actionType: {
          in: ['code_copy', 'offer_click']
        },
        // Ensure we have valid casino and bonus references
        casinoId: { not: null },
        bonusId: { not: null }
      },
      include: {
        casino: {
          select: {
            name: true,
            logo: true,
            slug: true
          }
        },
        bonus: {
          select: {
            title: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Increase limit to get more diverse claims
    });

    console.log('[Notifications] Found', recentTrackings.length, 'real tracking entries');
    
    if (recentTrackings.length > 0) {
      console.log('[Notifications] Sample real claim:', {
        id: recentTrackings[0].id,
        actionType: recentTrackings[0].actionType,
        casinoName: recentTrackings[0].casino?.name,
        bonusTitle: recentTrackings[0].bonus?.title,
        createdAt: recentTrackings[0].createdAt
      });
    } else {
      console.log('[Notifications] No tracking entries found in the last 2 hours');
    }

    // Helper function to normalize image path
    const normalizeImagePath = (logoPath: string | null): string => {
      if (!logoPath) return '/images/CryptoBonuses Logo.png';
      
      // If it's already a full URL, return as is
      if (logoPath.startsWith('http')) return logoPath;
      
      // If it starts with /images/, return as is
      if (logoPath.startsWith('/images/')) return logoPath;
      
      // If it's just a filename, prepend /images/
      return `/images/${logoPath}`;
    };

    // Transform the data for the notification component
    const claims = recentTrackings
      .filter(tracking => tracking.casino && tracking.bonus) // Only include trackings with valid casino and bonus
      .map(tracking => ({
        id: tracking.id,
        casinoName: tracking.casino!.name,
        casinoLogo: normalizeImagePath(tracking.casino!.logo),
        casinoSlug: tracking.casino!.slug,
        bonusTitle: tracking.bonus!.title,
        bonusCode: tracking.bonus!.code || undefined,
        createdAt: tracking.createdAt.toISOString()
      }))
      // Remove duplicates based on casino and bonus combination
      .filter((claim, index, self) => 
        index === self.findIndex(c => 
          c.casinoName === claim.casinoName && c.bonusTitle === claim.bonusTitle
        )
      )
      // Limit to most recent 20 unique claims
      .slice(0, 20);

    console.log('[Notifications] Returning', claims.length, 'real claims for notifications');
    if (claims.length > 0) {
      console.log('[Notifications] Sample claim for notification:', {
        casinoName: claims[0].casinoName,
        bonusTitle: claims[0].bonusTitle,
        casinoLogo: claims[0].casinoLogo,
        createdAt: claims[0].createdAt
      });
    }

    const response = NextResponse.json({ 
      claims,
      meta: {
        totalTrackings: recentTrackings.length,
        uniqueClaims: claims.length,
        timeRange: `${twoHoursAgo.toISOString()} to ${new Date().toISOString()}`,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });

    // Set comprehensive headers to prevent caching and ensure proper access
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', 'Authorization, Cookie');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

    return response;
  } catch (error) {
    console.error('Error fetching recent claims:', error);
    const errorResponse = NextResponse.json({ 
      claims: [],
      error: 'Failed to fetch recent claims',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });

    // Add CORS headers even to error responses
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return errorResponse;
  }
} 