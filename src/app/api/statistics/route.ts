import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[Statistics] Fetching real statistics from production database...');
    
    // Test database connection (same as notifications debug)
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('[Statistics] Database connection test:', dbTest);
    
    // Get total tracking entries count
    const totalTrackingCount = await prisma.offerTracking.count();
    console.log('[Statistics] Total tracking entries in database:', totalTrackingCount);
    
    // Get unique visitors count from page visits (new visitor tracking system)
    const uniqueVisitorsResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "searchTerm") as unique_visitors
      FROM "OfferTracking"
      WHERE "actionType" = 'page_visit' AND "searchTerm" IS NOT NULL
    `;
    let totalUsers = Number((uniqueVisitorsResult as any)[0]?.unique_visitors || 0);
    console.log('[Statistics] Unique visitors from page tracking:', totalUsers);
    
    // Fallback to old method if no page visits tracked yet
    if (totalUsers === 0) {
      const fallbackUsersResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "path") as unique_users
        FROM "OfferTracking"
        WHERE "path" IS NOT NULL AND "path" != '' AND "actionType" IN ('code_copy', 'offer_click')
      `;
      totalUsers = Number((fallbackUsersResult as any)[0]?.unique_users || 0);
      console.log('[Statistics] Using fallback user count:', totalUsers);
    }
    
    // Get code_copy claims count (same pattern as notifications)
    const codeCopyCount = await prisma.offerTracking.count({
      where: {
        actionType: 'code_copy'
      }
    });
    console.log('[Statistics] Code copy claims:', codeCopyCount);
    
    // Get offer_click count for additional claims
    const offerClickCount = await prisma.offerTracking.count({
      where: {
        actionType: 'offer_click'
      }
    });
    console.log('[Statistics] Offer click claims:', offerClickCount);
    
    // Total claims = code_copy + offer_click
    const totalBonusesClaimed = codeCopyCount + offerClickCount;
    console.log('[Statistics] Total bonus claims calculated:', totalBonusesClaimed);
    
    // Get total bonuses available
    const totalOffersAvailable = await prisma.bonus.count();
    console.log('[Statistics] Total bonuses available:', totalOffersAvailable);
    
    // Find most popular casino from code_copy actions (priority)
    let mostClaimedOfferData = await prisma.offerTracking.groupBy({
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
    
    // If no code_copy data, try offer_click
    if (mostClaimedOfferData.length === 0) {
      console.log('[Statistics] No code_copy data, trying offer_click...');
      const offerClickData = await prisma.offerTracking.groupBy({
        by: ['bonusId'],
        where: {
          actionType: 'offer_click',
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
      mostClaimedOfferData = offerClickData;
    }
    
    let mostClaimedOffer: {
      name: string;
      slug: string;
      claimCount: number;
      logoUrl: string | null;
    } | null = null;
    
    if (mostClaimedOfferData.length > 0) {
      const mostClaimedBonus = mostClaimedOfferData[0];
      console.log('[Statistics] Most claimed bonus ID:', mostClaimedBonus.bonusId, 'with', mostClaimedBonus._count.bonusId, 'claims');
      
      // Get bonus and casino details
      const bonusDetails = await prisma.bonus.findUnique({
        where: { id: mostClaimedBonus.bonusId! },
        include: {
          casino: {
            select: {
              name: true,
              slug: true,
              logo: true
            }
          }
        }
      });
      
      if (bonusDetails && bonusDetails.casino) {
        mostClaimedOffer = {
          name: bonusDetails.casino.name,
          slug: bonusDetails.casino.slug,
          claimCount: mostClaimedBonus._count.bonusId,
          logoUrl: bonusDetails.casino.logo
        };
        console.log('[Statistics] Most popular casino:', bonusDetails.casino.name);
      }
    } else {
      console.log('[Statistics] No bonus claim data found');
    }
    
    // Calculate total claimed value (simplified)
    const totalClaimedValue = totalBonusesClaimed > 0 ? `$${Math.round(totalBonusesClaimed * 0.5)}K` : '$0';
    
    const response = {
      totalUsers,
      totalBonusesClaimed,
      totalOffersAvailable,
      mostClaimedOffer,
      totalClaimedValue
    };
    
    console.log('[Statistics] Final response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Statistics] Error:', error);
    return NextResponse.json({
      totalUsers: 0,
      totalBonusesClaimed: 0,
      totalOffersAvailable: 0,
      mostClaimedOffer: null,
      totalClaimedValue: '$0',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 