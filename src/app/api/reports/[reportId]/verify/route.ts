import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-middleware";

export async function PUT(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    // Check admin authentication
    const token = await verifyAdminToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check that ID is provided
    if (!params.reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    // Find the report to verify it exists
    const existingReport = await prisma.casinoReport.findUnique({
      where: { id: params.reportId },
      include: {
        casino: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if report is already verified
    if (existingReport.status === 'VERIFIED') {
      return NextResponse.json({ error: "Report is already verified" }, { status: 400 });
    }

    // Update the report to mark it as verified
    const updatedReport = await prisma.casinoReport.update({
      where: { id: params.reportId },
      data: { status: 'VERIFIED' },
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
      message: "Report verified successfully",
      report: updatedReport,
    });
  } catch (error: any) {
    console.error("Error verifying report:", error);
    return NextResponse.json(
      { error: "Failed to verify report", details: error.message },
      { status: 500 }
    );
  }
} 