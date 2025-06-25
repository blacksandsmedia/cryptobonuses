import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";
import { writeFile } from "fs/promises";
import { 
  ensureUploadDir, 
  publicUploadUrl, 
  getUploadPath, 
  createSEOFilename,
  isValidImageType,
  isValidFileSize 
} from "@/lib/upload-utils";

// Define a type for decoded JWT token
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Note: Helper functions moved to @/lib/upload-utils

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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string; // Casino name or other context
    const type = formData.get('type') as string; // 'featured', 'logo', 'screenshot', etc.
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }, 
        { status: 400 }
      );
    }
    
    // Validate file size (10MB limit)
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." }, 
        { status: 400 }
      );
    }
    
    // Generate filename based on context and type
    const fileName = createSEOFilename(file.name, context, type);
    
    // Ensure upload directory exists
    await ensureUploadDir();
    
    // Get full file path
    const filePath = getUploadPath(fileName);
    
    // Write file to disk
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer as any);
    
    // Return the public URL to the uploaded file
    const fileUrl = publicUploadUrl(fileName);
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true,
      fileName: fileName
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file" }, 
      { status: 500 }
    );
  }
} 