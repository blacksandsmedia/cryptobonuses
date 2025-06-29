import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
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

export async function GET() {
  try {
    const legalPages = await prisma.legalPage.findMany({
      orderBy: { slug: 'asc' }
    });
    
    return NextResponse.json(legalPages);
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      }
    }
    
    // If still not authorized, return 401
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug, title, content } = await request.json();
    
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content' },
        { status: 400 }
      );
    }
    
    // Upsert the legal page (create or update)
    const legalPage = await prisma.legalPage.upsert({
      where: { slug },
      update: { title, content },
      create: { slug, title, content }
    });
    
    return NextResponse.json(legalPage);
  } catch (error) {
    console.error('Error saving legal page:', error);
    return NextResponse.json(
      { error: 'Failed to save legal page' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
      }
    }
    
    // If still not authorized, return 401
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }
    
    // Check if page exists
    const existingPage = await prisma.legalPage.findUnique({
      where: { id: pageId }
    });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    // Delete the page
    await prisma.legalPage.delete({
      where: { id: pageId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
      deletedPage: {
        id: existingPage.id,
        title: existingPage.title,
        slug: existingPage.slug
      }
    });
  } catch (error) {
    console.error('Error deleting legal page:', error);
    return NextResponse.json(
      { error: 'Failed to delete legal page' },
      { status: 500 }
    );
  }
} 