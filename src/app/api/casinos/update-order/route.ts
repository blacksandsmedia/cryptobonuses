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

export async function PUT(request: Request) {
  try {
    // Get authentication details
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    const session = await getServerSession(authOptions);
    
    console.log("Auth debug:", { 
      hasToken: !!token, 
      tokenLength: token?.length,
      hasSession: !!session,
      sessionEmail: session?.user?.email,
      sessionRole: session?.user?.role
    });
    
    let isAuthorized = false;
    let authMethod = '';
    
    // Check JWT token
    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        console.log("JWT token verification successful:", { 
          email: decoded.email, 
          role: decoded.role 
        });
        
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          authMethod = 'JWT token';
        }
      } catch (error) {
        console.error("JWT verification error:", error);
      }
    } else {
      console.log("No admin-token cookie found");
    }
    
    // Check NextAuth session as fallback
    if (!isAuthorized && session?.user) {
      console.log("Checking NextAuth session:", session.user);
      if (session.user.role === "ADMIN") {
        isAuthorized = true;
        authMethod = 'NextAuth session';
      }
    }
    
    if (!isAuthorized) {
      console.log("Authorization failed - user is not an admin");
      return NextResponse.json(
        { error: "Unauthorized - Admin privileges required" },
        { status: 401 }
      );
    }
    
    console.log(`User authorized via ${authMethod}`);
    
    // Get the list of casino IDs in the new order
    const data = await request.json();
    const { orderedIds } = data;
    
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected array of IDs." },
        { status: 400 }
      );
    }
    
    console.log(`Updating order for ${orderedIds.length} casinos:`, orderedIds);
    
    try {
      // Update the display order for each casino
      // Use a transaction to ensure all updates succeed or none do
      await prisma.$transaction(
        orderedIds.map((id, index) => 
          prisma.casino.update({
            where: { id },
            data: { displayOrder: index } as any
          })
        )
      );
      
      console.log("Casino order updated successfully");
      return NextResponse.json({ success: true, message: "Casino order updated successfully" });
    } catch (prismaError) {
      console.error("Prisma error updating casino order:", prismaError);
      return NextResponse.json(
        { error: "Database error updating casino order", details: String(prismaError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating casino order:", error);
    return NextResponse.json(
      { error: "Failed to update casino order", details: String(error) },
      { status: 500 }
    );
  }
} 