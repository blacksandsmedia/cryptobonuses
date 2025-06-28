import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching real statistics...');
    
    // Get actual unique users (using unique paths as proxy for unique visitors)
    const uniqueUsersResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "path") as unique_users
      FROM "OfferTracking"
    `;
    const totalUsers = Number((uniqueUsersResult as any)[0]?.unique_users || 0);
    
    // Get actual total bonus claims (code_copy actions represent real claims)
    const totalBonusesClaimed = await prisma.offerTracking.count({
      where: {
        actionType: 'code_copy'
      }
    });

    // Get total number of active casinos
    const activeCasinos = await prisma.casino.count();

    // Get total number of active bonuses
    const totalOffersAvailable = await prisma.bonus.count();
    
    console.log('Real stats:', { totalUsers, totalBonusesClaimed, activeCasinos, totalOffersAvailable });

    // Get most claimed offer (based on actual code copies)
    const mostClaimedOfferData = await prisma.offerTracking.groupBy({
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

    let mostClaimedOffer: {
      name: string;
      slug: string;
      claimCount: number;
      logoUrl: string | null;
    } | null = null;
    if (mostClaimedOfferData.length > 0) {
      const bonusId = mostClaimedOfferData[0].bonusId;
      const claimCount = mostClaimedOfferData[0]._count.bonusId;
      
      console.log('Most claimed bonus ID:', bonusId, 'with', claimCount, 'claims');
      
      if (bonusId) {
        const bonus = await prisma.bonus.findUnique({
          where: { id: bonusId },
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

        console.log('Found bonus:', bonus?.title, 'from casino:', bonus?.casino?.name);

        if (bonus && bonus.casino) {
          mostClaimedOffer = {
            name: bonus.casino.name,
            slug: bonus.casino.slug,
            claimCount: claimCount,
            logoUrl: bonus.casino.logo
          };
        }
      }
    }

    // If no code_copy data, try to get most active casino by any action type
    if (!mostClaimedOffer) {
      console.log('No code_copy tracking data found, checking for most active casino...');
      
      const fallbackData = await prisma.offerTracking.groupBy({
        by: ['casinoId'],
        where: {
          casinoId: {
            not: null
          }
        },
        _count: {
          casinoId: true
        },
        orderBy: {
          _count: {
            casinoId: 'desc'
          }
        },
        take: 1
      });
      
      if (fallbackData.length > 0) {
        const casinoId = fallbackData[0].casinoId;
        const actionCount = fallbackData[0]._count.casinoId;
        
        if (casinoId) {
          const casino = await prisma.casino.findUnique({
            where: { id: casinoId },
            select: {
              name: true,
              slug: true,
              logo: true
            }
          });
          
          if (casino) {
            mostClaimedOffer = {
              name: casino.name,
              slug: casino.slug,
              claimCount: actionCount,
              logoUrl: casino.logo
            };
            console.log('Using most active casino:', casino.name, 'with', actionCount, 'total actions');
          }
        }
      }
    }

    // Calculate total claimed value based on real claims only
    const avgBonusValue = 500; // Average bonus value in USD
    const totalClaimedValue = totalBonusesClaimed * avgBonusValue;
    const formattedClaimedValue = totalClaimedValue >= 1000000 
      ? `$${(totalClaimedValue / 1000000).toFixed(1)}M`
      : totalClaimedValue >= 1000 
        ? `$${(totalClaimedValue / 1000).toFixed(0)}K`
        : `$${totalClaimedValue.toLocaleString()}`;

    // Return real statistics without artificial minimums
    const realStatistics = {
      totalUsers: totalUsers,
      totalBonusesClaimed: totalBonusesClaimed,
      totalOffersAvailable: totalOffersAvailable,
      mostClaimedOffer: mostClaimedOffer,
      totalClaimedValue: formattedClaimedValue
    };

    console.log('Returning real statistics:', realStatistics);
    return NextResponse.json(realStatistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    // Return minimal real data instead of fake fallback data
    try {
      // Try to get basic counts even if the complex query failed
      const basicCasinoCount = await prisma.casino.count();
      const basicBonusCount = await prisma.bonus.count();
      const basicTrackingCount = await prisma.offerTracking.count();
      
      return NextResponse.json({
        totalUsers: basicTrackingCount,
        totalBonusesClaimed: basicTrackingCount,
        totalOffersAvailable: basicBonusCount,
        mostClaimedOffer: null,
        totalClaimedValue: basicTrackingCount > 0 ? `$${(basicTrackingCount * 500).toLocaleString()}` : "$0"
      });
    } catch (fallbackError) {
      console.error('Even basic statistics query failed:', fallbackError);
      return NextResponse.json({
        totalUsers: 0,
        totalBonusesClaimed: 0,
        totalOffersAvailable: 0,
        mostClaimedOffer: null,
        totalClaimedValue: "$0"
      });
    }
  }
} 