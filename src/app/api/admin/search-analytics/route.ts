import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    // Verify admin token using the same utility as other admin routes
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get timeframe parameter
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';

    // Calculate date range based on timeframe
    let startDate: Date;
    const now = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date('2000-01-01'); // Very old date to get all records
        break;
    }

    // Get total searches count
    const totalSearches = await prisma.offerTracking.count({
      where: {
        actionType: 'search',
        createdAt: {
          gte: startDate
        }
      }
    });

    // Get unique search terms count
    const uniqueTermsResult = await prisma.$queryRaw<[{ count: BigInt }]>`
      SELECT COUNT(DISTINCT "searchTerm") as count
      FROM "OfferTracking"
      WHERE "actionType" = 'search'
      AND "searchTerm" IS NOT NULL
      AND "createdAt" >= ${startDate}
    `;
    const uniqueTerms = Number(uniqueTermsResult[0]?.count || 0);

    // Get top search terms with counts
    const topSearchesResult = await prisma.$queryRaw<Array<{ searchterm: string; count: BigInt }>>`
      SELECT "searchTerm" as searchterm, COUNT(*) as count
      FROM "OfferTracking"
      WHERE "actionType" = 'search'
      AND "searchTerm" IS NOT NULL
      AND "createdAt" >= ${startDate}
      GROUP BY "searchTerm"
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `;

    const topSearches = topSearchesResult.map(item => ({
      term: item.searchterm,
      count: Number(item.count)
    }));

    // Get recent searches (last 50)
    const recentSearches = await prisma.offerTracking.findMany({
      where: {
        actionType: 'search',
        searchTerm: {
          not: null
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        searchTerm: true,
        createdAt: true,
        path: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    const response = {
      totalSearches,
      uniqueTerms,
      topSearches,
      recentSearches: recentSearches.map(search => ({
        id: search.id,
        searchTerm: search.searchTerm || '',
        createdAt: search.createdAt.toISOString(),
        path: search.path || ''
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching search analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch search analytics" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all search tracking records
    const deleteResult = await prisma.offerTracking.deleteMany({
      where: {
        actionType: 'search'
      }
    });

    return NextResponse.json({ 
      success: true,
      deletedCount: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} search records`
    });
  } catch (error) {
    console.error('Error deleting search data:', error);
    return NextResponse.json(
      { error: 'Failed to delete search data' },
      { status: 500 }
    );
  }
} 