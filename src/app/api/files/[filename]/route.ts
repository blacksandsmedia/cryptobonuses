import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Helper function to get the correct upload directory
function getUploadDirectory(): string {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  
  if (isRailway) {
    const railwayVolumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    if (railwayVolumePath) {
      return path.join(railwayVolumePath, 'uploads');
    }
  }
  
  return path.join(process.cwd(), 'public/uploads');
}

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validate filename to prevent path traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    
    const uploadDir = getUploadDirectory();
    const filePath = path.join(uploadDir, filename);
    
    console.log(`Serving file: ${filePath}`);
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 