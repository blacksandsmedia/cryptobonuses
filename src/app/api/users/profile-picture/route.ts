import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { 
  ensureUploadDir, 
  publicUploadUrl, 
  getUploadPath, 
  createSEOFilename,
  isValidImageType,
  isValidFileSize 
} from "@/lib/upload-utils";

export async function POST(request: NextRequest) {
  try {
    // Use JWT admin authentication instead of NextAuth
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('profilePicture') as File;
    const userId: string | null = data.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (!isValidFileSize(file.size, 5)) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate SEO-friendly filename for profile picture
    const fileName = createSEOFilename(file.name, `profile-${userId}`, 'profile');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    await ensureUploadDir();

    // Get full file path
    const filePath = getUploadPath(fileName);

    await writeFile(filePath, buffer as any);

    // Generate public URL for the uploaded file
    const profilePictureUrl = publicUploadUrl(fileName);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile picture updated successfully',
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload profile picture',
      },
      { status: 500 }
    );
  }
} 