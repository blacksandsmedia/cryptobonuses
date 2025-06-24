import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function DELETE(request: Request) {
  try {
    // First, try to authenticate with JWT token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    // Also try NextAuth session as a fallback
    const session = await getServerSession(authOptions);
    
    let isAuthorized = false;
    
    // Check JWT token authentication
    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
        }
      } catch (error) {
        console.error("JWT verification error:", error);
      }
    }
    
    // If not authorized via JWT, check NextAuth session
    if (!isAuthorized && session?.user?.role === "ADMIN") {
      isAuthorized = true;
    }
    
    // If not authorized by either method, return 401
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process the bulk delete request
    const data = await request.json();
    const { ids } = data;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No valid casino IDs provided" },
        { status: 400 }
      );
    }

    // Transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // First delete all related bonuses
      await tx.bonus.deleteMany({
        where: { casinoId: { in: ids } },
      });
      
      // Then delete all related reviews
      await tx.review.deleteMany({
        where: { casinoId: { in: ids } },
      });
      
      // Finally delete the casinos
      await tx.casino.deleteMany({
        where: { id: { in: ids } },
      });
    });
    
    return NextResponse.json({ 
      message: `Successfully deleted ${ids.length} casinos` 
    });
  } catch (error) {
    console.error("Error bulk deleting casinos:", error);
    return NextResponse.json(
      { error: "Failed to delete casinos" },
      { status: 500 }
    );
  }
} 