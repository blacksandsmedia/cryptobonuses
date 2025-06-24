import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using the same pattern as other admin APIs
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

    // Return 401 if not authorized
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const casinoId = params.id;
    const body = await request.json();

    const {
      aboutContent,
      howToRedeemContent,
      bonusDetailsContent,
      gameContent,
      termsContent,
      faqContent,
    } = body;

    // Update casino content
    const updatedCasino = await prisma.casino.update({
      where: { id: casinoId },
      data: {
        aboutContent: aboutContent || null,
        howToRedeemContent: howToRedeemContent || null,
        bonusDetailsContent: bonusDetailsContent || null,
        gameContent: gameContent || null,
        termsContent: termsContent || null,
        faqContent: faqContent || null,
      } as any,
    });

    return NextResponse.json({
      success: true,
      casino: updatedCasino,
    });
  } catch (error) {
    console.error('Error updating casino content:', error);
    return NextResponse.json(
      { error: 'Failed to update casino content' },
      { status: 500 }
    );
  }
} 