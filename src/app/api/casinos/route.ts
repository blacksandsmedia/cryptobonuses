import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Role, BonusType } from "@prisma/client";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";
import { normalizeImagePath } from "@/lib/image-utils";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Define a simplified Casino interface for our transformation function
interface SimplifiedCasino {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  rating: number;
  displayOrder?: number;
  foundedYear?: number | null;
  createdAt: Date;
  updatedAt: Date;
  affiliateLink: string | null;
  website?: string | null;
  wageringRequirement?: string | null;
  minimumDeposit?: string | null;
  codeTermLabel?: string | null;
  screenshots?: string[] | null;
  bonuses: {
    id: string;
    title: string;
    description: string;
    code: string | null;
    types: BonusType[];
    value: string;
    casinoId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

// Transform casino data for UI presentation
function transformCasinoDataForUI(casino: any) {
  if (!casino) {
    console.log("Warning: Received null or undefined casino object");
    return {
      id: "invalid-id",
      casinoName: "Unknown Casino",
      bonusType: "welcome",
      bonusTypes: ["welcome"],
      bonusValue: 0,
      bonusText: "No bonus available",
      logoUrl: "/images/Simplified Logo.png",
      promoCode: null,
      affiliateLink: "#",
      isActive: true,
      displayOrder: 0
    };
  }
  
  console.log(`Transforming casino data for UI, casino ID: ${casino.id}`);
  
  // Clean up fields
  const displayName = casino.name || 'Unknown Casino';
  
  // IMPORTANT: Preserve existing logo paths as uploaded in backend
  // Only fix clearly broken paths (containing 'public/images/')
  let logoPath = casino.logo;
  
  // Only normalize if the path is clearly broken (contains 'public/images/')
  // This ensures manually uploaded logos in backend stay exactly as they are
  if (!logoPath || logoPath.includes('public/images/')) {
    logoPath = normalizeImagePath(logoPath || `${displayName} Logo.png`);
  }
  
  // Get the first bonus (if any)
  const firstBonus = casino.bonuses && Array.isArray(casino.bonuses) && casino.bonuses.length > 0 
    ? casino.bonuses[0] 
    : null;
  
  // Get all bonus types from the first bonus
  const bonusTypes = firstBonus?.types?.length > 0 
    ? firstBonus.types.map((type: string) => type.toLowerCase()) 
    : ['welcome'];
  
  return {
    id: casino.id,
    casinoName: displayName,
    name: displayName,
    slug: casino.slug || `casino-${casino.id}`,
    logo: logoPath,
    description: casino.description || "",
    rating: typeof casino.rating === 'number' ? casino.rating : 0,
    displayOrder: typeof casino.displayOrder === 'number' ? casino.displayOrder : 0,
    foundedYear: casino.foundedYear || null,
    bonusType: bonusTypes[0], // Keep for backward compatibility
    bonusTypes: bonusTypes, // New field with all types
    bonusValue: parseFloat(firstBonus?.value || '0') || 0,
    bonusText: firstBonus?.title || 'No bonus available',
    logoUrl: logoPath,
    promoCode: firstBonus?.code || null,
    affiliateLink: casino.affiliateLink || '',
    isActive: true,
    // Add casino and bonus IDs for tracking
    casinoId: casino.id,
    bonusId: firstBonus?.id,
    // Include original bonuses array if available
    bonuses: Array.isArray(casino.bonuses) ? casino.bonuses : [],
    // Add additional casino metadata
    website: casino.website || null,
    wageringRequirement: casino.wageringRequirement || null,
    minimumDeposit: casino.minimumDeposit || null,
    codeTermLabel: casino.codeTermLabel || 'bonus code',
    createdAt: casino.createdAt,
    updatedAt: casino.updatedAt
  };
}

export async function GET(request: Request) {
  try {
    console.log("GET /api/casinos");
    // Parse query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    // Add cache control headers to prevent caching
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    if (slug) {
      // Get a specific casino by slug
      console.log(`Fetching specific casino with slug: ${slug}`);
      const casino = await prisma.casino.findFirst({
        where: { slug: slug },
        include: { bonuses: true }
      });
      
      if (!casino) {
        return NextResponse.json({ error: "Casino not found" }, { status: 404, headers });
      }
      
      return NextResponse.json(transformCasinoDataForUI(casino), { headers });
    }
    
    // Get all casinos, sorted by displayOrder
    console.log("Fetching all casinos");
    const casinos = await prisma.casino.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      include: { bonuses: true }
    });
    
    console.log(`Found ${casinos.length} casinos`);
    
    // Transform the database data into the format expected by the UI
    const transformedCasinos = casinos.map(casino => transformCasinoDataForUI(casino));
    
    // Debug log the first item
    if (transformedCasinos.length > 0) {
      console.log("First transformed casino:", JSON.stringify(transformedCasinos[0]).substring(0, 200) + "...");
    }
    
    return NextResponse.json(transformedCasinos, { headers });
  } catch (error) {
    console.error("Error in GET /api/casinos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // First try JWT token authentication
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Find the highest display order value and add 1
    // Only if displayOrder is not explicitly provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const highestOrderCasino = await prisma.casino.findFirst({
        orderBy: {
          displayOrder: 'desc'
        }
      });
      
      displayOrder = highestOrderCasino ? highestOrderCasino.displayOrder + 1 : 0;
    } else {
      // Make sure provided displayOrder is a number
      displayOrder = typeof displayOrder === 'number' ? 
        displayOrder : (parseInt(displayOrder) || 0);
    }
    
    // Create the new casino using Prisma's create method
    const casino = await prisma.casino.create({
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        featuredImage: data.featuredImage || null,
        description: data.description,
        rating: data.rating || 0,
        affiliateLink: data.affiliateLink || null,
        website: data.website || null,
        foundedYear: data.foundedYear || null,
        wageringRequirement: data.wageringRequirement || null,
        minimumDeposit: data.minimumDeposit || null,
        screenshots: data.screenshots || [],
        displayOrder: displayOrder,
        // Add key features
        keyFeatures: data.keyFeatures || [],
        // Add custom table fields
        customTableFields: data.customTableFields || [],
        // Add content fields
        aboutContent: data.aboutContent || null,
        howToRedeemContent: data.howToRedeemContent || null,
        bonusDetailsContent: data.bonusDetailsContent || null,
        gameContent: data.gameContent || null,
        termsContent: data.termsContent || null,
        faqContent: data.faqContent || null,
      }
    });
    
    // Create bonus if bonus data is provided
    if (data.bonusTitle) {
      console.log("Creating bonus for new casino:", casino.id, "with types:", data.bonusTypes);
      await prisma.bonus.create({
        data: {
          title: data.bonusTitle,
          description: data.bonusDescription,
          code: data.bonusCode,
          types: data.bonusTypes || ["WELCOME"],
          value: data.bonusValue,
          casinoId: casino.id,
        } as any
      });
    }
    
    return NextResponse.json(casino);
  } catch (error) {
    console.error("Error creating casino:", error);
    return NextResponse.json(
      { error: "Failed to create casino" },
      { status: 500 }
    );
  }
} 