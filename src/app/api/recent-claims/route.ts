import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get offer trackings from the last 2 minutes (to catch recent activity)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const recentTrackings = await prisma.offerTracking.findMany({
      where: {
        createdAt: {
          gte: twoMinutesAgo
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

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching recent claims:', error);
    return NextResponse.json({ claims: [] });
  }
} 