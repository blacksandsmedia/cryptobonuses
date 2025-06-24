import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({ error: "Prisma client not available" }, { status: 500 });
    }
    
    // Test database connection with a simple query
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database connection test:", testConnection);
    
    // Try to get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Database tables:", tables);
    
    // Try to get all reviews using raw query
    const reviews = await prisma.$queryRaw`
      SELECT r.*, c.name as casino_name, c.slug as casino_slug 
      FROM "Review" r
      JOIN "Casino" c ON r."casinoId" = c.id
    `;
    console.log("Reviews from raw query:", reviews);
    
    // Try to use the model directly
    let modelReviews = [];
    try {
      modelReviews = await prisma.review.findMany({
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
      console.log("Reviews from model query:", modelReviews);
    } catch (modelError) {
      console.error("Error querying with model:", modelError);
    }
    
    return NextResponse.json({
      status: "Database connection successful",
      prismaAvailable: !!prisma,
      tables,
      rawReviews: reviews,
      modelReviews
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: "Debug query failed",
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 