import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
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
    console.log("Bulk DELETE request for reviews");
    
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
      return NextResponse.json({ error: "Invalid or empty review IDs array" }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      });
    }
    
    console.log(`Bulk deleting ${ids.length} reviews:`, ids);
    
    // Delete multiple reviews
    const deleteResult = await prisma.review.deleteMany({
      where: { 
        id: { 
          in: ids 
        } 
      }
    });
    
    console.log(`Successfully deleted ${deleteResult.count} reviews via bulk delete`);

    return NextResponse.json({ 
      message: `Successfully deleted ${deleteResult.count} reviews`,
      deletedCount: deleteResult.count 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Vary': 'Authorization, Cookie'
      }
    });
  } catch (error: any) {
    console.error("Error in bulk delete reviews:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete reviews", 
        details: error.message,
        code: error.code
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