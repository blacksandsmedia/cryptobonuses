import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get recent page checks for this slug - no auth required for viewing
    const pageChecks = await prisma.pageCheck.findMany({
      where: {
        pageSlug: slug,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Get last 10 checks
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