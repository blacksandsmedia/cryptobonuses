import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET, getJWTSecret } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { RailwayImageService } from "@/lib/railway-image-service";
import { getImageServiceConfig, isRailwayImageServiceEnabled } from "@/lib/railway-image-config";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Check if we're in Railway production environment
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

// Check if Railway Image Service is configured
const hasImageService = isRailwayImageServiceEnabled();

// Helper function to get the correct upload directory (fallback only)
function getUploadDirectory(): string {
  if (isRailway) {
    // In Railway, use a persistent volume if available, otherwise fall back to public/uploads
    const railwayVolumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    if (railwayVolumePath) {
      return path.join(railwayVolumePath, 'uploads');
    }
    // Fallback to public/uploads for Railway (will be ephemeral but better than nothing)
    return path.join(process.cwd(), 'public/uploads');
  }
  // Local development
  return path.join(process.cwd(), 'public/uploads');
}

// Helper function to get the correct URL path for uploaded files (fallback only)
function getUploadUrlPath(filename: string): string {
  if (isRailway && process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    // If using Railway volume, files need to be served differently
    return `/api/files/${filename}`;
  }
  // Standard public URL path
  return `/uploads/${filename}`;
}

// Helper function to ensure the uploads directory exists (fallback only)
async function ensureUploadsDir() {
  const uploadsDir = getUploadDirectory();
  try {
    await mkdir(uploadsDir, { recursive: true });
    console.log(`Upload directory ensured: ${uploadsDir}`);
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw error;
  }
}

// Helper function to generate SEO-friendly filename
function generateSEOFilename(originalName: string, prefix?: string): string {
  // Remove file extension
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  
  // Create SEO-friendly filename
  const seoName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  const timestamp = Date.now();
  const finalName = prefix ? `${prefix}-${seoName}-${timestamp}` : `${seoName}-${timestamp}`;
  
  return `${finalName}.webp`; // Always save as WebP for better performance
}

export async function POST(request: Request) {
  console.log("=== UPLOAD API DEBUG ===");
  console.log("Railway environment:", !!isRailway);
  console.log("Image service configured:", !!hasImageService);
  console.log("Upload directory (fallback):", getUploadDirectory());
  
  // Debug all cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  console.log("All cookies received:", allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
  
  // First try JWT token authentication
  let isAuthorized = false;
  let authMethod = "none";
  
  // Check JWT token in cookies
  try {
    const token = cookieStore.get('admin-token')?.value;
    
    console.log("Admin token found:", !!token);
    console.log("Admin token length:", token?.length || 0);
    console.log("Admin token first 50 chars:", token?.substring(0, 50) || 'N/A');
    
    if (token) {
      try {
        // Clean the token in case it has extra characters
        const cleanToken = token.trim();
        console.log("Attempting to verify token...");
        console.log("Token structure check - parts:", cleanToken.split('.').length);
        
        const secret = getJWTSecret();
        console.log("Using JWT secret (first 10 chars):", secret.substring(0, 10) + "...");
        
        const decoded = verify(cleanToken, secret) as DecodedToken;
        console.log("Token verified successfully:", { id: decoded.id, email: decoded.email, role: decoded.role });
        
        if (decoded.role === 'ADMIN') {
          isAuthorized = true;
          authMethod = "jwt";
          console.log("JWT authentication successful");
        } else {
          console.log("JWT token valid but user is not admin:", decoded.role);
        }
      } catch (jwtError) {
        console.log("JWT verification error:", jwtError);
      }
    }
  } catch (error) {
    console.log("Error checking JWT token:", error);
  }

  // Fallback to NextAuth session
  if (!isAuthorized) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === 'ADMIN') {
        isAuthorized = true;
        authMethod = "nextauth";
        console.log("NextAuth authentication successful");
      } else {
        console.log("NextAuth session not found or user not admin");
      }
    } catch (error) {
      console.log("NextAuth session error:", error);
    }
  }

  if (!isAuthorized) {
    console.log("Upload rejected: No valid authentication");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`Upload authorized via ${authMethod}`);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed." 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 });
    }

    // Generate SEO-friendly filename
    const filename = generateSEOFilename(file.name);

    // Try Railway Image Service first if configured
    if (hasImageService) {
      try {
        console.log("Using Railway Image Service for upload");
        const config = getImageServiceConfig();
        const imageService = new RailwayImageService(config);
        
        const result = await imageService.uploadImage(file, filename, {
          quality: 85,
          format: 'webp'
        });

        if (result.success && result.url) {
          console.log("Railway Image Service upload successful:", result.url);
          return NextResponse.json({
            message: "File uploaded successfully via Railway Image Service",
            url: result.url,
            filename: filename,
            size: file.size,
            service: "railway-image-service"
          });
        } else {
          console.log("Railway Image Service upload failed:", result.error);
          // Fall through to local storage
        }
      } catch (imageServiceError) {
        console.error("Railway Image Service error:", imageServiceError);
        // Fall through to local storage
      }
    }

    // Fallback to local storage
    console.log("Using local storage for upload");
    
    // Ensure uploads directory exists
    await ensureUploadsDir();

    const uploadDir = getUploadDirectory();
    const filePath = path.join(uploadDir, filename);

    console.log("Saving file to:", filePath);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filePath, new Uint8Array(buffer));

    console.log("File saved successfully");

    // Return the URL path for the uploaded file
    const urlPath = getUploadUrlPath(filename);
    
    console.log("Upload successful:", {
      filename,
      path: filePath,
      url: urlPath,
      size: buffer.length
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      url: urlPath,
      filename: filename,
      size: buffer.length,
      service: "local-storage"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 