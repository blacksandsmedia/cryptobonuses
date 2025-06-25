import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields based on action type
    if (!data.actionType) {
      return NextResponse.json(
        { error: "Missing actionType" },
        { status: 400 }
      );
    }

    // Validate action type and required fields for each type
    if (data.actionType === "code_copy" || data.actionType === "offer_click") {
      if (!data.casinoId || !data.bonusId) {
        return NextResponse.json(
          { error: "Missing required fields for offer tracking" },
          { status: 400 }
        );
      }
    } else if (data.actionType === "search") {
      if (!data.searchTerm) {
        return NextResponse.json(
          { error: "Missing searchTerm for search tracking" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    // Extract path from request headers for tracking source
    const path = request.headers.get('referer') || '';
    
    // Create tracking entry using raw SQL to avoid model casing issues
    const trackingId = `tr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Use UTC timestamp to ensure consistency
    if (data.actionType === "search") {
      // For search tracking, we don't need casinoId or bonusId
      await prisma.$executeRaw`
        INSERT INTO "OfferTracking" ("id", "actionType", "path", "searchTerm", "createdAt")
        VALUES (${trackingId}, ${data.actionType}, ${path}, ${data.searchTerm}, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      `;
    } else {
      // For offer tracking (code_copy, offer_click)
      await prisma.$executeRaw`
        INSERT INTO "OfferTracking" ("id", "casinoId", "bonusId", "actionType", "path", "createdAt")
        VALUES (${trackingId}, ${data.casinoId}, ${data.bonusId}, ${data.actionType}, ${path}, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      `;
      
      // Broadcast real-time notification for bonus claims
      try {
        const casino = await prisma.casino.findUnique({
          where: { id: data.casinoId },
          select: { name: true, slug: true, logo: true }
        });
        
        const bonus = await prisma.bonus.findUnique({
          where: { id: data.bonusId },
          select: { title: true, code: true }
        });
        
        if (casino && bonus) {
          broadcastNotification({
            id: trackingId,
            casinoName: casino.name,
            casinoLogo: casino.logo || '/images/CryptoBonuses Logo.png',
            casinoSlug: casino.slug,
            bonusTitle: bonus.title,
            bonusCode: bonus.code || undefined,
            createdAt: new Date().toISOString()
          });
          
          console.log(`[Tracking] Broadcasted real-time notification for ${casino.name} - ${bonus.title}`);
        }
      } catch (error) {
        console.error('[Tracking] Error broadcasting notification:', error);
        // Don't fail the tracking if notification fails
      }
    }

    let responseData: any = { 
      success: true,
      tracking: {
        actionType: data.actionType,
        path
      }
    };

    // Add specific response data for offer tracking
    if (data.actionType === "code_copy" || data.actionType === "offer_click") {
      // Calculate start of today (midnight) in UTC
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const countResult = await prisma.$queryRaw<[{ count: BigInt }]>`
        SELECT COUNT(*) as count 
        FROM "OfferTracking" 
        WHERE "bonusId" = ${data.bonusId} 
        AND "createdAt" >= ${startOfToday}
      `;
      
      const count = Number(countResult[0]?.count || 0);

      responseData = {
        ...responseData,
        tracking: {
          ...responseData.tracking,
          casinoId: data.casinoId,
          bonusId: data.bonusId,
        },
        usageCount: count
      };
    } else if (data.actionType === "search") {
      responseData.tracking.searchTerm = data.searchTerm;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error tracking action:", error);
    return NextResponse.json(
      { error: "Failed to track action" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bonusId = searchParams.get('bonusId');

    if (!bonusId) {
      return NextResponse.json(
        { error: "Missing bonusId parameter" },
        { status: 400 }
      );
    }

    // Calculate start of today (midnight) in UTC
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Count tracking entries for this bonus since start of today using raw SQL
    const countResult = await prisma.$queryRaw<[{ count: BigInt }]>`
      SELECT COUNT(*) as count 
      FROM "OfferTracking" 
      WHERE "bonusId" = ${bonusId} 
      AND "createdAt" >= ${startOfToday}
    `;
    
    // Get the most recent usage timestamp (exclude future entries due to timezone issues)
    const lastUsedResult = await prisma.$queryRaw<[{ createdAt: Date } | null]>`
      SELECT "createdAt"
      FROM "OfferTracking" 
      WHERE "bonusId" = ${bonusId}
      AND "createdAt" <= NOW()
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    
    const count = Number(countResult[0]?.count || 0);
    const lastUsed = lastUsedResult[0]?.createdAt || null;

    return NextResponse.json({ 
      usageCount: count,
      lastUsed: lastUsed ? lastUsed.toISOString() : null
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
} 