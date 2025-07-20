import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { prisma } from '@/lib/prisma';
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

// Helper function to check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  let isAuthorized = false;
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (token) {
      const decoded = verify(token, JWT_SECRET) as DecodedToken;
      if (decoded.role === "ADMIN") {
        isAuthorized = true;
      }
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }
  
  // Also try NextAuth session as fallback
  if (!isAuthorized) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  return isAuthorized;
}

export async function PUT(request: NextRequest) {
  // Check admin authentication
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Casino IDs array is required' },
        { status: 400 }
      );
    }

    console.log(`Clearing content from ${ids.length} casinos:`, ids);

    // Clear all content fields for selected casinos
    const result = await prisma.casino.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        aboutContent: null,
        howToRedeemContent: null,
        bonusDetailsContent: null,
        gameContent: null,
        termsContent: null,
        faqContent: null
      }
    });

    console.log(`Successfully cleared content from ${result.count} casinos`);

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Content cleared from ${result.count} casinos`
    });
  } catch (error) {
    console.error('Error clearing casino content:', error);
    return NextResponse.json(
      { error: 'Failed to clear casino content' },
      { status: 500 }
    );
  }
} 