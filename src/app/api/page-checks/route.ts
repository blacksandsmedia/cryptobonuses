import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { pageSlug, pageType = 'casino', notes, isAutomatic = false } = await request.json();

    if (!pageSlug) {
      return NextResponse.json(
        { success: false, error: 'Page slug is required' },
        { status: 400 }
      );
    }

    // Create page check
    const pageCheck = await prisma.pageCheck.create({
      data: {
        pageSlug,
        pageType,
        userId: adminUser.id,
        notes,
        isAutomatic,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: pageCheck,
    });
  } catch (error) {
    console.error('Error creating page check:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create page check',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get limit from query params, default to 100
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get recent page checks
    const pageChecks = await prisma.pageCheck.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: pageChecks,
    });
  } catch (error) {
    console.error('Error fetching page checks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken();
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Delete all page checks
    const deleteResult = await prisma.pageCheck.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} page checks`,
      count: deleteResult.count,
    });
  } catch (error) {
    console.error('Error deleting page checks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete page checks',
      },
      { status: 500 }
    );
  }
} 