import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-middleware";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const token = await verifyAdminToken();
    if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    // Check that ID is provided
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    // Find the review to verify it exists
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update the review to mark it as verified
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: { verified: true },
    });
    
    // Update the casino's average rating based on verified reviews
    const casinoId = existingReview.casinoId;
    const verifiedReviews = await prisma.review.findMany({
      where: { 
        casinoId: casinoId,
        verified: true,
      },
    });
    
    // Calculate and update the casino's rating if there are verified reviews
    if (verifiedReviews.length > 0) {
      const totalRating = verifiedReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / verifiedReviews.length;
      
      await prisma.casino.update({
        where: { id: casinoId },
        data: { rating: averageRating },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Review verified successfully",
      review: updatedReview,
    });
  } catch (error: any) {
    console.error("Error verifying review:", error);
    return NextResponse.json(
      { error: "Failed to verify review", details: error.message },
      { status: 500 }
    );
  }
} 