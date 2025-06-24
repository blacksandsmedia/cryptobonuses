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

export const maxDuration = 60; // Allow the function to run for 60 seconds

export async function GET(request: Request) {
  try {
    console.log("Fetching reviews API route called");

    // Parse the request URL to get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
    const skip = (page - 1) * pageSize;
    const limit = Math.min(pageSize, 100); // Don't allow more than 100 items per page
    
    console.log(`Pagination: page=${page}, pageSize=${limit}, skip=${skip}`);

    // Use a try-catch specifically for the database query
    try {
      const reviews = await prisma.review.findMany({
        take: limit,
        skip: skip,
        include: {
          casino: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Count total records for pagination metadata
      const total = await prisma.review.count();
      
      console.log(`Successfully fetched ${reviews.length} reviews (total: ${total})`);
      
      // Return the reviews with pagination metadata
      const responseObject = {
        data: reviews,
        pagination: {
          page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
      
      return new NextResponse(JSON.stringify(responseObject), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Vary': 'Authorization, Cookie'
        }
      });
    } catch (dbError) {
      console.error("Database error fetching reviews:", dbError);
      return new NextResponse(JSON.stringify({ error: "Database error", details: String(dbError) }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }
  } catch (error: any) {
    console.error("Error in reviews GET handler:", error);
    return new NextResponse(JSON.stringify({ error: "Server error", details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    console.log("Creating new review:", data);
    
    // Validate required fields
    if (!data.author || !data.content || !data.rating || !data.casinoId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        author: data.author,
        content: data.content,
        rating: typeof data.rating === 'string' ? parseFloat(data.rating) : data.rating,
        casinoId: data.casinoId,
      },
    });
    
    console.log("Review created successfully:", review);
    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review", details: error.message },
      { status: 500 }
    );
  }
} 