import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verify as verifyJWT } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    console.log(`DELETE request for report ID: ${params.reportId}`);
    
    // Try multiple authentication methods
    let isAuthorized = false;
    
    // First try JWT token authentication from cookies
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('admin-token')?.value;
      
      if (token) {
        const decoded = verifyJWT(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          console.log("Authorized via JWT token");
        }
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }
    
    // If not authorized via JWT, try NextAuth session
    if (!isAuthorized) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === "ADMIN") {
        isAuthorized = true;
        console.log("Authorized via NextAuth session");
      }
    }
    
    // If still not authorized, return 401
    if (!isAuthorized) {
      console.log("Authorization failed - no valid admin credentials found");
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }

    // Check that ID is provided
    if (!params.reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }
    
    // Delete the report
    const report = await prisma.casinoReport.delete({
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
    
    console.log(`Successfully deleted report: ${params.reportId}`);
    
    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
      report: {
        id: report.id,
        casinoName: report.casino.name,
        reason: report.reason
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
    
  } catch (error: any) {
    console.error(`Error deleting report ${params.reportId}:`, error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete report", details: error.message },
      { status: 500 }
    );
  }
} 