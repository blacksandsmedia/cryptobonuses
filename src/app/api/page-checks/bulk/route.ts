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

    const { pageSlugs, pageType = 'casino', notes, isAutomatic = false } = await request.json();

    if (!pageSlugs || !Array.isArray(pageSlugs) || pageSlugs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page slugs array is required' },
        { status: 400 }
      );
    }

    // Create multiple page checks
    const pageChecks = await Promise.all(
      pageSlugs.map(async (pageSlug) => {
        return prisma.pageCheck.create({
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
      })
    );

    return NextResponse.json({
      success: true,
      data: pageChecks,
      count: pageChecks.length,
    });
  } catch (error) {
    console.error('Error creating bulk page checks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bulk page checks',
      },
      { status: 500 }
    );
  }
} 