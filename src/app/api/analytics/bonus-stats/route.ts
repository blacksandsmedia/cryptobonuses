import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bonusId = searchParams.get('bonusId');
    const casinoId = searchParams.get('casinoId');

    if (!bonusId && !casinoId) {
      return NextResponse.json(
        { error: 'Either bonusId or casinoId is required' },
        { status: 400 }
      );
    }

    // Get current date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build where clause based on provided parameters
    const whereClause: any = {
      actionType: 'COPY_CODE'
    };

    if (bonusId) {
      whereClause.bonusId = bonusId;
    } else if (casinoId) {
      whereClause.casinoId = casinoId;
    }

    // Get times claimed today
    const timesClaimedToday = await prisma.offerTracking.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: todayStart
        }
      }
    });

    // Get times claimed this week
    const timesClaimedWeekly = await prisma.offerTracking.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: weekStart
        }
      }
    });

    // Get total times claimed
    const timesClaimedTotal = await prisma.offerTracking.count({
      where: whereClause
    });

    // Get last claimed timestamp
    const lastClaimedRecord = await prisma.offerTracking.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    const lastClaimed = lastClaimedRecord 
      ? lastClaimedRecord.createdAt.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Never';

    return NextResponse.json({
      timesClaimedToday,
      timesClaimedWeekly,
      timesClaimedTotal,
      lastClaimed
    });

  } catch (error) {
    console.error('Error fetching bonus stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonus stats' },
      { status: 500 }
    );
  }
} 