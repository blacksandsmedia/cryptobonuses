import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Simple API key check for security (you can replace with a better auth method)
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');
    
    // Use an environment variable for the API key
    if (apiKey !== process.env.FRESHNESS_UPDATE_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update lastModified for all legal pages
    const updateResult = await (prisma.legalPage as any).updateMany({
      data: {
        lastModified: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated lastModified for ${updateResult.count} legal pages`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating legal pages freshness:', error);
    return NextResponse.json(
      { error: 'Failed to update page freshness' },
      { status: 500 }
    );
  }
} 