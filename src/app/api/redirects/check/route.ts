import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }

    // Check if there's a redirect for this slug
    const redirect = await prisma.slugRedirect.findUnique({
      where: { oldSlug: slug }
    });

    if (redirect) {
      return NextResponse.json({ redirect });
    }

    return NextResponse.json({ redirect: null });
  } catch (error) {
    console.error('Error checking slug redirect:', error);
    return NextResponse.json(
      { error: 'Failed to check slug redirect' },
      { status: 500 }
    );
  }
} 