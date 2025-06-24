import { NextResponse } from "next/server";
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

export async function DELETE(request: Request) {
  try {
    console.log("Bulk DELETE request for reports");
    
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
          console.log("Authorized via JWT token for bulk delete");
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
        console.log("Authorized via NextAuth session for bulk delete");
      }
    }
    
    // If still not authorized, return 401
    if (!isAuthorized) {
      console.log("Authorization failed for bulk delete - no valid admin credentials found");
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      });
    }

    // Parse request body
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty report IDs array" }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      });
    }
    
    console.log(`Bulk deleting ${ids.length} reports:`, ids);
    
    // Delete multiple reports
    const deleteResult = await prisma.casinoReport.deleteMany({
      where: { 
        id: { 
          in: ids 
        } 
      }
    });
    
    console.log(`Successfully deleted ${deleteResult.count} reports`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} report${deleteResult.count !== 1 ? 's' : ''}`,
      deletedCount: deleteResult.count
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
    
  } catch (error: any) {
    console.error("Error in bulk delete reports:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete reports",
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      }
    );
  }
} 