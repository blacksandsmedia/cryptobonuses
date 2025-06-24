import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the last 7 days of data
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get weekly leaderboard with casino details
    const weeklyLeaderboard = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.logo,
        c.description,
        COUNT(ot.*) as weekly_claims
      FROM "Casino" c
      LEFT JOIN "OfferTracking" ot ON c.id = ot."casinoId" 
        AND ot."createdAt" >= ${sevenDaysAgo}
        AND (ot."actionType" = 'code_copy' OR ot."actionType" = 'offer_click')
      GROUP BY c.id, c.name, c.slug, c.logo, c.description
      ORDER BY weekly_claims DESC, c.name ASC
      LIMIT 10
    ` as Array<{
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      description: string | null;
      weekly_claims: bigint;
    }>;

    // Get bonus information for each casino
    const casinoIds = weeklyLeaderboard.map(casino => casino.id);
    const bonuses = await prisma.bonus.findMany({
      where: {
        casinoId: { in: casinoIds }
      },
      select: {
        id: true,
        title: true,
        code: true,
        casinoId: true
      }
    });

    // Group bonuses by casino ID
    const bonusesByCasino = bonuses.reduce((acc, bonus) => {
      if (!acc[bonus.casinoId]) {
        acc[bonus.casinoId] = [];
      }
      acc[bonus.casinoId].push(bonus);
      return acc;
    }, {} as Record<string, typeof bonuses>);

    // Transform data for frontend
    const popularCasinos = weeklyLeaderboard.map((casino, index) => {
      const firstBonus = bonusesByCasino[casino.id]?.[0];
      
      return {
        id: casino.id,
        name: casino.name,
        slug: casino.slug,
        logo: casino.logo,
        description: casino.description,
        weeklyClaims: Number(casino.weekly_claims),
        rank: index + 1,
        bonus: firstBonus ? {
          id: firstBonus.id,
          title: firstBonus.title,
          code: firstBonus.code
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: popularCasinos
    });

  } catch (error) {
    console.error('Error fetching weekly popular casinos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch weekly popular casinos' 
      },
      { status: 500 }
    );
  }
} 