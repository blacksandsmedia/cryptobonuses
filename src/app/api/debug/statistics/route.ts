import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[DEBUG] Testing production database queries...');
    
    // Test basic database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('[DEBUG] Database connection:', dbTest);
    
    // Count all tracking entries
    const totalTrackingCount = await prisma.offerTracking.count();
    console.log('[DEBUG] Total tracking entries:', totalTrackingCount);
    
    // Get sample tracking data
    const sampleTracking = await prisma.offerTracking.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actionType: true,
        path: true,
        casinoId: true,
        bonusId: true,
        createdAt: true
      }
    });
    console.log('[DEBUG] Sample tracking data:', sampleTracking);
    
    // Test the specific queries from statistics
    const uniqueUsersResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "path") as unique_users
      FROM "OfferTracking"
      WHERE "path" IS NOT NULL AND "path" != ''
    `;
    const uniqueUsers = Number((uniqueUsersResult as any)[0]?.unique_users || 0);
    console.log('[DEBUG] Unique users query result:', uniqueUsers);
    
    // Test code_copy count
    const codeCopyCount = await prisma.offerTracking.count({
      where: {
        actionType: 'code_copy'
      }
    });
    console.log('[DEBUG] Code copy count:', codeCopyCount);
    
    // Test offer_click count
    const offerClickCount = await prisma.offerTracking.count({
      where: {
        actionType: 'offer_click'
      }
    });
    console.log('[DEBUG] Offer click count:', offerClickCount);
    
    // Test bonus count
    const bonusCount = await prisma.bonus.count();
    console.log('[DEBUG] Total bonuses:', bonusCount);
    
    // Test most claimed bonus query
    const mostClaimedData = await prisma.offerTracking.groupBy({
      by: ['bonusId'],
      where: {
        actionType: 'code_copy',
        bonusId: {
          not: null
        }
      },
      _count: {
        bonusId: true
      },
      orderBy: {
        _count: {
          bonusId: 'desc'
        }
      },
      take: 1
    });
    console.log('[DEBUG] Most claimed bonus data:', mostClaimedData);
    
    return NextResponse.json({
      debug: true,
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        testQuery: dbTest
      },
      counts: {
        totalTracking: totalTrackingCount,
        uniqueUsers: uniqueUsers,
        codeCopy: codeCopyCount,
        offerClick: offerClickCount,
        bonuses: bonusCount
      },
      sampleData: sampleTracking,
      mostClaimedData: mostClaimedData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 