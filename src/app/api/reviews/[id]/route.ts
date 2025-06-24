import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Review } from "@prisma/client";
import { verify as verifyJWT } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth-middleware";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check that ID is provided
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }
    
    // Fetch the review
    let review;
    
    try {
      // First try with model approach
      review = await prisma.review.findUnique({
        where: { id: params.id },
        include: {
          casino: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });
    } catch (modelError) {
      console.error("Error using model API:", modelError);
      
      // Fallback to raw query
      const reviews = await prisma.$queryRaw`
        SELECT r.*, c.name as casino_name, c.slug as casino_slug, c.id as casino_id
        FROM "Review" r
        JOIN "Casino" c ON r."casinoId" = c.id
        WHERE r.id = ${params.id}
      `;
      
      if (reviews && Array.isArray(reviews) && reviews.length > 0) {
        const rawReview = reviews[0];
        review = {
          ...rawReview,
          casino: {
            id: rawReview.casino_id,
            name: rawReview.casino_name,
            slug: rawReview.casino_slug
          }
        };
      }
    }

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }

    return NextResponse.json(review, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error: any) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review", details: error.message },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check that ID is provided
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.author || !data.content || !data.rating || !data.casinoId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the review
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        author: data.author,
        content: data.content,
        rating: typeof data.rating === 'string' ? parseFloat(data.rating) : data.rating,
        casinoId: data.casinoId,
      },
    });
    
    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE request for review ID: ${params.id}`);
    
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
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }
    
    // Delete the review
    const review = await prisma.review.delete({
      where: { id: params.id }
    });
    
    console.log(`Successfully deleted review: ${params.id}`);

    return NextResponse.json({ message: "Review deleted successfully" }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Vary': 'Authorization, Cookie'
      }
    });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete review", 
        details: error.message,
        code: error.code
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  }
} 