import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth-utils';

export async function POST() {
  try {
    // Verify admin access
    const adminUser = await verifyAdminToken();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the page check settings
    const settings = await prisma.settings.findFirst();
    
    if (!settings || !settings.autoCheckEnabled) {
      return NextResponse.json(
        { error: 'Automatic checks are disabled' },
        { status: 400 }
      );
    }

    // Determine which user to use for the checks
    let checkUser;
    if (settings.autoCheckUserId) {
      checkUser = await prisma.user.findUnique({
        where: { id: settings.autoCheckUserId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!checkUser || checkUser.role !== 'ADMIN') {
        // Fallback to first admin if configured user is invalid
        checkUser = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
          select: { id: true, name: true, email: true, role: true },
        });
      }
    } else {
      // Use first admin if no user is configured
      checkUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    if (!checkUser) {
      return NextResponse.json(
        { error: 'No admin user available for automatic checks' },
        { status: 400 }
      );
    }

    // Get all casinos
    const casinos = await prisma.casino.findMany({
      select: { slug: true, name: true },
    });

    if (casinos.length === 0) {
      return NextResponse.json(
        { error: 'No casinos found to check' },
        { status: 400 }
      );
    }

    // Create notes message based on frequency
    const frequencyLabels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    };
    
    const frequencyLabel = frequencyLabels[settings.autoCheckFrequency as keyof typeof frequencyLabels] || 'Scheduled';
    const currentDate = new Date().toLocaleDateString();
    const notes = `${frequencyLabel} automatic check - ${currentDate}`;

    // Create page checks for all casinos
    const pageChecks = casinos.map(casino => ({
      pageSlug: casino.slug,
      pageType: 'casino',
      userId: checkUser.id,
      notes,
      isAutomatic: true,
    }));

    // Batch create the page checks
    const result = await prisma.pageCheck.createMany({
      data: pageChecks,
    });

    return NextResponse.json({
      success: true,
      message: `Created ${result.count} automatic page checks`,
      details: {
        frequency: settings.autoCheckFrequency,
        user: {
          id: checkUser.id,
          name: checkUser.name,
          email: checkUser.email,
        },
        casinosChecked: casinos.length,
        checksCreated: result.count,
      },
    });
  } catch (error) {
    console.error('Error creating scheduled page checks:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled checks' },
      { status: 500 }
    );
  }
} 