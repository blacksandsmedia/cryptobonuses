import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { casinoId, reason, description } = body;

    // Validate required fields
    if (!casinoId || !reason) {
      return NextResponse.json(
        { error: "Casino ID and reason are required" },
        { status: 400 }
      );
    }

    // Get IP address from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const reporterIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Check if casino exists
    const casino = await prisma.casino.findUnique({
      where: { id: casinoId }
    });

    if (!casino) {
      return NextResponse.json(
        { error: "Casino not found" },
        { status: 404 }
      );
    }

    // Check if this IP has already reported this casino
    const existingReport = await prisma.casinoReport.findUnique({
      where: {
        casinoId_reporterIp: {
          casinoId,
          reporterIp
        }
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this casino" },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.casinoReport.create({
      data: {
        casinoId,
        reason,
        description: description || null,
        reporterIp,
      },
      include: {
        casino: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
      reportId: report.id
    });

  } catch (error) {
    console.error("Error creating casino report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const casinoId = searchParams.get('casinoId');

    if (casinoId) {
      // Get report count for specific casino
      const reportCount = await prisma.casinoReport.count({
        where: { casinoId }
      });

      return NextResponse.json({ reportCount });
    }

    // Get all reports with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.casinoReport.findMany({
        where,
        include: {
          casino: {
            select: {
              name: true,
              slug: true,
              logo: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.casinoReport.count({ where })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
} 