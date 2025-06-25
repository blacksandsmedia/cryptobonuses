import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { lookup } from 'mime-types';

// Get upload directory from environment or default to Railway volume
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path from the dynamic route segments
    const filePath = join(UPLOAD_DIR, ...params.path);
    
    // Security check: ensure the resolved path is within the upload directory
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Get file stats
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }
    
    // Determine content type
    const mimeType = lookup(filePath) || 'application/octet-stream';
    
    // Create a readable stream
    const stream = createReadStream(filePath);
    
    // Convert Node.js stream to Web API ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        stream.on('end', () => {
          controller.close();
        });
        
        stream.on('error', (error) => {
          controller.error(error);
        });
      },
      
      cancel() {
        stream.destroy();
      }
    });
    
    // Return the file with appropriate headers
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
    
  } catch (error) {
    console.error('Error serving upload file:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 