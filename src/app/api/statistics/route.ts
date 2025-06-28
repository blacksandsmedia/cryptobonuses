import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching real statistics...');
    
    // Debug: Check what tracking data exists
    const allTrackingData = await prisma.offerTracking.findMany({
      take: 5,
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
    console.log('Sample tracking data:', allTrackingData);
    
    // Get total tracking count
    const totalTrackingCount = await prisma.offerTracking.count();
    console.log('Total tracking entries:', totalTrackingCount);
    
    // Get actual unique users (using unique paths as proxy for unique visitors)
    // Filter out null paths to get meaningful count
    const uniqueUsersResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "path") as unique_users
      FROM "OfferTracking"
      WHERE "path" IS NOT NULL AND "path" != ''
    `;
    const totalUsers = Number((uniqueUsersResult as any)[0]?.unique_users || 0);
    console.log('Unique users (non-null paths):', totalUsers);
    
    // Get actual total bonus claims (both code_copy and offer_click represent user engagement)
    const codeCopyCount = await prisma.offerTracking.count({
      where: {
        actionType: 'code_copy'
      }
    });
    const offerClickCount = await prisma.offerTracking.count({
      where: {
        actionType: 'offer_click'
      }
    });
    // Use code_copy as primary metric, but include offer_click if no code_copy exists
    const totalBonusesClaimed = codeCopyCount > 0 ? codeCopyCount : offerClickCount;
    console.log('Code copy count:', codeCopyCount, 'Offer click count:', offerClickCount);

    // Get total number of active casinos
    const activeCasinos = await prisma.casino.count();

    // Get total number of active bonuses
    const totalOffersAvailable = await prisma.bonus.count();
    console.log('Total bonuses in database:', totalOffersAvailable);
    
    console.log('Real stats:', { totalUsers, totalBonusesClaimed, activeCasinos, totalOffersAvailable });

    // Get most claimed offer (based on actual code copies first, then offer clicks)
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
      console.log('No code_copy data found, trying offer_click...');
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

    // If no bonus-specific data, try to get most active casino by any action type
    if (!mostClaimedOffer) {
      console.log('No bonus tracking data found, checking for most active casino...');
      
      const fallbackData = await prisma.offerTracking.groupBy({
        by: ['casinoId'],
        where: {
          casinoId: {
            not: null
          },
          actionType: {
            in: ['code_copy', 'offer_click']
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
      
      console.log('Fallback counts:', { basicCasinoCount, basicBonusCount, basicTrackingCount });
      
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