import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get offer trackings from the last 10 minutes (to catch recent activity)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Debug: Log the query parameters for troubleshooting
    console.log('[NotificationsDebug] Querying for recent claims since:', tenMinutesAgo.toISOString());
    
    const recentTrackings = await prisma.offerTracking.findMany({
      where: {
        createdAt: {
          gte: tenMinutesAgo
        },
        // Only include trackings that actually represent claims
        OR: [
          { actionType: 'code_copy' },
          { actionType: 'offer_click' }
        ]
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
      take: 20 // Limit to recent claims
    });

    // Debug: Log the raw results
    console.log('[NotificationsDebug] Found', recentTrackings.length, 'recent trackings');
    console.log('[NotificationsDebug] Action types found:', [...new Set(recentTrackings.map(t => t.actionType))]);

    // Transform the data for the notification component
    const claims = recentTrackings
      .filter(tracking => tracking.casino && tracking.bonus) // Only include trackings with valid casino and bonus
      .map(tracking => ({
        id: tracking.id,
        casinoName: tracking.casino!.name,
        casinoLogo: tracking.casino!.logo,
        casinoSlug: tracking.casino!.slug,
        bonusTitle: tracking.bonus!.title,
        bonusCode: tracking.bonus!.code || undefined,
        createdAt: tracking.createdAt.toISOString()
      }));

    console.log('[NotificationsDebug] Transformed to', claims.length, 'valid claims');
    if (claims.length > 0) {
      console.log('[NotificationsDebug] Sample claim:', claims[0]);
    }

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching recent claims:', error);
    return NextResponse.json({ claims: [] });
  }
} 