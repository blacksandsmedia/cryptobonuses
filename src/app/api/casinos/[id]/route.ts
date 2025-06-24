import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET, getJWTSecret } from "@/lib/auth-utils";

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
    let casinoRaw;
    
    // Check if the param looks like a CUID (starts with 'c' and has the right length)
    // If so, search by ID, otherwise search by slug
    const isCUID = /^c[a-z0-9]{24,}$/.test(params.id);
    
    if (isCUID) {
      // Search by ID
      casinoRaw = await prisma.$queryRaw`
        SELECT * FROM "Casino" WHERE id = ${params.id}
      ` as any[];
    } else {
      // Search by slug
      casinoRaw = await prisma.$queryRaw`
        SELECT * FROM "Casino" WHERE slug = ${params.id}
      ` as any[];
    }
    
    if (!casinoRaw || casinoRaw.length === 0) {
      return NextResponse.json({ error: "Casino not found" }, { status: 404 });
    }
    
    const casinoData = casinoRaw[0];
    
    // Get bonuses and reviews separately using the actual casino ID
    const bonuses = await prisma.bonus.findMany({
      where: { casinoId: casinoData.id }
    });
    
    const reviews = await prisma.review.findMany({
      where: { casinoId: casinoData.id }
    });
    
    const casino = {
      ...casinoData,
      bonuses,
      reviews
    };

    // Calculate the average rating from verified reviews
    const verifiedReviews = casino.reviews.filter(review => review.verified);
    let calculatedRating = 0;
    
    if (verifiedReviews.length > 0) {
      const totalRating = verifiedReviews.reduce((sum, review) => sum + review.rating, 0);
      calculatedRating = Math.round((totalRating / verifiedReviews.length) * 10) / 10;
    }
    
    // Return casino with the calculated rating and all content fields
    return NextResponse.json({
      casino: {
        ...casino,
        rating: calculatedRating,
        // Ensure key features are included
        keyFeatures: casino.keyFeatures || [],
        // Ensure custom table fields are included
        customTableFields: casino.customTableFields || [],
        // Ensure content fields are included
        aboutContent: casino.aboutContent || null,
        howToRedeemContent: casino.howToRedeemContent || null,
        bonusDetailsContent: casino.bonusDetailsContent || null,
        gameContent: casino.gameContent || null,
        termsContent: casino.termsContent || null,
        faqContent: casino.faqContent || null,
      }
    });
  } catch (error) {
    console.error("Error fetching casino:", error);
    return NextResponse.json({ error: "Failed to fetch casino" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // First try JWT token authentication
  let isAuthorized = false;
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (token) {
      const secret = getJWTSecret();
      const decoded = verify(token, secret) as DecodedToken;
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Updating casino with data:", data);
    
    // Get the existing casino to preserve the displayOrder
    const existingCasino = await prisma.casino.findUnique({
      where: { id: params.id },
      select: { displayOrder: true } as any
    });
    
    // Use the existing displayOrder value if available
    const displayOrder = existingCasino?.displayOrder ?? 0;
    
    // Update the casino with type assertion for safety
    const casino = await prisma.casino.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        featuredImage: data.featuredImage,
        description: data.description,
        affiliateLink: data.affiliateLink,
        website: data.website,
        foundedYear: data.foundedYear,
        codeTermLabel: data.codeTermLabel,
        wageringRequirement: data.wageringRequirement,
        minimumDeposit: data.minimumDeposit,
        screenshots: data.screenshots || [],
        displayOrder: displayOrder,
        // Add key features
        keyFeatures: data.keyFeatures || [],
        // Add custom table fields
        customTableFields: data.customTableFields || [],
        // Add content fields
        aboutContent: data.aboutContent,
        howToRedeemContent: data.howToRedeemContent,
        bonusDetailsContent: data.bonusDetailsContent,
        gameContent: data.gameContent,
        termsContent: data.termsContent,
        faqContent: data.faqContent,
      } as any,
    });

    // Also check for bonus data and update if provided
    if (data.bonusId && data.bonusTitle) {
      console.log("Updating bonus:", data.bonusId, "with types:", data.bonusTypes);
      await prisma.bonus.update({
        where: { id: data.bonusId },
        data: {
          title: data.bonusTitle,
          description: data.bonusDescription,
          code: data.bonusCode,
          types: data.bonusTypes || [],
          value: data.bonusValue,
        } as any
      });
    }
    
    return NextResponse.json(casino);
  } catch (error) {
    console.error("Error updating casino:", error);
    return NextResponse.json(
      { error: "Failed to update casino" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Try both authentication methods
  let isAuthorized = false;
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (token) {
      const secret = getJWTSecret();
      const decoded = verify(token, secret) as DecodedToken;
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
  
  // Return 401 if not authorized by either method
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First delete all related bonuses
    await prisma.bonus.deleteMany({
      where: { casinoId: params.id },
    });
    
    // Then delete all related reviews
    await prisma.review.deleteMany({
      where: { casinoId: params.id },
    });
    
    // Finally delete the casino
    await prisma.casino.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: "Casino deleted successfully" });
  } catch (error) {
    console.error("Error deleting casino:", error);
    return NextResponse.json(
      { error: "Failed to delete casino" },
      { status: 500 }
    );
  }
} 