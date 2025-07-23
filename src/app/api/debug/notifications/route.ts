import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');
    
    // Get current time for debugging
    const now = new Date();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    console.log('[Debug] Current time:', now.toISOString());
    console.log('[Debug] Two hours ago:', twoHoursAgo.toISOString());
    
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('[Debug] Database connection:', dbTest);
    
    // Check recent tracking entries
    const recentTrackings = await prisma.offerTracking.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo
        },
        actionType: {
          in: ['code_copy', 'offer_click']
        },
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
      take: 10
    });
    
    console.log('[Debug] Found tracking entries:', recentTrackings.length);
    
    // Test creating a tracking entry if requested
    if (test === 'create') {
      const testCasino = await prisma.casino.findFirst({
        include: { bonuses: true }
      });
      
      if (testCasino && testCasino.bonuses.length > 0) {
        const trackingId = `debug_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const testTracking = await prisma.offerTracking.create({
          data: {
            id: trackingId,
            casinoId: testCasino.id,
            bonusId: testCasino.bonuses[0].id,
            actionType: 'code_copy',
            createdAt: now
          }
        });
        console.log('[Debug] Created test tracking:', testTracking);
      }
    }
    
    // Transform data like the real API does
    const claims = recentTrackings
      .filter(tracking => tracking.casino && tracking.bonus)
      .map(tracking => ({
        id: tracking.id,
        casinoName: tracking.casino!.name,
        casinoLogo: tracking.casino!.logo || '/images/CryptoBonuses Logo.png',
        casinoSlug: tracking.casino!.slug,
        bonusTitle: tracking.bonus!.title,
        bonusCode: tracking.bonus!.code || undefined,
        createdAt: tracking.createdAt.toISOString()
      }));
    
    return NextResponse.json({
      debug: true,
      timestamp: now.toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        testQuery: dbTest
      },
      tracking: {
        totalFound: recentTrackings.length,
        timeWindow: `${twoHoursAgo.toISOString()} to ${now.toISOString()}`,
        rawEntries: recentTrackings,
        transformedClaims: claims
      },
      api: {
        recentClaimsEndpoint: '/api/recent-claims',
        trackingEndpoint: '/api/tracking'
      }
    });
    
  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({
      debug: true,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 