import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get offer trackings from the last 30 minutes for better coverage  
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    console.log('[Notifications] Querying for real claims since:', thirtyMinutesAgo.toISOString());
    
    const recentTrackings = await prisma.offerTracking.findMany({
      where: {
        createdAt: {
          gte: thirtyMinutesAgo
        },
        // Only include trackings that actually represent claims
        actionType: {
          in: ['code_copy', 'offer_click']
        }
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

    console.log('[Notifications] Found', recentTrackings.length, 'real tracking entries');
    
    if (recentTrackings.length > 0) {
      console.log('[Notifications] Sample real claim:', {
        id: recentTrackings[0].id,
        actionType: recentTrackings[0].actionType,
        casinoName: recentTrackings[0].casino?.name,
        bonusTitle: recentTrackings[0].bonus?.title,
        createdAt: recentTrackings[0].createdAt
      });
    }

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

    console.log('[Notifications] Returning', claims.length, 'real claims for notifications');
    if (claims.length > 0) {
      console.log('[Notifications] Sample claim for notification:', claims[0]);
    }

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching recent claims:', error);
    return NextResponse.json({ claims: [] });
  }
} 