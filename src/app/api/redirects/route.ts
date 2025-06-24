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

export async function POST(request: NextRequest) {
  // Check admin authentication
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oldSlug, newSlug, entityType = 'casino' } = await request.json();

    if (!oldSlug || !newSlug) {
      return NextResponse.json(
        { error: 'oldSlug and newSlug are required' },
        { status: 400 }
      );
    }

    // Don't create redirect if old and new slugs are the same
    if (oldSlug === newSlug) {
      return NextResponse.json({ message: 'No redirect needed, slugs are the same' });
    }

    // Check if a redirect already exists for this old slug
    const existingRedirect = await prisma.slugRedirect.findUnique({
      where: { oldSlug }
    });

    if (existingRedirect) {
      // Update existing redirect
      const updatedRedirect = await prisma.slugRedirect.update({
        where: { oldSlug },
        data: { newSlug, entityType }
      });
      return NextResponse.json({ redirect: updatedRedirect, updated: true });
    } else {
      // Create new redirect
      const newRedirect = await prisma.slugRedirect.create({
        data: {
          oldSlug,
          newSlug,
          entityType
        }
      });
      return NextResponse.json({ redirect: newRedirect, created: true });
    }
  } catch (error) {
    console.error('Error creating slug redirect:', error);
    return NextResponse.json(
      { error: 'Failed to create slug redirect' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const redirects = await prisma.slugRedirect.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('Error fetching slug redirects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slug redirects' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check admin authentication
  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const oldSlug = searchParams.get('oldSlug');

    if (!oldSlug) {
      return NextResponse.json(
        { error: 'oldSlug parameter is required' },
        { status: 400 }
      );
    }

    await prisma.slugRedirect.delete({
      where: { oldSlug }
    });

    return NextResponse.json({ message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('Error deleting slug redirect:', error);
    return NextResponse.json(
      { error: 'Failed to delete slug redirect' },
      { status: 500 }
    );
  }
} 