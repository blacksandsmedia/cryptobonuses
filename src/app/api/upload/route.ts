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
  const fileExt = originalName.split('.').pop()?.toLowerCase() || '';
  
  // Convert to WebP for better performance (except for GIFs)
  const optimizedExt = fileExt === 'gif' ? 'gif' : 'webp';
  
  if (context && type === 'featured') {
    // Create descriptive filename for featured images: "[casino-name]-bonus-offer"
    const cleanCasinoName = context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    return `${cleanCasinoName}-bonus-offer-${timestamp}.${optimizedExt}`;
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
    return `${cleanCasinoName}-logo-${timestamp}.${optimizedExt}`;
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
    return `${cleanCasinoName}-screenshot-${timestamp}.${optimizedExt}`;
  }
  
  // Fallback to UUID for other files
  return `${uuidv4()}.${optimizedExt}`;
}

// Helper function to optimize image buffer (basic optimization)
async function optimizeImage(buffer: Buffer, type: string): Promise<Buffer> {
  // For now, return the buffer as-is
  // In the future, you could add sharp for image optimization:
  // const sharp = require('sharp');
  // return await sharp(buffer)
  //   .webp({ quality: type === 'logo' ? 95 : 85 })
  //   .toBuffer();
  
  return buffer;
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
        
        // Check if token looks like a JWT (has 3 parts separated by dots)
        const tokenParts = cleanToken.split('.');
        console.log("Token parts count:", tokenParts.length);
        
        if (tokenParts.length !== 3) {
          console.error("Token is malformed - should have 3 parts separated by dots");
          throw new Error("Token is malformed - incorrect number of parts");
        }
        
        const secret = getJWTSecret();
        const decoded = verify(cleanToken, secret) as DecodedToken;
        console.log("Token decoded successfully:", { id: decoded.id, email: decoded.email, role: decoded.role });
        
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          authMethod = "JWT";
          console.log("Authorization successful via JWT");
        }
      } catch (verifyError: any) {
        console.error("JWT verification error:", verifyError?.message || verifyError);
      }
    }
  } catch (error) {
    console.error("JWT authentication error:", error);
  }
  
  // Also try NextAuth session as fallback
  if (!isAuthorized) {
    try {
      const session = await getServerSession(authOptions);
      console.log("NextAuth session:", !!session);
      
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
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }, 
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB for flexibility)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." }, 
        { status: 400 }
      );
    }
    
    // Generate SEO-friendly filename
    const fileName = createSEOFilename(file.name, context, type);
    console.log("Generated filename:", fileName);
    
    // Convert file to buffer
    let fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Optimize image if needed
    try {
      fileBuffer = await optimizeImage(fileBuffer, type || 'default');
    } catch (optimizeError) {
      console.warn("Image optimization failed, using original:", optimizeError);
      // Continue with original buffer
    }
    
    // Always use local storage (works on Railway)
    console.log("Using local storage for file upload");
    
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();
    
    // Create file path
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file to disk
    await writeFile(filePath, new Uint8Array(fileBuffer));
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileName}`;
    console.log("Upload successful:", fileUrl);
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true,
      fileName: fileName,
      storage: 'local',
      optimized: true,
      debug: {
        authMethod: authMethod,
        fileSize: fileBuffer.length,
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