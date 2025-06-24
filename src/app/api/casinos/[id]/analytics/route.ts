import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ChartDataPoint {
  date: string;
  day: string;
  count: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // The ID parameter could be either a casino ID or a slug
    // First try to find by ID, then by slug
    let casino = await prisma.casino.findUnique({
      where: { id },
      include: { bonuses: true }
    });

    // If not found by ID, try by slug
    if (!casino) {
      casino = await prisma.casino.findUnique({
        where: { slug: id },
        include: { bonuses: true }
      });
    }

    if (!casino) {
      return NextResponse.json({ error: 'Casino not found' }, { status: 404 });
    }

    // Get bonuses for this casino
    const bonusIds = casino.bonuses.map(bonus => bonus.id);

    // Get the last 7 days of data - standardize the date calculation
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of day to be consistent

    // Get daily usage for the last 7 days - using correct action types
    const dailyUsage = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "OfferTracking"
      WHERE "casinoId" = ${casino.id}
        AND "createdAt" >= ${sevenDaysAgo}
        AND ("actionType" = 'code_copy' OR "actionType" = 'offer_click')
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Array<{ date: Date; count: bigint }>;

    // Get total stats for this casino - using correct action types
    const totalBonusClaims = await prisma.offerTracking.count({
      where: {
        casinoId: casino.id,
        actionType: 'code_copy'
      }
    });

    const totalOfferClicks = await prisma.offerTracking.count({
      where: {
        casinoId: casino.id,
        actionType: 'offer_click'
      }
    });

    // Get total combined actions (all time) - for comparison with weekly
    const totalCombinedActions = await prisma.offerTracking.count({
      where: {
        casinoId: casino.id,
        OR: [
          { actionType: 'code_copy' },
          { actionType: 'offer_click' }
        ]
      }
    });

    // Get recent activity (last 10 events) - using correct action types
    const recentActivity = await prisma.offerTracking.findMany({
      where: {
        casinoId: casino.id,
        OR: [
          { actionType: 'code_copy' },
          { actionType: 'offer_click' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get bonus details for recent activity
    const bonusDetails = await Promise.all(
      recentActivity.map(async (activity) => {
        if (activity.bonusId) {
          const bonus = await prisma.bonus.findUnique({
            where: { id: activity.bonusId },
            select: { title: true, code: true }
          });
          return bonus;
        }
        return null;
      })
    );

    // Create complete 7-day dataset with zeros for missing days
    const chartData: ChartDataPoint[] = [];
    let weeklyTotalFromChart = 0; // Calculate weekly total from chart data
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = dailyUsage.find(
        item => item.date.toISOString().split('T')[0] === dateStr
      );
      
      const dayCount = existingData ? Number(existingData.count) : 0;
      weeklyTotalFromChart += dayCount; // Add to weekly total
      
      chartData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayCount
      });
    }

    // Calculate weekly leaderboard position using the same date calculation
    const weeklyLeaderboard = await prisma.$queryRaw`
      SELECT 
        "casinoId",
        COUNT(*) as weekly_claims
      FROM "OfferTracking"
      WHERE "createdAt" >= ${sevenDaysAgo}
        AND ("actionType" = 'code_copy' OR "actionType" = 'offer_click')
      GROUP BY "casinoId"
      ORDER BY weekly_claims DESC
    ` as Array<{ casinoId: string; weekly_claims: bigint }>;

    // Find this casino's position in the leaderboard
    const leaderboardPosition = weeklyLeaderboard.findIndex(
      (entry) => entry.casinoId === casino.id
    ) + 1; // +1 because findIndex is 0-based but position should be 1-based

    return NextResponse.json({
      casino: {
        id: casino.id,
        name: casino.name,
        slug: casino.slug
      },
      stats: {
        totalBonusClaims,
        totalOfferClicks,
        totalCombinedActions,
        weeklyTotal: weeklyTotalFromChart,
        weeklyLeaderboardPosition: leaderboardPosition || weeklyLeaderboard.length + 1
      },
      chartData,
      recentActivity: recentActivity.map((activity, index) => ({
        id: activity.id,
        type: activity.actionType === 'code_copy' ? 'Code Copy' : 'Offer Click',
        bonusTitle: bonusDetails[index]?.title || 'Unknown Bonus',
        bonusCode: bonusDetails[index]?.code,
        createdAt: activity.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching casino analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casino analytics' },
      { status: 500 }
    );
  }
} 