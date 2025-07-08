import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find the first casino and bonus - using specific field selection to avoid new fields
    const casinos = await prisma.casino.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        bonuses: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      },
      take: 1
    });

    if (casinos.length === 0 || casinos[0].bonuses.length === 0) {
      return NextResponse.json(
        { error: "No casinos or bonuses found" },
        { status: 404 }
      );
    }

    const casino = casinos[0];
    const bonus = casino.bonuses[0];
    const now = new Date();

    // Create a test tracking entry using raw SQL
    const trackingId = `tr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await prisma.$executeRaw`
      INSERT INTO "OfferTracking" ("id", "casinoId", "bonusId", "actionType", "createdAt")
      VALUES (${trackingId}, ${casino.id}, ${bonus.id}, ${'test'}, ${now})
    `;

    // Count entries for this bonus using raw SQL
    const countResult = await prisma.$queryRaw<[{ count: BigInt }]>`
      SELECT COUNT(*) as count 
      FROM "OfferTracking" 
      WHERE "bonusId" = ${bonus.id}
    `;
    
    const count = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      tracking: {
        id: trackingId,
        casinoId: casino.id,
        bonusId: bonus.id,
        actionType: "test",
        createdAt: now
      },
      count,
      message: "Test tracking entry created successfully"
    });
  } catch (error) {
    console.error("Error creating test tracking:", error);
    return NextResponse.json(
      { error: "Failed to create test tracking entry" },
      { status: 500 }
    );
  }
} 