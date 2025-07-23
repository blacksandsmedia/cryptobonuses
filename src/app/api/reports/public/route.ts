import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const casinoId = searchParams.get('casinoId');

    if (!casinoId) {
      return NextResponse.json(
        { error: "Casino ID is required" },
        { status: 400 }
      );
    }

    // Only fetch reports that are verified (don't show pending reports)
    const reports = await prisma.casinoReport.findMany({
      where: {
        casinoId,
        status: 'VERIFIED' // Only show verified reports (approved by admin)
      },
      select: {
        id: true,
        reason: true,
        description: true,
        createdAt: true,
        // Don't include status, adminNotes, or reporterIp for privacy
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to recent 10 reports
    });

    return NextResponse.json({
      reports
    });

  } catch (error) {
    console.error("Error fetching public reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
} 