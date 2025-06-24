import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET, getJWTSecret } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Helper function to ensure the uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
    return uploadsDir;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw error;
  }
}

// Helper function to create SEO-friendly filename
function createSEOFilename(originalName: string, context?: string, type?: string): string {
  // Get file extension
  const fileExt = originalName.split('.').pop() || '';
  
  if (context && type === 'featured') {
    // Create descriptive filename for featured images: "[casino-name]-bonus-offer"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-bonus-offer-${timestamp}.${fileExt}`;
  }
  
  if (context && type === 'logo') {
    // Create descriptive filename for logos: "[casino-name]-logo"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-logo-${timestamp}.${fileExt}`;
  }
  
  if (context && type === 'screenshot') {
    // Create descriptive filename for screenshots: "[casino-name]-screenshot"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-screenshot-${timestamp}.${fileExt}`;
  }
  
  // Fallback to UUID for other files
  return `${uuidv4()}.${fileExt}`;
}

export async function POST(request: Request) {
  console.log("=== UPLOAD API DEBUG ===");
  
  // First try JWT token authentication
  let isAuthorized = false;
  let authMethod = "none";
  
  // Check JWT token in cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    console.log("Admin token found:", !!token);
    
    if (token) {
      try {
        // Clean the token in case it has extra characters
        const cleanToken = token.trim();
        console.log("Attempting to verify token...");
        
        const secret = getJWTSecret();
        console.log("Using JWT secret (first 10 chars):", secret.substring(0, 10) + "...");
        
        const decoded = verify(cleanToken, secret) as DecodedToken;
        console.log("Token decoded successfully:", { id: decoded.id, email: decoded.email, role: decoded.role });
        
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          authMethod = "JWT";
          console.log("Authorization successful via JWT");
        } else {
          console.log("User role is not ADMIN:", decoded.role);
        }
      } catch (verifyError: any) {
        console.error("JWT verification error:", verifyError?.message || verifyError);
      }
    } else {
      console.log("No admin token found in cookies");
    }
  } catch (error) {
    console.error("JWT authentication error:", error);
  }
  
  // Also try NextAuth session as fallback
  if (!isAuthorized) {
    try {
      const session = await getServerSession(authOptions);
      console.log("NextAuth session:", !!session);
      console.log("Session user role:", session?.user?.role);
      
      if (session?.user?.role === "ADMIN") {
        isAuthorized = true;
        authMethod = "NextAuth";
        console.log("Authorization successful via NextAuth");
      }
    } catch (sessionError) {
      console.error("NextAuth session error:", sessionError);
    }
  }

  console.log("Final authorization status:", isAuthorized, "via", authMethod);

  // Return 401 if not authorized
  if (!isAuthorized) {
    console.log("Upload request denied - unauthorized");
    return NextResponse.json({ 
      error: "Unauthorized", 
      debug: {
        hasToken: !!cookies().get('admin-token')?.value,
        authMethod: authMethod,
        timestamp: new Date().toISOString()
      }
    }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string; // Casino name or other context
    const type = formData.get('type') as string; // 'featured', 'logo', 'screenshot', etc.
    
    console.log("Upload request details:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      context: context,
      type: type
    });
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }, 
        { status: 400 }
      );
    }
    
    // Generate filename based on context and type
    const fileName = createSEOFilename(file.name, context, type);
    console.log("Generated filename:", fileName);
    
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();
    
    // Create file path
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file to disk
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer as any);
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileName}`;
    
    console.log("Upload successful:", fileUrl);
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true,
      fileName: fileName,
      debug: {
        authMethod: authMethod,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
} 